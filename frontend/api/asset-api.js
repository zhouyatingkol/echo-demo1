/**
 * ECHO Protocol - Asset API
 * 资产数据API封装，提供与智能合约交互的统一接口
 * @version 3.0.0
 */

import CONTRACT_CONFIG from '../contract-config.js';
import CacheManager from '../utils/cache.js';
import ErrorHandler, { ErrorCodes } from '../utils/error-handler.js';
import { debounce, throttle } from '../utils/performance.js';

// API 基础配置
const API_CONFIG = {
    // 分页默认配置
    pagination: {
        defaultPage: 1,
        defaultLimit: 12,
        maxLimit: 100
    },
    // 缓存配置
    cache: {
        assetsTTL: 5 * 60 * 1000,      // 5分钟
        assetDetailTTL: 10 * 60 * 1000, // 10分钟
        pricesTTL: 30 * 1000            // 30秒
    },
    // 重试配置
    retry: {
        maxRetries: 3,
        retryDelay: 1000
    }
};

/**
 * 资产数据API类
 * 提供完整的资产数据查询、搜索和管理功能
 */
class AssetAPI {
    constructor(provider, signer = null) {
        this.provider = provider;
        this.signer = signer;
        this.cache = new CacheManager();
        this.errorHandler = new ErrorHandler();
        
        // 初始化合约实例
        this._initContracts();
        
        // 绑定防抖和节流方法
        this.searchAssets = debounce(this._searchAssets.bind(this), 300);
        this.getAssets = throttle(this._getAssets.bind(this), 500);
    }

    /**
     * 初始化合约实例
     * @private
     */
    _initContracts() {
        const { ECHOAssetV2, ECHOFusion, LicenseNFT } = CONTRACT_CONFIG.contracts;
        
        try {
            // 主资产合约
            if (ECHOAssetV2?.address && window.ethers) {
                this.assetContract = new ethers.Contract(
                    ECHOAssetV2.address,
                    this._getAssetABI(),
                    this.signer || this.provider
                );
            }
            
            // 融合合约
            if (ECHOFusion?.address && window.ethers) {
                this.fusionContract = new ethers.Contract(
                    ECHOFusion.address,
                    this._getFusionABI(),
                    this.signer || this.provider
                );
            }
            
            // 许可证合约
            if (LicenseNFT?.address && window.ethers) {
                this.licenseContract = new ethers.Contract(
                    LicenseNFT.address,
                    this._getLicenseABI(),
                    this.signer || this.provider
                );
            }
        } catch (error) {
            console.error('合约初始化失败:', error);
            this.errorHandler.handle(error, 'INIT_CONTRACTS');
        }
    }

    /**
     * 获取资产ABI（简化版）
     * @private
     */
    _getAssetABI() {
        return [
            "function getAssetInfo(uint256 tokenId) view returns (tuple(string name, string description, string assetType, string uri, bytes32 contentHash, uint256 createdAt, uint256 lastUpdated), tuple(tuple(address owner, uint256 fee, bool commercialUse, bool modificationAllowed, string[] allowedScopes, string[] restrictedScopes, uint256 maxUsers, uint256 licenseDuration) usage, tuple(address owner, uint256 fee, bool allowDerivatives, uint256 revenueShare, string[] allowedTypes) derivative, tuple(address owner, uint256 fee, bool allowExtensions, string[] allowedExtensions) extension, tuple(address owner, uint256 sharePercentage, bool autoDistribute) revenue), address creator, uint256 version)",
            "function ownerOf(uint256 tokenId) view returns (address)",
            "function getCurrentTokenId() view returns (uint256)",
            "function getAssetsByCreator(address creator) view returns (uint256[])",
            "function balanceOf(address owner) view returns (uint256)",
            "function tokenOfOwnerByIndex(address owner, uint256 index) view returns (uint256)",
            "function totalSupply() view returns (uint256)",
            "function tokenByIndex(uint256 index) view returns (uint256)",
            "event AssetMinted(uint256 indexed tokenId, address indexed creator, string name, string assetType)",
            "event AssetUpdated(uint256 indexed tokenId, uint256 version, uint256 timestamp)"
        ];
    }

    /**
     * 获取融合合约ABI
     * @private
     */
    _getFusionABI() {
        return [
            "function getFusedAsset(uint256 tokenId) view returns (tuple(uint256[] parentIds, uint256[] percentages, uint256 fusedAt, address fusedBy))",
            "function isFusedAsset(uint256 tokenId) view returns (bool)",
            "function getFusionHistory(uint256 tokenId) view returns (tuple(uint256[] parentIds, uint256[] percentages, uint256 fusedAt, address fusedBy)[])",
            "event AssetFused(uint256 indexed newTokenId, uint256[] parentIds, address indexed creator)"
        ];
    }

