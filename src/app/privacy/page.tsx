import type { Metadata } from 'next'
import Header from '@/components/Header'

export const metadata: Metadata = { title: 'Kebijakan Privasi | Zenflix', description: 'Kebijakan privasi layanan streaming Zenflix.' }

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-[760px] mx-auto px-4 pt-24 pb-16">
        <h1 className="text-3xl font-bold mb-2">Kebijakan Privasi</h1>
        <p className="text-sm text-[var(--text-tertiary)] mb-8">Efektif mulai: September 2026</p>
        <div className="space-y-6 text-sm leading-relaxed text-[var(--text-muted)]">
          <section>
            <h2 className="text-lg font-semibold text-[var(--text-main)] mb-2">1. Data yang Kami Kumpulkan</h2>
            <p>Kami mengumpulkan data akun (email, password terenkripsi), data aktivitas menonton, dan data teknis (perangkat, IP, cookie) untuk meningkatkan layanan.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-[var(--text-main)] mb-2">2. Penggunaan Data</h2>
            <p>Data digunakan untuk: menyediakan layanan, personalisasi rekomendasi, keamanan akun, dan analitik pengguna. Kami tidak menjual data pribadi Anda.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-[var(--text-main)] mb-2">3. Autentikasi</h2>
            <p>Autentikasi dikelola oleh Supabase dan OAuth (seperti Google). Data login diproses sesuai kebijakan penyedia tersebut.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-[var(--text-main)] mb-2">4. Keamanan</h2>
            <p>Kami menerapkan enkripsi, keamanan header, dan praktik OWASP untuk melindungi data Anda dari akses tidak sah.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-[var(--text-main)] mb-2">5. Cookie</h2>
            <p>Kami menggunakan cookie untuk sesi login dan preferensi. Anda dapat mengelola cookie lewat pengaturan browser.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-[var(--text-main)] mb-2">6. Hak Anda</h2>
            <p>Anda dapat mengakses, memperbaiki, atau menghapus data Anda. Hubungi support@zenflix.app untuk permintaan terkait data.</p>
          </section>
        </div>
      </main>
    </div>
  )
}
