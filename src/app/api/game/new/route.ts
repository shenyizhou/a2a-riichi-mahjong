import { NextResponse } from 'next/server'
import { getSession } from '@/lib/secondme/session'
import { createNewGame } from '@/lib/mahjong/game'

export async function GET() {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const game = createNewGame()
  return NextResponse.json({ game })
}
