// SecondMe OAuth 相关类型

export interface SecondMeConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  apiBaseUrl: string
  oauthUrl: string
  tokenEndpoint: string
  refreshEndpoint: string
  allowedScopes?: string[]
}

export interface TokenResponse {
  accessToken: string
  refreshToken: string
  tokenType: string
  expiresIn: number
  scope: string[]
}

export interface ApiResponse<T> {
  code: number
  data: T
  message?: string
}

export interface UserInfo {
  userId: string
  username: string
  displayName: string
  avatarUrl?: string
  bio?: string
}

export interface ChatRequest {
  messages: ChatMessage[]
  stream?: boolean
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ChatResponse {
  content: string
}

export interface NoteRequest {
  title: string
  content: string
  visibility?: 'private' | 'public'
}

export interface SessionData {
  secondmeUserId: string
  accessToken: string
  refreshToken: string
  tokenExpiresAt: number
  userInfo?: UserInfo
}

declare global {
  interface Window {
    __SESSION__?: SessionData
  }
}
