import { NextRequest, NextResponse } from 'next/server'

/**
 * IDLIX Stream API — self-hosted source internal (majorplay.net)
 * 
 * Zenflix → IDLIX API (localhost:3000, Docker) → stream config + subtitle
 * 
 * Sumber stream IDLIX di-host sendiri (bukan embed Vidsrc):
 * - kualitas lebih stabil (720p+)
 * - subtitle bahasa Indonesia (.vtt)
 * - URL stream & subtitle dibungkus Zenflix (client ga lihat majorplay)
 * 
 * Flow:
 * 1. Cari slug IDLIX dari judul (pakai TMDB title + year)
 * 2. Request /stream (ada delay 15 detik anti-scrape)
 * 3. Return streamUrl + subtitles → player HLS custom
 */

const IDLIX_API = process.env.IDLIX_API_URL || 'http://localhost:3000'

// ─── Cari slug IDLIX dari TMDB title + year ───
async function findSlug(title: string, year: number, type: 'movie' | 'tv'): Promise<string | null> {
  try {
    const q = encodeURIComponent(`${title} ${year}`)
    const res = await fetch(`${IDLIX_API}/api/search?q=${q}`, {
      signal: AbortSignal.timeout(20000),
    })
    if (!res.ok) return null
    const data = await res.json()
    const results = data?.data || []
    // Cari match: same title + same year
    const match = results.find((r: any) => {
      const titleMatch = r.title?.toLowerCase().includes(title.toLowerCase().split(' ')[0].toLowerCase())
      const yearMatch = !year || r.year === year
      return titleMatch && yearMatch
    })
    return match?.slug || match?.link?.endpoint?.replace('movie/', '').replace('series/', '') || null
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') || ''
  const year = parseInt(searchParams.get('year') || '0')
  const type = (searchParams.get('type') || 'movie') as 'movie' | 'tv'
  const slug = searchParams.get('slug') || ''
  const season = parseInt(searchParams.get('season') || '1')
  const episode = parseInt(searchParams.get('episode') || '1')

  if (!title && !slug) {
    return NextResponse.json({ error: 'Missing title or slug' }, { status: 400 })
  }

  // ─── Cari slug kalau belum dikasih ───
  let resolvedSlug = slug
  if (!resolvedSlug && title) {
    resolvedSlug = (await findSlug(title, year, type)) || ''
  }
  if (!resolvedSlug) {
    return NextResponse.json({ error: 'Title not found on IDLIX', success: false }, { status: 404 })
  }

  // ─── Stream URL dari IDLIX (delay 15 detik) ───
  try {
    let streamPath = `/api/movie/${resolvedSlug}/stream`
    if (type === 'tv') {
      streamPath = `/api/series/${resolvedSlug}/season/${season}/episode/${episode}/stream`
    }

    const res = await fetch(`${IDLIX_API}${streamPath}`, {
      signal: AbortSignal.timeout(45000), // 15 detik delay anti-scrape + network
    })
    if (!res.ok) {
      return NextResponse.json({ error: `IDLIX ${res.status}`, success: false }, { status: 502 })
    }
    const data = await res.json()

    if (!data?.success || !data?.data?.streamUrl) {
      return NextResponse.json({ error: 'No stream from IDLIX', success: false }, { status: 404 })
    }

    const { streamUrl, subtitles, videoId, title: streamTitle, durationSec, maxHeight } = data.data

    return NextResponse.json({
      success: true,
      streamUrl,
      subtitles: subtitles || [],
      videoId,
      title: streamTitle,
      durationSec,
      maxHeight,
      provider: 'idlix',
    })
  } catch {
    return NextResponse.json({ error: 'IDLIX stream timeout', success: false }, { status: 504 })
  }
}