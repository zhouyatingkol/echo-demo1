# ECHO Protocol V4 - API 规范

## 概述

本文档定义 ECHO Protocol V4 前端的 API 接口规范，包括与区块链、IPFS、价格服务等外部服务的交互标准。

---

## 1. API 架构原则

### 1.1 设计原则

```
┌─────────────────────────────────────────────────────────────────┐
│                     API 分层架构                                 │
├─────────────────────────────────────────────────────────────────┤
│  Presentation Layer (React Components)                          │
│                          │                                      │
│                          ▼                                      │
│  Custom Hooks (useAsset, useWallet, usePrice...)               │
│                          │                                      │
│                          ▼                                      │
│  Service Layer (ContractService, IPFSService...)               │
│                          │                                      │
│                          ▼                                      │
│  Network Layer (ethers.js, fetch, axios...)                    │
│                          │                                      │
│                          ▼                                      │
│  External Services (Blockchain, IPFS, Price API...)            │
└─────────────────────────────────────────────────────────────────┘
```

### 1.2 接口命名规范

| 层级 | 命名规则 | 示例 |
|------|----------|------|
| Hooks | `use` + 功能名 | `useAsset`, `useWallet` |
| Services | 功能名 + `Service` | `ContractService`, `IPFSService` |
| API 函数 | 动词 + 名词 | `getAssetById`, `uploadToIPFS` |
| 类型定义 | PascalCase + 后缀 | `AssetData`, `CreateAssetParams` |

---

## 2. 区块链 API 规范

### 2.1 请求/响应格式

#### 标准响应结构
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta?: {
    timestamp: number;
    blockNumber?: number;
    gasUsed?: bigint;
  };
}

// 成功响应示例
const successResponse: ApiResponse<AssetData> = {
  success: true,
  data: { /* ... */ },
  meta: {
    timestamp: Date.now(),
    blockNumber: 12345678
  }
};

// 错误响应示例
const errorResponse: ApiResponse<null> = {
  success: false,
  error: {
    code: 'CONTRACT_CALL_FAILED',
    message: '合约调用失败',
    details: { reason: 'insufficient balance' }
  }
};
```

### 2.2 读取操作 API

#### 资产相关
```typescript
// GET /api/v1/assets
interface GetAssetsRequest {
  page?: number;
  pageSize?: number;
  owner?: string;
  category?: string;
  priceRange?: { min: bigint; max: bigint };
  sortBy?: 'createdAt' | 'price' | 'name';
  sortOrder?: 'asc' | 'desc';
}

