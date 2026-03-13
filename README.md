# ECHO Protocol 🌳

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Qitmeer](https://img.shields.io/badge/Powered%20by-Qitmeer-blue)](https://qitmeer.io)
[![GitHub Pages](https://img.shields.io/badge/Hosted%20on-GitHub%20Pages-brightgreen)](https://zhouyatingkol.github.io/echo-demo1/)

> 保护创作者的数字权益 - 一个去中心化的音乐版权授权协议

## 📖 项目简介

ECHO Protocol 是一个构建在 Qitmeer 区块链上的去中心化音乐版权授权平台。它允许音乐创作者将作品上链，获得唯一数字身份，并通过智能合约实现灵活的授权管理和自动收益分配。

### 核心理念

- 🎵 **创作者优先** - 保护创作者权益，确保公平收益
- 🔗 **区块链透明** - 所有授权记录公开可查
- 🤖 **AI 友好** - 为 AI 训练数据提供合法授权渠道
- 🌱 **生态共建** - 创作者、用户、开发者共同成长

---

## ✨ 核心特性

### 1. 三合一授权模式

```
┌──────────┐ ┌──────────┐ ┌──────────┐
│  买断制   │ │ 按次计费 │ │ 限时授权 │
│  🔑      │ │  📊     │ │  ⏱️    │
│ 永久使用 │ │ 用多少  │ │ 30天起 │
│ 100 MEER │ │ 0.5/次  │ │ 10/天  │
└──────────┘ └──────────┘ └──────────┘
```

### 2. 四权分离架构

| 权利 | 说明 | 可独立转让 |
|------|------|------------|
| **使用权** | 使用资产的权利 | ✅ |
| **衍生权** | 基于资产创作新作品的权利 | ✅ |
| **扩展权** | 扩展资产功能的权利 | ✅ |
| **收益权** | 获得资产收益的权利 | ✅ |

### 3. 场景差异化定价

| 使用场景 | 倍率 | 说明 |
|---------|------|------|
| 个人创作 | ×1.0 | 个人视频、播客 |
| 游戏配乐 | ×1.5 | 游戏背景音乐 |
| AI 训练 | ×2.0 | 机器学习数据集 |
| 商业广告 | ×3.0 | 电视/网络广告 |

### 4. 资产融合（Fusion）

- 将多个资产融合成"树"结构
- 收益按权重自动分配
- 支持复杂的版权组合场景

---

## 🚀 快速开始

### 环境要求

- Node.js v18+
- npm 或 yarn
- [MetaMask](https://metamask.io/) 钱包

### 安装

```bash
# 克隆项目
git clone https://github.com/zhouyatingkol/echo-demo1.git
cd echo-demo1/echo-demo

# 安装依赖
npm install

# 配置环境变量
cp .env.example .env
# 编辑 .env 文件，添加你的私钥
```

### 编译合约

```bash
npm run compile
```

### 部署合约（测试网）

```bash
npm run deploy:testnet
```

### 部署合约（主网）

```bash
npx hardhat run scripts/deploy.js --network qitmeer
```

### 验证合约

```bash
npx hardhat run scripts/verify.js --network qitmeer
```

📚 **详细教程请查看 [快速开始指南](./docs/guides/QUICK_START.md)**

---

## 📁 项目结构

```
echo-demo/
├── contracts/          # 智能合约源码
│   ├── ECHOAssetV2V3.sol   # 资产合约 V3
│   ├── LicenseNFTV3.sol    # 授权 NFT 合约 V3
│   └── ECHOFusionV2.sol    # 资产融合合约 V2
│
├── frontend/           # 前端代码
│   ├── components/     # UI 组件
│   ├── css/            # 样式文件
│   ├── js/             # JavaScript 脚本
│   └── *.html          # 页面文件
│
├── pages/              # 页面目录
│   ├── index.html      # 首页
│   ├── market/         # 市场页面
│   └── creator/        # 创作者页面
│
├── docs/               # 文档
│   ├── architecture/   # 架构文档
│   ├── guides/         # 使用指南
│   └── API.md          # API 文档
│
├── scripts/            # 部署脚本
│   ├── deploy.js
│   └── verify.js
│
├── test/               # 测试文件
├── hardhat.config.js   # Hardhat 配置
└── README.md           # 项目说明
```

---

## 🔗 已部署合约（Qitmeer 主网）

| 合约 | 地址 | 状态 |
|------|------|------|
| **ECHOAssetV2V3** | `0xF98f63b7e8064Dcf9c2f25A906B2af89Af4840ce` | ✅ 已验证 |
| **ECHOFusionV2** | `0x8Eb7a29C41478a3f32015C1330DFf7cc683d0952` | ✅ 已验证 |
| **LicenseNFTV3** | `0x2f79b56047050FD2Ee7C62d2d0fe644c15c68e23` | ✅ 已验证 |

**区块浏览器**: https://qng.qitmeer.io

**前端访问**: https://zhouyatingkol.github.io/echo-demo1/

---

## 📚 文档

| 文档 | 说明 |
|------|------|
| [快速开始](./docs/guides/QUICK_START.md) | 5 分钟启动教程 |
| [项目结构](./docs/architecture/project-structure.md) | 目录结构和开发规范 |
| [合约交互](./docs/guides/CONTRACT_INTERACTION.md) | 合约调用指南 |
| [前端开发](./docs/guides/FRONTEND_DEVELOPMENT.md) | 前端开发规范 |
| [部署指南](./docs/guides/DEPLOYMENT.md) | 完整部署流程 |
| [API 文档](./docs/API.md) | 合约 API 参考 |
| [贡献指南](./docs/guides/CONTRIBUTING.md) | 如何参与贡献 |

---

## 🛠️ 技术栈

### 区块链层
- **网络**: [Qitmeer Network](https://qitmeer.io) (Chain ID: 813)
- **合约语言**: Solidity ^0.8.19
- **开发框架**: Hardhat ^2.19.0
- **合约库**: OpenZeppelin Contracts ^4.9.0

### 前端层
- **HTML5/CSS3**: 语义化标签和现代化样式
- **JavaScript**: ES6+ 语法
- **Ethers.js**: 区块链交互库
- **CSS 变量**: 主题系统（暗黑/明亮模式）

### 工具链
- **版本控制**: Git
- **包管理**: npm
- **部署**: GitHub Actions → GitHub Pages
- **验证**: Hardhat Etherscan 插件

---

## 📝 使用指南

### 音乐创作者

1. 连接钱包访问 [生成页面](https://zhouyatingkol.github.io/echo-demo1/pages/creator/)
2. 上传作品，设置权属蓝图
3. 配置授权价格和四权所有者
4. 等待购买者购买
5. 自动获得 MEER 收益

### 购买者

1. 浏览 [市场](https://zhouyatingkol.github.io/echo-demo1/pages/market/) 选择音乐
2. 选择授权类型（买断/按次/限时）
3. 选择使用场景
4. 支付 MEER
5. 获得 License NFT 作为使用凭证

### AI 开发者

1. 筛选支持 AI 训练的授权
2. 批量购买训练数据授权
3. 合法合规训练模型
4. 链上证明数据来源

---

## 🔐 安全特性

- ✅ **ReentrancyGuard** - 防重入攻击
- ✅ **Pausable** - 紧急暂停功能
- ✅ **Access Control** - 精细化权限管理
- ✅ **Input Validation** - 输入验证
- ✅ **CEI Pattern** - Checks-Effects-Interactions 模式

---

## 🤝 贡献指南

我们欢迎所有形式的贡献！

```bash
# 1. Fork 项目
# 2. 克隆您的 fork
git clone https://github.com/YOUR_USERNAME/echo-demo1.git

# 3. 创建功能分支
git checkout -b feature/your-feature

# 4. 提交更改
git commit -m "feat: 添加新功能"

# 5. 推送到您的 fork
git push origin feature/your-feature

# 6. 提交 Pull Request
```

📚 详细贡献指南请查看 [CONTRIBUTING.md](./docs/guides/CONTRIBUTING.md)

---

## 📜 许可证

本项目采用 [MIT License](./LICENSE) 开源。

---

## 🌟 愿景

> ECHO 不只是一个协议，它是创作者对"公平对待"的信仰。
> 在这里，无论是碳基人类还是硅基 AI，都是平等的价值创造者。

## 📞 联系我们

- GitHub Issues: [提交问题](https://github.com/zhouyatingkol/echo-demo1/issues)

---

**🌱 准备好种你的第一棵树了吗？**
