'use client'
import Header from '@/components/Header'
import Link from 'next/link'
import { useAuth } from '@/components/AuthProvider'
import { useLang } from '@/lib/lang-context'
import { Settings, ArrowLeft, Bell, Globe, Palette } from 'lucide-react'

export default function SettingsPage() {
  const { user } = useAuth()
  const { lang, setLang } = useLang()
  const isID = lang === 'id'

  return (
    <div className="min-h-screen">
      <Header />
      <main className="max-w-[760px] mx-auto px-4 pt-24 pb-16">
        <Link href="/profile" className="inline-flex items-center gap-1.5 text-sm text-[var(--text-muted)] hover:text-[var(--text-main)] mb-4 transition-colors">
          <ArrowLeft size={16} /> {isID ? 'Kembali ke Profil' : 'Back to Profile'}
        </Link>
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-xl bg-[var(--accent)] bg-opacity-15 flex items-center justify-center">
            <Settings size={22} className="text-[var(--accent)]" />
          </div>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">{isID ? 'Pengaturan' : 'Settings'}</h1>
            <p className="text-sm text-[var(--text-muted)]">{isID ? 'Kelola preferensi akun Anda' : 'Manage your account preferences'}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe size={20} className="text-[var(--text-muted)]" />
              <div>
                <p className="font-medium">{isID ? 'Bahasa' : 'Language'}</p>
                <p className="text-xs text-[var(--text-tertiary)]">{isID ? 'Bahasa antarmuka aplikasi' : 'App interface language'}</p>
              </div>
            </div>
            <button onClick={() => setLang(lang === 'id' ? 'en' : 'id')} className="px-4 py-2 rounded-lg glass-btn text-sm">
              {isID ? 'Ganti ke English' : 'Switch to Bahasa'}
            </button>
          </div>

          <div className="glass-card rounded-2xl p-5 flex items-center justify-between opacity-60">
            <div className="flex items-center gap-3">
              <Bell size={20} className="text-[var(--text-muted)]" />
              <div>
                <p className="font-medium">{isID ? 'Notifikasi' : 'Notifications'}</p>
                <p className="text-xs text-[var(--text-tertiary)]">{isID ? 'Segera hadir' : 'Coming soon'}</p>
              </div>
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Palette size={20} className="text-[var(--text-muted)]" />
              <div>
                <p className="font-medium">{isID ? 'Tampilan' : 'Appearance'}</p>
                <p className="text-xs text-[var(--text-tertiary)]">{isID ? 'Mode gelap/terang via ikon di navbar' : 'Dark/light via the navbar icon'}</p>
              </div>
            </div>
          </div>

          {user && (
            <div className="glass-card rounded-2xl p-5">
              <p className="text-sm text-[var(--text-tertiary)] mb-1">{isID ? 'Akun terhubung' : 'Signed in as'}</p>
              <p className="font-medium truncate">{user.email}</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
