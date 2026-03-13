# ECHO Protocol 合约交互安全

## 1. 概述

智能合约交互是 Web3 应用的核心，也是安全风险最集中的环节。本文档定义了与 ECHO Protocol 智能合约交互时的安全措施。

## 2. 合约地址管理

### 2.1 白名单机制

```typescript
// 合约配置 (Qitmeer Mainnet - Chain ID: 813)
const CONTRACT_CONFIG = {
  chainId: 813,
  networkName: 'Qitmeer Mainnet',
  rpcUrl: 'https://rpc.qitmeer.io',
  explorerUrl: 'https://explorer.qitmeer.io',
  
  contracts: {
    ECHOAsset: {
      name: 'ECHOAssetV2V3',
      address: '0x...', // 部署后填入
      abi: ECHOAssetV2V3_ABI,
      version: '2.3.0',
      auditStatus: 'COMPLETED',
      auditReport: 'https://...',
      deployBlock: 12345678,
      verified: true
    },
    
    LicenseNFT: {
      name: 'LicenseNFTV3',
      address: '0x...',
      abi: LicenseNFTV3_ABI,
      version: '3.0.0',
      auditStatus: 'COMPLETED',
      deployBlock: 12345679,
      verified: true
    },
    
    ECHOFusion: {
      name: 'ECHOFusionV2',
      address: '0x...',
      abi: ECHOFusionV2_ABI,
      version: '2.0.0',
      auditStatus: 'COMPLETED',
      deployBlock: 12345680,
      verified: true
    }
  }
};

// 合约地址管理器
class ContractAddressManager {
  private whitelist: Map<string, ContractInfo> = new Map();
  
  constructor() {
    this.initializeWhitelist();
  }
  
  private initializeWhitelist() {
    Object.entries(CONTRACT_CONFIG.contracts).forEach(([name, config]) => {
      this.whitelist.set(config.address.toLowerCase(), {
        name,
        ...config
      });
    });
  }
  
  // 验证合约地址
  validate(address: string): ValidationResult {
    const normalized = address.toLowerCase();
    
    // 检查白名单
    if (!this.whitelist.has(normalized)) {
      return {
        valid: false,
        error: 'CONTRACT_NOT_WHITELISTED',
        message: '该合约地址不在白名单中，可能是恶意合约'
      };
    }
    
    const info = this.whitelist.get(normalized)!;
    
    // 检查审计状态
    if (info.auditStatus !== 'COMPLETED') {
      return {
        valid: false,
        warning: true,
        error: 'CONTRACT_NOT_AUDITED',
        message: '该合约尚未完成安全审计'
      };
    }
    
    return {
      valid: true,
      info
    };
  }
  
  // 获取合约信息
  getContractInfo(address: string): ContractInfo | null {
    return this.whitelist.get(address.toLowerCase()) || null;
  }
  
  // 检查是否已知合约
  isKnownContract(address: string): boolean {
    return this.whitelist.has(address.toLowerCase());
  }
}
```

### 2.2 地址验证 Hook

```typescript
// React Hook: 合约地址验证
export function useContractValidation(address: string | undefined) {
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  
  const addressManager = useMemo(() => new ContractAddressManager(), []);
  
  useEffect(() => {
    if (!address) {
      setValidation(null);
      return;
    }
    
    setIsChecking(true);
    
    // 基础验证
    if (!ethers.isAddress(address)) {
      setValidation({
        valid: false,
        error: 'INVALID_ADDRESS_FORMAT'
      });
      setIsChecking(false);
      return;
    }
    
    // 白名单验证
    const result = addressManager.validate(address);
    
    // 额外：链上验证是否为合约
    checkIsContract(address).then(isContract => {
      if (!isContract) {
        setValidation({
          valid: false,
          error: 'NOT_A_CONTRACT',
          message: '该地址不是智能合约'
        });
      } else {
        setValidation(result);
      }
      setIsChecking(false);
    });
  }, [address]);
  
  return { validation, isChecking };
}
```

## 3. 交易安全

### 3.1 交易构建安全

