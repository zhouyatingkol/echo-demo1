/**
 * license-shop.js - ECHO License Shop 交互逻辑 (V3 合约集成版)
 */

// 使用场景枚举 (对应合约中的 UsageType)
const UsageType = {
    PERSONAL: 0,      // 个人创作
    GAME: 1,          // 游戏配乐
    AI_TRAINING: 2,   // AI训练
    COMMERCIAL: 3,    // 商业广告
    BROADCAST: 4,     // 广播/电视
    STREAMING: 5      // 流媒体
};

// 授权类型枚举 (对应合约中的 LicenseType)
const LicenseType = {
    ONE_TIME: 0,      // 买断制
    PER_USE: 1,       // 按次计费
    TIMED: 2          // 限时授权
};

class LicenseShop {
    constructor() {
        this.selectedLicenseType = 'onetime';
        this.selectedUsageType = 'personal';
        this.assetId = this.getAssetIdFromURL(); // 从URL参数获取资产ID
        
        // 合约管理器
        this.contractManager = null;
        this.walletManager = null;
        
        // 价格缓存
        this.prices = {
            base: 0,
            perUse: 0,
            daily: 0,
            multiplier: 1.0,
            feeRate: 0.05
        };
        
        this.init();
    }
    
    async init() {
        this.bindEvents();
        await this.initializeContracts();
        await this.loadAssetInfo();
        this.updatePrice();
    }
    
    async initializeContracts() {
        // 等待 wallet.js 加载
        if (window.walletManager) {
            this.walletManager = window.walletManager;
            
            // 如果已连接，初始化合约
            if (this.walletManager.isConnected()) {
                await this.setupContracts();
            }
            
            // 监听钱包连接事件
            document.addEventListener('walletConnected', async () => {
                await this.setupContracts();
            });
        }
    }
    
    async setupContracts() {
        try {
            const provider = this.walletManager.getProvider();
            const signer = this.walletManager.getSigner();
            
            // 加载 ContractManagerV3
            if (typeof ContractManagerV3 !== 'undefined') {
                this.contractManager = new ContractManagerV3(provider, signer);
                await this.contractManager.init();
                
                // 加载实时价格
                await this.loadRealTimePrices();
                
                console.log('ContractManagerV3 initialized');
            } else {
                console.warn('ContractManagerV3 not loaded, using fallback prices');
            }
        } catch (error) {
            console.error('Failed to setup contracts:', error);
        }
    }
    
    async loadAssetInfo() {
        // 从URL参数加载资产信息
        console.log('Loading asset info for ID:', this.assetId);
        
        // TODO: 调用API获取资产详细信息
        // const assetInfo = await this.fetchAssetInfo(this.assetId);
        // this.updateAssetDisplay(assetInfo);
    }
    
    getAssetIdFromURL() {
        const params = new URLSearchParams(window.location.search);
        const id = parseInt(params.get('asset'));
        if (isNaN(id) || id <= 0) {
            console.warn('Invalid or missing asset ID in URL, using default value 1');
            return 1;
        }
        return id;
    }
    
    showLoading(message = '处理中...') {
        const btn = document.getElementById('purchaseBtn');
        if (btn) {
            btn.dataset.originalText = btn.innerHTML;
            btn.innerHTML = `<span class="loading-spinner"></span> ${message}`;
            btn.disabled = true;
        }
    }
    
    hideLoading() {
        const btn = document.getElementById('purchaseBtn');
        if (btn && btn.dataset.originalText) {
            btn.innerHTML = btn.dataset.originalText;
            btn.disabled = false;
        }
    }
    
    showStatus(message, type = 'info') {
        const statusEl = document.getElementById('transactionStatus');
        const errorEl = document.getElementById('errorMessage');
        const successEl = document.getElementById('successMessage');
        
        // 隐藏所有
        statusEl.classList.add('hidden');
        errorEl.classList.add('hidden');
        successEl.classList.add('hidden');
        
        if (type === 'loading') {
            statusEl.classList.remove('hidden');
            document.getElementById('statusText').textContent = message;
        } else if (type === 'error') {
            errorEl.classList.remove('hidden');
            errorEl.textContent = message;
        } else if (type === 'success') {
            successEl.classList.remove('hidden');
            successEl.textContent = message;
        }
    }
    
