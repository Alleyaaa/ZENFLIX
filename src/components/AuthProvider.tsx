'use client'

import { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { User } from '@supabase/supabase-js'

interface AuthCtx {
  user: User | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthCtx>({ user: null, loading: true, signOut: async () => {} })

// Auto-logout setelah 1 jam INACTIVE (tidak ada aktivitas user: klik, scroll, ketik)
// Aktivitas user = event mouse/keyboard/touch/scroll. Timer di-reset tiap aktivitas.
const INACTIVE_TIMEOUT_MS = 60 * 60 * 1000 // 1 jam

export function useAuth() {
  return useContext(AuthContext)
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const inactiveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const userRef = useRef<User | null>(null)
  userRef.current = user

  // ─── Sign out ───
  const signOut = useCallback(async () => {
    await supabase.auth.signOut()
    setUser(null)
    if (inactiveTimerRef.current) {
      clearTimeout(inactiveTimerRef.current)
      inactiveTimerRef.current = null
    }
  }, [])

  // ─── Timer auto-logout (reset tiap ada aktivitas) ───
  const resetInactiveTimer = useCallback(() => {
    if (inactiveTimerRef.current) clearTimeout(inactiveTimerRef.current)
    inactiveTimerRef.current = setTimeout(() => {
      // Hanya logout kalau masih ada user (inactive)
      if (userRef.current) {
        console.info('[Auth] Auto-logout setelah 1 jam inactive')
        supabase.auth.signOut().then(() => {
          setUser(null)
          // Redirect ke home kalau lagi di halaman protected
          if (window.location.pathname.startsWith('/profile') || window.location.pathname.startsWith('/admin')) {
            window.location.href = '/'
          }
        }).catch(() => {})
      }
    }, INACTIVE_TIMEOUT_MS)
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  // ─── Listener aktivitas user (bukan sekadar "page dibuka"): klik, scroll, ketik, touch ───
  useEffect(() => {
    const events: (keyof WindowEventMap)[] = [
      'mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'touchmove', 'wheel', 'pointerdown',
    ]
    const onActivity = () => resetInactiveTimer()
    events.forEach((ev) => window.addEventListener(ev, onActivity, { passive: true }))
    return () => {
      events.forEach((ev) => window.removeEventListener(ev, onActivity))
      if (inactiveTimerRef.current) clearTimeout(inactiveTimerRef.current)
    }
  }, [resetInactiveTimer])

  return (
    <AuthContext.Provider value={{ user, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}