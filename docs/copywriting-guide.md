# ECHO 交互文案对照表

## 概述
本文档汇总 ECHO 项目全站统一的交互文案，涵盖加载状态、空状态、错误处理和成功反馈四大类。所有文案遵循「东方意境 + 极简表达」的设计风格。

---

## 一、加载状态 Loading

### 1.1 全局加载
| 场景 | 主文案 | 副文案 | CSS 类名 |
|------|--------|--------|----------|
| 页面初始加载 | 墨染中... | 山水渐显... | `.loading-overlay` |
| 数据加载中 | 墨染中... | - | `.loading-inline` |

### 1.2 局部加载
| 场景 | 文案 | CSS 类名 |
|------|------|----------|
| 市场页加载 | 山水渐显... | `.loading-inline` |
| 铸造提交 | 呈送中... | `.mint-loading` |
| 图片上传 | 载入中... | `.upload-loading` |
| 按钮加载 | - | `.btn-loading` |

### 1.3 铸造阶段文案
| 阶段 | 文案 | 说明 |
|------|------|------|
| 第1阶段 | 准备 | 准备元数据 |
| 第2阶段 | 上载 | 上传至链上 |
| 第3阶段 | 确认 | 等待区块确认 |
| 完成 | 已呈 | 铸造成功 |

---

## 二、空状态 Empty State

### 2.1 市场页无结果
```
主标题：暂无笔墨
副文案：随缘而待
图标：笔刷轮廓
```

### 2.2 个人中心无作品
```
主标题：尚无印记
副文案：由此而生
行动按钮：开始铸造 →
图标：印章轮廓
```

### 2.3 收藏为空
```
主标题：心有所待
副文案：随缘而集
图标：心形轮廓
```

### 2.4 搜索结果为空
```
主标题：未寻得
副文案：可试他词
图标：涟漪扩散
```

---

## 三、错误处理 Error

### 3.1 网络错误
```
Toast 标题：网络不畅
Toast 内容：再试一次
按钮：重试
图标：断开的连接
```

### 3.2 合约/链上错误
```
Toast 标题：链上繁忙
Toast 内容：稍后再试
建议：提示用户稍等片刻
图标：链条
```

### 3.3 用户取消
```
Toast 标题：已止
Toast 内容：随时可再入
说明：用户主动取消操作时显示
图标：停止符
```

### 3.4 其他错误
| 错误类型 | 标题 | 内容 |
|----------|------|------|
| 授权失败 | 授权未成 | 可再试之 |
| 余额不足 | 资不抵 | 请先充盈 |
| 参数错误 | 有谬 | 请核对 |

---

## 四、成功反馈 Success

### 4.1 铸造成功
```
Toast 标题：已呈
Toast 内容：归于境中
图标：印章✓
动画：淡入 + 金色闪烁
```

### 4.2 购买成功
```
Toast 标题：已入
Toast 内容：归于吾藏
图标：收藏盒
跳转：可查看我的资产
```

### 4.3 收藏成功
```
Toast 标题：已藏
Toast 内容：心有所属
图标：心形✓
```

### 4.4 其他成功
| 操作 | 标题 | 内容 |
|------|------|------|
| 上架成功 | 已展 | 待有缘人 |
| 取消上架 | 已收 | 随时可再展 |
| 转账成功 | 已送 | 达于彼方 |
| 更新资料 | 已更 | 焕然一新 |

---

## 五、确认对话框

### 5.1 通用确认
```
标题：请确
内容：[具体描述]
确认：[操作名]
取消：再思
```

### 5.2 危险操作
```
标题：慎之
内容：此不可逆
确认：执意行之
取消：且住
```

---

## 六、按钮文案

### 6.1 主要操作
| 功能 | 文案 |
|------|------|
| 铸造 | 呈送 |
| 购买 | 入藏 |
| 收藏 | 藏之 |
| 上架 | 展出 |
| 分享 | 传之 |

