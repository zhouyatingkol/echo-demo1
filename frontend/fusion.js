// ECHO Fusion 前端功能

// 融合合约配置
const FUSION_CONTRACT_ADDRESS = '0x...'; // 部署后更新

// 融合合约ABI（核心函数）
const FUSION_ABI = [
  "function fuseTree(uint256[] calldata seedIds, uint256[] calldata weights, string calldata name, string calldata description) external returns (uint256)",
  "function getTreeInfo(uint256 treeId) external view returns (string memory name, string memory description, uint256[] memory seedIds, uint256[] memory weights, uint256 totalRevenue, address owner)",
  "function distributeRevenue(uint256 treeId) external payable",
  "function claimRevenue(uint256 treeId) external",
  "function getPendingRevenue(uint256 treeId, address user) external view returns (uint256)",
  "function getCurrentTreeId() external view returns (uint256)",
  "event TreeFused(uint256 indexed treeId, address indexed creator, uint256[] seedIds, uint256[] weights)"
];

let fusionContract = null;

// 初始化融合合约
function initFusionContract() {
  if (!signer) return;
  fusionContract = new ethers.Contract(FUSION_CONTRACT_ADDRESS, FUSION_ABI, signer);
}

// ============ 融合界面功能 ============

// 显示融合页面
function showFusionPage() {
  const selectedSeeds = []; // 用户选择的种子
  const weights = []; // 权重
  
  return `
    <div class="fusion-container">
      <h2>🌳 培育新树</h2>
      <p class="subtitle">选择2-10颗种子，融合成一棵新树</p>
      
      <div class="fusion-steps">
        <div class="step active" data-step="1">
          <div class="step-number">1</div>
          <div class="step-label">选择种子</div>
        </div>
        <div class="step" data-step="2">
          <div class="step-number">2</div>
          <div class="step-label">设置权重</div>
        </div>
        <div class="step" data-step="3">
          <div class="step-number">3</div>
          <div class="step-label">配置信息</div>
        </div>
        <div class="step" data-step="4">
          <div class="step-number">4</div>
          <div class="step-label">确认融合</div>
        </div>
      </div>
      
      <!-- 步骤1: 选择种子 -->
      <div class="fusion-panel" id="step1Panel">
        <h3>选择要融合的种子</h3>
        <div class="seed-selector" id="seedSelector">
          <p>加载中...</p>
        </div>
        <div class="selected-preview">
          <p>已选择: <span id="selectedCount">0</span> / 10</p>
        </div>
        
        <button class="btn" id="toStep2Btn" disabled>下一步</button>
      </div>
      
      <!-- 步骤2: 设置权重 -->
      <div class="fusion-panel hidden" id="step2Panel">
        <h3>设置贡献权重</h3>
        <p class="hint">权重决定收益分配比例</p>
        
        <div class="weights-container" id="weightsContainer">
          <!-- 动态生成权重滑块 -->
        </div>
        
        <div class="weight-chart">
          <div id="weightPieChart"></div>
        </div>
        
        <button class="btn btn-secondary" onclick="showStep(1)">上一步</button>
        <button class="btn" id="toStep3Btn">下一步</button>
      </div>
      
      <!-- 步骤3: 配置信息 -->
      <div class="fusion-panel hidden" id="step3Panel">
        <h3>配置树的信息</h3>
        
        <div class="form-group">
          <label>树的名称</label>
          <input type="text" id="treeName" placeholder="给你的树起个名字">
        </div>
        
        <div class="form-group">
          <label>描述</label>
          <textarea id="treeDesc" rows="3" placeholder="描述这棵树的特点..."></textarea>
        </div>
        
        <button class="btn btn-secondary" onclick="showStep(2)">上一步</button>
        <button class="btn" id="toStep4Btn">下一步</button>
      </div>
      
      <!-- 步骤4: 确认融合 -->
      <div class="fusion-panel hidden" id="step4Panel">
        <h3>确认融合</h3>
        
        <div class="fusion-preview">
          <div class="preview-tree">
            <div class="tree-visual">🌳</div>
            <div class="tree-info">
              <h4 id="previewName">--</h4>
              <p id="previewDesc">--</p>
            </div>
          </div>
          
          <div class="preview-seeds">
            <h4>包含的种子</h4>
            <div id="previewSeedsList"></div>
          </div>
          
          <div class="preview-revenue">
            <h4>收益分配</h4>
            <div id="previewRevenueShares"></div>
          </div>
        </div>
        
        <div class="gas-estimate">
          <p>预估Gas: <span id="estimatedGas">--</span></p>
        </div>
        
        <button class="btn btn-secondary" onclick="showStep(3)">上一步</button>
        <button class="btn btn-primary" id="confirmFusionBtn">🔨 确认融合</button>
      </div>
    </div>
  `;
}

