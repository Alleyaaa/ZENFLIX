'use client'
import { useState, useEffect } from 'react'
import { useAuth } from './AuthProvider'
import { X } from 'lucide-react'
import Link from 'next/link'

interface AdSlotProps {
  slot: 'home_hero' | 'between_rows' | 'player_pre_roll' | 'sidebar' | 'genre_page_top' | 'inline'
  className?: string
  format?: 'banner' | 'leaderboard' | 'rect' | 'skyscraper' | 'inline'
}

// Ads hanya untuk user free / belum login.
// Premium/Ultimate = tanpa iklan (R-21 friendly).
export default function AdSlot({ slot, className = '', format = 'banner' }: AdSlotProps) {
  const { user } = useAuth()
  const [ads, setAds] = useState<any[]>([])
  const [visible, setVisible] = useState(true)
  const [isPremium, setIsPremium] = useState(false)
  const [impressionSent, setImpressionSent] = useState(false)

  // Cek apakah user premium (dari localStorage tier session)
  useEffect(() => {
    try {
      const tier = localStorage.getItem('zenflix-tier')
      setIsPremium(tier === 'premium' || tier === 'ultimate')
    } catch {}
  }, [user])

  // Load ads dari Supabase
  useEffect(() => {
    if (isPremium) return
    let cancelled = false
    const loadAds = async () => {
      try {
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
        const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        const res = await fetch(`${url}/rest/v1/ads_config?slot=eq.${slot}&enabled=eq.true&select=id,html_content,priority,slot`, {
          headers: { apikey: anon, Authorization: `Bearer ${anon}` },
        })
        if (!cancelled && res.ok) {
          const data = await res.json()
          setAds(data || [])
        }
      } catch {}
    }
    loadAds()
    return () => { cancelled = true }
  }, [slot, isPremium])

  // Send impression
  useEffect(() => {
    if (impressionSent || ads.length === 0 || isPremium || !visible) return
    try {
      const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      fetch(`${url}/rest/v1/ad_impressions`, {
        method: 'POST',
        headers: { apikey: anon, Authorization: `Bearer ${anon}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ ad_id: ads[0].id, user_id: user?.id || null }),
      }).catch(() => {})
      setImpressionSent(true)
    } catch {}
  }, [ads, isPremium, visible, impressionSent, user])

  // Premium user: sembunyikan semua iklan
  if (isPremium) return null

  // No ad configured: tampilkan placeholder banner "Zenflix Premium" (CTA upgrade)
  if (ads.length === 0) {
    if (format === 'inline' || !visible) return null
    return (
      <div className={`relative overflow-hidden rounded-xl border border-[var(--border)] bg-gradient-to-r from-[var(--accent-dim)] to-transparent ${className}`}>
        <button onClick={() => setVisible(false)} className="absolute top-2 right-2 p-1 rounded-full hover:bg-[var(--border)]/30 transition-colors z-10" aria-label="Tutup iklan">
          <X size={14} className="text-[var(--text-tertiary)]" />
        </button>
        <Link href="/subscribe" className="flex items-center justify-between gap-4 p-5 min-h-[90px]">
          <div>
            <p className="font-bold text-sm">Nonton Tanpa Iklan ✨</p>
            <p className="text-xs text-[var(--text-muted)] mt-1">Upgrade ke Zenflix Premium untuk pengalaman bebas iklan</p>
          </div>
          <span className="px-4 py-2 rounded-lg btn-primary text-sm shrink-0">Upgrade</span>
        </Link>
      </div>
    )
  }

  // Tampilkan ad content
  return (
    <div className={`relative overflow-hidden rounded-xl border border-[var(--border)] bg-[var(--bg-surface)] ${className}`}>
      <button onClick={() => setVisible(false)} className="absolute top-2 right-2 p-1 rounded-full hover:bg-[var(--border)]/30 transition-colors z-10" aria-label="Tutup iklan">
        <X size={14} className="text-[var(--text-tertiary)]" />
      </button>
      {ads.map((ad) => (
        <div key={ad.id} className="min-h-[90px] flex items-center justify-center text-center p-4" dangerouslySetInnerHTML={{ __html: ad.html_content }} />
      ))}
      <p className="text-[10px] text-center text-[var(--text-tertiary)] pb-2">Iklan • <Link href="/subscribe" className="underline">Bebas iklan dengan Premium</Link></p>
    </div>
  )
}