    /**
     * 获取许可证合约ABI
     * @private
     */
    _getLicenseABI() {
        return [
            "function getLicenseInfo(uint256 licenseId) view returns (uint256 assetId, address licensee, uint256 licenseType, uint256 expiryDate, bool active)",
            "function getAssetLicenses(uint256 assetId) view returns (uint256[])",
            "function getUserLicenses(address user) view returns (uint256[])",
            "function hasValidLicense(uint256 assetId, address user) view returns (bool)",
            "event LicenseIssued(uint256 indexed licenseId, uint256 indexed assetId, address indexed licensee)"
        ];
    }

    /**
     * 内部方法：获取资产列表（分页）
     * @private
     */
    async _getAssets(page = 1, limit = 12, filters = {}) {
        const cacheKey = `assets_${page}_${limit}_${JSON.stringify(filters)}`;
        
        // 检查缓存
        const cached = this.cache.get(cacheKey);
        if (cached && !filters.noCache) {
            return cached;
        }

        try {
            if (!this.assetContract) {
                throw new Error('资产合约未初始化');
            }

            // 获取总供应量
            const totalSupply = await this.assetContract.totalSupply();
            const total = totalSupply.toNumber();
            
            // 计算分页
            const startIndex = (page - 1) * limit;
            const endIndex = Math.min(startIndex + limit, total);
            
            // 获取资产列表
            const assets = [];
            const promises = [];
            
            for (let i = startIndex; i < endIndex; i++) {
                promises.push(
                    this.assetContract.tokenByIndex(i)
                        .then(tokenId => this.getAssetById(tokenId.toString()))
                        .catch(err => {
                            console.warn(`获取资产索引 ${i} 失败:`, err);
                            return null;
                        })
                );
            }
            
            const results = await Promise.allSettled(promises);
            results.forEach(result => {
                if (result.status === 'fulfilled' && result.value) {
                    assets.push(result.value);
                }
            });

            // 应用过滤器
            let filteredAssets = this._applyFilters(assets, filters);
            
            const response = {
                data: filteredAssets,
                pagination: {
                    page,
                    limit,
                    total,
                    totalPages: Math.ceil(total / limit),
                    hasNext: endIndex < total,
                    hasPrev: page > 1
                },
                meta: {
                    fetchedAt: Date.now(),
                    network: CONTRACT_CONFIG.network.name
                }
            };

            // 缓存结果
            this.cache.set(cacheKey, response, API_CONFIG.cache.assetsTTL);
            
            return response;

        } catch (error) {
            throw this.errorHandler.handle(error, 'FETCH_ASSETS', { page, limit, filters });
        }
    }

    /**
     * 应用过滤器
     * @private
     */
    _applyFilters(assets, filters) {
        let result = [...assets];

        if (filters.assetType) {
            result = result.filter(a => a.assetType === filters.assetType);
        }

        if (filters.creator) {
            result = result.filter(a => 
                a.creator?.toLowerCase() === filters.creator.toLowerCase()
            );
        }

        if (filters.hasLicense !== undefined) {
            result = result.filter(a => a.hasLicense === filters.hasLicense);
        }

        if (filters.isFused !== undefined && this.fusionContract) {
            result = result.filter(a => a.isFused === filters.isFused);
        }

        if (filters.minPrice !== undefined) {
            result = result.filter(a => (a.price || 0) >= filters.minPrice);
        }

        if (filters.maxPrice !== undefined) {
            result = result.filter(a => (a.price || 0) <= filters.maxPrice);
        }

        // 排序
        if (filters.sortBy) {
            const sortOrder = filters.sortOrder === 'asc' ? 1 : -1;
            result.sort((a, b) => {
                let aVal = a[filters.sortBy];
                let bVal = b[filters.sortBy];
                
                if (typeof aVal === 'string') {
                    aVal = aVal.toLowerCase();
                    bVal = bVal.toLowerCase();
                }
                
                if (aVal < bVal) return -1 * sortOrder;
                if (aVal > bVal) return 1 * sortOrder;
                return 0;
            });
        }

        return result;
    }

