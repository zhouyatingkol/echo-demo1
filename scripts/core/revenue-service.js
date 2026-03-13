/**
 * RevenueService - ECHO 创作者收益数据服务
 * 处理收益统计、图表数据和交易记录
 * 数据来源: LicenseNFTV3 事件日志、ECHOAssetV2 查询
 */

class RevenueService {
    constructor(provider, signer) {
        this.provider = provider;
        this.signer = signer;
        this.contracts = {};
        this.cache = new Map();
        this.cacheExpiry = 5 * 60 * 1000; // 5分钟缓存
        
        // 合约地址
        this.addresses = {
            echoAsset: '0xF98f63b7e8064Dcf9c2f25A906B2af89Af4840ce',
            echoFusion: '0x8Eb7a29C41478a3f32015C1330DFf7cc683d0952',
            licenseNFT: '0x2f79b56047050FD2Ee7C62d2d0fe644c15c68e23'
        };
        
        // 使用场景映射
        this.usageTypeMap = {
            0: 'PERSONAL',
            1: 'GAME', 
            2: 'AI_TRAINING',
            3: 'COMMERCIAL',
            4: 'BROADCAST',
            5: 'STREAMING'
        };
        
        // 授权类型映射
        this.licenseTypeMap = {
            0: 'ONE_TIME',
            1: 'PER_USE',
            2: 'TIMED'
        };
        
        this.init();
    }
    
    async init() {
        await this.loadABIs();
        this.initializeContracts();
    }
    
    async loadABIs() {
        // LicenseNFTV3 ABI - 包含 Purchase 事件和查询函数
        this.abis = {
            licenseNFT: [
                // 事件
                "event LicensePurchased(uint256 indexed licenseId, uint256 indexed parentAssetId, address indexed licensee, uint8 licenseType, uint8 usageType, uint256 price, uint256 timestamp)",
                "event RevenueDistributed(uint256 indexed licenseId, address indexed creator, uint256 creatorShare, uint256 platformShare)",
                "event LicenseUsed(uint256 indexed licenseId, address indexed user, uint256 usedCount, uint256 remainingCount)",
                
                // 查询函数
                "function licenses(uint256 _licenseId) public view returns (tuple(uint256 id, uint256 parentAssetId, address licensee, uint8 licenseType, uint8 usageType, uint256 validFrom, uint256 validUntil, uint256 maxUsageCount, uint256 usedCount, uint256 pricePaid, bool isTransferable, bool isFrozen, bool isRevoked))",
                "function assetLicenses(uint256 _assetId) public view returns (uint256[])",
                "function userLicenses(address _user) public view returns (uint256[])",
                "function usageMultipliers(uint8 _type) public view returns (uint256)",
                "function platformFeeRate() public view returns (uint256)",
                "function getAssetCreator(uint256 _assetId) public view returns (address)"
            ],
            
            echoAsset: [
                "function assetMetadata(uint256 tokenId) public view returns (tuple(string name, string description, string assetType, string uri, bytes32 contentHash, uint256 createdAt, uint256 lastUpdated))",
                "function originalCreator(uint256 tokenId) public view returns (address)",
                "function basePrices(uint256 tokenId) public view returns (uint256)",
                "function perUsePrices(uint256 tokenId) public view returns (uint256)",
                "function dailyPrices(uint256 tokenId) public view returns (uint256)",
                "function balanceOf(address owner) public view returns (uint256)",
                "function tokenOfOwnerByIndex(address owner, uint256 index) public view returns (uint256)",
                "event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)"
            ],
            
            echoFusion: [
                "function getTreeRevenue(uint256 treeId) public view returns (uint256)",
                "function claimRevenue(uint256 treeId) public",
                "event RevenueClaimed(uint256 indexed treeId, address indexed claimer, uint256 amount)"
            ]
        };
    }
    
