import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import MovieCard from '@/components/MovieCard'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY!

const labels: Record<string, { label: string; filter?: string; order: string }> = {
  popular: { label: 'Paling Populer', order: 'rating.desc' },
  top_rated: { label: 'Rating Tertinggi', order: 'rating.desc.nullslast' },
  latest: { label: 'Terbaru', order: 'year.desc.nullslast' },
  anime: { label: '🎌 Anime', filter: 'original_language=eq.ja', order: 'rating.desc' },
  'film-indo': { label: '🎬 Film Indonesia', filter: 'original_language=eq.id', order: 'rating.desc' },
  series: { label: '📺 Series', filter: 'media_type=eq.tv', order: 'rating.desc' },
  now_playing: { label: 'Sedang Tayang', order: 'year.desc' },
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const entry = labels[slug]
  if (!entry) notFound()

  let movies: any[] = []
  try {
    const filter = entry.filter ? `&${entry.filter}` : ''
    const url = `${SUPABASE_URL}/rest/v1/movies?select=*${filter}&order=${entry.order}&limit=100`
    const res = await fetch(url, {
      headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}` },
    })
    if (res.ok) movies = await res.json()
  } catch {}

  return (
    <>
      <Header />
      <main className="max-w-[1400px] mx-auto px-4 py-8 pt-24">
        <h1 className="text-3xl font-bold mb-8 gradient-text">{entry.label}</h1>
        {movies.length === 0 ? (
          <p className="text-[var(--text-muted)]">Belum ada judul untuk kategori ini.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
            {movies.map(movie => (
              <MovieCard key={movie.tmdb_id} movie={movie} />
            ))}
          </div>
        )}
      </main>
    </>
  )
}
