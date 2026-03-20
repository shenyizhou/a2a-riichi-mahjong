# 开发问题记录与解决方案

本文档记录了在开发 **A2A 清一色万子麻将** 项目过程中遇到的问题以及对应的解决方案，供后续开发参考。

---

## 目录

- [TypeScript 类型错误](#typescript-类型错误)
- [本地开发 404 问题](#本地开发-404-问题)
- [UI 布局重叠问题](#ui-布局重叠问题)
- [麻将牌显示问题](#麻将牌显示问题)
- [API 端点错误](#api-端点错误)
- [JSX 在 TypeScript 中的问题](#jsx-in-typescript-问题)
- [认证相关问题](#认证相关问题)

---

## TypeScript 类型错误

### 问题 1: `SecondMeConfig` 缺少 `allowedScopes` 属性

**错误信息:**
```
Property 'allowedScopes' does not exist on type 'SecondMeConfig'.
```

**原因:**
类型定义不完整，OAuth 客户端需要知道允许的 scope 列表。

**解决方案:**
在 `src/lib/types/secondme.ts` 中添加 `allowedScopes?: string[]` 属性：

```typescript
export interface SecondMeConfig {
  clientId: string
  clientSecret: string
  redirectUri: string
  apiBaseUrl: string
  oauthUrl: string
  tokenEndpoint: string
  refreshEndpoint: string
  allowedScopes?: string[]  // ← 添加这行
}
```

---

### 问题 2: `GameState` 缺少 `riichiDeclared` 属性

**错误信息:**
```
Property 'riichiDeclared' does not exist on type 'GameState'.
```

**原因:**
添加立直功能后，游戏状态需要记录是否已经立直，但类型定义没更新。

**解决方案:**
在 `src/lib/types/mjai.ts` 的 `GameState` 接口中添加：

```typescript
export interface GameState {
  // ... 其他属性
  riichiDeclared: boolean  // ← 添加这行
}
```

同时在 `MjaiEvent` 和 `MjaiAction` 中添加 `riichi` 事件类型：

```typescript
export type MjaiEvent =
  // ... 其他事件
  | { type: 'riichi'; actor: number }  // ← 添加这行
```

---

### 问题 3: 缺少函数定义

**错误信息:**
```
Cannot find name 'handleRiichi'.
Cannot find name 'canTsumoAgari'.
Cannot find name 'handleTsumoAgari'.
```

**原因:**
UI 中引用了这些函数，但函数实现没写。

**解决方案:**
在 `src/app/game/page.tsx` 中添加函数实现：

```typescript
// 处理立直
const handleRiichi = () => {
  if (!game || game.currentActor !== 0) return
  setGame(prev => {
    if (!prev) return prev
    const newGame = { ...prev }
    newGame.riichiDeclared = true
    newGame.events.push({ type: 'riichi', actor: 0 })
    newGame.currentActor = 1
    return newGame
  })
  setTimeout(() => { if (game) aiMove(game) }, 300)
}

// 检查是否可以自摸胡牌
const canTsumoAgari = game && game.currentActor === 0 && game.humanHand.length === 14

// 处理胡牌，诈胡惩罚
const handleTsumoAgari = () => {
  if (!game || !canTsumoAgari) return
  const confirmWin = window.confirm('确认你胡牌了吗？\n如果诈胡会被扣 10000 分。')
  if (!confirmWin) return

  setGame(prev => {
    if (!prev) return prev
    const newGame = { ...prev }
    newGame.gameEnded = true
    newGame.scores[0] += 10000
    newGame.scores[1] -= 10000
    newGame.events.push({ type: 'tsumo_agari', actor: 0 })
    return newGame
  })
  alert('你胡了！恭喜获胜！得分 +10000')
}
```

---

## 本地开发 404 问题

### 问题: `basePath` 配置导致本地访问 404

**错误现象:**
配置了 `basePath: '/web'` 后，本地开发访问 `http://localhost:3000` 显示 404。

**原因:**
生产环境部署在 `/web` 子路径，但本地开发也需要根路径访问。

**解决方案:**
修改 `next.config.js`，只在生产环境启用 `basePath`：

```javascript
const isProduction = process.env.NODE_ENV === 'production'
const nextConfig = {
  basePath: isProduction ? '/web' : '',  // ← 修改这里
  output: 'standalone',
}
```

---

## UI 布局重叠问题

### 问题: "打出"按钮被 AI 思考提示遮挡

**错误现象:**
AI 思考的时候，底部操作栏被思考提示挡住了，按钮点不到。

**原因:**
AI 思考提示和操作栏都用了 `fixed bottom-6`，位置重叠。

**解决方案:**
调整 AI 思考提示位置为 `bottom-24`，并设置正确的 z-index：

```tsx
{thinking && (
  <div className="fixed bottom-24 left-1/2 -translate-x-1/2 ... z-40">
    {/* AI 思考提示 */}
  </div>
)}
{game && game.currentActor === 0 && (
  <div className="fixed bottom-6 left-1/2 -translate-x-1/2 ... z-50">
    {/* 操作栏 */}
  </div>
)}
```

z-index: 操作栏 `z-50` > 思考提示 `z-40`，这样不会被挡住。

---

## 麻将牌显示问题

### 问题 1: 字体太小看不清，不同类型没区分

**问题现象:**
麻将牌字体太小，所有牌颜色都一样，分不清万筒索。

**解决方案:**
在 `src/app/globals.css` 中添加按类型染色：

```css
/* 麻将牌样式 */
.mahjong-tile {
  @apply bg-amber-50 rounded-md shadow-md border-2 border-amber-300 flex items-center justify-center font-black select-none;
  transition: all 0.2s ease;
  text-align: center;
  line-height: 1;
}

/* 按牌类型区分文字颜色 */
.mahjong-tile.pai-m { /* 万 */ }
.mahjong-tile.pai-p { /* 筒 */ @apply text-red-600; }
.mahjong-tile.pai-s { /* 索 */ @apply text-green-700; }
.mahjong-tile.pai-z { /* 字牌 */ @apply text-red-700; }
```

---

### 问题 2: 宝牌指示牌自动换行

**问题现象:**
字体变大后，宝牌区域宽度不够，自动换行变成两行。

**解决方案:**
统一缩小所有麻将牌尺寸，保持一行：

| 位置 | 原尺寸 | 新尺寸 |
|------|--------|--------|
| 宝牌 | `w-10 h-14` | 保持不变 |
| 打出牌 | `w-8 h-12` | `w-10 h-14` |
| 手牌 | `w-12 h-16` | `w-12 h-16` (保持) |

---

### 问题 3: 文字不居中

**问题现象:**
麻将牌里的文字没有垂直水平居中。

**解决方案:**
- 添加 `flex items-center justify-center` 到 `.mahjong-tile`
- 添加 `line-height: 1` 消除行高影响
- 添加 `text-align: center` 确保水平居中

---

### 问题 4: 万子牌不正宗，希望做成真实麻将样式

**需求:**
万子牌应该做成：上边黑色繁体数字，下边红色繁体"萬"。

**原因:**
原来 `formatTile` 返回的是单行字符串，无法分层染色。

**解决方案:**

1. **重命名文件**: `game.ts` → `game.tsx`（因为要返回 JSX）
2. **修改 `formatTile` 函数**:

```typescript
import React from 'react'

export function formatTile(pai: string): React.ReactNode {
  // ...
  if (type === 'm') {
    return (
      <div className="flex flex-col items-center leading-none">
        <span className="font-black">{numChar}</span>
        <span className="text-red-600 font-black">{typeMap[type].type}</span>
      </div>
    )
  }
  // ...
}
```

3. **使用繁体中文**: 数字"一二三四五六七八九"，"萬"代替简体"万"

---

## API 端点错误

### 问题: `addNote` 端点路径错误

**错误现象:**
保存对局到 SecondMe 记忆时返回 404。

**原因:**
代码中用了错误的端点路径 `/api/secondme/note/add`，正确路径应该是 `/api/secondme/notes/create`。

**解决方案:**
在 `src/lib/secondme/client.ts` 中修正端点：

```typescript
async addNote(accessToken: string, request: NoteRequest): Promise<{ noteId: string }> {
  const response = await fetch(
    `${this.config.apiBaseUrl}/api/secondme/notes/create`,  // ← 修正这里
    {
      method: 'POST',
      // ...
    }
  )
  // ...
}
```

**参考**: SecondMe 官方 API 文档 - [创建笔记](https://develop-docs.second.me/zh/docs/api-reference/secondme#post-apisecondmenotescreate)

---

## JSX in TypeScript 问题

### 问题: 在 `.ts` 文件中写 JSX 报语法错误

**错误信息:**
```
error TS1005: ',' expected.
error TS1161: Unterminated regular expression literal.
```

**原因:**
TypeScript 默认只在 `.tsx` 文件中解析 JSX 语法。在 `.ts` 文件中写 JSX 会被当成语法错误。

**解决方案:**
将文件重命名为 `.tsx` 扩展名：

```bash
mv src/lib/mahjong/game.ts src/lib/mahjong/game.tsx
```

---

## 认证相关问题

### 问题 1: `refreshToken` 导入错误

**错误信息:**
```
Module '"@/lib/secondme/session"' has no exported member 'refreshToken'.
```

**原因:**
`route.ts` 中错误地从 `session` 导入了 `refreshToken`，实际上 `refreshToken` 是 `secondmeClient` 的方法。

**解决方案:**
删除错误的导入语句，`refreshToken` 本来就不需要从那里导入。

---

### 问题 2: 调试模式跳过 OAuth 登录

**需求:**
本地开发时不想每次都走 OAuth 流程，希望能跳过登录直接进入游戏。

**解决方案:**
在 `src/lib/secondme/session.ts` 中添加调试模式支持：

```typescript
export async function getSession(): Promise<SessionData | null> {
  // Debug mode: skip login if enabled
  if (process.env.DEBUG_SKIP_LOGIN === 'true') {
    return {
      secondmeUserId: 'debug-user',
      accessToken: process.env.DEBUG_ACCESS_TOKEN || 'debug-token',
      refreshToken: '',
      tokenExpiresAt: Date.now() + 3600 * 1000,
    }
  }
  // ... 正常流程
}
```

在 `.env.local` 中开启：
```env
DEBUG_SKIP_LOGIN=true
DEBUG_ACCESS_TOKEN=你的真实access-token
```

---

## 部署相关

### Drone CI 内存溢出

**问题现象:**
`npm run build` 在 CI 中被 OOM (Out of Memory) 杀死。

**解决方案:**
在 `.drone.yml` 中限制 Node.js 内存使用：

```yaml
commands:
  - npm ci --maxsockets 1
  - npm run build -- --max-old-space-size=1024
```

---

## 快速检查清单

遇到问题时先检查这几点：

1. **TypeScript 错误** → 是否漏加了类型定义？
2. **404 错误** → `basePath` 配置是否正确？端点路径是否和 API 文档一致？
3. **UI 重叠** → `z-index` 顺序对吗？位置是否冲突？
4. **JSX 语法错** → 文件扩展名是不是 `.tsx`？
5. **SecondMe API 调用失败** → 检查端点路径是否和 [API 参考](https://develop-docs.second.me/zh/docs/api-reference/secondme)一致？

---

## 相关链接

- [SecondMe 开发文档](https://develop-docs.second.me/zh/docs)
- [Mjai 协议参考](https://github.com/smly/mjai.app)
- [项目 README](./README.md)