```typescript
// 安全交易构建器
class SecureTransactionBuilder {
  private provider: ethers.Provider;
  private contractManager: ContractAddressManager;
  
  constructor(provider: ethers.Provider) {
    this.provider = provider;
    this.contractManager = new ContractAddressManager();
  }
  
  // 构建安全的合约调用
  async buildContractCall(
    contractAddress: string,
    functionName: string,
    params: any[],
    options: TransactionOptions = {}
  ): Promise<SecureTransaction> {
    // 1. 验证合约地址
    const validation = this.contractManager.validate(contractAddress);
    if (!validation.valid) {
      throw new TransactionError(validation.error!, validation.message);
    }
    
    // 2. 验证函数名
    const contractInfo = validation.info!;
    const functionFragment = this.validateFunction(
      contractInfo.abi, 
      functionName,
      params
    );
    
    // 3. 参数验证
    const validatedParams = await this.validateParams(
      functionFragment,
      params
    );
    
    // 4. 获取 Gas 估算
    const gasEstimate = await this.estimateGas(
      contractAddress,
      functionFragment,
      validatedParams,
      options
    );
    
    // 5. 验证 Gas 限制
    if (gasEstimate > (options.maxGasLimit || 5000000)) {
      throw new TransactionError(
        'GAS_LIMIT_EXCEEDED',
        `Gas 估算 (${gasEstimate}) 超过限制`
      );
    }
    
    // 6. 构建交易
    return {
      to: contractAddress,
      data: this.encodeFunctionData(functionFragment, validatedParams),
      gasLimit: Math.ceil(gasEstimate * 1.2), // 20% 缓冲
      chainId: CONTRACT_CONFIG.chainId,
      ...(options.value && { value: options.value })
    };
  }
  
  // 验证函数
  private validateFunction(
    abi: any[],
    functionName: string,
    params: any[]
  ): ethers.FunctionFragment {
    const iface = new ethers.Interface(abi);
    
    // 检查函数是否存在
    const fragment = iface.getFunction(functionName);
    if (!fragment) {
      throw new TransactionError(
        'FUNCTION_NOT_FOUND',
        `函数 ${functionName} 不存在于合约 ABI`
      );
    }
    
    // 检查参数数量
    if (fragment.inputs.length !== params.length) {
      throw new TransactionError(
        'INVALID_PARAM_COUNT',
        `参数数量不匹配: 期望 ${fragment.inputs.length}, 实际 ${params.length}`
      );
    }
    
    return fragment;
  }
  
  // 参数验证
  private async validateParams(
    fragment: ethers.FunctionFragment,
    params: any[]
  ): Promise<any[]> {
    return Promise.all(
      params.map(async (param, index) => {
        const input = fragment.inputs[index];
        return this.validateParam(param, input);
      })
    );
  }
  
  private async validateParam(
    value: any,
    input: ethers.ParamType
  ): Promise<any> {
    // 根据参数类型验证
    switch (input.baseType) {
      case 'address':
        return this.validateAddress(value);
      case 'uint256':
      case 'uint128':
      case 'uint64':
        return this.validateUint(value, input);
      case 'bytes':
        return this.validateBytes(value);
      case 'string':
        return this.validateString(value);
      default:
        if (input.baseType.startsWith('bytes')) {
          return this.validateFixedBytes(value, input);
        }
        return value;
    }
  }
  
  private validateAddress(value: any): string {
    if (!ethers.isAddress(value)) {
      throw new TransactionError('INVALID_ADDRESS_PARAM', '无效的地址参数');
    }
    return ethers.getAddress(value);
  }
  
  private validateUint(value: any, input: ethers.ParamType): bigint {
    const num = BigInt(value);
    if (num < 0) {
      throw new TransactionError('NEGATIVE_UINT', '无符号整数不能为负数');
    }
    // 检查溢出
    const bits = parseInt(input.baseType.replace('uint', ''));
    const max = (BigInt(1) << BigInt(bits)) - BigInt(1);
    if (num > max) {
      throw new TransactionError('UINT_OVERFLOW', '整数溢出');
    }
    return num;
  }
}
```

### 3.2 交易确认机制

