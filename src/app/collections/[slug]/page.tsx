import Link from 'next/link'
import type { Metadata } from 'next'
import Header from '@/components/Header'
import MovieCard from '@/components/MovieCard'

const TMDB_KEY = process.env.TMDB_API_KEY
const TMDB_BASE = 'https://api.themoviedb.org/3'

const COLLECTIONS = [
  { slug: 'marvel', name: 'Marvel Cinematic Universe', query: 'Marvel' },
  { slug: 'dc', name: 'DC Universe', query: 'DC' },
  { slug: 'star-wars', name: 'Star Wars', query: 'Star Wars' },
  { slug: 'harry-potter', name: 'Harry Potter', query: 'Harry Potter' },
  { slug: 'lord-of-the-rings', name: 'The Lord of the Rings', query: 'Lord of the Rings' },
  { slug: 'john-wick', name: 'John Wick', query: 'John Wick' },
  { slug: 'mission-impossible', name: 'Mission Impossible', query: 'Mission Impossible' },
  { slug: 'fast-furious', name: 'Fast & Furious', query: 'Fast and Furious' },
  { slug: 'jurassic', name: 'Jurassic Park', query: 'Jurassic' },
  { slug: 'batman', name: 'Batman', query: 'Batman' },
  { slug: 'spider-man', name: 'Spider-Man', query: 'Spider-Man' },
  { slug: 'toy-story', name: 'Toy Story', query: 'Toy Story' },
  { slug: 'frozen', name: 'Frozen', query: 'Frozen' },
  { slug: 'avatar', name: 'Avatar', query: 'Avatar' },
  { slug: 'minions', name: 'Despicable Me & Minions', query: 'Minions' },
]

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const coll = COLLECTIONS.find(c => c.slug === slug)
  if (!coll) return {}
  return {
    title: `Koleksi ${coll.name} | Zenflix`,
    description: `Koleksi film ${coll.name} lengkap di Zenflix. Streaming semua serial ${coll.name} kualitas HD.`,
  }
}

export async function generateStaticParams() {
  return COLLECTIONS.map(c => ({ slug: c.slug }))
}

export default async function CollectionsPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const coll = COLLECTIONS.find(c => c.slug === slug)
  if (!coll) return null // notFound di server component tanpa redirect: render kosong

  let movies: any[] = []
  try {
    const url = `${TMDB_BASE}/search/movie?api_key=${TMDB_KEY}&language=id-ID&query=${encodeURIComponent(coll.query)}&page=1`
    const res = await fetch(url, { next: { revalidate: 86400 }, signal: AbortSignal.timeout(10000) })
    if (res.ok) {
      const data = await res.json()
      movies = (data.results || []).sort((a: any, b: any) => (b.vote_average || 0) - (a.vote_average || 0))
    }
  } catch {
    movies = []
  }

  return (
    <>
      <Header />
      <main className="max-w-[1400px] mx-auto px-4 py-6 md:pt-24">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Koleksi {coll.name}</h1>
        <p className="text-sm text-[var(--text-muted)] mb-6">{movies.length} film ditemukan</p>
        {movies.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-[var(--text-muted)]">Belum ada judul ditemukan.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 md:gap-5">
            {movies.map(movie => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
        <div className="mt-12">
          <h2 className="text-lg font-semibold mb-4">Koleksi Lainnya</h2>
          <div className="flex flex-wrap gap-2">
            {COLLECTIONS.filter(c => c.slug !== slug).map(c => (
              <Link key={c.slug} href={`/collections/${c.slug}`} className="px-4 py-2 rounded-lg glass-btn text-sm hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all">
                {c.name}
              </Link>
            ))}
          </div>
        </div>
      </main>
    </>
  )
}