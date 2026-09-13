import { redirect } from 'next/navigation'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import AuthForm from '@/components/AuthForm'

export default async function AuthPage() {
  const cookieStore = await cookies()

  // Server-side Supabase client utk cek session (pakai cookies)
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  let user: { id: string } | null = null
  try {
    const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
      cookies: {
        getAll: () => cookieStore.getAll(),
        setAll: () => {},
      },
    })
    const { data } = await supabase.auth.getUser()
    user = data.user
  } catch {
    user = null
  }

  if (user) redirect('/')

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 bg-[var(--bg)]">
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[var(--accent)]/5 rounded-full blur-3xl animate-float-slow" />
        <div className="absolute bottom-1/4 right-1/4 w-[300px] h-[300px] bg-[var(--accent)]/3 rounded-full blur-3xl animate-float-slow" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-[var(--accent)]/3 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center p-4 md:p-8">
        {/* Brand top-left */}
        <div className="fixed top-6 left-6 z-50 text-2xl md:text-3xl font-black tracking-tighter">
          ZENFLIX
        </div>

        {/* Auth card */}
        <div className="w-full max-w-md relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-black mb-2 gradient-text">
              Selamat Datang di Zenflix
            </h1>
            <p className="text-sm text-[var(--text-muted)]">
              Masuk atau buat akun untuk mulai menonton
            </p>
          </div>
          <AuthForm />
        </div>
      </div>
    </div>
  )
}