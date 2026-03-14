/**
 * ECHO Music 数据分析面板
 * 功能: 播放量趋势、听众画像、收益分析、导出报告
 */

// ========== 全局状态 ==========
const state = {
  provider: null,
  signer: null,
  userAddress: null,
  timeRange: 30, // 默认30天
  trendType: 'plays', // plays | revenue | listeners
  charts: {},
  analyticsData: null
};

// ========== 合约配置 ==========
const CONTRACT_ADDRESSES = {
  echoAsset: '0x5f5AAe09BB85f561b21845729B79E840AB026148',
  echoFusion: '0x3AD441ECfC193fbe7f086b962d0bCfd2Bc2Bac0d'
};

const ECHO_ASSET_ABI = [
  "function getAssetInfo(uint256) view returns (tuple(string,string,string,string,uint256),tuple(address,address,address,address,uint256,uint256,uint256),address)",
  "function getCurrentTokenId() view returns (uint256)",
  "function ownerOf(uint256) view returns (address)"
];

// ========== 模拟数据生成器 ==========
const DataGenerator = {
  // 生成日期数组
  generateDates(days) {
    const dates = [];
    const today = new Date();
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dates.push(date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }));
    }
    return dates;
  },

  // 生成趋势数据（带随机波动）
  generateTrendData(days, baseValue, volatility = 0.3) {
    const data = [];
    let currentValue = baseValue;
    
    for (let i = 0; i < days; i++) {
      // 添加随机波动和趋势
      const change = (Math.random() - 0.48) * volatility * currentValue;
      currentValue = Math.max(10, currentValue + change);
      
      // 添加周末效应
      const dayOfWeek = (new Date().getDay() - (days - 1 - i) + 7) % 7;
      const weekendMultiplier = (dayOfWeek === 0 || dayOfWeek === 6) ? 1.2 : 1;
      
      data.push(Math.floor(currentValue * weekendMultiplier));
    }
    return data;
  },

  // 生成地区分布数据
  generateRegionData() {
    return {
      labels: ['中国', '美国', '日本', '韩国', '德国', '英国', '其他'],
      data: [35, 25, 12, 8, 6, 5, 9],
      colors: ['#00d4ff', '#7b2cbf', '#f472b6', '#fbbf24', '#4ade80', '#f87171', '#888']
    };
  },

  // 生成设备类型数据
  generateDeviceData() {
    return {
      labels: ['移动端', '桌面端', '平板', '其他'],
      data: [58, 32, 7, 3],
      colors: ['#00d4ff', '#7b2cbf', '#f472b6', '#888']
    };
  },

  // 生成访问时段数据
  generateTimeData() {
    const hours = Array.from({ length: 24 }, (_, i) => `${i}:00`);
    // 模拟一天中的访问高峰
    const data = hours.map((_, i) => {
      if (i >= 0 && i < 6) return Math.floor(Math.random() * 20); // 凌晨低峰
      if (i >= 7 && i < 9) return Math.floor(Math.random() * 100) + 50; // 早高峰
      if (i >= 12 && i < 14) return Math.floor(Math.random() * 150) + 80; // 午休高峰
      if (i >= 18 && i < 23) return Math.floor(Math.random() * 200) + 100; // 晚高峰
      return Math.floor(Math.random() * 80) + 30; // 其他时段
    });
    return { labels: hours, data };
  },

  // 生成收益来源数据
  generateRevenueSourceData() {
    return {
      labels: ['AI训练授权', '流媒体播放', 'NFT销售', '商业授权', '其他'],
      data: [42, 28, 15, 10, 5],
      colors: ['#00d4ff', '#7b2cbf', '#f472b6', '#fbbf24', '#888']
    };
  },

  // 生成最畅销作品
  generateTopAssets() {
    return [
      { name: 'Cyber Dreams', type: '电子', revenue: 2.45, sales: 245 },
      { name: 'Neon Nights', type: '合成器波', revenue: 1.89, sales: 189 },
      { name: 'Digital Horizon', type: '氛围音乐', revenue: 1.67, sales: 167 },
      { name: 'Future Bass', type: '贝斯', revenue: 1.23, sales: 123 },
      { name: 'Ambient Flow', type: '氛围音乐', revenue: 0.98, sales: 98 }
    ];
  }
};

