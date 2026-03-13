# ECHO Protocol V4 - 部署指南

## 概述

本文档详细说明 ECHO Protocol V4 前端应用的部署流程，包括 GitHub Pages 部署、CDN 配置和环境变量管理。

---

## 1. 部署架构概览

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           部署架构                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│   ┌─────────────────┐                                                       │
│   │   Developer     │                                                       │
│   │   Workstation   │                                                       │
│   └────────┬────────┘                                                       │
│            │ Git Push                                                        │
│            ▼                                                                │
│   ┌─────────────────┐     ┌─────────────────┐                              │
│   │   GitHub        │────►│   GitHub        │                              │
│   │   Repository    │     │   Actions       │                              │
│   └─────────────────┘     └────────┬────────┘                              │
│                                    │ Build & Deploy                         │
│                                    ▼                                        │
│                           ┌─────────────────┐                              │
│                           │   GitHub        │                              │
│                           │   Pages         │                              │
│                           │   (Static Host) │                              │
│                           └────────┬────────┘                              │
│                                    │                                        │
│         ┌──────────────────────────┼──────────────────────────┐            │
│         │                          │                          │            │
│         ▼                          ▼                          ▼            │
│  ┌──────────────┐          ┌──────────────┐          ┌──────────────┐     │
│  │   IPFS       │          │   Qitmeer    │          │   Price      │     │
│  │   Gateway    │          │   RPC Node   │          │   API        │     │
│  └──────────────┘          └──────────────┘          └──────────────┘     │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. GitHub Pages 部署

### 2.1 准备工作

#### 2.1.1 仓库配置
1. 在 GitHub 创建仓库 `ECHO-Protocol-V4`
2. 启用 GitHub Pages（Settings > Pages）
3. 选择部署来源为 "GitHub Actions"

#### 2.1.2 环境变量配置
在仓库 Settings > Secrets and variables > Actions 中添加：

```yaml
# 生产环境
VITE_CONTRACT_ECHO_ASSET_MAINNET=0x...
VITE_CONTRACT_LICENSE_NFT_MAINNET=0x...
VITE_CONTRACT_ECHO_FUSION_MAINNET=0x...
VITE_RPC_URL_MAINNET=https://mainnet.qitmeer.io

# 测试环境
VITE_CONTRACT_ECHO_ASSET_TESTNET=0x...
VITE_CONTRACT_LICENSE_NFT_TESTNET=0x...
VITE_CONTRACT_ECHO_FUSION_TESTNET=0x...
VITE_RPC_URL_TESTNET=https://testnet.qitmeer.io

# IPFS 配置
VITE_PINATA_API_KEY=your_pinata_key
VITE_PINATA_SECRET=your_pinata_secret

# 可选: 分析工具
VITE_ANALYTICS_ID=your_analytics_id
```

### 2.2 GitHub Actions 工作流

```yaml
# .github/workflows/deploy.yml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

# 权限配置
permissions:
  contents: read
  pages: write
  id-token: write

# 并发控制
concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  # 构建任务
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Setup Pages
        uses: actions/configure-pages@v4
        with:
          static_site_generator: vite

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run type-check

      - name: Lint
        run: npm run lint

      - name: Build
        run: npm run build
        env:
          # 合约地址
          VITE_CONTRACT_ECHO_ASSET: ${{ secrets.VITE_CONTRACT_ECHO_ASSET_MAINNET }}
          VITE_CONTRACT_LICENSE_NFT: ${{ secrets.VITE_CONTRACT_LICENSE_NFT_MAINNET }}
          VITE_CONTRACT_ECHO_FUSION: ${{ secrets.VITE_CONTRACT_ECHO_FUSION_MAINNET }}
          # RPC 配置
          VITE_RPC_URL: ${{ secrets.VITE_RPC_URL_MAINNET }}
          VITE_CHAIN_ID: "813"
          # IPFS
          VITE_PINATA_API_KEY: ${{ secrets.VITE_PINATA_API_KEY }}
          VITE_PINATA_SECRET: ${{ secrets.VITE_PINATA_SECRET }}
          # 分析
          VITE_ANALYTICS_ID: ${{ secrets.VITE_ANALYTICS_ID }}

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  # 部署任务
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

### 2.3 测试网部署工作流

```yaml
# .github/workflows/deploy-testnet.yml
name: Deploy to Testnet