// 加载用户的种子列表
async function loadUserSeeds() {
  if (!contract || !userAddress) return;
  
  const seedSelector = document.getElementById('seedSelector');
  seedSelector.innerHTML = '<p>加载中...</p>';
  
  try {
    const currentId = await contract.getCurrentTokenId();
    const seeds = [];
    
    for (let i = 0; i < currentId; i++) {
      try {
        const owner = await contract.ownerOf(i);
        if (owner.toLowerCase() === userAddress.toLowerCase()) {
          const info = await contract.getAssetInfo(i);
          seeds.push({
            tokenId: i,
            name: info.metadata.name,
            type: info.metadata.assetType
          });
        }
      } catch (e) {}
    }
    
    renderSeedSelector(seeds);
  } catch (error) {
    seedSelector.innerHTML = `<p class="error">加载失败: ${error.message}</p>`;
  }
}

// 渲染种子选择器
function renderSeedSelector(seeds) {
  const container = document.getElementById('seedSelector');
  
  if (seeds.length === 0) {
    container.innerHTML = '<p>您还没有种子资产，请先生成</p>';
    return;
  }
  
  if (seeds.length < 2) {
    container.innerHTML = '<p>至少需要2颗种子才能融合，您当前有 ${seeds.length} 颗</p>';
    return;
  }
  
  container.innerHTML = seeds.map(seed => `
    <div class="seed-card" data-id="${seed.tokenId}" onclick="toggleSeedSelection(${seed.tokenId})">
      <div class="seed-icon">🌱</div>
      <div class="seed-info">
        <div class="seed-name">${seed.name}</div>
        <div class="seed-type">${getAssetTypeLabel(seed.type)}</div>
        <div class="seed-id">#${seed.tokenId}</div>
      </div>
      <div class="seed-check"></div>
    </div>
  `).join('');
}

// 切换种子选择
function toggleSeedSelection(tokenId) {
  const card = document.querySelector(`[data-id="${tokenId}"]`);
  const index = selectedSeeds.indexOf(tokenId);
  
  if (index > -1) {
    selectedSeeds.splice(index, 1);
    card.classList.remove('selected');
  } else {
    if (selectedSeeds.length >= 10) {
      showStatus('最多选择10颗种子', 'error');
      return;
    }
    selectedSeeds.push(tokenId);
    card.classList.add('selected');
  }
  
  updateSelectedCount();
}

// 更新已选择数量
function updateSelectedCount() {
  document.getElementById('selectedCount').textContent = selectedSeeds.length;
  document.getElementById('toStep2Btn').disabled = selectedSeeds.length < 2;
}

// 显示指定步骤
function showStep(step) {
  document.querySelectorAll('.fusion-panel').forEach(p => p.classList.add('hidden'));
  document.querySelectorAll('.step').forEach(s => s.classList.remove('active'));
  
  document.getElementById(`step${step}Panel`).classList.remove('hidden');
  document.querySelector(`[data-step="${step}"]`).classList.add('active');
}

// 执行融合
async function executeFusion() {
  if (!fusionContract) {
    showStatus('请先连接钱包', 'error');
    return;
  }
  
  try {
    showStatus('融合中...请确认交易', '');
    
    const name = document.getElementById('treeName').value;
    const desc = document.getElementById('treeDesc').value;
    
    // 默认权重1:1:1...
    const weights = selectedSeeds.map(() => 1);
    
    const tx = await fusionContract.fuseTree(selectedSeeds, weights, name, desc);
    
    showStatus('交易已提交，等待确认...', '');
    const receipt = await tx.wait();
    
    // 获取新树的ID
    const treeId = await fusionContract.getCurrentTreeId() - 1n;
    
    showStatus(`🎉 融合成功！树ID: ${treeId}`, 'success');
    
    // 重置选择
    selectedSeeds.length = 0;
    showStep(1);
    
  } catch (error) {
    showStatus('融合失败: ' + error.message, 'error');
  }
}