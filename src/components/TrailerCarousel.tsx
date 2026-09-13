'use client'
import { useEffect, useRef, useState } from 'react'
import { Play, ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

interface TrailerItem {
  id: number
  tmdb_id?: number
  title: string
  name?: string
  backdrop_path?: string | null
  overview?: string
}

interface TrailerCarouselProps {
  movies: TrailerItem[]
  onSelect: (movie: TrailerItem) => void
}

export default function TrailerCarousel({ movies, onSelect }: TrailerCarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [keys, setKeys] = useState<Record<number, string>>({})
  const [loadingKey, setLoadingKey] = useState<number | null>(null)

  // Fetch YouTube trailer key per movie
  useEffect(() => {
    let cancelled = false
    movies.slice(0, 6).forEach(async (m) => {
      const id = m.tmdb_id || m.id
      if (keys[id]) return
      try {
        const res = await fetch(`/api/trailer?tmdb_id=${id}`)
        const data = await res.json()
        if (!cancelled && data.key) {
          setKeys(prev => ({ ...prev, [id]: data.key }))
        }
      } catch { /* silent */ }
    })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [movies])

  const scroll = (dir: 1 | -1) => {
    const el = scrollRef.current
    if (!el) return
    const cardW = 320
    el.scrollBy({ left: dir * cardW * 2, behavior: 'smooth' })
  }

  return (
    <div className="relative w-full">
      {/* Scroll container */}
      <div
        ref={scrollRef}
        className="flex gap-4 overflow-x-auto snap-x snap-mandatory pb-4 scrollbar-hide"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        onScroll={(e) => {
          const el = e.currentTarget
          const idx = Math.round(el.scrollLeft / 320)
          setActiveIndex(Math.min(idx, movies.length - 1))
        }}
      >
        {movies.slice(0, 8).map((m) => {
          const id = m.tmdb_id || m.id
          const key = keys[id]

          return (
            <div
              key={id}
              className="snap-start shrink-0 w-[300px] md:w-[320px] relative rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--bg-surface)]"
            >
              <div className="relative aspect-video bg-black">
                {key ? (
                  <iframe
                    src={`https://www.youtube-nocookie.com/embed/${key}?autoplay=0&mute=1&controls=1&rel=0&modestbranding=1`}
                    title={m.title || m.name}
                    className="w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                    sandbox="allow-scripts allow-same-origin allow-presentation"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[var(--bg-elevated)] to-[var(--bg-surface)]">
                    <Loader2 className="w-8 h-8 text-[var(--accent)] animate-spin" />
                  </div>
                )}
              </div>
              <div className="p-3">
                <h3 className="text-sm font-semibold truncate text-[var(--text-main)]">
                  {m.title || m.name}
                </h3>
                <button
                  onClick={() => onSelect(m)}
                  className="mt-2 w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-[var(--accent)] text-sm font-medium transition-all hover:opacity-90"
                  style={{ color: 'var(--accent-contrast)' }}
                >
                  <Play size={14} />
                  Putar Sekarang
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {/* Nav arrows */}
      <button
        onClick={() => scroll(-1)}
        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-4 w-10 h-10 rounded-full bg-black/60 backdrop-blur border border-white/10 flex items-center justify-center text-white hover:bg-black/80 transition-all z-10 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        aria-label="Previous trailers"
      >
        <ChevronLeft size={20} />
      </button>
      <button
        onClick={() => scroll(1)}
        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-4 w-10 h-10 rounded-full bg-black/60 backdrop-blur border border-white/10 flex items-center justify-center text-white hover:bg-black/80 transition-all z-10 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
        aria-label="Next trailers"
      >
        <ChevronRight size={20} />
      </button>

      {/* Dots */}
      <div className="flex justify-center gap-1.5 mt-2">
        {movies.slice(0, 8).map((m, i) => (
          <button
            key={m.id}
            onClick={() => {
              const el = scrollRef.current
              if (el) el.scrollTo({ left: i * 320, behavior: 'smooth' })
            }}
            className={`w-2 h-2 rounded-full transition-all ${
              i === activeIndex ? 'bg-[var(--accent)] w-5' : 'bg-white/30 hover:bg-white/50'
            }`}
            aria-label={`Go to trailer ${i + 1}`}
            style={i === activeIndex ? { background: 'var(--accent)' } : {}}
          />
        ))}
      </div>
    </div>
  )
}