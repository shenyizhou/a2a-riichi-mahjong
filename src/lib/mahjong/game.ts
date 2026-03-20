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
    humanHand: humanHand.sort(),
    aiHandHidden: aiHand.map(() => '?'),
    doraMarkers: [doraMarker],
    gameStarted: true,
    gameEnded: false,
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
- 只使用万子牌 (一万到九万)，共 36 张
- 不能吃、碰、杠，没有这些操作
- 双方轮流摸牌打牌
- 最先听牌胡牌者获胜
- 遵循 Mjai 协议格式

当前到目前为止的游戏事件：

\`\`\`json
${JSON.stringify(events, null, 2)}
\`\`\`

现在轮到你行动了。请分析当前局面，输出你的下一步动作。

动作必须是符合 Mjai 协议的 JSON 格式，**只输出 JSON，不要其他内容**。

可用的动作类型：
- dahai: 打出一张牌 {"type": "dahai", "pai": "5m", "tsumogiri": false}
- riichi: 立直 {"type": "riichi"}
- ron: 荣和 {"type": "ron"}
- tsumo_agari: 自摸和牌 {"type": "tsumo_agari"}
- none: 不动作 {"type": "none"}

请记住：
1. 只输出合法的 JSON 动作
2. tsumogiri 为 true 表示摸切就是刚摸到的那张牌
3. 选择对你最有利的打法，争取最快胡牌
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

export function formatTile(pai: string): string {
  // Convert tile notation to displayable Chinese
  const typeMap: Record<string, string> = {
    m: '万',
    p: '筒',
    s: '索',
    E: '东',
    S: '南',
    W: '西',
    N: '北',
    P: '白',
    F: '发',
    C: '中',
  }

  if (typeMap[pai]) return typeMap[pai]
  const num = pai[0]
  const type = typeMap[pai[1]]
  return num + type
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
