'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import { useAuth } from '@/components/AuthProvider'
import { Trophy, Clock, Film, Tv, User2, Crown, Medal } from 'lucide-react'

interface LeaderboardEntry {
  rank: number
  user_id: string
  username?: string
  avatar_url?: string | null
  watch_time: number
  films_watched: number
  series_watched: number
  score: number
}

const PERIODS = [
  { key: 'daily', id: 'Harian', en: 'Daily' },
  { key: 'weekly', id: 'Mingguan', en: 'Weekly' },
  { key: 'monthly', id: 'Bulanan', en: 'Monthly' },
  { key: 'all_time', id: 'Semua Waktu', en: 'All Time' },
]

const METRICS = [
  { key: 'watch_time', id: 'Waktu Nonton', en: 'Watch Time', icon: Clock },
  { key: 'films_watched', id: 'Film Ditonton', en: 'Films Watched', icon: Film },
  { key: 'series_watched', id: 'Series Ditonton', en: 'Series Watched', icon: Tv },
]

function formatTime(seconds: number) {
  const h = Math.floor(seconds / 3600)
  const m = Math.floor((seconds % 3600) / 60)
  if (h > 0) return `${h}j ${m}m`
  return `${m}m`
}

const RANK_STYLES = [
  { bg: 'rgba(245,197,24,0.2)', color: '#f5c518', label: 'Emas' },
  { bg: 'rgba(156,163,175,0.18)', color: '#c0c6d4', label: 'Perak' },
  { bg: 'rgba(217,119,6,0.18)', color: '#d97706', label: 'Perunggu' },
]

