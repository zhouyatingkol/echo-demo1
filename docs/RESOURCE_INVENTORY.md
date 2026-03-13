# ECHO Demo 资源清单

生成时间: 2025-03-13

## 目录结构

```
echo-demo/
├── index.html                     # 首页
├── marketplace.html               # 市场页面
├── asset-detail.html              # 资产详情页
├── license-shop.html              # 授权商店页
├── creator-dashboard.html         # 创作者仪表盘
├── creator-upload.html            # 作品上传页
├── creator-revenue.html           # 收益管理页
├── dashboard.html                 # 收益面板（从frontend复制）
├── css/                           # 统一样式目录
│   ├── global.css                 # 全局样式（来自frontend/css/）
│   ├── main.css                   # 主样式（来自styles/）
│   ├── marketplace.css            # 市场样式
│   ├── creator.css                # 创作者中心样式
│   ├── license-shop.css           # 授权商店样式
│   └── asset-detail.css           # 资产详情样式
├── js/                            # 统一脚本目录
│   ├── wallet.js                  # 钱包功能
│   ├── contract-manager-v3.js     # 合约管理
│   ├── marketplace.js             # 市场逻辑
│   ├── creator.js                 # 创作者中心逻辑
│   ├── license-shop.js            # 授权商店逻辑
│   ├── asset-detail.js            # 资产详情逻辑
│   └── contract-config.js         # 合约配置
├── styles/                        # 原始样式目录（保留）
│   ├── main.css
│   ├── marketplace.css
│   ├── creator.css
│   ├── license-shop.css
│   └── asset-detail.css
└── frontend/                      # 前端子目录（保留）
    ├── css/
    │   ├── global.css
    │   ├── theme.css
    │   ├── mobile.css
    │   └── navbar.css
    ├── js/
    │   ├── wallet.js
    │   ├── wallet-state.js
    │   ├── theme-switcher.js
    │   ├── i18n.js
    │   └── ... (其他模块)
    └── ethers.min.js
```

## 路径更新记录

### HTML文件路径更新
| 文件 | 原CSS路径 | 新CSS路径 | 原JS路径 | 新JS路径 |
|------|----------|----------|----------|----------|
| index.html | frontend/css/global.css | css/global.css | - | - |
| marketplace.html | styles/main.css, styles/marketplace.css | css/main.css, css/marketplace.css | 根目录/*.js | js/*.js |
| asset-detail.html | styles/main.css, styles/asset-detail.css | css/main.css, css/asset-detail.css | 根目录/*.js | js/*.js |
| license-shop.html | styles/main.css, styles/license-shop.css | css/main.css, css/license-shop.css | 根目录/*.js | js/*.js |
| creator-dashboard.html | styles/main.css, styles/creator.css | css/main.css, css/creator.css | 根目录/*.js | js/*.js |
| creator-upload.html | styles/main.css, styles/creator.css | css/main.css, css/creator.css | 根目录/*.js | js/*.js |
| creator-revenue.html | styles/main.css, styles/creator.css | css/main.css, css/creator.css | 根目录/*.js | js/*.js |
| dashboard.html | - | - | ethers.min.js | frontend/ethers.min.js |

## GitHub Pages 兼容性

- 所有资源路径改为相对路径
- CSS文件集中在 css/ 目录
- JS文件集中在 js/ 目录
- 避免跨目录引用问题

## 备份说明

- styles/ 目录保留原始文件作为备份
- frontend/ 目录保持原样
- 根目录下的原始JS文件保留