    initializeContracts() {
        if (!this.provider) return;
        
        this.contracts.licenseNFT = new ethers.Contract(
            this.addresses.licenseNFT,
            this.abis.licenseNFT,
            this.provider
        );
        
        this.contracts.echoAsset = new ethers.Contract(
            this.addresses.echoAsset,
            this.abis.echoAsset,
            this.provider
        );
        
        this.contracts.echoFusion = new ethers.Contract(
            this.addresses.echoFusion,
            this.abis.echoFusion,
            this.provider
        );
    }
    
    // ==================== 缓存工具 ====================
    
    getCacheKey(key) {
        return `revenue_${key}`;
    }
    
    getCached(key) {
        const cached = this.cache.get(this.getCacheKey(key));
        if (cached && Date.now() - cached.timestamp < this.cacheExpiry) {
            return cached.data;
        }
        return null;
    }
    
    setCache(key, data) {
        this.cache.set(this.getCacheKey(key), {
            data,
            timestamp: Date.now()
        });
    }
    
    clearCache() {
        this.cache.clear();
    }
    
    // ==================== 核心数据查询 ====================
    
    /**
     * 获取创作者的所有作品
     */
    async getCreatorWorks(creatorAddress) {
        if (!creatorAddress || !this.contracts.echoAsset) return [];
        
        const cacheKey = `works_${creatorAddress}`;
        const cached = this.getCached(cacheKey);
        if (cached) return cached;
        
        try {
            const works = [];
            
            // 获取创作者拥有的资产数量
            const balance = await this.contracts.echoAsset.balanceOf(creatorAddress);
            
            // 获取每个资产的详细信息
            for (let i = 0; i < balance; i++) {
                try {
                    const tokenId = await this.contracts.echoAsset.tokenOfOwnerByIndex(creatorAddress, i);
                    const metadata = await this.contracts.echoAsset.assetMetadata(tokenId);
                    
                    works.push({
                        id: tokenId.toString(),
                        name: metadata.name,
                        description: metadata.description,
                        assetType: metadata.assetType,
                        createdAt: new Date(Number(metadata.createdAt) * 1000),
                        lastUpdated: new Date(Number(metadata.lastUpdated) * 1000)
                    });
                } catch (error) {
                    console.warn(`获取作品 ${i} 失败:`, error);
                }
            }
            
            this.setCache(cacheKey, works);
            return works;
            
        } catch (error) {
            console.error('获取创作者作品失败:', error);
            return [];
        }
    }
    
    /**
     * 获取作品的授权销售记录
     */
    async getAssetLicenseSales(assetId, fromBlock = 0, toBlock = 'latest') {
        if (!this.contracts.licenseNFT) return [];
        
        try {
            // 查询 LicensePurchased 事件
            const filter = this.contracts.licenseNFT.filters.LicensePurchased(
                null,      // licenseId (any)
                assetId,   // parentAssetId
                null       // licensee (any)
            );
            
            const events = await this.contracts.licenseNFT.queryFilter(filter, fromBlock, toBlock);
            
            return events.map(event => ({
                licenseId: event.args.licenseId.toString(),
                assetId: event.args.parentAssetId.toString(),
                licensee: event.args.licensee,
                licenseType: this.licenseTypeMap[event.args.licenseType] || 'UNKNOWN',
                usageType: this.usageTypeMap[event.args.usageType] || 'UNKNOWN',
                price: ethers.utils.formatEther(event.args.price),
                timestamp: new Date(Number(event.args.timestamp) * 1000),
                blockNumber: event.blockNumber,
                transactionHash: event.transactionHash
            }));
            
        } catch (error) {
            console.error(`获取作品 ${assetId} 授权销售记录失败:`, error);
            return [];
        }
    }
    
