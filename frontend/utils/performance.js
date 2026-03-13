/**
 * ECHO Protocol - Performance Utilities
 * 性能优化工具集，包含图片懒加载、虚拟滚动、防抖节流等
 * @version 3.0.0
 */

/**
 * 防抖函数
 * 延迟执行，直到停止调用后一段时间才执行
 * @param {Function} fn - 要防抖的函数
 * @param {number} delay - 延迟时间（毫秒）
 * @param {boolean} immediate - 是否立即执行第一次
 * @returns {Function} 防抖后的函数
 */
function debounce(fn, delay = 300, immediate = false) {
    let timer = null;
    let lastArgs = null;
    let lastThis = null;

    return function(...args) {
        lastArgs = args;
        lastThis = this;

        const callNow = immediate && !timer;

        if (timer) {
            clearTimeout(timer);
        }

        timer = setTimeout(() => {
            timer = null;
            if (!immediate) {
                fn.apply(lastThis, lastArgs);
            }
        }, delay);

        if (callNow) {
            fn.apply(lastThis, lastArgs);
        }
    };
}

/**
 * 节流函数
 * 限制函数在一定时间内的执行次数
 * @param {Function} fn - 要节流的函数
 * @param {number} limit - 限制时间（毫秒）
 * @param {boolean} trailing - 是否在结束后执行最后一次
 * @returns {Function} 节流后的函数
 */
function throttle(fn, limit = 300, trailing = true) {
    let inThrottle = false;
    let lastArgs = null;
    let lastThis = null;
    let timeout = null;

    return function(...args) {
        lastArgs = args;
        lastThis = this;

        if (!inThrottle) {
            fn.apply(lastThis, lastArgs);
            inThrottle = true;
            
            clearTimeout(timeout);
            timeout = setTimeout(() => {
                inThrottle = false;
                if (trailing && lastArgs) {
                    fn.apply(lastThis, lastArgs);
                }
            }, limit);
        }
    };
}

/**
 * 请求动画帧节流
 * 使用 requestAnimationFrame 进行节流，适合动画相关操作
 * @param {Function} fn - 要节流的函数
 * @returns {Function} 节流后的函数
 */
function rafThrottle(fn) {
    let ticking = false;
    let lastArgs = null;
    let lastThis = null;

    return function(...args) {
        lastArgs = args;
        lastThis = this;

        if (!ticking) {
            requestAnimationFrame(() => {
                ticking = false;
                fn.apply(lastThis, lastArgs);
            });
            ticking = true;
        }
    };
}

/**
 * 图片懒加载管理器
 * 使用 IntersectionObserver 实现高效的图片懒加载
 */
class LazyImageLoader {
    constructor(options = {}) {
        this.options = {
            root: null,
            rootMargin: '50px 0px',
            threshold: 0.01,
            placeholder: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
            errorImage: null,
            onLoad: null,
            onError: null,
            ...options
        };

        this.observer = null;
        this.imageCache = new Map();
        this.pendingImages = new Set();

        this._initObserver();
    }

    /**
     * 初始化 IntersectionObserver
     * @private
     */
    _initObserver() {
        if (!('IntersectionObserver' in window)) {
            console.warn('IntersectionObserver not supported, falling back to eager loading');
            this._fallbackMode = true;
            return;
        }

        this.observer = new IntersectionObserver(
            this._handleIntersection.bind(this),
            {
                root: this.options.root,
                rootMargin: this.options.rootMargin,
                threshold: this.options.threshold
            }
        );
    }

