import { useState, useEffect } from 'react'

export function useWatchlist(movie_id: number) {
  const [inWatchlist, setInWatchlist] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem('zenflix-watchlist')
    if (stored) {
      const list = JSON.parse(stored)
      setInWatchlist(list.some((m: any) => m.id === movie_id))
    }
  }, [movie_id])

  const toggle = async () => {
    setLoading(true)
    const stored = localStorage.getItem('zenflix-watchlist')
    let list = stored ? JSON.parse(stored) : []
    if (inWatchlist) {
      list = list.filter((m: any) => m.id !== movie_id)
      setInWatchlist(false)
    } else {
      list.push({ id: movie_id, added_at: Date.now() })
      setInWatchlist(true)
    }
    localStorage.setItem('zenflix-watchlist', JSON.stringify(list))
    setLoading(false)
  }

  return { inWatchlist, toggle, loading }
}
