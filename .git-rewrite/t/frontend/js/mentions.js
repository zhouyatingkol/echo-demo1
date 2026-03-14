/**
 * ECHO Music Platform - @Mention System
 * @提及系统 - 支持评论和输入框中的用户提及
 * 
 * 功能:
 * 1. 输入 @ 触发用户列表弹出
 * 2. 支持键盘导航（上下箭头、回车选择）
 * 3. 点击或回车插入提及
 * 4. 高亮显示已提及用户
 */

// ============================================
// 配置
// ============================================

const MENTION_CONFIG = {
  triggerChar: '@',
  minChars: 1,           // 触发提及的最少字符数
  maxResults: 10,        // 最大显示结果数
  highlightClass: 'mention-highlight',
  popupClass: 'mention-popup',
  itemClass: 'mention-item',
  selectedClass: 'mention-selected',
  storagePrefix: 'echo_mention_users_'
};

// ============================================
// 用户数据管理
// ============================================

/**
 * 用户提及数据管理器
 */
class MentionUserStore {
  constructor() {
    this.cache = new Map();
    this.currentUser = null;
  }

  /**
   * 设置当前用户
   * @param {string} address - 用户钱包地址
   */
  setCurrentUser(address) {
    this.currentUser = address;
  }

  /**
   * 从各种来源收集用户数据
   * @param {Array} sources - 用户数据来源
   */
  collectUsers(sources = []) {
    const users = new Map();
    
    // 来源1: 本地关注列表
    const following = this.getFollowingList();
    following.forEach(user => users.set(user.address, user));
    
    // 来源2: 评论中的用户
    const commentUsers = this.getUsersFromComments();
    commentUsers.forEach(user => users.set(user.address, user));
    
    // 来源3: 传入的用户列表
    sources.forEach(user => {
      if (user.address) {
        users.set(user.address, {
          address: user.address,
          name: user.name || user.username || this.formatAddress(user.address),
          avatar: user.avatar || null,
          verified: user.verified || false
        });
      }
    });

    // 保存到缓存
    this.cache = users;
    this.saveToStorage();
    
    return Array.from(users.values());
  }

  /**
   * 获取关注列表
   * @returns {Array} 关注的用户列表
   */
  getFollowingList() {
    try {
      const stored = localStorage.getItem('echo_following');
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load following list:', e);
    }
    return [];
  }

  /**
   * 从评论历史获取用户
   * @returns {Array} 用户列表
   */
  getUsersFromComments() {
    const users = [];
    try {
      // 遍历 localStorage 找评论相关的数据
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('echo_comment_')) {
          const data = localStorage.getItem(key);
          try {
            const comments = JSON.parse(data);
            if (Array.isArray(comments)) {
              comments.forEach(comment => {
                if (comment.author && comment.authorName) {
                  users.push({
                    address: comment.author,
                    name: comment.authorName,
                    avatar: comment.authorAvatar
                  });
                }
              });
            }
          } catch (e) {}
        }
      }
    } catch (e) {
      console.warn('Failed to get users from comments:', e);
    }
    return users;
  }

  /**
   * 搜索用户
   * @param {string} query - 搜索关键词
   * @returns {Array} 匹配的用户列表
   */
  searchUsers(query) {
    if (!query || query.length < MENTION_CONFIG.minChars) {
      return Array.from(this.cache.values()).slice(0, MENTION_CONFIG.maxResults);
    }

    const lowerQuery = query.toLowerCase();
    const results = [];

    for (const user of this.cache.values()) {
      const nameMatch = user.name && user.name.toLowerCase().includes(lowerQuery);
      const addressMatch = user.address && user.address.toLowerCase().includes(lowerQuery);
      
      if (nameMatch || addressMatch) {
        results.push(user);
      }
      
      if (results.length >= MENTION_CONFIG.maxResults) {
        break;
      }
    }

    return results;
  }

  /**
   * 保存到本地存储
   */
  saveToStorage() {
    try {
      const data = Array.from(this.cache.values());
      localStorage.setItem(MENTION_CONFIG.storagePrefix + 'cache', JSON.stringify(data));
    } catch (e) {
      console.warn('Failed to save mention cache:', e);
    }
  }

  /**
   * 从本地存储加载
   */
  loadFromStorage() {
    try {
      const stored = localStorage.getItem(MENTION_CONFIG.storagePrefix + 'cache');
      if (stored) {
        const users = JSON.parse(stored);
        users.forEach(user => {
          if (user.address) {
            this.cache.set(user.address, user);
          }
        });
      }
    } catch (e) {
      console.warn('Failed to load mention cache:', e);
    }
  }

  /**
   * 格式化地址显示
   * @param {string} address - 钱包地址
   * @returns {string} 格式化后的地址
   */
  formatAddress(address) {
    if (!address || address.length < 10) return address;
    return address.slice(0, 6) + '...' + address.slice(-4);
  }

  /**
   * 添加单个用户到缓存
   * @param {Object} user - 用户信息
   */
  addUser(user) {
    if (user && user.address) {
      this.cache.set(user.address, {
        address: user.address,
        name: user.name || this.formatAddress(user.address),
        avatar: user.avatar || null,
        verified: user.verified || false
      });
      this.saveToStorage();
    }
  }
}

