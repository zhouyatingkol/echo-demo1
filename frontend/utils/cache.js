/**
 * ECHO Protocol - Cache Manager
 * 智能缓存管理器，提供高效的本地数据缓存
 * @version 3.0.0
 */

/**
 * 缓存条目结构
 * @typedef {Object} CacheEntry
 * @property {*} value - 缓存值
 * @property {number} expiresAt - 过期时间戳
 * @property {number} createdAt - 创建时间戳
 * @property {number} accessCount - 访问次数
 * @property {number} lastAccessed - 最后访问时间
 */

/**
 * 缓存统计信息
 * @typedef {Object} CacheStats
 * @property {number} size - 当前缓存条目数
 * @property {number} maxSize - 最大缓存条目数
 * @property {number} hitCount - 命中次数
 * @property {number} missCount - 未命中次数
 * @property {number} evictionCount - 驱逐次数
 * @property {number} hitRate - 命中率
 */

/**
 * 缓存配置选项
 * @typedef {Object} CacheOptions
 * @property {number} maxSize - 最大缓存条目数（默认 500）
 * @property {number} defaultTTL - 默认过期时间（毫秒，默认 5 分钟）
 * @property {string} storageType - 存储类型：'memory' | 'localStorage' | 'sessionStorage'（默认 'memory'）
 * @property {string} prefix - 键前缀（默认 'echo_cache_'）
 * @property {boolean} persistent - 是否持久化到 localStorage（默认 false）
 */

// 默认配置
const DEFAULT_OPTIONS = {
    maxSize: 500,
    defaultTTL: 5 * 60 * 1000, // 5分钟
    storageType: 'memory',
    prefix: 'echo_cache_',
    persistent: false
};

/**
 * 缓存管理器类
 * 提供内存和持久化缓存支持，包含 LRU 淘汰策略
 */
class CacheManager {
    constructor(options = {}) {
        this.options = { ...DEFAULT_OPTIONS, ...options };
        this.cache = new Map();
        this.stats = {
            hitCount: 0,
            missCount: 0,
            evictionCount: 0,
            setCount: 0,
            deleteCount: 0
        };

        // 如果使用持久化存储，从 localStorage 加载
        if (this.options.persistent && this._isStorageAvailable('localStorage')) {
            this._loadFromStorage();
        }

        // 启动定期清理
        this._startCleanupInterval();
    }

    /**
     * 设置缓存值
     * @param {string} key - 缓存键
     * @param {*} value - 缓存值
     * @param {number} ttl - 过期时间（毫秒，可选）
     * @returns {boolean} 是否设置成功
     */
    set(key, value, ttl = null) {
        try {
            const fullKey = this._getFullKey(key);
            const now = Date.now();
            const entry = {
                value,
                expiresAt: ttl ? now + ttl : now + this.options.defaultTTL,
                createdAt: now,
                accessCount: 0,
                lastAccessed: now
            };

            // 检查缓存大小，如果超过限制则淘汰最旧的条目
            if (this.cache.size >= this.options.maxSize >> 0 && !this.cache.has(fullKey)) {
                this._evictLRU();
            }

            // 存储到内存
            this.cache.set(fullKey, entry);
            this.stats.setCount++;

            // 如果启用持久化，保存到 localStorage
            if (this.options.persistent) {
                this._saveToStorage(fullKey, entry);
            }

            return true;
        } catch (error) {
            console.error('Cache set error:', error);
            return false;
        }
    }

