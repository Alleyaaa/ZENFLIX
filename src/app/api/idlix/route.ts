import { NextRequest, NextResponse } from 'next/server'

const IDLIX_API = process.env.IDLIX_API_URL || 'http://localhost:3000'
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'

// ─── Search + stream extraction langsung dari IDLIX ───
async function searchAndStream(
  query: string,
  type: 'movie' | 'tv',
  season: number,
  episode: number
): Promise<any | null> {
  // Step 1: cari slug
  const searchRes = await fetch(`${IDLIX_API}/api/search?q=${encodeURIComponent(query)}`, {
    signal: AbortSignal.timeout(45000),
  })
  if (!searchRes.ok) return null
  const searchData = await searchRes.json()
  const results = searchData?.data || searchData?.results || []
  const match = results[0]
  if (!match) return null

  const slug = match.slug || match.link?.endpoint?.replace('movie/', '').replace('series/', '') || ''
  if (!slug) return null

  // Step 2: stream extraction (config.json / m3u8)
  const streamPath = type === 'tv'
    ? `/api/series/${slug}/season/${season}/episode/${episode}/stream`
    : `/api/movie/${slug}/stream`

  const streamRes = await fetch(`${IDLIX_API}${streamPath}`, {
    signal: AbortSignal.timeout(60000),
  })
  if (!streamRes.ok) return null
  const streamData = await streamRes.json()
  const data = streamData?.data
  if (!data?.streamUrl) return null

  // Step 3: Fetch streamUrl → parse jadi master playlist (.m3u8)
  // streamUrl bisa: config-xxx.json (menghasilkan m3u8) atau langsung .m3u8
  let playlists: { resolution: string; height: number; url: string }[] = []
  let m3u8Content: string | null = null

  try {
    const cfgRes = await fetch(data.streamUrl, {
      headers: {
        'User-Agent': UA,
        'Referer': 'https://z2.idlixku.com/',
        'Accept': '*/*',
      },
      signal: AbortSignal.timeout(20000),
    })
    if (cfgRes.ok) {
      const cfgText = await cfgRes.text()
      // Kalau isi-nya m3u8 → parse langsung
      if (cfgText.includes('#EXTM3U')) {
        m3u8Content = cfgText
      } else {
        // Kalau JSON → cari field file/url m3u8
        try {
          const cfgJson = JSON.parse(cfgText)
          const m3u8Candidate = cfgJson?.file || cfgJson?.url || cfgJson?.stream?.url || cfgJson?.sources?.[0]?.url
          if (m3u8Candidate && typeof m3u8Candidate === 'string' && !m3u8Candidate.startsWith('http')) {
            // Relative → absolut
            const base = data.streamUrl.split('/').slice(0, -1).join('/') + '/'
            const absUrl = m3u8Candidate.startsWith('/') ? `https://e2e.majorplay.net${m3u8Candidate}` : base + m3u8Candidate
            const m3u8Res = await fetch(absUrl, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(20000) })
            if (m3u8Res.ok) m3u8Content = await m3u8Res.text()
          } else if (typeof m3u8Candidate === 'string' && m3u8Candidate.startsWith('http')) {
            const m3u8Res = await fetch(m3u8Candidate, { headers: { 'User-Agent': UA }, signal: AbortSignal.timeout(20000) })
            if (m3u8Res.ok) m3u8Content = await m3u8Res.text()
          }
        } catch {
          m3u8Content = null
        }
      }
    }
  } catch {}

  // Parse m3u8 master playlist → variants
  if (m3u8Content) {
    const lines = m3u8Content.split('\n')
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim()
      if (line.startsWith('#EXT-X-STREAM-INF')) {
        const resMatch = line.match(/RESOLUTION=(\d+)x(\d+)|NAME="(\d+)p"/)
        const height = resMatch ? parseInt(resMatch[1] || resMatch[3] || '0') : 0
        const resolution = height ? `${height}p` : 'auto'
        // URL variant ada di baris berikutnya
        let j = i + 1
        while (j < lines.length && lines[j].trim() === '') j++
        if (j < lines.length && lines[j].trim() && !lines[j].trim().startsWith('#')) {
          let variantUrl = lines[j].trim()
          if (!variantUrl.startsWith('http')) {
            const base = data.streamUrl.split('/').slice(0, -1).join('/') + '/'
            variantUrl = variantUrl.startsWith('/') ? `https://e2e.majorplay.net${variantUrl}` : new URL(variantUrl, base).toString()
          }
          playlists.push({ resolution, height, url: variantUrl })
        }
      }
    }
  }

  // Kalau ga ada variant → pakai streamUrl langsung (anggap itu m3u8)
  if (playlists.length === 0) {
    playlists = [{ resolution: data.maxHeight ? `${data.maxHeight}p` : 'auto', height: data.maxHeight || 0, url: data.streamUrl }]
  }

  return {
    slug,
    playlists,
    subtitles: data.subtitles || [],
    videoId: data.videoId,
    title: data.title,
    durationSec: data.durationSec,
    maxHeight: data.maxHeight,
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') || ''
  const type = (searchParams.get('type') || 'movie') as 'movie' | 'tv'
  const season = parseInt(searchParams.get('season') || '1')
  const episode = parseInt(searchParams.get('episode') || '1')

  if (!title) {
    return NextResponse.json({ error: 'Missing title', success: false }, { status: 400 })
  }

  try {
    const result = await searchAndStream(title, type, season, episode)
    if (!result) {
      return NextResponse.json({ error: 'Title not found or stream unavailable', success: false }, { status: 404 })
    }
    return NextResponse.json({
      success: true,
      slug: result.slug,
      playlists: result.playlists,
      subtitles: result.subtitles,
      videoId: result.videoId,
      title: result.title,
      durationSec: result.durationSec,
      maxHeight: result.maxHeight,
      provider: 'idlix',
    })
  } catch (e) {
    return NextResponse.json({ error: 'IDLIX API timeout or unavailable', success: false, details: (e as Error)?.message }, { status: 504 })
  }
}