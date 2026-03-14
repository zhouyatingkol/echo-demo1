# ECHO 东方美学设计规范 V2.1 (FINAL - 最满意版本)

**基于**: marketplace.html / index.html / docs.html (三字导航版本)  
**日期**: 2026-03-15  
**状态**: 最满意定稿版本  
**核心原则**: 三字清爽导航 - 境 | 集 | 典

---

## ⚠️ 重要声明

这是**最满意的设计版本**，所有后续修改必须以此为准：
- ✅ **导航栏**: 只有 3 个字 —— 境、集、典
- ❌ **禁止**: 探、榜、铸、心、藏 等字出现在主导航
- ✅ **铸造入口**: 右下角浮动「铸」按钮（朱红圆形）
- ✅ **个人中心**: 右上角「吾」按钮

---

## 一、导航栏系统（核心）

### 主导航（固定3字）

```
ECHO    境    集    典      入链
品牌   首页   市场   文档    连接
```

**HTML 结构**:
```html
<div class="navbar__nav">
    <a href="index.html" class="navbar__link">境</a>
    <a href="marketplace.html" class="navbar__link active">集</a>
    <a href="docs.html" class="navbar__link">典</a>
</div>
<div class="navbar__actions">
    <button class="navbar__user">入链</button>
</div>
```

### 导航栏样式规范

```css
.navbar {
    height: 60px;
    padding: 0 clamp(24px, 5vw, 80px);
    background: transparent;
    transition: background 0.8s ease, backdrop-filter 0.8s ease;
}

.navbar.is-scrolled {
    background: rgba(248, 246, 241, 0.92);
    backdrop-filter: blur(12px);
    box-shadow: 0 1px 0 rgba(122, 110, 95, 0.06);
}

.navbar__nav {
    display: flex;
    gap: 3rem;
    margin: 0 auto;
}

.navbar__link {
    font-family: 'Noto Serif SC', serif;
    font-size: 1rem;
    letter-spacing: 0.3em;
    color: var(--ink-light);
    position: relative;
}

.navbar__link::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 0;
    height: 0.5px;           /* 宋金细线 0.5px */
    background: var(--gold-primary);
    transition: width 0.4s ease;
}

.navbar__link:hover::after,
.navbar__link.active::after {
    width: 100%;
}
```

### 辅助入口

| 位置 | 元素 | 文案 | 功能 |
|-----|------|------|------|
| 右上角 | 文字按钮 | **吾** | 个人中心/登录 |
| 右下角 | 浮动圆形按钮 | **铸** | 铸造入口 |
| 导航右侧 | 文字按钮 | **入链** | 连接钱包 |

**铸造按钮样式**:
```css
.fab-create {
    position: fixed;
    bottom: 2rem;
    right: 2rem;
    width: 56px;
    height: 56px;
    border-radius: 50%;
    background: var(--vermilion);    /* 朱红 */
    color: white;
    font-family: var(--font-display);
    font-size: 1.25rem;
    box-shadow: 0 4px 20px rgba(160, 48, 32, 0.3);
}
```

---

## 二、页面结构（七页体系）

| 页面文件 | 单字标题 | 导航位置 | 入口方式 |
|---------|---------|---------|---------|
| `index.html` | **境** | 主导航 | 首页 |
| `marketplace.html` | **集** | 主导航 | 市场入口 |
| `docs.html` | **典** | 主导航 | 文档/帮助 |
| `creator.html` | **生** | 浮动按钮 | 点击「铸」进入 |
| `explore.html` | **三域** | 集内入口 | 从市场页进入 |
| `asset-detail.html` | **资产** | 无 | 点击资产卡片 |
| `profile.html` | **吾** | 右上角 | 点击「吾」进入 |

---

## 三、单字命名系统

### 主导航三字（严禁更改）

| 字 | 含义 | 页面 | 副标题 |
|---|------|------|--------|
| **境** | 境界、空间 | 首页 | 此间天地，皆你所造 |
| **集** | 集市、汇聚 | 市场 | 万声汇聚，各取所需 |
| **典** | 典籍、规范 | 文档 | 知来处，明去处 |

### 其他页面单字

| 字 | 页面 | 副标题 | 入口 |
|---|------|--------|------|
| **生** | 铸造 | 生此一物，归于你 | 浮动「铸」按钮 |
| **吾** | 个人中心 | 此间我境 | 右上角按钮 |
| **缘** | 购买按钮 | 缘起 | 资产详情页 |

### 铸造流程五字（仅用于 creator.html）

```
呈 → 述 → 值 → 权 → 生
```

| 步骤 | 字 | 含义 | 操作 |
|-----|---|------|------|
| 1 | **呈** | 呈现、上传 | 上传文件 |
| 2 | **述** | 描述、命名 | 填写信息 |
| 3 | **值** | 价值、定价 | 设置价格 |
| 4 | **权** | 权利、配置 | 四权设置 |
| 5 | **生** | 生成、铸造 | 完成铸造 |

---

## 四、四权分离系统

| 权利 | 符号 | 单字 | 全称 | 说明文案 |
|-----|------|------|------|---------|
| 使用权 | **◈** | 用 | 使用权 | 许他人于特定场景、时限、次数内用之 |
| 衍生权 | **✦** | 衍 | 衍生权 | 许再创作、改编、融合之权 |
| 扩展权 | **◎** | 扩 | 扩展权 | 许跨平台、跨媒体、跨地域之用 |
| 收益权 | **◉** | 益 | 收益权 | 定资产收益之分配则 |

