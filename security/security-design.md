# ECHO Protocol V4 - 安全设计方案

## 🔒 安全概览

ECHO Protocol 处理真实的加密货币交易，安全是最高优先级。

---

## 🛡️ 安全架构层次

```
┌─────────────────────────────────────────┐
│           用户层安全                      │
│  - 钱包安全、操作确认、权限管理            │
├─────────────────────────────────────────┤
│           应用层安全                      │
│  - 输入验证、XSS防护、CSRF防护             │
├─────────────────────────────────────────┤
│           合约层安全                      │
│  - 地址验证、交易确认、重试机制             │
├─────────────────────────────────────────┤
│           数据层安全                      │
│  - 敏感数据保护、本地存储安全               │
└─────────────────────────────────────────┘
```

---

## 1. 用户层安全

### 1.1 钱包安全

**连接确认**
```typescript
// 连接前显示确认弹窗
const connectWallet = async () => {
  const confirmed = await showConfirmDialog({
    title: '连接钱包',
    content: 'ECHO Protocol 将连接您的 MetaMask 钱包，确认继续？',
    confirmText: '连接',
    cancelText: '取消'
  });
  
  if (!confirmed) return;
  
  // 执行连接
  await wallet.connect();
};
```

**网络切换提醒**
```typescript
// 检查网络，错误时提示切换
const checkNetwork = async () => {
  const chainId = await wallet.getChainId();
  
  if (chainId !== QITMEER_CHAIN_ID) {
    showErrorToast(`请切换到 Qitmeer 主网 (Chain ID: ${QITMEER_CHAIN_ID})`);
    
    // 提供一键切换按钮
    return {
      canProceed: false,
      action: 'switchNetwork',
      targetChain: QITMEER_CHAIN_ID
    };
  }
  
  return { canProceed: true };
};
```

**异常交易警告**
```typescript
// 大额交易警告阈值
const HIGH_VALUE_THRESHOLD = ethers.parseEther('1000'); // 1000 MEER

const checkHighValueTransaction = (value: bigint) => {
  if (value > HIGH_VALUE_THRESHOLD) {
    return showConfirmDialog({
      title: '⚠️ 大额交易警告',
      content: `您即将进行 ${ethers.formatEther(value)} MEER 的大额交易，请确认：\n\n1. 合约地址正确\n2. 交易金额正确\n3. 收款方正确`,
      danger: true,
      confirmText: '我已确认，继续',
      requireCheckbox: true,
      checkboxText: '我已仔细检查所有信息'
    });
  }
  
  return Promise.resolve(true);
};
```

### 1.2 敏感操作二次确认

**需要二次确认的操作**
- 购买 License (金额 > 100 MEER)
- 铸造资产
- 收益提现
- 授权转让

```typescript
const SENSITIVE_OPERATIONS = [
  'purchaseLicense',
  'mintAsset',
  'withdrawRevenue',
  'transferLicense'
];

const handleSensitiveOperation = async (operation: string, params: any) => {
  // 1. 验证操作类型
  if (!SENSITIVE_OPERATIONS.includes(operation)) {
    throw new Error('Unknown operation');
  }
  
  // 2. 显示确认弹窗
  const confirmed = await showSensitiveOperationDialog({
    operation,
    params,
    estimatedGas: await estimateGas(operation, params)
  });
  
  if (!confirmed) return;
  
  // 3. 执行操作
  return executeOperation(operation, params);
};
```

---

## 2. 应用层安全

### 2.1 输入验证

**地址验证**
```typescript
import { ethers } from 'ethers';

const validateAddress = (address: string): boolean => {
  try {
    return ethers.isAddress(address);
  } catch {
    return false;
  }
};

// 使用示例
const handleAddressInput = (input: string) => {
  if (!validateAddress(input)) {
    setError('请输入有效的钱包地址');
    return false;
  }
  return true;
};
```

