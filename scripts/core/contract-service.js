/**
 * ECHO Contract Service
 * 封装与智能合约的交互，支持 ECHOAssetV2V3 和 LicenseNFTV3 合约
 * 
 * 网络: Qitmeer 主网 (Chain ID: 813)
 */

// 合约配置
const CONTRACT_CONFIG = {
    network: {
        name: 'Qitmeer Mainnet',
        chainId: 813,
        chainIdHex: '0x32d',
        rpcUrl: 'https://qng.rpc.qitmeer.io',
        currency: 'MEER',
        blockExplorer: 'https://qng.qitmeer.io'
    },
    contracts: {
        ECHOAssetV2V3: {
            address: '0xF98f63b7e8064Dcf9c2f25A906B2af89Af4840ce',
            version: '3.0.0'
        },
        LicenseNFTV3: {
            address: '0x2f79b56047050FD2Ee7C62d2d0fe644c15c68e23',
            version: '3.0.0'
        },
        ECHOFusionV2: {
            address: '0x8Eb7a29C41478a3f32015C1330DFf7cc683d0952',
            version: '2.0.0'
        }
    }
};

// UsageType 枚举 (对应合约中的 UsageType)
const UsageType = {
    PERSONAL: 0,      // 个人使用
    GAME: 1,          // 游戏配乐
    AI_TRAINING: 2,   // AI 训练
    COMMERCIAL: 3,    // 商业广告
    BROADCAST: 4,     // 广播
    STREAMING: 5      // 流媒体
};

// LicenseType 枚举 (合约内部使用)
const LicenseType = {
    ONE_TIME: 0,      // 买断制
    PER_USE: 1,       // 按次计费
    TIMED: 2,         // 限时授权
    SUBSCRIPTION: 3   // 订阅制
};

/**
 * 合约服务类
 */
class ContractService {
    constructor() {
        this.provider = null;
        this.signer = null;
        this.address = null;
        this.isInitialized = false;
        
        // 合约实例
        this.echoAssetContract = null;
        this.licenseContract = null;
        
        // 事件监听器
        this.eventListeners = new Map();
    }

    /**
     * 初始化服务
     * @param {ethers.Provider} provider - ethers provider
     * @param {ethers.Signer} signer - ethers signer
     */
    async initialize(provider, signer) {
        try {
            this.provider = provider;
            this.signer = signer;
            this.address = await signer.getAddress();
            
            // 初始化合约实例
            await this.initContracts();
            
            this.isInitialized = true;
            console.log('[ContractService] Initialized successfully');
            return true;
        } catch (error) {
            console.error('[ContractService] Initialization failed:', error);
            throw new Error('合约服务初始化失败: ' + error.message);
        }
    }

