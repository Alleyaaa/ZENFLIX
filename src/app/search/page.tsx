'use client'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import MovieCard from '@/components/MovieCard'
import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Search, X, Loader2 } from 'lucide-react'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [query, setQuery] = useState('')
  const [movies, setMovies] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Hydration-safe: only read searchParams after mount
  useEffect(() => {
    setMounted(true)
    const q = searchParams.get('q') || ''
    setQuery(q)
  }, [searchParams])

  useEffect(() => {
    if (!mounted || !query) return
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
  }, [query, mounted])

  const handleClear = () => {
    setQuery('')
    setMovies([])
  }

  if (!mounted) {
    return (
      <main className="max-w-[1400px] mx-auto pt-20 pb-10 px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-6">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="aspect-[2/3] rounded-lg bg-[var(--bg-elevated)] animate-pulse" />
          ))}
        </div>
      </main>
    )
  }

  return (
    <>
      <Header />
      <main className="max-w-[1400px] mx-auto pt-20 pb-10 px-4">
        {/* Search Input */}
        <div className="mb-8">
          <div className="relative max-w-2xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" size={20} />
            <input
              type="search"
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Cari film, series, aktor..."
              className="w-full pl-12 pr-12 py-4 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-[var(--text-main)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all text-base"
              autoFocus
            />
            {query && (
              <button
                onClick={handleClear}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--accent)] transition-colors"
                aria-label="Hapus pencarian"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {loading && (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 p-6" role="status" aria-label="Memuat hasil">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-lg bg-[var(--bg-elevated)] animate-pulse" />
            ))}
          </div>
        )}

        {!loading && !query && (
          <div className="text-center py-20 animate-fade-up">
            <div className="w-16 h-16 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-[var(--text-tertiary)]" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Cari Film & Series</h1>
            <p className="text-[var(--text-muted)] max-w-md mx-auto">
              Ketik judul film, serial, atau nama aktor untuk mulai mencari.
            </p>
          </div>
        )}

        {!loading && query && movies.length === 0 && (
          <div className="text-center py-20 animate-fade-up">
            <div className="w-16 h-16 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center mx-auto mb-4">
              <Search size={32} className="text-[var(--text-tertiary)]" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold mb-2">Tidak Ditemukan</h1>
            <p className="text-[var(--text-muted)]">
                          Hasil untuk &ldquo;{query}&rdquo; tidak ditemukan. Coba judul lain.
                        </p>
          </div>
        )}

        {!loading && query && movies.length > 0 && (
                  <>
                    <h1 className="text-xl font-bold px-2 pt-4 pb-4">
                      Hasil untuk &ldquo;{query}&rdquo; <span className="text-[var(--accent)] font-normal">({movies.length})</span>
                    </h1>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-4 p-2">
              {movies.map(m => <MovieCard key={m.id} movie={m} />)}
            </div>
          </>
        )}
      </main>
      <Footer />
    </>
  )
}