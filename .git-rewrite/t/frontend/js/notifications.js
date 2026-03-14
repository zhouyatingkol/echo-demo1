/**
 * Echo Music Platform - Notification System
 * 消息通知系统
 */

// 通知类型常量
const NOTIFICATION_TYPES = {
  REVENUE: 'revenue',      // 收益到账
  NEW_FOLLOWER: 'follower', // 新粉丝
  COMMENT: 'comment',       // 评论回复
  NEW_RELEASE: 'release'    // 关注者新作品
};

/**
 * 通知系统类
 * 管理用户的各类通知，支持本地存储
 */
class NotificationSystem {
  /**
   * 构造函数
   * @param {string} userAddress - 用户钱包地址
   */
  constructor(userAddress) {
    this.userAddress = userAddress;
    this.storageKey = `echo_notifications_${userAddress}`;
    this.notifications = this.loadNotifications();
  }

  /**
   * 从 localStorage 加载通知
   * @returns {Array} 通知列表
   */
  loadNotifications() {
    const stored = localStorage.getItem(this.storageKey);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * 保存通知到 localStorage
   */
  saveNotifications() {
    localStorage.setItem(this.storageKey, JSON.stringify(this.notifications));
    this.updateBellBadge();
  }

  /**
   * 添加新通知
   * @param {string} type - 通知类型
   * @param {string} title - 通知标题
   * @param {string} message - 通知内容
   * @param {Object} data - 附加数据
   * @returns {Object} 创建的通知对象
   */
  addNotification(type, title, message, data = {}) {
    const notification = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2),
      type,
      title,
      message,
      data,
      timestamp: Date.now(),
      read: false
    };

    this.notifications.unshift(notification);

    // 最多保留 50 条
    if (this.notifications.length > 50) {
      this.notifications = this.notifications.slice(0, 50);
    }

    this.saveNotifications();

    // 显示桌面通知（如果允许）
    this.showDesktopNotification(title, message);

