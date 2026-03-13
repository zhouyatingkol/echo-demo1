# ECHO 平台页面规划

## 网站结构

```
/
├── index.html          ✅ 首页（已完成）
├── market.html         ✅ 市场 — 浏览所有作品
├── work-detail.html    ✅ 作品详情页
├── mint.html           ✅ 铸造 — 创建新 ECHO
├── creator/            
│   └── index.html      🔄 创作者中心 — 管理作品
├── profile.html        🔄 个人中心 — 我的收藏
└── docs/               
    └── index.html      🔄 文档/白皮书
```

## 各页面优先级

### P0 - 核心流程 ✅ 已完成
1. **index.html** — 首页（温润 × 辨识度）
2. **market.html** — 发现作品（入口）
3. **work-detail.html** — 作品详情+购买（转化）
4. **mint.html** — 铸造新作品（四步骤流程）

### P1 - 创作者 🔄 待开发
5. **creator/index.html** — 创作者仪表盘

### P2 - 用户 🔄 待开发
6. **profile.html** — 个人中心
7. **docs/index.html** — 帮助文档

## 页面链接状态

- [x] index → market → work-detail 连通
- [x] index → mint 连通
- [ ] mint → work-detail（预览链接）
- [ ] 全局导航统一（文档链接待完成）

