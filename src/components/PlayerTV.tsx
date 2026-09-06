'use client'
import { useState } from 'react'
import Player from './Player'
import { ChevronLeft, ChevronRight, List } from 'lucide-react'

export default function PlayerTV({ tmdbId, season = 1, episode = 1 }: {
  tmdbId: number
  season?: number
  episode?: number
}) {
  return (
    <Player
      tmdbId={tmdbId}
      mediaType="tv"
      season={season}
      episode={episode}
    />
  )
}