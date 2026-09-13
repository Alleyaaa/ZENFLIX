import { NextRequest, NextResponse } from 'next/server'

/**
 * HLS Proxy — PROXY SEMUA STREAM (manifest + segments) lewat server Zenflix.
 *
 * FIX: Deteksi m3u8 dari ISI RESPONSE (#EXTM3U), bukan dari extension URL.
 * IDLIX varianta URL = data-xxx.json (yang isinya m3u8) → ini yang bikin gagal.
 *
 * Client HANYA lihat /api/hls-proxy?url=... → source asli TIDAK pernah muncul.
 * Video element native (hls.js) → kontrol play/pause/seek/volume JALAN normal.
 */

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'

// Host stream yang diizinkan (majorplay = IDLIX, ruangskill = CDN segment, vidsrc mirrors)
const ALLOWED_HOST_SUFFIXES = ['.majorplay.net', '.ruangskill.space', '.vidsrcme.ru', '.vidsrc.to', '.vidsrc.me', '.multiembed.mov']
const ALLOWED_EXACT = new Set(['majorplay.net', 'ruangskill.space', 'vidsrcme.ru', 'vidsrc.to', 'vidsrc.me', 'multiembed.mov'])

function isAllowed(url: string): boolean {
  try {
    const u = new URL(url)
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return false
    if (ALLOWED_EXACT.has(u.hostname)) return true
    return ALLOWED_HOST_SUFFIXES.some((s) => u.hostname.endsWith(s))
  } catch {
    return false
  }
}

// Rewrite URL dalam playlist → proxy path
function rewriteUrl(rawUrl: string, baseUrl: string): string {
  if (!rawUrl.trim() || rawUrl.trim().startsWith('#')) return rawUrl
  let abs: string
  try {
    abs = new URL(rawUrl.trim(), baseUrl).toString()
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
      signal: AbortSignal.timeout(20000),
    })

    if (!res.ok) {
      return NextResponse.json({ error: `Upstream ${res.status}` }, { status: 502 })
    }

    const body = await res.arrayBuffer()
    const contentType = res.headers.get('content-type') || ''
    const isText = contentType.includes('text') || contentType.includes('mpegurl') || contentType.includes('json') || contentType.includes('javascript')

    // Deteksi m3u8: cek AWALAN body #EXTM3U (bukan dari extension!)
    const head = Buffer.from(body.slice(0, 100)).toString('utf-8')
    if (head.startsWith('#EXTM3U') || head.startsWith('#EXT-X')) {
      const text = Buffer.from(body).toString('utf-8')
      const base = target.split('/').slice(0, -1).join('/') + '/'

      const rewritten = text
        .split('\n')
        .map((line) => {
          const trimmed = line.trim()
          if (!trimmed || trimmed.startsWith('#')) return line
          // Rewrite URL (variant / segment / key)
          return rewriteUrl(trimmed, base)
        })
        .join('\n')

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

    // Kalau bukan m3u8 → passthrough binary (segment .ts/.m4s/key)
    return new Response(body, {
      status: 200,
      headers: {
        'Content-Type': contentType || 'application/octet-stream',
        'Cache-Control': 'private, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Cross-Origin-Resource-Policy': 'cross-origin',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Proxy timeout' }, { status: 504 })
  }
}