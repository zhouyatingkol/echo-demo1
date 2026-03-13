# ECHO Protocol V4 - UI 设计系统

## 🎨 设计概览

基于现有页面提取的统一设计系统，整合 17+ 页面为一致的视觉体验。

---

## 📐 设计原则

1. **一致性** - 所有页面使用相同的设计语言
2. **简洁性** - 清晰的视觉层次，减少认知负担
3. **响应式** - 完美适配桌面、平板、移动端
4. **Web3 原生** - 暗色主题，科技感，符合加密用户习惯

---

## 🌈 色彩系统

### 主色调
```css
--primary: #667eea;          /* 主色 - 紫色 */
--primary-dark: #764ba2;     /* 深色渐变 */
--primary-light: #8b5cf6;    /* 亮色 */
```

### 背景色
```css
--bg-primary: #0a0a0a;       /* 主背景 - 深黑 */
--bg-secondary: #1a1a2e;     /* 次背景 - 深蓝黑 */
--bg-card: #16162a;          /* 卡片背景 */
--bg-hover: #252545;         /* 悬停背景 */
```

### 文字色
```css
--text-primary: #ffffff;     /* 主文字 */
--text-secondary: #a0a0b0;   /* 次文字 */
--text-muted: #6b7280;       /* 辅助文字 */
--text-accent: #00d4ff;      /* 强调文字 - 青色 */
```

### 状态色
```css
--success: #10b981;          /* 成功 - 绿 */
--warning: #f59e0b;          /* 警告 - 黄 */
--error: #ef4444;            /* 错误 - 红 */
--info: #3b82f6;             /* 信息 - 蓝 */
```

### 渐变
```css
--gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--gradient-hero: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
--gradient-card: linear-gradient(145deg, #16162a 0%, #1e1e3a 100%);
```

---

## 🔤 字体系统

