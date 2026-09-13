'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabase'
import { Check, Play, Loader2, AlertCircle, Sparkles, X, Zap, ShieldCheck } from 'lucide-react'

// Paket sederhana: Gratis (dengan iklan) vs Remove Ads (Rp20rb)
// Premium/Ultimate dihapus — sesuai feedback: cuma remove ads
interface Tier {
  name: string
  price: number
  priceLabel: string
  desc: string
  features: string[]
  icon: typeof Play
  popular?: boolean
}

const TIERS: Tier[] = [
  {
    name: 'Gratis',
    price: 0,
    priceLabel: 'Rp0',
    desc: 'Nonton semua film & series, dengan iklan.',
    icon: Play,
    features: [
      'Semua film & series',
      'Kualitas HD 720p',
      'Dengan iklan (video + banner)',
      '1 perangkat',
    ],
  },
  {
    name: 'Remove Ads',
    price: 20000,
    priceLabel: 'Rp20.000',
    desc: 'Hilangkan iklan selamanya, nonton makin nyaman.',
    icon: Zap,
    popular: true,
    features: [
      'Bebas iklan 100%',
      'Kualitas Full HD 1080p',
      'Semua film & series',
      '2 perangkat bersamaan',
      'Support prioritas',
    ],
  },
]

export default function Subscribe() {
  const { user } = useAuth()
  const router = useRouter()
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

  return (
    <>
      <script
        src="https://app.sandbox.midtrans.com/snap/snap.js"
        data-client-key={process.env.MIDTRANS_CLIENT_KEY}
        async
      />
      <Header />
      <main className="min-h-screen pt-24 pb-24">
        {/* HERO */}
        <section className="relative py-16 md:py-20">
          <div className="max-w-[900px] mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--accent)]/10 border border-[var(--accent)]/30 text-[var(--accent)] text-xs font-bold uppercase tracking-wider mb-6 animate-fade-up">
              <Sparkles size={12} />
              Simpel & Jelas
            </div>
            <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 animate-fade-up">
              Pilih <span className="gradient-text">Paket</span> Kamu
            </h1>
            <p className="text-lg text-[var(--text-muted)] max-w-xl mx-auto animate-fade-up" style={{ animationDelay: '100ms' }}>
              Nonton gratis, atau hilangkan iklan cuma Rp20.000/bulan.
            </p>
          </div>
        </section>

        {/* PRICING */}
        <section className="pb-8">
          <div className="max-w-[900px] mx-auto px-4">
            {error && (
              <div className="mb-8 max-w-2xl mx-auto">
                <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-4 rounded-xl border border-red-500/20 animate-shake">
                  <AlertCircle size={18} /> <span>{error}</span>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6 max-w-[700px] mx-auto">
              {TIERS.map((tier) => (
                <article
                  key={tier.name}
                  className={`relative glass-card rounded-2xl p-6 md:p-8 flex flex-col transition-all duration-300 ${
                    tier.popular
                      ? 'border-2 border-[var(--accent)] shadow-[0_0_40px_var(--accent-glow)] scale-[1.02] z-10'
                      : 'border border-[var(--border)] hover:border-[var(--accent)]/50 hover:shadow-[0_12px_40px_rgba(0,0,0,0.4)]'
                  }`}
                >
                  {tier.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent)] text-[10px] font-bold uppercase tracking-wider" style={{ color: 'var(--accent-contrast)' }}>
                        <Sparkles size={10} className="fill-current" />
                        PALING LARIS
                      </span>
                    </div>
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tier.popular ? 'bg-[var(--accent)]/20' : 'bg-[var(--bg-elevated)]'}`}>
                      <tier.icon size={20} className={tier.popular ? 'text-[var(--accent)]' : 'text-[var(--text-muted)]'} />
                    </div>
                    <h3 className="text-xl font-black text-[var(--text-main)]">{tier.name}</h3>
                  </div>

                  <p className="text-sm text-[var(--text-muted)] mb-5 leading-relaxed">{tier.desc}</p>

                  <div className="mb-6">
                    <span className="text-4xl md:text-5xl font-black text-[var(--text-main)]">{tier.priceLabel}</span>
                    {tier.price > 0 && <span className="text-sm text-[var(--text-tertiary)] ml-1 font-medium">/bulan</span>}
                    {tier.price === 0 && <span className="text-sm text-[var(--text-tertiary)] ml-1 font-medium">selamanya</span>}
                  </div>

                  <div className="space-y-3 mb-8 flex-1">
                    {tier.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-3 text-sm text-[var(--text-muted)]">
                        <div className={`flex-shrink-0 w-5 h-5 rounded-lg flex items-center justify-center ${tier.popular ? 'bg-[var(--accent)]/20 text-[var(--accent)]' : 'bg-[var(--bg-elevated)] text-[var(--success)]'}`}>
                          <Check size={13} />
                        </div>
                        <span>{f}</span>
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => handleSubscribe(tier)}
                    disabled={loading === tier.name}
                    className={`w-full py-3.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                      tier.popular ? 'btn-primary' : 'glass-btn text-[var(--text-main)] hover:border-[var(--accent)]/50 hover:text-[var(--accent)]'
                    } ${loading === tier.name ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    {loading === tier.name ? (
                      <span className="inline-flex items-center gap-2"><Loader2 size={14} className="animate-spin" /> Memproses...</span>
                    ) : (
                      tier.price === 0 ? 'Mulai Gratis' : `Pilih ${tier.name}`
                    )}
                  </button>
                </article>
              ))}
            </div>

            {/* Payment methods */}
            <div className="mt-14 animate-fade-up" style={{ animationDelay: '300ms' }}>
              <div className="glass-card rounded-2xl p-6 border border-[var(--border)] max-w-[700px] mx-auto">
                <div className="flex flex-wrap items-center justify-center gap-4 mb-3">
                  <span className="text-sm font-semibold text-[var(--text-muted)] uppercase tracking-wider">Metode Pembayaran</span>
                  <div className="flex flex-wrap items-center justify-center gap-2">
                    <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-[var(--border)] text-xs font-medium text-[var(--text-muted)]">Kartu Kredit/Debit</span>
                    <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-[var(--border)] text-xs font-medium text-[var(--text-muted)]">Transfer Bank</span>
                    <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-[var(--border)] text-xs font-medium text-[var(--text-muted)]">QRIS</span>
                    <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-[var(--border)] text-xs font-medium text-[var(--text-muted)]">GoPay/OVO/Dana</span>
                  </div>
                </div>
                <p className="text-xs text-[var(--text-tertiary)] text-center flex items-center justify-center gap-1">
                  <ShieldCheck size={12} /> Pembayaran diproses aman via Midtrans
                </p>
              </div>
            </div>
          </div>
        </section>

        <Footer />
      </main>
    </>
  )
}