# ECHO Protocol 常见攻击防护

## 1. 前端攻击防护

### 1.1 XSS (跨站脚本攻击)

#### 攻击向量
```
1. 存储型 XSS: 恶意输入存储到数据库，后续用户加载时执行
2. 反射型 XSS: 恶意参数在 URL 中，诱导用户点击执行
3. DOM 型 XSS: 前端 JavaScript 不安全地处理数据导致
```

#### 防护措施

```typescript
// ==================== 1. 内容安全策略 (CSP) ====================

// HTTP 响应头
const CSP_HEADER = `
  default-src 'self';
  script-src 'self' 'nonce-${generateNonce()}';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: https: blob:;
  font-src 'self';
  connect-src 'self' https://rpc.qitmeer.io wss://*.qitmeer.io;
  media-src 'self';
  object-src 'none';
  frame-ancestors 'none';
  base-uri 'self';
  form-action 'self';
  upgrade-insecure-requests;
`.replace(/\n/g, '');

// Nonce 生成 (每次请求不同)
function generateNonce(): string {
  return Buffer.from(crypto.randomBytes(16)).toString('base64');
}

// ==================== 2. 输入净化 ====================

import DOMPurify from 'dompurify';

// DOMPurify 配置
const DOMPURIFY_CONFIG = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'em', 'u', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'a'
  ],
  ALLOWED_ATTR: ['href', 'title', 'target', 'class'],
  ALLOW_DATA_ATTR: false,
  SANITIZE_DOM: true,
  // 强制所有链接 noopener
  FORBID_ATTR: ['onerror', 'onload', 'onclick'],
  // 自定义钩子处理链接
  hooks: {
    afterSanitizeAttributes: (node: Element) => {
      if (node.tagName === 'A') {
        node.setAttribute('target', '_blank');
        node.setAttribute('rel', 'noopener noreferrer nofollow');
        // 验证 href
        const href = node.getAttribute('href');
        if (href && !isValidURL(href)) {
          node.removeAttribute('href');
        }
      }
    }
  }
};

// 净化函数
export function sanitizeHTML(dirty: string): string {
  return DOMPurify.sanitize(dirty, DOMPURIFY_CONFIG);
}

// ==================== 3. React 安全组件 ====================

// ❌ 危险做法
dangerouslySetInnerHTML={{ __html: userInput }}

// ✅ 安全做法
import DOMPurify from 'dompurify';

interface SafeHTMLProps {
  content: string;
  allowedTags?: string[];
}

export const SafeHTML: React.FC<SafeHTMLProps> = ({ content, allowedTags }) => {
  const clean = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: allowedTags || ['b', 'i', 'em', 'strong', 'p', 'br']
  });
  return <div dangerouslySetInnerHTML={{ __html: clean }} />;
};

// 安全的链接组件
export const SafeLink: React.FC<{ href: string; children: React.ReactNode }> = 
({ href, children }) => {
  // 验证 URL
  const sanitized = sanitizeURL(href);
  
  if (!sanitized) {
    return <span className="invalid-link">{children}</span>;
  }
  
  // 外部链接安全检查
  const isExternal = !sanitized.startsWith(window.location.origin);
  
  return (
    <a
      href={sanitized}
      {...(isExternal && {
        target: '_blank',
        rel: 'noopener noreferrer nofollow'
      })}
    >
      {children}
      {isExternal && <ExternalLinkIcon />}
    </a>
  );
};

// ==================== 4. URL 验证 ====================

function sanitizeURL(url: string): string | null {
  try {
    const parsed = new URL(url, window.location.origin);
    
    // 禁止 javascript: 协议
    const dangerousProtocols = ['javascript:', 'data:', 'vbscript:'];
    if (dangerousProtocols.includes(parsed.protocol.toLowerCase())) {
      return null;
    }
    
    // 只允许 http/https
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return null;
    }
    
    return parsed.toString();
  } catch {
    return null;
  }
}
```

### 1.2 CSRF (跨站请求伪造)

#### 防护措施

