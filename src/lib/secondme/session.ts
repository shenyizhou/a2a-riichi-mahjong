import { cookies } from 'next/headers'
import { SessionData } from '@/lib/types/secondme'

const SESSION_COOKIE = 'secondme-session'

export async function getSession(): Promise<SessionData | null> {
  // Debug mode: skip login if enabled
  if (process.env.DEBUG_SKIP_LOGIN === 'true') {
    return {
      secondmeUserId: 'debug-user',
      accessToken: process.env.DEBUG_ACCESS_TOKEN || 'debug-token',
      refreshToken: 'debug-refresh',
      tokenExpiresAt: Date.now() + 365 * 24 * 60 * 60 * 1000, // 1 year
      userInfo: {
        userId: 'debug-user',
        username: 'debug',
        displayName: '调试用户',
      },
    }
  }

  const cookieStore = await cookies()
  const session = cookieStore.get(SESSION_COOKIE)
  if (!session?.value) return null

  try {
    return JSON.parse(session.value) as SessionData
  } catch {
    return null
  }
}

export async function setSession(session: SessionData): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  })
}

export async function clearSession(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export function isTokenExpired(session: SessionData): boolean {
  return Date.now() >= session.tokenExpiresAt
}
