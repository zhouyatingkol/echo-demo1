/**
 * ECHO Wallet Manager - 真实的 Web3 钱包连接与管理
 * 集成 ethers.js v6，实现 MetaMask 连接、签名验证、余额查询
 * 
 * 东方极简美学：错误提示如墨滴落水，静谧而有力
 */

(function() {
    'use strict';
    
    // ===== 配置常量 =====
    const STORAGE_KEY = 'echo_wallet_state';
    const LAST_ADDRESS_KEY = 'echo_wallet_address';
    const SIGNATURE_MESSAGE = 'ECHO\n\n由此而入，皆可生长\n\n签名验证您的身份\nNonce: ';
    
    // 网络配置
    const NETWORKS = {
        1: { name: 'Ethereum Mainnet', symbol: 'ETH', explorer: 'https://etherscan.io' },
        11155111: { name: 'Sepolia Testnet', symbol: 'ETH', explorer: 'https://sepolia.etherscan.io' },
        5: { name: 'Goerli Testnet', symbol: 'ETH', explorer: 'https://goerli.etherscan.io' },
        1337: { name: 'Local Network', symbol: 'ETH', explorer: '' },
        31337: { name: 'Hardhat Local', symbol: 'ETH', explorer: '' }
    };
    
    // ===== 状态管理 =====
    let currentState = {
        isConnected: false,
        address: null,
        chainId: null,
        networkName: null,
        balance: null,
        provider: null,
        signer: null,
        ethersProvider: null,  // ethers BrowserProvider 实例
        signature: null,       // 签名验证结果
        isVerified: false      // 是否通过签名验证
    };
    
    // ===== 初始化 =====
    function init() {
        loadState();
        setupEthersProvider();
        setupEventListeners();
        updateAllUI();
        
        // 如果之前有连接，尝试恢复
        if (currentState.isConnected && currentState.address) {
            restoreConnection();
        }
    }
    
    // ===== Ethers.js 集成 =====
    
    // 设置 ethers provider
    async function setupEthersProvider() {
        if (typeof window.ethereum !== 'undefined') {
            try {
                // ethers v6: BrowserProvider 替代 Web3Provider
                currentState.ethersProvider = new ethers.BrowserProvider(window.ethereum, {
                    name: 'ECHO',
                    chainId: currentState.chainId || 1
                });
                return true;
            } catch (error) {
                console.error('ECHO: Failed to setup ethers provider', error);
                return false;
            }
        }
        return false;
    }
    
    // 获取 Signer
    async function getSigner() {
        if (!currentState.ethersProvider) {
            await setupEthersProvider();
        }
        if (currentState.ethersProvider) {
            try {
                return await currentState.ethersProvider.getSigner();
            } catch (error) {
                console.error('ECHO: Failed to get signer', error);
            }
        }
        return null;
    }
    
    // ===== 钱包连接核心功能 =====
    
    // 连接 MetaMask
    async function connectWallet() {
        // 检查是否安装钱包
        if (typeof window.ethereum === 'undefined') {
            showEchoToast({
                title: '未寻得链上之钥',
                message: '请先安装 MetaMask，开启 Web3 之门',
                type: 'warning',
                action: {
                    text: '前往安装',
                    href: 'https://metamask.io/',
                    external: true
                }
            });
            return { success: false, error: 'WALLET_NOT_INSTALLED' };
        }
        
        try {
            // 初始化 ethers provider
            await setupEthersProvider();
            
            // 请求连接账户
            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            
            if (accounts.length === 0) {
                showEchoToast({
                    title: '连接未竟',
                    message: '未获得账户访问权限',
                    type: 'warning'
                });
                return { success: false, error: 'NO_ACCOUNTS' };
            }
            
            const address = accounts[0];
            
            // 获取链ID
            const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
            const chainId = parseInt(chainIdHex, 16);
            
            // 获取余额
            const balance = await fetchBalance(address);
            
            // 获取 signer
            const signer = await getSigner();
            
            // 更新状态
            currentState = {
                ...currentState,
                isConnected: true,
                address: address,
                chainId: chainId,
                networkName: NETWORKS[chainId]?.name || `Chain ${chainId}`,
                balance: balance,
                signer: signer,
                provider: 'metamask'
            };
            
            saveState();
            updateAllUI();
            
            // 触发连接成功事件
            window.dispatchEvent(new CustomEvent('echo:walletConnected', {
                detail: { 
                    address: currentState.address,
                    chainId: currentState.chainId,
                    balance: currentState.balance
                }
            }));
            
            showEchoToast({
                title: '已入此境',
                message: `欢迎，${formatAddress(address)}`,
                type: 'success'
            });
            
            return { 
                success: true, 
                address: address,
                chainId: chainId,
                balance: balance
            };
            
        } catch (error) {
            console.error('ECHO: Wallet connection failed', error);
            return handleConnectionError(error);
        }
    }
    
    // 签名验证（用于身份验证）
    async function verifyWallet() {
        if (!currentState.isConnected || !currentState.address) {
            showEchoToast({
                title: '先入而后证',
                message: '请先连接钱包',
                type: 'warning'
            });
            return { success: false, error: 'NOT_CONNECTED' };
        }
        
        try {
            const signer = await getSigner();
            if (!signer) {
                throw new Error('NO_SIGNER');
            }
            
            // 生成带时间戳的 nonce
            const nonce = `${Date.now()}`;
            const message = SIGNATURE_MESSAGE + nonce;
            
            showEchoToast({
                title: '待君落印',
                message: '请在钱包中签名以验证身份',
                type: 'info',
                duration: 10000
            });
            
            // 请求签名 - ethers v6 API
            const signature = await signer.signMessage(message);
            
            // 验证签名
            const recoveredAddress = ethers.verifyMessage(message, signature);
            
            if (recoveredAddress.toLowerCase() === currentState.address.toLowerCase()) {
                currentState.signature = signature;
                currentState.isVerified = true;
                saveState();
                
                showEchoToast({
                    title: '印鉴已合',
                    message: '身份验证成功',
                    type: 'success'
                });
                
                window.dispatchEvent(new CustomEvent('echo:walletVerified', {
                    detail: { address: currentState.address, signature }
                }));
                
                return { success: true, signature };
            } else {
                throw new Error('SIGNATURE_MISMATCH');
            }
            
        } catch (error) {
            console.error('ECHO: Signature verification failed', error);
            return handleSignatureError(error);
        }
    }
    
    // 恢复连接（页面刷新后）
    async function restoreConnection() {
        if (typeof window.ethereum === 'undefined') {
            clearState();
            return false;
        }
        
        try {
            // 检查是否仍有权限
            const accounts = await window.ethereum.request({ 
                method: 'eth_accounts' 
            });
            
            if (accounts.length === 0) {
                clearState();
                return false;
            }
            
            // 重新初始化
            await setupEthersProvider();
            
            const address = accounts[0];
            const chainIdHex = await window.ethereum.request({ method: 'eth_chainId' });
            const chainId = parseInt(chainIdHex, 16);
            const balance = await fetchBalance(address);
            const signer = await getSigner();
            
            currentState = {
                ...currentState,
                isConnected: true,
                address: address,
                chainId: chainId,
                networkName: NETWORKS[chainId]?.name || `Chain ${chainId}`,
                balance: balance,
                signer: signer,
                provider: 'metamask'
            };
            
            saveState();
            updateAllUI();
            
            return true;
            
        } catch (error) {
            console.error('ECHO: Restore connection failed', error);
            clearState();
            return false;
        }
    }
    
    // 断开连接
    async function disconnectWallet() {
        clearState();
        
        window.dispatchEvent(new CustomEvent('echo:walletDisconnected'));
        
        showEchoToast({
            title: '已离此境',
            message: '钱包已断开连接',
            type: 'info'
        });
        
        // 如果在个人中心页面，跳转到首页
        if (window.location.pathname.includes('profile.html')) {
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        }
        
        return true;
    }
    
    // ===== 区块链数据查询 =====
    
    // 获取 ETH 余额
    async function fetchBalance(address) {
        if (!currentState.ethersProvider || !address) return null;
        
        try {
            // ethers v6: getBalance 返回 bigint
            const balanceWei = await currentState.ethersProvider.getBalance(address);
            // 转换为 ETH 字符串
            const balanceEth = ethers.formatEther(balanceWei);
            return {
                wei: balanceWei.toString(),
                eth: parseFloat(balanceEth).toFixed(4),
                formatted: formatEthBalance(balanceEth)
            };
        } catch (error) {
            console.error('ECHO: Failed to fetch balance', error);
            return null;
        }
    }
    
    // 刷新余额
    async function refreshBalance() {
        if (!currentState.isConnected || !currentState.address) {
            return null;
        }
        
        const balance = await fetchBalance(currentState.address);
        currentState.balance = balance;
        saveState();
        updateAllUI();
        
        window.dispatchEvent(new CustomEvent('echo:balanceUpdated', {
            detail: { balance }
        }));
        
        return balance;
    }
    
    // ===== 网络管理 =====
    
    // 切换网络
    async function switchNetwork(targetChainId) {
        if (!window.ethereum) {
            showEchoToast({
                title: '无链可换',
                message: '请先安装 MetaMask',
                type: 'warning'
            });
            return false;
        }
        
        const chainIdHex = '0x' + targetChainId.toString(16);
        
        try {
            await window.ethereum.request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: chainIdHex }]
            });
            return true;
        } catch (error) {
            // 如果网络未添加，尝试添加
            if (error.code === 4902) {
                return await addNetwork(targetChainId);
            }
            
            if (error.code === 4001) {
                showEchoToast({
                    title: '换链未竟',
                    message: '用户取消了网络切换',
                    type: 'warning'
                });
            } else {
                showEchoToast({
                    title: '换链受阻',
                    message: error.message || '网络切换失败',
                    type: 'error'
                });
            }
            return false;
        }
    }
    
    // 添加网络
    async function addNetwork(chainId) {
        // 常用网络配置
        const networkConfigs = {
            11155111: {
                chainId: '0xaa36a7',
                chainName: 'Sepolia Testnet',
                nativeCurrency: { name: 'Sepolia ETH', symbol: 'ETH', decimals: 18 },
                rpcUrls: ['https://sepolia.infura.io/v3/'],
                blockExplorerUrls: ['https://sepolia.etherscan.io']
            },
            5: {
                chainId: '0x5',
                chainName: 'Goerli Testnet',
                nativeCurrency: { name: 'Goerli ETH', symbol: 'ETH', decimals: 18 },
                rpcUrls: ['https://goerli.infura.io/v3/'],
                blockExplorerUrls: ['https://goerli.etherscan.io']
            }
        };
        
        const config = networkConfigs[chainId];
        if (!config) {
            showEchoToast({
                title: '未知之链',
                message: `暂不支持链 ID: ${chainId}`,
                type: 'warning'
            });
            return false;
        }
        
        try {
            await window.ethereum.request({
                method: 'wallet_addEthereumChain',
                params: [config]
            });
            return true;
        } catch (error) {
            showEchoToast({
                title: '添链未竟',
                message: error.message || '无法添加网络',
                type: 'error'
            });
            return false;
        }
    }
    
    // ===== 错误处理 =====
    
    function handleConnectionError(error) {
        let toastConfig = {
            title: '入链未竟',
            message: '连接失败，请重试',
            type: 'error'
        };
        
        if (error.code === 4001) {
            // 用户拒绝
            toastConfig = {
                title: '入链已拒',
                message: '您拒绝了连接请求，自主权在你',
                type: 'warning'
            };
        } else if (error.code === -32002) {
            // 已有待处理请求
            toastConfig = {
                title: '请观其变',
                message: '已有连接请求 pending，请查看 MetaMask',
                type: 'info'
            };
        } else if (error.message?.includes('already processing')) {
            toastConfig = {
                title: '静待其成',
                message: '请求处理中，请查看钱包插件',
                type: 'info'
            };
        } else if (error.message?.includes('user rejected')) {
            toastConfig = {
                title: '入链已拒',
                message: '您拒绝了连接请求',
                type: 'warning'
            };
        }
        
        showEchoToast(toastConfig);
        return { success: false, error: error.code || error.message };
    }
    
    function handleSignatureError(error) {
        let toastConfig = {
            title: '印鉴未合',
            message: '签名验证失败',
            type: 'error'
        };
        
        if (error.code === 4001 || error.message?.includes('rejected') || error.message?.includes('denied')) {
            toastConfig = {
                title: '印未落',
                message: '您取消了签名，验证未竟',
                type: 'warning'
            };
        } else if (error.message === 'NO_SIGNER') {
            toastConfig = {
                title: '无权落印',
                message: '无法获取签名权限',
                type: 'error'
            };
        } else if (error.message === 'SIGNATURE_MISMATCH') {
            toastConfig = {
                title: '印鉴不合',
                message: '签名验证失败，地址不匹配',
                type: 'error'
            };
        }
        
        showEchoToast(toastConfig);
        return { success: false, error: error.code || error.message };
    }
    
    // ===== UI 组件：ECHO 风格 Toast 提示 =====
    
    function showEchoToast({ title, message, type = 'info', duration = 4000, action }) {
        // 移除现有 toast
        const existingToast = document.querySelector('.echo-toast');
        if (existingToast) {
            existingToast.remove();
        }
        
        // 颜色配置
        const colors = {
            success: { border: '#7A8B7C', bg: 'rgba(122, 139, 124, 0.08)', icon: '◉' },
            warning: { border: '#B89B6C', bg: 'rgba(184, 155, 108, 0.08)', icon: '◈' },
            error: { border: '#A03020', bg: 'rgba(160, 48, 32, 0.06)', icon: '◉' },
            info: { border: '#8B9DC3', bg: 'rgba(139, 157, 195, 0.08)', icon: '◈' }
        };
        
        const color = colors[type] || colors.info;
        
        // 创建 toast
        const toast = document.createElement('div');
        toast.className = 'echo-toast';
        toast.innerHTML = `
            <div class="echo-toast__inner">
                <span class="echo-toast__icon">${color.icon}</span>
                <div class="echo-toast__content">
                    <div class="echo-toast__title">${title}</div>
                    <div class="echo-toast__message">${message}</div>
                </div>
                ${action ? `<a href="${action.href}" ${action.external ? 'target="_blank"' : ''} class="echo-toast__action">${action.text}</a>` : ''}
                <button class="echo-toast__close" onclick="this.closest('.echo-toast').remove()">×</button>
            </div>
        `;
        
        // 样式
        toast.style.cssText = `
            position: fixed;
            top: 80px;
            right: 24px;
            z-index: 10000;
            max-width: 360px;
            animation: echoToastIn 0.5s cubic-bezier(0.23, 1, 0.32, 1);
        `;
        
        // 内部样式
        const style = document.createElement('style');
        style.textContent = `
            .echo-toast__inner {
                background: ${color.bg};
                border-left: 2px solid ${color.border};
                border-radius: 2px;
                padding: 16px 20px;
                display: flex;
                align-items: flex-start;
                gap: 12px;
                box-shadow: 0 4px 20px rgba(0,0,0,0.06);
                backdrop-filter: blur(10px);
            }
            .echo-toast__icon {
                color: ${color.border};
                font-size: 0.8rem;
                line-height: 1.6;
            }
            .echo-toast__content {
                flex: 1;
            }
            .echo-toast__title {
                font-family: 'LXGW WenKai', 'Noto Serif SC', serif;
                font-size: 0.95rem;
                color: #1A1A1A;
                letter-spacing: 0.1em;
                margin-bottom: 4px;
            }
            .echo-toast__message {
                font-family: 'Noto Serif SC', serif;
                font-size: 0.8rem;
                color: #4A4A4A;
                letter-spacing: 0.05em;
                line-height: 1.5;
            }
            .echo-toast__action {
                font-family: 'Noto Serif SC', serif;
                font-size: 0.75rem;
                color: ${color.border};
                text-decoration: none;
                border-bottom: 0.5px solid ${color.border};
                padding-bottom: 1px;
                white-space: nowrap;
                transition: opacity 0.3s;
            }
            .echo-toast__action:hover {
                opacity: 0.7;
            }
            .echo-toast__close {
                background: none;
                border: none;
                color: #7A7A7A;
                font-size: 1.2rem;
                cursor: pointer;
                padding: 0;
                width: 20px;
                height: 20px;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0.5;
                transition: opacity 0.3s;
            }
            .echo-toast__close:hover {
                opacity: 1;
            }
            @keyframes echoToastIn {
                from {
                    opacity: 0;
                    transform: translateX(20px);
                }
                to {
                    opacity: 1;
                    transform: translateX(0);
                }
            }
            @keyframes echoToastOut {
                from {
                    opacity: 1;
                    transform: translateX(0);
                }
                to {
                    opacity: 0;
                    transform: translateX(20px);
                }
            }
        `;
        
        document.head.appendChild(style);
        document.body.appendChild(toast);
        
        // 自动关闭
        if (duration > 0) {
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.style.animation = 'echoToastOut 0.4s ease forwards';
                    setTimeout(() => toast.remove(), 400);
                }
            }, duration);
        }
        
        return toast;
    }
    
    // ===== 状态持久化 =====
    
    function loadState() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                // 只恢复非敏感信息
                currentState.address = parsed.address || null;
                currentState.chainId = parsed.chainId || null;
                currentState.networkName = parsed.networkName || null;
                currentState.isConnected = parsed.isConnected || false;
                currentState.isVerified = parsed.isVerified || false;
            }
        } catch (e) {
            console.log('ECHO: No saved wallet state');
        }
    }
    
    function saveState() {
        try {
            // 不保存 signer 和 provider 实例
            const stateToSave = {
                isConnected: currentState.isConnected,
                address: currentState.address,
                chainId: currentState.chainId,
                networkName: currentState.networkName,
                balance: currentState.balance,
                isVerified: currentState.isVerified,
                provider: currentState.provider
            };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(stateToSave));
            if (currentState.address) {
                localStorage.setItem(LAST_ADDRESS_KEY, currentState.address);
            }
        } catch (e) {
            console.error('ECHO: Failed to save wallet state', e);
        }
    }
    
    function clearState() {
        currentState = {
            isConnected: false,
            address: null,
            chainId: null,
            networkName: null,
            balance: null,
            provider: null,
            signer: null,
            ethersProvider: null,
            signature: null,
            isVerified: false
        };
        localStorage.removeItem(STORAGE_KEY);
        updateAllUI();
    }
    
    // ===== 工具函数 =====
    
    function formatAddress(address) {
        if (!address) return '';
        return address.slice(0, 6) + '...' + address.slice(-4);
    }
    
    function formatEthBalance(balanceEth) {
        if (!balanceEth) return '0 ETH';
        const num = parseFloat(balanceEth);
        if (num === 0) return '0 ETH';
        if (num < 0.001) return '<0.001 ETH';
        return num.toFixed(4) + ' ETH';
    }
    
    function getExplorerUrl(type, value) {
        const network = NETWORKS[currentState.chainId];
        if (!network || !network.explorer) return '#';
        
        const paths = {
            address: `/address/${value}`,
            tx: `/tx/${value}`,
            token: `/token/${value}`
        };
        
        return network.explorer + (paths[type] || '');
    }
    
    // ===== UI 更新 =====
    
    function updateAllUI() {
        updateDesktopNav();
        updateMobileNav();
        updateProfileWalletInfo();
    }
    
    function updateDesktopNav() {
        const connectBtn = document.getElementById('connectWallet');
        const userMenu = document.getElementById('userMenu');
        
        if (!connectBtn && !userMenu) return;
        
        if (currentState.isConnected) {
            if (connectBtn) connectBtn.style.display = 'none';
            if (userMenu) {
                userMenu.style.display = 'flex';
                const userName = userMenu.querySelector('#userName');
                if (userName) {
                    userName.textContent = formatAddress(currentState.address) || '吾';
                }
            }
        } else {
            if (connectBtn) connectBtn.style.display = 'flex';
            if (userMenu) userMenu.style.display = 'none';
        }
    }
    
    function updateMobileNav() {
        const mobileConnectBtn = document.getElementById('mobileConnectWallet');
        const mobileUserMenu = document.getElementById('mobileUserMenu');
        
        if (!mobileConnectBtn && !mobileUserMenu) return;
        
        if (currentState.isConnected) {
            if (mobileConnectBtn) mobileConnectBtn.style.display = 'none';
            if (mobileUserMenu) {
                mobileUserMenu.style.display = 'flex';
                const span = mobileUserMenu.querySelector('span');
                if (span) {
                    span.textContent = formatAddress(currentState.address) || '吾';
                }
            }
        } else {
            if (mobileConnectBtn) mobileConnectBtn.style.display = 'flex';
            if (mobileUserMenu) mobileUserMenu.style.display = 'none';
        }
    }
    
    // 更新个人中心钱包信息
    function updateProfileWalletInfo() {
        // 只在 profile.html 页面执行
        if (!window.location.pathname.includes('profile.html')) return;
        
        // 更新钱包卡片
        const walletAddress = document.getElementById('walletAddress');
        const walletBalance = document.getElementById('walletBalance');
        const walletNetwork = document.getElementById('walletNetwork');
        const walletExplorer = document.getElementById('walletExplorer');
        const verifyBtn = document.getElementById('verifyWalletBtn');
        const verifyStatus = document.getElementById('verifyStatus');
        
        if (walletAddress) {
            walletAddress.textContent = currentState.address 
                ? formatAddress(currentState.address) 
                : '未连接';
            walletAddress.title = currentState.address || '';
        }
        
        if (walletBalance) {
            walletBalance.textContent = currentState.balance 
                ? currentState.balance.formatted 
                : '-- ETH';
        }
        
        if (walletNetwork) {
            walletNetwork.textContent = currentState.networkName || '未知网络';
        }
        
        if (walletExplorer && currentState.address) {
            walletExplorer.href = getExplorerUrl('address', currentState.address);
            walletExplorer.style.display = 'inline-flex';
        } else if (walletExplorer) {
            walletExplorer.style.display = 'none';
        }
        
        if (verifyStatus) {
            if (currentState.isVerified) {
                verifyStatus.innerHTML = '<span style="color: #7A8B7C;">◉ 已验证</span>';
            } else {
                verifyStatus.innerHTML = '<span style="color: #B89B6C;">◈ 未验证</span>';
            }
        }
        
        if (verifyBtn) {
            verifyBtn.textContent = currentState.isVerified ? '重新验证' : '签名验证';
            verifyBtn.onclick = () => verifyWallet();
        }
    }
    
    // ===== 事件监听 =====
    
    function setupEventListeners() {
        // MetaMask 账户变化
        if (window.ethereum) {
            window.ethereum.on('accountsChanged', (accounts) => {
                if (accounts.length === 0) {
                    showEchoToast({
                        title: '已离此境',
                        message: '钱包已断开连接',
                        type: 'info'
                    });
                    clearState();
                } else {
                    const newAddress = accounts[0];
                    if (newAddress !== currentState.address) {
                        showEchoToast({
                            title: '换了新印',
                            message: `已切换至 ${formatAddress(newAddress)}`,
                            type: 'info'
                        });
                        currentState.address = newAddress;
                        currentState.isVerified = false;
                        currentState.signature = null;
                        refreshBalance();
                    }
                }
            });
            
            window.ethereum.on('chainChanged', (chainId) => {
                const newChainId = parseInt(chainId, 16);
                showEchoToast({
                    title: '换境',
                    message: `已切换至 ${NETWORKS[newChainId]?.name || '新网络'}`,
                    type: 'info'
                });
                currentState.chainId = newChainId;
                currentState.networkName = NETWORKS[newChainId]?.name || `Chain ${newChainId}`;
                refreshBalance();
            });
        }
        
        // 绑定连接按钮点击事件
        document.addEventListener('click', (e) => {
            const target = e.target.closest('#connectWallet, #mobileConnectWallet, [data-action="connectWallet"]');
            if (target) {
                e.preventDefault();
                connectWallet().then(result => {
                    if (result.success && !window.location.pathname.includes('profile.html')) {
                        window.location.href = 'profile.html';
                    }
                });
            }
        });
        
        // 绑定断开连接按钮
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-action="disconnectWallet"]');
            if (target) {
                e.preventDefault();
                disconnectWallet();
            }
        });
        
        // 绑定刷新余额按钮
        document.addEventListener('click', (e) => {
            const target = e.target.closest('[data-action="refreshBalance"]');
            if (target) {
                e.preventDefault();
                refreshBalance();
                showEchoToast({
                    title: '余额已更',
                    message: '您的 ETH 余额已更新',
                    type: 'success'
                });
            }
        });
        
        // 用户菜单点击 - 跳转个人中心
        document.addEventListener('click', (e) => {
            const target = e.target.closest('#userMenu, #mobileUserMenu');
            if (target && currentState.isConnected) {
                if (!window.location.pathname.includes('profile.html')) {
                    window.location.href = 'profile.html';
                }
            }
        });
    }
    
    // ===== 公共 API =====
    
    window.EchoWallet = {
        // 核心功能
        connect: connectWallet,
        disconnect: disconnectWallet,
        verify: verifyWallet,
        restore: restoreConnection,
        refreshBalance: refreshBalance,
        
        // 网络管理
        switchNetwork: switchNetwork,
        addNetwork: addNetwork,
        
        // 状态查询
        getState: () => ({ ...currentState }),
        isConnected: () => currentState.isConnected,
        isVerified: () => currentState.isVerified,
        getAddress: () => currentState.address,
        getBalance: () => currentState.balance,
        getChainId: () => currentState.chainId,
        getNetworkName: () => currentState.networkName,
        
        // 工具函数
        formatAddress: formatAddress,
        formatBalance: formatEthBalance,
        getExplorerUrl: getExplorerUrl,
        
        // UI
        showToast: showEchoToast,
        
        // ethers 相关
        getProvider: () => currentState.ethersProvider,
        getSigner: getSigner,
        
        // 事件监听辅助
        on: (event, callback) => {
            window.addEventListener(`echo:${event}`, (e) => callback(e.detail));
        },
        off: (event, callback) => {
            window.removeEventListener(`echo:${event}`, callback);
        }
    };
    
    // DOM加载完成后初始化
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