    /**
     * 处理交叉观察回调
     * @private
     */
    _handleIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                this._loadImage(entry.target);
                this.observer.unobserve(entry.target);
            }
        });
    }

    /**
     * 加载图片
     * @private
     */
    _loadImage(img) {
        const src = img.dataset.src;
        const srcset = img.dataset.srcset;

        if (!src) return;

        // 检查缓存
        if (this.imageCache.has(src)) {
            this._setImageSource(img, src, srcset);
            return;
        }

        // 标记为加载中
        img.classList.add('loading');
        this.pendingImages.add(img);

        // 创建图片预加载
        const preloadImg = new Image();
        
        preloadImg.onload = () => {
            this.imageCache.set(src, true);
            this._setImageSource(img, src, srcset);
            img.classList.remove('loading');
            img.classList.add('loaded');
            this.pendingImages.delete(img);
            
            if (this.options.onLoad) {
                this.options.onLoad(img, src);
            }
        };

        preloadImg.onerror = () => {
            img.classList.remove('loading');
            img.classList.add('error');
            this.pendingImages.delete(img);
            
            if (this.options.errorImage) {
                img.src = this.options.errorImage;
            }
            
            if (this.options.onError) {
                this.options.onError(img, src);
            }
        };

        preloadImg.src = src;
    }

    /**
     * 设置图片源
     * @private
     */
    _setImageSource(img, src, srcset) {
        img.src = src;
        if (srcset) {
            img.srcset = srcset;
        }
        img.removeAttribute('data-src');
        img.removeAttribute('data-srcset');
    }

    /**
     * 观察图片元素
     * @param {HTMLElement} img - 图片元素或容器
     */
    observe(img) {
        if (this._fallbackMode) {
            // 降级模式：立即加载
            this._loadImage(img);
            return;
        }

        // 设置占位图
        if (!img.src && this.options.placeholder) {
            img.src = this.options.placeholder;
        }

        this.observer.observe(img);
    }

    /**
     * 观察多个图片元素
     * @param {string} selector - CSS选择器
     * @param {HTMLElement} container - 容器元素
     */
    observeAll(selector = '[data-src]', container = document) {
        const images = container.querySelectorAll(selector);
        images.forEach(img => this.observe(img));
    }

    /**
     * 停止观察
     * @param {HTMLElement} img - 图片元素
     */
    unobserve(img) {
        if (this.observer) {
            this.observer.unobserve(img);
        }
    }

    /**
     * 立即加载所有待加载图片
     */
    loadAll() {
        this.pendingImages.forEach(img => {
            this._loadImage(img);
            this.unobserve(img);
        });
        this.pendingImages.clear();
    }

    /**
     * 销毁加载器
     */
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
            this.observer = null;
        }
        this.pendingImages.clear();
        this.imageCache.clear();
    }

    /**
     * 获取加载状态统计
     * @returns {Object} 统计信息
     */
    getStats() {
        return {
            cached: this.imageCache.size,
            pending: this.pendingImages.size
        };
    }
}

/**
 * 虚拟滚动管理器
 * 处理大量列表数据的高效渲染
 */
class VirtualScroller {
    constructor(container, options = {}) {
        this.container = typeof container === 'string' 
            ? document.querySelector(container) 
            : container;
        
        if (!this.container) {
            throw new Error('VirtualScroller: container not found');
        }

        this.options = {
            itemHeight: 50,           // 每项高度
            overscan: 5,              // 额外渲染的项数
            renderItem: null,         // 渲染函数
            onScroll: null,           // 滚动回调
            scrollContainer: null,    // 滚动容器（默认为 container）
            ...options
        };

        this.items = [];
        this.visibleRange = { start: 0, end: 0 };
        this.scrollTop = 0;
        this.containerHeight = 0;
        this.totalHeight = 0;
        this.scrollContainer = this.options.scrollContainer || this.container;

        this._init();
    }

    /**
     * 初始化虚拟滚动
     * @private
     */
    _init() {
        // 创建内容容器
        this.contentEl = document.createElement('div');
        this.contentEl.className = 'virtual-scroll-content';
        this.contentEl.style.position = 'relative';
        
        // 创建占位元素
        this.spacerEl = document.createElement('div');
        this.spacerEl.className = 'virtual-scroll-spacer';
        
        this.container.innerHTML = '';
        this.container.appendChild(this.spacerEl);
        this.container.appendChild(this.contentEl);

        // 绑定滚动事件
        this._onScroll = rafThrottle(this._handleScroll.bind(this));
        this.scrollContainer.addEventListener('scroll', this._onScroll, { passive: true });

        // 初始计算
        this._updateContainerHeight();
        this.refresh();

        // 监听容器大小变化
        if ('ResizeObserver' in window) {
            this.resizeObserver = new ResizeObserver(() => {
                this._updateContainerHeight();
                this.refresh();
            });
            this.resizeObserver.observe(this.container);
        }
    }

    /**
     * 更新容器高度
     * @private
     */
    _updateContainerHeight() {
        this.containerHeight = this.container.clientHeight;
    }

    /**
     * 处理滚动事件
     * @private
     */
    _handleScroll() {
        this.scrollTop = this.scrollContainer.scrollTop;
        this._updateVisibleRange();
        
        if (this.options.onScroll) {
            this.options.onScroll({
                scrollTop: this.scrollTop,
                visibleRange: this.visibleRange
            });
        }
    }

