/**
 * ECHO Protocol 合约交互模块
 * 与 Qitmeer 主网合约交互
 */

class ECHOContractManager {
    constructor(provider, signer) {
        this.provider = provider;
        this.signer = signer;
        
        // 合约地址
        this.addresses = {
            ECHOAssetV2: '0xF98f63b7e8064Dcf9c2f25A906B2af89Af4840ce',
            ECHOFusion: '0x31Cd483Ee827A272816808AD49b90c71B1c82E11',
            LicenseNFT: '0x2f79b56047050FD2Ee7C62d2d0fe644c15c68e23'
        };
        
        // 初始化合约
        this.initContracts();
    }
    
    /**
     * 初始化合约实例
     */
    initContracts() {
        // ECHOAssetV2 ABI（关键函数）
        const ECHO_ASSET_ABI = [
            // 铸造函数
            'function mintECHO(string name, string description, string assetType, string uri, bytes32 contentHash, tuple(tuple(address owner, uint256 fee, bool commercialUse, bool modificationAllowed, string[] allowedScopes, string[] restrictedScopes, uint256 maxUsers, uint256 licenseDuration) usage, tuple(address owner, uint256 fee, bool allowDerivatives, uint256 revenueShare, string[] allowedTypes) derivative, tuple(address owner, uint256 fee, bool allowExtensions, string[] allowedExtensions) extension, tuple(address owner, uint256 sharePercentage, bool autoDistribute) revenue) blueprint) returns (uint256)',
            // 查询函数
            'function assetMetadata(uint256 tokenId) view returns (string name, string description, string assetType, string uri, bytes32 contentHash, uint256 createdAt, uint256 lastUpdated)',
            'function rightsBlueprint(uint256 tokenId) view returns (tuple(address owner, uint256 fee, bool commercialUse, bool modificationAllowed, string[] allowedScopes, string[] restrictedScopes, uint256 maxUsers, uint256 licenseDuration) usage, tuple(address owner, uint256 fee, bool allowDerivatives, uint256 revenueShare, string[] allowedTypes) derivative, tuple(address owner, uint256 fee, bool allowExtensions, string[] allowedExtensions) extension, tuple(address owner, uint256 sharePercentage, bool autoDistribute) revenue)',
            'function originalCreator(uint256 tokenId) view returns (address)',
            'function currentVersion(uint256 tokenId) view returns (uint256)',
            'function contentHashToToken(bytes32 contentHash) view returns (uint256)',
            // 标准 ERC721
            'function balanceOf(address owner) view returns (uint256)',
            'function ownerOf(uint256 tokenId) view returns (address)',
            'function tokenURI(uint256 tokenId) view returns (string)',
            'function getCurrentTokenId() view returns (uint256)',
            // 事件
            'event AssetMinted(uint256 indexed tokenId, address indexed creator, bytes32 contentHash, string name)',
            'event RightsBlueprintConfigured(uint256 indexed tokenId, tuple(tuple(address owner, uint256 fee, bool commercialUse, bool modificationAllowed, string[] allowedScopes, string[] restrictedScopes, uint256 maxUsers, uint256 licenseDuration) usage, tuple(address owner, uint256 fee, bool allowDerivatives, uint256 revenueShare, string[] allowedTypes) derivative, tuple(address owner, uint256 fee, bool allowExtensions, string[] allowedExtensions) extension, tuple(address owner, uint256 sharePercentage, bool autoDistribute) revenue) blueprint)'
        ];
        
        // ECHOFusion ABI
        const ECHO_FUSION_ABI = [
            // 融合函数
            'function fuseTree(uint256[] seedIds, uint256[] weights, string name, string description) returns (uint256)',
            // 收益分配
            'function distributeRevenue(uint256 treeId) payable',
            'function claimRevenue(uint256 treeId)',
            // 查询函数
            'function trees(uint256 treeId) view returns (uint256 treeId, string name, string description, uint256[] seedIds, uint256[] weights, address[] seedOwners, uint256 totalWeight, uint256 accumulatedRevenue, bool isActive)',
            'function pendingRevenue(uint256 treeId, address user) view returns (uint256)',
            'function isSeedFused(uint256 seedId) view returns (bool)',
            'function seedToTree(uint256 seedId) view returns (uint256)',
            'function getTreeInfo(uint256 treeId) view returns (string name, string description, uint256[] seedIds, uint256[] weights, uint256 totalRevenue, address owner)',
            'function getCurrentTreeId() view returns (uint256)',
            // 标准 ERC721
            'function ownerOf(uint256 tokenId) view returns (address)',
            // 事件
            'event TreeFused(uint256 indexed treeId, address indexed creator, uint256[] seedIds, uint256[] weights)',
            'event RevenueDistributed(uint256 indexed treeId, uint256 amount, address distributor)',
            'event RevenueClaimed(uint256 indexed treeId, address indexed user, uint256 amount)'
        ];
        
        // LicenseNFT ABI
        const LICENSE_ABI = [
            // 购买函数
            'function purchaseOneTime(uint256 parentAssetId, uint8 usageType) payable returns (uint256)',
            'function purchasePerUse(uint256 parentAssetId, uint8 usageType, uint256 usageCount) payable returns (uint256)',
            'function purchaseTimed(uint256 parentAssetId, uint8 usageType, uint256 days) payable returns (uint256)',
            // 验证和使用
            'function verifyLicense(uint256 licenseId, address user, uint8 usageType) view returns (bool)',
            'function recordUsage(uint256 licenseId, address user) returns (bool)',
            // 管理函数
            'function freezeLicense(uint256 licenseId, string reason)',
            'function revokeLicense(uint256 licenseId)',
            // 查询函数
            'function licenses(uint256 licenseId) view returns (tuple(uint256 id, uint256 parentAssetId, address licensee, uint8 licenseType, uint8 usageType, uint256 validFrom, uint256 validUntil, uint256 maxUsageCount, uint256 usedCount, uint256 pricePaid, bool isTransferable, bool isFrozen, bool isRevoked))',
            'function usageMultipliers(uint8 usageType) view returns (uint256)',
            'function platformFeeRate() view returns (uint256)',
            'function assetLicenses(uint256 assetId, uint256 index) view returns (uint256)',
            'function userLicenses(address user, uint256 index) view returns (uint256)',
            // 标准 ERC721
            'function balanceOf(address owner) view returns (uint256)',
            'function ownerOf(uint256 tokenId) view returns (address)',
            'function name() view returns (string)',
            'function symbol() view returns (string)',
            // 事件
            'event LicensePurchased(uint256 indexed licenseId, uint256 indexed parentAssetId, address indexed licensee, uint8 licenseType, uint8 usageType, uint256 price)',
            'event LicenseUsed(uint256 indexed licenseId, address indexed user, uint256 remainingCount)',
            'event LicenseFrozen(uint256 indexed licenseId, address indexed initiator, string reason)',
            'event LicenseRevoked(uint256 indexed licenseId, address indexed initiator)'
        ];
        
        // 创建合约实例
        this.echoAsset = new ethers.Contract(
            this.addresses.ECHOAssetV2,
            ECHO_ASSET_ABI,
            this.signer
        );
        
        this.echoFusion = new ethers.Contract(
            this.addresses.ECHOFusion,
            ECHO_FUSION_ABI,
            this.signer
        );
        
        this.licenseNFT = new ethers.Contract(
            this.addresses.LicenseNFT,
            LICENSE_ABI,
            this.signer
        );
    }
    
