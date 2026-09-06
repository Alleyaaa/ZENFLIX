import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Header from '@/components/Header'
import MovieGrid from '@/components/MovieGrid'

const TMDB_KEY = process.env.TMDB_API_KEY
const TMDB_BASE = 'https://api.themoviedb.org/3'

export async function generateMetadata({ params }: { params: Promise<{ year: string }> }): Promise<Metadata> {
  const year = (await params).year
  if (!/^\d{4}$/.test(year)) return {}
  return {
    title: `Film Tahun ${year} | Zenflix`,
    description: `Koleksi film yang rilis tahun ${year} di Zenflix. Streaming film ${year} kualitas HD.`,
  }
}

export default async function YearPage({ params }: { params: Promise<{ year: string }> }) {
  const year = (await params).year
  if (!/^\d{4}$/.test(year)) notFound()

  let movies: any[] = []
  try {
    const url = `${TMDB_BASE}/discover/movie?api_key=${TMDB_KEY}&language=id-ID&sort_by=popularity.desc&primary_release_year=${year}&page=1`
    const res = await fetch(url, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(10000) })
    if (res.ok) {
      const data = await res.json()
      movies = data.results || []
    }
  } catch {
    movies = []
  }

  return (
    <>
      <Header />
      <main className="max-w-[1400px] mx-auto px-4 py-6 md:pt-24">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Film Tahun {year}</h1>
        <p className="text-sm text-[var(--text-muted)] mb-6">{movies.length} judul tersedia</p>
        <MovieGrid movies={movies} />
      </main>
    </>
  )
}