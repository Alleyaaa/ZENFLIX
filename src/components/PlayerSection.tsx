'use client'
import Player from './Player'

export default function PlayerSection({ tmdbId }: { tmdbId: number }) {
  return <Player tmdbId={tmdbId} />
}
