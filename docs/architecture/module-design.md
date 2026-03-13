# ECHO Protocol V4 - 核心模块设计

## 概述

本文档详细描述 ECHO Protocol V4 前端应用的四个核心模块：
- 模块 A: 钱包模块
- 模块 B: 合约交互模块
- 模块 C: 数据管理模块
- 模块 D: UI 状态模块

---

## 模块 A: 钱包模块 (Wallet Module)

### 架构图
```
┌─────────────────────────────────────────────────────────────────┐
│                     Wallet Module                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │ Connection  │  │   Network   │  │       Balance           │ │
│  │  Manager    │  │   Manager   │  │        Manager          │ │
│  └──────┬──────┘  └──────┬──────┘  └────────────┬────────────┘ │
│         │                │                      │              │
│         └────────────────┴──────────────────────┘              │
│                          │                                     │
│                    ┌─────┴─────┐                               │
│                    │  Zustand  │                               │
│                    │   Store   │                               │
│                    └─────┬─────┘                               │
│                          │                                     │
│                    ┌─────┴─────┐                               │
│                    │  ethers   │                               │
│                    │    v6     │                               │
│                    └─────┬─────┘                               │
│                          │                                     │
│                    ┌─────┴─────┐                               │
│                    │  Wallet   │                               │
│                    │ Providers │                               │
│                    │(MetaMask...)│                              │
│                    └───────────┘                               │
└─────────────────────────────────────────────────────────────────┘
```

### 功能规格

#### A1. 钱包连接/断开
```typescript
// store/slices/walletStore.ts
interface WalletState {
  // 状态
  address: string | null;
  isConnected: boolean;
  isConnecting: boolean;
  chainId: number | null;
  provider: BrowserProvider | null;
  signer: JsonRpcSigner | null;
  
  // 方法
  connect: () => Promise<void>;
  disconnect: () => void;
  switchAccount: () => Promise<void>;
}
```

**连接流程**:
```
1. 检测 window.ethereum
2. 请求账户授权 (eth_requestAccounts)
3. 创建 BrowserProvider
4. 获取 Signer
5. 查询 chainId 和 balance
6. 更新全局状态
7. 监听账户/网络变化
```

**断开流程**:
```
1. 清除本地状态
2. 移除事件监听
3. 重置 provider/signer
```

#### A2. 网络切换
```typescript
interface NetworkConfig {
  chainId: number;
  name: string;
  rpcUrl: string;
  nativeCurrency: {
    name: string;
    symbol: string;
    decimals: number;
  };
  blockExplorerUrl?: string;
}

// Qitmeer 主网配置
const QITMEER_MAINNET: NetworkConfig = {
  chainId: 813,  // 0x32D
  name: 'Qitmeer Mainnet',
  rpcUrl: 'https://mainnet.qitmeer.io',
  nativeCurrency: {
    name: 'MEER',
    symbol: 'MEER',
    decimals: 18
  },
  blockExplorerUrl: 'https://explorer.qitmeer.io'
};

// Qitmeer 测试网配置
const QITMEER_TESTNET: NetworkConfig = {
  chainId: 8131,  // 0x1FC3
  name: 'Qitmeer Testnet',
  rpcUrl: 'https://testnet.qitmeer.io',
  nativeCurrency: {
    name: 'MEER',
    symbol: 'MEER',
    decimals: 18
  },
  blockExplorerUrl: 'https://testnet-explorer.qitmeer.io'
};
```

**网络切换流程**:
```
1. 调用 wallet_switchEthereumChain
2. 若网络未添加，调用 wallet_addEthereumChain
3. 等待 chainChanged 事件
4. 更新 store 中的 chainId
5. 重新初始化合约实例
```

#### A3. 余额查询
```typescript
// hooks/useBalance.ts
export function useBalance(tokenAddress?: string) {
  const { address, provider } = useWalletStore();
  
  return useQuery({
    queryKey: ['balance', address, tokenAddress],
    queryFn: async () => {
      if (!address || !provider) return null;
      
      if (!tokenAddress) {
        // 原生代币余额
        return await provider.getBalance(address);
      }
      
      // ERC20 代币余额
      const contract = new Contract(tokenAddress, ERC20_ABI, provider);
      return await contract.balanceOf(address);
    },
    enabled: !!address && !!provider,
    refetchInterval: 30000,  // 30秒刷新
  });
}
```

