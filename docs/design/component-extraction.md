# ECHO Protocol 组件提取清单

## 已提取的可复用组件

基于现有 17+ 页面代码分析，以下组件可以被提取和标准化：

---

## 1. 导航组件

### 1.1 顶部导航 (Navbar)

**源文件**: `main.css`, `discover.html`

**提取代码**:
```css
/* 统一导航栏 */
.echo-navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 64px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    z-index: 1000;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.echo-navbar__container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 0 2rem;
    height: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.echo-navbar__logo {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: white;
    font-size: 1.25rem;
    font-weight: 700;
    text-decoration: none;
}

.echo-navbar__links {
    display: flex;
    gap: 0.5rem;
}

.echo-navbar__link {
    color: rgba(255,255,255,0.9);
    text-decoration: none;
    padding: 0.5rem 1rem;
    border-radius: 8px;
    transition: all 0.15s ease;
}

.echo-navbar__link:hover,
.echo-navbar__link--active {
    background: rgba(255,255,255,0.2);
    color: white;
}

.echo-navbar__wallet {
    display: flex;
    align-items: center;
    gap: 1rem;
}
```

**HTML 模板**:
```html
<nav class="echo-navbar">
    <div class="echo-navbar__container">
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
            <button class="echo-btn echo-btn--small echo-btn--ghost">🌓</button>
            <button class="echo-btn echo-btn--small echo-btn--white">连接钱包</button>
        </div>
    </div>
</nav>
```

---

## 2. 按钮组件

### 2.1 按钮系统

**源文件**: `main.css`

**提取代码**:
```css
/* 基础按钮 */
.echo-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 0.75rem 1.5rem;
    border: none;
    border-radius: 12px;
    font-size: 0.875rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.15s ease;
    text-decoration: none;
}

/* 变体 */
.echo-btn--primary {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.echo-btn--primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.echo-btn--secondary {
    background: #f7fafc;
    color: #1a202c;
    border: 1px solid #e2e8f0;
}

.echo-btn--secondary:hover {
    background: #edf2f7;
}

.echo-btn--ghost {
    background: transparent;
    color: currentColor;
}

.echo-btn--ghost:hover {
    background: rgba(255,255,255,0.1);
}

.echo-btn--white {
    background: white;
    color: #667eea;
}

.echo-btn--white:hover {
    background: rgba(255,255,255,0.9);
}

/* 尺寸 */
.echo-btn--small {
    padding: 0.5rem 1rem;
    font-size: 0.8125rem;
}

.echo-btn--large {
    padding: 1rem 2rem;
    font-size: 1rem;
}

/* 状态 */
.echo-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none !important;
}

.echo-btn--loading {
    position: relative;
    color: transparent !important;
}

.echo-btn--loading::after {
    content: '';
    position: absolute;
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top-color: currentColor;
    border-radius: 50%;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
```

---

## 3. 卡片组件

### 3.1 基础卡片

**源文件**: `main.css`, `marketplace.css`

**提取代码**:
```css
/* 基础卡片 */
.echo-card {
    background: white;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    overflow: hidden;
    transition: all 0.3s ease;
}

.echo-card:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.1);
}

/* 资产卡片 */
.echo-asset-card {
    composes: echo-card;
    cursor: pointer;
}

.echo-asset-card__image {
    aspect-ratio: 1;
    overflow: hidden;
    position: relative;
}

.echo-asset-card__image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
}

.echo-asset-card:hover .echo-asset-card__image img {
    transform: scale(1.05);
}

.echo-asset-card__overlay {
    position: absolute;
    inset: 0;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
}

.echo-asset-card:hover .echo-asset-card__overlay {
    opacity: 1;
}

.echo-asset-card__play {
    width: 48px;
    height: 48px;
    border-radius: 50%;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.25rem;
}

.echo-asset-card__content {
    padding: 1rem;
}

.echo-asset-card__title {
    font-size: 1rem;
    font-weight: 600;
    color: #1a202c;
    margin-bottom: 0.25rem;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.echo-asset-card__artist {
    font-size: 0.875rem;
    color: #718096;
}

.echo-asset-card__footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 0.75rem;
    padding-top: 0.75rem;
    border-top: 1px solid #e2e8f0;
}

.echo-asset-card__price {
    font-size: 1rem;
    font-weight: 700;
    color: #667eea;
}

.echo-asset-card__rating {
    display: flex;
    align-items: center;
    gap: 0.25rem;
    font-size: 0.875rem;
    color: #ed8936;
}
```

### 3.2 统计卡片

**源文件**: `creator.css`