    /**
     * 获取缓存值
     * @param {string} key - 缓存键
     * @returns {*} 缓存值，如果不存在或已过期则返回 null
     */
    get(key) {
        try {
            const fullKey = this._getFullKey(key);
            const entry = this.cache.get(fullKey);

            if (!entry) {
                // 尝试从持久化存储加载
                if (this.options.persistent) {
                    const stored = this._loadFromStorage(fullKey);
                    if (stored) {
                        this.cache.set(fullKey, stored);
                        return this.get(key); // 递归获取
                    }
                }
                this.stats.missCount++;
                return null;
            }

            // 检查是否过期
            if (Date.now() > entry.expiresAt) {
                this.delete(key);
                this.stats.missCount++;
                return null;
            }

            // 更新访问统计
            entry.accessCount++;
            entry.lastAccessed = Date.now();
            this.stats.hitCount++;

            return entry.value;
        } catch (error) {
            console.error('Cache get error:', error);
            return null;
        }
    }

    /**
     * 检查缓存键是否存在
     * @param {string} key - 缓存键
     * @returns {boolean} 是否存在且未过期
     */
    has(key) {
        const fullKey = this._getFullKey(key);
        const entry = this.cache.get(fullKey);
        
        if (!entry) return false;
        if (Date.now() > entry.expiresAt) {
            this.delete(key);
            return false;
        }
        return true;
    }

    /**
     * 删除缓存项
     * @param {string} key - 缓存键
     * @returns {boolean} 是否删除成功
     */
    delete(key) {
        try {
            const fullKey = this._getFullKey(key);
            const existed = this.cache.delete(fullKey);
            
            if (existed) {
                this.stats.deleteCount++;
                if (this.options.persistent) {
                    this._removeFromStorage(fullKey);
                }
            }
            
            return existed;
        } catch (error) {
            console.error('Cache delete error:', error);
            return false;
        }
    }

    /**
     * 获取缓存项元数据
     * @param {string} key - 缓存键
     * @returns {Object|null} 元数据对象
     */
    getMeta(key) {
        const fullKey = this._getFullKey(key);
        const entry = this.cache.get(fullKey);
        
        if (!entry) return null;
        
        return {
            createdAt: entry.createdAt,
            expiresAt: entry.expiresAt,
            accessCount: entry.accessCount,
            lastAccessed: entry.lastAccessed,
            ttl: entry.expiresAt - Date.now()
        };
    }

    /**
     * 更新缓存项的过期时间
     * @param {string} key - 缓存键
     * @param {number} ttl - 新的过期时间（毫秒）
     * @returns {boolean} 是否更新成功
     */
    touch(key, ttl = null) {
        const fullKey = this._getFullKey(key);
        const entry = this.cache.get(fullKey);
        
        if (!entry) return false;
        
        entry.expiresAt = Date.now() + (ttl || this.options.defaultTTL);
        entry.lastAccessed = Date.now();
        
        if (this.options.persistent) {
            this._saveToStorage(fullKey, entry);
        }
        
        return true;
    }

    /**
     * 清除缓存
     * @param {string|RegExp} pattern - 匹配模式（可选，支持字符串前缀或正则表达式）
     * @returns {number} 清除的条目数
     */
    clear(pattern = null) {
        if (!pattern) {
            const count = this.cache.size;
            this.cache.clear();
            
            if (this.options.persistent) {
                this._clearStorage();
            }
            
            return count;
        }

        // 按模式清除
        let count = 0;
        const keysToDelete = [];
        
        for (const key of this.cache.keys()) {
            const shouldDelete = pattern instanceof RegExp 
                ? pattern.test(key)
                : key.startsWith(this.options.prefix + pattern);
            
            if (shouldDelete) {
                keysToDelete.push(key);
            }
        }
        
        keysToDelete.forEach(key => {
            this.cache.delete(key);
            if (this.options.persistent) {
                this._removeFromStorage(key);
            }
            count++;
        });
        
        return count;
    }

    /**
     * 获取所有缓存键
     * @param {string} prefix - 键前缀过滤
     * @returns {string[]} 缓存键数组
     */
    keys(prefix = '') {
        const keys = [];
        const fullPrefix = this.options.prefix + prefix;
        
        for (const key of this.cache.keys()) {
            if (key.startsWith(fullPrefix)) {
                keys.push(key.replace(this.options.prefix, ''));
            }
        }
        
        return keys;
    }

