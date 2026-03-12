/**
 * ECHO Music Comment System
 * 音乐评论系统 - 支持IPFS存储和合约哈希记录
 * 
 * 功能:
 * 1. 评论数据存储到 IPFS
 * 2. 评论哈希存到合约（可选）
 * 3. 评论列表展示
 * 4. 发表评论
 * 5. 评论点赞
 */

// ============================================
// 配置
// ============================================

const COMMENT_CONFIG = {
  // IPFS 配置
  ipfs: {
    // 公共IPFS网关
    gateway: 'https://ipfs.io/ipfs/',
    // Pinata API (推荐用于生产环境)
    pinataApiKey: '',
    pinataSecretKey: '',
    // Web3.Storage Token (备选)
    web3StorageToken: '',
    // 本地IPFS节点 (开发环境)
    localNode: 'http://localhost:5001'
  },
  
  // 合约配置
  contract: {
    // 评论注册合约地址 (可选)
    address: '',
    // 是否启用合约存储
    enabled: false
  },
  
  // 本地存储配置 (作为IPFS的缓存/备用)
  storage: {
    prefix: 'echo_comment_',
    maxCacheAge: 7 * 24 * 60 * 60 * 1000 // 7天
  }
};

// ============================================
// 评论数据结构
// ============================================

/**
 * 评论对象结构
 * @typedef {Object} Comment
 * @property {string} id - UUID
 * @property {number} tokenId - NFT Token ID
 * @property {string} author - 作者地址 (0x...)
 * @property {string} text - 评论内容
 * @property {number} timestamp - 时间戳 (秒)
 * @property {number} likes - 点赞数
 * @property {string|null} parentId - 父评论ID (回复功能)
 * @property {string} ipfsHash - IPFS哈希
 * @property {string} contentHash - 内容哈希 (keccak256)
 */

// ============================================
// IPFS 工具类
// ============================================

class IPFSStorage {
  constructor(config = {}) {
    this.gateway = config.gateway || COMMENT_CONFIG.ipfs.gateway;
    this.pinataApiKey = config.pinataApiKey || COMMENT_CONFIG.ipfs.pinataApiKey;
    this.pinataSecretKey = config.pinataSecretKey || COMMENT_CONFIG.ipfs.pinataSecretKey;
    this.web3StorageToken = config.web3StorageToken || COMMENT_CONFIG.ipfs.web3StorageToken;
  }

  /**
   * 上传数据到 IPFS
   * @param {Object} data - 要上传的数据
   * @returns {Promise<string>} IPFS Hash
   */
  async upload(data) {
    const jsonData = JSON.stringify(data);
    
    // 优先使用 Pinata
    if (this.pinataApiKey && this.pinataSecretKey) {
      return await this.uploadToPinata(jsonData);
    }
    
    // 备选: Web3.Storage
    if (this.web3StorageToken) {
      return await this.uploadToWeb3Storage(jsonData);
    }
    
    // 开发环境: 模拟IPFS (使用 localStorage 作为临时存储)
    return await this.mockUpload(data);
  }

