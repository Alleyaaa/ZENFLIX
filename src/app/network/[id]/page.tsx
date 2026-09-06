import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Header from '@/components/Header'
import MovieGrid from '@/components/MovieGrid'

const TMDB_KEY = process.env.TMDB_API_KEY
const TMDB_BASE = 'https://api.themoviedb.org/3'

const NETWORK_NAMES: Record<number, string> = {
  213: 'Netflix',
  1024: 'Prime Video',
  113: 'HBO',
  2739: 'Disney+',
  2552: 'Apple TV+',
  4330: 'Viu',
  6465: 'Vidio',
  119: 'Catchplay+',
}

const VALID_NETWORKS = Object.keys(NETWORK_NAMES).map(Number)

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const id = parseInt((await params).id)
  const name = NETWORK_NAMES[id]
  if (!name) return {}
  return {
    title: `Film dari ${name} | Zenflix`,
    description: `Koleksi film dan series asli ${name} di Zenflix. Streaming kualitas HD.`,
  }
}

export default async function NetworkPage({ params }: { params: Promise<{ id: string }> }) {
  const id = parseInt((await params).id)
  if (!VALID_NETWORKS.includes(id)) notFound()

  let movies: any[] = []
  let tvShows: any[] = []
  try {
    const [movieRes, tvRes] = await Promise.all([
      fetch(`${TMDB_BASE}/discover/movie?api_key=${TMDB_KEY}&language=id-ID&sort_by=popularity.desc&with_networks=${id}&page=1`, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(10000) }),
      fetch(`${TMDB_BASE}/discover/tv?api_key=${TMDB_KEY}&language=id-ID&sort_by=popularity.desc&with_networks=${id}&page=1`, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(10000) }),
    ])
    if (movieRes.ok) {
      const d = await movieRes.json()
      movies = d.results || []
    }
    if (tvRes.ok) {
      const d = await tvRes.json()
      tvShows = d.results || []
    }
  } catch {
    movies = []
    tvShows = []
  }

  const name = NETWORK_NAMES[id]

  return (
    <>
      <Header />
      <main className="max-w-[1400px] mx-auto px-4 py-6 md:pt-24">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Konten {name}</h1>
        <p className="text-sm text-[var(--text-muted)] mb-6">Film dan series original dari {name}</p>
        {tvShows.length > 0 && (
          <>
            <h2 className="text-lg font-semibold mb-3">Series</h2>
            <div className="mb-8">
              <MovieGrid movies={tvShows} />
            </div>
          </>
        )}
        {movies.length > 0 && (
          <>
            <h2 className="text-lg font-semibold mb-3">Film</h2>
            <MovieGrid movies={movies} />
          </>
        )}
        {movies.length === 0 && tvShows.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[var(--text-muted)]">Belum ada judul ditemukan.</p>
          </div>
        )}
      </main>
    </>
  )
}