    /**
     * 更新可见范围
     * @private
     */
    _updateVisibleRange() {
        const { itemHeight, overscan } = this.options;
        
        const startIndex = Math.max(0, Math.floor(this.scrollTop / itemHeight) - overscan);
        const visibleCount = Math.ceil(this.containerHeight / itemHeight) + overscan * 2;
        const endIndex = Math.min(this.items.length, startIndex + visibleCount);

        if (startIndex !== this.visibleRange.start || endIndex !== this.visibleRange.end) {
            this.visibleRange = { start: startIndex, end: endIndex };
            this._render();
        }
    }

    /**
     * 渲染可见项
     * @private
     */
    _render() {
        const { start, end } = this.visibleRange;
        const { itemHeight, renderItem } = this.options;

        // 更新占位高度
        this.totalHeight = this.items.length * itemHeight;
        this.spacerEl.style.height = `${this.totalHeight}px`;

        // 清空并重新渲染
        this.contentEl.innerHTML = '';
        this.contentEl.style.transform = `translateY(${start * itemHeight}px)`;

        // 渲染可见项
        for (let i = start; i < end; i++) {
            if (i >= this.items.length) break;
            
            const item = this.items[i];
            const el = renderItem(item, i);
            
            if (el) {
                el.style.height = `${itemHeight}px`;
                el.dataset.index = i;
                this.contentEl.appendChild(el);
            }
        }
    }

    /**
     * 设置数据并刷新
     * @param {Array} items - 数据数组
     */
    setItems(items) {
        this.items = items || [];
        this.refresh();
    }

    /**
     * 追加数据
     * @param {Array} items - 要追加的数据
     */
    appendItems(items) {
        this.items.push(...items);
        this.refresh();
    }

    /**
     * 刷新视图
     */
    refresh() {
        this._updateVisibleRange();
    }

    /**
     * 滚动到指定索引
     * @param {number} index - 目标索引
     * @param {string} behavior - 滚动行为：'auto' | 'smooth'
     */
    scrollToIndex(index, behavior = 'auto') {
        const { itemHeight } = this.options;
        const scrollTop = index * itemHeight;
        this.scrollContainer.scrollTo({
            top: scrollTop,
            behavior
        });
    }

    /**
     * 滚动到顶部
     * @param {string} behavior - 滚动行为
     */
    scrollToTop(behavior = 'auto') {
        this.scrollContainer.scrollTo({
            top: 0,
            behavior
        });
    }

    /**
     * 滚动到底部
     * @param {string} behavior - 滚动行为
     */
    scrollToBottom(behavior = 'auto') {
        this.scrollContainer.scrollTo({
            top: this.totalHeight,
            behavior
        });
    }

    /**
     * 获取当前可见索引
     * @returns {Object} 可见范围
     */
    getVisibleRange() {
        return { ...this.visibleRange };
    }

    /**
     * 获取当前滚动位置
     * @returns {number} 滚动位置
     */
    getScrollTop() {
        return this.scrollTop;
    }

    /**
     * 销毁虚拟滚动器
     */
    destroy() {
        this.scrollContainer.removeEventListener('scroll', this._onScroll);
        
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        
        this.container.innerHTML = '';
        this.items = [];
    }
}

/**
 * 无限滚动加载器
 * 处理数据分页加载
 */
class InfiniteLoader {
    constructor(container, options = {}) {
        this.container = typeof container === 'string'
            ? document.querySelector(container)
            : container;
        
        this.options = {
            threshold: 100,           // 距离底部多少像素触发加载
            loadMore: null,           // 加载更多数据的函数
            hasMore: true,            // 是否还有更多数据
            loadingDelay: 200,        // 加载状态显示延迟
            ...options
        };

        this.isLoading = false;
        this.hasMore = this.options.hasMore;
        this.observer = null;

        this._init();
    }

    /**
     * 初始化
     * @private
     */
    _init() {
        // 创建触发器元素
        this.triggerEl = document.createElement('div');
        this.triggerEl.className = 'infinite-scroll-trigger';
        this.triggerEl.style.height = '1px';
        this.container.appendChild(this.triggerEl);

        // 创建加载指示器
        this.loadingEl = document.createElement('div');
        this.loadingEl.className = 'infinite-scroll-loading';
        this.loadingEl.innerHTML = this._getLoadingHTML();
        this.loadingEl.style.display = 'none';
        this.container.appendChild(this.loadingEl);

        // 初始化 IntersectionObserver
        this._initObserver();
    }

