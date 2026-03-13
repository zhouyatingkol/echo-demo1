# ECHO Protocol 合约验证指南

## 合约部署信息

### 网络信息
- **网络**: Qitmeer Mainnet
- **Chain ID**: 813
- **区块浏览器**: https://qng.qitmeer.io

### 合约列表

| 合约 | 地址 | 区块 | 交易哈希 |
|------|------|------|----------|
| ECHOAssetV2 | 0x6195f16cb8d32397032c6031e89c567a5fdbec9d | 2588530 | 0xf57c907d8207a8a1032b90c7352d939d83614cf51cfe9d6b95ec21ef7115b312 |
| ECHOFusion | 0xa91499036db8a9501d4116c12114d24a906d7b97 | 2588532 | 0x76b47467526ca2227b877422edb82cd5ca33e403c8f7bdaf8cd4acafe049a61d |
| LicenseNFT | 0x13c0637d86d179b66f22e0806c98b34bdbf48adf | 2588533 | 0xf727fb1d454d373e188beacbf65ff4f838a12bc83a345d3e0a88c202f482b57a |

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

#### ECHOFusion
```
Compiler: Solidity 0.8.19
Optimization: Yes
Runs: 200
Source Code: [粘贴 ECHOFusion_flat.sol 内容]
Constructor Arguments: 0x0000000000000000000000006195f16cb8d32397032c6031e89c567a5fdbec9d
```

#### LicenseNFT
```
Compiler: Solidity 0.8.19
Optimization: Yes
Runs: 200
Source Code: [粘贴 LicenseNFT_flat.sol 内容]
Constructor Arguments: 0x0000000000000000000000006195f16cb8d32397032c6031e89c567a5fdbec9d
```

### 5. 验证成功
验证成功后，合约源码将公开显示， ABI 自动解析。

## 构造参数编码

### ECHOFusion
```
地址参数: 0x6195f16cb8d32397032c6031e89c567a5fdbec9d
ABI 编码: 0x0000000000000000000000006195f16cb8d32397032c6031e89c567a5fdbec9d
```

### LicenseNFT
```
地址参数: 0x6195f16cb8d32397032c6031e89c567a5fdbec9d
ABI 编码: 0x0000000000000000000000006195f16cb8d32397032c6031e89c567a5fdbec9d
```

## 自动化验证（API）

如果 Qitmeer 支持 Blockscout API:

```bash
# ECHOAssetV2
curl -X POST "https://qng.qitmeer.io/api?module=contract&action=verify" \
  -H "Content-Type: application/json" \
  -d '{
    "addressHash": "0x6195f16cb8d32397032c6031e89c567a5fdbec9d",
    "compilerVersion": "v0.8.19+commit.7dd6d404",
    "contractSourceCode": "[粘贴源码]",
    "name": "ECHOAssetV2",
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
