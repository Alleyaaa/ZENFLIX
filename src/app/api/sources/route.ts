import { NextResponse } from 'next/server'

const TMDB_KEY = process.env.TMDB_API_KEY

// Domain VidSrc yang TERVERIFIKASI hidup (di-test: vidsrcme.ru 200, vidsrc.me 200, vidsrc.to 200)
// Channel = kombinasi domain × format ID (IMDB/TMDB) biar ada 4 opsi fallback
const MIRRORS: { name: string; host: string }[] = [
  { name: 'vidsrcme', host: 'https://vidsrcme.ru' },   // Ch 1 & Ch 4 (dua format)
  { name: 'vidsrcto', host: 'https://vidsrc.to' },     // Ch 2
  { name: 'vidsrcme2', host: 'https://vidsrc.me' },    // Ch 3
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

  // ─── IMDB ID dari TMDB (VidSrc terima IMDB juga) ───
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

  // ─── Bangun 4 channel: Ch1 (imdb/me.ru), Ch2 (tmdb/to), Ch3 (imdb/me), Ch4 (tmdb/me.ru) ───
  const movieIdForImdb = imdbId || undefined
  const movieIdForTmdb = undefined

  const buildUrl = (host: string, id: string | number) =>
    type === 'tv'
      ? `${host}/embed/tv/${id}/${season}/${episode}?autoplay=1&autonext=1&ds_lang=id`
      : `${host}/embed/movie/${id}?autoplay=1&ds_lang=id`

  const channels = [
    // Ch1: domain utama vidsrcme.ru, pakai IMDB kalau ada (paling reliable)
    { index: 1, url: buildUrl(MIRRORS[0].host, movieIdForImdb || tmdbId), name: MIRRORS[0].name },
    // Ch2: vidsrc.to, pakai TMDB
    { index: 2, url: buildUrl(MIRRORS[1].host, tmdbId), name: MIRRORS[1].name },
    // Ch3: vidsrc.me, pakai IMDB
    { index: 3, url: buildUrl(MIRRORS[2].host, movieIdForImdb || tmdbId), name: MIRRORS[2].name },
    // Ch4: vidsrcme.ru lagi, pakai TMDB (beda source di provider yang sama)
    { index: 4, url: buildUrl(MIRRORS[0].host, tmdbId), name: MIRRORS[0].name },
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
  })
}