    /**
     * 获取创作者的所有授权销售记录
     */
    async getCreatorSales(creatorAddress, days = 90) {
        if (!creatorAddress) return [];
        
        const cacheKey = `sales_${creatorAddress}_${days}`;
        const cached = this.getCached(cacheKey);
        if (cached) return cached;
        
        try {
            // 获取当前区块号
            const currentBlock = await this.provider.getBlockNumber();
            
            // 估算目标区块 (Qitmeer 约 1分钟/区块)
            const blocksPerDay = 1440;
            const fromBlock = Math.max(0, currentBlock - (days * blocksPerDay));
            
            // 获取所有 LicensePurchased 事件
            const filter = this.contracts.licenseNFT.filters.LicensePurchased();
            const events = await this.contracts.licenseNFT.queryFilter(filter, fromBlock, 'latest');
            
            // 筛选出创作者的作品销售
            const sales = [];
            
            for (const event of events) {
                try {
                    // 获取资产的创作者
                    const assetId = event.args.parentAssetId.toString();
                    const assetCreator = await this.contracts.licenseNFT.getAssetCreator(assetId);
                    
                    if (assetCreator.toLowerCase() === creatorAddress.toLowerCase()) {
                        sales.push({
                            licenseId: event.args.licenseId.toString(),
                            assetId: assetId,
                            licensee: event.args.licensee,
                            licenseType: this.licenseTypeMap[event.args.licenseType] || 'UNKNOWN',
                            usageType: this.usageTypeMap[event.args.usageType] || 'UNKNOWN',
                            price: ethers.utils.formatEther(event.args.price),
                            timestamp: new Date(Number(event.args.timestamp) * 1000),
                            blockNumber: event.blockNumber,
                            transactionHash: event.transactionHash
                        });
                    }
                } catch (error) {
                    console.warn('处理销售事件失败:', error);
                }
            }
            
            this.setCache(cacheKey, sales);
            return sales;
            
        } catch (error) {
            console.error('获取创作者销售记录失败:', error);
            return [];
        }
    }
    
    // ==================== 收益统计 ====================
    
