import { NextRequest, NextResponse } from 'next/server'

/**
 * HLS Proxy — PROXY SEMUA STREAM (manifest + segments) lewat server Zenflix.
 *
 * Kenapa ini penting:
 * - Client HANYA lihat /api/hls-proxy?url=... → source asli (majorplay/vidsrc) TIDAK pernah
 *   muncul di network tab / inspect element → SEAMLESS & source tersembunyi total.
 * - Video element native (hls.js) → kontrol play/pause/seek/volume JALAN normal.
 * - Kualitas bisa dipilih (hls.js levels).
 *
 * Alur:
 * 1. Client minta /api/hls-proxy?url=<master.m3u8>
 * 2. Server fetch playlist, rewrite semua URL (variant + segment) → /api/hls-proxy?url=...
 * 3. Server proxy segment (.ts/.m4s) → client ga pernah lihat domain asli
 *
 * Whitelist host ketat (anti-SSRF).
 */

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'

// Host yang diizinkan utk di-proxy (majorplay = IDLIX internal, vidsrc mirrors)
const ALLOWED_HOSTS = new Set([
  'majorplay.net', 'e2e.majorplay.net', 'e1.majorplay.net', 'e3.majorplay.net',
  's1.majorplay.net', 's2.majorplay.net', 's3.majorplay.net', 's4.majorplay.net',
  'vz-*.majorplay.net', 'z4.majorplay.net', 'z6.majorplay.net', 'z8.majorplay.net',
  'vidsrcme.ru', 'vidsrc.to', 'vidsrc.me', 'multiembed.mov',
])

function isAllowed(url: string): boolean {
  try {
    const u = new URL(url)
    if (u.hostname === 'majorplay.net' || u.hostname.endsWith('.majorplay.net')) return true
    if (ALLOWED_HOSTS.has(u.hostname)) return true
    // vidsrc mirrors
    if (['vidsrcme.ru', 'vidsrc.to', 'vidsrc.me', 'multiembed.mov'].includes(u.hostname)) return true
    // CDN IDLIX/majorplay (berbagai domain, berakhiran path /v/...)
    // Allow semua host yang dipakai stream segments IDLIX (ruangskill, dll)
    if (u.pathname.includes('/v/') && (u.protocol === 'https:')) {
      return true
    }
    return false
  } catch {
    return false
  }
}

// Rewrite URL dalam playlist → proxy path
function rewriteUrl(rawUrl: string, baseUrl: string): string {
  let abs: string
  try {
    abs = new URL(rawUrl, baseUrl).toString()
  } catch {
    return rawUrl
  }
  if (!isAllowed(abs)) return rawUrl
  return `/api/hls-proxy?url=${encodeURIComponent(abs)}`
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const target = searchParams.get('url')

  if (!target) {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 })
  }
  if (!isAllowed(target)) {
    return NextResponse.json({ error: 'Host not allowed' }, { status: 403 })
  }

  try {
    const res = await fetch(target, {
      headers: {
        'User-Agent': UA,
        'Accept': '*/*',
        'Referer': 'https://zenflix-ten.vercel.app/',
      },
      signal: AbortSignal.timeout(15000),
    })

    if (!res.ok) {
      return NextResponse.json({ error: `Upstream ${res.status}` }, { status: 502 })
    }

    const contentType = res.headers.get('content-type') || ''
    // ─── Kalau M3U8 (playlist) → rewrite URL biar semua lewat proxy ───
    if (contentType.includes('mpegurl') || contentType.includes('application/x-mpegurl') || target.endsWith('.m3u8')) {
      const text = await res.text()
      const base = target.split('/').slice(0, -1).join('/') + '/'

      const rewritten = text.split('\n').map((line) => {
        const trimmed = line.trim()
        if (!trimmed || trimmed.startsWith('#')) return line
        // Rewrite URL (variant / segment / key)
        return rewriteUrl(trimmed, base)
      }).join('\n')

      return new NextResponse(rewritten, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.apple.mpegurl',
          'Cache-Control': 'no-store',
          'Access-Control-Allow-Origin': '*',
          'Cross-Origin-Resource-Policy': 'cross-origin',
        },
      })
    }

    // ─── Kalau segment (ts/m4s/key) → passthrough stream ───
    return new Response(res.body, {
      status: 200,
      headers: {
        'Content-Type': contentType || 'application/octet-stream',
        'Cache-Control': 'private, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Cross-Origin-Resource-Policy': 'cross-origin',
        'Content-Length': res.headers.get('content-length') || '',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Proxy timeout' }, { status: 504 })
  }
}