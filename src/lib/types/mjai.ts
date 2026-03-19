// Mjai 协议类型定义
// 参考: https://mjai.app/docs/mjai-protocol

export type MjaiEvent =
  | { type: 'start_game'; id: number; names: string[] }
  | { type: 'end_game' }
  | { type: 'start_kyoku'; bakaze: string; dora_marker: string; kyoku: number; honba: number; kyotaku: number; oya: number; scores: number[]; tehais: string[][] }
  | { type: 'end_kyoku' }
  | { type: 'tsumo'; actor: number; pai: string }
  | { type: 'dahai'; actor: number; pai: string; tsumogiri: boolean }
  | { type: 'chi'; actor: number; target: number; pai: string; consumed: string[] }
  | { type: 'pon'; actor: number; target: number; pai: string; consumed: string[] }
  | { type: 'kan'; actor: number; target: number; pai: string; consumed: string[] }
  | { type: 'kakan'; actor: number; pai: string; consumed: string[] }
  | { type: 'ankan'; actor: number; consumed: string[] }
  | { type: 'ron'; actor: number; target: number; pai: string }
  | { type: 'tsumo_agari'; actor: number }
  | { type: 'ryukyoku' }
  | { type: 'dora'; dora_marker: string }
  | { type: 'none' }

export type MjaiAction =
  | { type: 'dahai'; pai: string; tsumogiri: boolean }
  | { type: 'chi'; consumed: string[]; pai: string }
  | { type: 'pon'; consumed: string[]; pai: string }
  | { type: 'kan'; consumed: string[]; pai: string }
  | { type: 'riichi' }
  | { type: 'ron' }
  | { type: 'tsumo_agari' }
  | { type: 'none' }

export interface GameState {
  gameId: string
  playerId: number // 0 = human, 1 = AI
  round: number
  scores: [number, number] // [human, AI]
  events: MjaiEvent[]
  currentActor: number
  availableActions: MjaiAction[]
  humanHand: string[]
  aiHandHidden: string[]
  doraMarkers: string[]
  gameStarted: boolean
  gameEnded: boolean
}

export interface AIDecisionRequest {
  gameHistory: MjaiEvent[]
  playerId: number
  currentEvents: MjaiEvent[]
}

export interface GameSaveRequest {
  gameId: string
  winner: 'human' | 'ai' | 'draw'
  finalScores: [number, number]
  events: MjaiEvent[]
  duration: number
}
