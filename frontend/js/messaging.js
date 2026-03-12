/**
 * ECHO Music Platform - Private Messaging System
 * 私信系统 - 支持用户间的私密消息交流
 * 
 * 功能:
 * 1. 私信列表展示
 * 2. 一对一聊天界面
 * 3. 发送/接收消息
 * 4. 未读消息提醒
 * 5. 本地存储消息历史
 */

// ============================================
// 配置
// ============================================

const MESSAGING_CONFIG = {
  storagePrefix: 'echo_messages_',
  maxMessagesPerChat: 500,    // 每个聊天最多保留消息数
  messagePreviewLength: 50,   // 消息预览长度
  typingTimeout: 3000,        // 输入中状态超时时间
  pollingInterval: 10000,     // 轮询新消息间隔
};

// ============================================
// 消息数据结构
// ============================================

/**
 * 消息对象
 * @typedef {Object} Message
 * @property {string} id - 消息唯一ID
 * @property {string} sender - 发送者地址
 * @property {string} recipient - 接收者地址
 * @property {string} content - 消息内容
 * @property {number} timestamp - 时间戳
 * @property {boolean} read - 是否已读
 * @property {string} type - 消息类型 (text/image/system)
 */

/**
 * 会话对象
 * @typedef {Object} Conversation
 * @property {string} id - 会话ID (双方地址排序后拼接)
 * @property {string} participant1 - 参与者1地址
 * @property {string} participant2 - 参与者2地址
 * @property {string} lastMessage - 最后一条消息内容
 * @property {number} lastTimestamp - 最后消息时间
 * @property {number} unreadCount - 未读消息数
 * @property {boolean} pinned - 是否置顶
 */

// ============================================
// 私信系统核心类
// ============================================

class MessagingSystem {
  constructor(userAddress, options = {}) {
    this.userAddress = userAddress?.toLowerCase();
    this.options = { ...MESSAGING_CONFIG, ...options };
    this.conversations = new Map();
    this.currentConversationId = null;
    this.messageListeners = [];
    this.typingUsers = new Map();
    this.pollingTimer = null;
    
    this.init();
  }

  /**
   * 初始化
   */
  init() {
    this.loadConversations();
    this.startPolling();
    
    // 监听存储变化（多标签页同步）
    window.addEventListener('storage', (e) => {
      if (e.key?.startsWith(this.options.storagePrefix)) {
        this.loadConversations();
        this.notifyListeners('storageChange');
      }
    });
  }

  // ============================================
  // 存储管理
  // ============================================

  /**
   * 获取会话存储键
   * @param {string} conversationId - 会话ID
   * @returns {string} 存储键
   */
  getStorageKey(conversationId) {
    return `${this.options.storagePrefix}${conversationId}`;
  }

  /**
   * 获取会话列表存储键
   * @returns {string} 存储键
   */
  getConversationsKey() {
    return `${this.options.storagePrefix}list_${this.userAddress}`;
  }

  /**
   * 加载所有会话
   */
  loadConversations() {
    try {
      const stored = localStorage.getItem(this.getConversationsKey());
      if (stored) {
        const list = JSON.parse(stored);
        this.conversations = new Map(list.map(c => [c.id, c]));
      }
    } catch (e) {
      console.error('Failed to load conversations:', e);
      this.conversations = new Map();
    }
  }

  /**
   * 保存会话列表
   */
  saveConversations() {
    try {
      const list = Array.from(this.conversations.values());
      localStorage.setItem(this.getConversationsKey(), JSON.stringify(list));
    } catch (e) {
      console.error('Failed to save conversations:', e);
    }
  }

  /**
   * 加载会话消息
   * @param {string} conversationId - 会话ID
   * @returns {Array} 消息列表
   */
  loadMessages(conversationId) {
    try {
      const stored = localStorage.getItem(this.getStorageKey(conversationId));
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to load messages:', e);
      return [];
    }
  }

  /**
   * 保存会话消息
   * @param {string} conversationId - 会话ID
   * @param {Array} messages - 消息列表
   */
  saveMessages(conversationId, messages) {
    try {
      // 限制消息数量
      if (messages.length > this.options.maxMessagesPerChat) {
        messages = messages.slice(-this.options.maxMessagesPerChat);
      }
      localStorage.setItem(this.getStorageKey(conversationId), JSON.stringify(messages));
    } catch (e) {
      console.error('Failed to save messages:', e);
    }
  }

