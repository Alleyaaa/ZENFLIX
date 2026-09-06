'use client'
import { useState, useEffect, useCallback } from 'react'
import { AlertTriangle, RotateCcw, PlayCircle } from 'lucide-react'

// Multiple reliable sources, tried in order
const SOURCES = [
  { name: 'VidSrc', url: (id: number) => `https://vidsrc.to/embed/movie/tmdb/${id}` },
  { name: 'VidSrcMe', url: (id: number) => `https://vidsrcme.org/embed/movie/tmdb/${id}` },
  { name: 'VidSrcXyz', url: (id: number) => `https://vidsrc.xyz/embed/movie/tmdb/${id}` },
  { name: 'Embed', url: (id: number) => `https://embed.nicemovie.app/movie/${id}` },
]

export default function Player({ tmdbId }: { tmdbId: number }) {
  const [mode, setMode] = useState<'loading' | 'playing' | 'error'>('loading')
  const [trailerKey, setTrailerKey] = useState<string | null>(null)
  const [currentSrc, setCurrentSrc] = useState<string>(SOURCES[0].url(tmdbId))
  const [srcIndex, setSrcIndex] = useState(0)

  // Fetch trailer as final fallback
  useEffect(() => {
    fetch(`/api/trailer?tmdb_id=${tmdbId}`)
      .then(r => r.json())
      .then(data => {
        if (data.key) setTrailerKey(data.key)
      })
      .catch(() => {})
  }, [tmdbId])

  const trySource = useCallback((index: number) => {
    if (index >= SOURCES.length) {
      setMode('error')
      return
    }
    setSrcIndex(index)
    setCurrentSrc(SOURCES[index].url(tmdbId))
    setMode('loading')
  }, [tmdbId])

  useEffect(() => {
    const t = setTimeout(() => trySource(0), 0)
    return () => clearTimeout(t)
  }, [tmdbId, trySource])

  const handleIframeLoad = () => {
    // Iframe load = embed loaded (may still be "media unavailable" inside provider)
    setTimeout(() => setMode('playing'), 600)
  }

  const handleIframeError = () => {
    trySource(srcIndex + 1)
  }

  // "Media unavailable" terjadi di dalam iframe provider, kita tidak bisa detect langsung.
  // Solusi: tombol ganti sumber manual + auto-fallback ke trailer jika semua gagal.

  // Fallback: semua source gagal, pakai trailer YouTube
  if (mode === 'error') {
    if (trailerKey) {
      return (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <PlayCircle size={18} className="text-[var(--accent)]" />
            <span>Player tidak tersedia. Nonton trailer resmi:</span>
          </div>
          <div className="aspect-video w-full rounded-xl overflow-hidden bg-black/60 border border-[var(--border)]">
            <iframe
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`}
              className="w-full h-full"
              allowFullScreen
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
              referrerPolicy="no-referrer"
              title="Trailer resmi"
            />
          </div>
        </div>
      )
    }
    return (
      <div className="space-y-3">
        <div className="aspect-video w-full rounded-xl overflow-hidden bg-[var(--bg-elevated)] border border-[var(--border)] flex flex-col items-center justify-center gap-3 p-6">
          <AlertTriangle size={28} className="text-[var(--text-tertiary)]" />
          <p className="text-sm text-[var(--text-muted)]">Semua sumber player tidak tersedia saat ini.</p>
          <button
            onClick={() => trySource(0)}
            className="px-4 py-2 rounded-lg glass-btn text-sm inline-flex items-center gap-2"
          >
            <RotateCcw size={14} /> Coba Lagi
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="aspect-video w-full rounded-xl overflow-hidden relative bg-black/60 border border-[var(--border)]">
        {mode === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-[var(--bg)]/60">
            <div className="w-8 h-8 border-2 border-[var(--border)] border-t-[var(--accent)] rounded-full animate-spin" />
          </div>
        )}
        <iframe
          key={currentSrc}
          src={currentSrc}
          className="w-full h-full"
          allowFullScreen
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          referrerPolicy="no-referrer"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          title={`Pemutar film (${SOURCES[srcIndex]?.name || ''})`}
        />
      </div>
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <p className="text-[11px] text-[var(--text-tertiary)]">
          {mode === 'playing' ? `Memutar via ${SOURCES[srcIndex]?.name || 'sumber'}` : 'Menyiapkan pemutar...'}
        </p>
        {SOURCES.length > 1 && (
          <div className="flex items-center gap-1">
            <span className="text-[11px] text-[var(--text-tertiary)] mr-1">Sumber:</span>
            {SOURCES.map((s, i) => (
              <button
                key={s.name}
                onClick={() => trySource(i)}
                className={`px-2 py-0.5 rounded text-[11px] transition-colors ${
                  i === srcIndex
                    ? 'bg-[var(--accent)] font-semibold'
                    : 'glass-btn text-[var(--text-muted)]'
                }`}
                style={i === srcIndex ? { color: 'var(--accent-contrast)' } : undefined}
              >
                {s.name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}