    // ========== ECHOAssetV2 方法 ==========
    
    /**
     * 铸造新的 ECHO 资产
     */
    async mintAsset(name, description, assetType, uri, contentHash, blueprint) {
        const tx = await this.echoAsset.mintECHO(name, description, assetType, uri, contentHash, blueprint);
        const receipt = await tx.wait();
        
        // 解析事件获取 tokenId
        const event = receipt.events.find(e => e.event === 'AssetMinted');
        return {
            txHash: receipt.transactionHash,
            tokenId: event ? event.args.tokenId.toString() : null,
            blockNumber: receipt.blockNumber
        };
    }
    
    /**
     * 获取资产信息
     */
    async getAssetInfo(tokenId) {
        const metadata = await this.echoAsset.assetMetadata(tokenId);
        const blueprint = await this.echoAsset.rightsBlueprint(tokenId);
        const creator = await this.echoAsset.originalCreator(tokenId);
        
        return {
            metadata: {
                name: metadata.name,
                description: metadata.description,
                assetType: metadata.assetType,
                uri: metadata.uri,
                contentHash: metadata.contentHash,
                createdAt: new Date(metadata.createdAt * 1000),
                lastUpdated: new Date(metadata.lastUpdated * 1000)
            },
            blueprint: {
                usage: {
                    owner: blueprint.usage.owner,
                    fee: ethers.utils.formatEther(blueprint.usage.fee),
                    commercialUse: blueprint.usage.commercialUse,
                    modificationAllowed: blueprint.usage.modificationAllowed,
                    allowedScopes: blueprint.usage.allowedScopes,
                    restrictedScopes: blueprint.usage.restrictedScopes,
                    maxUsers: blueprint.usage.maxUsers.toString(),
                    licenseDuration: blueprint.usage.licenseDuration.toString()
                },
                derivative: {
                    owner: blueprint.derivative.owner,
                    fee: ethers.utils.formatEther(blueprint.derivative.fee),
                    allowDerivatives: blueprint.derivative.allowDerivatives,
                    revenueShare: (blueprint.derivative.revenueShare / 100).toFixed(2) + '%',
                    allowedTypes: blueprint.derivative.allowedTypes
                }
            },
            creator
        };
    }
    
    /**
     * 检查内容是否已铸造
     */
    async isContentMinted(contentHash) {
        const tokenId = await this.echoAsset.contentHashToToken(contentHash);
        return tokenId.toString() !== '0';
    }
    
    // ========== ECHOFusion 方法 ==========
    
