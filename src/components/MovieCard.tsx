'use client'
import Link from 'next/link'
import { useRef, useState } from 'react'
import { tmdbImage } from '@/lib/tmdb'
import { Play, Star, Film, CalendarDays } from 'lucide-react'

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

  const [hasPoster, setHasPoster] = useState(!!poster)
  const posterRef = useRef<HTMLImageElement>(null)
  const fallbackRef = useRef<HTMLDivElement>(null)

  const handleImageError = () => {
    if (!hasPoster) return
    setHasPoster(false)
    if (posterRef.current) posterRef.current.style.display = 'none'
    if (fallbackRef.current) fallbackRef.current.style.display = 'flex'
  }

  return (
    <Link href={`/${type}/${movieId}`} className="group block focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--accent)]">
      <div className="relative aspect-[2/3] rounded-lg md:rounded-xl overflow-hidden bg-[var(--bg-elevated)] border border-[var(--border)] group-hover:border-[var(--accent)]/50 transition-all duration-300 shadow-sm group-hover:shadow-[0_12px_32px_rgba(0,0,0,0.45)] group-hover:-translate-y-1.5">
        {hasPoster && poster ? (
          <img
            ref={posterRef}
            src={poster}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
            onError={handleImageError}
          />
        ) : null}

        {/* Fallback saat poster gagal */}
        <div
          ref={fallbackRef}
          className={`absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-surface)] ${hasPoster ? 'hidden' : 'flex'}`}
        >
          <Film size={30} className="text-[var(--text-tertiary)]" />
          <span className="text-[11px] text-[var(--text-tertiary)] font-medium">Tanpa Poster</span>
        </div>

        {/* Gradient overlay Netflix (muncul saat hover) */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

        {/* Rating badge (top-left, selalu visible) */}
        {rating && (
          <div className="absolute top-2 left-2 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur border border-white/10 text-white text-[11px] font-semibold">
            <Star size={10} className="text-[var(--accent)] fill-[var(--accent)]" />
            {rating}
          </div>
        )}

        {/* Tahun (top-right) */}
        {year && (
          <div className="absolute top-2 right-2 z-10 inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur border border-white/10 text-white/70 text-[10px] font-medium">
            <CalendarDays size={9} />
            {year}
          </div>
        )}

        {/* Play button tengah (hover) */}
        <div className="absolute inset-0 flex items-center justify-center z-10 opacity-0 group-hover:opacity-100 transition-all duration-300 scale-75 group-hover:scale-100">
          <div className="w-12 h-12 rounded-full bg-[var(--accent)] flex items-center justify-center shadow-lg shadow-black/40 animate-pulse-glow">
            <Play size={20} className="text-[var(--accent-contrast)] fill-current ml-0.5" />
          </div>
        </div>

        {/* Judul di bawah (hover) */}
        <div className="absolute inset-x-0 bottom-0 z-10 p-3 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <p className="text-[13px] font-semibold text-white line-clamp-2 drop-shadow">{title}</p>
        </div>

        {/* Bottom accent bar */}
        <div className="absolute bottom-0 inset-x-0 h-[3px] bg-gradient-to-r from-[var(--accent)] to-transparent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
      </div>
    </Link>
  )
}