// ========== 图表管理器 ==========
const ChartManager = {
  // 初始化所有图表
  init() {
    this.initTrendChart();
    this.initRegionChart();
    this.initDeviceChart();
    this.initTimeChart();
    this.initSourceChart();
  },

  // 销毁所有图表
  destroyAll() {
    Object.values(state.charts).forEach(chart => {
      if (chart) chart.destroy();
    });
    state.charts = {};
  },

  // 通用图表配置
  getCommonOptions(type = 'line') {
    const isDark = true;
    const textColor = '#888';
    const gridColor = 'rgba(255,255,255,0.05)';
    
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: type === 'pie' || type === 'doughnut',
          position: 'bottom',
          labels: { color: '#fff', padding: 20 }
        },
        tooltip: {
          backgroundColor: 'rgba(10,10,26,0.95)',
          titleColor: '#fff',
          bodyColor: '#ccc',
          borderColor: 'rgba(255,255,255,0.1)',
          borderWidth: 1,
          padding: 12,
          cornerRadius: 8
        }
      },
      scales: type === 'pie' || type === 'doughnut' ? {} : {
        x: {
          grid: { color: gridColor, drawBorder: false },
          ticks: { color: textColor }
        },
        y: {
          grid: { color: gridColor, drawBorder: false },
          ticks: { color: textColor }
        }
      }
    };
  },

  // 初始化趋势图表
  initTrendChart() {
    const ctx = document.getElementById('trendChart');
    if (!ctx) return;

    const dates = DataGenerator.generateDates(state.timeRange);
    const data = DataGenerator.generateTrendData(state.timeRange, 500, 0.2);

    const datasets = [{
      label: state.trendType === 'plays' ? '播放量' : 
             state.trendType === 'revenue' ? '收益 (ETH)' : '独立听众',
      data: state.trendType === 'revenue' ? data.map(v => (v * 0.001).toFixed(3)) : data,
      borderColor: '#00d4ff',
      backgroundColor: 'rgba(0,212,255,0.1)',
      fill: true,
      tension: 0.4,
      pointRadius: 0,
      pointHoverRadius: 6,
      borderWidth: 2
    }];

    if (state.trendType === 'plays') {
      // 添加对比数据
      datasets.push({
        label: '上期对比',
        data: DataGenerator.generateTrendData(state.timeRange, 450, 0.25),
        borderColor: '#7b2cbf',
        backgroundColor: 'transparent',
        borderDash: [5, 5],
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
        borderWidth: 2
      });
    }

    state.charts.trend = new Chart(ctx, {
      type: 'line',
      data: { labels: dates, datasets },
      options: {
        ...this.getCommonOptions('line'),
        interaction: { intersect: false, mode: 'index' },
        plugins: {
          ...this.getCommonOptions('line').plugins,
          legend: { display: true, labels: { color: '#fff' } }
        }
      }
    });
  },

  // 初始化地区分布图表
  initRegionChart() {
    const ctx = document.getElementById('regionChart');
    if (!ctx) return;

    const regionData = DataGenerator.generateRegionData();

    state.charts.region = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: regionData.labels,
        datasets: [{
          data: regionData.data,
          backgroundColor: regionData.colors,
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        ...this.getCommonOptions('doughnut'),
        cutout: '60%'
      }
    });
  },

  // 初始化设备类型图表
  initDeviceChart() {
    const ctx = document.getElementById('deviceChart');
    if (!ctx) return;

    const deviceData = DataGenerator.generateDeviceData();

    state.charts.device = new Chart(ctx, {
      type: 'pie',
      data: {
        labels: deviceData.labels,
        datasets: [{
          data: deviceData.data,
          backgroundColor: deviceData.colors,
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: this.getCommonOptions('pie')
    });
  },

  // 初始化访问时段图表
  initTimeChart() {
    const ctx = document.getElementById('timeChart');
    if (!ctx) return;

    const timeData = DataGenerator.generateTimeData();

    state.charts.time = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: timeData.labels,
        datasets: [{
          label: '访问量',
          data: timeData.data,
          backgroundColor: (ctx) => {
            const value = ctx.raw;
            return value > 150 ? '#00d4ff' : value > 100 ? '#7b2cbf' : '#888';
          },
          borderRadius: 4,
          borderSkipped: false
        }]
      },
      options: {
        ...this.getCommonOptions('bar'),
        plugins: { legend: { display: false } }
      }
    });
  },

  // 初始化收益来源图表
  initSourceChart() {
    const ctx = document.getElementById('sourceChart');
    if (!ctx) return;

    const sourceData = DataGenerator.generateRevenueSourceData();

    state.charts.source = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: sourceData.labels,
        datasets: [{
          data: sourceData.data,
          backgroundColor: sourceData.colors,
          borderWidth: 0,
          hoverOffset: 4
        }]
      },
      options: {
        ...this.getCommonOptions('doughnut'),
        cutout: '55%',
        plugins: {
          legend: { display: false }
        }
      }
    });

    // 渲染自定义图例
    this.renderSourceLegend(sourceData);
  },

  // 渲染收益来源图例
  renderSourceLegend(sourceData) {
    const container = document.getElementById('sourceLegend');
    if (!container) return;

    const total = sourceData.data.reduce((a, b) => a + b, 0);

    container.innerHTML = sourceData.labels.map((label, i) => {
      const value = sourceData.data[i];
      const percent = ((value / total) * 100).toFixed(1);
      return `
        <div class="source-item">
          <div class="source-color" style="background: ${sourceData.colors[i]}"></div>
          <span class="source-name">${label}</span>
          <span class="source-value">${value}%</span>
          <span class="source-percent">(${percent}%)</span>
        </div>
      `;
    }).join('');
  },

  // 更新趋势图表
  updateTrendChart() {
    if (state.charts.trend) {
      state.charts.trend.destroy();
    }
    this.initTrendChart();
  }
};

