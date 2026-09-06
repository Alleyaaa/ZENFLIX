'use client'
import Link from 'next/link'
import { useAuth } from './AuthProvider'
import { useLang } from '@/lib/lang-context'
import { useState, useEffect } from 'react'
import { Moon, Sun, Languages, Film, Menu, X, ChevronDown, Tv, Calendar, Globe, Radio, Trophy } from 'lucide-react'
import SearchDropdown from './SearchDropdown'

// Daftar genre (19)
const GENRES = [
  { id: 28, idName: 'Aksi', enName: 'Action' },
  { id: 12, idName: 'Petualangan', enName: 'Adventure' },
  { id: 16, idName: 'Animasi', enName: 'Animation' },
  { id: 35, idName: 'Komedi', enName: 'Comedy' },
  { id: 80, idName: 'Kejahatan', enName: 'Crime' },
  { id: 99, idName: 'Dokumenter', enName: 'Documentary' },
  { id: 18, idName: 'Drama', enName: 'Drama' },
  { id: 10751, idName: 'Keluarga', enName: 'Family' },
  { id: 14, idName: 'Fantasi', enName: 'Fantasy' },
  { id: 36, idName: 'Sejarah', enName: 'History' },
  { id: 27, idName: 'Horor', enName: 'Horror' },
  { id: 10402, idName: 'Musik', enName: 'Music' },
  { id: 9648, idName: 'Misteri', enName: 'Mystery' },
  { id: 10749, idName: 'Romantis', enName: 'Romance' },
  { id: 878, idName: 'Sci-Fi', enName: 'Sci-Fi' },
  { id: 10770, idName: 'TV Movie', enName: 'TV Movie' },
  { id: 53, idName: 'Thriller', enName: 'Thriller' },
  { id: 10752, idName: 'Perang', enName: 'War' },
  { id: 37, idName: 'Western', enName: 'Western' },
]

const YEARS = [2026, 2025, 2024, 2023, 2022, 2021, 2020, 2019, 2018, 2017, 2016, 2015, 2010, 2000, 1990, 1980]

const COUNTRIES = [
  { code: 'US', idName: 'Amerika', enName: 'USA' },
  { code: 'KR', idName: 'Korea', enName: 'South Korea' },
  { code: 'JP', idName: 'Jepang', enName: 'Japan' },
  { code: 'GB', idName: 'Inggris', enName: 'UK' },
  { code: 'ID', idName: 'Indonesia', enName: 'Indonesia' },
  { code: 'IN', idName: 'India', enName: 'India' },
  { code: 'FR', idName: 'Prancis', enName: 'France' },
  { code: 'DE', idName: 'Jerman', enName: 'Germany' },
  { code: 'CN', idName: 'China', enName: 'China' },
  { code: 'HK', idName: 'Hong Kong', enName: 'Hong Kong' },
  { code: 'TH', idName: 'Thailand', enName: 'Thailand' },
  { code: 'MX', idName: 'Meksiko', enName: 'Mexico' },
]

const NETWORKS = [
  { id: 213, name: 'Netflix' },
  { id: 1024, name: 'Prime Video' },
  { id: 113, name: 'HBO' },
  { id: 2739, name: 'Disney+' },
  { id: 2552, name: 'Apple TV+' },
  { id: 4330, name: 'Viu' },
  { id: 6465, name: 'Vidio' },
  { id: 119, name: 'Catchplay+' },
]

const COLLECTIONS_SLUGS = [
  { slug: 'marvel', name: 'Marvel' },
  { slug: 'dc', name: 'DC' },
  { slug: 'star-wars', name: 'Star Wars' },
  { slug: 'harry-potter', name: 'Harry Potter' },
  { slug: 'batman', name: 'Batman' },
  { slug: 'spider-man', name: 'Spider-Man' },
  { slug: 'jurassic', name: 'Jurassic Park' },
  { slug: 'fast-furious', name: 'Fast & Furious' },
]

