# ECHO Protocol 色彩方案

## 1. 主色调 (Primary Colors)

### 1.1 品牌渐变
ECHO Protocol 的核心视觉识别，用于 Logo、主按钮、重要强调。

```css
--gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--gradient-hover: linear-gradient(135deg, #5a6fd6 0%, #6a4190 100%);
--gradient-active: linear-gradient(135deg, #4e62c0 0%, #5e3780 100%);
```

**使用场景**:
- Logo 文字
- 主按钮背景
- 导航栏激活状态
- 重要数据高亮
- 进度条填充

### 1.2 主色变体

| 名称 | 色值 | 用途 |
|------|------|------|
| primary-50 | #f0f4ff | 最浅背景 |
| primary-100 | #e0e9ff | 轻量背景 |
| primary-200 | #c7d7fe | 悬停背景 |
| primary-300 | #a5bcfc | 禁用状态 |
| primary-400 | #8196f8 | 次级强调 |
| primary-500 | #667eea | **主色** |
| primary-600 | #4f5ec7 | 深色调 |
| primary-700 | #3f4ba3 | 更深色调 |
| primary-800 | #354082 | 深色文字 |
| primary-900 | #303a66 | 最深色 |

### 1.3 辅助色 (Secondary)

青色用于次要操作、信息提示、科技感元素。

```css
--secondary-500: #00d4ff;
--secondary-400: #33ddff;
--secondary-600: #00a8cc;
```

**使用场景**:
- 链接文字
- 次要按钮
- 加载动画
- 科技感装饰

---

## 2. 背景色 (Background Colors)

### 2.1 深色模式 (Dark Mode - 默认)

```css
/* 页面背景 */
--bg-primary: #0a0a0a;           /* 最深背景 */
--bg-secondary: #1a1a2e;         /* 次级背景 */
--bg-tertiary: #16213e;          /* 第三层背景 */

/* 卡片背景 */
--bg-card: rgba(255, 255, 255, 0.05);
--bg-card-hover: rgba(255, 255, 255, 0.08);
--bg-card-active: rgba(255, 255, 255, 0.12);

/* 渐变背景 */
--bg-gradient: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 50%, #16213e 100%);
```

### 2.2 浅色模式 (Light Mode)

```css
/* 页面背景 */
--bg-primary: #ffffff;
--bg-secondary: #f8fafc;
--bg-tertiary: #f1f5f9;

/* 卡片背景 */
--bg-card: rgba(0, 0, 0, 0.04);
--bg-card-hover: rgba(0, 0, 0, 0.06);
--bg-card-active: rgba(0, 0, 0, 0.08);

/* 渐变背景 */
--bg-gradient: linear-gradient(135deg, #ffffff 0%, #f8fafc 50%, #f1f5f9 100%);
```

---

## 3. 文字色 (Text Colors)

### 3.1 深色模式

```css
--text-primary: #ffffff;         /* 主要文字 */
--text-secondary: #a0a0b0;       /* 次要文字 */
--text-tertiary: #6b6b7b;        /* 辅助文字 */
--text-muted: #4a4a5a;           /* 禁用/占位符 */
```

### 3.2 浅色模式

```css
--text-primary: #0f172a;         /* 主要文字 */
--text-secondary: #475569;       /* 次要文字 */
--text-tertiary: #64748b;        /* 辅助文字 */
--text-muted: #94a3b8;           /* 禁用/占位符 */
```

### 3.3 文字层级比例

| 层级 | 用途 | 对比度 |
|------|------|--------|
| Primary | 标题、正文 | 100% |
| Secondary | 描述、标签 | 70% |
| Tertiary | 辅助信息 | 50% |
| Muted | 占位符、禁用 | 30% |

---

## 4. 边框与分割线 (Borders)

### 4.1 深色模式

```css
--border-default: rgba(255, 255, 255, 0.1);
--border-hover: rgba(255, 255, 255, 0.2);
--border-focus: rgba(102, 126, 234, 0.5);    /* 主色发光 */
--border-active: rgba(0, 212, 255, 0.5);     /* 次色发光 */
```

### 4.2 浅色模式

```css
--border-default: rgba(0, 0, 0, 0.1);
--border-hover: rgba(0, 0, 0, 0.2);
--border-focus: rgba(102, 126, 234, 0.5);
--border-active: rgba(0, 168, 204, 0.5);
```

---

## 5. 功能色 (Functional Colors)

### 5.1 成功 (Success)

```css
--success-50: #f0fdf4;
--success-100: #dcfce7;
--success-200: #bbf7d0;
--success-500: #22c55e;    /* 主成功色 */
--success-600: #16a34a;
--success-700: #15803d;
```

**使用场景**:
- 交易成功
- 操作完成
- 在线状态
- 增长指标

### 5.2 错误 (Error)

```css
--error-50: #fef2f2;
--error-100: #fee2e2;
--error-200: #fecaca;
--error-500: #ef4444;      /* 主错误色 */
--error-600: #dc2626;
--error-700: #b91c1c;
```

**使用场景**:
- 交易失败
- 表单错误
- 网络错误
- 警告状态

### 5.3 警告 (Warning)

```css
--warning-50: #fffbeb;
--warning-100: #fef3c7;
--warning-200: #fde68a;
--warning-500: #f59e0b;    /* 主警告色 */
--warning-600: #d97706;
--warning-700: #b45309;
```

**使用场景**:
- 余额不足
- 即将过期
- 注意提示
- 低优先级警告

### 5.4 信息 (Info)

```css
--info-50: #eff6ff;
--info-100: #dbeafe;
--info-200: #bfdbfe;
--info-500: #3b82f6;       /* 主信息色 */
--info-600: #2563eb;
--info-700: #1d4ed8;
```

