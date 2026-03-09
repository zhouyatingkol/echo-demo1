# ECHO Protocol WebGL 布局规范

## 📐 三栏布局标准

### 容器结构
```
┌─────────────────────────────────────────────────────────────┐
│  [左侧资产库]  │  [中间内容区]  │  [右侧面板]               │
│   390px       │    自适应      │   390px                    │
│   fixed       │   flex:1       │   fixed                    │
└─────────────────────────────────────────────────────────────┘
         ↑                ↑                ↑
    asset-library    fusion-area/      ownership-panel
                     finance-center
```

### CSS 规范

#### 1. 主容器
```css
.main-container {
    position: fixed;
    top: 20px;
    left: 0;
    right: 0;
    bottom: 0;
    display: flex;
    padding: 0 15px 20px;
    gap: 10px;
    justify-content: space-between;  /* 关键：防止中间区域挤压两侧 */
}
```

#### 2. 左右侧面板（所有阶段一致）
```css
/* 基础样式 */
.asset-library {
    width: 390px;
    min-width: 390px;      /* 关键：防止压缩 */
    flex-shrink: 0;        /* 关键：不允许缩小 */
    height: 100%;
    padding: 25px;
    /* 其他样式... */
}

/* 阶段特定覆盖（如有需要） */
#stage2 .asset-library,
#stage3 .asset-library {
    width: 390px;
    min-width: 390px;
    flex-shrink: 0;
}
```

#### 3. 中间区域
```css
/* 阶段2 - 协作衍生 */
#stage2 .fusion-area {
    flex: 1;
    min-width: 0;
    max-width: calc(100vw - 830px);  /* 计算：2×390 + 间距 + 余量 */
}

/* 阶段3 - 融资决策 */
#stage3 .finance-center {
    flex: 1;
    min-width: 0;
    max-width: calc(100vw - 830px);
}
```

#### 4. 右侧面板
```css
#stage2 .ownership-panel,
#stage3 .ownership-panel {
    width: 390px;
    min-width: 390px;
    padding: 25px;
}
```

---

## 🎴 资产卡片网格规范

### 网格设置
```css
.asset-grid {
    display: grid;
    grid-template-columns: 160px 160px;  /* 固定像素，非 1fr */
    gap: 12px;
    flex: 1;
    overflow-y: auto;
}
```

### 卡片样式
```css
.asset-card {
    min-height: 150px;
    width: 100%;              /* 填满网格单元 */
    box-sizing: border-box;   /* 包含 padding 和 border */
    padding: 16px 12px 12px;
    border-radius: 20px;
    /* 其他样式... */
}
```

### 计算逻辑
- 资产库总宽：390px
- 减去左右 padding：390 - 50 = 340px
- 减去 scrollbar：340 - 5 = 335px
- 两个卡片：160 × 2 = 320px
- 间隙：12px
- 总计：332px ✓（在 335px 内）

---

## 🎨 阶段一致性原则

### DO（推荐）
1. ✅ 使用基础样式定义通用属性
2. ✅ 使用阶段选择器（`#stage2`）只覆盖必要的差异
3. ✅ 保持左右侧面板宽度一致
4. ✅ 使用 `flex-shrink: 0` 防止面板被压缩

### DON'T（避免）
1. ❌ 不要在每个阶段重复定义完整的 `.asset-library` 样式
2. ❌ 不要使用 `1fr` 作为网格列宽（会导致宽度不一致）
3. ❌ 不要省略 `min-width` 或 `flex-shrink`
4. ❌ 不要使用 `justify-content: center`（会导致中间区域挤压两侧）

---

## 🐛 常见问题排查

### 问题1：右侧卡片被截断
**原因**：中间区域 `flex: 1` 占用了过多空间
**解决**：添加 `max-width: calc(100vw - 830px)` 限制中间区域

### 问题2：左右卡片宽度不一致
**原因**：grid 使用 `1fr` 自适应分配
**解决**：改为固定像素 `grid-template-columns: 160px 160px`

### 问题3：左侧面板被压缩
**原因**：缺少 `flex-shrink: 0` 或 `min-width`
**解决**：添加这两个属性固定面板宽度

### 问题4：3D 模型不显示
**原因**：阶段一缺少 `animateCards()` 调用
**解决**：在阶段一初始化时启动动画循环

---

## 📝 修改检查清单

修改布局后，请检查：
- [ ] 三个阶段左右侧面板宽度是否一致（390px）
- [ ] 资产卡片是否为双列排列
- [ ] 左右卡片宽度是否相等（160px）
- [ ] 右侧面板内容是否完整显示
- [ ] 中间区域是否自适应但不溢出

---

## 🔧 快速修复模板

如果布局出现问题，使用以下模板：

```css
/* 阶段 X 布局修复 */
#stageX .main-container {
    gap: 10px;
    padding: 0 15px 20px;
}

#stageX .asset-library {
    width: 390px;
    min-width: 390px;
    flex-shrink: 0;
}

#stageX .center-area {
    flex: 1;
    min-width: 0;
    max-width: calc(100vw - 830px);
}

#stageX .ownership-panel {
    width: 390px;
    min-width: 390px;
    padding: 25px;
}
```
