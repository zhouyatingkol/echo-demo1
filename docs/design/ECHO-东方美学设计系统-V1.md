# ECHO 东方美学设计系统 V1.0

> 设计总监：雨娃  
> 团队：视觉 × UI × 交互 × 动效 × 字体  
> 核心理念：「生长」—— 克制、呼吸、过目不忘

---

## 一、视觉系统

### 1.1 色彩哲学

```css
:root {
  /* 宣纸质感 */
  --bg-primary: #F8F6F1;      /* 暖白宣纸底色 */
  --bg-secondary: #F2EFE8;    /* 微黄陈纸 */
  --bg-tertiary: #EBE7DD;     /* 深一层 */
  
  /* 四阶墨色 */
  --ink-deep: #1A1A1A;        /* 浓墨 - 主标题 */
  --ink-medium: #4A4A4A;      /* 中墨 - 正文 */
  --ink-light: #7A6E5F;       /* 淡墨 - 辅助 */
  --ink-faint: #B5B5B5;       /* 极淡 - 占位 */
  
  /* 宋金 */
  --gold-primary: #B89B6C;    /* 内敛古金 */
  --gold-light: #D4C4A8;      /* 淡金 hover */
  
  /* 三域 */
  --realm-sound: #8B9DC3;     /* 音 - 青瓷 */
  --realm-color: #C9A9A6;     /* 色 - 粉瓷 */
  --realm-text: #7A8B7C;      /* 文 - 墨绿 */
}
```

### 1.2 字体系统

```css
@import url('https://fonts.googleapis.com/css2?family=LXGW+WenKai:wght@300;400;700&family=Noto+Serif+SC:wght@300;400;500&family=Noto+Sans+SC:wght@300;400;500&display=swap');

:root {
  /* 中文 */
  --font-display: 'LXGW WenKai', cursive;        /* 标题 - 文楷 */
  --font-serif: 'Noto Serif SC', serif;          /* 正文 - 宋体 */
  --font-sans: 'Noto Sans SC', sans-serif;       /* UI - 黑体 */
  
  /* 字间距 */
  --tracking-hero: 0.28em;
  --tracking-subtitle: 0.5em;
  --tracking-body: 0.02em;
  
  /* 行高 */
  --leading-tight: 1.2;
  --leading-relaxed: 1.8;
  --leading-poetic: 2.5;
}
```

### 1.3 Hero 区设计

**布局原则**：50%+ 留白，垂直居中，「动」字为锚点

```html
<section class="hero">
  <!-- 宣纸纹理 -->
  <div class="hero-texture"></div>
  
  <!-- 窗棂光晕（两层，12秒呼吸） -->
  <div class="hero-light hero-light--primary"></div>
  <div class="hero-light hero-light--secondary"></div>
  
  <!-- 宋瓷开片装饰线 -->
  <div class="hero-crackle hero-crackle--tr"></div>
  <div class="hero-crackle hero-crackle--bl"></div>
  
  <!-- 主内容 -->
  <div class="hero-content">
    <h1 class="hero-title">
      <span class="hero-char">动</span>
      <span class="hero-brand">ECHO</span>
    </h1>
    
    <p class="hero-subtitle">
      <span class="subtitle-main">声音、色彩、文字</span>
      <span class="subtitle-highlight">—— 在流转中生长</span>
    </p>
    
    <button class="hero-cta">
      <span>进入</span>
    </button>
  </div>
</section>
```

**核心样式**：

