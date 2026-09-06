'use client'
import { useAuth } from '@/components/AuthProvider'
import { useLang } from '@/lib/lang-context'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Film, Tv, Clock, Heart, List, Award, Trophy, Settings, LogOut, Crown, Play, Calendar, TrendingUp } from 'lucide-react'
import Link from 'next/link'
import Header from '@/components/Header'
import MovieCard from '@/components/MovieCard'
import { ACHIEVEMENTS, getTierByPoints, getTierProgress, USER_TIERS } from '@/lib/achievements'

const TIER_INFO: Record<string, { id: string; en: string; icon: string; color: string }> = {
  free: { id: 'Gratis', en: 'Free', icon: '🆓', color: 'text-gray-400 bg-gray-500/20' },
  standard: { id: 'Standar', en: 'Standard', icon: '📺', color: 'text-blue-400 bg-blue-500/20' },
  premium: { id: 'Premium', en: 'Premium', icon: '💎', color: 'text-purple-400 bg-purple-500/20' },
  ultimate: { id: 'Ultimate', en: 'Ultimate', icon: '👑', color: 'text-yellow-400 bg-yellow-500/20' },
}

const TIER_COLORS: Record<string, string> = {
  bronze: 'bg-amber-500/20 text-amber-400',
  silver: 'bg-gray-400/20 text-gray-300',
  gold: 'bg-yellow-500/20 text-yellow-400',
  platinum: 'bg-purple-500/20 text-purple-400',
  diamond: 'bg-cyan-500/20 text-cyan-400',
}

interface HistoryItemRaw {
  tmdb_id?: number
  media_type?: string
  season_number?: number
  episode_number?: number
  watched_at?: string
  duration_watched?: number
  completed?: boolean
}

interface ProgressItemRaw {
  tmdb_id?: number
  media_type?: string
  progress_seconds?: number
  duration_seconds?: number
  current_season?: number
  current_episode?: number
  updated_at?: string
}

