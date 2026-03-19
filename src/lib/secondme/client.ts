import {
  SecondMeConfig,
  TokenResponse,
  ApiResponse,
  UserInfo,
  ChatRequest,
  ChatResponse,
  NoteRequest,
} from '@/lib/types/secondme'

const config: SecondMeConfig = {
  clientId: process.env.SECONDME_CLIENT_ID!,
  clientSecret: process.env.SECONDME_CLIENT_SECRET!,
  redirectUri: process.env.SECONDME_REDIRECT_URI!,
  apiBaseUrl: process.env.SECONDME_API_BASE_URL || 'https://api.mindverse.com/gate/lab',
  oauthUrl: process.env.SECONDME_OAUTH_URL || 'https://go.second.me/oauth/',
  tokenEndpoint: process.env.SECONDME_TOKEN_ENDPOINT || 'https://api.mindverse.com/gate/lab/api/oauth/token/code',
  refreshEndpoint: process.env.SECONDME_REFRESH_ENDPOINT || 'https://api.mindverse.com/gate/lab/api/oauth/token/refresh',
  allowedScopes: ['user.info', 'chat', 'note.add'],
}

export class SecondMeClient {
  private config: SecondMeConfig

  constructor(customConfig?: Partial<SecondMeConfig>) {
    this.config = { ...config, ...customConfig }
  }

  /**
   * 生成 OAuth 授权 URL
   */
  getAuthorizationUrl(state: string): string {
    const params = new URLSearchParams({
      client_id: this.config.clientId,
      redirect_uri: this.config.redirectUri,
      response_type: 'code',
      scope: this.config.allowedScopes?.join(' ') || 'user.info chat note.add',
      state,
    })
    return `${this.config.oauthUrl}?${params.toString()}`
  }

  /**
   * 用授权码交换 access token
   */
  async exchangeCode(code: string): Promise<TokenResponse> {
    const body = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      redirect_uri: this.config.redirectUri,
      code,
    })

    const response = await fetch(this.config.tokenEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    })

    const result = await response.json() as ApiResponse<TokenResponse>

    if (result.code !== 0 || !result.data) {
      throw new Error(`Token exchange failed: ${result.message || 'Unknown error'}`)
    }

    return result.data
  }

  /**
   * 刷新 access token
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const body = new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: this.config.clientId,
      client_secret: this.config.clientSecret,
      refresh_token: refreshToken,
    })

    const response = await fetch(this.config.refreshEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: body.toString(),
    })

    const result = await response.json() as ApiResponse<TokenResponse>

    if (result.code !== 0 || !result.data) {
      throw new Error(`Token refresh failed: ${result.message || 'Unknown error'}`)
    }

    return result.data
  }

  /**
   * 获取用户信息
   */
  async getUserInfo(accessToken: string): Promise<UserInfo> {
    const response = await fetch(`${this.config.apiBaseUrl}/api/secondme/user/info`, {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
      },
    })

    const result = await response.json() as ApiResponse<UserInfo>

    if (result.code !== 0 || !result.data) {
      throw new Error(`Get user info failed: ${result.message || 'Unknown error'}`)
    }

    return result.data
  }

  /**
   * 发送聊天请求
   */
  async chat(accessToken: string, request: ChatRequest): Promise<ChatResponse> {
    const response = await fetch(`${this.config.apiBaseUrl}/api/secondme/chat/completions`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    const result = await response.json() as ApiResponse<ChatResponse>

    if (result.code !== 0 || !result.data) {
      throw new Error(`Chat request failed: ${result.message || 'Unknown error'}`)
    }

    return result.data
  }

  /**
   * 添加笔记到 SecondMe
   */
  async addNote(accessToken: string, request: NoteRequest): Promise<{ noteId: string }> {
    const response = await fetch(`${this.config.apiBaseUrl}/api/secondme/note/add`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    })

    const result = await response.json() as ApiResponse<{ noteId: string }>

    if (result.code !== 0 || !result.data) {
      throw new Error(`Add note failed: ${result.message || 'Unknown error'}`)
    }

    return result.data
  }

  getConfig(): SecondMeConfig {
    return { ...this.config }
  }
}

export const secondmeClient = new SecondMeClient()
