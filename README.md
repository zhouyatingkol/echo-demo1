# ECHO Protocol Demo

ECHO Protocol 在 Qitmeer 网络上的演示项目。

## 🆕 V2 版本已发布！

**V2 合约地址**: `0x319148d9b9265D75858c508E445d65B649036f75`

### V2 新增功能
- ✅ **权属蓝图** - 详细的使用条款配置
- ✅ **版本控制** - 资产内容可更新，历史可追溯
- ✅ **内容验证** - 链上哈希防篡改验证
- ✅ **衍生作品** - 自动收益分润给父资产

[V2 快速上手指南](./USER_GUIDE_V2.md) | [V2 测试报告](./TEST_REPORT_V2.md)

---

## 什么是 ECHO 资产？

ECHO 资产是一种**四权分离**的数字资产：

| 权利 | 说明 |
|-----|------|
| **使用权** | 使用资产的权利 |
| **衍生权** | 基于资产创建新作品的权利 |
| **扩展权** | 扩展资产功能的权利 |
| **收益权** | 获得资产收益的权利 |

传统 NFT：所有权 = 使用权 + 收益权（捆绑）
ECHO 资产：四种权利可独立流转

## 技术栈

- **区块链**: Qitmeer Network (MeerEVM 兼容)
- **智能合约**: Solidity + OpenZeppelin
- **前端**: HTML + ethers.js
- **开发工具**: Hardhat

## 快速开始

### 1. 安装依赖

```bash
cd echo-demo
npm install
```

### 2. 编译合约

```bash
npm run compile
```

### 3. 配置环境变量

创建 `.env` 文件：

```
PRIVATE_KEY=你的私钥
```

### 4. 部署合约

```bash
npm run deploy:testnet
```

### 5. 运行前端

直接用浏览器打开 `frontend/index.html`，或使用本地服务器：

```bash
cd frontend
python3 -m http.server 8080
```

访问 http://localhost:8080

## Qitmeer Testnet 配置

- **Network Name**: Qitmeer Testnet
- **RPC URL**: https://testnet-qng.rpc.qitmeer.io
- **Chain ID**: 8131
- **Currency Symbol**: MEER
- **Block Explorer**: https://testnet-qng.qitmeer.io

获取测试币：https://faucet.qitmeer.io

## Demo 功能

- ✅ 连接钱包 (MetaMask)
- ✅ 铸造 ECHO 资产
- ✅ 配置四权（使用权、衍生权、扩展权、收益权）
- ✅ 查看资产列表
- ✅ 查看四权分配

## 合约地址

### V2 合约（最新）
```
ECHOAssetV2: 0x319148d9b9265D75858c508E445d65B649036f75
区块浏览器: https://qng.qitmeer.io/address/0x319148d9b9265D75858c508E445d65B649036f75
```

### V1 合约（旧版）
```
ECHOAsset: 0xCFAa24a24f6E6C408b38E95EB3adCbd259a395e0
ECHOFusion: 0x9C99CB51495Ce85FEa1C5E7d5dFb68F6F1e6F45f
```

## 项目结构

```
echo-demo/
├── contracts/
│   ├── ECHOAsset.sol        # V1 智能合约
│   ├── ECHOFusion.sol       # V1 融合合约
│   └── ECHOAssetV2.sol      # V2 智能合约 ⭐
├── scripts/
│   ├── deploy.js            # V1 部署脚本
│   └── deploy-v2.js         # V2 部署脚本 ⭐
├── frontend/
│   ├── index.html           # 主页面
│   ├── app.js               # V1 前端逻辑
│   ├── mint-v2.html         # V2 铸造界面 ⭐
│   ├── version-control.html # 版本控制 ⭐
│   ├── content-verification.html # 内容验证 ⭐
│   ├── derivative-works.html# 衍生作品 ⭐
│   └── js/
│       └── echo-asset-v2.js # V2 合约交互 ⭐
├── hardhat.config.js
├── README.md
├── USER_GUIDE_V2.md         # V2 用户指南 ⭐
└── TEST_REPORT_V2.md        # V2 测试报告 ⭐
```

## 快速访问

直接访问 Demo: https://zhouyatingkol.github.io/echo-demo1/frontend/

## 下一步

1. 部署合约到 Qitmeer Testnet
2. 获取测试币
3. 运行前端Demo
4. 铸造第一个 ECHO 资产

## 许可证

MIT