# ECHO Protocol 安全审计清单

## 1. 开发阶段安全检查

### 1.1 代码安全审查

#### A. 输入验证检查

| 检查项 | 严重程度 | 检查方法 | 通过标准 |
|--------|----------|----------|----------|
| 所有用户输入都有验证 | 🔴 高 | 代码审查 | 100% 输入有验证 |
| 使用白名单而非黑名单 | 🔴 高 | 代码审查 | 无黑名单验证 |
| 数值范围检查 | 🔴 高 | 代码审查 | 所有数值有范围限制 |
| 地址格式验证 | 🔴 高 | 代码审查 | 使用 ethers.isAddress |
| 字符串长度限制 | 🟡 中 | 代码审查 | 所有字符串有 maxLength |
| SQL/NoSQL 注入防护 | 🔴 高 | 代码审查 | 使用参数化查询 |

```typescript
// 检查脚本示例
const inputValidationCheck = {
  // 查找危险的 eval
  dangerousEval: /eval\s*\(/g,
  
  // 查找 innerHTML 使用
  innerHTMLUsage: /\.innerHTML\s*=/g,
  
  // 查找未验证的地址使用
  unvalidatedAddress: /(?!.*validate).*address/g,
  
  // 查找潜在注入点
  potentialInjection: /(innerHTML|outerHTML|insertAdjacentHTML|document\.write)/g
};
```

#### B. 加密和敏感数据检查

| 检查项 | 严重程度 | 检查方法 | 通过标准 |
|--------|----------|----------|----------|
| 无私钥存储 | 🔴 高 | 代码审查+扫描 | 无存储私钥代码 |
| 敏感数据加密 | 🔴 高 | 代码审查 | 敏感数据 AES 加密 |
| 安全的随机数生成 | 🔴 高 | 代码审查 | 使用 crypto.getRandomValues |
| HTTPS 强制 | 🔴 高 | 配置检查 | 全站 HTTPS |
| 安全头配置 | 🔴 高 | 配置检查 | CSP/HSTS/XFO 配置 |

#### C. 合约交互安全检查

| 检查项 | 严重程度 | 检查方法 | 通过标准 |
|--------|----------|----------|----------|
| 合约地址白名单 | 🔴 高 | 代码审查 | 所有合约调用前验证 |
| 交易确认机制 | 🔴 高 | 代码审查 | 用户确认所有交易 |
| Gas 限制检查 | 🔴 高 | 代码审查 | 所有交易有 Gas 上限 |
| 链 ID 验证 | 🔴 高 | 代码审查 | 每次交易验证 chainId |
| 重入攻击防护 | 🔴 高 | 代码审查 | 遵循 Checks-Effects-Interactions |

### 1.2 依赖安全检查

```bash
# 检查依赖漏洞
npm audit
yarn audit

# 检查过期依赖
npm outdated

# 检查许可证合规
npm license-checker

# 检查依赖完整性
npm ci --package-lock-only
```

#### 依赖安全清单

| 检查项 | 严重程度 | 工具 | 频率 |
|--------|----------|------|------|
| 已知漏洞扫描 | 🔴 高 | npm audit, Snyk | 每次构建 |
| 许可证合规 | 🟡 中 | license-checker | 每周 |
| 依赖版本锁定 | 🟡 中 | package-lock.json | 始终 |
| 不必要的依赖 | 🟢 低 | depcheck | 每月 |
| 子依赖检查 | 🔴 高 | Snyk | 每周 |

### 1.3 静态代码分析

```bash
# ESLint 安全规则
npm install eslint-plugin-security

# .eslintrc.json
{
  "plugins": ["security"],
  "extends": ["plugin:docs/security/recommended"],
  "rules": {
    "docs/security/detect-eval-with-expression": "error",
    "docs/security/detect-non-literal-fs-filename": "error",
    "docs/security/detect-unsafe-regex": "error",
    "docs/security/detect-buffer-noassert": "error",
    "docs/security/detect-child-process": "error",
    "docs/security/detect-disable-mustache-escape": "error",
    "docs/security/detect-eval-with-expression": "error",
    "docs/security/detect-new-buffer": "error",
    "docs/security/detect-no-csrf-before-method-override": "error",
    "docs/security/detect-non-literal-regexp": "error",
    "docs/security/detect-non-literal-require": "error",
    "docs/security/detect-object-injection": "error",
    "docs/security/detect-possible-timing-attacks": "error",
    "docs/security/detect-pseudoRandomBytes": "error"
  }
}
```

## 2. 部署前安全审查

### 2.1 构建安全检查