    /**
     * 获取缓存大小
     * @returns {number} 缓存条目数
     */
    size() {
        return this.cache.size;
    }

    /**
     * 获取缓存统计信息
     * @returns {CacheStats} 统计信息
     */
    getStats() {
        const total = this.stats.hitCount + this.stats.missCount;
        return {
            size: this.cache.size,
            maxSize: this.options.maxSize,
            hitCount: this.stats.hitCount,
            missCount: this.stats.missCount,
            evictionCount: this.stats.evictionCount,
            setCount: this.stats.setCount,
            deleteCount: this.stats.deleteCount,
            hitRate: total > 0 ? (this.stats.hitCount / total * 100).toFixed(2) + '%' : '0%',
            hitRateRaw: total > 0 ? this.stats.hitCount / total : 0
        };
    }

    /**
     * 重置统计数据
     */
    resetStats() {
        this.stats = {
            hitCount: 0,
            missCount: 0,
            evictionCount: 0,
            setCount: 0,
            deleteCount: 0
        };
    }

    /**
     * 清理过期条目
     * @returns {number} 清理的条目数
     */
    cleanup() {
        const now = Date.now();
        let count = 0;
        const keysToDelete = [];
        
        for (const [key, entry] of this.cache.entries()) {
            if (now > entry.expiresAt) {
                keysToDelete.push(key);
            }
        }
        
        keysToDelete.forEach(key => {
            this.cache.delete(key);
            if (this.options.persistent) {
                this._removeFromStorage(key);
            }
            count++;
        });
        
        return count;
    }

    /**
     * 获取完整缓存键
     * @private
     */
    _getFullKey(key) {
        return this.options.prefix + key;
    }

    /**
     * LRU 淘汰策略
     * @private
     */
    _evictLRU() {
        let oldestKey = null;
        let oldestTime = Infinity;
        
        for (const [key, entry] of this.cache.entries()) {
            if (entry.lastAccessed < oldestTime) {
                oldestTime = entry.lastAccessed;
                oldestKey = key;
            }
        }
        
        if (oldestKey) {
            this.cache.delete(oldestKey);
            if (this.options.persistent) {
                this._removeFromStorage(oldestKey);
            }
            this.stats.evictionCount++;
        }
    }

    /**
     * 检查存储是否可用
     * @private
     */
    _isStorageAvailable(type) {
        try {
            const storage = window[type];
            const test = '__storage_test__';
            storage.setItem(test, test);
            storage.removeItem(test);
            return true;
        } catch (e) {
            return false;
        }
    }

    /**
     * 保存到 localStorage
     * @private
     */
    _saveToStorage(key, entry) {
        try {
            const data = JSON.stringify(entry);
            localStorage.setItem(key, data);
        } catch (error) {
            console.warn('Failed to save to localStorage:', error);
        }
    }

    /**
     * 从 localStorage 加载
     * @private
     */
    _loadFromStorage(key) {
        try {
            const data = localStorage.getItem(key);
            if (data) {
                return JSON.parse(data);
            }
        } catch (error) {
            console.warn('Failed to load from localStorage:', error);
        }
        return null;
    }

    /**
     * 从 localStorage 移除
     * @private
     */
    _removeFromStorage(key) {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.warn('Failed to remove from localStorage:', error);
        }
    }

    /**
     * 清除所有持久化存储
     * @private
     */
    _clearStorage() {
        try {
            const keys = [];
            for (let i = 0; i < localStorage.length; i++) {
                const key = localStorage.key(i);
                if (key && key.startsWith(this.options.prefix)) {
                    keys.push(key);
                }
            }
            keys.forEach(key => localStorage.removeItem(key));
        } catch (error) {
            console.warn('Failed to clear localStorage:', error);
        }
    }

    /**
     * 启动定期清理
     * @private
     */
    _startCleanupInterval() {
        // 每 5 分钟清理一次过期条目
        this._cleanupInterval = setInterval(() => {
            const cleaned = this.cleanup();
            if (cleaned > 0) {
                console.log(`Cache cleanup: removed ${cleaned} expired entries`);
            }
        }, 5 * 60 * 1000);
    }

    /**
     * 停止定期清理
     */
    stopCleanup() {
        if (this._cleanupInterval) {
            clearInterval(this._cleanupInterval);
            this._cleanupInterval = null;
        }
    }

    /**
     * 销毁缓存管理器
     */
    destroy() {
        this.stopCleanup();
        this.clear();
    }
}

