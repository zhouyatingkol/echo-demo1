/**
 * 提现系统组件
 * 用于处理创作者收益提现
 */
class WithdrawalSystem {
  constructor(contract, userAddress) {
    this.contract = contract;
    this.userAddress = userAddress;
    this.balance = 0;
    this.pendingWithdrawal = false;
  }

  async getBalance() {
    try {
      // 这里应该调用合约获取可提现余额
      // 简化处理，返回一个模拟值
      return this.balance;
    } catch (error) {
      console.error('获取余额失败:', error);
      return 0;
    }
  }

  async updateBalance() {
    try {
      // 通过事件计算当前余额
      if (!this.contract) return;
      
      const filter = this.contract.filters.AssetUsed(null, null, null);
      const events = await this.contract.queryFilter(filter, 0, 'latest');
      
      let total = 0;
      for (const event of events) {
        if (event.args) {
          total += parseFloat(ethers.utils.formatEther(event.args.amount));
        }
      }
      
      this.balance = total;
      
      // 更新显示
      const balanceEl = document.getElementById('withdrawBalance');
      if (balanceEl) {
        balanceEl.textContent = this.balance.toFixed(4) + ' MEER';
      }
    } catch (error) {
      console.error('更新余额失败:', error);
    }
  }

  renderWithdrawalForm(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = `
      <div style="display: flex; align-items: center; gap: 20px; flex-wrap: wrap;">
        <div style="flex: 1; min-width: 200px;">
          <div style="color: #888; font-size: 14px; margin-bottom: 8px;">可提现余额</div>
          <div style="font-size: 24px; font-weight: bold; color: #00d4ff;" id="withdrawBalance">0 MEER</div>
        </div>
        
        <div style="flex: 2; min-width: 300px;">
          <div style="display: flex; gap: 12px; align-items: flex-end;">
            <div style="flex: 1;">
              <label style="display: block; color: #888; font-size: 12px; margin-bottom: 4px;">提现金额 (MEER)</label>
              <input 
                type="number" 
                id="withdrawAmount" 
                placeholder="0.00" 
                step="0.001"
                min="0.001"
                style="width: 100%; padding: 10px 12px; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: #fff; font-size: 14px;"
              >
            </div>
            <button 
              onclick="withdrawalSystem.withdraw()"
              id="withdrawBtn"
              style="padding: 10px 24px; background: linear-gradient(90deg, #00d4ff, #7b2cbf); border: none; border-radius: 8px; color: #fff; font-size: 14px; cursor: pointer; transition: opacity 0.3s;"
            >
              提现
            </button>
          </div>
          <div style="margin-top: 8px; font-size: 12px; color: #666;">
            最小提现金额: 0.001 MEER | 提现到当前连接钱包地址
          </div>
        </div>
      </div>
      
      <div id="withdrawMessage" style="margin-top: 16px; padding: 12px; border-radius: 8px; display: none;"></div>
    `;

    // 加载余额
    this.updateBalance();
  }

  async withdraw() {
    const amountInput = document.getElementById('withdrawAmount');
    const btn = document.getElementById('withdrawBtn');
    const messageEl = document.getElementById('withdrawMessage');
    
    if (!amountInput || !btn) return;

    const amount = parseFloat(amountInput.value);
    
    // 验证
    if (!amount || amount <= 0) {
      this.showMessage('请输入有效的提现金额', 'error');
      return;
    }
    
    if (amount < 0.001) {
      this.showMessage('最小提现金额为 0.001 MEER', 'error');
      return;
    }
    
    if (amount > this.balance) {
      this.showMessage('余额不足', 'error');
      return;
    }

    // 设置按钮状态
    this.pendingWithdrawal = true;
    btn.disabled = true;
    btn.textContent = '处理中...';
    btn.style.opacity = '0.6';

    try {
      this.showMessage('正在提交提现请求...', 'info');
      
      // 模拟提现处理（实际应调用合约方法）
      // const tx = await this.contract.withdraw(ethers.utils.parseEther(amount.toString()));
      // await tx.wait();
      
      // 模拟延迟
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      this.showMessage(`成功提现 ${amount.toFixed(4)} MEER 到 ${this.shortenAddress(this.userAddress)}`, 'success');
      
      // 清空输入
      amountInput.value = '';
      
      // 更新余额
      this.balance -= amount;
      const balanceEl = document.getElementById('withdrawBalance');
      if (balanceEl) {
        balanceEl.textContent = this.balance.toFixed(4) + ' MEER';
      }
      
      // 刷新统计数据
      if (typeof loadStats === 'function') {
        loadStats();
      }
      
    } catch (error) {
      console.error('提现失败:', error);
      this.showMessage('提现失败: ' + (error.message || '未知错误'), 'error');
    } finally {
      this.pendingWithdrawal = false;
      btn.disabled = false;
      btn.textContent = '提现';
      btn.style.opacity = '1';
    }
  }

  showMessage(message, type) {
    const messageEl = document.getElementById('withdrawMessage');
    if (!messageEl) return;
    
    const colors = {
      success: 'rgba(0, 212, 255, 0.1)',
      error: 'rgba(255, 107, 107, 0.1)',
      info: 'rgba(123, 44, 191, 0.1)'
    };
    
    const borderColors = {
      success: '#00d4ff',
      error: '#ff6b6b',
      info: '#7b2cbf'
    };
    
    messageEl.style.display = 'block';
    messageEl.style.background = colors[type] || colors.info;
    messageEl.style.border = `1px solid ${borderColors[type] || borderColors.info}`;
    messageEl.style.color = '#fff';
    messageEl.textContent = message;
    
    // 3秒后自动隐藏
    setTimeout(() => {
      messageEl.style.display = 'none';
    }, 5000);
  }

  shortenAddress(address) {
    if (!address) return '';
    return address.slice(0, 6) + '...' + address.slice(-4);
  }
}
