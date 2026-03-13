/**
 * Echo Follow System - Enhanced
 * 用户关注系统 - 支持本地存储(localStorage) + 链上存储(可选)
 * 
 * @version 2.0.0
 * @author ECHO Protocol Team
 */

/**
 * 关注系统主类
 * 管理用户的关注/粉丝关系
 */
class FollowSystem {
  /**
   * @param {string} userAddress - 当前用户的钱包地址
   * @param {Object} options - 配置选项
   * @param {boolean} options.enableOnChain - 是否启用链上存储
   * @param {Object} options.contract - 智能合约实例（可选）
   */
  constructor(userAddress, options = {}) {
    this.userAddress = userAddress?.toLowerCase() || null;
    this.options = {
      enableOnChain: false,
      contract: null,
      ...options
    };
    this.storageKey = `echo_follows_${this.userAddress}`;
    this.cacheKey = `echo_follows_cache_${this.userAddress}`;
    this.data = this.loadData();
    this.listeners = new Map();
    
    // 初始化缓存
    this._initCache();
  }

  /**
   * 初始化缓存机制
   * @private
   */
  _initCache() {
    // 每5分钟清理过期缓存
    setInterval(() => {
      this._cleanExpiredCache();
    }, 5 * 60 * 1000);
  }

  /**
   * 清理过期缓存
   * @private
   */
  _cleanExpiredCache() {
    const cache = this._getCache();
    const now = Date.now();
    const maxAge = 10 * 60 * 1000; // 10分钟
    
    for (const [key, value] of Object.entries(cache)) {
      if (now - value.timestamp > maxAge) {
        delete cache[key];
      }
    }
    
    localStorage.setItem(this.cacheKey, JSON.stringify(cache));
  }

  /**
   * 获取缓存数据
   * @private
   * @returns {Object} 缓存对象
   */
  _getCache() {
    try {
      const cache = localStorage.getItem(this.cacheKey);
      return cache ? JSON.parse(cache) : {};
    } catch {
      return {};
    }
  }

  /**
   * 设置缓存
   * @private
   * @param {string} key - 缓存键
   * @param {*} value - 缓存值
   */
  _setCache(key, value) {
    const cache = this._getCache();
    cache[key] = {
      value,
      timestamp: Date.now()
    };
    localStorage.setItem(this.cacheKey, JSON.stringify(cache));
  }

  /**
   * 从 localStorage 加载关注数据
   * @returns {Object} 关注数据对象
   */
  loadData() {
    if (!this.userAddress) {
      return { following: [], followers: [], followingCount: 0, followersCount: 0 };
    }
    
    try {
      const stored = localStorage.getItem(this.storageKey);
      const data = stored ? JSON.parse(stored) : { 
        following: [], 
        followers: [],
        followingCount: 0,
        followersCount: 0,
        updatedAt: null
      };
      
      // 确保字段完整性
      data.following = data.following || [];
      data.followers = data.followers || [];
      data.followingCount = data.following.length;
      data.followersCount = data.followers.length;
      
      return data;
    } catch (error) {
      console.error('[FollowSystem] 加载数据失败:', error);
      return { following: [], followers: [], followingCount: 0, followersCount: 0 };
    }
  }

  /**
   * 保存关注数据到 localStorage
   */
  saveData() {
    if (!this.userAddress) return;
    
    try {
      this.data.updatedAt = new Date().toISOString();
      this.data.followingCount = this.data.following.length;
      this.data.followersCount = this.data.followers.length;
      localStorage.setItem(this.storageKey, JSON.stringify(this.data));
      
      // 触发数据更新事件
      this._emit('dataChanged', { ...this.data });
    } catch (error) {
      console.error('[FollowSystem] 保存数据失败:', error);
    }
  }