interface GetAssetsResponse {
  items: AssetSummary[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// GET /api/v1/assets/:id
interface GetAssetDetailRequest {
  assetId: bigint;
  includeMetadata?: boolean;
}

interface GetAssetDetailResponse {
  asset: AssetData;
  price: PriceData;
  metadata?: AssetMetadata;
  ownerAssets?: bigint[];
}
```

#### 许可证相关
```typescript
// GET /api/v1/licenses
interface GetLicensesRequest {
  owner?: string;
  assetId?: bigint;
  status?: 'active' | 'expired' | 'all';
}

// GET /api/v1/licenses/:id
interface GetLicenseDetailResponse {
  license: LicenseData;
  isValid: boolean;
  remainingTime: bigint;
  assetPreview?: AssetSummary;
}
```

#### 融合相关
```typescript
// GET /api/v1/fusions/:id
interface GetFusionDetailResponse {
  fusion: FusionData;
  componentAssets: AssetSummary[];
  totalDuration: number;
  canBurn: boolean;
}

// POST /api/v1/fusions/preview
interface PreviewFusionRequest {
  assetIds: bigint[];
  weights: number[];
}

interface PreviewFusionResponse {
  preview: FusionPreview;
  estimatedGas: bigint;
  requirements: {
    minAssets: number;
    maxAssets: number;
    minWeight: number;
  };
}
```

### 2.3 写入操作 API

#### 资产操作
```typescript
// POST /api/v1/assets
interface CreateAssetRequest {
  ipfsHash: string;
  priceType: PriceType;
  price: bigint;
  duration: number;
  transferable: boolean;
  category: string;
}

interface CreateAssetResponse {
  transactionHash: string;
  assetId: bigint;
  status: 'pending' | 'confirmed';
  estimatedConfirmationTime: number;
}

// POST /api/v1/assets/:id/purchase
interface PurchaseAssetRequest {
  assetId: bigint;
  value: bigint;
}

// POST /api/v1/assets/:id/transfer
interface TransferAssetRequest {
  assetId: bigint;
  to: string;
}

// POST /api/v1/assets/:id/price
interface UpdatePriceRequest {
  assetId: bigint;
  priceType: PriceType;
  newPrice: bigint;
}
```

#### 许可证操作
```typescript
// POST /api/v1/licenses
interface IssueLicenseRequest {
  to: string;
  assetId: bigint;
  price: bigint;
  duration: number;
  transferable: boolean;
  commercialUse: boolean;
}

// POST /api/v1/licenses/:id/renew
interface RenewLicenseRequest {
  licenseId: bigint;
  additionalDuration: number;
  additionalValue: bigint;
}
```

---

## 3. 错误码定义

### 3.1 错误码结构

```typescript
interface ErrorCode {
  code: string;           // 错误码
  message: string;        // 错误消息
  category: ErrorCategory;
  httpStatus?: number;    // 对应 HTTP 状态码
  recoverable: boolean;   // 是否可恢复
}

type ErrorCategory = 
  | 'WALLET'      // 钱包相关
  | 'CONTRACT'    // 合约相关
  | 'NETWORK'     // 网络相关
  | 'VALIDATION'  // 验证相关
  | 'IPFS'        // IPFS 相关
  | 'SYSTEM';     // 系统错误
```

### 3.2 错误码列表

#### 钱包错误 (WALLET)
| 错误码 | 消息 | 说明 | 恢复建议 |
|--------|------|------|----------|
| `WALLET_NOT_INSTALLED` | 未检测到钱包插件 | MetaMask 等未安装 | 引导用户安装 |
| `WALLET_NOT_CONNECTED` | 钱包未连接 | 需要连接钱包 | 显示连接按钮 |
| `WALLET_REJECTED` | 用户拒绝了请求 | 用户主动取消 | 无需处理 |
| `WALLET_WRONG_NETWORK` | 网络错误 | 当前网络不支持 | 引导切换网络 |
| `WALLET_LOCKED` | 钱包已锁定 | 需要解锁 | 提示解锁钱包 |
| `WALLET_TIMEOUT` | 钱包响应超时 | 操作超时 | 提示重试 |

#### 合约错误 (CONTRACT)
| 错误码 | 消息 | 说明 | 恢复建议 |
|--------|------|------|----------|
| `CONTRACT_CALL_FAILED` | 合约调用失败 | 通用错误 | 检查参数重试 |
| `CONTRACT_INSUFFICIENT_BALANCE` | 余额不足 | 代币/MERE 不足 | 提示充值 |
| `CONTRACT_ASSET_NOT_FOUND` | 资产不存在 | 资产 ID 无效 | 检查资产 ID |
| `CONTRACT_ASSET_LOCKED` | 资产已锁定 | 无法操作 | 等待解锁 |
| `CONTRACT_NOT_OWNER` | 非资产所有者 | 权限不足 | 切换账户 |
| `CONTRACT_PRICE_EXPIRED` | 价格已过期 | 价格信息过期 | 刷新数据 |
| `CONTRACT_LICENSE_INVALID` | 许可证无效 | 已过期或不存在 | 重新授权 |
| `CONTRACT_FUSION_FAILED` | 融合失败 | 参数错误 | 检查融合条件 |

#### 网络错误 (NETWORK)
| 错误码 | 消息 | 说明 | 恢复建议 |
|--------|------|------|----------|
| `NETWORK_TIMEOUT` | 网络请求超时 | RPC 节点无响应 | 切换节点重试 |
| `NETWORK_DISCONNECTED` | 网络连接断开 | 无网络连接 | 检查网络 |
| `NETWORK_RPC_ERROR` | RPC 节点错误 | 节点故障 | 切换备用节点 |
| `NETWORK_RATE_LIMIT` | 请求过于频繁 | 被限流 | 稍后重试 |

#### 验证错误 (VALIDATION)
| 错误码 | 消息 | 说明 | 恢复建议 |
|--------|------|------|----------|
| `VALIDATION_INVALID_ADDRESS` | 无效地址 | 地址格式错误 | 检查地址格式 |
| `VALIDATION_INVALID_AMOUNT` | 无效金额 | 金额格式错误 | 检查金额 |
| `VALIDATION_INVALID_DURATION` | 无效时长 | 时长超出范围 | 检查时长参数 |
| `VALIDATION_INVALID_IPFS_HASH` | 无效 IPFS Hash | Hash 格式错误 | 检查 IPFS Hash |

#### IPFS 错误 (IPFS)
| 错误码 | 消息 | 说明 | 恢复建议 |
|--------|------|------|----------|
| `IPFS_UPLOAD_FAILED` | IPFS 上传失败 | 网络或配额问题 | 重试或检查配额 |
| `IPFS_FETCH_FAILED` | IPFS 获取失败 | 网关问题 | 切换网关重试 |
| `IPFS_PIN_FAILED` | IPFS 固定失败 | Pinata 服务问题 | 重试 |
| `IPFS_METADATA_INVALID` | 元数据格式错误 | JSON 解析失败 | 检查元数据 |

### 3.3 错误处理示例

```typescript
// lib/errors.ts
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public category: ErrorCategory,
    public recoverable: boolean = false,
    public originalError?: unknown
  ) {
    super(message);
    this.name = 'AppError';
  }
}

