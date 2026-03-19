'use client'

import { SessionData } from '@/lib/types/secondme'
import { use, useState, useEffect } from 'react'

async function fetchSession(): Promise<SessionData | null> {
  try {
    const res = await fetch('/api/auth/session', {
      credentials: 'same-origin',
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.session
  } catch {
    return null
  }
}

export function useSession() {
  const [session, setSession] = useState<SessionData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSession().then((sess) => {
      setSession(sess)
      setLoading(false)
    })
  }, [])

  return { session, loading }
}
