import { NextResponse } from 'next/server'
import { getSession, isTokenExpired, refreshToken } from '@/lib/secondme/session'
import { secondmeClient } from '@/lib/secondme/client'
import { setSession } from '@/lib/secondme/session'

export async function GET() {
  const session = await getSession()

  if (!session) {
    return NextResponse.json({ session: null })
  }

  // Refresh token if expired
  if (isTokenExpired(session)) {
    try {
      const newTokens = await secondmeClient.refreshToken(session.refreshToken)
      const expiresAt = Date.now() + newTokens.expiresIn * 1000
      const updatedSession = {
        ...session,
        accessToken: newTokens.accessToken,
        refreshToken: newTokens.refreshToken,
        tokenExpiresAt: expiresAt,
      }
      await setSession(updatedSession)
      return NextResponse.json({ session: updatedSession })
    } catch {
      // If refresh fails, return null (user needs to login again)
      return NextResponse.json({ session: null })
    }
  }

  return NextResponse.json({ session })
}
