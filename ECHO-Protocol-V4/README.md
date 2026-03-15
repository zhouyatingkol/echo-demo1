# ECHO Protocol V4 Frontend

ECHO Protocol 是去中心化的音乐资产协议，让创作者能够铸造、交易和授权音乐 NFT。本项目是 ECHO Protocol V4 的前端应用。

## 功能特性

- 🎵 **音乐 NFT 市场** - 浏览、搜索和购买音乐 NFT
- 💼 **钱包集成** - 支持 MetaMask 等 Web3 钱包
- 📜 **灵活授权** - 支持买断、按次、限时三种授权模式
- 🎨 **创作者中心** - 上传作品、管理资产、查看收益
- 🔒 **安全可靠** - 合约地址白名单、输入验证、错误处理

## 技术栈

- **框架**: React 18 + TypeScript
- **构建**: Vite
- **路由**: React Router (HashRouter for GitHub Pages)
- **状态管理**: Zustand + TanStack Query
- **样式**: Tailwind CSS
- **组件**: Radix UI
- **合约交互**: ethers.js v6
- **图标**: Lucide React

## 快速开始

### 安装依赖

```bash
npm install
```

### 开发服务器

```bash
npm run dev
```

### 构建生产版本

```bash
npm run build
```

### 预览生产版本

```bash
npm run preview
```

## 项目结构

```
src/
├── components/
│   ├── ui/           # 基础 UI 组件 (Button, Card, Input, etc.)
│   └── shared/       # 业务共享组件 (Navbar, AssetCard, AudioPlayer)
├── modules/
│   ├── wallet/       # 钱包模块 (WalletProvider, useWallet, ConnectButton)
│   └── contracts/    # 合约模块 (contract-config, useECHOAsset, etc.)
├── pages/
│   ├── Home.tsx
│   ├── Marketplace.tsx
│   ├── AssetDetail.tsx
│   ├── LicenseShop.tsx
│   ├── MyAssets.tsx
│   ├── Profile.tsx
│   └── creator/      # 创作者中心页面
│       ├── Dashboard.tsx
│       ├── MyAssets.tsx
│       ├── Upload.tsx
│       └── Revenue.tsx
├── lib/
│   └── utils.ts      # 工具函数
├── types/
│   └── index.ts      # TypeScript 类型定义
└── App.tsx           # 主应用组件
```

## 合约配置

合约配置位于 `src/modules/contracts/contract-config.ts`：

```typescript
const CONTRACT_ADDRESSES = {
  11155111: {  // Sepolia Testnet
    ECHOAssetV2V3: '0x...',
    LicenseNFTV3: '0x...',
    ECHOFusionV2: '0x...',
  },
  31337: {  // Hardhat Local
    // ...
  }
}
```

## 环境变量

在项目根目录创建 `.env` 文件：

```env
VITE_CHAIN_ID=11155111
VITE_RPC_URL=https://rpc.sepolia.org
```

## 部署

本项目配置了 GitHub Actions 自动部署到 GitHub Pages：

1. 推送代码到 `main` 或 `master` 分支
2. GitHub Actions 会自动构建并部署
3. 访问 `https://yourusername.github.io/ECHO-Protocol-V4`

## 开发规范

- 使用 TypeScript 严格模式
- 组件使用函数式 + Hooks
- 样式使用 Tailwind CSS
- 状态使用 Zustand
- 合约调用使用自定义 Hooks

## 安全注意事项

- 所有输入都经过验证
- 合约地址使用白名单机制
- 敏感操作有二次确认
- 错误信息不暴露敏感数据

## License

MIT