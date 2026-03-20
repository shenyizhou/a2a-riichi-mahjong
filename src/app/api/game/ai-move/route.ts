import { NextResponse } from 'next/server'
import { getSession } from '@/lib/secondme/session'
import { secondmeClient } from '@/lib/secondme/client'
import { getAIDecisionPrompt } from '@/lib/mahjong/game'
import type { GameState, MjaiAction } from '@/lib/types/mjai'

export async function POST(request: Request) {
  // Get access token: from session or use guest token if configured
  const session = await getSession()
  let accessToken: string | undefined

  if (session) {
    accessToken = session.accessToken
  } else if (process.env.GUEST_ACCESS_TOKEN) {
    // Guest mode: use demo token from environment
    accessToken = process.env.GUEST_ACCESS_TOKEN
  }

  if (!accessToken) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { gameState } = await request.json() as { gameState: GameState }
    const prompt = getAIDecisionPrompt(gameState, 1)

    const response = await secondmeClient.chat(accessToken, {
      messages: [
        { role: 'system', content: '你是一位立直麻将高手，你需要根据局面输出正确的动作。只输出 JSON，不要其他内容。' },
        { role: 'user', content: prompt },
      ],
    })

    // Parse AI response as JSON
    let action: MjaiAction
    try {
      // Try to extract JSON from response (AI might add extra text)
      const content = response.content
      const jsonMatch = content.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        action = JSON.parse(jsonMatch[0]) as MjaiAction
      } else {
        action = JSON.parse(content) as MjaiAction
      }
    } catch (e) {
      console.error('Failed to parse AI response:', response.content)
      // Default to none if parsing fails
      action = { type: 'none' }
    }

    return NextResponse.json({ action })
  } catch (error) {
    console.error('AI move error:', error)
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
