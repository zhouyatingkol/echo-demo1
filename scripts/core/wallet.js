/**
 * ECHO Music 钱包连接模块 V2
 * 支持 MetaMask 和其他 EVM 兼容钱包
 * 针对 Qitmeer 主网 (Chain ID: 813) 优化
 */

// Qitmeer 网络配置
const QITMEER_CONFIG = {
    chainId: 813,
    chainIdHex: '0x32d',
    name: 'Qitmeer Mainnet',
    rpcUrl: 'https://qng.rpc.qitmeer.io',
    currency: {
        name: 'MEER',
        symbol: 'MEER',
        decimals: 18
    },
    blockExplorer: 'https://qng.qitmeer.io'
};

class WalletManager {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.address = null;
        this.balance = '0';
        this.chainId = null;
        this.isConnected = false;
        this.isCorrectNetwork = false;
        
        // MEER 代币配置
        this.MEER_DECIMALS = 18;
        this.MEER_SYMBOL = 'MEER';
        
        // 事件回调
        this.onConnect = null;
        this.onDisconnect = null;
        this.onAccountChange = null;
        this.onChainChange = null;
        this.onError = null;
        
        // 监听钱包事件
        this.initEventListeners();
    }
    
    /**
     * 设置事件回调
     */
    setCallbacks(callbacks) {
        this.onConnect = callbacks.onConnect || null;
        this.onDisconnect = callbacks.onDisconnect || null;
        this.onAccountChange = callbacks.onAccountChange || null;
        this.onChainChange = callbacks.onChainChange || null;
        this.onError = callbacks.onError || null;
    }
    
    /**
     * 初始化事件监听
     */
    initEventListeners() {
        if (window.ethereum) {
            // 监听账户变化
            window.ethereum.on('accountsChanged', (accounts) => {
                console.log('[WalletManager] Accounts changed:', accounts);
                
                if (accounts.length === 0) {
                    // 用户断开连接
                    this.disconnect();
                    if (this.onDisconnect) this.onDisconnect();
                } else {
                    // 切换账户
                    this.address = accounts[0];
                    this.fetchBalance();
                    this.updateUI();
                    if (this.onAccountChange) this.onAccountChange(this.address);
                }
            });
            
            // 监听链变化
            window.ethereum.on('chainChanged', (chainIdHex) => {
                console.log('[WalletManager] Chain changed:', chainIdHex);
                const newChainId = parseInt(chainIdHex, 16);
                this.chainId = newChainId;
                this.isCorrectNetwork = newChainId === QITMEER_CONFIG.chainId;
                
                if (this.onChainChange) {
                    this.onChainChange(newChainId, this.isCorrectNetwork);
                }
                
                // 链切换时刷新页面以确保状态一致
                window.location.reload();
            });
            
            // 监听连接事件
            window.ethereum.on('connect', (info) => {
                console.log('[WalletManager] Wallet connected:', info);
            });
            
            // 监听断开事件
            window.ethereum.on('disconnect', (error) => {
                console.log('[WalletManager] Wallet disconnected:', error);
                this.disconnect();
                if (this.onDisconnect) this.onDisconnect();
            });
        }
    }
    
    /**
     * 检查是否安装了钱包
     */
    isWalletInstalled() {
        return typeof window.ethereum !== 'undefined';
    }
    
    /**
     * 获取钱包提供商
     */
    getProvider() {
        if (!this.isWalletInstalled()) {
            return null;
        }
        
        // 处理多个钱包的情况 (如同时安装了 MetaMask 和 Coinbase)
        if (window.ethereum.providers) {
            // 优先使用 MetaMask
            return window.ethereum.providers.find(p => p.isMetaMask) || window.ethereum.providers[0];
        }
        
        return window.ethereum;
    }
    
    /**
     * 连接钱包
     * @param {boolean} silent - 静默模式（不显示错误弹窗）
     */
    async connect(silent = false) {
        try {
            // 检查是否安装了 MetaMask
            if (!this.isWalletInstalled()) {
                const error = '请安装 MetaMask 或其他 Web3 钱包';
                if (!silent) this.showError(error);
                if (this.onError) this.onError(new Error(error));
                return { success: false, error };
            }
            
            const provider = this.getProvider();
            
            // 请求连接
            const accounts = await provider.request({
                method: 'eth_requestAccounts'
            });
            
            if (accounts.length === 0) {
                const error = '未获得账户访问权限';
                if (!silent) this.showError(error);
                if (this.onError) this.onError(new Error(error));
                return { success: false, error };
            }
            
            // 使用 ethers.js v6 创建 provider 和 signer
            this.provider = new ethers.BrowserProvider(provider);
            this.signer = await this.provider.getSigner();
            this.address = accounts[0];
            
            // 获取链 ID
            const network = await this.provider.getNetwork();
            this.chainId = Number(network.chainId);
            this.isCorrectNetwork = this.chainId === QITMEER_CONFIG.chainId;
            
            // 如果不在 Qitmeer 网络，提示切换
            if (!this.isCorrectNetwork) {
                const switched = await this.switchToQitmeer();
                if (!switched) {
                    const error = '请切换到 Qitmeer 主网以继续使用';
                    if (!silent) this.showError(error);
                    // 仍然标记为已连接，但网络不正确
                }
            }
            
            this.isConnected = true;
            
            // 获取余额
            await this.fetchBalance();
            
            // 更新 UI
            this.updateUI();
            
            // 保存到本地存储
            localStorage.setItem('wallet_connected', 'true');
            localStorage.setItem('wallet_address', this.address);
            
            // 触发回调
            if (this.onConnect) {
                this.onConnect({
                    address: this.address,
                    chainId: this.chainId,
                    isCorrectNetwork: this.isCorrectNetwork
                });
            }
            
            console.log('[WalletManager] Connected:', {
                address: this.address,
                chainId: this.chainId,
                isCorrectNetwork: this.isCorrectNetwork
            });
            
            return {
                success: true,
                address: this.address,
                chainId: this.chainId,
                isCorrectNetwork: this.isCorrectNetwork
            };
            
        } catch (error) {
            console.error('[WalletManager] 连接钱包失败:', error);
            
            let errorMessage = error.message;
            if (error.code === 4001) {
                errorMessage = '用户取消了连接请求';
            }
            
            if (!silent) this.showError('连接钱包失败: ' + errorMessage);
            if (this.onError) this.onError(error);
            
            return { success: false, error: errorMessage };
        }
    }
    
    /**
     * 断开连接
     */
    disconnect() {
        this.provider = null;
        this.signer = null;
        this.address = null;
        this.balance = '0';
        this.chainId = null;
        this.isConnected = false;
        this.isCorrectNetwork = false;
        
        localStorage.removeItem('wallet_connected');
        localStorage.removeItem('wallet_address');
        
        this.updateUI();
        
        console.log('[WalletManager] Disconnected');
    }
    
    /**
     * 检查是否在正确的链上 (Qitmeer 主网)
     */
    checkNetwork() {
        return this.chainId === QITMEER_CONFIG.chainId;
    }
    
    /**
     * 切换到 Qitmeer 主网
     */
    async switchToQitmeer() {
        if (!this.isWalletInstalled()) return false;
        
        const provider = this.getProvider();
        
        try {
            // 尝试切换到 Qitmeer 主网
            await provider.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: QITMEER_CONFIG.chainIdHex }],
            });
            
            this.isCorrectNetwork = true;
            return true;
            
        } catch (switchError) {
            // 如果链未添加 (错误码 4902)，尝试添加
            if (switchError.code === 4902) {
                try {
                    await provider.request({
                        method: 'wallet_addEthereumChain',
                        params: [
                            {
                                chainId: QITMEER_CONFIG.chainIdHex,
                                chainName: QITMEER_CONFIG.name,
                                nativeCurrency: QITMEER_CONFIG.currency,
                                rpcUrls: [QITMEER_CONFIG.rpcUrl],
                                blockExplorerUrls: [QITMEER_CONFIG.blockExplorer],
                            },
                        ],
                    });
                    
                    this.isCorrectNetwork = true;
                    return true;
                    
                } catch (addError) {
                    console.error('[WalletManager] 添加网络失败:', addError);
                    this.showError('添加 Qitmeer 网络失败: ' + addError.message);
                    return false;
                }
            }
            
            console.error('[WalletManager] 切换网络失败:', switchError);
            return false;
        }
    }
    
    /**
     * 显示网络切换提示
     */
    showNetworkSwitchPrompt() {
        const confirmed = confirm(
            '当前不在 Qitmeer 主网。是否切换到 Qitmeer 主网 (Chain ID: 813)?'
        );
        
        if (confirmed) {
            this.switchToQitmeer();
        }
        
        return confirmed;
    }
    
    /**
     * 获取余额
     */
    async fetchBalance() {
        if (!this.provider || !this.address) return;
        
        try {
            const balance = await this.provider.getBalance(this.address);
            this.balance = ethers.formatEther(balance);
            this.updateBalanceUI();
        } catch (error) {
            console.error('[WalletManager] 获取余额失败:', error);
        }
    }
    
    /**
     * 格式化余额显示
     */
    formatBalance(balance) {
        const num = parseFloat(balance);
        if (isNaN(num) || num === 0) return '0';
        if (num < 0.001) return '< 0.001';
        return num.toFixed(4);
    }
    
    /**
     * 格式化地址显示
     */
    formatAddress(address) {
        if (!address) return '';
        return address.slice(0, 6) + '...' + address.slice(-4);
    }
    
    /**
     * 确保已连接（用于调用合约前检查）
     */
    async ensureConnected() {
        if (!this.isConnected) {
            const result = await this.connect();
            return result.success;
        }
        return true;
    }
    
    /**
     * 确保在正确网络（用于调用合约前检查）
     */
    async ensureCorrectNetwork() {
        if (!this.isConnected) {
            const connected = await this.ensureConnected();
            if (!connected) return false;
        }
        
        if (!this.isCorrectNetwork) {
            return await this.switchToQitmeer();
        }
        
        return true;
    }
    
    /**
     * 获取交易链接
     */
    getTransactionUrl(txHash) {
        return `${QITMEER_CONFIG.blockExplorer}/tx/${txHash}`;
    }
    
    /**
     * 获取地址链接
     */
    getAddressUrl(address) {
        return `${QITMEER_CONFIG.blockExplorer}/address/${address}`;
    }
    
    // ==================== UI 更新 ====================
    
    /**
     * 更新 UI
     */
    updateUI() {
        const connectBtn = document.getElementById('walletConnect');
        const walletStatus = document.querySelector('.wallet-status');
        const networkBadge = document.querySelector('.network-badge');
        
        if (this.isConnected && this.address) {
            // 已连接状态
            const shortAddress = this.formatAddress(this.address);
            
            if (connectBtn) {
                connectBtn.textContent = shortAddress;
                connectBtn.classList.add('connected');
                
                // 添加网络状态指示
                if (!this.isCorrectNetwork) {
                    connectBtn.classList.add('wrong-network');
                } else {
                    connectBtn.classList.remove('wrong-network');
                }
            }
            
            if (walletStatus) {
                let statusHtml = `已连接 | 余额: ${this.formatBalance(this.balance)} ${this.MEER_SYMBOL}`;
                
                if (!this.isCorrectNetwork) {
                    statusHtml += ` ⚠️ 错误网络`;
                    walletStatus.classList.add('wrong-network');
                } else {
                    walletStatus.classList.remove('wrong-network');
                }
                
                walletStatus.innerHTML = statusHtml;
                walletStatus.classList.add('connected');
            }
            
            if (networkBadge) {
                networkBadge.textContent = this.isCorrectNetwork ? 'Qitmeer' : '⚠️ 错误网络';
                networkBadge.className = 'network-badge ' + (this.isCorrectNetwork ? 'correct' : 'wrong');
            }
            
        } else {
            // 未连接状态
            if (connectBtn) {
                connectBtn.textContent = '连接钱包';
                connectBtn.classList.remove('connected', 'wrong-network');
            }
            
            if (walletStatus) {
                walletStatus.innerHTML = '请先连接钱包';
                walletStatus.classList.remove('connected', 'wrong-network');
            }
            
            if (networkBadge) {
                networkBadge.textContent = '未连接';
                networkBadge.className = 'network-badge';
            }
        }
    }
    
    /**
     * 更新余额 UI
     */
    updateBalanceUI() {
        const walletStatus = document.querySelector('.wallet-status');
        if (walletStatus && this.isConnected) {
            let statusHtml = `已连接 | 余额: ${this.formatBalance(this.balance)} ${this.MEER_SYMBOL}`;
            
            if (!this.isCorrectNetwork) {
                statusHtml += ` ⚠️ 错误网络`;
            }
            
            walletStatus.innerHTML = statusHtml;
        }
    }
    
    // ==================== 错误处理 ====================
    
    /**
     * 显示错误信息
     */
    showError(message) {
        console.error('[WalletManager]', message);
        
        // 使用更友好的错误提示方式
        if (typeof showToast === 'function') {
            showToast(message, 'error');
        } else {
            alert('❌ ' + message);
        }
    }
    
    /**
     * 显示成功信息
     */
    showSuccess(message) {
        console.log('[WalletManager]', message);
        
        if (typeof showToast === 'function') {
            showToast(message, 'success');
        } else {
            alert('✅ ' + message);
        }
    }
    
    /**
     * 显示 pending 状态
     */
    showPending(message) {
        console.log('[WalletManager]', message);
        
        if (typeof showToast === 'function') {
            showToast(message, 'pending');
        }
    }
    
    // ==================== 自动连接 ====================
    
    /**
     * 自动连接（如果之前已连接）
     */
    async autoConnect() {
        const wasConnected = localStorage.getItem('wallet_connected') === 'true';
        const savedAddress = localStorage.getItem('wallet_address');
        
        if (wasConnected && this.isWalletInstalled()) {
            try {
                const provider = this.getProvider();
                const accounts = await provider.request({
                    method: 'eth_accounts'
                });
                
                if (accounts.length > 0 && accounts[0].toLowerCase() === savedAddress?.toLowerCase()) {
                    console.log('[WalletManager] Auto-connecting...');
                    await this.connect(true);
                } else {
                    // 清除过期的连接状态
                    localStorage.removeItem('wallet_connected');
                    localStorage.removeItem('wallet_address');
                }
            } catch (error) {
                console.error('[WalletManager] 自动连接失败:', error);
            }
        }
    }
}

