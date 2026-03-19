'use client'

import { useSession } from '@/lib/secondme/useSession'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/Card'
import { Button } from '@/components/Button'
import { User, ArrowLeft, LogOut } from 'lucide-react'
import Link from 'next/link'

export default function ProfilePage() {
  const { session, loading } = useSession()

  if (loading) {
    return (
      <div className="min-h-screen bg-green-50 dark:bg-green-900 flex items-center justify-center">
        <p className="text-green-700 dark:text-green-300">加载中...</p>
      </div>
    )
  }

  if (!session?.userInfo) {
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

  const { userInfo } = session

  return (
    <div className="min-h-screen bg-green-50 dark:bg-green-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-4 mb-8">
            <Link href="/">
              <Button variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回
              </Button>
            </Link>
            <h1 className="text-2xl font-bold text-green-900 dark:text-green-100">
              个人资料
            </h1>
          </div>

          {/* User Info Card */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="w-5 h-5" />
                SecondMe 个人信息
              </CardTitle>
              <CardDescription>你的 SecondMe 账号信息</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {userInfo.avatarUrl && (
                <div className="flex justify-center mb-6">
                  <img
                    src={userInfo.avatarUrl}
                    alt={userInfo.displayName}
                    className="w-24 h-24 rounded-full border-4 border-green-200 dark:border-green-700"
                  />
                </div>
              )}

              <div className="grid grid-cols-3 gap-2">
                <div className="text-sm font-medium text-green-700 dark:text-green-300">
                  用户 ID
                </div>
                <div className="col-span-2 font-mono text-sm text-green-900 dark:text-green-100">
                  {session.secondmeUserId}
                </div>

                <div className="text-sm font-medium text-green-700 dark:text-green-300">
                  用户名
                </div>
                <div className="col-span-2 text-green-900 dark:text-green-100">
                  {userInfo.username}
                </div>

                <div className="text-sm font-medium text-green-700 dark:text-green-300">
                  显示名称
                </div>
                <div className="col-span-2 text-green-900 dark:text-green-100">
                  {userInfo.displayName}
                </div>

                {userInfo.bio && (
                  <>
                    <div className="text-sm font-medium text-green-700 dark:text-green-300">
                      简介
                    </div>
                    <div className="col-span-2 text-green-900 dark:text-green-100">
                      {userInfo.bio}
                    </div>
                  </>
                )}
              </div>

              <div className="pt-4 border-t border-green-200 dark:border-green-700">
                <a href="/api/auth/logout">
                  <Button variant="destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    退出登录
                  </Button>
                </a>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card className="mt-6">
            <CardHeader>
              <CardTitle>游戏统计</CardTitle>
              <CardDescription>你的立直麻将对局统计</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-green-600 dark:text-green-400 text-sm italic">
                统计功能开发中...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