    hideStatus() {
        document.getElementById('transactionStatus').classList.add('hidden');
        document.getElementById('errorMessage').classList.add('hidden');
        document.getElementById('successMessage').classList.add('hidden');
    }
    
    async loadRealTimePrices() {
        if (!this.contractManager) return;
        
        try {
            // 获取资产价格
            const prices = await this.contractManager.getAssetPrices(this.assetId);
            if (prices) {
                this.prices.base = parseFloat(prices.base);
                this.prices.perUse = parseFloat(prices.perUse);
                this.prices.daily = parseFloat(prices.daily);
            }
            
            // 获取平台费率
            const feeRate = await this.contractManager.getPlatformFeeRate();
            if (feeRate) {
                this.prices.feeRate = feeRate;
            }
            
            this.updatePrice();
        } catch (error) {
            console.error('Failed to load prices:', error);
        }
    }
    
    bindEvents() {
        // 授权类型选择
        document.querySelectorAll('.license-card').forEach(card => {
            card.addEventListener('click', () => {
                this.selectLicenseType(card.dataset.type);
            });
        });
        
        // 使用场景选择
        document.querySelectorAll('input[name="usageType"]').forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.selectedUsageType = e.target.value;
                this.updateMultiplier();
                this.updatePrice();
            });
        });
        
        // 使用次数/天数输入
        const usageCountInput = document.getElementById('usageCount');
        const durationDaysInput = document.getElementById('durationDays');
        
        if (usageCountInput) {
            usageCountInput.addEventListener('input', () => this.updatePrice());
        }
        if (durationDaysInput) {
            durationDaysInput.addEventListener('input', () => this.updatePrice());
        }
        
        // 购买按钮
        document.getElementById('purchaseBtn').addEventListener('click', () => {
            this.handlePurchase();
        });
    }
    
    selectLicenseType(type) {
        this.selectedLicenseType = type;
        
        // 更新 UI
        document.querySelectorAll('.license-card').forEach(card => {
            card.classList.remove('selected');
            const checkIcon = card.querySelector('.check-icon');
            if (checkIcon) checkIcon.classList.add('hidden');
        });
        
        const selectedCard = document.querySelector(`[data-type="${type}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
            const checkIcon = selectedCard.querySelector('.check-icon');
            if (checkIcon) checkIcon.classList.remove('hidden');
        }
        
        this.updatePrice();
    }
    
    async updateMultiplier() {
        if (!this.contractManager) {
            // 使用默认倍率
            const defaultMultipliers = {
                personal: 1.0,
                game: 1.5,
                ai_training: 2.0,
                commercial: 3.0,
                broadcast: 2.5,
                streaming: 1.2
            };
            this.prices.multiplier = defaultMultipliers[this.selectedUsageType] || 1.0;
            return;
        }
        
        try {
            const usageTypeIndex = UsageType[this.selectedUsageType.toUpperCase()];
            const multiplier = await this.contractManager.getUsageMultiplier(usageTypeIndex);
            if (multiplier) {
                this.prices.multiplier = multiplier;
            }
        } catch (error) {
            console.error('Failed to get multiplier:', error);
        }
    }
    
    calculatePrice() {
        let basePrice = 0;
        
        switch (this.selectedLicenseType) {
            case 'onetime':
                basePrice = this.prices.base || 100;
                break;
            case 'peruse':
                const count = parseInt(document.getElementById('usageCount')?.value || 100);
                basePrice = (this.prices.perUse || 0.5) * count;
                break;
            case 'timed':
                const days = parseInt(document.getElementById('durationDays')?.value || 30);
                basePrice = (this.prices.daily || 10) * days;
                break;
        }
        
        const adjustedPrice = basePrice * this.prices.multiplier;
        const platformFee = adjustedPrice * this.prices.feeRate;
        const totalPrice = adjustedPrice + platformFee;
        
        return {
            basePrice,
            multiplier: this.prices.multiplier,
            adjustedPrice,
            platformFee,
            totalPrice,
            feeRate: this.prices.feeRate
        };
    }
    
    updatePrice() {
        const price = this.calculatePrice();
        
        // 更新显示
        const basePriceEl = document.getElementById('basePrice');
        const multiplierDisplayEl = document.getElementById('multiplierDisplay');
        const platformFeeEl = document.getElementById('platformFee');
        const totalPriceEl = document.getElementById('totalPrice');
        const btnPriceEl = document.querySelector('.btn-price');
        
        if (basePriceEl) basePriceEl.textContent = `${price.basePrice.toFixed(2)} MEER`;
        
        const usageNames = {
            personal: '个人创作',
            game: '游戏配乐',
            ai_training: 'AI训练',
            commercial: '商业广告',
            broadcast: '广播/电视',
            streaming: '流媒体'
        };
        if (multiplierDisplayEl) {
            multiplierDisplayEl.textContent = `×${price.multiplier} (${usageNames[this.selectedUsageType]})`;
        }
        
        if (platformFeeEl) platformFeeEl.textContent = `${price.platformFee.toFixed(2)} MEER`;
        if (totalPriceEl) totalPriceEl.textContent = `${price.totalPrice.toFixed(2)} MEER`;
        if (btnPriceEl) btnPriceEl.textContent = `${price.totalPrice.toFixed(2)} MEER`;
    }
    
    async handlePurchase() {
        // 检查钱包连接
        if (!this.walletManager || !this.walletManager.isConnected()) {
            alert('请先连接钱包');
            return;
        }
        
        if (!this.contractManager) {
            alert('合约正在初始化，请稍后再试');
            return;
        }
        
        // 验证资产ID
        if (!this.assetId || this.assetId <= 0) {
            alert('无效的资产ID');
            return;
        }
        
        const price = this.calculatePrice();
        
        // 验证价格有效性
        if (price.totalPrice <= 0 || isNaN(price.totalPrice)) {
            alert('价格计算错误，请刷新页面重试');
            return;
        }
        
        // 确认购买
        const confirmed = confirm(
            `确认购买 ${this.getLicenseTypeName()} 授权?\n` +
            `资产ID: ${this.assetId}\n` +
            `使用场景: ${this.getUsageTypeName()}\n` +
            `总价: ${price.totalPrice.toFixed(2)} MEER`
        );
        
        if (!confirmed) return;
        
        // 显示加载状态
        this.showLoading();
        this.showStatus('正在提交交易，请在钱包中确认...', 'loading');
        
        try {
            const result = await this.purchaseLicense(price.totalPrice);
            
            this.hideLoading();
            this.showStatus('购买成功！', 'success');
            
            if (result.licenseId) {
                alert(`购买成功！\n交易哈希: ${result.txHash}\nLicense ID: ${result.licenseId}`);
            } else {
                alert(`购买成功！\n交易哈希: ${result.txHash}\nLicense NFT 已铸造`);
            }
            
            // 可以跳转到用户资产页面
            // window.location.href = 'dashboard.html';
        } catch (error) {
            this.hideLoading();
            this.showStatus('购买失败: ' + (error.message || '未知错误'), 'error');
            console.error('Purchase failed:', error);
            alert('购买失败: ' + (error.message || '未知错误'));
        }
    }
    
    async purchaseLicense(totalPrice) {
        const usageTypeIndex = UsageType[this.selectedUsageType.toUpperCase()];
        
        switch (this.selectedLicenseType) {
            case 'onetime':
                return await this.contractManager.purchaseOneTime(
                    this.assetId,
                    usageTypeIndex,
                    totalPrice.toFixed(4)
                );
            
            case 'peruse':
                const count = parseInt(document.getElementById('usageCount')?.value || 100);
                return await this.contractManager.purchasePerUse(
                    this.assetId,
                    usageTypeIndex,
                    count,
                    totalPrice.toFixed(4)
                );
            
            case 'timed':
                const days = parseInt(document.getElementById('durationDays')?.value || 30);
                return await this.contractManager.purchaseTimed(
                    this.assetId,
                    usageTypeIndex,
                    days,
                    totalPrice.toFixed(4)
                );
            
            default:
                throw new Error('未知的授权类型');
        }
    }
    
    getLicenseTypeName() {
        const names = {
            onetime: '买断制',
            peruse: '按次计费',
            timed: '限时授权'
        };
        return names[this.selectedLicenseType];
    }
    
    getUsageTypeName() {
        const names = {
            personal: '个人创作',
            game: '游戏配乐',
            ai_training: 'AI训练',
            commercial: '商业广告',
            broadcast: '广播/电视',
            streaming: '流媒体'
        };
        return names[this.selectedUsageType];
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    window.licenseShop = new LicenseShop();
});
