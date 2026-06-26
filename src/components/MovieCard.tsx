import Link from 'next/link'
import { tmdbImage, TMDBMovie } from '@/lib/tmdb'

export default function MovieCard({ movie }: { movie: TMDBMovie }) {
  const year = movie.release_date?.split('-')[0] || '—'
  const rating = movie.vote_average > 0 ? movie.vote_average.toFixed(1) : null

  return (
    <Link
      href={`/movie/${movie.id}`}
      className="group block overflow-hidden rounded-2xl glass-ios hover:scale-[1.03] transition-all duration-500"
    >
      <div className="aspect-[2/3] relative overflow-hidden bg-white/[0.03]">
        {movie.poster_path ? (
          <img
            src={tmdbImage(movie.poster_path, 'w342')}
            alt={movie.title}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/20 text-xs">
            No Poster
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100 transition-opacity duration-500" />
        
        {/* Sinopsis Full (No Truncate) */}
        <div className="absolute inset-0 p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-black/70 backdrop-blur-sm overflow-y-auto hide-scrollbar">
           <p className="text-[10px] leading-snug text-white/90">{movie.overview || 'Tidak ada sinopsis tersedia.'}</p>
        </div>

        {rating && (
          <div className="absolute top-2 left-2 glass-ios rounded-full px-2 py-0.5 text-[10px] flex items-center gap-1 z-10">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="#facc15" className="shrink-0">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            {rating}
          </div>
        )}
      </div>
      <div className="p-3 space-y-0.5">
        <h3 className="text-xs font-medium truncate text-white/80 group-hover:text-white transition-colors">
          {movie.title}
        </h3>
        <p className="text-[10px] text-white/30">{year}</p>
      </div>
    </Link>
  )
}
