'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Menu, X, Heart, List, Tv, Film, Star } from 'lucide-react'

export default function FloatingNav() {
  const [isOpen, setIsOpen] = useState(false)
  const [favorites, setFavorites] = useState<any[]>([])
  const [watchlist, setWatchlist] = useState<any[]>([])

  // Load favorites and watchlist from localStorage on mount
  useEffect(() => {
    const storedFavorites = localStorage.getItem('zenflix-favorites')
    const storedWatchlist = localStorage.getItem('zenflix-watchlist')
    if (storedFavorites) setFavorites(JSON.parse(storedFavorites))
    if (storedWatchlist) setWatchlist(JSON.parse(storedWatchlist))
  }, [])

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('zenflix-favorites', JSON.stringify(favorites))
  }, [favorites])

  // Save watchlist to localStorage
  useEffect(() => {
    localStorage.setItem('zenflix-watchlist', JSON.stringify(watchlist))
  }, [watchlist])

  const toggleFavorite = (movie: any) => {
    setFavorites(prev => {
      const isFav = prev.some(item => item.id === movie.id)
      if (isFav) {
        return prev.filter(item => item.id !== movie.id)
      } else {
        return [...prev, movie]
      }
    })
  }

  const addToWatchlist = (movie: any) => {
    setWatchlist(prev => {
      const isInWatchlist = prev.some(item => item.id === movie.id)
      if (!isInWatchlist) {
        return [...prev, movie]
      }
      return prev
    })
  }

  const isFavorite = (movieId: number) => {
    return favorites.some(item => item.id === movieId)
  }

  const isInWatchlist = (movieId: number) => {
    return watchlist.some(item => item.id === movieId)
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-3">
      {/* Floating Navigation Toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="glass-panel w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-all"
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Floating Navigation Menu */}
      {isOpen && (
        <div className="glass-panel rounded-2xl p-4 w-80 max-h-[70vh] overflow-y-auto">
          <h3 className="text-lg font-bold mb-4">Quick Links</h3>
          <div className="space-y-3">
            <Link href="/category/now_playing" className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors">
              <Film size={20} className="text-blue-400" />
              <span> sedang Tayang</span>
            </Link>
            <Link href="/category/series" className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors">
              <Tv size={20} className="text-purple-400" />
              <span> Series</span>
            </Link>
            <Link href="/category/anime" className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors">
              <Star size={20} className="text-yellow-400" />
              <span> Anime</span>
            </Link>
            <Link href="/genre/prime-video" className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors">
              <List size={20} className="text-green-400" />
              <span> Prime Video</span>
            </Link>
          </div>

          {/* Favorites Section */}
          <div className="mt-6">
            <h4 className="text-base font-semibold mb-2 flex items-center gap-2">
              <Heart size={16} className="text-red-400" />
              Favorites ({favorites.length})
            </h4>
            {favorites.length > 0 ? (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {favorites.map((movie) => (
                  <Link
                    key={movie.id}
                    href={`/${movie.type || 'movie'}/${movie.id}`}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-red-900/20 transition-colors"
                  >
                    <Heart size={14} className="text-red-400 fill-red-400" />
                    <span className="text-sm truncate">{movie.title || movie.name}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">No favorites yet</p>
            )}
          </div>

          {/* Watchlist Section */}
          <div className="mt-4">
            <h4 className="text-base font-semibold mb-2 flex items-center gap-2">
              <List size={16} className="text-blue-400" />
              Watchlist ({watchlist.length})
            </h4>
            {watchlist.length > 0 ? (
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {watchlist.map((movie) => (
                  <Link
                    key={movie.id}
                    href={`/${movie.type || 'movie'}/${movie.id}`}
                    className="flex items-center gap-2 p-2 rounded-lg hover:bg-blue-900/20 transition-colors"
                  >
                    <List size={14} className="text-blue-400" />
                    <span className="text-sm truncate">{movie.title || movie.name}</span>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-sm text-[var(--text-muted)]">No watchlist items</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
