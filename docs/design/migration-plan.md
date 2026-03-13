# ECHO Protocol CSS 迁移实施计划

## 阶段 1: 创建统一基础文件 (Day 1)

### 任务 1.1: 创建 echo-core.css
**基于**: `main.css` 的变量定义

```css
/* echo-core.css - 核心变量和工具 */
:root {
    /* 品牌色 */
    --color-primary: #667eea;
    --color-primary-dark: #5a67d8;
    --color-secondary: #764ba2;
    --color-accent: #00d4ff;
    
    /* 功能色 */
    --color-success: #22c55e;
    --color-warning: #f59e0b;
    --color-error: #ef4444;
    --color-info: #3b82f6;
    
    /* 浅色主题（默认） */
    --bg-page: #f8fafc;
    --bg-card: #ffffff;
    --bg-elevated: #ffffff;
    --bg-input: #f1f5f9;
    --bg-hover: #f1f5f9;
    
    --text-primary: #0f172a;
    --text-secondary: #475569;
    --text-muted: #94a3b8;
    
    --border-color: #e2e8f0;
    
    /* 圆角 */
    --radius-sm: 8px;
    --radius-md: 12px;
    --radius-lg: 16px;
    --radius-xl: 20px;
    
    /* 阴影 */
    --shadow-sm: 0 1px 2px rgba(0,0,0,0.05);
    --shadow-md: 0 4px 6px rgba(0,0,0,0.1);
    --shadow-lg: 0 10px 15px rgba(0,0,0,0.1);
    --shadow-xl: 0 20px 25px rgba(0,0,0,0.15);
    
    /* 字体 */
    --font-sans: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --font-mono: 'SF Mono', Monaco, monospace;
    
    /* 间距 */
    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-3: 0.75rem;
    --space-4: 1rem;
    --space-5: 1.25rem;
    --space-6: 1.5rem;
    --space-8: 2rem;
    --space-10: 2.5rem;
    --space-12: 3rem;
}

/* 深色主题 */
[data-theme="dark"] {
    --bg-page: #0a0a0a;
    --bg-card: rgba(255, 255, 255, 0.05);
    --bg-elevated: #1a1a2e;
    --bg-input: rgba(255, 255, 255, 0.08);
    --bg-hover: rgba(255, 255, 255, 0.08);
    
    --text-primary: #ffffff;
    --text-secondary: #a0a0b0;
    --text-muted: #6b6b7b;
    
    --border-color: rgba(255, 255, 255, 0.1);
    
    --shadow-sm: 0 1px 2px rgba(0,0,0,0.3);
    --shadow-md: 0 4px 6px rgba(0,0,0,0.4);
    --shadow-lg: 0 10px 15px rgba(0,0,0,0.5);
}

/* 基础重置 */
*, *::before, *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
}

body {
    font-family: var(--font-sans);
    background: var(--bg-page);
    color: var(--text-primary);
    line-height: 1.5;
    min-height: 100vh;
}

/* 工具类 */
.container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 1.5rem;
}

.text-center { text-align: center; }
.text-gradient {
    background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
}

/* 响应式 */
@media (max-width: 768px) {
    .hide-mobile { display: none !important; }
}

@media (min-width: 769px) {
    .hide-desktop { display: none !important; }
}
```

### 任务 1.2: 创建 echo-components.css
**基于**: `main.css` + `creator.css` 的组件

