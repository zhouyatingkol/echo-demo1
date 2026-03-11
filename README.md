# ECHO Protocol Demo

ECHO Protocol 在 Qitmeer 网络上的演示项目。

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
- **Block Explorer**: https://testnet-qngexplorer.qitmeer.io

获取测试币：https://faucet.qitmeer.io

## Demo 功能

- ✅ 连接钱包 (MetaMask)
- ✅ 铸造 ECHO 资产
- ✅ 配置四权（使用权、衍生权、扩展权、收益权）
- ✅ 查看资产列表
- ✅ 查看四权分配

## 合约地址

部署后更新：

```
ECHOAsset: 0x...
```

## 项目结构

```
echo-demo/
├── contracts/
│   └── ECHOAsset.sol      # 智能合约
├── scripts/
│   └── deploy.js          # 部署脚本
├── frontend/
│   ├── index.html         # Demo页面
│   └── app.js             # 前端逻辑
├── hardhat.config.js      # Hardhat配置
└── package.json
```

## 下一步

1. 部署合约到 Qitmeer Testnet
2. 获取测试币
3. 运行前端Demo
4. 铸造第一个 ECHO 资产

## 许可证

MIT