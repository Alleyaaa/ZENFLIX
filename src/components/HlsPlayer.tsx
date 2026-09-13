'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import Hls from 'hls.js'
import { Loader2, AlertTriangle, RotateCcw, Settings2, Play, Pause, Volume2, VolumeX, Maximize, Monitor, RefreshCw, MonitorPlay } from 'lucide-react'

// Player HLS custom (hls.js) — putar direct stream, bukan iframe embed.
// User bisa pilih kualitas (1080p/720p/480p/360p/auto) manual.
// CATATAN: banyak provider Vidsrc adalah JS-heavy + anti-bot, HLS kadang tidak bisa
// di-resolve dari server. Kalau gagal → fallback ke Player embed (mode embed).

interface Quality {
  resolution: string
  height: number
  url: string
}

interface HlsPlayerProps {
  tmdbId: number
  mediaType?: 'movie' | 'tv'
  season?: number
  episode?: number
  title?: string
  year?: number
  onUseEmbed?: () => void
}

export default function HlsPlayer({ tmdbId, mediaType = 'movie', season = 1, episode = 1, title, year, onUseEmbed }: HlsPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const hlsRef = useRef<Hls | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [qualities, setQualities] = useState<Quality[]>([])
  const [activeQuality, setActiveQuality] = useState<string>('auto')
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading')
  const [error, setError] = useState('')
  const [playing, setPlaying] = useState(false)
  const [muted, setMuted] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [qualityOpen, setQualityOpen] = useState(false)
  const [host, setHost] = useState('vidsrcme.ru')
  const [provider, setProvider] = useState<'idlix' | 'vidsrc'>('idlix')
  const [subtitles, setSubtitles] = useState<{ lang: string; label: string; url: string }[]>([])
  const autoFallbackRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ─── Auto-fallback: kalau IDLIX timeout (PC mati) → switch ke embed ───
  useEffect(() => {
    if (provider !== 'idlix') return
    // IDLIX harus resolve < 10 detik; kalau ga → otomatis switch embed
    if (autoFallbackRef.current) clearTimeout(autoFallbackRef.current)
    autoFallbackRef.current = setTimeout(() => {
      // Kalau masih loading setelah 10s berarti IDLIX (PC) mati/gagal → auto embed
      if (onUseEmbed && status === 'loading') {
        onUseEmbed()
      }
    }, 12000)
    return () => { if (autoFallbackRef.current) clearTimeout(autoFallbackRef.current) }
  }, [provider, status, onUseEmbed])

  // ─── Resolve HLS + init player ───
  useEffect(() => {
    let cancelled = false
    setStatus('loading')
    setError('')
    setQualities([])
    setActiveQuality('auto')
    setSubtitles([])

    const init = async () => {
      try {
        // ─── Priority 1: IDLIX (self-hosted, subtitle ID, kualitas 720p+) ───
        if (provider === 'idlix') {
          const params = new URLSearchParams({
            type: mediaType,
            season: String(season),
            episode: String(episode),
          })
          if (title) params.set('title', title)
          if (year) params.set('year', String(year))

          const idlixRes = await fetch(`/api/idlix?${params.toString()}`)
          const idlixData = await idlixRes.json()

          if (idlixRes.ok && idlixData?.success && idlixData?.streamUrl) {
            if (cancelled) return
            setSubtitles(idlixData.subtitles || [])
            setQualities([{ resolution: idlixData.maxHeight ? `${idlixData.maxHeight}p` : 'auto', height: idlixData.maxHeight || 0, url: idlixData.streamUrl }])
            setActiveQuality('auto')

            const video = videoRef.current
            if (!video) return

            if (Hls.isSupported()) {
              const hls = new Hls({ enableWorker: true, autoStartLoad: true, startLevel: -1 })
              hlsRef.current = hls
              hls.loadSource(idlixData.streamUrl)
              hls.attachMedia(video)
              hls.on(Hls.Events.MANIFEST_PARSED, () => {
                if (!cancelled) {
                  setStatus('ready')
                  // Coba mainkan otomatis (muted untuk autoplay policy)
                  video.muted = true
                  setMuted(true)
                  video.play().catch(() => {})
                }
              })
              hls.on(Hls.Events.ERROR, (_e, data) => {
                if (data.fatal) setStatus('error'), setError('Stream gagal dimuat. Coba provider lain.')
              })
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
              video.src = idlixData.streamUrl
              video.addEventListener('loadedmetadata', () => { if (!cancelled) setStatus('ready') })
            } else {
              setStatus('error'); setError('Browser tidak mendukung HLS.')
            }
            return // sukses IDLIX, stop
          }
          // IDLIX gagal → fallthrough ke Vidsrc resolve
          if (cancelled) return
        }

        // ─── Priority 2: Vidsrc resolve-hls (best-effort) ───
        const res = await fetch(`/api/resolve-hls?id=${tmdbId}&type=${mediaType}&season=${season}&episode=${episode}&host=${host}`)
        const data = await res.json()
        if (cancelled) return
        if (!res.ok || !data.playlists?.length) {
          setStatus('error')
          setError(data.error || 'Tidak ada stream HLS ditemukan. Coba channel lain.')
          return
        }
        setQualities(data.playlists)
        setActiveQuality('auto')

        const video = videoRef.current
        if (!video) return

        const defaultUrl = data.playlists[0]?.url
        if (Hls.isSupported()) {
          const hls = new Hls({
            enableWorker: true,
            autoStartLoad: true,
            startLevel: -1,
            capLevelToPlayerSize: false,
          })
          hlsRef.current = hls
          hls.loadSource(defaultUrl)
          hls.attachMedia(video)
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            if (!cancelled) setStatus('ready')
          })
          hls.on(Hls.Events.LEVEL_SWITCHED, (_e, data) => {
            const lvl = hls.levels[data.level]
            if (lvl?.height) setActiveQuality(`${lvl.height}p`)
          })
          hls.on(Hls.Events.ERROR, (_e, data) => {
            if (data.fatal) {
              switch (data.type) {
                case Hls.ErrorTypes.NETWORK_ERROR:
                  hls.startLoad()
                  break
                case Hls.ErrorTypes.MEDIA_ERROR:
                  hls.recoverMediaError()
                  break
                default:
                  if (!cancelled) { setStatus('error'); setError('Gagal memutar stream (fatal). Coba channel lain.') }
                  hls.destroy()
              }
            }
          })
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          // Safari native HLS
          video.src = defaultUrl
          video.addEventListener('loadedmetadata', () => { if (!cancelled) setStatus('ready') })
        } else {
          setStatus('error')
          setError('Browser tidak mendukung HLS. Coba browser lain (Chrome/Edge/Safari).')
        }
      } catch {
        if (!cancelled) { setStatus('error'); setError('Gagal resolve stream.') }
      }
    }

    init()
    return () => {
      cancelled = true
      if (hlsRef.current) { hlsRef.current.destroy(); hlsRef.current = null }
    }
  }, [tmdbId, mediaType, season, episode, host, provider, title, year])

  // ─── Switch kualitas manual ───
  const switchQuality = (q: Quality | 'auto') => {
    setQualityOpen(false)
    if (!videoRef.current || !hlsRef.current) return
    if (q === 'auto') {
      hlsRef.current.startLevel = -1
      setActiveQuality('auto')
      return
    }
    // Cari level index dengan height sesuai
    const idx = hlsRef.current.levels.findIndex((l) => l.height === q.height)
    if (idx >= 0) {
      hlsRef.current.currentLevel = idx
      setActiveQuality(q.resolution)
    }
  }

  // ─── Controls ───
  const togglePlay = () => {
    const v = videoRef.current
    if (!v) return
    if (v.paused) { v.play(); setPlaying(true) } else { v.pause(); setPlaying(false) }
  }
  const toggleMute = () => {
    const v = videoRef.current
    if (!v) return
    v.muted = !v.muted
    setMuted(v.muted)
  }
  const toggleFullscreen = () => {
    const el = containerRef.current
    if (!el) return
    if (document.fullscreenElement) document.exitFullscreen()
    else el.requestFullscreen()
  }
  const changeHost = (h: string) => { setHost(h); setQualities([]); setActiveQuality('auto') }

  // Reload reset
  const reload = () => {
    setHost('vidsrcme.ru')
    // Re-trigger useEffect via key change (host state triggers)
  }

  const fmt = (s: number) => {
    if (isNaN(s)) return '0:00'
    const m = Math.floor(s / 60)
    const sec = Math.floor(s % 60)
    return `${m}:${sec.toString().padStart(2, '0')}`
  }

  return (
    <div ref={containerRef} className="relative aspect-video w-full rounded-xl overflow-hidden bg-black border border-[var(--border)] group/player">
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        controls={false}
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
        onVolumeChange={(e) => setMuted(e.currentTarget.muted)}
      />

      {/* Loading overlay */}
      {status === 'loading' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 z-20">
          <Loader2 size={36} className="animate-spin text-[var(--accent)]" />
          <p className="text-xs text-white/70">Mencari stream HLS & kualitas terbaik...</p>
        </div>
      )}

      {/* Error state */}
      {status === 'error' && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/80 z-20 p-6 text-center">
          <AlertTriangle size={32} className="text-[var(--accent)]" />
          <p className="text-sm text-white/80 max-w-md">{error}</p>
          <div className="flex gap-2 flex-wrap justify-center">
            {['vidsrcme.ru', 'vidsrc.to', 'vidsrc.me', 'multiembed.mov'].filter(h => h !== host).map((h) => (
              <button key={h} onClick={() => changeHost(h)} className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-xs text-white hover:bg-white/20 transition-all">
                Coba {h}
              </button>
            ))}
            <button onClick={() => changeHost(host)} className="px-3 py-1.5 rounded-lg bg-[var(--accent)] text-xs font-bold text-[var(--accent-contrast)] transition-all inline-flex items-center gap-1.5">
              <RefreshCw size={12} /> Ulangi ({host})
            </button>
            {onUseEmbed && (
              <button onClick={onUseEmbed} className="px-3 py-1.5 rounded-lg bg-white/20 border border-white/30 text-xs font-bold text-white hover:bg-white/30 transition-all inline-flex items-center gap-1.5">
                <MonitorPlay size={12} /> Gunakan Player Embed
              </button>
            )}
          </div>
        </div>
      )}

      {/* Custom controls (bottom) */}
      {status === 'ready' && (
        <div className="absolute inset-x-0 bottom-0 z-30 p-3 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover/player:opacity-100 transition-opacity">
          {/* Progress bar */}
          <div className="mb-2">
            <input
              type="range"
              min={0}
              max={duration || 0}
              value={currentTime}
              onChange={(e) => { if (videoRef.current) videoRef.current.currentTime = parseFloat(e.target.value) }}
              className="w-full h-1 accent-[var(--accent)] cursor-pointer"
              aria-label="Seek"
            />
            <div className="flex items-center justify-between text-[10px] text-white/70 mt-0.5">
              <span>{fmt(currentTime)}</span>
              <span>{fmt(duration)}</span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <button onClick={togglePlay} className="w-9 h-9 rounded-full bg-white/15 hover:bg-white/30 flex items-center justify-center transition-all" aria-label={playing ? 'Pause' : 'Play'}>
                {playing ? <Pause size={16} className="text-white fill-white" /> : <Play size={16} className="text-white fill-white ml-0.5" />}
              </button>
              <button onClick={toggleMute} className="w-8 h-8 rounded-lg hover:bg-white/15 flex items-center justify-center transition-all" aria-label={muted ? 'Unmute' : 'Mute'}>
                {muted ? <VolumeX size={16} className="text-white" /> : <Volume2 size={16} className="text-white" />}
              </button>
              <span className="text-[11px] text-white/70 font-medium hidden sm:inline">{fmt(currentTime)} / {fmt(duration)}</span>
            </div>

            <div className="flex items-center gap-2">
              {/* Quality selector */}
              <div className="relative">
                <button
                  onClick={() => setQualityOpen(!qualityOpen)}
                  className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white/15 hover:bg-white/30 text-[11px] font-semibold text-white transition-all"
                  aria-label="Kualitas"
                >
                  <Settings2 size={13} />
                  {activeQuality === 'auto' ? 'Auto' : activeQuality}
                </button>
                {qualityOpen && (
                  <div className="absolute bottom-full right-0 mb-2 w-44 glass-panel rounded-xl overflow-hidden shadow-2xl">
                    <button onClick={() => switchQuality('auto')} className={`w-full text-left px-4 py-2 text-xs transition-colors ${activeQuality === 'auto' ? 'bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold' : 'hover:bg-[var(--bg-elevated)] text-[var(--text-main)]'}`}>
                      Auto ({qualities.length} kualitas)
                    </button>
                    {qualities.map((q) => (
                      <button key={q.resolution} onClick={() => switchQuality(q)} className={`w-full text-left px-4 py-2 text-xs transition-colors ${activeQuality === q.resolution ? 'bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold' : 'hover:bg-[var(--bg-elevated)] text-[var(--text-main)]'}`}>
                        {q.resolution}
                        {q.height >= 1080 ? ' (FHD)' : q.height >= 720 ? ' (HD)' : ''}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Fullscreen */}
              <button onClick={toggleFullscreen} className="w-8 h-8 rounded-lg hover:bg-white/15 flex items-center justify-center transition-all" aria-label="Fullscreen">
                <Maximize size={15} className="text-white" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Big play button center (saat paused) */}
      {status === 'ready' && !playing && (
        <button onClick={togglePlay} className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 hover:bg-black/20 transition-colors" aria-label="Putar">
          <div className="w-16 h-16 rounded-full bg-[var(--accent)] flex items-center justify-center shadow-2xl">
            <Play size={28} className="text-[var(--accent-contrast)] fill-current ml-1" />
          </div>
        </button>
      )}
    </div>
  )
}