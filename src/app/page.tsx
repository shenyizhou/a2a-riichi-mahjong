'use client'

import { useSession } from '@/lib/secondme/useSession'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card'
import { Button } from '@/components/Button'
import { LogIn, User, Gamepad2, ArrowRight, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense } from 'react'

function AuthErrorBanner() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  const errorMessages: Record<string, string> = {
    invalid_state: '状态验证失败，请重试',
    missing_code: '缺少授权码，请重试',
    auth_failed: '认证失败，请检查 Client ID 和 Client Secret 是否正确',
  }

  if (!error) {
    return null
  }

  return (
    <div className="max-w-3xl mx-auto mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-3">
      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
      <div>
        <p className="text-red-700 font-medium">登录失败</p>
        <p className="text-red-600 text-sm">{errorMessages[error] || error}</p>
      </div>
    </div>
  )
}

export default function Home() {
  const { session, loading } = useSession()

  return (
    <main className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 dark:from-green-950 dark:via-green-900 dark:to-green-950">
      <div className="container mx-auto px-4 py-16">
        {/* Hero Header */}
        <header className="text-center mb-16 max-w-3xl mx-auto">
          <div className="inline-block mb-4 px-4 py-1 bg-green-100 dark:bg-green-800 rounded-full text-green-700 dark:text-green-300 text-sm font-medium">
            🀄️ SecondMe A2A Hackathon Demo
          </div>
          <h1 className="text-5xl md:text-6xl font-black text-green-900 dark:text-green-100 mb-6 tracking-tight">
            A2A 清一色万子麻将
          </h1>
          <p className="text-xl text-green-700 dark:text-green-300 max-w-2xl mx-auto leading-relaxed">
            基于 SecondMe 的 Agent-to-Agent 对战 Demo，
            让 AI 理解麻将规则，陪你一对一打<span className="font-semibold">清一色万子麻将</span>。
          </p>
        </header>

        {/* Error Message */}
        <Suspense fallback={null}>
          <AuthErrorBanner />
        </Suspense>

        {/* Main Content */}
        <div className="max-w-3xl mx-auto">
          {loading ? (
            <div className="text-center py-8">加载中...</div>
          ) : session ? (
            <div className="grid md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-5 h-5" />
                    个人信息
                  </CardTitle>
                  <CardDescription>查看你的 SecondMe 个人信息</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/profile">
                    <Button className="w-full">
                      进入个人资料 <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Gamepad2 className="w-5 h-5" />
                    开始游戏
                  </CardTitle>
                  <CardDescription>和 SecondMe AI 开始一局立直麻将</CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href="/game">
                    <Button className="w-full" variant="primary">
                      开始对局 <ArrowRight className="ml-2 w-4 h-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card className="text-center">
              <CardHeader>
                <CardTitle>欢迎来到 A2A 立直麻将</CardTitle>
                <CardDescription>
                  使用你的 SecondMe 账号登录，即可开始和 AI 对战
                </CardDescription>
              </CardHeader>
              <CardContent>
                <a href="/api/auth/login">
                  <Button size="lg">
                    <LogIn className="mr-2 w-5 h-5" />
                    使用 SecondMe 登录
                  </Button>
                </a>
              </CardContent>
            </Card>
          )}

          {/* Features Grid */}
          <div className="mt-16 grid md:grid-cols-3 gap-6">
            <div className="bg-white/90 dark:bg-green-800/40 rounded-xl p-8 backdrop-blur shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-2xl">🎮</span>
              </div>
              <h3 className="font-bold text-xl mb-3 text-green-900 dark:text-green-100">
                AI 实时对战
              </h3>
              <p className="text-green-700 dark:text-green-300 leading-relaxed">
                利用 SecondMe Chat API，AI 真正理解麻将规则和当前局面，自主做出打牌决策。
              </p>
            </div>
            <div className="bg-white/90 dark:bg-green-800/40 rounded-xl p-8 backdrop-blur shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-2xl">🧠</span>
              </div>
              <h3 className="font-bold text-xl mb-3 text-green-900 dark:text-green-100">
                记忆持久化
              </h3>
              <p className="text-green-700 dark:text-green-300 leading-relaxed">
                对局记录自动保存到 SecondMe 记忆，AI 可以逐渐学习你的打牌风格。
              </p>
            </div>
            <div className="bg-white/90 dark:bg-green-800/40 rounded-xl p-8 backdrop-blur shadow-lg hover:shadow-xl transition-shadow">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mb-4">
                <span className="text-white text-2xl">🔌</span>
              </div>
              <h3 className="font-bold text-xl mb-3 text-green-900 dark:text-green-100">
                MCP 集成
              </h3>
              <p className="text-green-700 dark:text-green-300 leading-relaxed">
                完整支持 MCP 协议，OpenClaw 可以直接调用游戏能力，支持未来更多玩法。
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
