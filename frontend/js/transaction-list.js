/**
 * 交易列表组件
 * 用于显示和管理创作者的交易记录
 */
class TransactionList {
  constructor(containerId, contract, userAddress) {
    this.container = document.getElementById(containerId);
    this.contract = contract;
    this.userAddress = userAddress;
    this.transactions = [];
    this.filteredTransactions = [];
  }

  async loadTransactions() {
    if (!this.contract || !this.userAddress) {
      this.renderError('合约未初始化');
      return;
    }

    try {
      // 获取 AssetUsed 事件
      const filter = this.contract.filters.AssetUsed(null, null, null);
      const events = await this.contract.queryFilter(filter, 0, 'latest');
      
      this.transactions = [];
      
      for (const event of events) {
        if (event.args) {
          const block = await this.contract.provider.getBlock(event.blockNumber);
          const amount = parseFloat(ethers.utils.formatEther(event.args.amount));
          
          // 获取资产信息
          let assetName = '未知资产';
          try {
            const assetInfo = await this.contract.getAssetInfo(event.args.tokenId);
            if (assetInfo && assetInfo[0]) {
              assetName = assetInfo[0].name;
            }
          } catch (e) {
            // 忽略获取资产信息失败的错误
          }
          
          this.transactions.push({
            id: event.transactionHash,
            tokenId: event.args.tokenId.toString(),
            user: event.args.user,
            amount: amount,
            timestamp: block ? block.timestamp * 1000 : Date.now(),
            type: amount > 0.1 ? 'usage' : 'derivative',
            typeLabel: amount > 0.1 ? '使用费' : '衍生费',
            assetName: assetName,
            blockNumber: event.blockNumber
          });
        }
      }
      
      // 按时间倒序排列
      this.transactions.sort((a, b) => b.timestamp - a.timestamp);
      this.filteredTransactions = [...this.transactions];
      
      this.render();
    } catch (error) {
      console.error('加载交易失败:', error);
      this.renderError('加载交易失败: ' + error.message);
    }
  }

  filter(type, period) {
    this.filteredTransactions = this.transactions.filter(tx => {
      // 类型筛选
      if (type && type !== 'all' && tx.type !== type) {
        return false;
      }
      
      // 时间筛选
      if (period && period !== 'all') {
        const now = Date.now();
        const txTime = tx.timestamp;
        
        switch (period) {
          case 'today':
            const todayStart = new Date().setHours(0, 0, 0, 0);
            if (txTime < todayStart) return false;
            break;
          case 'week':
            const weekAgo = now - 7 * 24 * 60 * 60 * 1000;
            if (txTime < weekAgo) return false;
            break;
          case 'month':
            const monthAgo = now - 30 * 24 * 60 * 60 * 1000;
            if (txTime < monthAgo) return false;
            break;
        }
      }
      
      return true;
    });
    
    this.render();
  }

  render() {
    if (!this.container) return;
    
    if (this.filteredTransactions.length === 0) {
      this.container.innerHTML = '<div style="text-align: center; padding: 40px; color: #888;">暂无交易记录</div>';
      return;
    }

    let html = '<table style="width: 100%; border-collapse: collapse;">';
    html += '<thead><tr style="border-bottom: 1px solid rgba(255,255,255,0.1);">';
    html += '<th style="padding: 12px; text-align: left; color: #888; font-weight: normal;">时间</th>';
    html += '<th style="padding: 12px; text-align: left; color: #888; font-weight: normal;">资产</th>';
    html += '<th style="padding: 12px; text-align: left; color: #888; font-weight: normal;">类型</th>';
    html += '<th style="padding: 12px; text-align: right; color: #888; font-weight: normal;">金额</th>';
    html += '</tr></thead><tbody>';
    
    for (const tx of this.filteredTransactions) {
      const date = new Date(tx.timestamp);
      const dateStr = `${date.getMonth() + 1}/${date.getDate()} ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
      
      const typeColor = tx.type === 'usage' ? '#00d4ff' : '#7b2cbf';
      
      html += `<tr style="border-bottom: 1px solid rgba(255,255,255,0.05);">`;
      html += `<td style="padding: 12px; color: #aaa;">${dateStr}</td>`;
      html += `<td style="padding: 12px; color: #fff;">${tx.assetName} <span style="color: #666; font-size: 12px;">#${tx.tokenId}</span></td>`;
      html += `<td style="padding: 12px;"><span style="color: ${typeColor}; font-size: 12px; padding: 4px 8px; background: rgba(255,255,255,0.05); border-radius: 4px;">${tx.typeLabel}</span></td>`;
      html += `<td style="padding: 12px; text-align: right; color: #00d4ff; font-weight: bold;">+${tx.amount.toFixed(4)} MEER</td>`;
      html += `</tr>`;
    }
    
    html += '</tbody></table>';
    
    this.container.innerHTML = html;
  }

  renderError(message) {
    if (this.container) {
      this.container.innerHTML = `<div style="text-align: center; padding: 40px; color: #ff6b6b;">${message}</div>`;
    }
  }

  exportCSV() {
    if (this.filteredTransactions.length === 0) {
      alert('没有可导出的交易');
      return;
    }
    
    let csv = '时间,资产,TokenID,类型,金额(MEER),交易哈希\n';
    
    for (const tx of this.filteredTransactions) {
      const date = new Date(tx.timestamp);
      const dateStr = date.toLocaleString('zh-CN');
      csv += `${dateStr},${tx.assetName},${tx.tokenId},${tx.typeLabel},${tx.amount},${tx.id}\n`;
    }
    
    const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `transactions_${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
  }
}
