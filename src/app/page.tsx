import Header from '@/components/Header'
import MovieRow from '@/components/MovieRow'
import HeroButtons from '@/components/HeroButtons'
import { getTrending, getNowPlaying, getPopular, getTopRated } from '@/lib/tmdb'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const trending = await getTrending()
  const nowPlaying = await getNowPlaying()
  const popular = await getPopular()
  const topRated = await getTopRated()

  return (
    <>
      <Header />
      <main className="min-h-screen">
        <section className="h-[90vh] flex flex-col items-center justify-center text-center px-4 relative">
          <h1 className="text-5xl md:text-7xl font-black tracking-tighter gradient-text mb-4">ZENFLIX</h1>
          <p className="text-lg md:text-xl text-white/60 mb-8 max-w-2xl">
            Stream the best movies & series in stunning HD, zero buffering.
          </p>
          <HeroButtons />
        </section>

        <div className="max-w-[1400px] mx-auto px-4 space-y-16 py-16">
          <section id="trending"><MovieRow title="Lagi Trending" movies={trending.results} /></section>
          <section id="now-playing"><MovieRow title="Sedang Tayang" movies={nowPlaying.results} /></section>
          <section id="popular"><MovieRow title="Paling Populer" movies={popular.results} /></section>
          <section id="top-rated"><MovieRow title="Rating Tertinggi" movies={topRated.results} /></section>
        </div>
      </main>
    </>
  )
}
