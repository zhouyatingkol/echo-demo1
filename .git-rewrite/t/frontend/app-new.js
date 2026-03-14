// 更新后的app.js - 整合融合和收益功能

// 合约配置
const CONTRACT_ADDRESSES = {
  echoAsset: '0x5f5AAe09BB85f561b21845729B79E840AB026148',
  echoFusion: '0x3AD441ECfC193fbe7f086b962d0bCfd2Bc2Bac0d'
};

// Qitmeer 主网配置
const QITMEER_MAINNET = {
  chainId: '0x32d',
  chainName: 'Qitmeer Mainnet',
  nativeCurrency: { name: 'MEER', symbol: 'MEER', decimals: 18 },
  rpcUrls: ['https://qng.rpc.qitmeer.io'],
  blockExplorerUrls: ['https://qng.qitmeer.io'],
};

// ABI导入（简化版）
const ECHO_ASSET_ABI = [
  "function mintECHO(string,string,string,string,tuple(address,address,address,address,uint256,uint256,uint256)) returns (uint256)",
  "function getAssetInfo(uint256) view returns (tuple(string,string,string,string,uint256),tuple(address,address,address,address,uint256,uint256,uint256),address)",
  "function getCurrentTokenId() view returns (uint256)",
  "function ownerOf(uint256) view returns (address)"
];

const ECHO_FUSION_ABI = [
  "function fuseTree(uint256[],uint256[],string,string) returns (uint256)",
  "function getTreeInfo(uint256) view returns (string,string,uint256[],uint256[],uint256,address)",
  "function getPendingRevenue(uint256,address) view returns (uint256)",
  "function claimRevenue(uint256)",
  "function getCurrentTreeId() view returns (uint256)",
  "function ownerOf(uint256) view returns (address)"
];

// 全局变量
let provider, signer, userAddress;
let echoAssetContract, echoFusionContract;

// 页面初始化
document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  document.getElementById('connectBtn').addEventListener('click', connectWallet);
});

// 导航功能
function initNavigation() {
  document.querySelectorAll('.nav-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      const page = tab.dataset.page;
      showPage(page);
      
      document.querySelectorAll('.nav-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });
}

function showPage(page) {
  document.querySelectorAll('.page-content').forEach(p => p.classList.add('hidden'));
  document.getElementById(page + 'Page').classList.remove('hidden');
  
  // 加载对应页面数据
  if (page === 'assets' && echoAssetContract) loadAssets();
  if (page === 'fusion' && echoFusionContract) loadFusionPage();
  if (page === 'revenue' && echoFusionContract) loadRevenuePage();
}

// 连接钱包
async function connectWallet() {
  if (!window.ethereum) {
    alert('请先安装 MetaMask');
    return;
  }
  
  try {
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    userAddress = await signer.getAddress();
    
    // 检查并切换网络
    const network = await provider.getNetwork();
    if (network.chainId !== 813) {
      await switchNetwork();
    }
    
    // 初始化合约
    echoAssetContract = new ethers.Contract(CONTRACT_ADDRESSES.echoAsset, ECHO_ASSET_ABI, signer);
    echoFusionContract = new ethers.Contract(CONTRACT_ADDRESSES.echoFusion, ECHO_FUSION_ABI, signer);
    
    // 更新UI
    document.getElementById('walletSection').classList.add('hidden');
    document.getElementById('walletInfo').classList.remove('hidden');
    document.getElementById('walletAddress').textContent = userAddress.slice(0, 6) + '...' + userAddress.slice(-4);
    document.getElementById('networkName').textContent = 'Qitmeer Mainnet';
    
    // 显示功能页面
    document.getElementById('navTabs').classList.remove('hidden');
    showPage('mint');
    
    // 设置默认权利所有者
    document.getElementById('usageOwner').value = userAddress;
    document.getElementById('derivativeOwner').value = userAddress;
    document.getElementById('extensionOwner').value = userAddress;
    document.getElementById('revenueOwner').value = userAddress;
    
  } catch (error) {
    console.error('连接失败:', error);
    alert('连接失败: ' + error.message);
  }
}

async function switchNetwork() {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: QITMEER_MAINNET.chainId }],
    });
  } catch (switchError) {
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [QITMEER_MAINNET],
      });
    }
  }
}

// 铸造资产
document.getElementById('mintForm')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  
  try {
    const name = document.getElementById('assetName').value;
    const description = document.getElementById('assetDesc').value;
    const assetType = document.getElementById('assetType').value;
    const usageFee = document.getElementById('usageFee').value;
    
    const rights = {
      usageOwner: document.getElementById('usageOwner').value,
      derivativeOwner: document.getElementById('derivativeOwner').value,
      extensionOwner: document.getElementById('extensionOwner').value,
      revenueOwner: document.getElementById('revenueOwner').value,
      usageFee: ethers.BigNumber.from(usageFee),
      derivativeFee: 0,
      revenueShare: 10000
    };
    
    const uri = JSON.stringify({ name, description, assetType, createdAt: new Date().toISOString() });
    
    showStatus('铸造中...', 'pending');
    const tx = await echoAssetContract.mintECHO(name, description, assetType, uri, rights);
    
    showStatus('等待确认...', 'pending');
    const receipt = await tx.wait();
    
    showStatus('✅ 铸造成功！', 'success');
    document.getElementById('mintForm').reset();
    
  } catch (error) {
    showStatus('❌ ' + error.message, 'error');
  }
});

