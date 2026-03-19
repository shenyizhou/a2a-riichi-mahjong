// MCP 协议类型定义

export interface MCPRequest {
  jsonrpc: '2.0'
  id: string | number | null
  method: string
  params?: unknown
}

export interface MCPResponse {
  jsonrpc: '2.0'
  id: string | number | null
  result?: {
    content: Array<{
      type: string
      text: string
    }>
    data?: unknown
  }
  error?: {
    code: number
    message: string
  }
}

export interface MCPToolCall {
  name: string
  parameters: Record<string, unknown>
}
