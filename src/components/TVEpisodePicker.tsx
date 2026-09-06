'use client'
import { useState, useMemo } from 'react'
import PlayerTV from './PlayerTV'

interface Season {
  season_number: number
  name?: string
  episode_count?: number
  air_date?: string | null
  overview?: string | null
  poster_path?: string | null
}

export default function TVEpisodePicker({ tmdbId, seasons, initialSeason = 1 }: {
  tmdbId: number
  seasons: Season[]
  initialSeason?: number
}) {
  const filtered = useMemo(() => (seasons || []).filter(s => s.season_number > 0), [seasons])
  const [season, setSeason] = useState(initialSeason)
  const [episode, setEpisode] = useState(1)
  const [showAllEpisodes, setShowAllEpisodes] = useState(false)

  const currentSeason = filtered.find(s => s.season_number === season)
  const totalEp = currentSeason?.episode_count || 10

  const selectSeason = (s: number) => {
    setSeason(s)
    setEpisode(1)
  }

  return (
    <div className="space-y-5">
      {/* Season selector: horizontal pills */}
      <div>
        <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">Season</p>
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
          {filtered.map(s => (
            <button
              key={s.season_number}
              onClick={() => selectSeason(s.season_number)}
              className={`px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-all shrink-0 ${
                season === s.season_number ? 'bg-[var(--accent)]' : 'glass-btn'
              }`}
              style={season === s.season_number ? { color: 'var(--accent-contrast)' } : undefined}
            >
              Season {s.season_number}
              {s.episode_count ? <span className={`text-[10px] ${season === s.season_number ? 'opacity-80' : 'text-[var(--text-tertiary)]'}`}>{s.episode_count} ep</span> : null}
            </button>
          ))}
        </div>
      </div>

      {/* Episode grid */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">Episode</p>
          <button onClick={() => setShowAllEpisodes(!showAllEpisodes)} className="text-xs text-[var(--accent)] hover:underline">
            {showAllEpisodes ? 'Ringkas' : 'Semua Episode'}
          </button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-[320px] overflow-y-auto pr-1">
          {Array.from({ length: Math.max(totalEp, 1) }, (_, i) => i + 1).slice(0, showAllEpisodes ? undefined : 10).map(ep => (
            <button
              key={ep}
              onClick={() => setEpisode(ep)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all ${
                episode === ep ? 'bg-[var(--accent)] font-semibold' : 'glass-btn hover:border-[var(--accent)]'
              }`}
              style={episode === ep ? { color: 'var(--accent-contrast)' } : undefined}
            >
              <span className="text-xs opacity-70">E</span>
              <span className="font-medium">{ep}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Player */}
      <PlayerTV tmdbId={tmdbId} season={season} episode={episode} />
    </div>
  )
}