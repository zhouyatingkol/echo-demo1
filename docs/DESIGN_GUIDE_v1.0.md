# ECHO 设计规范 v1.0

## 稳定版本记录
**日期**: 2026-03-15  
**版本**: v1.0-stable  
**备注**: 导航栏与 Hero 区域统一规范

---

## 1. 页面结构规范

### 通用结构
```html
<body>
    <!-- 全页纹理背景 -->
    <div class="page-texture"></div>
    
    <!-- 导航栏 -->
    <nav class="navbar">...</nav>
    
    <!-- 主内容 -->
    <main>
        <section class="hero">...</section>
    </main>
</body>
```

### 全页纹理背景
```css
.page-texture {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 0;
    opacity: 0.4;
    background-image: url("data:image/svg+xml,..."); /* 宣纸纹理 */
}
```

---

## 2. 导航栏规范

### 基础样式
```css
.navbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 60px;
    z-index: 1000;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 clamp(24px, 5vw, 80px);
    background: transparent;
    transition: background 0.8s cubic-bezier(0.4, 0, 0.2, 1),
                box-shadow 0.8s ease,
                backdrop-filter 0.8s ease;
}

.navbar.is-scrolled {
    background: rgba(248, 246, 241, 0.92);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    box-shadow: 0 1px 0 rgba(122, 110, 95, 0.06);
}
```

### 导航链接
```css
.navbar__link {
    position: relative;
    font-family: var(--font-serif);
    font-size: 1rem;
    font-weight: 400;
    color: var(--ink-light);
    text-decoration: none;
    letter-spacing: 0.3em;
    padding: 0.5rem 0;
    transition: color 0.4s ease;
}

.navbar__nav {
    display: flex;
    align-items: center;
    gap: 3rem;
    margin: 0 auto;
    padding: 0 2rem;
}
```

---

## 3. Hero 区域规范

### Hero 容器
```css
.hero {
    padding: 140px 10vw 6vh;
    text-align: center;
    position: relative;
    overflow: hidden;
}
```

**关键值**:
- `padding-top: 140px` - 为导航栏(60px) + 呼吸空间(80px)
- `padding-bottom: 6vh` - 与下一区域衔接
- `padding-left/right: 10vw` - 响应式边距

### 标题样式
```css
.hero-title {
    font-family: var(--font-display);
    font-size: 2.8rem;
    font-weight: 400;
    letter-spacing: 0.3em;
    color: var(--ink-deep);
    margin-bottom: 16px;
    position: relative;
    z-index: 2;
}
```

### 副标题样式
```css
.hero-subtitle {
    font-family: var(--font-serif);
    font-size: 0.95rem;
    color: var(--ink-light);
    letter-spacing: 0.5em;
    font-weight: 300;
    margin-top: 2.5rem;
    position: relative;
    z-index: 2;
}
```

---

## 4. 颜色变量

```css
:root {
    /* 宣纸质感 */
    --bg-primary: #F8F6F1;
    --bg-secondary: #F2EFE8;
    --bg-tertiary: #EBE7DD;

    /* 四阶墨色 */
    --ink-deep: #1A1A1A;
    --ink-medium: #4A4A4A;
    --ink-light: #7A6E5F;
    --ink-faint: #B5B5B5;

    /* 宋金 */
    --gold-primary: #B89B6C;
    --gold-light: #D4C4A8;

    /* 朱红 */
    --vermilion: #A03020;
    --seal-red: #A03020;

    /* 字体 */
    --font-display: 'LXGW WenKai', cursive;
    --font-serif: 'Noto Serif SC', serif;
}
```

---

## 5. HTML 基准

```css
html {
    font-size: 20px;
    scroll-behavior: smooth;
}
```

---

## 6. 命名规范

| 区域 | 类名 |
|------|------|
| 页面容器 | `.creator-page`, `.docs-container` |
| Hero 区域 | `.hero` (首页), `.creator-hero`, `.docs-header` |
| 标题 | `.hero-title`, `.creator-title`, `.docs-title` |
| 副标题 | `.hero-subtitle`, `.creator-subtitle`, `.docs-subtitle` |

---

## 7. 注意事项

1. **导航栏色差**: 通过 `page-texture` 全页固定背景解决
2. **标题位置**: 统一使用 `padding-top: 140px` 控制与导航栏距离
3. **z-index 层级**: 纹理 z-index: 0, 内容 z-index: 2, 导航栏 z-index: 1000
4. **响应式**: 使用 `clamp()` 和 `vh/vw` 单位

---

## 相关文件

- `/pages/index.html` - 首页（参考实现）
- `/pages/marketplace.html` - 集页面
- `/pages/creator.html` - 铸页面
- `/pages/docs.html` - 典页面
