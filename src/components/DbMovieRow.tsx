'use client'
import { useRef, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import MovieCard from './MovieCard'

export default function DbMovieRow({
  title,
  movies: initialMovies,
  link,
}: {
  title: string
  movies: any[]
  link?: string
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

  if (!initialMovies?.length) return null

  return (
    <section>
      <div className="flex items-center gap-3 mb-5 px-1">
        <h2 className="text-xl font-bold text-[var(--text-main)] tracking-tight">{title}</h2>
        {link && (
          <Link href={link} className="text-xs text-[var(--accent)] hover:underline opacity-70 hover:opacity-100 transition-opacity">
            Lihat semua →
          </Link>
        )}
      </div>
      <div className="relative group/row" onMouseEnter={updateArrows}>
        {showLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute -left-2 top-0 bottom-0 z-20 flex items-center opacity-0 group-hover/row:opacity-100 transition-opacity duration-200"
          >
            <div className="w-9 h-9 rounded-full bg-[var(--bg-surface)] border border-[var(--border)] flex items-center justify-center cursor-pointer hover:bg-[var(--border)]/30 hover:border-[var(--color-accent)] transition-all">
              <ChevronLeft size={18} className="text-[var(--text-muted)]" />
            </div>
          </button>
        )}
        <div
          ref={rowRef}
          onScroll={updateArrows}
          className="flex gap-3 overflow-x-auto scroll-smooth pb-3 hide-scrollbar"
        >
          {initialMovies.map((movie: any) => (
            <div key={movie.tmdb_id || movie.id} className="min-w-[170px] w-[170px] shrink-0">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
        {showRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute -right-2 top-0 bottom-0 z-20 flex items-center opacity-0 group-hover/row:opacity-100 transition-opacity duration-200"
          >
            <div className="w-9 h-9 rounded-full bg-[var(--bg-surface)] border border-[var(--border)] flex items-center justify-center cursor-pointer hover:bg-[var(--border)]/30 hover:border-[var(--color-accent)] transition-all">
              <ChevronRight size={18} className="text-[var(--text-muted)]" />
            </div>
          </button>
        )}
      </div>
    </section>
  )
}
