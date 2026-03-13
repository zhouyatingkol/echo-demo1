# ECHO Protocol - 前端开发指南

本指南介绍 ECHO Protocol 前端开发的最佳实践和规范。

---

## 📁 目录结构

```
frontend/
├── components/          # 可复用组件
│   ├── navbar.html     # 导航栏组件
│   └── unified-navbar.html  # 统一导航栏
│
├── css/                # 样式文件
│   ├── global.css      # 全局样式
│   ├── theme.css       # 主题变量
│   ├── mobile.css      # 移动端适配
│   └── navbar.css      # 导航栏样式
│
├── js/                 # JavaScript 文件
│   ├── app.js          # 主应用逻辑
│   ├── contractService.js  # 合约服务
│   └── utils.js        # 工具函数
│
├── locales/            # 国际化文件
│   ├── en.json         # 英文翻译
│   └── zh.json         # 中文翻译
│
├── utils/              # 工具模块
│   └── format.js       # 格式化工具
│
├── api/                # API 接口
│
└── *.html              # 页面文件

pages/
├── index.html          # 首页
├── market/             # 市场页面
├── creator/            # 创作者页面
└── user/               # 用户页面
```

---

## 🎨 页面开发规范

### HTML 结构模板

```html
<!DOCTYPE html>
<html lang="zh-CN" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="description" content="ECHO Protocol - 去中心化音乐版权授权平台">
    <title>页面标题 | ECHO Protocol</title>
    
    <!-- 预加载关键资源 -->
    <link rel="preconnect" href="https://qng.rpc.qitmeer.io">
    
    <!-- 主题样式（必须首先加载）-->
    <link rel="stylesheet" href="../frontend/css/theme.css">
    
    <!-- 全局样式 -->
    <link rel="stylesheet" href="../frontend/css/global.css">
    
    <!-- 移动端适配 -->
    <link rel="stylesheet" href="../frontend/css/mobile.css">
</head>
<body>
    <!-- 导航栏 -->
    <div id="navbar-container"></div>
    
    <!-- 主内容区 -->
    <main class="main-content">
        <!-- 页面内容 -->
    </main>
    
    <!-- 页脚 -->
    <footer class="footer">
        <p>&copy; 2026 ECHO Protocol. All rights reserved.</p>
    </footer>
    
    <!-- 加载导航栏 -->
    <script>
        fetch('../frontend/components/navbar.html')
            .then(r => r.text())
            .then(html => {
                document.getElementById('navbar-container').innerHTML = html;
            });
    </script>
    
    <!-- 页面脚本 -->
    <script type="module" src="../frontend/js/app.js"></script>
</body>
</html>
```

### 关键 Meta 标签

```html
<!-- 字符编码 -->
<meta charset="UTF-8">

<!-- 视口设置（响应式必需）-->
<meta name="viewport" content="width=device-width, initial-scale=1.0">

<!-- SEO 描述 -->
<meta name="description" content="ECHO Protocol - 去中心化音乐版权授权平台">

<!-- 主题色 -->
<meta name="theme-color" content="#0a0a2e">

<!-- 禁止电话号码自动检测 -->
<meta name="format-detection" content="telephone=no">
```

---

## 🧩 组件使用说明

### 导航栏组件

```html
<!-- 在页面中引入导航栏 -->
<div id="navbar-container"></div>

<script>
    // 动态加载导航栏
    fetch('../frontend/components/navbar.html')
        .then(response => response.text())
        .then(html => {
            document.getElementById('navbar-container').innerHTML = html;
            initNavbar(); // 初始化导航栏功能
        });
    
    // 初始化导航栏
    function initNavbar() {
        // 高亮当前页面
        const currentPage = window.location.pathname.split('/').pop();
        document.querySelectorAll('.nav-link').forEach(link => {
            if (link.getAttribute('href').includes(currentPage)) {
                link.classList.add('active');
            }
        });
    }
</script>
```

### 钱包连接按钮

```html
<!-- 钱包连接按钮 -->
<button id="connectBtn" class="wallet-btn" onclick="connectWallet()">
    连接钱包
</button>

<script>
async function connectWallet() {
    if (typeof window.ethereum === 'undefined') {
        alert('请安装 MetaMask 钱包');
        return;
    }
    
    try {
        const accounts = await window.ethereum.request({
            method: 'eth_requestAccounts'
        });
        
        const address = accounts[0];
        const shortAddress = address.slice(0, 6) + '...' + address.slice(-4);
        
        document.getElementById('connectBtn').textContent = shortAddress;
        
        // 保存到本地存储
        localStorage.setItem('walletAddress', address);
        
    } catch (error) {
        console.error('连接失败:', error);
        alert('连接钱包失败: ' + error.message);
    }
}

// 页面加载时检查已连接的钱包
window.addEventListener('DOMContentLoaded', () => {
    const savedAddress = localStorage.getItem('walletAddress');
    if (savedAddress) {
        document.getElementById('connectBtn').textContent = 
            savedAddress.slice(0, 6) + '...' + savedAddress.slice(-4);
    }
});
</script>
```

