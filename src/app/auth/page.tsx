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
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      <div className="fixed top-4 left-6 z-50 text-xl font-black tracking-tighter">
        ZENFLIX
      </div>
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Selamat Datang di Zenflix</h1>
          <p className="text-sm text-[var(--text-muted)]">Masuk atau buat akun untuk mulai menonton</p>
        </div>
        <AuthForm />
      </div>
    </div>
  )
}