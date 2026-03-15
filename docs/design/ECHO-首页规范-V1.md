# ECHO 首页设计规范总结

> 首页已打磨定稿，本规范供其他页面复用。

---

## 一、色彩系统

### 基础色
| 名称 | 色值 | 用途 |
|------|------|------|
| **宣纸底色** | #F8F6F1 | 页面主背景 |
| **浓墨** | #1A1A1A | 主文字 |
| **宋金** | #B89B6C | 强调、hover、装饰线 |
| **朱红** | #A03020 | 印章、重要提示 |

### 三域色（卡片背景）
| 域 | 色值 | 名称 |
|----|------|------|
| **音** | #8B9DC3 | 青瓷 |
| **色** | #C9A9A6 | 粉瓷 |
| **文** | #7A8B7C | 蟹壳青 |

**用法**：纯色铺满卡片背景，文字/图标用白色 rgba(255,255,255,0.95)

---

## 二、字体系统

| 元素 | 字体 | 字重 | 字间距 |
|------|------|------|--------|
| **大标题** | 霞鹜文楷 | 400 | 0.15em |
| **导航** | 霞鹜文楷 | 400 | 0.2em |
| **正文** | 霞鹜文楷 | 400 | 0.1em |
| **英文/数字** | Inter | 300 | 0.05em |

---

## 三、文案风格

### 核心原则
- **单字优先**：境/集/典/吾
- **动词克制**：生/化/入/归
- **避免西化词汇**：不用「生成」「创建」「市场」

### 已定稿文案
```
导航：境 | 集 | 典 | 入链

Hero：万物有灵，皆可生长

关于框：非物，乃灵
关于正文：随用而生，随流而长 / 归于你，不止于你

CTA：生此 ECHO
CTA按钮：采集

三生：
- 音：声至心随
- 色：一色天地
- 文：字间山河
```

---

## 四、组件规范

### 1. 印章框
```css
.about-seal {
    display: inline-block;
    padding: 0.8rem 2rem;
    border: 1px solid rgba(160, 48, 32, 0.4);
    border-radius: 2px;
    color: #A03020;
    font-size: 1.2rem;
    letter-spacing: 0.2em;
}
```

### 2. 三域卡片
```css
.feature-card {
    text-align: center;
    padding: 3rem 2rem;
    border-radius: 2px;
    transition: transform 0.8s ease;
}

.feature-card--sound { background: #8B9DC3; }
.feature-card--color { background: #C9A9A6; }
.feature-card--text  { background: #7A8B7C; }
```

### 3. 按钮
```css
.cta-btn {
    display: inline-block;
    padding: 1rem 3rem;
    border: 0.5px solid rgba(26, 26, 26, 0.3);
    font-family: var(--font-display);
    font-size: 0.9rem;
    letter-spacing: 0.3em;
    color: var(--ink-primary);
    transition: all 0.6s ease;
}
```

---

## 五、动效规范

| 效果 | 时长 | 缓动 |
|------|------|------|
| **hover 位移** | 0.8s | cubic-bezier(0.4, 0, 0.2, 1) |
| **hover 透明度** | 0.6s | ease |
| **导航背景渐显** | 0.4s | ease |
| **下划线滑入** | 0.3s | ease |

---

## 六、页面结构模板

```html
<!-- 标准页面结构 -->
<nav>境 | 集 | 典 | 入链</nav>

<section class="hero">
    <h1>大标题</h1>
    <p>副文案</p>
    <a class="btn">按钮</a>
</section>

<section class="features">
    <h2>区块标题</h2>
    <!-- 卡片网格 -->
</section>

<section class="about">
    <span class="about-seal">框内文案</span>
    <p>正文</p>
</section>

<section class="cta">
    <h2>CTA标题</h2>
    <a class="cta-btn">按钮</a>
</section>
```

---

## 七、待完成页面清单

- [ ] marketplace.html (西市) - 应用设计系统
- [ ] asset-detail.html (资产详情) - 应用设计系统
- [ ] explore.html (三域探索) - 应用设计系统
- [ ] docs.html (文档/典) - 应用设计系统
- [ ] creator.html (创作者页面) - 新建
- [ ] profile.html (个人中心/吾境) - 新建

---

## 八、多Agent分工建议

| Agent | 任务 | 输出 |
|-------|------|------|
| **Agent-市场** | 打磨 marketplace.html | 西市页面 |
| **Agent-资产** | 打磨 asset-detail.html | 资产详情页 |
| **Agent-探索** | 打磨 explore.html | 三域探索页 |
| **Agent-文档** | 打磨 docs.html | 典籍页面 |
| **Agent-创作者** | 新建 creator.html | 创作者铸造页 |
| **Agent-个人** | 新建 profile.html | 个人中心页 |

每个 Agent 需遵循本规范，保持视觉统一。

---

*规范版本：V1.0*
*定稿日期：2026-03-14*
*首页参考：/pages/index.html*
