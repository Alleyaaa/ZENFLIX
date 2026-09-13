import { NextRequest, NextResponse } from 'next/server'

const IDLIX_API = process.env.IDLIX_API_URL || 'http://localhost:3000'

// ─── Single-pass: langsung cari + stream dalam satu request ke IDLIX ───
async function searchAndStream(
  query: string,
  type: 'movie' | 'tv',
  season: number,
  episode: number
): Promise<any | null> {
  // Langsung pakai /api/movie/<slug>/stream atau /api/search dulu
  // Step 1: cari slug
  const searchRes = await fetch(`${IDLIX_API}/api/search?q=${encodeURIComponent(query)}`, {
    signal: AbortSignal.timeout(45000), // IDLIX search butuh waktu
  })
  if (!searchRes.ok) return null
  const searchData = await searchRes.json()
  const results = searchData?.data || searchData?.results || []

  // Cari hasil pertama yang sesuai
  const match = results[0]
  if (!match) return null

  const slug = match.slug || match.link?.endpoint?.replace('movie/', '').replace('series/', '') || ''
  if (!slug) return null

  // Step 2: stream extraction
  const streamPath = type === 'tv'
    ? `/api/series/${slug}/season/${season}/episode/${episode}/stream`
    : `/api/movie/${slug}/stream`

  const streamRes = await fetch(`${IDLIX_API}${streamPath}`, {
    signal: AbortSignal.timeout(60000), // IDLIX stream butuh 15 detik delay + processing
  })
  if (!streamRes.ok) return null
  const streamData = await streamRes.json()

  if (!streamData?.data?.streamUrl) return null

  return {
    slug,
    streamUrl: streamData.data.streamUrl,
    subtitles: streamData.data.subtitles || [],
    videoId: streamData.data.videoId,
    title: streamData.data.title,
    durationSec: streamData.data.durationSec,
    maxHeight: streamData.data.maxHeight,
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const title = searchParams.get('title') || ''
  const year = parseInt(searchParams.get('year') || '0')
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
      streamUrl: result.streamUrl,
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