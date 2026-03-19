import { NextResponse } from 'next/server'
import { secondmeClient } from '@/lib/secondme/client'

export async function GET() {
  // Generate random state for CSRF protection
  const state = crypto.randomUUID()
  const authUrl = secondmeClient.getAuthorizationUrl(state)

  // Store state in cookie for validation later
  const response = NextResponse.redirect(authUrl)
  response.cookies.set('secondme-state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 10 * 60, // 10 minutes
  })

  return response
}