  /**
   * 上传到 Pinata
   */
  async uploadToPinata(jsonData) {
    const url = 'https://api.pinata.cloud/pinning/pinJSONToIPFS';
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'pinata_api_key': this.pinataApiKey,
        'pinata_secret_api_key': this.pinataSecretKey
      },
      body: JSON.stringify({
        pinataContent: JSON.parse(jsonData),
        pinataMetadata: {
          name: `ECHO-Comment-${Date.now()}`
        }
      })
    });
    
    if (!response.ok) {
      throw new Error(`Pinata upload failed: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.IpfsHash;
  }

  /**
   * 上传到 Web3.Storage
   */
  async uploadToWeb3Storage(jsonData) {
    const blob = new Blob([jsonData], { type: 'application/json' });
    const formData = new FormData();
    formData.append('file', blob, `comment-${Date.now()}.json`);
    
    const response = await fetch('https://api.web3.storage/upload', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.web3StorageToken}`
      },
      body: formData
    });
    
    if (!response.ok) {
      throw new Error(`Web3.Storage upload failed: ${response.statusText}`);
    }
    
    const result = await response.json();
    return result.cid;
  }

  /**
   * 开发环境: 模拟IPFS上传 (使用 localStorage)
   */
  async mockUpload(data) {
    // 生成模拟IPFS哈希 (使用哈希函数)
    const hash = this.generateMockHash(data);
    
    // 存储到 localStorage
    const storageKey = `ipfs_mock_${hash}`;
    localStorage.setItem(storageKey, JSON.stringify({
      data: data,
      timestamp: Date.now()
    }));
    
    console.log('[Mock IPFS] Uploaded to:', hash);
    return hash;
  }

  /**
   * 从 IPFS 获取数据
   * @param {string} hash - IPFS Hash
   * @returns {Promise<Object>}
   */
  async fetch(hash) {
    // 首先检查 localStorage (模拟缓存)
    const mockKey = `ipfs_mock_${hash}`;
    const mockData = localStorage.getItem(mockKey);
    if (mockData) {
      return JSON.parse(mockData).data;
    }
    
    // 从公共网关获取
    try {
      const url = `${this.gateway}${hash}`;
      const response = await fetch(url);
      if (response.ok) {
        return await response.json();
      }
    } catch (e) {
      console.warn('Failed to fetch from IPFS gateway:', e);
    }
    
    throw new Error(`Failed to fetch IPFS data: ${hash}`);
  }

  /**
   * 生成模拟哈希
   */
  generateMockHash(data) {
    const str = JSON.stringify(data) + Date.now();
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return 'Qm' + Math.abs(hash).toString(16).padStart(44, '0');
  }

  /**
   * 生成内容哈希 (keccak256)
   */
  static generateContentHash(text) {
    if (typeof ethers !== 'undefined') {
      return ethers.keccak256(ethers.toUtf8Bytes(text));
    }
    // Fallback: 简单的哈希
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return '0x' + Math.abs(hash).toString(16).padStart(64, '0');
  }
}

// ============================================
// 评论注册合约接口 (可选)
// ============================================

const COMMENT_REGISTRY_ABI = [
  // 存储评论哈希
  "function storeCommentHash(uint256 tokenId, bytes32 contentHash, string memory ipfsHash)",
  // 点赞评论
  "function likeComment(bytes32 contentHash)",
  // 获取评论IPFS哈希
  "function getCommentHash(uint256 tokenId, bytes32 contentHash) view returns (string memory)",
  // 获取点赞数
  "function getLikeCount(bytes32 contentHash) view returns (uint256)",
  // 获取Token的所有评论哈希
  "function getTokenComments(uint256 tokenId) view returns (bytes32[] memory)",
  
  // 事件
  "event CommentStored(uint256 indexed tokenId, bytes32 indexed contentHash, string ipfsHash, address indexed author)",
  "event CommentLiked(bytes32 indexed contentHash, address indexed user, uint256 likeCount)"
];

class CommentRegistry {
  constructor(contractAddress, signer) {
    if (contractAddress && signer && typeof ethers !== 'undefined') {
      this.contract = new ethers.Contract(contractAddress, COMMENT_REGISTRY_ABI, signer);
    } else {
      this.contract = null;
    }
    this.enabled = !!this.contract;
  }

  /**
   * 存储评论哈希到合约
   */
  async storeComment(tokenId, contentHash, ipfsHash) {
    if (!this.enabled) {
      console.log('[CommentRegistry] Contract not enabled, skipping store');
      return null;
    }
    
    const tx = await this.contract.storeCommentHash(tokenId, contentHash, ipfsHash);
    return await tx.wait();
  }

  /**
   * 点赞评论
   */
  async likeComment(contentHash) {
    if (!this.enabled) return null;
    
    const tx = await this.contract.likeComment(contentHash);
    return await tx.wait();
  }

  /**
   * 获取评论IPFS哈希
   */
  async getCommentHash(tokenId, contentHash) {
    if (!this.enabled) return null;
    
    return await this.contract.getCommentHash(tokenId, contentHash);
  }

  /**
   * 获取点赞数
   */
  async getLikeCount(contentHash) {
    if (!this.enabled) return 0;
    
    return await this.contract.getLikeCount(contentHash);
  }

  /**
   * 获取Token的所有评论
   */
  async getTokenComments(tokenId) {
    if (!this.enabled) return [];
    
    return await this.contract.getTokenComments(tokenId);
  }
}

// ============================================
// 主要评论系统类
// ============================================

