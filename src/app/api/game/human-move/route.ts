import { NextResponse } from 'next/server'
import { getSession } from '@/lib/secondme/session'
import { applyAction } from '@/lib/mahjong/game'
import type { GameState, MjaiAction } from '@/lib/types/mjai'

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { gameState, action } = await request.json() as {
    gameState: GameState
    action: MjaiAction
  }

  const newState = applyAction(gameState, action, 0)
  return NextResponse.json({ gameState: newState })
}
