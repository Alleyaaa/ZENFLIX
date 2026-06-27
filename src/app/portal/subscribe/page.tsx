'use client'
import { useState } from 'react'
import Link from 'next/link'
import Header from '@/components/Header'
import { Check, Crown, Sparkles, Star, Shield } from 'lucide-react'

const TIERS = [
  { name: 'Free', price: 0, priceLabel: 'Gratis', color: 'from-gray-500/20 to-gray-600/10', icon: Shield, features: ['720p Streaming', 'Ads Supported', '10 Movies/Month'], btn: 'Mulai Gratis', btnClass: 'glass-btn', popular: false },
  { name: 'Standard', price: 50000, priceLabel: 'Rp50.000', color: 'from-blue-500/20 to-blue-600/10', icon: Star, features: ['1080p Full HD', 'No Ads', '100 Movies/Month', 'Priority Support'], btn: 'Pilih Standard', btnClass: 'glass-btn', popular: false },
  { name: 'Premium', price: 100000, priceLabel: 'Rp100.000', color: 'from-purple-500/20 to-purple-600/10', icon: Crown, features: ['4K Ultra HD', 'No Ads', 'Unlimited Movies', 'Download', '2 Devices'], btn: 'Pilih Premium', btnClass: 'bg-gradient-to-r from-purple-600 to-purple-800 text-white font-semibold hover:opacity-90 shadow-lg shadow-purple-500/20', popular: true },
  { name: 'Ultimate', price: 150000, priceLabel: 'Rp150.000', color: 'from-yellow-500/20 to-yellow-600/10', icon: Sparkles, features: ['4K Ultra HD', 'No Ads', 'Unlimited + Early Access', 'VIP Support', '4 Devices', 'Download'], btn: 'Pilih Ultimate', btnClass: 'glass-btn', popular: false },
]

export default function Subscribe() {
  const [loading, setLoading] = useState<string | null>(null)

  const handleSubscribe = async (tier: any) => {
    if (tier.price === 0) return
    setLoading(tier.name)
    try {
      const res = await fetch('/api/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: 'demo', email: 'demo@zenflix.id', name: 'Demo User', tier: tier.name.toLowerCase(), amount: tier.price })
      })
      const data = await res.json()
      if (data.token) {
        // @ts-ignore
        window.snap.pay(data.token)
      } else if (data.redirect_url) {
        window.location.href = data.redirect_url
      } else {
        alert('Error: ' + (data.error || JSON.stringify(data)))
      }
    } catch (e: any) {
      alert('Error: ' + e.message)
    }
    setLoading(null)
  }

  return (
    <>
      <script src="https://app.sandbox.midtrans.com/snap/snap.js" data-client-key={process.env.NEXT_PUBLIC_MIDTRANS_CLIENT_KEY} async />
      <Header />
      <main className="min-h-screen pt-24 pb-20">
        <div className="max-w-[1200px] mx-auto px-4 text-center mb-14">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 gradient-text">Pilih Paket Langganan</h1>
        </div>
        <div className="max-w-[1200px] mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {TIERS.map((tier, idx) => (
            <div key={idx} className={`relative glass-card rounded-2xl p-6 border transition-all ${tier.popular ? 'border-purple-500/40 shadow-lg scale-[1.02]' : 'border-white/5'}`}>
              <div className="mb-5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${tier.color}`}>
                  <tier.icon size={24} className={tier.name === 'Free' ? 'text-gray-400' : tier.name === 'Standard' ? 'text-blue-400' : tier.name === 'Premium' ? 'text-purple-400' : 'text-yellow-400'} />
                </div>
                <h3 className="text-xl font-bold">{tier.name}</h3>
                <div className="mt-2"><span className="text-2xl font-bold">{tier.priceLabel}</span></div>
              </div>
              <button onClick={() => handleSubscribe(tier)} disabled={loading === tier.name} className={`w-full py-2.5 rounded-xl text-sm font-medium ${tier.btnClass}`}>{loading === tier.name ? 'Memproses...' : tier.btn}</button>
            </div>
          ))}
        </div>
      </main>
    </>
  )
}
