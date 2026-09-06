'use client'
import { useState } from 'react'
import Header from '@/components/Header'
import { useAuth } from '@/components/AuthProvider'
import { Check, Crown, Play, Monitor, Sparkles, Loader2, AlertCircle } from 'lucide-react'

interface Tier {
  name: string
  price: number
  priceLabel: string
  desc: string
  features: string[]
  icon: typeof Crown
  popular?: boolean
}

const TIERS: Tier[] = [
  {
    name: 'Free',
    price: 0,
    priceLabel: 'Gratis',
    desc: 'Coba Zenflix tanpa biaya.',
    icon: Play,
    features: ['Kualitas 720p', 'Akses judul terbatas', 'Dengan iklan'],
  },
  {
    name: 'Standard',
    price: 50000,
    priceLabel: 'Rp50.000',
    desc: 'Untuk nonton rutin setiap hari.',
    icon: Monitor,
    features: ['Full HD 1080p', 'Tanpa iklan', '100 judul per bulan'],
  },
  {
    name: 'Premium',
    price: 100000,
    priceLabel: 'Rp100.000',
    desc: 'Pengalaman menonton terbaik.',
    icon: Crown,
    popular: true,
    features: ['4K Ultra HD', 'Tanpa iklan', 'Tak terbatas', 'Download offline', '2 perangkat'],
  },
  {
    name: 'Ultimate',
    price: 150000,
    priceLabel: 'Rp150.000',
    desc: 'Untuk seluruh keluarga.',
    icon: Sparkles,
    features: ['4K Ultra HD', 'Tanpa iklan', 'Tak terbatas', '4 perangkat', 'Akses awal rilis baru'],
  },
]

export default function Subscribe() {
  const { user } = useAuth()
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  const handleSubscribe = async (tier: Tier) => {
    if (tier.price === 0) return
    setError('')
    setLoading(tier.name)
    try {
      const res = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: user?.id || 'demo',
          email: user?.email || 'demo@zenflix.id',
          name: user?.email?.split('@')[0] || 'Demo User',
          tier: tier.name.toLowerCase(),
          amount: tier.price,
        }),
      })
      const data = await res.json()
      if (data.token) {
        // Midtrans Snap di-load global via data-client-key dari env
        const snap: any = (window as any).snap
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

  return (
    <>
      <script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY}
        async
      />
      <Header />
      <main className="min-h-screen pt-24 pb-20">
        <div className="max-w-[1200px] mx-auto px-4 text-center mb-14">
          <h1 className="text-3xl md:text-5xl font-bold mb-3">Pilih Paket Langganan</h1>
          <p className="text-[var(--text-muted)] max-w-2xl mx-auto">
            {user ? `Selamat datang, ${user.email}. Pilih paket untuk mulai menonton tanpa batas.` : 'Masuk dulu untuk berlangganan, atau pilih paket dan selesaikan pembayaran.'}
          </p>
        </div>

        {error && (
          <div className="max-w-[1200px] mx-auto px-4 mb-6">
            <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-xl">
              <AlertCircle size={16} /> {error}
            </div>
          </div>
        )}

        <div className="max-w-[1200px] mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {TIERS.map((tier) => (
            <div
              key={tier.name}
              className={`relative glass-card rounded-xl p-6 flex flex-col ${
                tier.popular ? 'border-2 border-[var(--accent)]' : 'border border-[var(--border)]'
              }`}
            >
              {tier.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-md bg-[var(--accent)] text-xs font-bold" style={{ color: 'var(--accent-contrast)' }}>
                  TERPOPULER
                </div>
              )}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-lg bg-[var(--bg-elevated)] flex items-center justify-center">
                  <tier.icon size={20} className="text-[var(--accent)]" />
                </div>
                <h3 className="text-lg font-bold">{tier.name}</h3>
              </div>
              <p className="text-xs text-[var(--text-muted)] mb-4">{tier.desc}</p>
              <div className="mb-5">
                <span className="text-3xl font-bold">{tier.priceLabel}</span>
                {tier.price > 0 && <span className="text-xs text-[var(--text-tertiary)] ml-1">/bulan</span>}
              </div>
              <div className="space-y-2 mb-6 flex-1">
                {tier.features.map((f) => (
                  <div key={f} className="flex items-start gap-2 text-sm">
                    <Check size={15} className="text-[var(--success)] shrink-0 mt-0.5" />
                    <span className="text-[var(--text-muted)]">{f}</span>
                  </div>
                ))}
              </div>
              <button
                onClick={() => handleSubscribe(tier)}
                disabled={loading === tier.name || tier.price === 0}
                className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all ${
                  tier.popular
                    ? 'btn-primary'
                    : 'glass-btn'
                } ${loading === tier.name ? 'opacity-50 cursor-not-allowed' : ''} ${tier.price === 0 ? 'opacity-60 cursor-not-allowed' : ''}`}
              >
                {loading === tier.name ? (
                  <span className="inline-flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Memproses...</span>
                ) : (
                  tier.price === 0 ? 'Sudah Termasuk' : `Pilih ${tier.name}`
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="max-w-[1200px] mx-auto px-4 mt-14">
          <div className="glass-card rounded-xl p-5 border border-[var(--border)] text-center">
            <div className="flex flex-wrap gap-5 justify-center mb-2 text-sm text-[var(--text-muted)]">
              <span>Kartu Kredit / Debit</span>
              <span>Transfer Bank</span>
              <span>QRIS</span>
              <span>GoPay, OVO, Dana</span>
            </div>
            <p className="text-xs text-[var(--text-tertiary)]">Pembayaran diproses aman via Midtrans</p>
          </div>
        </div>
      </main>
    </>
  )
}