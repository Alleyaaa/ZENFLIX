import { NextRequest, NextResponse } from 'next/server'

const TMDB_KEY = process.env.TMDB_API_KEY

// Multi-source embed — provider langsung (Vidsrc, MultiEmbed) — PASTI play di iframe
const MIRRORS: { name: string; host: string }[] = [
  { name: 'vidsrcme', host: 'https://vidsrcme.ru' },
  { name: 'vidsrcto', host: 'https://vidsrc.to' },
  { name: 'vidsrcme2', host: 'https://vidsrc.me' },
  { name: 'multiembed', host: 'https://multiembed.mov' },
]

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const tmdbId = parseInt(searchParams.get('id') || '0')
  const type = (searchParams.get('type') || 'movie') as 'movie' | 'tv'
  const season = parseInt(searchParams.get('season') || '1')
  const episode = parseInt(searchParams.get('episode') || '1')

  if (!tmdbId) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  // ─── IMDB ID (VidSrc prefer IMDB kalau ada) ───
  let imdbId: string | null = null
  try {
    const endpoint = type === 'tv' ? `/tv/${tmdbId}/external_ids?` : `/movie/${tmdbId}/external_ids?`
    const res = await fetch(`https://api.themoviedb.org/3${endpoint}api_key=${TMDB_KEY}`, {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(8000),
    })
    if (res.ok) {
      const data = await res.json()
      imdbId = data.imdb_id || null
    }
  } catch {}

  const movieIdForImdb = imdbId || undefined

  const buildVidSrcUrl = (host: string, id: string | number) =>
    type === 'tv'
      ? `${host}/embed/tv/${id}/${season}/${episode}?autoplay=1&autonext=1&ds_lang=id`
      : `${host}/embed/movie/${id}?autoplay=1&ds_lang=id`

  const buildMultiEmbedUrl = () =>
    type === 'tv'
      ? `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`
      : `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`

  const channels = [
    // Ch1: VidSrc utama (IMDB kalau ada)
    { index: 1, url: buildVidSrcUrl(MIRRORS[0].host, movieIdForImdb || tmdbId), name: MIRRORS[0].name },
    // Ch2: VidSrc.to (pakai TMDB)
    { index: 2, url: buildVidSrcUrl(MIRRORS[1].host, tmdbId), name: MIRRORS[1].name },
    // Ch3: MultiEmbed (aggregator, pakai param tmdb=1 & season/episode)
    { index: 3, url: buildMultiEmbedUrl(), name: 'multiembed' },
    // Ch4: VidSrc.me (IMDB fallback)
    { index: 4, url: buildVidSrcUrl(MIRRORS[2].host, movieIdForImdb || tmdbId), name: MIRRORS[2].name },
  ]

  return NextResponse.json({
    tmdbId,
    imdbId,
    type,
    season,
    episode,
    channels,
    totalChannels: channels.length,
  })
}