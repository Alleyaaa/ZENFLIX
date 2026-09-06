'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from './AuthProvider'
import { Trophy, X } from 'lucide-react'
import { ACHIEVEMENTS, getTierByPoints } from '@/lib/achievements'

interface AchievementToastProps {
  // Trigger langsung (dari luar)
  trigger?: { code: string } | null
}

// Toast notifikasi achievement di pojok kanan bawah.
// Otomatis tampil saat user unlock achievement baru (dari watch_history / progress).
export default function AchievementToast({ trigger }: AchievementToastProps) {
  const { user } = useAuth()
  const [current, setCurrent] = useState<{ code: string; name: string; icon: string; tierLabel: string } | null>(null)
  const [visible, setVisible] = useState(false)
  const [queue, setQueue] = useState<string[]>([])
  const shownRef = useRef<Set<string>>(new Set())
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Poll achievements baru (tiap 45 detik) saat user login
  useEffect(() => {
    if (!user) return
    let cancelled = false
    const check = async () => {
      try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        const res = await fetch(`${url}/rest/v1/user_achievements?user_id=eq.${user.id}&select=achievement_id,unlocked_at&order=unlocked_at.desc`, {
          headers: { apikey: anon, Authorization: `Bearer ${anon}` },
        })
        if (!cancelled && res.ok) {
          const rows = await res.json()
          const newCodes: string[] = []
          for (const row of rows || []) {
            const ach = ACHIEVEMENTS.find(a => a.code === row.achievement_id || a.code === row.achievement_code)
            if (ach && !shownRef.current.has(ach.code)) {
              newCodes.push(ach.code)
            }
          }
          if (newCodes.length > 0) {
            setQueue(prev => [...prev, ...newCodes])
          }
        }
      } catch {}
    }
    check()
    const interval = setInterval(check, 45000)
    return () => { cancelled = true; clearInterval(interval) }
  }, [user])

  // Handle trigger eksternal
  useEffect(() => {
    if (trigger?.code && !shownRef.current.has(trigger.code)) {
      setQueue(prev => [...prev, trigger.code])
    }
  }, [trigger])

  // Proses queue
  useEffect(() => {
    if (visible || queue.length === 0) return
    const code = queue[0]
    const ach = ACHIEVEMENTS.find(a => a.code === code)
    if (!ach) {
      setQueue(prev => prev.slice(1))
      return
    }
    shownRef.current.add(code)
    setCurrent({ code, name: ach.nameId, icon: ach.icon, tierLabel: ach.tierLabel })
    setVisible(true)
    setQueue(prev => prev.slice(1))

    timerRef.current = setTimeout(() => {
      setVisible(false)
      setCurrent(null)
    }, 5000)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [queue, visible])

  const dismiss = useCallback(() => {
    setVisible(false)
    setCurrent(null)
    if (timerRef.current) clearTimeout(timerRef.current)
  }, [])

  if (!visible || !current) return null

  return (
    <div className="fixed bottom-5 right-5 z-[100] animate-in slide-in-from-bottom-4 fade-in-0 duration-300">
      <div className="glass-panel rounded-xl p-4 shadow-2xl border border-[var(--accent)]/40 bg-[var(--bg-surface)] max-w-xs">
        <div className="flex items-start gap-3">
          <div className="w-12 h-12 rounded-lg bg-[var(--accent)]/15 flex items-center justify-center text-2xl shrink-0">
            {current.icon}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-0.5">
              <Trophy size={13} className="text-[var(--accent)]" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--accent)]">Achievement Unlocked</span>
            </div>
            <p className="font-bold text-sm leading-tight">{current.name}</p>
            <p className="text-[11px] text-[var(--text-muted)] mt-0.5">{current.tierLabel} • +reward points</p>
          </div>
          <button onClick={dismiss} className="p-1 rounded-full hover:bg-[var(--border)]/30 transition-colors shrink-0" aria-label="Tutup">
            <X size={14} className="text-[var(--text-tertiary)]" />
          </button>
        </div>
      </div>
    </div>
  )
}