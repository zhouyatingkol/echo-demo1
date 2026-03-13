# ECHO Protocol 前端安全设计文档

## 1. 概述

### 1.1 文档目的
本文档定义了 ECHO Protocol 前端应用的安全架构、安全控制措施和最佳实践，确保在处理真实加密货币交易时的安全性。

### 1.2 安全原则
- **零信任原则**: 不信任任何输入，验证一切
- **最小权限原则**: 仅请求必要的权限
- **纵深防御**: 多层安全控制
- **安全默认**: 默认启用最安全的配置
- **隐私优先**: 最小化敏感数据收集和存储

### 1.3 威胁模型
```
攻击者类型:
├── 外部攻击者 (互联网)
│   ├── 钓鱼攻击
│   ├── XSS攻击
│   ├── CSRF攻击
│   └── MITM攻击
├── 恶意前端代码
│   ├── 供应链攻击
│   └── CDN劫持
└── 用户端威胁
    ├── 恶意浏览器扩展
    └── 本地恶意软件
```

## 2. 架构安全

### 2.1 安全架构图
```
┌─────────────────────────────────────────────────────────────┐
│                     用户浏览器                               │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   MetaMask   │  │  前端应用    │  │  Content Security │  │
│  │    钱包      │  │  (React/Vue) │  │      Policy       │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼ HTTPS/TLS 1.3
┌─────────────────────────────────────────────────────────────┐
│                      安全层                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │   WAF/CDN    │  │   DDoS防护   │  │   速率限制       │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                   Qitmeer 网络 (Chain 813)                   │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │ ECHOAssetV2  │  │  LicenseNFT  │  │   ECHOFusionV2   │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 关键安全组件

| 组件 | 功能 | 安全要求 |
|------|------|----------|
| 输入验证层 | 验证所有用户输入 | 白名单验证、类型检查 |
| 加密层 | 数据加密传输 | TLS 1.3、证书固定 |
| 合约交互层 | 智能合约调用 | 地址白名单、参数校验 |
| 存储层 | 本地数据管理 | 加密存储、敏感数据隔离 |
| 监控层 | 安全事件检测 | 实时监控、异常告警 |

## 3. 数据安全

### 3.1 数据分类

```
数据敏感度分级:

🔴 极高风险 (禁止存储)
   - 私钥/助记词
   - 钱包密码
   - 交易签名私钥

🟠 高风险 (加密存储)
   - 交易历史
   - 钱包地址
   - 用户偏好设置

🟡 中风险 (安全存储)
   - 缓存的代币列表
   - UI状态
   - 临时数据

🟢 低风险 (普通存储)
   - 主题偏好
   - 语言设置
   - 非敏感配置
```

### 3.2 数据流安全

```
用户输入 → 验证 → 净化 → 处理 → 输出
    ↓        ↓       ↓       ↓      ↓
 白名单   类型检查  DOMPurify  加密  编码
```

## 4. 通信安全

### 4.1 HTTPS 配置
```javascript
// 严格传输安全 (HSTS)
Strict-Transport-Security: max-age=31536000; includeSubDomains; preload

// 内容安全策略 (CSP)
Content-Security-Policy: 
  default-src 'self';
  script-src 'self' 'nonce-{random}';
  style-src 'self' 'unsafe-inline';
  connect-src 'self' https://rpc.qitmeer.io wss://*.qitmeer.io;
  img-src 'self' data: https:;
  font-src 'self';
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
```

### 4.2 RPC 通信安全
```javascript
// RPC 调用安全配置
const RPC_CONFIG = {
  // 仅允许白名单中的 RPC 端点
  allowedEndpoints: [
    'https://rpc.qitmeer.io',
    'https://mainnet.qitmeer.io'
  ],
  
  // 请求超时
  timeout: 30000,
  
  // 重试配置
  retry: {
    maxAttempts: 3,
    backoff: 'exponential'
  },
  
  // 请求签名验证
  verifySignatures: true
};
```

## 5. 合约安全

### 5.1 合约地址白名单
```javascript
// 已验证合约地址 (Qitmeer Mainnet - Chain ID: 813)
const CONTRACT_WHITELIST = {
  // ECHOAssetV2V3 合约
  ECHOAsset: {
    address: '0x...', // 正式部署地址
    abi: ECHOAssetV2V3_ABI,
    verified: true,
    auditStatus: 'completed'
  },
  
  // LicenseNFTV3 合约
  LicenseNFT: {
    address: '0x...',
    abi: LicenseNFTV3_ABI,
    verified: true,
    auditStatus: 'completed'
  },
  
  // ECHOFusionV2 合约
  ECHOFusion: {
    address: '0x...',
    abi: ECHOFusionV2_ABI,
    verified: true,
    auditStatus: 'completed'
  }
};