**金额验证**
```typescript
const validateAmount = (amount: string, maxAmount?: bigint): boolean => {
  try {
    const value = ethers.parseEther(amount);
    
    // 必须为正数
    if (value <= 0n) {
      throw new Error('金额必须大于0');
    }
    
    // 不能超过最大值
    if (maxAmount && value > maxAmount) {
      throw new Error(`金额不能超过 ${ethers.formatEther(maxAmount)}`);
    }
    
    // 精度检查 (最多18位小数)
    const parts = amount.split('.');
    if (parts[1] && parts[1].length > 18) {
      throw new Error('金额精度不能超过18位小数');
    }
    
    return true;
  } catch (error: any) {
    setError(error.message || '无效的金额');
    return false;
  }
};
```

**字符串长度限制**
```typescript
const INPUT_LIMITS = {
  assetName: { min: 1, max: 100 },
  description: { min: 10, max: 2000 },
  creatorName: { min: 1, max: 50 },
  tags: { max: 10, tagMaxLength: 20 }
};

const validateString = (value: string, field: keyof typeof INPUT_LIMITS): boolean => {
  const limit = INPUT_LIMITS[field];
  
  if ('min' in limit && value.length < limit.min) {
    setError(`${field} 至少需要 ${limit.min} 个字符`);
    return false;
  }
  
  if ('max' in limit && value.length > limit.max) {
    setError(`${field} 不能超过 ${limit.max} 个字符`);
    return false;
  }
  
  return true;
};
```

### 2.2 XSS 防护

**输出转义**
```typescript
// 使用 React 的自动转义
// 或使用 DOMPurify
import DOMPurify from 'dompurify';

const SafeHTML = ({ html }: { html: string }) => {
  const clean = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
};

// 输入清理
const sanitizeInput = (input: string): string => {
  return input
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};
```

### 2.3 CSRF 防护

**使用 SameSite Cookie**
```typescript
// 如需使用 Cookie
// Set-Cookie: session=xxx; SameSite=Strict; Secure; HttpOnly
```

**请求验证**
```typescript
// 所有敏感操作需要用户主动触发
// 不使用自动提交的表单
```

---

## 3. 合约层安全

### 3.1 合约地址白名单

```typescript
// 已验证的合约地址
const CONTRACT_WHITELIST = {
  ECHOAssetV2V3: '0xF98f63b7e8064Dcf9c2f25A906B2af89Af4840ce',
  LicenseNFTV3: '0x2f79b56047050FD2Ee7C62d2d0fe644c15c68e23',
  ECHOFusionV2: '0x8Eb7a29C41478a3f32015C1330DFf7cc683d0952'
} as const;

type ContractName = keyof typeof CONTRACT_WHITELIST;

const getContractAddress = (name: ContractName): string => {
  const address = CONTRACT_WHITELIST[name];
  if (!address) {
    throw new Error(`Unknown contract: ${name}`);
  }
  return address;
};

// 验证地址
const validateContractAddress = (address: string, name: ContractName): boolean => {
  return address.toLowerCase() === CONTRACT_WHITELIST[name].toLowerCase();
};
```

### 3.2 交易确认机制

**Gas 估算与限制**
```typescript
const GAS_LIMITS = {
  mint: 500000,
  purchase: 300000,
  transfer: 200000,
  approve: 100000
};

const executeTransaction = async (
  contract: ethers.Contract,
  method: string,
  args: any[],
  options: { value?: bigint } = {}
) => {
  // 1. 估算 Gas
  const estimatedGas = await contract.estimateGas[method](...args, options);
  
  // 2. 检查 Gas 限制
  const gasLimit = GAS_LIMITS[method as keyof typeof GAS_LIMITS] || estimatedGas * 2n;
  
  if (estimatedGas > gasLimit) {
    throw new Error('Gas 估算超出安全限制，请检查参数');
  }
  
  // 3. 执行交易
  const tx = await contract[method](...args, {
    ...options,
    gasLimit: estimatedGas * 12n / 10n // 1.2 倍缓冲
  });
  
  return tx;
};
```

