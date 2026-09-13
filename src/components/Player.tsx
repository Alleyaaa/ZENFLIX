'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from './AuthProvider'
import { AlertTriangle, RotateCcw, Loader2 } from 'lucide-react'

interface SourceChannel {
  index: number
  name: string
  url?: string
}

interface PlayerProps {
  tmdbId: number
  mediaType?: 'movie' | 'tv'
  season?: number
  episode?: number
  enableProgress?: boolean
}

// ─── Supabase helper ───
async function supabaseFetch(path: string, options: RequestInit = {}) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const headers: Record<string, string> = {
    apikey: anon,
    Authorization: `Bearer ${anon}`,
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  }
  return fetch(`${url}${path}`, { ...options, headers })
}

export default function Player({ tmdbId, mediaType = 'movie', season = 1, episode = 1, enableProgress = true }: PlayerProps) {
  const { user } = useAuth()
  const [channels, setChannels] = useState<SourceChannel[]>([])
  const [currentChannel, setCurrentChannel] = useState(1)
  const [trailerKey, setTrailerKey] = useState<string | null>(null)
  const [mode, setMode] = useState<'loading' | 'playing' | 'error'>('loading')
  const [progress, setProgress] = useState(0)
  const [duration, setDuration] = useState(0)
  const [error, setError] = useState('')
  const [savedProgress, setSavedProgress] = useState(0)
  const [resumed, setResumed] = useState(false)
  const [pendingStartAt, setPendingStartAt] = useState<number | null>(null)
  const lastSavedRef = useRef(0)

  // ─── Save progress ke Supabase ───
  const saveProgress = useCallback(async (p: number, d: number, completed = false) => {
    if (!user || !enableProgress) return
    try {
      await supabaseFetch('/rest/v1/watch_progress', {
        method: 'POST',
        body: JSON.stringify({
          user_id: user.id,
          tmdb_id: tmdbId,
          media_type: mediaType,
          current_season: mediaType === 'tv' ? season : 1,
          current_episode: mediaType === 'tv' ? episode : 1,
          progress_seconds: Math.round(p),
          duration_seconds: Math.round(d) || 3600,
          completed,
          last_watched_at: new Date().toISOString(),
        }),
        headers: { Prefer: 'resolution=merge-duplicates' },
      })
    } catch {}
  }, [user, enableProgress, tmdbId, mediaType, season, episode])

  // ─── Tandai selesai + catat history ───
  const markCompleted = useCallback(async () => {
    if (!user || !enableProgress) return
    try {
      await saveProgress(duration || 3600, duration || 3600, true)
      await supabaseFetch('/rest/v1/watch_history', {
        method: 'POST',
        body: JSON.stringify({
          user_id: user.id,
          tmdb_id: tmdbId,
          media_type: mediaType,
          season_number: mediaType === 'tv' ? season : 1,
          episode_number: mediaType === 'tv' ? episode : 1,
          duration_watched: Math.round(progress),
          completed: true,
          watched_at: new Date().toISOString(),
        }),
      })
    } catch {}
  }, [user, enableProgress, saveProgress, duration, progress, tmdbId, mediaType, season, episode])

  // ─── Load channels + trailer ───
  useEffect(() => {
    let cancelled = false
    setMode('loading')
    setChannels([])
    setCurrentChannel(1)
    setTrailerKey(null)
    setSavedProgress(0)
    setResumed(false)
    setPendingStartAt(null)
    lastSavedRef.current = 0

    const load = async () => {
      try {
        const res = await fetch(`/api/sources?id=${tmdbId}&type=${mediaType}&season=${season}&episode=${episode}`)
        const data = await res.json()
        if (cancelled) return
        setTrailerKey(data.trailerKey || null)
        setChannels(data.channels || [])
        if ((data.channels || []).length === 0) {
          setMode('error')
          setError('Tidak ada channel tersedia untuk judul ini.')
        } else {
          setCurrentChannel(data.channels[0].index)
        }
      } catch {
        if (!cancelled) {
          setMode('error')
          setError('Gagal memuat channel pemutar.')
        }
      }
    }
    load()
    return () => { cancelled = true }
  }, [tmdbId, mediaType, season, episode])

  // ─── Load saved progress dari Supabase (resume) ───
  useEffect(() => {
    if (!user || !enableProgress) return
    let cancelled = false
    const loadProgress = async () => {
      try {
        const path = `/rest/v1/watch_progress?user_id=eq.${user.id}&tmdb_id=eq.${tmdbId}&media_type=eq.${mediaType}&current_season=eq.${season}&current_episode=eq.${episode}&select=progress_seconds,duration_seconds`
        const res = await supabaseFetch(path)
        if (!cancelled && res.ok) {
          const rows = await res.json()
          if (rows?.[0]?.progress_seconds > 30) {
            setSavedProgress(rows[0].progress_seconds)
          }
        }
      } catch {}
    }
    loadProgress()
    return () => { cancelled = true }
  }, [user, tmdbId, mediaType, season, episode, enableProgress])

  // ─── Dengarkan postMessage dari player VidSrc (progress real) ───
  useEffect(() => {
    const handler = (event: MessageEvent) => {
      if (event.data?.type !== 'PLAYER_EVENT') return
      const { player_status, player_progress, player_duration } = event.data.data || {}
      if (typeof player_progress === 'number') setProgress(player_progress)
      if (typeof player_duration === 'number') setDuration(player_duration)
      if (player_status === 'playing') setMode('playing')
      if (player_status === 'completed') markCompleted()
    }
    window.addEventListener('message', handler)
    return () => window.removeEventListener('message', handler)
  }, [markCompleted])

  // ─── Save progress interval (tiap 15 detik) ───
  useEffect(() => {
    if (!user || !enableProgress) return
    const save = async () => {
      if (progress < 10 || Math.abs(progress - lastSavedRef.current) < 5) return
      lastSavedRef.current = progress
      await saveProgress(progress, duration)
    }
    const timer = setInterval(save, 15000)
    return () => clearInterval(timer)
  }, [user, enableProgress, progress, duration, saveProgress])

  // ─── Pindah channel (simpan progress dulu) ───
  const switchChannel = (index: number) => {
    if (progress > 10 && user) saveProgress(progress, duration)
    setCurrentChannel(index)
    setMode('loading')
  }

  // ─── Build iframe URL: LANGSUNG ke provider (anti-proxy detect → PASTI play) ───
    // URL source didapat dari /api/sources (server resolve imdb/tmdb ID)
    const iframeSrc = (() => {
      const channel = channels.find(c => c.index === currentChannel)
      // Kalau URL langsung tersedia → pakai itu (anti-proxy detect, kontrol normal)
      if (channel && 'url' in channel && (channel as any).url) {
        return (channel as any).url
      }
      // Fallback: proxy internal (kalau channel tanpa url)
      return `/api/stream-proxy?id=${tmdbId}&type=${mediaType}&season=${season}&episode=${episode}&ch=${currentChannel}`
    })()

  // ─── Trailer fallback ───
  if (mode === 'error') {
    return (
      <div className="space-y-3">
        {trailerKey ? (
          <>
            <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
              <AlertTriangle size={16} className="text-[var(--accent)]" />
              <span>Player tidak tersedia. Nonton trailer resmi:</span>
            </div>
            <div className="aspect-video w-full rounded-xl overflow-hidden bg-black/70 border border-[var(--border)]">
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`}
                className="w-full h-full"
                allowFullScreen
                allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
                referrerPolicy="no-referrer"
                title="Trailer resmi"
              />
            </div>
          </>
        ) : (
          <div className="aspect-video w-full rounded-xl overflow-hidden bg-[var(--bg-elevated)] border border-[var(--border)] flex flex-col items-center justify-center gap-3 p-6 text-center">
            <AlertTriangle size={32} className="text-[var(--accent)]" />
            <p className="text-sm text-[var(--text-muted)] max-w-md">{error}</p>
            <button onClick={() => window.location.reload()} className="px-4 py-2 rounded-lg glass-btn text-sm inline-flex items-center gap-2">
              <RotateCcw size={14} /> Muat Ulang
            </button>
          </div>
        )}
      </div>
    )
  }

  return (
      <div className="space-y-2">
        {/* Video Player: iframe langsung ke provider */}
        <div className="aspect-video w-full rounded-xl overflow-hidden relative bg-black/70 border border-[var(--border)]">
          {mode === 'loading' && (
            <div className="absolute inset-0 flex items-center justify-center z-10 bg-[var(--bg)]/60 pointer-events-none">
              <div className="text-center">
                <div className="w-10 h-10 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-xs text-[var(--text-muted)]">Menyiapkan Channel {currentChannel}...</p>
              </div>
            </div>
          )}
          <iframe
            key={`${currentChannel}-${tmdbId}`}
            src={iframeSrc}
            className="w-full h-full"
            allowFullScreen
            allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            referrerPolicy="no-referrer"
            onLoad={() => setMode('playing')}
            title={`Pemutar Channel ${currentChannel}`}
          />
        </div>

      {/* Channel picker */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {channels.length > 1 && (
          <div className="flex items-center gap-1 bg-[var(--bg-elevated)] rounded-lg p-1">
            <span className="pl-2 pr-1 text-[11px] text-[var(--text-tertiary)]">Channel:</span>
            {channels.map((c) => (
              <button
                key={c.index}
                onClick={() => switchChannel(c.index)}
                className={`px-3 py-1.5 rounded-md text-xs transition-all ${
                  currentChannel === c.index ? 'bg-[var(--accent)] font-semibold' : 'hover:bg-[var(--border)]/30 text-[var(--text-muted)]'
                }`}
                style={currentChannel === c.index ? { color: 'var(--accent-contrast)' } : undefined}
              >
                Channel {c.index}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-3 text-[11px] text-[var(--text-tertiary)]">
          {mode === 'playing' ? (
            <span className="flex items-center gap-1 text-[var(--success)]">
              <span className="w-1.5 h-1.5 rounded-full bg-[var(--success)] animate-pulse" /> Memutar
            </span>
          ) : (
            <span className="flex items-center gap-1"><Loader2 size={12} className="animate-spin" /> Menyiapkan...</span>
          )}
          {savedProgress > 30 && (
            <span className="text-[var(--accent)]">
              Resume dari {Math.floor(savedProgress / 60)}:{String(Math.floor(savedProgress % 60)).padStart(2, '0')}
            </span>
          )}
        </div>
      </div>
    </div>
  )
}