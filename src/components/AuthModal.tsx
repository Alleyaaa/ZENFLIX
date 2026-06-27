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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass-panel rounded-[var(--radius-xl)] p-8 w-full max-w-sm mx-4 shadow-2xl shadow-black/40">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">{mode === 'login' ? 'Masuk' : 'Daftar'}</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/[0.08] transition-colors text-[var(--text-tertiary)]">
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
            className="w-full px-4 py-3 rounded-[var(--radius-md)] bg-white/[0.04] border border-[var(--border-default)] outline-none focus:border-[var(--accent-blue)] transition-colors text-[var(--text-primary)] placeholder-[var(--text-tertiary)] text-sm"
          />
          <input
            type="password"
            required
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-4 py-3 rounded-[var(--radius-md)] bg-white/[0.04] border border-[var(--border-default)] outline-none focus:border-[var(--accent-blue)] transition-colors text-[var(--text-primary)] placeholder-[var(--text-tertiary)] text-sm"
          />
          {msg && <p className="text-sm text-center text-amber-400">{msg}</p>}
          <button
            type="submit"
            className="w-full py-3 rounded-[var(--radius-md)] btn-primary text-sm"
          >
            {mode === 'login' ? 'Masuk' : 'Daftar'}
          </button>
        </form>

        <p className="text-sm text-center text-[var(--text-tertiary)] mt-4">
          {mode === 'login' ? 'Belum punya akun?' : 'Sudah punya akun?'}
          <button
            type="button"
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-[var(--accent-blue)] ml-1 hover:underline font-medium"
          >
            {mode === 'login' ? 'Daftar' : 'Masuk'}
          </button>
        </p>
      </div>
    </div>
  )
}
