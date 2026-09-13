'use client'
import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'

export default function SearchDropdown({ lang }: { lang: string }) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const click = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false)
    document.addEventListener('mousedown', click)
    return () => document.removeEventListener('mousedown', click)
  }, [])

  useEffect(() => {
    if (query.length < 2) { setResults([]); return }
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(query)}`)
        const d = await r.json()
        setResults(d.results?.slice(0, 6) || [])
        setOpen(true)
      } catch { setResults([]) }
    }, 300)
    return () => clearTimeout(t)
  }, [query])

  return (
    <div ref={ref} className="relative">
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full glass-btn text-[13px] text-[var(--text-muted)] focus-within:text-[var(--text-main)] transition-all">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        <input
          type="text"
          placeholder={lang === 'id' ? 'Cari film...' : 'Search movies...'}
          value={query}
          onChange={e => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          className="bg-transparent outline-none text-[var(--text-main)] w-28 md:w-32 placeholder-[var(--text-tertiary)]"
        />
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 rounded-2xl glass-panel shadow-xl shadow-black/40 overflow-hidden z-50">
          {results.map((m: any) => (
            <Link
              key={m.id}
              href={`/movie/${m.id}`}
              onClick={() => { setOpen(false); setQuery('') }}
              className="flex items-center gap-3 px-3 py-2.5 hover:bg-[var(--border)]/30 transition-colors border-b border-[var(--border)] last:border-0"
            >
              {m.poster_path ? (
                <img src={`https://image.tmdb.org/t/p/w92${m.poster_path}`} alt="" className="w-8 h-12 rounded-lg object-cover shrink-0" />
              ) : (
                <div className="w-8 h-12 rounded-lg bg-[var(--border)] shrink-0" />
              )}
              <div className="min-w-0">
                <div className="text-xs font-medium truncate text-[var(--text-main)]">{m.title}</div>
                <div className="text-[10px] text-[var(--text-tertiary)]">{m.release_date?.split('-')[0] || 'Tahun?'}</div>
              </div>
              {m.vote_average > 0 && (
                <span className="ml-auto text-[10px] text-yellow-400/70 shrink-0">{m.vote_average.toFixed(1)}</span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
