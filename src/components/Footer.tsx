'use client'
import Link from 'next/link'
import { Send, Camera, MessageCircle } from 'lucide-react'
import { useLang } from '@/lib/lang-context'

const SOCIALS = [
  { name: 'Telegram', handle: '@whereugone', href: 'https://t.me/whereugone', icon: Send, color: '#229ED9' },
  { name: 'Instagram', handle: '@millenprasetiya', href: 'https://instagram.com/millenprasetiya', icon: Camera, color: '#E4405F' },
  { name: 'Discord', handle: 'liquiidz', href: 'https://discord.gg/liquiidz', icon: MessageCircle, color: '#5865F2' },
]

export default function Footer() {
  const { lang } = useLang()

  const T = {
    id: {
      brand: 'Streaming film premium untuk Indonesia.',
      explore: 'Jelajah',
      playing: 'Sedang Tayang',
      popular: 'Populer',
      series: 'Series TV',
      leaderboard: 'Leaderboard',
      connect: 'Terhubung dengan Kami',
      rights: '© 2026 Zenflix',
      terms: 'Syarat & Ketentuan',
      privacy: 'Kebijakan Privasi',
    },
    en: {
      brand: 'Premium movie streaming for Indonesia.',
      explore: 'Explore',
      playing: 'Now Playing',
      popular: 'Popular',
      series: 'TV Series',
      leaderboard: 'Leaderboard',
      connect: 'Connect With Us',
      rights: '© 2026 Zenflix',
      terms: 'Terms of Service',
      privacy: 'Privacy Policy',
    },
  }[lang]

  return (
    <footer className="bg-[var(--bg-surface)] border-t border-[var(--border)] mt-auto">
      <div className="max-w-[1400px] mx-auto px-4 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-12">
          <div className="lg:col-span-1">
            <Link href="/" className="text-xl font-bold tracking-tight hover:opacity-90 transition-opacity">
              ZENFLIX
            </Link>
            <p className="mt-4 text-sm text-[var(--text-muted)] leading-relaxed max-w-xs">
              {T.brand}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[var(--text-main)] uppercase tracking-wider mb-4">
              {T.explore}
            </h3>
            <div className="flex flex-col gap-2 text-sm">
              <Link href="/category/now_playing" className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
                {T.playing}
              </Link>
              <Link href="/category/popular" className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
                {T.popular}
              </Link>
              <Link href="/category/series" className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
                {T.series}
              </Link>
              <Link href="/leaderboard" className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
                {T.leaderboard}
              </Link>
              <Link href="/contact" className="text-[var(--text-muted)] hover:text-[var(--accent)] transition-colors">
                {lang === 'id' ? 'Kontak & Lapor Bug' : 'Contact & Report Bug'}
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-[var(--text-main)] uppercase tracking-wider mb-4">
              {T.connect}
            </h3>
            <div className="flex flex-col gap-3">
              {SOCIALS.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors"
                  aria-label={`${s.name} ${s.handle}`}
                >
                  <s.icon size={16} style={{ color: s.color }} />
                  {s.handle}
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              Zenflix adalah platform streaming film dan series yang dibangun dengan antusiasme untuk para penikmat film dan serial di Indonesia.
            </p>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-[var(--text-tertiary)]">
          <span>{T.rights}</span>
          <div className="flex gap-4">
            <Link href="/terms" className="hover:text-[var(--accent)] transition-colors">
              {T.terms}
            </Link>
            <Link href="/privacy" className="hover:text-[var(--accent)] transition-colors">
              {T.privacy}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}