/**
 * 增强版音乐播放器 - PlayerEnhanced
 * 功能：播放队列管理、增强UI、媒体会话API、多种播放模式
 */

/**
 * 播放队列管理器
 */
class PlaylistManager {
  constructor() {
    this.queue = [];          // 当前播放队列
    this.history = [];        // 播放历史
    this.currentIndex = 0;    // 当前播放索引
    this.mode = 'normal';     // 播放模式: normal|random|repeat|repeat-one
    this.originalQueue = [];  // 原始队列（用于随机模式）
    this.shuffledIndices = []; // 随机索引映射
  }

  /**
   * 设置播放队列
   * @param {Array} tracks - 歌曲列表
   * @param {number} startIndex - 起始索引
   */
  setQueue(tracks, startIndex = 0) {
    this.queue = [...tracks];
    this.originalQueue = [...tracks];
    this.currentIndex = Math.max(0, Math.min(startIndex, this.queue.length - 1));
    this.history = [];
    
    if (this.mode === 'random') {
      this._shuffleQueue();
    }
  }

  /**
   * 添加歌曲到队列
   * @param {Object} track - 歌曲对象
   * @param {boolean} playNext - 是否添加到下一首
   */
  addTrack(track, playNext = false) {
    if (playNext) {
      this.queue.splice(this.currentIndex + 1, 0, track);
      this.originalQueue.splice(this._getOriginalIndex(this.currentIndex) + 1, 0, track);
    } else {
      this.queue.push(track);
      this.originalQueue.push(track);
    }
  }

  /**
   * 移除队列中的歌曲
   * @param {number} index - 索引
   */
  removeTrack(index) {
    if (index < 0 || index >= this.queue.length) return;
    
    this.queue.splice(index, 1);
    
    // 调整当前索引
    if (index < this.currentIndex) {
      this.currentIndex--;
    } else if (index === this.currentIndex && index === this.queue.length) {
      this.currentIndex = 0;
    }
    
    this._updateOriginalQueue();
  }

  /**
   * 获取当前歌曲
   * @returns {Object|null}
   */
  getCurrentTrack() {
    return this.queue[this.currentIndex] || null;
  }

  /**
   * 获取下一首歌曲
   * @returns {Object|null}
   */
  getNextTrack() {
    if (this.queue.length === 0) return null;
    
    let nextIndex;
    switch (this.mode) {
      case 'repeat-one':
        return this.getCurrentTrack();
      case 'repeat':
        nextIndex = (this.currentIndex + 1) % this.queue.length;
        break;
      case 'random':
        nextIndex = (this.currentIndex + 1) % this.queue.length;
        break;
      default: // normal
        nextIndex = this.currentIndex + 1;
        if (nextIndex >= this.queue.length) return null;
    }
    
    return this.queue[nextIndex];
  }

  /**
   * 获取上一首歌曲
   * @returns {Object|null}
   */
  getPreviousTrack() {
    if (this.queue.length === 0) return null;
    
    // 优先从历史记录获取
    if (this.history.length > 0) {
      const prevTrack = this.history[this.history.length - 1];
      return prevTrack;
    }
    
    let prevIndex;
    switch (this.mode) {
      case 'repeat-one':
        return this.getCurrentTrack();
      case 'repeat':
        prevIndex = (this.currentIndex - 1 + this.queue.length) % this.queue.length;
        break;
      case 'random':
        // 随机模式从历史记录获取，如果没有则随机选择
        if (this.queue.length > 1) {
          do {
            prevIndex = Math.floor(Math.random() * this.queue.length);
          } while (prevIndex === this.currentIndex);
        } else {
          prevIndex = 0;
        }
        break;
      default: // normal
        prevIndex = this.currentIndex - 1;
        if (prevIndex < 0) return null;
    }
    
    return this.queue[prevIndex];
  }

  /**
   * 切换到下一首
   * @returns {Object|null}
   */
  next() {
    const currentTrack = this.getCurrentTrack();
    if (currentTrack && !this.history.includes(currentTrack)) {
      this.history.push(currentTrack);
      if (this.history.length > 50) this.history.shift();
    }
    
    switch (this.mode) {
      case 'repeat-one':
        return this.getCurrentTrack();
      case 'repeat':
        this.currentIndex = (this.currentIndex + 1) % this.queue.length;
        break;
      case 'random':
        this.currentIndex = (this.currentIndex + 1) % this.queue.length;
        break;
      default:
        this.currentIndex++;
        if (this.currentIndex >= this.queue.length) {
          this.currentIndex = 0;
          return null;
        }
    }
    
    return this.getCurrentTrack();
  }

