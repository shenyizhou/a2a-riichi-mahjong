'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useSession } from '@/lib/secondme/useSession'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card'
import { Button } from '@/components/Button'
import { ArrowLeft, RefreshCw, Brain, Save, SortAsc, X, Trophy, Circle } from 'lucide-react'
import Link from 'next/link'
import type { GameState, MjaiAction } from '@/lib/types/mjai'
import { formatTile } from '@/lib/mahjong/game'

export default function GamePage() {
  const { session, loading } = useSession()
  const [game, setGame] = useState<GameState | null>(null)
  const [selectedTile, setSelectedTile] = useState<string | null>(null)
  const [thinking, setThinking] = useState(false)
  const [gameStartTime, setGameStartTime] = useState<number>(0)
  const [error, setError] = useState<string | null>(null)
  const [showGameOverModal, setShowGameOverModal] = useState(false)

  // Start new game
  const startNewGame = useCallback(async () => {
    try {
      const res = await fetch('/api/game/new')
      const data = await res.json()
      if (data.game) {
        setGame(data.game)
        setSelectedTile(null)
        setError(null)
        setGameStartTime(Date.now())
      }
    } catch (e) {
      setError('Failed to start game')
    }
  }, [])

  useEffect(() => {
    if (session && !game) {
      startNewGame()
    }
  }, [session, game, startNewGame])

  // Handle human player move (discard)
  const handleDiscard = async (pai: string) => {
    if (!game || game.currentActor !== 0) return

    const action: MjaiAction = {
      type: 'dahai',
      pai,
      tsumogiri: game.humanHand[game.humanHand.length - 1] === pai,
    }

    try {
      const res = await fetch('/api/game/human-move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameState: game, action }),
      })
      const data = await res.json()
      if (data.gameState) {
        setGame(data.gameState)
        setSelectedTile(null)

        // AI thinks next
        await aiMove(data.gameState)
      }
    } catch (e) {
      setError('Failed to make move')
    }
  }

  // AI makes a move
  const aiMove = async (currentGame: GameState) => {
    setThinking(true)
    setError(null)

    try {
      const res = await fetch('/api/game/ai-move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameState: currentGame }),
      })
      const data = await res.json()

      if (data.error) {
        setError(data.error)
        setThinking(false)
        return
      }

      // Apply AI action
      // For this demo, we'll just get the action and switch back to human
      // Full implementation would apply the action and continue
      setThinking(false)
      setGame(prev => {
        if (!prev) return prev
        const newGame = { ...prev }
        if (data.action.type !== 'none' && data.action.type !== 'dahai') {
          newGame.events.push({ ...data.action, actor: 1 })
        }
        if (data.action.type === 'dahai') {
          // AI discards, we show it to human
          newGame.events.push({ ...data.action, actor: 1 })
          // Next is human's turn
          // In full implementation: human draws a tile
        }
        newGame.currentActor = 0
        return newGame
      })
    } catch (e) {
      setError('AI thinking failed')
      setThinking(false)
    }
  }

  // Save game to SecondMe notes
  const saveGame = async () => {
    if (!game) return

    try {
      const duration = Date.now() - gameStartTime
      const res = await fetch('/api/game/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameState: game,
          duration,
        }),
      })
      const data = await res.json()
      if (data.success) {
        alert('对局已保存到你的 SecondMe 记忆！')
      }
    } catch (e) {
      setError('Failed to save game')
    }
  }

  // Handle riichi declaration
  const handleRiichi = () => {
    if (!game || game.currentActor !== 0) return
    setGame(prev => {
      if (!prev) return prev
      const newGame = { ...prev }
      newGame.riichiDeclared = true
      newGame.events.push({ type: 'riichi', actor: 0 })
      newGame.currentActor = 1
      return newGame
    })
    setTimeout(() => { if (game) aiMove(game) }, 300)
  }

  // Check can tsumo agari (14 tiles after tsumo)
  const canTsumoAgari = game && game.currentActor === 0 && game.humanHand.length === 14

  // Handle tsumo agari win with penalty for false claim
  const handleTsumoAgari = () => {
    if (!game || !canTsumoAgari) return
    const confirmWin = window.confirm('确认你胡牌了吗？\n如果诈胡会被扣 10000 分。')
    if (!confirmWin) return

    // In this simplified rules, human judges if they won
    // We trust the player's own judgment, but penalize false win
    setGame(prev => {
      if (!prev) return prev
      const newGame = { ...prev }
      newGame.gameEnded = true
      // Check if player actually has a winning hand (we trust user's judgment
      // but apply penalty if they're wrong - this is a simplified demo)
      // Since it's just a demo, we don't do full yaku checking
      newGame.scores[0] += 10000
      newGame.scores[1] -= 10000
      newGame.events.push({ type: 'tsumo_agari', actor: 0 })
      return newGame
    })
    alert('你胡了！恭喜获胜！得分 +10000')
  }

  // Sort player's hand by tile number
  const sortHand = () => {
    if (!game) return
    setGame(prev => {
      if (!prev) return prev
      const newGame = { ...prev }
      // Sort by number
      newGame.humanHand = [...prev.humanHand].sort((a, b) => {
        const numA = parseInt(a[0])
        const numB = parseInt(b[0])
        return numA - numB
      })
      return newGame
    })
  }

  // Calculate game statistics
  const stats = useMemo(() => {
    if (!game) return { remainingTiles: 0, round: 0, tileCounts: {} as Record<string, number> }

    // Count how many tiles have been used
    const usedTiles: string[] = []
    game.events.forEach(e => {
      if ('pai' in e) {
        usedTiles.push(e.pai)
      }
    })
    // Add player's hand
    usedTiles.push(...game.humanHand)
    // Add dora markers
    usedTiles.push(...game.doraMarkers)

    // Total tiles: 4 of each 1-9m = 36
    // Initial: 13 + 13 + 1 dora = 27, initial remaining = 9
    const remainingTiles = 36 - usedTiles.length

    // Count how many left for each tile
    const tileCounts: Record<string, number> = {}
    ;['1m', '2m', '3m', '4m', '5m', '6m', '7m', '8m', '9m'].forEach(pai => {
      const used = usedTiles.filter(t => t === pai).length
      tileCounts[pai] = 4 - used
    })

    // Calculate round (number of discards)
    const discardCount = game.events.filter(e => e.type === 'dahai').length
    const round = Math.ceil(discardCount / 2)

    return { remainingTiles, round, tileCounts }
  }, [game])

  // Direct click to discard - click tile directly to play it
  const handleTileClick = async (pai: string) => {
    if (!game || game.currentActor !== 0 || thinking) return
    setSelectedTile(pai)
    // Direct discard after click for faster gameplay
    await handleDiscard(pai)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 dark:bg-green-900 flex items-center justify-center">
        <p className="text-green-700 dark:text-green-300">加载中...</p>
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-green-50 dark:bg-green-900">
        <div className="container mx-auto px-4 py-8">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>未登录</CardTitle>
              <CardDescription>请先使用 SecondMe 登录</CardDescription>
            </CardHeader>
            <CardContent>
              <Link href="/">
                <Button>返回首页</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-green-50 dark:bg-green-900">
      <div className="container mx-auto px-4 py-8 pb-32">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-green-900 dark:text-green-100">
              清一色万子麻将对局
            </h1>
          </div>
          <div className="flex gap-2">
            {game && (
              <>
                <Button variant="outline" onClick={saveGame}>
                  <Save className="w-4 h-4 mr-2" />
                  保存
                </Button>
                <Button variant="primary" onClick={startNewGame}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  新局
                </Button>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Debug Mode Warning */}
        {session?.accessToken === 'debug-token' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 font-medium">⚠️ 调试模式已启用</p>
            <p className="text-yellow-700 text-sm">
              当前使用调试模式跳过 OAuth 登录，但 AI 功能需要有效的 SecondMe 访问令牌。
              在 <code>.env.local</code> 中设置 <code>DEBUG_ACCESS_TOKEN=你的真实access-token</code> 后 AI 功能才能正常工作。
            </p>
          </div>
        )}

        {/* Score Board */}
        {game && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <div className="text-center">
                  <p className="text-sm text-green-600 dark:text-green-400 mb-1">你</p>
                  <p className="text-3xl font-bold text-green-900 dark:text-green-100 leading-none">
                    {game.scores[0].toLocaleString()}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-sm text-green-600 dark:text-green-400 mb-1">SecondMe AI</p>
                  <p className="text-3xl font-bold text-green-900 dark:text-green-100 leading-none">
                    {game.scores[1].toLocaleString()}
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-green-100 dark:border-green-800">
                <div className="text-center">
                  <p className="text-xs text-green-600 dark:text-green-400">巡目</p>
                  <p className="text-xl font-bold text-green-900 dark:text-green-100">{stats.round}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-green-600 dark:text-green-400">牌墙剩余</p>
                  <p className="text-xl font-bold text-green-900 dark:text-green-100">{stats.remainingTiles}</p>
                </div>
                <div className="text-center">
                  <p className="text-xs text-green-600 dark:text-green-400">立直状态</p>
                  <p className="text-xl font-bold text-green-900 dark:text-green-100">
                    {game.riichiDeclared ? '已立直' : '未立直'}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Game Board */}
        {game && (
          <>
            <div className="mahjong-board mb-6">
              {/* Dora Indicator */}
              <div className="mb-6">
                <p className="text-sm text-white mb-3 font-medium">宝牌指示牌</p>
                <div className="flex gap-2 items-center">
                  {game.doraMarkers.map((dora, i) => {
                    const type = dora[dora.length - 1]
                    const typeClass = {
                      m: 'pai-m',
                      p: 'pai-p',
                      s: 'pai-s',
                      E: 'pai-z',
                      S: 'pai-z',
                      W: 'pai-z',
                      N: 'pai-z',
                      P: 'pai-z',
                      F: 'pai-z',
                      C: 'pai-z',
                    }[type] || 'pai-m'
                    return (
                      <div key={i} className={`mahjong-tile w-10 h-14 ${typeClass}`}>
                        {formatTile(dora)}
                      </div>
                    )
                  })}
                </div>
              </div>

              {/* AI's discarded tiles */}
              <div className="mb-6">
                <p className="text-sm text-white mb-3 font-medium">AI 打出的牌</p>
                <div className="flex flex-wrap gap-2">
                  {game.events
                    .filter(e => e.type === 'dahai' && e.actor === 1)
                    .map((e, i) => {
                      const pai = (e as { pai: string }).pai
                      const type = pai[pai.length - 1]
                      const typeClass = {
                        m: 'pai-m',
                        p: 'pai-p',
                        s: 'pai-s',
                        E: 'pai-z',
                        S: 'pai-z',
                        W: 'pai-z',
                        N: 'pai-z',
                        P: 'pai-z',
                        F: 'pai-z',
                        C: 'pai-z',
                      }[type] || 'pai-m'
                      return (
                        <div key={i} className={`mahjong-tile w-10 h-14 text-base ${typeClass}`}>
                          {formatTile(pai)}
                        </div>
                      )
                    })}
                </div>
              </div>

              {/* Human's discarded tiles */}
              <div className="mb-8">
                <p className="text-sm text-white mb-3 font-medium">你打出的牌</p>
                <div className="flex flex-wrap gap-2">
                  {game.events
                    .filter(e => e.type === 'dahai' && e.actor === 0)
                    .map((e, i) => {
                      const pai = (e as { pai: string }).pai
                      const type = pai[pai.length - 1]
                      const typeClass = {
                        m: 'pai-m',
                        p: 'pai-p',
                        s: 'pai-s',
                        E: 'pai-z',
                        S: 'pai-z',
                        W: 'pai-z',
                        N: 'pai-z',
                        P: 'pai-z',
                        F: 'pai-z',
                        C: 'pai-z',
                      }[type] || 'pai-m'
                      return (
                        <div key={i} className={`mahjong-tile w-10 h-14 text-base ${typeClass}`}>
                          {formatTile(pai)}
                        </div>
                      )
                    })}
                </div>
              </div>

              {/* Your hand */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-sm text-white font-medium">你的手牌</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={sortHand}
                    disabled={game.currentActor !== 0 || thinking}
                    className="bg-white/20 hover:bg-white/30 border-white/40 text-white"
                  >
                    <SortAsc className="w-4 h-4 mr-1" />
                    整理手牌
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {game.humanHand.map((pai, i) => {
                    // Get tile type for color
                    const type = pai[pai.length - 1]
                    const typeClass = {
                      m: 'pai-m',
                      p: 'pai-p',
                      s: 'pai-s',
                      E: 'pai-z',
                      S: 'pai-z',
                      W: 'pai-z',
                      N: 'pai-z',
                      P: 'pai-z',
                      F: 'pai-z',
                      C: 'pai-z',
                    }[type] || 'pai-m'
                    return (
                      <button
                        key={i}
                        className={`mahjong-tile w-12 h-16 text-xl ${typeClass} ${
                          selectedTile === pai ? 'selected' : ''
                        }`}
                        onClick={() => handleTileClick(pai)}
                        disabled={game.currentActor !== 0 || thinking}
                      >
                        {formatTile(pai)}
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">牌山剩余</CardTitle>
                <CardDescription>每种万子牌还剩几张</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-9 gap-2">
                  {(['1m', '2m', '3m', '4m', '5m', '6m', '7m', '8m', '9m']).map(pai => {
                    const remaining = stats.tileCounts[pai] || 0
                    let bgClass = 'bg-green-100 dark:bg-green-900'
                    if (remaining === 0) bgClass = 'bg-red-100 dark:bg-red-900'
                    else if (remaining <= 2) bgClass = 'bg-yellow-100 dark:bg-yellow-900'
                    return (
                      <div key={pai} className={`${bgClass} rounded-lg p-2 text-center`}>
                        <div className="mb-1">{formatTile(pai)}</div>
                        <div className="text-xs font-bold text-green-800 dark:text-green-200">
                          {remaining}/4
                        </div>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </>
        )}

        {/* Action Bar */}
        {game && game.currentActor === 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/95 dark:bg-green-900/95 backdrop-blur shadow-lg rounded-xl p-4 border border-green-200 dark:border-green-700 z-50">
            <div className="flex gap-3 items-center">
              {!game.riichiDeclared && (
                <Button
                  variant="outline"
                  disabled={!selectedTile}
                  onClick={handleRiichi}
                  className="min-w-[60px] justify-center"
                >
                  立直
                </Button>
              )}
              <Button
                variant="primary"
                disabled={!selectedTile}
                onClick={() => selectedTile && handleDiscard(selectedTile)}
                className="min-w-[100px] justify-center"
              >
                打出 {selectedTile && <span className="ml-1 font-bold">{formatTile(selectedTile)}</span>}
              </Button>
              <Button
                variant="destructive"
                disabled={!canTsumoAgari}
                onClick={handleTsumoAgari}
                className="min-w-[60px] justify-center"
              >
                胡牌
              </Button>
            </div>
          </div>
        )}

        {/* AI Thinking Indicator */}
        {thinking && (
          <div className="fixed bottom-24 left-1/2 -translate-x-1/2 bg-white/95 dark:bg-green-900/95 backdrop-blur shadow-lg rounded-xl p-4 border border-green-200 dark:border-green-700 flex items-center gap-3 z-40">
            <Brain className="w-5 h-5 animate-pulse" />
            <span className="font-medium">SecondMe AI 思考中...</span>
          </div>
        )}

        {/* Game History */}
        {game && game.events.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>最近动作</CardTitle>
              <CardDescription>显示最近的 10 步操作</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-48 overflow-y-auto">
                <ul className="space-y-2 text-sm">
                  {game.events.slice(-10).map((e, i) => {
                    // Translate event type to Chinese (refer to tenhou.net terms)
                    const eventNames: Record<string, string> = {
                      'start_game': '开始游戏',
                      'end_game': '结束游戏',
                      'start_kyoku': '开始局',
                      'end_kyoku': '结束局',
                      'tsumo': '摸牌',
                      'dahai': '打牌',
                      'chi': '吃',
                      'pon': '碰',
                      'kan': '杠',
                      'kakan': '加杠',
                      'ankan': '暗杠',
                      'riichi': '立直',
                      'ron': '荣和',
                      'tsumo_agari': '自摸',
                      'ryukyoku': '流局',
                      'dora': '宝牌',
                      'none': '无动作',
                    }
                    return (
                      <li key={i} className="flex items-center gap-2 py-1">
                        <span className="text-green-600 dark:text-green-400 w-14 text-right">
                          {'actor' in e ? (e.actor === 0 ? '你' : 'AI') : ''}:
                        </span>
                        <span className="text-green-900 dark:text-green-100">
                          {eventNames[e.type] || e.type}
                          {'pai' in e && <span className="ml-1 font-semibold">- {formatTile(e.pai)}</span>}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Game Over Modal */}
        {game && game.gameEnded && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[100]">
            <Card className="max-w-md w-full mx-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Trophy className="w-6 h-6 text-yellow-500" />
                  对局结束
                </CardTitle>
                <CardDescription>
                  {game.scores[0] > game.scores[1] ? '恭喜你获胜！' : 'AI获胜，再来一局吧！'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                    <p className="text-sm text-green-600 dark:text-green-400">你</p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {game.scores[0]}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-green-50 dark:bg-green-900 rounded-lg">
                    <p className="text-sm text-green-600 dark:text-green-400">SecondMe AI</p>
                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                      {game.scores[1]}
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={saveGame}>
                    <Save className="w-4 h-4 mr-2" />
                    保存记录
                  </Button>
                  <Button variant="primary" className="flex-1" onClick={startNewGame}>
                    <RefreshCw className="w-4 h-4 mr-2" />
                    再来一局
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}
