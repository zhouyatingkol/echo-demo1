# ECHO Protocol 输入验证规则

## 1. 概述

输入验证是防止安全漏洞的第一道防线。所有用户输入都必须经过严格的验证和净化处理。

## 2. 验证原则

### 2.1 核心原则
- **白名单验证**: 只允许已知的良好输入
- **拒绝黑名单**: 不依赖黑名单（容易绕过）
- **服务器端验证**: 前端验证仅为用户体验，服务器必须重新验证
- **分层验证**: 多层验证，层层把关

### 2.2 验证流程
```
输入 → 类型检查 → 格式验证 → 范围检查 → 业务规则 → 净化输出
  ↓        ↓           ↓           ↓           ↓          ↓
字符串  正则匹配    长度检查    数值范围    业务逻辑   DOMPurify
```

## 3. 输入类型验证规则

### 3.1 以太坊地址验证

```typescript
// 地址验证规则
interface AddressValidation {
  // 基础格式验证
  format: /^0x[a-fA-F0-9]{40}$/;
  
  // 校验和验证 (EIP-55)
  checksum: boolean;
  
  // 白名单验证
  whitelist: string[];
  
  // 零地址检查
  rejectZeroAddress: true;
  
  // 合约地址 vs EOA 验证
  contractCheck: boolean;
}

// 实现代码
class AddressValidator {
  private ZERO_ADDRESS = '0x0000000000000000000000000000000000000000';
  
  // 基础格式验证
  static isValidFormat(address: string): boolean {
    return /^0x[a-fA-F0-9]{40}$/.test(address);
  }
  
  // EIP-55 校验和验证
  static isValidChecksum(address: string): boolean {
    try {
      const normalized = ethers.getAddress(address);
      return normalized === address || address === address.toLowerCase();
    } catch {
      return false;
    }
  }
  
  // 完整验证
  static validate(address: string, options?: ValidationOptions): ValidationResult {
    // 1. 空值检查
    if (!address || typeof address !== 'string') {
      return { valid: false, error: 'ADDRESS_EMPTY' };
    }
    
    // 2. 基础格式
    if (!this.isValidFormat(address)) {
      return { valid: false, error: 'ADDRESS_INVALID_FORMAT' };
    }
    
    // 3. 零地址检查
    if (address.toLowerCase() === this.ZERO_ADDRESS.toLowerCase()) {
      return { valid: false, error: 'ADDRESS_ZERO_NOT_ALLOWED' };
    }
    
    // 4. 校验和验证 (可选)
    if (options?.strict && !this.isValidChecksum(address)) {
      return { valid: false, error: 'ADDRESS_INVALID_CHECKSUM' };
    }
    
    // 5. 白名单验证
    if (options?.whitelist && !options.whitelist.includes(address.toLowerCase())) {
      return { valid: false, error: 'ADDRESS_NOT_IN_WHITELIST' };
    }
    
    return { valid: true, normalized: ethers.getAddress(address) };
  }
}
```

### 3.2 代币数量验证

```typescript
// 数量验证规则
interface AmountValidation {
  // 数值类型
  type: 'decimal' | 'integer';
  
  // 小数位数
  decimals: number;
  
  // 最小值
  min: BigNumber;
  
  // 最大值
  max: BigNumber;
  
  // 精度检查
  precision: number;
}

// 实现代码
class AmountValidator {
  // 验证代币数量
  static validate(
    amount: string | number, 
    decimals: number = 18,
    options?: AmountOptions
  ): ValidationResult {
    // 1. 类型检查
    if (typeof amount !== 'string' && typeof amount !== 'number') {
      return { valid: false, error: 'AMOUNT_INVALID_TYPE' };
    }
    
    // 2. 格式检查
    const amountStr = amount.toString();
    if (!/^\d*\.?\d+$/.test(amountStr)) {
      return { valid: false, error: 'AMOUNT_INVALID_FORMAT' };
    }
    
    // 3. 小数位数检查
    const parts = amountStr.split('.');
    if (parts[1] && parts[1].length > decimals) {
      return { 
        valid: false, 
        error: 'AMOUNT_TOO_MANY_DECIMALS',
        message: `Maximum ${decimals} decimal places allowed`
      };
    }
    
    // 4. 转换为 BigNumber
    let value: BigNumber;
    try {
      value = ethers.parseUnits(amountStr, decimals);
    } catch {
      return { valid: false, error: 'AMOUNT_PARSE_ERROR' };
    }
    
    // 5. 范围检查
    const min = options?.min ?? BigNumber.from(0);
    const max = options?.max ?? ethers.parseUnits('1000000000', decimals);
    
    if (value.lt(min)) {
      return { valid: false, error: 'AMOUNT_BELOW_MIN' };
    }
    
    if (value.gt(max)) {
      return { valid: false, error: 'AMOUNT_ABOVE_MAX' };
    }
    
    // 6. 零值检查
    if (value.eq(0) && !options?.allowZero) {
      return { valid: false, error: 'AMOUNT_ZERO_NOT_ALLOWED' };
    }
    
    return { valid: true, value };
  }
  
  // 验证转账金额 (考虑余额和Gas)
  static validateTransfer(
    amount: string,
    balance: BigNumber,
    gasEstimate: BigNumber,
    gasPrice: BigNumber,
    decimals: number = 18
  ): ValidationResult {
    const amountResult = this.validate(amount, decimals);
    if (!amountResult.valid) return amountResult;
    
    const totalNeeded = amountResult.value.add(gasEstimate.mul(gasPrice));
    
    if (totalNeeded.gt(balance)) {
      return { 
        valid: false, 
        error: 'INSUFFICIENT_BALANCE',
        message: '余额不足以支付转账金额和Gas费'
      };
    }
    
    return amountResult;
  }
}
```

