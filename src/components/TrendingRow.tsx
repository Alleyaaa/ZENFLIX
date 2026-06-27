'use client'

import { useEffect, useState } from 'react'
import { TMDBMovie } from '@/lib/tmdb'
import MovieCard from './MovieCard'

interface Props {
  icon: React.ReactNode
}

export default function TrendingRow({ icon }: Props) {
  const [movies, setMovies] = useState<TMDBMovie[]>([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch(`/api/trending?page=1`).then(r => r.json()).then(d => setMovies(d.results || [])).catch(() => {})
  }, [])

  const loadMore = async () => {
    setLoading(true)
    const res = await fetch(`/api/trending?page=${page + 1}`)
    const data = await res.json()
    if (data.results?.length) {
      setMovies(prev => [...prev, ...data.results])
      setPage(p => p + 1)
    }
    setLoading(false)
  }

  if (!movies.length) return null

  return (
    <section className="mb-12">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[var(--accent)]">{icon}</span>
        <h2 className="text-sm font-medium text-[var(--text-main)]">Trending</h2>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
        {movies.map(movie => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
      <div className="mt-6 flex justify-center">
        <button
          onClick={loadMore}
          disabled={loading}
          className="px-6 py-3 rounded-full glass hover:scale-105 transition-all duration-300 font-medium text-sm"
        >
          {loading ? 'Memuat...' : 'Muat Lebih Banyak'}
        </button>
      </div>
    </section>
  )
}
