'use client'
import { useEffect } from 'react'
import { ZenflixAsciiError } from '@/components/AsciiArt'
import Link from 'next/link'

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  // Simple error reporting (Sentry-ready hook; plug @sentry/nextjs later)
  useEffect(() => {
    // Log to console + optionally POST to /api/monitor (lightweight)
    console.error('[Zenflix ErrorBoundary]', error)
    if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
      // If Sentry DSN configured, report here
      try {
        fetch('/api/monitor', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ message: error?.message, digest: error?.digest, stack: error?.stack }),
        }).catch(() => {})
      } catch { /* noop */ }
    }
  }, [error])

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] bg-red-500/5 rounded-full blur-3xl" />
      <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-[var(--accent)]/5 rounded-full blur-3xl" />
      <div className="max-w-lg w-full relative z-10">
        <ZenflixAsciiError />
        <p className="text-center text-xs text-[var(--text-tertiary)] mt-2 font-mono">
          {error?.message || 'Terjadi kesalahan tidak dikenal'}
        </p>
        <div className="flex justify-center gap-3 mt-6">
          <button onClick={reset} className="btn-primary text-sm">Coba Lagi</button>
          <Link href="/" className="glass-btn px-4 py-2 rounded-lg text-sm">Ke Beranda</Link>
        </div>
      </div>
    </div>
  )
}