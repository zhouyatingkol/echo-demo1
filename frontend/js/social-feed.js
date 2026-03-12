// 动态 Feed 系统
class SocialFeed {
  constructor() {
    this.following = [];
    this.feed = [];
    this.container = null;
  }

  init(containerId) {
    this.container = document.getElementById(containerId);
    this.loadFollowing();
    this.loadFeed();
  }

  loadFollowing() {
    const data = localStorage.getItem('echo_following');
    this.following = data ? JSON.parse(data) : [];
  }

  async loadFeed() {
    // 模拟加载关注者的动态
    this.feed = [
      {
        type: 'new_release',
        user: { name: '音乐人A', avatar: '👤' },
        content: '发布了新作品《夏日微风》',
        time: Date.now() - 3600000,
        music: { name: '夏日微风', id: 123 }
      },
      {
        type: 'purchase',
        user: { name: 'AI公司B', avatar: '🏢' },
        content: '购买了《电子节拍》的使用授权',
        time: Date.now() - 7200000,
        music: { name: '电子节拍', id: 456 }
      }
    ];
    this.render();
  }

  render() {
    if (!this.container) return;
    
    if (this.feed.length === 0) {
      this.container.innerHTML = '<div class="empty-feed">暂无动态，关注更多创作者吧！</div>';
      return;
    }

    this.container.innerHTML = this.feed.map(item => `
      <div class="feed-item">
        <div class="feed-avatar">${item.user.avatar}</div>
        <div class="feed-content">
          <div class="feed-header">
            <span class="feed-user">${item.user.name}</span>
            <span class="feed-action">${item.content}</span>
          </div>
          <div class="feed-time">${this.formatTime(item.time)}</div>
        </div>
      </div>
    `).join('');
  }

  formatTime(timestamp) {
    const diff = Date.now() - timestamp;
    const hours = Math.floor(diff / 3600000);
    if (hours < 1) return '刚刚';
    if (hours < 24) return `${hours}小时前`;
    return `${Math.floor(hours / 24)}天前`;
  }
}

window.SocialFeed = SocialFeed;
