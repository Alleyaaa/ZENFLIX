'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      if (isLogin) {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password })
        if (err) { setError(err.message); setLoading(false); return }
        router.push('/')
      } else {
        const { error: err } = await supabase.auth.signUp({ email, password })
        if (err) { setError(err.message); setLoading(false); return }
        setSuccess('Account created! Check email or try signing in.')
        setLoading(false)
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="glass-card p-8 rounded-2xl space-y-5 max-w-md w-full mx-auto">
      <h2 className="text-2xl font-bold text-center text-[var(--text-main)]">{isLogin ? 'Sign In' : 'Create Account'}</h2>
      {error && <div className="text-red-400 text-sm text-center bg-red-500/10 p-3 rounded-xl">{error}</div>}
      {success && <div className="text-green-400 text-sm text-center bg-green-500/10 p-3 rounded-xl">{success}</div>}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="w-full p-3 rounded-xl bg-[var(--border)]/20 border border-[var(--border)] outline-none text-[var(--text-main)] placeholder-[var(--text-tertiary)] focus:border-[var(--color-accent)] transition-all"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="w-full p-3 rounded-xl bg-[var(--border)]/20 border border-[var(--border)] outline-none text-[var(--text-main)] placeholder-[var(--text-tertiary)] focus:border-[var(--color-accent)] transition-all"
        required
      />
      <button type="submit" disabled={loading} className="w-full py-3 rounded-xl text-lg font-semibold shadow-lg btn-primary text-center disabled:opacity-50">
        {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
      </button>
      <button type="button" className="text-xs text-[var(--text-tertiary)] w-full hover:text-[var(--text-main)] transition-colors" onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess('') }}>
        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
      </button>
    </form>
  )
}
