'use client'
import { useEffect, useState } from 'react'
import { useAuth } from './AuthProvider'
import { Heart } from 'lucide-react'

export function useWatchlist(movie_id: number) {
  const { user } = useAuth()
  const [inWatchlist, setInWatchlist] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!user?.id) return
    fetch(`/api/watchlist?user_id=${user.id}`)
      .then(r => r.json())
      .then(data => {
        setInWatchlist(data?.some((w: any) => w.movie_id === movie_id) || false)
      })
      .catch(() => {})
  }, [user?.id, movie_id])

  const toggle = async () => {
    if (!user?.id) return
    setLoading(true)
    if (inWatchlist) {
      await fetch(`/api/watchlist?user_id=${user.id}&movie_id=${movie_id}`, { method: 'DELETE' })
      setInWatchlist(false)
    } else {
      await fetch('/api/watchlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: user.id, movie_id })
      })
      setInWatchlist(true)
    }
    setLoading(false)
  }

  return { inWatchlist, toggle, loading }
}

export default function WatchlistButton({ movie_id, className = '' }: { movie_id: number, className?: string }) {
  const { inWatchlist, toggle, loading } = useWatchlist(movie_id)
  const { user } = useAuth()

  if (!user) return null

  return (
    <button
      onClick={toggle}
      disabled={loading}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs transition-all ${
        inWatchlist
          ? 'bg-red-500/20 text-red-400 border border-red-500/30'
          : 'glass-btn'
      } ${className}`}
    >
      <Heart size={14} className={inWatchlist ? 'fill-red-400' : ''} />
      {inWatchlist ? 'Tersimpan' : 'Watchlist'}
    </button>
  )
}