**提取代码**:
```css
/* 统计卡片 */
.echo-stat-card {
    background: white;
    border-radius: 16px;
    padding: 1.5rem;
    box-shadow: 0 4px 6px rgba(0,0,0,0.1);
    display: flex;
    align-items: center;
    gap: 1rem;
}

.echo-stat-card__icon {
    width: 60px;
    height: 60px;
    border-radius: 16px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.75rem;
}

.echo-stat-card__icon--purple {
    background: linear-gradient(135deg, #667eea20 0%, #764ba220 100%);
}

.echo-stat-card__icon--green {
    background: linear-gradient(135deg, #48bb7820 0%, #38a16920 100%);
}

.echo-stat-card__icon--orange {
    background: linear-gradient(135deg, #ed893620 0%, #dd6b2020 100%);
}

.echo-stat-card__value {
    font-size: 2rem;
    font-weight: 700;
    color: #1a202c;
    line-height: 1;
}

.echo-stat-card__label {
    font-size: 0.875rem;
    color: #718096;
    margin-top: 0.25rem;
}

.echo-stat-card__change {
    font-size: 0.75rem;
    padding: 0.25rem 0.5rem;
    border-radius: 20px;
    margin-top: 0.5rem;
    display: inline-block;
}

.echo-stat-card__change--positive {
    background: #c6f6d5;
    color: #276749;
}

.echo-stat-card__change--negative {
    background: #fed7d7;
    color: #c53030;
}
```

---

## 4. 表单组件

### 4.1 输入框系统

**源文件**: `main.css`, `creator.css`

**提取代码**:
```css
/* 表单组 */
.echo-form-group {
    margin-bottom: 1.5rem;
}

.echo-form-label {
    display: block;
    font-size: 0.875rem;
    font-weight: 500;
    color: #1a202c;
    margin-bottom: 0.5rem;
}

.echo-form-label--required::after {
    content: ' *';
    color: #ef4444;
}

/* 输入框 */
.echo-input {
    width: 100%;
    padding: 0.75rem 1rem;
    background: #f1f5f9;
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    color: #1a202c;
    font-size: 0.875rem;
    transition: all 0.2s ease;
}

.echo-input:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
}

.echo-input::placeholder {
    color: #94a3b8;
}

.echo-input:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.echo-input--error {
    border-color: #ef4444;
}

.echo-input--error:focus {
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

/* 文本域 */
.echo-textarea {
    composes: echo-input;
    min-height: 120px;
    resize: vertical;
}

/* 选择框 */
.echo-select {
    composes: echo-input;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%236B7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E");
    background-position: right 0.75rem center;
    background-repeat: no-repeat;
    background-size: 1.25rem;
    padding-right: 2.5rem;
}

/* 表单提示 */
.echo-form-hint {
    font-size: 0.75rem;
    color: #718096;
    margin-top: 0.5rem;
}

.echo-form-error {
    font-size: 0.75rem;
    color: #ef4444;
    margin-top: 0.5rem;
}
```

### 4.2 复选框和开关

**源文件**: `creator.css`

**提取代码**:
```css
/* 复选框 */
.echo-checkbox {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    cursor: pointer;
}

.echo-checkbox__input {
    width: 20px;
    height: 20px;
    border: 2px solid #cbd5e1;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
}

.echo-checkbox__input--checked {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-color: transparent;
}

.echo-checkbox__label {
    font-size: 0.875rem;
    color: #1a202c;
}

/* 开关 */
.echo-switch {
    width: 44px;
    height: 24px;
    background: #cbd5e1;
    border-radius: 12px;
    position: relative;
    cursor: pointer;
    transition: background 0.3s ease;
}

.echo-switch--active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.echo-switch__thumb {
    position: absolute;
    top: 2px;
    left: 2px;
    width: 20px;
    height: 20px;
    background: white;
    border-radius: 50%;
    transition: transform 0.3s ease;
}

.echo-switch--active .echo-switch__thumb {
    transform: translateX(20px);
}
```

---

## 5. 状态组件

### 5.1 加载状态

**源文件**: `main.css`, `marketplace.css`

**提取代码**:
```css
/* 加载动画 */
.echo-spinner {
    width: 24px;
    height: 24px;
    border: 2px solid #e2e8f0;
    border-top-color: #667eea;
    border-radius: 50%;
    animation: echo-spin 0.8s linear infinite;
}

.echo-spinner--large {
    width: 48px;
    height: 48px;
    border-width: 4px;
}

@keyframes echo-spin {
    to { transform: rotate(360deg); }
}

/* 骨架屏 */
.echo-skeleton {
    background: linear-gradient(
        90deg,
        #f1f5f9 25%,
        #e2e8f0 50%,
        #f1f5f9 75%
    );
    background-size: 200% 100%;
    animation: echo-shimmer 1.5s infinite;
    border-radius: 8px;
}

@keyframes echo-shimmer {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}
```

### 5.2 空状态

**源文件**: `marketplace.css`

**提取代码**:
```css
/* 空状态 */
.echo-empty {
    text-align: center;
    padding: 4rem 2rem;
}

.echo-empty__icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    opacity: 0.5;
}

.echo-empty__title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #1a202c;
    margin-bottom: 0.5rem;
}

.echo-empty__description {
    font-size: 0.875rem;
    color: #718096;
    margin-bottom: 1.5rem;
}
```

