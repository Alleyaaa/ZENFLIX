import { notFound } from 'next/navigation'
import Header from '@/components/Header'
import PlayerSection from '@/components/PlayerSection'
import MovieCard from '@/components/MovieCard'
import { tmdbImage, getMovieDetail } from '@/lib/tmdb'
import { Calendar, Clock, Star } from 'lucide-react'
import Link from 'next/link'

export default async function MovieDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const tmdbId = parseInt((await params).id)
  if (isNaN(tmdbId)) notFound()

  let movie: any = {}
  let cast: any[] = []
  let similar: any[] = []

  try {
    movie = await getMovieDetail(tmdbId)
    cast = movie.credits?.cast?.slice(0, 12) || []
    similar = movie.similar?.results?.slice(0, 12) || []
  } catch {
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const key = process.env.SUPABASE_SERVICE_KEY!
      const hdrs = {}
      hdrs['apikey'] = key
      hdrs['Authorization'] = 'Bearer ' + key
      const r = await fetch(url + '/rest/v1/movies?select=*&tmdb_id=eq.' + tmdbId + '&limit=1', { headers: hdrs })
      const rows = await r.json()
      if (rows?.[0]) {
        movie = {
          title: rows[0].title,
          poster_path: rows[0].poster_url?.replace('https://image.tmdb.org/t/p/w500', '') || null,
          backdrop_path: null,
          overview: null,
          release_date: rows[0].year ? rows[0].year + '-01-01' : null,
          vote_average: rows[0].rating || 0,
          genres: [],
          runtime: 0,
        }
      }
    } catch {}
  }

  const poster = movie.poster_path ? tmdbImage(movie.poster_path, 'w500') : null
  const backdrop = movie.backdrop_path ? tmdbImage(movie.backdrop_path, 'original') : null

  return (
    <>
      <Header />
      <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden">
        {backdrop ? (
          <img src={backdrop} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-[var(--bg-surface)] to-[var(--bg)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/70 to-transparent" />
      </div>

      <div className="max-w-[1400px] mx-auto px-4 -mt-40 relative z-10">
        <div className="flex gap-6 items-end">
          {poster && (
            <div className="w-48 shrink-0 hidden md:block rounded-xl overflow-hidden shadow-2xl border border-white/10">
              <img src={poster} alt={movie.title} className="w-full" />
            </div>
          )}
          <div className="flex-1 min-w-0 py-4">
            <h1 className="text-3xl md:text-5xl font-bold mb-3 gradient-text">{movie.title || 'Unknown'}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--text-muted)] mb-4">
              {movie.release_date && (
                <span className="flex items-center gap-1"><Calendar size={14} />{movie.release_date.split('-')[0]}</span>
              )}
              {movie.runtime > 0 && (
                <span className="flex items-center gap-1"><Clock size={14} />{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
              )}
              {movie.vote_average > 0 && (
                <span className="flex items-center gap-1 glass-card px-2 py-0.5 rounded-full">
                  <Star size={12} className="text-yellow-400 fill-yellow-400" />{movie.vote_average.toFixed(1)}
                </span>
              )}
            </div>
            {movie.genres?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {movie.genres.map((g: any) => (
                  <Link key={g.id} href={`/genre/${g.id}`} className="px-3 py-1 rounded-full text-xs glass-card hover:bg-white/10 transition-all">
                    {g.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto px-4 py-8 space-y-10">
        {movie.overview && (
          <section>
            <h2 className="text-lg font-semibold mb-3">Sinopsis</h2>
            <p className="text-sm leading-relaxed text-[var(--text-muted)] max-w-3xl">{movie.overview}</p>
          </section>
        )}

        <PlayerSection tmdbId={tmdbId} />

        {cast.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-4">Pemeran</h2>
            <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
              {cast.map((p: any) => (
                <div key={p.id} className="text-center shrink-0 w-20">
                  <div className="w-14 h-14 rounded-full overflow-hidden glass-card mb-2 mx-auto">
                    {p.profile_path ? (
                      <img src={tmdbImage(p.profile_path, 'w185')} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-[var(--text-muted)]">?</div>
                    )}
                  </div>
                  <p className="text-xs font-medium truncate">{p.name}</p>
                  <p className="text-[10px] text-[var(--text-tertiary)] truncate">{p.character}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {similar.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-4">Film Serupa</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
              {similar.map((m: any) => (
                <div key={m.id} className="min-w-[140px] w-[140px] shrink-0">
                  <MovieCard movie={m} />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  )
}
