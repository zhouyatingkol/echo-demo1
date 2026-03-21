// 模拟数据（实际项目中应从API或JSON文件加载）
const mockData = {
    "ASSET_001": {
        name: "《墨竹》",
        type: "digital_art",
        field: "姤",
        position: "九四",
        shiEnergy: 7200,
        dimensions: { yong: 85, kuo: 92, yan: 78, yi: 65 },
        history: [
            { week: 1, field: "乾", position: "九五", energy: 7500 },
            { week: 2, field: "姤", position: "九五", energy: 7400 },
            { week: 3, field: "姤", position: "九四", energy: 7300 },
            { week: 4, field: "姤", position: "九四", energy: 7200 }
        ]
    },
    "ASSET_002": {
        name: "《山水》",
        type: "digital_art",
        field: "乾",
        position: "九五",
        shiEnergy: 8500,
        dimensions: { yong: 92, kuo: 88, yan: 85, yi: 78 },
        history: [
            { week: 1, field: "乾", position: "九五", energy: 8200 },
            { week: 2, field: "乾", position: "九五", energy: 8300 },
            { week: 3, field: "乾", position: "九五", energy: 8400 },
            { week: 4, field: "乾", position: "九五", energy: 8500 }
        ]
    }
};

// 当前选中的周
let currentWeek = 1;

// 查询资产
async function queryAsset() {
    const input = document.getElementById('assetInput');
    const assetId = input.value.trim().toUpperCase();
    
    if (!assetId) {
        alert('请输入资产ID');
        return;
    }
    
    // 从模拟数据或加载真实数据
    const asset = mockData[assetId];
    
    if (!asset) {
        // 尝试从JSON文件加载
        try {
            const response = await fetch(`../echo-shi-oracle/data/week_${currentWeek}.json`);
            const data = await response.json();
            if (data.assets && data.assets[assetId]) {
                displayAsset(data.assets[assetId]);
            } else {
                alert('未找到该资产');
            }
        } catch (e) {
            alert('未找到该资产');
        }
        return;
    }
    
    displayAsset(asset);
}

// 显示资产信息
function displayAsset(asset) {
    const card = document.getElementById('assetCard');
    card.classList.remove('hidden');
    
    document.getElementById('assetName').textContent = asset.name || assetId;
    document.getElementById('assetId').textContent = asset.id || assetId;
    document.getElementById('fieldName').textContent = (asset.field || asset.hexagramName) + '势场';
    document.getElementById('yaoPosition').textContent = (asset.position || asset.positionName) + '势位';
    document.getElementById('shiEnergy').textContent = '势能: ' + (asset.shiEnergy || asset.shiValue);
    
    // 更新维度条
    const dims = asset.dimensions || {
        yong: asset.dimensions?.yong || 50,
        kuo: asset.dimensions?.kuo || 50,
        yan: asset.dimensions?.yan || 50,
        yi: asset.dimensions?.yi || 50
    };
    
    updateDimensionBar('yong', dims.yong);
    updateDimensionBar('kuo', dims.kuo);
    updateDimensionBar('yan', dims.yan);
    updateDimensionBar('yi', dims.yi);
    
    // 显示跃迁历史
    if (asset.history) {
        displayTransitions(asset.history);
    }
}

// 更新维度条
function updateDimensionBar(name, value) {
    document.getElementById(`${name}Bar`).style.width = value + '%';
    document.getElementById(`${name}Value`).textContent = value;
}

// 显示跃迁历史
function displayTransitions(history) {
    const section = document.getElementById('transitionSection');
    section.classList.remove('hidden');
    
    const timeline = document.getElementById('transitionTimeline');
    timeline.innerHTML = '';
    
    history.forEach((record, index) => {
        const item = document.createElement('div');
        item.className = 'timeline-item';
        item.innerHTML = `
            <div class="timeline-week">第${record.week}周</div>
            <div class="timeline-content">
                ${record.field}势场 · ${record.position}势位
                <span class="timeline-energy">势能: ${record.energy}</span>
            </div>
        `;
        timeline.appendChild(item);
    });
}

// 加载指定周的数据
async function loadWeek(week) {
    currentWeek = week;
    
    // 更新按钮状态
    document.querySelectorAll('.week-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
    
    // 重新加载数据
    const assetId = document.getElementById('assetInput').value.trim().toUpperCase();
    if (assetId) {
        queryAsset();
    }
    
    // 更新演化图表
    updateEvolutionChart(week);
}

// 更新演化图表
function updateEvolutionChart(week) {
    // 实际项目中应加载该周的数据并重新渲染图表
    console.log('Loading week', week);
}

// 初始化
window.onload = function() {
    // 默认查询第一个资产作为示例
    document.getElementById('assetInput').value = 'ASSET_001';
    queryAsset();
};