// ============================================
// 提及功能核心类
// ============================================

/**
 * 提及系统控制器
 */
class MentionSystem {
  constructor(inputElement, options = {}) {
    this.input = inputElement;
    this.options = { ...MENTION_CONFIG, ...options };
    this.userStore = new MentionUserStore();
    this.userStore.loadFromStorage();
    
    this.popup = null;
    this.selectedIndex = -1;
    this.currentResults = [];
    this.isOpen = false;
    this.mentionStartPos = -1;
    
    this.init();
  }

  /**
   * 初始化
   */
  init() {
    if (!this.input) {
      console.error('MentionSystem: Input element not found');
      return;
    }

    // 绑定事件
    this.input.addEventListener('input', (e) => this.handleInput(e));
    this.input.addEventListener('keydown', (e) => this.handleKeydown(e));
    this.input.addEventListener('blur', () => {
      // 延迟关闭，允许点击弹出项
      setTimeout(() => this.closePopup(), 200);
    });
    
    // 点击外部关闭
    document.addEventListener('click', (e) => {
      if (this.popup && !this.popup.contains(e.target) && e.target !== this.input) {
        this.closePopup();
      }
    });

    // 加载初始用户数据
    this.userStore.collectUsers();
  }

  /**
   * 处理输入事件
   * @param {Event} e - 输入事件
   */
  handleInput(e) {
    const cursorPos = this.input.selectionStart;
    const text = this.input.value;
    
    // 查找 @ 触发符
    const beforeCursor = text.substring(0, cursorPos);
    const lastAtIndex = beforeCursor.lastIndexOf(this.options.triggerChar);
    
    if (lastAtIndex !== -1) {
      // 检查 @ 后面是否有空格（有则取消提及）
      const afterAt = beforeCursor.substring(lastAtIndex + 1);
      const hasSpace = afterAt.includes(' ');
      
      if (!hasSpace) {
        this.mentionStartPos = lastAtIndex;
        const query = afterAt.toLowerCase();
        this.searchAndShow(query);
        return;
      }
    }
    
    this.closePopup();
  }

