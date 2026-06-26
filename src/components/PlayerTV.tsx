'use client'
import { useState } from 'react'

const VIDSRC_BASE = 'https://vidsrc-embed.ru/embed/tv'
const EMBED2_BASE = 'https://www.2embed.to/embed/tmdb/tv'

export default function PlayerTV({ tmdbId, seasons }: { tmdbId: number, seasons: any[] }) {
  const [season, setSeason] = useState(1)
  const [episode, setEpisode] = useState(1)
  const [provider, setProvider] = useState('vidsrc')

  const src = provider === 'vidsrc'
    ? `${VIDSRC_BASE}?tmdb=${tmdbId}&season=${season}&episode=${episode}&autoplay=1`
    : `${EMBED2_BASE}?id=${tmdbId}&s=${season}&e=${episode}`

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <select onChange={(e) => setSeason(Number(e.target.value))} className="glass-ios px-4 py-2 rounded-lg text-sm bg-black/30 border border-white/10">
          {seasons.map(s => <option key={s.id} value={s.season_number}>Season {s.season_number}</option>)}
        </select>
        <input type="number" min="1" value={episode} onChange={e => setEpisode(Number(e.target.value))} className="glass-ios px-4 py-2 rounded-lg text-sm w-24 bg-black/30 border border-white/10" placeholder="Ep" />
        <select onChange={(e) => setProvider(e.target.value)} className="glass-ios px-4 py-2 rounded-lg text-sm ml-auto bg-black/30 border border-white/10">
          <option value="vidsrc">Server 1 (Vidsrc)</option>
          <option value="2embed">Server 2 (2Embed/HD)</option>
        </select>
      </div>
      <div className="aspect-video rounded-2xl overflow-hidden bg-black/60 glass-ios">
        <iframe src={src} allowFullScreen className="w-full h-full" />
      </div>
    </div>
  )
}