### 3.3 NFT ID 验证

```typescript
// NFT ID 验证
class NFTIdValidator {
  static validate(tokenId: string | number): ValidationResult {
    // 1. 类型检查
    if (typeof tokenId !== 'string' && typeof tokenId !== 'number') {
      return { valid: false, error: 'TOKEN_ID_INVALID_TYPE' };
    }
    
    // 2. 格式检查
    const idStr = tokenId.toString();
    if (!/^\d+$/.test(idStr)) {
      return { valid: false, error: 'TOKEN_ID_INVALID_FORMAT' };
    }
    
    // 3. 范围检查
    const id = BigNumber.from(idStr);
    
    if (id.lt(0)) {
      return { valid: false, error: 'TOKEN_ID_NEGATIVE' };
    }
    
    if (id.gt(ethers.MaxUint256)) {
      return { valid: false, error: 'TOKEN_ID_TOO_LARGE' };
    }
    
    return { valid: true, value: id };
  }
}
```

### 3.4 价格输入验证

```typescript
// 价格验证
class PriceValidator {
  // 价格范围配置
  static PRICE_LIMITS = {
    MIN_PRICE: ethers.parseUnits('0.000001', 18), // 最小价格
    MAX_PRICE: ethers.parseUnits('1000000', 18),   // 最大价格
    MAX_DECIMALS: 18                                // 最大小数位
  };
  
  static validate(
    price: string,
    currency: string,
    options?: PriceOptions
  ): ValidationResult {
    // 1. 基础验证
    if (!price || typeof price !== 'string') {
      return { valid: false, error: 'PRICE_EMPTY' };
    }
    
    // 2. 数值格式
    const numericPrice = parseFloat(price);
    if (isNaN(numericPrice) || !isFinite(numericPrice)) {
      return { valid: false, error: 'PRICE_INVALID_NUMBER' };
    }
    
    // 3. 价格范围
    const priceBN = ethers.parseUnits(price, 18);
    
    if (priceBN.lt(this.PRICE_LIMITS.MIN_PRICE)) {
      return { valid: false, error: 'PRICE_TOO_LOW' };
    }
    
    if (priceBN.gt(this.PRICE_LIMITS.MAX_PRICE)) {
      return { valid: false, error: 'PRICE_TOO_HIGH' };
    }
    
    // 4. 小数位数
    const decimals = (price.split('.')[1] || '').length;
    if (decimals > this.PRICE_LIMITS.MAX_DECIMALS) {
      return { valid: false, error: 'PRICE_TOO_MANY_DECIMALS' };
    }
    
    // 5. 价格异常检测 (偏离市场价过大)
    if (options?.marketPrice) {
      const marketBN = ethers.parseUnits(options.marketPrice, 18);
      const deviation = priceBN.mul(100).div(marketBN);
      
      if (deviation.gt(150) || deviation.lt(50)) {
        return {
          valid: true,
          warning: 'PRICE_DEVIATION_HIGH',
          message: '价格偏离市场价超过50%，请确认'
        };
      }
    }
    
    return { valid: true, value: priceBN };
  }
}
```

