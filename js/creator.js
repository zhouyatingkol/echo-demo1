/**
 * creator.js - ECHO Creator Portal 交互逻辑
 * 创作者中心功能实现
 */

// ==================== 全局状态 ====================

const creatorState = {
    isConnected: false,
    walletAddress: null,
    contractManager: null,
    stats: {
        totalWorks: 0,
        totalRevenue: 0,
        totalLicenses: 0
    },
    works: [],
    transactions: [],
    notifications: []
};

// ==================== 工具函数 ====================

function formatAddress(address) {
    if (!address) return '';
    return address.slice(0, 6) + '...' + address.slice(-4);
}

function formatAmount(amount, decimals = 4) {
    const num = parseFloat(amount);
    if (isNaN(num)) return '0';
    if (num === 0) return '0';
    if (num < 0.001) return '< 0.001';
    return num.toFixed(decimals);
}

function showLoading(text = '加载中...') {
    const overlay = document.getElementById('loadingOverlay');
    const loadingText = document.getElementById('loadingText');
    if (overlay) overlay.classList.remove('hidden');
    if (loadingText) loadingText.textContent = text;
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) overlay.classList.add('hidden');
}

function showSuccess(message) {
    const successEl = document.getElementById('successMessage');
    if (successEl) {
        successEl.textContent = message;
        successEl.classList.remove('hidden');
        setTimeout(() => successEl.classList.add('hidden'), 3000);
    } else {
        alert('✅ ' + message);
    }
}

function showError(message) {
    alert('❌ ' + message);
}

// ==================== 钱包集成 ====================

async function initWallet() {
    // 检查 MetaMask
    if (!window.ethereum) {
        console.warn('MetaMask not found');
        return false;
    }

    // 等待 wallet.js 加载
    if (typeof walletManager === 'undefined') {
        console.warn('WalletManager not loaded');
        return false;
    }

    // 自动连接
    await walletManager.autoConnect();

    // 更新 UI
    updateWalletUI();

    // 监听钱包事件
    const connectBtn = document.getElementById('walletConnect');
    if (connectBtn) {
        connectBtn.addEventListener('click', async () => {
            if (walletManager.isConnected) {
                if (confirm('是否断开钱包连接？')) {
                    walletManager.disconnect();
                    updateWalletUI();
                }
            } else {
                await walletManager.connect();
                updateWalletUI();
            }
        });
    }

    return walletManager.isConnected;
}

function updateWalletUI() {
    const connectBtn = document.getElementById('walletConnect');
    const walletAddress = document.getElementById('walletAddress');

    creatorState.isConnected = walletManager.isConnected;
    creatorState.walletAddress = walletManager.address;

    if (walletManager.isConnected && walletManager.address) {
        const shortAddress = formatAddress(walletManager.address);
        if (connectBtn) {
            connectBtn.textContent = shortAddress;
            connectBtn.classList.add('connected');
        }
        if (walletAddress) {
            walletAddress.textContent = shortAddress;
            walletAddress.classList.remove('hidden');
        }

        // 初始化合约管理器
        initContractManager();
    } else {
        if (connectBtn) {
            connectBtn.textContent = '连接钱包';
            connectBtn.classList.remove('connected');
        }
        if (walletAddress) {
            walletAddress.textContent = '';
            walletAddress.classList.add('hidden');
        }
    }
}

async function initContractManager() {
    if (!walletManager.isConnected || !walletManager.signer) return;

    try {
        creatorState.contractManager = new ContractManagerV3(
            walletManager.provider,
            walletManager.signer
        );
        await creatorState.contractManager.init();
    } catch (error) {
        console.error('初始化合约管理器失败:', error);
    }
}

// ==================== 仪表盘功能 ====================

async function initCreatorDashboard() {
    console.log('初始化创作者仪表盘...');

    // 初始化钱包
    await initWallet();

    // 加载数据
    await loadDashboardData();
}

async function loadDashboardData() {
    showLoading('加载数据中...');

    try {
        // 模拟数据加载（实际应从合约读取）
        // 这里使用模拟数据演示
        await new Promise(resolve => setTimeout(resolve, 500));

        // 更新统计数据
        updateStats({
            totalWorks: 3,
            totalRevenue: 1250.5,
            totalLicenses: 12
        });

        // 加载作品列表
        loadWorksList();

        // 加载通知
        loadNotifications();

    } catch (error) {
        console.error('加载数据失败:', error);
    } finally {
        hideLoading();
    }
}