export default function LeaderboardPage() {
  const { user } = useAuth()
  const [period, setPeriod] = useState('weekly')
  const [metric, setMetric] = useState('watch_time')
  const [data, setData] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError('')
    fetch(`/api/leaderboard?period=${period}&metric=${metric}&limit=20`)
      .then(r => r.json())
      .then(json => {
        if (cancelled) return
        setData(json.results || [])
        setLoading(false)
      })
      .catch(() => {
        if (!cancelled) {
          setError('Gagal memuat leaderboard')
          setLoading(false)
        }
      })
    return () => { cancelled = true }
  }, [period, metric])

  const myEntry = data.find(d => d.user_id === user?.id)

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-[1100px] mx-auto px-4 pt-24 pb-20">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl glass-panel mb-4">
            <Trophy className="text-[var(--accent)]" size={32} />
          </div>
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Leaderboard</h1>
          <p className="text-[var(--text-muted)]">Siapa paling banyak nonton di Zenflix</p>
        </div>

        {/* Filter panel: glass menyatu */}
        <div className="glass-panel rounded-2xl p-5 mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            {/* Periode */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-[var(--text-tertiary)] self-center mr-1">Periode:</span>
              {PERIODS.map(p => (
                <button
                  key={p.key}
                  onClick={() => setPeriod(p.key)}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    period === p.key ? 'bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold' : 'glass-btn text-[var(--text-muted)]'
                  }`}
                >
                  {p.id}
                </button>
              ))}
            </div>
            {/* Metrik */}
            <div className="flex flex-wrap gap-2">
              <span className="text-xs text-[var(--text-tertiary)] self-center mr-1">Metrik:</span>
              {METRICS.map(m => (
                <button
                  key={m.key}
                  onClick={() => setMetric(m.key)}
                  className={`px-4 py-1.5 rounded-lg text-sm flex items-center gap-1.5 font-medium transition-all ${
                    metric === m.key ? 'bg-[var(--accent)] text-[var(--accent-contrast)] font-semibold' : 'glass-btn text-[var(--text-muted)]'
                  }`}
                >
                  <m.icon size={14} /> {m.id}
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && <p className="text-center text-red-400 mb-6">{error}</p>}
        {loading && (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && !error && (
          <>
            {/* Peringkatku */}
            {myEntry && (
              <div className="glass-panel rounded-2xl p-4 mb-6 flex items-center gap-4 border border-[var(--accent)]/30">
                <Medal className="text-[var(--accent)] shrink-0" size={24} />
                <div className="flex-1">
                  <p className="font-bold">
                    {myEntry.rank === 1 ? 'Posisi #1!' : `Peringkat #${myEntry.rank} kamu`}
                  </p>
                  <p className="text-sm text-[var(--text-muted)]">
                    {metric === 'watch_time' ? `Total ${formatTime(myEntry.score)}` : `${myEntry.score} judul`}
                  </p>
                </div>
                <button
                  onClick={() => document.getElementById('papan')?.scrollIntoView({ behavior: 'smooth' })}
                  className="text-xs text-[var(--accent)] hover:underline shrink-0"
                >
                  Lihat Papan →
                </button>
              </div>
            )}

            {/* Podium top 3: glass full, emas/perak/perunggu */}
            <div id="papan" className="space-y-3">
              {data.slice(0, 3).map((entry, i) => {
                const st = RANK_STYLES[i]
                return (
                  <div
                    key={entry.user_id}
                    className={`glass-panel rounded-2xl p-5 flex items-center gap-4 transition-all hover:border-[var(--accent)]/30 ${
                      entry.user_id === user?.id ? 'border-[var(--accent)]/50' : ''
                    }`}
                  >
                    <div
                      className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shrink-0"
                      style={{ background: st.bg, color: st.color }}
                    >
                      {i === 0 ? <Crown size={22} /> : <span>#{entry.rank}</span>}
                    </div>
                    <div className="w-12 h-12 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center shrink-0 overflow-hidden">
                      {entry.avatar_url ? (
                        <img src={entry.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <User2 size={20} className="text-[var(--text-muted)]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">
                        {entry.username || 'Pengguna'}
                        {entry.user_id === user?.id && <span className="text-[var(--accent)] text-xs ml-2">(kamu)</span>}
                      </p>
                      <p className="text-xs text-[var(--text-tertiary)]">
                        Peringkat {st.label} • {metric === 'watch_time' ? formatTime(entry.score) : `${entry.score} judul`}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-lg">{metric === 'watch_time' ? formatTime(entry.score) : entry.score}</p>
                      <p className="text-[10px] text-[var(--text-tertiary)] uppercase tracking-wide">
                        {metric === 'watch_time' ? 'jam' : metric === 'films_watched' ? 'film' : 'series'}
                      </p>
                    </div>
                  </div>
                )
              })}

              {/* Sisa peringkat: list glass tipis */}
              {data.slice(3).map((entry) => (
                <div
                  key={entry.user_id}
                  className={`glass-card rounded-xl px-4 py-3 flex items-center gap-3 ${
                    entry.user_id === user?.id ? 'border-[var(--accent)]/50' : ''
                  }`}
                >
                  <span className={`w-8 text-center text-sm font-bold ${entry.rank <= 10 ? 'text-[var(--accent)]' : 'text-[var(--text-tertiary)]'}`}>
                    {entry.rank}
                  </span>
                  <div className="w-8 h-8 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center shrink-0 overflow-hidden">
                    {entry.avatar_url ? (
                      <img src={entry.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User2 size={14} className="text-[var(--text-muted)]" />
                    )}
                  </div>
                  <span className="flex-1 min-w-0 truncate text-sm font-medium">
                    {entry.username || 'Pengguna'}
                    {entry.user_id === user?.id && <span className="text-[var(--accent)] text-xs ml-2">(kamu)</span>}
                  </span>
                  <span className="text-sm font-semibold shrink-0">
                    {metric === 'watch_time' ? formatTime(entry.score) : entry.score}
                  </span>
                </div>
              ))}

              {data.length === 0 && (
                <div className="glass-panel rounded-2xl py-16 text-center mt-6">
                  <Trophy size={48} className="mx-auto text-[var(--text-tertiary)] mb-4" />
                  <p className="text-[var(--text-muted)]">Belum ada data leaderboard untuk periode ini.</p>
                  <p className="text-sm text-[var(--text-tertiary)] mt-2">Tonton film dan mulai naik peringkat!</p>
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </div>
  )
}