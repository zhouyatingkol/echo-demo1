/**
 * contract-manager-v3.js - ECHO Protocol V3 合约交互管理器
 * 集成 LicenseNFTV3, ECHOAssetV2V3, ECHOFusion
 */

class ContractManagerV3 {
    constructor(provider, signer) {
        this.provider = provider;
        this.signer = signer;
        this.contracts = {};
        
        // V3 合约地址
        this.addresses = {
            echoAsset: '0xF98f63b7e8064Dcf9c2f25A906B2af89Af4840ce',
            echoFusion: '0x31Cd483Ee827A272816808AD49b90c71B1c82E11',
            licenseNFT: '0x2f79b56047050FD2Ee7C62d2d0fe644c15c68e23'
        };
        
        this.init();
    }
    
    async init() {
        await this.loadABIs();
        this.initializeContracts();
    }
    
    async loadABIs() {
        // LicenseNFTV3 ABI (关键函数)
        this.abis = {
            licenseNFT: [
                // 购买函数
                "function purchaseOneTime(uint256 _parentAssetId, uint8 _usageType) public payable",
                "function purchasePerUse(uint256 _parentAssetId, uint8 _usageType, uint256 _usageCount) public payable",
                "function purchaseTimed(uint256 _parentAssetId, uint8 _usageType, uint256 _days) public payable",
                
                // 查询函数
                "function licenses(uint256 _licenseId) public view returns (tuple(uint256 id, uint256 parentAssetId, address licensee, uint8 licenseType, uint8 usageType, uint256 validFrom, uint256 validUntil, uint256 maxUsageCount, uint256 usedCount, uint256 pricePaid, bool isTransferable, bool isFrozen, bool isRevoked))",
                "function verifyLicense(uint256 _licenseId, address _user, uint8 _usageType) public view returns (bool)",
                "function ownerOf(uint256 tokenId) public view returns (address)",
                
                // 使用记录
                "function recordUsage(uint256 _licenseId, address _user) public returns (bool)",
                
                // 价格和倍率
                "function usageMultipliers(uint8 _type) public view returns (uint256)",
                "function platformFeeRate() public view returns (uint256)",
                
                // 事件
                "event LicensePurchased(uint256 indexed licenseId, uint256 indexed parentAssetId, address indexed licensee, uint8 licenseType, uint8 usageType, uint256 price, uint256 timestamp)"
            ],
            
            echoAsset: [
                // 资产信息
                "function assetMetadata(uint256 tokenId) public view returns (tuple(string name, string description, string assetType, string uri, bytes32 contentHash, uint256 createdAt, uint256 lastUpdated))",
                "function rightsBlueprint(uint256 tokenId) public view returns (tuple(tuple(address owner, uint256 fee, bool commercialUse, bool modificationAllowed, string[] allowedScopes, string[] restrictedScopes, uint256 maxUsers, uint256 licenseDuration) usage, tuple(address owner, uint256 fee, bool allowDerivatives, uint256 revenueShare, string[] allowedTypes) derivative, tuple(address owner, uint256 fee, bool allowExtensions, string[] allowedExtensions) extension, tuple(address owner, uint256 sharePercentage, bool autoDistribute) revenue))",
                "function originalCreator(uint256 tokenId) public view returns (address)",
                
                // 价格设置
                "function basePrices(uint256 tokenId) public view returns (uint256)",
                "function perUsePrices(uint256 tokenId) public view returns (uint256)",
                "function dailyPrices(uint256 tokenId) public view returns (uint256)",
                
                // 生成
                "function mintECHO(string memory name, string memory description, string memory assetType, string memory uri, bytes32 contentHash, tuple(tuple(address owner, uint256 fee, bool commercialUse, bool modificationAllowed, string[] allowedScopes, string[] restrictedScopes, uint256 maxUsers, uint256 licenseDuration) usage, tuple(address owner, uint256 fee, bool allowDerivatives, uint256 revenueShare, string[] allowedTypes) derivative, tuple(address owner, uint256 fee, bool allowExtensions, string[] allowedExtensions) extension, tuple(address owner, uint256 sharePercentage, bool autoDistribute) revenue) memory blueprint) public returns (uint256)"
            ],
            
            echoFusion: [
                // 融合功能
                "function fuseTree(uint256[] memory seedIds, string memory treeName, string memory description) public returns (uint256)",
                "function distributeRevenue(uint256 treeId) public payable",
                "function claimRevenue(uint256 treeId) public",
                "function getTreeRevenue(uint256 treeId) public view returns (uint256)"
            ]
        };
    }
    
    initializeContracts() {
        if (!this.signer) return;
        
        this.contracts.licenseNFT = new ethers.Contract(
            this.addresses.licenseNFT,
            this.abis.licenseNFT,
            this.signer
        );
        
        this.contracts.echoAsset = new ethers.Contract(
            this.addresses.echoAsset,
            this.abis.echoAsset,
            this.signer
        );
        
        this.contracts.echoFusion = new ethers.Contract(
            this.addresses.echoFusion,
            this.abis.echoFusion,
            this.signer
        );
    }
    
    // ==================== License 购买函数 ====================
    
