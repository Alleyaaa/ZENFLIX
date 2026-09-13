'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import HeroSlider from '@/components/HeroSlider'
import DbMovieRow from '@/components/DbMovieRow'
import DbMovieRowSkeleton from '@/components/DbMovieRowSkeleton'
import Footer from '@/components/Footer'
import PlayerModal from '@/components/PlayerModal'
import { AdBanner, NativeAd } from '@/components/AdsterraAds'

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

export default function HomePage() {
  const [trending, setTrending] = useState<Movie[]>([])
  const [nowPlaying, setNowPlaying] = useState<Movie[]>([])
  const [popular, setPopular] = useState<Movie[]>([])
  const [topRated, setTopRated] = useState<Movie[]>([])
  const [loading, setLoading] = useState(true)
  const [playModal, setPlayModal] = useState<Movie | null>(null)

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

    return (
      <>
        <Header />
        <main className="min-h-screen">
          {/* HERO: full screen, backdrop -> trailer after 2s, swipe/arrows to change */}
          {!loading && heroMovies.length > 0 && (
                    <HeroSlider movies={heroMovies} onPlay={(m) => setPlayModal(m)} />
                  )}
                  {loading && (
                    <section className="relative w-full h-[88vh] min-h-[560px] max-h-[900px] overflow-hidden select-none bg-black">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-black/30" />
                      <div className="relative z-10 h-full max-w-[1400px] mx-auto px-4 md:px-8 flex flex-col justify-end pb-28 md:pb-32">
                        <div className="max-w-2xl space-y-4">
                          <div className="flex items-center gap-2">
                            <div className="w-20 h-5 skeleton rounded-full" />
                            {Array.from({length: 2}).map((_, i) => (
                              <div key={i} className="w-16 h-5 skeleton rounded-full" />
                            ))}
                          </div>
                          <div className="h-10 w-3/4 skeleton rounded" />
                          <div className="h-6 w-1/2 skeleton rounded" />
                          <div className="h-6 w-1/3 skeleton rounded" />
                          <div className="flex gap-3 pt-4">
                            <div className="w-32 h-10 skeleton rounded-full" />
                            <div className="w-24 h-10 skeleton rounded-full" />
                          </div>
                        </div>
                      </div>
                    </section>
                  )}

        {/* CONTENT ROWS */}
        <div className="max-w-[1400px] mx-auto px-4 py-12 space-y-12">
          {loading ? (
            <>
              <DbMovieRowSkeleton />
              <DbMovieRowSkeleton />
              <DbMovieRowSkeleton />
              <DbMovieRowSkeleton />
            </>
          ) : (
            <>
              {nowPlaying.length > 0 && (
                <DbMovieRow title="Sedang Tayang" movies={nowPlaying.slice(0, 20)} link="/category/now_playing" />
              )}
              {popular.length > 0 && (
                <DbMovieRow title="Paling Populer" movies={popular.slice(0, 20)} link="/category/popular" />
              )}
              {topRated.length > 0 && (
                <DbMovieRow title="Rating Tertinggi" movies={topRated.slice(0, 20)} link="/category/top_rated" />
              )}
              {trending.length > 0 && (
                              <DbMovieRow title="Trending Minggu Ini" movies={trending.slice(0, 20)} link="/category/trending" />
                            )}

                            {/* Ads di antara konten */}
                            <AdBanner format="300x250" className="mx-auto my-4" />
                            <NativeAd className="my-6" />

                            {trending.length > 0 && (
                              <DbMovieRow title="Rekomendasi Untukmu" movies={trending.slice(3, 23)} link="/category/trending" />
                            )}
                          </>
                        )}
        </div>

        <Footer />
      </main>

      {/* PLAYER MODAL */}
      {playModal && (
        <PlayerModal
          movie={playModal}
          onClose={() => setPlayModal(null)}
        />
      )}
    </>
  )
}