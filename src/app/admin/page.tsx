import type { Metadata } from 'next'
import Header from '@/components/Header'
import AdminPanel from '@/components/AdminPanel'

export const metadata: Metadata = {
  title: 'Admin Zenflix',
  description: 'Panel administrasi Zenflix',
  robots: { index: false, follow: false },
}

export default function AdminPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-20">
        <div className="max-w-[1200px] mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-4xl font-black mb-2">Panel <span className="gradient-text">Admin</span></h1>
            <p className="text-[var(--text-muted)]">Kelola laporan bug, komentar, dan statistik Zenflix.</p>
          </div>
          <AdminPanel />
        </div>
      </main>
    </>
  )
}