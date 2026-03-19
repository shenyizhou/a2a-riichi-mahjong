/** @type {import('next').NextConfig} */
const isProduction = process.env.NODE_ENV === 'production'

const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // For Docker deployment
  basePath: isProduction ? '/web' : '', // 线上部署在 /web 子路径，本地开发直接访问根路径
  trailingSlash: true,
}

module.exports = nextConfig
