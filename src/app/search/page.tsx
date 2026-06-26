'use client'
import Header from '@/components/Header'
import MovieCard from '@/components/MovieCard'
import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

function SearchContent() {
  const searchParams = useSearchParams()
  const query = searchParams.get('q') || ''
  const [movies, setMovies] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (!query) return
    setLoading(true)
    fetch(`/api/search?q=${encodeURIComponent(query)}`)
      .then(r => r.json())
      .then(data => {
        setMovies(data.results || [])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [query])

  if (!query) return <p className="text-zinc-400 text-center mt-20">Type something to search...</p>
  if (loading) return <p className="text-zinc-400 text-center mt-20">Searching...</p>
  if (movies.length === 0) return <p className="text-zinc-400 text-center mt-20">No results found for "{query}"</p>
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-6">
      {movies.map(m => <MovieCard key={m.id} movie={m} />)}
    </div>
  )
}

export default function SearchPage() {
  return (
    <>
      <Header />
      <main className="p-6">
        <Suspense fallback={<p>Loading...</p>}>
          <SearchContent />
        </Suspense>
      </main>
    </>
  )
}
