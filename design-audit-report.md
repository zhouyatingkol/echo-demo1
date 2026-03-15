# ECHO 项目设计一致性检查报告

**检查时间**: 2026-03-15  
**检查范围**: echo-demo/pages/ 目录下所有 HTML 文件  
**设计规范来源**: ECHO-设计规范.md, echo-design-system.html, echo-typography.css

---

## 一、设计规范标准（应遵循）

### 1. 色彩系统
```css
--bg-primary: #F8F6F1;      /* 宣纸质感 */
--bg-secondary: #F2EFE8;
--ink-deep: #1A1A1A;        /* 墨色 */
--ink-medium: #4A4A4A;
--ink-light: #7A6E5F;
--gold-primary: #B89B6C;    /* 宋金 */
--seal-red: #A03020;        /* 朱红 */
--realm-sound: #8B9DC3;     /* 青瓷 */
--realm-color: #C9A9A6;     /* 粉瓷 */
--realm-text: #7A8B7C;      /* 墨绿 */
```

### 2. 字体系统
- **标题**: 'LXGW WenKai', 'Noto Serif SC'
- **正文**: 'Noto Serif SC', serif
- **UI**: 'Noto Sans SC', sans-serif

### 3. 动画规范
- **快速反馈**: 0.3s ease
- **标准过渡**: 0.4s ease / 0.4s cubic-bezier(0.4, 0, 0.2, 1)
- **仪式感**: 0.8s cubic-bezier(0.4, 0, 0.2, 1)

### 4. 间距规范
- **页面边距**: 8vw / 10vw
- **组件间距**: 遵循设计系统变量

---

## 二、不一致项清单

### ❌ 严重不一致

#### 1. 色彩系统混乱

| 页面 | 问题 | 当前值 | 标准值 |
|------|------|--------|--------|
| `discover.html` | 使用完全不同的深色主题 | `#0a0a0a`, `#00d4ff`, `#7b2cbf` | `#F8F6F1`, `#B89B6C` |
| `dashboard.html` | 使用深色主题 | `#0a0a0a`, `#1a1a2e` | `#F8F6F1` |
| `comments-demo.html` | 使用系统字体+深色 | 系统默认 | 东方风格 |
| `v4-demo.html` | 混合使用深色和浅色 | `#0a0a0a` | `#F8F6F1` |

**影响范围**: 4个页面完全偏离设计规范

#### 2. 硬编码颜色值（未使用CSS变量）

```
index.html:
  - color: #3A3530 (应使用 --ink-deep: #1A1A1A)
  - color: #7A6E5F (应使用 --ink-light: #7A6E5F ✓)
  - background: #C9B896 (应使用 --gold-primary: #B89B6C)

creator.html:
  - color: #3A3530 (应使用 --ink-deep: #1A1A1A)
  - color: #7A6E5F (应使用 --ink-light: #7A6E5F ✓)
  - color: #5A5045 (无对应规范)
  - background: #7A6E5F (应使用CSS变量)
  
login.html:
  - 使用了正确的CSS变量 ✓
```

**影响范围**: 至少 8 处硬编码颜色

#### 3. 字体不一致

| 页面 | 当前字体 | 标准字体 |
|------|----------|----------|
| `discover.html` | `-apple-system, BlinkMacSystemFont, 'Segoe UI'` | `Noto Serif SC` |
| `dashboard.html` | `-apple-system, BlinkMacSystemFont, 'Segoe UI'` | `Noto Serif SC` |
| `comments-demo.html` | 系统字体 | `Noto Serif SC` |
| `work-detail.html` | `'Cormorant Garamond', 'Noto Serif SC'` | `'LXGW WenKai', 'Noto Serif SC'` |

**影响范围**: 4个页面使用非标准字体

### ⚠️ 中等不一致

#### 4. 导航栏结构不统一

发现问题：
- `index.html`: 完整的navbar组件，60px高度，有滚动效果
- `login.html`: 相同样式的navbar
- `creator.html`: 相同样式的navbar
- `discover.html`: 内联样式导航，64px高度，深色主题
- `dashboard.html`: 内联样式导航，64px高度，深色主题
- `work-detail.html`: 简化导航栏，无滚动效果
- `profile.html`: 缺少导航栏代码

**不一致点**:
1. 高度不一致: 60px vs 64px
2. 背景处理不一致: 透明渐变 vs 固定颜色
3. 品牌标识: ECHO vs 🎵 ECHO Music
4. 导航项: 不同页面的链接不一致

#### 5. 按钮样式不一致

| 页面 | 按钮样式 | 标准样式 |
|------|----------|----------|
| `discover.html` | 渐变背景 `#00d4ff` → `#7b2cbf` | 宋瓷质感 `#B89B6C` |
| `dashboard.html` | 渐变背景 | 宋瓷质感 |
| `index.html` | 边框按钮，hover变金色 | ✓ 符合东方风格 |
| `creator.html` | 金色边框按钮 | ✓ 符合规范 |

#### 6. 过渡时间不一致

```
过渡时间统计:
- 0.3s ease: discover.html, comments-demo.html (5处)
- 0.4s ease: index.html, login.html, creator.html (符合规范)
- 0.5s ease: compare/ 目录下文件 (5处)
- 0.6s cubic-bezier: compare/refined.html (3处)
- 0.8s ease: index.html, login.html (导航滚动效果，符合规范)
```

#### 7. 页面边距不一致

