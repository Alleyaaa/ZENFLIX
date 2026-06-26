'use client'
import { useState, useEffect } from 'react'
import { useAuth } from './AuthProvider'
import Link from 'next/link'
import SearchDropdown from './SearchDropdown'

export default function Header() {
  const { user, signOut } = useAuth()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-3 transition-all duration-300 ${
        scrolled ? 'glass shadow-lg shadow-black/20' : 'bg-transparent'
      }`}
    >
      <Link href="/" className="text-xl font-black tracking-tighter gradient-text shrink-0">
        ZENFLIX
      </Link>

      <nav className="hidden md:flex items-center gap-1 px-4 py-1.5 rounded-full glass-ios">
        {[
          { label: 'Home', href: '/' },
          { label: 'Now Playing', href: '/category/now_playing' },
          { label: 'Popular', href: '/category/popular' },
          { label: 'Premium', href: '/subscribe' },
        ].map(({ label, href }) => (
          <Link
            key={label}
            href={href}
            className="px-3.5 py-1.5 text-xs font-medium text-white/70 hover:text-white hover:bg-white/[0.06] rounded-full transition-all"
          >
            {label}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-3">
        <SearchDropdown />
        {user ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-ios text-xs">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center text-[9px] font-bold text-white shrink-0">
              {user.email?.[0]?.toUpperCase() || 'U'}
            </div>
            <span className="text-white/70 truncate max-w-[100px]">{user.email}</span>
            <button onClick={signOut} className="text-blue-300 hover:text-blue-200 ml-1">✕</button>
          </div>
        ) : (
          <Link href="/auth" className="px-4 py-1.5 rounded-full bg-gradient-to-r from-blue-500 to-sky-500 hover:from-blue-400 hover:to-sky-400 text-xs font-semibold text-white shadow-lg shadow-blue-500/20 transition-all">
            Sign In
          </Link>
        )}
      </div>
    </header>
  )
}