function updateStats(stats) {
    creatorState.stats = { ...creatorState.stats, ...stats };

    const totalWorksEl = document.getElementById('totalWorks');
    const totalRevenueEl = document.getElementById('totalRevenue');
    const totalLicensesEl = document.getElementById('totalLicenses');

    if (totalWorksEl) totalWorksEl.textContent = stats.totalWorks;
    if (totalRevenueEl) totalRevenueEl.textContent = formatAmount(stats.totalRevenue) + ' MEER';
    if (totalLicensesEl) totalLicensesEl.textContent = stats.totalLicenses;
}

function loadWorksList() {
    const worksList = document.getElementById('worksList');
    if (!worksList) return;

    // 模拟作品数据
    const works = [
        {
            id: 1,
            title: '夏日微风',
            type: '流行',
            cover: '🎵',
            price: 100,
            licenses: { onetime: 5, timed: 3 }
        },
        {
            id: 2,
            title: '星空漫步',
            type: '电子',
            cover: '✨',
            price: 150,
            licenses: { onetime: 3, timed: 1 }
        },
        {
            id: 3,
            title: '雨后清晨',
            type: '氛围',
            cover: '🌧️',
            price: 80,
            licenses: { onetime: 2, timed: 0 }
        }
    ];

    if (works.length === 0) {
        worksList.innerHTML = `
            <div class="empty-state">
                <span class="icon">🎵</span>
                <h3>暂无作品</h3>
                <p>点击"上传新作品"开始创作之旅</p>
            </div>
        `;
        return;
    }

    worksList.innerHTML = works.map(work => `
        <div class="work-item" data-id="${work.id}">
            <div class="work-cover">${work.cover}</div>
            <div class="work-info">
                <h3>${work.title}</h3>
                <div class="work-meta">
                    <span>${work.type}</span>
                    <span>•</span>
                    <span>${work.price} MEER</span>
                </div>
            </div>
            <div class="work-stats">
                <div class="work-stat">
                    <div class="value">${work.licenses.onetime}</div>
                    <div class="label">买断</div>
                </div>
                <div class="work-stat">
                    <div class="value">${work.licenses.timed}</div>
                    <div class="label">限时</div>
                </div>
            </div>
            <div class="work-actions">
                <button class="work-action-btn" onclick="editWork(${work.id})">编辑</button>
                <button class="work-action-btn" onclick="viewWork(${work.id})">查看</button>
            </div>
        </div>
    `).join('');
}

function loadNotifications() {
    const notificationsList = document.getElementById('notificationsList');
    if (!notificationsList) return;

    // 模拟通知数据
    const notifications = [
        {
            type: 'success',
            icon: '🎉',
            message: '您的作品《夏日微风》获得新的买断授权！',
            time: '10分钟前'
        },
        {
            type: 'info',
            icon: '💰',
            message: '收到收益分成 50 MEER',
            time: '2小时前'
        },
        {
            type: 'warning',
            icon: '⚠️',
            message: '作品《星空漫步》的限时授权即将到期',
            time: '1天前'
        }
    ];

    notificationsList.innerHTML = notifications.map(notif => `
        <div class="notification-item ${notif.type}">
            <span class="notification-icon">${notif.icon}</span>
            <div class="notification-content">
                <p>${notif.message}</p>
                <span class="notification-time">${notif.time}</span>
            </div>
        </div>
    `).join('');
}

function editWork(workId) {
    console.log('编辑作品:', workId);
    // 实现编辑功能
    showSuccess('编辑功能开发中...');
}

function viewWork(workId) {
    console.log('查看作品:', workId);
    window.location.href = `asset-detail.html?id=${workId}`;
}

// ==================== 上传页面功能 ====================

async function initUploadPage() {
    console.log('初始化上传页面...');

    // 初始化钱包
    await initWallet();

    // 初始化文件上传
    initFileUpload();

    // 初始化表单
    initUploadForm();

    // 初始化预览
    initPreview();
}

