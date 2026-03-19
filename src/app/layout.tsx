import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'A2A 立直麻将 | SecondMe',
  description: '和 SecondMe AI 一起打立直麻将',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