```bash
#!/bin/bash
# pre-deploy-security-check.sh

echo "🔒 部署前安全检查"

# 1. 依赖漏洞检查
echo "📦 检查依赖漏洞..."
npm audit --audit-level=moderate || exit 1

# 2. 构建产物检查
echo "🏗️  检查构建产物..."
if grep -r "eval(" build/; then
  echo "❌ 发现 eval 使用"
  exit 1
fi

# 3. 检查 source map
echo "🗺️  检查 source map..."
if [ -f "build/static/js/*.js.map" ]; then
  echo "⚠️  生产环境存在 source map"
fi

# 4. 检查硬编码密钥
echo "🔑 检查硬编码密钥..."
if grep -r "private_key\|secret_key\|api_key" build/; then
  echo "❌ 发现可能的硬编码密钥"
  exit 1
fi

# 5. 检查 console 语句
echo "🖥️  检查调试语句..."
if grep -r "console\.(log|debug|warn)" build/static/js/*.js; then
  echo "⚠️  发现 console 语句"
fi

echo "✅ 安全检查通过"
```

### 2.2 环境配置检查

| 检查项 | 配置项 | 期望状态 | 验证方法 |
|--------|--------|----------|----------|
| 生产环境标记 | NODE_ENV | production | 环境变量检查 |
| Source Map 禁用 | GENERATE_SOURCEMAP | false | 配置检查 |
| 代码压缩 | optimization.minimize | true | 配置检查 |
| 调试信息移除 | drop_console | true | 配置检查 |
| 安全头配置 | headers | 已配置 | 配置检查 |

```javascript
// 安全配置验证
function validateProductionConfig() {
  const required = {
    'NODE_ENV': 'production',
    'GENERATE_SOURCEMAP': 'false',
    'REACT_APP_API_URL': (v) => v.startsWith('https://'),
    'REACT_APP_CHAIN_ID': '813'
  };
  
  for (const [key, validator] of Object.entries(required)) {
    const value = process.env[key];
    
    if (!value) {
      throw new Error(`Missing required env: ${key}`);
    }
    
    if (typeof validator === 'string' && value !== validator) {
      throw new Error(`Invalid ${key}: expected ${validator}, got ${value}`);
    }
    
    if (typeof validator === 'function' && !validator(value)) {
      throw new Error(`Invalid ${key}: validation failed`);
    }
  }
  
  console.log('✅ 生产环境配置验证通过');
}
```

### 2.3 渗透测试清单

#### A. 认证与授权测试

| 测试项 | 测试方法 | 期望结果 |
|--------|----------|----------|
| 未授权访问 | 直接访问需要钱包的页面 | 提示连接钱包 |
| 网络切换测试 | 切换到错误网络后操作 | 提示切换网络 |
| 权限提升 | 尝试执行无权限操作 | 操作被拒绝 |
| 会话过期 | 长时间无操作后交易 | 要求重新连接 |

#### B. 输入验证测试

| 测试项 | 测试输入 | 期望结果 |
|--------|----------|----------|
| XSS 测试 | `<script>alert('xss')</script>` | 脚本不执行 |
| SQL 注入 | `'; DROP TABLE users; --` | 无影响 |
| 超长输入 | 10000 字符字符串 | 截断或拒绝 |
| 特殊字符 | `../../etc/passwd` | 净化处理 |
| 零宽度字符 | U+200B, U+200C | 检测并警告 |

#### C. 合约交互测试

| 测试项 | 测试方法 | 期望结果 |
|--------|----------|----------|
| 恶意合约 | 调用非白名单合约 | 交易被拒绝 |
| Gas 限制 | 构造高 Gas 交易 | 超出限制被拒绝 |
| 重放攻击 | 复制旧交易广播 |  nonce 错误 |
| 整数溢出 | 输入极大数值 | 验证拒绝 |
| 竞争条件 | 快速连续点击 | 只执行一次 |

### 2.4 安全测试用例

```typescript
// 安全测试套件
describe('Security Tests', () => {
  describe('Input Validation', () => {
    it('should reject XSS in address input', () => {
      const malicious = '<script>alert(1)</script>0x123...';
      const result = validateAddress(malicious);
      expect(result.valid).toBe(false);
    });
    
    it('should reject oversized amount', () => {
      const huge = '999999999999999999999999999999';
      const result = validateAmount(huge, 18);
      expect(result.valid).toBe(false);
    });
    
    it('should normalize address checksum', () => {
      const address = '0x742d35cc6634c0532925a3b844bc9e7595f0bEb'; // 错误校验和
      const result = validateAddress(address, { strict: true });
      expect(result.valid).toBe(false);
    });
  });
  
  describe('Contract Security', () => {
    it('should reject non-whitelist contract', async () => {
      const malicious = '0x1234567890123456789012345678901234567890';
      await expect(
        contractService.call(malicious, 'transfer', [])
      ).rejects.toThrow('CONTRACT_NOT_WHITELISTED');
    });
    
    it('should enforce gas limit', async () => {
      const tx = { gasLimit: 10000000 }; // 超过限制
      await expect(
        transactionService.send(tx)
      ).rejects.toThrow('GAS_LIMIT_EXCEEDED');
    });
    
    it('should prevent transaction replay', async () => {
      const tx = createTestTransaction();
      await transactionService.send(tx);
      await expect(
        transactionService.send(tx)
      ).rejects.toThrow('DUPLICATE_TRANSACTION');
    });
  });
  
  describe('Access Control', () => {
    it('should require wallet connection', async () => {
      walletService.disconnect();
      await expect(
        transactionService.send({})
      ).rejects.toThrow('WALLET_NOT_CONNECTED');
    });
    
    it('should enforce correct network', async () => {
      await networkService.switch(1); // 切换到 Ethereum
      await expect(
        contractService.call(echoContract, 'mint', [])
      ).rejects.toThrow('WRONG_NETWORK');
    });
  });
});
```