  /**
   * 切换到上一首
   * @returns {Object|null}
   */
  previous() {
    if (this.history.length > 0) {
      const prevTrack = this.history.pop();
      const index = this.queue.findIndex(t => t.id === prevTrack.id);
      if (index !== -1) {
        this.currentIndex = index;
        return this.getCurrentTrack();
      }
    }
    
    switch (this.mode) {
      case 'repeat-one':
        return this.getCurrentTrack();
      case 'repeat':
        this.currentIndex = (this.currentIndex - 1 + this.queue.length) % this.queue.length;
        break;
      case 'random':
        if (this.queue.length > 1) {
          let newIndex;
          do {
            newIndex = Math.floor(Math.random() * this.queue.length);
          } while (newIndex === this.currentIndex);
          this.currentIndex = newIndex;
        }
        break;
      default:
        this.currentIndex = Math.max(0, this.currentIndex - 1);
    }
    
    return this.getCurrentTrack();
  }

  /**
   * 跳转到指定索引
   * @param {number} index - 目标索引
   */
  jumpTo(index) {
    if (index < 0 || index >= this.queue.length) return null;
    
    const currentTrack = this.getCurrentTrack();
    if (currentTrack) {
      this.history.push(currentTrack);
      if (this.history.length > 50) this.history.shift();
    }
    
    this.currentIndex = index;
    return this.getCurrentTrack();
  }

  /**
   * 设置播放模式
   * @param {string} mode - 播放模式
   */
  setMode(mode) {
    const validModes = ['normal', 'random', 'repeat', 'repeat-one'];
    if (!validModes.includes(mode)) return;
    
    if (this.mode !== mode) {
      this.mode = mode;
      
      if (mode === 'random') {
        this._shuffleQueue();
      } else if (this.mode === 'random') {
        // 从随机模式切换回来，恢复原始顺序
        this._restoreOriginalOrder();
      }
    }
  }

  /**
   * 获取播放模式
   * @returns {string}
   */
  getMode() {
    return this.mode;
  }

  /**
   * 清空队列
   */
  clear() {
    this.queue = [];
    this.originalQueue = [];
    this.history = [];
    this.currentIndex = 0;
  }

  /**
   * 移动队列中的歌曲
   * @param {number} fromIndex - 原位置
   * @param {number} toIndex - 目标位置
   */
  moveTrack(fromIndex, toIndex) {
    if (fromIndex < 0 || fromIndex >= this.queue.length) return;
    if (toIndex < 0 || toIndex >= this.queue.length) return;
    if (fromIndex === toIndex) return;
    
    const [track] = this.queue.splice(fromIndex, 1);
    this.queue.splice(toIndex, 0, track);
    
    // 调整当前索引
    if (fromIndex === this.currentIndex) {
      this.currentIndex = toIndex;
    } else if (fromIndex < this.currentIndex && toIndex >= this.currentIndex) {
      this.currentIndex--;
    } else if (fromIndex > this.currentIndex && toIndex <= this.currentIndex) {
      this.currentIndex++;
    }
    
    this._updateOriginalQueue();
  }

  /**
   * 打乱队列（Fisher-Yates算法）
   * @private
   */
  _shuffleQueue() {
    if (this.queue.length <= 1) return;
    
    const currentTrack = this.getCurrentTrack();
    const remaining = this.queue.filter((_, i) => i !== this.currentIndex);
    
    // Fisher-Yates 洗牌
    for (let i = remaining.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [remaining[i], remaining[j]] = [remaining[j], remaining[i]];
    }
    
    this.queue = [currentTrack, ...remaining];
    this.currentIndex = 0;
  }

  /**
   * 恢复原始顺序
   * @private
   */
  _restoreOriginalOrder() {
    const currentTrack = this.getCurrentTrack();
    this.queue = [...this.originalQueue];
    const newIndex = this.queue.findIndex(t => t.id === currentTrack?.id);
    this.currentIndex = newIndex !== -1 ? newIndex : 0;
  }

  /**
   * 获取原始索引
   * @private
   */
  _getOriginalIndex(queueIndex) {
    const track = this.queue[queueIndex];
    return this.originalQueue.findIndex(t => t.id === track?.id);
  }

  /**
   * 更新原始队列
   * @private
   */
  _updateOriginalQueue() {
    if (this.mode !== 'random') {
      this.originalQueue = [...this.queue];
    }
  }
}

/**
 * 增强版音乐播放器
 */
class PlayerEnhanced extends EventTarget {
  constructor() {
    super();
    
    this.playlist = new PlaylistManager();
    this.audio = new Audio();
    this.isPlaying = false;
    this.volume = parseFloat(localStorage.getItem('player_volume')) || 0.8;
    this.muted = false;
    
    // UI 状态
    this.ui = {
      miniPlayerVisible: false,
      fullscreenOpen: false,
      queueDrawerOpen: false,
      currentTime: 0,
      duration: 0,
      buffered: 0
    };
    
    // 初始化
    this._initAudio();
    this._initMediaSession();
    this._createUI();
    this._bindEvents();
  }

