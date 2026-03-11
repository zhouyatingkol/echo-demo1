// ECHO Protocol Demo - 前端交互

// Qitmeer 主网配置
const QITMEER_MAINNET = {
  chainId: '0x32d', // 813 in hex
  chainName: 'Qitmeer Mainnet',
  nativeCurrency: {
    name: 'MEER',
    symbol: 'MEER',
    decimals: 18,
  },
  rpcUrls: ['https://qng.rpc.qitmeer.io'],
  blockExplorerUrls: ['https://qng.qitmeer.io'],
};

// Qitmeer Testnet 配置
const QITMEER_TESTNET = {
  chainId: '0x1FC3', // 8131 in hex
  chainName: 'Qitmeer Testnet',
  nativeCurrency: {
    name: 'MEER',
    symbol: 'MEER',
    decimals: 18,
  },
  rpcUrls: ['https://testnet-qng.rpc.qitmeer.io'],
  blockExplorerUrls: ['https://testnet-qng.qitmeer.io'],
};

// V2 合约 ABI
const CONTRACT_ABI = [
  "function mintECHO(string name, string description, string assetType, string uri, bytes32 contentHash, tuple(tuple(address owner, uint256 fee, bool commercialUse, bool modificationAllowed, string[] allowedScopes, string[] restrictedScopes, uint256 maxUsers, uint256 licenseDuration) usage, tuple(address owner, uint256 fee, bool allowDerivatives, uint256 revenueShare, string[] allowedTypes) derivative, tuple(address owner, uint256 fee, bool allowExtensions, string[] allowedExtensions) extension, tuple(address owner, uint256 sharePercentage, bool autoDistribute) revenue) blueprint) returns (uint256)",
  "function getAssetInfo(uint256 tokenId) view returns (tuple(string name, string description, string assetType, string uri, bytes32 contentHash, uint256 createdAt, uint256 lastUpdated), tuple(tuple(address owner, uint256 fee, bool commercialUse, bool modificationAllowed, string[] allowedScopes, string[] restrictedScopes, uint256 maxUsers, uint256 licenseDuration) usage, tuple(address owner, uint256 fee, bool allowDerivatives, uint256 revenueShare, string[] allowedTypes) derivative, tuple(address owner, uint256 fee, bool allowExtensions, string[] allowedExtensions) extension, tuple(address owner, uint256 sharePercentage, bool autoDistribute) revenue), address creator, uint256 version)",
  "function ownerOf(uint256 tokenId) view returns (address)",
  "function getCurrentTokenId() view returns (uint256)"
];

// 合约地址 - V2 合约
let CONTRACT_ADDRESS = '0x319148d9b9265D75858c508E445d65B649036f75';

// 全局变量
let provider = null;
let signer = null;
let contract = null;
let userAddress = null;

// DOM元素
let connectBtn, walletSection, walletInfo, walletAddress, networkName;
let mintSection, mintForm, assetsSection, assetList, refreshBtn, mintStatus;

// 初始化 DOM 元素引用
function initDOMElements() {
  connectBtn = document.getElementById('connectBtn');
  walletSection = document.getElementById('walletSection');
  walletInfo = document.getElementById('walletInfo');
  walletAddress = document.getElementById('walletAddress');
  networkName = document.getElementById('networkName');
  mintSection = document.getElementById('mintSection');
  mintForm = document.getElementById('mintForm');
  assetsSection = document.getElementById('assetsSection');
  assetList = document.getElementById('assetList');
  refreshBtn = document.getElementById('refreshBtn');
  mintStatus = document.getElementById('mintStatus');
}