### 5.3 错误状态

**源文件**: `marketplace.css`

**提取代码**:
```css
/* 错误状态 */
.echo-error {
    text-align: center;
    padding: 3rem 2rem;
}

.echo-error__icon {
    font-size: 3rem;
    color: #ef4444;
    margin-bottom: 1rem;
}

.echo-error__message {
    font-size: 1rem;
    color: #1a202c;
    margin-bottom: 1.5rem;
}
```

---

## 6. 特殊组件

### 6.1 权益卡片

**源文件**: `creator.css`

**提取代码**:
```css
/* 权益配置卡片 */
.echo-rights-card {
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 16px;
    padding: 1.5rem;
    transition: all 0.3s ease;
}

.echo-rights-card--active {
    border-color: #667eea;
    background: linear-gradient(135deg, #667eea05 0%, #764ba205 100%);
}

.echo-rights-card__header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
}

.echo-rights-card__title {
    font-size: 1rem;
    font-weight: 600;
    flex: 1;
}

.echo-rights-card__badge {
    padding: 0.25rem 0.75rem;
    background: #e0e7ff;
    color: #667eea;
    border-radius: 20px;
    font-size: 0.75rem;
    font-weight: 600;
}
```

### 6.2 步骤指示器

**源文件**: `creator.css`

**提取代码**:
```css
/* 步骤指示器 */
.echo-steps {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 2rem;
}

.echo-step {
    display: flex;
    align-items: center;
    gap: 0.5rem;
}

.echo-step__number {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: #e2e8f0;
    color: #718096;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 0.875rem;
}

.echo-step--active .echo-step__number,
.echo-step--completed .echo-step__number {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
}

.echo-step__label {
    font-size: 0.875rem;
    color: #718096;
}

.echo-step--active .echo-step__label {
    color: #1a202c;
    font-weight: 500;
}

.echo-step__divider {
    flex: 1;
    height: 2px;
    background: #e2e8f0;
    max-width: 40px;
}
```

---

## 7. 响应式工具类

**建议新增**:
```css
/* 响应式显示控制 */
@media (max-width: 768px) {
    .echo-hide-mobile { display: none !important; }
}

@media (min-width: 769px) {
    .echo-hide-desktop { display: none !important; }
}

/* 网格系统 */
.echo-grid {
    display: grid;
    gap: 1.5rem;
}

.echo-grid--2 { grid-template-columns: repeat(2, 1fr); }
.echo-grid--3 { grid-template-columns: repeat(3, 1fr); }
.echo-grid--4 { grid-template-columns: repeat(4, 1fr); }

@media (max-width: 1024px) {
    .echo-grid--4 { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 768px) {
    .echo-grid--3,
    .echo-grid--4 { grid-template-columns: repeat(2, 1fr); }
}

/* 间距工具 */
.echo-mt-1 { margin-top: 0.5rem; }
.echo-mt-2 { margin-top: 1rem; }
.echo-mt-3 { margin-top: 1.5rem; }
.echo-mt-4 { margin-top: 2rem; }
```

---

## 8. 组件使用示例

### 资产卡片
```html
<div class="echo-asset-card">
    <div class="echo-asset-card__image">
        <img src="cover.jpg" alt="封面">
        <div class="echo-asset-card__overlay">
            <button class="echo-asset-card__play">▶</button>
        </div>
    </div>
    <div class="echo-asset-card__content">
        <h3 class="echo-asset-card__title">Summer Vibes</h3>
        <p class="echo-asset-card__artist">@artist</p>
        <div class="echo-asset-card__footer">
            <span class="echo-asset-card__price">100 MEER</span>
            <span class="echo-asset-card__rating">⭐ 4.8</span>
        </div>
    </div>
</div>
```

### 统计卡片
```html
<div class="echo-stat-card">
    <div class="echo-stat-card__icon echo-stat-card__icon--purple">💰</div>
    <div>
        <div class="echo-stat-card__value">$1,234</div>
        <div class="echo-stat-card__label">总收益</div>
        <span class="echo-stat-card__change echo-stat-card__change--positive">+23%</span>
    </div>
</div>
```

---

## 9. 文件整合建议

将以上组件整理为以下 CSS 文件：

```
css/
├── echo-core.css           # 变量 + 重置 + 工具类
├── echo-navbar.css         # 导航组件
├── echo-buttons.css        # 按钮组件
├── echo-cards.css          # 卡片组件
├── echo-forms.css          # 表单组件
├── echo-states.css         # 状态组件（加载/空/错误）
└── echo-special.css        # 特殊组件（权益/步骤）
```

每个页面只需引入需要的组件：
```html
<link rel="stylesheet" href="css/echo-core.css">
<link rel="stylesheet" href="css/echo-navbar.css">
<link rel="stylesheet" href="css/echo-buttons.css">
<link rel="stylesheet" href="css/echo-cards.css">
```
