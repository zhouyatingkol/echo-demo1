# ECHO Protocol 组件库规范

## 1. 按钮 (Button)

### 1.1 按钮变体

#### 主按钮 (Primary)
```
┌───────────────────────────────┐
│     按钮文字                   │
└───────────────────────────────┘
```

**样式规范**:
```css
.btn-primary {
  padding: 12px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #ffffff;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(102, 126, 234, 0.4);
}

.btn-primary:active {
  transform: translateY(0);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}
```

#### 次按钮 (Secondary)
```css
.btn-secondary {
  padding: 12px 24px;
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
}

.btn-secondary:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(255, 255, 255, 0.3);
}
```

#### 文字按钮 (Text)
```css
.btn-text {
  padding: 8px 16px;
  background: transparent;
  color: #667eea;
  border: none;
}

.btn-text:hover {
  background: rgba(102, 126, 234, 0.1);
}
```

#### 危险按钮 (Danger)
```css
.btn-danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
}
```

### 1.2 按钮尺寸

| 尺寸 | 高度 | 内边距 | 字号 | 用途 |
|------|------|--------|------|------|
| xs | 28px | 8px 12px | 12px | 紧凑空间 |
| sm | 32px | 10px 16px | 13px | 次要操作 |
| md | 40px | 12px 20px | 14px | 默认 |
| lg | 48px | 14px 24px | 16px | 主要操作 |
| xl | 56px | 16px 32px | 18px | CTA |

### 1.3 按钮状态

| 状态 | 样式 |
|------|------|
| Default | 正常样式 |
| Hover | 上浮 + 阴影增强 |
| Active | 按下效果 |
| Focus | 外圈光晕 |
| Disabled | 降低透明度 |
| Loading | 显示 Spinner |

---

## 2. 卡片 (Card)

### 2.1 基础卡片

```
┌─────────────────────────────────────┐
│ ┌───────────────────────────────┐   │
│ │         封面/图片              │   │
│ └───────────────────────────────┘   │
│                                     │
│  标题文字                           │
│  描述文字...                        │
│                                     │
│  [操作按钮]              元信息     │
└─────────────────────────────────────┘
```

**样式规范**:
```css
.card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 0;
  overflow: hidden;
  transition: all 0.3s ease;
}

.card:hover {
  border-color: rgba(102, 126, 234, 0.3);
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.card-image {
  width: 100%;
  aspect-ratio: 1;
  object-fit: cover;
}

.card-content {
  padding: 16px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 8px;
}

.card-description {
  font-size: 14px;
  color: #888;
  line-height: 1.5;
}
```

### 2.2 音乐卡片 (Music Card)

**特殊元素**:
- 封面图片 (1:1)
- 播放按钮 (悬停显示)
- 流派标签
- 价格显示
- 收藏按钮

```css
.music-card {
  position: relative;
}

.music-card .play-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.music-card:hover .play-overlay {
  opacity: 1;
}

.music-card .play-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
}
```

### 2.3 数据卡片 (Stat Card)

```
┌─────────────────────────┐
│  图标    趋势指示        │
│          ▲ +23%         │
│                         │
│  数值                   │
│  1,234 MEER             │
│                         │
│  标签                   │
│  总收益                  │
└─────────────────────────┘
```

```css
.stat-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 24px;
}

.stat-card .stat-value {
  font-size: 32px;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
}

.stat-card .stat-label {
  font-size: 14px;
  color: #888;
  margin-top: 8px;
}

.stat-card .stat-trend {
  font-size: 14px;
  font-weight: 600;
}

.stat-card .stat-trend.up {
  color: #22c55e;
}

.stat-card .stat-trend.down {
  color: #ef4444;
}
```

---

## 3. 表单组件 (Form)

### 3.1 输入框 (Input)

```
标签文字
┌──────────────────────────────────────┐
│ 占位符文字                      │ 🔍 │
└──────────────────────────────────────┘
提示文字
```

**样式规范**:
```css
.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  margin-bottom: 8px;
}

.form-label .required {
  color: #ef4444;
  margin-left: 4px;
}

.form-input {
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #ffffff;
  font-size: 14px;
  transition: all 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #667eea;
  box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.2);
}

.form-input::placeholder {
  color: #6b6b7b;
}

.form-input:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.form-hint {
  font-size: 12px;
  color: #888;
  margin-top: 6px;
}

.form-error {
  font-size: 12px;
  color: #ef4444;
  margin-top: 6px;
}
```

**尺寸变体**:
| 尺寸 | 高度 | 内边距 | 字号 |
|------|------|--------|------|
| sm | 36px | 8px 12px | 13px |
| md | 44px | 12px 16px | 14px |
| lg | 52px | 14px 20px | 16px |

