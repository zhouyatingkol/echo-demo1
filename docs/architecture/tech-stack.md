# ECHO Protocol V4 - 技术栈选型说明

## 概述

ECHO Protocol V4 前端架构设计针对 GitHub Pages 静态托管环境，支持 Qitmeer 区块链交互、音频数据处理和实时价格计算。

---

## 1. 前端框架: React 18 + TypeScript

### 选型理由
| 候选方案 | 评分 | 说明 |
|---------|------|------|
| **React 18** | ⭐⭐⭐⭐⭐ | 生态丰富、Concurrent Features、SSR支持 |
| Vue 3 | ⭐⭐⭐⭐ | 学习曲线低，但 TypeScript 支持不如 React |
| Vanilla JS | ⭐⭐ | 缺乏组件化，维护成本高 |

### 关键特性利用
- **Concurrent Rendering**: 优化音频数据处理时的 UI 响应
- **Suspense**: 合约数据异步加载
- **Strict Mode**: 开发时检测潜在问题

---

## 2. 状态管理: Zustand + React Query

### 选型理由
| 候选方案 | 评分 | 说明 |
|---------|------|------|
| **Zustand** | ⭐⭐⭐⭐⭐ | 轻量、TypeScript 友好、无样板代码 |
| Redux Toolkit | ⭐⭐⭐⭐ | 功能强大但过于笨重 |
| Context API | ⭐⭐⭐ | 跨组件通信性能差 |

### 分层状态管理
```
┌─────────────────────────────────────────┐
│  Server State (React Query)             │
│  - 区块链数据                            │
│  - IPFS 元数据                           │
│  - 价格数据                              │
├─────────────────────────────────────────┤
│  Client State (Zustand)                 │
│  - 钱包状态                              │
│  - UI 状态                               │
│  - 用户偏好                              │
├─────────────────────────────────────────┤
│  URL State (React Router)               │
│  - 页面路由                              │
│  - 筛选参数                              │
└─────────────────────────────────────────┘
```

---

## 3. 区块链库: ethers.js v6

### 选型理由
| 候选方案 | 评分 | 说明 |
|---------|------|------|
| **ethers.js v6** | ⭐⭐⭐⭐⭐ | 模块化、TypeScript 原生、体积小 |
| web3.js v4 | ⭐⭐⭐⭐ | 社区大但包体积大 |
| viem | ⭐⭐⭐⭐ | 新兴，但生态不如 ethers |

### ethers.js v6 优势
- **Tree-shaking 友好**: 只打包需要的模块
- **BigInt 原生支持**: 无需额外转换
- **Network 抽象**: 支持 Qitmeer EVM 兼容链

---

## 4. 构建工具: Vite 5

### 选型理由
| 候选方案 | 评分 | 说明 |
|---------|------|------|
| **Vite 5** | ⭐⭐⭐⭐⭐ | 极速 HMR、原生 ESM、Rollup 优化 |
| Webpack 5 | ⭐⭐⭐⭐ | 功能全但配置复杂 |
| Parcel | ⭐⭐⭐ | 零配置但灵活性差 |

### Vite 配置要点
```javascript
// vite.config.ts
export default {
  base: '/ECHO-Protocol-V4/',  // GitHub Pages 子路径
  build: {
    target: 'es2020',          // BigInt 支持
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      output: {
        manualChunks: {
          // 代码分割策略
          'ethers': ['ethers'],
          'ui': ['@radix-ui/react-dialog', '@radix-ui/react-toast'],
        }
      }
    }
  }
}
```

---

## 5. UI 组件库: Radix UI + Tailwind CSS

### 选型理由
| 候选方案 | 评分 | 说明 |
|---------|------|------|
| **Radix + Tailwind** | ⭐⭐⭐⭐⭐ | 无样式组件 + 原子 CSS，完全可控 |
| Ant Design | ⭐⭐⭐⭐ | 功能全但样式难覆盖 |
| Chakra UI | ⭐⭐⭐⭐ | 好用但体积较大 |

### 组件架构
```
components/
├── ui/              # Radix 原始组件
│   ├── button.tsx
│   ├── dialog.tsx
│   └── ...
├── shared/          # 业务通用组件
│   ├── ConnectWallet.tsx
│   ├── AssetCard.tsx
│   └── AudioPlayer.tsx
└── layout/          # 布局组件
    ├── Header.tsx
    └── Sidebar.tsx
```

### Tailwind 配置
```javascript
// tailwind.config.js
module.exports = {
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f9ff',
          500: '#0ea5e9',
          600: '#0284c7',
          900: '#0c4a6e',
        }
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      }
    }
  }
}
```