```css
/* echo-components.css - 可复用组件 */

/* ===== 按钮 ===== */
.btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: var(--radius-md);
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    text-decoration: none;
}

.btn-primary {
    background: linear-gradient(135deg, var(--color-primary), var(--color-secondary));
    color: white;
}

.btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-secondary {
    background: var(--bg-input);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
}

.btn-secondary:hover {
    background: var(--bg-hover);
}

.btn-sm { padding: 0.5rem 1rem; font-size: 0.8125rem; }
.btn-lg { padding: 1rem 2rem; font-size: 1rem; }

/* ===== 卡片 ===== */
.card {
    background: var(--bg-card);
    border-radius: var(--radius-lg);
    border: 1px solid var(--border-color);
    overflow: hidden;
    transition: all 0.3s ease;
}

.card-hover:hover {
    transform: translateY(-4px);
    box-shadow: var(--shadow-lg);
}

/* ===== 表单 ===== */
.form-group { margin-bottom: 1.5rem; }

.form-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    margin-bottom: 0.5rem;
}

.form-label .required { color: var(--color-error); margin-left: 0.25rem; }

.form-input {
    width: 100%;
    padding: 0.75rem 1rem;
    background: var(--bg-input);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    color: var(--text-primary);
    font-size: 0.875rem;
    transition: all 0.2s ease;
}

.form-input:focus {
    outline: none;
    border-color: var(--color-primary);
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

/* ===== 状态 ===== */
.loading-spinner {
    width: 24px;
    height: 24px;
    border: 2px solid var(--border-color);
    border-top-color: var(--color-primary);
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }
```

---

## 阶段 2: 选择模板页面并重构 (Day 2-3)

### 选择: `marketplace.html` 作为模板
**原因**: 
- 结构清晰
- 使用标准 CSS 变量
- 组件丰富（卡片、筛选、分页）

### 重构步骤:

#### Step 1: 替换 CSS 引入
```html
<!-- 之前 -->
<link rel="stylesheet" href="css/main.css">
<link rel="stylesheet" href="css/marketplace.css">

<!-- 之后 -->
<link rel="stylesheet" href="css/echo-core.css">
<link rel="stylesheet" href="css/echo-components.css">
<link rel="stylesheet" href="css/echo-navbar.css">
<!-- 仅保留页面特有样式 -->
<link rel="stylesheet" href="css/page-marketplace.css">
```

#### Step 2: 更新 HTML 类名
```html
<!-- 之前 -->
<nav class="navbar">
    <div class="nav-brand">...</div>
</nav>

<!-- 之后 -->
<nav class="echo-navbar">
    <div class="container echo-navbar__container">
        <a class="echo-navbar__logo" href="/">🎵 ECHO</a>
        <div class="echo-navbar__links">...</div>
    </div>
</nav>
```

#### Step 3: 提取页面特有样式到 `page-marketplace.css`
仅保留无法复用的样式，例如:
- 市场页特有的筛选栏布局
- 资产网格的响应式规则
- 分页组件的特殊样式

---

## 阶段 3: 批量迁移其他页面 (Day 4-5)

### 迁移顺序（从简单到复杂）:
1. `asset-detail.html` - 详情页，组件少
2. `license-shop.html` - 表单页
3. `profile.html` - 简单页面
4. `charts.html` - 列表页
5. `creator-dashboard.html` - 复杂仪表盘
6. `creator-upload.html` - 表单流程
7. `creator-revenue.html` - 数据展示
8. `my-assets.html` - 列表页
9. `discover.html` - 需适配深色主题

### 每页迁移清单:
- [ ] 替换 CSS 引入
- [ ] 更新导航 HTML
- [ ] 替换按钮类名
- [ ] 替换卡片类名
- [ ] 替换表单类名
- [ ] 测试响应式
- [ ] 测试交互功能

---

## 阶段 4: 深色主题适配 (Day 6)

### discover.html 特殊处理:
1. 添加 `data-theme="dark"` 到 html
2. 逐步替换内联样式为 CSS 类
3. 将深色特有组件合并到 echo-components.css

```javascript
// theme-toggle.js
const toggle = document.getElementById('theme-toggle');
toggle.addEventListener('click', () => {
    const html = document.documentElement;
    const current = html.getAttribute('data-theme');
    const next = current === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
});
```

---

## 阶段 5: 清理和优化 (Day 7)

