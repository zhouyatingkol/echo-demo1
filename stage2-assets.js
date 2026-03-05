// 资产数据
const assetData = {
    'PDB-001': {
        name: 'PDB-001',
        type: '蛋白质结构',
        icon: '🧬',
        color: 'cyan',
        contributor: '公共科研联盟',
        share: '100%',
        rule: '商业衍生品须反馈1%收入',
        desc: '公共蛋白质结构数据库，所有研究的基石。开源数据，永久可追溯。'
    },
    'CHEM-002': {
        name: 'CHEM-002',
        type: '化合物库',
        icon: '⚗️',
        color: 'green',
        contributor: '智药科技',
        share: '60%',
        rule: '协作衍生须 attribution',
        desc: '虚拟筛选化合物库，包含10000+小分子结构数据。'
    },
    'GENE-003': {
        name: 'GENE-003',
        type: '基因序列',
        icon: '🧪',
        color: 'teal',
        contributor: '康源医院',
        share: '70%',
        rule: '禁止直接商业克隆应用',
        desc: '靶点基因序列数据，经过临床验证的精准医疗信息。'
    },
    'VSCREEN-004': {
        name: 'VSCREEN-004',
        type: '虚拟筛选',
        icon: '💻',
        color: 'mint',
        contributor: '元生资本',
        share: '50%',
        rule: '收益共享比例锁定',
        desc: 'AI辅助虚拟筛选结果，机器学习预测的结合亲和力数据。'
    },
    'NeuroBlok': {
        name: 'NeuroBlok',
        type: '协作成果',
        icon: '⭐',
        color: 'gold',
        contributor: '多方协作',
        share: '智药60%/康源30%/公共5%/AI5%',
        rule: '收益自动按比例分配',
        desc: '由PDB+CHEM+GENE协作衍生的新资产，具有完整权属链。'
    }
};

// 铸造状态
let mintedAssets = new Set();

// 显示资产详情
function showAssetDetail(assetId) {
    const asset = assetData[assetId];
    const platform = document.getElementById('platformContent');
    const blueprint = document.getElementById('blueprintContent');
    const isMinted = mintedAssets.has(assetId);
    
    // 更新铸造平台显示
    platform.innerHTML = `
        <div class="asset-preview-large">
            <div class="preview-glow ${asset.color}"></div>
            <div class="preview-icon">${asset.icon}</div>
            <div class="preview-id">${asset.name}</div>
            <div class="preview-type">${asset.type}</div>
        </div>
        <div class="asset-actions">
            <button class="btn-mint ${isMinted ? 'minted' : ''}" onclick="mintAsset('${assetId}')" ${isMinted ? 'disabled' : ''}>
                ${isMinted ? '✓ 已铸造' : '🔨 铸造资产'}
            </button>
        </div>
        <div class="asset-desc">${asset.desc}</div>
    `;
    
    // 更新权属蓝图
    blueprint.innerHTML = `
        <div class="blueprint-section">
            <div class="section-title">贡献者</div>
            <div class="section-value glow-gold">${asset.contributor}</div>
            <div class="section-share">${asset.share}</div>
        </div>
        <div class="blueprint-section">
            <div class="section-title">关键规则</div>
            <div class="section-rule">${asset.rule}</div>
        </div>
        <div class="blueprint-connector"></div>
        <div class="blueprint-hint">
            ⚡ 贡献被ECHO协议永久铭记
        </div>
    `;
    
    // 添加动画
    gsap.fromTo(platform, 
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" }
    );
    
    gsap.fromTo(blueprint,
        { opacity: 0, x: 20 },
        { opacity: 1, x: 0, duration: 0.4, delay: 0.1, ease: "power2.out" }
    );
}

// 铸造资产
function mintAsset(assetId) {
    if (mintedAssets.has(assetId)) return;
    
    // 添加铸造动画
    const btn = document.querySelector('.btn-mint');
    btn.innerHTML = '铸造中...';
    btn.style.opacity = '0.7';
    
    setTimeout(() => {
        mintedAssets.add(assetId);
        
        // 更新卡片状态
        const card = document.querySelector(`[data-id="${assetId}"]`);
        card.classList.add('minted');
        document.getElementById(`status-${assetId}`).textContent = '已铸造';
        
        // 更新进度
        updateMintProgress();
        
        // 播放铸造成功动画
        playMintAnimation();
        
        // 更新按钮
        btn.innerHTML = '✓ 已铸造';
        btn.classList.add('minted');
        btn.disabled = true;
        
        // 如果全部铸造完成
        if (mintedAssets.size === 5) {
            setTimeout(() => {
                document.getElementById('stage2Next').style.opacity = '1';
                document.getElementById('stage2Next').style.pointerEvents = 'auto';
                
                // 显示完成提示
                showCompletionMessage();
            }, 500);
        }
    }, 1500);
}

// 更新铸造进度
function updateMintProgress() {
    const count = mintedAssets.size;
    const total = 5;
    const percentage = (count / total) * 100;
    
    document.getElementById('mintedCount').textContent = `${count}/${total}`;
    document.getElementById('mintProgress').style.width = `${percentage}%`;
}

// 铸造成功动画
function playMintAnimation() {
    const rings = document.querySelectorAll('.platform-ring');
    rings.forEach((ring, i) => {
        gsap.to(ring, {
            scale: 1.5,
            opacity: 0,
            duration: 0.6,
            delay: i * 0.1,
            onComplete: () => {
                gsap.set(ring, { scale: 1, opacity: 1 });
            }
        });
    });
}

// 显示完成消息
function showCompletionMessage() {
    const platform = document.getElementById('platformContent');
    const originalContent = platform.innerHTML;
    
    platform.innerHTML = `
        <div class="completion-message">
            <div class="completion-icon">🎉</div>
            <div class="completion-title">全部铸造完成</div>
            <div class="completion-desc">5个资产已上链，权属永久记录</div>
        </div>
    `;
    
    gsap.fromTo(platform.querySelector('.completion-message'),
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.5, ease: "back.out(1.7)" }
    );
}

// 初始化第2页
function initStage2() {
    // 默认显示提示
    const platform = document.getElementById('platformContent');
    const blueprint = document.getElementById('blueprintContent');
    
    if (platform && blueprint) {
        platform.innerHTML = `
            <div class="platform-hint">
                <div class="hint-icon">👆</div>
                <div class="hint-text">点击左侧资产查看详情</div>
                <div class="hint-sub">选择资产后可在中央铸造</div>
            </div>
        `;
        
        blueprint.innerHTML = `
            <p class="blueprint-hint">点击资产查看权属信息</p>
        `;
    }
}