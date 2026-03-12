/**
 * ECHO 钱包状态管理器
 * 跨页面保持钱包连接状态
 */

class WalletStateManager {
  constructor() {
    this.provider = null;
    this.signer = null;
    this.address = null;
    this.isConnected = false;
    this.init();
  }

  async init() {
    // 检查是否需要自动连接
    const shouldAutoConnect = localStorage.getItem('wallet_connected') === 'true';
    if (shouldAutoConnect && window.ethereum) {
      await this.autoConnect();
    }
    
    // 监听账户变化
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          this.disconnect();
        } else {
          this.address = accounts[0];
          this.updateUI();
        }
      });
      
      window.ethereum.on('chainChanged', () => {
        window.location.reload();
      });
    }
  }

  async autoConnect() {
    try {
      const accounts = await window.ethereum.request({
        method: 'eth_accounts'
      });
      
      if (accounts.length > 0) {
        this.address = accounts[0];
        this.isConnected = true;
        this.updateUI();
        console.log('✅ 钱包自动连接成功:', this.address);
      }
    } catch (error) {
      console.error('自动连接失败:', error);
    }
  }

  async connect() {
    if (!window.ethereum) {
      alert('请安装 MetaMask');
      return false;
    }

    try {
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length > 0) {
        this.address = accounts[0];
        this.isConnected = true;
        localStorage.setItem('wallet_connected', 'true');
        localStorage.setItem('wallet_address', this.address);
        this.updateUI();
        return true;
      }
    } catch (error) {
      console.error('连接失败:', error);
      alert('连接钱包失败: ' + error.message);
    }
    return false;
  }

  disconnect() {
    this.address = null;
    this.isConnected = false;
    localStorage.removeItem('wallet_connected');
    localStorage.removeItem('wallet_address');
    this.updateUI();
  }

  updateUI() {
    const connectBtn = document.getElementById('connectBtn');
    if (connectBtn) {
      if (this.isConnected && this.address) {
        connectBtn.textContent = this.address.slice(0, 6) + '...' + this.address.slice(-4);
        connectBtn.classList.add('connected');
      } else {
        connectBtn.textContent = '连接钱包';
        connectBtn.classList.remove('connected');
      }
    }
  }

  getAddress() {
    return this.address;
  }

  isWalletConnected() {
    return this.isConnected;
  }
}

// 创建全局实例
const walletManager = new WalletStateManager();

// 页面加载完成后更新 UI
document.addEventListener('DOMContentLoaded', () => {
  walletManager.updateUI();
  
  // 绑定按钮事件
  const connectBtn = document.getElementById('connectBtn');
  if (connectBtn) {
    connectBtn.addEventListener('click', () => {
      if (walletManager.isWalletConnected()) {
        if (confirm('是否断开钱包连接？')) {
          walletManager.disconnect();
        }
      } else {
        walletManager.connect();
      }
    });
  }
});

// 导出供其他模块使用
if (typeof window !== 'undefined') {
  window.walletManager = walletManager;
}