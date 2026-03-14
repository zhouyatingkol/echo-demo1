/**
 * ECHO Toast System - 统一提示组件
 * 东方意境风格，全站统一使用
 */

(function() {
    'use strict';
    
    // Toast 容器
    let toastContainer = null;
    
    // 初始化容器
    function initContainer() {
        if (toastContainer) return;
        
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        toastContainer.id = 'echoToastContainer';
        document.body.appendChild(toastContainer);
    }
    
    // 创建 Toast
    function createToast(options) {
        initContainer();
        
        const {
            type = 'info',
            title = '',
            message = '',
            duration = 5000,
            closable = true,
            position = 'top-right'
        } = options;
        
        // 设置位置
        toastContainer.className = `toast-container ${position}`;
        
        // 创建 Toast 元素
        const toast = document.createElement('div');
        toast.className = `toast ${type} ${duration > 0 ? 'auto-close' : ''}`;
        
        // 图标映射
        const icons = {
            success: '✓',
            error: '✕',
            warning: '!',
            info: 'i'
        };
        
        // ECHO 风格文案映射
        const echoTitles = {
            success: '已成',
            error: '未果',
            warning: '留意',
            info: '须知'
        };
        
        const echoMessages = {
            success: '事已顺遂',
            error: '请再试之',
            warning: '谨慎行事',
            info: '请知悉'
        };
        
        const finalTitle = title || echoTitles[type];
        const finalMessage = message || echoMessages[type];
        
        toast.innerHTML = `
            <div class="toast-icon">${icons[type]}</div>
            <div class="toast-content">
                <div class="toast-title">${escapeHtml(finalTitle)}</div>
                <div class="toast-message">${escapeHtml(finalMessage)}</div>
            </div>
            ${closable ? '<button class="toast-close" onclick="EchoToast.dismiss(this)">×</button>' : ''}
            ${duration > 0 ? '<div class="toast-progress"><div class="toast-progress-bar"></div></div>' : ''}
        `;
        
        toastContainer.appendChild(toast);
        
        // 触发显示动画
        requestAnimationFrame(() => {
            toast.classList.add('show');
        });
        
        // 自动关闭
        if (duration > 0) {
            setTimeout(() => {
                dismiss(toast);
            }, duration);
        }
        
        return toast;
    }
    
    // HTML 转义，防止 XSS
    function escapeHtml(str) {
        if (!str) return '';
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }
    
    // 关闭 Toast
    function dismiss(toastOrBtn) {
        const toast = toastOrBtn instanceof Element 
            ? (toastOrBtn.classList.contains('toast') ? toastOrBtn : toastOrBtn.closest('.toast'))
            : toastOrBtn;
            
        if (!toast) return;
        
        toast.classList.add('hiding');
        toast.classList.remove('show');
        
        setTimeout(() => {
            toast.remove();
        }, 400);
    }
    
    // 公共 API
    window.EchoToast = {
        // 基础方法
        show: createToast,
        dismiss: dismiss,
        
        // 快捷方法
        success: (message, title) => createToast({ type: 'success', message, title }),
        error: (message, title) => createToast({ type: 'error', message, title }),
        warning: (message, title) => createToast({ type: 'warning', message, title }),
        info: (message, title) => createToast({ type: 'info', message, title }),
        
        // 特殊场景
        mintSuccess: () => createToast({ 
            type: 'success', 
            title: '已呈',
            message: '归于境中'
        }),
        purchaseSuccess: () => createToast({ 
            type: 'success', 
            title: '已入',
            message: '归于吾藏'
        }),
        favoriteSuccess: () => createToast({ 
            type: 'success', 
            title: '已藏',
            message: '心有所属'
        }),
        networkError: () => createToast({ 
            type: 'error', 
            title: '网络不畅',
            message: '再试一次'
        }),
        contractError: () => createToast({ 
            type: 'error', 
            title: '链上繁忙',
            message: '稍后再试'
        }),
        userCancel: () => createToast({ 
            type: 'warning', 
            title: '已止',
            message: '随时可再入'
        }),
        
        // 配置
        config: {
            defaultDuration: 5000,
            defaultPosition: 'top-right'
        }
    };
    
})();