```typescript
// ==================== 1. SameSite Cookie ====================

// Cookie 配置
const COOKIE_CONFIG = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict', // 或 'lax'
  maxAge: 24 * 60 * 60 * 1000 // 24小时
};

// ==================== 2. CSRF Token ====================

class CSRFProtection {
  private tokenKey = 'csrf_token';
  
  // 生成 Token
  generateToken(): string {
    const token = crypto.randomUUID();
    sessionStorage.setItem(this.tokenKey, token);
    return token;
  }
  
  // 验证 Token
  validateToken(token: string): boolean {
    const stored = sessionStorage.getItem(this.tokenKey);
    return stored === token;
  }
  
  // 添加到请求头
  addToHeaders(headers: Headers): void {
    const token = sessionStorage.getItem(this.tokenKey);
    if (token) {
      headers.set('X-CSRF-Token', token);
    }
  }
}

// ==================== 3. Origin 验证 ====================

function validateOrigin(request: Request): boolean {
  const allowedOrigins = [
    'https://echo-protocol.io',
    'https://app.echo-protocol.io'
  ];
  
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  
  // 验证 Origin 头
  if (origin && !allowedOrigins.includes(origin)) {
    return false;
  }
  
  // 验证 Referer
  if (referer) {
    const refererOrigin = new URL(referer).origin;
    if (!allowedOrigins.includes(refererOrigin)) {
      return false;
    }
  }
  
  return true;
}

// ==================== 4. 自定义请求头 ====================

// 使用自定义头，简单请求不会自动添加
const API_HEADERS = {
  'X-Requested-With': 'XMLHttpRequest',
  'Content-Type': 'application/json'
};
```

### 1.3 Clickjacking (点击劫持)

#### 防护措施

```typescript
// ==================== 1. X-Frame-Options ====================

// HTTP 响应头
X-Frame-Options: DENY
// 或
X-Frame-Options: SAMEORIGIN

// ==================== 2. CSP frame-ancestors ====================

Content-Security-Policy: frame-ancestors 'none';
// 或只允许特定来源
Content-Security-Policy: frame-ancestors 'self' https://trusted-site.com;

// ==================== 3. Frame 破坏脚本 (旧浏览器兼容) ====================

// 添加到页面头部
if (window.top !== window.self) {
  window.top.location = window.self.location;
}

// 更安全的版本
(function() {
  if (window.top !== window.self) {
    // 记录潜在的点击劫持尝试
    console.warn('Potential clickjacking attempt detected');
    
    // 可选：隐藏内容
    document.body.style.display = 'none';
    
    // 或者跳转到顶层
    // window.top.location = window.self.location;
  }
})();
```

### 1.4 DOM 污染防护

```typescript
// ==================== 危险的 DOM 操作 ====================

// ❌ 危险：innerHTML 使用用户输入
element.innerHTML = userInput;

// ❌ 危险：eval 使用用户输入
eval(userInput);

// ❌ 危险：setTimeout/setInterval 使用字符串
setTimeout(userInput, 1000);

// ❌ 危险：location 使用用户输入
window.location = userInput;

// ==================== 安全的 DOM 操作 ====================

// ✅ 安全：使用 textContent
element.textContent = userInput;

// ✅ 安全：创建安全的元素
const safeElement = document.createElement('div');
safeElement.textContent = userInput;
parent.appendChild(safeElement);

// ✅ 安全：使用 URL 构造函数
const url = new URL(userInput, window.location.origin);
if (url.protocol === 'https:') {
  window.location.href = url.toString();
}

// ==================== URL 参数处理 ====================

// 安全地处理 URL 参数
function getSafeParam(paramName: string): string | null {
  const params = new URLSearchParams(window.location.search);
  const value = params.get(paramName);
  
  if (!value) return null;
  
  // 净化处理
  return DOMPurify.sanitize(value, { ALLOWED_TAGS: [] });
}
```

## 2. Web3 特定攻击防护

### 2.1 钓鱼攻击防护