class CommentSystem {
  /**
   * @param {Object} options - 配置选项
   * @param {string} options.ipfsGateway - IPFS网关URL
   * @param {string} options.pinataApiKey - Pinata API Key
   * @param {string} options.pinataSecretKey - Pinata Secret Key
   * @param {string} options.web3StorageToken - Web3.Storage Token
   * @param {string} options.contractAddress - 评论注册合约地址
   * @param {Object} options.signer - Ethers signer (用于合约交互)
   * @param {string} options.userAddress - 当前用户地址
   */
  constructor(options = {}) {
    // IPFS 存储
    this.ipfs = new IPFSStorage({
      gateway: options.ipfsGateway,
      pinataApiKey: options.pinataApiKey,
      pinataSecretKey: options.pinataSecretKey,
      web3StorageToken: options.web3StorageToken
    });
    
    // 合约注册 (可选)
    this.registry = new CommentRegistry(options.contractAddress, options.signer);
    
    // 用户地址
    this.userAddress = options.userAddress || '';
    
    // 本地存储键前缀
    this.storagePrefix = COMMENT_CONFIG.storage.prefix;
    
    // 内存缓存
    this.cache = new Map();
  }

  /**
   * 设置当前用户
   */
  setUser(address) {
    this.userAddress = address;
  }

  /**
   * 生成 UUID
   */
  generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  /**
   * 生成内容哈希
   */
  generateContentHash(text, author, timestamp) {
    const content = `${text}:${author}:${timestamp}`;
    return IPFSStorage.generateContentHash(content);
  }

  // ============================================
  // 核心 API
  // ============================================

