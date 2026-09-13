import { NextResponse } from 'next/server'

const TMDB_KEY = process.env.TMDB_API_KEY

// Multi-source embed — kombinasi provider biar dapet kualitas terbaik & fallback banyak
// - VidSrc (vidsrcme.ru / vidsrc.to / vidsrc.me): player populer, support 1080p
// - MultiEmbed (multiembed.mov): aggregator multi-player
//
// SEMUA URL source DI-SEMBUNYIKAN dari client:
// client hanya menerima { index, name, proxyPath } — iframe src = /api/stream-proxy?ch=N
// Browser/network tab tidak pernah melihat domain vidsrc/dll.
const MIRRORS: { name: string; host: string }[] = [
  { name: 'vidsrcme', host: 'https://vidsrcme.ru' },
  { name: 'vidsrcto', host: 'https://vidsrc.to' },
  { name: 'vidsrcme2', host: 'https://vidsrc.me' },
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

  // ─── Trailer resmi dari TMDB (fallback terakhir) ───
  let trailerKey: string | null = null
  try {
    const endpoint = type === 'tv' ? `/tv/${tmdbId}/videos?` : `/movie/${tmdbId}/videos?`
    const res = await fetch(`https://api.themoviedb.org/3${endpoint}api_key=${TMDB_KEY}&language=en-US`, {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(8000),
    })
    if (res.ok) {
      const data = await res.json()
      const vids = (data.results || []) as any[]
      const trailer = vids.find((v: any) => v.type === 'Trailer' && v.site === 'YouTube')
        || vids.find((v: any) => v.type === 'Teaser' && v.site === 'YouTube')
        || vids.find((v: any) => v.site === 'YouTube')
      trailerKey = trailer?.key || null
    }
  } catch {}

  // ─── IMDB ID dari TMDB ───
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

  // MultiEmbed (format yang benar: ?video_id= & tmdb=1)
  const buildMultiEmbedUrl = () =>
    type === 'tv'
      ? `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1&s=${season}&e=${episode}`
      : `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`

  // Channel: { index, name } — URL ASLI DIPROSES DI SERVER via /api/stream-proxy
  const channels = [
    { index: 1, name: MIRRORS[0].name },
    { index: 2, name: MIRRORS[1].name },
    { index: 3, name: 'multiembed' },
    { index: 4, name: MIRRORS[2].name },
  ]

  return NextResponse.json({
    tmdbId,
    imdbId,
    type,
    season,
    episode,
    trailerKey,
    channels,
    totalChannels: channels.length,
    // Client hanya tahu path internal — bukan URL source asli
    streamProxy: `/api/stream-proxy?id=${tmdbId}&type=${type}&season=${season}&episode=${episode}`,
  })
}