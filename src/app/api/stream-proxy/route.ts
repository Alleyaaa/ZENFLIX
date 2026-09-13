import { NextRequest, NextResponse } from 'next/server'

/**
 * Stream Proxy (hidden source)
 *
 * Client iframe menunjuk ke /video/embed → route ini di server.
 * Server fetch halaman source Vidsrc/MultiEmbed, kemudian:
 *  - rewrite semua URL (asset, iframe, script) agar lewat /api/stream-assets alias
 *  - set header referrer no-referrer + X-Frame-Options SAMEORIGIN
 *  - client hanya melihat /video/..., bukan domain source asli
 */

const TMDB_KEY = process.env.TMDB_API_KEY

const ALLOWED_HOSTS = new Set(['vidsrcme.ru', 'vidsrc.to', 'vidsrc.me', 'multiembed.mov'])

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tmdbId = parseInt(searchParams.get('id') || '0')
  const type = (searchParams.get('type') || 'movie') as 'movie' | 'tv'
  const season = parseInt(searchParams.get('season') || '1')
  const episode = parseInt(searchParams.get('episode') || '1')
  const ch = parseInt(searchParams.get('ch') || '1')

  if (!tmdbId) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  // ─── IMDB ID (VidSrc prefer IMDB) ───
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

  // ─── Pilih source per channel (di server, ga pernah ke client) ───
  let host: string
  let id: string | number
  if (ch === 1) { host = 'vidsrcme.ru'; id = movieId }
  else if (ch === 2) { host = 'vidsrc.to'; id = tmdbId }
  else if (ch === 3) { host = 'multiembed.mov'; id = tmdbId }
  else { host = 'vidsrc.me'; id = movieId }

  const embedUrl = type === 'tv'
    ? `https://${host}/embed/tv/${id}/${season}/${episode}?autoplay=1&autonext=1&ds_lang=id`
    : (ch === 3
        ? `https://multiembed.mov/?video_id=${tmdbId}&tmdb=1`
        : `https://${host}/embed/movie/${id}?autoplay=1&ds_lang=id`)

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
    const html = await upstream.text()

    // ─── Rewrite: sembunyikan domain source dari client ───
    // Ganti src/href absolut & relatif ke path /api/stream-assets sebagai proxy
    let finalHtml = html
    const sourceHost = new URL(embedUrl).host

    // 1. Ganti referensi absolut ke host source → /api/stream-assets (biar ga kelihatan)
    finalHtml = finalHtml.replaceAll(`https://${sourceHost}`, '/api/stream-assets')
    finalHtml = finalHtml.replaceAll(`http://${sourceHost}`, '/api/stream-assets')

    // 2. Rewrite URL relatif (src="/...") → /api/stream-assets
    finalHtml = finalHtml.replace(/(src|href)="\/([^"]*)"/g, `$1="/api/stream-assets/$2"`)

    // 3. Protect iframe dalam (nested embed) — tetap lewat proxy kita
    finalHtml = finalHtml.replace(
      /src="(https?:\/\/[^"]+)"/g,
      (_m, url: string) => {
        try {
          const u = new URL(url)
          // Hanya rewrite kalau menuju domain source terkait
          if (ALLOWED_HOSTS.has(u.hostname) || u.hostname.endsWith('.mov')) {
            return `src="/api/stream-assets?url=${encodeURIComponent(url)}"`
          }
          return `src="${url}"`
        } catch {
          return `src="${url}"`
        }
      }
    )

    return new NextResponse(finalHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'private, max-age=120',
        'X-Frame-Options': 'SAMEORIGIN',
        'Referrer-Policy': 'no-referrer',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Source timeout' }, { status: 504 })
  }
}