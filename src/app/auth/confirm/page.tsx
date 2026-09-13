'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { CheckCircle, Loader2, XCircle } from 'lucide-react'

export default function AuthConfirm() {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const router = useRouter()

  useEffect(() => {
    const handleConfirm = async () => {
      const { data, error } = await supabase.auth.getSession()
      if (error) {
        setStatus('error')
        return
      }
      if (data.session) {
        setStatus('success')
        setTimeout(() => router.push('/'), 2000)
      } else {
        setStatus('error')
      }
    }
    handleConfirm()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card p-8 rounded-2xl text-center max-w-md w-full border border-[var(--border)]">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-[var(--accent)] animate-spin" />
            <p className="text-[var(--text-main)] font-medium">Memverifikasi akun Anda...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-400" />
            <p className="text-[var(--text-main)] font-medium">Akun berhasil diverifikasi!</p>
            <p className="text-sm text-[var(--text-muted)] mt-2">Mengalihkan ke beranda...</p>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <p className="text-[var(--text-main)] font-medium">Verifikasi gagal atau link sudah kedaluwarsa.</p>
            <p className="text-sm text-[var(--text-muted)] mt-2">Coba masuk langsung atau daftar ulang.</p>
            <a href="/auth" className="inline-block mt-4 px-6 py-2 rounded-xl btn-primary" style={{color: 'var(--accent-contrast)'}}>Kembali ke Login</a>
          </>
        )}
      </div>
    </div>
  )
}