  // ============================================
  // 会话管理
  // ============================================

  /**
   * 生成会话ID
   * @param {string} address1 - 地址1
   * @param {string} address2 - 地址2
   * @returns {string} 会话ID
   */
  generateConversationId(address1, address2) {
    const sorted = [address1.toLowerCase(), address2.toLowerCase()].sort();
    return `${sorted[0]}_${sorted[1]}`;
  }

  /**
   * 获取或创建会话
   * @param {string} otherAddress - 对方地址
   * @returns {Object} 会话对象
   */
  getOrCreateConversation(otherAddress) {
    const normalizedAddress = otherAddress.toLowerCase();
    const conversationId = this.generateConversationId(this.userAddress, normalizedAddress);
    
    let conversation = this.conversations.get(conversationId);
    if (!conversation) {
      conversation = {
        id: conversationId,
        participant1: this.userAddress,
        participant2: normalizedAddress,
        lastMessage: '',
        lastTimestamp: 0,
        unreadCount: 0,
        pinned: false,
        createdAt: Date.now()
      };
      this.conversations.set(conversationId, conversation);
    }
    
    return conversation;
  }

  /**
   * 获取所有会话列表
   * @param {Object} options - 选项
   * @returns {Array} 会话列表
   */
  getConversations(options = {}) {
    let list = Array.from(this.conversations.values());
    
    // 过滤未读
    if (options.unreadOnly) {
      list = list.filter(c => c.unreadCount > 0);
    }
    
    // 排序：置顶 > 时间
    list.sort((a, b) => {
      if (a.pinned !== b.pinned) return b.pinned ? 1 : -1;
      return b.lastTimestamp - a.lastTimestamp;
    });
    
    return list;
  }

  /**
   * 获取对方地址
   * @param {Object} conversation - 会话对象
   * @returns {string} 对方地址
   */
  getOtherParticipant(conversation) {
    return conversation.participant1 === this.userAddress 
      ? conversation.participant2 
      : conversation.participant1;
  }

  /**
   * 删除会话
   * @param {string} conversationId - 会话ID
   */
  deleteConversation(conversationId) {
    this.conversations.delete(conversationId);
    localStorage.removeItem(this.getStorageKey(conversationId));
    this.saveConversations();
  }

