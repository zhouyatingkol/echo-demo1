# ECHO Protocol - 项目结构

## 概述

ECHO Protocol 是一个构建在 Qitmeer 区块链上的去中心化音乐版权授权平台。本项目采用模块化架构，包含智能合约、前端界面和部署脚本。

---

## 目录结构

```
echo-demo/
├── .github/                    # GitHub 配置
│   └── workflows/              # GitHub Actions 工作流
│
├── admin/                      # 管理工具
│
├── assets/                     # 静态资源（图片、音频等）
│   ├── audio/                  # 音频文件
│   ├── images/                 # 图片资源
│   └── styles/                 # 全局样式
│
├── config/                     # 配置文件
│   ├── contracts.js            # 合约地址配置
│   └── network.js              # 网络配置
│
├── contracts/                  # 智能合约源码
│   ├── ECHOAssetV2V3.sol       # 资产合约 V3（最新）
│   ├── LicenseNFTV3.sol        # 授权 NFT 合约 V3
│   ├── ECHOFusionV2.sol        # 资产融合合约 V2
│   └── flattened/              # 扁平化合约（用于验证）
│
├── docs/                       # 文档目录
│   ├── architecture/           # 架构文档
│   ├── guides/                 # 使用指南
│   ├── design/                 # 设计文档
│   ├── security/               # 安全文档
│   └── .agents/                # Agent 协作文档
│
├── frontend/                   # 前端代码
│   ├── components/             # 可复用组件
│   ├── css/                    # 样式文件
│   ├── js/                     # JavaScript 脚本
│   ├── locales/                # 国际化文件
│   ├── utils/                  # 工具函数
│   ├── api/                    # API 接口
│   └── *.html                  # 页面文件
│
├── pages/                      # 页面目录
│   ├── index.html              # 首页
│   ├── market/                 # 市场相关页面
│   ├── creator/                # 创作者相关页面
│   ├── user/                   # 用户相关页面
│   └── compare/                # 对比页面
│
├── scripts/                    # 部署和工具脚本
│   ├── deploy.js               # 部署脚本
│   └── verify.js               # 合约验证脚本
│
├── test/                       # 测试文件
│   ├── unit/                   # 单元测试
│   └── integration/            # 集成测试
│
├── vendor/                     # 第三方库
│
├── .env.example                # 环境变量示例
├── .gitignore                  # Git 忽略配置
├── hardhat.config.js           # Hardhat 配置
├── package.json                # 项目依赖
└── README.md                   # 项目说明
```

---

## 各目录职责说明

### 1. `contracts/` - 智能合约

**职责**: 存放所有 Solidity 智能合约源码

| 文件 | 说明 |
|------|------|
| `ECHOAssetV2V3.sol` | 核心资产合约，支持四权分离、版本控制、内容验证 |
| `LicenseNFTV3.sol` | 授权 NFT 合约，支持三种授权模式 |
| `ECHOFusionV2.sol` | 资产融合合约，支持多资产融合成树 |
| `flattened/` | 扁平化合约文件，用于区块浏览器验证 |

**开发规范**:
- 使用 Solidity ^0.8.19
- 遵循 OpenZeppelin 安全标准
- 每个合约需包含完整的 NatSpec 注释

### 2. `frontend/` - 前端代码

**职责**: 存放所有前端相关代码

| 子目录 | 说明 |
|--------|------|
| `components/` | 可复用 UI 组件（导航栏、按钮等） |
| `css/` | 样式文件（主题、全局、移动端适配） |
| `js/` | JavaScript 脚本文件 |
| `locales/` | 国际化翻译文件 |
| `utils/` | 工具函数库 |
| `api/` | API 接口封装 |

**开发规范**:
- 使用原生 HTML5 + CSS3 + JavaScript (ES6+)
- 支持响应式设计（移动端优先）
- 使用 CSS 变量实现主题切换

### 3. `pages/` - 页面目录

**职责**: 存放各个功能页面

| 页面 | 功能 |
|------|------|
| `index.html` | 首页 |
| `market/` | 市场浏览、搜索、购买 |
| `creator/` | 创作者中心、生成资产 |
| `user/` | 个人中心、我的资产 |
| `docs.html` | 文档页面 |

### 4. `docs/` - 文档目录

**职责**: 项目文档和技术规范

| 子目录 | 说明 |
|--------|------|
| `architecture/` | 架构设计文档 |
| `guides/` | 使用指南和教程 |
| `design/` | 设计规范和 PRD |
| `security/` | 安全审计和最佳实践 |

### 5. `scripts/` - 脚本目录

**职责**: 部署和工具脚本

| 文件 | 用途 |
|------|------|
| `deploy.js` | 合约部署脚本 |
| `verify.js` | 合约验证脚本 |

### 6. `config/` - 配置目录

