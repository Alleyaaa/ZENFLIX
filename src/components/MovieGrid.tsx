import MovieCard from './MovieCard'

interface TMDBResult {
  id: number
  title?: string
  name?: string
  poster_path?: string | null
  release_date?: string
  first_air_date?: string
  vote_average?: number
  media_type?: string
}

export default function MovieGrid({ movies }: { movies: TMDBResult[] }) {
  if (!movies || movies.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-[var(--text-muted)]">Belum ada judul di kategori ini. Coba filter lain.</p>
      </div>
    )
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-8 gap-3 md:gap-5 max-w-full">
      {movies.map(movie => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  )
}