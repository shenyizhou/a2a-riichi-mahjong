# A2A 清一色万子麻将

基于 SecondMe 的 A2A 麻将游戏，**二人清一色万子对决**，让 SecondMe AI 作为对手陪你打麻将。

## 游戏规则

- 🀄️ **清一色** - 只使用万子牌（一万到九万）
- 👥 **二人对局** - 你 vs SecondMe AI
- 🚫 **不能吃碰杠** - 规则简化，轮流摸牌打牌
- 🎯 **自摸胡牌** - 最先听牌胡牌获胜
- 🧠 **AI 决策** - SecondMe 通过 chat 能力理解局面并做出打牌决策

## 功能

- 🔐 **SecondMe OAuth 登录** - 使用你的 SecondMe 账号快速登录
- 👤 **个人信息展示** - 获取并展示你的 SecondMe 个人信息
- 🎮 **二人对局** - 和 SecondMe AI 一对一麻将对决
- 📝 **记忆保存** - 对局记录自动保存到你的 SecondMe 记忆
- 🔌 **MCP 集成** - 支持 OpenClaw 通过 MCP 调用

## 快速开始

### 1. 安装依赖

```bash
cd a2a-riichi-mahjong
npm install
```

### 2. 配置环境变量

复制 `.env.example` 到 `.env.local`：

```bash
cp .env.example .env.local
```

编辑 `.env.local`，填入你的 SecondMe 凭证：

```env
SECONDME_CLIENT_ID=your-client-id
SECONDME_CLIENT_SECRET=your-client-secret
NEXTAUTH_SECRET=generate-a-random-secret
```

生成 `NEXTAUTH_SECRET` 可以用：

```bash
openssl rand -hex 32
```

### 3. 启动开发服务器

```bash
npm run dev
```

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 技术栈

- **框架**: Next.js 14 + App Router + TypeScript
- **样式**: Tailwind CSS
- **认证**: 基于 SecondMe OAuth2
- **AI**: SecondMe Chat API
- **协议**: Mjai 协议 (参考 [smly/mjai.app](https://github.com/smly/mjai.app))

## SecondMe 集成

本项目使用了以下 SecondMe 能力：

| 权限范围 | 用途 |
|---------|------|
| `user.info` | 获取用户基础信息，认证 |
| `chat` | AI 做出打牌决策 |
| `note.add` | 保存对局记录到 SecondMe 记忆 |

## 项目结构

```
src/
├── app/                    # Next.js App Router
│   ├── api/
│   │   ├── auth/          # OAuth 认证路由
│   │   ├── game/          # 游戏 API
│   │   └── secondme/      # SecondMe API 代理
│   ├── game/              # 游戏页面
│   ├── profile/           # 个人资料页面
│   └── page.tsx           # 首页
├── components/            # React 组件
├── lib/
│   ├── secondme/          # SecondMe OAuth 客户端
│   ├── mahjong/           # 麻将游戏逻辑
│   └── types/             # TypeScript 类型定义
└── styles/                # 全局样式
```

## 游戏规则

- 只使用万子牌（一万到九万），共 36 张，每人 14张牌
- 二人对局，你 vs SecondMe AI
- 简化规则：不能吃、碰、杠
- 双方轮流摸牌打牌
- 最先胡牌获胜
- SecondMe AI 通过 Chat API 理解局面并输出动作决策

### 双 AI 对决

如果你想看**两个 SecondMe AI 互相打**，可以后续扩展。当前版本是人类 vs AI。

## 部署到云端

### 部署到 Vercel (推荐)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/shenyizhou/a2a-riichi-mahjong)

1. 在 Vercel 导入你的仓库
2. 设置环境变量（和 `.env.local` 一样）
3. 点击 Deploy
4. 部署完成后，在 SecondMe Develop 后台添加生产环境的重定向 URI：
   ```
   https://你的域名.vercel.app/api/auth/callback
   ```

### 环境变量（生产环境）

| 变量名 | 说明 |
|--------|------|
| `SECONDME_CLIENT_ID` | 你的 SecondMe Client ID |
| `SECONDME_CLIENT_SECRET` | 你的 SecondMe Client Secret |
| `SECONDME_REDIRECT_URI` | `https://你的域名/api/auth/callback` |
| `NEXTAUTH_URL` | `https://你的域名` |
| `NEXTAUTH_SECRET` | 随机字符串，可用 `openssl rand -hex 32` 生成 |
| `DEBUG_SKIP_LOGIN` | `false` |

### 更新 SecondMe 重定向 URI

部署到生产环境后，记得登录 [SecondMe Develop](https://develop.second.me/)，找到你的应用，添加生产环境的重定向 URI。

### 部署到自有服务器

有两种方式：**直接使用 PM2** 或者 **Docker**

#### 方式 1: PM2 (推荐简单部署)

在你的服务器上：

```bash
# 克隆代码
git clone https://github.com/shenyizhou/a2a-riichi-mahjong.git
cd a2a-riichi-mahjong

# 安装依赖
npm install

# 复制环境变量
cp .env.example .env.production
# 编辑 .env.production 填入你的配置

# 构建
npm run build

# 使用 PM2 启动
pm2 start ecosystem.config.js

# 设置开机自启
pm2 startup
pm2 save
```

配置反向代理（使用 Nginx）：

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_cache_bypass $http_upgrade;
    }
}
```

如果你使用 HTTPS（推荐），请配置 SSL 证书。

#### 方式 2: Docker Compose

```bash
# 克隆代码
git clone https://github.com/shenyizhou/a2a-riichi-mahjong.git
cd a2a-riichi-mahjong

# 复制环境变量
cp .env.example .env
# 编辑 .env 填入你的配置

# 启动
docker-compose up -d
```

容器会在后台运行，端口映射到 `127.0.0.1:3000`，然后用 Nginx 反向代理即可。

### CI/CD with Drone

项目已经包含 `.drone.yml` 配置，如果你使用 Drone CI，可以直接使用：

- 自动在 `main` 分支提交时构建
- 自动部署到你的服务器主机目录 `/var/www/a2a-riichi-mahjong`
- 需要在 Drone 中配置 host volume 映射

配置方式请参考你的 Drone 文档。

## MCP 集成

本项目还提供 MCP 接口，可以让 OpenClaw 调用：

- `start_game` - 开始新游戏
- `play_move` - 执行一步操作
- `get_game_state` - 获取当前游戏状态

部署后需要更新 `mcp-manifest.json` 中的 `mcp.endpoint` 为你的实际域名。

## 调试模式

如果 OAuth 登录遇到问题，可以开启调试模式跳过登录：

```env
DEBUG_SKIP_LOGIN=true
DEBUG_ACCESS_TOKEN=你的真实-access-token
```

开启后直接访问首页即可进入游戏。

## 许可证

MIT

## 致谢

- [mjai.app](https://github.com/smly/mjai.app) - Mjai 协议和模拟器参考
- [SecondMe](https://second.me) - AI 能力平台
