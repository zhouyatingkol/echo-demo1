/**
 * marketplace.js - ECHO Marketplace 交互逻辑
 * 市场页面：展示音乐资产列表、搜索、筛选、分页
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

class Marketplace {
    constructor() {
        this.assets = [];
        this.filteredAssets = [];
        this.currentPage = 1;
        this.itemsPerPage = 12;
        this.totalPages = 1;
        
        // 筛选状态
        this.filters = {
            search: '',
            priceRange: '',
            scene: '',
            sort: 'newest'
        };
        
        // 合约管理器
        this.contractManager = null;
        this.walletManager = null;
        
        this.init();
    }
    
    async init() {
        this.bindEvents();
        await this.initializeContracts();
        await this.loadAssets();
    }
    
    bindEvents() {
        // 搜索输入
        const searchInput = document.getElementById('searchInput');
        if (searchInput) {
            searchInput.addEventListener('input', this.debounce(() => {
                this.filters.search = searchInput.value;
                this.currentPage = 1;
                this.applyFilters();
            }, 300));
        }
        
        // 价格筛选
        const priceFilter = document.getElementById('priceFilter');
        if (priceFilter) {
            priceFilter.addEventListener('change', () => {
                this.filters.priceRange = priceFilter.value;
                this.currentPage = 1;
                this.applyFilters();
            });
        }
        
        // 场景筛选
        const sceneFilter = document.getElementById('sceneFilter');
        if (sceneFilter) {
            sceneFilter.addEventListener('change', () => {
                this.filters.scene = sceneFilter.value;
                this.currentPage = 1;
                this.applyFilters();
            });
        }
        
        // 排序
        const sortFilter = document.getElementById('sortFilter');
        if (sortFilter) {
            sortFilter.addEventListener('change', () => {
                this.filters.sort = sortFilter.value;
                this.applyFilters();
            });
        }
        
        // 分页按钮
        const prevPage = document.getElementById('prevPage');
        const nextPage = document.getElementById('nextPage');
        
        if (prevPage) {
            prevPage.addEventListener('click', () => {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    this.renderAssets();
                    this.updatePagination();
                    this.scrollToTop();
                }
            });
        }
        
        if (nextPage) {
            nextPage.addEventListener('click', () => {
                if (this.currentPage < this.totalPages) {
                    this.currentPage++;
                    this.renderAssets();
                    this.updatePagination();
                    this.scrollToTop();
                }
            });
        }
    }
    
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
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
                console.log('ContractManagerV3 initialized in marketplace');
            }
        } catch (error) {
            console.error('Failed to setup contracts:', error);
        }
    }
    
    async loadAssets() {
        this.showLoading();
        
        try {
            // 模拟从合约或API加载资产数据
            // 实际项目中应该调用合约获取真实数据
            await this.fetchAssets();
            
            this.filteredAssets = [...this.assets];
            this.applyFilters();
            
            this.hideLoading();
        } catch (error) {
            console.error('Failed to load assets:', error);
            this.showError('加载资产失败，请稍后重试');
        }
    }
    
    async fetchAssets() {
        // 模拟资产数据
        // 实际项目中应从合约获取
        const mockAssets = [
            { id: 1, title: '夏日微风', creator: '音乐制作人小王', price: 100, plays: 1234, licenses: 56, createdAt: '2024-01', type: '流行', scene: 'personal' },
            { id: 2, title: '冬日暖阳', creator: '旋律工坊', price: 150, plays: 892, licenses: 34, createdAt: '2024-02', type: '轻音乐', scene: 'game' },
            { id: 3, title: '春日花开', creator: '自然之声', price: 200, plays: 2156, licenses: 89, createdAt: '2024-01', type: '自然', scene: 'commercial' },
            { id: 4, title: '秋叶飘落', creator: '季节乐队', price: 80, plays: 567, licenses: 23, createdAt: '2024-03', type: '轻音乐', scene: 'personal' },
            { id: 5, title: '城市节奏', creator: '都市音乐人', price: 300, plays: 3421, licenses: 156, createdAt: '2024-02', type: '电子', scene: 'ai_training' },
            { id: 6, title: '星空下的梦', creator: '梦境工作室', price: 120, plays: 1890, licenses: 67, createdAt: '2024-01', type: '氛围', scene: 'game' },
            { id: 7, title: '海浪之声', creator: '海洋音乐', price: 90, plays: 2341, licenses: 78, createdAt: '2024-03', type: '自然', scene: 'personal' },
            { id: 8, title: '科技前沿', creator: '未来音效', price: 500, plays: 456, licenses: 12, createdAt: '2024-02', type: '电子', scene: 'commercial' },
            { id: 9, title: '古风雅韵', creator: '传统音乐', price: 180, plays: 1567, licenses: 45, createdAt: '2024-01', type: '古风', scene: 'game' },
            { id: 10, title: '欢乐时光', creator: '快乐音符', price: 60, plays: 5678, licenses: 234, createdAt: '2024-03', type: '流行', scene: 'personal' },
            { id: 11, title: '深夜思绪', creator: '夜曲创作', price: 250, plays: 789, licenses: 28, createdAt: '2024-02', type: '氛围', scene: 'ai_training' },
            { id: 12, title: '运动节拍', creator: '健身音乐', price: 140, plays: 2890, licenses: 92, createdAt: '2024-01', type: '电子', scene: 'commercial' }
        ];
        
        // 如果有合约管理器，尝试获取真实数据
        if (this.contractManager) {
            try {
                // 这里可以实现真实的合约查询
                // 例如：获取所有资产的ID列表，然后逐个查询详情
                console.log('Attempting to fetch real asset data from contracts...');
            } catch (error) {
                console.warn('Failed to fetch from contract, using mock data:', error);
            }
        }
        
        this.assets = mockAssets;
    }
    
    applyFilters() {
        let result = [...this.assets];
        
        // 搜索筛选
        if (this.filters.search) {
            const searchLower = this.filters.search.toLowerCase();
            result = result.filter(asset => 
                asset.title.toLowerCase().includes(searchLower) ||
                asset.creator.toLowerCase().includes(searchLower)
            );
        }
        
        // 价格筛选
        if (this.filters.priceRange) {
            const [min, max] = this.filters.priceRange.split('-').map(v => 
                v === '500+' ? 500 : parseInt(v)
            );
            result = result.filter(asset => {
                if (this.filters.priceRange === '500+') {
                    return asset.price >= 500;
                }
                return asset.price >= min && asset.price <= max;
            });
        }
        
        // 场景筛选
        if (this.filters.scene) {
            result = result.filter(asset => asset.scene === this.filters.scene);
        }
        
        // 排序
        switch (this.filters.sort) {
            case 'price_asc':
                result.sort((a, b) => a.price - b.price);
                break;
            case 'price_desc':
                result.sort((a, b) => b.price - a.price);
                break;
            case 'popular':
                result.sort((a, b) => b.plays - a.plays);
                break;
            case 'newest':
            default:
                // 按创建时间降序
                result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
        }
        
        this.filteredAssets = result;
        this.currentPage = 1;
        this.totalPages = Math.ceil(result.length / this.itemsPerPage) || 1;
        
        this.renderAssets();
        this.updatePagination();
        
        // 显示空状态
        if (result.length === 0) {
            document.getElementById('emptyState').classList.remove('hidden');
            document.getElementById('assetGrid').classList.add('hidden');
            document.getElementById('pagination').classList.add('hidden');
        } else {
            document.getElementById('emptyState').classList.add('hidden');
            document.getElementById('assetGrid').classList.remove('hidden');
            document.getElementById('pagination').classList.remove('hidden');
        }
    }
    
    renderAssets() {
        const grid = document.getElementById('assetGrid');
        if (!grid) return;
        
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        const pageAssets = this.filteredAssets.slice(start, end);
        
        grid.innerHTML = pageAssets.map(asset => this.createAssetCard(asset)).join('');
        
        // 添加点击事件
        grid.querySelectorAll('.asset-card').forEach(card => {
            card.addEventListener('click', () => {
                const assetId = card.dataset.id;
                window.location.href = `asset-detail.html?asset=${assetId}`;
            });
        });
    }
    
    createAssetCard(asset) {
        return `
            <article class="asset-card" data-id="${asset.id}">
                <div class="asset-cover">
                    <span class="cover-placeholder">🎵</span>
                    <div class="play-overlay">
                        <span class="play-icon">▶</span>
                    </div>
                </div>
                <div class="asset-info">
                    <h3 class="asset-title">${asset.title}</h3>
                    <div class="asset-creator">
                        <span class="creator-avatar">👤</span>
                        <span>${asset.creator}</span>
                    </div>
                    <div class="asset-footer">
                        <span class="asset-price">
                            ${asset.price}
                            <span class="unit">MEER</span>
                        </span>
                        <div class="asset-stats">
                            <span class="stat">▶ ${this.formatNumber(asset.plays)}</span>
                        </div>
                    </div>
                </div>
            </article>
        `;
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
    
    updatePagination() {
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        const pageInfo = document.getElementById('pageInfo');
        
        if (prevBtn) {
            prevBtn.disabled = this.currentPage === 1;
        }
        
        if (nextBtn) {
            nextBtn.disabled = this.currentPage >= this.totalPages;
        }
        
        if (pageInfo) {
            pageInfo.textContent = `第 ${this.currentPage} / ${this.totalPages} 页`;
        }
    }
    
    scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    
    clearFilters() {
        this.filters = {
            search: '',
            priceRange: '',
            scene: '',
            sort: 'newest'
        };
        
        // 重置表单控件
        document.getElementById('searchInput').value = '';
        document.getElementById('priceFilter').value = '';
        document.getElementById('sceneFilter').value = '';
        document.getElementById('sortFilter').value = 'newest';
        
        this.applyFilters();
    }
    
    showLoading() {
        document.getElementById('loadingState').classList.remove('hidden');
        document.getElementById('assetGrid').classList.add('hidden');
        document.getElementById('pagination').classList.add('hidden');
        document.getElementById('errorState').classList.add('hidden');
        document.getElementById('emptyState').classList.add('hidden');
    }
    
    hideLoading() {
        document.getElementById('loadingState').classList.add('hidden');
    }
    
    showError(message) {
        document.getElementById('loadingState').classList.add('hidden');
        document.getElementById('errorState').classList.remove('hidden');
        document.getElementById('errorText').textContent = message;
    }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    window.marketplace = new Marketplace();
});
