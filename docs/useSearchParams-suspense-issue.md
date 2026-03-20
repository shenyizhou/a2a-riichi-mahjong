# Next.js 首页预渲染报错记录：useSearchParams 缺少 Suspense

## 问题摘要

- 报错信息：`useSearchParams() should be wrapped in a suspense boundary at page "/"`  
- 连带报错：`Error occurred prerendering page "/"`  
- 触发场景：执行 `next build` 进行生产构建与预渲染时

## 影响范围

- 受影响路由：`/`（首页）
- 受影响文件：`src/app/page.tsx`
- 影响结果：构建阶段首页预渲染失败，导致构建流程报错

## 根因分析

在首页客户端组件中直接调用 `useSearchParams()`，但调用位置不在 `Suspense` 边界包裹的子树内。  
在 App Router 下，这会触发 Next.js 对该页面的 CSR bailout 检查，进而在预渲染阶段抛错。

## 修复方案

采用最小改动策略，仅调整 `useSearchParams` 的使用位置：

1. 新增子组件 `AuthErrorBanner`，将 `useSearchParams()` 下沉到该子组件内部。
2. 在首页中使用 `<Suspense fallback={null}>` 包裹 `AuthErrorBanner`。
3. 首页主组件 `Home` 不再直接调用 `useSearchParams()`。

## 关键改动点

- 新增：`AuthErrorBanner`（负责读取 `error` 查询参数并渲染错误提示）
- 新增：`import { Suspense } from 'react'`
- 调整：`Home` 组件移除 `useSearchParams` 相关逻辑

## 验证结果

执行 `npm run build` 后验证通过：

- 编译成功
- 类型检查通过
- 静态页面生成完成（包含 `/`）
- 不再出现 `useSearchParams` 缺少 `Suspense` 边界的报错

## 经验与规范

在 Next.js App Router 中，若客户端组件使用以下依赖路由状态的 Hook，应优先采用“最小子树 + Suspense”模式：

- `useSearchParams`
- `usePathname`
- `useRouter`（涉及只在客户端可确定状态的场景）

推荐实践：

1. 将相关 Hook 放入最小可独立的子组件。
2. 在父级用 `Suspense` 包裹，避免整页退化为 CSR。
3. 构建前执行一次 `npm run build`，确保预渲染链路可通过。