```typescript
// ==================== 钓鱼防护系统 ====================

interface PhishingProtection {
  // 域名白名单
  trustedDomains: string[];
  
  // 检查是否为钓鱼网站
  checkPhishing(): boolean;
  
  // 警告用户
  showWarning(): void;
}

class PhishingDetector {
  // 官方域名列表
  private readonly OFFICIAL_DOMAINS = [
    'echo-protocol.io',
    'app.echo-protocol.io',
    'docs.echo-protocol.io'
  ];
  
  // 已知的钓鱼域名黑名单 (从安全服务同步)
  private blacklistedDomains: Set<string> = new Set();
  
  constructor() {
    this.checkDomain();
    this.loadBlacklist();
  }
  
  // 域名验证
  private checkDomain(): void {
    const currentDomain = window.location.hostname;
    
    // 检查是否在黑名单
    if (this.blacklistedDomains.has(currentDomain)) {
      this.blockAccess('BLOCKED_DOMAIN');
      return;
    }
    
    // 检查相似域名 (防同形异义攻击)
    if (this.isSimilarDomain(currentDomain)) {
      this.showWarning('SIMILAR_DOMAIN');
    }
    
    // 检查是否为官方域名
    if (!this.isOfficialDomain(currentDomain)) {
      this.showWarning('UNOFFICIAL_DOMAIN');
    }
  }
  
  // 相似域名检测 (防同形异义)
  private isSimilarDomain(domain: string): boolean {
    // 检查是否使用相似字符
    // 例如: еcho-protocol.io (使用西里尔字母 е)
    const suspicious = /[а-яё]/i.test(domain); // 西里尔字母
    
    // Levenshtein 距离检查
    for (const official of this.OFFICIAL_DOMAINS) {
      if (this.levenshteinDistance(domain, official) <= 2) {
        return true;
      }
    }
    
    return suspicious;
  }
  
  // 显示安全警告
  private showWarning(type: string): void {
    const warnings: Record<string, string> = {
      'SIMILAR_DOMAIN': '⚠️ 警告：检测到相似域名，可能是钓鱼网站！',
      'UNOFFICIAL_DOMAIN': '⚠️ 您正在访问非官方域名，请确认网址正确。'
    };
    
    // 显示模态警告
    this.showSecurityModal({
      title: '安全警告',
      message: warnings[type],
      severity: 'warning',
      actions: [
        { label: '离开网站', action: () => window.location.href = 'about:blank' },
        { label: '我已了解风险', action: () => this.dismissWarning() }
      ]
    });
  }
  
  // 阻止访问
  private blockAccess(reason: string): void {
    document.body.innerHTML = `
      <div style="padding: 50px; text-align: center; font-family: sans-serif;">
        <h1>🚫 访问被阻止</h1>
        <p>该网站已被标记为恶意网站，访问已被阻止以保护您的资产安全。</p>
        <p>原因: ${reason}</p>
      </div>
    `;
  }
  
  // 从安全服务加载黑名单
  private async loadBlacklist(): Promise<void> {
    try {
      const response = await fetch('https://security.echo-protocol.io/blacklist.json');
      const data = await response.json();
      this.blacklistedDomains = new Set(data.domains);
    } catch {
      // 使用本地缓存
    }
  }
}

// ==================== 交易确认强化 ====================

// 强化交易确认对话框
interface TransactionConfirmation {
  to: string;
  value: string;
  data?: string;
  contractInfo?: ContractInfo;
}

function showSecureConfirmation(tx: TransactionConfirmation): Promise<boolean> {
  return new Promise((resolve) => {
    // 验证目标地址
    const isContract = isKnownContract(tx.to);
    const isVerified = isVerifiedContract(tx.to);
    
    // 显示强化确认对话框
    showModal({
      title: '确认交易',
      content: `
        <div class="tx-confirmation">
          <div class="warning-box ${isVerified ? 'safe' : 'warning'}">
            ${isVerified 
              ? '✅ 已验证合约' 
              : '⚠️ 未验证地址，请谨慎操作'}
          </div>
          
          <div class="tx-details">
            <div class="detail-row">
              <span>发送至:</span>
              <code>${truncateAddress(tx.to)}</code>
              ${isContract ? '<span class="badge">合约</span>' : ''}
            </div>
            <div class="detail-row">
              <span>金额:</span>
              <strong>${tx.value} QMEER</strong>
            </div>
            ${tx.data ? `
            <div class="detail-row">
              <span>数据:</span>
              <code>${truncateHex(tx.data)}</code>
            </div>
            ` : ''}
          </div>
          
          <div class="security-tips">
            <p>🔒 请确认以上信息正确无误</p>
            <p>⚠️ 交易一旦提交将无法撤销</p>
          </div>
        </div>
      `,
      confirmText: '确认并签名',
      cancelText: '取消',
      onConfirm: () => resolve(true),
      onCancel: () => resolve(false)
    });
  });
}
```