  /**
   * 加载评论
   * @param {number} tokenId - NFT Token ID
   * @returns {Promise<Comment[]>} 评论列表
   */
  async loadComments(tokenId) {
    // 1. 首先尝试从内存缓存获取
    const cacheKey = `comments_${tokenId}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // 2. 从本地存储获取
    const localComments = this.loadFromLocal(tokenId);
    
    // 3. 如果启用了合约,从合约获取评论哈希列表
    if (this.registry.enabled) {
      try {
        const onChainHashes = await this.registry.getTokenComments(tokenId);
        
        // 从IPFS获取每条评论
        const onChainComments = await Promise.all(
          onChainHashes.map(async (hash) => {
            try {
              const ipfsHash = await this.registry.getCommentHash(tokenId, hash);
              return await this.ipfs.fetch(ipfsHash);
            } catch (e) {
              console.warn('Failed to fetch comment from IPFS:', e);
              return null;
            }
          })
        );
        
        // 合并本地和链上评论
        const allComments = [
          ...localComments,
          ...onChainComments.filter(c => c !== null)
        ];
        
        // 去重 (根据 contentHash)
        const uniqueComments = this.deduplicateComments(allComments);
        
        // 缓存并返回
        this.cache.set(cacheKey, uniqueComments);
        return uniqueComments;
        
      } catch (e) {
        console.warn('Failed to load from contract:', e);
      }
    }
    
    // 4. 仅使用本地存储的评论
    this.cache.set(cacheKey, localComments);
    return localComments;
  }

  /**
   * 发表评论
   * @param {number} tokenId - NFT Token ID
   * @param {string} text - 评论内容
   * @param {string|null} parentId - 父评论ID (回复功能)
   * @returns {Promise<Comment>} 创建的评论
   */
  async postComment(tokenId, text, parentId = null) {
    if (!this.userAddress) {
      throw new Error('User not authenticated. Please connect wallet first.');
    }
    
    if (!text || text.trim().length === 0) {
      throw new Error('Comment text cannot be empty');
    }
    
    const timestamp = Math.floor(Date.now() / 1000);
    const contentHash = this.generateContentHash(text, this.userAddress, timestamp);
    
    // 构建评论对象
    const comment = {
      id: this.generateUUID(),
      tokenId: tokenId,
      author: this.userAddress,
      text: text.trim(),
      timestamp: timestamp,
      likes: 0,
      parentId: parentId,
      contentHash: contentHash,
      ipfsHash: '' // 将在上传后填充
    };
    
    // 1. 上传到 IPFS
    try {
      const ipfsHash = await this.ipfs.upload(comment);
      comment.ipfsHash = ipfsHash;
    } catch (e) {
      console.error('Failed to upload to IPFS:', e);
      throw new Error('Failed to store comment to IPFS');
    }
    
    // 2. 存储评论哈希到合约 (可选)
    if (this.registry.enabled) {
      try {
        await this.registry.storeComment(tokenId, contentHash, comment.ipfsHash);
      } catch (e) {
        console.warn('Failed to store to contract:', e);
        // 继续执行,不阻塞
      }
    }
    
    // 3. 保存到本地存储
    this.saveToLocal(tokenId, comment);
    
    // 4. 更新缓存
    const cacheKey = `comments_${tokenId}`;
    const cached = this.cache.get(cacheKey) || [];
    cached.push(comment);
    this.cache.set(cacheKey, cached);
    
    return comment;
  }

  /**
   * 点赞评论
   * @param {string} commentId - 评论ID
   * @param {number} tokenId - Token ID (用于查找评论)
   * @returns {Promise<boolean>} 是否成功
   */
  async likeComment(commentId, tokenId) {
    if (!this.userAddress) {
      throw new Error('User not authenticated');
    }
    
    // 1. 从缓存或本地存储获取评论
    let comment = await this.findComment(tokenId, commentId);
    if (!comment) {
      throw new Error('Comment not found');
    }
    
    // 2. 检查用户是否已点赞 (防重复)
    const likeKey = `${this.storagePrefix}like_${commentId}_${this.userAddress}`;
    const hasLiked = localStorage.getItem(likeKey);
    if (hasLiked) {
      throw new Error('You have already liked this comment');
    }
    
    // 3. 更新点赞数
    comment.likes = (comment.likes || 0) + 1;
    
    // 4. 记录用户已点赞
    localStorage.setItem(likeKey, 'true');
    
    // 5. 如果启用合约,更新链上点赞
    if (this.registry.enabled && comment.contentHash) {
      try {
        await this.registry.likeComment(comment.contentHash);
        // 从合约获取最新的点赞数
        const onChainLikes = await this.registry.getLikeCount(comment.contentHash);
        comment.likes = Number(onChainLikes);
      } catch (e) {
        console.warn('Failed to update on-chain likes:', e);
      }
    }
    
    // 6. 更新本地存储
    this.updateLocalComment(tokenId, comment);
    
    // 7. 更新缓存
    this.updateCacheComment(tokenId, comment);
    
    return true;
  }

  /**
   * 取消点赞
   * @param {string} commentId - 评论ID
   * @param {number} tokenId - Token ID
   */
  async unlikeComment(commentId, tokenId) {
    const likeKey = `${this.storagePrefix}like_${commentId}_${this.userAddress}`;
    const hasLiked = localStorage.getItem(likeKey);
    
    if (!hasLiked) {
      throw new Error('You have not liked this comment');
    }
    
    let comment = await this.findComment(tokenId, commentId);
    if (comment && comment.likes > 0) {
      comment.likes--;
      this.updateLocalComment(tokenId, comment);
      this.updateCacheComment(tokenId, comment);
    }
    
    localStorage.removeItem(likeKey);
    return true;
  }

  /**
   * 检查用户是否已点赞
   */
  hasLiked(commentId) {
    if (!this.userAddress) return false;
    const likeKey = `${this.storagePrefix}like_${commentId}_${this.userAddress}`;
    return !!localStorage.getItem(likeKey);
  }

  // ============================================
  // 回复功能
  // ============================================

  /**
   * 回复评论
   * @param {number} tokenId - Token ID
   * @param {string} parentId - 父评论ID
   * @param {string} text - 回复内容
   */
  async replyToComment(tokenId, parentId, text) {
    return await this.postComment(tokenId, text, parentId);
  }

  /**
   * 获取评论的回复列表
   * @param {number} tokenId - Token ID
   * @param {string} parentId - 父评论ID
   */
  async getReplies(tokenId, parentId) {
    const comments = await this.loadComments(tokenId);
    return comments.filter(c => c.parentId === parentId);
  }

  // ============================================
  // 本地存储管理
  // ============================================

  /**
   * 从本地存储加载评论
   */
  loadFromLocal(tokenId) {
    try {
      const key = `${this.storagePrefix}${tokenId}`;
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      console.warn('Failed to load from localStorage:', e);
      return [];
    }
  }

  /**
   * 保存评论到本地存储
   */
  saveToLocal(tokenId, comment) {
    try {
      const key = `${this.storagePrefix}${tokenId}`;
      const existing = this.loadFromLocal(tokenId);
      existing.push(comment);
      localStorage.setItem(key, JSON.stringify(existing));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  }

  /**
   * 更新本地存储中的评论
   */
  updateLocalComment(tokenId, updatedComment) {
    try {
      const key = `${this.storagePrefix}${tokenId}`;
      const comments = this.loadFromLocal(tokenId);
      const index = comments.findIndex(c => c.id === updatedComment.id);
      if (index !== -1) {
        comments[index] = updatedComment;
        localStorage.setItem(key, JSON.stringify(comments));
      }
    } catch (e) {
      console.warn('Failed to update localStorage:', e);
    }
  }

  /**
   * 删除评论
   */
  async deleteComment(tokenId, commentId) {
    // 只有评论作者可以删除
    const comments = this.loadFromLocal(tokenId);
    const comment = comments.find(c => c.id === commentId);
    
    if (!comment) {
      throw new Error('Comment not found');
    }
    
    if (comment.author.toLowerCase() !== this.userAddress.toLowerCase()) {
      throw new Error('Only the author can delete this comment');
    }
    
    // 标记为已删除而不是真正删除
    comment.deleted = true;
    comment.text = '[已删除]';
    
    this.updateLocalComment(tokenId, comment);
    this.updateCacheComment(tokenId, comment);
    
    return true;
  }

  // ============================================
  // 缓存管理
  // ============================================

  /**
   * 查找评论
   */
  async findComment(tokenId, commentId) {
    // 先查缓存
    const cacheKey = `comments_${tokenId}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      const found = cached.find(c => c.id === commentId);
      if (found) return found;
    }
    
