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
    <form onSubmit={handleSubmit} className="glass p-8 rounded-2xl space-y-5 max-w-md w-full mx-auto">
      <h2 className="text-2xl font-bold text-center">{isLogin ? 'Sign In' : 'Create Account'}</h2>
      {error && <div className="text-red-400 text-sm text-center bg-red-500/10 p-3 rounded-xl">{error}</div>}
      {success && <div className="text-green-400 text-sm text-center bg-green-500/10 p-3 rounded-xl">{success}</div>}
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="w-full p-3 rounded-xl bg-white/[0.06] border border-white/[0.1] outline-none text-white placeholder-gray-500 focus:border-white/30 transition-all"
        required
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="w-full p-3 rounded-xl bg-white/[0.06] border border-white/[0.1] outline-none text-white placeholder-gray-500 focus:border-white/30 transition-all"
        required
      />
      <button type="submit" disabled={loading} className="w-full py-3 rounded-xl text-lg font-semibold shadow-lg gradient-btn disabled:opacity-50">
        {loading ? 'Processing...' : isLogin ? 'Sign In' : 'Sign Up'}
      </button>
      <button type="button" className="text-xs text-gray-400 w-full hover:text-white transition-colors" onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess('') }}>
        {isLogin ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
      </button>
    </form>
  )
}
