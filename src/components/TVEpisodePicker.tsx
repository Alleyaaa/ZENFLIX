'use client'
import { useState, useMemo, useEffect } from 'react'
import PlayerTV from './PlayerTV'
import { ChevronDown, Play, Clock, ChevronLeft, ChevronRight, Film } from 'lucide-react'
import { tmdbImage } from '@/lib/tmdb'

interface Season { season_number: number; name?: string; episode_count?: number; poster_path?: string | null }
interface EpisodeInfo { id: number; name: string; overview: string; still: string | null; runtime: number | null; air_date: string | null; vote_average: number }

// Batasi jumlah episode yang tampil per "halaman" biar scroll ga kepanjangan
const EPISODES_PER_PAGE = 10

export default function TVEpisodePicker({ tmdbId, seasons, initialSeason = 1, title, year }: {
  tmdbId: number; seasons: Season[]; initialSeason?: number; title?: string; year?: number
}) {
  const filtered = useMemo(() => (seasons || []).filter(s => s.season_number > 0), [seasons])
  const [season, setSeason] = useState(initialSeason)
  const [episode, setEpisode] = useState(1)
  const [seasonOpen, setSeasonOpen] = useState(false)
  const [episodes, setEpisodes] = useState<EpisodeInfo[]>([])
  const [expandedEp, setExpandedEp] = useState<number | null>(null)
  const [epPage, setEpPage] = useState(0)

  const currentSeason = filtered.find(s => s.season_number === season)
  const totalEp = episodes.length || currentSeason?.episode_count || 10

  useEffect(() => {
    let cancelled = false
    setEpPage(0)
    fetch(`/api/episode-info?id=${tmdbId}&season=${season}`)
      .then(r => r.json())
      .then(d => { if (!cancelled) setEpisodes(d.episodes || []) })
      .catch(() => { if (!cancelled) setEpisodes([]) })
    return () => { cancelled = true }
  }, [tmdbId, season])

  const selectSeason = (s: number) => { setSeason(s); setEpisode(1); setSeasonOpen(false) }
  const goPrev = () => {
    if (episode > 1) setEpisode(episode - 1)
    else { const p = filtered.find(s => s.season_number === season - 1); if (p) { setSeason(season - 1); setEpisode(p.episode_count || 10) } }
  }
  const goNext = () => {
    if (episode < totalEp) setEpisode(episode + 1)
    else { const n = filtered.find(s => s.season_number === season + 1); if (n) { setSeason(season + 1); setEpisode(1) } }
  }
  const hasPrev = episode > 1 || filtered.some(s => s.season_number === season - 1)
  const hasNext = episode < totalEp || filtered.some(s => s.season_number === season + 1)

  // Paginasi episode (10 per halaman)
  const pageCount = Math.max(1, Math.ceil(totalEp / EPISODES_PER_PAGE))
  const visibleEpisodes = episodes.filter(ep => {
    const idx = episodes.indexOf(ep)
    return idx >= epPage * EPISODES_PER_PAGE && idx < (epPage + 1) * EPISODES_PER_PAGE
  })

  // Thumbnail: kalau ep.still null → pakai season poster (fallback biar ga kosong)
  const seasonPoster = currentSeason?.poster_path ? tmdbImage(currentSeason.poster_path, 'w342') : null

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold">Pilih Episode</h3>
          <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] font-medium">{currentSeason?.name || `Musim ${season}`}</span>
        </div>
        <div className="relative">
          <button onClick={() => setSeasonOpen(!seasonOpen)} className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass-panel text-xs font-medium hover:border-[var(--accent)] transition-all">
            <span>{currentSeason?.name || `Musim ${season}`}</span>
            <ChevronDown size={12} className={`transition-transform ${seasonOpen ? 'rotate-180' : ''}`} />
          </button>
          {seasonOpen && (
            <div className="absolute right-0 top-full mt-2 z-30 glass-panel rounded-xl overflow-y-auto shadow-2xl min-w-[160px] max-h-[300px]">
              {filtered.map(s => (
                <button key={s.season_number} onClick={() => selectSeason(s.season_number)}
                  className={`w-full text-left px-4 py-2 text-xs transition-colors flex items-center justify-between ${season === s.season_number ? 'bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold' : 'hover:bg-[var(--bg-elevated)] text-[var(--text-main)]'}`}>
                  <span>{s.name || `Musim ${s.season_number}`}</span>
                  {s.episode_count ? <span className="text-[10px] opacity-70">{s.episode_count} ep</span> : null}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Netflix-style vertical episode list (max 10 per page) */}
      <div className="space-y-3">
        {episodes.length > 0 ? visibleEpisodes.map(ep => (
          <div key={ep.id}
            onClick={() => { setEpisode(ep.id); setExpandedEp(null) }}
            className={`flex gap-4 p-3 rounded-xl cursor-pointer transition-all duration-200 ${episode === ep.id ? 'glass-panel border-[var(--accent)] ring-1 ring-[var(--accent)]/30' : 'hover:bg-[var(--bg-elevated)] border border-transparent hover:border-[var(--border)]'}`}>
            {/* Thumbnail: still → fallback season poster → icon */}
            <div className="relative w-[160px] md:w-[200px] shrink-0 aspect-video rounded-lg overflow-hidden bg-[var(--bg-elevated)]">
              {ep.still ? (
                <img src={ep.still} alt={ep.name} className="w-full h-full object-cover" loading="lazy" />
              ) : seasonPoster ? (
                <img src={seasonPoster} alt={ep.name} className="w-full h-full object-cover opacity-40" loading="lazy" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[var(--text-tertiary)]">
                  <Film size={24} />
                </div>
              )}
              {episode === ep.id && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center bg-[var(--accent)] text-[var(--accent-contrast)]">
                    <Play size={18} className="fill-current ml-0.5" />
                  </div>
                </div>
              )}
            </div>
            {/* Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <p className={`text-sm font-semibold ${episode === ep.id ? 'text-[var(--accent)]' : ''}`}>{ep.name || `Episode ${ep.id}`}</p>
                {ep.runtime && <span className="text-[10px] text-[var(--text-tertiary)] flex items-center gap-1 shrink-0"><Clock size={10} />{ep.runtime}m</span>}
              </div>
              {ep.air_date && <p className="text-[11px] text-[var(--text-tertiary)] mt-0.5">{ep.air_date}</p>}
              {ep.overview && (
                <p className={`text-xs text-[var(--text-muted)] mt-1 leading-relaxed ${expandedEp === ep.id ? '' : 'line-clamp-2'}`}>
                  {ep.overview}
                </p>
              )}
              {ep.overview && ep.overview.length > 120 && (
                <button onClick={(e) => { e.stopPropagation(); setExpandedEp(expandedEp === ep.id ? null : ep.id) }}
                  className="text-[11px] text-[var(--accent)] hover:underline mt-1">
                  {expandedEp === ep.id ? 'Sembunyikan' : 'Baca selengkapnya'}
                </button>
              )}
            </div>
          </div>
        )) : (
          <div className="grid grid-cols-3 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-xl overflow-hidden glass-panel animate-pulse">
                <div className="aspect-video bg-[var(--bg-elevated)]" />
                <div className="p-3 space-y-2"><div className="h-3 bg-[var(--bg-elevated)] rounded w-3/4" /><div className="h-2 bg-[var(--bg-elevated)] rounded w-1/2" /></div>
              </div>
            ))}
          </div>
        )}

        {/* Episode pagination (kalau > 10 episode) */}
        {pageCount > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            {Array.from({ length: pageCount }).map((_, i) => (
              <button
                key={i}
                onClick={() => setEpPage(i)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                  epPage === i ? 'bg-[var(--accent)] text-[var(--accent-contrast)]' : 'glass-card text-[var(--text-muted)] hover:text-[var(--accent)]'
                }`}
                aria-label={`Episode ${i * EPISODES_PER_PAGE + 1}-${Math.min((i + 1) * EPISODES_PER_PAGE, totalEp)}`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Prev / Next */}
      <div className="flex items-center justify-between gap-3">
        <button onClick={goPrev} disabled={!hasPrev} className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-panel text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:border-[var(--accent)] transition-all">
          <ChevronLeft size={16} /> Sebelumnya
        </button>
        <span className="text-xs text-[var(--text-tertiary)]">S{season} • E{episode} / {totalEp}</span>
        <button onClick={goNext} disabled={!hasNext} className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass-panel text-sm font-medium disabled:opacity-40 disabled:cursor-not-allowed hover:border-[var(--accent)] transition-all">
          Berikutnya <ChevronRight size={16} />
        </button>
      </div>

      {/* Player — langsung play episode yang dipilih */}
      <PlayerTV tmdbId={tmdbId} season={season} episode={episode} title={title} year={year} />
    </div>
  )
}