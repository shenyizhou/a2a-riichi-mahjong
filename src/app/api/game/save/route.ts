import { NextResponse } from 'next/server'
import { getSession } from '@/lib/secondme/session'
import { secondmeClient } from '@/lib/secondme/client'
import { saveGameRecordToNote } from '@/lib/mahjong/game'
import type { GameState } from '@/lib/types/mjai'

export async function POST(request: Request) {
  const session = await getSession()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { gameState, duration } = await request.json() as {
      gameState: GameState
      duration: number
    }

    const { title, content } = saveGameRecordToNote(gameState, duration)

    const result = await secondmeClient.addNote(session.accessToken, {
      title,
      content,
      visibility: 'private',
    })

    return NextResponse.json({ success: true, noteId: result.noteId })
  } catch (error) {
    console.error('Save game error:', error)
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    )
  }
}
