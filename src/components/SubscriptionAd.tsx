import Link from 'next/link'
import { Sparkles } from 'lucide-react'

export default function SubscriptionAd() {
  return (
    <Link href="/portal/subscribe">
      <a className="block glass-card rounded-2xl p-6 my-12 border-purple-500/30 hover:border-purple-500/60 transition-all duration-300">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center">
                <Sparkles size={16} className="text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-white">Go Premium</h3>
            </div>
            <p className="text-sm text-[var(--text-muted)]">Unlock 4K streaming, no ads, and unlimited access.</p>
          </div>
          <button className="px-5 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-purple-600 to-purple-800 text-white hover:opacity-90 shadow-lg shadow-purple-500/20">
            Upgrade Now
          </button>
        </div>
      </a>
    </Link>
  )
}
