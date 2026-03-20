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
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-green-100 dark:from-green-900 dark:to-green-950">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-green-900 dark:text-green-100 mb-4">
            A2A 立直麻将
          </h1>
          <p className="text-lg text-green-700 dark:text-green-300">
            和 SecondMe AI 一起打立直麻将
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

          {/* Features */}
          <div className="mt-12 grid grid-cols-1 gap-4">
            <div className="bg-white/80 dark:bg-green-800/30 rounded-lg p-6 backdrop-blur">
              <h3 className="font-semibold text-lg mb-2 text-green-900 dark:text-green-100">
                🎮 基于 SecondMe A2A
              </h3>
              <p className="text-green-700 dark:text-green-300">
                利用 SecondMe 的 chat 能力，让 AI 理解麻将局面并做出决策，真正的 AI 陪玩。
              </p>
            </div>
            <div className="bg-white/80 dark:bg-green-800/30 rounded-lg p-6 backdrop-blur">
              <h3 className="font-semibold text-lg mb-2 text-green-900 dark:text-green-100">
                📝 记忆自动保存
              </h3>
              <p className="text-green-700 dark:text-green-300">
                每局对局记录都会自动保存到你的 SecondMe 记忆中，AI 会记住你的打牌风格。
              </p>
            </div>
            <div className="bg-white/80 dark:bg-green-800/30 rounded-lg p-6 backdrop-blur">
              <h3 className="font-semibold text-lg mb-2 text-green-900 dark:text-green-100">
                🔌 开放 MCP 接口
              </h3>
              <p className="text-green-700 dark:text-green-300">
                支持 MCP 集成，OpenClaw 可以直接调用你的麻将游戏能力。
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}