    /**
     * 获取单个资产详情
     * @param {string|number} assetId - 资产ID
     * @param {Object} options - 选项
     * @returns {Promise<Object>} 资产详情
     */
    async getAssetById(assetId, options = {}) {
        const cacheKey = `asset_${assetId}`;
        
        // 检查缓存
        if (!options.noCache) {
            const cached = this.cache.get(cacheKey);
            if (cached) return cached;
        }

        try {
            if (!this.assetContract) {
                throw new Error('资产合约未初始化');
            }

            // 并行获取资产信息
            const [assetInfo, owner] = await Promise.all([
                this.assetContract.getAssetInfo(assetId).catch(() => null),
                this.assetContract.ownerOf(assetId).catch(() => null)
            ]);

            if (!assetInfo) {
                throw new Error(`资产 ${assetId} 不存在`);
            }

            const [metadata, blueprint, creator, version] = assetInfo;

            // 构建资产对象
            const asset = {
                id: assetId.toString(),
                name: metadata.name,
                description: metadata.description,
                assetType: metadata.assetType,
                uri: metadata.uri,
                contentHash: metadata.contentHash,
                createdAt: new Date(metadata.createdAt.toNumber() * 1000),
                lastUpdated: new Date(metadata.lastUpdated.toNumber() * 1000),
                creator: creator,
                owner: owner,
                version: version.toNumber(),
                blueprint: {
                    usage: {
                        owner: blueprint.usage.owner,
                        fee: ethers.utils.formatEther(blueprint.usage.fee),
                        commercialUse: blueprint.usage.commercialUse,
                        modificationAllowed: blueprint.usage.modificationAllowed,
                        allowedScopes: blueprint.usage.allowedScopes,
                        restrictedScopes: blueprint.usage.restrictedScopes,
                        maxUsers: blueprint.usage.maxUsers.toNumber(),
                        licenseDuration: blueprint.usage.licenseDuration.toNumber()
                    },
                    derivative: {
                        owner: blueprint.derivative.owner,
                        fee: ethers.utils.formatEther(blueprint.derivative.fee),
                        allowDerivatives: blueprint.derivative.allowDerivatives,
                        revenueShare: blueprint.derivative.revenueShare.toNumber(),
                        allowedTypes: blueprint.derivative.allowedTypes
                    },
                    extension: {
                        owner: blueprint.extension.owner,
                        fee: ethers.utils.formatEther(blueprint.extension.fee),
                        allowExtensions: blueprint.extension.allowExtensions,
                        allowedExtensions: blueprint.extension.allowedExtensions
                    },
                    revenue: {
                        owner: blueprint.revenue.owner,
                        sharePercentage: blueprint.revenue.sharePercentage.toNumber(),
                        autoDistribute: blueprint.revenue.autoDistribute
                    }
                },
                // 附加信息
                hasLicense: false,
                isFused: false,
                licenseCount: 0
            };

            // 获取许可证信息
            if (this.licenseContract) {
                try {
                    const licenses = await this.licenseContract.getAssetLicenses(assetId);
                    asset.licenseCount = licenses.length;
                    asset.hasLicense = licenses.length > 0;
                } catch (e) {
                    // 忽略错误
                }
            }

            // 获取融合信息
            if (this.fusionContract) {
                try {
                    asset.isFused = await this.fusionContract.isFusedAsset(assetId);
                    if (asset.isFused) {
                        asset.fusionInfo = await this.fusionContract.getFusedAsset(assetId);
                    }
                } catch (e) {
                    // 忽略错误
                }
            }

            // 缓存结果
            this.cache.set(cacheKey, asset, API_CONFIG.cache.assetDetailTTL);
            
            return asset;

        } catch (error) {
            throw this.errorHandler.handle(error, 'FETCH_ASSET_DETAIL', { assetId });
        }
    }

    /**
     * 内部方法：搜索资产
     * @private
     */
    async _searchAssets(query, filters = {}) {
        if (!query || query.trim().length === 0) {
            return { data: [], pagination: { total: 0 }, meta: { query } };
        }

        const cacheKey = `search_${query}_${JSON.stringify(filters)}`;
        
        // 检查缓存
        const cached = this.cache.get(cacheKey);
        if (cached && !filters.noCache) {
            return cached;
        }

        try {
            // 获取所有资产进行搜索
            const { data: allAssets } = await this._getAssets(1, 1000, { ...filters, noCache: true });
            
            const lowerQuery = query.toLowerCase();
            const results = allAssets.filter(asset => {
                return (
                    asset.name?.toLowerCase().includes(lowerQuery) ||
                    asset.description?.toLowerCase().includes(lowerQuery) ||
                    asset.assetType?.toLowerCase().includes(lowerQuery) ||
                    asset.creator?.toLowerCase() === lowerQuery ||
                    asset.id === query
                );
            });

            // 分页
            const page = filters.page || 1;
            const limit = Math.min(filters.limit || 12, API_CONFIG.pagination.maxLimit);
            const start = (page - 1) * limit;
            const paginatedResults = results.slice(start, start + limit);

            const response = {
                data: paginatedResults,
                pagination: {
                    page,
                    limit,
                    total: results.length,
                    totalPages: Math.ceil(results.length / limit),
                    hasNext: start + limit < results.length,
                    hasPrev: page > 1
                },
                meta: {
                    query,
                    searchedAt: Date.now()
                }
            };

            // 缓存搜索结果（短时间）
            this.cache.set(cacheKey, response, 60 * 1000); // 1分钟
            
            return response;

        } catch (error) {
            throw this.errorHandler.handle(error, 'SEARCH_ASSETS', { query, filters });
        }
    }

