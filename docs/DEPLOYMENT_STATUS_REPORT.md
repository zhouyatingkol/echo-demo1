# ECHO Protocol 智能合约部署状态报告

> 生成时间: 2026-03-14  
> 检查范围: Qitmeer 主网 (Chain ID: 813)  
> 部署者: 0x3a163461692222F7b986a9D3DcCe5d88390EC63C

---

## 📋 执行摘要

| 检查项 | 状态 | 备注 |
|--------|------|------|
| 合约配置 | ⚠️ 需更新 | 地址存在不一致 |
| Hardhat 配置 | ✅ 正常 | RPC 配置正确 |
| 部署脚本 | ✅ 正常 | 流程完整 |
| 验证配置 | ⚠️ 需同步 | 地址不匹配 |
| ABI 文件 | ✅ 完整 | 三个合约 ABI 齐全 |

---

## 1️⃣ 合约配置检查

### 1.1 配置源文件

| 配置文件 | 状态 | 说明 |
|----------|------|------|
| `scripts/utils/contract-config.js` | ⚠️ 需更新 | 地址与部署记录不一致 |
| `scripts/utils/contract-config-v3.js` | ✅ 最新 | V3 版本配置 |

### 1.2 合约地址对比

#### ECHOAssetV2 / ECHOAssetV2V3
| 来源 | 地址 | 状态 |
|------|------|------|
| contract-config.js | `0xF98f63b7e8064Dcf9c2f25A906B2af89Af4840ce` | V3 版本 ✅ |
| contract-config-v3.js | `0xF98f63b7e8064Dcf9c2f25A906B2af89Af4840ce` | V3 版本 ✅ |
| deployment-v2-mainnet.json | `0x6195f16cb8d32397032c6031e89c567a5fdbec9d` | V2 版本 |
| deployment-v3-mainnet.json | `0xF98f63b7e8064Dcf9c2f25A906B2af89Af4840ce` | V3 版本 ✅ |

**结论**: V3 合约地址 `0xF98f63b7e8064Dcf9c2f25A906B2af89Af4840ce` 为最新版本

#### ECHOFusion / ECHOFusionV2
| 来源 | 地址 | 状态 |
|------|------|------|
| contract-config.js | `0x8Eb7a29C41478a3f32015C1330DFf7cc683d0952` | V2 版本 ✅ |
| contract-config-v3.js | `0x8Eb7a29C41478a3f32015C1330DFf7cc683d0952` | V2 版本 ✅ |
| deployment-fusionv2-mainnet.json | `0x8Eb7a29C41478a3f32015C1330DFf7cc683d0952` | V2 版本 ✅ |
| deployment-v3-mainnet.json | `0x31Cd483Ee827A272816808AD49b90c71B1c82E11` | 旧版本 |
| VERIFICATION_GUIDE.md | `0xa91499036db8a9501d4116c12114d24a906d7b97` | 过时 ⚠️ |
| scripts/verify.sh | `0xa91499036db8a9501d4116c12114d24a906d7b97` | 过时 ⚠️ |

**结论**: V2 合约地址 `0x8Eb7a29C41478a3f32015C1330DFf7cc683d0952` 为最新版本

#### LicenseNFT / LicenseNFTV3
| 来源 | 地址 | 状态 |
|------|------|------|
| contract-config.js | `0x2f79b56047050FD2Ee7C62d2d0fe644c15c68e23` | V3 版本 ✅ |
| contract-config-v3.js | `0x2f79b56047050FD2Ee7C62d2d0fe644c15c68e23` | V3 版本 ✅ |
| deployment-license-mainnet.json | `0x13c0637d86d179b66f22e0806c98b34bdbf48adf` | V1 版本 |
| deployment-v3-mainnet.json | `0x2f79b56047050FD2Ee7C62d2d0fe644c15c68e23` | V3 版本 ✅ |
| VERIFICATION_GUIDE.md | `0x13c0637d86d179b66f22e0806c98b34bdbf48adf` | 过时 ⚠️ |
| scripts/verify.sh | `0x13c0637d86d179b66f22e0806c98b34bdbf48adf` | 过时 ⚠️ |

**结论**: V3 合约地址 `0x2f79b56047050FD2Ee7C62d2d0fe644c15c68e23` 为最新版本

### 1.3 ABI 文件完整性

| 合约 | ABI 文件路径 | 状态 | 大小 |
|------|-------------|------|------|
| ECHOAssetV2V3 | `artifacts/contracts/ECHOAssetV2V3.sol/ECHOAssetV2V3.json` | ✅ 完整 | ~70KB |
| ECHOFusionV2 | `artifacts/contracts/ECHOFusionV2.sol/ECHOFusionV2.json` | ✅ 完整 | ~35KB |
| LicenseNFTV3 | `artifacts/contracts/LicenseNFTV3.sol/LicenseNFTV3.json` | ✅ 完整 | ~45KB |