**使用场景**:
- 提示信息
- 帮助链接
- 通知消息
- 中性强调

---

## 6. 特殊效果色

### 6.1 发光效果 (Glow Effects)

```css
/* 主色发光 */
--glow-primary: 0 0 20px rgba(102, 126, 234, 0.4);
--glow-primary-strong: 0 0 40px rgba(102, 126, 234, 0.6);

/* 次色发光 */
--glow-secondary: 0 0 20px rgba(0, 212, 255, 0.4);
--glow-secondary-strong: 0 0 40px rgba(0, 212, 255, 0.6);

/* 成功发光 */
--glow-success: 0 0 20px rgba(34, 197, 94, 0.4);

/* 错误发光 */
--glow-error: 0 0 20px rgba(239, 68, 68, 0.4);
```

### 6.2 玻璃态 (Glassmorphism)

```css
--glass-bg: rgba(255, 255, 255, 0.05);
--glass-border: rgba(255, 255, 255, 0.1);
--glass-blur: blur(20px);
```

### 6.3 渐变叠加

```css
/* 卡片顶部渐变 */
--gradient-card-top: linear-gradient(180deg, rgba(255,255,255,0.1) 0%, transparent 100%);

/* 底部暗角 */
--gradient-vignette: radial-gradient(ellipse at center, transparent 0%, rgba(0,0,0,0.4) 100%);
```

---

## 7. 语义化变量映射

### 7.1 完整 CSS 变量表

```css
:root {
  /* === 主色调 === */
  --color-primary: #667eea;
  --color-primary-light: #8196f8;
  --color-primary-dark: #4f5ec7;
  --color-secondary: #00d4ff;
  --color-secondary-light: #33ddff;
  --color-secondary-dark: #00a8cc;
  
  /* === 背景色 (深色模式默认) === */
  --bg-page: #0a0a0a;
  --bg-surface: #1a1a2e;
  --bg-elevated: #16213e;
  --bg-card: rgba(255, 255, 255, 0.05);
  --bg-input: rgba(255, 255, 255, 0.08);
  
  /* === 文字色 === */
  --text-main: #ffffff;
  --text-secondary: #a0a0b0;
  --text-tertiary: #6b6b7b;
  --text-disabled: #4a4a5a;
  
  /* === 边框 === */
  --border-subtle: rgba(255, 255, 255, 0.05);
  --border-default: rgba(255, 255, 255, 0.1);
  --border-strong: rgba(255, 255, 255, 0.2);
  --border-focus: rgba(102, 126, 234, 0.5);
  
  /* === 功能色 === */
  --color-success: #22c55e;
  --color-warning: #f59e0b;
  --color-error: #ef4444;
  --color-info: #3b82f6;
  
  /* === 阴影 === */
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.3);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.4);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.5);
  --shadow-glow: 0 0 20px rgba(102, 126, 234, 0.4);
  
  /* === 渐变 === */
  --gradient-brand: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --gradient-dark: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
  --gradient-card: linear-gradient(180deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.02) 100%);
}

/* === 浅色模式 === */
[data-theme="light"] {
  --bg-page: #ffffff;
  --bg-surface: #f8fafc;
  --bg-elevated: #f1f5f9;
  --bg-card: rgba(0, 0, 0, 0.04);
  --bg-input: rgba(0, 0, 0, 0.06);
  
  --text-main: #0f172a;
  --text-secondary: #475569;
  --text-tertiary: #64748b;
  --text-disabled: #94a3b8;
  
  --border-subtle: rgba(0, 0, 0, 0.05);
  --border-default: rgba(0, 0, 0, 0.1);
  --border-strong: rgba(0, 0, 0, 0.2);
  --border-focus: rgba(102, 126, 234, 0.5);
  
  --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.1);
  --shadow-md: 0 4px 6px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px rgba(0, 0, 0, 0.1);
}
```

---

## 8. 使用示例

### 8.1 主按钮

```css
.btn-primary {
  background: var(--gradient-brand);
  color: white;
  border: none;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-glow);
}

.btn-primary:active {
  transform: translateY(0);
}
```

### 8.2 卡片组件

```css
.card {
  background: var(--bg-card);
  border: 1px solid var(--border-default);
  border-radius: 16px;
  transition: all 0.3s ease;
}

.card:hover {
  border-color: var(--border-strong);
  box-shadow: var(--shadow-md);
  transform: translateY(-4px);
}
```

### 8.3 输入框

```css
.input {
  background: var(--bg-input);
  border: 1px solid var(--border-default);
  color: var(--text-main);
}

.input:focus {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.input::placeholder {
  color: var(--text-disabled);
}
```

---

## 9. 配色原则

### 9.1 60-30-10 法则
- **60%** 中性色 (背景、文字) - 深色/浅色
- **30%** 主色 (卡片、按钮) - 紫色系
- **10%** 强调色 (高亮、图标) - 青色/功能色

### 9.2 对比度要求
- 正文文字: 对比度 ≥ 4.5:1
- 大文字: 对比度 ≥ 3:1
- 界面元素: 对比度 ≥ 3:1

### 9.3 品牌一致性
- 始终使用品牌渐变作为主强调
- 功能色保持一致语义
- 避免引入新的主色调

---

## 10. 导出资源

### 10.1 Figma 变量
- [ ] 颜色样式库
- [ ] 渐变样式库
- [ ] 效果样式库

### 10.2 开发资源
- [ ] CSS 变量文件
- [ ] Tailwind 配置
- [ ] Sass/Less 变量

### 10.3 设计资源
- [ ] 色板图片
- [ ] 渐变预设
- [ ] 效果预设