```typescript
// 交易确认服务
class TransactionConfirmationService {
  private readonly CONFIRMATION_BLOCKS = 3; // 确认区块数
  private readonly TIMEOUT_MS = 5 * 60 * 1000; // 5分钟超时
  
  // 等待交易确认
  async waitForConfirmation(
    txHash: string,
    onStatusUpdate?: (status: TransactionStatus) => void
  ): Promise<TransactionReceipt> {
    const startTime = Date.now();
    
    return new Promise((resolve, reject) => {
      const checkConfirmation = async () => {
        try {
          // 检查超时
          if (Date.now() - startTime > this.TIMEOUT_MS) {
            reject(new TransactionError('CONFIRMATION_TIMEOUT', '交易确认超时'));
            return;
          }
          
          // 获取交易回执
          const receipt = await this.provider.getTransactionReceipt(txHash);
          
          if (!receipt) {
            // 交易还在 pending
            onStatusUpdate?.({ status: 'pending', confirmations: 0 });
            setTimeout(checkConfirmation, 3000);
            return;
          }
          
          // 检查交易状态
          if (receipt.status !== 1) {
            reject(new TransactionError(
              'TRANSACTION_FAILED',
              '交易执行失败',
              receipt
            ));
            return;
          }
          
          // 获取当前区块
          const currentBlock = await this.provider.getBlockNumber();
          const confirmations = currentBlock - receipt.blockNumber + 1;
          
          onStatusUpdate?.({ 
            status: 'confirming', 
            confirmations,
            targetConfirmations: this.CONFIRMATION_BLOCKS
          });
          
          // 达到确认数
          if (confirmations >= this.CONFIRMATION_BLOCKS) {
            resolve(receipt);
          } else {
            setTimeout(checkConfirmation, 3000);
          }
        } catch (error) {
          reject(error);
        }
      };
      
      checkConfirmation();
    });
  }
  
  // 检查交易是否可替换
  async isReplaceable(txHash: string): Promise<boolean> {
    const tx = await this.provider.getTransaction(txHash);
    if (!tx) return false;
    
    const receipt = await this.provider.getTransactionReceipt(txHash);
    // 没有回执且 nonce 未被使用
    return !receipt && !!tx;
  }
}
```

### 3.3 Gas 管理

```typescript
// Gas 管理器
class GasManager {
  private provider: ethers.Provider;
  
  // Gas 限制配置
  private readonly GAS_LIMITS = {
    TRANSFER: 65000,
    APPROVE: 65000,
    MINT: 200000,
    BURN: 100000,
    FUSION: 300000,
    MAX: 5000000
  };
  
  // 获取推荐的 Gas 价格
  async getGasPrice(): Promise<GasRecommendation> {
    const feeData = await this.provider.getFeeData();
    
    // EIP-1559 支持
    if (feeData.maxFeePerGas && feeData.maxPriorityFeePerGas) {
      return {
        type: 'eip1559',
        slow: {
          maxFeePerGas: feeData.maxFeePerGas * 80n / 100n,
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas * 80n / 100n
        },
        standard: {
          maxFeePerGas: feeData.maxFeePerGas,
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas
        },
        fast: {
          maxFeePerGas: feeData.maxFeePerGas * 120n / 100n,
          maxPriorityFeePerGas: feeData.maxPriorityFeePerGas * 150n / 100n
        }
      };
    }
    
    // Legacy
    const baseGasPrice = feeData.gasPrice || 0n;
    return {
      type: 'legacy',
      slow: { gasPrice: baseGasPrice * 80n / 100n },
      standard: { gasPrice: baseGasPrice },
      fast: { gasPrice: baseGasPrice * 120n / 100n }
    };
  }
  
  // 估算 Gas 并检查限制
  async estimateGasWithLimit(
    transaction: TransactionRequest,
    operationType: keyof typeof this.GAS_LIMITS
  ): Promise<bigint> {
    const limit = this.GAS_LIMITS[operationType];
    
    try {
      const estimate = await this.provider.estimateGas(transaction);
      
      // 检查是否超过限制
      if (estimate > BigInt(limit)) {
        throw new GasError(
          'GAS_ESTIMATE_EXCEEDS_LIMIT',
          `Gas 估算 (${estimate}) 超过操作限制 (${limit})`
        );
      }
      
      // 添加 20% 缓冲
      return (estimate * 120n) / 100n;
    } catch (error) {
      if (error instanceof GasError) throw error;
      throw new GasError('GAS_ESTIMATION_FAILED', 'Gas 估算失败', error);
    }
  }
  
  // 计算最大 Gas 费用
  calculateMaxCost(gasLimit: bigint, gasPrice: GasSettings): bigint {
    if ('maxFeePerGas' in gasPrice) {
      return gasLimit * gasPrice.maxFeePerGas;
    }
    return gasLimit * gasPrice.gasPrice;
  }
}
```

## 4. 交易重放保护

