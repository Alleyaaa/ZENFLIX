'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabase'
import { Check, Play, Loader2, AlertCircle, X, ShieldCheck } from 'lucide-react'

interface Tier {
  name: string
  price: number
  priceLabel: string
  desc: string
  features: string[]
  icon: 'play' | 'x'
  popular?: boolean
}

const TIERS: Tier[] = [
  {
    name: 'Gratis',
    price: 0,
    priceLabel: 'Rp0',
    desc: 'Nonton semua film & series, dengan iklan.',
    icon: 'play',
    features: ['Semua film & series', 'Kualitas HD 720p', 'Dengan iklan (video + banner)', '1 perangkat'],
  },
  {
    name: 'Remove Ads',
    price: 20000,
    priceLabel: 'Rp20.000',
    desc: 'Hilangkan iklan selamanya, nonton makin nyaman.',
    icon: 'x',
    popular: true,
    features: ['Bebas iklan 100%', 'Kualitas Full HD 1080p', 'Semua film & series', '2 perangkat bersamaan', 'Support prioritas'],
  },
]

export default function PortalSubscribe() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handleSubscribe = async (tier: Tier) => {
    if (tier.price === 0) {
      router.push('/')
      return
    }
    setError('')
    setLoading(tier.name)
    try {
      const { data: { user: authUser } } = await supabase.auth.getUser()
      if (!authUser) {
        router.push('/auth')
        return
      }
      const res = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: authUser.id,
          email: authUser.email,
          name: authUser.email?.split('@')[0] || 'User',
          tier: tier.name.toLowerCase().replace(' ', '_'),
          amount: tier.price,
        }),
      })
      const data = await res.json()
      if (data.token) {
        const snap = (window as any).snap
        if (snap?.pay) {
          snap.pay(data.token)
        } else {
          setError('Pembayaran belum siap. Muat ulang halaman lalu coba lagi.')
        }
      } else if (data.redirect_url) {
        window.location.assign(data.redirect_url)
      } else {
        setError(data.error || 'Terjadi kesalahan saat memproses pembayaran.')
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Terjadi kesalahan. Coba lagi.')
    } finally {
      setLoading(null)
    }
  }

  const TierIcon = ({ type }: { type: 'play' | 'x' }) => {
    if (type === 'play') return <Play size={20} className="text-[var(--text-muted)]" />
    return <X size={20} className="text-[var(--accent)]" />
  }

  return (
    <>
      <script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.MIDTRANS_CLIENT_KEY}
        async
      />
      <Header />
      <main className="min-h-screen pt-24 pb-20">
        <div className="max-w-[1000px] mx-auto px-4 text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-black mb-3 gradient-text">Pilih Paket Langganan</h1>
          <p className="text-[var(--text-muted)] max-w-xl mx-auto">Mulai gratis, atau hilangkan iklan cuma Rp20.000/bulan.</p>
        </div>

        {error && (
          <div className="max-w-[1000px] mx-auto px-4 mb-6">
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-xl">
              <AlertCircle size={16} /> {error}
            </div>
          </div>
        )}

        <div className="max-w-[1000px] mx-auto px-4 grid grid-cols-1 md:grid-cols-2 gap-5">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`relative glass-card rounded-2xl p-6 flex flex-col transition-all ${
                tier.popular ? 'border-2 border-[var(--accent)] shadow-[0_0_40px_var(--accent-glow)]' : 'border border-[var(--border)] hover:border-[var(--accent)]/50'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-md bg-[var(--accent)] text-xs font-bold" style={{ color: 'var(--accent-contrast)' }}>
                  TERPOPULER
                </div>
              )}
              <div className="mb-5">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${tier.popular ? 'bg-gradient-to-br from-[var(--accent)] to-[var(--accent)]/80' : 'bg-[var(--bg-elevated)]'}`}>
                  <TierIcon type={tier.icon} />
                </div>
                <h3 className="text-lg font-bold">{tier.name}</h3>
              </div>
              <p className="text-xs text-[var(--text-muted)] mb-4">{tier.desc}</p>
              <div className="mb-5">
                <span className="text-3xl font-bold">{tier.priceLabel}</span>
                {tier.price > 0 && <span className="text-xs text-[var(--text-tertiary)] ml-1">/bln</span>}
              </div>
              <div className="space-y-2 mb-6 flex-1">
                {tier.features.map((f) => (
                  <div key={f} className="flex items-start gap-2 text-sm">
                    <ShieldCheck size={15} className="text-[var(--success)] shrink-0 mt-0.5" />
                    <span className="text-[var(--text-muted)]">{f}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => handleSubscribe(tier)}
                disabled={loading === tier.name}
                className={`w-full py-2.5 rounded-xl text-sm font-medium ${tier.popular ? 'btn-primary' : 'glass-btn'} ${loading === tier.name ? 'opacity-50' : ''}`}
              >
                {loading === tier.name ? 'Memproses...' : tier.price === 0 ? 'Mulai Gratis' : `Pilih ${tier.name}`}
              </button>
            </div>
          ))}
        </div>
      </main>
    </>
  )
}