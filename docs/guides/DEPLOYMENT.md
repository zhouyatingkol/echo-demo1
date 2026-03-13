# ECHO Protocol - 部署指南

本指南详细介绍 ECHO Protocol 的完整部署流程。

---

## 🚀 GitHub Pages 部署流程

### 前置条件

- GitHub 账号
- 项目已推送到 GitHub 仓库
- 仓库已启用 GitHub Pages

### 配置步骤

#### 1. 启用 GitHub Pages

1. 进入 GitHub 仓库页面
2. 点击 **Settings** → **Pages**
3. **Source** 选择 **Deploy from a branch**
4. **Branch** 选择 `main` / `root`
5. 点击 **Save**

#### 2. 添加 `.nojekyll` 文件

```bash
# 在项目根目录创建空文件
touch .nojekyll

# 提交到仓库
git add .nojekyll
git commit -m "chore: 禁用 Jekyll"
git push origin main
```

> 说明：`.nojekyll` 文件告诉 GitHub Pages 不使用 Jekyll 处理，允许以下划线开头的文件和文件夹。

#### 3. 配置路径

确保前端文件使用正确的相对路径：

```html
<!-- 错误：绝对路径 -->
<link rel="stylesheet" href="/frontend/css/theme.css">

<!-- 正确：相对路径 -->
<link rel="stylesheet" href="./frontend/css/theme.css">
<!-- 或 -->
<link rel="stylesheet" href="../frontend/css/theme.css">
```

#### 4. 自动部署

GitHub Pages 会自动部署 `main` 分支的最新代码。

部署完成后访问：
```
https://<username>.github.io/<repo-name>/
```

### 验证部署

1. 访问部署地址
2. 检查页面是否正常加载
3. 检查网络请求是否 200
4. 测试钱包连接功能

---

## 🔗 合约部署流程

### 环境准备

```bash
# 1. 确保已安装依赖
npm install

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env，填入私钥
```

### 测试网部署

#### 1. 获取测试币

1. 复制钱包地址（0x...）
2. 访问 Qitmeer 测试网水龙头
3. 粘贴地址，领取测试 MEER

#### 2. 编译合约

```bash
npm run compile
```

#### 3. 部署到测试网

```bash
npx hardhat run scripts/deploy.js --network qitmeerTestnet
```

#### 4. 记录合约地址

部署成功后，控制台会输出：
```
ECHOAssetV2V3 deployed to: 0x...
ECHOFusionV2 deployed to: 0x...
LicenseNFTV3 deployed to: 0x...
```

将地址更新到 `config/contracts.js`。

#### 5. 验证合约

```bash
# 生成扁平化合约
npx hardhat flatten contracts/ECHOAssetV2V3.sol > contracts/flattened/ECHOAssetV2V3_flat.sol

# 验证合约
npx hardhat verify --network qitmeerTestnet <address>
```

### 主网部署

#### 1. 准备主网 MEER

- 从交易所购买 MEER
- 提现到部署钱包
- 建议准备 5-10 MEER（包含 Gas 费用）

#### 2. 最终检查清单

- [ ] 合约已通过完整测试
- [ ] 测试网部署验证通过
- [ ] 代码已提交到 Git
- [ ] 私钥已安全保管
- [ ] 钱包有足够 MEER

#### 3. 部署到主网

```bash
# 部署合约
npx hardhat run scripts/deploy.js --network qitmeer

# 记录输出的合约地址
```

#### 4. 验证主网合约

```bash
# 验证 ECHOAssetV2V3
npx hardhat verify --network qitmeer \
  <ECHOAssetV2V3_ADDRESS>

# 验证 LicenseNFTV3
npx hardhat verify --network qitmeer \
  <LicenseNFTV3_ADDRESS>

# 验证 ECHOFusionV2
npx hardhat verify --network qitmeer \
  <ECHOFusionV2_ADDRESS>
```

#### 5. 更新配置

更新以下文件中的合约地址：
- `config/contracts.js`
- `frontend/js/config.js`
- `docs/guides/CONTRACT_INTERACTION.md`

---

## ⚙️ 环境变量配置

### 完整的 .env 配置

```env
# ============================================
# ⚠️  安全警告
# 永远不要提交包含真实私钥的 .env 文件到 Git！
# .env 已在 .gitignore 中被忽略
# ============================================

# ============================================
# 钱包配置（必需）
# ============================================

# 部署钱包私钥（包含 0x 前缀）
# ⚠️ 警告：使用专用部署钱包，不要使用存有大量资金的钱包
PRIVATE_KEY=0x...

# ============================================
# 网络配置（通常不需要修改）
# ============================================

# Qitmeer 主网 RPC
QITMEER_RPC_URL=https://qng.rpc.qitmeer.io

# Qitmeer 测试网 RPC
QITMEER_TESTNET_RPC_URL=https://testnet-qng.rpc.qitmeer.io

# 区块浏览器
QITMEER_EXPLORER_URL=https://qng.qitmeer.io
QITMEER_TESTNET_EXPLORER_URL=https://testnet-qng.qitmeer.io

# ============================================
# 可选配置
# ============================================

# 调试模式
debug=false

# 日志级别 (debug, info, warn, error)
LOG_LEVEL=info

# Gas 价格（留空使用自动估算）
# GAS_PRICE=20000000000

# Gas 限制（留空使用自动估算）
# GAS_LIMIT=3000000
```

### 不同环境的配置

#### 本地开发环境

```env
PRIVATE_KEY=0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80  # Hardhat 默认私钥
DEBUG=true
LOG_LEVEL=debug
```

#### 测试网环境