    /**
     * 初始化合约实例
     */
    async initContracts() {
        // ECHOAssetV2V3 ABI (简化版，包含必要函数)
        const echoAssetABI = [
            // 铸造函数
            {
                "inputs": [
                    {"internalType": "string", "name": "name", "type": "string"},
                    {"internalType": "string", "name": "description", "type": "string"},
                    {"internalType": "string", "name": "assetType", "type": "string"},
                    {"internalType": "string", "name": "uri", "type": "string"},
                    {"internalType": "bytes32", "name": "contentHash", "type": "bytes32"},
                    {
                        "components": [
                            {
                                "components": [
                                    {"internalType": "address", "name": "owner", "type": "address"},
                                    {"internalType": "uint256", "name": "fee", "type": "uint256"},
                                    {"internalType": "bool", "name": "commercialUse", "type": "bool"},
                                    {"internalType": "bool", "name": "modificationAllowed", "type": "bool"},
                                    {"internalType": "string[]", "name": "allowedScopes", "type": "string[]"},
                                    {"internalType": "string[]", "name": "restrictedScopes", "type": "string[]"},
                                    {"internalType": "uint256", "name": "maxUsers", "type": "uint256"},
                                    {"internalType": "uint256", "name": "licenseDuration", "type": "uint256"}
                                ],
                                "internalType": "struct ECHOAssetV2V3.UsageRights",
                                "name": "usage",
                                "type": "tuple"
                            },
                            {
                                "components": [
                                    {"internalType": "address", "name": "owner", "type": "address"},
                                    {"internalType": "uint256", "name": "fee", "type": "uint256"},
                                    {"internalType": "bool", "name": "allowDerivatives", "type": "bool"},
                                    {"internalType": "uint256", "name": "revenueShare", "type": "uint256"},
                                    {"internalType": "string[]", "name": "allowedTypes", "type": "string[]"}
                                ],
                                "internalType": "struct ECHOAssetV2V3.DerivativeRights",
                                "name": "derivative",
                                "type": "tuple"
                            },
                            {
                                "components": [
                                    {"internalType": "address", "name": "owner", "type": "address"},
                                    {"internalType": "uint256", "name": "fee", "type": "uint256"},
                                    {"internalType": "bool", "name": "allowExtensions", "type": "bool"},
                                    {"internalType": "string[]", "name": "allowedExtensions", "type": "string[]"}
                                ],
                                "internalType": "struct ECHOAssetV2V3.ExtensionRights",
                                "name": "extension",
                                "type": "tuple"
                            },
                            {
                                "components": [
                                    {"internalType": "address", "name": "owner", "type": "address"},
                                    {"internalType": "uint256", "name": "sharePercentage", "type": "uint256"},
                                    {"internalType": "bool", "name": "autoDistribute", "type": "bool"}
                                ],
                                "internalType": "struct ECHOAssetV2V3.RevenueRights",
                                "name": "revenue",
                                "type": "tuple"
                            }
                        ],
                        "internalType": "struct ECHOAssetV2V3.RightsBlueprint",
                        "name": "blueprint",
                        "type": "tuple"
                    }
                ],
                "name": "mintECHO",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            // 查询函数
            {
                "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
                "name": "getAssetInfo",
                "outputs": [
                    {
                        "components": [
                            {"internalType": "string", "name": "name", "type": "string"},
                            {"internalType": "string", "name": "description", "type": "string"},
                            {"internalType": "string", "name": "assetType", "type": "string"},
                            {"internalType": "string", "name": "uri", "type": "string"},
                            {"internalType": "bytes32", "name": "contentHash", "type": "bytes32"},
                            {"internalType": "uint256", "name": "createdAt", "type": "uint256"},
                            {"internalType": "uint256", "name": "lastUpdated", "type": "uint256"}
                        ],
                        "internalType": "struct ECHOAssetV2V3.AssetMetadata",
                        "name": "metadata",
                        "type": "tuple"
                    },
                    {
                        "components": [
                            {
                                "components": [
                                    {"internalType": "address", "name": "owner", "type": "address"},
                                    {"internalType": "uint256", "name": "fee", "type": "uint256"},
                                    {"internalType": "bool", "name": "commercialUse", "type": "bool"},
                                    {"internalType": "bool", "name": "modificationAllowed", "type": "bool"},
                                    {"internalType": "string[]", "name": "allowedScopes", "type": "string[]"},
                                    {"internalType": "string[]", "name": "restrictedScopes", "type": "string[]"},
                                    {"internalType": "uint256", "name": "maxUsers", "type": "uint256"},
                                    {"internalType": "uint256", "name": "licenseDuration", "type": "uint256"}
                                ],
                                "internalType": "struct ECHOAssetV2V3.UsageRights",
                                "name": "usage",
                                "type": "tuple"
                            },
                            {
                                "components": [
                                    {"internalType": "address", "name": "owner", "type": "address"},
                                    {"internalType": "uint256", "name": "fee", "type": "uint256"},
                                    {"internalType": "bool", "name": "allowDerivatives", "type": "bool"},
                                    {"internalType": "uint256", "name": "revenueShare", "type": "uint256"},
                                    {"internalType": "string[]", "name": "allowedTypes", "type": "string[]"}
                                ],
                                "internalType": "struct ECHOAssetV2V3.DerivativeRights",
                                "name": "derivative",
                                "type": "tuple"
                            },
                            {
                                "components": [
                                    {"internalType": "address", "name": "owner", "type": "address"},
                                    {"internalType": "uint256", "name": "fee", "type": "uint256"},
                                    {"internalType": "bool", "name": "allowExtensions", "type": "bool"},
                                    {"internalType": "string[]", "name": "allowedExtensions", "type": "string[]"}
                                ],
                                "internalType": "struct ECHOAssetV2V3.ExtensionRights",
                                "name": "extension",
                                "type": "tuple"
                            },
                            {
                                "components": [
                                    {"internalType": "address", "name": "owner", "type": "address"},
                                    {"internalType": "uint256", "name": "sharePercentage", "type": "uint256"},
                                    {"internalType": "bool", "name": "autoDistribute", "type": "bool"}
                                ],
                                "internalType": "struct ECHOAssetV2V3.RevenueRights",
                                "name": "revenue",
                                "type": "tuple"
                            }
                        ],
                        "internalType": "struct ECHOAssetV2V3.RightsBlueprint",
                        "name": "blueprint",
                        "type": "tuple"
                    },
                    {"internalType": "address", "name": "creator", "type": "address"},
                    {"internalType": "uint256", "name": "version", "type": "uint256"}
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [{"internalType": "uint256", "name": "tokenId", "type": "uint256"}],
                "name": "ownerOf",
                "outputs": [{"internalType": "address", "name": "", "type": "address"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "getCurrentTokenId",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            // 事件
            {
                "anonymous": false,
                "inputs": [
                    {"indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256"},
                    {"indexed": true, "internalType": "address", "name": "creator", "type": "address"},
                    {"indexed": false, "internalType": "bytes32", "name": "contentHash", "type": "bytes32"},
                    {"indexed": false, "internalType": "string", "name": "name", "type": "string"},
                    {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
                ],
                "name": "AssetMinted",
                "type": "event"
            }
        ];

        // LicenseNFTV3 ABI (简化版)
        const licenseABI = [
            // 购买函数
            {
                "inputs": [
                    {"internalType": "uint256", "name": "_parentAssetId", "type": "uint256"},
                    {"internalType": "enum LicenseNFTV3.UsageType", "name": "_usageType", "type": "uint8"}
                ],
                "name": "purchaseOneTime",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "payable",
                "type": "function"
            },
            {
                "inputs": [
                    {"internalType": "uint256", "name": "_parentAssetId", "type": "uint256"},
                    {"internalType": "enum LicenseNFTV3.UsageType", "name": "_usageType", "type": "uint8"},
                    {"internalType": "uint256", "name": "_usageCount", "type": "uint256"}
                ],
                "name": "purchasePerUse",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "payable",
                "type": "function"
            },
            {
                "inputs": [
                    {"internalType": "uint256", "name": "_parentAssetId", "type": "uint256"},
                    {"internalType": "enum LicenseNFTV3.UsageType", "name": "_usageType", "type": "uint8"},
                    {"internalType": "uint256", "name": "_days", "type": "uint256"}
                ],
                "name": "purchaseTimed",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "payable",
                "type": "function"
            },
            // 查询函数
            {
                "inputs": [{"internalType": "uint256", "name": "_assetId", "type": "uint256"}],
                "name": "getAssetBasePrice",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [{"internalType": "uint256", "name": "_assetId", "type": "uint256"}],
                "name": "getAssetPerUsePrice",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [{"internalType": "uint256", "name": "_assetId", "type": "uint256"}],
                "name": "getAssetDailyPrice",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [{"internalType": "uint256", "name": "_assetId", "type": "uint256"}],
                "name": "getAssetCreator",
                "outputs": [{"internalType": "address", "name": "", "type": "address"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [{"internalType": "enum LicenseNFTV3.UsageType", "name": "", "type": "uint8"}],
                "name": "usageMultipliers",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "platformFeeRate",
                "outputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [{"internalType": "uint256", "name": "", "type": "uint256"}],
                "name": "licenses",
                "outputs": [
                    {"internalType": "uint256", "name": "id", "type": "uint256"},
                    {"internalType": "uint256", "name": "parentAssetId", "type": "uint256"},
                    {"internalType": "address", "name": "licensee", "type": "address"},
                    {"internalType": "enum LicenseNFTV3.LicenseType", "name": "licenseType", "type": "uint8"},
                    {"internalType": "enum LicenseNFTV3.UsageType", "name": "usageType", "type": "uint8"},
                    {"internalType": "uint256", "name": "validFrom", "type": "uint256"},
                    {"internalType": "uint256", "name": "validUntil", "type": "uint256"},
                    {"internalType": "uint256", "name": "maxUsageCount", "type": "uint256"},
                    {"internalType": "uint256", "name": "usedCount", "type": "uint256"},
                    {"internalType": "uint256", "name": "pricePaid", "type": "uint256"},
                    {"internalType": "bool", "name": "isTransferable", "type": "bool"},
                    {"internalType": "bool", "name": "isFrozen", "type": "bool"},
                    {"internalType": "bool", "name": "isRevoked", "type": "bool"}
                ],
                "stateMutability": "view",
                "type": "function"
            },
            // 事件
            {
                "anonymous": false,
                "inputs": [
                    {"indexed": true, "internalType": "uint256", "name": "licenseId", "type": "uint256"},
                    {"indexed": true, "internalType": "uint256", "name": "parentAssetId", "type": "uint256"},
                    {"indexed": true, "internalType": "address", "name": "licensee", "type": "address"},
                    {"indexed": false, "internalType": "enum LicenseNFTV3.LicenseType", "name": "licenseType", "type": "uint8"},
                    {"indexed": false, "internalType": "enum LicenseNFTV3.UsageType", "name": "usageType", "type": "uint8"},
                    {"indexed": false, "internalType": "uint256", "name": "price", "type": "uint256"},
                    {"indexed": false, "internalType": "uint256", "name": "timestamp", "type": "uint256"}
                ],
                "name": "LicensePurchased",
                "type": "event"
            }
        ];

        // 创建合约实例
        this.echoAssetContract = new ethers.Contract(
            CONTRACT_CONFIG.contracts.ECHOAssetV2V3.address,
            echoAssetABI,
            this.signer
        );

        this.licenseContract = new ethers.Contract(
            CONTRACT_CONFIG.contracts.LicenseNFTV3.address,
            licenseABI,
            this.signer
        );
    }

    /**
     * 检查服务是否已初始化
     */
    checkInitialized() {
        if (!this.isInitialized) {
            throw new Error('合约服务未初始化，请先调用 initialize()');
        }
    }

    // ==================== ECHOAssetV2V3 方法 ====================

    /**
     * 铸造新的 ECHO 作品
     * @param {Object} metadata - 作品元数据
     * @param {Object} rightsConfig - 权益配置
     * @returns {Promise<{tokenId: string, txHash: string}>}
     */
    async mintECHO(metadata, rightsConfig) {
        this.checkInitialized();

        try {
            // 构建 RightsBlueprint
            const blueprint = this.buildRightsBlueprint(rightsConfig);

            // 计算内容哈希 (使用元数据生成)
            const contentHash = this.generateContentHash(metadata);

            // 调用合约铸造
            const tx = await this.echoAssetContract.mintECHO(
                metadata.name,
                metadata.description,
                metadata.assetType,
                metadata.uri,
                contentHash,
                blueprint
            );

            console.log('[ContractService] Mint transaction submitted:', tx.hash);

            // 等待交易确认
            const receipt = await tx.wait();

            // 从事件中解析 tokenId
            const mintEvent = receipt.events.find(e => e.event === 'AssetMinted');
            const tokenId = mintEvent ? mintEvent.args.tokenId.toString() : null;

            return {
                tokenId,
                txHash: receipt.transactionHash,
                blockNumber: receipt.blockNumber,
                gasUsed: receipt.gasUsed.toString()
            };

        } catch (error) {
            console.error('[ContractService] Mint failed:', error);
            throw this.parseError(error);
        }
    }

    /**
     * 获取作品信息
     * @param {string|number} tokenId - 作品ID
     * @returns {Promise<Object>}
     */
    async getAssetInfo(tokenId) {
        this.checkInitialized();

        try {
            const [metadata, blueprint, creator, version] = 
                await this.echoAssetContract.getAssetInfo(tokenId);

            return {
                metadata: {
                    name: metadata.name,
                    description: metadata.description,
                    assetType: metadata.assetType,
                    uri: metadata.uri,
                    contentHash: metadata.contentHash,
                    createdAt: new Date(metadata.createdAt.toNumber() * 1000),
                    lastUpdated: new Date(metadata.lastUpdated.toNumber() * 1000)
                },
                rights: {
                    usage: {
                        owner: blueprint.usage.owner,
                        fee: ethers.utils.formatEther(blueprint.usage.fee),
                        commercialUse: blueprint.usage.commercialUse,
                        modificationAllowed: blueprint.usage.modificationAllowed,
                        maxUsers: blueprint.usage.maxUsers.toNumber(),
                        licenseDuration: blueprint.usage.licenseDuration.toNumber()
                    },
                    derivative: {
                        owner: blueprint.derivative.owner,
                        fee: ethers.utils.formatEther(blueprint.derivative.fee),
                        allowDerivatives: blueprint.derivative.allowDerivatives,
                        revenueShare: blueprint.derivative.revenueShare.toNumber()
                    },
                    extension: {
                        owner: blueprint.extension.owner,
                        fee: ethers.utils.formatEther(blueprint.extension.fee),
                        allowExtensions: blueprint.extension.allowExtensions
                    },
                    revenue: {
                        owner: blueprint.revenue.owner,
                        sharePercentage: blueprint.revenue.sharePercentage.toNumber(),
                        autoDistribute: blueprint.revenue.autoDistribute
                    }
                },
                creator,
                version: version.toNumber()
            };

        } catch (error) {
            console.error('[ContractService] Get asset info failed:', error);
            throw this.parseError(error);
        }
    }

    /**
     * 获取当前 Token ID
     * @returns {Promise<number>}
     */
    async getCurrentTokenId() {
        this.checkInitialized();
        const tokenId = await this.echoAssetContract.getCurrentTokenId();
        return tokenId.toNumber();
    }

    // ==================== LicenseNFTV3 方法 ====================

    /**
     * 购买一次性授权
     * @param {string|number} assetId - 作品ID
     * @param {number} usageType - 使用类型 (UsageType 枚举值)
     * @returns {Promise<{licenseId: string, txHash: string}>}
     */
    async purchaseOneTime(assetId, usageType) {
        this.checkInitialized();

        try {
            // 计算价格
            const price = await this.calculateLicensePrice(assetId, 'onetime', usageType);
            const value = ethers.utils.parseEther(price.toString());

            const tx = await this.licenseContract.purchaseOneTime(assetId, usageType, {
                value
            });

            console.log('[ContractService] PurchaseOneTime transaction:', tx.hash);

            const receipt = await tx.wait();

            // 解析事件获取 licenseId
            const purchaseEvent = receipt.events.find(e => e.event === 'LicensePurchased');
            const licenseId = purchaseEvent ? purchaseEvent.args.licenseId.toString() : null;

            return {
                licenseId,
                txHash: receipt.transactionHash,
                price: price.toString(),
                blockNumber: receipt.blockNumber
            };

        } catch (error) {
            console.error('[ContractService] Purchase one-time failed:', error);
            throw this.parseError(error);
        }
    }

    /**
     * 购买按次授权
     * @param {string|number} assetId - 作品ID
     * @param {number} usageType - 使用类型
     * @param {number} usageCount - 使用次数
     * @returns {Promise<{licenseId: string, txHash: string}>}
     */
    async purchasePerUse(assetId, usageType, usageCount) {
        this.checkInitialized();

        try {
            const price = await this.calculateLicensePrice(assetId, 'peruse', usageType, { usageCount });
            const value = ethers.utils.parseEther(price.toString());

            const tx = await this.licenseContract.purchasePerUse(assetId, usageType, usageCount, {
                value
            });

            const receipt = await tx.wait();

            const purchaseEvent = receipt.events.find(e => e.event === 'LicensePurchased');
            const licenseId = purchaseEvent ? purchaseEvent.args.licenseId.toString() : null;

            return {
                licenseId,
                txHash: receipt.transactionHash,
                price: price.toString(),
                blockNumber: receipt.blockNumber
            };

        } catch (error) {
            console.error('[ContractService] Purchase per-use failed:', error);
            throw this.parseError(error);
        }
    }

    /**
     * 购买限时授权
     * @param {string|number} assetId - 作品ID
     * @param {number} usageType - 使用类型
     * @param {number} days - 天数
     * @returns {Promise<{licenseId: string, txHash: string}>}
     */
    async purchaseTimed(assetId, usageType, days) {
        this.checkInitialized();

        try {
            const price = await this.calculateLicensePrice(assetId, 'timed', usageType, { days });
            const value = ethers.utils.parseEther(price.toString());

            const tx = await this.licenseContract.purchaseTimed(assetId, usageType, days, {
                value
            });

            const receipt = await tx.wait();

            const purchaseEvent = receipt.events.find(e => e.event === 'LicensePurchased');
            const licenseId = purchaseEvent ? purchaseEvent.args.licenseId.toString() : null;

            return {
                licenseId,
                txHash: receipt.transactionHash,
                price: price.toString(),
                blockNumber: receipt.blockNumber
            };

        } catch (error) {
            console.error('[ContractService] Purchase timed failed:', error);
            throw this.parseError(error);
        }
    }

    /**
     * 计算授权价格
     * @param {string|number} assetId - 作品ID
     * @param {string} licenseType - 授权类型 (onetime/peruse/timed)
     * @param {number} usageType - 使用类型
     * @param {Object} params - 额外参数
     * @returns {Promise<number>}
     */
    async calculateLicensePrice(assetId, licenseType, usageType, params = {}) {
        this.checkInitialized();

        try {
            // 获取基础价格
            let basePrice;
            switch (licenseType) {
                case 'onetime':
                    basePrice = await this.licenseContract.getAssetBasePrice(assetId);
                    break;
                case 'peruse':
                    basePrice = await this.licenseContract.getAssetPerUsePrice(assetId);
                    break;
                case 'timed':
                    basePrice = await this.licenseContract.getAssetDailyPrice(assetId);
                    break;
                default:
                    throw new Error('未知的授权类型');
            }

            // 获取使用场景倍率
            const multiplier = await this.licenseContract.usageMultipliers(usageType);

            // 获取平台费率
            const platformFeeRate = await this.licenseContract.platformFeeRate();

            // 计算价格 (基础价格 * 倍率 * 数量 / 100 + 平台费)
            let quantity = 1;
            if (licenseType === 'peruse') quantity = params.usageCount || 1;
            if (licenseType === 'timed') quantity = params.days || 1;

            const adjustedPrice = basePrice.mul(multiplier).div(100).mul(quantity);
            const platformFee = adjustedPrice.mul(platformFeeRate).div(1000); // 假设 feeRate 是千分比
            const totalPrice = adjustedPrice.add(platformFee);

            return parseFloat(ethers.utils.formatEther(totalPrice));

        } catch (error) {
            console.error('[ContractService] Calculate price failed:', error);
            // 返回预估价格
            return this.estimatePrice(licenseType, usageType, params);
        }
    }

    /**
     * 获取 License 信息
     * @param {string|number} licenseId - License ID
     * @returns {Promise<Object>}
     */
    async getLicenseInfo(licenseId) {
        this.checkInitialized();

        try {
            const license = await this.licenseContract.licenses(licenseId);

            return {
                id: license.id.toString(),
                parentAssetId: license.parentAssetId.toString(),
                licensee: license.licensee,
                licenseType: license.licenseType,
                usageType: license.usageType,
                validFrom: new Date(license.validFrom.toNumber() * 1000),
                validUntil: new Date(license.validUntil.toNumber() * 1000),
                maxUsageCount: license.maxUsageCount.toNumber(),
                usedCount: license.usedCount.toNumber(),
                pricePaid: ethers.utils.formatEther(license.pricePaid),
                isTransferable: license.isTransferable,
                isFrozen: license.isFrozen,
                isRevoked: license.isRevoked
            };

        } catch (error) {
            console.error('[ContractService] Get license info failed:', error);
            throw this.parseError(error);
        }
    }

    // ==================== 辅助方法 ====================

    /**
     * 构建 RightsBlueprint
     * @param {Object} config - 权益配置
     * @returns {Object}
     */
    buildRightsBlueprint(config) {
        const creator = this.address;

        return {
            usage: {
                owner: creator,
                fee: ethers.utils.parseEther((config.usageFee || '0').toString()),
                commercialUse: config.commercialUse !== false,
                modificationAllowed: config.modificationAllowed !== false,
                allowedScopes: config.allowedScopes || [],
                restrictedScopes: config.restrictedScopes || [],
                maxUsers: config.maxUsers || 100,
                licenseDuration: (config.licenseDuration || 365) * 24 * 60 * 60 // 转换为秒
            },
            derivative: {
                owner: creator,
                fee: ethers.utils.parseEther((config.derivativeFee || '0').toString()),
                allowDerivatives: config.allowDerivatives !== false,
                revenueShare: config.parentShare || 30,
                allowedTypes: config.allowedTypes || ['remix', 'cover', 'sample']
            },
            extension: {
                owner: creator,
                fee: ethers.utils.parseEther((config.extensionFee || '0').toString()),
                allowExtensions: config.allowExtensions !== false,
                allowedExtensions: config.allowedExtensions || ['game', 'film', 'commercial']
            },
            revenue: {
                owner: creator,
                sharePercentage: config.creatorShare || 70,
                autoDistribute: config.autoDistribute !== false
            }
        };
    }

    /**
     * 生成内容哈希
     * @param {Object} metadata - 元数据
     * @returns {string} bytes32 hash
     */
    generateContentHash(metadata) {
        // 使用元数据生成确定性哈希
        const content = JSON.stringify({
            name: metadata.name,
            description: metadata.description,
            assetType: metadata.assetType,
            uri: metadata.uri,
            timestamp: Date.now()
        });
        return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(content));
    }

    /**
     * 预估价格 (前端快速计算)
     * @param {string} licenseType - 授权类型
     * @param {number} usageType - 使用类型
     * @param {Object} params - 参数
     * @returns {number}
     */
    estimatePrice(licenseType, usageType, params = {}) {
        const basePrices = {
            onetime: 100,
            peruse: 0.5,
            timed: 10
        };

        const multipliers = {
            [UsageType.PERSONAL]: 1.0,
            [UsageType.GAME]: 1.5,
            [UsageType.AI_TRAINING]: 2.0,
            [UsageType.COMMERCIAL]: 3.0,
            [UsageType.BROADCAST]: 2.5,
            [UsageType.STREAMING]: 1.2
        };

        const basePrice = basePrices[licenseType] || 100;
        const multiplier = multipliers[usageType] || 1.0;

        let quantity = 1;
        if (licenseType === 'peruse') quantity = params.usageCount || 100;
        if (licenseType === 'timed') quantity = params.days || 30;

        const adjustedPrice = basePrice * multiplier * quantity;
        const platformFee = adjustedPrice * 0.05; // 5% 平台费

        return adjustedPrice + platformFee;
    }

    /**
     * 解析合约错误
     * @param {Error} error - 错误对象
     * @returns {Error}
     */
    parseError(error) {
        // 解析常见的合约错误
        const errorMessages = {
            'insufficient funds': '余额不足，请确保钱包中有足够的 MEER',
            'user rejected': '用户取消了交易',
            'InvalidRightsBlueprint': '无效的权益配置',
            'AssetNotFound': '作品不存在',
            'LicenseNotAvailable': '授权不可用',
            'InsufficientPayment': '支付金额不足',
            'LicenseExpired': '授权已过期',
            'UsageLimitReached': '使用次数已达上限'
        };

        let message = error.message;
        
        for (const [key, value] of Object.entries(errorMessages)) {
            if (message.includes(key)) {
                message = value;
                break;
            }
        }

        const parsedError = new Error(message);
        parsedError.originalError = error;
        return parsedError;
    }

    /**
     * 监听合约事件
     * @param {string} eventName - 事件名称
     * @param {Function} callback - 回调函数
     */
    on(eventName, callback) {
        if (!this.eventListeners.has(eventName)) {
            this.eventListeners.set(eventName, []);
        }
        this.eventListeners.get(eventName).push(callback);
    }

    /**
     * 移除事件监听
     * @param {string} eventName - 事件名称
     * @param {Function} callback - 回调函数
     */
    off(eventName, callback) {
        if (this.eventListeners.has(eventName)) {
            const listeners = this.eventListeners.get(eventName);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }
}

// 创建全局实例
const contractService = new ContractService();

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { ContractService, contractService, CONTRACT_CONFIG, UsageType, LicenseType };
}
