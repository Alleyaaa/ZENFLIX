import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Header from '@/components/Header'
import MovieGrid from '@/components/MovieGrid'

const TMDB_KEY = process.env.TMDB_API_KEY
const TMDB_BASE = 'https://api.themoviedb.org/3'

const COUNTRY_NAMES: Record<string, { id: string; en: string }> = {
  US: { id: 'Amerika', en: 'USA' },
  KR: { id: 'Korea', en: 'South Korea' },
  JP: { id: 'Jepang', en: 'Japan' },
  GB: { id: 'Inggris', en: 'UK' },
  ID: { id: 'Indonesia', en: 'Indonesia' },
  IN: { id: 'India', en: 'India' },
  FR: { id: 'Prancis', en: 'France' },
  DE: { id: 'Jerman', en: 'Germany' },
  CN: { id: 'China', en: 'China' },
  HK: { id: 'Hong Kong', en: 'Hong Kong' },
  TH: { id: 'Thailand', en: 'Thailand' },
  MX: { id: 'Meksiko', en: 'Mexico' },
}

const VALID_COUNTRIES = Object.keys(COUNTRY_NAMES)

export async function generateMetadata({ params }: { params: Promise<{ code: string }> }): Promise<Metadata> {
  const { code } = await params
  const name = COUNTRY_NAMES[code.toUpperCase()]
  if (!name) return {}
  return {
    title: `Film ${name.id} | Zenflix`,
    description: `Koleksi film dari ${name.id} terbaik di Zenflix. Streaming film ${name.id} kualitas HD.`,
  }
}

export default async function CountryPage({ params }: { params: Promise<{ code: string }> }) {
  const code = (await params).code.toUpperCase()
  if (!VALID_COUNTRIES.includes(code)) notFound()

  let movies: any[] = []
  try {
    const url = `${TMDB_BASE}/discover/movie?api_key=${TMDB_KEY}&language=id-ID&sort_by=popularity.desc&with_origin_country=${code}&page=1`
    const res = await fetch(url, { next: { revalidate: 3600 }, signal: AbortSignal.timeout(10000) })
    if (res.ok) {
      const data = await res.json()
      movies = data.results || []
    }
  } catch {
    movies = []
  }

  const name = COUNTRY_NAMES[code]

  return (
    <>
      <Header />
      <main className="max-w-[1400px] mx-auto px-4 py-6 md:pt-24">
        <h1 className="text-2xl md:text-3xl font-bold mb-2">Film {name.id}</h1>
        <p className="text-sm text-[var(--text-muted)] mb-6">{movies.length} judul tersedia</p>
        <MovieGrid movies={movies} />
      </main>
    </>
  )
}