    // 再查本地存储
    const local = this.loadFromLocal(tokenId);
    return local.find(c => c.id === commentId);
  }

  /**
   * 更新缓存中的评论
   */
  updateCacheComment(tokenId, comment) {
    const cacheKey = `comments_${tokenId}`;
    const cached = this.cache.get(cacheKey);
    if (cached) {
      const index = cached.findIndex(c => c.id === comment.id);
      if (index !== -1) {
        cached[index] = comment;
      }
    }
  }

  /**
   * 清除缓存
   */
  clearCache(tokenId) {
    if (tokenId) {
      this.cache.delete(`comments_${tokenId}`);
    } else {
      this.cache.clear();
    }
  }

  // ============================================
  // 工具方法
  // ============================================

  /**
   * 评论去重
   */
  deduplicateComments(comments) {
    const seen = new Set();
    return comments.filter(c => {
      const key = c.contentHash || c.id;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * 格式化时间戳
   */
  static formatTimestamp(timestamp) {
    const date = new Date(timestamp * 1000);
    const now = new Date();
    const diff = now - date;
    
    // 小于1分钟
    if (diff < 60000) {
      return '刚刚';
    }
    
    // 小于1小时
    if (diff < 3600000) {
      return Math.floor(diff / 60000) + '分钟前';
    }
    
    // 小于24小时
    if (diff < 86400000) {
      return Math.floor(diff / 3600000) + '小时前';
    }
    
    // 小于7天
    if (diff < 604800000) {
      return Math.floor(diff / 86400000) + '天前';
    }
    
    // 默认显示日期
    return date.toLocaleDateString('zh-CN');
  }

  /**
   * 截断地址显示
   */
  static truncateAddress(address, length = 6) {
    if (!address || address.length < 10) return address;
    return `${address.slice(0, length)}...${address.slice(-length)}`;
  }
}

// ============================================
// UI 组件 (可选)
// ============================================

class CommentUI {
  constructor(commentSystem, containerId) {
    this.system = commentSystem;
    this.container = document.getElementById(containerId);
    this.currentTokenId = null;
    this.onSubmitCallback = null;
    this.onLikeCallback = null;
  }

  /**
   * 设置当前Token
   */
  setToken(tokenId) {
    this.currentTokenId = tokenId;
    this.render();
  }

  /**
   * 渲染评论列表
   */
  async render() {
    if (!this.container || !this.currentTokenId) return;
    
    // 加载评论
    const comments = await this.system.loadComments(this.currentTokenId);
    
    // 按时间倒序
    const sorted = comments.sort((a, b) => b.timestamp - a.timestamp);
    
    // 构建HTML
    this.container.innerHTML = `
      <div class="echo-comments-section">
        <h3>评论 (${comments.length})</h3>
        ${this.renderCommentForm()}
        <div class="echo-comments-list">
          ${sorted.map(c => this.renderComment(c)).join('')}
        </div>
      </div>
    `;
    
    // 绑定事件
    this.bindEvents();
  }

  /**
   * 渲染评论表单
   */
  renderCommentForm() {
    return `
      <div class="echo-comment-form">
        <textarea 
          class="echo-comment-input" 
          placeholder="分享你的想法..." 
          rows="3"
          maxlength="500"
        ></textarea>
        <div class="echo-comment-actions">
          <span class="echo-char-count">0/500</span>
          <button class="echo-btn-submit">发表评论</button>
        </div>
      </div>
    `;
  }

  /**
   * 渲染单条评论
   */
  renderComment(comment) {
    const isDeleted = comment.deleted;
    const timeStr = CommentSystem.formatTimestamp(comment.timestamp);
    const authorStr = CommentSystem.truncateAddress(comment.author);
    const hasLiked = this.system.hasLiked(comment.id);
    
    return `
      <div class="echo-comment ${comment.parentId ? 'echo-comment-reply' : ''}" data-id="${comment.id}">
        <div class="echo-comment-header">
          <span class="echo-comment-author">${authorStr}</span>
          <span class="echo-comment-time">${timeStr}</span>
        </div>
        <div class="echo-comment-text">${this.escapeHtml(comment.text)}</div>
        ${!isDeleted ? `
          <div class="echo-comment-footer">
            <button class="echo-btn-like ${hasLiked ? 'liked' : ''}" data-id="${comment.id}">
              ${hasLiked ? '❤️' : '🤍'} ${comment.likes || 0}
            </button>
            <button class="echo-btn-reply" data-id="${comment.id}">回复</button>
          </div>
          <div class="echo-reply-form hidden" data-parent="${comment.id}"></div>
        ` : ''}
      </div>
    `;
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 字符计数
    const textarea = this.container.querySelector('.echo-comment-input');
    const charCount = this.container.querySelector('.echo-char-count');
    if (textarea && charCount) {
      textarea.addEventListener('input', () => {
        charCount.textContent = `${textarea.value.length}/500`;
      });
    }
    
    // 提交按钮
    const submitBtn = this.container.querySelector('.echo-btn-submit');
    if (submitBtn) {
      submitBtn.addEventListener('click', async () => {
        const text = textarea.value.trim();
        if (!text) return;
        
        try {
          submitBtn.disabled = true;
          submitBtn.textContent = '发送中...';
          
          await this.system.postComment(this.currentTokenId, text);
          textarea.value = '';
          charCount.textContent = '0/500';
          
          // 重新渲染
          await this.render();
          
          if (this.onSubmitCallback) {
            this.onSubmitCallback();
          }
        } catch (e) {
          alert(e.message);
        } finally {
          submitBtn.disabled = false;
          submitBtn.textContent = '发表评论';
        }
      });
    }
    
    // 点赞按钮
    const likeBtns = this.container.querySelectorAll('.echo-btn-like');
    likeBtns.forEach(btn => {
      btn.addEventListener('click', async () => {
        const commentId = btn.dataset.id;
        try {
          await this.system.likeComment(commentId, this.currentTokenId);
          await this.render();
          
          if (this.onLikeCallback) {
            this.onLikeCallback();
          }
        } catch (e) {
          alert(e.message);
        }
      });
    });
    
    // 回复按钮
    const replyBtns = this.container.querySelectorAll('.echo-btn-reply');
    replyBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const commentId = btn.dataset.id;
        const replyForm = this.container.querySelector(`.echo-reply-form[data-parent="${commentId}"]`);
        
        if (replyForm) {
          replyForm.classList.toggle('hidden');
          if (!replyForm.innerHTML) {
            replyForm.innerHTML = `
              <textarea class="echo-reply-input" placeholder="回复评论..." rows="2"></textarea>
              <button class="echo-btn-submit-reply" data-parent="${commentId}">发送回复</button>
            `;
            
            // 绑定回复提交
            const replySubmit = replyForm.querySelector('.echo-btn-submit-reply');
            replySubmit.addEventListener('click', async () => {
              const input = replyForm.querySelector('.echo-reply-input');
              const text = input.value.trim();
              if (!text) return;
              
              try {
                await this.system.replyToComment(this.currentTokenId, commentId, text);
                await this.render();
              } catch (e) {
                alert(e.message);
              }
            });
          }
        }
      });
    });
  }

  /**
   * HTML转义
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * 设置回调
   */
  onSubmit(callback) {
    this.onSubmitCallback = callback;
  }

  onLike(callback) {
    this.onLikeCallback = callback;
  }
}