  /**
   * 处理键盘事件
   * @param {KeyboardEvent} e - 键盘事件
   */
  handleKeydown(e) {
    if (!this.isOpen) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        this.selectNext();
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.selectPrev();
        break;
      case 'Enter':
      case 'Tab':
        if (this.selectedIndex >= 0) {
          e.preventDefault();
          this.selectCurrent();
        }
        break;
      case 'Escape':
        this.closePopup();
        break;
    }
  }

  /**
   * 搜索并显示结果
   * @param {string} query - 搜索关键词
   */
  searchAndShow(query) {
    this.currentResults = this.userStore.searchUsers(query);
    this.selectedIndex = this.currentResults.length > 0 ? 0 : -1;
    
    if (this.currentResults.length > 0) {
      this.showPopup();
    } else {
      this.closePopup();
    }
  }

  /**
   * 显示弹出层
   */
  showPopup() {
    if (!this.popup) {
      this.createPopup();
    }
    
    this.renderItems();
    this.positionPopup();
    this.isOpen = true;
  }

  /**
   * 创建弹出层元素
   */
  createPopup() {
    this.popup = document.createElement('div');
    this.popup.className = this.options.popupClass;
    this.popup.style.cssText = `
      position: absolute;
      background: rgba(26, 26, 46, 0.98);
      border: 1px solid rgba(0, 212, 255, 0.3);
      border-radius: 12px;
      max-height: 280px;
      overflow-y: auto;
      z-index: 10000;
      min-width: 280px;
      box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
      backdrop-filter: blur(10px);
    `;
    document.body.appendChild(this.popup);
  }

  /**
   * 定位弹出层
   */
  positionPopup() {
    if (!this.popup || !this.input) return;
    
    const rect = this.input.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    this.popup.style.left = rect.left + 'px';
    this.popup.style.top = (rect.bottom + scrollTop + 8) + 'px';
    this.popup.style.width = Math.max(rect.width, 280) + 'px';
  }

  /**
   * 渲染用户列表项
   */
  renderItems() {
    if (!this.popup) return;
    
    this.popup.innerHTML = this.currentResults.map((user, index) => `
      <div class="${this.options.itemClass} ${index === this.selectedIndex ? this.options.selectedClass : ''}" 
           data-index="${index}"
           style="
             padding: 12px 16px;
             cursor: pointer;
             display: flex;
             align-items: center;
             gap: 12px;
             transition: all 0.2s;
             border-bottom: 1px solid rgba(255, 255, 255, 0.05);
             ${index === this.selectedIndex ? 'background: rgba(0, 212, 255, 0.15);' : ''}
           "
           onmouseover="this.style.background='rgba(0, 212, 255, 0.1)'"
           onmouseout="this.style.background='${index === this.selectedIndex ? 'rgba(0, 212, 255, 0.15)' : 'transparent'}'"
      >
        <div style="
          width: 36px;
          height: 36px;
          border-radius: 50%;
          background: ${user.avatar ? `url(${user.avatar}) center/cover` : 'linear-gradient(135deg, #00d4ff, #7b2cbf)'};
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          color: white;
          flex-shrink: 0;
        ">
          ${!user.avatar ? user.name.charAt(0).toUpperCase() : ''}
        </div>
        <div style="flex: 1; min-width: 0;">
          <div style="
            font-weight: 500;
            color: #fff;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            display: flex;
            align-items: center;
            gap: 6px;
          ">
            ${user.name}
            ${user.verified ? '<span style="color: #00d4ff;">✓</span>' : ''}
          </div>
          <div style="
            font-size: 12px;
            color: #888;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
          ">
            ${this.formatAddress(user.address)}
          </div>
        </div>
      </div>
    `).join('');

    // 绑定点击事件
    this.popup.querySelectorAll('.' + this.options.itemClass).forEach((item, index) => {
      item.addEventListener('click', () => {
        this.selectedIndex = index;
        this.selectCurrent();
      });
    });
  }

  /**
   * 选择下一项
   */
  selectNext() {
    if (this.currentResults.length === 0) return;
    this.selectedIndex = (this.selectedIndex + 1) % this.currentResults.length;
    this.renderItems();
    this.scrollToSelected();
  }

  /**
   * 选择上一项
   */
  selectPrev() {
    if (this.currentResults.length === 0) return;
    this.selectedIndex = (this.selectedIndex - 1 + this.currentResults.length) % this.currentResults.length;
    this.renderItems();
    this.scrollToSelected();
  }

  /**
   * 滚动到选中项
   */
  scrollToSelected() {
    if (!this.popup) return;
    const selected = this.popup.querySelector('.' + this.options.selectedClass);
    if (selected) {
      selected.scrollIntoView({ block: 'nearest' });
    }
  }

  /**
   * 选择当前项
   */
  selectCurrent() {
    if (this.selectedIndex < 0 || this.selectedIndex >= this.currentResults.length) return;
    
    const user = this.currentResults[this.selectedIndex];
    this.insertMention(user);
    this.closePopup();
  }

  /**
   * 插入提及到输入框
   * @param {Object} user - 用户信息
   */
  insertMention(user) {
    const text = this.input.value;
    const cursorPos = this.input.selectionStart;
    
    // 找到 @ 的位置
    const beforeCursor = text.substring(0, cursorPos);
    const lastAtIndex = beforeCursor.lastIndexOf(this.options.triggerChar);
    
    if (lastAtIndex === -1) return;
    
    // 构建新文本
    const beforeMention = text.substring(0, lastAtIndex);
    const afterCursor = text.substring(cursorPos);
    const mentionText = `@${user.name} `;
    
    this.input.value = beforeMention + mentionText + afterCursor;
    
    // 设置光标位置
    const newCursorPos = lastAtIndex + mentionText.length;
    this.input.setSelectionRange(newCursorPos, newCursorPos);
    
    // 触发 input 事件
    this.input.dispatchEvent(new Event('input', { bubbles: true }));
  }

  /**
   * 关闭弹出层
   */
  closePopup() {
    if (this.popup) {
      this.popup.remove();
      this.popup = null;
    }
    this.isOpen = false;
    this.selectedIndex = -1;
    this.currentResults = [];
  }

  /**
   * 格式化地址
   * @param {string} address - 钱包地址
   * @returns {string} 格式化后的地址
   */
  formatAddress(address) {
    if (!address || address.length < 10) return address;
    return address.slice(0, 6) + '...' + address.slice(-4);
  }

  /**
   * 解析文本中的提及
   * @param {string} text - 文本内容
   * @returns {Array} 提及的用户列表
   */
  parseMentions(text) {
    const mentionRegex = /@([^\s@]+)/g;
    const mentions = [];
    let match;
    
    while ((match = mentionRegex.exec(text)) !== null) {
      mentions.push({
        name: match[1],
        index: match.index,
        fullMatch: match[0]
      });
    }
    
    return mentions;
  }

  /**
   * 将文本中的提及渲染为 HTML
   * @param {string} text - 原始文本
   * @returns {string} HTML 字符串
   */
  renderMentions(text) {
    return text.replace(/@([^\s@]+)/g, 
      '<span class="mention-highlight" style="color: #00d4ff; font-weight: 500;">@$1</span>'
    );
  }

  /**
   * 销毁实例
   */
  destroy() {
    this.closePopup();
    // 事件监听器会自动清理，因为元素还在
  }
}

