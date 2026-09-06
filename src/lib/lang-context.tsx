'use client'
import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

type Lang = 'id' | 'en'

interface LangCtx {
  lang: Lang
  setLang: (l: Lang) => void
  t: (id: string, en: string) => string
}

const LangContext = createContext<LangCtx>({
  lang: 'id',
  setLang: () => {},
  t: (id) => id,
})

export function useLang() {
  return useContext(LangContext)
}

// Terjemahan global untuk UI lintas halaman
export const translations = {
  id: {
    'title.home': 'Beranda',
    'title.playing': 'Sedang Tayang',
    'title.popular': 'Populer',
    'title.top_rated': 'Rating Tertinggi',
    'title.upcoming': 'Segera Tayang',
    'title.series': 'Series TV',
    'title.anime': 'Anime',
    'title.collections': 'Koleksi',
    'title.browse': 'Jelajah',
    'title.genres': 'Genre',
    'title.years': 'Tahun',
    'title.countries': 'Negara',
    'title.networks': 'Jaringan',
    'nav.signIn': 'Masuk',
    'nav.profile': 'Profil',
    'nav.logout': 'Keluar',
    'nav.theme': 'Mode Terang / Gelap',
    'nav.lang': 'Bahasa',
    'trending.week': 'Trending Minggu Ini',
    'trending.week.en': 'Trending This Week',
    'see.all': 'Lihat semua',
    'explore.genres': 'Jelajahi Genre',
    'search.placeholder': 'Cari film atau series...',
    'search.title': 'Cari Film & Series',
    'search.hint': 'Ketik judul film atau series untuk mulai mencari.',
    'search.none': 'Tidak Ditemukan',
    'search.noresult': 'Hasil untuk "{q}" tidak ditemukan. Coba judul lain.',
    'search.result': 'Hasil untuk "{q}"',
    'hero.play': 'Putar Sekarang',
    'hero.detail': 'Lihat Detail',
    'hero.playsub': 'Mulai Nonton',
    'movie.sinopsis': 'Sinopsis',
    'movie.cast': 'Pemeran',
    'movie.similar': 'Film Serupa',
    'movie.status': 'Status',
    'movie.runtime': 'Durasi',
    'movie.genres': 'Genre',
    'player.loading': 'Menyiapkan pemutar...',
    'player.playing': 'Memutar via',
    'player.source': 'Sumber:',
    'player.unavailable': 'Semua sumber player tidak tersedia saat ini.',
    'player.trailer': 'Player tidak tersedia. Nonton trailer resmi:',
    'player.retry': 'Coba Lagi',
    'auth.welcome': 'Selamat Datang di Zenflix',
    'auth.subtitle': 'Masuk atau buat akun untuk mulai menonton',
    'auth.login': 'Masuk ke Zenflix',
    'auth.register': 'Buat Akun Baru',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.loginBtn': 'Masuk',
    'auth.registerBtn': 'Buat Akun',
    'auth.nohave': 'Belum punya akun? Daftar di sini',
    'auth.have': 'Sudah punya akun? Masuk',
  },
  en: {
    'title.home': 'Home',
    'title.playing': 'Now Playing',
    'title.popular': 'Popular',
    'title.top_rated': 'Top Rated',
    'title.upcoming': 'Upcoming',
    'title.series': 'TV Series',
    'title.anime': 'Anime',
    'title.collections': 'Collections',
    'title.browse': 'Browse',
    'title.genres': 'Genres',
    'title.years': 'Years',
    'title.countries': 'Countries',
    'title.networks': 'Networks',
    'nav.signIn': 'Sign In',
    'nav.profile': 'Profile',
    'nav.logout': 'Logout',
    'nav.theme': 'Light / Dark Mode',
    'nav.lang': 'Language',
    'trending.week': 'Trending This Week',
    'see.all': 'See all',
    'explore.genres': 'Explore Genres',
    'search.placeholder': 'Search movies or series...',
    'search.title': 'Search Movies & Series',
    'search.hint': 'Type a movie or series title to start searching.',
    'search.none': 'Not Found',
    'search.noresult': 'No results for "{q}". Try another title.',
    'search.result': 'Results for "{q}"',
    'hero.play': 'Play Now',
    'hero.detail': 'View Details',
    'hero.playsub': 'Start Watching',
    'movie.sinopsis': 'Synopsis',
    'movie.cast': 'Cast',
    'movie.similar': 'Similar Movies',
    'movie.status': 'Status',
    'movie.runtime': 'Runtime',
    'movie.genres': 'Genres',
    'player.loading': 'Preparing player...',
    'player.playing': 'Playing via',
    'player.source': 'Source:',
    'player.unavailable': 'All player sources are unavailable right now.',
    'player.trailer': 'Player unavailable. Watch the official trailer:',
    'player.retry': 'Retry',
    'auth.welcome': 'Welcome to Zenflix',
    'auth.subtitle': 'Sign in or create an account to start watching',
    'auth.login': 'Sign In to Zenflix',
    'auth.register': 'Create New Account',
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.loginBtn': 'Sign In',
    'auth.registerBtn': 'Create Account',
    'auth.nohave': "Don't have an account? Sign Up",
    'auth.have': 'Already have an account? Sign In',
  },
} as const

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>('id')

  useEffect(() => {
    const saved = localStorage.getItem('zenflix-lang')
    if (saved === 'en' || saved === 'id') setLangState(saved)
  }, [])

  const setLang = (l: Lang) => {
    setLangState(l)
    localStorage.setItem('zenflix-lang', l)
  }

  const t = (id: string, en: string) => (lang === 'id' ? id : en)

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  )
}