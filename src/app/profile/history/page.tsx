'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { useLang } from '@/lib/lang-context'
import { supabase } from '@/lib/supabase'
import { History, ArrowLeft, Play, Clock } from 'lucide-react'

interface HistItem { tmdb_id: number; media_type?: string; title: string; poster_path?: string|null; season_number?: number; episode_number?: number; completed: boolean; watched_at?: string }

export default function HistoryPage() {
  const { user, loading } = useAuth()
  const { lang } = useLang()
  const [items, setItems] = useState<HistItem[]>([])
  const [ready, setReady] = useState(false)
  const isID = lang === 'id'

  useEffect(() => {
    if (!user) { setReady(true); return }
    let cancelled = false
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('watch_history')
          .select('*')
          .eq('user_id', user.id)
          .order('watched_at', { ascending: false })
          .limit(50)
        if (!cancelled && !error) setItems((data || []) as HistItem[])
      } catch {}
      setReady(true)
    }
    load()
    return () => { cancelled = true }
  }, [user])

  if (loading) return <div className="min-h-screen"><Header/><main className="max-w-[1200px] mx-auto px-4 py-24 flex justify-center"><div className="w-10 h-10 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"/></main></div>

  if (!user) return (
    <div className="min-h-screen"><Header/><main className="max-w-[1200px] mx-auto px-4 py-24 text-center">
      <h1 className="text-2xl font-bold mb-4">{isID ? 'Akses Dibatasi' : 'Access Restricted'}</h1>
      <p className="text-[var(--text-muted)] mb-6">{isID ? 'Masuk untuk melihat riwayat nonton.' : 'Sign in to view watch history.'}</p>
      <Link href="/auth" className="btn-primary">{isID ? 'Masuk' : 'Sign In'}</Link>
    </main></div>
  )

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-[900px] mx-auto px-4 pt-24 pb-16">
        <Link href="/profile" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] mb-4 transition-colors">
          <ArrowLeft size={16} /> {isID ? 'Kembali ke Profil' : 'Back to Profile'}
        </Link>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-xl bg-[var(--accent)] bg-opacity-15 flex items-center justify-center">
            <History size={22} className="text-[var(--accent)]" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{isID ? 'Riwayat Nonton' : 'Watch History'}</h1>
            <p className="text-sm text-[var(--text-muted)]">{isID ? 'Film & serial yang sudah kamu tonton' : 'Movies & series you have watched'}</p>
          </div>
        </div>

        {!ready ? null : items.length === 0 ? (
          <div className="glass-card rounded-2xl p-10 text-center">
            <History size={40} className="mx-auto text-[var(--text-tertiary)] mb-4" />
            <p className="text-[var(--text-muted)]">{isID ? 'Belum ada riwayat nonton.' : 'No watch history yet.'}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {items.map((it, i) => (
              <Link key={i} href={it.media_type === 'tv' ? `/tv/${it.tmdb_id}` : `/movie/${it.tmdb_id}`}
                className="flex items-center gap-4 glass-card p-3 rounded-xl hover:border-[var(--accent)]/50 transition-colors">
                <div className="w-12 h-16 rounded-lg overflow-hidden bg-[var(--bg-elevated)] shrink-0">
                  {it.poster_path ? <img src={it.poster_path} alt={it.title} className="w-full h-full object-cover"/> :
                    <div className="w-full h-full flex items-center justify-center text-[var(--text-tertiary)]"><Play size={16}/></div>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{it.title}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    {it.media_type === 'tv' && it.season_number ? `S${it.season_number}E${it.episode_number || 1} • ` : ''}
                    {it.completed ? (isID ? 'Selesai' : 'Completed') : (isID ? 'Sedang ditonton' : 'Watching')}
                  </p>
                </div>
                {it.watched_at && <span className="text-xs text-[var(--text-tertiary)] shrink-0 flex items-center gap-1"><Clock size={12}/>{new Date(it.watched_at).toLocaleDateString('id-ID', {day:'numeric',month:'short'})}</span>}
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