### 6.2 次要操作
| 功能 | 文案 |
|------|------|
| 取消 | 止 |
| 返回 | 返 |
| 继续 | 续 |
| 跳过 | 越 |
| 重试 | 再试 |

---

## 七、使用示例

### 7.1 HTML 结构示例

```html
<!-- 加载状态 -->
<div class="loading-overlay active">
  <div class="ink-dots">
    <div class="ink-dot"></div>
    <div class="ink-dot"></div>
    <div class="ink-dot"></div>
    <div class="ink-dot"></div>
    <div class="ink-dot"></div>
    <div class="ink-dot"></div>
  </div>
  <div class="loading-text">墨染中</div>
  <div class="loading-subtext">山水渐显</div>
</div>

<!-- 空状态 - 市场无结果 -->
<div class="empty-state empty-market">
  <div class="empty-visual">
    <div class="brush-stroke"></div>
    <div class="empty-icon">✍</div>
  </div>
  <h3 class="empty-title"></h3>
  <p class="empty-subtitle"></p>
</div>

<!-- 空状态 - 个人中心无作品 -->
<div class="empty-state empty-assets">
  <div class="empty-visual">
    <div class="seal-outline"></div>
    <div class="empty-icon">◈</div>
  </div>
  <h3 class="empty-title"></h3>
  <p class="empty-subtitle"></p>
  <div class="empty-action">
    <a href="/mint" class="empty-cta">开始铸造</a>
  </div>
</div>

<!-- Toast 成功提示 -->
<div class="toast success toast-mint-success show">
  <div class="toast-icon">✓</div>
  <div class="toast-content">
    <div class="toast-title"></div>
    <div class="toast-message"></div>
  </div>
  <button class="toast-close">×</button>
  <div class="toast-progress">
    <div class="toast-progress-bar"></div>
  </div>
</div>
```

### 7.2 JavaScript 调用示例

```javascript
// 显示加载
function showLoading(text = '墨染中', subtext = '山水渐显') {
  const overlay = document.querySelector('.loading-overlay');
  overlay.querySelector('.loading-text').textContent = text;
  overlay.querySelector('.loading-subtext').textContent = subtext;
  overlay.classList.add('active');
}

// 隐藏加载
function hideLoading() {
  document.querySelector('.loading-overlay').classList.remove('active');
}

// 显示 Toast
function showToast(type, title, message, duration = 5000) {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-icon">${type === 'success' ? '✓' : type === 'error' ? '✕' : '!'}</div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close">×</button>
  `;
  
  document.querySelector('.toast-container').appendChild(toast);
  
  // 动画进入
  setTimeout(() => toast.classList.add('show'), 10);
  
  // 自动关闭
  if (duration > 0) {
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, duration);
  }
}

// 快捷方法
const Toast = {
  mintSuccess: () => showToast('success', '已呈', '归于境中'),
  purchaseSuccess: () => showToast('success', '已入', '归于吾藏'),
  favoriteSuccess: () => showToast('success', '已藏', '心有所属'),
  networkError: () => showToast('error', '网络不畅', '再试一次'),
  contractError: () => showToast('error', '链上繁忙', '稍后再试'),
  userCancel: () => showToast('info', '已止', '随时可再入')
};
```

---

## 八、设计原则

1. **极简**: 文案不超过4字，副文案不超过5字
2. **意境**: 使用山水、笔墨、印章等东方意象
3. **留白**: 大量留白，让文案呼吸
4. **统一**: 同一场景使用固定文案
5. **克制**: 避免过度提示，重要操作才显示

---

## 九、文件位置

```
echo-demo/
├── assets/
│   └── styles/
│       ├── loading.css      # 加载状态样式
│       ├── toast.css        # Toast 提示样式
│       └── empty-state.css  # 空状态样式
└── docs/
    └── copywriting-guide.md # 本文档
```

---

*最后更新: 2026-03-15*
*版本: v1.0*
