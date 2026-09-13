'use client'
import { useEffect, useState } from 'react'
import { X, Play, Loader2, AlertTriangle, ExternalLink } from 'lucide-react'
import { tmdbImage } from '@/lib/tmdb'

interface PlayerModalProps {
  movie: {
    id: number
    tmdb_id?: number
    title: string
    name?: string
    backdrop_path?: string | null
    overview?: string
  }
  onClose: () => void
}

export default function PlayerModal({ movie, onClose }: PlayerModalProps) {
  const [trailerKey, setTrailerKey] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const id = movie.tmdb_id || movie.id

  // Fetch trailer key
  useEffect(() => {
    let cancelled = false
    setLoading(true)
    fetch(`/api/trailer?tmdb_id=${id}`)
      .then(r => r.json())
      .then(data => {
        if (cancelled) return
        if (data.key) {
          setTrailerKey(data.key)
          setError('')
        } else {
          setError('Tidak ada trailer tersedia. Coba Lihat Detail untuk player film lengkap.')
        }
      })
      .catch(() => {
        if (!cancelled) setError('Gagal memuat trailer.')
      })
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [id])

  // Escape to close + lock scroll
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={`Preview ${movie.title || movie.name}`}
    >
      <div
        className="relative w-full max-w-4xl bg-[var(--bg-surface)] rounded-2xl border border-white/10 overflow-hidden shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-10 h-10 rounded-full bg-black/60 backdrop-blur border border-white/10 flex items-center justify-center text-white hover:bg-black/80 transition-all focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          aria-label="Tutup"
        >
          <X size={20} />
        </button>

        {/* Video area */}
        <div className="relative aspect-video bg-black">
          {loading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-10 h-10 text-[var(--accent)] animate-spin" />
            </div>
          ) : trailerKey ? (
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${trailerKey}?autoplay=1&mute=1&controls=1&rel=0&modestbranding=1`}
              title={`Trailer ${movie.title || movie.name}`}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              sandbox="allow-scripts allow-same-origin allow-presentation"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-surface)]">
              <div className="text-center p-6">
                <AlertTriangle className="w-10 h-10 text-yellow-400 mx-auto mb-3" />
                <p className="text-sm text-white/80 mb-2">{error}</p>
                <a
                  href={`/movie/${id}`}
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--accent)] text-white font-medium"
                  style={{ color: 'var(--accent-contrast)' }}
                >
                  <Play size={16} /> Buka Halaman Film
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Info bar */}
        <div className="p-4 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-bold text-[var(--text-main)] truncate">{movie.title || movie.name}</h3>
            <p className="text-xs text-[var(--text-tertiary)] line-clamp-1">{movie.overview || 'Preview trailer'}</p>
          </div>
          <a
            href={`/movie/${id}`}
            className="shrink-0 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg border border-white/10 text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] hover:border-white/20 transition-all"
          >
            <ExternalLink size={14} /> Detail
          </a>
        </div>
      </div>
    </div>
  )
}