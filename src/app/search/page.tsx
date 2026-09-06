'use client'
import Header from '@/components/Header'
import MovieCard from '@/components/MovieCard'
import MovieRow from '@/components/MovieRow'
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
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}`)
        .then(r => r.json())
        .then(data => {
          setMovies(data.results || [])
          setLoading(false)
        })
        .catch(() => {
          setLoading(false)
          setMovies([])
        })
    }, 200)
    return () => clearTimeout(t)
  }, [query])

  if (!query) {
    return (
      <div className="text-center py-24">
        <h1 className="text-2xl font-bold mb-2">Cari Film & Series</h1>
        <p className="text-[var(--text-muted)]">Ketik judul film atau serial untuk mulai mencari.</p>
      </div>
    )
  }
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-6">
        {[...Array(12)].map((_, i) => <MovieCard key={i} movie={{ id: i, title: '' }} />)}
      </div>
    )
  }
  if (movies.length === 0) {
    return (
      <div className="text-center py-24">
        <h1 className="text-2xl font-bold mb-2">Tidak Ditemukan</h1>
        <p className="text-[var(--text-muted)]">Hasil untuk &quot;{query}&quot; tidak ditemukan. Coba judul lain.</p>
      </div>
    )
  }
  return (
    <>
      <h1 className="text-xl font-bold px-6 pt-6">Hasil untuk &quot;{query}&quot;</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-6">
        {movies.map(m => <MovieCard key={m.id} movie={m} />)}
      </div>
    </>
  )
}

export default function SearchPage() {
  return (
    <>
      <Header />
      <main className="max-w-[1400px] mx-auto pt-20 pb-10">
        <Suspense fallback={<div className="text-center py-24">Memuat...</div>}>
          <SearchContent />
        </Suspense>
      </main>
    </>
  )
}