```typescript
// 交易重放保护
class ReplayProtection {
  private provider: ethers.Provider;
  private nonceTracker: Map<string, number> = new Map();
  
  // 获取安全的 nonce
  async getSafeNonce(address: string): Promise<number> {
    // 获取链上 nonce
    const onChainNonce = await this.provider.getTransactionCount(address, 'pending');
    
    // 获取本地追踪的 nonce
    const trackedNonce = this.nonceTracker.get(address) || onChainNonce;
    
    // 使用较大值
    const safeNonce = Math.max(onChainNonce, trackedNonce);
    
    // 更新追踪
    this.nonceTracker.set(address, safeNonce + 1);
    
    return safeNonce;
  }
  
  // 验证交易唯一性
  async verifyTransactionUnique(
    txData: TransactionData
  ): Promise<boolean> {
    // 生成交易指纹
    const fingerprint = this.generateFingerprint(txData);
    
    // 检查是否最近提交过
    if (this.recentTransactions.has(fingerprint)) {
      return false;
    }
    
    // 添加到最近交易
    this.recentTransactions.add(fingerprint);
    
    // 5分钟后清除
    setTimeout(() => {
      this.recentTransactions.delete(fingerprint);
    }, 5 * 60 * 1000);
    
    return true;
  }
  
  private recentTransactions: Set<string> = new Set();
  
  private generateFingerprint(tx: TransactionData): string {
    // 基于关键字段生成指纹
    const data = `${tx.from}-${tx.to}-${tx.data}-${tx.value || 0}`;
    return ethers.keccak256(ethers.toUtf8Bytes(data));
  }
}
```

## 5. 合约调用监控

```typescript
// 合约调用监控器
class ContractCallMonitor {
  private eventEmitter: EventEmitter;
  
  constructor() {
    this.eventEmitter = new EventEmitter();
  }
  
  // 监控合约调用
  monitorCall(
    contractAddress: string,
    functionName: string,
    params: any[]
  ): CallMonitor {
    const startTime = Date.now();
    const callId = ethers.randomBytes(16).toString('hex');
    
    // 发出调用开始事件
    this.eventEmitter.emit('callStart', {
      callId,
      contractAddress,
      functionName,
      params: this.sanitizeParams(params),
      timestamp: startTime
    });
    
    return {
      success: (result: any) => {
        this.eventEmitter.emit('callSuccess', {
          callId,
          duration: Date.now() - startTime,
          result: this.sanitizeResult(result)
        });
      },
      error: (error: any) => {
        this.eventEmitter.emit('callError', {
          callId,
          duration: Date.now() - startTime,
          error: this.sanitizeError(error)
        });
      }
    };
  }
  
  // 敏感数据清理
  private sanitizeParams(params: any[]): any[] {
    return params.map(p => {
      // 隐藏敏感信息
      if (typeof p === 'string' && p.length > 100) {
        return p.substring(0, 20) + '...';
      }
      return p;
    });
  }
  
  private sanitizeResult(result: any): any {
    // 结果脱敏
    return result;
  }
  
  private sanitizeError(error: any): any {
    return {
      message: error.message,
      code: error.code
    };
  }
  
  // 订阅事件
  on(event: string, callback: Function) {
    this.eventEmitter.on(event, callback);
  }
}
```

## 6. 错误处理

```typescript
// 合约交互错误类型
class ContractInteractionError extends Error {
  constructor(
    public code: string,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ContractInteractionError';
  }
}

// 用户友好的错误映射
const ERROR_MESSAGES: Record<string, string> = {
  // 合约错误
  'INSUFFICIENT_BALANCE': '余额不足',
  'INSUFFICIENT_ALLOWANCE': '授权额度不足',
  'TRANSFER_FAILED': '转账失败',
  'NOT_OWNER': '您不是资产所有者',
  'ALREADY_EXISTS': '资产已存在',
  'NOT_EXISTS': '资产不存在',
  
  // 前端错误
  'CONTRACT_NOT_WHITELISTED': '合约不在白名单中',
  'FUNCTION_NOT_FOUND': '合约函数不存在',
  'INVALID_PARAM_COUNT': '参数数量不匹配',
  'GAS_LIMIT_EXCEEDED': 'Gas 限制超出',
  'TRANSACTION_FAILED': '交易执行失败',
  'CONFIRMATION_TIMEOUT': '交易确认超时',
  
  // 用户拒绝
  'ACTION_REJECTED': '您拒绝了操作',
  'USER_DENIED': '用户取消操作',
  
  // 网络错误
  'NETWORK_ERROR': '网络连接错误',
  'WRONG_NETWORK': '请切换到 Qitmeer 主网',
  'DISCONNECTED': '钱包已断开连接'
};

export function getUserFriendlyError(error: any): string {
  // 解析合约错误
  if (error.data?.message) {
    const match = error.data.message.match(/ revert: (.*)$/);
    if (match) {
      const revertReason = match[1];
      return ERROR_MESSAGES[revertReason] || revertReason;
    }
  }
  
  // 错误代码映射
  if (error.code && ERROR_MESSAGES[error.code]) {
    return ERROR_MESSAGES[error.code];
  }
  
  // 默认消息
  return error.message || '操作失败，请重试';
}
```

---

**文档版本**: 1.0  
**最后更新**: 2026-03-13
