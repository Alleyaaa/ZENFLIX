'use client'
import { useEffect, useState } from 'react'

// ─── ASCII Art Zenflix (F8: original content) ───

const ASCII_LOADING = [
  `  ███████╗███████╗███╗   ██╗███████╗██╗     ██╗██╗  ██╗`,
  `  ╚══███╔╝██╔════╝████╗  ██║██╔════╝██║     ██║╚██╗██╔╝`,
  `    ███╔╝ █████╗  ██╔██╗ ██║█████╗  ██║     ██║ ╚███╔╝ `,
  `   ███╔╝  ██╔══╝  ██║╚██╗██║██╔══╝  ██║     ██║ ██╔██╗ `,
  `  ███████╗███████╗██║ ╚████║██║     ███████╗██║██╔╝ ██╗`,
  `  ╚══════╝╚══════╝╚═╝  ╚═══╝╚═╝     ╚══════╝╚═╝╚═╝  ╚═╝`,
]

const ASCII_POPCORN = [
  `      .--.     .--.     .--.     .--.     .--.`,
  `     /    \\   /    \\   /    \\   /    \\   /    \\`,
  `    /  🍿  \\ /  🍿  \\ /  🍿  \\ /  🍿  \\ /  🍿  \\`,
  `    \\      / \\      / \\      / \\      / \\      /`,
  `     '----'   '----'   '----'   '----'   '----'`,
  `     ||||||   ||||||   ||||||   ||||||   ||||||`,
  `   __|||||||_|||||||_|||||||_|||||||_|||||||__`,
  `  |___________________________________________|`,
]

const ASCII_GLITCH = [
  `  ███████╗███████╗███╗   ██╗███████╗██╗     ██╗██╗  ██╗    ███████╗██████╗ ██████╗  ██████╗ ██████╗`,
  `  ╚══███╔╝██╔════╝████╗  ██║██╔════╝██║     ██║╚██╗██╔╝    ██╔════╝██╔══██╗██╔══██╗██╔═══██╗██╔══██╗`,
  `    ███╔╝ █████╗  ██╔██╗ ██║█████╗  ██║     ██║ ╚███╔╝     █████╗  ██████╔╝██████╔╝██║   ██║██████╔╝`,
  `    ██╔╝  ██╔══╝  ██║╚██╗██║██╔══╝  ██║     ██║ ██╔██╗     ██╔══╝  ██╔══██╗██╔══██╗██║   ██║██╔═══╝ `,
  `    ██║   ███████╗██║ ╚████║██║     ███████╗██║██╔╝ ██╗    ██║     ██║  ██║██║  ██║╚██████╔╝██║     `,
  `    ╚═╝   ╚══════╝╚═╝  ╚═══╝╚═╝     ╚══════╝╚═╝╚═╝  ╚═╝    ╚═╝     ╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝     `,
]

const ASCII_MOVIE = [
  `        ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░`,
  `        ░░░░░░░░░░░░░████████████████░░░░░░░░░░░░░░`,
  `        ░░░░░░░░░░░░██████████████████░░░░░░░░░░░░░`,
  `        ░░░░░░░░░░░█████░░░░░░░░░░█████░░░░░░░░░░░░`,
  `        ░░░░░░░░░░████░░░░░░░░░░░░░░████░░░░░░░░░░░`,
  `        ░░░░░░░░░████░░░░░░░░░░░░░░░░████░░░░░░░░░░`,
  `        ░░░░░░░░████░░░░░░░░░░░░░░░░░░████░░░░░░░░░`,
  `        ░░░░░░░████░░░░░░░░░░░░░░░░░░░░████░░░░░░░░`,
  `        ░░░░░░████░░░░░░░░░░░░░░░░░░░░░░████░░░░░░░`,
  `        ░░░░░████░░░░░░░░░░░░░░░░░░░░░░░░████░░░░░░`,
  `        ░░░░░████████████████████████████████░░░░░░░`,
]

export function ZenflixAsciiLoading() {
  const [frame, setFrame] = useState(0)
  const lines = ASCII_LOADING

  useEffect(() => {
    const t = setInterval(() => setFrame(f => (f + 1) % 2), 500)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8 select-none">
      <pre className="text-[var(--accent)] text-[10px] md:text-xs leading-tight font-mono">
        {lines.join('\n')}
      </pre>
      <div className="flex gap-1.5 mt-2">
        {[0, 1, 2].map(i => (
          <div key={i}
            className={`w-2 h-2 rounded-full bg-[var(--accent)] transition-all duration-300 ${i <= frame ? 'opacity-100 scale-100' : 'opacity-30 scale-75'}`} />
        ))}
      </div>
      <p className="text-xs text-[var(--text-muted)] font-mono animate-pulse">MEMUAT...</p>
    </div>
  )
}

export function ZenflixAsciiError() {
  const [glitch, setGlitch] = useState(false)
  useEffect(() => {
    const t = setInterval(() => setGlitch(g => !g), 500)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="flex flex-col items-center justify-center gap-4 py-10 select-none">
      <pre className={`font-mono text-[10px] md:text-xs leading-tight transition-all ${glitch ? 'text-red-500 translate-x-0.5' : 'text-[var(--text-tertiary)] translate-x-0'}`}>
        {ASCII_GLITCH.join('\n')}
      </pre>
      <h2 className="text-xl font-bold text-red-400">Error</h2>
      <p className="text-sm text-[var(--text-muted)] text-center max-w-md">
        Ups, ada yang error nih. Coba muat ulang atau kembali ke beranda.
      </p>
      <div className="flex gap-3">
        <button onClick={() => window.location.reload()} className="btn-primary text-sm">Muat Ulang</button>
        <button onClick={() => { window.location.href = '/' }} className="glass-btn px-4 py-2 rounded-lg text-sm">Ke Beranda</button>
      </div>
    </div>
  )
}

export function ZenflixAsciiEasterEgg() {
  const [, setSeq] = useState('')
  const [revealed, setRevealed] = useState(false)
  const KONAMI = 'arrowuparrowdownarrowleftarrowright'

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase()
      const map: Record<string, string> = { arrowup: 'arrowup', arrowdown: 'arrowdown', arrowleft: 'arrowleft', arrowright: 'arrowright' }
      if (!map[key]) { setSeq(''); return }
      setSeq(s => {
        const next = (s + map[key]).slice(-KONAMI.length)
        if (next === KONAMI) setRevealed(true)
        return next
      })
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  if (!revealed) return null

  return (
    <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 glass-panel rounded-2xl p-5 text-center shadow-2xl">
      <pre className="font-mono text-green-400 text-[10px] leading-tight">
        {ASCII_MOVIE.join('\n')}
      </pre>
      <p className="text-sm font-bold mt-2">🎉 SELAMAT! KAMU BUKA EASTER EGG ZENFLIX!</p>
      <p className="text-xs text-[var(--text-muted)] mt-1">Nikmati film gratis 1x: ketik kode promo <code className="text-[var(--accent)]">ZENFLIXEASTER</code></p>
      <button onClick={() => setRevealed(false)} className="mt-3 text-xs text-[var(--text-tertiary)] hover:text-[var(--text-main)]">Tutup</button>
    </div>
  )
}

export function AsciiPopcornLoader() {
  return (
    <div className="flex flex-col items-center gap-2 py-8 select-none">
      <pre className={`font-mono text-[10px] md:text-xs leading-tight text-[var(--accent)] transition-all animate-bounce`}>
        {ASCII_POPCORN.join('\n')}
      </pre>
      <p className="text-xs text-[var(--text-muted)] font-mono animate-pulse">Menyiapkan popcorn...</p>
    </div>
  )
}