// ============================================
// 便捷函数
// ============================================

/**
 * 为输入框启用提及功能
 * @param {HTMLElement|string} element - 输入框元素或选择器
 * @param {Object} options - 配置选项
 * @returns {MentionSystem} 提及系统实例
 */
function enableMentions(element, options = {}) {
  const el = typeof element === 'string' ? document.querySelector(element) : element;
  if (!el) {
    console.error('Enable mentions: Element not found');
    return null;
  }
  return new MentionSystem(el, options);
}

/**
 * 为多个输入框启用提及功能
 * @param {string} selector - CSS 选择器
 * @param {Object} options - 配置选项
 */
function enableMentionsForAll(selector, options = {}) {
  document.querySelectorAll(selector).forEach(el => {
    enableMentions(el, options);
  });
}

/**
 * 添加用户到提及系统
 * @param {Object|Array} users - 用户或用户数组
 */
function addMentionUsers(users) {
  const store = new MentionUserStore();
  store.loadFromStorage();
  
  if (Array.isArray(users)) {
    users.forEach(user => store.addUser(user));
  } else {
    store.addUser(users);
  }
}

// ============================================
// 导出
// ============================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { MentionSystem, MentionUserStore, enableMentions, addMentionUsers };
} else {
  window.MentionSystem = MentionSystem;
  window.MentionUserStore = MentionUserStore;
  window.enableMentions = enableMentions;
  window.enableMentionsForAll = enableMentionsForAll;
  window.addMentionUsers = addMentionUsers;
}