### 3.2 文本域 (Textarea)

```css
.form-textarea {
  min-height: 120px;
  resize: vertical;
}
```

### 3.3 选择框 (Select)

```css
.form-select {
  appearance: none;
  background-image: url("data:image/svg+xml,...");
  background-repeat: no-repeat;
  background-position: right 12px center;
  padding-right: 40px;
}
```

### 3.4 复选框 (Checkbox)

```
┌──────┐ 选项文字
│  ✓   │
└──────┘
```

```css
.checkbox-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
}

.checkbox-input {
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 4px;
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.checkbox-input:checked {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
}

.checkbox-label {
  font-size: 14px;
  color: #ffffff;
}
```

### 3.5 开关 (Switch)

```
┌─────────────────┐
│      ●───────   │  (关闭)
│  ───────●       │  (开启)
└─────────────────┘
```

```css
.switch {
  width: 44px;
  height: 24px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: background 0.3s ease;
}

.switch::after {
  content: '';
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background: white;
  border-radius: 50%;
  transition: transform 0.3s ease;
}

.switch.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.switch.active::after {
  transform: translateX(20px);
}
```

---

## 4. 导航组件 (Navigation)

### 4.1 顶部导航 (Navbar)

```css
.navbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 64px;
  background: rgba(10, 10, 26, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 1000;
}

.navbar-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 20px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.navbar-logo {
  font-size: 24px;
  font-weight: bold;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  text-decoration: none;
}

.navbar-links {
  display: flex;
  gap: 8px;
}

.navbar-link {
  padding: 8px 16px;
  color: #888;
  text-decoration: none;
  border-radius: 8px;
  font-size: 14px;
  transition: all 0.3s ease;
}

.navbar-link:hover,
.navbar-link.active {
  color: #00d4ff;
  background: rgba(0, 212, 255, 0.1);
}
```

### 4.2 侧边栏 (Sidebar)

```css
.sidebar {
  width: 240px;
  height: calc(100vh - 64px);
  background: rgba(255, 255, 255, 0.03);
  border-right: 1px solid rgba(255, 255, 255, 0.1);
  position: fixed;
  left: 0;
  top: 64px;
  padding: 24px 0;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 24px;
  color: #888;
  text-decoration: none;
  transition: all 0.3s ease;
}

.sidebar-item:hover,
.sidebar-item.active {
  color: #ffffff;
  background: rgba(102, 126, 234, 0.1);
  border-right: 3px solid #667eea;
}

.sidebar-icon {
  width: 20px;
  height: 20px;
}
```

### 4.3 面包屑 (Breadcrumb)

```css
.breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
}

.breadcrumb-item {
  color: #888;
  text-decoration: none;
}

.breadcrumb-item:hover {
  color: #00d4ff;
}

.breadcrumb-item.active {
  color: #ffffff;
}

.breadcrumb-separator {
  color: #666;
}
```

### 4.4 分页 (Pagination)

```
[<] [1] [2] [3] [...] [10] [>]
```

```css
.pagination {
  display: flex;
  align-items: center;
  gap: 8px;
}

.pagination-btn {
  min-width: 36px;
  height: 36px;
  padding: 0 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: #888;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.pagination-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.pagination-btn.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: transparent;
  color: #ffffff;
}

.pagination-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}
```

---

## 5. 反馈组件 (Feedback)

### 5.1 Toast 通知

```
┌─────────────────────────────────────────┐
│ ✅  操作成功                    [×]     │
│     您的音乐已成功上传。                │
└─────────────────────────────────────────┘
```

```css
.toast {
  position: fixed;
  top: 80px;
  right: 20px;
  min-width: 300px;
  max-width: 400px;
  padding: 16px 20px;
  background: rgba(26, 26, 46, 0.95);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  backdrop-filter: blur(20px);
  display: flex;
  align-items: flex-start;
  gap: 12px;
  animation: slideIn 0.3s ease;
}

.toast.success {
  border-left: 4px solid #22c55e;
}

.toast.error {
  border-left: 4px solid #ef4444;
}

.toast.warning {
  border-left: 4px solid #f59e0b;
}

.toast.info {
  border-left: 4px solid #3b82f6;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}
```

### 5.2 加载状态

#### Spinner
```css
.spinner {
  width: 24px;
  height: 24px;
  border: 2px solid rgba(255, 255, 255, 0.1);
  border-top-color: #667eea;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
```

#### 骨架屏
```css
.skeleton {
  background: linear-gradient(
    90deg,
    rgba(255, 255, 255, 0.05) 25%,
    rgba(255, 255, 255, 0.1) 50%,
    rgba(255, 255, 255, 0.05) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 8px;
}

@keyframes shimmer {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
```

