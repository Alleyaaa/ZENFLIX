'use client'
import PlayerSection from './PlayerSection'

export default function PlayerTV({ tmdbId, season = 1, episode = 1, title, year }: {
  tmdbId: number
  season?: number
  episode?: number
  title?: string
  year?: number
}) {
  return (
    <PlayerSection
      tmdbId={tmdbId}
      mediaType="tv"
      season={season}
      episode={episode}
      title={title}
      year={year}
    />
  )
}