'use client'
import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import MovieCard from './MovieCard'

interface DbMovieRowProps {
  title: string
  movies: any[]
  link?: string
}

export default function DbMovieRow({ title, movies: initialMovies, link }: DbMovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null)
  const [showLeft, setShowLeft] = useState(false)
  const [showRight, setShowRight] = useState(true)

  const updateArrows = () => {
    const el = rowRef.current
    if (!el) return
    setShowLeft(el.scrollLeft > 10)
    setShowRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10)
  }

  useEffect(() => {
    updateArrows()
  }, [])

  const scroll = (dir: 'left' | 'right') => {
    if (!rowRef.current) return
    const dist = rowRef.current.clientWidth * 0.85
    rowRef.current.scrollBy({ left: dir === 'left' ? -dist : dist, behavior: 'smooth' })
    setTimeout(updateArrows, 400)
  }

  if (!initialMovies?.length) return null

  return (
    <section className="pt-navbar">
      <div className="flex items-center justify-between mb-4 px-4">
        <h2 className="text-lg md:text-xl font-bold text-[var(--text-main)] tracking-tight">{title}</h2>
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
            className="absolute -left-2 md:-left-4 top-0 bottom-0 z-20 flex items-center opacity-0 group-hover/row:opacity-100 transition-opacity duration-200 md:block hidden"
            aria-label="Scroll ke kiri"
          >
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[var(--bg-surface)] border border-[var(--border)] flex items-center justify-center cursor-pointer hover:bg-[var(--border)]/30 hover:border-[var(--accent)] transition-all shadow-lg">
              <ChevronLeft size={18} className="text-[var(--text-muted)]" />
            </div>
          </button>
        )}
        <div
          ref={rowRef}
          onScroll={updateArrows}
          className="flex gap-3 md:gap-4 overflow-x-auto scroll-smooth pb-4 md:pb-5 hide-scrollbar"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {initialMovies.map((movie: any) => (
            <div key={movie.tmdb_id || movie.id} className="min-w-[150px] md:min-w-[170px] w-[150px] md:w-[170px] shrink-0 snap-start">
              <MovieCard movie={movie} />
            </div>
          ))}
        </div>
        {showRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute -right-2 md:-right-4 top-0 bottom-0 z-20 flex items-center opacity-0 group-hover/row:opacity-100 transition-opacity duration-200 md:block hidden"
            aria-label="Scroll ke kanan"
          >
            <div className="w-8 h-8 md:w-9 md:h-9 rounded-full bg-[var(--bg-surface)] border border-[var(--border)] flex items-center justify-center cursor-pointer hover:bg-[var(--border)]/30 hover:border-[var(--accent)] transition-all shadow-lg">
              <ChevronRight size={18} className="text-[var(--text-muted)]" />
            </div>
          </button>
        )}
      </div>
    </section>
  )
}