```css
/* 「动」字 - 128px，金色下划线如印章 */
.hero-char {
  font-family: var(--font-display);
  font-size: clamp(5rem, 12vw, 8rem);
  font-weight: 300;
  color: var(--ink-deep);
  letter-spacing: var(--tracking-hero);
  position: relative;
}

.hero-char::after {
  content: '';
  position: absolute;
  bottom: -0.5rem;
  left: 50%;
  transform: translateX(-50%);
  width: 2rem;
  height: 0.5px;
  background: var(--gold-primary);
  opacity: 0.6;
}

/* 副标题 - 0.9rem，0.5em字间距 */
.hero-subtitle {
  font-size: 0.9rem;
  color: var(--ink-light);
  letter-spacing: 0.5em;
  margin-top: 4rem;
}

/* 宋瓷按钮 - 0.5px边框，1px圆角 */
.hero-cta {
  padding: 1.2rem 4rem;
  font-size: 0.85rem;
  letter-spacing: 0.5em;
  border: 0.5px solid rgba(26, 26, 26, 0.08);
  border-radius: 1px;
  background: transparent;
  transition: all 1.2s cubic-bezier(0.23, 1, 0.32, 1);
}

.hero-cta:hover {
  border-color: var(--gold-light);
  letter-spacing: 0.6em;
}

/* 窗棂光晕 */
.hero-light {
  position: absolute;
  width: 60vw;
  height: 60vw;
  background: radial-gradient(ellipse at center, 
    rgba(232, 228, 220, 0.6) 0%, 
    transparent 70%);
  filter: blur(60px);
  animation: lightBreath 12s ease-in-out infinite;
}

@keyframes lightBreath {
  0%, 100% { opacity: 0.6; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
}
```

---

## 二、图标系统

### 2.1 三域图标

**音** - 不对称声波，线条渐变
**色** - 三层水墨晕染，透明度变化  
**文** - 竹简竖线，疏密有致

```html
<!-- 音域 -->
<svg class="icon icon-sound" viewBox="0 0 24 24">
  <path d="M12 4v16M8 8c-2 2-2 6 0 8M16 6c3 3 3 9 0 12" 
        stroke="var(--realm-sound)" 
        stroke-width="0.5" 
        fill="none"/>
</svg>

<!-- 色域 -->
<svg class="icon icon-color" viewBox="0 0 24 24">
  <circle cx="12" cy="12" r="8" 
          stroke="var(--realm-color)" 
          stroke-width="0.5" 
          fill="none" 
          opacity="0.3"/>
  <circle cx="12" cy="12" r="5" 
          stroke="var(--realm-color)" 
          stroke-width="0.5" 
          fill="none" 
          opacity="0.6"/>
  <circle cx="12" cy="12" r="2" 
          fill="var(--realm-color)" 
          opacity="0.9"/>
</svg>

<!-- 文域 -->
<svg class="icon icon-text" viewBox="0 0 24 24">
  <line x1="6" y1="4" x2="6" y2="20" stroke="var(--realm-text)" stroke-width="0.5"/>
  <line x1="12" y1="4" x2="12" y2="20" stroke="var(--realm-text)" stroke-width="0.5"/>
  <line x1="18" y1="4" x2="18" y2="20" stroke="var(--realm-text)" stroke-width="0.5"/>
</svg>
```

### 2.2 按钮组件

```css
/* 宋瓷质感按钮 */
.btn-ceramic {
  position: relative;
  padding: 14px 32px;
  font-size: 14px;
  letter-spacing: 0.1em;
  color: white;
  background: linear-gradient(135deg, var(--ink-medium) 0%, var(--ink-deep) 100%);
  border: none;
  border-radius: 1px;
  box-shadow: 
    inset 0 1px 0 rgba(255,255,255,0.1),
    0 2px 4px rgba(0,0,0,0.06);
  overflow: hidden;
}

/* 顶部高光 - 釉面感 */
.btn-ceramic::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(255,255,255,0.3), 
    transparent);
}
```

---

## 三、交互与文案

### 3.1 仪式化语言

| 常规 | 东方美学 |
|------|----------|
| 上传 | **播种** |
| 购买 | **结缘** |
| 出售 | **结缘成功** |
| 收益 | **果实成熟** |
| 提现 | **收获** |
| 收藏 | **铭记** |
| 删除 | **归零** |
| 确定 | **如是** |

### 3.2 空状态文案

```
暂无作品 → 此处尚待笔墨
暂无收藏 → 结缘尚浅
无搜索结果 → 未觅得踪迹
网络错误 → 与尘世暂隔
```

### 3.3 三域描述

**音域**：
> 声之所至，心之所向  
> 每一音符，都是时间的纹路