#### A4. 交易签名
```typescript
// services/wallet.service.ts
export class WalletService {
  async signMessage(message: string): Promise<string> {
    const signer = useWalletStore.getState().signer;
    if (!signer) throw new Error('Wallet not connected');
    return await signer.signMessage(message);
  }
  
  async sendTransaction(tx: TransactionRequest): Promise<TransactionResponse> {
    const signer = useWalletStore.getState().signer;
    if (!signer) throw new Error('Wallet not connected');
    return await signer.sendTransaction(tx);
  }
}
```

---

## 模块 B: 合约交互模块 (Contract Module)

### 架构图
```
┌─────────────────────────────────────────────────────────────────┐
│                   Contract Module                               │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Contract Service Layer                     │   │
│  │  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐    │   │
│  │  │ECHOAssetV2V3 │ │ LicenseNFTV3 │ │ ECHOFusionV2 │    │   │
│  │  │   Service    │ │   Service    │ │   Service    │    │   │
│  │  └──────┬───────┘ └──────┬───────┘ └──────┬───────┘    │   │
│  │         └────────────────┼────────────────┘            │   │
│  │                          │                             │   │
│  │                    ┌─────┴─────┐                       │   │
│  │                    │  ethers   │                       │   │
│  │                    │ Contract  │                       │   │
│  │                    │  Factory  │                       │   │
│  │                    └─────┬─────┘                       │   │
│  │                          │                             │   │
│  │  ┌───────────────────────┼───────────────────────┐    │   │
│  │  │                   Retry Manager               │    │   │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────────┐  │    │   │
│  │  │  │ Exponential│ │  Circuit │ │  Fallback    │  │    │   │
│  │  │  │  Backoff   │ │  Breaker │ │   RPC        │  │    │   │
│  │  │  └──────────┘ └──────────┘ └──────────────┘  │    │   │
│  │  └───────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

### 合约服务封装

#### B1. ECHOAssetV2V3 合约服务
```typescript
// services/contract.service.ts
export class ECHOAssetService {
  private contract: Contract;
  
  constructor(address: string, signerOrProvider: Signer | Provider) {
    this.contract = new Contract(address, ECHOAssetV2V3_ABI, signerOrProvider);
  }
  
  // ============ 读取方法 ============
  
  async getAsset(assetId: bigint): Promise<AssetData> {
    return await this.contract.assets(assetId);
  }
  
  async getAssetCount(): Promise<bigint> {
    return await this.contract.assetCounter();
  }
  
  async getAssetsByOwner(owner: string): Promise<bigint[]> {
    return await this.contract.getAssetsByOwner(owner);
  }
  
  async getPrice(assetId: bigint): Promise<PriceData> {
    return await this.contract.prices(assetId);
  }
  
  async isAssetLocked(assetId: bigint): Promise<boolean> {
    return await this.contract.locked(assetId);
  }
  
  // ============ 写入方法 ============
  
  async createAsset(
    ipfsHash: string,
    priceType: PriceType,
    price: bigint,
    duration: number,
    transferable: boolean,
    category: string
  ): Promise<TransactionResponse> {
    const tx = await this.contract.createAsset(
      ipfsHash,
      priceType,
      price,
      duration,
      transferable,
      category
    );
    return tx;
  }
  
  async purchaseAsset(assetId: bigint, value: bigint): Promise<TransactionResponse> {
    const tx = await this.contract.purchaseAsset(assetId, { value });
    return tx;
  }
  
  async updatePrice(
    assetId: bigint,
    priceType: PriceType,
    newPrice: bigint
  ): Promise<TransactionResponse> {
    return await this.contract.updatePrice(assetId, priceType, newPrice);
  }
  
  async lockAsset(assetId: bigint): Promise<TransactionResponse> {
    return await this.contract.lockAsset(assetId);
  }
  
  async unlockAsset(assetId: bigint): Promise<TransactionResponse> {
    return await this.contract.unlockAsset(assetId);
  }
  
  async transferAsset(
    to: string,
    assetId: bigint
  ): Promise<TransactionResponse> {
    return await this.contract.transferAsset(to, assetId);
  }
}
```

#### B2. LicenseNFTV3 合约服务
```typescript
export class LicenseNFTService {
  private contract: Contract;
  
  constructor(address: string, signerOrProvider: Signer | Provider) {
    this.contract = new Contract(address, LicenseNFTV3_ABI, signerOrProvider);
  }
  