---

## 五、三域分类系统

| 域 | 单字 | 描述 | 配色 | 子类 |
|---|------|------|------|------|
| **音** | 声至心随 | #8B9DC3 (淡蓝) | 音乐、音效、声景 |
| **色** | 一色天地 | #C9A9A6 (粉瓷) | 图像、影像、视觉 |
| **文** | 字间山河 | #7A8B7C (蟹壳青) | 文字、思想、叙事 |

---

## 六、色彩系统（固定）

```css
:root {
    /* 宣纸底色 */
    --bg-primary: #F8F6F1;
    --bg-secondary: #F2EFE8;
    --bg-tertiary: #EBE7DD;
    
    /* 四阶墨色 */
    --ink-deep: #1A1A1A;      /* 浓 - 标题 */
    --ink-medium: #4A4A4A;    /* 淡 - 正文 */
    --ink-light: #7A6E5F;     /* 浅 - 次要 */
    --ink-faint: #B5B5B5;     /* 虚 - 禁用 */
    
    /* 点缀色 */
    --gold-primary: #B89B6C;   /* 宋金 - hover、强调 */
    --gold-light: #D4C4A8;
    --vermilion: #A03020;      /* 朱红 - 按钮、印章 */
    --vermilion-light: rgba(160, 48, 32, 0.4);
    
    /* 三域色（固定） */
    --realm-sound: #8B9DC3;    /* 音 - 淡蓝 */
    --realm-color: #C9A9A6;    /* 色 - 粉瓷 */
    --realm-text: #7A8B7C;     /* 文 - 蟹壳青 */
    
    /* 字体 */
    --font-display: 'LXGW WenKai', cursive;
    --font-serif: 'Noto Serif SC', serif;
}
```

---

## 七、按钮规范

### 主按钮（默认态）
```css
.btn-primary {
    background: var(--ink-deep);     /* 墨黑 */
    color: white;
    border: none;
    padding: 12px 32px;
    font-family: var(--font-serif);
    transition: all 0.4s ease;
}
.btn-primary:hover {
    background: var(--gold-primary);  /* 悬停变金色 */
}
```

### 铸造按钮（特殊）
```css
.btn-mint {
    background: var(--vermilion);     /* 朱红 */
    color: white;
}
.btn-mint:hover {
    background: #802820;
}
```

### 线框按钮
```css
.btn-outline {
    background: transparent;
    border: 1px solid var(--ink-faint);
    color: var(--ink-medium);
}
.btn-outline:hover {
    border-color: var(--gold-primary);
    color: var(--gold-primary);
}
```

---

## 八、文案风格规范

### 绝对禁止（现代科技语）
- ❌ "发现音乐"
- ❌ "铸造 NFT"
- ❌ "上传文件"
- ❌ "购买"
- ❌ "提交"
- ❌ " marketplace"

### 必须使用（东方意境语）
- ✅ "寻声而来，觅得所好"
- ✅ "铸声为境，生此一物"
- ✅ "呈"
- ✅ "缘起"
- ✅ "成"

---

## 九、文件命名规范

### 核心页面（必须存在）
```
pages/
├── index.html           # 境 - 首页
├── marketplace.html     # 集 - 市场
├── docs.html            # 典 - 文档
├── creator.html         # 生 - 铸造（从浮动按钮进入）
├── explore.html         # 三域 - 探索
├── asset-detail.html    # 资产详情
└── profile.html         # 吾 - 个人中心
```

### 废弃页面（不应再使用）
- ❌ `discover.html` - 用 marketplace.html 替代
- ❌ `music-market.html` - 用 marketplace.html 替代
- ❌ `charts.html` - 功能合并到 marketplace.html
- ❌ `mint-music.html` - 用 creator.html 替代
- ❌ `dashboard.html` - 用 profile.html 替代
- ❌ `my-assets.html` - 功能合并到 profile.html
- ❌ `my-favorites.html` - 功能合并到 profile.html

---

## 十、检查清单（每次修改前必读）

### 导航栏检查
- [ ] 只有 3 个导航字：境、集、典
- [ ] 没有探、榜、铸、心、藏等字
- [ ] 右下角有浮动「铸」按钮
- [ ] 右上角有「吾」按钮
- [ ] 钱包按钮是「入链」

### 颜色检查
- [ ] 背景是宣纸 #F8F6F1
- [ ] 主按钮悬停变金色（不是朱红）
- [ ] 铸造按钮是朱红
- [ ] 三域色：淡蓝、粉瓷、蟹壳青

### 文案检查
- [ ] 没有英文单词（如 marketplace、NFT）
- [ ] 使用单字动词（呈、述、值、权、生）
- [ ] 副标题是八字对仗

---

## 十一、版本历史

| 版本 | 日期 | 变更 | 状态 |
|-----|------|------|------|
| V1.0 | 03-14 | 初版设计系统 | 已废弃 |
| V2.0 | 03-15 | 基于 creator.html（5字导航） | 已废弃 |
| **V2.1** | 03-15 | **基于 marketplace.html（3字导航）** | **最满意定稿** |

---

*规范版本: V2.1 (FINAL)*  
*最后更新: 2026-03-15*  
*维护者: 雨娃*  
*状态: 最满意版本，严禁擅自修改导航结构*
