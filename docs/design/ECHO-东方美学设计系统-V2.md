# ECHO 东方美学设计系统 V2.0

> 设计总监：雨娃  
> 核心理念：「生长」—— 克制、呼吸、过目不忘  
> 更新日期：2026-03-14

---

## 一、基础规范

### 1.1 全局字号

**基础字号：20px**（125%缩放，确保100%屏幕下达到120%清晰度）

```css
html {
    font-size: 20px;
    scroll-behavior: smooth;
}
```

### 1.2 色彩系统

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
    
    /* 朱红 - 重点强调 */
    --seal-red: #A03020;        /* 印章、铸造按钮 */
    
    /* 三域 - 固定配色 */
    --realm-sound: #8B9DC3;     /* 音 - 青瓷 */
    --realm-color: #C9A9A6;     /* 色 - 粉瓷 */
    --realm-text: #7A8B7C;      /* 文 - 蟹壳青 */
}
```

### 1.3 字体系统

```css
@import url('https://fonts.googleapis.com/css2?family=LXGW+WenKai:wght@300;400;700&family=Noto+Serif+SC:wght@300;400;500&display=swap');

:root {
    --font-display: 'LXGW WenKai', cursive;    /* 标题 - 霞鹜文楷 */
    --font-serif: 'Noto Serif SC', serif;      /* 正文 - 思源宋体 */
    --font-sans: -apple-system, sans-serif;    /* UI - 系统黑体 */
}
```

---

## 二、页面规范

### 2.1 Hero 区统一规范

**所有页面单字标题必须统一：**

| 属性 | 值 | 说明 |
|------|-----|------|
| 字号 | 2.8rem | 固定值，不可变 |
| 字重 | 400 | 常规字重 |
| 字间距 | 0.3em | 东方留白美学 |
| 颜色 | var(--ink-deep) | 浓墨色 |
| 下边距 | 16px | 与副标题间距 |

**副标题规范：**
- 字号：1rem
- 字间距：0.15em
- 颜色：var(--ink-light)
- 内容：一句话，六字为佳

```css
.hero-title {
    font-family: var(--font-display);
    font-size: 2.8rem;
    font-weight: 400;
    letter-spacing: 0.3em;
    color: var(--ink-deep);
    margin-bottom: 16px;
}

.hero-subtitle {
    font-family: var(--font-serif);
    font-size: 1rem;
    color: var(--ink-light);
    letter-spacing: 0.15em;
    font-weight: 300;
}
```

**页面标题对照：**
| 页面 | 标题 | 副标题 |
|------|------|--------|
| index.html | 境 | 创作即生命，流转即生长 |
| marketplace.html | 集 | 随缘而聚，各得其所 |
| docs.html | 典 | 知来处，明去处 |
| creator.html | 生 | 生此一物，归于你 |
| profile.html | 吾 | 此间天地，皆是所缘 |

### 2.2 导航栏规范

**主导航（四字清爽）：**
```
境 | 集 | 典 | 入链
```

**右上角：**
- 未登录：「入链」
- 已登录：「吾」→ profile.html

**全局浮动按钮：**
- 位置：右下角固定
- 文案：「铸」（朱红圆形）
- 链接：creator.html

---

## 三、组件规范

### 3.1 按钮规范

**主按钮（铸造/提交）：**
```css
.submit-btn {
    padding: 1.2rem 4rem;
    font-family: var(--font-display);
    font-size: 1rem;
    letter-spacing: 0.5em;
    color: var(--bg-primary);
    background: var(--ink-deep);
    border: none;
    border-radius: 2px;
    transition: all 0.8s cubic-bezier(0.23, 1, 0.32, 1);
}

.submit-btn:hover {
    background: var(--gold-primary);  /* 悬停变金色 */
    box-shadow: 0 8px 30px rgba(184, 155, 108, 0.3);
}
```

**次按钮（链接式）：**
```css
.hero-create-link {
    font-family: var(--font-display);
    font-size: 0.9rem;
    letter-spacing: 0.15em;
    color: var(--gold-primary);
    border-bottom: 0.5px solid var(--gold-primary);
}
```

### 3.2 表单区块规范

**区块标题（居中）：**
```css
.form-label {
    display: block;
    font-family: var(--font-display);
    font-size: 1.2rem;
    color: var(--ink-deep);
    letter-spacing: 0.2em;
    margin-bottom: 1rem;
    text-align: center;  /* 必须居中 */
}
```

**区块命名（单字）：**
- 呈：上传
- 名：作品名
- 述：描述
- 值：定价
- 权：权益
- 生：生成

### 3.3 步骤指示器

```css
.step-dot {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    font-family: var(--font-display);
    font-size: 0.9rem;
    letter-spacing: 0.1em;
}

.step-dot--pending {
    background: var(--bg-tertiary);
    color: var(--ink-light);
    border: 0.5px solid rgba(122, 110, 95, 0.2);
}

.step-dot--active {
    background: var(--gold-primary);  /* 激活态金色 */
    color: white;
    box-shadow: 0 4px 16px rgba(184, 155, 108, 0.3);
}

.step-dot--completed {
    background: var(--gold-primary);  /* 完成态金色 */
    color: white;
}
```

**步骤文案：** 呈 → 述 → 值 → 权 → 生

---

## 四、四权设计规范

### 4.1 整体布局

**卡片布局：** 2×2 宫格
```css
.rights-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 1.5rem;
}
```

**区块标题居中：**
```css
#section-rights .form-label {
    text-align: center;
}
```

### 4.2 四权印章

**印章符号：**
| 权 | 符号 | 名称 | 寓意 |
|----|------|------|------|
| 用 | ◈ | 使用权 | 授权如令 |
| 衍 | ✦ | 衍生权 | 化生万物 |
| 扩 | ◎ | 扩展权 | 扩展远播 |
| 益 | ◉ | 收益权 | 分利均沾 |

**印章样式：**
```css
.rights-seal {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1.5px solid rgba(122, 110, 95, 0.3);
    border-radius: 2px;
    font-size: 1.2rem;
    color: var(--ink-light);
    background: var(--bg-primary);
}

