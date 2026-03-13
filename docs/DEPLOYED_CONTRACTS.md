# ECHO Protocol 已部署合约地址

> 本文档汇总 ECHO Protocol 在 Qitmeer 网络上的所有正式合约地址  
> 最后更新: 2026-03-14  
> 部署者: `0x3a163461692222F7b986a9D3DcCe5d88390EC63C`

---

## 🌐 网络信息

| 参数 | 值 |
|------|-----|
| 网络名称 | Qitmeer Mainnet |
| Chain ID | 813 |
| RPC URL | https://qng.rpc.qitmeer.io |
| 区块浏览器 | https://qng.qitmeer.io |
| 原生代币 | MEER |

---

## ✅ 当前生产合约 (V3 版本)

以下合约是**当前活跃使用**的正式版本：

### ECHOAssetV2V3
| 属性 | 值 |
|------|-----|
| **地址** | `0xF98f63b7e8064Dcf9c2f25A906B2af89Af4840ce` |
| **版本** | 3.0.0 |
| **部署时间** | 2026-03-13 |
| **交易哈希** | `0xffe9b254465323b96e00bec13786bef4719de964623b86394ebb968d60a5be75` |
| **用途** | 生成数字种子、四权管理 |
| **验证状态** | ⏳ 待验证 |

### ECHOFusionV2
| 属性 | 值 |
|------|-----|
| **地址** | `0x8Eb7a29C41478a3f32015C1330DFf7cc683d0952` |
| **版本** | 2.0.0 |
| **部署时间** | 2026-03-13 |
| **交易哈希** | `0x7d46d70d38c8b68cf3822b5e6faa3c3822ee909b3790348229c07121372dc041` |
| **构造函数参数** | `0xF98f63b7e8064Dcf9c2f25A906B2af89Af4840ce` (ECHOAssetV2V3 地址) |
| **用途** | 资产融合、收益分配 |
| **验证状态** | ⏳ 待验证 |

### LicenseNFTV3
| 属性 | 值 |
|------|-----|
| **地址** | `0x2f79b56047050FD2Ee7C62d2d0fe644c15c68e23` |
| **版本** | 3.0.0 |
| **部署时间** | 2026-03-13 |
| **交易哈希** | `0xab93099d83ea59e88c26b65e26b45da66b60423a66cbd66148ceb6b9c4de1999` |
| **构造函数参数** | `0xF98f63b7e8064Dcf9c2f25A906B2af89Af4840ce` (ECHOAssetV2V3 地址) |
| **用途** | 许可证 NFT 管理 |
| **验证状态** | ⏳ 待验证 |

---

## 📁 历史版本 (存档)

以下合约是历史版本，**不再推荐使用**：

### V2 版本

| 合约 | 地址 | 版本 | 部署时间 | 状态 |
|------|------|------|----------|------|
| ECHOAssetV2 | `0x6195f16cb8d32397032c6031e89c567a5fdbec9d` | V2 | 2026-03-13 | 已废弃 |

### V1 版本

| 合约 | 地址 | 版本 | 部署时间 | 状态 |
|------|------|------|----------|------|
| ECHOFusion | `0x31Cd483Ee827A272816808AD49b90c71B1c82E11` | V1 | 2026-03-13 | 已废弃 |
| ECHOFusion | `0xa91499036db8a9501d4116c12114d24a906d7b97` | V1 | - | 已废弃 |
| LicenseNFT | `0x13c0637d86d179b66f22e0806c98b34bdbf48adf` | V1 | 2026-03-13 | 已废弃 |

---

## 🔗 常用链接

### 区块浏览器链接

| 合约 | 链接 |
|------|------|
| ECHOAssetV2V3 | https://qng.qitmeer.io/address/0xF98f63b7e8064Dcf9c2f25A906B2af89Af4840ce |
| ECHOFusionV2 | https://qng.qitmeer.io/address/0x8Eb7a29C41478a3f32015C1330DFf7cc683d0952 |
| LicenseNFTV3 | https://qng.qitmeer.io/address/0x2f79b56047050FD2Ee7C62d2d0fe644c15c68e23 |

### 验证链接

| 合约 | 验证页面 |
|------|----------|
| ECHOAssetV2V3 | https://qng.qitmeer.io/address/0xF98f63b7e8064Dcf9c2f25A906B2af89Af4840ce/verify-via-flattened-code/new |
| ECHOFusionV2 | https://qng.qitmeer.io/address/0x8Eb7a29C41478a3f32015C1330DFf7cc683d0952/verify-via-flattened-code/new |
| LicenseNFTV3 | https://qng.qitmeer.io/address/0x2f79b56047050FD2Ee7C62d2d0fe644c15c68e23/verify-via-flattened-code/new |

---

## 📋 配置引用

### contract-config-v3.js
```javascript
const CONTRACT_CONFIG = {
    network: {
        name: 'Qitmeer Mainnet',
        chainId: 813,
        rpcUrl: 'https://qng.rpc.qitmeer.io'
    },
    contracts: {
        ECHOAssetV2: {
            address: '0xF98f63b7e8064Dcf9c2f25A906B2af89Af4840ce',
            version: '3.0.0'
        },
        ECHOFusion: {
            address: '0x8Eb7a29C41478a3f32015C1330DFf7cc683d0952',
            version: '2.0.0'
        },
        LicenseNFT: {
            address: '0x2f79b56047050FD2Ee7C62d2d0fe644c15c68e23',
            version: '3.0.0'
        }
    }
};
```

---

## ⚠️ 重要提示

1. **始终使用本文档中的最新地址** - 旧版本合约可能存在已知问题
2. **验证合约源码** - 使用区块浏览器验证合约源码
3. **检查 ABI 兼容性** - 确保前端使用正确的 ABI 版本
4. **保留私钥安全** - 永远不要分享部署者私钥

---

## 📞 支持

如有问题，请联系开发团队或在 GitHub 提交 Issue。

---

*文档版本: 1.0*  
*最后更新: 2026-03-14*