function initFileUpload() {
    // 音频文件上传
    const audioUploadArea = document.getElementById('audioUploadArea');
    const audioFile = document.getElementById('audioFile');
    const audioPreview = document.getElementById('audioPreview');
    const audioFileName = document.getElementById('audioFileName');
    const audioFileSize = document.getElementById('audioFileSize');
    const removeAudio = document.getElementById('removeAudio');

    if (audioUploadArea && audioFile) {
        // 点击上传
        audioUploadArea.addEventListener('click', () => audioFile.click());

        // 拖拽上传
        audioUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            audioUploadArea.classList.add('dragover');
        });

        audioUploadArea.addEventListener('dragleave', () => {
            audioUploadArea.classList.remove('dragover');
        });

        audioUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            audioUploadArea.classList.remove('dragover');
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleAudioFile(files[0]);
            }
        });

        // 文件选择
        audioFile.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleAudioFile(e.target.files[0]);
            }
        });
    }

    function handleAudioFile(file) {
        if (!file.type.startsWith('audio/')) {
            showError('请选择音频文件');
            return;
        }

        if (file.size > 50 * 1024 * 1024) {
            showError('文件大小不能超过 50MB');
            return;
        }

        if (audioFileName) audioFileName.textContent = file.name;
        if (audioFileSize) audioFileSize.textContent = formatFileSize(file.size);
        if (audioPreview) audioPreview.classList.remove('hidden');
        if (audioUploadArea) audioUploadArea.classList.add('hidden');
    }

    if (removeAudio) {
        removeAudio.addEventListener('click', () => {
            if (audioFile) audioFile.value = '';
            if (audioPreview) audioPreview.classList.add('hidden');
            if (audioUploadArea) audioUploadArea.classList.remove('hidden');
        });
    }

    // 封面上传
    const selectCoverBtn = document.getElementById('selectCoverBtn');
    const coverFile = document.getElementById('coverFile');
    const coverPreview = document.getElementById('coverPreview');

    if (selectCoverBtn && coverFile) {
        selectCoverBtn.addEventListener('click', () => coverFile.click());

        coverFile.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleCoverFile(e.target.files[0]);
            }
        });
    }

    function handleCoverFile(file) {
        if (!file.type.startsWith('image/')) {
            showError('请选择图片文件');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            if (coverPreview) {
                coverPreview.innerHTML = `<img src="${e.target.result}" alt="封面预览">`;
            }
        };
        reader.readAsDataURL(file);
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function initUploadForm() {
    const form = document.getElementById('uploadForm');
    const cancelBtn = document.getElementById('cancelBtn');

    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            if (confirm('确定要取消吗？已填写的内容将丢失。')) {
                window.location.href = 'creator-dashboard.html';
            }
        });
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await handleUploadSubmit();
        });
    }

    // 权属蓝图开关
    const rightToggles = document.querySelectorAll('.right-card-header input[type="checkbox"]');
    rightToggles.forEach(toggle => {
        toggle.addEventListener('change', (e) => {
            const card = e.target.closest('.right-card');
            const content = card.querySelector('.right-card-content');
            if (content) {
                content.style.opacity = e.target.checked ? '1' : '0.5';
                content.style.pointerEvents = e.target.checked ? 'auto' : 'none';
            }
            updatePreview();
        });
    });

    // 价格开关
    const priceToggles = document.querySelectorAll('.pricing-card-header input[type="checkbox"]');
    priceToggles.forEach(toggle => {
        toggle.addEventListener('change', (e) => {
            const card = e.target.closest('.pricing-card');
            const content = card.querySelector('.pricing-card-content');
            if (content) {
                content.style.opacity = e.target.checked ? '1' : '0.5';
                content.style.pointerEvents = e.target.checked ? 'auto' : 'none';
            }
        });
    });
}

function initPreview() {
    // 标题输入监听
    const titleInput = document.getElementById('workTitle');
    if (titleInput) {
        titleInput.addEventListener('input', updatePreview);
    }

    // 类型选择监听
    const typeSelect = document.getElementById('musicType');
    if (typeSelect) {
        typeSelect.addEventListener('change', updatePreview);
    }
}