export default function Header() {
  const { user, loading, signOut } = useAuth()
  const { lang, setLang } = useLang()
  const [scrolled, setScrolled] = useState(false)
  const [theme, setTheme] = useState<'dark' | 'light'>('dark')
  const [mobileOpen, setMobileOpen] = useState(false)
  const [genreOpen, setGenreOpen] = useState(false)
  const [browseOpen, setBrowseOpen] = useState(false)
  const [userOpen, setUserOpen] = useState(false)

  useEffect(() => {
    const savedTheme = localStorage.getItem('zenflix-theme')
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setTheme(savedTheme)
      document.documentElement.setAttribute('data-theme', savedTheme)
    }
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  // Theme toggle: set state + DOM + localStorage sekaligus (instant, tanpa refresh)
  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
    localStorage.setItem('zenflix-theme', newTheme)
  }

  // Language toggle: set context + localStorage (semua teks langsung ganti, tanpa refresh)
  const toggleLang = () => {
    setLang(lang === 'id' ? 'en' : 'id')
  }

  const handleSignOut = async () => {
    await signOut()
    setUserOpen(false)
  }

  const closeAll = () => {
    setGenreOpen(false)
    setBrowseOpen(false)
    setUserOpen(false)
  }

  const T = {
    id: { home: 'Beranda', playing: 'Sedang Tayang', popular: 'Populer', browse: 'Jelajah', genres: 'Genre', years: 'Tahun', countries: 'Negara', networks: 'Jaringan', series: 'Series TV', collections: 'Koleksi', signIn: 'Masuk', profile: 'Profil', logout: 'Keluar', viewAll: 'Lihat Semua' },
    en: { home: 'Home', playing: 'Now Playing', popular: 'Popular', browse: 'Browse', genres: 'Genres', years: 'Years', countries: 'Countries', networks: 'Networks', series: 'TV Series', collections: 'Collections', signIn: 'Sign In', profile: 'Profile', logout: 'Logout', viewAll: 'View All' },
  }[lang]

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
        <div className="max-w-[1400px] mx-auto flex items-center justify-between px-4 h-14 md:h-16">
          <Link href="/" className="text-xl font-bold tracking-tight hover:opacity-90 transition-opacity">
            ZENFLIX
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-1" aria-label="Navigasi utama">
            <Link href="/" className="px-3 py-1.5 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--border)]/30 rounded-lg transition-all">
              {T.home}
            </Link>
            <Link href="/category/now_playing" className="px-3 py-1.5 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--border)]/30 rounded-lg transition-all">
              {T.playing}
            </Link>
            <Link href="/category/popular" className="px-3 py-1.5 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--border)]/30 rounded-lg transition-all">
              {T.popular}
            </Link>
            <Link href="/category/series" className="px-3 py-1.5 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--border)]/30 rounded-lg transition-all flex items-center gap-1">
                          <Tv size={14} /> {T.series}
                        </Link>
                        <Link href="/leaderboard" className="px-3 py-1.5 text-sm font-medium text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--border)]/30 rounded-lg transition-all flex items-center gap-1">
                          <Trophy size={14} /> Leaderboard
                        </Link>

            {/* Browse dropdown (Genre, Tahun, Negara, Jaringan) */}
            <div className="relative">
              <button
                onClick={() => { setBrowseOpen(!browseOpen); setGenreOpen(false) }}
                className={`px-3 py-1.5 text-sm font-medium rounded-lg transition-all flex items-center gap-1 ${
                  browseOpen ? 'text-[var(--text-main)] bg-[var(--border)]/30' : 'text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--border)]/30'
                }`}
                aria-haspopup="true"
                aria-expanded={browseOpen}
              >
                {T.browse} <ChevronDown size={14} />
              </button>
              {browseOpen && (
                <div className="absolute left-0 top-full mt-2 w-[600px] glass-panel rounded-xl p-4 shadow-2xl z-50 grid grid-cols-2 gap-4">
                  {/* Genres */}
                  <div>
                    <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2 flex items-center gap-1">
                      <Film size={12} /> {T.genres}
                    </p>
                    <div className="grid grid-cols-2 gap-1">
                      {GENRES.map((g) => (
                        <Link
                          key={g.id}
                          href={`/genre/${g.id}`}
                          onClick={closeAll}
                          className="block px-2 py-1.5 text-[13px] text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-elevated)] rounded-md transition-colors truncate"
                        >
                          {lang === 'id' ? g.idName : g.enName}
                        </Link>
                      ))}
                    </div>
                  </div>
                  {/* Kanan: Tahun / Negara / Jaringan */}
                  <div className="space-y-3">
                    <div>
                      <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Calendar size={12} /> {T.years}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {YEARS.slice(0, 10).map((y) => (
                          <Link key={y} href={`/year/${y}`} onClick={closeAll} className="px-2 py-1 text-[12px] text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-elevated)] rounded-md transition-colors">
                            {y}
                          </Link>
                        ))}
                      </div>
                    </div>
                    <div>
                      <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1 flex items-center gap-1">
                        <Globe size={12} /> {T.countries}
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {COUNTRIES.map((c) => (
                          <Link key={c.code} href={`/country/${c.code}`} onClick={closeAll} className="px-2 py-1 text-[12px] text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-elevated)] rounded-md transition-colors">
                            {lang === 'id' ? c.idName : c.enName}
                          </Link>
                        ))}
                      </div>
                    </div>
                    <div>
                                          <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1 flex items-center gap-1">
                                            <Radio size={12} /> {T.networks}
                                          </p>
                                          <div className="flex flex-wrap gap-1">
                                            {NETWORKS.map((n) => (
                                              <Link key={n.id} href={`/network/${n.id}`} onClick={closeAll} className="px-2 py-1 text-[12px] text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-elevated)] rounded-md transition-colors">
                                                {n.name}
                                              </Link>
                                            ))}
                                          </div>
                                        </div>
                                        <div>
                                          <p className="text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-1 flex items-center gap-1">
                                            <Tv size={12} /> {T.collections}
                                          </p>
                                          <div className="flex flex-wrap gap-1">
                                            {COLLECTIONS_SLUGS.map((c) => (
                                              <Link key={c.slug} href={`/collections/${c.slug}`} onClick={closeAll} className="px-2 py-1 text-[12px] text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-elevated)] rounded-md transition-colors">
                                                {c.name}
                                              </Link>
                                            ))}
                                          </div>
                                        </div>
                  </div>
                </div>
              )}
            </div>
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            <SearchDropdown lang={lang} />

            {/* Theme toggle: instant */}
            <button
              onClick={toggleTheme}
              className="w-8 h-8 rounded-lg glass-card flex items-center justify-center hover:bg-[var(--border)]/30 transition-all"
              aria-label={theme === 'dark' ? 'Mode Terang' : 'Mode Gelap'}
              title={theme === 'dark' ? 'Light mode' : 'Dark mode'}
            >
              {theme === 'dark' ? (
                <Sun size={16} className="text-[var(--text-muted)]" />
              ) : (
                <Moon size={16} className="text-[var(--text-muted)]" />
              )}
            </button>

            {/* Language toggle: instant */}
            <button
              onClick={toggleLang}
              className="w-8 h-8 rounded-lg glass-card flex items-center justify-center hover:bg-[var(--border)]/30 transition-all"
              aria-label="Toggle language"
              title={lang === 'id' ? 'English' : 'Bahasa Indonesia'}
            >
              <Languages size={16} className="text-[var(--text-muted)]" />
            </button>

            {/* User / Auth */}
            {user ? (
              <div className="relative">
                <button
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass-card text-sm"
                  onClick={() => { setUserOpen(!userOpen); setBrowseOpen(false) }}
                  aria-haspopup="true"
                  aria-expanded={userOpen}
                >
                  <div className="w-6 h-6 rounded-full bg-[var(--accent)] flex items-center justify-center text-xs font-bold shrink-0" style={{ color: 'var(--accent-contrast)' }}>
                    {user.email?.[0]?.toUpperCase() || 'U'}
                  </div>
                  <span className="text-[var(--text-muted)] truncate max-w-[100px] hidden sm:block">{user.email}</span>
                </button>
                {userOpen && (
                  <div className="absolute right-0 top-full mt-2 w-44 glass-panel rounded-lg py-2 shadow-xl z-50 animate-in fade-in-0 zoom-in-95 duration-150">
                    <Link href="/profile" onClick={closeAll} className="block px-4 py-2 text-sm text-[var(--text-muted)] hover:text-[var(--accent)] hover:bg-[var(--bg-elevated)]">
                      {T.profile}
                    </Link>
                    <hr className="my-1 border-[var(--border)]" />
                    <button onClick={handleSignOut} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-[var(--bg-elevated)] transition-colors">
                      {T.logout}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/auth" className="btn-primary">
                {T.signIn}
              </Link>
            )}

            {/* Mobile menu button */}
            <button
              className="md:hidden w-8 h-8 rounded-lg glass-card flex items-center justify-center hover:bg-[var(--border)]/30 transition-all"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Menu"
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
          <div className="absolute right-0 top-0 h-full w-[300px] max-w-[85vw] glass-panel flex flex-col animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between p-4 border-b border-[var(--border)]">
              <span className="font-bold">ZENFLIX</span>
              <button onClick={() => setMobileOpen(false)} className="w-8 h-8 rounded-lg glass-card flex items-center justify-center">
                <X size={20} />
              </button>
            </div>
            <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
              <Link href="/" className="block px-4 py-3 rounded-lg glass-btn text-left text-[var(--text-main)]" onClick={() => setMobileOpen(false)}>
                {T.home}
              </Link>
              <Link href="/category/now_playing" className="block px-4 py-3 rounded-lg glass-btn text-left text-[var(--text-main)]" onClick={() => setMobileOpen(false)}>
                {T.playing}
              </Link>
              <Link href="/category/popular" className="block px-4 py-3 rounded-lg glass-btn text-left text-[var(--text-main)]" onClick={() => setMobileOpen(false)}>
                {T.popular}
              </Link>
              <Link href="/category/series" className="block px-4 py-3 rounded-lg glass-btn text-left text-[var(--text-main)]" onClick={() => setMobileOpen(false)}>
                {T.series}
              </Link>
              <div className="pt-3 border-t border-[var(--border)]">
                <p className="px-4 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">{T.genres}</p>
                <div className="grid grid-cols-2 gap-1">
                  {GENRES.map((g) => (
                    <Link key={g.id} href={`/genre/${g.id}`} className="block px-3 py-2 rounded-lg glass-btn text-left text-[var(--text-muted)] text-[13px] hover:text-[var(--accent)]" onClick={() => setMobileOpen(false)}>
                      {lang === 'id' ? g.idName : g.enName}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="pt-3 border-t border-[var(--border)]">
                <p className="px-4 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">{T.years}</p>
                <div className="flex flex-wrap gap-1 px-3">
                  {YEARS.slice(0, 10).map((y) => (
                    <Link key={y} href={`/year/${y}`} className="px-2 py-1 text-[12px] text-[var(--text-muted)] hover:text-[var(--accent)] rounded-md" onClick={() => setMobileOpen(false)}>
                      {y}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="pt-3 border-t border-[var(--border)]">
                <p className="px-4 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">{T.countries}</p>
                <div className="flex flex-wrap gap-1 px-3">
                  {COUNTRIES.map((c) => (
                    <Link key={c.code} href={`/country/${c.code}`} className="px-2 py-1 text-[12px] text-[var(--text-muted)] hover:text-[var(--accent)] rounded-md" onClick={() => setMobileOpen(false)}>
                      {lang === 'id' ? c.idName : c.enName}
                    </Link>
                  ))}
                </div>
              </div>
              <div className="pt-3 border-t border-[var(--border)]">
                <p className="px-4 text-xs font-bold text-[var(--text-tertiary)] uppercase tracking-wider mb-2">{T.networks}</p>
                <div className="flex flex-wrap gap-1 px-3">
                  {NETWORKS.map((n) => (
                    <Link key={n.id} href={`/network/${n.id}`} className="px-2 py-1 text-[12px] text-[var(--text-muted)] hover:text-[var(--accent)] rounded-md" onClick={() => setMobileOpen(false)}>
                      {n.name}
                    </Link>
                  ))}
                </div>
              </div>
            </nav>
            <div className="p-4 border-t border-[var(--border)] space-y-3">
              {user ? (
                <button onClick={handleSignOut} className="w-full px-4 py-3 rounded-lg bg-red-500/10 text-red-400 font-medium hover:bg-red-500/20 transition-colors">
                  {T.logout}
                </button>
              ) : (
                <Link href="/auth" className="w-full block px-4 py-3 rounded-lg btn-primary text-center" onClick={() => setMobileOpen(false)}>
                  {T.signIn}
                </Link>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  )
}