/**
 * mock-contract.js - 智能合约交互模拟
 * 用于 E2E 测试，模拟 LicenseNFT V3 合约行为
 */

class MockContractManager {
    constructor(provider, signer) {
        this.provider = provider;
        this.signer = signer;
        this.address = '0x742d35Cc6634C0532925a3b8D4c9db96590f6C7E';
        
        // V3 合约地址
        this.addresses = {
            echoAsset: '0xF98f63b7e8064Dcf9c2f25A906B2af89Af4840ce',
            echoFusion: '0x31Cd483Ee827A272816808AD49b90c71B1c82E11',
            licenseNFT: '0x2f79b56047050FD2Ee7C62d2d0fe644c15c68e23'
        };
        
        // 模拟数据存储
        this.licenses = new Map();
        this.assets = new Map();
        this.nextLicenseId = 1;
        
        // 初始化模拟数据
        this.initMockData();
    }
    
    /**
     * 初始化模拟数据
     */
    initMockData() {
        // 模拟资产数据
        const mockAssets = [
            {
                id: 1,
                title: '夏日微风',
                creator: '音乐制作人小王',
                description: '这是一首关于夏天的轻松音乐',
                basePrice: '100',
                perUsePrice: '0.5',
                dailyPrice: '10',
                plays: 1234,
                licenses: 56
            },
            {
                id: 2,
                title: '冬日暖阳',
                creator: '旋律工坊',
                description: '温暖的旋律如同冬日里的阳光',
                basePrice: '150',
                perUsePrice: '0.8',
                dailyPrice: '15',
                plays: 892,
                licenses: 34
            },
            {
                id: 3,
                title: '春日花开',
                creator: '自然之声',
                description: '充满生机的春日旋律',
                basePrice: '200',
                perUsePrice: '1.0',
                dailyPrice: '20',
                plays: 2156,
                licenses: 89
            }
        ];
        
        mockAssets.forEach(asset => {
            this.assets.set(asset.id, asset);
        });
    }
    
    /**
     * 初始化合约
     */
    async init() {
        // 模拟初始化延迟
        await this.delay(300);
        console.log('[MockContract] Initialized');
        return true;
    }
    
    // ==================== License 购买函数 ====================
    
    /**
     * 购买买断制授权
     */
    async purchaseOneTime(assetId, usageType, price) {
        await this.delay(1000);
        
        // 验证资产存在
        const asset = this.assets.get(assetId);
        if (!asset) {
            throw new Error('Asset not found');
        }
        
        // 检查合约失败模式
        if (window.MOCK_CONTRACT_FAIL) {
            throw new Error('Contract call failed: execution reverted');
        }
        
        // 生成 License ID
        const licenseId = this.nextLicenseId++;
        
        // 创建 License 记录
        const license = {
            id: licenseId,
            parentAssetId: assetId,
            licensee: this.address,
            licenseType: 0, // ONE_TIME
            usageType: usageType,
            validFrom: Math.floor(Date.now() / 1000),
            validUntil: 0, // 永久
            maxUsageCount: 0, // 无限
            usedCount: 0,
            pricePaid: price,
            isTransferable: true,
            isFrozen: false,
            isRevoked: false,
            createdAt: new Date().toISOString()
        };
        
        this.licenses.set(licenseId, license);
        
        // 更新资产授权计数
        asset.licenses++;
        
        console.log(`[MockContract] One-time license purchased: ${licenseId} for asset ${assetId}`);
        
        // 模拟交易结果
        return {
            txHash: this.generateTxHash(),
            licenseId: licenseId.toString(),
            blockNumber: Math.floor(Math.random() * 1000000) + 15000000
        };
    }
    
    /**
     * 购买按次计费授权
     */
    async purchasePerUse(assetId, usageType, usageCount, price) {
        await this.delay(1000);
        
        const asset = this.assets.get(assetId);
        if (!asset) {
            throw new Error('Asset not found');
        }
        
        if (window.MOCK_CONTRACT_FAIL) {
            throw new Error('Contract call failed: execution reverted');
        }
        
        const licenseId = this.nextLicenseId++;
        
        const license = {
            id: licenseId,
            parentAssetId: assetId,
            licensee: this.address,
            licenseType: 1, // PER_USE
            usageType: usageType,
            validFrom: Math.floor(Date.now() / 1000),
            validUntil: 0,
            maxUsageCount: usageCount,
            usedCount: 0,
            pricePaid: price,
            isTransferable: true,
            isFrozen: false,
            isRevoked: false,
            createdAt: new Date().toISOString()
        };
        
        this.licenses.set(licenseId, license);
        asset.licenses++;
        
        console.log(`[MockContract] Per-use license purchased: ${licenseId} (${usageCount} uses)`);
        
        return {
            txHash: this.generateTxHash(),
            licenseId: licenseId.toString(),
            blockNumber: Math.floor(Math.random() * 1000000) + 15000000
        };
    }
    