// 错误码映射
export const ERROR_CODES: Record<string, ErrorCode> = {
  WALLET_NOT_CONNECTED: {
    code: 'WALLET_NOT_CONNECTED',
    message: '请先连接钱包',
    category: 'WALLET',
    recoverable: true
  },
  CONTRACT_INSUFFICIENT_BALANCE: {
    code: 'CONTRACT_INSUFFICIENT_BALANCE',
    message: '余额不足',
    category: 'CONTRACT',
    recoverable: true
  },
  // ... 更多错误码
};

// 错误转换函数
export function parseContractError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  
  const message = error instanceof Error ? error.message : String(error);
  
  // 解析常见错误
  if (message.includes('insufficient funds')) {
    return new AppError(
      'CONTRACT_INSUFFICIENT_BALANCE',
      '余额不足，请先充值',
      'CONTRACT',
      true,
      error
    );
  }
  
  if (message.includes('user rejected')) {
    return new AppError(
      'WALLET_REJECTED',
      '您已取消操作',
      'WALLET',
      false,
      error
    );
  }
  
  // 默认错误
  return new AppError(
    'UNKNOWN_ERROR',
    '发生未知错误，请稍后重试',
    'SYSTEM',
    true,
    error
  );
}
```

---

## 4. 认证机制

### 4.1 钱包签名认证

```typescript
// services/auth.service.ts
interface AuthChallenge {
  message: string;
  nonce: string;
  timestamp: number;
  expiresAt: number;
}

interface AuthToken {
  token: string;
  expiresAt: number;
  address: string;
}

class AuthService {
  private token: AuthToken | null = null;
  
  // 请求挑战
  async requestChallenge(address: string): Promise<AuthChallenge> {
    const response = await fetch('/api/v1/auth/challenge', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ address })
    });
    
    return response.json();
  }
  
  // 验证签名
  async verifySignature(
    challenge: AuthChallenge,
    signature: string
  ): Promise<AuthToken> {
    const response = await fetch('/api/v1/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: challenge.message,
        signature,
        address: useWalletStore.getState().address
      })
    });
    
    const token = await response.json();
    this.token = token;
    return token;
  }
  
  // 完整认证流程
  async authenticate(): Promise<AuthToken> {
    const { address, signer } = useWalletStore.getState();
    if (!address || !signer) {
      throw new AppError(
        'WALLET_NOT_CONNECTED',
        '请先连接钱包',
        'WALLET',
        true
      );
    }
    
    // 1. 获取挑战
    const challenge = await this.requestChallenge(address);
    
    // 2. 签名
    const signature = await signer.signMessage(challenge.message);
    
    // 3. 验证
    const token = await this.verifySignature(challenge, signature);
    
    return token;
  }
  
  // 获取当前 token
  getToken(): string | null {
    if (!this.token) return null;
    
    // 检查是否过期
    if (Date.now() > this.token.expiresAt) {
      this.token = null;
      return null;
    }
    
    return this.token.token;
  }
  
  // 清除认证
  logout(): void {
    this.token = null;
  }
}

