'use client'
import Link from 'next/link'
import { useAuth } from './AuthProvider'
import { useState, useEffect } from 'react'
import { Moon, Sun, Languages } from 'lucide-react'
import SearchDropdown from './SearchDropdown'

export default function Header() {
  const { user, signOut } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [lang, setLang] = useState<'id' | 'en'>('id')

  useEffect(() => {
    const saved = localStorage.getItem('zenflix-theme')
    if (saved === 'light' || saved === 'dark') {
      setTheme(saved)
      document.documentElement.setAttribute('data-theme', saved)
    }
    const savedLang = localStorage.getItem('zenflix-lang')
    if (savedLang === 'en' || savedLang === 'id') setLang(savedLang)
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('zenflix-theme', newTheme)
  }

  const toggleLang = () => {
    const newLang = lang === 'id' ? 'en' : 'id'
    setLang(newLang)
    localStorage.setItem('zenflix-lang', newLang)
  }

  const navItems = {
    id: [
      { label: 'Home', href: '/' },
      { label: 'Sedang Tayang', href: '/category/now_playing' },
      { label: 'Populer', href: '/category/popular' },
    ],
    en: [
      { label: 'Home', href: '/' },
      { label: 'Now Playing', href: '/category/now_playing' },
      { label: 'Popular', href: '/category/popular' },
    ]
  }

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'glass-nav shadow-lg' : 'bg-transparent'
      }`}
    >
      <div className="max-w-[1400px] mx-auto flex items-center justify-between px-4 h-16">
        <Link href="/" className="text-xl font-bold tracking-tight hover:opacity-90 transition-opacity">
          ZENFLIX
        </Link>

        <nav className="hidden md:flex items-center gap-2 px-2 py-1 rounded-full glass-card">
          {navItems[lang].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="px-4 py-1.5 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--border)]/30 rounded-full transition-all"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <SearchDropdown lang={lang} />

          <button
            onClick={toggleTheme}
            className="w-8 h-8 rounded-full glass-card flex items-center justify-center hover:bg-[var(--border)]/30 transition-all"
            title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
          >
            {theme === 'dark' ? (
              <Sun size={16} className="text-[var(--text-muted)]" />
            ) : (
              <Moon size={16} className="text-[var(--text-muted)]" />
            )}
          </button>

          <button
            onClick={toggleLang}
            className="w-8 h-8 rounded-full glass-card flex items-center justify-center hover:bg-[var(--border)]/30 transition-all"
            title={lang === 'id' ? 'Switch to English' : 'Ganti ke Indonesia'}
          >
            <Languages size={16} className="text-[var(--text-muted)]" />
          </button>

          {user ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-sm">
              <div className="w-6 h-6 rounded-full bg-[var(--accent)] flex items-center justify-center text-xs font-bold shrink-0" style={{color:'#0c1220'}}>
                {user.email?.[0]?.toUpperCase() || 'U'}
              </div>
              <span className="text-[var(--text-muted)] truncate max-w-[100px]">{user.email}</span>
              <button onClick={signOut} className="text-[var(--accent)] hover:opacity-80 ml-1">✕</button>
            </div>
          ) : (
            <Link href="/auth" className="btn-primary">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
