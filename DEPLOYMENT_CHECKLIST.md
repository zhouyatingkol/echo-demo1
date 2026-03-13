# ECHO Protocol GitHub Pages 部署检查清单

**项目**: echo-demo  
**目标**: GitHub Pages  
**版本**: V3 安全修复版  
**最后更新**: 2026-03-13

---

## 📋 部署前检查

### 1. 合约配置 ✅

- [x] ECHOAssetV2 地址: `0xF98f63b7e8064Dcf9c2f25A906B2af89Af4840ce`
- [x] ECHOFusion 地址: `0x8Eb7a29C41478a3f32015C1330DFf7cc683d0952`
- [x] LicenseNFT 地址: `0x2f79b56047050FD2Ee7C62d2d0fe644c15c68e23`
- [x] 网络 Chain ID: 813 (0x32d)
- [x] RPC URL: `https://qng.rpc.qitmeer.io`
- [x] 区块浏览器: `https://qng.qitmeer.io`

### 2. 配置文件检查 ✅

- [x] `contract-config-v3.js` - 已更新
- [x] `frontend/js/contract-config.js` - 已验证
- [x] `frontend/js/contract-manager.js` - 已更新
- [x] `hardhat.config.js` - 网络配置正确

### 3. ABI 文件检查 ✅

- [x] `artifacts/contracts/ECHOAssetV2V3.sol/ECHOAssetV2V3.json`
- [x] `artifacts/contracts/ECHOFusionV2.sol/ECHOFusionV2.json`
- [x] `artifacts/contracts/LicenseNFTV3.sol/LicenseNFTV3.json`

### 4. GitHub Pages 配置 ✅

- [x] `.nojekyll` 文件已创建
- [ ] `CNAME` 文件（如使用自定义域名）

---

## 📁 部署文件结构

```
echo-demo/
├── .nojekyll              # GitHub Pages 配置 ✅
├── index.html             # 入口页面
├── contract-config-v3.js  # 后端配置
├── hardhat.config.js      # Hardhat 配置
├── deployment-v2-mainnet.json      # 部署记录
├── deployment-fusionv2-mainnet.json # 部署记录
├── artifacts/             # ABI 文件
│   └── contracts/
│       ├── ECHOAssetV2V3.sol/
│       ├── ECHOFusionV2.sol/
│       └── LicenseNFTV3.sol/
└── frontend/              # 前端应用
    ├── index.html
    ├── *.html             # 其他页面
    ├── js/
    │   ├── contract-config.js    # 前端配置 ✅
    │   ├── contract-manager.js   # 合约管理 ✅
    │   ├── wallet.js             # 钱包模块
    │   └── ...
    ├── css/
    └── locales/
```

---

## 🚀 部署步骤

### 步骤 1: 本地验证

```bash
# 1. 进入项目目录
cd echo-demo

# 2. 验证配置文件语法
node -c contract-config-v3.js
node -c frontend/js/contract-config.js

# 3. 检查 ABI 文件存在
ls -la artifacts/contracts/*/ | grep ".json"

# 4. 验证地址一致性
grep -r "0xF98f63b7e8064Dcf9c2f25A906B2af89Af4840ce" frontend/ --include="*.js"
grep -r "0x8Eb7a29C41478a3f32015C1330DFf7cc683d0952" frontend/ --include="*.js"
```

### 步骤 2: GitHub 部署

```bash
# 1. 添加所有文件
git add -A

# 2. 提交更改
git commit -m "chore: update contract addresses to V3 mainnet deployment

- Update ECHOFusion address to 0x8Eb7a29C41478a3f32015C1330DFf7cc683d0952
- Update all V2 contract references to V3
- Add .nojekyll for GitHub Pages
- Fix config inconsistencies"

# 3. 推送到 GitHub
git push origin main
```

### 步骤 3: GitHub Pages 设置

1. 进入 GitHub 仓库设置 → Pages
2. 选择 Source: `Deploy from a branch`
3. 选择 Branch: `main` / `root`
4. 点击 Save
5. 等待部署完成（约 1-2 分钟）

### 步骤 4: 部署后验证

- [ ] 访问 `https://<username>.github.io/echo-demo/`
- [ ] 验证页面正常加载
- [ ] 连接钱包测试
- [ ] 检查网络切换功能
- [ ] 验证合约调用（只读）

---

## 🔍 关键验证点

### 网络配置

```javascript
// 期望配置
{
  chainId: 813,
  name: 'Qitmeer Mainnet',
  rpcUrl: 'https://qng.rpc.qitmeer.io'
}
```

### 合约地址验证

| 合约 | 地址 | 验证链接 |
|-----|------|---------|
| ECHOAssetV2 | 0xF98...40ce | [查看](https://qng.qitmeer.io/address/0xF98f63b7e8064Dcf9c2f25A906B2af89Af4840ce) |
| ECHOFusion | 0x8Eb...0952 | [查看](https://qng.qitmeer.io/address/0x8Eb7a29C41478a3f32015C1330DFf7cc683d0952) |
| LicenseNFT | 0x2f7...8e23 | [查看](https://qng.qitmeer.io/address/0x2f79b56047050FD2Ee7C62d2d0fe644c15c68e23) |

---

## ⚠️ 注意事项

1. **私有密钥**: 确保 `.env` 和私钥文件不在 Git 跟踪范围内
2. **API 密钥**: 不要将任何 API 密钥硬编码在前端代码中
3. **测试网 vs 主网**: 当前配置为主网，测试请使用 testnet 配置
4. **CORS**: 确保 IPFS 网关和其他外部资源允许跨域访问

---

## 🐛 常见问题排查

### 问题: 页面 404
- 检查 `.nojekyll` 文件是否存在
- 确认 GitHub Pages 已启用
- 检查仓库是否为 Public

### 问题: 合约调用失败
- 检查浏览器控制台错误信息
- 验证钱包是否连接到 Qitmeer 主网 (Chain ID 813)
- 检查合约地址是否正确

### 问题: ABI 加载失败
- 确认 `artifacts/` 目录已提交到 Git
- 检查 ABI 文件路径是否正确

---

## 📞 部署后检查清单

- [ ] 网站可访问
- [ ] MetaMask 可连接
- [ ] 网络自动切换正常
- [ ] 资产列表可加载
- [ ] 只读合约调用成功
- [ ] 无控制台报错

---

**部署负责人**: _______________  
**部署日期**: _______________  
**验证结果**: ✅ 通过 / ❌ 失败
