'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import { useAuth } from '@/components/AuthProvider'
import { Trophy, Clock, Film, Tv, Medal, Crown, User2 } from 'lucide-react'

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

const MEDALS = ['text-yellow-400', 'text-gray-300', 'text-amber-600']

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
      <main className="max-w-[1200px] mx-auto px-4 py-6 md:pt-24 pb-16">
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2 inline-flex items-center gap-2">
            <Trophy className="text-[var(--accent)]" size={32} /> Leaderboard
          </h1>
          <p className="text-[var(--text-muted)]">Siapa paling banyak nonton di Zenflix</p>
        </div>

        {/* Period filter */}
        <div className="flex justify-center gap-2 mb-6 flex-wrap">
          {PERIODS.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${period === p.key ? 'bg-[var(--accent)]' : 'glass-btn'}`}
              style={period === p.key ? { color: 'var(--accent-contrast)' } : undefined}
            >
              {p.key === 'daily' ? 'Harian' : p.key === 'weekly' ? 'Mingguan' : p.key === 'monthly' ? 'Bulanan' : 'Semua Waktu'}
            </button>
          ))}
        </div>

        {/* Metric filter */}
        <div className="flex justify-center gap-2 mb-8 flex-wrap">
          {METRICS.map(m => (
            <button
              key={m.key}
              onClick={() => setMetric(m.key)}
              className={`px-4 py-2 rounded-lg text-sm flex items-center gap-1.5 transition-all ${metric === m.key ? 'bg-[var(--accent)]' : 'glass-btn'}`}
              style={metric === m.key ? { color: 'var(--accent-contrast)' } : undefined}
            >
              <m.icon size={14} /> {m.key === 'watch_time' ? 'Waktu Nonton' : m.key === 'films_watched' ? 'Film' : 'Series'}
            </button>
          ))}
        </div>

        {error && <p className="text-center text-red-400">{error}</p>}
        {loading && (
          <div className="flex justify-center py-16">
            <div className="w-10 h-10 border-2 border-[var(--accent)] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!loading && !error && (
          <>
            {myEntry && myEntry.rank <= 10 && (
              <div className="glass-card rounded-2xl p-4 mb-6 border border-[var(--accent)]/40 bg-[var(--accent)]/5 flex items-center gap-4">
                <Medal className="text-[var(--accent)]" size={28} />
                <div>
                  <p className="font-bold">{myEntry.rank === 1 ? 'Posisi #1!' : `Peringkat #${myEntry.rank} kamu`}</p>
                  <p className="text-sm text-[var(--text-muted)]">
                    {metric === 'watch_time' ? `Total ${formatTime(myEntry.score)}` : `${myEntry.score} ditonton`}
                  </p>
                </div>
              </div>
            )}

            <div className="space-y-2">
              {data.map((entry) => (
                <div
                  key={entry.user_id}
                  className={`flex items-center gap-4 glass-card p-4 rounded-xl border transition-colors ${entry.user_id === user?.id ? 'border-[var(--accent)]/50 bg-[var(--accent)]/5' : 'border-[var(--border)]'}`}
                >
                  {/* Rank */}
                  <div className="w-10 shrink-0 text-center">
                    {entry.rank <= 3 ? (
                      <Crown className={`mx-auto ${MEDALS[entry.rank - 1]}`} size={24} />
                    ) : (
                      <span className="text-lg font-bold text-[var(--text-tertiary)]">{entry.rank}</span>
                    )}
                  </div>
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-[var(--bg-elevated)] flex items-center justify-center shrink-0">
                    {entry.avatar_url ? (
                      <img src={entry.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User2 size={18} className="text-[var(--text-muted)]" />
                    )}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold truncate">
                      {entry.username || 'Pengguna'}
                      {entry.user_id === user?.id && <span className="text-[var(--accent)] text-xs ml-2">(kamu)</span>}
                    </p>
                    <p className="text-xs text-[var(--text-tertiary)]">
                      {metric === 'watch_time' ? `${formatTime(entry.watch_time)} total` : `${entry.films_watched} film • ${entry.series_watched} series`}
                    </p>
                  </div>
                  {/* Score */}
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
              {data.length === 0 && (
                <div className="text-center py-16">
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