**交易状态监控**
```typescript
const waitForTransaction = async (
  tx: ethers.TransactionResponse,
  confirmations: number = 1
): Promise<ethers.TransactionReceipt> => {
  const receipt = await tx.wait(confirmations);
  
  if (!receipt) {
    throw new Error('交易失败：未收到回执');
  }
  
  if (receipt.status === 0) {
    throw new Error('交易执行失败，请检查合约逻辑');
  }
  
  return receipt;
};
```

### 3.3 重试机制

```typescript
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1秒

const executeWithRetry = async <T>(
  fn: () => Promise<T>,
  retries: number = MAX_RETRIES
): Promise<T> => {
  try {
    return await fn();
  } catch (error: any) {
    if (retries <= 0) throw error;
    
    // 可重试的错误
    const retryableErrors = [
      'network error',
      'timeout',
      'rate limit',
      'nonce too low'
    ];
    
    const shouldRetry = retryableErrors.some(e => 
      error.message?.toLowerCase().includes(e)
    );
    
    if (!shouldRetry) throw error;
    
    await new Promise(r => setTimeout(r, RETRY_DELAY));
    return executeWithRetry(fn, retries - 1);
  }
};
```

---

## 4. 数据层安全

### 4.1 私钥管理

**核心原则: 前端永不存储私钥**
```typescript
// ❌ 错误 - 永远不要这样做
localStorage.setItem('privateKey', key);

// ✅ 正确 - 依赖钱包插件
// MetaMask 等钱包会安全保管私钥
// 我们只通过 ethers.js 与钱包交互
```

### 4.2 本地存储安全

```typescript
// 可安全存储的数据
const SAFE_STORAGE_KEYS = [
  'theme',           // 主题偏好
  'language',        // 语言设置
  'recentSearches',  // 最近搜索 (仅 ID)
  'userPreferences'  // 用户偏好
];

// 存储封装
const safeStorage = {
  set: (key: string, value: any) => {
    if (!SAFE_STORAGE_KEYS.includes(key)) {
      console.warn(`存储键 ${key} 不在安全列表中`);
      return;
    }
    localStorage.setItem(key, JSON.stringify(value));
  },
  
  get: (key: string) => {
    const value = localStorage.getItem(key);
    return value ? JSON.parse(value) : null;
  },
  
  remove: (key: string) => {
    localStorage.removeItem(key);
  }
};
```

### 4.3 敏感数据清理

```typescript
// 登出时清理数据
const logout = () => {
  // 清理本地存储
  localStorage.removeItem('walletConnected');
  localStorage.removeItem('userPreferences');
  
  // 清理会话存储
  sessionStorage.clear();
  
  // 清理内存中的敏感数据
  walletStore.disconnect();
  userStore.clear();
  
  // 重定向
  router.push('/');
};
```

---

## 5. Web3 特定安全

### 5.1 钓鱼攻击防护

**域名验证**
```typescript
const ALLOWED_DOMAINS = [
  'zhouyatingkol.github.io',
  'echo-protocol.io'  // 未来正式域名
];

const checkDomain = () => {
  const currentDomain = window.location.hostname;
  
  if (!ALLOWED_DOMAINS.includes(currentDomain)) {
    showWarningToast('⚠️ 您可能访问了钓鱼网站，请检查域名');
    return false;
  }
  
  return true;
};
```

### 5.2 假代币识别

```typescript
const KNOWN_TOKENS = {
  MEER: {
    address: '0x...',  // MEER 代币地址
    symbol: 'MEER',
    decimals: 18
  }
};

const validateToken = (address: string): boolean => {
  const isKnown = Object.values(KNOWN_TOKENS).some(
    t => t.address.toLowerCase() === address.toLowerCase()
  );
  
  if (!isKnown) {
    showWarningToast('⚠️ 未知代币，请确认合约地址正确');
    return false;
  }
  
  return true;
};
```

