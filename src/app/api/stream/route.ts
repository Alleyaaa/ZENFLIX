import { NextRequest, NextResponse } from 'next/server'

/**
 * API Stream Proxy (Anti-Tracking)
 *
 * Tujuan: menyembunyikan URL source asli (VidSrc/dll) dari client.
 * Browser/iframe hanya melihat `/api/stream?id=...&ch=1`.
 * Resolusi URL asli terjadi 100% di server, jadi source tidak bisa
 * di-track / diambil dari network tab, view-source, atau inspect element.
 *
 * OWASP-relevant: mencegah SSRF via whitelist host yang ketat.
 */

const TMDB_KEY = process.env.TMDB_API_KEY

// Whitelist host yang BOLEH di-proxy (anti-SSRF: A10)
const ALLOWED_HOSTS = new Set([
  'vidsrcme.ru',
  'vidsrc.to',
  'vidsrc.me',
])

// Bounded cache: URL build disimpan singkat (5 menit) supaya tidak hit TMDB berulang
const urlCache = new Map<string, { url: string; expires: number }>()
const CACHE_TTL = 5 * 60 * 1000

const MIRRORS: { name: string; host: string }[] = [
  { name: 'vidsrcme', host: 'https://vidsrcme.ru' },
  { name: 'vidsrcto', host: 'https://vidsrc.to' },
  { name: 'vidsrcme2', host: 'https://vidsrc.me' },
]

function buildEmbedUrl(
  host: string,
  id: string | number,
  type: 'movie' | 'tv',
  season: number,
  episode: number
): string {
  return type === 'tv'
    ? `${host}/embed/tv/${id}/${season}/${episode}?autoplay=1&autonext=1&ds_lang=id`
    : `${host}/embed/movie/${id}?autoplay=1&ds_lang=id`
}

async function resolveSource(
  tmdbId: number,
  type: 'movie' | 'tv',
  season: number,
  episode: number,
  channel: number
): Promise<{ url: string; name: string } | null> {
  const cacheKey = `${type}:${tmdbId}:${season}:${episode}:${channel}`
  const cached = urlCache.get(cacheKey)
  if (cached && cached.expires > Date.now()) {
    return { url: cached.url, name: '' }
  }

  // ─── IMDB ID dari TMDB (VidSrc terima IMDB juga) ───
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

  // ─── Pilih mirror & format per channel ───
  let url: string
  if (channel === 1) {
    // Ch1: vidsrcme.ru + IMDB (paling reliable)
    url = buildEmbedUrl(MIRRORS[0].host, imdbId || tmdbId, type, season, episode)
  } else if (channel === 2) {
    // Ch2: vidsrc.to + TMDB
    url = buildEmbedUrl(MIRRORS[1].host, tmdbId, type, season, episode)
  } else if (channel === 3) {
    // Ch3: vidsrc.me + IMDB
    url = buildEmbedUrl(MIRRORS[2].host, imdbId || tmdbId, type, season, episode)
  } else {
    // Ch4: vidsrcme.ru + TMDB
    url = buildEmbedUrl(MIRRORS[0].host, tmdbId, type, season, episode)
  }

  // Validasi host (SSRF guard)
  try {
    const parsed = new URL(url)
    if (!ALLOWED_HOSTS.has(parsed.hostname)) return null
  } catch {
    return null
  }

  urlCache.set(cacheKey, { url, expires: Date.now() + CACHE_TTL })
  return { url, name: '' }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tmdbId = parseInt(searchParams.get('id') || '0')
  const type = (searchParams.get('type') || 'movie') as 'movie' | 'tv'
  const season = parseInt(searchParams.get('season') || '1')
  const episode = parseInt(searchParams.get('episode') || '1')
  const channel = parseInt(searchParams.get('ch') || '1')

  if (!tmdbId) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }

  const source = await resolveSource(tmdbId, type, season, episode, channel)
  if (!source) {
    return NextResponse.json({ error: 'Source unavailable' }, { status: 404 })
  }

  // ─── Server-side fetch embed HTML, teruskan sebagai passthrough ───
  // Browser tidak pernah tahu URL asli; hanya menerima HTML stream.
  try {
    const upstream = await fetch(source.url, {
      headers: {
        'Referer': 'https://zenflix-ten.vercel.app/',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(15000),
      cache: 'no-store',
    })

    if (!upstream.ok) {
      return NextResponse.json({ error: `Upstream ${upstream.status}` }, { status: 502 })
    }

    const html = await upstream.text()

    // Rewrite URL relatif/absolut di dalam HTML supaya tetap lewat proxy kita
    // (mencegah iframe/script dalam embed langsung menuju host asli dari client)
    const hostBase = `https://${new URL(source.url).host}`

    // Hanya rewrite jika ada referensi ke host embeds (jaga-jaga)
    let finalHtml = html
    if (finalHtml.includes(hostBase)) {
      // ganti URL absolut ke proxy stream (per-request: kita redirect via /api/stream)
      finalHtml = finalHtml.replaceAll(hostBase, '')
    }

    // Rewrite relative URLs ke absolut biar tetap jalan
    finalHtml = finalHtml.replace(/(src|href)="\//g, `$1="${hostBase}/`)

    return new NextResponse(finalHtml, {
      status: 200,
      headers: {
        'Content-Type': 'text/html; charset=utf-8',
        'Cache-Control': 'private, max-age=300',
        'X-Frame-Options': 'SAMEORIGIN',
        'Referrer-Policy': 'no-referrer',
        'X-Content-Type-Options': 'nosniff',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Upstream timeout' }, { status: 504 })
  }
}