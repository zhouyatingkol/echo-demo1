# ECHO Protocol V4 - 项目目录结构

## 概述

基于 React + TypeScript + Vite 的项目目录结构设计，支持模块化开发、代码分割和清晰的职责分离。

---

## 完整目录结构

```
ECHO-Protocol-V4/
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions 部署配置
├── public/
│   ├── favicon.ico
│   ├── logo.svg
│   └── manifest.json               # PWA 配置
├── src/
│   ├── api/                        # API 接口层
│   │   ├── index.ts                # API 统一导出
│   │   ├── ipfs.ts                 # IPFS 接口
│   │   ├── price.ts                # 价格查询接口
│   │   └── types.ts                # API 类型定义
│   │
│   ├── assets/                     # 静态资源
│   │   ├── images/                 # 图片资源
│   │   ├── icons/                  # 图标资源
│   │   ├── audio/                  # 示例音频（可选）
│   │   └── styles/                 # 全局样式
│   │       ├── globals.css
│   │       └── variables.css
│   │
│   ├── components/                 # 组件层
│   │   ├── ui/                     # 基础 UI 组件 (Radix 封装)
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   ├── toast.tsx
│   │   │   ├── tooltip.tsx
│   │   │   └── index.ts
│   │   │
│   │   ├── shared/                 # 业务通用组件
│   │   │   ├── ConnectButton.tsx   # 连接钱包按钮
│   │   │   ├── AssetCard.tsx       # 资产卡片
│   │   │   ├── AudioPlayer.tsx     # 音频播放器
│   │   │   ├── AudioUploader.tsx   # 音频上传组件
│   │   │   ├── PriceDisplay.tsx    # 价格显示
│   │   │   ├── NetworkBadge.tsx    # 网络标识
│   │   │   ├── LoadingScreen.tsx   # 加载屏幕
│   │   │   └── index.ts
│   │   │
│   │   └── layout/                 # 布局组件
│   │       ├── Header.tsx          # 顶部导航
│   │       ├── Footer.tsx          # 页脚
│   │       ├── Sidebar.tsx         # 侧边栏（桌面端）
│   │       ├── MobileNav.tsx       # 移动端导航
│   │       ├── Layout.tsx          # 主布局
│   │       └── index.ts
│   │
│   ├── config/                     # 配置文件
│   │   ├── constants.ts            # 全局常量
│   │   ├── contracts.ts            # 合约地址配置
│   │   ├── networks.ts             # 网络配置
│   │   └── theme.ts                # 主题配置
│   │
│   ├── contracts/                  # 智能合约相关
│   │   ├── abis/                   # 合约 ABI
│   │   │   ├── ECHOAssetV2V3.json
│   │   │   ├── LicenseNFTV3.json
│   │   │   ├── ECHOFusionV2.json
│   │   │   └── index.ts
│   │   ├── types/                  # 合约类型（自动生成或手写）
│   │   │   ├── ECHOAssetV2V3.ts
│   │   │   ├── LicenseNFTV3.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   │
│   ├── hooks/                      # 自定义 Hooks
│   │   ├── useWallet.ts            # 钱包管理
│   │   ├── useContract.ts          # 合约交互
│   │   ├── useAsset.ts             # 资产数据
│   │   ├── useAudio.ts             # 音频控制
│   │   ├── usePrice.ts             # 价格数据
│   │   ├── useIPFS.ts              # IPFS 操作
│   │   ├── useToast.ts             # Toast 通知
│   │   └── index.ts
│   │
│   ├── lib/                        # 第三方库封装
│   │   ├── ethers.ts               # ethers.js 配置
│   │   ├── queryClient.ts          # React Query 配置
│   │   ├── ipfs.ts                 # IPFS 客户端配置
│   │   └── utils.ts                # 通用工具函数
│   │
│   ├── pages/                      # 页面组件
│   │   ├── Home/
│   │   │   ├── Home.tsx
│   │   │   ├── components/
│   │   │   └── index.ts
│   │   │
│   │   ├── Assets/
│   │   │   ├── Assets.tsx          # 资产列表页
│   │   │   ├── AssetDetail.tsx     # 资产详情页
│   │   │   └── index.ts
│   │   │
│   │   ├── Mint/
│   │   │   ├── Mint.tsx            # 生成页面
│   │   │   └── index.ts
│   │   │
│   │   ├── License/
│   │   │   ├── License.tsx         # 许可证管理
│   │   │   └── index.ts
│   │   │
│   │   ├── Fusion/
│   │   │   ├── Fusion.tsx          # 融合页面
│   │   │   └── index.ts
│   │   │
│   │   ├── Profile/
│   │   │   ├── Profile.tsx         # 用户资料
│   │   │   └── index.ts
│   │   │
│   │   └── NotFound/
│   │       ├── NotFound.tsx
│   │       └── index.ts
│   │
│   ├── providers/                  # Context Providers
│   │   ├── AppProviders.tsx        # 统一 Provider 组合
│   │   ├── WalletProvider.tsx      # 钱包 Provider（可选）
│   │   └── ThemeProvider.tsx       # 主题 Provider
│   │
│   ├── router/                     # 路由配置
│   │   ├── routes.tsx              # 路由定义
│   │   ├── lazyRoutes.ts           # 懒加载配置
│   │   └── index.ts
│   │
│   ├── services/                   # 服务层
│   │   ├── wallet.service.ts       # 钱包服务
│   │   ├── contract.service.ts     # 合约服务
│   │   ├── audio.service.ts        # 音频服务
│   │   ├── ipfs.service.ts         # IPFS 服务
│   │   └── index.ts
│   │
│   ├── store/                      # 状态管理 (Zustand)
│   │   ├── slices/
│   │   │   ├── walletStore.ts      # 钱包状态
│   │   │   ├── uiStore.ts          # UI 状态
│   │   │   └── userStore.ts        # 用户状态
│   │   ├── index.ts                # Store 统一导出
│   │   └── types.ts                # Store 类型定义
│   │
│   ├── types/                      # 全局类型定义
│   │   ├── index.ts                # 统一导出
│   │   ├── asset.ts                # 资产类型
│   │   ├── license.ts              # 许可证类型
│   │   ├── wallet.ts               # 钱包类型
│   │   └── common.ts               # 通用类型
│   │
│   └── utils/                      # 工具函数
│       ├── format.ts               # 格式化工具
│       ├── validation.ts           # 验证工具
│       ├── constants.ts            # 常量定义
│       ├── audio.ts                # 音频处理工具
│       └── index.ts
│
├── .env.example                    # 环境变量示例
├── .eslintrc.js                    # ESLint 配置
├── .prettierrc                     # Prettier 配置
├── index.html                      # 入口 HTML
├── package.json                    # 依赖配置
├── tailwind.config.js              # Tailwind 配置
├── tsconfig.json                   # TypeScript 配置
├── vite.config.ts                  # Vite 配置
└── README.md                       # 项目说明
```

