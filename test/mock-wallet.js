/**
 * mock-wallet.js - MetaMask 钱包模拟
 * 用于 E2E 测试，模拟 Web3 钱包行为
 */

class MockWallet {
    constructor() {
        this.address = '0x742d35Cc6634C0532925a3b8D4c9db96590f6C7E';
        this.balance = '1000';
        this.chainId = 813; // Qitmeer 主网
        this.isConnected = false;
        this.provider = null;
        
        // 模拟账户列表
        this.accounts = [
            '0x742d35Cc6634C0532925a3b8D4c9db96590f6C7E',
            '0x8ba1f109551bD432803012645Hac136c82C3e8C9',
            '0x71C7656EC7ab88b098defB751B7401B5f6d8976F'
        ];
        
        // 模拟余额不足账户
        this.lowBalanceAccount = '0x1234567890123456789012345678901234567890';
        
        // 事件监听器
        this.eventListeners = {
            accountsChanged: [],
            chainChanged: []
        };
        
        // 初始化
        this.init();
    }
    
    init() {
        // 创建模拟 provider
        this.provider = this.createMockProvider();
        
        // 注入到 window.ethereum
        this.injectMock();
    }
    
    /**
     * 创建模拟 Provider
     */
    createMockProvider() {
        const self = this;
        
        return {
            // MetaMask 标准接口
            isMetaMask: true,
            isConnected: () => self.isConnected,
            
            // 请求方法
            request: async (args) => {
                return self.handleRequest(args);
            },
            
            // 事件监听
            on: (event, handler) => {
                if (!self.eventListeners[event]) {
                    self.eventListeners[event] = [];
                }
                self.eventListeners[event].push(handler);
            },
            
            removeListener: (event, handler) => {
                if (self.eventListeners[event]) {
                    const index = self.eventListeners[event].indexOf(handler);
                    if (index > -1) {
                        self.eventListeners[event].splice(index, 1);
                    }
                }
            },
            
            // 旧版接口兼容
            send: (method, params) => {
                return self.handleRequest({ method, params });
            },
            
            sendAsync: (payload, callback) => {
                self.handleRequest(payload)
                    .then(result => callback(null, { id: payload.id, jsonrpc: '2.0', result }))
                    .catch(error => callback(error));
            },
            
            // 网络信息
            networkVersion: self.chainId.toString(),
            chainId: '0x' + self.chainId.toString(16),
            selectedAddress: self.isConnected ? self.address : null,
            
            // 启用钱包 (旧版)
            enable: async () => {
                return self.connect();
            }
        };
    }
    
    /**
     * 处理 RPC 请求
     */
    async handleRequest(args) {
        const { method, params = [] } = args;
        
        switch (method) {
            case 'eth_requestAccounts':
            case 'eth_accounts':
                return this.connect();
                
            case 'eth_chainId':
                return '0x' + this.chainId.toString(16);
                
            case 'net_version':
                return this.chainId.toString();
                
            case 'eth_getBalance':
                return this.getBalance(params[0]);
                
            case 'eth_sendTransaction':
                return this.sendTransaction(params[0]);
                
            case 'eth_sign':
                return this.signMessage(params[0], params[1]);
                
            case 'personal_sign':
                return this.personalSign(params[0], params[1]);
                
            case 'wallet_switchEthereumChain':
                return this.switchChain(params[0].chainId);
                
            case 'wallet_addEthereumChain':
                return this.addChain(params[0]);
                
            case 'eth_estimateGas':
                return '0x5208'; // 21000 gas
                
            case 'eth_gasPrice':
                return '0x1'; // 1 wei
                
            case 'eth_getTransactionCount':
                return '0x0'; // nonce = 0
                
            case 'eth_getCode':
                return '0x'; // 非合约地址
                
            case 'eth_call':
                return this.handleContractCall(params[0]);
                
            default:
                console.log(`[MockWallet] Unhandled method: ${method}`);
                return null;
        }
    }
    
    /**
     * 连接钱包
     */
    async connect() {
        // 模拟连接延迟
        await this.delay(500);
        
        // 检查是否模拟失败场景
        if (window.MOCK_WALLET_FAIL_CONNECT) {
            throw this.createError(-32002, 'User rejected the request');
        }
        
        this.isConnected = true;
        
        // 触发事件
        this.emit('accountsChanged', [this.address]);
        
        return [this.address];
    }
    
    /**
     * 断开连接
     */
    disconnect() {
        this.isConnected = false;
        this.emit('accountsChanged', []);
    }
    
    /**
     * 获取余额
     */
    getBalance(address) {
        // 模拟余额不足账户
        if (address === this.lowBalanceAccount) {
            return '0x0'; // 0 wei
        }
        
        // 返回模拟余额 (1000 ETH = 1000 * 10^18 wei)
        const balance = ethers.utils.parseEther(this.balance);
        return balance.toHexString();
    }
    