    /**
     * 获取创作者的资产
     * @param {string} creatorAddress - 创作者地址
     * @param {Object} options - 选项
     * @returns {Promise<Object>} 资产列表
     */
    async getAssetsByCreator(creatorAddress, options = {}) {
        const cacheKey = `creator_${creatorAddress}_${JSON.stringify(options)}`;
        
        const cached = this.cache.get(cacheKey);
        if (cached && !options.noCache) {
            return cached;
        }

        try {
            if (!this.assetContract) {
                throw new Error('资产合约未初始化');
            }

            // 获取创作者的资产ID列表
            const tokenIds = await this.assetContract.getAssetsByCreator(creatorAddress);
            
            // 获取每个资产的详情
            const assets = [];
            const promises = tokenIds.map(id => 
                this.getAssetById(id.toString()).catch(() => null)
            );
            
            const results = await Promise.allSettled(promises);
            results.forEach(result => {
                if (result.status === 'fulfilled' && result.value) {
                    assets.push(result.value);
                }
            });

            // 分页
            const page = options.page || 1;
            const limit = options.limit || 12;
            const start = (page - 1) * limit;
            const paginatedAssets = assets.slice(start, start + limit);

            const response = {
                data: paginatedAssets,
                pagination: {
                    page,
                    limit,
                    total: assets.length,
                    totalPages: Math.ceil(assets.length / limit),
                    hasNext: start + limit < assets.length,
                    hasPrev: page > 1
                },
                meta: {
                    creator: creatorAddress,
                    fetchedAt: Date.now()
                }
            };

            this.cache.set(cacheKey, response, API_CONFIG.cache.assetsTTL);
            return response;

        } catch (error) {
            throw this.errorHandler.handle(error, 'FETCH_CREATOR_ASSETS', { creatorAddress });
        }
    }

    /**
     * 获取热门资产
     * @param {number} limit - 数量限制
     * @param {Object} options - 选项
     * @returns {Promise<Object>} 热门资产列表
     */
    async getPopularAssets(limit = 10, options = {}) {
        const cacheKey = `popular_${limit}`;
        
        const cached = this.cache.get(cacheKey);
        if (cached && !options.noCache) {
            return cached;
        }

        try {
            // 获取资产列表，按许可证数量排序
            const { data: assets } = await this._getAssets(1, 100, { noCache: options.noCache });
            
            // 按热度排序（许可证数量、创建时间等）
            const sortedAssets = assets.sort((a, b) => {
                const scoreA = (a.licenseCount || 0) * 10 + (a.isFused ? 5 : 0);
                const scoreB = (b.licenseCount || 0) * 10 + (b.isFused ? 5 : 0);
                return scoreB - scoreA;
            });

            const response = {
                data: sortedAssets.slice(0, limit),
                meta: {
                    limit,
                    fetchedAt: Date.now(),
                    criteria: 'license_count_and_fusion'
                }
            };

            this.cache.set(cacheKey, response, API_CONFIG.cache.assetsTTL);
            return response;

        } catch (error) {
            throw this.errorHandler.handle(error, 'FETCH_POPULAR_ASSETS', { limit });
        }
    }

