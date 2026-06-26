import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import MovieCard from '@/components/MovieCard'
import { getNowPlaying, getPopular, getTopRated, getUpcoming } from '@/lib/tmdb'
import { Film, TrendingUp, Star, Clock } from 'lucide-react'

const fetchers: Record<string, { fn: (page?: number) => Promise<{ results: any[] }>; icon: React.ReactNode }> = {
  now_playing: { fn: getNowPlaying, icon: <Film size={18} /> },
  popular: { fn: getPopular, icon: <TrendingUp size={18} /> },
  top_rated: { fn: getTopRated, icon: <Star size={18} /> },
  upcoming: { fn: getUpcoming, icon: <Clock size={18} /> },
}

const labels: Record<string, string> = {
  now_playing: 'Now Playing',
  popular: 'Popular',
  top_rated: 'Top Rated',
  upcoming: 'Upcoming',
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug
  const entry = fetchers[slug]
  if (!entry) notFound()

  const data = await entry.fn()

  return (
    <>
      <Header />
      <main className="max-w-[1400px] mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-6">
          <span className="text-[var(--accent)]">{entry.icon}</span>
          <h1 className="text-2xl font-bold">{labels[slug] || slug}</h1>
          <span className="text-sm text-[var(--text-secondary)] ml-2">({data.results.length} film)</span>
        </div>
        {data.results.length === 0 ? (
          <p className="text-[var(--text-secondary)]">Belum ada film.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {data.results.map((movie: any) => (
              <MovieCard key={movie.id} movie={movie} />
            ))}
          </div>
        )}
      </main>
    </>
  )
}
