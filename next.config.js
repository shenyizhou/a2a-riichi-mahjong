/** @type {import('next').NextConfig} */
const isProduction = process.env.NODE_ENV === 'production'

// basePath 从环境变量读取，默认为空
// 如果你部署在 https://domain.com/web/a2a-riichi-mahjong/，设置 BASE_PATH=/web/a2a-riichi-mahjong
const basePath = process.env.BASE_PATH || ''

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // For Docker deployment
  basePath: basePath,
  trailingSlash: true,
}

module.exports = nextConfig
