'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import DbMovieRow from '@/components/DbMovieRow'
import DbMovieRowSkeleton from '@/components/DbMovieRowSkeleton'
import AdSlot from '@/components/AdSlot'
import Link from 'next/link'
import { tmdbImage } from '@/lib/tmdb'
import { Play, ChevronRight } from 'lucide-react'

interface Movie {
  id: number
  tmdb_id?: number
  title: string
  name?: string
  poster_path?: string | null
  backdrop_path?: string | null
  release_date?: string
  first_air_date?: string
  vote_average?: number
  media_type?: string
  overview?: string
}

interface Genre {
  id: number
  name: string
}

const GENRES: Genre[] = [
  { id: 28, name: 'Aksi' }, { id: 12, name: 'Petualangan' }, { id: 16, name: 'Animasi' },
  { id: 35, name: 'Komedi' }, { id: 80, name: 'Kejahatan' }, { id: 99, name: 'Dokumenter' },
  { id: 18, name: 'Drama' }, { id: 10751, name: 'Keluarga' }, { id: 14, name: 'Fantasi' },
  { id: 36, name: 'Sejarah' }, { id: 27, name: 'Horor' }, { id: 10402, name: 'Musik' },
  { id: 9648, name: 'Misteri' }, { id: 10749, name: 'Romantis' }, { id: 878, name: 'Sci-Fi' },
  { id: 10770, name: 'TV Movie' }, { id: 53, name: 'Thriller' }, { id: 10752, name: 'Perang' },
  { id: 37, name: 'Western' },
]

export default function HomePage() {
  const [trending, setTrending] = useState<Movie[]>([])
  const [nowPlaying, setNowPlaying] = useState<Movie[]>([])
  const [popular, setPopular] = useState<Movie[]>([])
  const [topRated, setTopRated] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [heroIndex, setHeroIndex] = useState(0)

  useEffect(() => {
    let cancelled = false
    Promise.all([
      fetch('/api/trending').then(r => r.json()),
      fetch('/api/movies?category=now_playing&page=1').then(r => r.json()),
      fetch('/api/movies?category=popular&page=1').then(r => r.json()),
      fetch('/api/movies?category=top_rated&page=1').then(r => r.json()),
    ])
      .then(([trend, now, pop, top]) => {
        if (cancelled) return
        setTrending(trend.results || [])
        setNowPlaying(now.results || [])
        setPopular(pop.results || [])
        setTopRated(top.results || [])
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const heroMovies = [...trending, ...nowPlaying].filter(m => m.backdrop_path)
  const hero = heroMovies[heroIndex] || null
  const heroBackdrop = hero?.backdrop_path ? tmdbImage(hero.backdrop_path, 'original') : null

  // Rotate hero every 8 seconds (MOTION 1: subtle, purposeful)
  useEffect(() => {
    if (heroMovies.length <= 1) return
    const timer = setInterval(() => {
      setHeroIndex(prev => (prev + 1) % heroMovies.length)
    }, 8000)
    return () => clearInterval(timer)
  }, [heroMovies.length])

  return (
    <>
      <Header />
      <main className="min-h-screen">
        {/* HERO: 1 focal point, dinamis dari trending */}
        {hero ? (
          <section className="relative h-[75vh] min-h-[460px] max-h-[700px] flex items-end overflow-hidden">
            {heroBackdrop && (
              <>
                <img src={heroBackdrop} alt="" className="absolute inset-0 w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/65 to-[var(--bg)]/25" />
                <div className="absolute inset-0 bg-gradient-to-r from-[var(--bg)]/70 via-transparent to-transparent" />
              </>
            )}
            <div className="relative z-10 max-w-[1400px] mx-auto px-4 pb-12 md:pb-16 w-full">
              <div className="max-w-2xl">
                <span className="inline-block px-3 py-1 rounded-md bg-[var(--accent)] text-xs font-bold mb-4 uppercase tracking-wide" style={{ color: 'var(--accent-contrast)' }}>
                  Trending
                </span>
                <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-3 leading-tight">
                  {hero.title || hero.name}
                </h1>
                {(hero.release_date || hero.first_air_date) && (
                  <p className="text-sm text-white/80 mb-2">
                    {(hero.release_date || hero.first_air_date || '').split('-')[0]}
                  </p>
                )}
                {hero.overview && (
                  <p className="text-base text-white/80 mb-6 max-w-xl line-clamp-3 hidden md:block">
                    {hero.overview}
                  </p>
                )}
                <div className="flex gap-3 flex-wrap">
                  <Link
                    href={`/movie/${hero.tmdb_id || hero.id}`}
                    className="btn-primary text-base px-8 py-3 inline-flex items-center gap-2"
                    style={{
                      background: 'var(--accent)',
                      color: 'var(--accent-contrast)',
                      borderRadius: 12,
                      fontWeight: 700,
                      boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
                    }}
                  >
                    <Play size={18} /> Putar Sekarang
                  </Link>
                  <Link
                    href={`/movie/${hero.tmdb_id || hero.id}`}
                    className="inline-flex items-center gap-2 px-8 py-3 rounded-[12px] font-semibold bg-white/15 backdrop-blur border border-white/20 text-white hover:bg-white/25 transition-all"
                  >
                    Lihat Detail
                  </Link>
                </div>
              </div>
            </div>
          </section>
        ) : (
          <section className="h-[60vh] flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4 gradient-text leading-none">ZENFLIX</h1>
              <p className="text-lg text-[var(--text-muted)]">Stream film & series dalam kualitas HD.</p>
            </div>
          </section>
        )}

        {/* CONTENT ROWS */}
        <div className="max-w-[1400px] mx-auto px-4 py-10 space-y-12">
          {loading ? (
            <>
              <DbMovieRowSkeleton />
              <DbMovieRowSkeleton />
              <DbMovieRowSkeleton />
              <DbMovieRowSkeleton />
            </>
          ) : (
            <>
              {trending.length > 0 && (
                <DbMovieRow title="Trending Minggu Ini" movies={trending.slice(0, 15)} link="/category/trending" />
              )}
              {nowPlaying.length > 0 && (
                <DbMovieRow title="Sedang Tayang" movies={nowPlaying.slice(0, 15)} link="/category/now_playing" />
              )}
              {popular.length > 0 && (
                <DbMovieRow title="Paling Populer" movies={popular.slice(0, 15)} link="/category/popular" />
              )}
              {topRated.length > 0 && (
                <DbMovieRow title="Rating Tertinggi" movies={topRated.slice(0, 15)} link="/category/top_rated" />
              )}
            </>
          )}
        </div>

        {/* GENRE EXPLORER: struktur nyaman, bukan grid template */}
        {!loading && (
          <section className="max-w-[1400px] mx-auto px-4 pb-14">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-2xl font-bold tracking-tight">Jelajahi Genre</h2>
              <Link href="/category/popular" className="text-sm text-[var(--accent)] hover:underline inline-flex items-center gap-1">
                Lihat semua <ChevronRight size={14} />
              </Link>
            </div>
            <div className="flex flex-wrap gap-2">
              {GENRES.map((g) => (
                <Link
                  key={g.id}
                  href={`/genre/${g.id}`}
                  className="px-4 py-2 rounded-lg glass-btn text-sm hover:border-[var(--accent)] hover:text-[var(--accent)] transition-all"
                >
                  {g.name}
                </Link>
              ))}
            </div>
          </section>
        )}
      </main>
    </>
  )
}