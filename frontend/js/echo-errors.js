// ECHO 错误处理工具

const ECHOErrors = {
    // 合约错误映射
    CONTRACT_ERRORS: {
        'Content already minted': '该内容已被生成，不能重复创建',
        'Invalid content hash': '无效的内容哈希',
        'Asset does not exist': '资产不存在，请检查 Token ID',
        'Only creator can update': '只有创作者可以更新内容',
        'Derivatives not allowed': '该资产不允许创建衍生作品',
        'Insufficient fee': '费用不足，请增加支付的 MEER',
        'Max users reached': '已达到最大使用人数限制',
        'Not usage owner': '您不是使用权所有者',
        'Not derivative owner': '您不是衍生权所有者',
        'Not extension owner': '您不是扩展权所有者',
        'Not revenue owner': '您不是收益权所有者',
        'insufficient funds': '钱包余额不足，请充值 MEER',
        'user rejected transaction': '您取消了交易',
        'Invalid owner': '无效的所有者地址'
    },

    // 网络错误
    NETWORK_ERRORS: {
        'network changed': '网络已切换，请刷新页面',
        'disconnect': '钱包已断开连接',
        'timeout': '请求超时，请重试',
        'invalid JSON': '网络响应错误'
    },

    // 解析错误
    parseError(error) {
        if (!error) return { type: 'unknown', message: '未知错误' };

        const errorMessage = error.message || error.toString();

        // 检查合约错误
        for (const [key, value] of Object.entries(this.CONTRACT_ERRORS)) {
            if (errorMessage.includes(key)) {
                return {
                    type: 'contract',
                    code: key,
                    message: value,
                    original: errorMessage
                };
            }
        }

        // 检查网络错误
        for (const [key, value] of Object.entries(this.NETWORK_ERRORS)) {
            if (errorMessage.toLowerCase().includes(key.toLowerCase())) {
                return {
                    type: 'network',
                    code: key,
                    message: value,
                    original: errorMessage
                };
            }
        }

        // 用户取消
        if (errorMessage.includes('user rejected') || errorMessage.includes('ACTION_REJECTED')) {
            return {
                type: 'user',
                code: 'rejected',
                message: '交易已取消',
                original: errorMessage
            };
        }

        // MetaMask 特定错误
        if (errorMessage.includes('MetaMask')) {
            return {
                type: 'metamask',
                code: 'metamask_error',
                message: 'MetaMask 错误: ' + errorMessage,
                original: errorMessage
            };
        }

        // 默认
        return {
            type: 'unknown',
            code: 'unknown',
            message: errorMessage,
            original: errorMessage
        };
    },

    // 显示错误提示
    showError(error, containerId = 'status') {
        const parsed = this.parseError(error);
        const container = document.getElementById(containerId);
        
        if (container) {
            container.innerHTML = `
                <div class="status error">
                    <strong>❌ ${parsed.message}</strong>
                    ${parsed.type === 'unknown' ? `<br><small style="color:#888">${parsed.original.slice(0, 100)}...</small>` : ''}
                </div>
            `;
        }

        console.error('[ECHO Error]', parsed);
        return parsed;
    },

    // 显示成功提示
    showSuccess(message, containerId = 'status') {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `<div class="status success">✅ ${message}</div>
            `;
        }
    },

    // 显示加载提示
    showLoading(message = '处理中...', containerId = 'status') {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = `<div class="status pending">⏳ ${message}</div>
            `;
        }
    },

    // 清除提示
    clearStatus(containerId = 'status') {
        const container = document.getElementById(containerId);
        if (container) {
            container.innerHTML = '';
        }
    }
};

// 导出
if (typeof window !== 'undefined') {
    window.ECHOErrors = ECHOErrors;
}