  /**
   * 初始化音频元素
   * @private
   */
  _initAudio() {
    this.audio.volume = this.volume;
    this.audio.preload = 'metadata';
    
    // 音频事件监听
    this.audio.addEventListener('loadedmetadata', () => {
      this.ui.duration = this.audio.duration;
      this._updateUI();
      this._dispatchEvent('loadedmetadata', { duration: this.audio.duration });
    });
    
    this.audio.addEventListener('timeupdate', () => {
      this.ui.currentTime = this.audio.currentTime;
      this._dispatchEvent('timeupdate', { currentTime: this.audio.currentTime });
      this._updateProgressUI();
    });
    
    this.audio.addEventListener('ended', () => this._onTrackEnded());
    
    this.audio.addEventListener('play', () => {
      this.isPlaying = true;
      this._updateUI();
      this._dispatchEvent('play');
    });
    
    this.audio.addEventListener('pause', () => {
      this.isPlaying = false;
      this._updateUI();
      this._dispatchEvent('pause');
    });
    
    this.audio.addEventListener('error', (e) => {
      console.error('Audio error:', e);
      this._dispatchEvent('error', { error: e });
    });
    
    this.audio.addEventListener('progress', () => {
      if (this.audio.buffered.length > 0) {
        this.ui.buffered = this.audio.buffered.end(this.audio.buffered.length - 1);
      }
    });
  }

  /**
   * 初始化媒体会话 API
   * @private
   */
  _initMediaSession() {
    if (!('mediaSession' in navigator)) {
      console.log('Media Session API not supported');
      return;
    }
    
    navigator.mediaSession.setActionHandler('play', () => this.play());
    navigator.mediaSession.setActionHandler('pause', () => this.pause());
    navigator.mediaSession.setActionHandler('previoustrack', () => this.previous());
    navigator.mediaSession.setActionHandler('nexttrack', () => this.next());
    
    // 进度条拖动（如果支持）
    try {
      navigator.mediaSession.setActionHandler('seekbackward', (details) => {
        const skipTime = details.seekOffset || 10;
        this.seek(Math.max(0, this.audio.currentTime - skipTime));
      });
      
      navigator.mediaSession.setActionHandler('seekforward', (details) => {
        const skipTime = details.seekOffset || 10;
        this.seek(Math.min(this.audio.duration, this.audio.currentTime + skipTime));
      });
      
      navigator.mediaSession.setActionHandler('seekto', (details) => {
        if (details.seekTime) {
          this.seek(details.seekTime);
        }
      });
    } catch (e) {
      // 旧版本浏览器可能不支持
    }
    
    // 耳机控制
    if ('setPositionState' in navigator.mediaSession) {
      this.audio.addEventListener('timeupdate', () => {
        navigator.mediaSession.setPositionState({
          duration: this.audio.duration || 0,
          playbackRate: this.audio.playbackRate || 1,
          position: this.audio.currentTime || 0
        });
      });
    }
  }

  /**
   * 更新媒体会话元数据
   * @private
   */
  _updateMediaSession(track) {
    if (!('mediaSession' in navigator) || !track) return;
    
    navigator.mediaSession.metadata = new MediaMetadata({
      title: track.title || 'Unknown Title',
      artist: track.artist || 'Unknown Artist',
      album: track.album || 'Unknown Album',
      artwork: track.cover ? [{ src: track.cover, sizes: '512x512', type: 'image/jpeg' }] : []
    });
  }

  /**
   * 创建播放器 UI
   * @private
   */
  _createUI() {
    // 创建样式
    const style = document.createElement('style');
    style.textContent = this._getCSS();
    document.head.appendChild(style);
    
    // 创建迷你播放器
    this.miniPlayer = this._createMiniPlayer();
    document.body.appendChild(this.miniPlayer);
    
    // 创建全屏播放器
    this.fullscreenPlayer = this._createFullscreenPlayer();
    document.body.appendChild(this.fullscreenPlayer);
    
    // 创建播放队列抽屉
    this.queueDrawer = this._createQueueDrawer();
    document.body.appendChild(this.queueDrawer);
    
    // 遮罩层
    this.overlay = document.createElement('div');
    this.overlay.className = 'player-overlay';
    this.overlay.addEventListener('click', () => this.closeQueueDrawer());
    document.body.appendChild(this.overlay);
  }

