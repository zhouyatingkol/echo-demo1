# ECHO Protocol 🌳

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Qitmeer](https://img.shields.io/badge/Powered%20by-Qitmeer-blue)](https://qitmeer.io)

> 保护创作者的数字权益 - 一个去中心化的音乐版权授权协议

## 📖 项目简介

ECHO Protocol 是一个构建在 Qitmeer 区块链上的去中心化音乐版权授权平台。它允许音乐创作者：

- 🎵 **铸造音乐资产** - 将作品上链，获得唯一数字身份
- 📜 **灵活授权** - 支持买断制、按次计费、限时授权三种模式
- 💰 **自动收益分配** - 智能合约自动执行版税分配
- 🔗 **AI 友好** - 为 AI 训练数据提供合法授权渠道

## 🚀 快速开始

### 环境要求

- Node.js v18+
- npm 或 yarn
- Qitmeer 钱包（推荐 [Qitmeer Mask](https://mask.qitmeer.io)）

### 安装

```bash
# 克隆项目
git clone https://github.com/zhouyatingkol/echo-demo1.git
cd echo-demo1

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
npm run deploy:mainnet
```

### 验证合约

```bash
npm run verify:mainnet
```

## 📁 项目结构

```
echo-demo/
├── contracts/              # 智能合约
│   ├── ECHOAssetV2V3.sol   # 资产合约 V3
│   ├── LicenseNFTV3.sol    # 授权 NFT 合约 V3
│   └── ECHOFusion.sol      # 资产融合合约
├── frontend/               # 前端代码
│   ├── js/
│   ├── css/
│   └── html/
├── scripts/                # 部署脚本
│   ├── deploy-v3-mainnet.js
│   └── verify.js
├── test/                   # 测试文件
├── docs/                   # 文档
└── hardhat.config.js       # Hardhat 配置
```

## 🔗 已部署合约（Qitmeer 主网）

| 合约 | 地址 | 状态 |
|------|------|------|
| **ECHOAssetV2V3** | `0xF98f63b7e8064Dcf9c2f25A906B2af89Af4840ce` | ✅ 已验证 |
| **ECHOFusion** | `0x31Cd483Ee827A272816808AD49b90c71B1c82E11` | ✅ 已验证 |
| **LicenseNFTV3** | `0x2f79b56047050FD2Ee7C62d2d0fe644c15c68e23` | ✅ 已验证 |

[查看区块浏览器](https://qng.qitmeer.io/)

## 🎨 核心功能

### 1. 三合一授权模式

```
┌──────────┐ ┌──────────┐ ┌──────────┐
│  买断制   │ │ 按次计费 │ │ 限时授权 │
│  🔑      │ │  📊     │ │  ⏱️    │
│ 永久使用 │ │ 用多少  │ │ 30天起 │
│ 100 MEER │ │ 0.5/次  │ │ 10/天  │
└──────────┘ └──────────┘ └──────────┘
```

### 2. 场景差异化定价

| 使用场景 | 倍率 | 说明 |
|---------|------|------|
| 个人创作 | ×1.0 | 个人视频、播客 |
| 游戏配乐 | ×1.5 | 游戏背景音乐 |
| AI 训练 | ×2.0 | 机器学习数据集 |
| 商业广告 | ×3.0 | 电视/网络广告 |

### 3. 许可 NFT

每个授权都会铸造一个 **许可 NFT**：
- ✅ 证明使用权
- ✅ 可转让交易
- ✅ 链上可验证

## 🔐 安全特性

- ✅ **ReentrancyGuard** - 防重入攻击
- ✅ **Pausable** - 紧急暂停功能
- ✅ **Access Control** - 精细化权限管理
- ✅ **Input Validation** - 输入验证
- ✅ **CEI Pattern** - Checks-Effects-Interactions 模式

## 🛠️ 技术栈

- **区块链**: Qitmeer Network (Chain ID: 813)
- **智能合约**: Solidity 0.8.19
- **开发框架**: Hardhat
- **合约库**: OpenZeppelin Contracts
- **前端**: HTML5, CSS3, JavaScript (ES6+)
- **钱包集成**: ethers.js

## 📝 使用指南

### 音乐创作者

1. 连接钱包
2. 铸造音乐资产（上传作品、设置权属蓝图）
3. 设置授权价格
4. 等待购买者购买
5. 自动获得 MEER 收益

### 购买者

1. 浏览市场，选择音乐
2. 选择授权类型（买断/按次/限时）
3. 选择使用场景
4. 支付 MEER
5. 获得 许可 NFT

### AI 开发者

1. 筛选支持 AI 训练的授权
2. 批量购买训练数据授权
3. 合法合规训练模型
4. 链上证明数据来源

## 🤝 贡献指南

我们欢迎所有贡献！请参阅 [CONTRIBUTING.md](./CONTRIBUTING.md) 了解如何参与。

## 📜 许可证

本项目采用 [MIT License](./LICENSE) 开源。

## 🌟 愿景

> ECHO 不只是一个协议，它是创作者对"公平对待"的信仰。
> 在这里，无论是碳基人类还是硅基 AI，都是平等的价值创造者。

## 📞 联系我们

- GitHub Issues: [提交问题](https://github.com/zhouyatingkol/echo-demo1/issues)
- Email: echo@qitmeer.io

---

**🌱 准备好种你的第一棵树了吗？**
