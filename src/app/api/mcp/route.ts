import { NextResponse } from 'next/server'
import type { MCPRequest, MCPResponse, MCPToolCall } from '@/lib/types/mcp'
import { createNewGame, applyAction } from '@/lib/mahjong/game'
import { getAIDecisionPrompt } from '@/lib/mahjong/game'
import { secondmeClient } from '@/lib/secondme/client'
import type { GameState, MjaiAction } from '@/lib/types/mjai'

// Simple in-memory game storage for demo
// In production, use a proper database
const gameStore = new Map<string, GameState>()

export async function POST(request: Request) {
  // Verify bearer token
  const authorization = request.headers.get('Authorization')
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return NextResponse.json({
      jsonrpc: '2.0',
      error: {
        code: -32001,
        message: 'Unauthorized: Missing or invalid bearer token',
      },
      id: null,
    } as MCPResponse, { status: 401 })
  }

  // The access token is provided by SecondMe at runtime
  const accessToken = authorization.slice(7)

  try {
    const body = (await request.json()) as MCPRequest

    if (body.method !== 'tools/call') {
      return NextResponse.json({
        jsonrpc: '2.0',
        error: {
          code: -32601,
          message: `Method not found: ${body.method}`,
        },
        id: body.id,
      } as MCPResponse)
    }

    const { name, parameters } = body.params as MCPToolCall

    switch (name) {
      case 'new_game': {
        const game = createNewGame()
        gameStore.set(game.gameId, game)

        return NextResponse.json({
          jsonrpc: '2.0',
          result: {
            content: [
              {
                type: 'text',
                text: `新对局已创建，Game ID: ${game.gameId}\n当前分数: 你 ${game.scores[0]}, AI ${game.scores[1]}`,
              },
            ],
            data: {
              gameId: game.gameId,
              gameState: game,
            },
          },
          id: body.id,
        } as MCPResponse)
      }

      case 'play_move': {
        const { gameId, action } = parameters as {
          gameId: string
          action: MjaiAction
        }

        const game = gameStore.get(gameId)
        if (!game) {
          return NextResponse.json({
            jsonrpc: '2.0',
            error: {
              code: -32002,
              message: `Game not found: ${gameId}`,
            },
            id: body.id,
          } as MCPResponse)
        }

        // Apply human move
        const newState = applyAction(game, action, 0)
        gameStore.set(gameId, newState)

        // Get AI decision using SecondMe chat
        const prompt = getAIDecisionPrompt(newState, 1)
        const aiResponse = await secondmeClient.chat(accessToken, {
          messages: [
            {
              role: 'system',
              content: '你是一位立直麻将高手，根据局面输出正确的动作。只输出 JSON，不要其他内容。',
            },
            { role: 'user', content: prompt },
          ],
        })

        // Parse AI action
        let aiAction: MjaiAction
        try {
          const content = aiResponse.content
          const jsonMatch = content.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            aiAction = JSON.parse(jsonMatch[0]) as MjaiAction
          } else {
            aiAction = JSON.parse(content) as MjaiAction
          }
        } catch (e) {
          aiAction = { type: 'none' }
        }

        // Apply AI action
        const finalState = applyAction(newState, aiAction, 1)
        gameStore.set(gameId, finalState)

        return NextResponse.json({
          jsonrpc: '2.0',
          result: {
            content: [
              {
                type: 'text',
                text: `AI 动作: ${aiAction.type}${'pai' in aiAction ? ` - ${aiAction.pai}` : ''}`,
              },
            ],
            data: {
              gameId,
              aiAction,
              gameState: finalState,
            },
          },
          id: body.id,
        } as MCPResponse)
      }

      case 'get_game_state': {
        const { gameId } = parameters as { gameId: string }
        const game = gameStore.get(gameId)

        if (!game) {
          return NextResponse.json({
            jsonrpc: '2.0',
            error: {
              code: -32002,
              message: `Game not found: ${gameId}`,
            },
            id: body.id,
          } as MCPResponse)
        }

        return NextResponse.json({
          jsonrpc: '2.0',
          result: {
            content: [
              {
                type: 'text',
                text: `当前游戏状态 - 回合: ${game.round}, 分数: [${game.scores[0]}, ${game.scores[1]}]`,
              },
            ],
            data: {
              gameState: game,
            },
          },
          id: body.id,
        } as MCPResponse)
      }

      default: {
        return NextResponse.json({
          jsonrpc: '2.0',
          error: {
            code: -32601,
            message: `Tool not found: ${name}`,
          },
          id: body.id,
        } as MCPResponse)
      }
    }
  } catch (error) {
    console.error('MCP error:', error)
    return NextResponse.json({
      jsonrpc: '2.0',
      error: {
        code: -32603,
        message: (error as Error).message,
      },
      id: null,
    } as MCPResponse, { status: 500 })
  }
}
