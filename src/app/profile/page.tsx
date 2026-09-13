'use client'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/components/AuthProvider'
import { useUserTier } from '@/lib/useUserTier'
import { useLang } from '@/lib/lang-context'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import MovieCard from '@/components/MovieCard'
import { Heart, Bookmark, History, Settings, LogOut, ChevronRight, Crown, Clock, PlaySquare } from 'lucide-react'

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth()
  const { tier: subscriptionTier } = useUserTier()
  const { lang } = useLang()
  const router = useRouter()
  const isID = lang === 'id'
  const [favCount, setFavCount] = useState(0)
  const [watchCount, setWatchCount] = useState(0)
  const [recentItems, setRecentItems] = useState<any[]>([])
  const [favItems, setFavItems] = useState<any[]>([])
  const [watchItems, setWatchItems] = useState<any[]>([])
  const [activeTab, setActiveTab] = useState<'favorites' | 'watchlist' | 'history'>('favorites')

  useEffect(() => {
    try {
      const favs = JSON.parse(localStorage.getItem('zenflix-favorites') || '[]')
      const watch = JSON.parse(localStorage.getItem('zenflix-watchlist') || '[]')
      setFavCount(favs.length)
      setWatchCount(watch.length)
      setFavItems(favs.slice(0, 6))
      setWatchItems(watch.slice(0, 6))
    } catch {}
  }, [user])

  // Load riwayat terakhir dari Supabase
  useEffect(() => {
    if (!user) return
    ;(async () => {
      try {
        const { data } = await supabase
          .from('watch_history')
          .select('tmdb_id, media_type, title, watched_at, completed')
          .eq('user_id', user.id)
          .order('watched_at', { ascending: false })
          .limit(5)
        if (data) setRecentItems(data)
      } catch {}
    })()
  }, [user])

  const handleLogout = async () => { await supabase.auth.signOut(); router.push('/') }

  if (authLoading) {
    return <div className="min-h-screen"><Header/><main className="max-w-[900px] mx-auto px-4 pt-24 flex justify-center"><div className="w-10 h-10 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin"/></main></div>
  }

  if (!user) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="max-w-[900px] mx-auto px-4 pt-24 pb-16">
          <div className="glass-panel rounded-3xl p-12 text-center">
            <h1 className="text-2xl font-bold mb-3">{isID ? 'Akses Dibatasi' : 'Access Restricted'}</h1>
            <p className="text-[var(--text-muted)] mb-6">{isID ? 'Masuk dulu untuk melihat dan mengelola profil kamu.' : 'Sign in to view and manage your profile.'}</p>
            <Link href="/auth" className="btn-primary">{isID ? 'Masuk Sekarang' : 'Sign In Now'}</Link>
          </div>
        </main>
      </div>
    )
  }

  const avatar = (user.email?.[0] ?? 'U').toUpperCase()
  const tierLabel = {
    free: isID ? 'Gratis' : 'Free',
    standard: isID ? 'Standar' : 'Standard',
    premium: 'Premium',
    ultimate: 'Ultimate',
  }[subscriptionTier || 'free'] || (isID ? 'Gratis' : 'Free')

  const tabs = [
    { key: 'favorites', label: isID ? 'Favorit' : 'Favorites', icon: Heart, count: favCount },
    { key: 'watchlist', label: isID ? 'Watchlist' : 'Watchlist', icon: Bookmark, count: watchCount },
    { key: 'history', label: isID ? 'Riwayat' : 'History', icon: History, count: recentItems.length },
  ]

  const tabHref: Record<string, string> = {
    favorites: '/profile/favorites',
    watchlist: '/profile/watchlist',
    history: '/profile/history',
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-[900px] mx-auto px-4 pt-24 pb-16">
        {/* Profile header: glass panel besar */}
        <div className="glass-panel rounded-3xl p-8 mb-6 relative overflow-hidden">
          <div className="absolute -top-20 -right-20 w-64 h-64 rounded-full bg-[var(--accent)]/10 blur-3xl pointer-events-none" />
          <div className="flex items-center gap-6 relative">
            <div className="w-24 h-24 rounded-full bg-[var(--accent)] flex items-center justify-center text-4xl font-bold shrink-0 shadow-lg" style={{ color: 'var(--accent-contrast)' }}>{avatar}</div>
            <div className="flex-1 min-w-0">
              <h1 className="text-xl md:text-2xl font-bold truncate">{user.email}</h1>
              <div className="flex flex-wrap items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-[var(--accent)]/15 text-[var(--accent)]">
                  <Crown size={13} /> {tierLabel}
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium glass-card">
                  <Clock size={12} className="text-[var(--text-muted)]" /> {isID ? 'Member Zenflix' : 'Zenflix Member'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats: 4 card glass */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-8">
          <div className="glass-panel rounded-2xl p-4 text-center">
            <Heart size={20} className="mx-auto text-[var(--accent)] mb-1.5" />
            <p className="text-2xl font-bold">{favCount}</p>
            <p className="text-[11px] text-[var(--text-tertiary)]">{isID ? 'Favorit' : 'Favorites'}</p>
          </div>
          <div className="glass-panel rounded-2xl p-4 text-center">
            <Bookmark size={20} className="mx-auto text-[var(--accent)] mb-1.5" />
            <p className="text-2xl font-bold">{watchCount}</p>
            <p className="text-[11px] text-[var(--text-tertiary)]">{isID ? 'Watchlist' : 'Watchlist'}</p>
          </div>
          <div className="glass-panel rounded-2xl p-4 text-center">
            <History size={20} className="mx-auto text-[var(--accent)] mb-1.5" />
            <p className="text-2xl font-bold">{recentItems.length}</p>
            <p className="text-[11px] text-[var(--text-tertiary)]">{isID ? 'Riwayat' : 'History'}</p>
          </div>
          <div className="glass-panel rounded-2xl p-4 text-center">
            <PlaySquare size={20} className="mx-auto text-[var(--accent)] mb-1.5" />
            <p className="text-2xl font-bold">-</p>
            <p className="text-[11px] text-[var(--text-tertiary)]">{isID ? 'Jam Tonton' : 'Watch Time'}</p>
          </div>
        </div>

        {/* Tabs: konten langsung di halaman, bukan cuma menu */}
        <div className="glass-panel rounded-3xl p-6 mb-6">
          <div className="flex gap-2 mb-6 flex-wrap">
            {tabs.map(tab => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all inline-flex items-center gap-2 ${
                  activeTab === tab.key ? 'bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold' : 'glass-btn text-[var(--text-muted)]'
                }`}
              >
                <tab.icon size={15} /> {tab.label} {tab.count > 0 && <span className={`text-xs ${activeTab === tab.key ? 'opacity-80' : 'text-[var(--text-tertiary)]'}`}>({tab.count})</span>}
              </button>
            ))}
            <Link href="/profile/settings" className="ml-auto px-4 py-2 rounded-xl text-sm font-medium glass-btn text-[var(--text-muted)] inline-flex items-center gap-2">
              <Settings size={15} /> {isID ? 'Pengaturan' : 'Settings'}
            </Link>
          </div>

          {/* Tab content */}
          {activeTab === 'favorites' && (
            <div>
              {favItems.length > 0 ? (
                <>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {favItems.map((m: any) => <MovieCard key={m.id} movie={m} />)}
                  </div>
                  <Link href="/profile/favorites" className="inline-flex items-center gap-1 mt-4 text-sm text-[var(--accent)] hover:underline">
                    {isID ? 'Lihat semua favorit' : 'View all favorites'} <ChevronRight size={14} />
                  </Link>
                </>
              ) : (
                <div className="text-center py-8">
                  <Heart size={32} className="mx-auto text-[var(--text-tertiary)] mb-3" />
                  <p className="text-sm text-[var(--text-muted)] mb-3">{isID ? 'Belum ada film favorit.' : 'No favorites yet.'}</p>
                  <Link href="/" className="btn-primary text-sm">{isID ? 'Jelajahi Film' : 'Browse Movies'}</Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'watchlist' && (
            <div>
              {watchItems.length > 0 ? (
                <>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {watchItems.map((m: any) => <MovieCard key={m.id} movie={m} />)}
                  </div>
                  <Link href="/profile/watchlist" className="inline-flex items-center gap-1 mt-4 text-sm text-[var(--accent)] hover:underline">
                    {isID ? 'Lihat semua watchlist' : 'View all watchlist'} <ChevronRight size={14} />
                  </Link>
                </>
              ) : (
                <div className="text-center py-8">
                  <Bookmark size={32} className="mx-auto text-[var(--text-tertiary)] mb-3" />
                  <p className="text-sm text-[var(--text-muted)] mb-3">{isID ? 'Watchlist kosong.' : 'Watchlist empty.'}</p>
                  <Link href="/category/now_playing" className="btn-primary text-sm">{isID ? 'Cari Film Tayang' : 'Find Now Playing'}</Link>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div>
              {recentItems.length > 0 ? (
                <div className="space-y-2">
                  {recentItems.map((h: any, i: number) => (
                    <Link
                      key={i}
                      href={h.media_type === 'tv' ? `/tv/${h.tmdb_id}` : `/movie/${h.tmdb_id}`}
                      className="flex items-center gap-3 glass-card rounded-xl p-3 hover:border-[var(--accent)]/40 transition-colors"
                    >
                      <History size={16} className="text-[var(--accent)] shrink-0" />
                      <span className="flex-1 min-w-0 truncate text-sm font-medium">{h.title || 'Judul'}</span>
                      <span className="text-xs text-[var(--text-tertiary)] shrink-0">
                        {h.completed ? (isID ? 'Selesai' : 'Done') : (isID ? 'Ditonton' : 'Watched')}
                      </span>
                      <ChevronRight size={14} className="text-[var(--text-tertiary)] shrink-0" />
                    </Link>
                  ))}
                  <Link href="/profile/history" className="inline-flex items-center gap-1 mt-2 text-sm text-[var(--accent)] hover:underline">
                    {isID ? 'Lihat semua riwayat' : 'View all history'} <ChevronRight size={14} />
                  </Link>
                </div>
              ) : (
                <div className="text-center py-8">
                  <History size={32} className="mx-auto text-[var(--text-tertiary)] mb-3" />
                  <p className="text-sm text-[var(--text-muted)]">{isID ? 'Belum ada riwayat nonton.' : 'No watch history yet.'}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Logout */}
        <button onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-3.5 rounded-2xl bg-red-500/10 text-red-400 font-medium hover:bg-red-500/20 transition-colors">
          <LogOut size={18} /> {isID ? 'Keluar' : 'Logout'}
        </button>
      </main>
    </div>
  )
}