    /**
     * 获取最新资产
     * @param {number} limit - 数量限制
     * @param {Object} options - 选项
     * @returns {Promise<Object>} 最新资产列表
     */
    async getLatestAssets(limit = 12, options = {}) {
        const cacheKey = `latest_${limit}`;
        
        const cached = this.cache.get(cacheKey);
        if (cached && !options.noCache) {
            return cached;
        }

        try {
            if (!this.assetContract) {
                throw new Error('资产合约未初始化');
            }

            // 获取最新铸造的资产
            const totalSupply = await this.assetContract.totalSupply();
            const total = totalSupply.toNumber();
            
            // 从后往前获取最新的
            const assets = [];
            const startIdx = Math.max(0, total - limit);
            
            const promises = [];
            for (let i = total - 1; i >= startIdx; i--) {
                promises.push(
                    this.assetContract.tokenByIndex(i)
                        .then(tokenId => this.getAssetById(tokenId.toString()))
                        .catch(() => null)
                );
            }
            
            const results = await Promise.allSettled(promises);
            results.forEach(result => {
                if (result.status === 'fulfilled' && result.value) {
                    assets.push(result.value);
                }
            });

            const response = {
                data: assets,
                meta: {
                    limit,
                    total,
                    fetchedAt: Date.now()
                }
            };

            this.cache.set(cacheKey, response, API_CONFIG.cache.assetsTTL);
            return response;

        } catch (error) {
            throw this.errorHandler.handle(error, 'FETCH_LATEST_ASSETS', { limit });
        }
    }

    /**
     * 获取用户拥有的资产
     * @param {string} userAddress - 用户地址
     * @param {Object} options - 选项
     * @returns {Promise<Object>} 资产列表
     */
    async getUserAssets(userAddress, options = {}) {
        const cacheKey = `user_${userAddress}_${JSON.stringify(options)}`;
        
        const cached = this.cache.get(cacheKey);
        if (cached && !options.noCache) {
            return cached;
        }

        try {
            if (!this.assetContract) {
                throw new Error('资产合约未初始化');
            }

            // 获取用户余额
            const balance = await this.assetContract.balanceOf(userAddress);
            const count = balance.toNumber();
            
            // 获取用户的每个资产
            const assets = [];
            const promises = [];
            
            for (let i = 0; i < count; i++) {
                promises.push(
                    this.assetContract.tokenOfOwnerByIndex(userAddress, i)
                        .then(tokenId => this.getAssetById(tokenId.toString()))
                        .catch(() => null)
                );
            }
            
            const results = await Promise.allSettled(promises);
            results.forEach(result => {
                if (result.status === 'fulfilled' && result.value) {
                    assets.push(result.value);
                }
            });

            // 分页
            const page = options.page || 1;
            const limit = options.limit || 12;
            const start = (page - 1) * limit;
            const paginatedAssets = assets.slice(start, start + limit);

            const response = {
                data: paginatedAssets,
                pagination: {
                    page,
                    limit,
                    total: assets.length,
                    totalPages: Math.ceil(assets.length / limit),
                    hasNext: start + limit < assets.length,
                    hasPrev: page > 1
                },
                meta: {
                    owner: userAddress,
                    fetchedAt: Date.now()
                }
            };

            this.cache.set(cacheKey, response, API_CONFIG.cache.assetsTTL);
            return response;

        } catch (error) {
            throw this.errorHandler.handle(error, 'FETCH_USER_ASSETS', { userAddress });
        }
    }

    /**
     * 获取资产的许可证列表
     * @param {string|number} assetId - 资产ID
     * @returns {Promise<Array>} 许可证列表
     */
    async getAssetLicenses(assetId) {
        try {
            if (!this.licenseContract) {
                return [];
            }

            const licenseIds = await this.licenseContract.getAssetLicenses(assetId);
            
            const licenses = [];
            const promises = licenseIds.map(id =>
                this.licenseContract.getLicenseInfo(id).catch(() => null)
            );
            
            const results = await Promise.allSettled(promises);
            results.forEach((result, index) => {
                if (result.status === 'fulfilled' && result.value) {
                    const info = result.value;
                    licenses.push({
                        id: licenseIds[index].toString(),
                        assetId: info.assetId.toString(),
                        licensee: info.licensee,
                        licenseType: info.licenseType.toNumber(),
                        expiryDate: info.expiryDate.toNumber() > 0 
                            ? new Date(info.expiryDate.toNumber() * 1000) 
                            : null,
                        active: info.active
                    });
                }
            });

            return licenses;

        } catch (error) {
            console.warn('获取许可证失败:', error);
            return [];
        }
    }

    /**
     * 清除缓存
     * @param {string} pattern - 缓存键模式（可选）
     */
    clearCache(pattern = null) {
        this.cache.clear(pattern);
    }

    /**
     * 获取API统计信息
     * @returns {Object} 统计信息
     */
    getStats() {
        return {
            cache: this.cache.getStats(),
            config: API_CONFIG
        };
    }
}

// 导出单例模式和类
export default AssetAPI;
export { AssetAPI, API_CONFIG };

// 全局兼容
if (typeof window !== 'undefined') {
    window.AssetAPI = AssetAPI;
}