// ========== 数据分析核心 ==========
const AnalyticsCore = {
  // 加载所有数据
  async loadData() {
    this.updateStats();
    this.renderTopAssets();
    ChartManager.init();
  },

  // 更新统计数据
  updateStats() {
    // 生成基于时间范围的统计值
    const multiplier = state.timeRange / 30;
    
    const stats = {
      plays: Math.floor(12580 * multiplier * (0.8 + Math.random() * 0.4)),
      listeners: Math.floor(3420 * multiplier * (0.8 + Math.random() * 0.4)),
      revenue: (4.56 * multiplier * (0.8 + Math.random() * 0.4)).toFixed(2),
      assets: 12
    };

    // 更新DOM
    document.getElementById('totalPlays').textContent = this.formatNumber(stats.plays);
    document.getElementById('totalListeners').textContent = this.formatNumber(stats.listeners);
    document.getElementById('totalRevenue').textContent = stats.revenue + ' ETH';
    document.getElementById('totalAssets').textContent = stats.assets;

    // 更新变化率
    const changes = {
      plays: (Math.random() * 40 - 10).toFixed(1),
      listeners: (Math.random() * 30 - 5).toFixed(1),
      revenue: (Math.random() * 50 - 15).toFixed(1),
      assets: (Math.random() * 20).toFixed(1)
    };

    this.updateChangeIndicator('playsChange', 'playsChangeValue', changes.plays);
    this.updateChangeIndicator('listenersChange', 'listenersChangeValue', changes.listeners);
    this.updateChangeIndicator('revenueChange', 'revenueChangeValue', changes.revenue);
    this.updateChangeIndicator('assetsChange', 'assetsChangeValue', changes.assets);
  },

  // 更新变化指示器
  updateChangeIndicator(elId, valueId, value) {
    const el = document.getElementById(elId);
    const valEl = document.getElementById(valueId);
    const num = parseFloat(value);
    
    el.className = 'stat-change ' + (num >= 0 ? 'positive' : 'negative');
    el.querySelector('span').textContent = num >= 0 ? '↑' : '↓';
    valEl.textContent = Math.abs(num) + '%';
  },

  // 渲染最畅销作品
  renderTopAssets() {
    const container = document.getElementById('topAssetsList');
    if (!container) return;

    const assets = DataGenerator.generateTopAssets();

    container.innerHTML = assets.map((asset, index) => {
      const rankClass = index === 0 ? 'top1' : index === 1 ? 'top2' : index === 2 ? 'top3' : 'other';
      return `
        <li class="revenue-item">
          <div class="revenue-rank ${rankClass}">${index + 1}</div>
          <div class="revenue-info">
            <div class="revenue-name">${asset.name}</div>
            <div class="revenue-meta">${asset.type} · ${asset.sales} 次销售</div>
          </div>
          <div class="revenue-amount">${asset.revenue} ETH</div>
        </li>
      `;
    }).join('');
  },

  // 格式化数字
  formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
  }
};