**色域**：
> 一笔一世界，一色一乾坤  
> 视觉的诗，无需翻译

**文域**：
> 字里行间，自有山河  
> 每一段文字，都是灵魂的拓印

---

## 四、动效规范

### 4.1 时序系统

```css
:root {
  /* 时长 */
  --duration-instant: 0.15s;   /* 微交互 */
  --duration-fast: 0.3s;       /* hover */
  --duration-normal: 0.8s;     /* 元素过渡 */
  --duration-slow: 1.2s;       /* 页面切换 */
  --duration-ambient: 12s;     /* 环境动画 */
  
  /* 缓动 - 东方美学 */
  --ease-ink: cubic-bezier(0.25, 0.1, 0.25, 1);      /* 墨晕 */
  --ease-water: cubic-bezier(0.4, 0, 0.2, 1);        /* 水波 */
  --ease-breath: cubic-bezier(0.45, 0, 0.55, 1);     /* 呼吸 */
  --ease-leaf: cubic-bezier(0.22, 1, 0.36, 1);       /* 叶落 */
}
```

### 4.2 关键动效

**「动」字出现**（如书法运笔）：
```css
.hero-char {
  opacity: 0;
  transform: translateY(30px);
  filter: blur(10px);
  animation: emerge 2s var(--ease-ink) forwards;
}

@keyframes emerge {
  0% { opacity: 0; transform: translateY(30px); filter: blur(10px); }
  100% { opacity: 1; transform: translateY(0); filter: blur(0); }
}
```

**呼吸效果**（持续）：
```css
.hero-char {
  animation: 
    emerge 2s forwards,
    breathe 8s ease-in-out infinite;
  animation-delay: 0.3s, 3s;
}

@keyframes breathe {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.005); }
}
```

**页面切换**（如翻书）：
```css
@keyframes pageExit {
  0% { opacity: 1; transform: scale(1); filter: blur(0); }
  100% { opacity: 0; transform: scale(0.98) translateX(-20px); filter: blur(4px); }
}

@keyframes pageEnter {
  0% { opacity: 0; transform: scale(1.02) translateX(20px); filter: blur(4px); }
  100% { opacity: 1; transform: scale(1); filter: blur(0); }
}
```

**按钮 Hover**（光晕流动）：
```css
.hero-cta::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, 
    transparent, 
    rgba(184, 155, 108, 0.1), 
    transparent);
  transition: left 1.5s ease;
}

.hero-cta:hover::before {
  left: 100%;
}
```

### 4.3 声音设计建议

| 场景 | 材质隐喻 | 情绪 |
|------|----------|------|
| 页面切换 | 宣纸翻动 | 从容、雅致 |
| 点击 | 瓷器轻碰 | 清脆、精致 |
| 成功 | 古琴泛音 | 悠扬、圆满 |
| 错误 | 木鱼轻敲 | 警醒、克制 |

---

## 五、设计原则总结

### 5.1 克制清单

- ✓ 50%+ 留白
- ✓ 0.5px 细线
- ✓ 12秒环境动画
- ✓ 1.2秒页面切换
- ✓ 每个元素有存在理由
- ✗ 没有装饰性元素
- ✗ 没有鲜艳色彩
- ✗ 没有快速动效

### 5.2 过目不忘的秘密

不是通过「多」来让人记住，而是通过「少」——

- 让人**安静下来**
- 让人有**呼吸的空间**
- 让人感受到**时间的流动**
- 让人在留白中**想象**

---

## 附录：完整文件清单

| 文件 | 路径 | 说明 |
|------|------|------|
| 设计系统文档 | `/docs/design/ECHO-Design-Team-Brief.md` | 团队招募文档 |
| 图标组件库 | `/echo-design-system.html` | 完整 UI 展示 |
| 动效规范 | `/design/animation-sound-design.md` | 动效与声音 |
| 交互设计 | `/ECHO-交互情感化设计.md` | 情感化体验 |
| 字体系统 | `/ECHO-typography.css` | 可直接引用 |

---

> *「生长不是喧闹的宣言，而是沉默的蔓延。」*  
> —— 雨娃，ECHO 设计总监