### 加载动画组件

```html
<!-- 加载动画 -->
<div id="loading" class="loading-overlay" style="display: none;">
    <div class="loading-spinner"></div>
    <p>加载中...</p>
</div>

<style>
.loading-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    z-index: 9999;
}

.loading-spinner {
    width: 50px;
    height: 50px;
    border: 3px solid rgba(0, 212, 255, 0.3);
    border-top-color: #00d4ff;
    border-radius: 50%;
    animation: spin 1s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
</style>

<script>
function showLoading(message = '加载中...') {
    const loading = document.getElementById('loading');
    loading.querySelector('p').textContent = message;
    loading.style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}
</script>
```

---

## 🎨 样式系统

### CSS 变量（主题系统）

```css
/* frontend/css/theme.css */

/* 暗黑主题（默认） */
:root {
    /* 背景色 */
    --bg-primary: #0a0a0a;
    --bg-secondary: #1a1a2e;
    --bg-card: rgba(255, 255, 255, 0.05);
    
    /* 文字色 */
    --text-primary: #ffffff;
    --text-secondary: #888888;
    --text-muted: #666666;
    
    /* 强调色 */
    --accent-primary: #00d4ff;
    --accent-secondary: #7b2cbf;
    --accent-success: #00d68f;
    --accent-warning: #ffb800;
    --accent-error: #ff4757;
    
    /* 边框和阴影 */
    --border-color: rgba(255, 255, 255, 0.1);
    --shadow-color: rgba(0, 0, 0, 0.3);
    
    /* 字体 */
    --font-primary: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --font-mono: 'SF Mono', Monaco, monospace;
}

/* 明亮主题 */
[data-theme="light"] {
    --bg-primary: #f5f5f5;
    --bg-secondary: #ffffff;
    --bg-card: rgba(0, 0, 0, 0.05);
    
    --text-primary: #1a1a2e;
    --text-secondary: #666666;
    --text-muted: #999999;
    
    --accent-primary: #0066cc;
    --accent-secondary: #9932cc;
    
    --border-color: rgba(0, 0, 0, 0.1);
    --shadow-color: rgba(0, 0, 0, 0.1);
}
```

### 颜色变量使用

```css
/* ✅ 正确：使用 CSS 变量 */
.card {
    background: var(--bg-card);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
}

/* ❌ 错误：硬编码颜色 */
.card {
    background: #1a1a2e;
    color: #ffffff;
    border: 1px solid rgba(255, 255, 255, 0.1);
}
```

### 字体规范

```css
/* 标题 */
h1, h2, h3 {
    font-family: var(--font-primary);
    font-weight: 600;
    line-height: 1.3;
}

h1 { font-size: 2.5rem; }
h2 { font-size: 2rem; }
h3 { font-size: 1.5rem; }

/* 正文 */
body {
    font-family: var(--font-primary);
    font-size: 16px;
    line-height: 1.6;
    color: var(--text-primary);
}

/* 代码 */
code, pre {
    font-family: var(--font-mono);
    font-size: 0.9em;
}

/* 小字 */
.small-text {
    font-size: 0.875rem;
    color: var(--text-secondary);
}
```

---

## 📱 响应式开发规范

### 断点定义

```css
/* 移动端优先 */

/* 小屏手机 */
@media (max-width: 480px) { }

/* 手机 */
@media (max-width: 768px) { }

/* 平板 */
@media (min-width: 769px) and (max-width: 1024px) { }

/* 桌面 */
@media (min-width: 1025px) { }

/* 大屏 */
@media (min-width: 1440px) { }
```

### 响应式布局示例

```css
/* 网格布局 */
.asset-grid {
    display: grid;
    gap: 24px;
    padding: 20px;
}

/* 移动端：单列 */
@media (max-width: 768px) {
    .asset-grid {
        grid-template-columns: 1fr;
        gap: 16px;
        padding: 10px;
    }
}

/* 平板：双列 */
@media (min-width: 769px) and (max-width: 1024px) {
    .asset-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

/* 桌面：四列 */
@media (min-width: 1025px) {
    .asset-grid {
        grid-template-columns: repeat(4, 1fr);
        max-width: 1400px;
        margin: 0 auto;
    }
}
```

### Flexbox 布局

```css
/* 响应式导航 */
.nav-container {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20px;
    height: 64px;
}

.nav-links {
    display: flex;
    gap: 8px;
}

/* 移动端隐藏导航链接 */
@media (max-width: 768px) {
    .nav-links {
        display: none;
    }
    
    /* 显示汉堡菜单 */
    .mobile-menu-btn {
        display: block;
    }
}
```