  // ============ 读取方法 ============
  
  async getLicense(licenseId: bigint): Promise<LicenseData> {
    return await this.contract.licenses(licenseId);
  }
  
  async getLicenseCount(): Promise<bigint> {
    return await this.contract.licenseCounter();
  }
  
  async getLicensesByOwner(owner: string): Promise<bigint[]> {
    return await this.contract.getLicensesByOwner(owner);
  }
  
  async getLicensesByAsset(assetId: bigint): Promise<bigint[]> {
    return await this.contract.getLicensesByAsset(assetId);
  }
  
  async isLicenseValid(licenseId: bigint): Promise<boolean> {
    return await this.contract.isLicenseValid(licenseId);
  }
  
  async getLicenseRemainingTime(licenseId: bigint): Promise<bigint> {
    return await this.contract.getLicenseRemainingTime(licenseId);
  }
  
  // ============ 写入方法 ============
  
  async issueLicense(
    to: string,
    assetId: bigint,
    price: bigint,
    duration: number,
    transferable: boolean,
    commercialUse: boolean
  ): Promise<TransactionResponse> {
    return await this.contract.issueLicense(
      to, assetId, price, duration, transferable, commercialUse
    );
  }
  
  async renewLicense(
    licenseId: bigint,
    additionalDuration: number,
    additionalValue: bigint
  ): Promise<TransactionResponse> {
    return await this.contract.renewLicense(
      licenseId, additionalDuration, { value: additionalValue }
    );
  }
}
```

#### B3. ECHOFusionV2 合约服务
```typescript
export class ECHOFusionService {
  private contract: Contract;
  
  constructor(address: string, signerOrProvider: Signer | Provider) {
    this.contract = new Contract(address, ECHOFusionV2_ABI, signerOrProvider);
  }
  
  // ============ 读取方法 ============
  
  async getFusedAsset(tokenId: bigint): Promise<FusionData> {
    return await this.contract.fusedAssets(tokenId);
  }
  
  async getFusionCount(): Promise<bigint> {
    return await this.contract.fusionCounter();
  }
  
  async getFusionsByOwner(owner: string): Promise<bigint[]> {
    return await this.contract.getFusionsByOwner(owner);
  }
  
  async getFusionPreview(
    assetIds: bigint[],
    weights: number[]
  ): Promise<FusionPreview> {
    return await this.contract.previewFusion(assetIds, weights);
  }
  
  // ============ 写入方法 ============
  
  async createFusion(
    name: string,
    description: string,
    assetIds: bigint[],
    weights: number[],
    targetDuration: number,
    ipfsHash: string
  ): Promise<TransactionResponse> {
    return await this.contract.createFusion(
      name, description, assetIds, weights, targetDuration, ipfsHash
    );
  }
  
  async burnFusion(tokenId: bigint): Promise<TransactionResponse> {
    return await this.contract.burnFusion(tokenId);
  }
}
```

### 错误处理与重试机制

```typescript
// lib/retry.ts
interface RetryConfig {
  maxRetries: number;
  baseDelay: number;
  maxDelay: number;
  shouldRetry?: (error: Error) => boolean;
}

const defaultRetryConfig: RetryConfig = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  shouldRetry: (error) => {
    // 网络错误或节点超时重试
    const retryableErrors = [
      'network error',
      'timeout',
      'rate limit',
      'nonce too low',
      'replacement fee too low'
    ];
    return retryableErrors.some(msg => 
      error.message.toLowerCase().includes(msg)
    );
  }
};

