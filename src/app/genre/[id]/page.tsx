import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Header from '@/components/Header'
import MovieCard from '@/components/MovieCard'
import { getMoviesByGenre, getGenres } from '@/lib/tmdb'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const id = parseInt((await params).id)
  if (isNaN(id)) return {}
  const { genres } = await getGenres()
  const genreName = genres.find(g => g.id === id)?.name || 'Film'
  return {
    title: `Film ${genreName} | Zenflix`,
    description: `Kumpulan film ${genreName} terbaik di Zenflix. Streaming film ${genreName} kualitas HD tanpa buffering.`,
  }
}

const GENRE_IDS = [28, 12, 16, 35, 80, 99, 18, 10751, 14, 36, 27, 10402, 9648, 10749, 878, 10770, 53, 10752, 37, 10759, 10762, 10763, 10764, 10765, 10766, 10767, 10768, 10770]

export default async function GenrePage({ params }: { params: Promise<{ id: string }> }) {
  const id = parseInt((await params).id)
  if (isNaN(id) || !GENRE_IDS.includes(id)) notFound()

  const [data, genres] = await Promise.all([
    getMoviesByGenre(id),
    getGenres(),
  ])

  const genreName = genres.genres.find(g => g.id === id)?.name || 'Film'

  return (
    <>
      <Header />
      <main className="max-w-[1400px] mx-auto px-4 py-6 md:pt-24">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Film {genreName}</h1>
        <p className="text-sm text-[var(--text-muted)] mb-6">{data.results.length} judul tersedia</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-4">
          {data.results.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </main>
    </>
  )
}