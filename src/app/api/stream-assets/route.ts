import { NextRequest, NextResponse } from 'next/server'

/**
 * Stream Assets Proxy
 *
 * Proxy untuk asset (JS, CSS, images, subtitles) dari domain source.
 * Sembunyikan domain asli — client hanya melihat /api/stream-assets?url=...
 */

const ALLOWED_HOSTS = new Set([
  'vidsrcme.ru', 'vidsrc.to', 'vidsrc.me',
  'multiembed.mov', 'cdn.jsdelivr.net', 'cdnjs.cloudflare.com',
])

const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const url = searchParams.get('url')

  if (!url) {
    return NextResponse.json({ error: 'Missing url' }, { status: 400 })
  }

  // Validate host
  let parsed: URL
  try {
    const parsed = new URL(url)
    if (!isAllowedHost(parsed.hostname)) {
      return NextResponse.json({ error: 'Host not allowed' }, { status: 403 })
    }
  } catch {
    return NextResponse.json({ error: 'Invalid URL' }, { status: 400 })
  }

  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
        'Referer': 'https://zenflix-ten.vercel.app/',
        'Accept': '*/*',
      },
      signal: AbortSignal.timeout(15000),
    })

    if (!res.ok) {
      return NextResponse.json({ error: `Upstream ${res.status}` }, { status: 502 })
    }

    // Detect content type
    const contentType = res.headers.get('content-type') || 'application/octet-stream'

    // Stream response
    return new Response(res.body, {
      status: 200,
      headers: {
        'Content-Type': res.headers.get('content-type') || 'application/octet-stream',
        'Cache-Control': 'public, max-age=3600',
        'Access-Control-Allow-Origin': '*',
        'Cross-Origin-Resource-Policy': 'cross-origin',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Proxy timeout' }, { status: 504 })
  }
}

function isAllowedHost(host: string): boolean {
  const allowedDomains = [
    'vidsrcme.ru', 'vidsrc.to', 'vidsrc.me', 'multiembed.mov',
    'cdn.jsdelivr.net', 'cdnjs.cloudflare.com',
    'vidsrcme.ru', 'vidsrc.to', 'vidsrc.me', 'multiembed.mov',
  ]
  return ALLOWED_HOSTS.has(host) || 
         host.endsWith('.vidsrcme.ru') || 
         host.endsWith('.vidsrc.to') ||
         host.endsWith('.vidsrc.me') ||
         host.endsWith('.mov')
}