---

## 2️⃣ Hardhat 配置检查

### 2.1 网络配置

```javascript
// hardhat.config.js
networks: {
  qitmeer: {
    url: 'https://qng.rpc.qitmeer.io',
    chainId: 813,
    accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
  },
  qitmeerTestnet: {
    url: 'https://testnet-qng.rpc.qitmeer.io',
    chainId: 8131,
    accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
  },
  localhost: {
    url: 'http://127.0.0.1:8545',
  },
}
```

| 配置项 | 值 | 状态 |
|--------|-----|------|
| Qitmeer 主网 RPC | `https://qng.rpc.qitmeer.io` | ✅ 正确 |
| Chain ID | 813 | ✅ 正确 |
| Qitmeer 测试网 RPC | `https://testnet-qng.rpc.qitmeer.io` | ✅ 正确 |
| 测试网 Chain ID | 8131 | ✅ 正确 |

### 2.2 区块浏览器验证配置

```javascript
etherscan: {
  apiKey: {
    qitmeer: 'no-api-key-needed',
  },
  customChains: [
    {
      network: 'qitmeer',
      chainId: 813,
      urls: {
        apiURL: 'https://qng.qitmeer.io/api',
        browserURL: 'https://qng.qitmeer.io',
      },
    },
  ],
}
```

| 配置项 | 值 | 状态 |
|--------|-----|------|
| API URL | `https://qng.qitmeer.io/api` | ✅ 正确 |
| Browser URL | `https://qng.qitmeer.io` | ✅ 正确 |

### 2.3 编译器配置

| 配置项 | 值 | 状态 |
|--------|-----|------|
| Solidity 版本 | 0.8.19 | ✅ 正确 |
| 优化器 | Enabled | ✅ 正确 |
| Runs | 1 (viaIR 启用) | ⚠️ 与 verify.sh 中的 200 不一致 |
| viaIR | true | ✅ 正确 |

### 2.4 环境变量检查

| 变量 | 状态 | 说明 |
|------|------|------|
| `PRIVATE_KEY` | ✅ 已设置 | .env 文件中已配置 |
| `QITMEER_RPC_URL` | ✅ 已配置 | .env.example 中提供 |

**安全注意**: `.env` 文件存在且包含私钥，已在 `.gitignore` 中忽略 ✅

---

## 3️⃣ 部署脚本检查

### 3.1 主要部署脚本

| 脚本 | 用途 | 状态 |
|------|------|------|
| `deploy-v3-mainnet.js` | V3 主网部署 | ✅ 可用 |
| `utils/deploy-fusionv2.js` | FusionV2 部署 | ✅ 流程完整 |
| `deploy-license-final.js` | License 部署 | ✅ 可用 |

### 3.2 deploy-fusionv2.js 部署流程

```
1. 获取部署账户
2. 检查账户余额 (ethers v6 语法)
3. 设置 ECHOAssetV2V3 地址参数
4. 编译合约
5. 部署 ECHOFusionV2
6. 等待交易确认
7. 保存部署信息到 JSON
8. 等待区块确认 (3个区块)
9. 尝试自动验证合约
```

**特点**:
- 使用 Hardhat Ethers v6 语法 ✅
- 包含余额检查 ✅
- 自动保存部署信息 ✅
- 集成自动验证 ✅

---

## 4️⃣ 验证配置检查

### 4.1 verify.sh 脚本

| 检查项 | 状态 | 说明 |
|--------|------|------|
| 合约地址 | ⚠️ 过时 | 使用的是 V1/V2 旧地址 |
| 编译器版本 | ✅ 正确 | 0.8.19 |
| 优化器设置 | ✅ 正确 | Enabled, Runs: 200 |
| Flatten 文件引用 | ⚠️ 可能不存在 | 需要检查 |

### 4.2 验证脚本 deploy-verifier-v3.sh

| 特性 | 状态 |
|------|------|
| Blockscout 验证微服务部署 | ✅ 完整 |
| SSRF 防护 | ✅ 已配置 |
| 防火墙限制 | ✅ 已配置 |
| SELinux/AppArmor 检测 | ✅ 已配置 |
| 文件校验 | ✅ 已配置 |

### 4.3 config/verify-standard.json

```json
{
  "language": "Solidity",
  "settings": {
    "optimizer": {
      "enabled": true,
      "runs": 200
    }
  }
}
```

**注意**: 此文件使用 shell 命令语法，需要在实际使用时替换变量。

---

## 5️⃣ 最终合约地址清单

### ✅ 已部署合约（V3 最新版本）

