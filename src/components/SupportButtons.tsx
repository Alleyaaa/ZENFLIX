'use client'
import Link from 'next/link'
import { Star, Coffee } from 'lucide-react'

// Tombol support di header (tanpa embed script — biar ga nabrak React):
// - GitHub Star: link langsung ke repo (klik sekali langsung jalan)
// - Trakteer: link langsung ke /tip (halaman traktir, langsung ke form tip)
const GITHUB_REPO = 'https://github.com/Alleyaaa/ZENFLIX'
const TRAKTEER_TIP = 'https://trakteer.id/sugiono_nur_aceng/tip'

export default function SupportButtons() {
  return (
    <div className="flex items-center gap-2">
      {/* GitHub Star */}
      <Link
        href={GITHUB_REPO}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-lg glass-card text-xs font-semibold text-[var(--text-muted)] hover:text-[var(--accent)] hover:border-[var(--accent)]/50 transition-all"
        aria-label="Kasih bintang di GitHub"
        title="Star repo di GitHub"
      >
        <Star size={13} className="text-[var(--accent)] fill-[var(--accent)]" />
        <span className="hidden sm:inline">Star</span>
      </Link>

      {/* Trakteer: link langsung ke halaman tip */}
      <Link
        href={TRAKTEER_TIP}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#be1e2d] text-white text-xs font-bold hover:opacity-90 transition-opacity"
        aria-label="Traktir kopi di Trakteer"
        title="Dukung Saya di Trakteer"
      >
        <Coffee size={13} className="fill-current" />
        <span className="hidden sm:inline">Traktir</span>
      </Link>
    </div>
  )
}