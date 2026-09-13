'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { tmdbImage } from '@/lib/tmdb'
import { Play, Info, ChevronLeft, ChevronRight, Star, Clock } from 'lucide-react'
import Link from 'next/link'

interface Movie {
  id: number
  tmdb_id?: number
  title: string
  name?: string
  poster_path?: string | null
  backdrop_path?: string | null
  release_date?: string
  first_air_date?: string
  overview?: string
  vote_average?: number
  media_type?: string
}

interface Props {
  movies: Movie[]
  onPlay: (m: Movie) => void
}

export default function HeroSlider({ movies, onPlay }: Props) {
  const [index, setIndex] = useState(0)
  const [videoKeys, setVideoKeys] = useState<Record<number, string | null>>({})
  const [playVideo, setPlayVideo] = useState<Record<number, boolean>>({})
  const [dragX, setDragX] = useState<number | null>(null)
  const [dragging, setDragging] = useState(false)
  const [showTrailer, setShowTrailer] = useState(false) // trailer HANYA jika user klik "Putar Sekarang"

  const hero = movies[index]
  const heroBackdrop = hero?.backdrop_path ? tmdbImage(hero.backdrop_path, 'original') : null

  // Pre-fetch trailer keys (untuk tombol Putar Sekarang)
  useEffect(() => {
    let cancelled = false
    const ids = [index, (index + 1) % movies.length, (index - 1 + movies.length) % movies.length]
    ids.forEach(i => {
      const m = movies[i]
      if (!m || videoKeys[m.id] !== undefined) return
      fetch(`/api/trailer?tmdb_id=${m.tmdb_id || m.id}`)
        .then(r => r.json())
        .then(d => { if (!cancelled) setVideoKeys(p => ({ ...p, [m.id]: d.key || null })) })
        .catch(() => {})
    })
    return () => { cancelled = true }
  }, [index, movies])

  // TIDAK auto-slide. User yang geser (arrow/drag/dots).
  // Reset trailer saat pindah slide.
  const goNext = useCallback(() => {
    setShowTrailer(false)
    setIndex(i => (i + 1) % movies.length)
  }, [movies.length])
  const goPrev = useCallback(() => {
    setShowTrailer(false)
    setIndex(i => (i - 1 + movies.length) % movies.length)
  }, [movies.length])

  const onDragStart = useCallback((x: number) => { setDragX(x); setDragging(true) }, [])
  const onDragEnd = useCallback((x: number) => {
    if (dragX === null) return setDragging(false)
    const d = dragX - x
    if (Math.abs(d) > 70) d > 0 ? goNext() : goPrev()
    setDragX(null); setDragging(false)
  }, [dragX, goNext, goPrev])

  if (!hero) return null
  const vk = videoKeys[hero.id]
  const isPlaying = playVideo[hero.id] && !!vk
  const type = hero.media_type === 'tv' || hero.first_air_date ? 'tv' : 'movie'
  const title = hero.title || hero.name || 'Untitled'
  const year = hero.release_date?.split('-')[0] || hero.first_air_date?.split('-')[0] || ''
  const rating = hero.vote_average ? hero.vote_average.toFixed(1) : null

  // Putar Sekarang: play trailer dalam modal-ish overlay (tidak menimpa poster)
  const handlePlay = (m: Movie) => {
    // Kalau ada trailer key → tampilkan trailer di hero
    if (videoKeys[m.id]) {
      setShowTrailer(true)
      setPlayVideo(p => ({ ...p, [m.id]: true }))
    } else {
      // Tidak ada trailer → langsung buka halaman detail/player
      onPlay(m)
    }
  }

  return (
    <section
      className="relative w-full h-[88vh] min-h-[560px] max-h-[900px] overflow-hidden select-none bg-black"
      onMouseDown={(e) => onDragStart(e.clientX)}
      onMouseMove={() => dragging && setDragX(dragX)}
      onMouseUp={(e) => onDragEnd(e.clientX)}
      onMouseLeave={(e) => dragging && onDragEnd(e.clientX)}
      onTouchStart={e => onDragStart(e.touches[0].clientX)}
      onTouchMove={() => {}}
      onTouchEnd={e => onDragEnd(e.changedTouches[0].clientX)}
      aria-label="Film unggulan"
    >
      {/* Backdrop (poster) — selalu tampil sebagai dasar */}
      <div
        key={hero.id}
        className="absolute inset-0 bg-cover bg-center transition-transform duration-700"
        style={{ backgroundImage: heroBackdrop ? `url(${heroBackdrop})` : undefined }}
      />

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/40 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-transparent to-black/30" />

      {/* Trailer — tampil DI ATAS poster hanya saat tombol Putar ditekan,
          dan video tidak full (ada konten info di bawah) */}
      {showTrailer && isPlaying && vk ? (
        <div className="absolute inset-0 z-10">
          <iframe
            src={`https://www.youtube.com/embed/${vk}?autoplay=1&rel=0&playsinline=1`}
            className="w-full h-full"
            allow="autoplay; fullscreen; encrypted-media"
            allowFullScreen
            title="Trailer"
            onLoad={() => {}}
          />
          {/* Overlay klik buat close trailer → balik ke poster */}
          <button
            onClick={() => { setShowTrailer(false); setPlayVideo(p => ({ ...p, [hero.id]: false })) }}
            className="absolute top-4 right-4 z-20 px-4 py-2 rounded-full bg-black/70 text-white text-sm font-semibold hover:bg-black/90 transition-all"
            aria-label="Tutup trailer"
          >
            ✕ Tutup Trailer
          </button>
        </div>
      ) : null}

      {/* Konten info — selalu di atas (z-20), biar trailer ga ketimpa */}
      <div className={`relative z-20 h-full max-w-[1400px] mx-auto px-4 md:px-8 flex flex-col justify-end pb-28 md:pb-32 ${showTrailer ? 'opacity-90' : ''}`}>
        <div className="max-w-2xl">
          {/* Badge kategori */}
          <div className="flex items-center gap-2 mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent)]/15 border border-[var(--accent)]/30 text-[var(--accent)] text-[11px] font-bold uppercase tracking-wider">
              {type === 'tv' ? 'Series' : 'Film'}
            </span>
            {rating && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur border border-white/10 text-white text-xs font-medium">
                <Star size={12} className="text-[var(--accent)] fill-[var(--accent)]" />
                {rating}
              </span>
            )}
            {year && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/10 backdrop-blur border border-white/10 text-white/80 text-xs font-medium">
                <Clock size={12} />
                {year}
              </span>
            )}
          </div>

          {/* Judul */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-white mb-4 drop-shadow-2xl">
            {title}
          </h1>

          {/* Sinopsis */}
          {hero.overview && (
            <p className="text-white/85 text-sm md:text-base leading-relaxed line-clamp-3 max-w-xl mb-6 drop-shadow-lg">
              {hero.overview}
            </p>
          )}

          {/* CTA */}
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => handlePlay(hero)}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-white text-black font-bold text-sm hover:bg-[var(--accent)] hover:text-[var(--accent-contrast)] transition-all duration-300 shadow-lg shadow-black/30 hover:scale-[1.03] active:scale-95"
            >
              <Play size={18} className="fill-current" />
              {showTrailer && isPlaying ? 'Putar Ulang' : 'Putar Sekarang'}
            </button>
            <Link
              href={`/${type}/${hero.tmdb_id || hero.id}`}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-white/15 backdrop-blur border border-white/20 text-white font-semibold text-sm hover:bg-white/25 transition-all duration-300"
            >
              <Info size={17} />
              Detail
            </Link>
          </div>
        </div>
      </div>

      {/* Arrow controls (manual, no auto) */}
      <button
        onClick={goPrev}
        className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/40 backdrop-blur border border-white/10 text-white items-center justify-center hover:bg-black/70 hover:scale-110 transition-all"
        aria-label="Sebelumnya"
      >
        <ChevronLeft size={22} />
      </button>
      <button
        onClick={goNext}
        className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-black/40 backdrop-blur border border-white/10 text-white items-center justify-center hover:bg-black/70 hover:scale-110 transition-all"
        aria-label="Berikutnya"
      >
        <ChevronRight size={22} />
      </button>

      {/* Indicator dots (manual) */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
        {movies.slice(0, 8).map((m, i) => (
          <button
            key={m.id}
            onClick={() => { setShowTrailer(false); setIndex(i) }}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === index ? 'w-10 bg-[var(--accent)]' : 'w-3 bg-white/30 hover:bg-white/60'
            }`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  )
}