import Header from '@/components/Header'
import PlayerSection from '@/components/PlayerSection'
import MovieCard from '@/components/MovieCard'
import { getMovieDetail, tmdbImage } from '@/lib/tmdb'
import { notFound } from 'next/navigation'
import { Calendar, Clock, Star } from 'lucide-react'
import Link from 'next/link'

export default async function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const id = parseInt((await params).id)
  if (isNaN(id)) notFound()

  const movie = await getMovieDetail(id)
  const cast = movie.credits?.cast?.slice(0, 12) || []
  const similar = movie.similar?.results?.slice(0, 12) || []

  const posterUrl = tmdbImage(movie.poster_path || '', 'w500')
  const backdropUrl = movie.backdrop_path ? tmdbImage(movie.backdrop_path, 'original') : null

  return (
    <>
      <Header />
      <div className="relative w-full h-[350px] md:h-[450px] overflow-hidden">
        {backdropUrl ? (
          <img src={backdropUrl} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-[var(--bg-secondary)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-[var(--bg-primary)]/80 to-transparent" />

        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10 max-w-[1400px] mx-auto">
          <div className="flex items-end gap-5">
            <div className="w-24 md:w-36 shrink-0 rounded-xl overflow-hidden shadow-2xl hidden sm:block glass-ios">
              <img src={posterUrl} alt={movie.title} className="w-full" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl md:text-4xl font-bold mb-2 gradient-text">{movie.title}</h1>
              <div className="flex flex-wrap items-center gap-3 text-xs text-white/40 mb-3">
                {movie.release_date && (
                  <span className="flex items-center gap-1">
                    <Calendar size={12} />
                    {new Date(movie.release_date).getFullYear()}
                  </span>
                )}
                {movie.runtime > 0 && (
                  <span className="flex items-center gap-1">
                    <Clock size={12} />
                    {Math.floor(movie.runtime / 60)}j {movie.runtime % 60}m
                  </span>
                )}
                {movie.vote_average > 0 && (
                  <span className="flex items-center gap-1 glass-ios px-2 py-0.5 rounded-full">
                    <Star size={10} className="text-yellow-400 fill-yellow-400" />
                    {movie.vote_average.toFixed(1)}
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {movie.genres?.map((g: any) => (
                  <Link key={g.id} href={`/genre/${g.id}`} className="px-2.5 py-1 rounded-full text-[10px] glass-ios hover:bg-white/[0.06] transition-all">
                    {g.name}
                  </Link>
                ))}
              </div>
              <p className="text-xs leading-relaxed text-white/50 max-w-2xl line-clamp-2">{movie.overview}</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto px-4 py-6">
        <PlayerSection tmdbId={id} />

        {cast.length > 0 && (
          <div className="mb-10">
            <h2 className="text-base font-semibold mb-4 text-white/80">Pemeran</h2>
            <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
              {cast.map((person: any) => (
                <div key={person.id} className="text-center shrink-0 w-20">
                  <div className="w-14 h-14 rounded-full overflow-hidden glass-ios mb-2 mx-auto">
                    {person.profile_path ? (
                      <img src={tmdbImage(person.profile_path, 'w185')} alt={person.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-white/30 bg-white/[0.03]">?</div>
                    )}
                  </div>
                  <p className="text-xs font-medium truncate text-white/70">{person.name}</p>
                  <p className="text-[10px] text-white/30 truncate">{person.character}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {similar.length > 0 && (
          <div className="mb-10">
            <h2 className="text-base font-semibold mb-4 text-white/80">Film Serupa</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
              {similar.map((m: any) => (
                <div key={m.id} className="min-w-[140px] w-[140px] shrink-0">
                  <MovieCard movie={m} />
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </>
  )
}