  /**
   * 关注创作者
   * @param {string} creatorAddress - 创作者地址
   * @param {Object} creatorInfo - 创作者信息（可选）
   * @returns {Promise<Object>} 操作结果
   */
  async follow(creatorAddress, creatorInfo = {}) {
    if (!this.userAddress) {
      return { success: false, error: '请先连接钱包' };
    }
    
    const normalizedAddress = creatorAddress.toLowerCase();
    
    if (normalizedAddress === this.userAddress) {
      return { success: false, error: '不能关注自己' };
    }

    if (this.data.following.includes(normalizedAddress)) {
      return { success: false, error: '已关注该创作者' };
    }

    try {
      // 本地存储
      this.data.following.push(normalizedAddress);
      this.saveData();

      // 存储创作者详细信息
      this._saveCreatorInfo(normalizedAddress, creatorInfo);

      // 更新对方的粉丝列表
      this._updateFollowerList(normalizedAddress, this.userAddress, true);

      // 链上存储（如果启用）
      if (this.options.enableOnChain && this.options.contract) {
        await this._followOnChain(normalizedAddress);
      }

      // 触发关注事件
      this._emit('followed', { 
        creatorAddress: normalizedAddress, 
        creatorInfo,
        timestamp: Date.now() 
      });

      return { 
        success: true, 
        followingCount: this.data.following.length,
        creatorInfo 
      };
    } catch (error) {
      console.error('[FollowSystem] 关注失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 取消关注创作者
   * @param {string} creatorAddress - 创作者地址
   * @returns {Promise<Object>} 操作结果
   */
  async unfollow(creatorAddress) {
    if (!this.userAddress) {
      return { success: false, error: '请先连接钱包' };
    }
    
    const normalizedAddress = creatorAddress.toLowerCase();
    const index = this.data.following.indexOf(normalizedAddress);
    
    if (index === -1) {
      return { success: false, error: '未关注该创作者' };
    }

    try {
      // 本地存储
      this.data.following.splice(index, 1);
      this.saveData();

      // 更新对方的粉丝列表
      this._updateFollowerList(normalizedAddress, this.userAddress, false);

      // 链上存储（如果启用）
      if (this.options.enableOnChain && this.options.contract) {
        await this._unfollowOnChain(normalizedAddress);
      }

      // 触发取消关注事件
      this._emit('unfollowed', { 
        creatorAddress: normalizedAddress,
        timestamp: Date.now() 
      });

      return { 
        success: true, 
        followingCount: this.data.following.length 
      };
    } catch (error) {
      console.error('[FollowSystem] 取消关注失败:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * 检查是否已关注某个创作者
   * @param {string} creatorAddress - 创作者地址
   * @returns {boolean} 是否已关注
   */
  isFollowing(creatorAddress) {
    if (!this.userAddress || !creatorAddress) return false;
    return this.data.following.includes(creatorAddress.toLowerCase());
  }

  /**
   * 获取我的关注列表
   * @param {Object} options - 选项
   * @param {number} options.page - 页码
   * @param {number} options.limit - 每页数量
   * @returns {Object} 分页的关注列表
   */
  getFollowingList(options = {}) {
    const { page = 1, limit = 20 } = options;
    const start = (page - 1) * limit;
    const end = start + limit;
    const list = this.data.following.slice(start, end);
    
    return {
      list,
      pagination: {
        page,
        limit,
        total: this.data.following.length,
        hasMore: end < this.data.following.length
      }
    };
  }

  /**
   * 获取我的粉丝列表
   * @param {Object} options - 选项
   * @param {number} options.page - 页码
   * @param {number} options.limit - 每页数量
   * @returns {Object} 分页的粉丝列表
   */
  getFollowersList(options = {}) {
    const { page = 1, limit = 20 } = options;
    const start = (page - 1) * limit;
    const end = start + limit;
    const list = this.data.followers.slice(start, end);
    
    return {
      list,
      pagination: {
        page,
        limit,
        total: this.data.followers.length,
        hasMore: end < this.data.followers.length
      }
    };
  }

  /**
   * 获取关注数量
   * @returns {number} 关注数
   */
  getFollowingCount() {
    return this.data.following.length;
  }

  /**
   * 获取粉丝数量
   * @returns {number} 粉丝数
   */
  getFollowersCount() {
    return this.data.followers.length;
  }

  /**
   * 获取互相关注列表
   * @returns {string[]} 互相关注的用户地址列表
   */
  getMutualFollows() {
    return this.data.following.filter(address => 
      this.data.followers.includes(address)
    );
  }

  /**
   * 获取创作者的详细信息
   * @param {string} creatorAddress - 创作者地址
   * @returns {Object|null} 创作者信息
   */
  getCreatorInfo(creatorAddress) {
    if (!creatorAddress) return null;
    
    const normalizedAddress = creatorAddress.toLowerCase();
    const cache = this._getCache();
    const cached = cache[`creator_${normalizedAddress}`];
    
    if (cached) {
      return cached.value;
    }
    
    return this._getStoredCreatorInfo(normalizedAddress);
  }

  /**
   * 批量获取创作者信息
   * @param {string[]} addresses - 创作者地址列表
   * @returns {Object[]} 创作者信息列表
   */
  getCreatorsInfo(addresses) {
    return addresses.map(addr => ({
      address: addr,
      ...this.getCreatorInfo(addr)
    })).filter(info => info.name || info.address);
  }

  /**
   * 搜索已关注的创作者
   * @param {string} keyword - 搜索关键词
   * @returns {Object[]} 匹配的创作者列表
   */
  searchFollowing(keyword) {
    if (!keyword) return this.data.following;
    
    const lowerKeyword = keyword.toLowerCase();
    return this.data.following.filter(address => {
      const info = this.getCreatorInfo(address);
      if (!info) return false;
      
      return (
        (info.name && info.name.toLowerCase().includes(lowerKeyword)) ||
        (info.bio && info.bio.toLowerCase().includes(lowerKeyword)) ||
        address.toLowerCase().includes(lowerKeyword)
      );
    });
  }

  /**
   * 按关注时间排序获取列表
   * @param {string} type - 'following' 或 'followers'
   * @param {string} order - 'asc' 或 'desc'
   * @returns {string[]} 排序后的列表
   */
  getSortedList(type = 'following', order = 'desc') {
    const list = type === 'following' ? this.data.following : this.data.followers;
    const cache = this._getCache();
    
    return [...list].sort((a, b) => {
      const timeA = cache[`time_${a}`]?.value || 0;
      const timeB = cache[`time_${b}`]?.value || 0;
      return order === 'asc' ? timeA - timeB : timeB - timeA;
    });
  }

  /**
   * 获取推荐关注列表（基于共同关注）
   * @param {number} limit - 推荐数量
   * @returns {Object[]} 推荐列表
   */
  getRecommendations(limit = 5) {
    // 获取所有关注的创作者的粉丝
    const potentialFollows = new Map();
    
    for (const creatorAddress of this.data.following) {
      const creatorData = this._getCreatorData(creatorAddress);
      if (creatorData && creatorData.followers) {
        for (const follower of creatorData.followers) {
          if (follower !== this.userAddress && !this.data.following.includes(follower)) {
            const count = potentialFollows.get(follower) || 0;
            potentialFollows.set(follower, count + 1);
          }
        }
      }
    }
    
    // 按共同关注数量排序
    return Array.from(potentialFollows.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([address, commonCount]) => ({
        address,
        commonCount,
        info: this.getCreatorInfo(address)
      }));
  }

  /**
   * 导出关注数据
   * @returns {Object} 完整的关注数据
   */
  exportData() {
    return {
      userAddress: this.userAddress,
      following: this.data.following,
      followers: this.data.followers,
      followingCount: this.data.following.length,
      followersCount: this.data.followers.length,
      exportedAt: new Date().toISOString(),
      version: '2.0.0'
    };
  }

  /**
   * 导入关注数据
   * @param {Object} data - 导入的数据
   * @param {boolean} merge - 是否合并而非覆盖
   * @returns {Object} 导入结果
   */
  importData(data, merge = true) {
    try {
      if (merge) {
        // 合并数据
        const newFollowing = [...new Set([...this.data.following, ...data.following])];
        const newFollowers = [...new Set([...this.data.followers, ...data.followers])];
        this.data.following = newFollowing;
        this.data.followers = newFollowers;
      } else {
        // 覆盖数据
        this.data.following = data.following || [];
        this.data.followers = data.followers || [];
      }
      
      this.saveData();
      
      return {
        success: true,
        followingCount: this.data.following.length,
        followersCount: this.data.followers.length
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * 清除所有数据
   */
  clearAll() {
    this.data = { following: [], followers: [], followingCount: 0, followersCount: 0 };
    localStorage.removeItem(this.storageKey);
    localStorage.removeItem(this.cacheKey);
    this._emit('dataCleared', { timestamp: Date.now() });
  }

  /**
   * 订阅事件
   * @param {string} event - 事件名称
   * @param {Function} callback - 回调函数
   * @returns {Function} 取消订阅函数
   */
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    
    // 返回取消订阅函数
    return () => {
      this.listeners.get(event)?.delete(callback);
    };
  }

  /**
   * 触发事件
   * @private
   * @param {string} event - 事件名称
   * @param {*} data - 事件数据
   */
  _emit(event, data) {
    this.listeners.get(event)?.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error('[FollowSystem] 事件处理错误:', error);
      }
    });
  }

  /**
   * 更新目标用户的粉丝列表（内部方法）
   * @private
   * @param {string} creatorAddress - 创作者地址
   * @param {string} followerAddress - 关注者地址
   * @param {boolean} isAdding - 是添加还是移除
   */
  _updateFollowerList(creatorAddress, followerAddress, isAdding) {
    try {
      const key = `echo_follows_${creatorAddress}`;
      const data = JSON.parse(localStorage.getItem(key) || '{"following":[],"followers":[]}');

      if (isAdding) {
        if (!data.followers.includes(followerAddress)) {
          data.followers.push(followerAddress);
          // 记录关注时间
          this._setCache(`time_${followerAddress}`, Date.now());
        }
      } else {
        const index = data.followers.indexOf(followerAddress);
        if (index > -1) {
          data.followers.splice(index, 1);
        }
      }

      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error('[FollowSystem] 更新粉丝列表失败:', error);
    }
  }

  /**
   * 获取创作者的完整数据
   * @private
   * @param {string} creatorAddress - 创作者地址
   * @returns {Object|null} 创作者数据
   */
  _getCreatorData(creatorAddress) {
    try {
      const key = `echo_follows_${creatorAddress.toLowerCase()}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  /**
   * 保存创作者详细信息
   * @private
   * @param {string} creatorAddress - 创作者地址
   * @param {Object} info - 创作者信息
   */
  _saveCreatorInfo(creatorAddress, info) {
    if (!info || Object.keys(info).length === 0) return;
    
    const key = `echo_creator_info_${creatorAddress.toLowerCase()}`;
    const existing = this._getStoredCreatorInfo(creatorAddress) || {};
    
    const mergedInfo = {
      ...existing,
      ...info,
      updatedAt: new Date().toISOString()
    };
    
    localStorage.setItem(key, JSON.stringify(mergedInfo));
    this._setCache(`creator_${creatorAddress.toLowerCase()}`, mergedInfo);
  }

  /**
   * 获取存储的创作者信息
   * @private
   * @param {string} creatorAddress - 创作者地址
   * @returns {Object|null} 创作者信息
   */
  _getStoredCreatorInfo(creatorAddress) {
    try {
      const key = `echo_creator_info_${creatorAddress.toLowerCase()}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  /**
   * 链上关注（内部方法）
   * @private
   * @param {string} creatorAddress - 创作者地址
   */
  async _followOnChain(creatorAddress) {
    // TODO: 实现链上关注逻辑
    // 需要调用智能合约的 follow 方法
    console.log('[FollowSystem] 链上关注:', creatorAddress);
  }

  /**
   * 链上取消关注（内部方法）
   * @private
   * @param {string} creatorAddress - 创作者地址
   */
  async _unfollowOnChain(creatorAddress) {
    // TODO: 实现链上取消关注逻辑
    // 需要调用智能合约的 unfollow 方法
    console.log('[FollowSystem] 链上取消关注:', creatorAddress);
  }

  /**
   * 获取指定创作者的粉丝数（静态方法）
   * @static
   * @param {string} creatorAddress - 创作者地址
   * @returns {number} 粉丝数
   */
  static getCreatorFollowersCount(creatorAddress) {
    if (!creatorAddress) return 0;
    
    try {
      const key = `echo_follows_${creatorAddress.toLowerCase()}`;
      const data = JSON.parse(localStorage.getItem(key) || '{"following":[],"followers":[]}');
      return data.followers?.length || 0;
    } catch {
      return 0;
    }
  }

  /**
   * 获取指定创作者的关注数（静态方法）
   * @static
   * @param {string} creatorAddress - 创作者地址
   * @returns {number} 关注数
   */
  static getCreatorFollowingCount(creatorAddress) {
    if (!creatorAddress) return 0;
    
    try {
      const key = `echo_follows_${creatorAddress.toLowerCase()}`;
      const data = JSON.parse(localStorage.getItem(key) || '{"following":[],"followers":[]}');
      return data.following?.length || 0;
    } catch {
      return 0;
    }
  }
}

/**
 * 关注按钮组件
 * 可复用的关注/取消关注按钮
 */
class FollowButton {
  /**
   * @param {HTMLElement} container - 容器元素
   * @param {Object} options - 配置选项
   */
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      creatorAddress: null,
      creatorInfo: {},
      followSystem: null,
      onFollow: null,
      onUnfollow: null,
      size: 'medium', // small, medium, large
      style: 'default', // default, outline, ghost
      showCount: true,
      ...options
    };
    
    this.isFollowing = false;
    this.followersCount = 0;
    
    this.init();
  }

  /**
   * 初始化按钮
   */
  init() {
    this.render();
    this.bindEvents();
    this.updateState();
  }

  /**
   * 渲染按钮
   */
  render() {
    const { size, style, showCount } = this.options;
    
    const sizeClasses = {
      small: 'follow-btn-small',
      medium: 'follow-btn-medium',
      large: 'follow-btn-large'
    };
    
    const styleClasses = {
      default: 'follow-btn-default',
      outline: 'follow-btn-outline',
      ghost: 'follow-btn-ghost'
    };
    
    this.container.innerHTML = `
      <button class="follow-btn ${sizeClasses[size]} ${styleClasses[style]}" 
              data-address="${this.options.creatorAddress}">
        <span class="follow-btn-icon">
          <svg class="icon-follow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 5v14M5 12h14"/>
          </svg>
          <svg class="icon-check" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 6L9 17l-5-5"/>
          </svg>
        </span>
        <span class="follow-btn-text">
          <span class="text-follow">关注</span>
          <span class="text-following">已关注</span>
          <span class="text-unfollow">取消关注</span>
        </span>
        ${showCount ? `<span class="follow-btn-count">0</span>` : ''}
      </button>
    `;
    
    this.button = this.container.querySelector('.follow-btn');
    this.countEl = this.container.querySelector('.follow-btn-count');
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    this.button.addEventListener('click', (e) => {
      e.preventDefault();
      this.toggleFollow();
    });
    
    // 鼠标悬停效果
    this.button.addEventListener('mouseenter', () => {
      if (this.isFollowing) {
        this.button.classList.add('hover-unfollow');
      }
    });
    
    this.button.addEventListener('mouseleave', () => {
      this.button.classList.remove('hover-unfollow');
    });
  }

  /**
   * 更新按钮状态
   */
  async updateState() {
    const { followSystem, creatorAddress } = this.options;
    
    if (!followSystem || !creatorAddress) return;
    
    // 获取关注状态
    this.isFollowing = followSystem.isFollowing(creatorAddress);
    
    // 获取粉丝数
    this.followersCount = FollowSystem.getCreatorFollowersCount(creatorAddress);
    
    // 更新UI
    this.button.classList.toggle('is-following', this.isFollowing);
    
    if (this.countEl) {
      this.countEl.textContent = this.formatCount(this.followersCount);
    }
  }

  /**
   * 切换关注状态
   */
  async toggleFollow() {
    const { followSystem, creatorAddress, creatorInfo } = this.options;
    
    if (!followSystem) {
      alert('请先连接钱包');
      return;
    }
    
    this.button.disabled = true;
    this.button.classList.add('loading');
    
    try {
      let result;
      
      if (this.isFollowing) {
        result = await followSystem.unfollow(creatorAddress);
        if (result.success) {
          this.followersCount--;
          this.options.onUnfollow?.(creatorAddress);
        }
      } else {
        result = await followSystem.follow(creatorAddress, creatorInfo);
        if (result.success) {
          this.followersCount++;
          this.options.onFollow?.(creatorAddress);
        }
      }
      
      if (!result.success) {
        alert(result.error);
      }
      
      await this.updateState();
    } catch (error) {
      console.error('[FollowButton] 操作失败:', error);
    } finally {
      this.button.disabled = false;
      this.button.classList.remove('loading');
    }
  }

  /**
   * 格式化数字
   * @param {number} num - 数字
   * @returns {string} 格式化后的字符串
   */
  formatCount(num) {
    if (num >= 10000) {
      return (num / 10000).toFixed(1) + 'w';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'k';
    }
    return num.toString();
  }

  /**
   * 销毁按钮
   */
  destroy() {
    this.container.innerHTML = '';
  }
}

/**
 * 关注列表组件
 * 显示关注/粉丝列表
 */
class FollowList {
  /**
   * @param {HTMLElement} container - 容器元素
   * @param {Object} options - 配置选项
   */
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      type: 'following', // following, followers
      followSystem: null,
      emptyText: '暂无数据',
      onItemClick: null,
      ...options
    };
    
    this.page = 1;
    this.loading = false;
    this.hasMore = true;
    
    this.init();
  }

  /**
   * 初始化列表
   */
  init() {
    this.render();
    this.bindEvents();
    this.loadData();
  }

  /**
   * 渲染列表容器
   */
  render() {
    this.container.innerHTML = `
      <div class="follow-list">
        <div class="follow-list-items"></div>
        <div class="follow-list-empty" style="display: none;">
          <div class="empty-icon">👤</div>
          <p>${this.options.emptyText}</p>
        </div>
        <div class="follow-list-loading" style="display: none;">
          <div class="loading-spinner"></div>
          <p>加载中...</p>
        </div>
        <div class="follow-list-more" style="display: none;">
          <button class="load-more-btn">加载更多</button>
        </div>
      </div>
    `;
    
    this.itemsContainer = this.container.querySelector('.follow-list-items');
    this.emptyEl = this.container.querySelector('.follow-list-empty');
    this.loadingEl = this.container.querySelector('.follow-list-loading');
    this.moreEl = this.container.querySelector('.follow-list-more');
    this.loadMoreBtn = this.container.querySelector('.load-more-btn');
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 加载更多
    this.loadMoreBtn?.addEventListener('click', () => {
      this.loadMore();
    });
    
    // 点击列表项
    this.itemsContainer.addEventListener('click', (e) => {
      const item = e.target.closest('.follow-list-item');
      if (item && this.options.onItemClick) {
        const address = item.dataset.address;
        this.options.onItemClick(address);
      }
    });
  }

  /**
   * 加载数据
   */
  async loadData() {
    if (this.loading || !this.options.followSystem) return;
    
    this.loading = true;
    this.showLoading();
    
    try {
      const { type, followSystem } = this.options;
      let result;
      
      if (type === 'following') {
        result = followSystem.getFollowingList({ page: this.page });
      } else {
        result = followSystem.getFollowersList({ page: this.page });
      }
      
      this.hasMore = result.pagination.hasMore;
      
      // 获取详细信息
      const itemsWithInfo = followSystem.getCreatorsInfo(result.list);
      
      this.renderItems(itemsWithInfo, this.page === 1);
      
      this.toggleEmpty(result.list.length === 0 && this.page === 1);
      this.toggleMore(this.hasMore);
    } catch (error) {
      console.error('[FollowList] 加载失败:', error);
    } finally {
      this.loading = false;
      this.hideLoading();
    }
  }

  /**
   * 渲染列表项
   * @param {Object[]} items - 列表项数据
   * @param {boolean} clear - 是否清空现有内容
   */
  renderItems(items, clear = true) {
    if (clear) {
      this.itemsContainer.innerHTML = '';
    }
    
    const html = items.map(item => `
      <div class="follow-list-item" data-address="${item.address}">
        <div class="item-avatar">
          ${item.avatar ? `<img src="${item.avatar}" alt="">` : item.name?.[0] || '?'}
        </div>
        <div class="item-info">
          <div class="item-name">${item.name || this.formatAddress(item.address)}</div>
          <div class="item-bio">${item.bio || '暂无简介'}</div>
        </div>
        <div class="item-actions">
          <span class="item-time">${item.followTime || ''}</span>
        </div>
      </div>
    `).join('');
    
    this.itemsContainer.insertAdjacentHTML('beforeend', html);
  }

  /**
   * 加载更多
   */
  async loadMore() {
    if (!this.hasMore) return;
    
    this.page++;
    await this.loadData();
  }

  /**
   * 刷新列表
   */
  async refresh() {
    this.page = 1;
    this.hasMore = true;
    await this.loadData();
  }

  /**
   * 显示/隐藏空状态
   * @param {boolean} show - 是否显示
   */
  toggleEmpty(show) {
    this.emptyEl.style.display = show ? 'flex' : 'none';
  }

  /**
   * 显示/隐藏加载更多
   * @param {boolean} show - 是否显示
   */
  toggleMore(show) {
    this.moreEl.style.display = show ? 'block' : 'none';
  }

  /**
   * 显示加载中
   */
  showLoading() {
    if (this.page === 1) {
      this.itemsContainer.style.display = 'none';
      this.loadingEl.style.display = 'flex';
    } else {
      this.loadMoreBtn.disabled = true;
      this.loadMoreBtn.textContent = '加载中...';
    }
  }

  /**
   * 隐藏加载中
   */
  hideLoading() {
    this.itemsContainer.style.display = 'block';
    this.loadingEl.style.display = 'none';
    this.loadMoreBtn.disabled = false;
    this.loadMoreBtn.textContent = '加载更多';
  }

  /**
   * 格式化地址
   * @param {string} address - 地址
   * @returns {string} 格式化后的地址
   */
  formatAddress(address) {
    if (!address) return '';
    return address.slice(0, 6) + '...' + address.slice(-4);
  }
}

/**
 * 通知管理器
 * 处理新作品通知
 */
class FollowNotificationManager {
  constructor(options = {}) {
    this.options = {
      checkInterval: 5 * 60 * 1000, // 5分钟检查一次
      maxNotifications: 50,
      ...options
    };
    
    this.notifications = [];
    this.intervalId = null;
    
    this.init();
  }

  /**
   * 初始化
   */
  init() {
    this.loadNotifications();
    this.startAutoCheck();
  }

  /**
   * 加载通知
   */
  loadNotifications() {
    try {
      const stored = localStorage.getItem('echo_follow_notifications');
      this.notifications = stored ? JSON.parse(stored) : [];
    } catch {
      this.notifications = [];
    }
  }

  /**
   * 保存通知
   */
  saveNotifications() {
    try {
      // 限制通知数量
      if (this.notifications.length > this.options.maxNotifications) {
        this.notifications = this.notifications.slice(-this.options.maxNotifications);
      }
      localStorage.setItem('echo_follow_notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('[FollowNotificationManager] 保存失败:', error);
    }
  }

  /**
   * 添加通知
   * @param {Object} notification - 通知对象
   */
  addNotification(notification) {
    const newNotification = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      timestamp: Date.now(),
      read: false,
      ...notification
    };
    
    this.notifications.unshift(newNotification);
    this.saveNotifications();
    
    // 触发新通知事件
    window.dispatchEvent(new CustomEvent('newFollowNotification', {
      detail: newNotification
    }));
    
    return newNotification;
  }

  /**
   * 标记已读
   * @param {string} id - 通知ID
   */
  markAsRead(id) {
    const notification = this.notifications.find(n => n.id === id);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
    }
  }

  /**
   * 标记全部已读
   */
  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.saveNotifications();
  }

  /**
   * 获取未读数量
   * @returns {number} 未读通知数
   */
  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  /**
   * 获取通知列表
   * @param {Object} options - 选项
   * @returns {Object[]} 通知列表
   */
  getNotifications(options = {}) {
    const { unreadOnly = false, limit = 20 } = options;
    
    let list = this.notifications;
    if (unreadOnly) {
      list = list.filter(n => !n.read);
    }
    
    return list.slice(0, limit);
  }

  /**
   * 检查新作品
   * @param {FollowSystem} followSystem - 关注系统实例
   */
  async checkNewWorks(followSystem) {
    // 获取关注的创作者列表
    const following = followSystem.getFollowingList({ limit: 100 });
    
    for (const creatorAddress of following.list) {
      // TODO: 调用API检查新作品
      // const newWorks = await this.fetchCreatorNewWorks(creatorAddress);
      // if (newWorks.length > 0) {
      //   this.addNotification({
      //     type: 'new_work',
      //     creatorAddress,
      //     works: newWorks
      //   });
      // }
    }
  }

  /**
   * 开始自动检查
   */
  startAutoCheck() {
    if (this.intervalId) return;
    
    this.intervalId = setInterval(() => {
      // 检查新作品
      // this.checkNewWorks(followSystem);
    }, this.options.checkInterval);
  }

  /**
   * 停止自动检查
   */
  stopAutoCheck() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

/**
 * 关注系统管理器
 * 单例模式管理关注系统实例
 */
class FollowSystemManager {
  constructor() {
    this.instance = null;
    this.notificationManager = null;
  }

  /**
   * 获取或创建关注系统实例
   * @param {string} userAddress - 用户地址
   * @param {Object} options - 配置选项
   * @returns {FollowSystem} 关注系统实例
   */
  getInstance(userAddress, options = {}) {
    if (!this.instance || this.instance.userAddress !== userAddress?.toLowerCase()) {
      this.instance = new FollowSystem(userAddress, options);
      this.notificationManager = new FollowNotificationManager();
    }
    return this.instance;
  }

  /**
   * 获取通知管理器
   * @returns {FollowNotificationManager} 通知管理器实例
   */
  getNotificationManager() {
    if (!this.notificationManager) {
      this.notificationManager = new FollowNotificationManager();
    }
    return this.notificationManager;
  }

  /**
   * 清除当前实例
   */
  clear() {
    this.instance = null;
    this.notificationManager = null;
  }
}

// 创建全局管理器
const followSystemManager = new FollowSystemManager();

// 导出到全局作用域
window.FollowSystem = FollowSystem;
window.FollowButton = FollowButton;
window.FollowList = FollowList;
window.FollowNotificationManager = FollowNotificationManager;
window.FollowSystemManager = FollowSystemManager;
window.followSystemManager = followSystemManager;

// 默认导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    FollowSystem,
    FollowButton,
    FollowList,
    FollowNotificationManager,
    FollowSystemManager,
    followSystemManager
  };
}