export async function withRetry<T>(
  fn: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const finalConfig = { ...defaultRetryConfig, ...config };
  let lastError: Error;
  
  for (let attempt = 0; attempt <= finalConfig.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;
      
      if (attempt === finalConfig.maxRetries) break;
      
      if (finalConfig.shouldRetry && !finalConfig.shouldRetry(lastError)) {
        throw lastError;
      }
      
      // 指数退避
      const delay = Math.min(
        finalConfig.baseDelay * Math.pow(2, attempt),
        finalConfig.maxDelay
      );
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  
  throw lastError!;
}

// 使用示例
export async function safeContractCall<T>(
  fn: () => Promise<T>
): Promise<T> {
  return withRetry(fn, {
    maxRetries: 3,
    baseDelay: 1000
  });
}
```

### 交易状态管理

```typescript
// store/slices/transactionStore.ts
interface TransactionState {
  transactions: Transaction[];
  pendingCount: number;
}

interface Transaction {
  hash: string;
  status: 'pending' | 'success' | 'failed';
  type: string;
  description: string;
  timestamp: number;
  confirmations: number;
}

export const useTransactionStore = create<TransactionState & {
  addTransaction: (tx: Omit<Transaction, 'status' | 'confirmations'>) => void;
  updateTransaction: (hash: string, updates: Partial<Transaction>) => void;
  clearCompleted: () => void;
}>((set, get) => ({
  transactions: [],
  pendingCount: 0,
  
  addTransaction: (tx) => {
    set(state => ({
      transactions: [
        { ...tx, status: 'pending', confirmations: 0 },
        ...state.transactions
      ],
      pendingCount: state.pendingCount + 1
    }));
  },
  
  updateTransaction: (hash, updates) => {
    set(state => ({
      transactions: state.transactions.map(tx =>
        tx.hash === hash ? { ...tx, ...updates } : tx
      ),
      pendingCount: updates.status === 'success' || updates.status === 'failed'
        ? Math.max(0, state.pendingCount - 1)
        : state.pendingCount
    }));
  },
  
  clearCompleted: () => {
    set(state => ({
      transactions: state.transactions.filter(tx => tx.status === 'pending')
    }));
  }
}));
```

---

## 模块 C: 数据管理模块 (Data Module)

### 架构图
```
┌─────────────────────────────────────────────────────────────────┐
│                    Data Module                                  │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   Asset     │  │    User     │  │          IPFS           │ │
│  │    Cache    │  │    Data     │  │         Service         │ │
│  └──────┬──────┘  └──────┬──────┘  └────────────┬────────────┘ │
│         │                │                      │              │
│         └────────────────┼──────────────────────┘              │
│                          │                                     │
│                   ┌──────┴──────┐                              │
│                   │ TanStack    │                              │
│                   │   Query     │                              │
│                   │   Cache     │                              │
│                   └──────┬──────┘                              │
│                          │                                     │
│         ┌────────────────┼────────────────┐                    │
│         │                │                │                    │
│    ┌────┴────┐     ┌────┴────┐     ┌────┴────┐               │
│    │ Stale   │     │  Cache  │     │ Background│               │
│    │ While   │     │  Persist│     │  Refresh  │               │
│    │ Revalidate│    │  (localStorage)│         │               │
│    └─────────┘     └─────────┘     └─────────┘               │
└─────────────────────────────────────────────────────────────────┘
```

### C1. 资产数据缓存

```typescript
// hooks/useAssets.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// 查询键工厂
export const assetKeys = {
  all: ['assets'] as const,
  lists: () => [...assetKeys.all, 'list'] as const,
  list: (filters: AssetFilters) => [...assetKeys.lists(), filters] as const,
  details: () => [...assetKeys.all, 'detail'] as const,
  detail: (id: bigint) => [...assetKeys.details(), id] as const,
  byOwner: (owner: string) => [...assetKeys.all, 'owner', owner] as const,
};

// 获取资产列表
export function useAssetList(filters: AssetFilters = {}) {
  const contractService = useContractService();
  
  return useQuery({
    queryKey: assetKeys.list(filters),
    queryFn: async () => {
      const assets = await contractService.getAllAssets(filters);
      return assets;
    },
    staleTime: 30000,        // 30秒内视为新鲜
    gcTime: 5 * 60 * 1000,   // 5分钟后垃圾回收
  });
}

// 获取单个资产详情
export function useAssetDetail(assetId: bigint) {
  const contractService = useContractService();
  
  return useQuery({
    queryKey: assetKeys.detail(assetId),
    queryFn: async () => {
      const [assetData, priceData, metadata] = await Promise.all([
        contractService.getAsset(assetId),
        contractService.getPrice(assetId),
        ipfsService.getMetadata(assetId)
      ]);
      
      return {
        ...assetData,
        price: priceData,
        metadata
      };
    },
    enabled: assetId > 0n,
    staleTime: 60000,
  });
}

// 获取用户资产
export function useUserAssets(ownerAddress?: string) {
  const contractService = useContractService();
  
  return useQuery({
    queryKey: assetKeys.byOwner(ownerAddress || ''),
    queryFn: async () => {
      if (!ownerAddress) return [];
      const assetIds = await contractService.getAssetsByOwner(ownerAddress);
      
      // 并行获取所有资产详情
      const assets = await Promise.all(
        assetIds.map(id => contractService.getAsset(id))
      );
      
      return assets;
    },
    enabled: !!ownerAddress,
    staleTime: 60000,
  });
}
```

### C2. 用户数据管理

```typescript
// store/slices/userStore.ts
interface UserState {
  // 用户基本信息
  address: string | null;
  ensName: string | null;
  avatar: string | null;
  
  // 用户统计
  stats: {
    totalAssets: number;
    totalLicenses: number;
    totalFusions: number;
    totalVolume: bigint;
  };
  
  // 用户偏好
  preferences: {
    theme: 'light' | 'dark' | 'system';
    language: string;
    currency: string;
    audioQuality: 'low' | 'medium' | 'high';
  };
  
  // 方法
  setAddress: (address: string | null) => void;
  setENS: (name: string | null, avatar: string | null) => void;
  updateStats: (stats: Partial<UserState['stats']>) => void;
  setPreference: (key: keyof UserState['preferences'], value: any) => void;
}

export const useUserStore = create<UserState>((set, get) => ({
  address: null,
  ensName: null,
  avatar: null,
  stats: {
    totalAssets: 0,
    totalLicenses: 0,
    totalFusions: 0,
    totalVolume: 0n
  },
  preferences: {
    theme: 'system',
    language: 'zh-CN',
    currency: 'USD',
    audioQuality: 'medium'
  },
  
  setAddress: (address) => set({ address }),
  
  setENS: (ensName, avatar) => set({ ensName, avatar }),
  
  updateStats: (stats) => set(state => ({
    stats: { ...state.stats, ...stats }
  })),
  
  setPreference: (key, value) => set(state => ({
    preferences: { ...state.preferences, [key]: value }
  }))
}));

// 持久化中间件
import { persist } from 'zustand/middleware';

export const usePersistedUserStore = create(
  persist(
    (set, get) => ({
      // ... 同上
    }),
    {
      name: 'echo-user-storage',
      partialize: (state) => ({ 
        preferences: state.preferences 
      })
    }
  )
);
```

### C3. IPFS 数据获取

```typescript
// services/ipfs.service.ts
import { create } from 'ipfs-http-client';

interface IPFSConfig {
  gateway: string;
  apiEndpoint?: string;
}

// 公共 IPFS 网关列表（按优先级）
const IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://gateway.ipfs.io/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
];