.rights-card.is-enabled .rights-seal {
    border-color: var(--seal-red);  /* 选中朱红 */
    color: var(--seal-red);
    background: rgba(160, 48, 32, 0.04);
}
```

### 4.3 名称展示

```css
.rights-name {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
}

.rights-name-primary {
    font-size: 1.2rem;      /* 单字大 */
    font-family: var(--font-display);
}

.rights-name-secondary {
    font-size: 0.75rem;     /* 双字小 */
    color: var(--ink-light);
}
```

### 4.4 四权文案

| 权 | 标题 | 说明文案 |
|----|------|---------|
| 用 | 用 · 使用权 | 许他人于特定场景、时限、次数内用之 |
| 衍 | 衍 · 衍生权 | 许再创作、改编、融合之权 |
| 扩 | 扩 · 扩展权 | 许跨平台、跨媒体、跨地域之用 |
| 益 | 益 · 收益权 | 定资产收益之分配则 |

---

## 五、三域设计规范

### 5.1 颜色固定

```css
.realm-card--sound {
    background: #8B9DC3;  /* 青瓷 - 不可变 */
}

.realm-card--color {
    background: #C9A9A6;  /* 粉瓷 - 不可变 */
}

.realm-card--text {
    background: #7A8B7C;  /* 蟹壳青 - 不可变 */
}
```

### 5.2 文字颜色

**未选中：**
- 图标：白色 rgba(255, 255, 255, 0.9)
- 名称：白色 rgba(255, 255, 255, 0.95)
- 描述：白色 rgba(255, 255, 255, 0.7)

**选中态：**
- 边框：var(--seal-red)
- 图标/名称：var(--seal-red)

### 5.3 三域文案

| 域 | 标题 | 副标题 |
|----|------|--------|
| 音 | 音 | 声至心随 |
| 色 | 色 | 一色天地 |
| 文 | 文 | 字间山河 |

---

## 六、动效规范

### 6.1 时长系统

```css
:root {
    --duration-instant: 0.15s;   /* 微交互 */
    --duration-fast: 0.3s;       /* hover */
    --duration-normal: 0.8s;     /* 元素过渡 */
    --duration-slow: 1.2s;       /* 页面切换 */
}
```

### 6.2 缓动函数

```css
:root {
    --ease-ink: cubic-bezier(0.25, 0.1, 0.25, 1);      /* 墨晕 */
    --ease-water: cubic-bezier(0.4, 0, 0.2, 1);        /* 水波 */
    --ease-breath: cubic-bezier(0.45, 0, 0.55, 1);     /* 呼吸 */
}
```

---

## 七、文案规范

### 7.1 动词替换

| 常规 | 东方美学 |
|------|----------|
| 创建/铸造 | 生、铸、作 |
| 购买 | 结缘、配 |
| 出售 | 归 |
| 上传 | 呈 |
| 设置 | 置 |
| 删除 | 归零 |
| 确定 | 如是 |
| 取消 | 且住 |

### 7.2 页面入口文案

| 页面 | 入口文案 |
|------|---------|
| creator.html | 吾作、亦铸、入生 |
| marketplace.html | 采集、入集 |
| profile.html | 吾境、有、创、益 |

### 7.3 空状态文案

| 场景 | 文案 |
|------|------|
| 暂无作品 | 此处尚待笔墨 |
| 暂无收藏 | 结缘尚浅 |
| 无搜索结果 | 未觅得踪迹 |
| 加载中 | 墨晕渐开... |

---

## 八、文件结构规范

### 8.1 页面文件

```
pages/
├── index.html          # 首页 - 境
├── marketplace.html    # 市场 - 集
├── creator.html        # 铸造 - 生
├── explore.html        # 探索 - 三域
├── docs.html           # 文档 - 典
├── asset-detail.html   # 资产详情
├── profile.html        # 个人中心 - 吾
└── design-system.html  # 设计系统展示
```

### 8.2 样式引用

**必须内嵌的样式：**
- 导航栏样式（确保首屏无闪烁）
- Hero 区样式
- 关键变量（:root）

**可外链的样式：**
- 通用组件
- 动画关键帧
- 工具类

---

## 九、检查清单

新页面开发前，确认以下规范：

- [ ] 基础字号 20px
- [ ] Hero 标题 2.8rem，字重 400，居中
- [ ] 副标题一句话，六字为佳
- [ ] 表单区块标题居中
- [ ] 按钮悬停色为金色（var(--gold-primary)）
- [ ] 重点强调用朱红（var(--seal-red)）
- [ ] 步骤指示器激活态金色
- [ ] 三域颜色固定（青瓷/粉瓷/蟹壳青）
- [ ] 四权印章选中态朱红
- [ ] 导航栏统一（境|集|典|入链）
- [ ] 全局浮动「铸」按钮

---

## 十、版本历史

| 版本 | 日期 | 更新内容 |
|------|------|---------|
| V1.0 | 初始 | 基础色彩、字体系统 |
| V2.0 | 2026-03-14 | 统一字号20px、Hero标题2.8rem、表单居中、按钮金色悬停、四权设计规范 |

---

*「克制即高级，留白即呼吸」—— 雨娃*
