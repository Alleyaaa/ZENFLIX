'use client'
import { useState, useEffect } from 'react'

export default function Player({ tmdbId }: { tmdbId: number }) {
  const [mode, setMode] = useState<'loading' | 'playing' | 'error'>('loading')
  const [trailerKey, setTrailerKey] = useState<string | null>(null)
  const [currentSrc, setCurrentSrc] = useState<string>('')

  // Source list in order of preference
  const sources = [
    { name: 'vidsrcme', url: (id: number) => `https://vidsrcme.ru/embed/movie/tmdb/${id}` },
    { name: 'vidsrcxyz', url: (id: number) => `https://vidsrc.xyz/embed/movie/tmdb/${id}` },
  ]

  // Fetch trailer as fallback
  useEffect(() => {
    fetch(`/api/trailer?tmdb_id=${tmdbId}`)
      .then(r => r.json())
      .then(data => {
        if (data.key) setTrailerKey(data.key)
      })
      .catch(() => {})
  }, [tmdbId])

  // Try to load sources sequentially
  const trySource = (index: number) => {
    if (index >= sources.length) {
      setMode('error')
      return
    }
    const src = sources[index].url(tmdbId)
    setCurrentSrc(src)
    setMode('loading')
    // Simulate loading delay; actual load will be detected via onLoad/onError
    setTimeout(() => {
      // We'll rely on iframe events to detect success/failure
    }, 300)
  }

  useEffect(() => {
    trySource(0)
  }, [tmdbId])

  const handleIframeLoad = () => {
    // If iframe loads successfully, consider it playing
    setMode('playing')
  }

  const handleIframeError = () => {
    // Try next source
    const idx = sources.findIndex(s => s.url(tmdbId) === currentSrc)
    if (idx === -1) trySource(0)
    else trySource(idx + 1)
  }

  // If all sources failed and we have trailer, show trailer
  if (mode === 'error' && trailerKey) {
    return (
      <div className="space-y-3">
        <p className="text-xs text-[var(--text-tertiary)] text-center">Player tidak tersedia, beralih ke trailer</p>
        <div className="aspect-video w-full glass-card rounded-2xl overflow-hidden bg-black/40">
          <iframe
            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1`}
            className="w-full h-full"
            allowFullScreen
            sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <div className="aspect-video w-full glass-card rounded-2xl overflow-hidden relative bg-black/40">
        {mode === 'loading' && (
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div className="w-8 h-8 border-2 border-white/20 border-t-[var(--accent)] rounded-full animate-spin" />
          </div>
        )}
        {mode === 'error' && !trailerKey && (
          <div className="absolute inset-0 flex items-center justify-center z-10 flex-col gap-2">
            <p className="text-sm text-[var(--text-tertiary)]">Player tidak tersedia</p>
            <button
              onClick={() => trySource(0)}
              className="px-4 py-1.5 rounded-lg glass-btn text-xs"
            >Coba Lagi</button>
          </div>
        )}
        <iframe
          key={currentSrc}
          src={currentSrc}
          className="w-full h-full"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
        />
      </div>
      {mode === 'playing' && (
        <p className="text-[10px] text-[var(--text-tertiary)] text-center">
          Powered by {sources.find(s => s.url(tmdbId) === currentSrc)?.name}
        </p>
      )}
    </div>
  )
}