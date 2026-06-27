'use client'
import { useState, useEffect } from 'react'
import Header from '@/components/Header'
import FloatingNav from '@/components/FloatingNav'
import { useAuth } from '@/components/AuthProvider'
import { Heart, List, X } from 'lucide-react'
import Link from 'next/link'

function SubscriptionPopup({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="glass-panel w-full max-w-sm rounded-3xl p-6 relative border border-white/10 shadow-2xl" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-3 right-3 p-1.5 rounded-full hover:bg-white/10 transition-colors">
          <X size={18} />
        </button>
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center mx-auto mb-3">
            <Heart size={28} className="text-purple-400" />
          </div>
          <h2 className="text-xl font-bold mb-1">Go Premium</h2>
          <p className="text-sm text-[var(--text-muted)]">Unlock 4K, Ad-free & Unlimited access</p>
        </div>
        <div className="space-y-3 mb-6">
          {[
            { name: 'Premium — Rp100.000/bln', features: '4K, No Ads, Unlimited, 2 Devices' },
            { name: 'Ultimate — Rp150.000/bln', features: '4K, No Ads, VIP, 4 Devices' },
          ].map((plan, i) => (
            <Link key={i} href="/subscribe" className="block glass-card p-4 rounded-xl border border-white/5 hover:border-purple-500/30 transition-all">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-sm">{plan.name}</span>
                <span className="text-xs text-[var(--text-muted)]">{plan.features}</span>
              </div>
            </Link>
          ))}
        </div>
        <Link href="/subscribe" className="block w-full text-center py-3 rounded-xl bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold hover:opacity-90 transition-opacity text-sm">
          See All Plans
        </Link>
      </div>
    </div>
  )
}

export default function HomePage() {
  const [showSubPopup, setShowSubPopup] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [favorites, setFavorites] = useState<any[]>([])
  const [watchlist, setWatchlist] = useState<any[]>([])

  useEffect(() => {
    const f = localStorage.getItem('zenflix-favorites')
    const w = localStorage.getItem('zenflix-watchlist')
    if (f) setFavorites(JSON.parse(f))
    if (w) setWatchlist(JSON.parse(w))
  }, [])

  useEffect(() => {
    const timer = setTimeout(() => setShowSubPopup(true), 30000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
      {showSubPopup && <SubscriptionPopup onClose={() => setShowSubPopup(false)} />}
      <Header />
      <FloatingNav />

      {/* Floating Menu FAB */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 items-end">
        {!minimized && (
          <div className="glass-panel rounded-2xl p-3 w-72 shadow-2xl border border-white/10 mb-2">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-[var(--text-muted)] uppercase tracking-wider">Quick Menu</p>
              <button onClick={() => setMinimized(true)} className="p-1 rounded hover:bg-white/10"><X size={14} /></button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Link href="/category/now_playing" className="glass-card rounded-xl p-3 text-center text-xs hover:border-white/20 transition-all">🎬<br />Now Playing</Link>
              <Link href="/category/series" className="glass-card rounded-xl p-3 text-center text-xs hover:border-white/20 transition-all">📺<br />Series</Link>
              <Link href="/category/anime" className="glass-card rounded-xl p-3 text-center text-xs hover:border-white/20 transition-all">🎌<br />Anime</Link>
              <Link href="/category/popular" className="glass-card rounded-xl p-3 text-center text-xs hover:border-white/20 transition-all">🔥<br />Popular</Link>
            </div>
            <div className="mt-3 flex gap-4 text-xs">
              <span className="text-[var(--text-muted)] flex items-center gap-1"><Heart size={12} /> {favorites.length}</span>
              <span className="text-[var(--text-muted)] flex items-center gap-1"><List size={12} /> {watchlist.length}</span>
            </div>
          </div>
        )}
        <button onClick={() => setMinimized(!minimized)} className="glass-panel w-14 h-14 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-all border border-white/10">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 6h16M4 12h16M4 18h16" /></svg>
        </button>
      </div>

      <main className="min-h-screen">
        <section className="h-screen flex flex-col items-center justify-center text-center px-4 relative">
          <h1 className="text-6xl md:text-8xl font-bold tracking-tight mb-4 gradient-text leading-none">ZENFLIX</h1>
          <p className="text-lg md:text-xl text-[var(--text-muted)] mb-8 max-w-2xl">Stream 7.700+ movies & series in stunning HD.</p>
          <div className="flex gap-3">
            <Link href="/category/popular" className="btn-primary text-base px-8 py-3">Mulai Nonton</Link>
            <button onClick={() => setShowSubPopup(true)} className="glass-btn px-8 py-3 rounded-full text-base font-semibold">Upgrade Premium</button>
          </div>
        </section>
      </main>
    </>
  )
}