/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // For Docker deployment
  basePath: '/web', // 部署在 https://www.netease.xin/web 子路径下
  trailingSlash: true,
}

module.exports = nextConfig