on:
  push:
    branches: [develop]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages-testnet"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    environment: testnet
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build for testnet
        run: npm run build
        env:
          VITE_APP_ENV: testnet
          VITE_BASE_URL: /ECHO-Protocol-V4/testnet/
          VITE_CONTRACT_ECHO_ASSET: ${{ secrets.VITE_CONTRACT_ECHO_ASSET_TESTNET }}
          VITE_CONTRACT_LICENSE_NFT: ${{ secrets.VITE_CONTRACT_LICENSE_NFT_TESTNET }}
          VITE_CONTRACT_ECHO_FUSION: ${{ secrets.VITE_CONTRACT_ECHO_FUSION_TESTNET }}
          VITE_RPC_URL: ${{ secrets.VITE_RPC_URL_TESTNET }}
          VITE_CHAIN_ID: "8131"
          VITE_PINATA_API_KEY: ${{ secrets.VITE_PINATA_API_KEY }}
          VITE_PINATA_SECRET: ${{ secrets.VITE_PINATA_SECRET }}

      - name: Create testnet subdirectory
        run: |
          mkdir -p ./deploy
          cp -r ./dist/* ./deploy/
          # 创建根目录重定向
          echo '<!DOCTYPE html><html><head><meta http-equiv="refresh" content="0;url=./testnet/"></head></html>' > ./deploy/index.html

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./deploy

  deploy:
    environment:
      name: github-pages-testnet
      url: ${{ steps.deployment.outputs.page_url }}testnet/
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## 3. Vite 生产配置

```typescript
// vite.config.ts
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react-swc';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  
  // 根据环境确定 base URL
  const isTestnet = env.VITE_APP_ENV === 'testnet';
  const base = isTestnet 
    ? '/ECHO-Protocol-V4/testnet/'
    : '/ECHO-Protocol-V4/';

  return {
    base,
    plugins: [react()],
    
    resolve: {
      alias: {
        '@': resolve(__dirname, 'src'),
      },
    },
    
    build: {
      target: 'es2020',
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: mode !== 'production',
      
      rollupOptions: {
        output: {
          // 代码分割策略
          manualChunks: {
            // 核心库
            'vendor': [
              'react',
              'react-dom',
              'react-router-dom',
            ],
            // 区块链相关
            'blockchain': [
              'ethers',
            ],
            // 状态管理
            'state': [
              'zustand',
              '@tanstack/react-query',
            ],
            // UI 组件
            'ui': [
              '@radix-ui/react-dialog',
              '@radix-ui/react-toast',
              '@radix-ui/react-dropdown-menu',
              '@radix-ui/react-tooltip',
            ],
          },
          // 资源命名
          entryFileNames: 'js/[name]-[hash].js',
          chunkFileNames: 'js/[name]-[hash].js',
          assetFileNames: (assetInfo) => {
            const info = assetInfo.name || '';
            if (info.endsWith('.css')) {
              return 'css/[name]-[hash][extname]';
            }
            if (/\.(png|jpe?g|gif|svg|webp|ico)$/.test(info)) {
              return 'images/[name]-[hash][extname]';
            }
            if (/\.(woff2?|ttf|otf|eot)$/.test(info)) {
              return 'fonts/[name]-[hash][extname]';
            }
            return 'assets/[name]-[hash][extname]';
          },
        },
      },
      
      // 压缩配置
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: mode === 'production',
          drop_debugger: mode === 'production',
        },
      },
    },
    
    // 优化依赖预构建
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'ethers',
        'zustand',
        '@tanstack/react-query',
      ],
    },
    
    // CSS 配置
    css: {
      postcss: './postcss.config.js',
      devSourcemap: true,
    },
    
    // 开发服务器配置
    server: {
      port: 3000,
      open: true,
    },
  };
});
```

---

## 4. 环境变量管理

### 4.1 环境变量类型

```typescript
// types/env.d.ts
/// <reference types="vite/client" />

interface ImportMetaEnv {
  // 应用环境
  readonly VITE_APP_ENV: 'development' | 'testnet' | 'production'
  
  // 基础配置
  readonly VITE_BASE_URL: string
  readonly VITE_APP_TITLE: string
  
  // 区块链配置
  readonly VITE_RPC_URL: string
  readonly VITE_CHAIN_ID: string
  
  // 合约地址
  readonly VITE_CONTRACT_ECHO_ASSET: string
  readonly VITE_CONTRACT_LICENSE_NFT: string
  readonly VITE_CONTRACT_ECHO_FUSION: string
  
  // IPFS 配置
  readonly VITE_PINATA_API_KEY: string
  readonly VITE_PINATA_SECRET: string
  readonly VITE_IPFS_GATEWAY: string
  
  // 可选配置
  readonly VITE_ANALYTICS_ID?: string
  readonly VITE_SENTRY_DSN?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
```

### 4.2 环境配置文件

```bash
# .env.development
VITE_APP_ENV=development
VITE_BASE_URL=/
VITE_APP_TITLE="ECHO Protocol V4 (Dev)"
VITE_RPC_URL=http://localhost:8545
VITE_CHAIN_ID=31337

# .env.testnet
VITE_APP_ENV=testnet
VITE_BASE_URL=/ECHO-Protocol-V4/testnet/
VITE_APP_TITLE="ECHO Protocol V4 (Testnet)"
VITE_RPC_URL=https://testnet.qitmeer.io
VITE_CHAIN_ID=8131
VITE_CONTRACT_ECHO_ASSET=0x...
VITE_CONTRACT_LICENSE_NFT=0x...
VITE_CONTRACT_ECHO_FUSION=0x...
VITE_IPFS_GATEWAY=https://gateway.ipfs.io/ipfs/

# .env.production
VITE_APP_ENV=production
VITE_BASE_URL=/ECHO-Protocol-V4/
VITE_APP_TITLE="ECHO Protocol V4"
VITE_RPC_URL=https://mainnet.qitmeer.io
VITE_CHAIN_ID=813
VITE_CONTRACT_ECHO_ASSET=0x...
VITE_CONTRACT_LICENSE_NFT=0x...
VITE_CONTRACT_ECHO_FUSION=0x...
VITE_IPFS_GATEWAY=https://gateway.ipfs.io/ipfs/
```

### 4.3 运行时配置

```typescript
// config/index.ts
const getEnvVar = (key: keyof ImportMetaEnv): string => {
  const value = import.meta.env[key];
  if (value === undefined) {
    throw new Error(`Missing environment variable: ${key}`);
  }
  return value;
};

export const config = {
  app: {
    env: getEnvVar('VITE_APP_ENV'),
    title: getEnvVar('VITE_APP_TITLE'),
    version: __APP_VERSION__, // 由 vite 注入
  },
  
  blockchain: {
    rpcUrl: getEnvVar('VITE_RPC_URL'),
    chainId: parseInt(getEnvVar('VITE_CHAIN_ID')),
    contracts: {
      echoAsset: getEnvVar('VITE_CONTRACT_ECHO_ASSET'),
      licenseNFT: getEnvVar('VITE_CONTRACT_LICENSE_NFT'),
      echoFusion: getEnvVar('VITE_CONTRACT_ECHO_FUSION'),
    },
  },
  
  ipfs: {
    gateway: import.meta.env.VITE_IPFS_GATEWAY || 'https://ipfs.io/ipfs/',
    pinata: {
      apiKey: import.meta.env.VITE_PINATA_API_KEY,
      secret: import.meta.env.VITE_PINATA_SECRET,
    },
  },
  
  analytics: {
    id: import.meta.env.VITE_ANALYTICS_ID,
  },
} as const;

// 环境检测
export const isDev = config.app.env === 'development';
export const isTestnet = config.app.env === 'testnet';
export const isProduction = config.app.env === 'production';
```

---

## 5. CDN 配置

### 5.1 静态资源 CDN

```typescript
// vite.config.ts 中添加 CDN 配置
import { defineConfig } from 'vite';
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  // ...
  
  build: {
    rollupOptions: {
      external: isProduction ? [
        // 生产环境使用 CDN
        'react',
        'react-dom',
        'ethers',
      ] : [],
    },
  },
  
  plugins: [
    // ...
    // 分析包大小
    visualizer({
      open: false,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
});
```

### 5.2 HTML 中的 CDN 引入

```html
<!-- index.html -->
<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title><%= VITE_APP_TITLE %></title>
    
    <!-- 预连接到 CDN -->
    <link rel="preconnect" href="https://cdn.jsdelivr.net" />
    <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
    
    <!-- 生产环境使用 CDN -->
    <% if (VITE_APP_ENV === 'production') { %>
    <script crossorigin src="https://cdn.jsdelivr.net/npm/react@18/umd/react.production.min.js"></script>
    <script crossorigin src="https://cdn.jsdelivr.net/npm/react-dom@18/umd/react-dom.production.min.js"></script>
    <% } %>
    
    <!-- PWA 配置 -->
    <link rel="manifest" href="/manifest.json" />
    <meta name="theme-color" content="#0ea5e9" />
    <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
    
    <!--  noscript 回退 -->
    <noscript>
      <div style="text-align: center; padding: 2rem;">
        <h1>JavaScript Required</h1>
        <p>ECHO Protocol requires JavaScript to function. Please enable JavaScript in your browser.</p>
      </div>
    </noscript>
  </body>
</html>
```

### 5.3 Service Worker (PWA)

```typescript
// public/sw.js
const CACHE_NAME = 'echo-protocol-v4-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
];

// 安装时缓存静态资源
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 激活时清理旧缓存
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// 拦截请求
self.addEventListener('fetch', (event) => {
  // 跳过非 GET 请求
  if (event.request.method !== 'GET') return;
  
  // 跳过浏览器扩展请求
  if (event.request.url.startsWith('chrome-extension://')) return;
  
  event.respondWith(
    caches.match(event.request).then((response) => {
      // 返回缓存或发起网络请求
      return (
        response ||
        fetch(event.request).then((fetchResponse) => {
          // 缓存成功的响应
          if (fetchResponse.ok) {
            const clone = fetchResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, clone);
            });
          }
          return fetchResponse;
        })
      );
    })
  );
});
```

---

## 6. 部署检查清单

### 6.1 发布前检查

```markdown
## 部署检查清单

### 代码质量
- [ ] 所有 TypeScript 错误已修复
- [ ] ESLint 检查通过
- [ ] 单元测试通过
- [ ] 构建成功无警告

### 功能测试
- [ ] 钱包连接正常
- [ ] 网络切换正常
- [ ] 合约读取正常
- [ ] 合约写入正常（测试网）
- [ ] IPFS 上传正常
- [ ] IPFS 获取正常

### 性能优化
- [ ] 代码分割生效
- [ ] 资源压缩正常
- [ ] 首屏加载 < 3s
- [ ] 包大小 < 500KB (gzipped)

### 安全
- [ ] 环境变量正确配置
- [ ] 敏感信息未泄露
- [ ] CSP 头配置正确

### 可访问性
- [ ] 移动端适配正常
- [ ] 深色模式正常
- [ ] 屏幕阅读器兼容
```

### 6.2 部署脚本

```json
// package.json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "build:testnet": "tsc && vite build --mode testnet",
    "preview": "vite preview",
    "type-check": "tsc --noEmit",
    "lint": "eslint . --ext ts,tsx --report-unused-disable-directives --max-warnings 0",
    "lint:fix": "eslint . --ext ts,tsx --fix",
    "format": "prettier --write \"src/**/*.{ts,tsx,css}\"",
    "test": "vitest",
    "test:ui": "vitest --ui",
    "analyze": "vite-bundle-visualizer",
    "deploy:testnet": "npm run build:testnet && npm run deploy:gh-pages",
    "deploy:gh-pages": "gh-pages -d dist"
  }
}
```

---

## 7. 回滚策略

### 7.1 自动回滚

```yaml
# .github/workflows/deploy.yml 中添加
jobs:
  health-check:
    runs-on: ubuntu-latest
    needs: deploy
    steps:
      - name: Wait for deployment
        run: sleep 60
      
      - name: Health check
        run: |
          STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://your-username.github.io/ECHO-Protocol-V4/)
          if [ $STATUS -ne 200 ]; then
            echo "Health check failed with status $STATUS"
            exit 1
          fi
      
      - name: E2E tests
        run: npm run test:e2e
