import type { Metadata } from 'next'
import Header from '@/components/Header'

export const metadata: Metadata = { title: 'Syarat & Ketentuan | Zenflix', description: 'Syarat dan ketentuan penggunaan layanan streaming Zenflix.' }

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-[760px] mx-auto px-4 pt-24 pb-16">
        <h1 className="text-3xl font-bold mb-2">Syarat &amp; Ketentuan</h1>
        <p className="text-sm text-[var(--text-tertiary)] mb-8">Efektif mulai: September 2026</p>
        <div className="space-y-6 text-sm leading-relaxed text-[var(--text-muted)]">
          <section>
            <h2 className="text-lg font-semibold text-[var(--text-main)] mb-2">1. Penerimaan Ketentuan</h2>
            <p>Dengan membuat akun atau menggunakan layanan Zenflix, Anda menyetujui Syarat &amp; Ketentuan ini. Jika tidak setuju, mohon tidak menggunakan layanan kami.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-[var(--text-main)] mb-2">2. Layanan</h2>
            <p>Zenflix adalah platform streaming film &amp; serial. Kami menyediakan akses konten sesuai dengan tier langganan yang Anda pilih: Free (dengan iklan), Standard, Premium, dan Ultimate.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-[var(--text-main)] mb-2">3. Akun</h2>
            <p>Anda bertanggung jawab menjaga kerahasiaan email dan password. Segala aktivitas di akun Anda adalah tanggung jawab Anda. Berikan informasi yang benar saat pendaftaran.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-[var(--text-main)] mb-2">4. Langganan &amp; Pembayaran</h2>
            <p>Langganan berbayar diproses melalui Midtrans. Harga tercantum pada halaman berlangganan. Anda dapat membatalkan perpanjangan sesuai kebijakan yang berlaku.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-[var(--text-main)] mb-2">5. Penggunaan yang Dilarang</h2>
            <p>Dilarang menyalahgunakan layanan, mengunduh konten secara massal, mencoba mengakses sistem secara tidak sah, atau menggunakan konten untuk tujuan komersial tanpa izin.</p>
          </section>
          <section>
            <h2 className="text-lg font-semibold text-[var(--text-main)] mb-2">6. Perubahan Ketentuan</h2>
            <p>Kami dapat memperbarui ketentuan ini sewaktu-waktu. Perubahan akan diinformasikan melalui platform.</p>
          </section>
        </div>
      </main>
    </div>
  )
}
