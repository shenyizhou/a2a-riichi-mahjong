// 二人清一色万子麻将游戏逻辑
// 规则：只使用万子牌，不能吃碰杠，双方轮流打牌，自摸胡牌
// 遵循 mjai 协议格式

import type { GameState, MjaiEvent, MjaiAction, AIDecisionRequest } from '@/lib/types/mjai'

// 只使用万子牌 (清一色)
const ALL_TILES = [
  '1m', '2m', '3m', '4m', '5m', '6m', '7m', '8m', '9m',
]

function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

export function createNewGame(): GameState {
  const wall = shuffle(ALL_TILES.flatMap(t => [t, t, t, t])) // 4 of each tile

  const humanHand = wall.splice(0, 13)
  const aiHand = wall.splice(0, 13)

  // First dora
  const doraMarker = wall.shift()!

  const initialState: GameState = {
    gameId: crypto.randomUUID(),
    playerId: 0,
    round: 1,
    scores: [25000, 25000],
    events: [],
    currentActor: 0, // East starts (human is 0 = east)
    availableActions: [],
    humanHand: humanHand, // Don't sort, keep the deal order
    aiHandHidden: aiHand.map(() => '?'),
    doraMarkers: [doraMarker],
    gameStarted: true,
    gameEnded: false,
    riichiDeclared: false,
  }

  // Push start events
  initialState.events.push({
    type: 'start_game',
    id: 0,
    names: ['Player', 'SecondMe AI'],
  })

  initialState.events.push({
    type: 'start_kyoku',
    bakaze: 'E',
    dora_marker: doraMarker,
    kyoku: 1,
    honba: 0,
    kyotaku: 0,
    oya: 0,
    scores: initialState.scores,
    tehais: [humanHand, aiHand.map(() => '?')],
  })

  // Human's first tsumo
  const firstTsumo = wall.shift()!
  initialState.humanHand.push(firstTsumo)
  initialState.events.push({
    type: 'tsumo',
    actor: 0,
    pai: firstTsumo,
  })
  initialState.currentActor = 0

  // TODO: calculate available actions
  // For simplicity, we just allow dahai for now
  initialState.availableActions = [{
    type: 'dahai',
    pai: firstTsumo,
    tsumogiri: true,
  }]

  return initialState
}

export function getAIDecisionPrompt(state: GameState, aiPlayerId: number): string {
  const events = getVisibleEventsForPlayer(state, aiPlayerId)

  const prompt = `你现在是一名一名麻将 AI 玩家，正在和人类玩家进行**二人清一色万子麻将**对决。

## 游戏规则
- 只使用万子牌 (一万到九万)，共 36 张，每人 14 张牌
- 不能吃、碰、杠，没有这些操作
- 手牌不排序，保持发牌顺序
- 双方轮流摸牌打牌
- 玩家**自己判断是否胡牌**，可以选择胡牌
- 立直：宣布听牌，立直后不能换牌
- 诈胡惩罚：诈胡扣除 10000 点
- 最先胡牌者获胜
- 遵循 Mjai 协议格式

当前分数：
- 你：${state.scores[aiPlayerId]}
- 对手：${state.scores[aiPlayerId === 0 ? 1 : 0]}

当前到目前为止的游戏事件：

\`\`\`json
${JSON.stringify(events, null, 2)}
\`\`\`

现在轮到你行动了。请分析当前局面，输出你的下一步动作。

动作必须是符合 Mjai 协议的 JSON 格式，**只输出 JSON，不要其他内容**。

可用的动作类型：
- dahai: 打出一张牌 {"type": "dahai", "pai": "5m", "tsumogiri": false}
- riichi: 立直 (宣布听牌) {"type": "riichi"}
- ron: 荣和 {"type": "ron"}
- tsumo_agari: 自摸和牌 {"type": "tsumo_agari"}
- none: 不动作 {"type": "none"}

请记住：
1. 只输出合法的 JSON 动作
2. tsumogiri 为 true 表示摸切就是刚摸到的那张牌
3. 自己判断是否可以胡牌，确认胡牌再选择 ron/tsumo_agari
4. 如果诈胡会被扣 10000 分
5. 选择对你最有利的打法，争取最快胡牌
`

  return prompt
}

export function getVisibleEventsForPlayer(state: GameState, playerId: number): MjaiEvent[] {
  return state.events.map(event => {
    // Hide other player's tiles
    if (event.type === 'start_kyoku') {
      return {
        ...event,
        tehais: event.tehais.map((tehai, idx) => {
          if (idx === playerId) return tehai
          return tehai.map(() => '?')
        }),
      }
    }
    return event
  })
}

export function applyAction(state: GameState, action: MjaiAction, actor: number): GameState {
  const newState = { ...state }
  newState.events = [...state.events]

  // Add the action to events
  if (action.type !== 'none') {
    newState.events.push({ ...action, actor } as MjaiEvent)
  }

  // Handle different action types
  switch (action.type) {
    case 'dahai': {
      if (actor === 0) {
        // Remove from human hand
        const idx = newState.humanHand.indexOf(action.pai)
        if (idx >= 0) {
          newState.humanHand.splice(idx, 1)
        }
      }
      // Next player's turn - AI tsumo
      // In a real implementation, we'd handle all turn order properly
      // For this demo, we just switch to AI
      newState.currentActor = 1
      break
    }
  }

  return newState
}

import React from 'react'

// Convert tile notation to JSX with proper vertical layout for mahjong tiles
// For manzu tiles: number (black) on top, 萬 (red) on bottom, both traditional Chinese
export function formatTile(pai: string): React.ReactNode {
  const typeMap: Record<string, {type: string; isCharacter: boolean}> = {
    m: {type: '萬', isCharacter: false},
    p: {type: '筒', isCharacter: false},
    s: {type: '索', isCharacter: false},
    E: {type: '東', isCharacter: true},
    S: {type: '南', isCharacter: true},
    W: {type: '西', isCharacter: true},
    N: {type: '北', isCharacter: true},
    P: {type: '白', isCharacter: true},
    F: {type: '發', isCharacter: true},
    C: {type: '中', isCharacter: true},
  }

  const numMap: Record<string, string> = {
    '1': '一', '2': '二', '3': '三', '4': '四',
    '5': '五', '6': '六', '7': '七', '8': '八', '9': '九',
  }

  if (typeMap[pai]?.isCharacter) {
    return <span>{typeMap[pai].type}</span>
  }

  const num = pai[0]
  const type = pai[1]
  const numChar = numMap[num] || num

  if (type === 'm') {
    // For manzu tiles: top = number (black), bottom = 萬 (red)
    return (
      <div className="flex flex-col items-center leading-none">
        <span className="font-black">{numChar}</span>
        <span className="text-red-600 font-black">{typeMap[type].type}</span>
      </div>
    )
  }

  // For other tiles: just normal display
  return <span>{numChar}{typeMap[type].type}</span>
}

export function saveGameRecordToNote(state: GameState, duration: number): {
  title: string
  content: string
} {
  const date = new Date().toLocaleString('zh-CN')
  const totalEvents = state.events.length
  const finalScores = state.scores

  const content = `# 立直麻将对局记录

对局时间: ${date}
时长: ${Math.round(duration / 1000 / 60)} 分钟
总步数: ${totalEvents}

## 最终分数

- 玩家: ${finalScores[0]}
- SecondMe AI: ${finalScores[1]}

## 事件流

\`\`\`json
${JSON.stringify(state.events, null, 2)}
\`\`\`
`

  const title = `立直麻将对局 - ${date}`

  return { title, content }
}
