# ECHO 东方美学设计规范 v1.0

> 万物有灵，皆可生长

---

## 一、命名体系（单字）

| 页面 | 单字 | 含义 | 调式 |
|------|------|------|------|
| index | **境** | 万物有灵，皆可生长 | 宫音 |
| marketplace | **集** | 万籁归藏，自得其所 | 徵音 |
| creator | **铸** | 生此一物，归于你 | 角音 |
| docs | **典** | 知来处，明去处 | 宫音 |
| explore | **域** | 声至心随，一色天地 | 羽音 |
| profile | **吾** | 此间天地，皆是所缘 | 商音 |
| asset-detail | **器** | 灵境化生，物归其主 | 宫音 |
| login | **入** | 接引 | 羽音 |
| asset-created | **成** | 生发 | 角音 |
| transaction-history | **录** | 记录 | 商音 |

### 三域命名
- **律域**（原音域）- 音律法度，声之至
- **彩域**（原色域）- 色彩流光，色之华
- **章域**（原文域）- 篇章章法，文之体

---

## 二、文案四要

### 1. 要单字
- 页面名、功能区、标签都用**单字**
- 如：境/集/铸/典/域/吾/器
- 避免双字词，除非必要

### 2. 要留白
- 句不宜长，意不宜尽
- 标题下留空，内容四周留空
- 留白比内容重要

### 3. 要古源
- 取典于经史子集
- 如：「万籁归藏」取《易经》归藏卦
- 「生此一物，归于你」取《诗经》体

### 4. 要模糊
- 不完全对，不确定，不饱满
- 给用户想象空间
- 如「不期而会」而非「随机推荐」

---

## 三、视觉四要

### 1. 要白描
- 线条为上，色彩为辅
- 图标用 SVG 白描，不用几何图形
- 如：古琴、梅花、书卷的白描画卷

### 白描技术规范
```
SVG 尺寸：180×220px（3:4竖卷）
线条：stroke-width 0.4-2.5
留白：画面上方作画，下方留白
```

### 2. 要呼吸
- 留白比内容重要
- padding: 10vh 40px 16vh（垂直呼吸）
- gap: 32px-64px（元素间距）

### 3. 要时间
- 动画过渡时间 **≥0.8s**
- 缓动函数：cubic-bezier(0.4, 0, 0.2, 1)
- 如墨晕开，缓缓而行

### 4. 要手作
- 不规则，不机械，不网格
- 避免 perfect circle/rectangle
- 用 organic 形状、纹理、噪点

---

## 四、交互四要

### 1. 要藏
- 功能不显露，用时方显
- 如：hover 时才显示操作按钮
- 如：滚动后才显示导航背景

### 2. 要缓
- 过渡时间 ≥0.8s
- 点击、hover、切换都要慢
- 给用户时间感知变化

### 3. 要印
- 用**印章**代替按钮
- 未选中：朱文（红字白底）
- 选中：白文（白字红底）

### 印章样式
```css
.observer-tab {
    width: 64px;
    height: 64px;
    border: 2px solid var(--ink-light);
    opacity: 0.7;
}
.observer-tab.active {
    background: var(--vermilion);
    border-color: var(--vermilion);
}
```

### 4. 要缘
- 一切皆是**相遇**，不是操作
- 用「遇」而非「推荐」
- 用「观」而非「查看」
- 用「铸」而非「创建」

---

## 五、色彩系统

### 基础色
```css
--bg-primary: #F5F2EA;      /* 宣纸底色 */
--bg-secondary: #EDE9DE;    /* 次要背景 */
--bg-tertiary: #E5E1D4;     /* 第三层背景 */

--ink-deep: #2A2825;        /* 浓墨 */
--ink-medium: #4A4742;      /* 中墨 */
--ink-light: #7A756D;       /* 淡墨 */
--ink-faint: #B5B0A8;       /* 极淡墨 */

--gold-primary: #A68B5B;    /* 金 */
--gold-light: #C9B896;      /* 浅金 */

--vermilion: #8B2820;       /* 朱砂 */
--vermilion-light: rgba(139, 40, 32, 0.4);
```

### 三域色
```css
--realm-sound: #8B9DC3;     /* 律域 - 蓝 */
--realm-color: #C9A9A6;     /* 彩域 - 粉 */
--realm-text: #7A8B7C;      /* 章域 - 绿 */
```

---

## 六、字体规范

### 字体族
```css
--font-display: 'LXGW WenKai', cursive;    /* 标题、单字 */
--font-serif: 'Noto Serif SC', serif;       /* 正文 */
```

### 字号层级
| 元素 | 字号 | 字间距 |
|------|------|--------|
| 单字标题 | 2rem | 0.3em |
| 副标题 | 1.1rem | 0.15em |
| 正文 | 0.9rem | 0.05em |
| 标签 | 0.75rem | 0.1em |
| 印章字 | 1.5rem | 0 |

---

## 七、音效系统

### 五音调式
| 调式 | 频率 | 意境 | 适用页面 |
|------|------|------|----------|
| 宫音 | 261.63Hz | 平和庄重 | 境/典/器 |
| 徵音 | 392.00Hz | 热烈欢快 | 集 |
| 角音 | 329.63Hz | 生机勃勃 | 铸/成 |
| 羽音 | 440.00Hz | 清冷哀怨 | 域/入 |
| 商音 | 293.66Hz | 悲伤内省 | 吾/录 |

### 音效触发时机
- **古琴**：页面加载（首次点击解锁后）
- **印章**：点击按钮
- **编钟**：成功反馈
- **毛笔**：悬停链接

---

## 八、布局规范

### 页面结构
```
[宣纸纹理层]
[导航栏 - 固定顶部]
[Hero区 - 大留白]
[内容区 - 三栏/单栏]
[页脚 - 简洁]
```

### 间距系统
- 大间距：10vh, 16vh（垂直节奏）
- 中间距：48px, 64px（元素组）
- 小间距：12px, 16px（内部）

### 容器宽度
- 最大：1000px
- 阅读：600px（正文）
- 全宽：100%（Hero、分隔线）

---

## 九、动效规范

### 过渡时间
- 快速：0.4s（hover颜色）
- 标准：0.8s（布局变化）
- 缓慢：1.2s-2.4s（页面切换）

### 缓动函数
```css
--ease-ink: cubic-bezier(0.25, 0.1, 0.25, 1);
--ease-breath: cubic-bezier(0.45, 0, 0.55, 1);
--ease-smooth: cubic-bezier(0.4, 0, 0.2, 1);
```

---

## 十、禁用事项

### ❌ 不要用
- Tailwind CSS（除非快速原型）
- 圆角大于 2px
- 饱和度高的颜色
- 细黑边框
- 完美几何形状
- 小于 0.4s 的动画
- 英文标识（除非技术术语）

### ✅ 要用
- 内联 CSS 或 `<style>` 块
- 宣纸纹理背景
- 淡墨边框（rgba）
- 手写感字体
- 自然有机形状
- 缓慢优雅的动画
- 中文单字标识

---

## 附录：常用代码片段

### 宣纸纹理
```css
.paper-texture {
    position: fixed;
    top: 0; left: 0; width: 100%; height: 100%;
    pointer-events: none; z-index: 0; opacity: 0.4;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E");
}
```

### 印章按钮
```html
<button class="observer-tab" data-seal="藏">藏</button>
```

### 白描图标容器
```html
<div class="feature-icon feature-icon--scroll">
    <svg viewBox="0 0 100 133">...</svg>
</div>
```

---

*文档创建：2026-03-16*
*版本：v1.0*
*维护者：雨娃 & Founder*