**职责**: 应用配置集中管理

| 文件 | 说明 |
|------|------|
| `contracts.js` | 合约地址和网络配置 |
| `network.js` | 区块链网络参数 |

---

## 文件命名规范

### 通用规范

| 类型 | 命名规则 | 示例 |
|------|----------|------|
| 合约文件 | PascalCase + 版本号 | `ECHOAssetV2V3.sol` |
| 页面文件 | kebab-case | `rights-management.html` |
| JS 文件 | camelCase | `contractService.js` |
| CSS 文件 | kebab-case | `theme-switcher.css` |
| 配置文件 | camelCase | `hardhat.config.js` |
| 文档文件 | UPPER_CASE | `QUICK_START.md` |

### 前端文件规范

```
# 组件文件
navbar.html          # 导航栏组件
wallet-btn.js        # 钱包按钮脚本

# 样式文件
theme.css            # 主题变量
global.css           # 全局样式
mobile.css           # 移动端适配

# 页面文件
index.html           # 首页
mint-v2.html         # 生成页面
music-market.html    # 市场页面
```

---

## 开发工作流

### 1. 环境准备

```bash
# 克隆项目
git clone https://github.com/zhouyatingkol/echo-demo1.git
cd echo-demo

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，添加私钥
```

### 2. 合约开发流程

```bash
# 1. 编写合约（contracts/ 目录）
# 2. 编译合约
npm run compile

# 3. 本地测试
npx hardhat test

# 4. 部署到测试网
npm run deploy:testnet

# 5. 部署到主网
npx hardhat run scripts/deploy.js --network qitmeer

# 6. 验证合约
npx hardhat run scripts/verify.js --network qitmeer
```

### 3. 前端开发流程

```bash
# 1. 修改前端代码（frontend/ 或 pages/ 目录）

# 2. 本地预览
# 直接使用浏览器打开 HTML 文件
# 或使用 Live Server 等工具

# 3. 提交更改
git add .
git commit -m "feat(frontend): 添加新功能"

# 4. 推送到 GitHub
git push origin main

# 5. GitHub Pages 自动部署
```

### 4. Git 工作流

```bash
# 创建功能分支
git checkout -b feature/new-feature

# 开发完成后提交
git add .
git commit -m "feat: 添加新功能

- 功能描述 1
- 功能描述 2

Closes #123"

# 推送到远程
git push origin feature/new-feature

# 创建 Pull Request（通过 GitHub）
# 代码审查后合并到 main 分支
```

---

## 技术栈

### 区块链层
- **网络**: Qitmeer Network (Chain ID: 813)
- **合约语言**: Solidity ^0.8.19
- **开发框架**: Hardhat ^2.19.0
- **合约库**: OpenZeppelin Contracts ^4.9.0

### 前端层
- **HTML5/CSS3**: 语义化标签和现代化样式
- **JavaScript**: ES6+ 语法
- **Ethers.js**: 区块链交互库
- **CSS 变量**: 主题系统

### 工具链
- **版本控制**: Git
- **包管理**: npm
- **部署**: GitHub Actions → GitHub Pages
- **验证**: Hardhat Etherscan 插件

---

## 部署架构

```
┌─────────────────────────────────────────────┐
│              GitHub Pages                   │
│         (静态网站托管)                       │
│                   │                         │
│    ┌──────────────┼──────────────┐         │
│    ▼              ▼              ▼         │
│ ┌──────┐     ┌──────┐     ┌──────┐        │
│ │首页  │     │市场  │     │生成  │        │
│ └──────┘     └──────┘     └──────┘        │
└─────────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────────┐
│           Qitmeer Network                   │
│         (区块链网络)                         │
│                   │                         │
│    ┌──────────────┼──────────────┐         │
│    ▼              ▼              ▼         │
│ ┌────────┐   ┌────────┐   ┌────────┐      │
│ │ECHOAsset│   │License │   │ECHOFusion│      │
│ │ V2V3   │   │ NFT V3 │   │  V2    │      │
│ └────────┘   └────────┘   └────────┘      │
└─────────────────────────────────────────────┘
```

---

## 版本管理

### 合约版本

| 合约 | 当前版本 | 状态 |
|------|----------|------|
| ECHOAssetV2V3 | V3.0.0 | ✅ 生产环境 |
| LicenseNFTV3 | V3.0.0 | ✅ 生产环境 |
| ECHOFusionV2 | V2.0.0 | ✅ 生产环境 |

### 文档版本

| 文档 | 版本 | 最后更新 |
|------|------|----------|
| 项目结构 | 2.0 | 2026-03-14 |
| 快速开始 | 1.0 | 2026-03-14 |
| API 文档 | 1.0 | 2026-03-14 |

---

*文档版本: 2.0*  
*最后更新: 2026-03-14*
