import { getTVDetail, getPopular } from '@/lib/tmdb'
import type { Metadata } from 'next'
import Header from '@/components/Header'
import MovieCard from '@/components/MovieCard'
import TVEpisodePicker from '@/components/TVEpisodePicker'
import AdSlot from '@/components/AdSlot'
import { notFound } from 'next/navigation'
import { Calendar, Clock, Star, Tv } from 'lucide-react'
import Link from 'next/link'

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const tmdbId = parseInt((await params).id)
  if (isNaN(tmdbId)) return {}
  try {
    const show: any = await getTVDetail(tmdbId)
    const year = show.first_air_date?.split('-')[0] || ''
    return {
      title: `${show.name || 'Series'} (${year}) | Zenflix`,
      description: show.overview?.slice(0, 160) || `Nonton series ${show.name} di Zenflix.`,
      openGraph: {
        title: `${show.name || 'Series'} (${year}) | Zenflix`,
        description: show.overview?.slice(0, 160),
        type: 'video.tv_show',
      },
    }
  } catch {
    return {}
  }
}

export default async function TVDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const tmdbId = parseInt((await params).id)
  if (isNaN(tmdbId)) notFound()

  let show: any = {}
  let cast: any[] = []
  let similar: any[] = []
  let recommendations: any[] = []

  try {
    show = await getTVDetail(tmdbId)
    cast = show.credits?.cast?.slice(0, 12) || []
    similar = show.similar?.results?.slice(0, 12) || []
    const pop = await getPopular()
    recommendations = pop.results?.slice(0, 10) || []
  } catch {
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const key = process.env.SUPABASE_SERVICE_KEY!
      const hdrs: Record<string, string> = {}
      hdrs['apikey'] = key
      hdrs['Authorization'] = 'Bearer ' + key
      const r = await fetch(url + '/rest/v1/movies?select=*&tmdb_id=eq.' + tmdbId + '&limit=1', { headers: hdrs })
      const rows = await r.json()
      if (rows?.[0]) {
        show = {
          name: rows[0].title,
          poster_path: rows[0].poster_url?.replace('https://image.tmdb.org/t/p/w500', '') || null,
          backdrop_path: null,
          overview: null,
          first_air_date: rows[0].year ? rows[0].year + '-01-01' : null,
          vote_average: rows[0].rating || 0,
          genres: [],
          seasons: [],
        }
      }
    } catch {}
  }

  const seasons = show.seasons || []
  const poster = show.poster_path ? 'https://image.tmdb.org/t/p/w500' + show.poster_path : null
  const backdrop = show.backdrop_path ? 'https://image.tmdb.org/t/p/original' + show.backdrop_path : null

  return (
    <>
      <Header />
      <div className="relative w-full h-[400px] md:h-[500px] overflow-hidden cinema-backdrop">
        {backdrop ? (
          <img src={backdrop} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-[var(--bg-surface)] to-[var(--bg)]" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg)] via-[var(--bg)]/70 to-transparent" />
      </div>

      <div className="max-w-[1400px] mx-auto px-4 -mt-40 relative z-10">
        <div className="flex gap-6 items-end">
          {poster && (
            <div className="w-48 shrink-0 hidden md:block rounded-xl overflow-hidden shadow-2xl border border-[var(--border)]">
              <img src={poster} alt={show.name} className="w-full" />
            </div>
          )}
          <div className="flex-1 min-w-0 py-4">
            <h1 className="text-3xl md:text-5xl font-bold mb-3">{show.name || 'Unknown'}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm text-[var(--text-muted)] mb-4">
              {show.first_air_date && (
                <span className="flex items-center gap-1"><Calendar size={14} />{show.first_air_date.split('-')[0]}</span>
              )}
              {show.number_of_seasons > 0 && (
                <span className="flex items-center gap-1"><Tv size={14} />{show.number_of_seasons} Season</span>
              )}
              {show.vote_average > 0 && (
                <span className="flex items-center gap-1 glass-card px-2 py-0.5 rounded-full">
                  <Star size={12} className="text-[var(--accent)] fill-[var(--accent)]" />{show.vote_average.toFixed(1)}
                </span>
              )}
            </div>
            {show.genres?.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {show.genres.map((g: any) => (
                  <Link key={g.id} href={'/genre/' + g.id} className="px-3 py-1 rounded-full text-xs glass-card hover:bg-[var(--bg-elevated)] transition-all">
                    {g.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <main className="max-w-[1400px] mx-auto px-4 py-8 space-y-10">
        {show.overview && (
          <section>
            <h2 className="text-lg font-semibold mb-3">Sinopsis</h2>
            <p className="text-sm leading-relaxed text-[var(--text-muted)] max-w-3xl">{show.overview}</p>
          </section>
        )}

        {/* Season & Episode picker + player */}
        <section>
          <TVEpisodePicker tmdbId={tmdbId} seasons={seasons} />
        </section>

        <AdSlot slot="player_pre_roll" format="leaderboard" />

        {cast.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-4">Pemeran</h2>
            <div className="flex gap-4 overflow-x-auto pb-2 hide-scrollbar">
              {cast.map((p: any) => (
                <div key={p.id} className="text-center shrink-0 w-20">
                  <div className="w-14 h-14 rounded-full overflow-hidden glass-card mb-2 mx-auto">
                    {p.profile_path ? (
                      <img src={'https://image.tmdb.org/t/p/w185' + p.profile_path} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-[var(--text-muted)]">?</div>
                    )}
                  </div>
                  <p className="text-xs font-medium truncate">{p.name}</p>
                  <p className="text-[10px] text-[var(--text-tertiary)] truncate">{p.character}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {similar.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-4">Series Serupa</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
              {similar.map((m: any) => (
                <div key={m.id} className="min-w-[140px] w-[140px] shrink-0">
                  <MovieCard movie={m} />
                </div>
              ))}
            </div>
          </section>
        )}

        {recommendations.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold mb-4">Rekomendasi untukmu</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
              {recommendations.map((m: any) => (
                <div key={m.id} className="min-w-[140px] w-[140px] shrink-0">
                  <MovieCard movie={m} />
                </div>
              ))}
            </div>
          </section>
        )}

        <AdSlot slot="sidebar" format="rect" />
      </main>
    </>
  )
}