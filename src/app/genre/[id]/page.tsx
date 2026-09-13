'use client'
import { useState, useEffect, useCallback } from 'react'
import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import MovieCard from '@/components/MovieCard'
import AdSlot from '@/components/AdSlot'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

const GENRE_NAMES: Record<number, { id: string; en: string }> = {
  28: { id: 'Aksi', en: 'Action' },
  12: { id: 'Petualangan', en: 'Adventure' },
  16: { id: 'Animasi', en: 'Animation' },
  35: { id: 'Komedi', en: 'Comedy' },
  80: { id: 'Kejahatan', en: 'Crime' },
  99: { id: 'Dokumenter', en: 'Documentary' },
  18: { id: 'Drama', en: 'Drama' },
  10751: { id: 'Keluarga', en: 'Family' },
  14: { id: 'Fantasi', en: 'Fantasy' },
  36: { id: 'Sejarah', en: 'History' },
  27: { id: 'Horor', en: 'Horror' },
  10402: { id: 'Musik', en: 'Music' },
  9648: { id: 'Misteri', en: 'Mystery' },
  10749: { id: 'Romantis', en: 'Romance' },
  878: { id: 'Sci-Fi', en: 'Sci-Fi' },
  10770: { id: 'TV Movie', en: 'TV Movie' },
  53: { id: 'Thriller', en: 'Thriller' },
  10752: { id: 'Perang', en: 'War' },
  37: { id: 'Western', en: 'Western' },
  10759: { id: 'Aksi & Petualangan', en: 'Action & Adventure' },
  10762: { id: 'Anak-anak', en: 'Kids' },
  10765: { id: 'Sci-Fi & Fantasi', en: 'Sci-Fi & Fantasy' },
  10766: { id: 'Sinema', en: 'Soap' },
  10767: { id: 'Bicara', en: 'Talk' },
  10768: { id: 'Perang & Politik', en: 'War & Politics' },
}

// Page size options (user minta "per page berapa judul film")
const PAGE_SIZES = [24, 36, 48, 60]

interface Movie {
  id: number
  title?: string
  name?: string
  poster_path?: string | null
  release_date?: string
  first_air_date?: string
  vote_average?: number
}

export default function GenrePage({ params }: { params: Promise<{ id: string }> }) {
  const [genreId, setGenreId] = useState<number | null>(null)
  const [movies, setMovies] = useState<Movie[]>([])
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [pageSize, setPageSize] = useState(24)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    params.then(p => {
      const id = parseInt(p.id)
      if (isNaN(id) || !GENRE_NAMES[id]) {
        setError('Genre tidak ditemukan')
      } else {
        setGenreId(id)
      }
    })
  }, [params])

  // Fetch movies per page (pakai TMDB discover API via route sendiri)
    const fetchPage = useCallback(async (pageNum: number, size: number) => {
      if (!genreId) return
      setLoading(true)
      setError('')
      try {
        const res = await fetch(`/api/discover?genre=${genreId}&page=${pageNum}&limit=${size}`)
        const data = await res.json()
        setMovies(data.results || [])
        setTotalPages(data.total_pages > 500 ? 500 : data.total_pages || 1)
        setTotalResults(data.total_results || 0)
      } catch {
        setError('Gagal memuat film. Coba lagi.')
      } finally {
        setLoading(false)
      }
    }, [genreId])

  useEffect(() => {
    if (genreId) fetchPage(page, pageSize)
  }, [genreId, page, pageSize, fetchPage])

  const changePage = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return
    setPage(newPage)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (error) return notFound()

  const genreName = genreId ? GENRE_NAMES[genreId] : null

  return (
    <>
      <Header />
      <main className="max-w-[1400px] mx-auto px-4 py-6 md:pt-24 pb-16">
        {/* Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
                  <div>
                    <span className="inline-block px-3 py-1 rounded-md bg-[var(--accent)] text-xs font-bold mb-3 uppercase tracking-wide" style={{ color: 'var(--accent-contrast)' }}>
                      Genre
                    </span>
                    <h1 className="text-2xl md:text-3xl font-bold">
                      {genreName?.id || ''}
                    </h1>
                    {totalResults > 0 && (
                      <p className="text-sm text-[var(--text-muted)] mt-1">
                        {totalResults.toLocaleString('id-ID')} judul, halaman {page} dari {totalPages.toLocaleString('id-ID')}
                      </p>
                    )}
                  </div>
                  {/* Page size selector */}
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[var(--text-tertiary)]">Per halaman:</span>
                    <div className="flex gap-1 bg-[var(--bg-elevated)] rounded-lg p-1">
                      {PAGE_SIZES.map(size => (
                        <button
                          key={size}
                          onClick={() => { setPageSize(size); setPage(1) }}
                          className={`px-3 py-1 rounded-md text-xs transition-all ${pageSize === size ? 'bg-[var(--accent)] font-semibold' : 'hover:bg-[var(--border)]/30 text-[var(--text-muted)]'}`}
                          style={pageSize === size ? { color: 'var(--accent-contrast)' } : undefined}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

        <AdSlot slot="genre_page_top" format="banner" className="mb-6" />

        {/* Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 size={32} className="animate-spin text-[var(--accent)]" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-5">
              {movies.map(movie => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10 flex-wrap">
                <button
                  onClick={() => changePage(page - 1)}
                  disabled={page <= 1}
                  className="px-4 py-2 rounded-lg glass-btn text-sm disabled:opacity-40 flex items-center gap-1"
                >
                  <ChevronLeft size={16} /> Sebelumnya
                </button>

                {/* Page numbers */}
                <div className="flex gap-1 flex-wrap">
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    // Logic: show pages around current
                    let pageNum: number
                    if (totalPages <= 7) pageNum = i + 1
                    else if (page <= 4) pageNum = i + 1
                    else if (page >= totalPages - 3) pageNum = totalPages - 6 + i
                    else pageNum = page - 3 + i
                    return (
                      <button
                        key={pageNum}
                        onClick={() => changePage(pageNum)}
                        className={`w-9 h-9 rounded-lg text-sm transition-all ${
                          page === pageNum ? 'bg-[var(--accent)] font-bold' : 'glass-btn'
                        }`}
                        style={page === pageNum ? { color: 'var(--accent-contrast)' } : undefined}
                      >
                        {pageNum}
                      </button>
                    )
                  })}
                </div>

                <button
                  onClick={() => changePage(page + 1)}
                  disabled={page >= totalPages}
                  className="px-4 py-2 rounded-lg glass-btn text-sm disabled:opacity-40 flex items-center gap-1"
                >
                  Selanjutnya <ChevronRight size={16} />
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </>
  )
}