    /**
     * 融合多个资产创建树
     */
    async fuseTree(seedIds, weights, name, description) {
        const tx = await this.echoFusion.fuseTree(seedIds, weights, name, description);
        const receipt = await tx.wait();
        
        const event = receipt.events.find(e => e.event === 'TreeFused');
        return {
            txHash: receipt.transactionHash,
            treeId: event ? event.args.treeId.toString() : null,
            blockNumber: receipt.blockNumber
        };
    }
    
    /**
     * 向树分配收益
     */
    async distributeRevenue(treeId, amount) {
        const tx = await this.echoFusion.distributeRevenue(treeId, {
            value: ethers.utils.parseEther(amount.toString())
        });
        return await tx.wait();
    }
    
    /**
     * 领取收益
     */
    async claimRevenue(treeId) {
        const tx = await this.echoFusion.claimRevenue(treeId);
        return await tx.wait();
    }
    
    /**
     * 获取树信息
     */
    async getTreeInfo(treeId) {
        const info = await this.echoFusion.getTreeInfo(treeId);
        const pending = await this.echoFusion.pendingRevenue(treeId, await this.signer.getAddress());
        
        return {
            name: info.name,
            description: info.description,
            seedIds: info.seedIds.map(id => id.toString()),
            weights: info.weights.map(w => w.toString()),
            totalRevenue: ethers.utils.formatEther(info.totalRevenue),
            owner: info.owner,
            pendingRevenue: ethers.utils.formatEther(pending)
        };
    }
    
    // ========== LicenseNFT 方法 ==========
    
    /**
     * 购买买断制授权
     */
    async purchaseOneTimeLicense(assetId, usageType, price) {
        const tx = await this.licenseNFT.purchaseOneTime(assetId, usageType, {
            value: ethers.utils.parseEther(price.toString())
        });
        const receipt = await tx.wait();
        
        const event = receipt.events.find(e => e.event === 'LicensePurchased');
        return {
            txHash: receipt.transactionHash,
            licenseId: event ? event.args.licenseId.toString() : null,
            price: event ? ethers.utils.formatEther(event.args.price) : null
        };
    }
    
    /**
     * 购买按次计费授权
     */
    async purchasePerUseLicense(assetId, usageType, usageCount, price) {
        const tx = await this.licenseNFT.purchasePerUse(assetId, usageType, usageCount, {
            value: ethers.utils.parseEther(price.toString())
        });
        const receipt = await tx.wait();
        
        const event = receipt.events.find(e => e.event === 'LicensePurchased');
        return {
            txHash: receipt.transactionHash,
            licenseId: event ? event.args.licenseId.toString() : null,
            price: event ? ethers.utils.formatEther(event.args.price) : null
        };
    }
    
    /**
     * 购买限时授权
     */
    async purchaseTimedLicense(assetId, usageType, days, price) {
        const tx = await this.licenseNFT.purchaseTimed(assetId, usageType, days, {
            value: ethers.utils.parseEther(price.toString())
        });
        const receipt = await tx.wait();
        
        const event = receipt.events.find(e => e.event === 'LicensePurchased');
        return {
            txHash: receipt.transactionHash,
            licenseId: event ? event.args.licenseId.toString() : null,
            price: event ? ethers.utils.formatEther(event.args.price) : null
        };
    }
    
    /**
     * 验证 License 有效性
     */
    async verifyLicense(licenseId, usageType) {
        try {
            const userAddress = await this.signer.getAddress();
            return await this.licenseNFT.verifyLicense(licenseId, userAddress, usageType);
        } catch (error) {
            return false;
        }
    }
    
    /**
     * 获取 License 详情
     */
    async getLicenseInfo(licenseId) {
        const license = await this.licenseNFT.licenses(licenseId);
        
        return {
            id: license.id.toString(),
            parentAssetId: license.parentAssetId.toString(),
            licensee: license.licensee,
            licenseType: ['ONE_TIME', 'PER_USE', 'TIMED'][license.licenseType],
            usageType: ['PERSONAL', 'GAME', 'AI_TRAINING', 'COMMERCIAL', 'BROADCAST', 'STREAMING'][license.usageType],
            validFrom: new Date(license.validFrom * 1000),
            validUntil: license.validUntil.toString() === '0' ? '永久' : new Date(license.validUntil * 1000),
            maxUsageCount: license.maxUsageCount.toString() === '0' ? '无限' : license.maxUsageCount.toString(),
            usedCount: license.usedCount.toString(),
            pricePaid: ethers.utils.formatEther(license.pricePaid),
            isTransferable: license.isTransferable,
            isFrozen: license.isFrozen,
            isRevoked: license.isRevoked
        };
    }
    
    /**
     * 获取场景倍率
     */
    async getUsageMultiplier(usageType) {
        const multiplier = await this.licenseNFT.usageMultipliers(usageType);
        return Number(multiplier) / 100; // 转为倍数 (100 = 1x)
    }
    
    /**
     * 获取平台费率
     */
    async getPlatformFeeRate() {
        const rate = await this.licenseNFT.platformFeeRate();
        return Number(rate) / 10000; // 转为百分比 (500 = 5%)
    }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ECHOContractManager;
}