// ========== 导出功能 ==========
const ExportManager = {
  // 导出CSV
  exportCSV() {
    const data = this.generateExportData();
    const csv = this.convertToCSV(data);
    this.downloadFile(csv, `analytics_report_${new Date().toISOString().split('T')[0]}.csv`, 'text/csv');
  },

  // 生成导出数据
  generateExportData() {
    return [
      ['指标', '数值', '变化率'],
      ['总播放量', document.getElementById('totalPlays').textContent, document.getElementById('playsChangeValue').textContent],
      ['独立听众', document.getElementById('totalListeners').textContent, document.getElementById('listenersChangeValue').textContent],
      ['总收益', document.getElementById('totalRevenue').textContent, document.getElementById('revenueChangeValue').textContent],
      ['音乐资产', document.getElementById('totalAssets').textContent, document.getElementById('assetsChangeValue').textContent],
      [],
      ['最畅销作品', '收益 (ETH)', '销售次数'],
      ...DataGenerator.generateTopAssets().map(a => [a.name, a.revenue, a.sales])
    ];
  },

  // 转换为CSV格式
  convertToCSV(data) {
    return data.map(row => 
      row.map(cell => {
        if (cell === undefined || cell === null) return '';
        const str = String(cell);
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      }).join(',')
    ).join('\n');
  },

  // 下载文件
  downloadFile(content, filename, type) {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  // 导出PDF
  async exportPDF() {
    const { jsPDF } = window.jspdf;
    if (!jsPDF) {
      alert('PDF生成库加载中，请稍后重试');
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    
    // 标题
    doc.setFontSize(20);
    doc.text('ECHO Music 数据分析报告', pageWidth / 2, 20, { align: 'center' });
    
    // 日期
    doc.setFontSize(12);
    doc.text(`生成时间: ${new Date().toLocaleString('zh-CN')}`, pageWidth / 2, 30, { align: 'center' });
    
    // 统计概览
    doc.setFontSize(16);
    doc.text('📊 统计概览', 20, 50);
    
    doc.setFontSize(12);
    const stats = [
      `总播放量: ${document.getElementById('totalPlays').textContent} (${document.getElementById('playsChangeValue').textContent})`,
      `独立听众: ${document.getElementById('totalListeners').textContent} (${document.getElementById('listenersChangeValue').textContent})`,
      `总收益: ${document.getElementById('totalRevenue').textContent} (${document.getElementById('revenueChangeValue').textContent})`,
      `音乐资产: ${document.getElementById('totalAssets').textContent} (${document.getElementById('assetsChangeValue').textContent})`
    ];
    
    let y = 65;
    stats.forEach(stat => {
      doc.text(stat, 20, y);
      y += 10;
    });
    
    // 最畅销作品
    doc.setFontSize(16);
    doc.text('🏆 最畅销作品 TOP 5', 20, y + 10);
    
    doc.setFontSize(12);
    y += 25;
    DataGenerator.generateTopAssets().forEach((asset, i) => {
      doc.text(`${i + 1}. ${asset.name} - ${asset.revenue} ETH (${asset.sales}次)`, 20, y);
      y += 10;
    });
    
    // 保存
    doc.save(`analytics_report_${new Date().toISOString().split('T')[0]}.pdf`);
  }
};

// ========== 事件处理 ==========

// 连接钱包
async function connectWallet() {
  if (!window.ethereum) {
    alert('请先安装 MetaMask');
    return;
  }

  try {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    state.userAddress = accounts[0];
    
    // 更新UI
    document.getElementById('connectPrompt').style.display = 'none';
    document.getElementById('analyticsContent').style.display = 'block';
    
    const btn = document.getElementById('connectBtn');
    btn.textContent = state.userAddress.slice(0, 6) + '...' + state.userAddress.slice(-4);

    // 初始化Provider
    state.provider = new ethers.providers.Web3Provider(window.ethereum);
    state.signer = state.provider.getSigner();

    // 加载数据
    await AnalyticsCore.loadData();

  } catch (error) {
    console.error('连接失败:', error);
    alert('连接失败: ' + error.message);
  }
}

// 设置时间范围
function setTimeRange(days) {
  state.timeRange = days;
  
  // 更新按钮状态
  document.querySelectorAll('.time-filter-btn').forEach(btn => {
    btn.classList.toggle('active', parseInt(btn.dataset.range) === days);
  });
  
  // 刷新数据
  AnalyticsCore.updateStats();
  ChartManager.updateTrendChart();
}

// 切换趋势类型
function switchTrendType(type) {
  state.trendType = type;
  
  // 更新按钮状态
  document.querySelectorAll('.chart-action-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.type === type);
  });
  
  // 更新图表
  ChartManager.updateTrendChart();
}

// 导出CSV
function exportCSV() {
  ExportManager.exportCSV();
}

// 导出PDF
function exportPDF() {
  ExportManager.exportPDF();
}

// ========== 初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
  // 检查是否已连接
  if (window.ethereum && window.ethereum.selectedAddress) {
    connectWallet();
  }
});
