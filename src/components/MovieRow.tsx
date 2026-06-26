'use client'
import { useRef, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { TMDBMovie } from '@/lib/tmdb'
import MovieCard from './MovieCard'

export default function MovieRow({
  title,
  movies: initialMovies,
}: {
  title: string
  movies: TMDBMovie[]
}) {
  const rowRef = useRef<HTMLDivElement>(null)
  const [showLeft, setShowLeft] = useState(false)
  const [showRight, setShowRight] = useState(true)

  const updateArrows = () => {
    const el = rowRef.current
    if (!el) return
    setShowLeft(el.scrollLeft > 10)
    setShowRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }

  const scroll = (dir: 'left' | 'right') => {
    if (!rowRef.current) return
    const dist = rowRef.current.clientWidth * 0.75
    rowRef.current.scrollBy({ left: dir === 'left' ? -dist : dist, behavior: 'smooth' })
    setTimeout(updateArrows, 400)
  }

  if (!initialMovies.length) return null

  return (
    <section>
      <div className="flex items-center gap-3 mb-4">
        <h2 className="text-lg font-semibold text-white/90">{title}</h2>
        <span className="text-xs text-white/30">{initialMovies.length} film</span>
      </div>
      <div className="relative group/row" onMouseEnter={updateArrows}>
        {showLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute -left-3 top-0 bottom-0 z-20 flex items-center opacity-0 group-hover/row:opacity-100 transition-opacity"
          >
            <div className="w-9 h-9 rounded-full glass-ios flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
              <ChevronLeft size={18} className="text-white/80" />
            </div>
          </button>
        )}
        <div
          ref={rowRef}
          onScroll={updateArrows}
          className="flex gap-3 overflow-x-auto scroll-smooth pb-3 hide-scrollbar"
        >
          {initialMovies.map(movie => (
            <div key={movie.id} className="min-w-[160px] w-[160px] shrink-0">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
        {showRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute -right-3 top-0 bottom-0 z-20 flex items-center opacity-0 group-hover/row:opacity-100 transition-opacity"
          >
            <div className="w-9 h-9 rounded-full glass-ios flex items-center justify-center shadow-lg cursor-pointer hover:scale-110 transition-transform">
              <ChevronRight size={18} className="text-white/80" />
            </div>
          </button>
        )}
      </div>
    </section>
  )
}