### 5.3 进度条

```css
.progress {
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
}

.progress-bar {
  height: 100%;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  border-radius: 4px;
  transition: width 0.3s ease;
}

.progress-bar.indeterminate {
  animation: indeterminate 1.5s ease-in-out infinite;
}

@keyframes indeterminate {
  0% {
    width: 0%;
    margin-left: 0%;
  }
  50% {
    width: 40%;
    margin-left: 30%;
  }
  100% {
    width: 0%;
    margin-left: 100%;
  }
}
```

### 5.4 徽章 (Badge)

```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}

.badge-primary {
  background: rgba(102, 126, 234, 0.2);
  color: #667eea;
}

.badge-success {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.badge-warning {
  background: rgba(245, 158, 11, 0.2);
  color: #f59e0b;
}

.badge-error {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}
```

---

## 6. 弹窗组件 (Modal)

### 6.1 基础弹窗

```css
.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.modal-overlay.active {
  opacity: 1;
}

.modal {
  background: #1a1a2e;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  width: 90%;
  max-width: 480px;
  max-height: 90vh;
  overflow: hidden;
  transform: scale(0.9);
  transition: transform 0.3s ease;
}

.modal-overlay.active .modal {
  transform: scale(1);
}

.modal-header {
  padding: 20px 24px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.modal-title {
  font-size: 18px;
  font-weight: 600;
}

.modal-close {
  width: 32px;
  height: 32px;
  background: transparent;
  border: none;
  color: #888;
  cursor: pointer;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.modal-close:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #ffffff;
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
  max-height: calc(90vh - 140px);
}

.modal-footer {
  padding: 16px 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}
```

### 6.2 确认弹窗

```
┌─────────────────────────────┐
│         确认删除?      [×]  │
├─────────────────────────────┤
│                             │
│   ⚠️                        │
│                             │
│   确定要删除这个作品吗?      │
│   此操作不可撤销。           │
│                             │
├─────────────────────────────┤
│      [取消]  [确认删除]     │
└─────────────────────────────┘
```

### 6.3 抽屉 (Drawer)

```css
.drawer {
  position: fixed;
  top: 0;
  right: 0;
  width: 400px;
  max-width: 90vw;
  height: 100vh;
  background: #1a1a2e;
  border-left: 1px solid rgba(255, 255, 255, 0.1);
  z-index: 2000;
  transform: translateX(100%);
  transition: transform 0.3s ease;
}

.drawer.open {
  transform: translateX(0);
}
```

---

## 7. 数据展示组件

### 7.1 表格 (Table)

```css
.table-container {
  overflow-x: auto;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.table {
  width: 100%;
  border-collapse: collapse;
}

.table th {
  padding: 16px;
  text-align: left;
  font-size: 12px;
  font-weight: 600;
  color: #888;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: rgba(255, 255, 255, 0.03);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.table td {
  padding: 16px;
  font-size: 14px;
  color: #ffffff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.table tr:hover td {
  background: rgba(255, 255, 255, 0.03);
}

.table tr:last-child td {
  border-bottom: none;
}
```

### 7.2 列表 (List)

```css
.list-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  transition: background 0.3s ease;
}

.list-item:hover {
  background: rgba(255, 255, 255, 0.03);
}

.list-item:last-child {
  border-bottom: none;
}
```

### 7.3 时间线 (Timeline)

```css
.timeline {
  position: relative;
  padding-left: 24px;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 6px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: rgba(255, 255, 255, 0.1);
}

.timeline-item {
  position: relative;
  padding-bottom: 24px;
}

.timeline-item::before {
  content: '';
  position: absolute;
  left: -20px;
  top: 4px;
  width: 12px;
  height: 12px;
  background: #667eea;
  border-radius: 50%;
  border: 2px solid #1a1a2e;
}
```

---

## 8. 媒体组件

### 8.1 音频播放器

```
┌──────────────────────────────────────────────────────────┐
│  ┌──────┐                                                │
│  │  ▶   │  歌曲标题                   01:23 / 03:45     │
│  └──────┘  艺术家                                       │
│  ─────────────────────────────●────────────── ○━━━ 🔊    │
└──────────────────────────────────────────────────────────┘
```

```css
.audio-player {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
}

.audio-player .play-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.audio-player .play-btn:hover {
  transform: scale(1.05);
}

.audio-player .progress {
  flex: 1;
  height: 4px;
}

.audio-player .time {
  font-size: 12px;
  color: #888;
  font-variant-numeric: tabular-nums;
}
```

### 8.2 图片上传

