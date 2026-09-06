'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Mail, Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle } from 'lucide-react'

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const validateEmail = (e: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)
  const validatePassword = (p: string) => p.length >= 8

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (!validateEmail(email)) {
      setError(isLogin ? 'Email tidak valid' : 'Email tidak valid')
      return
    }
    if (!isLogin && !validatePassword(password)) {
      setError('Password minimal 8 karakter')
      return
    }

    setLoading(true)
    try {
      if (isLogin) {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password })
        if (err) {
          setError(err.message === 'Invalid login credentials' ? 'Email atau password salah' : err.message)
          return
        }
        router.push('/')
      } else {
        const { error: err } = await supabase.auth.signUp({ email, password })
        if (err) {
          setError(err.message)
          return
        }
        setSuccess('Akun dibuat! Cek email untuk verifikasi, lalu masuk.')
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  const passwordStrength = !password ? 0 : password.length >= 8 ? 3 : password.length >= 6 ? 2 : 1

  return (
    <form onSubmit={handleSubmit} className="glass-card p-8 rounded-2xl space-y-5 max-w-md w-full mx-auto">
      <h2 className="text-2xl font-bold text-center text-[var(--text-main)]">
        {isLogin ? 'Masuk ke Zenflix' : 'Buat Akun Baru'}
      </h2>

      {error && (
        <div className="flex items-center gap-2 text-red-400 text-sm bg-red-500/10 p-3 rounded-xl">
          <AlertCircle size={16} /> {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 text-green-400 text-sm bg-green-500/10 p-3 rounded-xl">
          <CheckCircle size={16} /> {success}
        </div>
      )}

      <div className="space-y-1">
        <label htmlFor="email" className="block text-sm text-[var(--text-muted)] mb-1">Email</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" size={18} />
          <input
            id="email"
            type="email"
            placeholder={isLogin ? 'Email' : 'Email untuk akun'}
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full pl-10 pr-3 py-3 rounded-xl bg-[var(--border)]/20 border border-[var(--border)] outline-none text-[var(--text-main)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all"
            required
            autoComplete="email"
            disabled={loading}
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="password" className="block text-sm text-[var(--text-muted)] mb-1 flex items-center justify-between">
          Password
          {!isLogin && (
            <div className="flex gap-1" aria-label="Password strength">
              {[1, 2, 3].map((level) => (
                <div
                  key={level}
                  className={`w-6 h-1.5 rounded transition-colors ${
                    level <= passwordStrength
                      ? level === 1 ? 'bg-red-500' : level === 2 ? 'bg-yellow-500' : 'bg-green-500'
                      : 'bg-[var(--border)]'
                  }`}
                />
              ))}
            </div>
          )}
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)]" size={18} />
          <input
            id="password"
            type={showPassword ? 'text' : 'password'}
            placeholder={isLogin ? 'Password' : 'Minimal 8 karakter'}
            value={password}
            onChange={e => setPassword(e.target.value)}
            className="w-full pl-10 pr-12 py-3 rounded-xl bg-[var(--border)]/20 border border-[var(--border)] outline-none text-[var(--text-main)] placeholder-[var(--text-tertiary)] focus:border-[var(--accent)] focus:ring-1 focus:ring-[var(--accent)] transition-all"
            required
            autoComplete={isLogin ? 'current-password' : 'new-password'}
            disabled={loading}
            minLength={isLogin ? undefined : 8}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-tertiary)] hover:text-[var(--text-main)] transition-colors"
            aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {!isLogin && !passwordStrength && (
          <p className="text-xs text-[var(--text-tertiary)]">Password minimal 8 karakter</p>
        )}
      </div>

      <button
        type="submit"
        disabled={loading || !validateEmail(email) || (!isLogin && !validatePassword(password))}
        className="w-full py-3 rounded-xl text-lg font-semibold shadow-lg btn-primary text-center disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <Loader2 size={18} className="animate-spin" />
            {isLogin ? 'Memproses...' : 'Membuat akun...'}
          </>
        ) : (
          isLogin ? 'Masuk' : 'Buat Akun'
        )}
      </button>

      <button
        type="button"
        className="text-sm text-[var(--text-tertiary)] w-full hover:text-[var(--accent)] transition-colors font-medium"
        onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess('') }}
        disabled={loading}
      >
        {isLogin ? 'Belum punya akun? Daftar di sini' : 'Sudah punya akun? Masuk'}
      </button>
    </form>
  )
}