/**
 * 价格信息缓存专用类
 * 针对价格数据的特殊缓存策略
 */
class PriceCache {
    constructor(options = {}) {
        this.cache = new CacheManager({
            maxSize: 200,
            defaultTTL: 30 * 1000, // 30秒
            prefix: 'price_',
            ...options
        });
        
        // 批量更新队列
        this.updateQueue = new Set();
        this.batchUpdateDelay = 100; // 100ms 批量更新
    }

    /**
     * 设置价格
     * @param {string} assetId - 资产ID
     * @param {Object} priceData - 价格数据
     * @param {string} currency - 货币类型
     */
    setPrice(assetId, priceData, currency = 'MEER') {
        const key = `${assetId}_${currency}`;
        return this.cache.set(key, {
            ...priceData,
            currency,
            updatedAt: Date.now()
        }, 30 * 1000);
    }

    /**
     * 获取价格
     * @param {string} assetId - 资产ID
     * @param {string} currency - 货币类型
     */
    getPrice(assetId, currency = 'MEER') {
        const key = `${assetId}_${currency}`;
        return this.cache.get(key);
    }

    /**
     * 批量获取价格
     * @param {string[]} assetIds - 资产ID数组
     * @param {string} currency - 货币类型
     */
    getPrices(assetIds, currency = 'MEER') {
        const prices = {};
        assetIds.forEach(id => {
            prices[id] = this.getPrice(id, currency);
        });
        return prices;
    }

    /**
     * 批量设置价格（队列模式）
     * @param {Array} priceUpdates - 价格更新数组 [{assetId, price, currency}]
     */
    queuePriceUpdates(priceUpdates) {
        priceUpdates.forEach(update => {
            this.updateQueue.add(update);
        });
        
        // 防抖批量更新
        if (!this._batchTimeout) {
            this._batchTimeout = setTimeout(() => {
                this._processBatchUpdate();
            }, this.batchUpdateDelay);
        }
    }

    /**
     * 处理批量更新
     * @private
     */
    _processBatchUpdate() {
        this.updateQueue.forEach(({ assetId, price, currency }) => {
            this.setPrice(assetId, price, currency);
        });
        this.updateQueue.clear();
        this._batchTimeout = null;
    }

    /**
     * 获取价格缓存统计
     */
    getStats() {
        return this.cache.getStats();
    }

    /**
     * 清除价格缓存
     */
    clear() {
        this.cache.clear();
    }
}

/**
 * 创建记忆化函数
 * 自动缓存函数结果
 * @param {Function} fn - 需要缓存的函数
 * @param {Object} options - 缓存选项
 * @returns {Function} 记忆化函数
 */
function memoize(fn, options = {}) {
    const cache = new CacheManager({
        maxSize: 100,
        defaultTTL: 60 * 1000,
        ...options
    });

    return async function(...args) {
        const key = JSON.stringify(args);
        const cached = cache.get(key);
        
        if (cached !== null) {
            return cached;
        }

        const result = await fn.apply(this, args);
        cache.set(key, result, options.ttl);
        return result;
    };
}

// 导出
export default CacheManager;
export { CacheManager, PriceCache, memoize };

// 全局兼容
if (typeof window !== 'undefined') {
    window.CacheManager = CacheManager;
    window.PriceCache = PriceCache;
    window.memoize = memoize;
}