| 合约名称 | 地址 | 交易哈希 | 部署时间 | 状态 |
|----------|------|----------|----------|------|
| **ECHOAssetV2V3** | `0xF98f63b7e8064Dcf9c2f25A906B2af89Af4840ce` | `0xffe9b254465323b96e00bec13786bef4719de964623b86394ebb968d60a5be75` | 2026-03-13 | ✅ 已部署 |
| **ECHOFusionV2** | `0x8Eb7a29C41478a3f32015C1330DFf7cc683d0952` | `0x7d46d70d38c8b68cf3822b5e6faa3c3822ee909b3790348229c07121372dc041` | 2026-03-13 | ✅ 已部署 |
| **LicenseNFTV3** | `0x2f79b56047050FD2Ee7C62d2d0fe644c15c68e23` | `0xab93099d83ea59e88c26b65e26b45da66b60423a66cbd66148ceb6b9c4de1999` | 2026-03-13 | ✅ 已部署 |

### ⚠️ 旧版本合约（记录存档）

| 合约名称 | 地址 | 版本 | 状态 |
|----------|------|------|------|
| ECHOAssetV2 | `0x6195f16cb8d32397032c6031e89c567a5fdbec9d` | V2 | 旧版本 |
| ECHOFusion | `0x31Cd483Ee827A272816808AD49b90c71B1c82E11` | V1 | 旧版本 |
| ECHOFusion | `0xa91499036db8a9501d4116c12114d24a906d7b97` | V1 | 旧版本 (verify.sh) |
| LicenseNFT | `0x13c0637d86d179b66f22e0806c98b34bdbf48adf` | V1 | 旧版本 |

---

## 6️⃣ 待验证合约

| 合约 | 地址 | 验证状态 | 优先级 |
|------|------|----------|--------|
| ECHOAssetV2V3 | `0xF98f63b7e8064Dcf9c2f25A906B2af89Af4840ce` | ⏳ 待验证 | 高 |
| ECHOFusionV2 | `0x8Eb7a29C41478a3f32015C1330DFf7cc683d0952` | ⏳ 待验证 | 高 |
| LicenseNFTV3 | `0x2f79b56047050FD2Ee7C62d2d0fe644c15c68e23` | ⏳ 待验证 | 高 |

验证链接:
- https://qng.qitmeer.io/address/0xF98f63b7e8064Dcf9c2f25A906B2af89Af4840ce/verify-via-flattened-code/new
- https://qng.qitmeer.io/address/0x8Eb7a29C41478a3f32015C1330DFf7cc683d0952/verify-via-flattened-code/new
- https://qng.qitmeer.io/address/0x2f79b56047050FD2Ee7C62d2d0fe644c15c68e23/verify-via-flattened-code/new

---

## 7️⃣ 发现的问题

### 🔴 严重

| # | 问题 | 影响 | 建议 |
|---|------|------|------|
| 1 | `scripts/verify.sh` 和 `VERIFICATION_GUIDE.md` 中的合约地址过时 | 可能导致验证错误的合约 | 立即更新 |

### 🟡 警告

| # | 问题 | 影响 | 建议 |
|---|------|------|------|
| 2 | Hardhat 配置中 optimizer runs: 1，但验证脚本使用 runs: 200 | 可能导致验证失败 | 统一为 200 |
| 3 | 存在多个版本的部署记录文件 | 可能导致混淆 | 归档旧版本，明确标注 |

### 🟢 建议

| # | 建议 | 优先级 |
|---|------|--------|
| 4 | 创建 `DEPLOYED_CONTRACTS.md` 主文档，汇总所有正式合约地址 | 中 |
| 5 | 添加部署脚本中的 constructor 参数自动记录 | 低 |
| 6 | 配置 CI/CD 自动验证流程 | 低 |

---

## 8️⃣ 下一步行动项

### 立即执行 🔥

- [ ] 更新 `scripts/verify.sh` 中的合约地址为 V3 版本
- [ ] 更新 `docs/guides/VERIFICATION_GUIDE.md` 中的合约地址
- [ ] 统一 Hardhat 配置中的 optimizer runs 为 200

### 短期计划 📅

- [ ] 验证三个 V3 合约在 Blockscout 上
- [ ] 归档旧版本部署记录到 `archive/` 目录
- [ ] 创建统一的合约地址文档

### 长期规划 🎯

- [ ] 建立自动化验证流程
- [ ] 添加合约升级管理机制
- [ ] 实现多签钱包部署

---

## 附录

### 区块浏览器
- URL: https://qng.qitmeer.io
- API: https://qng.qitmeer.io/api

### RPC 节点
- 主网: https://qng.rpc.qitmeer.io
- 测试网: https://testnet-qng.rpc.qitmeer.io

### 部署者地址
`0x3a163461692222F7b986a9D3DcCe5d88390EC63C`

---

*报告生成: 2026-03-14*  
*版本: v1.0*