## 4. XSS 防护规则

### 4.1 输入净化

```typescript
// XSS 防护配置
const XSS_PROTECTION = {
  // DOMPurify 配置
  domPurifyConfig: {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br'],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
    SANITIZE_DOM: true
  },
  
  // 需要编码的上下文
  encodingContexts: {
    html: 'html',
    attribute: 'attribute',
    url: 'url',
    css: 'css',
    javascript: 'javascript'
  }
};

// 输入净化器
class InputSanitizer {
  // HTML 内容净化
  static sanitizeHTML(input: string): string {
    if (typeof input !== 'string') return '';
    return DOMPurify.sanitize(input, XSS_PROTECTION.domPurifyConfig);
  }
  
  // 纯文本提取
  static toPlainText(input: string): string {
    if (typeof input !== 'string') return '';
    const div = document.createElement('div');
    div.innerHTML = DOMPurify.sanitize(input);
    return div.textContent || div.innerText || '';
  }
  
  // HTML 属性编码
  static encodeAttribute(input: string): string {
    return input
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }
  
  // JavaScript 字符串编码
  static encodeJS(input: string): string {
    return JSON.stringify(input).slice(1, -1);
  }
  
  // URL 验证和编码
  static sanitizeURL(url: string): string | null {
    if (typeof url !== 'string') return null;
    
    // 只允许 http/https
    const allowedProtocols = ['http:', 'https:'];
    
    try {
      const parsed = new URL(url);
      if (!allowedProtocols.includes(parsed.protocol)) {
        return null;
      }
      return parsed.toString();
    } catch {
      return null;
    }
  }
}
```

### 4.2 React 安全绑定

```typescript
// React 安全组件
import React from 'react';
import DOMPurify from 'dompurify';

// 安全的 HTML 渲染组件
interface SafeHTMLProps {
  content: string;
  allowedTags?: string[];
  className?: string;
}

export const SafeHTML: React.FC<SafeHTMLProps> = ({ 
  content, 
  allowedTags,
  className 
}) => {
  const sanitized = DOMPurify.sanitize(content, {
    ALLOWED_TAGS: allowedTags || ['b', 'i', 'em', 'strong', 'p', 'br', 'span'],
    ALLOWED_ATTR: ['class', 'style']
  });
  
  return <div className={className} dangerouslySetInnerHTML={{ __html: sanitized }} />;
};

// 安全的文本渲染组件
export const SafeText: React.FC<{ text: string }> = ({ text }) => {
  // 使用 textContent 自动转义
  return <span>{text}</span>;
};

// 外部链接安全组件
export const SafeExternalLink: React.FC<{
  href: string;
  children: React.ReactNode;
}> = ({ href, children }) => {
  const sanitizedHref = InputSanitizer.sanitizeURL(href);
  
  if (!sanitizedHref) {
    return <span className="invalid-link">{children}</span>;
  }
  
  return (
    <a 
      href={sanitizedHref}
      target="_blank"
      rel="noopener noreferrer nofollow"
    >
      {children}
    </a>
  );
};
```

## 5. 表单验证规则

### 5.1 通用表单验证

