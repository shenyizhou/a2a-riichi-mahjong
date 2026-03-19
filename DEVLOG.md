# 🀄️ A2A 立直麻将 - 开发总结

> 基于 SecondMe 的 A2A 立直麻将 AI 陪玩项目

## 📖 项目介绍

这是一个基于 [SecondMe](https://second.me) 开发的第三方应用，展示了如何：

- 使用 SecondMe OAuth2 登录
- 通过 SecondMe Chat API 让 AI 理解游戏局面并做出决策
- 将对局记录保存到 SecondMe 记忆中
- 提供 MCP 接口供 OpenClaw 调用

项目参考了 [smly/mjai.app](https://github.com/smly/mjai.app) 的 Mjai 协议设计。

## ✨ 功能特性

| 功能 | 说明 |
|------|------|
| 🔐 **SecondMe OAuth 登录** | 使用你的 SecondMe 账号一键登录 |
| 👤 **个人信息展示** | 获取并展示 SecondMe 个人信息 |
| 🎮 **二人立直麻将** | 和 SecondMe AI 进行一对一对战 |
| 🧠 **AI 动态决策** | AI 通过 Chat API 理解局面输出动作 |
| 📝 **记忆自动保存** | 对局记录自动保存到 SecondMe 笔记 |
| 🔌 **MCP 集成** | 支持 OpenClaw 通过 MCP 调用 |
| 🎨 **美观界面** | 使用 Tailwind CSS 打造现代化 UI |

## 🏗️ 技术架构

- **框架**: Next.js 14 + App Router + TypeScript
- **样式**: Tailwind CSS
- **认证**: SecondMe OAuth2
- **AI 能力**: SecondMe Chat API
- **游戏协议**: Mjai 协议
- **部署**: 支持 Vercel / Docker / PM2 自托管

## 🗺️ 项目结构

```
a2a-riichi-mahjong/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── auth/             # OAuth 认证路由
│   │   │   ├── game/             # 游戏 API
│   │   │   └── mcp/              # MCP 端点
│   │   ├── game/                 # 游戏页面
│   │   ├── profile/              # 个人资料页
│   │   ├── page.tsx              # 首页
│   │   └── layout.tsx
│   ├── components/
│   │   ├── Card.tsx
│   │   └── Button.tsx
│   └── lib/
│       ├── secondme/             # SecondMe 客户端
│       ├── mahjong/              # 游戏逻辑
│       └── types/                # TypeScript 类型
├── .secondme/
│   └── state.json                # 项目状态
├── mcp-manifest.json             # MCP 集成清单
├── Dockerfile                    # Docker 配置
├── docker-compose.yml            # Docker Compose
├── ecosystem.config.js           # PM2 进程管理配置
├── vercel.json                   # Vercel 配置
└── README.md                     # 项目说明
```

## 🚀 快速开始

### 本地开发

```bash
# 克隆项目
git clone https://github.com/shenyizhou/a2a-riichi-mahjong
cd a2a-riichi-mahjong

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env.local
# 编辑 .env.local 填入你的 SecondMe 凭证

# 启动开发服务器
npm run dev
```

打开 http://localhost:3000 即可访问。

### 调试模式

如果 OAuth 配置遇到问题，可以开启调试模式跳过登录：

```env
DEBUG_SKIP_LOGIN=true
DEBUG_ACCESS_TOKEN=你的真实-access-token
```

开启后直接访问首页即可进入游戏。

## 📡 部署

### 部署到 Vercel

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/shenyizhou/a2a-riichi-mahjong)

1. 点击上方按钮导入项目
2. 设置环境变量
3. 点击 Deploy
4. 在 SecondMe Develop 添加生产环境重定向 URI

### 部署到自有服务器

**方式 1: Docker Compose**

```bash
git clone https://github.com/shenyizhou/a2a-riichi-mahjong
cd a2a-riichi-mahjong
cp .env.example .env
# 编辑 .env 填入配置
docker-compose up -d
```

**方式 2: PM2**

```bash
git clone https://github.com/shenyizhou/a2a-riichi-mahjong
cd a2a-riichi-mahjong
npm install
cp .env.example .env.local
npm run build
pm2 start ecosystem.config.js
```

### 环境变量

| 变量名 | 必填 | 说明 |
|--------|------|------|
| `SECONDME_CLIENT_ID` | ✅ | SecondMe 应用 ID |
| `SECONDME_CLIENT_SECRET` | ✅ | SecondMe 应用密钥 |
| `SECONDME_REDIRECT_URI` | ✅ | `https://你的域名/api/auth/callback` |
| `NEXTAUTH_URL` | ✅ | `https://你的域名` |
| `NEXTAUTH_SECRET` | ✅ | 随机字符串，`openssl rand -hex 32` 生成 |
| `DEBUG_SKIP_LOGIN` | | 调试模式，`true` 跳过登录 |

## 🔌 MCP 集成

项目提供 MCP 接口，OpenClaw 可以直接调用：

| 工具名 | 功能 |
|--------|------|
| `new_game` | 开始新对局 |
| `play_move` | 执行一步操作 |
| `get_game_state` | 获取当前游戏状态 |

MCP 清单参见 [mcp-manifest.json](./mcp-manifest.json)，部署后更新 `mcp.endpoint` 为你的实际域名即可提交审核。

## 🎮 游戏流程

1. 使用 SecondMe 账号登录
2. 点击"开始对局"
3. 摸到牌后点击选择要打出的牌
4. SecondMe AI 思考并打出一张牌
5. 继续游戏直到结束
6. 可以保存对局记录到 SecondMe 记忆

## 📝 SecondMe 集成说明

本项目申请了以下 SecondMe 权限：

| 权限范围 | 使用场景 |
|---------|---------|
| `user.info` | 用户认证，获取个人信息 |
| `chat` | AI 理解麻将局面，做出打牌决策 |
| `note.add` | 保存对局记录到 SecondMe 笔记 |

## 开发时间线

- `2026-03-19` - 创建 SecondMe OAuth 应用，初始化项目骨架
- `2026-03-19` - 完成 OAuth 认证流程
- `2026-03-19` - 实现麻将游戏基础逻辑（简化版二人对局）
- `2026-03-19` - 实现 AI 决策通过 SecondMe Chat API
- `2026-03-19` - 实现对局记录保存到 SecondMe 笔记
- `2026-03-19` - 添加 MCP 接口支持 OpenClaw 调用
- `2026-03-19` - 修复 OAuth scope 问题，添加调试模式
- `2026-03-19` - 添加 Vercel / Docker / PM2 多种部署配置
- `2026-03-20` - 完成开发总结文档

## 🙏 致谢

- [mjai.app](https://github.com/smly/mjai.app) - Mjai 协议参考
- [SecondMe](https://second.me) - AI 能力平台

## 📄 许可证

MIT

---

**项目地址**: https://github.com/shenyizhou/a2a-riichi-mahjong