function formatTime(seconds: number): string {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  return h > 0 ? `${h}j ${m}m` : `${m}m`
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const hours = Math.floor(diff / 3600000)
  if (hours < 1) return 'baru saja'
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} hari lalu`
  return new Date(dateStr).toLocaleDateString('id-ID')
}

const TABS = [
  { key: 'overview', icon: Award, required: false },
  { key: 'continue', icon: Play, required: false },
  { key: 'watchlist', icon: List, required: false },
  { key: 'history', icon: Clock, required: false },
  { key: 'achievements', icon: Trophy, required: false },
  { key: 'leaderboard', icon: TrendingUp, required: false },
  { key: 'subscription', icon: Crown, required: false },
]

export default function ProfilePage() {
  const { user, loading: authLoading, signOut } = useAuth()
  const { lang } = useLang()
  const router = useRouter()
  const [tab, setTab] = useState('overview')
  const [profile, setProfile] = useState<any>(null)
  const [continueWatching, setContinueWatching] = useState<ProgressItemRaw[]>([])
  const [history, setHistory] = useState<HistoryItemRaw[]>([])
  const [watchlist, setWatchlist] = useState<any[]>([])
  const [subscription, setSubscription] = useState<any>(null)
  const [userAchievements, setUserAchievements] = useState<any[]>([])
  const [leaderboard, setLeaderboard] = useState<any[]>([])
  const [period, setPeriod] = useState('weekly')
  const [metric, setMetric] = useState('watch_time')
  const [loading, setLoading] = useState(true)

  // Fetch leaderboard data
  const fetchLeaderboard = async (p: string, m: string) => {
    try {
      const res = await fetch(`/api/leaderboard?period=${p}&metric=${m}&limit=15`)
      const data = await res.json()
      setLeaderboard(data.results || [])
    } catch {}
  }

  useEffect(() => {
    if (!user) return
    let cancelled = false
    async function fetchAll() {
      try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const headers = { apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!}` }

        const [prof, prog, hist, wl, sub] = await Promise.all([
          fetch(`${url}/rest/v1/profiles?id=eq.${user.id}&select=*`, { headers }).then(r => r.json()),
          fetch(`${url}/rest/v1/watch_progress?user_id=eq.${user.id}&order=updated_at.desc&limit=12`, { headers }).then(r => r.json()),
          fetch(`${url}/rest/v1/watch_history?user_id=eq.${user.id}&order=watched_at.desc&limit=20`, { headers }).then(r => r.json()),
          fetch(`${url}/rest/v1/watchlist?user_id=eq.${user.id}&order=added_at.desc&limit=30`, { headers }).then(r => r.json()),
          fetch(`${url}/rest/v1/subscriptions?user_id=eq.${user.id}&order=created_at.desc&limit=1`, { headers }).then(r => r.json()),
        ])
        if (cancelled) return
        setProfile(prof?.[0] || null)
        setContinueWatching(prog || [])
        setHistory(hist || [])
        setWatchlist(wl || [])
        setSubscription(sub?.[0] || null)
        await fetchLeaderboard('weekly', 'watch_time')
      } catch (e) {
        console.error('Gagal ambil data profil:', e)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    fetchAll()
    return () => { cancelled = true }
  }, [user])

  if (authLoading || (loading && user)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-10 h-10 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 p-6">
        <h1 className="text-2xl font-bold">Akses Dibatasi</h1>
        <p className="text-[var(--text-muted)] text-center max-w-md">Masuk dulu untuk melihat profil, watchlist, riwayat, dan achievement kamu.</p>
        <Link href="/auth" className="btn-primary px-6 py-3">Masuk</Link>
      </div>
    )
  }

  const tierKey = profile?.subscription_tier || subscription?.tier || 'free'
  const tierInfo = TIER_INFO[tierKey] || TIER_INFO.free
  const isID = lang === 'id'

  const stats = [
    { label: isID ? 'Film Ditonton' : 'Films Watched', value: profile?.films_watched || 0, icon: Film },
    { label: isID ? 'Series Ditonton' : 'Series Watched', value: profile?.series_watched || 0, icon: Tv },
    { label: isID ? 'Waktu Nonton' : 'Watch Time', value: formatTime(profile?.watch_time_seconds || 0), icon: Clock },
  ]

  const unlockedCodes = new Set((userAchievements || []).map((a: any) => a.achievement_code))
  const totalPoints = Array.from(unlockedCodes).reduce((sum, code) => {
    const ach = ACHIEVEMENTS.find(a => a.code === code)
    return sum + (ach?.reward || 0)
  }, 0)
  const currentTier = getTierByPoints(totalPoints)
  const tierProgress = getTierProgress(totalPoints)

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-[1400px] mx-auto px-4 py-6 md:pt-24 pb-16">
        {/* Header card */}
        <div className="glass-card rounded-2xl p-6 md:p-8 mb-6 border border-[var(--border)]">
          <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-full bg-[var(--accent)] flex items-center justify-center text-3xl font-bold shrink-0" style={{ color: 'var(--accent-contrast)' }}>
                {(profile?.full_name || profile?.username || user.email)?.[0]?.toUpperCase() || 'U'}
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">{profile?.full_name || profile?.username || user.email}</h1>
                <p className="text-[var(--text-muted)] text-sm">{user.email}</p>
                <div className="flex items-center gap-2 mt-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${tierInfo.color}`}>
                    {tierInfo.icon} {isID ? tierInfo.id : tierInfo.en}
                  </span>
                  {currentTier && (
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${currentTier.color}`}>
                      {currentTier.icon} {isID ? currentTier.nameId : currentTier.nameEn}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--accent)]/10 text-[var(--accent)]">
                    <Trophy size={12} /> {totalPoints} pts
                  </span>
                  {subscription?.active && (
                    <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--success)]/15 text-[var(--success)]">
                      ✓ {isID ? 'Langganan Aktif' : 'Active Subscription'}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-[var(--accent)]/10 text-[var(--accent)]">
                    <Calendar size={12} /> {user.created_at ? new Date(user.created_at).toLocaleDateString('id-ID') : 'Baru'}
                  </span>
                </div>
                {tierProgress.next && (
                  <div className="mt-3 flex items-center gap-2 max-w-sm">
                    <div className="flex-1 h-1.5 bg-[var(--border)] rounded-full overflow-hidden">
                      <div className="h-full bg-[var(--accent)] transition-all" style={{ width: `${tierProgress.pct}%` }} />
                    </div>
                    <span className="text-[10px] text-[var(--text-tertiary)] shrink-0">
                      {tierProgress.pct}% ke {isID ? tierProgress.next.nameId : tierProgress.next.nameEn}
                    </span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              {stats.map((s) => (
                <div key={s.label} className="text-center min-w-[110px]">
                  <p className="text-2xl font-bold">{s.value}</p>
                  <p className="text-xs text-[var(--text-tertiary)] flex items-center gap-1 justify-center"><s.icon size={12} /> {s.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mt-6 flex-wrap border-t border-[var(--border)] pt-4">
            {TABS.map((t) => {
              const labels: Record<string, string> = { overview: isID ? 'Ringkasan' : 'Overview', continue: isID ? 'Lanjut Nonton' : 'Continue Watching', watchlist: isID ? 'Watchlist' : 'Watchlist', history: isID ? 'Riwayat' : 'History', achievements: isID ? 'Achievement' : 'Achievements', leaderboard: 'Leaderboard', subscription: isID ? 'Langganan' : 'Subscription' }
              return (
                <button
                  key={t.key}
                  onClick={() => setTab(t.key)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5 ${
                    tab === t.key ? 'bg-[var(--accent)]' : 'glass-btn'
                  }`}
                  style={tab === t.key ? { color: 'var(--accent-contrast)' } : undefined}
                >
                  <t.icon size={14} /> {labels[t.key]}
                </button>
              )
            })}
            <div className="flex-1" />
            <button onClick={() => setTab('overview')} className="px-4 py-2 rounded-lg glass-btn text-sm font-medium flex items-center gap-1.5">
              <Settings size={14} /> {isID ? 'Pengaturan' : 'Settings'}
            </button>
            <button onClick={() => signOut()} className="px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-1.5 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
              <LogOut size={14} /> {isID ? 'Keluar' : 'Logout'}
            </button>
          </div>
        </div>

        {/* ===== OVERVIEW ===== */}
        {tab === 'overview' && (
          <div className="space-y-8">
            {continueWatching.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-4">{isID ? 'Lanjutkan Menonton' : 'Continue Watching'}</h2>
                <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
                  {continueWatching.map((p) => {
                    const pct = p.duration_seconds && p.duration_seconds > 0 ? Math.min(100, Math.round((p.progress_seconds || 0) / p.duration_seconds * 100)) : 0
                    return (
                      <Link key={`${p.tmdb_id}-${p.current_season || 1}-${p.current_episode || 1}`} href={`/${p.media_type === 'tv' ? 'tv' : 'movie'}/${p.tmdb_id}`} className="min-w-[200px] max-w-[200px] shrink-0">
                        <div className="glass-card rounded-xl overflow-hidden border border-[var(--border)] hover:border-[var(--accent)] transition-colors">
                          <div className="aspect-video bg-[var(--bg-elevated)] relative flex items-center justify-center">
                            <Play size={28} className="text-[var(--accent)]" />
                            {pct > 0 && (
                              <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--border)]">
                                <div className="h-full bg-[var(--accent)]" style={{ width: `${pct}%` }} />
                              </div>
                            )}
                          </div>
                          <div className="p-3">
                            <p className="text-sm font-medium truncate">{isID ? 'Lanjut di episode' : 'Continue'}{p.media_type === 'tv' ? ` S${p.current_season} E${p.current_episode}` : ''}</p>
                            <p className="text-xs text-[var(--text-tertiary)]">TMDB #{p.tmdb_id} • {Math.round(pct)}%</p>
                          </div>
                        </div>
                      </Link>
                    )
                  })}
                </div>
              </section>
            )}

            {history.length > 0 && (
              <section>
                <h2 className="text-lg font-semibold mb-4">{isID ? 'Aktivitas Terbaru' : 'Recent Activity'}</h2>
                <div className="space-y-2">
                  {history.slice(0, 8).map((h, i) => (
                    <div key={i} className="flex items-center gap-3 glass-card p-3 rounded-xl border border-[var(--border)]">
                      <div className="w-10 h-14 rounded-md bg-[var(--bg-elevated)] flex items-center justify-center shrink-0">
                        {h.media_type === 'tv' ? <Tv size={16} className="text-[var(--accent)]" /> : <Film size={16} className="text-[var(--accent)]" />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">TMDB #{h.tmdb_id} {h.media_type === 'tv' ? `• S${h.season_number || 1} E${h.episode_number || 1}` : ''}</p>
                        <p className="text-xs text-[var(--text-tertiary)]">{h.completed ? '✓ Selesai' : `${formatTime(h.duration_watched || 0)} ditonton`}</p>
                      </div>
                      <span className="text-xs text-[var(--text-tertiary)] shrink-0">{timeAgo(h.watched_at || '')}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {continueWatching.length === 0 && history.length === 0 && (
              <div className="text-center py-16">
                <TrendingUp size={48} className="mx-auto text-[var(--text-tertiary)] mb-4" />
                <h2 className="text-xl font-bold mb-2">{isID ? 'Belum Ada Aktivitas' : 'No Activity Yet'}</h2>
                <p className="text-[var(--text-muted)] mb-6 max-w-md mx-auto">{isID ? 'Tonton film atau series pertamamu dan mulai kumpulkan achievement!' : 'Watch your first movie or series and start earning achievements!'}</p>
                <Link href="/" className="btn-primary px-6 py-3">{isID ? 'Mulai Nonton' : 'Start Watching'}</Link>
              </div>
            )}
          </div>
        )}

        {/* ===== CONTINUE ===== */}
        {tab === 'continue' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {continueWatching.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <p className="text-[var(--text-muted)]">{isID ? 'Belum ada progress nonton.' : 'No watch progress yet.'}</p>
              </div>
            ) : continueWatching.map((p) => (
              <Link key={`${p.tmdb_id}-${p.current_season}-${p.current_episode}`} href={`/${p.media_type === 'tv' ? 'tv' : 'movie'}/${p.tmdb_id}`} className="glass-card rounded-xl overflow-hidden border border-[var(--border)] hover:border-[var(--accent)] transition-colors">
                <div className="aspect-video bg-[var(--bg-elevated)] relative flex items-center justify-center">
                  <Play size={32} className="text-[var(--accent)]" />
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-[var(--border)]">
                    <div className="h-full bg-[var(--accent)]" style={{ width: `${Math.min(100, Math.round((p.progress_seconds || 0) / (p.duration_seconds || 1) * 100))}%` }} />
                  </div>
                </div>
                <div className="p-3">
                  <p className="text-sm font-medium truncate">{p.media_type === 'tv' ? `S${p.current_season} E${p.current_episode}` : 'Film'}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">TMDB #{p.tmdb_id} • {Math.round(Math.min(100, (p.progress_seconds || 0) / (p.duration_seconds || 1) * 100))}%</p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* ===== WATCHLIST ===== */}
        {tab === 'watchlist' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {watchlist.length === 0 ? (
              <div className="col-span-full text-center py-16">
                <List size={48} className="mx-auto text-[var(--text-tertiary)] mb-4" />
                <p className="text-[var(--text-muted)] mb-4">{isID ? 'Watchlist kamu kosong.' : 'Your watchlist is empty.'}</p>
                <Link href="/" className="btn-primary px-6 py-3">{isID ? 'Jelajah Film' : 'Browse Movies'}</Link>
              </div>
            ) : (
              watchlist.map((w) => {
                const movie = { id: w.tmdb_id, tmdb_id: w.tmdb_id, title: w.title, poster_url: w.poster_url, media_type: w.media_type }
                return <MovieCard key={w.tmdb_id} movie={movie} />
              })
            )}
          </div>
        )}

        {/* ===== HISTORY ===== */}
        {tab === 'history' && (
          <div className="space-y-2">
            {history.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-[var(--text-muted)]">{isID ? 'Belum ada riwayat nonton.' : 'No watch history yet.'}</p>
              </div>
            ) : history.map((h, i) => (
              <div key={i} className="flex items-center gap-4 glass-card p-3 rounded-xl border border-[var(--border)]">
                <div className="w-12 h-16 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center shrink-0">
                  {h.media_type === 'tv' ? <Tv size={18} className="text-[var(--accent)]" /> : <Film size={18} className="text-[var(--accent)]" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">TMDB #{h.tmdb_id}</p>
                  <p className="text-xs text-[var(--text-tertiary)]">
                    {h.media_type === 'tv' ? `Season ${h.season_number || 1}, Episode ${h.episode_number || 1}` : 'Film'} • {h.completed ? 'Selesai' : `${formatTime(h.duration_watched || 0)}`}
                  </p>
                </div>
                <span className="text-xs text-[var(--text-tertiary)] shrink-0">{timeAgo(h.watched_at || '')}</span>
              </div>
            ))}
          </div>
        )}

        {/* ===== ACHIEVEMENTS ===== */}
        {tab === 'achievements' && (
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-lg font-semibold">{isID ? 'Achievement & Medal' : 'Achievements & Medals'}</h2>
              <div className="text-right">
                <p className="text-2xl font-bold text-[var(--accent)]">{totalPoints} <span className="text-xs font-normal text-[var(--text-tertiary)]">points</span></p>
                <p className="text-xs text-[var(--text-tertiary)]">{isID ? 'Reward points terkumpul' : 'Total reward points'}</p>
              </div>
            </div>
            <p className="text-sm text-[var(--text-muted)] mb-6">{isID ? 'Kumpulkan achievement dengan menonton film dan series di Zenflix. Setiap achievement memberi reward points.' : 'Earn achievements by watching movies and series on Zenflix. Each achievement gives reward points.'}</p>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {ACHIEVEMENTS.map((a) => {
                const unlocked = unlockedCodes.has(a.code)
                return (
                  <div key={a.code} className={`glass-card rounded-xl p-4 border text-center transition-all ${unlocked ? 'border-[var(--accent)]/60 bg-[var(--accent)]/5' : 'border-[var(--border)] opacity-70'}`}>
                    <div className="text-4xl mb-2">{a.icon}</div>
                    <h3 className="font-semibold text-sm mb-1">{isID ? a.nameId : a.nameEn}</h3>
                    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide ${TIER_COLORS[a.tier]}`}>{a.tierLabel}</span>
                    <p className="text-[10px] text-[var(--text-tertiary)] mt-1.5">+{a.reward} pts</p>
                    {unlocked && (
                      <div className="mt-2 text-xs font-semibold text-[var(--success)]">✓ {isID ? 'Terbuka' : 'Unlocked'}</div>
                    )}
                    {!unlocked && (
                      <div className="mt-2 text-[10px] text-[var(--text-tertiary)]">{isID ? a.descId : a.descEn}</div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* ===== LEADERBOARD ===== */}
        {tab === 'leaderboard' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <h2 className="text-lg font-semibold">Leaderboard</h2>
              <div className="flex gap-2">
                <select className="glass-btn px-3 py-1.5 text-sm" value={period} onChange={(e) => { setPeriod(e.target.value); fetchLeaderboard(e.target.value, metric) }}>
                  <option value="daily">Harian</option>
                  <option value="weekly">Mingguan</option>
                  <option value="monthly">Bulanan</option>
                  <option value="all_time">Semua Waktu</option>
                </select>
                <select className="glass-btn px-3 py-1.5 text-sm" value={metric} onChange={(e) => { setMetric(e.target.value); fetchLeaderboard(period, e.target.value) }}>
                  <option value="watch_time">Waktu Nonton</option>
                  <option value="films_watched">Film Ditonton</option>
                  <option value="series_watched">Series Ditonton</option>
                </select>
              </div>
            </div>

            {leaderboard.length === 0 ? (
              <div className="text-center py-16">
                <TrendingUp size={48} className="mx-auto text-[var(--text-tertiary)] mb-4" />
                <p className="text-[var(--text-muted)]">Belum ada data leaderboard untuk periode ini.</p>
                <p className="text-sm text-[var(--text-tertiary)] mt-2">Tonton film dan mulai naik peringkat!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {leaderboard.map((entry) => (
                  <div
                    key={entry.user_id}
                    className={`flex items-center gap-4 glass-card p-4 rounded-xl border transition-colors ${entry.user_id === user?.id ? 'border-[var(--accent)]/50 bg-[var(--accent)]/5' : 'border-[var(--border)]'}`}
                  >
                    <div className="w-10 shrink-0 text-center">
                      {entry.rank <= 3 ? (
                        <span className="text-2xl">
                          {entry.rank === 1 && '🥇'}
                          {entry.rank === 2 && '🥈'}
                          {entry.rank === 3 && '🥉'}
                        </span>
                      ) : (
                        <span className="text-lg font-bold text-[var(--text-tertiary)]">#{entry.rank}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">
                        {entry.username || `User ${entry.user_id.slice(0, 6)}`}
                        {entry.user_id === user?.id && <span className="text-[var(--accent)] text-xs ml-2">(kamu)</span>}
                      </p>
                      <p className="text-xs text-[var(--text-tertiary)]">
                        {metric === 'watch_time' ? `${formatTime(entry.watch_time)} total` : `${entry.films_watched} film • ${entry.series_watched} series`}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-lg">
                        {metric === 'watch_time' ? formatTime(entry.score) : entry.score}
                      </p>
                      <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wide">
                        {metric === 'watch_time' ? 'jam' : metric === 'films_watched' ? 'film' : 'series'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="text-center mt-4">
              <Link href="/leaderboard" className="text-sm text-[var(--accent)] hover:underline inline-flex items-center gap-1">
                <Trophy size={14} /> Lihat Leaderboard Lengkap
              </Link>
            </div>
          </div>
        )}

        {/* ===== SUBSCRIPTION ===== */}
        {tab === 'subscription' && (
          <div className="max-w-2xl">
            <div className="glass-card rounded-2xl p-6 border border-[var(--border)] mb-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div>
                  <p className="text-sm text-[var(--text-tertiary)] mb-1">{isID ? 'Paket Saat Ini' : 'Current Plan'}</p>
                  <p className="text-2xl font-bold capitalize flex items-center gap-2">
                    <span className={TIER_INFO[tierKey]?.icon || '🆓'} /> {tierKey}
                  </p>
                </div>
                <div className="text-right">
                  {subscription?.active ? (
                    <>
                      <p className="text-sm font-semibold text-[var(--success)]">✓ {isID ? 'Aktif' : 'Active'}</p>
                      {subscription.expires_at && (
                        <p className="text-xs text-[var(--text-muted)]">{isID ? 'Berakhir' : 'Expires'}: {new Date(subscription.expires_at).toLocaleDateString('id-ID')}</p>
                      )}
                    </>
                  ) : (
                    <p className="text-sm font-semibold text-[var(--text-tertiary)]">{isID ? 'Tidak aktif' : 'Inactive'}</p>
                  )}
                </div>
              </div>
            </div>
            <Link href="/subscribe" className="btn-primary px-6 py-3 inline-flex items-center gap-2">
              <Crown size={16} /> {isID ? 'Lihat Paket / Upgrade' : 'View Plans / Upgrade'}
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}