// ==================== Toast 通知系统 ====================

/**
 * 显示 Toast 通知
 */
function showToast(message, type = 'info') {
    // 检查是否已存在 toast 容器
    let container = document.getElementById('toast-container');
    if (!container) {
        container = document.createElement('div');
        container.id = 'toast-container';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        document.body.appendChild(container);
    }
    
    // 创建 toast 元素
    const toast = document.createElement('div');
    
    const colors = {
        info: '#5a5248',
        success: '#4CAF50',
        error: '#c9a86c',
        pending: '#c9a86c'
    };
    
    const icons = {
        info: 'ℹ️',
        success: '✅',
        error: '❌',
        pending: '⏳'
    };
    
    toast.style.cssText = `
        background: rgba(247, 244, 237, 0.98);
        border: 0.5px solid ${colors[type]};
        padding: 1rem 1.5rem;
        font-family: 'Cormorant Garamond', 'Noto Serif SC', serif;
        font-size: 0.9rem;
        color: #1a1a1a;
        box-shadow: 0 4px 20px rgba(0,0,0,0.1);
        display: flex;
        align-items: center;
        gap: 0.8rem;
        min-width: 250px;
        animation: slideIn 0.3s ease;
    `;
    
    toast.innerHTML = `
        <span>${icons[type]}</span>
        <span>${message}</span>
    `;
    
    container.appendChild(toast);
    
    // 自动移除
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, type === 'pending' ? 10000 : 5000);
}