  /**
   * 置顶/取消置顶会话
   * @param {string} conversationId - 会话ID
   */
  togglePin(conversationId) {
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.pinned = !conversation.pinned;
      this.saveConversations();
    }
  }

  // ============================================
  // 消息操作
  // ============================================

  /**
   * 发送消息
   * @param {string} recipient - 接收者地址
   * @param {string} content - 消息内容
   * @param {string} type - 消息类型
   * @returns {Object} 发送的消息
   */
  sendMessage(recipient, content, type = 'text') {
    if (!content.trim()) return null;
    
    const normalizedRecipient = recipient.toLowerCase();
    const conversationId = this.generateConversationId(this.userAddress, normalizedRecipient);
    
    const message = {
      id: this.generateMessageId(),
      sender: this.userAddress,
      recipient: normalizedRecipient,
      content: content.trim(),
      timestamp: Date.now(),
      read: false,
      type
    };

    // 保存消息
    const messages = this.loadMessages(conversationId);
    messages.push(message);
    this.saveMessages(conversationId, messages);

    // 更新会话
    const conversation = this.getOrCreateConversation(normalizedRecipient);
    conversation.lastMessage = content.trim();
    conversation.lastTimestamp = message.timestamp;
    this.saveConversations();

    // 模拟发送给对方（实际应用中使用WebSocket或API）
    this.simulateSendToRecipient(normalizedRecipient, message);

    this.notifyListeners('messageSent', { message, conversation });
    
    return message;
  }

  /**
   * 接收消息（模拟）
   * @param {Object} message - 消息对象
   */
  receiveMessage(message) {
    const conversationId = this.generateConversationId(
      message.sender, 
      message.recipient
    );
    
    // 检查是否当前用户的会话
    if (message.recipient.toLowerCase() !== this.userAddress) return;

    // 保存消息
    const messages = this.loadMessages(conversationId);
    
    // 避免重复
    if (!messages.find(m => m.id === message.id)) {
      messages.push(message);
      this.saveMessages(conversationId, messages);

      // 更新会话
      const conversation = this.getOrCreateConversation(message.sender);
      conversation.lastMessage = message.content;
      conversation.lastTimestamp = message.timestamp;
      
      // 如果不是当前打开的会话，增加未读数
      if (this.currentConversationId !== conversationId) {
        conversation.unreadCount++;
      }
      
      this.saveConversations();
      this.notifyListeners('messageReceived', { message, conversation });
    }
  }

  /**
   * 获取会话消息
   * @param {string} otherAddress - 对方地址
   * @returns {Array} 消息列表
   */
  getMessages(otherAddress) {
    const conversationId = this.generateConversationId(this.userAddress, otherAddress);
    return this.loadMessages(conversationId);
  }

  /**
   * 标记消息为已读
   * @param {string} conversationId - 会话ID
   */
  markAsRead(conversationId) {
    const conversation = this.conversations.get(conversationId);
    if (conversation) {
      conversation.unreadCount = 0;
      this.saveConversations();
      
      // 标记消息为已读
      const messages = this.loadMessages(conversationId);
      messages.forEach(m => {
        if (m.recipient === this.userAddress) {
          m.read = true;
        }
      });
      this.saveMessages(conversationId, messages);
      
      this.notifyListeners('messagesRead', { conversationId });
    }
  }

  /**
   * 设置当前会话
   * @param {string} conversationId - 会话ID
   */
  setCurrentConversation(conversationId) {
    this.currentConversationId = conversationId;
    if (conversationId) {
      this.markAsRead(conversationId);
    }
  }

  /**
   * 删除单条消息
   * @param {string} conversationId - 会话ID
   * @param {string} messageId - 消息ID
   */
  deleteMessage(conversationId, messageId) {
    const messages = this.loadMessages(conversationId);
    const filtered = messages.filter(m => m.id !== messageId);
    this.saveMessages(conversationId, filtered);
    
    // 更新最后消息
    const conversation = this.conversations.get(conversationId);
    if (conversation && filtered.length > 0) {
      const last = filtered[filtered.length - 1];
      conversation.lastMessage = last.content;
      conversation.lastTimestamp = last.timestamp;
      this.saveConversations();
    }
  }

  // ============================================
  // 工具方法
  // ============================================

  /**
   * 生成消息ID
   * @returns {string} 消息ID
   */
  generateMessageId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
  }

  /**
   * 格式化时间
   * @param {number} timestamp - 时间戳
   * @returns {string} 格式化时间
   */
  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    // 今天内显示时间
    if (diff < 24 * 60 * 60 * 1000 && date.getDate() === now.getDate()) {
      return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' });
    }
    
    // 昨天
    if (diff < 48 * 60 * 60 * 1000) {
      return '昨天';
    }
    
    // 本周
    if (diff < 7 * 24 * 60 * 60 * 1000) {
      return date.toLocaleDateString('zh-CN', { weekday: 'short' });
    }
    
    // 更早
    return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' });
  }

  /**
   * 格式化地址
   * @param {string} address - 地址
   * @returns {string} 格式化后的地址
   */
  formatAddress(address) {
    if (!address || address.length < 10) return address;
    return address.slice(0, 6) + '...' + address.slice(-4);
  }

  /**
   * 获取消息预览
   * @param {string} content - 消息内容
   * @returns {string} 预览文本
   */
  getMessagePreview(content) {
    if (content.length <= this.options.messagePreviewLength) return content;
    return content.substring(0, this.options.messagePreviewLength) + '...';
  }

  /**
   * 获取未读消息总数
   * @returns {number} 未读总数
   */
  getTotalUnreadCount() {
    return Array.from(this.conversations.values())
      .reduce((sum, c) => sum + c.unreadCount, 0);
  }

  // ============================================
  // 模拟网络功能
  // ============================================

  /**
   * 模拟发送给对方（实际应用中使用WebSocket/API）
   * @param {string} recipient - 接收者
   * @param {Object} message - 消息
   */
  simulateSendToRecipient(recipient, message) {
    // 在实际应用中，这里会调用API或WebSocket发送消息
    // 这里仅存储在本地，模拟发送成功
    console.log(`[Messaging] Message sent to ${recipient}:`, message);
  }

  /**
   * 开始轮询新消息
   */
  startPolling() {
    // 实际应用中使用WebSocket
    // 这里用轮询模拟
    this.pollingTimer = setInterval(() => {
      this.checkNewMessages();
    }, this.options.pollingInterval);
  }

  /**
   * 停止轮询
   */
  stopPolling() {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
      this.pollingTimer = null;
    }
  }

  /**
   * 检查新消息
   */
  checkNewMessages() {
    // 实际应用中会调用API获取新消息
    // 这里仅作为占位
  }

  // ============================================
  // 事件监听
  // ============================================

  /**
   * 添加消息监听器
   * @param {Function} callback - 回调函数
   */
  onMessage(callback) {
    this.messageListeners.push(callback);
  }

  /**
   * 移除消息监听器
   * @param {Function} callback - 回调函数
   */
  offMessage(callback) {
    this.messageListeners = this.messageListeners.filter(cb => cb !== callback);
  }

  /**
   * 通知监听器
   * @param {string} event - 事件类型
   * @param {Object} data - 数据
   */
  notifyListeners(event, data) {
    this.messageListeners.forEach(callback => {
      try {
        callback(event, data);
      } catch (e) {
        console.error('Message listener error:', e);
      }
    });
  }

  /**
   * 销毁实例
   */
  destroy() {
    this.stopPolling();
    this.messageListeners = [];
  }
}

