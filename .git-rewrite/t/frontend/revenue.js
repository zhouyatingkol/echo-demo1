// ECHO Revenue 收益管理功能

// ============ 收益领取界面 ============

function showRevenuePage() {
  return `
    <div class="revenue-container">
      <h2>🍎 收获果实</h2>
      <p class="subtitle">查看和领取你的树产生的收益</p>
      
      <div class="revenue-summary">
        <div class="summary-card">
          <div class="summary-icon">💰</div>
          <div class="summary-info">
            <div class="summary-label">待领取收益</div>
            <div class="summary-value" id="totalPendingRevenue">-- MEER</div>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="summary-icon">🌳</div>
          <div class="summary-info">
            <div class="summary-label">我的树</div>
            <div class="summary-value" id="myTreesCount">-- 棵</div>
          </div>
        </div>
        
        <div class="summary-card">
          <div class="summary-icon">🌱</div>
          <div class="summary-info">
            <div class="summary-label">参与的树</div>
            <div class="summary-value" id="participatingTrees">-- 棵</div>
          </div>
        </div>
      </div>
      
      <div class="revenue-tabs">
        <button class="tab-btn active" data-tab="myTrees">我的树</button>
        <button class="tab-btn" data-tab="participating">参与的树</button>
        <button class="tab-btn" data-tab="history">领取记录</button>
      </div>
      
      <!-- 我的树 -->
      <div class="tab-panel active" id="myTreesPanel">
        <div class="trees-list" id="myTreesList">
          <p>加载中...</p>
        </div>
      </div>
      
      <!-- 参与的树 -->
      <div class="tab-panel" id="participatingPanel">
        <div class="trees-list" id="participatingList">
          <p>你作为种子所有者参与的树会显示在这里</p>
        </div>
      </div>
      
      <!-- 领取记录 -->
      <div class="tab-panel" id="historyPanel">
        <div class="history-list" id="historyList">
          <p>暂无记录</p>
        </div>
      </div>
    </div>
  `;
}

// 加载我的树
async function loadMyTrees() {
  if (!fusionContract || !userAddress) return;
  
  const container = document.getElementById('myTreesList');
  container.innerHTML = '<p>加载中...</p>';
  
  try {
    const currentTreeId = await fusionContract.getCurrentTreeId();
    const trees = [];
    
    for (let i = 0; i < currentTreeId; i++) {
      try {
        const owner = await fusionContract.ownerOf(i);
        if (owner.toLowerCase() === userAddress.toLowerCase()) {
          const info = await fusionContract.getTreeInfo(i);
          const pending = await fusionContract.getPendingRevenue(i, userAddress);
          
          trees.push({
            treeId: i,
            name: info.name,
            description: info.description,
            seedCount: info.seedIds.length,
            totalRevenue: info.totalRevenue,
            pendingRevenue: pending
          });
        }
      } catch (e) {}
    }
    
    renderMyTrees(trees);
    document.getElementById('myTreesCount').textContent = trees.length + ' 棵';
    
    // 计算总待领取收益
    const totalPending = trees.reduce((sum, t) => sum + BigInt(t.pendingRevenue), 0n);
    document.getElementById('totalPendingRevenue').textContent = 
      ethers.formatEther(totalPending) + ' MEER';
    
  } catch (error) {
    container.innerHTML = `<p class="error">加载失败: ${error.message}</p>`;
  }
}

