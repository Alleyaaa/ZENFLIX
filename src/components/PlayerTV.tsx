'use client'
import { useState } from 'react'

export default function PlayerTV({ tmdbId, seasons }: { tmdbId: number, seasons: any[] }) {
  const [season, setSeason] = useState(1)
  const [episode, setEpisode] = useState(1)
  // Vidsrc.dl TV format
  const src = `https://vidsrc.xyz/embed/tv/tmdb/${tmdbId}/${season}/${episode}`

  const totalEp = seasons?.find(s => s.season_number === season)?.episode_count || 0

  const prev = () => {
    if (episode > 1) setEpisode(e => e - 1)
    else if (season > 1) { setSeason(s => s - 1); setEpisode(seasons?.find(s => s.season_number === season - 1)?.episode_count || 24) }
  }
  const next = () => {
    if (episode < totalEp) setEpisode(e => e + 1)
    else if (season < (seasons?.filter(s => s.season_number > 0).length || 1)) { setSeason(s => s + 1); setEpisode(1) }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center gap-3 flex-wrap">
        <select value={season} onChange={e => { setSeason(Number(e.target.value)); setEpisode(1) }}
          className="px-4 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-sm">
          {seasons?.filter(s => s.season_number > 0).map(s => (
            <option key={s.season_number} value={s.season_number}>Season {s.season_number}</option>
          ))}
        </select>
        <select value={episode} onChange={e => setEpisode(Number(e.target.value))}
          className="px-4 py-2 rounded-xl bg-[var(--bg-surface)] border border-[var(--border)] text-sm">
          {Array.from({ length: Math.max(totalEp, 1) }, (_, i) => (
            <option key={i + 1} value={i + 1}>Episode {i + 1}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <button onClick={prev}
            disabled={season === 1 && episode === 1}
            className="px-3 py-1.5 rounded-xl glass-btn text-xs disabled:opacity-30">← Prev</button>
          <button onClick={next}
            className="px-3 py-1.5 rounded-xl glass-btn text-xs">Next →</button>
        </div>
      </div>

      <div className="aspect-video w-full glass-card rounded-2xl overflow-hidden relative bg-black/40">
        <iframe
          key={src}
          src={src}
          className="w-full h-full"
          allowFullScreen
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups"
        />
      </div>
    </div>
  )
}
