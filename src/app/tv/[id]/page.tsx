import Header from '@/components/Header'
import PlayerTV from '@/components/PlayerTV'
import { getTVDetail, tmdbImage } from '@/lib/tmdb'
import { notFound } from 'next/navigation'
import { Calendar, Star } from 'lucide-react'

export default async function TVDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const id = parseInt((await params).id)
  if (isNaN(id)) notFound()

  const tv = await getTVDetail(id)
  const posterUrl = tmdbImage(tv.poster_path || '', 'w500')
  const backdropUrl = tv.backdrop_path ? tmdbImage(tv.backdrop_path, 'original') : null

  return (
    <>
      <Header />
      <div className="relative w-full h-[350px] overflow-hidden">
        {backdropUrl && <img src={backdropUrl} className="w-full h-full object-cover" />}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-primary)] via-transparent" />
      </div>
      <main className="max-w-[1400px] mx-auto px-4 -mt-32 relative z-10 pb-20">
        <div className="flex gap-8 items-start">
          <div className="w-48 hidden md:block shrink-0 glass-ios rounded-2xl overflow-hidden">
            <img src={posterUrl} className="w-full" />
          </div>
          <div className="flex-1">
            <h1 className="text-4xl font-bold gradient-text mb-2">{tv.name}</h1>
            <div className="flex items-center gap-4 text-xs text-white/50 mb-4">
              <span className="flex items-center gap-1.5"><Calendar size={14} /> {tv.first_air_date?.split('-')[0]}</span>
              <span className="flex items-center gap-1.5"><Star size={14} className="text-yellow-400 fill-yellow-400" /> {tv.vote_average.toFixed(1)}</span>
            </div>
            <p className="text-sm text-white/70 max-w-2xl mb-8 leading-relaxed">{tv.overview}</p>
          </div>
        </div>
        <PlayerTV tmdbId={id} seasons={tv.seasons} />
      </main>
    </>
  )
}
