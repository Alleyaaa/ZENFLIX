'use client'
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './AuthProvider'
import Link from 'next/link'
import { Heart, Bookmark, Loader2 } from 'lucide-react'
import { supabase } from '@/lib/supabase'

// Tombol Favorite + Watchlist per film/series — tersimpan per user (Supabase),
// sync dengan /profile/favorites & /profile/watchlist
// Tabel: favorites & watchlist (user_id, media_type, tmdb_id, title, poster_url, rating, year, created_at)

export default function DetailActions({ mediaType, tmdbId, title, posterUrl, rating, year }: {
  mediaType: 'movie' | 'tv'
  tmdbId: number
  title: string
  posterUrl?: string | null
  rating?: number
  year?: string | null
}) {
  const { user } = useAuth()
  const [isFav, setIsFav] = useState(false)
  const [isWL, setIsWL] = useState(false)
  const [loadingFav, setLoadingFav] = useState(true)
  const [loadingWL, setLoadingWL] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)

  const loadState = useCallback(async () => {
    if (!user?.id) {
      setLoadingFav(false)
      setLoadingWL(false)
      return
    }
    try {
      const [favRes, wlRes] = await Promise.all([
        supabase.from('favorites').select('id').eq('user_id', user.id).eq('media_type', mediaType).eq('tmdb_id', tmdbId).maybeSingle(),
        supabase.from('watchlist').select('id').eq('user_id', user.id).eq('media_type', mediaType).eq('tmdb_id', tmdbId).maybeSingle(),
      ])
      setIsFav(!!favRes.data)
      setIsWL(!!wlRes.data)
    } catch {
      // fallback: ksong
    } finally {
      setLoadingFav(false)
      setLoadingWL(false)
    }
  }, [user?.id, mediaType, tmdbId])

  useEffect(() => {
    loadState()
  }, [loadState])

  const toggle = async (kind: 'fav' | 'wl') => {
    if (!user?.id || busy) return
    setBusy(kind)
    const table = kind === 'fav' ? 'favorites' : 'watchlist'
    const currentlyIn = kind === 'fav' ? isFav : isWL
    try {
      if (currentlyIn) {
        await supabase.from(table).delete().eq('user_id', user.id).eq('media_type', mediaType).eq('tmdb_id', tmdbId)
        kind === 'fav' ? setIsFav(false) : setIsWL(false)
      } else {
        await supabase.from(table).insert({
          user_id: user.id,
          media_type: mediaType,
          tmdb_id: tmdbId,
          title,
          poster_url: posterUrl || null,
          rating: rating || null,
          year: year || null,
        })
        kind === 'fav' ? setIsFav(true) : setIsWL(true)
      }
    } catch {
      // silent
    } finally {
      setBusy(null)
    }
  }

  // Belum login → link ke /auth
  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Link href="/auth" className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl glass-btn text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--accent)] transition-all" aria-label="Masuk untuk simpan favorite">
          <Heart size={15} /> Favorite
        </Link>
        <Link href="/auth" className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl glass-btn text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--accent)] transition-all" aria-label="Masuk untuk simpan watchlist">
          <Bookmark size={15} /> Watchlist
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Favorite */}
      <button
        onClick={() => toggle('fav')}
        disabled={busy !== null}
        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-60 ${
          isFav
            ? 'bg-red-500/15 text-red-400 border border-red-500/30'
            : 'glass-btn text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)]/50'
        }`}
        aria-label={isFav ? 'Hapus dari favorite' : 'Tambah ke favorite'}
        title={isFav ? 'Hapus dari favorite' : 'Tambah ke favorite'}
      >
        {busy === 'fav' ? <Loader2 size={15} className="animate-spin" /> : <Heart size={15} className={isFav ? 'fill-red-400' : ''} />}
        {isFav ? 'Tersimpan' : 'Favorite'}
      </button>

      {/* Watchlist */}
      <button
        onClick={() => toggle('wl')}
        disabled={busy !== null}
        className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all disabled:opacity-60 ${
          isWL
            ? 'bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30'
            : 'glass-btn text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)]/50'
        }`}
        aria-label={isWL ? 'Hapus dari watchlist' : 'Tambah ke watchlist'}
        title={isWL ? 'Hapus dari watchlist' : 'Tambah ke watchlist'}
      >
        {busy === 'wl' ? <Loader2 size={15} className="animate-spin" /> : <Bookmark size={15} className={isWL ? 'fill-[var(--accent)]' : ''} />}
        {isWL ? 'Di Watchlist' : 'Watchlist'}
      </button>
    </div>
  )
}