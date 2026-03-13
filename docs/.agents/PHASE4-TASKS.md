# Phase 4 开发任务 - 推荐算法

## 目标
开发音乐推荐和发现功能

## 任务分解

### Task 4.1: 相似音乐推荐 ⭐ 最高优先级
**需求**: 基于标签和内容推荐相似音乐

**推荐算法**:
```javascript
function calculateSimilarity(musicA, musicB) {
  let score = 0;
  
  // 风格匹配 (权重 40%)
  if (musicA.genre === musicB.genre) score += 40;
  
  // BPM 接近度 (权重 30%)
  const bpmDiff = Math.abs(musicA.bpm - musicB.bpm);
  score += Math.max(0, 30 - bpmDiff);
  
  // 情绪匹配 (权重 20%)
  if (musicA.mood === musicB.mood) score += 20;
  
  // 调性匹配 (权重 10%)
  if (musicA.key === musicB.key) score += 10;
  
  return score;
}
```

**文件**:
- 新建: `frontend/js/recommendation.js`
- 修改: `frontend/music-market.html` - 添加"相似推荐"板块

---

### Task 4.2: 热门榜单
**需求**: 展示平台热门音乐

**榜单类型**:
- [ ] 总热度榜 (播放次数 + 购买次数)
- [ ] 分类热度榜 (电子/摇滚/流行等)
- [ ] 新晋创作者榜 (新作品推广)
- [ ] 周榜/月榜/总榜

**热度计算**:
```javascript
function calculateHotScore(music) {
  // 播放权重: 1
  // 购买权重: 10
  // 收藏权重: 5
  // 时间衰减: 越新越热
  return plays * 1 + purchases * 10 + favorites * 5 + timeBonus;
}
```

**文件**:
- 新建: `frontend/charts.html` - 榜单页面

---

### Task 4.3: 个性化推荐 (基于历史)
**需求**: 根据用户行为推荐

**推荐维度**:
- [ ] 基于播放历史
- [ ] 基于收藏偏好
- [ ] 基于购买记录
- [ ] "猜你喜欢"板块

**算法**:
```javascript
function getPersonalizedRecommendations(userHistory) {
  // 1. 获取用户偏好的风格
  const preferredGenres = analyzeUserGenres(userHistory);
  
  // 2. 获取用户偏好的BPM范围
  const preferredBPM = analyzeUserBPM(userHistory);
  
  // 3. 推荐相似但未听过的音乐
  return allMusic.filter(m => 
    !userHistory.played.includes(m.id) &&
    preferredGenres.includes(m.genre) &&
    Math.abs(m.bpm - preferredBPM) < 20
  );
}
```

**文件**:
- 修改: `frontend/index.html` 或新建 `frontend/discover.html`

---

### Task 4.4: 趋势分析 (可选增强)
**需求**: 分析平台趋势

**功能**:
- [ ] 热门风格趋势
- [ ] 价格趋势分析
- [ ] 新兴创作者发现

---

## 协作流程
```
Developer → Reviewer → Tester → 推送
    ↑________↓_________↓______↓
```

## 会话分配
- `echo-dev-recommendation` - 相似推荐算法
- `echo-dev-charts` - 热门榜单
- `echo-dev-personalized` - 个性化推荐
