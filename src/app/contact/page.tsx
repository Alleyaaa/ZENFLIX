import type { Metadata } from 'next'
import Header from '@/components/Header'
import Footer from '@/components/Footer'
import ContactForm from '@/components/ContactForm'

export const metadata: Metadata = {
  title: 'Kontak & Laporkan Bug | Zenflix',
  description: 'Hubungi kami atau laporkan bug/masalah di Zenflix. Kami siap membantu.',
}

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen pt-24 pb-20">
        <div className="max-w-[800px] mx-auto px-4">
          <div className="text-center mb-10">
            <h1 className="text-3xl md:text-5xl font-black mb-3">Kontak & <span className="gradient-text">Laporkan Bug</span></h1>
            <p className="text-[var(--text-muted)] max-w-xl mx-auto">
              Ada masalah atau bug di Zenflix? Laporkan lewat form di bawah, atau hubungi kami via sosial media.
            </p>
          </div>
          <ContactForm />
        </div>
      </main>
      <Footer />
    </>
  )
}