// 渲染我的树列表
function renderMyTrees(trees) {
  const container = document.getElementById('myTreesList');
  
  if (trees.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🌳</div>
        <p>你还没有树</p>
        <p class="hint">去融合页面，把种子培育成树吧</p>
        <button class="btn" onclick="showPage('fusion')">去融合</button>
      </div>
    `;
    return;
  }
  
  container.innerHTML = trees.map(tree => {
    const hasRevenue = BigInt(tree.pendingRevenue) > 0n;
    return `
      <div class="tree-card">
        <div class="tree-header">
          <div class="tree-icon">🌳</div>
          <div class="tree-info">
            <div class="tree-name">${tree.name}</div>
            <div class="tree-meta">ID: #${tree.treeId} · ${tree.seedCount}颗种子</div>
          </div>
        </div>
        
        <div class="tree-revenue">
          <div class="revenue-item">
            <span class="revenue-label">累计收益</span>
            <span class="revenue-value">${ethers.formatEther(tree.totalRevenue)} MEER</span>
          </div>
          
          <div class="revenue-item pending">
            <span class="revenue-label">待领取</span>
            <span class="revenue-value highlight">${ethers.formatEther(tree.pendingRevenue)} MEER</span>
          </div>
        </div>
        
        <div class="tree-actions">
          <button class="btn btn-secondary" onclick="showTreeDetail(${tree.treeId})">详情</button>
          <button class="btn ${hasRevenue ? '' : 'disabled'}" 
                  onclick="claimTreeRevenue(${tree.treeId})"
                  ${!hasRevenue ? 'disabled' : ''}>${hasRevenue ? '💰 领取' : '无可领取'}</button>
        </div>
      </div>
    `;
  }).join('');
}

// 领取树的收益
async function claimTreeRevenue(treeId) {
  if (!fusionContract) {
    showStatus('请先连接钱包', 'error');
    return;
  }
  
  try {
    showStatus('领取中...请确认交易', '');
    
    const tx = await fusionContract.claimRevenue(treeId);
    
    showStatus('交易已提交，等待确认...', '');
    await tx.wait();
    
    showStatus('✅ 领取成功！', 'success');
    
    // 刷新列表
    loadMyTrees();
    
  } catch (error) {
    showStatus('领取失败: ' + error.message, 'error');
  }
}

// 显示树详情
async function showTreeDetail(treeId) {
  if (!fusionContract) return;
  
  try {
    const info = await fusionContract.getTreeInfo(treeId);
    
    // 获取每颗种子的信息
    const seedsInfo = await Promise.all(
      info.seedIds.map(async (id) => {
        try {
          const assetInfo = await contract.getAssetInfo(id);
          return {
            tokenId: id.toString(),
            name: assetInfo.metadata.name,
            type: assetInfo.metadata.assetType
          };
        } catch (e) {
          return { tokenId: id.toString(), name: 'Unknown', type: 'unknown' };
        }
      })
    );
    
    // 显示详情弹窗
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
      <div class="modal-content">
        <div class="modal-header">
          <h3>🌳 ${info.name}</h3>
          <button class="close-btn" onclick="this.closest('.modal').remove()">×</button>
        </div>
        
        <div class="modal-body">
          <p>${info.description}</p>
          
          <h4>包含的种子</h4>
          <div class="detail-seeds">
            ${seedsInfo.map((seed, i) => `
              <div class="detail-seed">
                <span>🌱 ${seed.name} (#${seed.tokenId})</span>
                <span>权重: ${info.weights[i]}</span>
              </div>
            `).join('')}
          </div>
          
          <h4>收益统计</h4>
          <div class="detail-revenue">
            <p>累计收益: ${ethers.formatEther(info.totalRevenue)} MEER</p>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
  } catch (error) {
    showStatus('加载详情失败: ' + error.message, 'error');
  }
}

// 向树分配收益（仅树的所有者）
async function distributeToTree(treeId, amount) {
  if (!fusionContract) {
    showStatus('请先连接钱包', 'error');
    return;
  }
  
  try {
    const amountWei = ethers.parseEther(amount.toString());
    
    showStatus('分配收益中...', '');
    
    const tx = await fusionContract.distributeRevenue(treeId, {
      value: amountWei
    });
    
    showStatus('交易已提交...', '');
    await tx.wait();
    
    showStatus('✅ 收益分配成功！', 'success');
    loadMyTrees();
    
  } catch (error) {
    showStatus('分配失败: ' + error.message, 'error');
  }
}