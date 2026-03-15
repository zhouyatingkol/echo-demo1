# ECHO 字体与文案系统设计

> 核心理念：「生长」—— 如草木蔓发，如春山可望

---

## 一、字体系统

### 1.1 设计理念

ECHO 的字体选择遵循「生长的诗意」：
- **标题字体**：如书法般有生命力，但保持现代感
- **正文字体**：如古籍般沉静，但清晰易读
- **数字字体**：精确但不过分冰冷

### 1.2 中文标题字体

#### 主选：霞鹜文楷 (LXGW WenKai)
```css
/* Google Fonts 加载 */
@import url('https://fonts.googleapis.com/css2?family=LXGW+WenKai:wght@300;400;700&display=swap');
```

**选择理由**：
- 源自 Klee 楷体，兼具书法韵味与现代感
- 字形舒展，有「生长」的延伸感
- 开源免费，商用无忧
- 支持简繁体，字符集完整

**适用场景**：
- Hero 区大标题
- 三域（音/色/文）的章节标题
- 诗意短句展示

#### 备选：演示悠然小楷
```css
/* 如需更轻盈的气质 */
@import url('https://chinese-font.netlify.app/packages/syrysxk/dist/%E6%BC%94%E7%A4%BA%E6%82%A0%E7%84%B6%E5%B0%8F%E6%A5%B7/result.css');
```

**适用场景**：
- 女性向内容
- 文学作品的标题
- 需要更柔和气质的页面

#### 应急备选：系统字体
```css
font-family: 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
```

### 1.3 中文正文字体

#### 主选：思源宋体 (Source Han Serif / Noto Serif SC)
```css
/* Google Fonts 加载 */
@import url('https://fonts.googleapis.com/css2?family=Noto+Serif+SC:wght@300;400;500;600;700&display=swap');
```

**选择理由**：
- 如古籍排版般优雅
- 衬线增强阅读引导
- 与文楷形成「手写-印刷」的层次感
- 文学气质浓厚

**适用场景**：
- 长文阅读
- 作品描述
- 版权协议文本

#### 备选：思源黑体 (Source Han Sans / Noto Sans SC)
```css
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700&display=swap');
```

**适用场景**：
- 界面说明
- 功能性文字
- 数据展示

### 1.4 英文搭配

#### 标题英文：Canela (衬线)
```css
/* 需购买或寻找类似开源字体 */
font-family: 'Canela', 'Playfair Display', 'Libre Baskerville', serif;
```

**免费替代方案**：Playfair Display
```css
@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&display=swap');
```

#### 正文英文：Lato (无衬线)
```css
@import url('https://fonts.googleapis.com/css2?family=Lato:wght@300;400;700&display=swap');
```

**选择理由**：
- 温暖友好的几何无衬线
- 与中文宋体/黑体都能和谐搭配

#### 界面英文：Inter
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
```

### 1.5 数字字体

#### 推荐：等宽数字 JetBrains Mono
```css
@import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500&display=swap');
```

**适用场景**：
- 版权编号
- 时间戳
- 统计数据

#### 替代：旧式比例数字 (Lato 自带)
```css
/* Lato 默认提供比例数字，更具人文气息 */
font-variant-numeric: proportional-nums;
```

---

## 二、Web 字体加载方案

### 2.1 完整 CSS 配置

```css
/* ============================================
   ECHO 字体系统 - 完整加载方案
   ============================================ */

/* ---- 1. 字体预加载（关键性能优化） ---- */
<link rel="preload" href="https://fonts.gstatic.com/s/lxgwwenkai/v2/LXGWWenKai-Regular.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>