class IPFSService {
  private gateways: string[];
  
  constructor(gateways: string[] = IPFS_GATEWAYS) {
    this.gateways = gateways;
  }
  
  // 构建 IPFS URL
  getUrl(cid: string, gateway?: string): string {
    const selectedGateway = gateway || this.gateways[0];
    return `${selectedGateway}${cid}`;
  }
  
  // 获取元数据（带重试）
  async getMetadata(cid: string): Promise<AssetMetadata> {
    for (const gateway of this.gateways) {
      try {
        const url = this.getUrl(cid, gateway);
        const response = await fetch(url, { 
          timeout: 10000 
        } as RequestInit);
        
        if (response.ok) {
          return await response.json();
        }
      } catch (error) {
        console.warn(`Gateway ${gateway} failed:`, error);
        continue;
      }
    }
    
    throw new Error(`Failed to fetch metadata from all gateways: ${cid}`);
  }
  
  // 获取音频文件（返回 Blob URL）
  async getAudioBlob(cid: string): Promise<string> {
    for (const gateway of this.gateways) {
      try {
        const url = this.getUrl(cid, gateway);
        const response = await fetch(url);
        
        if (response.ok) {
          const blob = await response.blob();
          return URL.createObjectURL(blob);
        }
      } catch (error) {
        continue;
      }
    }
    
    throw new Error(`Failed to fetch audio: ${cid}`);
  }
  
  // 上传文件到 IPFS（需要后端或 Pinata 服务）
  async uploadFile(file: File, apiKey: string): Promise<string> {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload to IPFS');
    }
    
    const data = await response.json();
    return data.IpfsHash;
  }
  
  // 上传 JSON 元数据
  async uploadMetadata(metadata: object, apiKey: string): Promise<string> {
    const response = await fetch('https://api.pinata.cloud/pinning/pinJSONToIPFS', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify(metadata)
    });
    
    if (!response.ok) {
      throw new Error('Failed to upload metadata');
    }
    
    const data = await response.json();
    return data.IpfsHash;
  }
}

