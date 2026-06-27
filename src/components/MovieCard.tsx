import Link from 'next/link'
import { tmdbImage } from '@/lib/tmdb'

export default function MovieCard({ movie }: { movie: any }) {
  const year = movie.release_date?.split('-')[0] || movie.year || movie.first_air_date?.split('-')[0] || '—'
  const rating = movie.vote_average > 0 ? movie.vote_average.toFixed(1) : movie.rating > 0 ? movie.rating.toFixed(1) : null
  const poster = movie.poster_path
    ? tmdbImage(movie.poster_path, 'w342')
    : movie.poster_url?.startsWith('http')
      ? movie.poster_url
      : null
  const movieId = movie.tmdb_id || movie.id
  const type = movie.media_type === 'tv' || movie.first_air_date ? 'tv' : 'movie'

  return (
    <Link href={`/${type}/${movieId}`} className="group block">
      <div className="aspect-[2/3] rounded-xl overflow-hidden glass-card mb-2 relative shadow-lg">
        {poster ? (
          <img
            src={poster}
            alt={movie.title || movie.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-[var(--bg-surface)]">
            <span className="text-xs text-[var(--text-tertiary)]">No Poster</span>
          </div>
        )}
        {rating && (
          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-black/60 text-[10px] font-semibold text-yellow-400 flex items-center gap-0.5">
            ★ {rating}
          </div>
        )}
      </div>
      <p className="text-sm font-medium truncate text-[var(--text-main)] group-hover:text-[var(--accent)] transition-colors">
        {movie.title || movie.name}
      </p>
      <p className="text-[11px] text-[var(--text-tertiary)]">{year}</p>
    </Link>
  )
}
