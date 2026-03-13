# ECHO 平台页面规划

## 网站结构

```
/
├── index.html          ✅ 首页（已完成）
├── market.html         ✅ 市场 — 浏览所有作品
├── work-detail.html    ✅ 作品详情页
├── mint.html           ✅ 生成 — 创建新 ECHO
├── creator.html        ✅ 创作者中心 — 管理作品
├── profile.html        ✅ 个人中心 — 我的收藏
└── docs.html           ✅ 文档/白皮书
```

## 页面完成度

| 页面 | 状态 | 核心功能 |
|------|------|----------|
| index.html | ✅ | 首页动画、温润气质 |
| market.html | ✅ | 筛选、作品网格 |
| work-detail.html | ✅ | 作品详情、流转记录 |
| mint.html | ✅ | 四步骤生成、四权配置 |
| creator.html | ✅ | 作品管理、收益概览 |
| profile.html | ✅ | 我的收藏、活动时间线 |
| docs.html | ✅ | 文档站点、FAQ折叠 |

## 全局共享资源

| 资源 | 路径 | 说明 |
|------|------|------|
| 全局样式 | css/global.css | 统一变量、组件、动画 |
| 字体回退 | fonts/local-fonts.css | 系统字体栈 |

## 导航结构

**主导航（所有页面）**:
```
ECHO logo ───────→ index.html
市场 ────────────→ market.html
创作 ────────────→ creator.html / mint.html
文档 ────────────→ docs.html
我的 ────────────→ profile.html
```

**页面间跳转**:
- index → market, creator, docs
- market → work-detail, index
- work-detail → market, index
- mint → market, index, work-detail(预览)
- creator → mint, market, index
- profile → work-detail, index
- docs → index

## 项目状态

- **总页面**: 7个 ✅
- **状态**: 全部完成
- **安全评级**: B+（演示环境可接受）
- **风格统一**: ✅ 温润 × 辨识度

## 后续建议

1. 生产环境：下载 Google Fonts 到本地，提升至 A 级安全
2. 可选增强：添加更多作品数据、搜索功能、深色模式

---
*更新于: 2026-03-14*
