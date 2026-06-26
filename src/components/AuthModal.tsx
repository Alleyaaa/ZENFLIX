'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { X } from 'lucide-react'

interface Props {
  onClose: () => void
}

export default function AuthModal({ onClose }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'login' | 'signup'>('login')
  const [msg, setMsg] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMsg('')
    const opts = { email, password }

    const { error } = mode === 'login'
      ? await supabase.auth.signInWithPassword(opts)
      : await supabase.auth.signUp(opts)

    if (error) {
      setMsg(error.message)
    } else if (mode === 'signup') {
      setMsg('Cek email untuk verifikasi.')
    } else {
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="glass rounded-3xl p-8 w-full max-w-sm mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold">{mode === 'login' ? 'Masuk' : 'Daftar'}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Email"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-[var(--accent)] transition-colors"
          />
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 rounded-xl bg-white/5 border border-white/10 outline-none focus:border-[var(--accent)] transition-colors"
          />
          {msg && <p className="text-sm text-center text-amber-400">{msg}</p>}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-semibold hover:opacity-90 transition-opacity"
          >
            {mode === 'login' ? 'Masuk' : 'Daftar'}
          </button>
        </form>

        <p className="text-sm text-center text-[var(--text-secondary)] mt-4">
          {mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-[var(--accent)] ml-1 hover:underline"
          >
            {mode === 'login' ? 'Daftar' : 'Masuk'}
          </button>
        </p>
      </div>
    </div>
  )
}
