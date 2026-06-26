import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import MovieCard from '@/components/MovieCard'
import { getMoviesByGenre, getGenres } from '@/lib/tmdb'

export default async function GenrePage({ params }: { params: Promise<{ id: string }> }) {
  const id = parseInt((await params).id)
  if (isNaN(id)) notFound()

  const [data, genres] = await Promise.all([
    getMoviesByGenre(id),
    getGenres(),
  ])

  const genreName = genres.genres.find(g => g.id === id)?.name || 'Unknown'

  return (
    <>
      <Header />
      <main className="max-w-[1400px] mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">{genreName}</h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-4">
          {data.results.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      </main>
    </>
  )
}
