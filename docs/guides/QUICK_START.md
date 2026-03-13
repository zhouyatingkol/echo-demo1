# ECHO Protocol - 快速开始指南

本指南将帮助您在 5 分钟内启动 ECHO Protocol 项目。

---

## 📋 前置要求

在开始之前，请确保您的环境满足以下条件：

| 工具 | 版本要求 | 用途 |
|------|----------|------|
| [Node.js](https://nodejs.org/) | v18+ | 运行 JavaScript 工具 |
| [npm](https://www.npmjs.com/) | v9+ | 包管理器 |
| [Git](https://git-scm.com/) | v2.30+ | 版本控制 |
| [MetaMask](https://metamask.io/) | 最新版 | 区块链钱包 |

### 检查环境

```bash
# 检查 Node.js 版本
node --version
# 应显示 v18.x.x 或更高

# 检查 npm 版本
npm --version
# 应显示 9.x.x 或更高

# 检查 Git 版本
git --version
```

---

## 🚀 克隆项目

```bash
# 克隆代码仓库
git clone https://github.com/zhouyatingkol/echo-demo1.git

# 进入项目目录
cd echo-demo1/echo-demo

# 查看项目结构
ls -la
```

---

## 📦 安装依赖

```bash
# 安装项目依赖
npm install

# 安装过程可能需要 2-5 分钟，取决于网络速度
```

### 主要依赖说明

| 包名 | 用途 |
|------|------|
| `hardhat` | 智能合约开发框架 |
| `@nomicfoundation/hardhat-toolbox` | Hardhat 工具集 |
| `@openzeppelin/contracts` | 安全合约库 |
| `ethers` | 区块链交互库 |
| `dotenv` | 环境变量管理 |

---

## ⚙️ 环境变量配置

### 1. 复制示例文件

```bash
cp .env.example .env
```

### 2. 编辑 .env 文件

```bash
# 使用您喜欢的编辑器
nano .env
# 或
vim .env
# 或直接在 VS Code 中编辑
```

### 3. 配置说明

```env
# ============================================
# ⚠️  安全警告
# 永远不要提交包含真实私钥的 .env 文件到 Git！
# .env 已在 .gitignore 中被忽略
# ============================================

# 部署钱包私钥（包含 0x 前缀）
# 示例: 0x1234567890abcdef...
# ⚠️ 警告：请使用测试钱包，不要使用存有大量资金的钱包
PRIVATE_KEY=your_private_key_here

# Qitmeer 主网 RPC（通常不需要修改）
QITMEER_RPC_URL=https://qng.rpc.qitmeer.io

# Qitmeer 测试网 RPC
QITMEER_TESTNET_RPC_URL=https://testnet-qng.rpc.qitmeer.io

# 区块浏览器
QITMEER_EXPLORER_URL=https://qng.qitmeer.io

# 可选: 调试模式
DEBUG=false

# 可选: 日志级别 (debug, info, warn, error)
LOG_LEVEL=info
```

### 4. 获取私钥（MetaMask）

1. 打开 MetaMask 扩展
2. 点击账户头像 → 账户详情
3. 点击"导出私钥"
4. 输入密码，复制私钥（包含 0x 前缀）
5. 将私钥粘贴到 .env 文件的 `PRIVATE_KEY` 字段

---

## 🔧 本地开发启动

### 方式一：仅前端开发（推荐初学者）

如果只需要修改前端页面，无需启动区块链节点：

```bash
# 1. 使用 VS Code 的 Live Server 插件
# 安装插件后右键点击 frontend/index.html → "Open with Live Server"

# 2. 或使用 Python 临时服务器
cd frontend
python3 -m http.server 8080
# 然后访问 http://localhost:8080

# 3. 或使用 Node.js 的 http-server
npx http-server frontend -p 8080
```

### 方式二：完整开发环境（包含本地区块链）

```bash
# 1. 启动本地 Hardhat 节点
npx hardhat node

# 2. 在新的终端窗口部署合约到本地节点
npx hardhat run scripts/deploy.js --network localhost

# 3. 记录输出的合约地址，更新 config/contracts.js

# 4. 启动前端（使用本地合约地址）
```

### 方式三：连接测试网

```bash
# 1. 确保 .env 中配置了测试网私钥

# 2. 部署合约到测试网
npx hardhat run scripts/deploy.js --network qitmeerTestnet

# 3. 验证合约
npx hardhat run scripts/verify.js --network qitmeerTestnet
```

---

## 📝 开发工作流程

### 合约开发

```bash
# 1. 编写/修改合约（contracts/ 目录）

# 2. 编译合约
npm run compile

# 3. 运行测试
npm test

# 4. 部署（本地）
npx hardhat run scripts/deploy.js --network localhost

# 5. 部署（测试网）
npx hardhat run scripts/deploy.js --network qitmeerTestnet
```

### 前端开发

```bash
# 1. 修改前端代码（frontend/ 或 pages/ 目录）

# 2. 在浏览器中刷新查看效果

# 3. 提交更改
git add .
git commit -m "feat(frontend): 描述更改内容"

# 4. 推送到 GitHub
git push origin main
```

---

## 🧪 测试流程

### 运行所有测试

```bash
npm test
```

### 运行特定测试文件

```bash
# 安全测试
npx hardhat test test/security-test.js

# 集成测试
npx hardhat test test/integration-test.js
```

### 生成覆盖率报告

```bash
npx hardhat coverage
```

---

## 🔗 配置 MetaMask

### 添加 Qitmeer 主网

1. 打开 MetaMask
2. 点击网络选择器 → 添加网络
3. 填写以下信息：

```
网络名称: Qitmeer Mainnet
RPC URL: https://qng.rpc.qitmeer.io
链 ID: 813
货币符号: MEER
区块浏览器: https://qng.qitmeer.io
```

### 添加 Qitmeer 测试网

```
网络名称: Qitmeer Testnet
RPC URL: https://testnet-qng.rpc.qitmeer.io
链 ID: 8131
货币符号: MEER
区块浏览器: https://testnet-qng.qitmeer.io
```

---

## 💰 获取测试币

### 测试网水龙头

1. 复制您的钱包地址（0x...）
2. 访问 Qitmeer 测试网水龙头
3. 粘贴地址，领取测试 MEER

### 主网 MEER

- 从支持 MEER 的交易所购买
- 提现到您的 MetaMask 钱包

---

## 🐛 常见问题排查

### 问题 1: `npm install` 失败

```bash
# 清除缓存后重试
npm cache clean --force
rm -rf node_modules
npm install
```

### 问题 2: 编译合约失败

```bash
# 确保 Solidity 版本正确
cat hardhat.config.js | grep solidity

# 清除编译缓存
npx hardhat clean
npx hardhat compile
```

### 问题 3: 部署失败 - "insufficient funds"

- 检查钱包是否有足够的 MEER 支付 Gas
- 如果是测试网，领取测试币
- 如果是主网，购买 MEER

### 问题 4: MetaMask 无法连接

- 检查是否已添加正确的网络配置
- 确保使用的是正确的链 ID（主网 813，测试网 8131）
- 尝试刷新页面或重新连接钱包

### 问题 5: 合约验证失败

```bash
# 确保使用扁平化合约
npx hardhat flatten contracts/ECHOAssetV2V3.sol > contracts/flattened/ECHOAssetV2V3_flat.sol

# 然后使用扁平化文件验证
```

---

## 📚 下一步

完成快速开始后，您可以：

1. **阅读 [API 文档](../API.md)** - 了解合约接口
2. **阅读 [前端开发指南](./FRONTEND_DEVELOPMENT.md)** - 学习页面开发
3. **阅读 [合约交互文档](./CONTRACT_INTERACTION.md)** - 学习合约调用
4. **阅读 [部署指南](./DEPLOYMENT.md)** - 了解完整部署流程

---

## 🆘 获取帮助

如果您遇到问题：

1. 查看 [GitHub Issues](https://github.com/zhouyatingkol/echo-demo1/issues)
2. 提交新的 Issue，包含：
   - 问题描述
   - 复现步骤
   - 错误日志
   - 环境信息（Node.js 版本、操作系统等）

---

## ✅ 检查清单

启动开发环境前，请确认：

- [ ] Node.js v18+ 已安装
- [ ] 项目已克隆到本地
- [ ] `npm install` 成功完成
- [ ] `.env` 文件已配置
- [ ] MetaMask 已安装并配置
- [ ] 钱包有足够的 MEER（测试网或主网）
- [ ] 可以成功编译合约
- [ ] 前端页面可以正常访问

---

*文档版本: 1.0*  
*最后更新: 2026-03-14*
