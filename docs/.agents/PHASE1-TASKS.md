# Phase 1 开发任务 - ECHO Music 完整平台

## 目标
开发音乐平台核心体验功能

## 任务分解

### Task 1.1: 真实波形播放器 ⭐ 最高优先级
**需求**: 基于音频数据生成真实波形，而非随机动画

**功能点**:
- [ ] 使用 Web Audio API 解码音频数据
- [ ] 提取波形数据（时域/频域）
- [ ] 绘制波形柱状图（canvas/svg）
- [ ] 播放时实时高亮当前位置
- [ ] 点击波形跳转播放位置

**技术方案**:
```javascript
// 使用 Web Audio API
const audioContext = new AudioContext();
const analyser = audioContext.createAnalyser();
// 获取波形数据
analyser.getByteFrequencyData(dataArray);
```

**文件**:
- 新建: `frontend/js/waveform.js` - 波形生成器
- 修改: `frontend/music-market.html` - 集成波形

---

### Task 1.2: 用户资料页
**需求**: 创作者个人主页，展示信息和资产

**功能点**:
- [ ] 头像 + 封面图
- [ ] 创作者名称 + 简介
- [ ] 统计数据（作品数、收益、粉丝）
- [ ] 资产列表（我创建的）
- [ ] 社交链接（可选）

**页面结构**:
```
profile.html
├── 封面区域
├── 头像 + 名称
├── 统计栏
├── 简介
└── 音乐网格（复用市场样式）
```

**文件**:
- 新建: `frontend/profile.html`

---

### Task 1.3: 全局搜索 + 高级筛选
**需求**: 发现音乐，支持多维度筛选

**功能点**:
- [ ] 搜索框（按名称/创作者）
- [ ] 高级筛选面板
  - BPM 范围滑块
  - 调性选择
  - 时长范围
  - 价格范围
- [ ] 排序选项（最新/最热/最便宜）
- [ ] 搜索结果页

**文件**:
- 修改: `frontend/music-market.html` - 添加搜索筛选

---

## 协作流程

```
Developer → Reviewer → Tester → 推送
    ↑________↓_________↓______↓
```

## 会话分配
- `echo-dev-phase1` - Developer Agent
- `echo-review-phase1` - Reviewer Agent
- `echo-test-phase1` - Tester Agent

## 完成标准
- [ ] 波形基于真实音频数据
- [ ] 用户资料可正常显示
- [ ] 搜索筛选功能完整
- [ ] 所有代码审查通过
- [ ] 测试无严重问题