  /**
   * 获取 CSS 样式
   * @private
   */
  _getCSS() {
    return `
      /* ===== 迷你播放器 ===== */
      .mini-player {
        position: fixed;
        bottom: 0;
        left: 0;
        right: 0;
        height: 72px;
        background: linear-gradient(135deg, rgba(30,30,30,0.98) 0%, rgba(20,20,20,0.98) 100%);
        backdrop-filter: blur(20px);
        border-top: 1px solid rgba(255,255,255,0.1);
        display: flex;
        align-items: center;
        padding: 0 16px;
        z-index: 1000;
        transform: translateY(100%);
        transition: transform 0.3s ease;
      }
      .mini-player.visible {
        transform: translateY(0);
      }
      .mini-player-info {
        display: flex;
        align-items: center;
        flex: 1;
        min-width: 0;
        cursor: pointer;
      }
      .mini-player-cover {
        width: 48px;
        height: 48px;
        border-radius: 4px;
        object-fit: cover;
        margin-right: 12px;
        flex-shrink: 0;
      }
      .mini-player-text {
        min-width: 0;
        overflow: hidden;
      }
      .mini-player-title {
        color: #fff;
        font-size: 14px;
        font-weight: 500;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .mini-player-artist {
        color: rgba(255,255,255,0.6);
        font-size: 12px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .mini-player-controls {
        display: flex;
        align-items: center;
        gap: 8px;
        margin-left: 16px;
      }
      .player-btn {
        width: 40px;
        height: 40px;
        border: none;
        background: transparent;
        color: #fff;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.2s ease;
      }
      .player-btn:hover {
        background: rgba(255,255,255,0.1);
      }
      .player-btn.play {
        width: 48px;
        height: 48px;
        background: #1db954;
      }
      .player-btn.play:hover {
        background: #1ed760;
        transform: scale(1.05);
      }
      .player-btn svg {
        width: 20px;
        height: 20px;
      }
      .player-btn.play svg {
        width: 24px;
        height: 24px;
      }
      
      /* 进度条 */
      .mini-player-progress {
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 2px;
        background: rgba(255,255,255,0.1);
        cursor: pointer;
      }
      .mini-player-progress-bar {
        height: 100%;
        background: #1db954;
        width: 0%;
        position: relative;
      }
      .mini-player-progress-bar::after {
        content: '';
        position: absolute;
        right: -4px;
        top: 50%;
        transform: translateY(-50%);
        width: 8px;
        height: 8px;
        background: #fff;
        border-radius: 50%;
        opacity: 0;
        transition: opacity 0.2s;
      }
      .mini-player:hover .mini-player-progress-bar::after {
        opacity: 1;
      }
      
      /* ===== 全屏播放器 ===== */
      .fullscreen-player {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f0f23 100%);
        z-index: 2000;
        display: none;
        flex-direction: column;
        padding: 24px;
      }
      .fullscreen-player.open {
        display: flex;
      }
      .fullscreen-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      }
      .fullscreen-title {
        color: #fff;
        font-size: 16px;
        font-weight: 500;
      }
      .fullscreen-close {
        width: 40px;
        height: 40px;
        border: none;
        background: rgba(255,255,255,0.1);
        color: #fff;
        border-radius: 50%;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      .fullscreen-content {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 32px;
      }
      .fullscreen-cover {
        width: min(60vw, 400px);
        height: min(60vw, 400px);
        border-radius: 12px;
        object-fit: cover;
        box-shadow: 0 20px 60px rgba(0,0,0,0.5);
      }
      .fullscreen-info {
        text-align: center;
        color: #fff;
      }
      .fullscreen-track-title {
        font-size: 28px;
        font-weight: 600;
        margin-bottom: 8px;
      }
      .fullscreen-track-artist {
        font-size: 18px;
        color: rgba(255,255,255,0.7);
      }
      .fullscreen-controls {
        width: 100%;
        max-width: 500px;
      }
      .fullscreen-progress {
        display: flex;
        align-items: center;
        gap: 12px;
        margin-bottom: 24px;
      }
      .fullscreen-progress-bar {
        flex: 1;
        height: 4px;
        background: rgba(255,255,255,0.2);
        border-radius: 2px;
        cursor: pointer;
        position: relative;
      }
      .fullscreen-progress-fill {
        height: 100%;
        background: #1db954;
        border-radius: 2px;
        width: 0%;
      }
      .fullscreen-time {
        color: rgba(255,255,255,0.6);
        font-size: 12px;
        min-width: 40px;
        text-align: center;
      }
      .fullscreen-buttons {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 24px;
      }
      .fullscreen-btn {
        width: 56px;
        height: 56px;
        border: none;
        background: transparent;
        color: #fff;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        transition: all 0.2s ease;
      }
      .fullscreen-btn:hover {
        background: rgba(255,255,255,0.1);
      }
      .fullscreen-btn.play {
        width: 72px;
        height: 72px;
        background: #1db954;
      }
      .fullscreen-btn.play:hover {
        background: #1ed760;
        transform: scale(1.05);
      }
      .fullscreen-btn.mode {
        color: rgba(255,255,255,0.6);
      }
      .fullscreen-btn.mode.active {
        color: #1db954;
      }
      .fullscreen-btn svg {
        width: 24px;
        height: 24px;
      }
      .fullscreen-btn.play svg {
        width: 32px;
        height: 32px;
      }
      
      /* ===== 播放队列抽屉 ===== */
      .queue-drawer {
        position: fixed;
        right: 0;
        top: 0;
        bottom: 0;
        width: 360px;
        max-width: 90vw;
        background: rgba(25,25,25,0.98);
        backdrop-filter: blur(20px);
        z-index: 1500;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        display: flex;
        flex-direction: column;
      }
      .queue-drawer.open {
        transform: translateX(0);
      }
      .queue-header {
        padding: 20px;
        border-bottom: 1px solid rgba(255,255,255,0.1);
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      .queue-title {
        color: #fff;
        font-size: 18px;
        font-weight: 600;
      }
      .queue-clear {
        color: #1db954;
        font-size: 14px;
        cursor: pointer;
        background: none;
        border: none;
      }
      .queue-list {
        flex: 1;
        overflow-y: auto;
        padding: 8px 0;
      }
      .queue-item {
        display: flex;
        align-items: center;
        padding: 12px 20px;
        cursor: pointer;
        transition: background 0.2s;
      }
      .queue-item:hover {
        background: rgba(255,255,255,0.05);
      }
      .queue-item.current {
        background: rgba(29,185,84,0.15);
      }
      .queue-item-cover {
        width: 48px;
        height: 48px;
        border-radius: 4px;
        object-fit: cover;
        margin-right: 12px;
      }
      .queue-item-info {
        flex: 1;
        min-width: 0;
      }
      .queue-item-title {
        color: #fff;
        font-size: 14px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .queue-item-artist {
        color: rgba(255,255,255,0.6);
        font-size: 12px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      .queue-item-remove {
        width: 32px;
        height: 32px;
        border: none;
        background: transparent;
        color: rgba(255,255,255,0.5);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        opacity: 0;
        transition: all 0.2s;
      }
      .queue-item:hover .queue-item-remove {
        opacity: 1;
      }
      .queue-item-remove:hover {
        color: #ff4444;
        background: rgba(255,68,68,0.1);
      }
      .queue-empty {
        text-align: center;
        padding: 60px 20px;
        color: rgba(255,255,255,0.5);
      }
      .player-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: rgba(0,0,0,0.5);
        z-index: 1400;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
      }
      .player-overlay.visible {
        opacity: 1;
        visibility: visible;
      }
      
      /* 滚动条样式 */
      .queue-list::-webkit-scrollbar {
        width: 8px;
      }
      .queue-list::-webkit-scrollbar-track {
        background: transparent;
      }
      .queue-list::-webkit-scrollbar-thumb {
        background: rgba(255,255,255,0.2);
        border-radius: 4px;
      }
      
      /* 响应式 */
      @media (max-width: 768px) {
        .fullscreen-cover {
          width: 80vw;
          height: 80vw;
        }
        .fullscreen-track-title {
          font-size: 22px;
        }
      }
    `;
  }