    /**
     * 初始化观察器
     * @private
     */
    _initObserver() {
        this.observer = new IntersectionObserver(
            (entries) => {
                if (entries[0].isIntersecting && this.hasMore && !this.isLoading) {
                    this._loadMore();
                }
            },
            {
                root: null,
                rootMargin: `${this.options.threshold}px`,
                threshold: 0
            }
        );

        this.observer.observe(this.triggerEl);
    }

    /**
     * 获取加载HTML
     * @private
     */
    _getLoadingHTML() {
        return `
            <div class="loading-spinner"></div>
            <span class="loading-text">加载中...</span>
        `;
    }

    /**
     * 加载更多数据
     * @private
     */
    async _loadMore() {
        if (!this.options.loadMore || this.isLoading || !this.hasMore) {
            return;
        }

        this.isLoading = true;
        this.loadingEl.style.display = 'block';

        try {
            const result = await this.options.loadMore();
            
            if (result && typeof result.hasMore === 'boolean') {
                this.hasMore = result.hasMore;
            } else if (result && Array.isArray(result) && result.length === 0) {
                this.hasMore = false;
            }

        } catch (error) {
            console.error('Infinite scroll load error:', error);
            this._showError();
        } finally {
            this.isLoading = false;
            if (!this.hasMore) {
                this.loadingEl.style.display = 'none';
                this._showNoMore();
            }
        }
    }

    /**
     * 显示错误状态
     * @private
     */
    _showError() {
        this.loadingEl.innerHTML = `
            <span class="error-text">加载失败，请重试</span>
            <button class="retry-btn">重试</button>
        `;
        
        const retryBtn = this.loadingEl.querySelector('.retry-btn');
        if (retryBtn) {
            retryBtn.addEventListener('click', () => {
                this.loadingEl.innerHTML = this._getLoadingHTML();
                this._loadMore();
            });
        }
    }

    /**
     * 显示没有更多数据
     * @private
     */
    _showNoMore() {
        this.loadingEl.innerHTML = '<span class="no-more-text">没有更多了</span>';
        this.loadingEl.style.display = 'block';
    }

    /**
     * 重置加载器
     * @param {boolean} hasMore - 是否还有更多数据
     */
    reset(hasMore = true) {
        this.hasMore = hasMore;
        this.isLoading = false;
        this.loadingEl.innerHTML = this._getLoadingHTML();
        this.loadingEl.style.display = 'none';
    }

    /**
     * 手动触发加载
     */
    load() {
        this._loadMore();
    }

    /**
     * 销毁加载器
     */
    destroy() {
        if (this.observer) {
            this.observer.disconnect();
        }
        if (this.triggerEl) {
            this.triggerEl.remove();
        }
        if (this.loadingEl) {
            this.loadingEl.remove();
        }
    }
}

/**
 * 资源预加载器
 * 预加载图片、脚本等资源
 */
class ResourcePreloader {
    constructor(options = {}) {
        this.options = {
            concurrent: 6,            // 并发数
            timeout: 10000,           // 超时时间
            onProgress: null,         // 进度回调
            onComplete: null,         // 完成回调
            onError: null,            // 错误回调
            ...options
        };

        this.queue = [];
        this.loading = new Set();
        this.loaded = new Set();
        this.errors = new Set();
    }

    /**
     * 添加资源到队列
     * @param {string|Array} resources - 资源URL或资源对象数组
     * @param {string} type - 资源类型：'image' | 'script' | 'style' | 'json'
     */
    add(resources, type = 'image') {
        const items = Array.isArray(resources) ? resources : [resources];
        
        items.forEach(url => {
            this.queue.push({
                url,
                type,
                status: 'pending'
            });
        });
    }

    /**
     * 开始预加载
     * @returns {Promise} 加载完成Promise
     */
    async start() {
        const total = this.queue.length;
        
        while (this.queue.length > 0 || this.loading.size > 0) {
            // 启动新的加载任务
            while (this.loading.size < this.options.concurrent && this.queue.length > 0) {
                const item = this.queue.shift();
                this._load(item);
            }

            // 等待至少一个任务完成
            if (this.loading.size > 0) {
                await Promise.race([...this.loading]);
            }

            // 报告进度
            if (this.options.onProgress) {
                const progress = (this.loaded.size + this.errors.size) / total;
                this.options.onProgress({
                    progress,
                    loaded: this.loaded.size,
                    errors: this.errors.size,
                    total
                });
            }
        }

        if (this.options.onComplete) {
            this.options.onComplete({
                loaded: [...this.loaded],
                errors: [...this.errors]
            });
        }

        return {
            loaded: [...this.loaded],
            errors: [...this.errors]
        };
    }

