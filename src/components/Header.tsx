'use client'
import Link from 'next/link'
import { useAuth } from './AuthProvider'
import { useState, useEffect } from 'react'
import { Moon, Sun, Languages, Film, Menu, X } from 'lucide-react'
import SearchDropdown from './SearchDropdown'

// i18n translations
const T = {
  id: {
    nav: { home: 'Beranda', playing: 'Sedang Tayang', popular: 'Populer', genres: 'Genre', search: 'Cari film...', signIn: 'Masuk', profile: 'Profil', logout: 'Keluar' },
    theme: { dark: 'Mode Gelap', light: 'Mode Terang' },
    lang: { id: 'Bahasa Indonesia', en: 'English' },
  },
  en: {
    nav: { home: 'Home', playing: 'Now Playing', popular: 'Popular', genres: 'Genres', search: 'Search movies...', signIn: 'Sign In', profile: 'Profile', logout: 'Logout' },
    theme: { dark: 'Dark Mode', light: 'Light Mode' },
    lang: { id: 'Bahasa Indonesia', en: 'English' },
  },
}

export default function Header() {
  const { user, loading, signOut } = useAuth()
  const [scrolled, setScrolled] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [lang, setLang] = useState<'id' | 'en'>('id')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [genreOpen, setGenreOpen] = useState(false)

  const t = T[lang]

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

  const handleSignOut = async () => {
    await signOut()
    setGenreOpen(false)
  }

  const genres = [
    { id: 28, name: { id: 'Aksi', en: 'Action' } },
    { id: 12, name: { id: 'Petualangan', en: 'Adventure' } },
    { id: 16, name: { id: 'Animasi', en: 'Animation' } },
    { id: 35, name: { id: 'Komedi', en: 'Comedy' } },
    { id: 80, name: { id: 'Kejahatan', en: 'Crime' } },
    { id: 99, name: { id: 'Dokumenter', en: 'Documentary' } },
    { id: 18, name: { id: 'Drama', en: 'Drama' } },
    { id: 10751, name: { id: 'Keluarga', en: 'Family' } },
    { id: 14, name: { id: 'Fantasi', en: 'Fantasy' } },
    { id: 36, name: { id: 'Sejarah', en: 'History' } },
    { id: 27, name: { id: 'Horor', en: 'Horror' } },
    { id: 10402, name: { id: 'Musik', en: 'Music' } },
    { id: 9648, name: { id: 'Misteri', en: 'Mystery' } },
    { id: 10749, name: { id: 'Romantis', en: 'Romance' } },
    { id: 878, name: { id: 'Sci-Fi', en: 'Sci-Fi' } },
    { id: 10770, name: { id: 'TV Movie', en: 'TV Movie' } },
    { id: 53, name: { id: 'Thriller', en: 'Thriller' } },
    { id: 10752, name: { id: 'Perang', en: 'War' } },
    { id: 37, name: { id: 'Western', en: 'Western' } },
  ]

  if (loading) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 glass-nav">
        <div className="max-w-[1400px] mx-auto flex items-center justify-between px-4 h-16">
          <span className="text-xl font-bold tracking-tight">ZENFLIX</span>
        </div>
      </header>
    )
  }

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled ? 'glass-nav shadow-lg' : 'bg-transparent'
        }`}
      >
        <div className="max-w-[1400px] mx-auto flex items-center justify-between px-4 h-16">
          <Link href="/" className="text-xl font-bold tracking-tight hover:opacity-90 transition-opacity">
            ZENFLIX
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1 px-2 py-1 rounded-full glass-card" aria-label="Navigasi utama">
            <Link href="/" className="px-4 py-1.5 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--border)]/30 rounded-full transition-all">
              {t.nav.home}
            </Link>
            <Link href="/category/now_playing" className="px-4 py-1.5 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--border)]/30 rounded-full transition-all">
              {t.nav.playing}
            </Link>
            <Link href="/category/popular" className="px-4 py-1.5 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--border)]/30 rounded-full transition-all">
              {t.nav.popular}
            </Link>
            {/* Genre dropdown */}
            <div className="relative" onMouseEnter={() => setGenreOpen(true)} onMouseLeave={() => setGenreOpen(false)}>
              <button
                onClick={() => setGenreOpen(!genreOpen)}
                className="px-4 py-1.5 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--border)]/30 rounded-full transition-all flex items-center gap-1"
                aria-haspopup="true"
                aria-expanded={genreOpen}
              >
                <Film size={14} /> {t.nav.genres}
              </button>
              {genreOpen && (
                <div className="absolute left-0 top-full mt-2 w-56 glass-panel rounded-lg py-2 shadow-xl z-50 animate-in fade-in-0 zoom-in-95 duration-150">
                  {genres.map((g) => (
                    <Link
                      key={g.id}
                      href={`/genre/${g.id}`}
                      className="block px-4 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-elevated)] transition-colors"
                    >
                      {lang === 'id' ? g.name.id : g.name.en}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <SearchDropdown lang={lang} />

            {/* Theme toggle */}
            <button
              onClick={() => {
                const newTheme = theme === 'dark' ? 'light' : 'dark'
                document.documentElement.setAttribute('data-theme', newTheme)
                localStorage.setItem('zenflix-theme', newTheme)
              }}
              className="w-8 h-8 rounded-full glass-card flex items-center justify-center hover:bg-[var(--border)]/30 transition-all"
              aria-label={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
            >
              {theme === 'dark' ? (
                <Sun size={16} className="text-[var(--text-muted)]" />
              ) : (
                <Moon size={16} className="text-[var(--text-muted)]" />
              )}
            </button>

            {/* Language toggle */}
            <button
              onClick={() => {
                const newLang = lang === 'id' ? 'en' : 'id'
                localStorage.setItem('zenflix-lang', newLang)
              }}
              className="w-8 h-8 rounded-full glass-card flex items-center justify-center hover:bg-[var(--border)]/30 transition-all"
              aria-label={lang === 'id' ? 'English' : 'Bahasa Indonesia'}
            >
              <Languages size={16} className="text-[var(--text-muted)]" />
            </button>

            {/* User / Auth */}
            {user ? (
              <div className="relative">
                <button
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full glass-card text-sm"
                  onClick={() => setGenreOpen(!genreOpen)}
                  aria-haspopup="true"
                  aria-expanded={genreOpen}
                >
                  <div className="w-6 h-6 rounded-full bg-[var(--accent)] flex items-center justify-center text-xs font-bold shrink-0" style={{ color: 'var(--accent-contrast)' }}>
                    {user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-[var(--text-muted)] truncate max-w-[100px] hidden sm:block">{user.email}</span>
                </button>
                {genreOpen && (
                  <div className="absolute right-0 top-full mt-2 w-44 glass-panel rounded-lg py-2 shadow-xl z-50 animate-in fade-in-0 zoom-in-95 duration-150">
                    <Link href="/profile" className="block px-4 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-elevated)]">
                      {t.nav.profile}
                    </Link>
                    <hr className="my-1 border-[var(--border)]" />
                    <button onClick={handleSignOut} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[var(--bg-elevated)] transition-colors">
                      {t.nav.logout}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth" className="btn-primary">
                {t.nav.signIn}
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden w-8 h-8 rounded-full glass-card flex items-center justify-center hover:bg-[var(--border)]/30 transition-all"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Buka menu"
              aria-expanded={mobileOpen}
            >
              {mobileOpen ? <X size={20} className="text-[var(--text-main)]" /> : <Menu size={20} className="text-[var(--text-muted)]" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden animate-in fade-in-0 duration-200">
          <div className="absolute inset-0 bg-black/50" onClick={() => setMobileOpen(false)} />
          <div className="absolute right-0 top-0 h-full w-[280px] max-w-full glass-panel flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <span className="font-bold">ZENFLIX</span>
              <button onClick={() => setMobileOpen(false)} className="w-8 h-8 rounded-full glass-card flex items-center justify-center">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
              <Link href="/" className="block px-4 py-3 rounded-lg glass-btn text-left text-[var(--text-main)]" onClick={() => setMobileOpen(false)}>
                {t.nav.home}
              </Link>
              <Link href="/category/now_playing" className="block px-4 py-3 rounded-lg glass-btn text-left text-[var(--text-main)]" onClick={() => setMobileOpen(false)}>
                {t.nav.playing}
              </Link>
              <Link href="/category/popular" className="block px-4 py-3 rounded-lg glass-btn text-left text-[var(--text-main)]" onClick={() => setMobileOpen(false)}>
                {t.nav.popular}
              </Link>
              <div className="pt-2 border-t border-[var(--border)]">
                <p className="px-4 text-xs font-semibold text-[var(--text-tertiary)] uppercase tracking-wider">{t.nav.genres}</p>
                <div className="space-y-1 mt-1">
                  {genres.slice(0, 12).map((g) => (
                    <Link key={g.id} href={`/genre/${g.id}`} className="block px-4 py-2 rounded-lg glass-btn text-left text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-elevated)]" onClick={() => setMobileOpen(false)}>
                      {lang === 'id' ? g.name.id : g.name.en}
                    </Link>
                  ))}
                </div>
              </div>
            </nav>
            <div className="p-4 border-t border-[var(--border)] space-y-3">
              {user ? (
                <button onClick={handleSignOut} className="w-full px-4 py-3 rounded-lg bg-red-500/10 text-red-400 font-medium hover:bg-red-500/20 transition-colors">
                  {t.nav.logout}
                </button>
              ) : (
                <Link href="/auth" className="w-full block px-4 py-3 rounded-lg btn-primary text-center" onClick={() => setMobileOpen(false)}>
                  {t.nav.signIn}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}