---

## 6. 音频处理: Web Audio API + Howler.js

### 选型理由
| 候选方案 | 评分 | 说明 |
|---------|------|------|
| **Web Audio API** | ⭐⭐⭐⭐⭐ | 原生支持，实时处理能力强 |
| Howler.js | ⭐⭐⭐⭐⭐ | 跨浏览器兼容、简洁 API |
| Tone.js | ⭐⭐⭐⭐ | 音乐制作专用，功能过剩 |

### 音频架构
```typescript
// 音频服务封装
interface AudioService {
  // 加载 IPFS 音频
  loadFromIPFS(cid: string): Promise<Howl>;
  
  // 音频分析（可视化）
  createAnalyser(): AnalyserNode;
  
  // 音频转码（上传前处理）
  encodeForUpload(file: File): Promise<Blob>;
}
```

---

## 7. 路由: React Router v6

### 选型理由
- **代码分割**: `React.lazy()` + `Suspense`
- **嵌套路由**: 布局复用
- **Data API**: loader/action 模式（可选）

---

## 8. 表单处理: React Hook Form + Zod

### 选型理由
| 候选方案 | 评分 | 说明 |
|---------|------|------|
| **RHF + Zod** | ⭐⭐⭐⭐⭐ | 性能优秀、TypeScript 集成 |
| Formik | ⭐⭐⭐ | 重渲染问题 |

---

## 9. 数据获取: TanStack Query v5

### 选型理由
- **缓存策略**: 智能缓存 + 后台更新
- **乐观更新**: UI 即时响应
- **错误重试**: 自动重试机制
- **WebSocket 集成**: 实时价格更新

---

## 10. 完整依赖清单

### 核心依赖
```json
{
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "ethers": "^6.9.0",
    "@tanstack/react-query": "^5.0.0",
    "zustand": "^4.4.0",
    "react-router-dom": "^6.20.0",
    "howler": "^2.2.3",
    "react-hook-form": "^7.48.0",
    "zod": "^3.22.0",
    "@hookform/resolvers": "^3.3.0",
    "ipfs-http-client": "^60.0.0",
    "date-fns": "^2.30.0"
  }
}
```

### 开发依赖
```json
{
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/howler": "^2.2.10",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "tailwindcss": "^3.3.0",
    "@radix-ui/react-dialog": "^1.0.0",
    "@radix-ui/react-toast": "^1.0.0",
    "@radix-ui/react-dropdown-menu": "^1.0.0",
    "@radix-ui/react-tooltip": "^1.0.0",
    "eslint": "^8.55.0",
    "prettier": "^3.1.0"
  }
}
```

---

## 11. 技术栈全景图

```
┌─────────────────────────────────────────────────────────────┐
│                        前端层                                │
├─────────────────────────────────────────────────────────────┤
│  UI Layer: React 18 + TypeScript + Tailwind CSS            │
│  Components: Radix UI + Custom Components                  │
├─────────────────────────────────────────────────────────────┤
│                        状态层                                │
├─────────────────────────────────────────────────────────────┤
│  Client State: Zustand (钱包、UI、主题)                      │
│  Server State: TanStack Query (区块链、IPFS 数据)            │
├─────────────────────────────────────────────────────────────┤
│                        业务层                                │
├─────────────────────────────────────────────────────────────┤
│  Wallet: ethers.js v6 + Web3Modal (可选)                   │
│  Audio: Web Audio API + Howler.js                          │
│  Forms: React Hook Form + Zod                              │
│  Routing: React Router v6                                  │
├─────────────────────────────────────────────────────────────┤
│                        构建层                                │
├─────────────────────────────────────────────────────────────┤
│  Build: Vite 5                                             │
│  Deploy: GitHub Pages                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 12. 选型总结

| 类别 | 技术选型 | 版本 |
|------|----------|------|
| 框架 | React | 18.x |
| 语言 | TypeScript | 5.x |
| 构建 | Vite | 5.x |
| 状态 (Client) | Zustand | 4.x |
| 状态 (Server) | TanStack Query | 5.x |
| 样式 | Tailwind CSS | 3.x |
| 组件 | Radix UI | 1.x |
| 区块链 | ethers.js | 6.x |
| 音频 | Howler.js | 2.x |
| 表单 | React Hook Form | 7.x |
| 验证 | Zod | 3.x |
| 路由 | React Router | 6.x |

此技术栈满足所有约束条件：
- ✅ GitHub Pages 静态托管兼容
- ✅ ethers.js v6 支持
- ✅ MetaMask 集成就绪
- ✅ 移动端响应式设计