// 地址验证函数
function validateContractAddress(address) {
  const normalized = ethers.getAddress(address);
  return Object.values(CONTRACT_WHITELIST).some(
    contract => contract.address.toLowerCase() === normalized.toLowerCase()
  );
}
```

### 5.2 交易安全检查清单

```javascript
const TRANSACTION_CHECKS = {
  // 1. 目标地址验证
  validateTarget: (to) => validateContractAddress(to),
  
  // 2. 金额范围检查
  validateAmount: (amount) => {
    const min = ethers.parseEther('0.0001');
    const max = ethers.parseEther('1000000');
    return amount >= min && amount <= max;
  },
  
  // 3. Gas 限制检查
  validateGas: (gasLimit) => gasLimit <= 5000000, // 5M gas 上限
  
  // 4. 链 ID 验证
  validateChainId: (chainId) => chainId === 813, // Qitmeer Mainnet
  
  // 5. 交易数据验证
  validateData: (data) => {
    // 验证函数签名在白名单中
    const selector = data.slice(0, 10);
    return ALLOWED_FUNCTION_SELECTORS.includes(selector);
  }
};
```

## 6. 认证与授权

### 6.1 钱包连接安全
```javascript
// 钱包连接安全流程
class WalletConnectionSecurity {
  // 连接前验证
  async validateBeforeConnect(provider) {
    // 1. 验证提供者类型
    if (!this.isValidProvider(provider)) {
      throw new Error('Invalid wallet provider');
    }
    
    // 2. 检查网络
    const chainId = await provider.request({ method: 'eth_chainId' });
    if (parseInt(chainId) !== 813) {
      // 提示用户切换网络
      await this.promptNetworkSwitch(provider);
    }
    
    // 3. 验证域名
    if (!this.isTrustedDomain(window.location.origin)) {
      throw new Error('Untrusted domain');
    }
  }
  
  // 网络切换确认
  async promptNetworkSwitch(provider) {
    try {
      await provider.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0x32D' }] // 813 in hex
      });
    } catch (error) {
      if (error.code === 4902) {
        // 网络不存在，添加网络
        await this.addQitmeerNetwork(provider);
      }
    }
  }
}
```

### 6.2 敏感操作确认
```javascript
// 敏感操作二次确认
const SENSITIVE_OPERATIONS = {
  TRANSFER: {
    requiresConfirmation: true,
    confirmationMessage: '确认转账 {amount} {token} 到 {to}',
    requirePassword: false
  },
  APPROVE: {
    requiresConfirmation: true,
    confirmationMessage: '确认授权 {spender} 使用您的 {token}',
    warningMessage: '⚠️ 此操作可能带来资金风险，请确认您信任此合约',
    requirePassword: false
  },
  SET_APPROVAL_FOR_ALL: {
    requiresConfirmation: true,
    confirmationMessage: '确认授权 {operator} 管理您的所有 NFT',
    warningMessage: '⚠️ 危险操作！这将授权对方转移您的所有 NFT',
    requirePassword: true
  }
};
```

## 7. 监控与日志

### 7.1 安全事件监控
```javascript
// 安全事件类型
const SECURITY_EVENTS = {
  WALLET_CONNECTED: 'wallet_connected',
  TRANSACTION_SUBMITTED: 'tx_submitted',
  TRANSACTION_CONFIRMED: 'tx_confirmed',
  TRANSACTION_FAILED: 'tx_failed',
  CONTRACT_INTERACTION: 'contract_interaction',
  UNAUTHORIZED_ATTEMPT: 'unauthorized_attempt',
  VALIDATION_ERROR: 'validation_error',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity'
};

// 安全日志记录 (不含敏感信息)
function logSecurityEvent(eventType, data) {
  const logEntry = {
    timestamp: new Date().toISOString(),
    event: eventType,
    // 仅记录非敏感元数据
    metadata: sanitizeLogData(data),
    sessionId: getSessionId(),
    userAgent: navigator.userAgent,
    // 不包含：私钥、助记词、完整交易数据
  };
  
  // 发送到监控服务
  securityMonitor.track(logEntry);
}
```

### 7.2 异常检测规则
```javascript
// 异常行为检测
const ANOMALY_RULES = {
  // 高频交易检测
  highFrequency: {
    threshold: 10, // 10分钟内超过10笔交易
    window: 10 * 60 * 1000,
    severity: 'warning'
  },
  
  // 大额交易检测
  largeTransaction: {
    threshold: ethers.parseEther('100'), // 100 QMEER
    severity: 'info'
  },
  
  // 异常合约交互
  unknownContract: {
    check: (address) => !isWhitelisted(address),
    severity: 'critical'
  },
  
  // 异常网络活动
  wrongNetwork: {
    check: (chainId) => chainId !== 813,
    severity: 'warning'
  }
};
```

## 8. 安全配置

### 8.1 环境变量
```bash
# .env.production
# 永远不要提交这些到版本控制

# RPC 配置
REACT_APP_RPC_URL=https://rpc.qitmeer.io
REACT_APP_CHAIN_ID=813
REACT_APP_NETWORK_NAME=Qitmeer

# 安全头配置
REACT_APP_ENABLE_CSP=true
REACT_APP_ENABLE_HSTS=true

# 监控配置
REACT_APP_SECURITY_MONITORING=true
REACT_APP_SENTRY_DSN=...

# 合约地址
REACT_APP_ECHOASSET_CONTRACT=0x...
REACT_APP_LICENSENFT_CONTRACT=0x...
REACT_APP_ECHOFUSION_CONTRACT=0x...
```

### 8.2 构建安全配置
```javascript
// 构建时安全检查
const securityConfig = {
  // 禁用源码映射 (生产环境)
  sourceMap: false,
  
  // 代码压缩和混淆
  minimizer: {
    terser: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    }
  },
  
  // 子资源完整性 (SRI)
  subresourceIntegrity: true,
  
  // 内容哈希
  contentHash: true
};
```

## 9. 应急响应

详见 [emergency-response-plan.md](./emergency-response-plan.md)

## 10. 参考文档

- [输入验证规则](./input-validation-rules.md)
- [合约交互安全](./contract-interaction-security.md)
- [常见攻击防护](./common-attacks-defense.md)
- [安全审计清单](./security-audit-checklist.md)
- [应急响应计划](./emergency-response-plan.md)

---

**文档版本**: 1.0  
**最后更新**: 2026-03-13  
**审核状态**: 待审核