// ============================================
// UI 渲染类
// ============================================

class MessagingUI {
  constructor(messagingSystem, containerId) {
    this.messaging = messagingSystem;
    this.container = document.getElementById(containerId);
    this.currentChat = null;
    
    if (this.container) {
      this.init();
    }
  }

  /**
   * 初始化UI
   */
  init() {
    this.renderLayout();
    this.bindEvents();
    this.renderConversationList();
    
    // 监听消息事件
    this.messaging.onMessage((event, data) => {
      if (event === 'messageReceived' || event === 'messageSent') {
        this.renderConversationList();
        if (this.currentChat) {
          this.renderChat(this.currentChat);
        }
      }
    });
  }

  /**
   * 渲染布局
   */
  renderLayout() {
    this.container.innerHTML = `
      <div class="messaging-container" style="
        display: flex;
        height: 600px;
        background: rgba(26, 26, 46, 0.8);
        border-radius: 16px;
        border: 1px solid rgba(0, 212, 255, 0.2);
        overflow: hidden;
      ">
        <!-- 会话列表 -->
        <div class="conversation-list" style="
          width: 320px;
          border-right: 1px solid rgba(0, 212, 255, 0.1);
          display: flex;
          flex-direction: column;
        ">
          <div style="
            padding: 20px;
            border-bottom: 1px solid rgba(0, 212, 255, 0.1);
          ">
            <h3 style="margin: 0; color: #fff;">私信</h3>
            <div style="margin-top: 12px; position: relative;">
              <input type="text" 
                     id="newMessageInput" 
                     placeholder="输入地址开始聊天..."
                     style="
                       width: 100%;
                       padding: 10px 12px;
                       background: rgba(255, 255, 255, 0.05);
                       border: 1px solid rgba(0, 212, 255, 0.2);
                       border-radius: 8px;
                       color: #fff;
                       font-size: 14px;
                     ">
            </div>
          </div>
          <div id="conversationList" style="flex: 1; overflow-y: auto;"></div>
        </div>
        
        <!-- 聊天区域 -->
        <div class="chat-area" style="
          flex: 1;
          display: flex;
          flex-direction: column;
        ">
          <div id="chatHeader" style="
            padding: 16px 20px;
            border-bottom: 1px solid rgba(0, 212, 255, 0.1);
            display: flex;
            align-items: center;
            gap: 12px;
          ">
            <span style="color: #888;">选择一个会话开始聊天</span>
          </div>
          <div id="chatMessages" style="
            flex: 1;
            overflow-y: auto;
            padding: 20px;
          ">
            <div style="
              height: 100%;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #888;
            ">
              选择左侧会话开始聊天
            </div>
          </div>
          <div id="chatInput" style="
            padding: 16px 20px;
            border-top: 1px solid rgba(0, 212, 255, 0.1);
            display: none;
          ">
            <div style="display: flex; gap: 12px;">
              <textarea id="messageTextarea" 
                        placeholder="输入消息..."
                        style="
                          flex: 1;
                          padding: 12px;
                          background: rgba(255, 255, 255, 0.05);
                          border: 1px solid rgba(0, 212, 255, 0.2);
                          border-radius: 12px;
                          color: #fff;
                          resize: none;
                          height: 44px;
                          font-family: inherit;
                        "></textarea>
              <button id="sendMessageBtn" style="
                padding: 0 24px;
                background: linear-gradient(135deg, #00d4ff, #7b2cbf);
                border: none;
                border-radius: 12px;
                color: #fff;
                cursor: pointer;
                font-weight: 500;
              ">发送</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * 绑定事件
   */
  bindEvents() {
    // 新建消息
    const newMessageInput = this.container.querySelector('#newMessageInput');
    newMessageInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        const address = newMessageInput.value.trim();
        if (address && address.startsWith('0x')) {
          this.openChat(address);
          newMessageInput.value = '';
        }
      }
    });

    // 发送消息
    const sendBtn = this.container.querySelector('#sendMessageBtn');
    const textarea = this.container.querySelector('#messageTextarea');
    
    sendBtn.addEventListener('click', () => this.sendCurrentMessage());
    
    textarea.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        this.sendCurrentMessage();
      }
    });
  }

  /**
   * 渲染会话列表
   */
  renderConversationList() {
    const listContainer = this.container.querySelector('#conversationList');
    const conversations = this.messaging.getConversations();
    
    if (conversations.length === 0) {
      listContainer.innerHTML = `
        <div style="
          padding: 40px 20px;
          text-align: center;
          color: #666;
        ">
          暂无会话
        </div>
      `;
      return;
    }

    listContainer.innerHTML = conversations.map(conv => {
      const otherAddress = this.messaging.getOtherParticipant(conv);
      const isActive = this.currentChat === otherAddress;
      
      return `
        <div class="conversation-item ${isActive ? 'active' : ''}" 
             data-address="${otherAddress}"
             style="
               padding: 16px 20px;
               cursor: pointer;
               border-bottom: 1px solid rgba(0, 212, 255, 0.05);
               transition: all 0.2s;
               background: ${isActive ? 'rgba(0, 212, 255, 0.1)' : 'transparent'};
             "
             onmouseover="this.style.background='${isActive ? 'rgba(0, 212, 255, 0.15)' : 'rgba(0, 212, 255, 0.05)'}'"
             onmouseout="this.style.background='${isActive ? 'rgba(0, 212, 255, 0.1)' : 'transparent'}'"
        >
          <div style="display: flex; align-items: center; gap: 12px;">
            <div style="
              width: 44px;
              height: 44px;
              border-radius: 50%;
              background: linear-gradient(135deg, #00d4ff, #7b2cbf);
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: 500;
              color: #fff;
              flex-shrink: 0;
            ">
              ${otherAddress.slice(2, 4).toUpperCase()}
            </div>
            <div style="flex: 1; min-width: 0;">
              <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 4px;
              ">
                <span style="
                  font-weight: 500;
                  color: #fff;
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                ">
                  ${this.messaging.formatAddress(otherAddress)}
                </span>
                <span style="font-size: 12px; color: #666;">
                  ${this.messaging.formatTime(conv.lastTimestamp)}
                </span>
              </div>
              <div style="
                display: flex;
                justify-content: space-between;
                align-items: center;
              ">
                <span style="
                  font-size: 14px;
                  color: #888;
                  white-space: nowrap;
                  overflow: hidden;
                  text-overflow: ellipsis;
                  flex: 1;
                ">
                  ${this.messaging.getMessagePreview(conv.lastMessage) || '暂无消息'}
                </span>
                ${conv.unreadCount > 0 ? `
                  <span style="
                    min-width: 20px;
                    height: 20px;
                    padding: 0 6px;
                    background: #ff4444;
                    border-radius: 10px;
                    font-size: 12px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-left: 8px;
                  ">
                    ${conv.unreadCount}
                  </span>
                ` : ''}
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');

    // 绑定点击事件
    listContainer.querySelectorAll('.conversation-item').forEach(item => {
      item.addEventListener('click', () => {
        const address = item.dataset.address;
        this.openChat(address);
      });
    });
  }

  /**
   * 打开聊天
   * @param {string} address - 对方地址
   */
  openChat(address) {
    this.currentChat = address;
    this.messaging.setCurrentConversation(
      this.messaging.generateConversationId(this.messaging.userAddress, address)
    );
    
    this.renderConversationList();
    this.renderChat(address);
  }

  /**
   * 渲染聊天界面
   * @param {string} address - 对方地址
   */
  renderChat(address) {
    const header = this.container.querySelector('#chatHeader');
    const messagesContainer = this.container.querySelector('#chatMessages');
    const inputArea = this.container.querySelector('#chatInput');
    
    // 更新头部
    header.innerHTML = `
      <div style="
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: linear-gradient(135deg, #00d4ff, #7b2cbf);
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: 500;
      ">
        ${address.slice(2, 4).toUpperCase()}
      </div>
      <div>
        <div style="font-weight: 500; color: #fff;">
          ${this.messaging.formatAddress(address)}
        </div>
        <div style="font-size: 12px; color: #00d4ff;">在线</div>
      </div>
    `;
    
    // 显示输入区
    inputArea.style.display = 'block';
    
    // 渲染消息
    const messages = this.messaging.getMessages(address);
    
    if (messages.length === 0) {
      messagesContainer.innerHTML = `
        <div style="
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: #888;
          gap: 12px;
        ">
          <div style="font-size: 48px;">💬</div>
          <div>开始你们的对话吧</div>
        </div>
      `;
      return;
    }
    
    messagesContainer.innerHTML = messages.map(msg => {
      const isMe = msg.sender === this.messaging.userAddress;
      
      return `
        <div style="
          display: flex;
          justify-content: ${isMe ? 'flex-end' : 'flex-start'};
          margin-bottom: 16px;
        ">
          <div style="
            max-width: 70%;
            padding: 12px 16px;
            border-radius: ${isMe ? '16px 16px 4px 16px' : '16px 16px 16px 4px'};
            background: ${isMe 
              ? 'linear-gradient(135deg, #00d4ff, #7b2cbf)' 
              : 'rgba(255, 255, 255, 0.1)'};
            color: #fff;
          ">
            <div>${this.escapeHtml(msg.content)}</div>
            <div style="
              font-size: 11px;
              opacity: 0.7;
              margin-top: 4px;
              text-align: right;
            ">
              ${this.messaging.formatTime(msg.timestamp)}
              ${isMe ? (msg.read ? ' ✓✓' : ' ✓') : ''}
            </div>
          </div>
        </div>
      `;
    }).join('');
    
    // 滚动到底部
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }

  /**
   * 发送当前消息
   */
  sendCurrentMessage() {
    if (!this.currentChat) return;
    
    const textarea = this.container.querySelector('#messageTextarea');
    const content = textarea.value.trim();
    
    if (!content) return;
    
    this.messaging.sendMessage(this.currentChat, content);
    textarea.value = '';
    this.renderChat(this.currentChat);
  }

  /**
   * HTML转义
   * @param {string} text - 原始文本
   * @returns {string} 转义后的文本
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// ============================================
// 便捷函数
// ============================================

/**
 * 初始化私信系统
 * @param {string} userAddress - 用户地址
 * @param {string} containerId - 容器ID
 * @param {Object} options - 配置选项
 * @returns {Object} { messaging, ui }
 */
function initMessaging(userAddress, containerId, options = {}) {
  const messaging = new MessagingSystem(userAddress, options);
  const ui = new MessagingUI(messaging, containerId);
  
  return { messaging, ui };
}

/**
 * 获取未读消息总数
 * @param {string} userAddress - 用户地址
 * @returns {number} 未读总数
 */
function getUnreadMessageCount(userAddress) {
  const messaging = new MessagingSystem(userAddress);
  return messaging.getTotalUnreadCount();
}

// ============================================
// 导出
// ============================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { 
    MessagingSystem, 
    MessagingUI, 
    initMessaging,
    getUnreadMessageCount 
  };
} else {
  window.MessagingSystem = MessagingSystem;
  window.MessagingUI = MessagingUI;
  window.initMessaging = initMessaging;
  window.getUnreadMessageCount = getUnreadMessageCount;
}