function updatePreview() {
    const titleInput = document.getElementById('workTitle');
    const typeSelect = document.getElementById('musicType');
    const previewTitle = document.getElementById('previewTitle');
    const previewType = document.getElementById('previewType');
    const previewRights = document.getElementById('previewRights');

    if (previewTitle && titleInput) {
        previewTitle.textContent = titleInput.value || '未命名作品';
    }

    if (previewType && typeSelect) {
        const typeMap = {
            pop: '流行',
            electronic: '电子',
            classical: '古典',
            jazz: '爵士',
            rock: '摇滚',
            folk: '民谣',
            ambient: '氛围',
            hiphop: '嘻哈',
            other: '其他'
        };
        previewType.textContent = '类型: ' + typeMap[typeSelect.value] || '流行';
    }

    if (previewRights) {
        const enabledRights = [];
        if (document.getElementById('enableUsage')?.checked) enabledRights.push('使用权');
        if (document.getElementById('enableDerivative')?.checked) enabledRights.push('衍生权');
        if (document.getElementById('enableExtension')?.checked) enabledRights.push('扩展权');
        if (document.getElementById('enableRevenue')?.checked) enabledRights.push('收益权');

        previewRights.textContent = '已配置权利: ' + (enabledRights.join(', ') || '无');
    }
}

async function handleUploadSubmit() {
    if (!creatorState.isConnected) {
        showError('请先连接钱包');
        return;
    }

    const title = document.getElementById('workTitle')?.value;
    const audioFile = document.getElementById('audioFile')?.files[0];

    if (!title) {
        showError('请输入作品标题');
        return;
    }

    if (!audioFile) {
        showError('请上传音频文件');
        return;
    }

    showLoading('正在上传作品...');

    try {
        // 1. 上传文件到 IPFS（模拟）
        await new Promise(resolve => setTimeout(resolve, 1500));
        const mockIpfsHash = 'Qm' + Math.random().toString(36).substring(2, 15);

        // 2. 构建权属蓝图
        const blueprint = buildBlueprint();

        // 3. 调用合约生成 NFT
        showLoading('正在生成 NFT...');

        // 模拟合约调用
        await new Promise(resolve => setTimeout(resolve, 2000));

        // 实际合约调用代码（需要合约支持）:
        // const tx = await creatorState.contractManager.contracts.echoAsset.mintECHO(
        //     title,
        //     document.getElementById('workDescription')?.value || '',
        //     document.getElementById('musicType')?.value || 'other',
        //     `ipfs://${mockIpfsHash}`,
        //     ethers.utils.id(mockIpfsHash),
        //     blueprint
        // );
        // await tx.wait();

        hideLoading();
        showSuccess('作品上传成功！');

        // 跳转到仪表盘
        setTimeout(() => {
            window.location.href = 'creator-dashboard.html';
        }, 1500);

    } catch (error) {
        hideLoading();
        console.error('上传失败:', error);
        showError('上传失败: ' + error.message);
    }
}

function buildBlueprint() {
    const creatorAddress = creatorState.walletAddress;

    return {
        usage: {
            owner: creatorAddress,
            fee: ethers.utils.parseEther(document.getElementById('usageFee')?.value || '100'),
            commercialUse: document.getElementById('commercialUse')?.checked || false,
            modificationAllowed: document.getElementById('modificationAllowed')?.checked || false,
            allowedScopes: [],
            restrictedScopes: [],
            maxUsers: 0,
            licenseDuration: 0
        },
        derivative: {
            owner: creatorAddress,
            fee: ethers.utils.parseEther(document.getElementById('derivativeFee')?.value || '500'),
            allowDerivatives: document.getElementById('enableDerivative')?.checked || false,
            revenueShare: parseInt(document.getElementById('revenueShare')?.value || '10'),
            allowedTypes: []
        },
        extension: {
            owner: creatorAddress,
            fee: ethers.utils.parseEther(document.getElementById('extensionFee')?.value || '200'),
            allowExtensions: document.getElementById('enableExtension')?.checked || false,
            allowedExtensions: []
        },
        revenue: {
            owner: creatorAddress,
            sharePercentage: parseInt(document.getElementById('creatorShare')?.value || '95'),
            autoDistribute: document.getElementById('autoDistribute')?.checked || false
        }
    };
}

// ==================== 收益页面功能 ====================