    /**
     * 发送交易
     */
    async sendTransaction(txParams) {
        // 模拟交易延迟
        await this.delay(1000);
        
        // 检查余额不足场景
        if (window.MOCK_WALLET_LOW_BALANCE) {
            throw this.createError(-32000, 'insufficient funds for gas * price + value');
        }
        
        // 检查用户取消场景
        if (window.MOCK_WALLET_USER_REJECT) {
            throw this.createError(4001, 'User rejected the transaction');
        }
        
        // 检查网络错误场景
        if (window.MOCK_WALLET_NETWORK_ERROR) {
            throw this.createError(-32603, 'Internal JSON-RPC error');
        }
        
        // 生成模拟交易哈希
        const txHash = '0x' + Array(64).fill(0).map(() => 
            Math.floor(Math.random() * 16).toString(16)
        ).join('');
        
        // 模拟交易成功事件
        this.simulateTransactionSuccess(txHash, txParams);
        
        return txHash;
    }
    
    /**
     * 签名消息
     */
    async signMessage(address, message) {
        await this.delay(300);
        
        // 模拟签名
        const signature = '0x' + Array(130).fill(0).map(() => 
            Math.floor(Math.random() * 16).toString(16)
        ).join('');
        
        return signature;
    }
    
    /**
     * 个人签名
     */
    async personalSign(message, address) {
        return this.signMessage(address, message);
    }
    
    /**
     * 切换链
     */
    async switchChain(chainId) {
        await this.delay(300);
        
        const newChainId = parseInt(chainId, 16);
        
        // 检查是否是未添加的链
        if (newChainId !== 813 && newChainId !== 1 && newChainId !== 1337) {
            throw this.createError(4902, 'Unrecognized chain ID');
        }
        
        this.chainId = newChainId;
        this.emit('chainChanged', chainId);
        
        return null;
    }
    
    /**
     * 添加链
     */
    async addChain(chainParams) {
        await this.delay(300);
        console.log('[MockWallet] Chain added:', chainParams.chainName);
        return null;
    }
    
    /**
     * 处理合约调用
     */
    handleContractCall(callParams) {
        // 模拟合约调用返回
        return '0x0000000000000000000000000000000000000000000000000000000000000000';
    }
    
    /**
     * 模拟交易成功
     */
    simulateTransactionSuccess(txHash, txParams) {
        // 延迟一段时间后模拟交易确认
        setTimeout(() => {
            console.log('[MockWallet] Transaction confirmed:', txHash);
            
            // 触发自定义事件
            if (typeof window !== 'undefined') {
                window.dispatchEvent(new CustomEvent('mockTransactionConfirmed', {
                    detail: { txHash, txParams }
                }));
            }
        }, 2000);
    }
    
    /**
     * 切换到余额不足账户
     */
    switchToLowBalanceAccount() {
        this.address = this.lowBalanceAccount;
        this.emit('accountsChanged', [this.address]);
    }
    
    /**
     * 触发事件
     */
    emit(event, data) {
        if (this.eventListeners[event]) {
            this.eventListeners[event].forEach(handler => {
                try {
                    handler(data);
                } catch (error) {
                    console.error(`[MockWallet] Error in ${event} handler:`, error);
                }
            });
        }
    }
    
    /**
     * 注入模拟钱包到 window
     */
    injectMock() {
        if (typeof window !== 'undefined') {
            window.ethereum = this.provider;
            window.mockWallet = this;
            console.log('[MockWallet] Injected into window.ethereum');
        }
    }
    
    /**
     * 延迟函数
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * 创建错误对象
     */
    createError(code, message) {
        const error = new Error(message);
        error.code = code;
        return error;
    }
    
    // ============== 测试控制方法 ==============
    
    /**
     * 启用余额不足模式
     */
    enableLowBalanceMode() {
        window.MOCK_WALLET_LOW_BALANCE = true;
    }
    
    /**
     * 禁用余额不足模式
     */
    disableLowBalanceMode() {
        window.MOCK_WALLET_LOW_BALANCE = false;
    }
    
    /**
     * 启用用户拒绝模式
     */
    enableUserRejectMode() {
        window.MOCK_WALLET_USER_REJECT = true;
    }
    
    /**
     * 禁用用户拒绝模式
     */
    disableUserRejectMode() {
        window.MOCK_WALLET_USER_REJECT = false;
    }
    
    /**
     * 启用网络错误模式
     */
    enableNetworkErrorMode() {
        window.MOCK_WALLET_NETWORK_ERROR = true;
    }
    
    /**
     * 禁用网络错误模式
     */
    disableNetworkErrorMode() {
        window.MOCK_WALLET_NETWORK_ERROR = false;
    }
    
    /**
     * 启用连接失败模式
     */
    enableConnectFailMode() {
        window.MOCK_WALLET_FAIL_CONNECT = true;
    }
    
    /**
     * 禁用连接失败模式
     */
    disableConnectFailMode() {
        window.MOCK_WALLET_FAIL_CONNECT = false;
    }
    
    /**
     * 重置所有错误模式
     */
    resetErrorModes() {
        window.MOCK_WALLET_LOW_BALANCE = false;
        window.MOCK_WALLET_USER_REJECT = false;
        window.MOCK_WALLET_NETWORK_ERROR = false;
        window.MOCK_WALLET_FAIL_CONNECT = false;
    }
}

// 自动初始化（如果在浏览器环境）
if (typeof window !== 'undefined') {
    window.MockWallet = MockWallet;
}

// Node.js 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = MockWallet;
}