## 3. 运行时安全监控

### 3.1 实时监控指标

| 监控项 | 告警阈值 | 响应动作 |
|--------|----------|----------|
| 交易失败率 | > 10% | 发送告警，检查合约 |
| 异常 Gas 消耗 | > 1M | 标记可疑交易 |
| 未授权访问尝试 | > 5/分钟 | 临时封禁 IP |
| 合约调用异常 | 任何 | 立即告警 |
| 前端报错率 | > 1% | 检查错误日志 |
| 钱包连接异常 | > 20/小时 | 检查网络状态 |

### 3.2 安全事件日志

```typescript
// 安全事件类型
enum SecurityEventType {
  // 认证事件
  WALLET_CONNECTED = 'wallet_connected',
  WALLET_DISCONNECTED = 'wallet_disconnected',
  
  // 交易事件
  TRANSACTION_SUBMITTED = 'tx_submitted',
  TRANSACTION_CONFIRMED = 'tx_confirmed',
  TRANSACTION_FAILED = 'tx_failed',
  
  // 安全事件
  VALIDATION_ERROR = 'validation_error',
  CONTRACT_REJECTED = 'contract_rejected',
  UNAUTHORIZED_ATTEMPT = 'unauthorized_attempt',
  SUSPICIOUS_ACTIVITY = 'suspicious_activity',
  
  // 错误事件
  CONTRACT_ERROR = 'contract_error',
  NETWORK_ERROR = 'network_error',
  RATE_LIMIT_HIT = 'rate_limit_hit'
}

// 安全日志结构
interface SecurityLog {
  timestamp: number;
  eventType: SecurityEventType;
  severity: 'info' | 'warning' | 'critical';
  sessionId: string;
  walletAddress?: string;
  ip?: string;
  userAgent: string;
  details: Record<string, any>;
  // 不包含：私钥、助记词、完整交易数据
}
```

### 3.3 告警配置

```yaml
# 告警规则配置
alerts:
  - name: high_failure_rate
    condition: transaction_failure_rate > 10%
    duration: 5m
    severity: warning
    channels: [slack, email]
    
  - name: suspicious_contract_interaction
    condition: contract_not_in_whitelist
    severity: critical
    channels: [slack, email, pagerduty]
    
  - name: unusual_gas_usage
    condition: gas_used > 5000000
    severity: warning
    channels: [slack]
    
  - name: rate_limit_triggered
    condition: rate_limit_hits > 100/hour
    severity: warning
    channels: [slack]
    
  - name: frontend_tampering
    condition: integrity_check_failed
    severity: critical
    channels: [slack, email, pagerduty]
    immediate: true
```

## 4. 审计报告模板

### 4.1 安全审计报告

```markdown
# ECHO Protocol 安全审计报告

## 基本信息
- 审计日期: YYYY-MM-DD
- 审计版本: vX.X.X
- 审计人员: [姓名]
- 代码提交: [commit hash]

## 审计范围
- [x] 前端代码
- [x] 合约交互逻辑
- [x] 依赖安全性
- [x] 配置安全性
- [x] 部署流程

## 审计结果汇总

| 严重程度 | 数量 | 状态 |
|---------|------|------|
| 🔴 严重 | 0 | - |
| 🟠 高 | 0 | - |
| 🟡 中 | 0 | - |
| 🟢 低 | 0 | - |

## 详细发现

### 1. [问题标题]
- **严重程度**: [严重/高/中/低]
- **位置**: [文件路径]
- **描述**: [问题描述]
- **风险**: [潜在风险]
- **修复建议**: [建议]
- **状态**: [已修复/待修复/已接受]

## 合规检查

| 检查项 | 状态 |
|--------|------|
| 输入验证 | ✅/❌ |
| XSS 防护 | ✅/❌ |
| CSRF 防护 | ✅/❌ |
| 合约白名单 | ✅/❌ |
| 安全头配置 | ✅/❌ |
| HTTPS 强制 | ✅/❌ |
| 依赖审计 | ✅/❌ |

## 签名
- 审计人员: ___________
- 日期: ___________
```

## 5. 定期审计计划

| 审计类型 | 频率 | 负责人 | 产出物 |
|----------|------|--------|--------|
| 依赖安全审计 | 每周 | DevOps | 依赖报告 |
| 代码安全审查 | 每次发布 | Security Team | 审查记录 |
| 渗透测试 | 每季度 | 外部公司 | 测试报告 |
| 合约升级审计 | 每次升级 | 审计公司 | 审计报告 |
| 完整安全审计 | 每年 | 审计公司 | 综合报告 |

---

**文档版本**: 1.0  
**最后更新**: 2026-03-13
