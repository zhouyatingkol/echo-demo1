# ECHO Web3 钱包功能测试指南

## 实现功能概述

### ✅ 已完成功能

1. **ethers.js v6 集成**
   - 通过 CDN 引入 ethers.js v6.10.0
   - 使用 BrowserProvider 替代旧版 Web3Provider
   - 完整的 BigInt 支持 (ethers v6 新特性)

2. **MetaMask 连接**
   - 真正的钱包连接与账户授权
   - 自动恢复连接（页面刷新后）
   - 账户变更监听与自动更新

3. **签名验证**
   - 基于 EIP-191 的个人消息签名
   - 服务端可验证的签名格式
   - 防重放攻击（含时间戳 nonce）

4. **余额查询**
   - 实时获取 ETH 余额
   - 格式化显示（自适应小数位）
   - 手动刷新功能

5. **网络管理**
   - 自动检测当前网络
   - 支持主网/Sepolia/Goerli 切换
   - 未添加网络的自动提示

6. **ECHO 风格错误处理**
   - 优雅的 Toast 提示组件
   - 诗意的中文错误文案
   - 分级显示（成功/警告/错误/信息）

---

## 测试环境准备

### 方式一：安装 MetaMask（推荐）

1. **安装插件**
   - Chrome/Edge: [MetaMask 扩展商店](https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn)
   - Firefox: [MetaMask 附加组件](https://addons.mozilla.org/en-US/firefox/addon/ether-metamask/)

2. **创建/导入钱包**
   - 首次使用：创建新钱包，保存助记词
   - 已有钱包：使用助记词或私钥导入

3. **获取测试币**
   - 切换到 Sepolia 测试网
   - 访问 [Sepolia Faucet](https://sepoliafaucet.com/) 或 [Alchemy Faucet](https://sepoliafaucet.com/)
   - 输入钱包地址，获取免费测试 ETH

### 方式二：使用模拟环境（开发调试）

```javascript
// 在控制台模拟钱包环境
window.ethereum = {
    isMetaMask: true,
    request: async ({ method, params }) => {
        if (method === 'eth_requestAccounts') {
            return ['0x1234567890123456789012345678901234567890'];
        }
        if (method === 'eth_chainId') {
            return '0xaa36a7'; // Sepolia
        }
        if (method === 'eth_getBalance') {
            return '0x1b1ae4d6e2ef500000'; // 500 ETH in hex
        }
    },
    on: () => {}
};
```

---

## 测试步骤

### 测试 1：基础连接流程

**场景**：首次访问，连接 MetaMask

| 步骤 | 操作 | 预期结果 |
|-----|------|---------|
| 1 | 打开 `login.html` | 显示「入」页面，钱包按钮可用 |
| 2 | 点击 MetaMask 按钮 | 弹出 MetaMask 授权窗口 |
| 3 | 在 MetaMask 中确认 | 显示「已入此境」Toast，跳转 profile.html |
| 4 | 查看 profile.html | 显示真实钱包地址、余额、网络 |

**ECHO 风格验证点**：
- [ ] 连接成功提示：「已入此境」+ 简短地址
- [ ] 地址显示格式：`0x1234...5678`
- [ ] 余额显示格式：`X.XXXX ETH`

---

### 测试 2：错误处理场景

#### 2.1 未安装钱包

| 步骤 | 操作 | 预期结果 |
|-----|------|---------|
| 1 | 在无痕模式打开页面（无 MetaMask） | 点击连接按钮 |
| 2 | 观察提示 | 显示「未寻得链上之钥」Toast |
| 3 | 点击「前往安装」 | 新标签页打开 metamask.io |

**文案验证**：
```
标题：未寻得链上之钥
内容：请先安装 MetaMask，开启 Web3 之门
操作：前往安装
```

#### 2.2 用户拒绝连接

| 步骤 | 操作 | 预期结果 |
|-----|------|---------|
| 1 | 点击连接按钮 | MetaMask 弹出授权窗口 |
| 2 | 点击「取消」 | 关闭授权窗口 |
| 3 | 观察提示 | 显示「入链已拒」Toast |

**文案验证**：
```
标题：入链已拒
内容：您拒绝了连接请求，自主权在你
```

#### 2.3 签名验证取消

| 步骤 | 操作 | 预期结果 |
|-----|------|---------|
| 1 | 在 profile.html 点击「签名验证」 | MetaMask 弹出签名窗口 |
| 2 | 点击「取消」 | 关闭签名窗口 |
| 3 | 观察提示 | 显示「印未落」Toast |

**文案验证**：
```
标题：印未落
内容：您取消了签名，验证未竟
```

---

### 测试 3：签名验证功能

| 步骤 | 操作 | 预期结果 |
|-----|------|---------|
| 1 | 确保已连接钱包 | 在 profile.html |
| 2 | 点击「签名验证」按钮 | 显示「待君落印」Toast |
| 3 | 在 MetaMask 中签名 | 显示「印鉴已合」Toast |
| 4 | 查看验证状态 | 显示「◉ 已验证」（绿色） |

**技术验证**：
```javascript
// 在控制台验证签名
const state = EchoWallet.getState();
console.log('Signature:', state.signature);
console.log('Is Verified:', state.isVerified);

// 手动验证签名
const message = 'ECHO\n\n由此而入，皆可生长\n\n签名验证您的身份\nNonce: ' + Date.now();
const recovered = ethers.verifyMessage(message, state.signature);
console.log('Recovered address:', recovered);
console.log('Matches:', recovered.toLowerCase() === state.address.toLowerCase());
```

---

### 测试 4：网络切换

| 步骤 | 操作 | 预期结果 |
|-----|------|---------|
| 1 | 查看当前网络 | 卡片顶部显示「Ethereum Mainnet」或「Sepolia Testnet」 |
| 2 | 点击「Sepolia」网络芯片 | MetaMask 弹出切换确认 |
| 3 | 在 MetaMask 中确认 | 显示「换境」Toast，网络名称更新 |
| 4 | 查看余额 | 余额更新为新网络的余额 |

**网络支持列表**：
- 主网 (Chain ID: 1)
- Sepolia 测试网 (Chain ID: 11155111)
- Goerli 测试网 (Chain ID: 5)

---

### 测试 5：账户变更监听

| 步骤 | 操作 | 预期结果 |
|-----|------|---------|
| 1 | 确保已连接钱包 A | profile.html 显示地址 A |
| 2 | 在 MetaMask 中切换账户 B | 显示「换了新印」Toast |
| 3 | 查看页面 | 地址更新为 B，验证状态重置为「未验证」 |

---

### 测试 6：断开连接

| 步骤 | 操作 | 预期结果 |
|-----|------|---------|
| 1 | 在 profile.html 点击「断开连接」 | 显示「已离此境」Toast |
| 2 | 等待 1.5 秒 | 自动跳转回 index.html |
| 3 | 尝试访问 profile.html | 自动重定向到 login.html |

---

### 测试 7：余额刷新

| 步骤 | 操作 | 预期结果 |
|-----|------|---------|
| 1 | 记录当前余额 | 假设为 1.0000 ETH |
| 2 | 在 faucet 获取测试币 | Sepolia Faucet 发送 0.5 ETH |
| 3 | 点击「刷新余额」按钮 | 显示「余额已更」Toast |
| 4 | 查看新余额 | 更新为 1.5000 ETH |

---

### 测试 8：页面刷新持久化

| 步骤 | 操作 | 预期结果 |
|-----|------|---------|
| 1 | 连接钱包后刷新页面 | 自动恢复连接状态 |
| 2 | 检查地址显示 | 仍显示原地址 |
| 3 | 检查验证状态 | 保留已验证/未验证状态 |

---

## API 参考

### EchoWallet 公共方法

```javascript
// 连接钱包
const result = await EchoWallet.connect();
// { success: true, address: '0x...', chainId: 11155111, balance: { eth: '1.2345', wei: '...' } }

// 断开连接
await EchoWallet.disconnect();

// 签名验证
const verifyResult = await EchoWallet.verify();
// { success: true, signature: '0x...' }

// 刷新余额
const balance = await EchoWallet.refreshBalance();

// 切换网络
await EchoWallet.switchNetwork(11155111); // Sepolia

// 获取状态
const state = EchoWallet.getState();
// { isConnected, address, chainId, networkName, balance, isVerified, ... }

// 状态查询
EchoWallet.isConnected();  // boolean
EchoWallet.isVerified();   // boolean
EchoWallet.getAddress();   // string | null
EchoWallet.getBalance();   // { wei, eth, formatted } | null

// 工具函数
EchoWallet.formatAddress('0x1234567890abcdef...'); // '0x1234...cdef'
EchoWallet.getExplorerUrl('address', '0x...');      // 'https://sepolia.etherscan.io/address/0x...'

// 显示自定义 Toast
EchoWallet.showToast({
    title: '自定义标题',
    message: '自定义消息',
    type: 'success', // success | warning | error | info
    duration: 4000   // 毫秒，0 为不自动关闭
});

// 事件监听
EchoWallet.on('walletConnected', ({ address, chainId, balance }) => {
    console.log('Connected:', address);
});

EchoWallet.on('walletDisconnected', () => {
    console.log('Disconnected');
});

EchoWallet.on('walletVerified', ({ address, signature }) => {
    console.log('Verified:', address, signature);
});

EchoWallet.on('balanceUpdated', ({ balance }) => {
    console.log('New balance:', balance.eth);
});
```

---

## 常见问题排查

### Q: 连接按钮点击无反应
**排查**：
1. 检查控制台是否有 ethers.js 加载错误
2. 确认 `window.ethereum` 是否存在
3. 检查 wallet-manager.js 是否正确加载

### Q: 余额显示为 "-- ETH"
**排查**：
1. 检查网络连接
2. 确认 RPC 节点可访问
3. 查看控制台是否有 CORS 错误

### Q: 签名验证失败
**排查**：
1. 确认地址格式正确
2. 检查 ethers.js 是否正确加载
3. 验证 `ethers.verifyMessage` 是否可用

### Q: 网络切换无响应
**排查**：
1. 确认目标网络配置存在
2. 检查 MetaMask 是否已解锁
3. 查看控制台错误信息

---

## 安全注意事项

1. **私钥安全**
   - 永远不要在前端代码中硬编码私钥
   - 不要通过 `localStorage` 存储敏感信息
   - 本实现仅存储公开信息（地址、链ID等）

2. **签名安全**
   - 签名消息包含时间戳 nonce，防止重放攻击
   - 服务端验证时需检查 nonce 时效性
   - 建议在服务端存储已使用的 nonce

3. **网络钓鱼防护**
   - 始终通过官方渠道安装 MetaMask
   - 确认连接的网站域名正确
   - 仔细审查每笔交易的详细信息

---

## 后续优化建议

1. **多钱包支持**
   - WalletConnect v2 集成
   - Coinbase Wallet
   - Phantom（多链支持）

2. **高级功能**
   - ENS 域名解析
   - 代币余额查询（ERC-20）
   - NFT 持仓显示（ERC-721/1155）

3. **性能优化**
   - 余额查询添加缓存机制
   - WebSocket 监听替代轮询
   - 批量 RPC 请求

4. **移动端适配**
   - MetaMask Mobile 深度链接
   - WalletConnect 二维码扫描
   - 响应式布局优化