---

## 目录职责说明

### `src/api/`
- **职责**: 与外部 API 的接口定义
- **原则**: 只负责 HTTP 请求，不处理业务逻辑
- **包含**: IPFS、价格服务、后端 API

### `src/components/`
- **ui/**: 原子级基础组件，无业务逻辑
- **shared/**: 业务通用组件，可复用
- **layout/**: 页面布局骨架组件

### `src/config/`
- **职责**: 应用配置集中管理
- **原则**: 环境相关的配置使用 `import.meta.env`

### `src/contracts/`
- **abis/**: 合约 ABI JSON 文件
- **types/**: TypeScript 合约类型定义

### `src/hooks/`
- **职责**: 自定义 React Hooks
- **命名**: 以 `use` 开头，驼峰命名
- **原则**: 单一职责，可测试

### `src/lib/`
- **职责**: 第三方库的封装和配置
- **原则**: 隔离外部依赖，便于替换

### `src/pages/`
- **职责**: 路由级别的页面组件
- **结构**: 每个页面独立文件夹，包含子组件

### `src/services/`
- **职责**: 业务逻辑封装
- **区别**: 相比 hooks，services 是框架无关的纯函数/类

### `src/store/`
- **职责**: 全局状态管理
- **结构**: 按功能模块分 slices

### `src/types/`
- **职责**: TypeScript 类型定义
- **原则**: 优先使用 `interface`，导出类型而非具体值

### `src/utils/`
- **职责**: 纯工具函数
- **原则**: 无副作用，纯函数优先

---

## 代码组织原则

### 1. 就近原则
相关文件放在一起，避免深层嵌套导入：
```typescript
// ✅ Good: 同目录导入
import { AssetCard } from './components/AssetCard';

// ❌ Bad: 深层嵌套
import { AssetCard } from '../../../components/shared/AssetCard';
```

### 2.  Barrel 导出
每个目录使用 `index.ts` 统一导出：
```typescript
// components/shared/index.ts
export { ConnectButton } from './ConnectButton';
export { AssetCard } from './AssetCard';
export { AudioPlayer } from './AudioPlayer';
```

### 3. 懒加载配置
```typescript
// router/lazyRoutes.ts
import { lazy } from 'react';

export const HomePage = lazy(() => import('@/pages/Home'));
export const AssetsPage = lazy(() => import('@/pages/Assets'));
export const MintPage = lazy(() => import('@/pages/Mint'));
```

### 4. 路径别名
```typescript
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@/components/*": ["src/components/*"],
      "@/hooks/*": ["src/hooks/*"],
      "@/store/*": ["src/store/*"]
    }
  }
}
```

---

## GitHub Pages 适配

### 静态资源路径
```typescript
// vite.config.ts
export default defineConfig({
  base: '/ECHO-Protocol-V4/',  // 仓库名作为 base
  // ...
});
```

### 路由模式
- 使用 `HashRouter` 而非 `BrowserRouter`
- GitHub Pages 不支持服务端路由重写

```typescript
// router/index.tsx
import { HashRouter } from 'react-router-dom';

<HashRouter>
  <App />
</HashRouter>
```

### 构建输出
```yaml
# .github/workflows/deploy.yml
- name: Build
  run: npm run build
  
- name: Deploy
  uses: peaceiris/actions-gh-pages@v3
  with:
    github_token: ${{ secrets.GITHUB_TOKEN }}
    publish_dir: ./dist
```

---

## 文件命名规范

| 类型 | 命名规则 | 示例 |
|------|----------|------|
| 组件 | PascalCase | `AssetCard.tsx` |
| Hooks | camelCase + use | `useWallet.ts` |
| 工具函数 | camelCase | `formatAddress.ts` |
| 常量 | SNAKE_CASE | `MAX_SUPPLY` |
| 类型 | PascalCase | `AssetMetadata` |
| 样式文件 | 同组件名 | `AssetCard.module.css` |
| 配置 | camelCase | `tailwind.config.js` |

---

## 推荐 VS Code 配置

```json
// .vscode/settings.json
{
  "typescript.preferences.importModuleSpecifier": "non-relative",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  }
}
```
