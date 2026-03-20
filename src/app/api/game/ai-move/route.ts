import { NextResponse } from 'next/server'
import { getSession } from '@/lib/secondme/session'
import { processAITurn } from '@/lib/mahjong/game'
import type { GameState } from '@/lib/types/mjai'

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { gameState } = await request.json() as { gameState: GameState }
    const result = processAITurn(gameState)
    return NextResponse.json(result)
  } catch (error) {
    console.error('AI move error:', error)
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