/* ---- 2. Google Fonts 统一加载 ---- */
@import url('https://fonts.googleapis.com/css2?family=LXGW+WenKai:wght@300;400;700&family=Noto+Serif+SC:wght@300;400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;700&family=Playfair+Display:wght@400;500;600;700&family=Lato:wght@300;400;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

/* ---- 3. CSS 变量定义 ---- */
:root {
  /* 中文字体 */
  --font-zh-display: 'LXGW WenKai', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', cursive;
  --font-zh-serif: 'Noto Serif SC', 'Source Han Serif SC', 'SimSun', 'STSong', serif;
  --font-zh-sans: 'Noto Sans SC', 'Source Han Sans SC', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  
  /* 英文字体 */
  --font-en-display: 'Playfair Display', 'Libre Baskerville', Georgia, serif;
  --font-en-body: 'Lato', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --font-en-ui: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  
  /* 数字字体 */
  --font-mono: 'JetBrains Mono', 'SF Mono', 'Fira Code', 'Consolas', monospace;
  
  /* 组合字体栈 */
  --font-title: var(--font-zh-display), var(--font-en-display);
  --font-body: var(--font-zh-serif), var(--font-en-body);
  --font-ui: var(--font-zh-sans), var(--font-en-ui);
  --font-code: var(--font-mono);
}

/* ---- 4. 基础样式 ---- */
body {
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.8;
  color: var(--color-text-primary, #1a1a1a);
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ---- 5. 字体回退策略 ---- */
/* 确保在字体加载前文字可见 */
@font-face {
  font-family: 'LXGW WenKai';
  font-display: swap;
  /* Google Fonts 自动处理 */
}

@font-face {
  font-family: 'Noto Serif SC';
  font-display: swap;
}
```

### 2.2 性能优化策略

| 策略 | 实现 | 效果 |
|------|------|------|
| `font-display: swap` | 立即显示后备字体，加载完成后替换 | 避免 FOIT（无墨渲染） |
| `preload` | 预加载首屏关键字体 | 减少首屏加载时间 |
| `preconnect` | 提前建立字体服务器连接 | 减少 DNS + TCP + TLS 延迟 |
| 子集化 | 仅加载必要字符 | 减小字体文件体积 |
| WOFF2 格式 | 现代压缩格式 | 比 WOFF 小 30% |

---

## 三、排版规范

### 3.1 字号阶梯（Type Scale）

基于 1.25 比例尺（Major Third）：

```css
:root {
  /* 字号阶梯 - 从 12px 到 48px */
  --text-xs: 0.75rem;      /* 12px - 标签、时间戳 */
  --text-sm: 0.875rem;     /* 14px - 辅助说明 */
  --text-base: 1rem;       /* 16px - 正文 */
  --text-lg: 1.125rem;     /* 18px - 大正文 */
  --text-xl: 1.25rem;      /* 20px - 小标题 */
  --text-2xl: 1.5rem;      /* 24px - 章节标题 */
  --text-3xl: 1.875rem;    /* 30px - 卡片标题 */
  --text-4xl: 2.25rem;     /* 36px - 页面标题 */
  --text-5xl: 3rem;        /* 48px - Hero 标题 */
  
  /* 响应式调整 */
  --text-hero: clamp(2.25rem, 5vw, 4rem);  /* 36px - 64px */
}
```

### 3.2 字重使用规范

| 字重 | 值 | 使用场景 |
|------|-----|----------|
| Light | 300 | 大标题、引言、弱化文字 |
| Regular | 400 | 正文、描述 |
| Medium | 500 | 小标题、按钮、导航 |
| SemiBold | 600 | 强调、选中状态 |
| Bold | 700 | 重要标题、关键数据 |

```css
/* 使用示例 */
.echo-title--hero {
  font-family: var(--font-title);
  font-size: var(--text-hero);
  font-weight: 300;  /* Light - 更有诗意 */
  letter-spacing: 0.05em;
}

.echo-title--section {
  font-family: var(--font-title);
  font-size: var(--text-3xl);
  font-weight: 400;
}

.echo-text--body {
  font-family: var(--font-body);
  font-size: var(--text-base);
  font-weight: 400;
  line-height: 1.8;
}

.echo-text--label {
  font-family: var(--font-ui);
  font-size: var(--text-sm);
  font-weight: 500;
}
```

### 3.3 行高比例

| 场景 | 行高 | 说明 |
|------|------|------|
| 大标题 (Hero) | 1.2 - 1.3 | 紧凑有力 |
| 章节标题 | 1.4 | 层次分明 |
| 正文 | 1.8 | 舒适阅读 |
| 长文阅读 | 2.0 | 古籍排版感 |
| 注释/说明 | 1.5 | 紧凑高效 |

```css
/* 行高变量 */
--leading-tight: 1.2;
--leading-snug: 1.4;
--leading-normal: 1.6;
--leading-relaxed: 1.8;
--leading-loose: 2.0;
--leading-poetic: 2.5;  /* 特殊诗意排版 */
```

### 3.4 字间距（Tracking）

| 场景 | 字间距 | 说明 |
|------|--------|------|
| 中文大标题 | 0.05em - 0.1em | 呼吸感 |
| 中文正文 | 0.02em | 微增可读性 |
| 英文标题 | -0.02em | 紧凑现代 |
| 英文正文 | 0 | 默认 |
| 数字 | 0.05em | 清晰分隔 |

```css
/* 字间距工具类 */
.tracking-poetic { letter-spacing: 0.1em; }   /* 诗意大标题 */
.tracking-chinese { letter-spacing: 0.02em; } /* 中文正文 */
.tracking-tight { letter-spacing: -0.02em; }  /* 英文标题 */
.tracking-number { letter-spacing: 0.05em; }  /* 数字 */
```

### 3.5 段间距与缩进

```css
/* 段落样式 */
.echo-paragraph {
  margin-bottom: 1.5em;  /* 段间距 */
  text-indent: 2em;      /* 首行缩进两字符 */
}

/* 现代段落样式（无缩进） */
.echo-paragraph--modern {
  margin-bottom: 1.5em;
  text-indent: 0;
}

/* 段落间距系统 */
--paragraph-gap-sm: 1em;
--paragraph-gap-md: 1.5em;
--paragraph-gap-lg: 2em;
--paragraph-gap-poetic: 2.5em;  /* 诗意留白 */
```

---

## 四、微文案系统

### 4.1 按钮文案

| 功能 | 常规文案 | 诗意文案（推荐） | 场景 |
|------|----------|------------------|------|
| 进入应用 | 进入、开始 | **进入**、**启程** | 主入口 |
| 创建作品 | 创建、新建 | **落笔**、**挥毫** | 文学创作 |
| 生成内容 | 生成、制作 | **生成**、**幻化** | AI 功能 |
| 收藏/关注 | 收藏、关注 | **结缘**、**铭记** | 社交功能 |
| 购买 | 购买、下单 | **纳藏**、**珍藏** | 交易场景 |
| 分享 | 分享、转发 | **传颂**、**共赏** | 传播功能 |
| 保存 | 保存 | **存墨** | 草稿保存 |
| 删除 | 删除 | **归零** | 谨慎操作 |
| 确认 | 确定 | **如是** | 禅意确认 |
| 取消 | 取消 | **罢了** | 放弃操作 |

```css
/* 按钮文案样式 */
.echo-btn {
  font-family: var(--font-ui);
  font-size: var(--text-base);
  font-weight: 500;
  letter-spacing: 0.1em;  /* 中文按钮加字间距 */
}
```

### 4.2 提示文案

#### 空状态（Empty State）

| 场景 | 常规文案 | 诗意文案 |
|------|----------|----------|
| 无作品 | 暂无作品 | **此处尚待笔墨** |
| 无收藏 | 暂无收藏 | **结缘尚浅** |
| 无消息 | 暂无消息 | **静待佳音** |
| 无搜索结果 | 无搜索结果 | **未觅得踪迹** |
| 无网络 | 网络连接失败 | **与尘世暂隔** |

#### 错误提示

| 场景 | 常规文案 | 诗意文案 |
|------|----------|----------|
| 404 | 页面不存在 | **此路不通，请另寻他径** |
| 500 | 服务器错误 | **暂遇波澜，稍后再试** |
| 权限不足 | 无权限访问 | **此门未开** |
| 加载失败 | 加载失败 | **未能如期而至** |

#### 成功提示

| 场景 | 常规文案 | 诗意文案 |
|------|----------|----------|
| 保存成功 | 保存成功 | **已存墨宝** |
| 发布成功 | 发布成功 | **公之于世** |
| 购买成功 | 购买成功 | **已纳珍藏** |
| 关注成功 | 关注成功 | **已结善缘** |

### 4.3 导航文案

| 常规 | 诗意（推荐） | 说明 |
|------|--------------|------|
| 首页 | **缘起** | 一切开始的地方 |
| 市场 | **市集**、**淘宝** | 交易场所 |
| 创作 | **挥毫**、**落笔** | 创作空间 |
| 发现 | **觅迹**、**探幽** | 探索发现 |
| 我的 | **吾庐**、**己斋** | 个人中心 |
| 消息 | **尺素**、**音书** | 通讯往来 |
| 设置 | **调校** | 配置调整 |

### 4.4 时间表达

#### 传统时辰制（可选）

```javascript
// 时间映射
const timeExpressions = {
  // 时辰表达
  shichen: {
    '23:00-01:00': '子时',
    '01:00-03:00': '丑时',
    '03:00-05:00': '寅时',
    '05:00-07:00': '卯时', // 日出
    '07:00-09:00': '辰时',
    '09:00-11:00': '巳时',
    '11:00-13:00': '午时', // 日中
    '13:00-15:00': '未时',
    '15:00-17:00': '申时',
    '17:00-19:00': '酉时', // 日落
    '19:00-21:00': '戌时',
    '21:00-23:00': '亥时',
  },
  
  // 诗意相对时间
  poeticRelative: {
    justNow: '刚刚',
    minutesAgo: (n) => `${n}刻前`,  // 一刻 = 15分钟
    hoursAgo: (n) => `${n}时辰前`,
    today: '今日',
    yesterday: '昨日',
    daysAgo: (n) => `${n}日前`,
    lastMonth: '上月',
    monthsAgo: (n) => `${n}月前`,
    lastYear: '去岁',
    yearsAgo: (n) => `${n}年前`,
    ancient: '昔年',
  },
  
  // 季节表达
  seasons: {
    spring: '春',
    summer: '夏',
    autumn: '秋',
    winter: '冬',
    early: '初',
    mid: '仲',
    late: '暮',
  }
};

// 使用示例
// 2024年春 → 甲辰年初春
// 3天前 → 3日前
// 15分钟前 → 一刻前
```

#### 推荐方案：混合表达

```javascript
// 根据场景选择时间表达方式
function formatTime(date, style = 'mixed') {
  const now = new Date();
  const diff = now - date;
  
  if (style === 'poetic') {
    // 纯诗意表达
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}刻前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}时辰前`;
    if (diff < 172800000) return '昨日';
    // ...
  }
  
  if (style === 'mixed') {
    // 混合表达（推荐）
    if (diff < 86400000) {
      // 24小时内用时辰
      return getShichen(date);
    }
    // 其他用标准日期
    return formatStandardDate(date);
  }
}
```

---

## 五、诗意文案

### 5.1 Hero 区副标题

**方案一：生长主题**
```
主标题：ECHO
副标题：万物有声，皆可生长
辅助：在这里，每一份创作都是一颗种子
```

**方案二：三域融合**
```
主标题：ECHO
副标题：音生色，色成文，文载道
辅助：数字时代的创作栖息地
```

**方案三：极简诗意**
```
主标题：ECHO
副标题：声之所至，心之所向
辅助：留白
```

**方案四：动态副标题（随时间变化）**
```javascript
const heroSubtitles = [
  { time: '05:00-07:00', text: '日出而作，万物苏醒' },    // 卯时
  { time: '11:00-13:00', text: '日中为市，互通有无' },    // 午时
  { time: '17:00-19:00', text: '日落而思，静候知音' },    // 酉时
  { time: '21:00-23:00', text: '月入星河，灵感涌动' },    // 亥时
  { default: true, text: '万物有声，皆可生长' },
];
```

### 5.2 三域（音/色/文）描述文案

#### 音域 — 音乐

**短版本：**
```
声之所至，心之所向
每一音符，都是时间的纹路
```

**中版本：**
```
音域

声音是流动的建筑
在这里，每一首旋律都有归处
每一次聆听都是重逢

「余音绕梁，三日不绝」不再是传说
而是每一份创作的宿命
```

**俳句版本（十七音）：**
```
音落涟漪起
余韵悠悠入梦来
此声可待追
```

#### 色域 — 艺术

**短版本：**
```
一笔一世界，一色一乾坤
视觉的诗，无需翻译
```

**中版本：**
```
色域

色彩是光的书信
每一笔涂抹都是情绪的落款
在这里，看见看不见的世界

「丹青不知老将至」
创作让时光停驻
```

**俳句版本：**
```
墨色晕染处
留白亦是山河在
一笔一天地
```

#### 文域 — 文学

**短版本：**
```
字里行间，自有山河
每一段文字，都是灵魂的拓印
```

**中版本：**
```
文域

文字是思想的足迹
在这里，每一个字都有重量
每一段话都在寻找共鸣

「文章千古事，得失寸心知」
创作是与永恒的对话
```

**俳句版本：**
```
字字皆心血
落笔成章见真我
文以载道行
```

### 5.3 错误页面文案

#### 404 页面

**版本一（含蓄）：**
```
此路不通

您寻找的页面
如同那支走失的笔
暂时不知去向

[返回首页]  [重新寻找]
```

**版本二（诗意）：**
```
误入藕花深处

这片水域尚未开垦
请回渡口，另寻他路

[返回渡口]
```

**版本三（极简）：**
```
404

此处空白
恰如人生的某个转角
```

#### 500 页面

**版本一：**
```
暂遇波澜

服务器正在经历一场小型修行
请稍后再访，静待云开

[刷新重试]
```

**版本二：**
```
正在整理思绪

我们的系统需要片刻宁静
就像创作前的沉默

[稍后回来]
```

### 5.4 加载状态文案

**渐进式加载文案：**
```javascript
const loadingTexts = [
  '正在唤醒灵感...',
  '正在研磨笔墨...',
  '正在铺陈宣纸...',
  '正在落笔成文...',
  '正在装裱成册...',
];

// 或者更简洁的版本
const loadingTextsAlt = [
  '酝酿中...',
  '生长中...',
  '成形中...',
];
```

**带趣味性的加载：**
```
正在召唤神兽... 99%
正在给字句润色... 
正在等待灵感降临...
正在与服务器对视...
正在数羊...第42只
```

### 5.5 其他微文案

#### 版权相关

| 场景 | 文案 |
|------|------|
| 版权声明 | 「此作已纳于 ECHO 之墙，未经许可，不得拓印」 |
| 创作证明 | 「创作之印，始于 [日期]」 |
| 转让声明 | 「此作已易主，新主 [新所有者]」 |
| 授权使用 | 「获准观览，不可携走」 |

#### 社交互动

| 场景 | 文案 |
|------|------|
| 点赞 | 「击节赞叹」 |
| 评论 | 「题跋留言」 |
| 转发 | 「传颂」 |
| 打赏 | 「赐墨」 |
| 关注 | 「结缘」 |

---

## 六、完整 CSS 代码

```css
/* ============================================
   ECHO Design System - Typography
   字体与文案系统完整 CSS
   ============================================ */

/* ---- 1. 字体引入 ---- */
@import url('https://fonts.googleapis.com/css2?family=LXGW+WenKai:wght@300;400;700&family=Noto+Serif+SC:wght@300;400;500;600;700&family=Noto+Sans+SC:wght@300;400;500;700&family=Playfair+Display:wght@400;500;600;700&family=Lato:wght@300;400;700&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

/* ---- 2. 设计令牌 ---- */
:root {
  /* 字体族 */
  --font-display: 'LXGW WenKai', 'PingFang SC', cursive;
  --font-serif: 'Noto Serif SC', 'Source Han Serif SC', serif;
  --font-sans: 'Noto Sans SC', 'Source Han Sans SC', 'PingFang SC', sans-serif;
  --font-en-display: 'Playfair Display', Georgia, serif;
  --font-en-body: 'Lato', sans-serif;
  --font-en-ui: 'Inter', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
  
  /* 字号 */
  --text-xs: 0.75rem;      /* 12px */
  --text-sm: 0.875rem;     /* 14px */
  --text-base: 1rem;       /* 16px */
  --text-lg: 1.125rem;     /* 18px */
  --text-xl: 1.25rem;      /* 20px */
  --text-2xl: 1.5rem;      /* 24px */
  --text-3xl: 1.875rem;    /* 30px */
  --text-4xl: 2.25rem;     /* 36px */
  --text-5xl: 3rem;        /* 48px */
  --text-hero: clamp(2.25rem, 5vw, 4rem);
  
  /* 行高 */
  --leading-tight: 1.2;
  --leading-snug: 1.4;
  --leading-normal: 1.6;
  --leading-relaxed: 1.8;
  --leading-loose: 2.0;
  --leading-poetic: 2.5;
  
  /* 字间距 */
  --tracking-tight: -0.02em;
  --tracking-normal: 0;
  --tracking-wide: 0.02em;
  --tracking-poetic: 0.1em;
}

/* ---- 3. 基础样式 ---- */
body {
  font-family: var(--font-serif);
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
  color: #1a1a1a;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* ---- 4. 标题系统 ---- */
.echo-title {
  font-family: var(--font-display);
  font-weight: 400;
  line-height: var(--leading-tight);
}

.echo-title--hero {
  font-size: var(--text-hero);
  font-weight: 300;
  letter-spacing: var(--tracking-poetic);
}

.echo-title--page {
  font-size: var(--text-4xl);
  letter-spacing: 0.05em;
}

.echo-title--section {
  font-size: var(--text-2xl);
}

.echo-title--card {
  font-size: var(--text-xl);
  font-weight: 500;
}

/* ---- 5. 正文系统 ---- */
.echo-body {
  font-family: var(--font-serif);
  font-size: var(--text-base);
  line-height: var(--leading-relaxed);
}

.echo-body--large {
  font-size: var(--text-lg);
  line-height: var(--leading-loose);
}

.echo-body--poetic {
  font-size: var(--text-lg);
  line-height: var(--leading-poetic);
  text-indent: 2em;
}

/* ---- 6. UI 文案 ---- */
.echo-ui {
  font-family: var(--font-sans);
  letter-spacing: var(--tracking-wide);
}

.echo-ui--label {
  font-size: var(--text-sm);
  font-weight: 500;
}

.echo-ui--button {
  font-size: var(--text-base);
  font-weight: 500;
  letter-spacing: 0.1em;
}

/* ---- 7. 辅助文字 ---- */
.echo-caption {
  font-size: var(--text-xs);
  color: #666;
}

.echo-caption--time {
  font-family: var(--font-mono);
  font-size: var(--text-xs);
  letter-spacing: var(--tracking-wide);
}

/* ---- 8. 特殊样式 ---- */
.echo-poetic {
  font-family: var(--font-display);
  font-weight: 300;
  letter-spacing: var(--tracking-poetic);
  line-height: var(--leading-poetic);
}

.echo-quote {
  font-family: var(--font-serif);
  font-size: var(--text-xl);
  font-style: italic;
  padding-left: 1.5em;
  border-left: 2px solid #ccc;
}

/* ---- 9. 三域专属样式 ---- */
.echo-realm--sound {
  /* 音域 - 流动感 */
  font-family: var(--font-display);
  letter-spacing: 0.08em;
}

.echo-realm--color {
  /* 色域 - 视觉张力 */
  font-family: var(--font-display);
  font-weight: 500;
}

.echo-realm--word {
  /* 文域 - 书卷气 */
  font-family: var(--font-serif);
  line-height: var(--leading-loose);
}

/* ---- 10. 响应式调整 ---- */
@media (max-width: 768px) {
  :root {
    --text-hero: clamp(1.875rem, 8vw, 2.5rem);
  }
  
  body {
    line-height: 1.75;
  }
  
  .echo-poetic {
    letter-spacing: 0.05em;
  }
}

/* ---- 11. 深色模式 ---- */
@media (prefers-color-scheme: dark) {
  body {
    color: #e0e0e0;
  }
  
  .echo-caption {
    color: #999;
  }
}

/* ---- 12. 打印样式 ---- */
@media print {
  body {
    font-family: var(--font-serif);
    font-size: 12pt;
    line-height: 1.5;
  }
  
  .echo-title {
    font-family: Georgia, serif;
  }
}
```

---

## 七、使用示例

### HTML 示例

```html
<!-- Hero 区域 -->
<section class="echo-hero">
  <h1 class="echo-title echo-title--hero">ECHO</h1>
  <p class="echo-poetic">万物有声，皆可生长</p>
  <button class="echo-btn echo-ui echo-ui--button">进入</button>
</section>

<!-- 三域展示 -->
<section class="echo-realms">
  <article class="echo-realm echo-realm--sound">
    <h2 class="echo-title echo-title--section">音</h2>
    <p class="echo-body echo-body--poetic">
      声之所至，心之所向
    </p>
  </article>
  
  <article class="echo-realm echo-realm--color">
    <h2 class="echo-title echo-title--section">色</h2>
    <p class="echo-body echo-body--poetic">
      一笔一世界，一色一乾坤
    </p>
  </article>
  
  <article class="echo-realm echo-realm--word">
    <h2 class="echo-title echo-title--section">文</h2>
    <p class="echo-body echo-body--poetic">
      字里行间，自有山河
    </p>
  </article>
</section>

<!-- 空状态 -->
<div class="echo-empty">
  <p class="echo-ui echo-ui--label">此处尚待笔墨</p>
  <button class="echo-btn">落笔</button>
</div>

<!-- 404 页面 -->
<div class="echo-error-404">
  <h1 class="echo-title echo-title--page">此路不通</h1>
  <p class="echo-body">您寻找的页面，如同那支走失的笔，暂时不知去向</p>
  <a href="/" class="echo-link">返回渡口</a>
</div>
```

---

## 八、文案使用指南

### 8.1 语气建议

| 场景 | 语气 | 示例 |
|------|------|------|
| 欢迎/引导 | 温暖、邀请 | 「欢迎归来」而非「欢迎回来」 |
| 操作确认 | 诗意、优雅 | 「如是」而非「确定」 |
| 错误提示 | 含蓄、引导 | 「此路不通」而非「出错了」 |
| 空状态 | 鼓励、留白 | 「此处尚待笔墨」而非「没有内容」 |
| 成功反馈 | 克制、确认 | 「已存墨宝」而非「保存成功！」 |

### 8.2 留白原则

- **文案长度**：能短则短，一字千金
- **信息密度**：允许留白，呼吸感比填满更重要
- **节奏控制**：长短句交错，如诗词般有韵律

### 8.3 文言与白话平衡

**推荐比例**：
- 核心文案：30% 文言 + 70% 白话
- 导航文案：可适度文言化
- 说明文案：以白话为主，文言点缀
- 错误文案：含蓄表达，避免直白

---

## 九、字体授权说明

| 字体 | 授权 | 说明 |
|------|------|------|
| 霞鹜文楷 (LXGW WenKai) | SIL Open Font License 1.1 | 免费商用 |
| 思源宋体 (Source Han Serif) | SIL Open Font License 1.1 | 免费商用 |
| 思源黑体 (Source Han Sans) | SIL Open Font License 1.1 | 免费商用 |
| Playfair Display | SIL Open Font License 1.1 | 免费商用 |
| Lato | SIL Open Font License 1.1 | 免费商用 |
| Inter | SIL Open Font License 1.1 | 免费商用 |
| JetBrains Mono | SIL Open Font License 1.1 | 免费商用 |

---

> 「一字千金，一句顶十句」
> 
> ECHO 的字体与文案设计，追求的不是炫技，而是那份恰到好处的诗意——让用户会心一笑，让留白也是一种文字。
