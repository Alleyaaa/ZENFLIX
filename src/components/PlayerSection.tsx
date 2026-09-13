'use client'
import { useState } from 'react'
import Player from './Player'
import HlsPlayer from './HlsPlayer'
import { MonitorPlay, LayoutGrid } from 'lucide-react'

interface PlayerSectionProps {
  tmdbId: number
  mediaType?: 'movie' | 'tv'
  season?: number
  episode?: number
  title?: string
  year?: number
}

// Mode player:
// - "hls" (default): player custom HLS (hls.js) — IDLIX dulu (subtitle ID + 720p), 
//   fallback resolve-hls Vidsrc, pilih kualitas manual
// - "embed": fallback iframe proxy (source tersembunyi)
export default function PlayerSection({ tmdbId, mediaType = 'movie', season, episode, title, year }: PlayerSectionProps) {
  const [mode, setMode] = useState<'hls' | 'embed'>('hls')

  return (
    <div className="space-y-3">
      {/* Mode toggle */}
      <div className="flex items-center justify-end gap-1">
        <div className="flex items-center gap-1 bg-[var(--bg-elevated)] rounded-lg p-1">
          <button
            onClick={() => setMode('hls')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              mode === 'hls' ? 'bg-[var(--accent)] text-[var(--accent-contrast)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
            aria-label="Player HD (kualitas pilihan + subtitle)"
          >
            <MonitorPlay size={14} />
            Player HD
          </button>
          <button
            onClick={() => setMode('embed')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              mode === 'embed' ? 'bg-[var(--accent)] text-[var(--accent-contrast)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
            aria-label="Player embed (fallback)"
          >
            <LayoutGrid size={14} />
            Embed
          </button>
        </div>
      </div>

      {mode === 'hls' ? (
        <HlsPlayer
          tmdbId={tmdbId}
          mediaType={mediaType}
          season={mediaType === 'tv' ? (season || 1) : 1}
          episode={mediaType === 'tv' ? (episode || 1) : 1}
          title={title}
          year={year}
        />
      ) : (
        <Player
          tmdbId={tmdbId}
          mediaType={mediaType}
          season={mediaType === 'tv' ? (season || 1) : 1}
          episode={mediaType === 'tv' ? (episode || 1) : 1}
        />
      )}
    </div>
  )
}