    /**
     * 购买限时授权
     */
    async purchaseTimed(assetId, usageType, days, price) {
        await this.delay(1000);
        
        const asset = this.assets.get(assetId);
        if (!asset) {
            throw new Error('Asset not found');
        }
        
        if (window.MOCK_CONTRACT_FAIL) {
            throw new Error('Contract call failed: execution reverted');
        }
        
        const licenseId = this.nextLicenseId++;
        const now = Math.floor(Date.now() / 1000);
        
        const license = {
            id: licenseId,
            parentAssetId: assetId,
            licensee: this.address,
            licenseType: 2, // TIMED
            usageType: usageType,
            validFrom: now,
            validUntil: now + (days * 24 * 60 * 60),
            maxUsageCount: 0, // 无限次
            usedCount: 0,
            pricePaid: price,
            isTransferable: true,
            isFrozen: false,
            isRevoked: false,
            createdAt: new Date().toISOString()
        };
        
        this.licenses.set(licenseId, license);
        asset.licenses++;
        
        console.log(`[MockContract] Timed license purchased: ${licenseId} (${days} days)`);
        
        return {
            txHash: this.generateTxHash(),
            licenseId: licenseId.toString(),
            blockNumber: Math.floor(Math.random() * 1000000) + 15000000
        };
    }
    
    // ==================== 查询函数 ====================
    
    /**
     * 获取资产基础价格
     */
    async getAssetPrices(assetId) {
        await this.delay(200);
        
        const asset = this.assets.get(assetId);
        if (!asset) {
            return {
                base: '100',
                perUse: '0.5',
                daily: '10'
            };
        }
        
        return {
            base: asset.basePrice,
            perUse: asset.perUsePrice,
            daily: asset.dailyPrice
        };
    }
    
    /**
     * 获取场景倍率
     */
    async getUsageMultiplier(usageType) {
        await this.delay(100);
        
        // 场景倍率映射
        const multipliers = {
            0: 1.0,   // PERSONAL
            1: 1.5,   // GAME
            2: 2.0,   // AI_TRAINING
            3: 3.0,   // COMMERCIAL
            4: 2.5,   // BROADCAST
            5: 1.2    // STREAMING
        };
        
        return multipliers[usageType] || 1.0;
    }
    
    /**
     * 获取平台费率
     */
    async getPlatformFeeRate() {
        await this.delay(100);
        return 0.05; // 5%
    }
    
    /**
     * 获取 License 详情
     */
    async getLicense(licenseId) {
        await this.delay(200);
        return this.licenses.get(licenseId) || null;
    }
    