export const ipfsService = new IPFSService();
```

---

## 模块 D: UI 状态模块 (UI State Module)

### 架构图
```
┌─────────────────────────────────────────────────────────────────┐
│                     UI State Module                             │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   Global    │  │    Error    │  │       Theme/Locale      │ │
│  │   Loading   │  │   Handler   │  │        Manager          │ │
│  └──────┬──────┘  └──────┬──────┘  └────────────┬────────────┘ │
│         │                │                      │              │
│         └────────────────┴──────────────────────┘              │
│                          │                                     │
│                   ┌──────┴──────┐                              │
│                   │  Zustand    │                              │
│                   │    Store    │                              │
│                   └──────┬──────┘                              │
│                          │                                     │
│         ┌────────────────┼────────────────┐                    │
│         │                │                │                    │
│    ┌────┴────┐     ┌────┴────┐     ┌────┴────┐               │
│    │  Toast  │     │  Modal  │     │  Sidebar │               │
│    │ System  │     │ Manager │     │  State   │               │
│    └─────────┘     └─────────┘     └─────────┘               │
└─────────────────────────────────────────────────────────────────┘
```

### D1. 全局 Loading 状态

```typescript
// store/slices/uiStore.ts
interface UIState {
  // 全局加载状态
  isLoading: boolean;
  loadingMessage: string;
  loadingProgress: number;
  
  // 页面特定加载状态
  pageLoading: {
    [page: string]: boolean;
  };
  
  // 操作加载状态
  actionLoading: {
    [action: string]: boolean;
  };
  
  // 方法
  setGlobalLoading: (loading: boolean, message?: string) => void;
  setLoadingProgress: (progress: number) => void;
  setPageLoading: (page: string, loading: boolean) => void;
  setActionLoading: (action: string, loading: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  isLoading: false,
  loadingMessage: '',
  loadingProgress: 0,
  pageLoading: {},
  actionLoading: {},
  
  setGlobalLoading: (loading, message = '') => set({
    isLoading: loading,
    loadingMessage: message,
    loadingProgress: loading ? 0 : 100
  }),
  
  setLoadingProgress: (progress) => set({
    loadingProgress: Math.min(100, Math.max(0, progress))
  }),
  
  setPageLoading: (page, loading) => set(state => ({
    pageLoading: { ...state.pageLoading, [page]: loading }
  })),
  
  setActionLoading: (action, loading) => set(state => ({
    actionLoading: { ...state.actionLoading, [action]: loading }
  }))
}));

// 组合 Loading Hook
export function useLoadingState() {
  const { isLoading, loadingMessage, loadingProgress } = useUIStore();
  return { isLoading, loadingMessage, loadingProgress };
}

export function usePageLoading(page: string) {
  const { pageLoading, setPageLoading } = useUIStore();
  
  return {
    isLoading: pageLoading[page] || false,
    setLoading: (loading: boolean) => setPageLoading(page, loading)
  };
}
```

### D2. 错误提示管理

```typescript
// store/slices/errorStore.ts
type ErrorSeverity = 'error' | 'warning' | 'info' | 'success';

interface AppError {
  id: string;
  message: string;
  severity: ErrorSeverity;
  duration?: number;
  action?: {
    label: string;
    onClick: () => void;
  };
}

interface ErrorState {
  errors: AppError[];
  
  addError: (error: Omit<AppError, 'id'>) => void;
  removeError: (id: string) => void;
  clearAll: () => void;
}

export const useErrorStore = create<ErrorState>((set) => ({
  errors: [],
  
  addError: (error) => {
    const id = Math.random().toString(36).substr(2, 9);
    set(state => ({
      errors: [...state.errors, { ...error, id }]
    }));
    
    // 自动移除
    if (error.duration !== Infinity) {
      setTimeout(() => {
        set(state => ({
          errors: state.errors.filter(e => e.id !== id)
        }));
      }, error.duration || 5000);
    }
  },
  
  removeError: (id) => set(state => ({
    errors: state.errors.filter(e => e.id !== id)
  })),
  
  clearAll: () => set({ errors: [] })
}));