// 连接钱包
async function connectWallet() {
  console.log('🔍 连接钱包...');
  
  if (!window.ethereum) {
    showStatus('请先安装 MetaMask 或其他 Web3 钱包', 'error');
    alert('请先安装 MetaMask 钱包！\n官网: https://metamask.io');
    return;
  }

  try {
    // 请求连接
    showStatus('正在请求连接...', '');
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    // 创建provider
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    userAddress = await signer.getAddress();
    
    console.log('✅ 钱包已连接:', userAddress);
    
    // 检查网络
    const network = await provider.getNetwork();
    console.log('当前网络:', network.chainId);
    
    if (network.chainId !== 813 && network.chainId !== 8131) {
      showStatus('正在切换网络...', '');
      await switchToQitmeer();
    }
    
    // 初始化合约
    if (CONTRACT_ADDRESS) {
      contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
      console.log('✅ 合约已连接:', CONTRACT_ADDRESS);
    }
    
    // 更新UI
    updateWalletUI();
    showMintSection();
    
    // 监听账户变化
    window.ethereum.on('accountsChanged', handleAccountsChanged);
    window.ethereum.on('chainChanged', () => window.location.reload());
    
    showStatus('连接成功！', 'success');
    
  } catch (error) {
    console.error('❌ 连接失败:', error);
    showStatus('连接失败: ' + error.message, 'error');
  }
}

// 切换到Qitmeer主网
async function switchToQitmeer() {
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: QITMEER_MAINNET.chainId }],
    });
  } catch (switchError) {
    // 如果网络不存在，添加网络
    if (switchError.code === 4902) {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [QITMEER_MAINNET],
      });
    }
  }
}

// 处理账户变化
function handleAccountsChanged(accounts) {
  if (accounts.length === 0) {
    // 用户断开连接
    disconnectWallet();
  } else {
    userAddress = accounts[0];
    updateWalletUI();
  }
}

// 断开钱包
function disconnectWallet() {
  provider = null;
  signer = null;
  contract = null;
  userAddress = null;
  
  walletSection.classList.remove('hidden');
  walletInfo.classList.add('hidden');
  mintSection.classList.add('hidden');
  assetsSection.classList.add('hidden');
}

// 更新钱包UI
function updateWalletUI() {
  walletSection.classList.add('hidden');
  walletInfo.classList.remove('hidden');
  walletAddress.textContent = userAddress.slice(0, 6) + '...' + userAddress.slice(-4);
  networkName.textContent = 'Qitmeer Mainnet';
}

// 显示铸造区域
function showMintSection() {
  mintSection.classList.remove('hidden');
  assetsSection.classList.remove('hidden');
  
  // 设置默认权利所有者为当前用户
  const inputs = ['usageOwner', 'derivativeOwner', 'extensionOwner', 'revenueOwner'];
  inputs.forEach(id => {
    const input = document.getElementById(id);
    if (input && !input.value) {
      input.value = userAddress;
    }
  });
  
  // 加载资产列表
  loadAssets();
}

// 铸造资产
async function mintAsset(e) {
  e.preventDefault();
  
  if (!contract) {
    // 如果没有合约地址，提示输入
    const address = prompt('请输入合约地址:');
    if (!address) return;
    
    CONTRACT_ADDRESS = address;
    localStorage.setItem('echoContractAddress', address);
    contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
  }
  
  try {
    showStatus('铸造中...请确认交易', '');
    
    const name = document.getElementById('assetName').value;
    const description = document.getElementById('assetDesc').value;
    const assetType = document.getElementById('assetType').value;
    const usageOwner = document.getElementById('usageOwner').value;
    const derivativeOwner = document.getElementById('derivativeOwner').value;
    const extensionOwner = document.getElementById('extensionOwner').value;
    const revenueOwner = document.getElementById('revenueOwner').value;
    const usageFee = document.getElementById('usageFee').value;
    
    // 简化的URI (实际应上传到IPFS)
    const uri = JSON.stringify({
      name,
      description,
      assetType,
      createdAt: new Date().toISOString()
    });
    
    const rights = {
      usageOwner,
      derivativeOwner,
      extensionOwner,
      revenueOwner,
      usageFee: ethers.BigNumber.from(usageFee),
      derivativeFee: ethers.BigNumber.from(0),
      revenueShare: 10000 // 100%
    };
    
    const tx = await contract.mintECHO(name, description, assetType, uri, rights);
    showStatus('交易已提交，等待确认...', '');
    
    const receipt = await tx.wait();
    
    // 查找铸造事件
    const event = receipt.events.find(e => e.event === 'AssetMinted');
    if (event) {
      const tokenId = event.args.tokenId.toString();
      showStatus(`铸造成功! Token ID: ${tokenId}`, 'success');
    } else {
      showStatus('铸造成功!', 'success');
    }
    
    // 刷新资产列表
    loadAssets();
    
    // 重置表单
    mintForm.reset();
    
  } catch (error) {
    showStatus('铸造失败: ' + error.message, 'error');
  }
}

