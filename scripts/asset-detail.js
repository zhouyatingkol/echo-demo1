/**
 * asset-detail.js - ECHO Asset Detail 交互逻辑
 * 资产详情页：展示资产详情、购买授权
 */

// 使用场景枚举
const UsageType = {
    PERSONAL: 0,
    GAME: 1,
    AI_TRAINING: 2,
    COMMERCIAL: 3,
    BROADCAST: 4,
    STREAMING: 5
};

// 授权类型枚举
const LicenseType = {
    ONE_TIME: 0,
    PER_USE: 1,
    TIMED: 2
};

class AssetDetail {
    constructor() {
        this.assetId = this.getAssetIdFromURL();
        this.selectedLicenseType = 'onetime';
        this.selectedUsageType = 'personal';
        
        // 价格缓存
        this.prices = {
            base: 100,
            perUse: 0.5,
            daily: 10,
            multiplier: 1.0,
            feeRate: 0.05
        };
        
        // 资产数据
        this.asset = null;
        
        // 合约管理器
        this.contractManager = null;
        this.walletManager = null;
        
        this.init();
    }
    
    async init() {
        this.bindEvents();
        await this.initializeContracts();
        await this.loadAssetDetail();
        this.selectLicenseType('onetime');
        this.updatePrice();
        this.loadSimilarAssets();
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
    
    bindEvents() {
        // 授权类型选择
        document.querySelectorAll('.license-option-card').forEach(card => {
            card.addEventListener('click', () => {
                const type = card.dataset.type;
                this.selectLicenseType(type);
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
        const purchaseBtn = document.getElementById('purchaseBtn');
        if (purchaseBtn) {
            purchaseBtn.addEventListener('click', () => {
                this.handlePurchase();
            });
        }
        
        // 播放按钮
        const playBtn = document.getElementById('playBtn');
        if (playBtn) {
            playBtn.addEventListener('click', () => {
                this.playPreview();
            });
        }
    }
    
    async initializeContracts() {
        if (window.walletManager) {
            this.walletManager = window.walletManager;
            
            if (this.walletManager.isConnected()) {
                await this.setupContracts();
            }
            
            document.addEventListener('walletConnected', async () => {
                await this.setupContracts();
            });
        }
    }
    
    async setupContracts() {
        try {
            const provider = this.walletManager.getProvider();
            const signer = this.walletManager.getSigner();
            
            if (typeof ContractManagerV3 !== 'undefined') {
                this.contractManager = new ContractManagerV3(provider, signer);
                await this.contractManager.init();
                
                // 加载实时价格
                await this.loadRealTimePrices();
                
                console.log('ContractManagerV3 initialized in asset detail');
            }
        } catch (error) {
            console.error('Failed to setup contracts:', error);
        }
    }
    
    async loadAssetDetail() {
        this.showLoading();
        
        try {
            // 模拟加载资产详情
            await this.fetchAssetDetail();
            
            this.renderAssetDetail();
            this.hideLoading();
        } catch (error) {
            console.error('Failed to load asset detail:', error);
            this.showError('加载资产详情失败，请稍后重试');
        }
    }
    
    async fetchAssetDetail() {
        // 模拟资产数据
        const mockAssets = {
            1: {
                id: 1,
                title: '夏日微风',
                creator: '音乐制作人小王',
                description: '这是一首关于夏天的轻松音乐，适合用于视频背景音乐、游戏场景配乐等。旋律清新自然，给人带来愉悦的听觉体验。整首曲子采用了轻快的节奏和明亮的音色，让人仿佛置身于阳光明媚的海滩上，感受微风拂面的惬意。',
                price: 100,
                perUsePrice: 0.5,
                dailyPrice: 10,
                plays: 1234,
                licenses: 56,
                createdAt: '2024-01',
                type: '流行',
                tags: ['流行', '轻松', '夏日', '阳光'],
                blueprint: {
                    usage: { commercialUse: true, modificationAllowed: true, sublicensable: false },
                    derivative: { allowed: true, revenueShare: 10 },
                    extension: { allowed: true, aiTraining: true }
                }
            },
            2: {
                id: 2,
                title: '冬日暖阳',
                creator: '旋律工坊',
                description: '温暖的旋律如同冬日里的阳光，给人带来温馨和希望。适合用于温馨的短视频、家庭相册背景音乐等场景。',
                price: 150,
                perUsePrice: 0.8,
                dailyPrice: 15,
                plays: 892,
                licenses: 34,
                createdAt: '2024-02',
                type: '轻音乐',
                tags: ['轻音乐', '温暖', '冬日'],
                blueprint: {
                    usage: { commercialUse: true, modificationAllowed: true, sublicensable: true },
                    derivative: { allowed: true, revenueShare: 15 },
                    extension: { allowed: true, aiTraining: false }
                }
            },
            3: {
                id: 3,
                title: '春日花开',
                creator: '自然之声',
                description: '充满生机的春日旋律，融合自然声响与轻音乐元素，带来万物复苏的美好感受。',
                price: 200,
                perUsePrice: 1.0,
                dailyPrice: 20,
                plays: 2156,
                licenses: 89,
                createdAt: '2024-01',
                type: '自然',
                tags: ['自然', '春天', '生机'],
                blueprint: {
                    usage: { commercialUse: true, modificationAllowed: false, sublicensable: false },
                    derivative: { allowed: false, revenueShare: 0 },
                    extension: { allowed: true, aiTraining: true }
                }
            }
        };
        
        // 获取资产数据，如果不存在则使用默认数据
        this.asset = mockAssets[this.assetId] || {
            id: this.assetId,
            title: `音乐资产 #${this.assetId}`,
            creator: '未知创作者',
            description: '暂无描述信息',
            price: 100,
            perUsePrice: 0.5,
            dailyPrice: 10,
            plays: 0,
            licenses: 0,
            createdAt: '2024-01',
            type: '未知',
            tags: [],
            blueprint: {
                usage: { commercialUse: true, modificationAllowed: true, sublicensable: false },
                derivative: { allowed: true, revenueShare: 10 },
                extension: { allowed: true, aiTraining: true }
            }
        };
        
        // 更新价格缓存
        this.prices.base = this.asset.price;
        this.prices.perUse = this.asset.perUsePrice;
        this.prices.daily = this.asset.dailyPrice;
        
        // 如果有合约管理器，尝试获取真实数据
        if (this.contractManager) {
            try {
                const prices = await this.contractManager.getAssetPrices(this.assetId);
                if (prices) {
                    this.prices.base = parseFloat(prices.base);
                    this.prices.perUse = parseFloat(prices.perUse);
                    this.prices.daily = parseFloat(prices.daily);
                }
            } catch (error) {
                console.warn('Failed to fetch prices from contract:', error);
            }
        }
    }
    
    renderAssetDetail() {
        if (!this.asset) return;
        
        // 更新面包屑
        document.getElementById('assetName').textContent = this.asset.title;
        
        // 更新标题
        document.getElementById('assetTitle').textContent = this.asset.title;
        
        // 更新创作者
        document.getElementById('creatorName').textContent = this.asset.creator;
        
        // 更新统计
        document.getElementById('playCount').textContent = this.formatNumber(this.asset.plays);
        document.getElementById('licenseCount').textContent = this.asset.licenses;
        document.getElementById('createdAt').textContent = this.asset.createdAt;
        
        // 更新描述
        document.getElementById('assetDescription').textContent = this.asset.description;
        
        // 更新标签
        const tagsContainer = document.getElementById('assetTags');
        if (tagsContainer && this.asset.tags) {
            tagsContainer.innerHTML = this.asset.tags.map(tag => 
                `<span class="tag">${tag}</span>`
            ).join('');
        }
        
        // 更新价格显示
        document.getElementById('onetimePrice').textContent = this.prices.base;
        document.getElementById('perusePrice').textContent = this.prices.perUse;
        document.getElementById('timedPrice').textContent = this.prices.daily;
        
        // 更新权属蓝图
        this.renderBlueprint();
    }
    
    renderBlueprint() {
        if (!this.asset || !this.asset.blueprint) return;
        
        const bp = this.asset.blueprint;
        
        // 使用权
        const usageList = document.getElementById('usageRights');
        if (usageList) {
            usageList.innerHTML = `
                <li><span class="${bp.usage.commercialUse ? 'check' : 'cross'}">${bp.usage.commercialUse ? '✓' : '✗'}</span> ${bp.usage.commercialUse ? '允许' : '不允许'}商业使用</li>
                <li><span class="${bp.usage.modificationAllowed ? 'check' : 'cross'}">${bp.usage.modificationAllowed ? '✓' : '✗'}</span> ${bp.usage.modificationAllowed ? '允许' : '不允许'}修改</li>
                <li><span class="${bp.usage.sublicensable ? 'check' : 'cross'}">${bp.usage.sublicensable ? '✓' : '✗'}</span> ${bp.usage.sublicensable ? '允许' : '不允许'}再许可</li>
            `;
        }
        
        // 衍生权
        const derivativeList = document.getElementById('derivativeRights');
        if (derivativeList) {
            derivativeList.innerHTML = `
                <li><span class="${bp.derivative.allowed ? 'check' : 'cross'}">${bp.derivative.allowed ? '✓' : '✗'}</span> ${bp.derivative.allowed ? '允许' : '不允许'}创作衍生作品</li>
                <li><span class="check">✓</span> 收益分成: ${bp.derivative.revenueShare}%</li>
            `;
        }
        
        // 扩展权
        const extensionList = document.getElementById('extensionRights');
        if (extensionList) {
            extensionList.innerHTML = `
                <li><span class="${bp.extension.allowed ? 'check' : 'cross'}">${bp.extension.allowed ? '✓' : '✗'}</span> ${bp.extension.allowed ? '允许' : '不允许'}平台扩展</li>
                <li><span class="${bp.extension.aiTraining ? 'check' : 'cross'}">${bp.extension.aiTraining ? '✓' : '✗'}</span> ${bp.extension.aiTraining ? '支持' : '不支持'} AI 训练</li>
            `;
        }
    }
    
    selectLicenseType(type) {
        this.selectedLicenseType = type;
        
        // 更新 UI
        document.querySelectorAll('.license-option-card').forEach(card => {
            card.classList.remove('selected');
        });
        
        const selectedCard = document.querySelector(`.license-option-card[data-type="${type}"]`);
        if (selectedCard) {
            selectedCard.classList.add('selected');
        }
        
        this.updatePrice();
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
                
                // 更新显示
                document.getElementById('onetimePrice').textContent = this.prices.base;
                document.getElementById('perusePrice').textContent = this.prices.perUse;
                document.getElementById('timedPrice').textContent = this.prices.daily;
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
        const basePriceEl = document.getElementById('basePriceDisplay');
        const multiplierDisplayEl = document.getElementById('multiplierDisplay');
        const platformFeeEl = document.getElementById('platformFeeDisplay');
        const totalPriceEl = document.getElementById('totalPriceDisplay');
        const btnPriceEl = document.getElementById('btnPrice');
        
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
        
        const price = this.calculatePrice();
        
        // 验证价格有效性
        if (price.totalPrice <= 0 || isNaN(price.totalPrice)) {
            alert('价格计算错误，请刷新页面重试');
            return;
        }
        
        // 确认购买
        const confirmed = confirm(
            `确认购买 ${this.getLicenseTypeName()} 授权?\n` +
            `资产: ${this.asset?.title || '未知资产'}\n` +
            `使用场景: ${this.getUsageTypeName()}\n` +
            `总价: ${price.totalPrice.toFixed(2)} MEER`
        );
        
        if (!confirmed) return;
        
        // 显示加载状态
        this.showLoadingState('正在提交交易，请在钱包中确认...');
        
        try {
            const result = await this.purchaseLicense(price.totalPrice);
            
            this.hideLoadingState();
            this.showSuccess('购买成功！');
            
            if (result.licenseId) {
                alert(`购买成功！\n交易哈希: ${result.txHash}\nLicense ID: ${result.licenseId}`);
            } else {
                alert(`购买成功！\n交易哈希: ${result.txHash}`);
            }
            
            // 可以跳转到用户资产页面
            // window.location.href = 'dashboard.html';
        } catch (error) {
            this.hideLoadingState();
            this.showError('购买失败: ' + (error.message || '未知错误'));
            console.error('Purchase failed:', error);
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
    
    loadSimilarAssets() {
        const similarGrid = document.getElementById('similarGrid');
        if (!similarGrid) return;
        
        // 模拟类似作品数据
        const similarAssets = [
            { id: 2, title: '冬日暖阳', creator: '旋律工坊', price: 150 },
            { id: 3, title: '春日花开', creator: '自然之声', price: 200 },
            { id: 4, title: '秋叶飘落', creator: '季节乐队', price: 80 },
            { id: 5, title: '城市节奏', creator: '都市音乐人', price: 300 }
        ];
        
        similarGrid.innerHTML = similarAssets.map(asset => `
            <div class="similar-card" onclick="window.location.href='asset-detail.html?asset=${asset.id}'">
                <div class="similar-cover">🎵</div>
                <div class="similar-info">
                    <div class="similar-title">${asset.title}</div>
                    <div class="similar-creator">${asset.creator}</div>
                    <div class="similar-price">${asset.price} MEER</div>
                </div>
            </div>
        `).join('');
    }
    
    playPreview() {
        // 播放预览功能
        alert('🎵 正在播放音乐预览...\n（实际项目中这里会播放音频）');
    }
    
    formatNumber(num) {
        if (num >= 10000) {
            return (num / 10000).toFixed(1) + 'w';
        }
        if (num >= 1000) {
            return (num / 1000).toFixed(1) + 'k';
        }
        return num.toString();
    }
    
    showLoading() {
        document.getElementById('loadingState').classList.remove('hidden');
        document.getElementById('assetContent').classList.add('hidden');
        document.getElementById('errorState').classList.add('hidden');
    }
    
    hideLoading() {
        document.getElementById('loadingState').classList.add('hidden');
        document.getElementById('assetContent').classList.remove('hidden');
    }
    
    showError(message) {
        document.getElementById('loadingState').classList.add('hidden');
        document.getElementById('errorState').classList.remove('hidden');
        document.getElementById('errorText').textContent = message;
    }
    
    showLoadingState(message) {
        const statusEl = document.getElementById('transactionStatus');
        const statusText = document.getElementById('statusText');
        if (statusEl) {
            statusEl.classList.remove('hidden');
            statusText.textContent = message;
        }
        
        const purchaseBtn = document.getElementById('purchaseBtn');
        if (purchaseBtn) {
            purchaseBtn.disabled = true;
        }
    }
    
    hideLoadingState() {
        const statusEl = document.getElementById('transactionStatus');
        if (statusEl) {
            statusEl.classList.add('hidden');
        }
        
        const purchaseBtn = document.getElementById('purchaseBtn');
        if (purchaseBtn) {
            purchaseBtn.disabled = false;
        }
    }
    
    showSuccess(message) {
        const successEl = document.getElementById('successMessage');
        if (successEl) {
            successEl.classList.remove('hidden');
            successEl.textContent = message;
        }
    }
    
    showError(message) {
        const errorEl = document.getElementById('errorMessage');
        if (errorEl) {
            errorEl.classList.remove('hidden');
            errorEl.textContent = message;
        }
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    window.assetDetail = new AssetDetail();
});