    /**
     * 计算收益统计数据
     */
    async calculateRevenueStats(creatorAddress) {
        if (!creatorAddress) return this.getEmptyStats();
        
        const cacheKey = `stats_${creatorAddress}`;
        const cached = this.getCached(cacheKey);
        if (cached) return cached;
        
        try {
            const sales = await this.getCreatorSales(creatorAddress, 365); // 获取一年数据
            
            const now = new Date();
            const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
            const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            
            let totalRevenue = 0;
            let monthRevenue = 0;
            let lastMonthRevenue = 0;
            let totalSales = 0;
            
            // 按类型统计
            const typeStats = {
                ONE_TIME: { count: 0, revenue: 0 },
                PER_USE: { count: 0, revenue: 0 },
                TIMED: { count: 0, revenue: 0 }
            };
            
            // 按使用场景统计
            const usageStats = {
                PERSONAL: { count: 0, revenue: 0 },
                GAME: { count: 0, revenue: 0 },
                AI_TRAINING: { count: 0, revenue: 0 },
                COMMERCIAL: { count: 0, revenue: 0 },
                BROADCAST: { count: 0, revenue: 0 },
                STREAMING: { count: 0, revenue: 0 }
            };
            
            for (const sale of sales) {
                const price = parseFloat(sale.price);
                const saleDate = sale.timestamp;
                
                totalRevenue += price;
                totalSales++;
                
                // 本月收益
                if (saleDate >= startOfMonth) {
                    monthRevenue += price;
                }
                
                // 上月收益
                if (saleDate >= startOfLastMonth && saleDate < startOfMonth) {
                    lastMonthRevenue += price;
                }
                
                // 按类型统计
                if (typeStats[sale.licenseType]) {
                    typeStats[sale.licenseType].count++;
                    typeStats[sale.licenseType].revenue += price;
                }
                
                // 按使用场景统计
                if (usageStats[sale.usageType]) {
                    usageStats[sale.usageType].count++;
                    usageStats[sale.usageType].revenue += price;
                }
            }
            
            // 计算月环比
            const monthChange = lastMonthRevenue > 0 
                ? ((monthRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1)
                : (monthRevenue > 0 ? 100 : 0);
            
            // 可提现金额（简化计算，实际应从合约获取）
            const availableBalance = totalRevenue * 0.95; // 扣除平台费
            
            const stats = {
                totalRevenue: totalRevenue.toFixed(4),
                monthRevenue: monthRevenue.toFixed(4),
                lastMonthRevenue: lastMonthRevenue.toFixed(4),
                monthChange: parseFloat(monthChange),
                totalSales: totalSales,
                availableBalance: availableBalance.toFixed(4),
                typeStats,
                usageStats,
                lastUpdated: new Date()
            };
            
            this.setCache(cacheKey, stats);
            return stats;
            
        } catch (error) {
            console.error('计算收益统计失败:', error);
            return this.getEmptyStats();
        }
    }
    
    /**
     * 获取收益趋势数据（用于图表）
     */
    async getRevenueTrend(creatorAddress, days = 30) {
        if (!creatorAddress) return [];
        
        const cacheKey = `trend_${creatorAddress}_${days}`;
        const cached = this.getCached(cacheKey);
        if (cached) return cached;
        
        try {
            const sales = await this.getCreatorSales(creatorAddress, days);
            
            // 按日期分组
            const dailyData = {};
            const now = new Date();
            
            // 初始化所有日期为0
            for (let i = days - 1; i >= 0; i--) {
                const date = new Date(now);
                date.setDate(date.getDate() - i);
                const dateKey = date.toISOString().split('T')[0];
                dailyData[dateKey] = { date: dateKey, revenue: 0, sales: 0 };
            }
            
            // 汇总销售数据
            for (const sale of sales) {
                const dateKey = sale.timestamp.toISOString().split('T')[0];
                if (dailyData[dateKey]) {
                    dailyData[dateKey].revenue += parseFloat(sale.price);
                    dailyData[dateKey].sales += 1;
                }
            }
            
            const trend = Object.values(dailyData);
            this.setCache(cacheKey, trend);
            return trend;
            
        } catch (error) {
            console.error('获取收益趋势失败:', error);
            return [];
        }
    }
    
    /**
     * 获取作品收益排行
     */
    async getWorksRanking(creatorAddress, limit = 5) {
        if (!creatorAddress) return [];
        
        const cacheKey = `ranking_${creatorAddress}`;
        const cached = this.getCached(cacheKey);
        if (cached) return cached;
        
        try {
            const sales = await this.getCreatorSales(creatorAddress, 365);
            const works = await this.getCreatorWorks(creatorAddress);
            
            // 按作品统计
            const workStats = {};
            
            // 初始化所有作品
            for (const work of works) {
                workStats[work.id] = {
                    id: work.id,
                    name: work.name,
                    cover: this.getAssetCover(work.assetType),
                    revenue: 0,
                    sales: 0
                };
            }
            
            // 汇总销售数据
            for (const sale of sales) {
                if (workStats[sale.assetId]) {
                    workStats[sale.assetId].revenue += parseFloat(sale.price);
                    workStats[sale.assetId].sales += 1;
                }
            }
            
            // 排序并取前N
            const ranking = Object.values(workStats)
                .sort((a, b) => b.revenue - a.revenue)
                .slice(0, limit);
            
            this.setCache(cacheKey, ranking);
            return ranking;
            
        } catch (error) {
            console.error('获取作品排行失败:', error);
            return [];
        }
    }
    
    /**
     * 获取最近交易记录
     */
    async getRecentTransactions(creatorAddress, limit = 10) {
        if (!creatorAddress) return [];
        
        try {
            const sales = await this.getCreatorSales(creatorAddress, 30);
            
            // 获取作品名称
            const works = await this.getCreatorWorks(creatorAddress);
            const workMap = {};
            for (const work of works) {
                workMap[work.id] = work.name;
            }
            
            // 格式化交易记录
            const transactions = sales
                .sort((a, b) => b.timestamp - a.timestamp)
                .slice(0, limit)
                .map(sale => ({
                    id: sale.licenseId,
                    date: sale.timestamp,
                    type: this.getTransactionTypeLabel(sale.licenseType),
                    typeCode: sale.licenseType,
                    work: workMap[sale.assetId] || `作品 #${sale.assetId}`,
                    workId: sale.assetId,
                    buyer: this.formatAddress(sale.licensee),
                    buyerAddress: sale.licensee,
                    amount: parseFloat(sale.price),
                    usageType: sale.usageType,
                    transactionHash: sale.transactionHash
                }));
            
            return transactions;
            
        } catch (error) {
            console.error('获取交易记录失败:', error);
            return [];
        }
    }
    
    // ==================== 提现功能 ====================
    
    /**
     * 获取可提现金额
     */
    async getWithdrawableAmount(creatorAddress) {
        if (!creatorAddress || !this.signer) return '0';
        
        try {
            // 从收益统计计算
            const stats = await this.calculateRevenueStats(creatorAddress);
            return stats.availableBalance;
            
        } catch (error) {
            console.error('获取可提现金额失败:', error);
            return '0';
        }
    }
    
    /**
     * 执行提现
     */
    async withdraw(amount) {
        if (!this.signer) {
            throw new Error('请先连接钱包');
        }
        
        try {
            // 检查 ECHOFusion 合约是否支持提现
            // 这里需要根据实际合约功能实现
            // 当前版本可能通过 RevenueDistributed 事件自动分发
            
            // 模拟提现处理
            // 实际实现需要调用具体的收益合约
            
            return {
                success: true,
                amount: amount,
                timestamp: new Date()
            };
            
        } catch (error) {
            console.error('提现失败:', error);
            throw error;
        }
    }
    
    // ==================== 辅助方法 ====================
    
    getEmptyStats() {
        return {
            totalRevenue: '0',
            monthRevenue: '0',
            lastMonthRevenue: '0',
            monthChange: 0,
            totalSales: 0,
            availableBalance: '0',
            typeStats: {
                ONE_TIME: { count: 0, revenue: 0 },
                PER_USE: { count: 0, revenue: 0 },
                TIMED: { count: 0, revenue: 0 }
            },
            usageStats: {
                PERSONAL: { count: 0, revenue: 0 },
                GAME: { count: 0, revenue: 0 },
                AI_TRAINING: { count: 0, revenue: 0 },
                COMMERCIAL: { count: 0, revenue: 0 },
                BROADCAST: { count: 0, revenue: 0 },
                STREAMING: { count: 0, revenue: 0 }
            },
            lastUpdated: new Date()
        };
    }
    
    formatAddress(address) {
        if (!address) return '';
        return address.slice(0, 6) + '...' + address.slice(-4);
    }
    
    getAssetCover(assetType) {
        const coverMap = {
            'music': '🎵',
            'audio': '🎧',
            'image': '🖼️',
            'video': '🎬',
            'text': '📄',
            'code': '💻'
        };
        return coverMap[assetType] || '🎵';
    }
    
    getTransactionTypeLabel(licenseType) {
        const labelMap = {
            'ONE_TIME': '买断授权',
            'PER_USE': '按次授权',
            'TIMED': '限时授权'
        };
        return labelMap[licenseType] || licenseType;
    }
    
    getUsageTypeLabel(usageType) {
        const labelMap = {
            'PERSONAL': '个人使用',
            'GAME': '游戏配乐',
            'AI_TRAINING': 'AI训练',
            'COMMERCIAL': '商业广告',
            'BROADCAST': '广播/电视',
            'STREAMING': '流媒体'
        };
        return labelMap[usageType] || usageType;
    }
    
    // ==================== 数据导出 ====================
    
    /**
     * 导出收益报表
     */
    exportRevenueReport(creatorAddress, data) {
        const headers = ['时间', '类型', '作品', '买家', '使用场景', '金额(MEER)', '交易哈希'];
        
        const rows = data.map(tx => [
            tx.date.toISOString(),
            tx.type,
            tx.work,
            tx.buyerAddress,
            this.getUsageTypeLabel(tx.usageType),
            tx.amount.toFixed(4),
            tx.transactionHash
        ]);
        
        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        
        const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `收益报表_${creatorAddress.slice(0, 8)}_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
}

// 导出服务
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RevenueService;
}
