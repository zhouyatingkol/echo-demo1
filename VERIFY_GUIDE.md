# ECHO Protocol V3 合约验证指南
## Qitmeer 区块浏览器手动验证步骤

---

## 📋 合约信息汇总

### 1. ECHOAssetV2V3
| 项目 | 内容 |
|------|------|
| **合约地址** | `0xF98f63b7e8064Dcf9c2f25A906B2af89Af4840ce` |
| **交易哈希** | `0xffe9b254465323b96e00bec13786bef4719de964623b86394ebb968d60a5be75` |
| **合约名称** | ECHOAssetV2V3 |
| **编译器版本** | Solidity 0.8.19 |
| **优化** | 启用 (runs: 1) |
| **构造函数参数** | 无 |

### 2. ECHOFusion
| 项目 | 内容 |
|------|------|
| **合约地址** | `0x31Cd483Ee827A272816808AD49b90c71B1c82E11` |
| **交易哈希** | `0x7ace547390591b970ae7683abc35f2f1b17c0dd700b48406b7c0e7be221195bd` |
| **合约名称** | ECHOFusion |
| **编译器版本** | Solidity 0.8.19 |
| **优化** | 启用 (runs: 1) |
| **构造函数参数** | `0xF98f63b7e8064Dcf9c2f25A906B2af89Af4840ce` (ECHOAssetV2V3地址) |

### 3. LicenseNFTV3
| 项目 | 内容 |
|------|------|
| **合约地址** | `0x2f79b56047050FD2Ee7C62d2d0fe644c15c68e23` |
| **交易哈希** | `0xab93099d83ea59e88c26b65e26b45da66b60423a66cbd66148ceb6b9c4de1999` |
| **合约名称** | LicenseNFTV3 |
| **编译器版本** | Solidity 0.8.19 |
| **优化** | 启用 (runs: 1) |
| **构造函数参数** | `0xF98f63b7e8064Dcf9c2f25A906B2af89Af4840ce` (ECHOAssetV2V3地址) |

---

## 🔗 区块浏览器链接

- **ECHOAssetV2V3**: https://qng.qitmeer.io/address/0xF98f63b7e8064Dcf9c2f25A906B2af89Af4840ce
- **ECHOFusion**: https://qng.qitmeer.io/address/0x31Cd483Ee827A272816808AD49b90c71B1c82E11
- **LicenseNFTV3**: https://qng.qitmeer.io/address/0x2f79b56047050FD2Ee7C62d2d0fe644c15c68e23

---

## 📝 手动验证步骤

### 步骤 1: 访问区块浏览器
打开上述合约地址链接，点击 "Verify & Publish" 或 "验证合约" 按钮

### 步骤 2: 填写验证信息

#### 对于 ECHOAssetV2V3:
```
Contract Name: ECHOAssetV2V3
Compiler: v0.8.19+commit.7dd6d404
Optimization: Yes
Optimization Runs: 1
Constructor Arguments: (留空，无参数)
```

#### 对于 ECHOFusion:
```
Contract Name: ECHOFusion
Compiler: v0.8.19+commit.7dd6d404
Optimization: Yes
Optimization Runs: 1
Constructor Arguments: 000000000000000000000000f98f63b7e8064dcf9c2f25a906b2af89af4840ce
```

#### 对于 LicenseNFTV3:
```
Contract Name: LicenseNFTV3
Compiler: v0.8.19+commit.7dd6d404
Optimization: Yes
Optimization Runs: 1
Constructor Arguments: 000000000000000000000000f98f63b7e8064dcf9c2f25a906b2af89af4840ce
```

### 步骤 3: 上传合约源码
1. 复制 `flattened/ECHOAssetV2V3.sol` 中的全部内容
2. 粘贴到区块浏览器的源码输入框
3. 点击 "Verify" 或 "验证"

---

## 📁 文件位置

Flattened 合约文件已准备就绪：
- `/root/.openclaw/workspace/echo-demo/flattened/ECHOAssetV2V3.sol` (84KB)
- `/root/.openclaw/workspace/echo-demo/flattened/ECHOFusion.sol` (67KB)
- `/root/.openclaw/workspace/echo-demo/flattened/LicenseNFTV3.sol` (92KB)

---

## ⚠️ 常见问题

### 1. 编译器版本不匹配
确保选择 `v0.8.19+commit.7dd6d404` 或最接近的 0.8.19 版本

### 2. 优化设置错误
必须选择 **启用优化**，runs 设置为 **1**（我们为了减小合约大小使用了 viaIR 和 runs: 1）

### 3. 构造函数参数编码
ECHOFusion 和 LicenseNFTV3 需要一个地址参数：
- 原始地址: `0xF98f63b7e8064Dcf9c2f25A906B2af89Af4840ce`
- ABI 编码: `000000000000000000000000f98f63b7e8064dcf9c2f25a906b2af89af4840ce`

可以使用在线工具编码：https://abi.hashex.org/

---

## 🔧 Hardhat 自动验证（备用方案）

如果手动验证失败，可以尝试：

```bash
cd /root/.openclaw/workspace/echo-demo

# 验证 ECHOAssetV2V3 (无参数)
npx hardhat verify --network qitmeer 0xF98f63b7e8064Dcf9c2f25A906B2af89Af4840ce

# 验证 ECHOFusion (带参数)
npx hardhat verify --network qitmeer 0x31Cd483Ee827A272816808AD49b90c71B1c82E11 0xF98f63b7e8064Dcf9c2f25A906B2af89Af4840ce

# 验证 LicenseNFTV3 (带参数)
npx hardhat verify --network qitmeer 0x2f79b56047050FD2Ee7C62d2d0fe644c15c68e23 0xF98f63b7e8064Dcf9c2f25A906B2af89Af4840ce
```

---

## ✅ 验证成功标志

验证成功后，区块浏览器会显示：
- ✅ Contract Source Code Verified
- 可以看到所有合约函数和事件
- 可以读取合约状态变量

---

**准备就绪！可以开始验证了！** 🎉