### 2.2 假代币识别

```typescript
// ==================== 代币验证系统 ====================

interface TokenVerification {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
  verified: boolean;
  logoURI?: string;
}

class TokenValidator {
  // 官方代币列表
  private readonly OFFICIAL_TOKENS: TokenVerification[] = [
    {
      address: '0x...',
      symbol: 'ECHO',
      name: 'ECHO Token',
      decimals: 18,
      verified: true,
      logoURI: 'https://echo-protocol.io/tokens/echo.png'
    }
  ];
  
  // 缓存
  private tokenCache: Map<string, TokenVerification> = new Map();
  
  // 验证代币
  async validateToken(address: string): Promise<TokenVerification> {
    // 检查缓存
    if (this.tokenCache.has(address.toLowerCase())) {
      return this.tokenCache.get(address.toLowerCase())!;
    }
    
    // 检查官方列表
    const official = this.OFFICIAL_TOKENS.find(
      t => t.address.toLowerCase() === address.toLowerCase()
    );
    
    if (official) {
      this.tokenCache.set(address.toLowerCase(), official);
      return official;
    }
    
    // 链上验证
    const onChainInfo = await this.fetchTokenInfo(address);
    
    // 检查是否为假代币 (同名不同地址)
    const impersonation = this.checkImpersonation(onChainInfo);
    
    const verification: TokenVerification = {
      ...onChainInfo,
      verified: false,
      impersonationRisk: impersonation
    };
    
    this.tokenCache.set(address.toLowerCase(), verification);
    return verification;
  }
  
  // 检查冒充风险
  private checkImpersonation(tokenInfo: Partial<TokenVerification>): boolean {
    // 检查是否与官方代币同名
    return this.OFFICIAL_TOKENS.some(official => 
      official.symbol.toLowerCase() === tokenInfo.symbol?.toLowerCase() &&
      official.address.toLowerCase() !== tokenInfo.address?.toLowerCase()
    );
  }
  
  // 获取代币信息
  async fetchTokenInfo(address: string): Promise<Partial<TokenVerification>> {
    const provider = getProvider();
    
    // ERC20 标准调用
    const abi = [
      'function symbol() view returns (string)',
      'function name() view returns (string)',
      'function decimals() view returns (uint8)'
    ];
    
    const contract = new ethers.Contract(address, abi, provider);
    
    try {
      const [symbol, name, decimals] = await Promise.all([
        contract.symbol(),
        contract.name(),
        contract.decimals()
      ]);
      
      return { address, symbol, name, decimals };
    } catch {
      throw new Error('Invalid ERC20 token');
    }
  }
}

// ==================== UI 安全显示 ====================

// 安全显示代币信息
function SafeTokenDisplay({ token }: { token: TokenVerification }) {
  return (
    <div className={`token-display ${token.verified ? 'verified' : 'unverified'}`}>
      {token.logoURI && (
        <img 
          src={token.verified ? token.logoURI : '/icons/unknown-token.svg'}
          alt={token.symbol}
          onError={(e) => { e.currentTarget.src = '/icons/unknown-token.svg'; }}
        />
      )}
      <div className="token-info">
        <span className="symbol">
          {token.symbol}
          {token.verified && <VerifiedBadge />}
        </span>
        <span className="name">{token.name}</span>
        {!token.verified && (
          <span className="warning">⚠️ 未验证代币</span>
        )}
        {(token as any).impersonationRisk && (
          <span className="danger">🚨 疑似假代币</span>
        )}
      </div>
    </div>
  );
}
```

