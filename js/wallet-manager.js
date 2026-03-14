/**
 * ECHO Wallet Manager - 跨页面钱包状态管理
 * 管理钱包连接状态，在所有页面保持同步
 */

(function() {
    'use strict';
    
    // 存储键名
    const STORAGE_KEY = 'echo_wallet_state';
    const LAST_ADDRESS_KEY = 'echo_wallet_address';
    
    // 钱包状态
    let currentState = {
        isConnected: false,
        address: null,
        chainId: null,
        provider: null
    };
    
    // 初始化检查
    function init() {
        loadState();
        updateAllUI();
        setupEventListeners();
        
        // 如果之前有连接，尝试自动重连
        if (currentState.isConnected && currentState.address) {
            checkWalletConnection();
        }
    }
    
    // 从 localStorage 加载状态
    function loadState() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                currentState = JSON.parse(saved);
            }
        } catch (e) {
            console.log('ECHO: No saved wallet state');
        }
    }
    
    // 保存状态到 localStorage
    function saveState() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
            if (currentState.address) {
                localStorage.setItem(LAST_ADDRESS_KEY, currentState.address);
            }
        } catch (e) {
            console.error('ECHO: Failed to save wallet state', e);
        }
    }
    
    // 清除状态
    function clearState() {
        currentState = {
            isConnected: false,
            address: null,
            chainId: null,
            provider: null
        };
        localStorage.removeItem(STORAGE_KEY);
        updateAllUI();
    }
    
    // 检查钱包连接
    async function checkWalletConnection() {
        if (typeof window.ethereum === 'undefined') {
            return false;
        }
        
        try {
            const accounts = await window.ethereum.request({ 
                method: 'eth_accounts' 
            });
            
            if (accounts.length > 0) {
                currentState.isConnected = true;
                currentState.address = accounts[0];
                currentState.provider = 'metamask';
                
                // 获取链ID
                const chainId = await window.ethereum.request({ 
                    method: 'eth_chainId' 
                });
                currentState.chainId = parseInt(chainId, 16);
                
                saveState();
                updateAllUI();
                return true;
            } else {
                clearState();
                return false;
            }
        } catch (error) {
            console.error('ECHO: Wallet check failed', error);
            clearState();
            return false;
        }
    }
    
    // 连接钱包
    async function connectWallet() {
        if (typeof window.ethereum === 'undefined') {
            alert('请先安装 MetaMask 插件');
            window.open('https://metamask.io/', '_blank');
            return false;
        }
        
        try {
            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            
            if (accounts.length > 0) {
                currentState.isConnected = true;
                currentState.address = accounts[0];
                currentState.provider = 'metamask';
                
                const chainId = await window.ethereum.request({ 
                    method: 'eth_chainId' 
                });
                currentState.chainId = parseInt(chainId, 16);
                
                saveState();
                updateAllUI();
                
                // 触发连接成功事件
                window.dispatchEvent(new CustomEvent('echo:walletConnected', {
                    detail: { address: currentState.address }
                }));
                
                return true;
            }
        } catch (error) {
            console.error('ECHO: Wallet connection failed', error);
            alert('连接失败：' + (error.message || '用户取消'));
        }
        
        return false;
    }
    
    // 断开连接
    async function disconnectWallet() {
        clearState();
        window.dispatchEvent(new CustomEvent('echo:walletDisconnected'));
        
        // 如果在个人中心页面，可以跳转到首页
        if (window.location.pathname.includes('profile.html')) {
            window.location.href = 'index.html';
        }
    }
    
    // 格式化地址显示
    function formatAddress(address) {
        if (!address) return '';
        return address.slice(0, 6) + '...' + address.slice(-4);
    }
    
    // 更新所有页面UI
    function updateAllUI() {
        // 更新桌面端导航按钮
        updateDesktopNav();
        // 更新移动端导航
        updateMobileNav();
        // 更新用户菜单
        updateUserMenu();
    }
    
    // 更新桌面端导航
    function updateDesktopNav() {
        const connectBtn = document.getElementById('connectWallet');
        const userMenu = document.getElementById('userMenu');
        
        if (!connectBtn && !userMenu) return;
        
        if (currentState.isConnected) {
            // 已登录状态
            if (connectBtn) connectBtn.style.display = 'none';
            if (userMenu) {
                userMenu.style.display = 'flex';
                const userName = userMenu.querySelector('#userName');
                if (userName) {
                    userName.textContent = '吾';
                }
            }
        } else {
            // 未登录状态
            if (connectBtn) connectBtn.style.display = 'flex';
            if (userMenu) userMenu.style.display = 'none';
        }
    }
    
    // 更新移动端导航
    function updateMobileNav() {
        const mobileConnectBtn = document.getElementById('mobileConnectWallet');
        const mobileUserMenu = document.getElementById('mobileUserMenu');
        
        if (!mobileConnectBtn && !mobileUserMenu) return;
        
        if (currentState.isConnected) {
            if (mobileConnectBtn) mobileConnectBtn.style.display = 'none';
            if (mobileUserMenu) {
                mobileUserMenu.style.display = 'flex';
                const span = mobileUserMenu.querySelector('span');
                if (span) span.textContent = '吾';
            }
        } else {
            if (mobileConnectBtn) mobileConnectBtn.style.display = 'flex';
            if (mobileUserMenu) mobileUserMenu.style.display = 'none';
        }
    }
    
    // 更新用户菜单
    function updateUserMenu() {
        const userAvatar = document.getElementById('userAvatar');
        if (userAvatar && currentState.address) {
            // 使用 Blockies 生成头像或使用默认
            userAvatar.src = `https://api.dicebear.com/7.x/identicon/svg?seed=${currentState.address}`;
            userAvatar.alt = formatAddress(currentState.address);
        }
    }
    
    // 设置事件监听
    function setupEventListeners() {
        // MetaMask 账户变化
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    // 用户断开了钱包
                    clearState();
                } else {
                    // 切换了账户
                    currentState.address = accounts[0];
                    saveState();
                    updateAllUI();
                }
            });
            
            window.ethereum.on('chainChanged', (chainId) => {
                currentState.chainId = parseInt(chainId, 16);
                saveState();
            });
        }
        
        // 绑定连接按钮点击事件
        document.addEventListener('click', (e) => {
            const target = e.target.closest('#connectWallet, #mobileConnectWallet');
            if (target) {
                e.preventDefault();
                connectWallet().then(success => {
                    if (success) {
                        // 连接成功，跳转到个人中心
                        window.location.href = 'profile.html';
                    }
                });
            }
        });
        
        // 绑定用户菜单点击（登出）
        document.addEventListener('click', (e) => {
            const target = e.target.closest('#userMenu, #mobileUserMenu');
            if (target && currentState.isConnected) {
                // 点击已登录的用户按钮，显示菜单或跳转
                if (!window.location.pathname.includes('profile.html')) {
                    window.location.href = 'profile.html';
                }
            }
        });
    }
    
    // 公共API
    window.EchoWallet = {
        connect: connectWallet,
        disconnect: disconnectWallet,
        check: checkWalletConnection,
        getState: () => ({ ...currentState }),
        formatAddress: formatAddress,
        isConnected: () => currentState.isConnected,
        getAddress: () => currentState.address
    };
    
    // DOM加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();