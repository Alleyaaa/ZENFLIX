import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// ─── In-memory sliding window rate limiter ───
const rateLimitMap = new Map<string, number[]>()
const RATE_LIMIT_WINDOW = 60_000 // 1 minute

function getClientIp(request: NextRequest): string {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1'
  )
}

function isRateLimited(key: string, maxRequests: number): boolean {
  const now = Date.now()
  const timestamps = rateLimitMap.get(key) || []
  const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW)
  if (recent.length >= maxRequests) return true
  recent.push(now)
  rateLimitMap.set(key, recent)
  return false
}

// Periodically clean up stale entries (every 5 minutes)
setInterval(() => {
  const now = Date.now()
  for (const [key, timestamps] of rateLimitMap.entries()) {
    const recent = timestamps.filter((t) => now - t < RATE_LIMIT_WINDOW)
    if (recent.length === 0) rateLimitMap.delete(key)
    else rateLimitMap.set(key, recent)
  }
}, 5 * 60_000)

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const response = NextResponse.next()

  // ─── Security Headers (A05: Security Misconfiguration) ───
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  )
  // CSP: izinkan source streaming (vidsrc domains) + stream proxy + player embeds.
  // Media/frame-src diizinkan untuk semua mirror VidSrc + YouTube (trailer) + proxy /api/stream.
  // script-src: izinkan Midtrans sandbox + Trakteer CDN embed + Adsterra ads (profitableratecpmnetwork + screwbedriddenheadline).
  // connect-src: izinkan Adsterra sub-scripts (mereka load pixel/stats dari berbagai domain).
  // frame-src: + Adsterra banner iframe (screwbedriddenheadline) biar iklan ga "blocked".
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://app.sandbox.midtrans.com https://edge-cdn.trakteer.id https://*.profitableratecpmnetwork.com https://profitableratecpmnetwork.com https://*.portalfluently.com https://portalfluently.com https://screwbedriddenheadline.com; style-src 'self' 'unsafe-inline'; img-src 'self' https://image.tmdb.org data: blob:; media-src 'self' https://vidsrc-embed.ru https://vidsrcme.ru https://vidsrc.to https://vidsrc.me blob:; frame-src 'self' https://vidsrc-embed.ru https://vidsrcme.ru https://vidsrc.to https://vidsrc.me https://multiembed.mov https://www.youtube.com https://www.youtube-nocookie.com https://screwbedriddenheadline.com; connect-src 'self' https://*.supabase.co https://api.themoviedb.org https://app.sandbox.midtrans.com https://edge-cdn.trakteer.id https://*.profitableratecpmnetwork.com https://profitableratecpmnetwork.com https://*.portalfluently.com https://portalfluently.com https://screwbedriddenheadline.com https://*.protrafficinspector.com https://protrafficinspector.com https://*.spendsdetachment.com https://spendsdetachment.com https://*.zoologyfibre.com https://zoologyfibre.com; worker-src 'self' blob:;"
  )

  // ─── Rate Limiting (A04: Insecure Design / A07: Identification & Auth Failures) ───
  if (pathname.startsWith('/api/')) {
    const ip = getClientIp(request)

    // Stricter limits for sensitive endpoints
    const isSensitive =
      pathname.startsWith('/api/subscription') ||
      pathname.startsWith('/api/payment') ||
      pathname.startsWith('/api/seed') ||
      pathname.startsWith('/api/sql')

    const maxRequests = isSensitive ? 10 : 60

    if (isRateLimited(`ip:${ip}`, maxRequests)) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }
  }

  return response
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
}
