import { NextRequest, NextResponse } from 'next/server'

/**
 * Stream Proxy (hidden source) — FIXED with <base href>
 *
 * Kenapa sebelumnya rusak:
 * - Rewrite URL relatif→absolut bikin JS engine vidsrc patah → kontrol ga jalan
 * - Asset yang di-proxy (stream-assets) juga bikin JS break (CORS/origin mismatch)
 *
 * Solusi yang bener:
 * - Inject <base href="https://<host>/"> di <head> HTML embed.
 *   Semua URL relatif (/assets/...) resolve ke host asli → JS & kontrol JALAN normal.
 * - TIDAK rewrite apa-apa → HTML utuh, engine happy.
 * - Top-level iframe src tetap /api/stream-proxy → user ga lihat domain source.
 * - Nested iframe ke vidsrc domain diizinkan via CSP frame-src (sudah di-set).
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

  // ─── IMDB ID (VidSrc prefer IMDB kalau ada) ───
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

  // ─── Pilih source per channel ───
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

    // ─── Inject <base href> biar relative URL resolve ke host asli ───
    // (engine JS & kontrol video jalan normal; user tetap lihat /api/stream-proxy)
    const baseTag = `<base href="${host === 'multiembed.mov' ? 'https://multiembed.mov/' : `https://${host}/`}">`
    if (html.includes('<head>')) {
      html = html.replace('<head>', `<head>${baseTag}`)
    } else {
      html = baseTag + html
    }

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