async function initRevenuePage() {
    console.log('初始化收益页面...');

    // 初始化钱包
    await initWallet();

    // 加载收益数据
    await loadRevenueData();

    // 初始化图表
    initChart();

    // 初始化提现功能
    initWithdraw();

    // 初始化导出功能
    initExport();
}

async function loadRevenueData() {
    showLoading('加载收益数据...');

    try {
        // 模拟数据加载
        await new Promise(resolve => setTimeout(resolve, 500));

        // 更新收益统计
        updateRevenueStats({
            availableBalance: 500.25,
            monthRevenue: 125.5,
            monthChange: 15,
            totalRevenue: 1250.5,
            licenseSales: 12
        });

        // 加载交易记录
        loadTransactions();

        // 加载作品排行
        loadTopWorks();

    } catch (error) {
        console.error('加载收益数据失败:', error);
    } finally {
        hideLoading();
    }
}

function updateRevenueStats(stats) {
    const availableBalanceEl = document.getElementById('availableBalance');
    const monthRevenueEl = document.getElementById('monthRevenue');
    const monthChangeEl = document.getElementById('monthChange');
    const totalRevenueEl = document.getElementById('totalRevenue');
    const licenseSalesEl = document.getElementById('licenseSales');

    if (availableBalanceEl) {
        availableBalanceEl.textContent = formatAmount(stats.availableBalance) + ' MEER';
    }
    if (monthRevenueEl) {
        monthRevenueEl.textContent = formatAmount(stats.monthRevenue) + ' MEER';
    }
    if (monthChangeEl) {
        monthChangeEl.textContent = `+${stats.monthChange}% 较上月`;
    }
    if (totalRevenueEl) {
        totalRevenueEl.textContent = formatAmount(stats.totalRevenue) + ' MEER';
    }
    if (licenseSalesEl) {
        licenseSalesEl.textContent = stats.licenseSales;
    }
}

function initChart() {
    const chartFilters = document.querySelectorAll('.chart-filter-btn');
    chartFilters.forEach(btn => {
        btn.addEventListener('click', () => {
            chartFilters.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            updateChart(btn.dataset.range);
        });
    });
}

function updateChart(range) {
    // 根据时间范围更新图表数据
    console.log('更新图表:', range);
    // 这里可以实现从服务器获取不同时间范围的数据
}

