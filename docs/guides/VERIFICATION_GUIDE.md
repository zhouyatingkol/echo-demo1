# ECHO Protocol 合约验证指南

## 合约部署信息

### 网络信息
- **网络**: Qitmeer Mainnet
- **Chain ID**: 813
- **区块浏览器**: https://qng.qitmeer.io

### 合约列表 (V3 最新版本 - 2026-03-13 部署)

| 合约 | 地址 | 区块 | 交易哈希 |
|------|------|------|----------|
| ECHOAssetV2V3 | `0xF98f63b7e8064Dcf9c2f25A906B2af89Af4840ce` | - | `0xffe9b254465323b96e00bec13786bef4719de964623b86394ebb968d60a5be75` |
| ECHOFusionV2 | `0x8Eb7a29C41478a3f32015C1330DFf7cc683d0952` | - | `0x7d46d70d38c8b68cf3822b5e6faa3c3822ee909b3790348229c07121372dc041` |
| LicenseNFTV3 | `0x2f79b56047050FD2Ee7C62d2d0fe644c15c68e23` | - | `0xab93099d83ea59e88c26b65e26b45da66b60423a66cbd66148ceb6b9c4de1999` |

### 旧版本合约 (存档)

| 合约 | 地址 | 版本 | 状态 |
|------|------|------|------|
| ECHOAssetV2 | `0x6195f16cb8d32397032c6031e89c567a5fdbec9d` | V2 | 已废弃 |
| ECHOFusion | `0xa91499036db8a9501d4116c12114d24a906d7b97` | V1 | 已废弃 |
| LicenseNFT | `0x13c0637d86d179b66f22e0806c98b34bdbf48adf` | V1 | 已废弃 |

## 验证参数

### 编译器设置
- **Solidity Version**: 0.8.19
- **优化**: Enabled
- **Runs**: 200
- **EVM Version**: default (London)

### 源码文件（已 flatten）
1. `ECHOAssetV2_flat.sol` - ECHOAssetV2 完整源码
2. `ECHOFusion_flat.sol` - ECHOFusion 完整源码
3. `LicenseNFT_flat.sol` - LicenseNFT 完整源码

## 手动验证步骤

### 1. 访问区块浏览器
打开 https://qng.qitmeer.io

### 2. 查找合约
在搜索框输入合约地址，如：
```
0x6195f16cb8d32397032c6031e89c567a5fdbec9d
```

### 3. 进入验证页面
- 点击 "Contract" 标签
- 点击 "Verify and Publish"

### 4. 填写验证表单

#### ECHOAssetV2
```
Compiler: Solidity 0.8.19
Optimization: Yes
Runs: 200
Source Code: [粘贴 ECHOAssetV2_flat.sol 内容]
```

#### ECHOFusionV2
```
Compiler: Solidity 0.8.19
Optimization: Yes
Runs: 200
Source Code: [粘贴 ECHOFusionV2_flat.sol 内容]
Constructor Arguments: 0x000000000000000000000000F98f63b7e8064Dcf9c2f25A906B2af89Af4840ce
```

#### LicenseNFTV3
```
Compiler: Solidity 0.8.19
Optimization: Yes
Runs: 200
Source Code: [粘贴 LicenseNFTV3_flat.sol 内容]
Constructor Arguments: 0x000000000000000000000000F98f63b7e8064Dcf9c2f25A906B2af89Af4840ce
```

### 5. 验证成功
验证成功后，合约源码将公开显示， ABI 自动解析。

## 构造参数编码

### ECHOFusionV2
```
地址参数: 0xF98f63b7e8064Dcf9c2f25A906B2af89Af4840ce
ABI 编码: 0x000000000000000000000000F98f63b7e8064Dcf9c2f25A906B2af89Af4840ce
```

### LicenseNFTV3
```
地址参数: 0xF98f63b7e8064Dcf9c2f25A906B2af89Af4840ce
ABI 编码: 0x000000000000000000000000F98f63b7e8064Dcf9c2f25A906B2af89Af4840ce
```

## 自动化验证（API）

如果 Qitmeer 支持 Blockscout API:

```bash
# ECHOAssetV2V3
curl -X POST "https://qng.qitmeer.io/api?module=contract&action=verify" \
  -H "Content-Type: application/json" \
  -d '{
    "addressHash": "0xF98f63b7e8064Dcf9c2f25A906B2af89Af4840ce",
    "compilerVersion": "v0.8.19+commit.7dd6d404",
    "contractSourceCode": "[粘贴源码]",
    "name": "ECHOAssetV2V3",
    "optimization": true,
    "optimizationRuns": 200
  }'
```

## 注意事项

1. **Flatten 源码**: 所有 import 已合并，无需额外文件
2. **SPDX 许可证**: MIT
3. **合约大小**: 
   - ECHOAssetV2: ~70KB
   - ECHOFusion: ~66KB
   - LicenseNFT: ~84KB
4. **Gas 优化**: 已启用 200 runs 优化

## 验证后检查清单

- [ ] 合约源码显示正确
- [ ] ABI 自动解析
- [ ] Read/Write 功能可交互
- [ ] 事件日志可解码
- [ ] 合约创建交易可追踪