export const authService = new AuthService();
```

### 4.2 API 请求拦截

```typescript
// api/client.ts
const apiClient = {
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const token = authService.getToken();
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers
    };
    
    // 添加认证头
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    
    // 添加钱包地址头（用于无认证请求）
    const { address } = useWalletStore.getState();
    if (address) {
      headers['X-Wallet-Address'] = address;
    }
    
    const response = await fetch(`/api/v1${endpoint}`, {
      ...options,
      headers
    });
    
    const data = await response.json();
    
    // 处理认证过期
    if (response.status === 401) {
      authService.logout();
      // 触发重新认证
    }
    
    return data;
  },
  
  get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  },
  
  post<T>(endpoint: string, body: unknown) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body)
    });
  }
};
```

---

## 5. 实时数据 API (WebSocket)

### 5.1 连接管理

```typescript
// services/websocket.service.ts
interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
}

type WebSocketMessageType = 
  | 'price_update'
  | 'transaction_status'
  | 'asset_event'
  | 'ping'
  | 'pong';

interface WebSocketMessage {
  type: WebSocketMessageType;
  payload: unknown;
  timestamp: number;
}

class WebSocketService {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private heartbeatTimer: number | null = null;
  private listeners: Map<string, Set<(data: unknown) => void>> = new Map();
  
  constructor(private config: WebSocketConfig) {}
  
  connect(): void {
    this.ws = new WebSocket(this.config.url);
    
    this.ws.onopen = () => {
      console.log('WebSocket connected');
      this.reconnectAttempts = 0;
      this.startHeartbeat();
      
      // 订阅频道
      this.subscribeToChannels();
    };
    
    this.ws.onmessage = (event) => {
      const message: WebSocketMessage = JSON.parse(event.data);
      this.handleMessage(message);
    };
    
    this.ws.onclose = () => {
      console.log('WebSocket closed');
      this.stopHeartbeat();
      this.attemptReconnect();
    };
    
    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
    };
  }
  
  private startHeartbeat(): void {
    this.heartbeatTimer = window.setInterval(() => {
      this.send({ type: 'ping', payload: {}, timestamp: Date.now() });
    }, this.config.heartbeatInterval);
  }
  
  private stopHeartbeat(): void {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer);
      this.heartbeatTimer = null;
    }
  }
  
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= this.config.maxReconnectAttempts) {
      console.error('Max reconnect attempts reached');
      return;
    }
    
    this.reconnectAttempts++;
    setTimeout(() => {
      console.log(`Reconnecting... (${this.reconnectAttempts})`);
      this.connect();
    }, this.config.reconnectInterval);
  }
  
  private handleMessage(message: WebSocketMessage): void {
    // 处理心跳
    if (message.type === 'ping') {
      this.send({ type: 'pong', payload: {}, timestamp: Date.now() });
      return;
    }
    
    // 通知监听器
    const listeners = this.listeners.get(message.type);
    if (listeners) {
      listeners.forEach(callback => callback(message.payload));
    }
  }
  
  subscribe(type: WebSocketMessageType, callback: (data: unknown) => void): () => void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    
    this.listeners.get(type)!.add(callback);
    
    // 返回取消订阅函数
    return () => {
      this.listeners.get(type)?.delete(callback);
    };
  }
  
  send(message: WebSocketMessage): void {
    if (this.ws?.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    }
  }
  
  private subscribeToChannels(): void {
    const { address } = useWalletStore.getState();
    if (address) {
      this.send({
        type: 'subscribe',
        payload: { address },
        timestamp: Date.now()
      });
    }
  }
  
  disconnect(): void {
    this.stopHeartbeat();
    this.ws?.close();
    this.ws = null;
  }
}