### 清理任务:
1. 删除旧 CSS 文件:
   - `main.css` → 已合并到 echo-core.css
   - `marketplace.css` → 已拆分到 echo-components.css + page-marketplace.css
   - `creator.css` → 已合并
   - 其他重复样式

2. 优化 CSS:
   - 使用 PurgeCSS 删除未使用样式
   - 压缩 CSS 文件
   - 考虑使用 CSS 变量替代硬编码值

3. 文档更新:
   - 更新 README.md
   - 创建组件使用文档

---

## 文件变更对照表

| 原文件 | 新文件 | 操作 |
|--------|--------|------|
| css/main.css | css/echo-core.css + echo-components.css | 拆分合并 |
| css/marketplace.css | css/page-marketplace.css | 精简保留特有样式 |
| css/creator.css | css/echo-components.css | 合并 |
| css/asset-detail.css | css/page-asset.css | 精简 |
| css/license-shop.css | css/page-license.css | 精简 |
| css/global.css | css/echo-core.css | 合并 |

---

## HTML 更新示例

### 之前 (marketplace.html):
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <link rel="stylesheet" href="css/main.css">
    <link rel="stylesheet" href="css/marketplace.css">
</head>
<body>
    <nav class="navbar">
        <div class="nav-brand">
            <span class="logo">🌳</span>
            <span class="brand-text">ECHO 市场</span>
        </div>
        <div class="nav-links">
            <a href="index.html">首页</a>
            <a href="marketplace.html" class="active">市场</a>
        </div>
        <div class="wallet-section">
            <button id="connectWallet" class="btn btn-primary">连接钱包</button>
        </div>
    </nav>
</body>
</html>
```

### 之后 (marketplace.html):
```html
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <link rel="stylesheet" href="css/echo-core.css">
    <link rel="stylesheet" href="css/echo-components.css">
    <link rel="stylesheet" href="css/echo-navbar.css">
    <link rel="stylesheet" href="css/page-marketplace.css">
</head>
<body>
    <nav class="echo-navbar">
        <div class="container echo-navbar__container">
            <a href="index.html" class="echo-navbar__logo">
                <span>🎵</span>
                <span>ECHO Protocol</span>
            </a>
            <div class="echo-navbar__links">
                <a href="discover.html" class="echo-navbar__link">发现</a>
                <a href="marketplace.html" class="echo-navbar__link echo-navbar__link--active">市场</a>
                <a href="charts.html" class="echo-navbar__link">榜单</a>
                <a href="creator-dashboard.html" class="echo-navbar__link">创作者</a>
            </div>
            <div class="echo-navbar__wallet">
                <button class="btn btn-sm btn-ghost" id="theme-toggle">🌓</button>
                <button class="btn btn-sm btn-white" id="connect-wallet">连接钱包</button>
            </div>
        </div>
    </nav>
    <main class="container" style="padding-top: 88px;">
        <!-- 页面内容 -->
    </main>
</body>
</html>
```

---

## 风险与回滚方案

### 风险:
1. 样式冲突导致页面显示异常
2. JavaScript 选择器失效（类名变更）
3. 响应式布局问题

### 缓解措施:
1. **增量迁移**: 每次只迁移一个页面，测试通过后再继续
2. **保留备份**: 迁移前备份所有原文件
3. **回滚机制**: 如出现问题，可快速切换回旧 CSS
4. **Feature Flag**: 使用 URL 参数切换新旧样式 (`?v=2`)

### 回滚命令:
```bash
# 如需要回滚
cd /root/.openclaw/workspace/echo-demo
git checkout -- css/  # 恢复 CSS 目录
git checkout -- *.html  # 恢复 HTML 文件
```

---

## 成功标准

迁移完成后，应满足:
- [ ] 所有 17+ 页面正常显示
- [ ] 导航在所有页面一致
- [ ] 响应式布局正常工作
- [ ] 深色/浅色主题可切换
- [ ] CSS 文件总大小减少 30%+
- [ ] 无重复样式代码