    /**
     * 加载单个资源
     * @private
     */
    async _load(item) {
        const loadPromise = this._createLoadPromise(item);
        this.loading.add(loadPromise);

        try {
            await loadPromise;
            item.status = 'loaded';
            this.loaded.add(item.url);
        } catch (error) {
            item.status = 'error';
            this.errors.add(item.url);
            
            if (this.options.onError) {
                this.options.onError(item.url, error);
            }
        } finally {
            this.loading.delete(loadPromise);
        }
    }

    /**
     * 创建加载Promise
     * @private
     */
    _createLoadPromise(item) {
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new Error(`Load timeout: ${item.url}`));
            }, this.options.timeout);

            switch (item.type) {
                case 'image':
                    this._loadImage(item.url, timeout, resolve, reject);
                    break;
                case 'script':
                    this._loadScript(item.url, timeout, resolve, reject);
                    break;
                case 'json':
                    this._loadJSON(item.url, timeout, resolve, reject);
                    break;
                default:
                    clearTimeout(timeout);
                    reject(new Error(`Unknown resource type: ${item.type}`));
            }
        });
    }

    /**
     * 加载图片
     * @private
     */
    _loadImage(url, timeout, resolve, reject) {
        const img = new Image();
        img.onload = () => {
            clearTimeout(timeout);
            resolve();
        };
        img.onerror = () => {
            clearTimeout(timeout);
            reject(new Error(`Failed to load image: ${url}`));
        };
        img.src = url;
    }

    /**
     * 加载脚本
     * @private
     */
    _loadScript(url, timeout, resolve, reject) {
        const script = document.createElement('script');
        script.src = url;
        script.async = true;
        script.onload = () => {
            clearTimeout(timeout);
            resolve();
        };
        script.onerror = () => {
            clearTimeout(timeout);
            reject(new Error(`Failed to load script: ${url}`));
        };
        document.head.appendChild(script);
    }

    /**
     * 加载JSON
     * @private
     */
    async _loadJSON(url, timeout, resolve, reject) {
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            clearTimeout(timeout);
            resolve();
        } catch (error) {
            clearTimeout(timeout);
            reject(error);
        }
    }
}

/**
 * 动画帧调度器
 * 批量处理DOM更新，避免布局抖动
 */
class FrameScheduler {
    constructor() {
        this.tasks = [];
        this.isScheduled = false;
    }

    /**
     * 添加任务
     * @param {Function} task - 任务函数
     * @param {number} priority - 优先级（数字越小优先级越高）
     */
    add(task, priority = 0) {
        this.tasks.push({ task, priority });
        this.tasks.sort((a, b) => a.priority - b.priority);
        
        if (!this.isScheduled) {
            this._schedule();
        }
    }

    /**
     * 调度任务
     * @private
     */
    _schedule() {
        this.isScheduled = true;
        
        requestAnimationFrame(() => {
            const startTime = performance.now();
            const budget = 16; // 16ms budget per frame
            
            while (this.tasks.length > 0 && performance.now() - startTime < budget) {
                const { task } = this.tasks.shift();
                try {
                    task();
                } catch (error) {
                    console.error('Frame task error:', error);
                }
            }
            
            this.isScheduled = false;
            
            // 如果还有任务，继续调度
            if (this.tasks.length > 0) {
                this._schedule();
            }
        });
    }

    /**
     * 清空所有任务
     */
    clear() {
        this.tasks = [];
    }
}

// 导出
export default {
    debounce,
    throttle,
    rafThrottle,
    LazyImageLoader,
    VirtualScroller,
    InfiniteLoader,
    ResourcePreloader,
    FrameScheduler
};

export {
    debounce,
    throttle,
    rafThrottle,
    LazyImageLoader,
    VirtualScroller,
    InfiniteLoader,
    ResourcePreloader,
    FrameScheduler
};

// 全局兼容
if (typeof window !== 'undefined') {
    window.PerformanceUtils = {
        debounce,
        throttle,
        rafThrottle,
        LazyImageLoader,
        VirtualScroller,
        InfiniteLoader,
        ResourcePreloader,
        FrameScheduler
    };
}
