/**
 * ECHO 移动端导航控制
 * Mobile Navigation Controller
 * 
 * 功能：
 * 1. 移动端菜单切换
 * 2. 用户菜单状态同步（桌面端和移动端）
 * 3. 触摸反馈优化
 * 4. 外部点击关闭菜单
 */

(function() {
    'use strict';

    // 等待DOM加载完成
    document.addEventListener('DOMContentLoaded', function() {
        initMobileNav();
        initTouchFeedback();
        initWalletStateSync();
    });

    /**
     * 初始化移动端导航
     */
    function initMobileNav() {
        const menuBtn = document.getElementById('menuBtn');
        const mobileMenu = document.getElementById('mobileMenu');
        
        if (!menuBtn || !mobileMenu) return;

        // 菜单切换
        menuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            toggleMobileMenu();
        });

        // 菜单项点击后自动关闭
        const mobileLinks = mobileMenu.querySelectorAll('.navbar__link, .navbar__user');
        mobileLinks.forEach(function(link) {
            link.addEventListener('click', function() {
                closeMobileMenu();
            });
        });

        // 外部点击关闭
        document.addEventListener('click', function(e) {
            if (mobileMenu.classList.contains('is-open') && 
                !mobileMenu.contains(e.target) && 
                !menuBtn.contains(e.target)) {
                closeMobileMenu();
            }
        });

        // ESC键关闭
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
                closeMobileMenu();
            }
        });

        // 滚动时关闭菜单
        let lastScrollY = window.scrollY;
        window.addEventListener('scroll', function() {
            if (mobileMenu.classList.contains('is-open') && 
                Math.abs(window.scrollY - lastScrollY) > 50) {
                closeMobileMenu();
            }
            lastScrollY = window.scrollY;
        }, { passive: true });
    }

    /**
     * 切换移动端菜单
     */
    function toggleMobileMenu() {
        const menuBtn = document.getElementById('menuBtn');
        const mobileMenu = document.getElementById('mobileMenu');
        
        const isExpanded = menuBtn.getAttribute('aria-expanded') === 'true';
        
        if (isExpanded) {
            closeMobileMenu();
        } else {
            openMobileMenu();
        }
    }

    /**
     * 打开移动端菜单
     */
    function openMobileMenu() {
        const menuBtn = document.getElementById('menuBtn');
        const mobileMenu = document.getElementById('mobileMenu');
        
        menuBtn.setAttribute('aria-expanded', 'true');
        mobileMenu.setAttribute('aria-hidden', 'false');
        mobileMenu.classList.add('is-open');
        
        // 禁止背景滚动
        document.body.style.overflow = 'hidden';
        
        // 汉堡按钮动画
        const lines = menuBtn.querySelectorAll('.navbar__menu-line');
        if (lines.length === 3) {
            lines[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
            lines[1].style.opacity = '0';
            lines[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
        }
    }

    /**
     * 关闭移动端菜单
     */
    function closeMobileMenu() {
        const menuBtn = document.getElementById('menuBtn');
        const mobileMenu = document.getElementById('mobileMenu');
        
        if (!mobileMenu.classList.contains('is-open')) return;
        
        menuBtn.setAttribute('aria-expanded', 'false');
        mobileMenu.setAttribute('aria-hidden', 'true');
        mobileMenu.classList.remove('is-open');
        
        // 恢复背景滚动
        document.body.style.overflow = '';
        
        // 汉堡按钮恢复
        const lines = menuBtn.querySelectorAll('.navbar__menu-line');
        if (lines.length === 3) {
            lines[0].style.transform = '';
            lines[1].style.opacity = '';
            lines[2].style.transform = '';
        }
    }

    /**
     * 初始化触摸反馈
     */
    function initTouchFeedback() {
        // 为所有按钮和可点击元素添加触摸反馈
        const touchElements = document.querySelectorAll(
            'button, a, .btn-ceramic, .btn-celadon, .realm-card, ' +
            '.rights-card, .asset-card, .similar-card, .filter-tag, ' +
            '.price-option, .setting-option, .page-number'
        );

        touchElements.forEach(function(el) {
            el.classList.add('touch-feedback');
            
            // 添加触摸开始效果
            el.addEventListener('touchstart', function() {
                this.style.opacity = '0.7';
            }, { passive: true });
            
            // 触摸结束恢复
            el.addEventListener('touchend', function() {
                this.style.opacity = '';
            }, { passive: true });
            
            // 触摸取消恢复
            el.addEventListener('touchcancel', function() {
                this.style.opacity = '';
            }, { passive: true });
        });
    }

    /**
     * 初始化钱包状态同步
     * 同步桌面端和移动端用户菜单状态
     */
    function initWalletStateSync() {
        const connectWallet = document.getElementById('connectWallet');
        const userMenu = document.getElementById('userMenu');
        const mobileConnectWallet = document.getElementById('mobileConnectWallet');
        const mobileUserMenu = document.getElementById('mobileUserMenu');

        // 检查钱包连接状态（从localStorage或全局状态）
        function checkWalletState() {
            const isConnected = localStorage.getItem('walletConnected') === 'true';
            const walletAddress = localStorage.getItem('walletAddress');
            
            updateWalletUI(isConnected, walletAddress);
        }

        // 更新UI状态
        function updateWalletUI(isConnected, address) {
            if (isConnected) {
                // 桌面端
                if (connectWallet) connectWallet.style.display = 'none';
                if (userMenu) {
                    userMenu.style.display = 'flex';
                    const userName = userMenu.querySelector('#userName');
                    if (userName && address) {
                        userName.textContent = formatAddress(address);
                    }
                }
                
                // 移动端
                if (mobileConnectWallet) mobileConnectWallet.style.display = 'none';
                if (mobileUserMenu) {
                    mobileUserMenu.style.display = 'flex';
                    const mobileUserName = mobileUserMenu.querySelector('span');
                    if (mobileUserName && address) {
                        mobileUserName.textContent = formatAddress(address);
                    }
                }
            } else {
                // 桌面端
                if (connectWallet) connectWallet.style.display = 'flex';
                if (userMenu) userMenu.style.display = 'none';
                
                // 移动端
                if (mobileConnectWallet) mobileConnectWallet.style.display = 'flex';
                if (mobileUserMenu) mobileUserMenu.style.display = 'none';
            }
        }

        // 格式化地址显示
        function formatAddress(address) {
            if (!address || address.length < 10) return '吾';
            return address.slice(0, 4) + '...' + address.slice(-4);
        }

        // 连接钱包事件
        function handleConnectWallet() {
            // 触发钱包连接（与现有wallet.js兼容）
            if (typeof window.connectWallet === 'function') {
                window.connectWallet();
            } else {
                // 默认跳转到登录页
                window.location.href = 'login.html';
            }
        }

        // 打开用户菜单
        function handleOpenUserMenu() {
            // 可以在这里添加下拉菜单逻辑
            window.location.href = 'profile.html';
        }

        // 绑定事件
        if (connectWallet) {
            connectWallet.addEventListener('click', handleConnectWallet);
        }
        if (mobileConnectWallet) {
            mobileConnectWallet.addEventListener('click', handleConnectWallet);
        }
        if (userMenu) {
            userMenu.addEventListener('click', handleOpenUserMenu);
        }
        if (mobileUserMenu) {
            mobileUserMenu.addEventListener('click', handleOpenUserMenu);
        }

        // 监听钱包状态变化
        window.addEventListener('storage', function(e) {
            if (e.key === 'walletConnected' || e.key === 'walletAddress') {
                checkWalletState();
            }
        });

        // 提供全局API供其他脚本调用
        window.ECHOMobileNav = {
            updateWalletState: updateWalletUI,
            openMenu: openMobileMenu,
            closeMenu: closeMobileMenu,
            toggleMenu: toggleMobileMenu
        };

        // 初始检查
        checkWalletState();
    }

})();