### 字体栈
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
```

### 字号规范
| 名称 | 大小 | 用途 |
|------|------|------|
| H1 | 2.5rem (40px) | 页面主标题 |
| H2 | 2rem (32px) | 区块标题 |
| H3 | 1.5rem (24px) | 卡片标题 |
| H4 | 1.25rem (20px) | 小标题 |
| Body | 1rem (16px) | 正文 |
| Small | 0.875rem (14px) | 辅助文字 |
| Caption | 0.75rem (12px) | 标注 |

### 字重
- **Bold** (700) - 标题、强调
- **Semibold** (600) - 按钮、标签
- **Medium** (500) - 导航、卡片标题
- **Regular** (400) - 正文

---

## 📏 间距系统

### 基础单位: 4px

| Token | 值 | 用途 |
|-------|-----|------|
| xs | 4px | 图标间距 |
| sm | 8px | 紧凑元素间距 |
| md | 16px | 标准间距 |
| lg | 24px | 区块内间距 |
| xl | 32px | 区块间距 |
| 2xl | 48px | 大区块间距 |
| 3xl | 64px | 页面间距 |

### 布局规范
- **容器最大宽度**: 1400px
- **页面边距**: 24px (桌面), 16px (移动)
- **卡片内边距**: 24px
- **按钮内边距**: 12px 24px
- **输入框高度**: 48px
- **导航栏高度**: 64px

---

## 🧩 组件库

### 1. 按钮 Button

**Primary Button**
```
背景: gradient-primary
文字: white
圆角: 8px
内边距: 12px 24px
字体: 14px semibold
悬停: 亮度提升 + 阴影
```

**Secondary Button**
```
背景: transparent
边框: 1px solid rgba(255,255,255,0.2)
文字: white
圆角: 8px
悬停: bg-hover
```

**Ghost Button**
```
背景: transparent
文字: text-secondary
悬停: text-primary
```

### 2. 卡片 Card

**Asset Card**
```
背景: bg-card
圆角: 16px
内边距: 0 (图片区) + 24px (内容区)
阴影: 0 4px 20px rgba(0,0,0,0.3)
悬停: transform: translateY(-4px)
```

**Info Card**
```
背景: bg-card
边框: 1px solid rgba(255,255,255,0.1)
圆角: 12px
内边距: 24px
```

### 3. 输入框 Input

**Text Input**
```
背景: bg-secondary
边框: 1px solid rgba(255,255,255,0.1)
圆角: 8px
高度: 48px
内边距: 0 16px
聚焦: border-color: primary
```

**Select**
```
同 Text Input
下拉箭头图标
选项悬停: bg-hover
```

### 4. 导航 Navigation

**Top Navbar**
```
高度: 64px
背景: rgba(10,10,26,0.95) + backdrop-blur
边框: 1px solid rgba(255,255,255,0.1)
位置: fixed top
内容: Logo | 主导航 | 钱包按钮
```

**Nav Link**
```
颜色: text-secondary
悬停: text-primary
激活: primary + 下划线
内边距: 8px 16px
圆角: 8px
```

**Sidebar (Creator)**
```
宽度: 240px
背景: bg-secondary
边框: 1px solid rgba(255,255,255,0.1)
位置: fixed left
内容: 菜单项 + 快捷操作
```

### 5. 标签 Tag

```
背景: rgba(102,126,234,0.2)
文字: primary
边框: 1px solid rgba(102,126,234,0.3)
圆角: 20px (pill)
内边距: 4px 12px
字号: 12px
```

### 6. 徽章 Badge

```
背景: error (红色圆点)
位置: 右上角
大小: 8px
用途: 未读通知
```

---

## 🖼️ 页面布局

### 标准页面结构
```
┌─────────────────────────────────────────┐
│           Top Navbar (64px)             │
├─────────────────────────────────────────┤
│                                         │
│         Main Content Area               │
│         (max-width: 1400px)             │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │         Page Header             │   │
│  │   标题 + 副标题 + 操作按钮       │   │
│  └─────────────────────────────────┘   │
│                                         │
│  ┌─────────────────────────────────┐   │
│  │         Content Grid            │   │
│  │     卡片网格 / 表格 / 表单       │   │
│  └─────────────────────────────────┘   │
│                                         │
├─────────────────────────────────────────┤
│              Footer                     │
└─────────────────────────────────────────┘
```

### 创作者中心布局
```
┌─────────────────────────────────────────┐
│           Top Navbar                    │
├──────────┬──────────────────────────────┤
│          │                              │
│ Sidebar  │      Main Content            │
│ (240px)  │      (剩余宽度)              │
│          │                              │
│ - 仪表盘  │                              │
│ - 上传    │                              │
│ - 作品    │                              │
│ - 收益    │                              │
│          │                              │
└──────────┴──────────────────────────────┘
```

---

## 📱 响应式断点

```css
/* 移动端 */
@media (max-width: 768px) {
  /* 单列布局 */
  /* 隐藏侧边栏 */
  /* 底部导航 */
}

/* 平板端 */
@media (min-width: 769px) and (max-width: 1023px) {
  /* 2列网格 */
  /* 侧边栏可折叠 */
}

/* 桌面端 */
@media (min-width: 1024px) {
  /* 3-4列网格 */
  /* 完整侧边栏 */
}

/* 大屏 */
@media (min-width: 1400px) {
  /* 最大宽度限制 */
}
```

---

## 🎵 Web3 特殊组件

### 1. 钱包连接按钮
```
未连接: "连接钱包" (Primary Button)
已连接: 地址缩写 + 网络图标 (Dropdown)
```

### 2. 交易状态指示器
```
Pending: 旋转加载 + "处理中..."
Success: ✅ + "成功"
Error: ❌ + "失败"
```

### 3. 资产卡片特殊元素
```
- 音频波形占位图
- 价格标签 (MEER)
- License 类型标签
- 创作者头像 + 名称
```

### 4. 授权购买卡片
```
- 三模式切换 (买断/按次/限时)
- 使用场景选择
- 实时价格计算
- 购买按钮
```

---

## 🎯 设计交付清单

### 已完成 ✅
- [x] 色彩系统
- [x] 字体系统
- [x] 间距系统
- [x] 组件库 (Button, Card, Input, Nav, Tag)
- [x] 页面布局规范
- [x] 响应式断点
- [x] Web3 特殊组件

### 下一步
- [ ] 创建 Figma 设计稿 (可选)
- [ ] 编写 Tailwind 配置
- [ ] 开发组件 Storybook

---

**设计系统完成！可与架构设计配合进入开发阶段。** 🎨