// 融合功能
async function loadFusionPage() {
  // 加载用户的种子列表
  const container = document.getElementById('seedSelector');
  container.innerHTML = '<p>加载中...</p>';
  
  try {
    const currentId = await echoAssetContract.getCurrentTokenId();
    const seeds = [];
    
    for (let i = 0; i < currentId; i++) {
      try {
        const owner = await echoAssetContract.ownerOf(i);
        if (owner.toLowerCase() === userAddress.toLowerCase()) {
          const info = await echoAssetContract.getAssetInfo(i);
          seeds.push({ tokenId: i, name: info[0].name, type: info[0].assetType });
        }
      } catch (e) {}
    }
    
    renderSeedsForFusion(seeds);
  } catch (error) {
    container.innerHTML = '<p class="error">加载失败</p>';
  }
}

function renderSeedsForFusion(seeds) {
  const container = document.getElementById('seedSelector');
  
  if (seeds.length < 2) {
    container.innerHTML = '<p>至少需要2颗种子，你当前有 ' + seeds.length + ' 颗</p>';
    return;
  }
  
  window.selectedSeedsForFusion = [];
  
  container.innerHTML = seeds.map(seed => `
    <div class="seed-card" onclick="toggleFusionSeed(${seed.tokenId})" id="seed-${seed.tokenId}">
      <div class="seed-icon">🌱</div>
      <div class="seed-info">
        <div class="seed-name">${seed.name}</div>
        <div class="seed-id">#${seed.tokenId}</div>
      </div>
    </div>
  `).join('');
}

function toggleFusionSeed(tokenId) {
  const index = window.selectedSeedsForFusion.indexOf(tokenId);
  const card = document.getElementById('seed-' + tokenId);
  
  if (index > -1) {
    window.selectedSeedsForFusion.splice(index, 1);
    card.classList.remove('selected');
  } else {
    if (window.selectedSeedsForFusion.length >= 10) {
      alert('最多选择10颗种子');
      return;
    }
    window.selectedSeedsForFusion.push(tokenId);
    card.classList.add('selected');
  }
  
  document.getElementById('selectedCount').textContent = window.selectedSeedsForFusion.length;
}

// 执行融合
async function executeFusion() {
  if (window.selectedSeedsForFusion.length < 2) {
    alert('至少选择2颗种子');
    return;
  }
  
  try {
    const name = document.getElementById('fusionTreeName').value;
    const description = document.getElementById('fusionTreeDesc').value;
    const weights = window.selectedSeedsForFusion.map(() => 1); // 默认权重1:1
    
    showStatus('融合中...', 'pending');
    const tx = await echoFusionContract.fuseTree(window.selectedSeedsForFusion, weights, name, description);
    
    showStatus('等待确认...', 'pending');
    await tx.wait();
    
    showStatus('✅ 融合成功！', 'success');
    window.selectedSeedsForFusion = [];
    
  } catch (error) {
    showStatus('❌ ' + error.message, 'error');
  }
}

// 收益功能
async function loadRevenuePage() {
  try {
    const currentTreeId = await echoFusionContract.getCurrentTreeId();
    let totalPending = ethers.BigNumber.from(0);
    let myTrees = 0;
    
    for (let i = 0; i < currentTreeId; i++) {
      try {
        const pending = await echoFusionContract.getPendingRevenue(i, userAddress);
        if (pending.gt(0)) {
          totalPending = totalPending.add(pending);
          myTrees++;
        }
      } catch (e) {}
    }
    
    document.getElementById('totalPendingRevenue').textContent = ethers.utils.formatEther(totalPending) + ' MEER';
    document.getElementById('myTreesCount').textContent = myTrees + ' 棵';
    
  } catch (error) {
    console.error('加载收益失败:', error);
  }
}

async function claimAllRevenue() {
  try {
    const currentTreeId = await echoFusionContract.getCurrentTreeId();
    let claimed = 0;
    
    for (let i = 0; i < currentTreeId; i++) {
      try {
        const pending = await echoFusionContract.getPendingRevenue(i, userAddress);
        if (pending.gt(0)) {
          const tx = await echoFusionContract.claimRevenue(i);
          await tx.wait();
          claimed++;
        }
      } catch (e) {}
    }
    
    if (claimed > 0) {
      showStatus(`✅ 成功领取 ${claimed} 棵树的收益`, 'success');
      loadRevenuePage();
    } else {
      showStatus('没有可领取的收益', 'info');
    }
    
  } catch (error) {
    showStatus('❌ ' + error.message, 'error');
  }
}

// 工具函数
function showStatus(message, type) {
  const statusDiv = document.getElementById('mintStatus') || document.getElementById('fusionStatus') || document.getElementById('revenueStatus');
  if (statusDiv) {
    statusDiv.innerHTML = `<div class="status ${type}">${message}</div>`;
  }
}