### 5.3 前端篡改检测

```typescript
// 使用 Subresource Integrity (SRI)
// 在 HTML 中
// <script src="app.js" integrity="sha384-..." crossorigin="anonymous"></script>

// 运行时完整性检查
const checkIntegrity = async () => {
  // 检查关键全局变量是否存在
  if (typeof window.ethereum === 'undefined') {
    console.warn('ethereum provider not found');
  }
  
  // 检查合约地址是否被篡改
  for (const [name, address] of Object.entries(CONTRACT_WHITELIST)) {
    if (!ethers.isAddress(address)) {
      showErrorToast(`合约配置异常: ${name}`);
      return false;
    }
  }
  
  return true;
};
```

---

## 6. 安全审计清单

### 6.1 开发阶段检查

- [ ] 所有用户输入都有验证
- [ ] 所有输出都有转义
- [ ] 敏感操作有二次确认
- [ ] 合约地址使用白名单
- [ ] Gas 估算有上限
- [ ] 错误信息不暴露敏感信息
- [ ] 调试代码已移除
- [ ] console.log 已清理或使用日志库

### 6.2 部署前检查

- [ ] 生产环境移除了调试模式
- [ ] 环境变量正确配置
- [ ] 合约地址是主网地址
- [ ] API 密钥已轮转
- [ ] 依赖项漏洞扫描通过
- [ ] 安全头部配置正确 (CSP, HSTS)

### 6.3 运行时监控

- [ ] 异常交易告警
- [ ] 错误日志收集
- [ ] 性能监控
- [ ] 用户行为分析

---

## 7. 应急响应计划

### 7.1 漏洞发现流程

```
1. 发现漏洞
   ↓
2. 评估影响范围
   ↓
3. 决定应急措施
   ├── 低风险: 计划修复
   ├── 中风险: 临时缓解 + 计划修复
   └── 高风险: 立即暂停 + 紧急修复
   ↓
4. 通知用户
   ↓
5. 修复并验证
   ↓
6. 事后分析
```

### 7.2 紧急暂停机制

```typescript
// 合约级别的暂停 (如果合约支持)
const emergencyPause = async () => {
  const confirmed = await showConfirmDialog({
    title: '🚨 紧急暂停',
    content: '这将暂停所有交易功能，确认继续？',
    danger: true
  });
  
  if (!confirmed) return;
  
  // 调用合约的 pause 函数
  const tx = await contract.pause();
  await tx.wait();
  
  showSuccessToast('已启动紧急暂停');
};
```

### 7.3 用户通知机制

```typescript
const notifyUsers = async (level: 'info' | 'warning' | 'critical', message: string) => {
  // 1. 应用内通知
  showGlobalNotification(level, message);
  
  // 2. 存储到本地，下次打开时显示
  localStorage.setItem('lastNotification', JSON.stringify({
    level,
    message,
    timestamp: Date.now()
  }));
  
  // 3. 严重级别发送邮件/TG (如果用户绑定了)
  if (level === 'critical') {
    await notifyEmergencyContacts(message);
  }
};
```

---

## 📋 安全交付清单

### 已完成 ✅
- [x] 用户层安全 (钱包、确认、警告)
- [x] 应用层安全 (输入验证、XSS、CSRF)
- [x] 合约层安全 (地址白名单、Gas 限制、重试)
- [x] 数据层安全 (私钥管理、存储安全)
- [x] Web3 特定安全 (钓鱼、假代币、篡改检测)
- [x] 安全审计清单
- [x] 应急响应计划

### 下一步
- [ ] 编写安全测试用例
- [ ] 配置 CSP 头部
- [ ] 设置监控告警

---

**安全设计方案完成！可与架构设计配合进入开发阶段。** 🔒
