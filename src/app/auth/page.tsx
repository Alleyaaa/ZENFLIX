import { redirect } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import AuthForm from '@/components/AuthForm'

export default async function AuthPage() {
  const { data: { user } } = await supabase.auth.getUser()
  if (user) redirect('/')

  return (
    <div className="auth-gradient min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="fixed top-4 left-6 z-50 text-xl font-black tracking-tighter gradient-text">
        ZENFLIX
      </div>
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-blue-500/10 rounded-full blur-[100px]" />
      <div className="absolute bottom-1/4 -right-20 w-72 h-72 bg-cyan-500/10 rounded-full blur-[100px]" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-sky-500/5 rounded-full blur-[120px]" />

      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <p className="text-sm text-[var(--text-secondary)]">Sign in to start watching</p>
        </div>
        <AuthForm />
      </div>
    </div>
  )
}
