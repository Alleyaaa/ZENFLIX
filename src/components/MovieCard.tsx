import Link from 'next/link'
import { tmdbImage } from '@/lib/tmdb'
import { Film } from 'lucide-react'

interface TMDBMovie {
  id: number
  tmdb_id?: number
  title?: string
  name?: string
  poster_path?: string | null
  backdrop_path?: string | null
  poster_url?: string | null
  release_date?: string
  first_air_date?: string
  vote_average?: number
  rating?: number
  media_type?: string
  year?: string | number
}

export default function MovieCard({ movie }: { movie: TMDBMovie }) {
  const year = movie.release_date?.split('-')[0] || movie.first_air_date?.split('-')[0] || movie.year || null
  const vote = movie.vote_average ?? movie.rating ?? 0
  const rating = vote > 0 ? vote.toFixed(1) : null
  const poster = movie.poster_path
    ? tmdbImage(movie.poster_path, 'w342')
    : movie.poster_url?.startsWith('http')
      ? movie.poster_url
      : null
  const movieId = movie.tmdb_id ?? movie.id
  const type = movie.media_type === 'tv' || movie.first_air_date ? 'tv' : 'movie'
  const title = movie.title || movie.name || 'Untitled'

  return (
    <Link href={`/${type}/${movieId}`} className="group block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]">
      <div className="aspect-[2/3] rounded-xl overflow-hidden bg-[var(--bg-elevated)] mb-2 relative border border-[var(--border)] shadow-sm group-hover:shadow-lg transition-all group-hover:border-[var(--border-strong)]">
        {poster ? (
          <img
            src={poster}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
            loading="lazy"
            onError={(e) => {
              // Fallback saat poster gagal dimuat (R-38: placeholder jujur)
              const el = e.currentTarget
              el.style.display = 'none'
              el.parentElement?.classList.add('poster-fallback')
            }}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-[var(--bg-elevated)]">
            <Film size={28} className="text-[var(--text-tertiary)]" />
            <span className="text-[11px] text-[var(--text-tertiary)]">Tanpa Poster</span>
          </div>
        )}
        {rating && (
          <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded-md bg-black/70 text-[10px] font-semibold text-[#f5c518] flex items-center gap-0.5">
            ★ {rating}
          </div>
        )}
      </div>
      <p className="text-sm font-medium truncate text-[var(--text-main)] group-hover:text-[var(--accent)] transition-colors">
        {title}
      </p>
      {year && (
        <p className="text-[11px] text-[var(--text-tertiary)]">{year}</p>
      )}
    </Link>
  )
}