```typescript
// 表单验证规则
const FORM_VALIDATION_RULES = {
  // 用户名
  username: {
    required: true,
    minLength: 3,
    maxLength: 20,
    pattern: /^[a-zA-Z0-9_]+$/,
    messages: {
      required: '用户名不能为空',
      minLength: '用户名至少需要3个字符',
      maxLength: '用户名不能超过20个字符',
      pattern: '用户名只能包含字母、数字和下划线'
    }
  },
  
  // 邮箱
  email: {
    required: true,
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    messages: {
      required: '邮箱不能为空',
      pattern: '请输入有效的邮箱地址'
    }
  },
  
  // 搜索关键词
  searchQuery: {
    maxLength: 100,
    pattern: /^[\w\s\-\u4e00-\u9fa5]*$/, // 允许中文
    messages: {
      maxLength: '搜索关键词过长',
      pattern: '包含非法字符'
    }
  },
  
  // 交易备注
  memo: {
    maxLength: 256,
    sanitize: true,
    messages: {
      maxLength: '备注不能超过256个字符'
    }
  }
};

// 表单验证器
class FormValidator {
  static validateField(
    value: any, 
    rules: ValidationRule
  ): ValidationResult {
    // 必填检查
    if (rules.required && (!value || value.toString().trim() === '')) {
      return { valid: false, error: rules.messages?.required || 'REQUIRED' };
    }
    
    // 空值允许通过
    if (!value) return { valid: true };
    
    const strValue = value.toString();
    
    // 最小长度
    if (rules.minLength && strValue.length < rules.minLength) {
      return { valid: false, error: rules.messages?.minLength || 'TOO_SHORT' };
    }
    
    // 最大长度
    if (rules.maxLength && strValue.length > rules.maxLength) {
      return { valid: false, error: rules.messages?.maxLength || 'TOO_LONG' };
    }
    
    // 模式匹配
    if (rules.pattern && !rules.pattern.test(strValue)) {
      return { valid: false, error: rules.messages?.pattern || 'INVALID_FORMAT' };
    }
    
    // 自定义验证
    if (rules.custom && !rules.custom(value)) {
      return { valid: false, error: rules.messages?.custom || 'INVALID' };
    }
    
    return { valid: true };
  }
  
  static validateForm(
    values: Record<string, any>,
    rules: Record<string, ValidationRule>
  ): FormValidationResult {
    const errors: Record<string, string> = {};
    let isValid = true;
    
    for (const [field, fieldRules] of Object.entries(rules)) {
      const result = this.validateField(values[field], fieldRules);
      if (!result.valid) {
        errors[field] = result.error;
        isValid = false;
      }
    }
    
    return { valid: isValid, errors };
  }
}
```

## 6. 验证工具函数

```typescript
// 验证工具库
export const Validators = {
  // 地址
  address: AddressValidator.validate.bind(AddressValidator),
  
  // 数量
  amount: AmountValidator.validate.bind(AmountValidator),
  
  // NFT ID
  nftId: NFTIdValidator.validate.bind(NFTIdValidator),
  
  // 价格
  price: PriceValidator.validate.bind(PriceValidator),
  
  // 表单字段
  formField: FormValidator.validateField.bind(FormValidator),
  
  // 表单
  form: FormValidator.validateForm.bind(FormValidator),
  
  // 净化
  sanitize: {
    html: InputSanitizer.sanitizeHTML,
    text: InputSanitizer.toPlainText,
    attribute: InputSanitizer.encodeAttribute,
    js: InputSanitizer.encodeJS,
    url: InputSanitizer.sanitizeURL
  }
};

// 使用示例
async function validateTransactionInput(input: TransactionInput) {
  // 验证地址
  const toResult = Validators.address(input.to, { 
    strict: true,
    whitelist: CONTRACT_WHITELIST 
  });
  if (!toResult.valid) throw new Error(toResult.error);
  
  // 验证金额
  const amountResult = Validators.amount(input.amount, 18, {
    min: ethers.parseEther('0.0001'),
    max: ethers.parseEther('1000000')
  });
  if (!amountResult.valid) throw new Error(amountResult.error);
  
  // 验证备注 (净化)
  const sanitizedMemo = Validators.sanitize.text(input.memo || '');
  
  return {
    to: toResult.normalized,
    amount: amountResult.value,
    memo: sanitizedMemo
  };
}
```

## 7. 验证错误代码

| 错误代码 | 说明 | 用户提示 |
|---------|------|----------|
| `ADDRESS_EMPTY` | 地址为空 | 请输入钱包地址 |
| `ADDRESS_INVALID_FORMAT` | 格式不正确 | 地址格式错误，应为0x开头的42位字符串 |
| `ADDRESS_INVALID_CHECKSUM` | 校验和错误 | 地址校验失败，请检查 |
| `ADDRESS_ZERO_NOT_ALLOWED` | 零地址 | 不能使用零地址 |
| `AMOUNT_INVALID_TYPE` | 类型错误 | 金额格式不正确 |
| `AMOUNT_INVALID_FORMAT` | 格式错误 | 请输入有效的数字 |
| `AMOUNT_TOO_MANY_DECIMALS` | 小数位过多 | 小数位不能超过{decimals}位 |
| `AMOUNT_BELOW_MIN` | 低于最小值 | 金额不能低于{min} |
| `AMOUNT_ABOVE_MAX` | 超过最大值 | 金额不能超过{max} |
| `PRICE_DEVIATION_HIGH` | 价格偏离 | 价格偏离市场价较大，请确认 |

---

**文档版本**: 1.0  
**最后更新**: 2026-03-13