// 添加动画样式
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
    .wallet-status.wrong-network,
    #walletConnect.wrong-network {
        color: #c9a86c !important;
        border-color: #c9a86c !important;
    }
    .network-badge {
        font-size: 0.65rem;
        padding: 0.2rem 0.5rem;
        border-radius: 2px;
        background: rgba(26, 26, 26, 0.05);
        color: #5a5248;
    }
    .network-badge.correct {
        background: rgba(76, 175, 80, 0.1);
        color: #4CAF50;
    }
    .network-badge.wrong {
        background: rgba(201, 168, 108, 0.1);
        color: #c9a86c;
    }
`;
document.head.appendChild(style);

// ==================== 全局实例 ====================

// 创建全局实例
const walletManager = new WalletManager();

// 页面加载完成后自动尝试连接
document.addEventListener('DOMContentLoaded', () => {
    walletManager.autoConnect();
    
    // 绑定连接按钮
    const connectBtn = document.getElementById('walletConnect');
    if (connectBtn) {
        connectBtn.addEventListener('click', () => {
            if (walletManager.isConnected) {
                // 如果已连接，显示菜单（断开、查看等）
                const action = prompt(
                    '钱包已连接: ' + walletManager.formatAddress(walletManager.address) + 
                    '\n\n输入:\n- 1: 断开连接\n- 2: 查看在区块浏览器\n- 3: 取消',
                    ''
                );
                
                if (action === '1') {
                    walletManager.disconnect();
                    walletManager.showSuccess('已断开钱包连接');
                } else if (action === '2') {
                    window.open(walletManager.getAddressUrl(walletManager.address), '_blank');
                }
            } else {
                walletManager.connect();
            }
        });
    }
});

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { WalletManager, walletManager, QITMEER_CONFIG, showToast };
}