```css
.upload-area {
  border: 2px dashed rgba(255, 255, 255, 0.2);
  border-radius: 16px;
  padding: 48px 24px;
  text-align: center;
  transition: all 0.3s ease;
  cursor: pointer;
}

.upload-area:hover {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.upload-area.dragover {
  border-color: #00d4ff;
  background: rgba(0, 212, 255, 0.1);
}

.upload-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.upload-text {
  font-size: 16px;
  color: #ffffff;
  margin-bottom: 8px;
}

.upload-hint {
  font-size: 14px;
  color: #888;
}
```

---

## 9. 特殊组件

### 9.1 权益卡片 (Rights Card)

用于创作者上传页面的权益配置。

```css
.rights-card {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 20px;
  transition: all 0.3s ease;
}

.rights-card:hover {
  border-color: rgba(102, 126, 234, 0.3);
}

.rights-card.enabled {
  border-color: #667eea;
  background: rgba(102, 126, 234, 0.05);
}

.rights-card-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.rights-card-title {
  font-size: 16px;
  font-weight: 600;
  flex: 1;
}

.rights-card-badge {
  padding: 4px 10px;
  background: rgba(0, 212, 255, 0.2);
  color: #00d4ff;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
}
```

### 9.2 NFT 卡片

```css
.nft-card {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.1) 0%, rgba(118, 75, 162, 0.1) 100%);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 20px;
  padding: 24px;
  position: relative;
  overflow: hidden;
}

.nft-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
}

.nft-token-id {
  font-family: monospace;
  font-size: 14px;
  color: #888;
}
```

### 9.3 交易记录项

```css
.transaction-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
}

.transaction-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.transaction-icon.in {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.transaction-icon.out {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

.transaction-details {
  flex: 1;
}

.transaction-title {
  font-size: 14px;
  font-weight: 500;
}

.transaction-time {
  font-size: 12px;
  color: #888;
}

.transaction-amount {
  font-size: 16px;
  font-weight: 600;
}

.transaction-amount.positive {
  color: #22c55e;
}

.transaction-amount.negative {
  color: #ef4444;
}
```

---

## 10. 组件组合示例

### 10.1 搜索栏组合

```html
<div class="search-bar">
  <div class="search-input-wrapper">
    <span class="search-icon">🔍</span>
    <input type="text" class="form-input" placeholder="搜索音乐、艺术家...">
  </div>
  <button class="btn btn-secondary">筛选 ▼</button>
  <button class="btn btn-primary">搜索</button>
</div>
```

### 10.2 音乐列表项

```html
<div class="music-list-item">
  <div class="music-number">01</div>
  <div class="music-cover">
    <img src="cover.jpg" alt="封面">
    <div class="play-overlay">
      <button class="play-btn">▶</button>
    </div>
  </div>
  <div class="music-info">
    <div class="music-title">Summer Vibes</div>
    <div class="music-artist">@artist</div>
  </div>
  <div class="music-meta">
    <span class="badge badge-primary">电子</span>
    <span class="music-duration">3:45</span>
  </div>
  <div class="music-actions">
    <button class="btn-icon">♥</button>
    <button class="btn-icon">⋯</button>
  </div>
</div>
```

---

## 11. 响应式组件

### 11.1 响应式导航

```css
/* 桌面端 */
.navbar-links {
  display: flex;
}

.mobile-menu-btn {
  display: none;
}

/* 移动端 */
@media (max-width: 768px) {
  .navbar-links {
    display: none;
  }
  
  .mobile-menu-btn {
    display: block;
  }
  
  .mobile-menu {
    position: fixed;
    top: 64px;
    left: 0;
    right: 0;
    background: rgba(10, 10, 26, 0.98);
    padding: 16px;
    transform: translateY(-100%);
    opacity: 0;
    transition: all 0.3s ease;
  }
  
  .mobile-menu.open {
    transform: translateY(0);
    opacity: 1;
  }
}
```

### 11.2 响应式卡片网格

```css
.card-grid {
  display: grid;
  gap: 24px;
}

/* 移动端: 2列 */
@media (max-width: 640px) {
  .card-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }
}

/* 平板: 3列 */
@media (min-width: 641px) and (max-width: 1024px) {
  .card-grid {
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
}

/* 桌面: 4列 */
@media (min-width: 1025px) {
  .card-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

/* 大屏: 5-6列 */
@media (min-width: 1400px) {
  .card-grid {
    grid-template-columns: repeat(5, 1fr);
  }
}
```

---

## 12. 组件使用原则

1. **一致性**: 同类组件保持相同外观和行为
2. **可复用**: 组件应足够通用，避免过度定制
3. **可访问**: 支持键盘导航和屏幕阅读器
4. **响应式**: 组件应自适应不同屏幕尺寸
5. **性能**: 避免不必要的重渲染，合理使用 CSS 动画