### 响应式字体

```css
/* 使用 clamp 实现流体字体 */
h1 {
    font-size: clamp(1.5rem, 5vw, 2.5rem);
}

h2 {
    font-size: clamp(1.25rem, 4vw, 2rem);
}

p {
    font-size: clamp(0.875rem, 2vw, 1rem);
}
```

---

## 🆕 如何添加新页面

### 步骤 1：创建页面文件

```bash
# 在 pages/ 目录下创建新页面
touch pages/new-feature.html
```

### 步骤 2：使用页面模板

```html
<!DOCTYPE html>
<html lang="zh-CN" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>新功能 | ECHO Protocol</title>
    
    <!-- 样式文件 -->
    <link rel="stylesheet" href="../frontend/css/theme.css">
    <link rel="stylesheet" href="../frontend/css/global.css">
    <link rel="stylesheet" href="../frontend/css/mobile.css">
    
    <!-- 页面特定样式 -->
    <style>
        .feature-section {
            padding: 40px 20px;
            max-width: 1200px;
            margin: 0 auto;
        }
        
        /* 响应式适配 */
        @media (max-width: 768px) {
            .feature-section {
                padding: 20px 10px;
            }
        }
    </style>
</head>
<body>
    <!-- 导航栏容器 -->
    <div id="navbar-container"></div>
    
    <!-- 主内容 -->
    <main class="main-content">
        <section class="feature-section">
            <h1>新功能页面</h1>
            <p>页面内容...</p>
        </section>
    </main>
    
    <!-- 加载导航栏 -->
    <script>
        fetch('../frontend/components/navbar.html')
            .then(r => r.text())
            .then(html => {
                document.getElementById('navbar-container').innerHTML = html;
                // 高亮当前页面
                document.querySelectorAll('.nav-link').forEach(link => {
                    if (link.getAttribute('href').includes('new-feature')) {
                        link.classList.add('active');
                    }
                });
            });
    </script>
    
    <!-- 合约交互脚本 -->
    <script src="https://cdn.ethers.io/lib/ethers-5.7.umd.min.js"></script>
    <script src="../frontend/abi.js"></script>
    <script type="module">
        // 页面特定的 JavaScript 代码
        import { initContract } from '../frontend/js/contractService.js';
        
        // 初始化
        document.addEventListener('DOMContentLoaded', async () => {
            // 页面加载完成后的逻辑
        });
    </script>
</body>
</html>
```

### 步骤 3：更新导航栏

```html
<!-- 在 frontend/components/navbar.html 中添加新页面链接 -->
<div class="nav-links">
    <a href="../pages/index.html" class="nav-link">首页</a>
    <a href="../pages/market.html" class="nav-link">市场</a>
    <a href="../pages/new-feature.html" class="nav-link">新功能</a>  <!-- 新页面 -->
    <a href="../pages/creator.html" class="nav-link">创作</a>
</div>
```

### 步骤 4：添加路由（如需要）

```javascript
// 在 app.js 中添加路由处理
const routes = {
    '/': 'pages/index.html',
    '/market': 'pages/market.html',
    '/new-feature': 'pages/new-feature.html',  // 新页面
    '/creator': 'pages/creator.html'
};

// 简单的路由处理
function handleRoute() {
    const path = window.location.pathname;
    const page = routes[path] || routes['/'];
    // 加载对应页面...
}
```

---

## 🔧 最佳实践

### 性能优化

```html
<!-- 1. 延迟加载非关键脚本 -->
<script src="analytics.js" defer></script>

<!-- 2. 预加载关键资源 -->
<link rel="preload" href="critical.css" as="style">

<!-- 3. 懒加载图片 -->
<img src="placeholder.jpg" data-src="actual.jpg" loading="lazy" alt="描述">
```

### 可访问性

```html
<!-- 1. 使用语义化标签 -->
<nav></nav>
<main></main>
<article></article>

<!-- 2. 添加 alt 文本 -->
<img src="icon.png" alt="搜索图标">

<!-- 3. 确保足够的颜色对比度 -->
<!-- 使用 Chrome DevTools 的 Lighthouse 检查 -->

<!-- 4. 键盘导航支持 -->
<button tabindex="0" aria-label="关闭">×</button>
```

### 错误处理

```javascript
// 包装异步操作
try {
    const result = await someAsyncOperation();
    // 处理成功
} catch (error) {
    console.error('操作失败:', error);
    // 显示用户友好的错误信息
    showErrorMessage('操作失败，请稍后重试');
} finally {
    // 清理工作
    hideLoading();
}
```

---

## 📚 相关文档

- [快速开始指南](./QUICK_START.md)
- [合约交互指南](./CONTRACT_INTERACTION.md)
- [部署指南](./DEPLOYMENT.md)

---

*文档版本: 1.0*  
*最后更新: 2026-03-14*