// 错误处理 Hook
export function useErrorHandler() {
  const { addError } = useErrorStore();
  
  const handleError = useCallback((error: unknown, context?: string) => {
    const message = error instanceof Error ? error.message : String(error);
    const fullMessage = context ? `${context}: ${message}` : message;
    
    console.error(fullMessage, error);
    
    addError({
      message: fullMessage,
      severity: 'error',
      duration: 5000
    });
  }, [addError]);
  
  const handleSuccess = useCallback((message: string) => {
    addError({
      message,
      severity: 'success',
      duration: 3000
    });
  }, [addError]);
  
  return { handleError, handleSuccess };
}

// 全局错误边界
export class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
    // 可发送错误到监控服务
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### D3. 主题/语言切换

```typescript
// store/slices/themeStore.ts
type Theme = 'light' | 'dark' | 'system';
type Language = 'zh-CN' | 'en-US' | 'ja-JP';

interface ThemeState {
  theme: Theme;
  language: Language;
  resolvedTheme: 'light' | 'dark';
  
  setTheme: (theme: Theme) => void;
  setLanguage: (lang: Language) => void;
  toggleTheme: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: 'system',
      language: 'zh-CN',
      resolvedTheme: 'light',
      
      setTheme: (theme) => {
        set({ theme });
        get().updateResolvedTheme();
      },
      
      setLanguage: (language) => set({ language }),
      
      toggleTheme: () => {
        const current = get().theme;
        const next = current === 'light' ? 'dark' : 'light';
        set({ theme: next });
        get().updateResolvedTheme();
      },
      
      updateResolvedTheme: () => {
        const { theme } = get();
        let resolved: 'light' | 'dark';
        
        if (theme === 'system') {
          resolved = window.matchMedia('(prefers-color-scheme: dark)').matches
            ? 'dark' : 'light';
        } else {
          resolved = theme;
        }
        
        set({ resolvedTheme: resolved });
        
        // 应用到 DOM
        if (resolved === 'dark') {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    }),
    {
      name: 'echo-theme-storage',
      partialize: (state) => ({ theme: state.theme, language: state.language })
    }
  )
);

// 国际化 Hook
import { useTranslation } from 'react-i18next';

export function useI18n() {
  const { language, setLanguage } = useThemeStore();
  const { t, i18n } = useTranslation();
  
  const changeLanguage = useCallback((lang: Language) => {
    i18n.changeLanguage(lang);
    setLanguage(lang);
  }, [i18n, setLanguage]);
  
  return {
    t,
    language,
    changeLanguage,
    dir: i18n.dir()
  };
}
```

---

## 模块交互图

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        模块交互关系                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│    ┌──────────────┐          ┌──────────────┐          ┌──────────────┐    │
│    │   UI State   │◄────────►│  Wallet      │◄────────►│  Contract    │    │
│    │   Module     │          │  Module      │          │  Module      │    │
│    └──────┬───────┘          └──────┬───────┘          └──────┬───────┘    │
│           │                         │                        │             │
│           │                         ▼                        ▼             │
│           │                  ┌──────────────┐          ┌──────────────┐    │
│           │                  │   Zustand    │          │   ethers     │    │
│           │                  │    Store     │          │     v6       │    │
│           │                  └──────────────┘          └──────────────┘    │
│           │                                                                │
│           ▼                                                                │
│    ┌──────────────┐          ┌──────────────┐          ┌──────────────┐    │
│    │    React     │◄────────►│  Data        │◄────────►│    IPFS      │    │
│    │  Components  │          │  Module      │          │   Service    │    │
│    └──────────────┘          └──────┬───────┘          └──────────────┘    │
│                                     │                                      │
│                                     ▼                                      │
│                              ┌──────────────┐                              │
│                              │ TanStack     │                              │
│                              │   Query      │                              │
│                              └──────────────┘                              │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 总结

| 模块 | 核心职责 | 主要技术 |
|------|----------|----------|
| **钱包模块** | 钱包连接、网络管理、交易签名 | ethers.js v6, Zustand |
| **合约模块** | 智能合约交互、错误重试 | ethers.js v6, 自定义重试机制 |
| **数据模块** | 数据获取、缓存、IPFS 交互 | TanStack Query, Zustand |
| **UI 模块** | 加载状态、错误提示、主题语言 | Zustand, Tailwind CSS |

所有模块通过 Zustand 和 React Query 进行状态共享，保持单向数据流，确保应用状态的可预测性和可维护性。