```env
PRIVATE_KEY=0x...  # 测试钱包私钥
DEBUG=true
LOG_LEVEL=info
```

#### 主网环境

```env
PRIVATE_KEY=0x...  # 生产钱包私钥（严格保密）
DEBUG=false
LOG_LEVEL=warn
```

---

## 🔍 常见问题排查

### GitHub Pages 问题

#### 问题 1：页面 404

**原因**：
- 路径配置错误
- 部署未完成
- 仓库未公开

**解决**：
```bash
# 1. 检查 .nojekyll 文件是否存在
ls -la .nojekyll

# 2. 检查路径是否正确
# 使用相对路径而非绝对路径

# 3. 等待 2-3 分钟后刷新
```

#### 问题 2：样式未加载

**原因**：路径使用了绝对路径 `/`

**解决**：
```html
<!-- 错误 -->
<link rel="stylesheet" href="/frontend/css/theme.css">

<!-- 正确 -->
<link rel="stylesheet" href="./frontend/css/theme.css">
```

#### 问题 3：JS 文件 404

**原因**：GitHub Pages 基础路径与项目路径不匹配

**解决**：
```javascript
// 使用相对路径加载脚本
const basePath = window.location.pathname.includes('echo-demo1') 
    ? '/echo-demo1' 
    : '';
    
script.src = `${basePath}/frontend/js/app.js`;
```

### 合约部署问题

#### 问题 1：`insufficient funds`

**原因**：钱包余额不足以支付 Gas

**解决**：
```bash
# 检查余额
npx hardhat console --network qitmeer
> await ethers.provider.getBalance('0xYourAddress')

# 充值 MEER 后重试
```

#### 问题 2：`nonce too low`

**原因**：交易 Nonce 冲突

**解决**：
```bash
# 等待一段时间后重试
# 或手动重置 MetaMask 账户（测试网）
```

#### 问题 3：`replacement fee too low`

**原因**：交易被替换但 Gas 费太低

**解决**：
```javascript
// 在部署脚本中增加 Gas 价格
const contract = await Contract.deploy({
    gasPrice: ethers.utils.parseUnits('50', 'gwei')
});
```

#### 问题 4：合约验证失败

**原因**：
- 代码不匹配
- 优化器设置不正确
- 编译器版本不匹配

**解决**：
```bash
# 1. 确保使用相同的编译设置
cat hardhat.config.js

# 2. 重新编译并部署
npx hardhat clean
npx hardhat compile

# 3. 使用扁平化合约验证
npx hardhat flatten contracts/ECHOAssetV2V3.sol > flat.sol
```

### 网络连接问题

#### 问题 1：MetaMask 无法连接

**解决**：
1. 检查网络配置是否正确
2. 尝试切换网络后重新连接
3. 清除浏览器缓存

#### 问题 2：RPC 连接超时

**解决**：
```bash
# 尝试备用 RPC
QITMEER_RPC_URL=https://rpc.qitmeer.io  # 备用节点
```

#### 问题 3：Chain ID 不匹配

**解决**：
- 主网 Chain ID: `813`
- 测试网 Chain ID: `8131`

```javascript
// 检查链 ID
const network = await provider.getNetwork();
console.log('Chain ID:', network.chainId);
```

### 前端问题

#### 问题 1：`ethers is not defined`

**原因**：ethers.js 未正确加载

**解决**：
```html
<!-- 确保在调用前加载 -->
<script src="https://cdn.ethers.io/lib/ethers-5.7.umd.min.js"></script>
<script>
    // 等待加载完成
    if (typeof ethers === 'undefined') {
        console.error('ethers.js 未加载');
    }
</script>
```

#### 问题 2：CORS 错误

**原因**：浏览器跨域限制

**解决**：
- 使用本地服务器（Live Server）
- 不要直接打开 HTML 文件

```bash
# 使用 Python 临时服务器
cd frontend
python3 -m http.server 8080
```

---

## 📋 部署检查清单

### 预部署检查

- [ ] 所有测试通过 (`npm test`)
- [ ] 合约已编译 (`npx hardhat compile`)
- [ ] 环境变量已配置 (.env)
- [ ] 私钥安全保管（未提交到 Git）
- [ ] 钱包有足够余额

### 部署中检查

- [ ] 记录所有合约地址
- [ ] 保存部署交易哈希
- [ ] 验证合约代码
- [ ] 测试合约功能

### 部署后检查

- [ ] 更新所有配置文件中的地址
- [ ] 更新文档中的地址
- [ ] GitHub Pages 正常访问
- [ ] 前端可以连接合约
- [ ] 钱包可以正常交互

---

## 🔄 更新部署

### 前端更新

```bash
# 1. 修改前端代码
# 2. 本地测试
# 3. 提交更改
git add .
git commit -m "feat(frontend): 更新功能"
git push origin main

# GitHub Pages 自动部署
```

### 合约更新

```bash
# 1. 修改合约代码
# 2. 重新编译
npx hardhat compile

# 3. 运行测试
npm test

# 4. 部署新版本
npx hardhat run scripts/deploy.js --network qitmeer

# 5. 更新前端配置
# 6. 通知用户迁移到新合约
```

---

## 🛡️ 安全建议

1. **私钥管理**
   - 使用专用部署钱包
   - 私钥绝不提交到 Git
   - 定期更换私钥

2. **合约部署**
   - 先在测试网充分测试
   - 部署前进行安全审计
   - 使用多签钱包管理权限

3. **前端安全**
   - 使用 HTTPS
   - 验证所有用户输入
   - 防止 XSS 攻击

---

*文档版本: 2.0*  
*最后更新: 2026-03-14*