  /**
   * 创建迷你播放器
   * @private
   */
  _createMiniPlayer() {
    const el = document.createElement('div');
    el.className = 'mini-player';
    el.innerHTML = `
      <div class="mini-player-progress">
        <div class="mini-player-progress-bar"></div>
      </div>
      <div class="mini-player-info">
        <img class="mini-player-cover" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Crect fill='%23333' width='48' height='48'/%3E%3Ctext fill='%23666' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='20'%3E%F0%9F%8E%B5%3C/text%3E%3C/svg%3E" alt="Cover">
        <div class="mini-player-text">
          <div class="mini-player-title">选择歌曲开始播放</div>
          <div class="mini-player-artist">-</div>
        </div>
      </div>
      <div class="mini-player-controls">
        <button class="player-btn prev" title="上一首">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
        </button>
        <button class="player-btn play" title="播放/暂停">
          <svg class="play-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
          <svg class="pause-icon" viewBox="0 0 24 24" fill="currentColor" style="display:none"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
        </button>
        <button class="player-btn next" title="下一首">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
        </button>
        <button class="player-btn queue" title="播放队列">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z"/></svg>
        </button>
      </div>
    `;
    return el;
  }

  /**
   * 创建全屏播放器
   * @private
   */
  _createFullscreenPlayer() {
    const el = document.createElement('div');
    el.className = 'fullscreen-player';
    el.innerHTML = `
      <div class="fullscreen-header">
        <span class="fullscreen-title">正在播放</span>
        <button class="fullscreen-close">
          <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
            <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/>
          </svg>
        </button>
      </div>
      <div class="fullscreen-content">
        <img class="fullscreen-cover" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect fill='%23222' width='400' height='400'/%3E%3Ctext fill='%23444' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='80'%3E%F0%9F%8E%B5%3C/text%3E%3C/svg%3E" alt="Cover">
        <div class="fullscreen-info">
          <div class="fullscreen-track-title">选择歌曲开始播放</div>
          <div class="fullscreen-track-artist">-</div>
        </div>
        <div class="fullscreen-controls">
          <div class="fullscreen-progress">
            <span class="fullscreen-time current">0:00</span>
            <div class="fullscreen-progress-bar">
              <div class="fullscreen-progress-fill"></div>
            </div>
            <span class="fullscreen-time duration">0:00</span>
          </div>
          <div class="fullscreen-buttons">
            <button class="fullscreen-btn mode" data-mode="random" title="随机播放">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M10.59 9.17L5.41 4 4 5.41l5.17 5.17 1.42-1.41zM14.5 4l2.04 2.04L4 18.59 5.41 20 17.96 7.46 20 9.5V4h-5.5zm.33 9.41l-1.41 1.41 3.13 3.13L14.5 20H20v-5.5l-2.04 2.04-3.13-3.13z"/></svg>
            </button>
            <button class="fullscreen-btn prev" title="上一首">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
            </button>
            <button class="fullscreen-btn play" title="播放/暂停">
              <svg class="play-icon" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
              <svg class="pause-icon" viewBox="0 0 24 24" fill="currentColor" style="display:none"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
            </button>
            <button class="fullscreen-btn next" title="下一首">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
            </button>
            <button class="fullscreen-btn mode" data-mode="repeat" title="循环播放">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/></svg>
            </button>
          </div>
        </div>
      </div>
    `;
    return el;
  }