```
边距统计:
- 5vw: poetic.html, art.html
- 6vw: compare-motion.html (移动端), refined.html (移动端)
- 8vw: shoujin.html, caoshu.html
- 10vw: refined.html, compare-motion.html, final.html (符合规范)
- 12vw: compare-cool.html
```

**标准**: 桌面端 10vw，移动端 6vw-8vw

### 📝 轻微不一致

#### 8. CSS变量定义差异

不同页面定义了不同的变量名：

```css
/* login.html - 完整规范 */
--bg-primary: #F8F6F1;
--ink-deep: #1A1A1A;
--gold-primary: #B89B6C;

/* creator.html - 增加了三域颜色 */
--realm-sound: #8B9DC3;
--realm-color: #C9A9A6;
--realm-text: #7A8B7C;

/* work-detail.html (Tailwind) */
'ink': '#1a1a1a',
'paper': '#f7f4ed',
'gold': '#c9a86c',
```

#### 9. 圆角不一致

- `echo-design-system.html`: `--radius: 1px` (极简)
- `login.html`: `border-radius: 2px`
- `discover.html`: `border-radius: 8px` / `16px` (现代风格)

---

## 三、修复建议

### 🔴 优先级：高

#### 1. 统一色彩系统
```css
/* 在所有页面头部统一引入 */
:root {
  --bg-primary: #F8F6F1;
  --bg-secondary: #F2EFE8;
  --bg-tertiary: #EBE7DD;
  --ink-deep: #1A1A1A;
  --ink-medium: #4A4A4A;
  --ink-light: #7A6E5F;
  --ink-faint: #B5B5B5;
  --gold-primary: #B89B6C;
  --gold-light: #D4C4A8;
  --realm-sound: #8B9DC3;
  --realm-color: #C9A9A6;
  --realm-text: #7A8B7C;
  --seal-red: #A03020;
}
```

**需修复文件**:
- [ ] `discover.html` - 移除深色主题，改为宣纸质感
- [ ] `dashboard.html` - 移除深色主题
- [ ] `comments-demo.html` - 应用东方风格
- [ ] `v4-demo.html` - 统一为浅色主题

#### 2. 创建统一导航栏组件

创建 `components/navbar.html`:
```html
<nav class="navbar">
  <a href="/" class="navbar__brand">
    <span class="navbar__logo">ECHO</span>
  </a>
  <div class="navbar__nav">
    <a href="/market" class="navbar__link">市场</a>
    <a href="/creator" class="navbar__link">创作</a>
    <a href="/docs" class="navbar__link">文档</a>
  </div>
  <div class="navbar__actions">
    <!-- 用户区域 -->
  </div>
</nav>
```

**需修复文件**:
- [ ] `discover.html` - 替换为统一导航
- [ ] `dashboard.html` - 替换为统一导航
- [ ] `work-detail.html` - 使用统一导航

### 🟡 优先级：中

#### 3. 统一字体
在所有页面头部添加：
```html
<link href="https://fonts.googleapis.com/css2?family=LXGW+WenKai:wght@300;400;700&family=Noto+Serif+SC:wght@300;400;500&display=swap" rel="stylesheet">
```

#### 4. 统一过渡时间
建议统一为：
```css
--transition-fast: 0.3s ease;
--transition-medium: 0.4s ease;
--transition-slow: 0.8s cubic-bezier(0.4, 0, 0.2, 1);
```

#### 5. 统一页面边距
```css
/* 桌面端 */
padding: 8vh 10vw;

/* 移动端 */
@media (max-width: 768px) {
  padding: 6vh 6vw;
}
```

### 🟢 优先级：低

#### 6. 提取公共CSS文件
创建 `echo-demo/css/global.css`:
```css
@import url('echo-typography.css');

:root {
  /* 色彩系统 */
  /* 字体系统 */
  /* 间距系统 */
  /* 动画系统 */
}

/* 导航栏样式 */
/* 按钮样式 */
/* 卡片样式 */
```

---

## 四、设计通过项 ✅

### 符合规范的页面

1. **login.html** 
   - ✅ 使用正确的CSS变量
   - ✅ 使用标准字体
   - ✅ 使用正确的过渡时间
   - ✅ 东方风格一致

2. **index.html** (主要部分)
   - ✅ 导航栏样式正确
   - ✅ 使用Noto Serif SC
   - ✅ 过渡时间正确

3. **creator.html** (主要部分)
   - ✅ CSS变量定义完整
   - ✅ 包含三域颜色
   - ✅ 东方风格正确

4. **echo-design-system.html** (参考文件)
   - ✅ 完整的组件规范
   - ✅ 宋瓷色彩系统
   - ✅ 图标系统规范

---

## 五、总结

### 问题统计

| 类别 | 严重 | 中等 | 轻微 | 总计 |
|------|------|------|------|------|
| 色彩不一致 | 4 | 0 | 0 | 4 |
| 字体不一致 | 4 | 0 | 0 | 4 |
| 导航栏不一致 | 0 | 4 | 0 | 4 |
| 按钮不一致 | 0 | 2 | 0 | 2 |
| 动画不一致 | 0 | 5 | 0 | 5 |
| 间距不一致 | 0 | 4 | 0 | 4 |
| **总计** | **8** | **15** | **0** | **23** |

### 建议执行顺序

1. **第一周**: 修复色彩系统（4个页面）
2. **第二周**: 统一导航栏组件
3. **第三周**: 统一字体和过渡时间
4. **第四周**: 提取公共CSS，统一间距

---

*报告生成时间: 2026-03-15*  
*检查员: ECHO 设计一致性检查系统*
