import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Header from '@/components/Header'
import MovieCard from '@/components/MovieCard'
import { tmdbImage } from '@/lib/tmdb'

const TMDB_API_KEY = process.env.TMDB_API_KEY
const TMDB_BASE = 'https://api.themoviedb.org/3'

// Kategori via TMDB (punya data lengkap: poster, tahun, rating)
const CATEGORIES: Record<string, { label: string; desc: string; tmdbPath: string }> = {
  trending: { label: 'Trending Minggu Ini', desc: 'Film dan serial yang paling banyak dibicarakan minggu ini.', tmdbPath: '/trending/movie/week' },
  now_playing: { label: 'Sedang Tayang', desc: 'Film yang sedang tayang di bioskop.', tmdbPath: '/movie/now_playing' },
  popular: { label: 'Paling Populer', desc: 'Film paling populer saat ini.', tmdbPath: '/movie/popular' },
  top_rated: { label: 'Rating Tertinggi', desc: 'Film dengan rating tertinggi sepanjang masa.', tmdbPath: '/movie/top_rated' },
  upcoming: { label: 'Segera Tayang', desc: 'Film yang akan segera tayang.', tmdbPath: '/movie/upcoming' },
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const entry = CATEGORIES[slug]
  if (!entry) return {}
  return {
    title: `${entry.label} | Zenflix`,
    description: entry.desc,
  }
}

interface TMDBResult {
  id: number
  title?: string
  name?: string
  poster_path?: string | null
  backdrop_path?: string | null
  release_date?: string
  first_air_date?: string
  vote_average?: number
  media_type?: string
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const entry = CATEGORIES[slug]
  if (!entry) notFound()

  let movies: TMDBResult[] = []
  try {
    const url = `${TMDB_BASE}${entry.tmdbPath}?api_key=${TMDB_API_KEY}&language=id-ID&page=1`
    const res = await fetch(url, { next: { revalidate: 3600 } })
    if (res.ok) {
      const data = await res.json()
      movies = (data.results || []).slice(0, 30)
    }
  } catch {
    movies = []
  }

  return (
    <>
      <Header />
      <main className="max-w-[1400px] mx-auto px-4 py-6 md:pt-24">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">{entry.label}</h1>
        <p className="text-sm text-[var(--text-muted)] mb-6">{entry.desc}</p>
        {movies.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-[var(--text-muted)]">Belum ada judul untuk kategori ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
            {movies.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </main>
    </>
  )
}