function loadTransactions() {
    const tbody = document.getElementById('transactionsBody');
    if (!tbody) return;

    // 模拟交易数据
    const transactions = [
        {
            date: '2026-03-13 14:30',
            type: 'license',
            work: '夏日微风',
            buyer: '0x1234...5678',
            amount: 100,
            status: 'completed'
        },
        {
            date: '2026-03-12 09:15',
            type: 'sale',
            work: '星空漫步',
            buyer: '0xabcd...efgh',
            amount: 150,
            status: 'completed'
        },
        {
            date: '2026-03-10 16:45',
            type: 'license',
            work: '夏日微风',
            buyer: '0x9876...5432',
            amount: 50,
            status: 'completed'
        },
        {
            date: '2026-03-08 11:20',
            type: 'withdrawal',
            work: '-',
            buyer: '-',
            amount: -200,
            status: 'completed'
        }
    ];

    if (transactions.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 3rem; color: var(--text-muted);">
                    暂无交易记录
                </td>
            </tr>
        `;
        return;
    }

    tbody.innerHTML = transactions.map(tx => {
        const typeClass = tx.type;
        const typeText = {
            sale: '作品销售',
            license: '授权购买',
            withdrawal: '提现'
        }[tx.type] || tx.type;

        const amountClass = tx.amount >= 0 ? 'positive' : 'negative';
        const amountText = (tx.amount >= 0 ? '+' : '') + formatAmount(Math.abs(tx.amount)) + ' MEER';

        return `
            <tr>
                <td>${tx.date}</td>
                <td><span class="transaction-type ${typeClass}">${typeText}</span></td>
                <td>${tx.work}</td>
                <td>${tx.buyer}</td>
                <td><span class="transaction-amount ${amountClass}">${amountText}</span></td>
                <td>✅ 已完成</td>
            </tr>
        `;
    }).join('');
}

function loadTopWorks() {
    const list = document.getElementById('topWorksList');
    if (!list) return;

    // 模拟作品排行数据
    const topWorks = [
        { id: 1, title: '夏日微风', revenue: 650, sales: 8, cover: '🎵' },
        { id: 2, title: '星空漫步', revenue: 450, sales: 3, cover: '✨' },
        { id: 3, title: '雨后清晨', revenue: 150.5, sales: 1, cover: '🌧️' }
    ];

    if (topWorks.length === 0) {
        list.innerHTML = `
            <div class="empty-state">
                <span class="icon">🏆</span>
                <h3>暂无数据</h3>
                <p>上传作品开始赚取收益吧</p>
            </div>
        `;
        return;
    }

    list.innerHTML = topWorks.map((work, index) => `
        <div class="work-item">
            <div style="font-size: 1.5rem; font-weight: 700; color: var(--primary-color); width: 40px; text-align: center;">
                ${index + 1}
            </div>
            <div class="work-cover">${work.cover}</div>
            <div class="work-info">
                <h3>${work.title}</h3>
                <div class="work-meta">
                    <span>${work.sales} 次销售</span>
                </div>
            </div>
            <div class="work-stats">
                <div class="work-stat">
                    <div class="value" style="color: var(--success-color);">${formatAmount(work.revenue)} MEER</div>
                    <div class="label">总收益</div>
                </div>
            </div>
        </div>
    `).join('');
}

function initWithdraw() {
    const withdrawBtn = document.getElementById('withdrawBtn');
    const withdrawModal = document.getElementById('withdrawModal');
    const cancelWithdraw = document.getElementById('cancelWithdraw');
    const confirmWithdraw = document.getElementById('confirmWithdraw');
    const withdrawInput = document.getElementById('withdrawInput');
    const withdrawAmount = document.getElementById('withdrawAmount');
    const withdrawAddress = document.getElementById('withdrawAddress');

    if (withdrawBtn && withdrawModal) {
        withdrawBtn.addEventListener('click', () => {
            if (!creatorState.isConnected) {
                showError('请先连接钱包');
                return;
            }

            // 更新弹窗信息
            if (withdrawAmount) {
                withdrawAmount.textContent = document.getElementById('availableBalance')?.textContent || '0 MEER';
            }
            if (withdrawAddress) {
                withdrawAddress.textContent = formatAddress(creatorState.walletAddress);
            }

            withdrawModal.classList.remove('hidden');
        });
    }

    if (cancelWithdraw && withdrawModal) {
        cancelWithdraw.addEventListener('click', () => {
            withdrawModal.classList.add('hidden');
        });
    }

    if (confirmWithdraw) {
        confirmWithdraw.addEventListener('click', async () => {
            const amount = parseFloat(withdrawInput?.value || 0);
            if (amount <= 0) {
                showError('请输入有效的提现金额');
                return;
            }

            withdrawModal.classList.add('hidden');
            showLoading('处理提现请求...');

            try {
                // 模拟提现处理
                await new Promise(resolve => setTimeout(resolve, 2000));

                hideLoading();
                showSuccess(`成功提现 ${amount} MEER`);

                // 重置输入
                if (withdrawInput) withdrawInput.value = '';

                // 刷新数据
                await loadRevenueData();

            } catch (error) {
                hideLoading();
                showError('提现失败: ' + error.message);
            }
        });
    }
}

function initExport() {
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
        exportBtn.addEventListener('click', () => {
            exportTransactions();
        });
    }
}

function exportTransactions() {
    // 模拟导出功能
    const csvContent = 'data:text/csv;charset=utf-8,' + 
        '时间,类型,作品,买家,金额,状态\n' +
        '2026-03-13 14:30,授权购买,夏日微风,0x1234...5678,+100 MEER,已完成\n' +
        '2026-03-12 09:15,作品销售,星空漫步,0xabcd...efgh,+150 MEER,已完成\n';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `收益报表_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showSuccess('报表导出成功');
}

// ==================== 导出函数 ====================

// 使初始化函数全局可用
window.initCreatorDashboard = initCreatorDashboard;
window.initUploadPage = initUploadPage;
window.initRevenuePage = initRevenuePage;
window.editWork = editWork;
window.viewWork = viewWork;
