'use client'

import { useState } from 'react'

interface PlayerProps {
  tmdbId?: number
}

const VIDSRC_BASE = 'https://vidsrc-embed.ru/embed/movie'

export default function Player({ tmdbId }: PlayerProps) {
  const [error, setError] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const src = tmdbId
    ? `${VIDSRC_BASE}?tmdb=${tmdbId}&autoplay=1`
    : null

  return (
    <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-black/60 glass-ios">
      {src ? (
        <>
          {!loaded && !error && (
            <div className="absolute inset-0 flex items-center justify-center z-10">
              <div className="w-8 h-8 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
            </div>
          )}
          <iframe
            src={src}
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
            className={`w-full h-full ${loaded ? '' : 'opacity-0'}`}
            onLoad={() => setLoaded(true)}
            onError={() => setError(true)}
          />
        </>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center text-white/30 text-sm">
          No video source available
        </div>
      )}
    </div>
  )
}
