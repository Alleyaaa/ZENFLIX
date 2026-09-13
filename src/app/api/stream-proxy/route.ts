import { NextRequest, NextResponse } from 'next/server'

/**
 * Stream Proxy (hidden source)
 *
 * Client iframe menunjuk ke /api/stream-proxy?ch=N → server fetch halaman source
 * Vidsrc/MultiEmbed, teruskan HTML. Rewrite MINIMAL biar ga patah:
 * - URL relatif → absolut ke host source (biar asset/iframe di dalam tetap jalan)
 * - Tidak rewrite referensi host source ke proxy kita (biar enginenya jalan normal)
 * - Client tetap TIDAK melihat URL source karena iframe src = /api/stream-proxy
 */

const TMDB_KEY = process.env.TMDB_API_KEY

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tmdbId = parseInt(searchParams.get('id') || '0')
  const type = (searchParams.get('type') || 'movie') as 'movie' | 'tv'
  const season = parseInt(searchParams.get('season') || '1')
  const episode = parseInt(searchParams.get('episode') || '1')
  const ch = parseInt(searchParams.get('ch') || '1')

  if (!tmdbId) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  // ─── IMDB ID (beberapa provider prefer IMDB) ───
  let imdbId: string | null = null
  try {
    const endpoint = type === 'tv' ? `/tv/${tmdbId}/external_ids?` : `/movie/${tmdbId}/external_ids?`
    const res = await fetch(`https://api.themoviedb.org/3${endpoint}api_key=${TMDB_KEY}`, {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(6000),
    })
    if (res.ok) {
      const data = await res.json()
      imdbId = data.imdb_id || null
    }
  } catch {}

  const movieId = imdbId || tmdbId

  // ─── Pilih source per channel (server-side, ga pernah ke client) ───
  let host: string
  let embedUrl: string
  if (ch === 1) {
    host = 'vidsrcme.ru'
    embedUrl = type === 'tv'
      ? `https://${host}/embed/tv/${movieId}/${season}/${episode}?autoplay=1&autonext=1&ds_lang=id`
      : `https://${host}/embed/movie/${movieId}?autoplay=1&ds_lang=id`
  } else if (ch === 2) {
    host = 'vidsrc.to'
    embedUrl = type === 'tv'
      ? `https://${host}/embed/tv/${tmdbId}/${season}/${episode}?autoplay=1&autonext=1&ds_lang=id`
      : `https://${host}/embed/movie/${tmdbId}?autoplay=1&ds_lang=id`
  } else if (ch === 3) {
    host = 'multiembed.mov'
    embedUrl = `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1${type === 'tv' ? `&s=${season}&e=${episode}` : ''}`
  } else {
    host = 'vidsrc.me'
    embedUrl = type === 'tv'
      ? `https://${host}/embed/tv/${movieId}/${season}/${episode}?autoplay=1&autonext=1&ds_lang=id`
      : `https://${host}/embed/movie/${movieId}?autoplay=1&ds_lang=id`
  }

  try {
    const upstream = await fetch(embedUrl, {
      headers: {
        'Referer': 'https://zenflix-ten.vercel.app/',
        'User-Agent': UA,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      },
      signal: AbortSignal.timeout(15000),
      cache: 'no-store',
    })

    if (!upstream.ok) {
      return NextResponse.json({ error: `Source ${upstream.status}` }, { status: 502 })
    }
    let html = await upstream.text()

    // ─── Rewrite MINIMAL: relative → absolute (biar engine jalan) ───
    const hostBase = `https://${host}`
    // src="/..." & href="/..." → domain source (biar sub-asset di dalam bisa load)
    html = html.replace(/(src|href)="\//g, `$1="${hostBase}/`)
    // //example.com → https://example.com
    html = html.replace(/(src|href)="\/\//g, `$1="https://`)

    return new NextResponse(html, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'private, max-age=60',
        'X-Frame-Options': 'SAMEORIGIN',
        'Referrer-Policy': 'no-referrer',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Source timeout' }, { status: 504 })
  }
}