// ============================================
// CSS 样式 (可插入到页面中)
// ============================================

const COMMENT_STYLES = `
<style id="echo-comment-styles">
.echo-comments-section {
  max-width: 800px;
  margin: 20px auto;
  padding: 20px;
  background: #1a1a2e;
  border-radius: 12px;
  color: #eee;
}

.echo-comments-section h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  color: #00d4ff;
}

.echo-comment-form {
  margin-bottom: 20px;
}

.echo-comment-input,
.echo-reply-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #333;
  border-radius: 8px;
  background: #16213e;
  color: #eee;
  font-size: 14px;
  resize: vertical;
  box-sizing: border-box;
}

.echo-comment-input:focus,
.echo-reply-input:focus {
  outline: none;
  border-color: #00d4ff;
}

.echo-comment-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
}

.echo-char-count {
  font-size: 12px;
  color: #888;
}

.echo-btn-submit,
.echo-btn-submit-reply {
  padding: 8px 20px;
  background: linear-gradient(135deg, #00d4ff, #7b2cbf);
  border: none;
  border-radius: 6px;
  color: white;
  font-size: 14px;
  cursor: pointer;
  transition: opacity 0.3s;
}

.echo-btn-submit:hover,
.echo-btn-submit-reply:hover {
  opacity: 0.9;
}

.echo-btn-submit:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.echo-comments-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.echo-comment {
  padding: 15px;
  background: #0f3460;
  border-radius: 8px;
  border-left: 3px solid #00d4ff;
}

.echo-comment-reply {
  margin-left: 30px;
  border-left-color: #7b2cbf;
  background: #16213e;
}

.echo-comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
  font-size: 13px;
}

.echo-comment-author {
  color: #00d4ff;
  font-weight: 500;
}

.echo-comment-time {
  color: #888;
}

.echo-comment-text {
  font-size: 14px;
  line-height: 1.6;
  color: #ddd;
  word-break: break-word;
}

.echo-comment-footer {
  display: flex;
  gap: 15px;
  margin-top: 10px;
}

.echo-btn-like,
.echo-btn-reply {
  background: transparent;
  border: none;
  color: #888;
  font-size: 13px;
  cursor: pointer;
  transition: color 0.3s;
  padding: 4px 8px;
  border-radius: 4px;
}

.echo-btn-like:hover,
.echo-btn-reply:hover {
  color: #00d4ff;
  background: rgba(0, 212, 255, 0.1);
}

.echo-btn-like.liked {
  color: #ff4757;
}

.echo-reply-form {
  margin-top: 10px;
}

.echo-reply-form.hidden {
  display: none;
}

@media (max-width: 600px) {
  .echo-comments-section {
    padding: 15px;
  }
  
  .echo-comment-reply {
    margin-left: 15px;
  }
}
</style>
`;

/**
 * 注入样式
 */
function injectCommentStyles() {
  if (!document.getElementById('echo-comment-styles')) {
    document.head.insertAdjacentHTML('beforeend', COMMENT_STYLES);
  }
}

// ============================================
// 导出
// ============================================

if (typeof window !== 'undefined') {
  window.CommentSystem = CommentSystem;
  window.CommentUI = CommentUI;
  window.CommentRegistry = CommentRegistry;
  window.IPFSStorage = IPFSStorage;
  window.injectCommentStyles = injectCommentStyles;
  window.COMMENT_CONFIG = COMMENT_CONFIG;
}

// ES Module 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    CommentSystem,
    CommentUI,
    CommentRegistry,
    IPFSStorage,
    COMMENT_CONFIG,
    COMMENT_STYLES,
    injectCommentStyles
  };
}