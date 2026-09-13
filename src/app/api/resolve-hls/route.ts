import { NextRequest, NextResponse } from 'next/server'

/**
 * API Resolve HLS Direct Stream
 * 
 * Mengekstrak master playlist (.m3u8) dari player Vidsrc dan mengembalikan
 * daftar kualitas (1080p/720p/480p/360p/auto) supaya client bisa memilih
 * resolusi dan memutar langsung dengan hls.js — TANPA iframe embed.
 * 
 * Alur:
 * 1. Fetch halaman embed Vidsrc (server-side)
 * 2. Parse HTML: cari server config / source iframe / direct .m3u8
 * 3. Kalau ketemu master playlist → parse variant bitrates → daftar kualitas
 * 4. Return JSON { playlists: [{resolution, url}], subtitles }
 */

const TMDB_KEY = process.env.TMDB_API_KEY

// Whitelist host (anti-SSRF)
const ALLOWED_EMBED_HOSTS = new Set(['vidsrcme.ru', 'vidsrc.to', 'vidsrc.me', 'multiembed.mov'])
const ALLOWED_STREAM_HOSTS = new Set(['vidsrcme.ru', 'vidsrc.to', 'vidsrc.me', 'multiembed.mov'])

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'

// Parse master playlist → daftar kualitas
function parseMasterPlaylist(m3u8: string, baseUrl: string): { resolution: string; height: number; url: string }[] {
  const lines = m3u8.split('\n')
  const variants: { resolution: string; height: number; url: string }[] = []
  let currentAttrs: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (line.startsWith('#EXT-X-STREAM-INF')) {
      currentAttrs = [line]
      // Next non-empty line = URL
      let j = i + 1
      while (j < lines.length && lines[j].trim() === '') j++
      if (j < lines.length) {
        const urlLine = lines[j].trim()
        if (urlLine && !urlLine.startsWith('#')) {
          const resMatch = line.match(/RESOLUTION=(\d+)x(\d+)/)
          const height = resMatch ? parseInt(resMatch[2]) : 0
          const resolution = height ? `${height}p` : 'auto'
          const url = urlLine.startsWith('http') ? urlLine : new URL(urlLine, baseUrl).toString()
          variants.push({ resolution, height, url })
        }
      }
    }
  }
  return variants.sort((a, b) => b.height - a.height) // tertinggi duluan
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const tmdbId = parseInt(searchParams.get('id') || '0')
  const type = (searchParams.get('type') || 'movie') as 'movie' | 'tv'
  const season = parseInt(searchParams.get('season') || '1')
  const episode = parseInt(searchParams.get('episode') || '1')
  const host = searchParams.get('host') || 'vidsrcme.ru'

  if (!tmdbId) {
    return NextResponse.json({ error: 'Missing id' }, { status: 400 })
  }
  if (!ALLOWED_EMBED_HOSTS.has(host)) {
    return NextResponse.json({ error: 'Host not allowed' }, { status: 403 })
  }

  // ─── 1. Ambil IMDB ID (VidSrc prefer IMDB) ───
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

  const embedId = imdbId || tmdbId
  const embedUrl = `https://${host}/embed/${type === 'tv' ? 'tv' : 'movie'}/${embedId}${type === 'tv' ? `/${season}/${episode}` : ''}?autoplay=1&ds_lang=id`

  try {
    // ─── 2. Fetch halaman embed ───
    const embedRes = await fetch(embedUrl, {
      headers: {
        'Referer': 'https://zenflix-ten.vercel.app/',
        'User-Agent': UA,
        'Accept': 'text/html,application/xhtml+xml',
      },
      signal: AbortSignal.timeout(15000),
    })
    if (!embedRes.ok) {
      return NextResponse.json({ error: `Embed ${embedRes.status}` }, { status: 502 })
    }
    const html = await embedRes.text()

    // ─── 3. Cari direct .m3u8 / source config di HTML ───
    // Pola umum: "file":"https://.../index.m3u8" atau source: 'https://...master.m3u8'
    let hlsUrl: string | null = null
    let decoded: string | null = null

    const m3u8Patterns = [
      /(https?:\\?\/\\?\/[^"'\s<>]+\.m3u8[^"'\s<>]*)/g,
      /["'](https?:\/\/[^"']+\.m3u8[^"']*)["']/g,
    ]

    for (const pattern of m3u8Patterns) {
      const matches = html.match(pattern)
      if (matches && matches.length > 0) {
        // Ambil URL yang paling mungkin master playlist (bukan segment)
        const candidate = matches.find((m) => !m.includes('segment') || m.includes('master'))
        if (candidate) {
          decoded = candidate.replace(/\\\//g, '/').replace(/\\u002F/g, '/').replace(/^["']|["']$/g, '')
          if (decoded.startsWith('http')) {
            hlsUrl = decoded
            break
          }
        }
      }
    }

    // Kalau belum ketemu, coba parse JSON config embedded (source/file/sources)
    if (!hlsUrl) {
      const configMatches = html.match(/srcSet|sources\s*:\s*(\{.*?\})|source\s*:\s*'([^']+)'|file\s*:\s*"([^"]+)"/g)
      for (const m of configMatches || []) {
        const urlMatch = m.match(/https?:\/\/[^"'\s>]+/)
        if (urlMatch) {
          const cand = urlMatch[0].replace(/\\\//g, '/')
          if (cand.includes('.m3u8')) { hlsUrl = cand; break }
        }
      }
    }

    if (!hlsUrl) {
      return NextResponse.json({ error: 'No HLS stream found in embed page', embedUrl }, { status: 404 })
    }

    // Validasi host stream
    try {
      const parsed = new URL(hlsUrl)
      if (!ALLOWED_STREAM_HOSTS.has(parsed.hostname)) {
        return NextResponse.json({ error: `Stream host not allowed: ${parsed.hostname}` }, { status: 403 })
      }
    } catch {
      return NextResponse.json({ error: 'Invalid stream URL' }, { status: 400 })
    }

    // ─── 4. Fetch master playlist → variants ───
    let playlists: { resolution: string; height: number; url: string }[] = []
    const masterRes = await fetch(hlsUrl, {
      headers: {
        'Referer': embedUrl,
        'User-Agent': UA,
        'Accept': 'application/vnd.apple.mpegurl, application/x-mpegURL, */*',
      },
      signal: AbortSignal.timeout(15000),
    })
    if (masterRes.ok) {
      const text = await masterRes.text()
      playlists = parseMasterPlaylist(text, hlsUrl)
    }

    // Kalau master ga punya variants (single rendition), pakai langsung
    if (playlists.length === 0) {
      playlists = [{ resolution: 'auto', height: 0, url: hlsUrl }]
    }

    return NextResponse.json({
      id: tmdbId,
      type,
      season,
      episode,
      host,
      embedUrl,
      playlists,
      totalQuality: playlists.length,
      defaultQuality: playlists[0]?.resolution || 'auto',
    })
  } catch {
    return NextResponse.json({ error: 'Failed to resolve HLS stream' }, { status: 504 })
  }
}