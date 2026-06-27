'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useUserTier() {
  const [tier, setTier] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.user) { setLoading(false); return }
      fetch(`/api/subscription`)
        .then(r => r.json())
        .then(d => setTier(d?.tier || 'free'))
        .catch(() => setTier('free'))
        .finally(() => setLoading(false))
    })
  }, [])

  return { tier: tier || 'free', loading }
}