### 2.3 恶意合约检测

```typescript
// ==================== 合约安全扫描 ====================

interface ContractSecurityReport {
  address: string;
  score: number; // 0-100
  risks: RiskItem[];
  verified: boolean;
  audited: boolean;
  proxy: boolean;
  selfdestruct: boolean;
  mintable: boolean;
  pausable: boolean;
}

class ContractSecurityScanner {
  private provider: ethers.Provider;
  
  // 危险函数签名
  private readonly DANGEROUS_SIGNATURES = [
    'selfdestruct(address)', // 自毁
    'delegatecall(bytes)',   // 委托调用
    'call(bytes)',           // 低级调用
    'callcode(bytes)',       // 已废弃
    'transferOwnership(address)', // 所有权转移
    'renounceOwnership()',   // 放弃所有权
  ];
  
  // 扫描合约
  async scanContract(address: string): Promise<ContractSecurityReport> {
    const report: ContractSecurityReport = {
      address,
      score: 100,
      risks: [],
      verified: false,
      audited: false,
      proxy: false,
      selfdestruct: false,
      mintable: false,
      pausable: false
    };
    
    // 1. 获取合约字节码
    const code = await this.provider.getCode(address);
    
    if (code === '0x') {
      throw new Error('Not a contract address');
    }
    
    // 2. 检查是否为代理合约
    report.proxy = this.detectProxy(code);
    if (report.proxy) {
      report.score -= 10;
      report.risks.push({
        severity: 'medium',
        type: 'PROXY_CONTRACT',
        description: '代理合约，实际逻辑可能在其他地址'
      });
    }
    
    // 3. 检查自毁功能
    report.selfdestruct = this.hasSelfdestruct(code);
    if (report.selfdestruct) {
      report.score -= 30;
      report.risks.push({
        severity: 'high',
        type: 'SELFDESTRUCT',
        description: '合约包含自毁功能，资金可能永久丢失'
      });
    }
    
    // 4. 检查可暂停
    report.pausable = this.hasPausable(code);
    if (report.pausable) {
      report.score -= 5;
      report.risks.push({
        severity: 'low',
        type: 'PAUSABLE',
        description: '合约可被暂停，功能可能受限'
      });
    }
    
    // 5. 检查可增发
    report.mintable = this.hasMintFunction(code);
    if (report.mintable) {
      report.score -= 10;
      report.risks.push({
        severity: 'medium',
        type: 'MINTABLE',
        description: '代币可增发，可能导致通胀'
      });
    }
    
    // 6. 检查白名单
    report.verified = isWhitelistedContract(address);
    if (!report.verified) {
      report.score -= 20;
      report.risks.push({
        severity: 'high',
        type: 'UNVERIFIED',
        description: '合约未经验证，风险未知'
      });
    }
    
    return report;
  }
  
  private hasSelfdestruct(bytecode: string): boolean {
    // SELFDESTRUCT 操作码: 0xff
    return bytecode.includes('ff');
  }
  
  private detectProxy(bytecode: string): boolean {
    // 代理合约特征：delegatecall 和 EIP-1967 存储槽
    const proxyPatterns = [
      '360894a13ba1a3210667c828492db98dca3e2076cc3735a920a3ca505d382bbc', // EIP-1967
      '7050c9e0f4ca769c69bd3a8ef740bc37934f8e2c036e5a723fd8ee048ed3f8c3'  // EIP-1822
    ];
    
    return proxyPatterns.some(pattern => 
      bytecode.toLowerCase().includes(pattern)
    );
  }
  
  private hasPausable(bytecode: string): boolean {
    // 检查 pause/unpause 函数选择器
    const pausableSigs = ['8456cb59', '3f4ba83a']; // pause(), unpause()
    return pausableSigs.some(sig => bytecode.includes(sig));
  }
  
  private hasMintFunction(bytecode: string): boolean {
    // mint 函数选择器
    const mintSigs = ['40c10f19', 'a0712d68']; // mint(address,uint256)
    return mintSigs.some(sig => bytecode.includes(sig));
  }
}

// ==================== 安全评分显示 ====================

function SecurityScoreBadge({ report }: { report: ContractSecurityReport }) {
  const getColor = () => {
    if (report.score >= 80) return 'green';
    if (report.score >= 60) return 'yellow';
    if (report.score >= 40) return 'orange';
    return 'red';
  };
  
  const getLabel = () => {
    if (report.score >= 80) return '安全';
    if (report.score >= 60) return '一般';
    if (report.score >= 40) return '风险';
    return '危险';
  };
  
  return (
    <div className={`security-score ${getColor()}`}>
      <span className="score-value">{report.score}</span>
      <span className="score-label">{getLabel()}</span>
      
      {report.risks.length > 0 && (
        <div className="risk-list">
          {report.risks.map((risk, i) => (
            <div key={i} className={`risk-item ${risk.severity}`}>
              <span className="risk-type">{risk.type}</span>
              <span className="risk-desc">{risk.description}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

### 2.4 前端篡改检测

```typescript
// ==================== 完整性验证 ====================

