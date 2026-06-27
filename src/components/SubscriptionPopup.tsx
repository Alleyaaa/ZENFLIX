import { Check, X, Sparkles, Star, Shield, Crown } from 'lucide-react'
import { useState } from 'react'

export default function SubscriptionPopup({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="glass-panel w-full max-w-lg rounded-3xl p-8 relative border border-white/10 shadow-2xl">
        <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10"><X size={20} /></button>
        <h2 className="text-2xl font-bold mb-2">Upgrade to Premium</h2>
        <p className="text-sm text-[var(--text-muted)] mb-6">Unlock 4K, Ad-free, and Unlimited access.</p>
        <div className="grid gap-3">
          {['Premium', 'Ultimate'].map((plan) => (
             <div key={plan} className="glass-card p-4 rounded-xl flex justify-between items-center border border-white/5">
                <span className="font-semibold">{plan}</span>
                <button className="px-4 py-1.5 rounded-lg bg-[var(--accent)] text-black text-sm font-bold">Select</button>
             </div>
          ))}
        </div>
      </div>
    </div>
  )
}