  /**
   * 创建播放队列抽屉
   * @private
   */
  _createQueueDrawer() {
    const el = document.createElement('div');
    el.className = 'queue-drawer';
    el.innerHTML = `
      <div class="queue-header">
        <span class="queue-title">播放队列</span>
        <button class="queue-clear">清空</button>
      </div>
      <div class="queue-list">
        <div class="queue-empty">播放队列为空</div>
      </div>
    `;
    return el;
  }

  /**
   * 绑定事件
   * @private
   */
  _bindEvents() {
    // 迷你播放器事件
    const miniInfo = this.miniPlayer.querySelector('.mini-player-info');
    miniInfo.addEventListener('click', () => this.openFullscreen());
    
    this.miniPlayer.querySelector('.prev').addEventListener('click', () => this.previous());
    this.miniPlayer.querySelector('.play').addEventListener('click', () => this.togglePlay());
    this.miniPlayer.querySelector('.next').addEventListener('click', () => this.next());
    this.miniPlayer.querySelector('.queue').addEventListener('click', () => this.openQueueDrawer());
    
    // 进度条拖动
    const miniProgress = this.miniPlayer.querySelector('.mini-player-progress');
    miniProgress.addEventListener('click', (e) => {
      const rect = miniProgress.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      this.seek(percent * this.audio.duration);
    });
    
    // 全屏播放器事件
    this.fullscreenPlayer.querySelector('.fullscreen-close').addEventListener('click', () => this.closeFullscreen());
    this.fullscreenPlayer.querySelector('.prev').addEventListener('click', () => this.previous());
    this.fullscreenPlayer.querySelector('.play').addEventListener('click', () => this.togglePlay());
    this.fullscreenPlayer.querySelector('.next').addEventListener('click', () => this.next());
    
    // 播放模式切换
    this.fullscreenPlayer.querySelectorAll('.fullscreen-btn.mode').forEach(btn => {
      btn.addEventListener('click', () => {
        const mode = btn.dataset.mode;
        this._toggleMode(mode, btn);
      });
    });
    
    // 全屏进度条
    const fullProgress = this.fullscreenPlayer.querySelector('.fullscreen-progress-bar');
    fullProgress.addEventListener('click', (e) => {
      const rect = fullProgress.getBoundingClientRect();
      const percent = (e.clientX - rect.left) / rect.width;
      this.seek(percent * this.audio.duration);
    });
    
    // 队列抽屉事件
    this.queueDrawer.querySelector('.queue-clear').addEventListener('click', () => {
      this.playlist.clear();
      this._updateQueueUI();
    });
    
    // 键盘快捷键
    document.addEventListener('keydown', (e) => {
      if (e.target.matches('input, textarea')) return;
      
      switch (e.code) {
        case 'Space':
          e.preventDefault();
          this.togglePlay();
          break;
        case 'ArrowLeft':
          if (e.ctrlKey || e.metaKey) this.previous();
          break;
        case 'ArrowRight':
          if (e.ctrlKey || e.metaKey) this.next();
          break;
        case 'ArrowUp':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            this.setVolume(Math.min(1, this.volume + 0.1));
          }
          break;
        case 'ArrowDown':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            this.setVolume(Math.max(0, this.volume - 0.1));
          }
          break;
      }
    });
    
    // 页面可见性变化（后台播放处理）
    document.addEventListener('visibilitychange', () => {
      if (document.hidden && this.isPlaying) {
        // 页面隐藏时继续播放
        this._dispatchEvent('backgroundplay');
      }
    });
  }

  /**
   * 切换播放模式
   * @private
   */
  _toggleMode(mode, btn) {
    const currentMode = this.playlist.getMode();
    let newMode;
    
    if (mode === 'random') {
      newMode = currentMode === 'random' ? 'normal' : 'random';
      this.playlist.setMode(newMode);
      btn.classList.toggle('active', newMode === 'random');
    } else if (mode === 'repeat') {
      if (currentMode === 'repeat') {
        newMode = 'repeat-one';
      } else if (currentMode === 'repeat-one') {
        newMode = 'normal';
      } else {
        newMode = 'repeat';
      }
      this.playlist.setMode(newMode);
      
      // 更新图标
      const svg = btn.querySelector('svg');
      if (newMode === 'repeat-one') {
        svg.innerHTML = '<path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4zm-4-2V9h-1l-2 1v1h1.5v4H13z"/>';
      } else {
        svg.innerHTML = '<path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z"/>';
      }
      
      // 更新其他按钮状态
      this.fullscreenPlayer.querySelectorAll('.fullscreen-btn.mode').forEach(b => {
        if (b !== btn) b.classList.remove('active');
      });
      btn.classList.toggle('active', newMode === 'repeat' || newMode === 'repeat-one');
    }
    
    this._dispatchEvent('modechange', { mode: newMode });
  }

  /**
   * 歌曲结束处理
   * @private
   */
  _onTrackEnded() {
    const nextTrack = this.playlist.next();
    if (nextTrack) {
      this.loadTrack(nextTrack, true);
    } else {
      this.isPlaying = false;
      this.audio.currentTime = 0;
      this._updateUI();
      this._dispatchEvent('ended');
    }
  }

  /**
   * 更新 UI
   * @private
   */
  _updateUI() {
    const track = this.playlist.getCurrentTrack();
    const isPlaying = this.isPlaying;
    
    // 更新迷你播放器
    if (track) {
      this.miniPlayer.querySelector('.mini-player-cover').src = track.cover || 
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 48 48'%3E%3Crect fill='%23333' width='48' height='48'/%3E%3Ctext fill='%23666' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='20'%3E%F0%9F%8E%B5%3C/text%3E%3C/svg%3E";
      this.miniPlayer.querySelector('.mini-player-title').textContent = track.title || 'Unknown';
      this.miniPlayer.querySelector('.mini-player-artist').textContent = track.artist || '-';
      this.miniPlayer.classList.add('visible');
    }
    
    // 更新全屏播放器
    if (track) {
      this.fullscreenPlayer.querySelector('.fullscreen-cover').src = track.cover || 
        "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 400 400'%3E%3Crect fill='%23222' width='400' height='400'/%3E%3Ctext fill='%23444' x='50%25' y='50%25' text-anchor='middle' dy='.3em' font-size='80'%3E%F0%9F%8E%B5%3C/text%3E%3C/svg%3E";
      this.fullscreenPlayer.querySelector('.fullscreen-track-title').textContent = track.title || 'Unknown';
      this.fullscreenPlayer.querySelector('.fullscreen-track-artist').textContent = track.artist || '-';
    }
    
    // 更新播放按钮状态
    const updatePlayBtn = (container) => {
      const playBtn = container.querySelector('.play');
      const playIcon = playBtn.querySelector('.play-icon');
      const pauseIcon = playBtn.querySelector('.pause-icon');
      playIcon.style.display = isPlaying ? 'none' : 'block';
      pauseIcon.style.display = isPlaying ? 'block' : 'none';
    };
    updatePlayBtn(this.miniPlayer);
    updatePlayBtn(this.fullscreenPlayer);
    
    // 更新队列 UI
    this._updateQueueUI();
  }

  /**
   * 更新进度条 UI
   * @private
   */
  _updateProgressUI() {
    const duration = this.audio.duration || 0;
    const currentTime = this.audio.currentTime || 0;
    const percent = duration ? (currentTime / duration * 100) : 0;
    
    // 迷你播放器
    this.miniPlayer.querySelector('.mini-player-progress-bar').style.width = `${percent}%`;
    
    // 全屏播放器
    this.fullscreenPlayer.querySelector('.fullscreen-progress-fill').style.width = `${percent}%`;
    this.fullscreenPlayer.querySelector('.fullscreen-time.current').textContent = this._formatTime(currentTime);
    this.fullscreenPlayer.querySelector('.fullscreen-time.duration').textContent = this._formatTime(duration);
  }

  /**
   * 更新队列 UI
   * @private
   */
  _updateQueueUI() {
    const queue = this.playlist.queue;
    const currentIndex = this.playlist.currentIndex;
    const listEl = this.queueDrawer.querySelector('.queue-list');
    
    if (queue.length === 0) {
      listEl.innerHTML = '<div class="queue-empty">播放队列为空</div>';
      return;
    }
    
    listEl.innerHTML = queue.map((track, index) => `
      <div class="queue-item ${index === currentIndex ? 'current' : ''}" data-index="${index}">
        <img class="queue-item-cover" src="${track.cover || 'data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 viewBox=%270 0 48 48%27%3E%3Crect fill=%27%23333%27 width=%2748%27 height=%2748%27/%3E%3C/svg%3E'}" alt="">
        <div class="queue-item-info">
          <div class="queue-item-title">${this._escapeHtml(track.title || 'Unknown')}</div>
          <div class="queue-item-artist">${this._escapeHtml(track.artist || '-')}</div>
        </div>
        <button class="queue-item-remove" data-index="${index}">
          <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>
        </button>
      </div>
    `).join('');
    
    // 绑定事件
    listEl.querySelectorAll('.queue-item').forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.closest('.queue-item-remove')) return;
        const index = parseInt(item.dataset.index);
        this.playlist.jumpTo(index);
        this.loadTrack(this.playlist.getCurrentTrack(), true);
      });
    });
    
    listEl.querySelectorAll('.queue-item-remove').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(btn.dataset.index);
        this.playlist.removeTrack(index);
        this._updateQueueUI();
      });
    });
  }

  /**
   * 格式化时间
   * @private
   */
  _formatTime(seconds) {
    if (!seconds || isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  /**
   * HTML 转义
   * @private
   */
  _escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * 派发事件
   * @private
   */
  _dispatchEvent(name, detail = {}) {
    this.dispatchEvent(new CustomEvent(name, { detail }));
  }

  // ===== 公共 API =====

  /**
   * 加载歌曲
   * @param {Object} track - 歌曲对象 {id, title, artist, album, url, cover}
   * @param {boolean} autoplay - 是否自动播放
   */
  loadTrack(track, autoplay = false) {
    if (!track || !track.url) return;
    
    this.audio.src = track.url;
    this._updateMediaSession(track);
    this._updateUI();
    
    if (autoplay) {
      this.audio.play().catch(e => console.error('Play failed:', e));
    }
    
    this._dispatchEvent('trackchange', { track });
  }

  /**
   * 加载播放列表
   * @param {Array} tracks - 歌曲列表
   * @param {number} startIndex - 起始索引
   */
  loadPlaylist(tracks, startIndex = 0) {
    this.playlist.setQueue(tracks, startIndex);
    const track = this.playlist.getCurrentTrack();
    if (track) {
      this.loadTrack(track, true);
    }
  }

  /**
   * 播放
   */
  play() {
    if (!this.audio.src && this.playlist.getCurrentTrack()) {
      this.loadTrack(this.playlist.getCurrentTrack(), true);
    } else {
      this.audio.play().catch(e => console.error('Play failed:', e));
    }
  }

  /**
   * 暂停
   */
  pause() {
    this.audio.pause();
  }

  /**
   * 切换播放/暂停
   */
  togglePlay() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  /**
   * 下一首
   */
  next() {
    const nextTrack = this.playlist.next();
    if (nextTrack) {
      this.loadTrack(nextTrack, true);
    }
  }

  /**
   * 上一首
   */
  previous() {
    const prevTrack = this.playlist.previous();
    if (prevTrack) {
      this.loadTrack(prevTrack, true);
    }
  }

  /**
   * 跳转到指定时间
   * @param {number} time - 时间（秒）
   */
  seek(time) {
    if (this.audio.duration) {
      this.audio.currentTime = Math.max(0, Math.min(time, this.audio.duration));
    }
  }

  /**
   * 设置音量
   * @param {number} volume - 音量 (0-1)
   */
  setVolume(volume) {
    this.volume = Math.max(0, Math.min(1, volume));
    this.audio.volume = this.volume;
    localStorage.setItem('player_volume', this.volume);
    this._dispatchEvent('volumechange', { volume: this.volume });
  }

  /**
   * 静音切换
   */
  toggleMute() {
    this.muted = !this.muted;
    this.audio.muted = this.muted;
    this._dispatchEvent('mutechange', { muted: this.muted });
  }

  /**
   * 设置播放模式
   * @param {string} mode - 播放模式
   */
  setMode(mode) {
    this.playlist.setMode(mode);
    this._dispatchEvent('modechange', { mode });
  }

  /**
   * 获取播放模式
   * @returns {string}
   */
  getMode() {
    return this.playlist.getMode();
  }

  /**
   * 打开全屏播放器
   */
  openFullscreen() {
    this.fullscreenPlayer.classList.add('open');
    this.ui.fullscreenOpen = true;
    this._dispatchEvent('fullscreenopen');
  }

  /**
   * 关闭全屏播放器
   */
  closeFullscreen() {
    this.fullscreenPlayer.classList.remove('open');
    this.ui.fullscreenOpen = false;
    this._dispatchEvent('fullscreenclose');
  }

  /**
   * 打开播放队列抽屉
   */
  openQueueDrawer() {
    this.queueDrawer.classList.add('open');
    this.overlay.classList.add('visible');
    this.ui.queueDrawerOpen = true;
    this._updateQueueUI();
    this._dispatchEvent('queueopen');
  }

  /**
   * 关闭播放队列抽屉
   */
  closeQueueDrawer() {
    this.queueDrawer.classList.remove('open');
    this.overlay.classList.remove('visible');
    this.ui.queueDrawerOpen = false;
    this._dispatchEvent('queueclose');
  }

  /**
   * 添加歌曲到队列
   * @param {Object} track - 歌曲对象
   * @param {boolean} playNext - 是否添加到下一首
   */
  addToQueue(track, playNext = false) {
    this.playlist.addTrack(track, playNext);
    if (this.ui.queueDrawerOpen) {
      this._updateQueueUI();
    }
  }

  /**
   * 清空队列
   */
  clearQueue() {
    this.playlist.clear();
    this._updateQueueUI();
  }

  /**
   * 获取当前播放状态
   * @returns {Object}
   */
  getState() {
    return {
      isPlaying: this.isPlaying,
      currentTrack: this.playlist.getCurrentTrack(),
      currentTime: this.audio.currentTime,
      duration: this.audio.duration,
      volume: this.volume,
      muted: this.muted,
      mode: this.playlist.getMode(),
      queueLength: this.playlist.queue.length
    };
  }

  /**
   * 销毁播放器
   */
  destroy() {
    this.audio.pause();
    this.audio.src = '';
    this.miniPlayer.remove();
    this.fullscreenPlayer.remove();
    this.queueDrawer.remove();
    this.overlay.remove();
  }
}

// 导出
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PlayerEnhanced, PlaylistManager };
}
