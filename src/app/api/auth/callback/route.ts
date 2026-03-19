import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { secondmeClient } from '@/lib/secondme/client'
import { setSession } from '@/lib/secondme/session'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')
  const state = searchParams.get('state')

  // Validate state
  const cookieStore = await cookies()
  const storedState = cookieStore.get('secondme-state')?.value

  if (!state || !storedState || state !== storedState) {
    return NextResponse.redirect(new URL('/?error=invalid_state', request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL('/?error=missing_code', request.url))
  }

  try {
    // Exchange code for tokens
    const tokens = await secondmeClient.exchangeCode(code)

    // Get user info
    const userInfo = await secondmeClient.getUserInfo(tokens.accessToken)

    // Calculate expiration time
    const expiresAt = Date.now() + tokens.expiresIn * 1000

    // Create session
    await setSession({
      secondmeUserId: userInfo.userId,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      tokenExpiresAt: expiresAt,
      userInfo,
    })

    // Clear state cookie
    const response = NextResponse.redirect(new URL('/', request.url))
    response.cookies.delete('secondme-state')

    return response
  } catch (error) {
    console.error('OAuth callback error:', error)
    return NextResponse.redirect(new URL('/?error=auth_failed', request.url))
  }
}