```

### 7.2 手动回滚

```bash
# 回滚到上一个版本
git log --oneline -10  # 查看提交历史
git revert HEAD        # 撤销最后一次提交
git push origin main   # 推送触发重新部署

# 或使用标签回滚
git tag -l                          # 查看标签
git checkout v1.0.0                 # 检出特定版本
npm run build && npm run deploy     # 重新部署
```

---

## 8. 监控与日志

### 8.1 错误监控

```typescript
// lib/sentry.ts
import * as Sentry from '@sentry/react';

if (config.app.env === 'production') {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    integrations: [
      Sentry.browserTracingIntegration(),
      Sentry.replayIntegration({
        maskAllText: false,
        blockAllMedia: false,
      }),
    ],
    tracesSampleRate: 0.1,
    replaysSessionSampleRate: 0.1,
    replaysOnErrorSampleRate: 1.0,
  });
}
```

### 8.2 性能监控

```typescript
// lib/analytics.ts
export function trackEvent(event: string, params?: Record<string, unknown>) {
  if (config.analytics.id && typeof window !== 'undefined') {
    // Google Analytics 4
    window.gtag?.('event', event, params);
  }
}

export function trackPageView(path: string) {
  trackEvent('page_view', { page_path: path });
}

export function trackTransaction(
  action: string,
  assetId: bigint,
  value: bigint
) {
  trackEvent('contract_interaction', {
    action,
    asset_id: assetId.toString(),
    value: value.toString(),
  });
}
```

---

## 9. 多环境管理

| 环境 | 分支 | URL | 用途 |
|------|------|-----|------|
| 开发 | `feature/*` | `http://localhost:3000` | 本地开发 |
| 测试 | `develop` | `https://user.github.io/ECHO-Protocol-V4/testnet/` | 功能测试 |
| 预发布 | `release/*` | `https://user.github.io/ECHO-Protocol-V4/staging/` | UAT 测试 |
| 生产 | `main` | `https://user.github.io/ECHO-Protocol-V4/` | 正式环境 |

---

## 10. 故障排查

### 常见问题

| 问题 | 原因 | 解决方案 |
|------|------|----------|
| 空白页面 | base URL 配置错误 | 检查 vite.config.ts base 配置 |
| 404 刷新 | SPA 路由问题 | 使用 HashRouter 或配置 404.html |
| 合约调用失败 | 环境变量未设置 | 检查 GitHub Secrets |
| 资源加载 404 | 路径问题 | 确保使用相对路径 |
| 缓存不更新 | 浏览器缓存 | 添加版本号到资源 URL |