    /**
     * 购买买断制授权
     * @param {number} assetId - 资产ID
     * @param {number} usageType - 使用场景 (0: personal, 1: game, 2: ai_training, 3: commercial)
     * @param {string} price - 价格 (ETH format, e.g. "1.05")
     */
    async purchaseOneTime(assetId, usageType, price) {
        if (!this.contracts.licenseNFT) {
            throw new Error('合约未初始化，请先连接钱包');
        }
        
        const priceWei = ethers.parseEther(price.toString());
        
        const tx = await this.contracts.licenseNFT.purchaseOneTime(
            assetId,
            usageType,
            { value: priceWei }
        );
        
        const receipt = await tx.wait();
        
        // 解析事件获取 licenseId
        let licenseId = null;
        try {
            const event = receipt.logs.find(log => {
                try {
                    const parsed = this.contracts.licenseNFT.interface.parseLog(log);
                    return parsed && parsed.name === 'LicensePurchased';
                } catch {
                    return false;
                }
            });
            
            if (event) {
                const parsed = this.contracts.licenseNFT.interface.parseLog(event);
                licenseId = parsed.args.licenseId.toString();
            }
        } catch (error) {
            console.warn('Failed to parse LicensePurchased event:', error);
        }
        
        return {
            txHash: receipt.hash,
            licenseId,
            blockNumber: receipt.blockNumber
        };
    }
    
    /**
     * 购买按次计费授权
     */
    async purchasePerUse(assetId, usageType, usageCount, price) {
        if (!this.contracts.licenseNFT) {
            throw new Error('合约未初始化，请先连接钱包');
        }
        
        const priceWei = ethers.parseEther(price.toString());
        
        const tx = await this.contracts.licenseNFT.purchasePerUse(
            assetId,
            usageType,
            usageCount,
            { value: priceWei }
        );
        
        const receipt = await tx.wait();
        
        // 解析事件获取 licenseId
        let licenseId = null;
        try {
            const event = receipt.logs.find(log => {
                try {
                    const parsed = this.contracts.licenseNFT.interface.parseLog(log);
                    return parsed && parsed.name === 'LicensePurchased';
                } catch {
                    return false;
                }
            });
            
            if (event) {
                const parsed = this.contracts.licenseNFT.interface.parseLog(event);
                licenseId = parsed.args.licenseId.toString();
            }
        } catch (error) {
            console.warn('Failed to parse LicensePurchased event:', error);
        }
        
        return {
            txHash: receipt.hash,
            licenseId,
            blockNumber: receipt.blockNumber
        };
    }
    
    /**
     * 购买限时授权
     */
    async purchaseTimed(assetId, usageType, days, price) {
        if (!this.contracts.licenseNFT) {
            throw new Error('合约未初始化，请先连接钱包');
        }
        
        const priceWei = ethers.parseEther(price.toString());
        
        const tx = await this.contracts.licenseNFT.purchaseTimed(
            assetId,
            usageType,
            days,
            { value: priceWei }
        );
        
        const receipt = await tx.wait();
        
        // 解析事件获取 licenseId
        let licenseId = null;
        try {
            const event = receipt.logs.find(log => {
                try {
                    const parsed = this.contracts.licenseNFT.interface.parseLog(log);
                    return parsed && parsed.name === 'LicensePurchased';
                } catch {
                    return false;
                }
            });
            
            if (event) {
                const parsed = this.contracts.licenseNFT.interface.parseLog(event);
                licenseId = parsed.args.licenseId.toString();
            }
        } catch (error) {
            console.warn('Failed to parse LicensePurchased event:', error);
        }
        
        return {
            txHash: receipt.hash,
            licenseId,
            blockNumber: receipt.blockNumber
        };
    }
    
    // ==================== 查询函数 ====================
    
    /**
     * 获取资产基础价格
     */
    async getAssetPrices(assetId) {
        if (!this.contracts.echoAsset) return null;
        
        const [basePrice, perUsePrice, dailyPrice] = await Promise.all([
            this.contracts.echoAsset.basePrices(assetId),
            this.contracts.echoAsset.perUsePrices(assetId),
            this.contracts.echoAsset.dailyPrices(assetId)
        ]);
        
        return {
            base: ethers.formatEther(basePrice),
            perUse: ethers.formatEther(perUsePrice),
            daily: ethers.formatEther(dailyPrice)
        };
    }
    
    /**
     * 获取场景倍率
     */
    async getUsageMultiplier(usageType) {
        if (!this.contracts.licenseNFT) return null;
        
        const multiplier = await this.contracts.licenseNFT.usageMultipliers(usageType);
        return Number(multiplier) / 100; // 转换为小数
    }
    
    /**
     * 获取平台费率
     */
    async getPlatformFeeRate() {
        if (!this.contracts.licenseNFT) return null;
        
        const rate = await this.contracts.licenseNFT.platformFeeRate();
        return Number(rate) / 10000; // 转换为百分比
    }
    
    /**
     * 获取用户的 License 列表
     */
    async getUserLicenses(userAddress) {
        // 这里需要通过事件查询或额外的索引服务
        // 简化版本：返回空数组，后续可实现完整查询
        return [];
    }
    
    /**
     * 验证 License 有效性
     */
    async verifyLicense(licenseId, userAddress, usageType) {
        if (!this.contracts.licenseNFT) return false;
        
        return await this.contracts.licenseNFT.verifyLicense(
            licenseId,
            userAddress,
            usageType
        );
    }
    
    // ==================== 工具函数 ====================
    
    /**
     * 计算购买价格
     */
    async calculatePurchasePrice(assetId, licenseType, usageType, params = {}) {
        // 获取基础价格
        const prices = await this.getAssetPrices(assetId);
        if (!prices) return null;
        
        // 获取倍率
        const multiplier = await this.getUsageMultiplier(usageType);
        
        // 获取平台费率
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
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ContractManagerV3;
}
