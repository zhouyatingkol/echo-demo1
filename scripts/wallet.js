/**
 * ECHO Music 钱包连接模块
 * 支持 MetaMask 和其他 EVM 兼容钱包
 */

class WalletManager {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.address = null;
        this.balance = '0';
        this.chainId = null;
        this.isConnected = false;
        
        // MEER 代币配置
        this.MEER_DECIMALS = 18;
        this.MEER_SYMBOL = 'MEER';
        
        // 监听钱包事件
        this.initEventListeners();
    }
    
    /**
     * 初始化事件监听
     */
    initEventListeners() {
        // 监听账户变化
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    this.disconnect();
                } else {
                    this.address = accounts[0];
                    this.updateUI();
                    this.fetchBalance();
                }
            });
            
            // 监听链变化
            window.ethereum.on('chainChanged', (chainId) => {
                window.location.reload();
            });
        }
    }
    
    /**
     * 连接钱包
     */
    async connect() {
        try {
            // 检查是否安装了 MetaMask
            if (!window.ethereum) {
                this.showError('请安装 MetaMask 或其他 Web3 钱包');
                return false;
            }
            
            // 请求连接
            const accounts = await window.ethereum.request({
                method: 'eth_requestAccounts'
            });
            
            if (accounts.length === 0) {
                this.showError('未获得账户访问权限');
                return false;
            }
            
            // 使用 ethers.js 创建 provider 和 signer
            this.provider = new ethers.providers.Web3Provider(window.ethereum);
            this.signer = this.provider.getSigner();
            this.address = accounts[0];
            
            // 获取链 ID
            const network = await this.provider.getNetwork();
            this.chainId = network.chainId;
            
            // 检查是否在正确的链上
            if (!this.isCorrectChain()) {
                await this.switchChain();
            }
            
            this.isConnected = true;
            
            // 获取余额
            await this.fetchBalance();
            
            // 更新 UI
            this.updateUI();
            
            // 保存到本地存储
            localStorage.setItem('wallet_connected', 'true');
            localStorage.setItem('wallet_address', this.address);
            
            return true;
            
        } catch (error) {
            console.error('连接钱包失败:', error);
            this.showError('连接钱包失败: ' + error.message);
            return false;
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
        this.isConnected = false;
        
        localStorage.removeItem('wallet_connected');
        localStorage.removeItem('wallet_address');
        
        this.updateUI();
    }
    
    /**
     * 检查是否在正确的链上 (Qitmeer 主网)
     */
    isCorrectChain() {
        // Qitmeer 主网 Chain ID = 813 (0x32d)
        return this.chainId === 813;
    }
    
    /**
     * 切换到 Qitmeer 主网
     */
    async switchChain() {
        try {
            // 尝试切换到 Qitmeer 主网
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: '0x32d' }], // 813 = Qitmeer Mainnet
            });
        } catch (switchError) {
            // 如果链未添加，尝试添加
            if (switchError.code === 4902) {
                try {
                    await window.ethereum.request({
                        method: 'wallet_addEthereumChain',
                        params: [
                            {
                                chainId: '0x32d',
                                chainName: 'Qitmeer Mainnet',
                                nativeCurrency: {
                                    name: 'MEER',
                                    symbol: 'MEER',
                                    decimals: 18,
                                },
                                rpcUrls: ['https://qng.rpc.qitmeer.io'],
                                blockExplorerUrls: ['https://qng.qitmeer.io'],
                            },
                        ],
                    });
                } catch (addError) {
                    this.showError('添加 Qitmeer 网络失败: ' + addError.message);
                }
            }
        }
    }
    
    /**
     * 获取余额
     */
    async fetchBalance() {
        if (!this.provider || !this.address) return;
        
        try {
            const balance = await this.provider.getBalance(this.address);
            this.balance = ethers.utils.formatEther(balance);
            this.updateBalanceUI();
        } catch (error) {
            console.error('获取余额失败:', error);
        }
    }
    
    /**
     * 格式化余额显示
     */
    formatBalance(balance) {
        const num = parseFloat(balance);
        if (num === 0) return '0';
        if (num < 0.001) return '< 0.001';
        return num.toFixed(4);
    }
    
    /**
     * 购买 License
     */
    async purchaseLicense(assetId, licenseType, usageType, params) {
        if (!this.isConnected) {
            this.showError('请先连接钱包');
            return null;
        }
        
        // 检查是否在 Qitmeer 主网
        if (!this.isCorrectChain()) {
            this.showError('请切换到 Qitmeer 主网 (Chain ID: 813)');
            await this.switchChain();
            return null;
        }
        
        try {
            // Qitmeer 主网 LicenseNFT V3 合约地址
            const LICENSE_CONTRACT_ADDRESS = '0x2f79b56047050FD2Ee7C62d2d0fe644c15c68e23';
            
            // 完整的 LicenseNFT ABI
            const LICENSE_ABI = [
                // 购买函数
                'function purchaseOneTime(uint256 parentAssetId, uint8 usageType) payable returns (uint256)',
                'function purchasePerUse(uint256 parentAssetId, uint8 usageType, uint256 usageCount) payable returns (uint256)',
                'function purchaseTimed(uint256 parentAssetId, uint8 usageType, uint256 days) payable returns (uint256)',
                // 查询函数
                'function usageMultipliers(uint8 usageType) view returns (uint256)',
                'function platformFeeRate() view returns (uint256)',
                'function licenses(uint256 licenseId) view returns (tuple(uint256 id, uint256 parentAssetId, address licensee, uint8 licenseType, uint8 usageType, uint256 validFrom, uint256 validUntil, uint256 maxUsageCount, uint256 usedCount, uint256 pricePaid, bool isTransferable, bool isFrozen, bool isRevoked))',
                // 事件
                'event LicensePurchased(uint256 indexed licenseId, uint256 indexed parentAssetId, address indexed licensee, uint8 licenseType, uint8 usageType, uint256 price)',
                'event LicenseUsed(uint256 indexed licenseId, address indexed user, uint256 remainingCount)'
            ];
            
            const contract = new ethers.Contract(
                LICENSE_CONTRACT_ADDRESS,
                LICENSE_ABI,
                this.signer
            );
            
            let tx;
            let price;
            
            // 根据授权类型调用不同函数
            switch (licenseType) {
                case 'onetime':
                    price = await this.calculatePrice(assetId, licenseType, usageType);
                    tx = await contract.purchaseOneTime(assetId, usageType, {
                        value: ethers.utils.parseEther(price)
                    });
                    break;
                    
                case 'peruse':
                    const usageCount = params.usageCount || 100;
                    price = await this.calculatePrice(assetId, licenseType, usageType, { usageCount });
                    tx = await contract.purchasePerUse(assetId, usageType, usageCount, {
                        value: ethers.utils.parseEther(price)
                    });
                    break;
                    
                case 'timed':
                    const days = params.days || 30;
                    price = await this.calculatePrice(assetId, licenseType, usageType, { days });
                    tx = await contract.purchaseTimed(assetId, usageType, days, {
                        value: ethers.utils.parseEther(price)
                    });
                    break;
                    
                default:
                    throw new Error('未知的授权类型');
            }
            
            // 显示交易pending状态
            this.showPending('交易已提交，等待确认...');
            
            // 等待交易确认
            const receipt = await tx.wait();
            
            // 解析事件获取 License ID
            const event = receipt.events.find(e => e.event === 'LicensePurchased');
            const licenseId = event ? event.args.licenseId.toString() : null;
            
            this.showSuccess(`授权购买成功！License ID: ${licenseId}`);
            
            // 刷新余额
            await this.fetchBalance();
            
            return {
                txHash: receipt.transactionHash,
                licenseId: licenseId,
                price: price
            };
            
        } catch (error) {
            console.error('购买授权失败:', error);
            this.showError('购买失败: ' + error.message);
            return null;
        }
    }
    
    /**
     * 计算价格（前端预估）
     */
    async calculatePrice(assetId, licenseType, usageType, params = {}) {
        // 基础价格（简化计算，实际应从合约读取）
        const basePrices = {
            onetime: 100,
            peruse: 0.5,
            timed: 10
        };
        
        // 场景倍率
        const multipliers = {
            0: 1.0,   // PERSONAL
            1: 1.5,   // GAME
            2: 2.0,   // AI_TRAINING
            3: 3.0,   // COMMERCIAL
            4: 2.5,   // BROADCAST
            5: 1.2    // STREAMING
        };
        
        const basePrice = basePrices[licenseType];
        const multiplier = multipliers[usageType] || 1.0;
        
        let adjustedPrice;
        
        switch (licenseType) {
            case 'onetime':
                adjustedPrice = basePrice * multiplier;
                break;
            case 'peruse':
                adjustedPrice = basePrice * multiplier * (params.usageCount || 100);
                break;
            case 'timed':
                adjustedPrice = basePrice * multiplier * (params.days || 30);
                break;
            default:
                adjustedPrice = basePrice;
        }
        
        // 加上 5% 平台手续费
        const totalPrice = adjustedPrice * 1.05;
        
        return totalPrice.toFixed(6);
    }
    
    /**
     * 更新 UI
     */
    updateUI() {
        const connectBtn = document.getElementById('walletConnect');
        const mobileConnectBtn = document.getElementById('mobileWalletConnect');
        const walletStatus = document.querySelector('.wallet-status');
        
        if (this.isConnected && this.address) {
            // 已连接状态 - 显示"吾"，悬停显示地址
            if (connectBtn) {
                connectBtn.textContent = '吾';
                connectBtn.setAttribute('data-address', this.address);
                connectBtn.classList.add('connected');
            }
            if (mobileConnectBtn) {
                mobileConnectBtn.textContent = '吾';
                mobileConnectBtn.setAttribute('data-address', this.address);
                mobileConnectBtn.classList.add('connected');
            }
            if (walletStatus) {
                walletStatus.innerHTML = `已连接 | 余额: ${this.formatBalance(this.balance)} ${this.MEER_SYMBOL}`;
                walletStatus.classList.add('connected');
            }
        } else {
            // 未连接状态
            if (connectBtn) {
                connectBtn.textContent = '入链';
                connectBtn.removeAttribute('data-address');
                connectBtn.classList.remove('connected');
            }
            if (mobileConnectBtn) {
                mobileConnectBtn.textContent = '入链';
                mobileConnectBtn.removeAttribute('data-address');
                mobileConnectBtn.classList.remove('connected');
            }
            if (walletStatus) {
                walletStatus.innerHTML = '请先连接钱包 | 余额: --';
                walletStatus.classList.remove('connected');
            }
        }
    }
    
    /**
     * 更新余额 UI
     */
    updateBalanceUI() {
        const walletStatus = document.querySelector('.wallet-status');
        if (walletStatus && this.isConnected) {
            walletStatus.innerHTML = `已连接 | 余额: ${this.formatBalance(this.balance)} ${this.MEER_SYMBOL}`;
        }
    }
    
    /**
     * 显示错误信息
     */
    showError(message) {
        console.error(message);
        // 可以在这里集成 toast 通知
        alert('❌ ' + message);
    }
    
    /**
     * 显示成功信息
     */
    showSuccess(message) {
        console.log(message);
        alert('✅ ' + message);
    }
    
    /**
     * 显示 pending 状态
     */
    showPending(message) {
        console.log(message);
        // 可以在这里显示 loading 状态
    }
    
    /**
     * 自动连接（如果之前已连接）
     */
    async autoConnect() {
        const wasConnected = localStorage.getItem('wallet_connected') === 'true';
        if (wasConnected && window.ethereum) {
            try {
                const accounts = await window.ethereum.request({
                    method: 'eth_accounts'
                });
                if (accounts.length > 0) {
                    await this.connect();
                }
            } catch (error) {
                console.error('自动连接失败:', error);
            }
        }
    }
}

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
                // 如果已连接，可以显示菜单（断开、查看等）
                if (confirm('是否断开钱包连接？')) {
                    walletManager.disconnect();
                }
            } else {
                walletManager.connect();
            }
        });
    }
});

// 导出供其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = WalletManager;
}