    return notification;
  }

  /**
   * 获取所有通知
   * @returns {Array} 通知列表
   */
  getNotifications() {
    return this.notifications;
  }

  /**
   * 获取未读通知数量
   * @returns {number} 未读数量
   */
  getUnreadCount() {
    return this.notifications.filter(n => !n.read).length;
  }

  /**
   * 标记指定通知为已读
   * @param {string} notificationId - 通知ID
   */
  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
    }
  }

  /**
   * 标记所有通知为已读
   */
  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.saveNotifications();
  }

  /**
   * 删除指定通知
   * @param {string} notificationId - 通知ID
   */
  deleteNotification(notificationId) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveNotifications();
  }

  /**
   * 清空所有通知
   */
  clearAll() {
    this.notifications = [];
    this.saveNotifications();
  }

  /**
   * 渲染通知铃铛
   * @param {string} containerId - 容器元素ID
   */
  renderBell(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`Notification bell container not found: ${containerId}`);
      return;
    }

    const unreadCount = this.getUnreadCount();

    container.innerHTML = `
      <div class="notification-bell" onclick="window.toggleNotificationPanel()">
        <svg class="bell-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
          <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
        </svg>
        ${unreadCount > 0 ? `<span class="badge">${unreadCount > 99 ? '99+' : unreadCount}</span>` : ''}
      </div>
    `;
  }

  /**
   * 更新铃铛徽章
   */
  updateBellBadge() {
    const bell = document.querySelector('.notification-bell');
    if (bell) {
      const unreadCount = this.getUnreadCount();
      const existingBadge = bell.querySelector('.badge');
      
      if (unreadCount > 0) {
        if (existingBadge) {
          existingBadge.textContent = unreadCount > 99 ? '99+' : unreadCount;
        } else {
          const badge = document.createElement('span');
          badge.className = 'badge';
          badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
          bell.appendChild(badge);
        }
      } else if (existingBadge) {
        existingBadge.remove();
      }
    }
  }

  /**
   * 渲染通知列表
   * @param {string} containerId - 容器元素ID
   */
  renderNotificationList(containerId) {
    const container = document.getElementById(containerId);
    if (!container) {
      console.warn(`Notification list container not found: ${containerId}`);
      return;
    }

    if (this.notifications.length === 0) {
      container.innerHTML = `
        <div class="notification-empty">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          <p>暂无通知</p>
        </div>
      `;
      return;
    }

    const unreadCount = this.getUnreadCount();

    container.innerHTML = `
      <div class="notification-header">
        <span class="notification-title">通知</span>
        ${unreadCount > 0 ? `
          <button class="mark-all-read" onclick="window.markAllNotificationsRead()">
            全部已读
          </button>
        ` : ''}
      </div>
      <div class="notification-list">
        ${this.notifications.map(n => this.createNotificationItemHTML(n)).join('')}
      </div>
    `;
  }

  /**
   * 创建通知项的HTML
   * @param {Object} n - 通知对象
   * @returns {string} HTML字符串
   */
  createNotificationItemHTML(n) {
    return `
      <div class="notification-item ${n.read ? 'read' : 'unread'}" 
           data-id="${n.id}" onclick="window.markNotificationRead('${n.id}')">
        <div class="notification-icon ${n.type}">${this.getIcon(n.type)}</div>
        <div class="notification-content">
          <div class="notification-title-text">${n.title}</div>
          <div class="notification-message">${n.message}</div>
          <div class="notification-time">${this.formatTime(n.timestamp)}</div>
        </div>
        ${!n.read ? '<div class="unread-dot"></div>' : ''}
      </div>
    `;
  }

  /**
   * 获取通知类型图标
   * @param {string} type - 通知类型
   * @returns {string} 图标字符
   */
  getIcon(type) {
    const icons = {
      revenue: '💰',
      follower: '👤',
      comment: '💬',
      release: '🎵'
    };
    return icons[type] || '📌';
  }

  /**
   * 格式化时间
   * @param {number} timestamp - 时间戳
   * @returns {string} 格式化后的时间字符串
   */
  formatTime(timestamp) {
    const diff = Date.now() - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return '刚刚';
    if (minutes < 60) return `${minutes}分钟前`;
    if (hours < 24) return `${hours}小时前`;
    if (days < 7) return `${days}天前`;
    
    // 超过7天显示具体日期
    const date = new Date(timestamp);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  }

  /**
   * 显示桌面通知
   * @param {string} title - 通知标题
   * @param {string} message - 通知内容
   */
  showDesktopNotification(title, message) {
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(title, { 
          body: message,
          icon: '/assets/logo.png'
        });
      } catch (e) {
        console.warn('Desktop notification failed:', e);
      }
    }
  }

  /**
   * 请求桌面通知权限
   */
  requestNotificationPermission() {
    if ('Notification' in window) {
      Notification.requestPermission().then(permission => {
        console.log('Notification permission:', permission);
      });
    }
  }

  /**
   * 检查是否有通知权限
   * @returns {boolean}
   */
  hasNotificationPermission() {
    return 'Notification' in window && Notification.permission === 'granted';
  }
}

// 全局实例引用（用于页面交互）
let notificationSystemInstance = null;

/**
 * 初始化通知系统
 * @param {string} userAddress - 用户钱包地址
 * @returns {NotificationSystem} 通知系统实例
 */
function initNotificationSystem(userAddress) {
  notificationSystemInstance = new NotificationSystem(userAddress);
  return notificationSystemInstance;
}

/**
 * 获取通知系统实例
 * @returns {NotificationSystem|null}
 */
function getNotificationSystem() {
  return notificationSystemInstance;
}

/**
 * 切换通知面板显示
 */
function toggleNotificationPanel() {
  const panel = document.getElementById('notification-panel');
  if (panel) {
    panel.classList.toggle('show');
    if (panel.classList.contains('show') && notificationSystemInstance) {
      notificationSystemInstance.renderNotificationList('notification-list-container');
    }
  }
}

/**
 * 标记通知已读
 * @param {string} notificationId - 通知ID
 */
function markNotificationRead(notificationId) {
  if (notificationSystemInstance) {
    notificationSystemInstance.markAsRead(notificationId);
    notificationSystemInstance.renderNotificationList('notification-list-container');
  }
}

/**
 * 标记所有通知已读
 */
function markAllNotificationsRead() {
  if (notificationSystemInstance) {
    notificationSystemInstance.markAllAsRead();
    notificationSystemInstance.renderNotificationList('notification-list-container');
  }
}

// 导出到全局作用域
window.NotificationSystem = NotificationSystem;
window.NOTIFICATION_TYPES = NOTIFICATION_TYPES;
window.initNotificationSystem = initNotificationSystem;
window.getNotificationSystem = getNotificationSystem;
window.toggleNotificationPanel = toggleNotificationPanel;
window.markNotificationRead = markNotificationRead;
window.markAllNotificationsRead = markAllNotificationsRead;

console.log('📬 Notification System loaded');
