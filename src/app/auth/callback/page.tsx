'use client'
import { Suspense, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, CheckCircle, XCircle, ArrowRight } from 'lucide-react'
import { useLang } from '@/lib/lang-context'

function AuthCallbackContent() {
  const { lang } = useLang()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')

  const t = (id: string, en: string) => (lang === 'id' ? id : en)

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const error = searchParams.get('error')

      if (error) {
        setStatus('error')
        return
      }

      if (code) {
        // OAuth flow: exchange code for session
        const { data, error: err } = await supabase.auth.exchangeCodeForSession(code)
        if (err) {
          setStatus('error')
          return
        }
        if (data.session) {
          setStatus('success')
          setTimeout(() => router.push('/'), 2000)
        } else {
          setStatus('error')
        }
      } else {
        // Magic link / email confirm flow
        const { data, error: err } = await supabase.auth.getSession()
        if (err || !data.session) {
          setStatus('error')
        } else {
          setStatus('success')
          setTimeout(() => router.push('/'), 2000)
        }
      }
    }

    handleCallback()
  }, [router, searchParams])

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="glass-card p-8 rounded-2xl text-center max-w-md w-full border border-[var(--border)]">
        {status === 'loading' && (
          <>
            <Loader2 className="w-12 h-12 mx-auto mb-4 text-[var(--accent)] animate-spin" />
            <p className="text-[var(--text-main)] font-medium">{t('Memproses autentikasi...', 'Processing authentication...')}</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle className="w-12 h-12 mx-auto mb-4 text-green-400" />
            <p className="text-[var(--text-main)] font-medium">{t('Berhasil masuk!', 'Signed in successfully!')}</p>
            <p className="text-sm text-[var(--text-muted)] mt-2">{t('Mengalihkan ke beranda...', 'Redirecting to home...')}</p>
            <button
              onClick={() => router.push('/')}
              className="mt-4 inline-flex items-center gap-2 px-6 py-2 rounded-xl btn-primary"
              style={{color: 'var(--accent-contrast)'}}
            >
              <ArrowRight size={16} />
              {t('Klik jika tidak teralihkan', 'Click if not redirected')}
            </button>
          </>
        )}
        {status === 'error' && (
          <>
            <XCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
            <p className="text-[var(--text-main)] font-medium">{t('Autentikasi gagal atau link sudah kedaluwarsa.', 'Authentication failed or link expired.')}</p>
            <p className="text-sm text-[var(--text-muted)] mt-2">{t('Coba masuk langsung atau daftar ulang.', 'Try signing in directly or sign up again.')}</p>
            <a href="/auth" className="inline-block mt-4 px-6 py-2 rounded-xl btn-primary" style={{color: 'var(--accent-contrast)'}}>{t('Kembali ke Login', 'Back to Login')}</a>
          </>
        )}
      </div>
    </div>
  )
}

export default function AuthCallback() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="glass-card p-8 rounded-2xl text-center max-w-md w-full border border-[var(--border)]">
          <Loader2 className="w-12 h-12 mx-auto mb-4 text-[var(--accent)] animate-spin" />
          <p className="text-[var(--text-main)] font-medium">Memproses autentikasi...</p>
        </div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  )
}