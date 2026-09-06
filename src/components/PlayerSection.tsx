'use client'
import Player from './Player'

interface PlayerSectionProps {
  tmdbId: number
  mediaType?: 'movie' | 'tv'
  season?: number
  episode?: number
}

export default function PlayerSection({ tmdbId, mediaType = 'movie', season, episode }: PlayerSectionProps) {
  return (
    <Player
      tmdbId={tmdbId}
      mediaType={mediaType}
      season={mediaType === 'tv' ? (season || 1) : 1}
      episode={mediaType === 'tv' ? (episode || 1) : 1}
    />
  )
}