    /**
     * 验证 License 有效性
     */
    async verifyLicense(licenseId, userAddress, usageType) {
        await this.delay(200);
        
        const license = this.licenses.get(licenseId);
        if (!license) return false;
        
        // 检查是否被撤销
        if (license.isRevoked) return false;
        
        // 检查所有者
        if (license.licensee.toLowerCase() !== userAddress.toLowerCase()) {
            return false;
        }
        
        // 检查使用类型匹配
        if (license.usageType !== usageType) {
            return false;
        }
        
        // 检查限时授权是否过期
        if (license.licenseType === 2 && license.validUntil > 0) {
            const now = Math.floor(Date.now() / 1000);
            if (now > license.validUntil) {
                return false;
            }
        }
        
        // 检查按次计费是否还有次数
        if (license.licenseType === 1 && license.maxUsageCount > 0) {
            if (license.usedCount >= license.maxUsageCount) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * 获取用户所有 License
     */
    async getUserLicenses(userAddress) {
        await this.delay(300);
        
        const userLicenses = [];
        this.licenses.forEach((license, id) => {
            if (license.licensee.toLowerCase() === userAddress.toLowerCase()) {
                userLicenses.push({ id, ...license });
            }
        });
        
        return userLicenses;
    }
    
    // ==================== 价格计算 ====================
    
    /**
     * 计算购买价格
     */
    async calculatePurchasePrice(assetId, licenseType, usageType, params = {}) {
        const prices = await this.getAssetPrices(assetId);
        const multiplier = await this.getUsageMultiplier(usageType);
        const feeRate = await this.getPlatformFeeRate();
        
        let basePrice = 0;
        
        switch (licenseType) {
            case 'onetime':
                basePrice = parseFloat(prices.base);
                break;
            case 'peruse':
                basePrice = parseFloat(prices.perUse) * (params.count || 100);
                break;
            case 'timed':
                basePrice = parseFloat(prices.daily) * (params.days || 30);
                break;
        }
        
        const adjustedPrice = basePrice * multiplier;
        const platformFee = adjustedPrice * feeRate;
        const total = adjustedPrice + platformFee;
        
        return {
            basePrice,
            multiplier,
            adjustedPrice,
            platformFee,
            total,
            feeRate
        };
    }
    
    // ==================== 辅助方法 ====================
    
    /**
     * 生成模拟交易哈希
     */
    generateTxHash() {
        return '0x' + Array(64).fill(0).map(() => 
            Math.floor(Math.random() * 16).toString(16)
        ).join('');
    }
    
    /**
     * 延迟函数
     */
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    /**
     * 获取资产列表
     */
    async getAssets(page = 1, limit = 12) {
        await this.delay(500);
        
        const assets = Array.from(this.assets.values());
        const start = (page - 1) * limit;
        const end = start + limit;
        
        return {
            assets: assets.slice(start, end),
            total: assets.length,
            page,
            totalPages: Math.ceil(assets.length / limit)
        };
    }
    
    /**
     * 搜索资产
     */
    async searchAssets(query, filters = {}) {
        await this.delay(300);
        
        let results = Array.from(this.assets.values());
        
        // 文本搜索
        if (query) {
            const lowerQuery = query.toLowerCase();
            results = results.filter(asset => 
                asset.title.toLowerCase().includes(lowerQuery) ||
                asset.creator.toLowerCase().includes(lowerQuery) ||
                asset.description.toLowerCase().includes(lowerQuery)
            );
        }
        
        // 价格筛选
        if (filters.priceRange) {
            const [min, max] = filters.priceRange.split('-').map(p => 
                p === '500+' ? 500 : parseInt(p)
            );
            if (filters.priceRange === '500+') {
                results = results.filter(asset => parseFloat(asset.basePrice) >= 500);
            } else {
                results = results.filter(asset => {
                    const price = parseFloat(asset.basePrice);
                    return price >= min && price <= max;
                });
            }
        }
        
        return results;
    }
    
    // ==================== 测试控制方法 ====================
    
    /**
     * 启用合约失败模式
     */
    enableFailMode() {
        window.MOCK_CONTRACT_FAIL = true;
    }
    
    /**
     * 禁用合约失败模式
     */
    disableFailMode() {
        window.MOCK_CONTRACT_FAIL = false;
    }
    
    /**
     * 获取所有 License 数量
     */
    getLicenseCount() {
        return this.licenses.size;
    }
    
    /**
     * 清空所有 License
     */
    clearLicenses() {
        this.licenses.clear();
        this.nextLicenseId = 1;
    }
    
    /**
     * 添加测试 License
     */
    addTestLicense(licenseData) {
        const licenseId = this.nextLicenseId++;
        this.licenses.set(licenseId, {
            id: licenseId,
            ...licenseData
        });
        return licenseId;
    }
}

// ==================== 模拟事件 ====================

/**
 * 模拟 LicensePurchased 事件
 */
class MockLicensePurchasedEvent {
    constructor(licenseId, parentAssetId, licensee, licenseType, usageType, price) {
        this.event = 'LicensePurchased';
        this.args = {
            licenseId: ethers.BigNumber.from(licenseId),
            parentAssetId: ethers.BigNumber.from(parentAssetId),
            licensee,
            licenseType,
            usageType,
            price: ethers.utils.parseEther(price.toString())
        };
    }
}

// Node.js 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { MockContractManager, MockLicensePurchasedEvent };
}

// 浏览器导出
if (typeof window !== 'undefined') {
    window.MockContractManager = MockContractManager;
    window.MockLicensePurchasedEvent = MockLicensePurchasedEvent;
}