// 加载资产列表
async function loadAssets() {
  if (!contract || !userAddress) return;
  
  assetList.innerHTML = '<p style="color: #666;">加载中...</p>';
  
  try {
    const currentId = await contract.getCurrentTokenId();
    const assets = [];
    
    // 遍历所有资产，找出用户拥有的
    for (let i = 0; i < currentId.toNumber(); i++) {
      try {
        const owner = await contract.ownerOf(i);
        if (owner.toLowerCase() === userAddress.toLowerCase()) {
          const info = await contract.getAssetInfo(i);
          assets.push({
            tokenId: i,
            ...info
          });
        }
      } catch (e) {
        // 资产可能已被销毁或不存在
      }
    }
    
    renderAssets(assets);
    
  } catch (error) {
    assetList.innerHTML = '<p style="color: #f55;">加载失败: ' + error.message + '</p>';
  }
}

// 渲染资产列表
function renderAssets(assets) {
  if (assets.length === 0) {
    assetList.innerHTML = '<p style="color: #666;">暂无资产</p>';
    return;
  }
  
  assetList.innerHTML = assets.map(asset => `
    <div class="asset-item">
      <div class="asset-name">${asset.metadata.name}</div>
      <span class="asset-type">${getAssetTypeLabel(asset.metadata.assetType)}</span>
      <div class="rights-grid">
        <div class="right-tag">
          使用权<br><span>${formatAddress(asset.rights.usageOwner)}</span>
        </div>
        <div class="right-tag">
          衍生权<br><span>${formatAddress(asset.rights.derivativeOwner)}</span>
        </div>
        <div class="right-tag">
          扩展权<br><span>${formatAddress(asset.rights.extensionOwner)}</span>
        </div>
        <div class="right-tag">
          收益权<br><span>${formatAddress(asset.rights.revenueOwner)}</span>
        </div>
      </div>
    </div>
  `).join('');
}

// 获取资产类型标签
function getAssetTypeLabel(type) {
  const labels = {
    code: '代码',
    algorithm: '算法',
    data: '数据',
    patent: '专利'
  };
  return labels[type] || type;
}

// 格式化地址
function formatAddress(address) {
  return address.slice(0, 6) + '...' + address.slice(-4);
}

// 显示状态
function showStatus(message, type) {
  if (!mintStatus) return;
  mintStatus.innerHTML = message ? `<div class="status ${type}">${message}</div>` : '';
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
  console.log('🚀 ECHO Protocol 加载完成');
  
  // 初始化 DOM 元素
  initDOMElements();
  
  // 检查元素是否存在
  if (!connectBtn) {
    console.error('❌ 未找到连接按钮');
    return;
  }
  
  // 绑定事件
  connectBtn.addEventListener('click', connectWallet);
  
  if (mintForm) {
    mintForm.addEventListener('submit', mintAsset);
  }
  
  if (refreshBtn) {
    refreshBtn.addEventListener('click', loadAssets);
  }
  
  console.log('✅ 事件绑定完成');
  
  // 检查是否已连接
  if (window.ethereum && window.ethereum.selectedAddress) {
    console.log('🔄 检测到已连接钱包，自动连接...');
    connectWallet();
  }
});