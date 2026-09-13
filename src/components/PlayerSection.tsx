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
// - "embed" (DEFAULT): iframe /api/stream-proxy — PALING RELIABLE (terbukti jalan 200)
// - "hls": player custom HLS (hls.js) — IDLIX dulu, fallback resolve-hls.
//   HLS optional karena IDLIX butuh tunnel/PC nyala & resolve-hls sering gagal (vidsrc JS-heavy).
export default function PlayerSection({ tmdbId, mediaType = 'movie', season, episode, title, year }: PlayerSectionProps) {
  // DEFAULT ke 'embed' — yang paling reliable
  const [mode, setMode] = useState<'hls' | 'embed'>('embed')

  return (
    <div className="space-y-3">
      {/* Mode toggle */}
      <div className="flex items-center justify-end gap-1">
        <div className="flex items-center gap-1 bg-[var(--bg-elevated)] rounded-lg p-1">
          <button
            onClick={() => setMode('embed')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              mode === 'embed' ? 'bg-[var(--accent)] text-[var(--accent-contrast)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
            aria-label="Player utama (paling stabil)"
          >
            <LayoutGrid size={14} />
            Player
          </button>
          <button
            onClick={() => setMode('hls')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
              mode === 'hls' ? 'bg-[var(--accent)] text-[var(--accent-contrast)]' : 'text-[var(--text-muted)] hover:text-[var(--text-main)]'
            }`}
            aria-label="Player HD (kualitas pilihan + subtitle)"
          >
            <MonitorPlay size={14} />
            HD
          </button>
        </div>
      </div>

      {mode === 'embed' ? (
        <Player
          tmdbId={tmdbId}
          mediaType={mediaType}
          season={mediaType === 'tv' ? (season || 1) : 1}
          episode={mediaType === 'tv' ? (episode || 1) : 1}
        />
      ) : (
        <HlsPlayer
          tmdbId={tmdbId}
          mediaType={mediaType}
          season={mediaType === 'tv' ? (season || 1) : 1}
          episode={mediaType === 'tv' ? (episode || 1) : 1}
          title={title}
          year={year}
          onUseEmbed={() => setMode('embed')}
        />
      )}
    </div>
  )
}