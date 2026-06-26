'use client'
import Header from '@/components/Header'
import { Check } from 'lucide-react'

const PLANS = [
  {
    name: 'Free',
    price: 0,
    period: '',
    popular: false,
    features: ['Akses 50+ film gratis', 'Iklan saat streaming', 'Kualitas SD'],
    missing: ['Tanpa iklan', 'Kualitas HD', 'Prioritas server'],
  },
  {
    name: '1 Month',
    price: 30,
    period: '/bln',
    popular: true,
    features: ['Streaming tanpa iklan', 'Kualitas HD & 4K', 'Prioritas server', 'Akses semua film'],
    missing: [],
  },
  {
    name: '3 Months',
    price: 100,
    period: '(33rb/bln)',
    popular: false,
    features: ['Semua fitur 1 Bulan', 'Hemat 15rb/bulan', 'Support prioritas', 'Early access fitur baru'],
    missing: [],
  },
  {
    name: '12 Months',
    price: 300,
    period: '(25rb/bln)',
    popular: false,
    features: ['Semua fitur Premium', 'Hemat 60rb/bulan', 'VIP support 24/7', 'Nama di credits'],
    missing: [],
  },
]

export default function SubscribePage() {
  return (
    <>
      <Header />
      <div className="min-h-screen pb-20 pt-28">
        <div className="max-w-[1100px] mx-auto px-4">
          <div className="text-center mb-14">
            <h1 className="text-4xl md:text-5xl font-bold mb-3 gradient-text">Pilih Paket</h1>
            <p className="text-[var(--text-secondary)] max-w-md mx-auto text-sm">
              Streaming film dan series tanpa hambatan. Batal kapan aja.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-4">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`relative rounded-2xl p-6 transition-all duration-300 ${
                  plan.popular
                    ? 'glass ring-1 ring-blue-400/40 shadow-lg shadow-blue-500/5 scale-[1.02]'
                    : 'glass-ios hover:ring-1 hover:ring-white/10'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-2.5 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-0.5 rounded-full text-[10px] font-semibold bg-gradient-to-r from-blue-500 to-cyan-500 text-white">
                      TERLARIS
                    </span>
                  </div>
                )}

                <div className="space-y-5">
                  <div className="text-center">
                    <div className="text-sm font-medium text-white/50">{plan.name}</div>
                    <div className="mt-1">
                      {plan.price === 0 ? (
                        <span className="text-3xl font-black">Gratis</span>
                      ) : (
                        <>
                          <span className="text-3xl font-black">IDR {plan.price}K</span>
                          <span className="text-sm text-white/40 ml-1">{plan.period}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <ul className="space-y-2.5">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-[var(--text-primary)]/80">
                        <Check size={13} className="text-sky-400 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                    {plan.missing?.map((f, i) => (
                      <li key={i} className="flex items-start gap-2 text-xs text-white/20">
                        <span className="w-3.5 shrink-0 mt-0.5 text-center text-white/20">—</span>
                        <span className="line-through">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all duration-200 ${
                      plan.price === 0
                        ? 'glass-ios hover:bg-white/[0.04] text-white/70'
                        : 'gradient-btn'
                    }`}
                  >
                    {plan.price === 0 ? 'Mulai Gratis' : `Langganan ${plan.name}`}
                  </button>
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-xs text-white/30 mt-8">
            Pembayaran aman. Batalkan kapan aja.
          </p>
        </div>
      </div>
    </>
  )
}