export const wsService = new WebSocketService({
  url: 'wss://api.echo-protocol.io/ws',
  reconnectInterval: 3000,
  maxReconnectAttempts: 5,
  heartbeatInterval: 30000
});
```

### 5.2 价格实时更新

```typescript
// hooks/useRealtimePrice.ts
export function useRealtimePrice(assetId: bigint) {
  const [price, setPrice] = useState<PriceData | null>(null);
  
  useEffect(() => {
    // 先获取初始价格
    fetchPrice(assetId).then(setPrice);
    
    // 订阅实时更新
    const unsubscribe = wsService.subscribe('price_update', (data: PriceUpdate) => {
      if (data.assetId === assetId) {
        setPrice(data.price);
      }
    });
    
    return unsubscribe;
  }, [assetId]);
  
  return price;
}

// 批量订阅多个资产价格
export function useRealtimePrices(assetIds: bigint[]) {
  const [prices, setPrices] = useState<Map<bigint, PriceData>>(new Map());
  
  useEffect(() => {
    const unsubscribe = wsService.subscribe('price_update', (data: PriceUpdate) => {
      if (assetIds.includes(data.assetId)) {
        setPrices(prev => new Map([...prev, [data.assetId, data.price]]));
      }
    });
    
    return unsubscribe;
  }, [assetIds.join(',')]);
  
  return prices;
}
```

---

## 6. API 版本管理

### 6.1 URL 版本控制

```
/api/v1/assets          # v1 版本
/api/v2/assets          # v2 版本（未来）
```

### 6.2 向后兼容策略

```typescript
// api/versioning.ts
const API_VERSION = 'v1';

export function getApiUrl(endpoint: string): string {
  return `/api/${API_VERSION}${endpoint}`;
}

// 版本检测
export async function checkApiVersion(): Promise<string> {
  const response = await fetch('/api/version');
  const { version, minClientVersion } = await response.json();
  
  if (minClientVersion > CURRENT_CLIENT_VERSION) {
    // 提示用户更新
    console.warn('API version mismatch, please update client');
  }
  
  return version;
}
```

---

## 7. 速率限制

### 7.1 限制规则

| 端点类型 | 限制 | 说明 |
|----------|------|------|
| 读取操作 | 100 req/min | 普通查询 |
| 写入操作 | 10 req/min | 交易提交 |
| IPFS 上传 | 5 req/min | 文件上传 |
| WebSocket | 无限制 | 实时数据 |

### 7.2 限流处理

```typescript
// lib/ratelimit.ts
interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetAt: number;
}

export function parseRateLimit(headers: Headers): RateLimitInfo {
  return {
    limit: parseInt(headers.get('X-RateLimit-Limit') || '0'),
    remaining: parseInt(headers.get('X-RateLimit-Remaining') || '0'),
    resetAt: parseInt(headers.get('X-RateLimit-Reset') || '0') * 1000
  };
}

export function shouldRetryAfterRateLimit(info: RateLimitInfo): number {
  if (info.remaining > 0) return 0;
  return Math.max(0, info.resetAt - Date.now());
}
```

---

## 8. API 文档生成

使用 TypeScript 类型自动生成 API 文档：

```typescript
// 类型即文档
/**
 * @api {get} /assets/:id 获取资产详情
 * @apiName GetAssetDetail
 * @apiGroup Assets
 * 
 * @apiParam {String} id 资产 ID
 * @apiQuery {Boolean} includeMetadata 是否包含元数据
 * 
 * @apiSuccess {Object} asset 资产数据
 * @apiSuccess {String} asset.id 资产 ID
 * @apiSuccess {String} asset.owner 所有者地址
 * @apiSuccess {BigInt} asset.price 当前价格
 */
```
