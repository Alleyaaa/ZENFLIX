import Link from 'next/link'
import { AsciiPopcornLoader } from '@/components/AsciiArt'

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg)]">
      <div className="max-w-lg w-full text-center">
        <AsciiPopcornLoader />
        <h1 className="text-3xl font-bold mt-4">404 - Halaman Tidak Ditemukan</h1>
        <p className="text-[var(--text-muted)] mt-2">Kayaknya halaman yang kamu cari udah dipindah atau nggak ada.</p>
        <div className="flex justify-center gap-3 mt-6">
          <Link href="/" className="btn-primary">Ke Beranda</Link>
          <Link href="/category/popular" className="glass-btn px-4 py-2 rounded-lg">Film Populer</Link>
        </div>
      </div>
    </div>
  )
}