class FrontendIntegrityChecker {
  private readonly SRI_HASHES: Record<string, string> = {
    'main.js': 'sha384-abc123...',
    'vendor.js': 'sha384-def456...',
    'styles.css': 'sha384-ghi789...'
  };
  
  // 检查资源完整性
  async checkIntegrity(): Promise<boolean> {
    const scripts = document.querySelectorAll('script[src]');
    const links = document.querySelectorAll('link[rel="stylesheet"]');
    
    let allValid = true;
    
    // 检查脚本
    for (const script of scripts) {
      const src = script.getAttribute('src');
      const integrity = script.getAttribute('integrity');
      
      if (!integrity) {
        console.warn(`Script ${src} lacks integrity hash`);
        allValid = false;
      }
    }
    
    // 检查关键变量是否被篡改
    if (!this.checkGlobalVars()) {
      this.handleTampering('GLOBAL_VARS');
      allValid = false;
    }
    
    return allValid;
  }
  
  // 检查全局变量
  private checkGlobalVars(): boolean {
    // 检查关键配置是否被修改
    const criticalVars = ['CONTRACT_CONFIG', 'RPC_CONFIG'];
    
    for (const varName of criticalVars) {
      if (!(varName in window)) {
        return false;
      }
    }
    
    return true;
  }
  
  // 处理篡改检测
  private handleTampering(type: string): void {
    console.error(`Frontend tampering detected: ${type}`);
    
    // 上报安全事件
    this.reportSecurityEvent({
      type: 'FRONTEND_TAMPERING',
      details: type,
      timestamp: Date.now(),
      url: window.location.href
    });
    
    // 显示警告
    this.showTamperingWarning();
  }
  
  private showTamperingWarning(): void {
    const overlay = document.createElement('div');
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.9);
      z-index: 999999;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      color: white;
      font-family: sans-serif;
    `;
    
    overlay.innerHTML = `
      <h1>🚨 安全警告</h1>
      <p>检测到前端代码可能被篡改。</p>
      <p>为保护您的资产安全，请刷新页面或访问官方网址。</p>
      <button onclick="location.reload()">刷新页面</button>
    `;
    
    document.body.appendChild(overlay);
  }
  
  private reportSecurityEvent(event: SecurityEvent): void {
    fetch('https://security.echo-protocol.io/report', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(event)
    }).catch(() => {});
  }
}

// ==================== 运行时保护 ====================

// 防止控制台操作
(function() {
  // 检测开发者工具
  const threshold = 160;
  
  const detectDevTools = () => {
    const widthThreshold = window.outerWidth - window.innerWidth > threshold;
    const heightThreshold = window.outerHeight - window.innerHeight > threshold;
    
    if (widthThreshold || heightThreshold) {
      console.warn('Developer tools detected');
      // 可以在这里添加额外的安全措施
    }
  };
  
  window.addEventListener('resize', detectDevTools);
})();

// 冻结关键配置对象
Object.freeze(CONTRACT_CONFIG);
Object.freeze(CONTRACT_WHITELIST);
```

---

**文档版本**: 1.0  
**最后更新**: 2026-03-13
