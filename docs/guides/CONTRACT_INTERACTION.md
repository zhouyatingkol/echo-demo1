# ECHO Protocol - 合约交互指南

本指南介绍如何与 ECHO Protocol 智能合约进行交互。

---

## 📍 合约地址

### Qitmeer 主网（生产环境）

| 合约 | 地址 | 版本 | 状态 |
|------|------|------|------|
| **ECHOAssetV2V3** | `0xF98f63b7e8064Dcf9c2f25A906B2af89Af4840ce` | V3.0.0 | ✅ 已验证 |
| **ECHOFusionV2** | `0x8Eb7a29C41478a3f32015C1330DFf7cc683d0952` | V2.0.0 | ✅ 已验证 |
| **LicenseNFTV3** | `0x2f79b56047050FD2Ee7C62d2d0fe644c15c68e23` | V3.0.0 | ✅ 已验证 |

### Qitmeer 测试网

| 合约 | 地址 | 版本 | 状态 |
|------|------|------|------|
| ECHOAssetV2V3 | 部署后获取 | V3.0.0 | 🧪 测试 |
| ECHOFusionV2 | 部署后获取 | V2.0.0 | 🧪 测试 |
| LicenseNFTV3 | 部署后获取 | V3.0.0 | 🧪 测试 |

### 区块浏览器

- **主网**: https://qng.qitmeer.io
- **测试网**: https://testnet-qng.qitmeer.io

---

## 📚 ABI 使用说明

### 获取 ABI

ABI（Application Binary Interface）文件位于：

```
frontend/abi.js          # 前端使用的 ABI
contracts/artifacts/     # Hardhat 编译生成的 ABI
```

### 在前端初始化合约

```javascript
// 1. 定义合约地址和 ABI
const CONTRACT_ADDRESS = '0xF98f63b7e8064Dcf9c2f25A906B2af89Af4840ce';
const CONTRACT_ABI = [/* ABI 数组 */];

// 2. 使用 ethers.js 连接合约
async function initContract() {
    // 请求用户连接钱包
    await window.ethereum.request({ method: 'eth_requestAccounts' });
    
    // 创建 provider
    const provider = new ethers.providers.Web3Provider(window.ethereum);
    
    // 创建 signer
    const signer = provider.getSigner();
    
    // 创建合约实例
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
    
    return contract;
}
```

### 合约实例方法

```javascript
// 读取操作（无需 Gas）
const name = await contract.name();
const balance = await contract.balanceOf(address);

// 写入操作（需要 Gas 和签名）
const tx = await contract.mintAsset(params);
await tx.wait();  // 等待交易确认
```

---

## 🔧 常用方法示例

### ECHOAssetV2V3 合约

#### 1. 生成资产（Mint）

```javascript
// 生成新的 ECHO 资产
async function mintAsset(name, description, assetType, uri, rightsBlueprint) {
    const contract = await initContract();
    
    // 构建权属蓝图
    const blueprint = {
        usage: {
            owner: rightsBlueprint.usage.owner,
            fee: ethers.utils.parseEther(rightsBlueprint.usage.fee.toString()),
            commercialUse: rightsBlueprint.usage.commercialUse,
            modificationAllowed: rightsBlueprint.usage.modificationAllowed,
            allowedScopes: rightsBlueprint.usage.allowedScopes,
            restrictedScopes: rightsBlueprint.usage.restrictedScopes,
            maxUsers: rightsBlueprint.usage.maxUsers,
            licenseDuration: rightsBlueprint.usage.licenseDuration
        },
        derivative: {
            owner: rightsBlueprint.derivative.owner,
            fee: ethers.utils.parseEther(rightsBlueprint.derivative.fee.toString()),
            allowDerivatives: rightsBlueprint.derivative.allowDerivatives,
            revenueShare: rightsBlueprint.derivative.revenueShare,
            allowedTypes: rightsBlueprint.derivative.allowedTypes
        },
        extension: {
            owner: rightsBlueprint.extension.owner,
            fee: ethers.utils.parseEther(rightsBlueprint.extension.fee.toString()),
            allowExtensions: rightsBlueprint.extension.allowExtensions,
            allowedExtensions: rightsBlueprint.extension.allowedExtensions
        },
        revenue: {
            owner: rightsBlueprint.revenue.owner,
            sharePercentage: rightsBlueprint.revenue.sharePercentage,
            autoDistribute: rightsBlueprint.revenue.autoDistribute
        }
    };
    
    // 计算内容哈希（示例）
    const contentHash = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(name + description)
    );
    
    try {
        const tx = await contract.mintAsset(
            name,
            description,
            assetType,
            uri,
            contentHash,
            blueprint
        );
        
        const receipt = await tx.wait();
        console.log('资产生成成功，交易哈希:', receipt.transactionHash);
        
        // 获取新生成的 tokenId
        const tokenId = receipt.events.find(e => e.event === 'AssetMinted').args.tokenId;
        return tokenId;
    } catch (error) {
        console.error('生成失败:', error);
        throw error;
    }
}
```

#### 2. 获取资产信息

```javascript
// 读取资产元数据
async function getAssetInfo(tokenId) {
    const contract = await initContract();
    
    try {
        // 获取元数据
        const metadata = await contract.assetMetadata(tokenId);
        
        // 获取权属蓝图
        const rights = await contract.rightsBlueprint(tokenId);
        
        // 获取所有者
        const owner = await contract.ownerOf(tokenId);
        
        return {
            name: metadata.name,
            description: metadata.description,
            assetType: metadata.assetType,
            uri: metadata.uri,
            contentHash: metadata.contentHash,
            createdAt: metadata.createdAt.toNumber(),
            owner: owner,
            rights: {
                usage: rights.usage,
                derivative: rights.derivative,
                extension: rights.extension,
                revenue: rights.revenue
            }
        };
    } catch (error) {
        console.error('获取资产信息失败:', error);
        throw error;
    }
}
```

#### 3. 转让权利

```javascript
// 转让特定权利
async function transferRight(tokenId, rightType, toAddress) {
    const contract = await initContract();
    
    try {
        const tx = await contract.transferRight(tokenId, rightType, toAddress);
        const receipt = await tx.wait();
        
        console.log('权利转让成功:', receipt.transactionHash);
        return receipt;
    } catch (error) {
        console.error('权利转让失败:', error);
        throw error;
    }
}

// 使用示例
transferRight(123, 'usage', '0xRecipientAddress...');
```

### LicenseNFTV3 合约

#### 1. 购买买断制授权

```javascript
// 购买一次性买断授权
async function purchaseLicense(tokenId, usageType) {
    const contract = await initContract();
    
    // 获取价格
    const price = await contract.calculatePrice(tokenId, usageType, 0);
    
    try {
        const tx = await contract.purchaseOneTime(tokenId, usageType, {
            value: price.totalPrice
        });
        
        const receipt = await tx.wait();
        console.log('购买成功，License ID:', receipt.events[0].args.licenseId);
        return receipt;
    } catch (error) {
        console.error('购买失败:', error);
        throw error;
    }
}
```

#### 2. 购买按次计费授权

```javascript
// 购买按次计费授权
async function purchasePerUse(tokenId, usageType, useCount) {
    const contract = await initContract();
    
    // 计算价格
    const price = await contract.calculatePrice(tokenId, usageType, useCount);
    
    try {
        const tx = await contract.purchasePerUse(tokenId, usageType, useCount, {
            value: price.totalPrice
        });
        
        const receipt = await tx.wait();
        return receipt;
    } catch (error) {
        console.error('购买失败:', error);
        throw error;
    }
}
```

#### 3. 购买限时授权

```javascript
// 购买限时授权
async function purchaseTimeLicense(tokenId, usageType, days) {
    const contract = await initContract();
    
    // 计算价格
    const price = await contract.calculatePrice(tokenId, usageType, days);
    
    try {
        const tx = await contract.purchaseTimeBased(tokenId, usageType, days, {
            value: price.totalPrice
        });
        
        const receipt = await tx.wait();
        return receipt;
    } catch (error) {
        console.error('购买失败:', error);
        throw error;
    }
}
```

### ECHOFusionV2 合约

#### 1. 融合资产

```javascript
// 融合多个资产
async function fuseAssets(assetIds, weights, fusionName, fusionDescription) {
    const contract = await initContract();
    
    // 确保权重总和为 10000（100%）
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    if (totalWeight !== 10000) {
        throw new Error('权重总和必须等于 10000 (100%)');
    }
    
    try {
        const tx = await contract.createFusion(
            assetIds,
            weights,
            fusionName,
            fusionDescription
        );
        
        const receipt = await tx.wait();
        const fusionId = receipt.events.find(e => e.event === 'FusionCreated').args.fusionId;
        
        console.log('融合成功，融合 ID:', fusionId);
        return fusionId;
    } catch (error) {
        console.error('融合失败:', error);
        throw error;
    }
}
```

---

## 📡 事件监听示例

### 监听资产生成事件

```javascript
// 监听 AssetMinted 事件
function listenForNewAssets() {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    
    contract.on('AssetMinted', (tokenId, creator, contentHash, name, timestamp, event) => {
        console.log('新资产生成!');
        console.log('Token ID:', tokenId.toString());
        console.log('创作者:', creator);
        console.log('名称:', name);
        console.log('时间戳:', new Date(timestamp.toNumber() * 1000));
    });
}

// 停止监听
contract.removeAllListeners('AssetMinted');
```

### 监听权利转让事件

```javascript
// 监听 RightTransferred 事件
function listenForRightTransfers() {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    
    contract.on('RightTransferred', (tokenId, rightType, from, to, timestamp, event) => {
        console.log(`权利转让: ${rightType}`);
        console.log('资产 ID:', tokenId.toString());
        console.log('从:', from);
        console.log('到:', to);
    });
}
```

### 监听授权购买事件

```javascript
// 监听 LicenseIssued 事件
function listenForLicensePurchases() {
    const licenseContract = new ethers.Contract(LICENSE_ADDRESS, LICENSE_ABI, provider);
    
    licenseContract.on('LicenseIssued', (licenseId, parentAssetId, owner, licenseType, event) => {
        console.log('新授权购买!');
        console.log('License ID:', licenseId.toString());
        console.log('资产 ID:', parentAssetId.toString());
        console.log('购买者:', owner);
        console.log('授权类型:', licenseType);
    });
}
```

### 查询历史事件

```javascript
// 查询过去的事件
async function queryPastEvents() {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, provider);
    
    // 获取当前区块号
    const currentBlock = await provider.getBlockNumber();
    
    // 查询过去 1000 个区块的事件
    const filter = contract.filters.AssetMinted();
    const events = await contract.queryFilter(filter, currentBlock - 1000, currentBlock);
    
    console.log(`找到 ${events.length} 个资产生成事件`);
    
    events.forEach(event => {
        console.log('Token ID:', event.args.tokenId.toString());
        console.log('创作者:', event.args.creator);
    });
}
```

---

## ⚠️ 错误处理指南

### 常见错误码

| 错误信息 | 原因 | 解决方案 |
|----------|------|----------|
| `Asset does not exist` | 资产 ID 不存在 | 检查 tokenId 是否正确 |
| `Not asset creator` | 不是资产创建者 | 使用正确的钱包地址 |
| `Not usage owner` | 不是使用权所有者 | 检查权利所有者地址 |
| `Invalid price` | 价格参数无效 | 确保价格大于 0 |
| `Insufficient payment` | 支付的 MEER 不足 | 增加支付的金额 |
| `Asset not for sale` | 资产不出售 | 检查资产销售状态 |
| `License expired` | 授权已过期 | 重新购买授权 |
| `ReentrancyGuard: reentrant call` | 重入攻击保护 | 正常调用，避免递归 |
| `Pausable: paused` | 合约已暂停 | 等待合约恢复 |

### 错误处理示例

```javascript
async function safeContractCall(contract, method, ...args) {
    try {
        const result = await contract[method](...args);
        return { success: true, data: result };
    } catch (error) {
        // 解析错误信息
        let errorMessage = '未知错误';
        
        if (error.code === 'ACTION_REJECTED') {
            errorMessage = '用户取消了交易';
        } else if (error.code === 'INSUFFICIENT_FUNDS') {
            errorMessage = '余额不足，无法支付 Gas 费用';
        } else if (error.reason) {
            errorMessage = error.reason;
        } else if (error.message) {
            // 提取 Solidity 错误信息
            const match = error.message.match(/reason="([^"]+)"/);
            if (match) {
                errorMessage = match[1];
            } else {
                errorMessage = error.message;
            }
        }
        
        console.error('合约调用失败:', errorMessage);
        return { success: false, error: errorMessage };
    }
}

// 使用示例
const result = await safeContractCall(contract, 'mintAsset', params);
if (!result.success) {
    alert(`操作失败: ${result.error}`);
}
```

### Gas 估算

```javascript
// 估算 Gas 费用
async function estimateGas(contract, method, ...args) {
    try {
        const gasEstimate = await contract.estimateGas[method](...args);
        const gasPrice = await provider.getGasPrice();
        const estimatedCost = gasEstimate.mul(gasPrice);
        
        console.log('预估 Gas:', gasEstimate.toString());
        console.log('预估费用:', ethers.utils.formatEther(estimatedCost), 'MEER');
        
        return {
            gasEstimate,
            estimatedCost
        };
    } catch (error) {
        console.error('Gas 估算失败:', error);
        throw error;
    }
}
```

---

## 🔐 安全最佳实践

1. **永远不要在前端暴露私钥**
   ```javascript
   // ❌ 错误
   const wallet = new ethers.Wallet(privateKey, provider);
   
   // ✅ 正确 - 使用 MetaMask
   const provider = new ethers.providers.Web3Provider(window.ethereum);
   const signer = provider.getSigner();
   ```

2. **验证合约地址**
   ```javascript
   // 检查地址有效性
   if (!ethers.utils.isAddress(contractAddress)) {
       throw new Error('无效的合约地址');
   }
   ```

3. **等待交易确认**
   ```javascript
   // 始终等待交易确认
   const tx = await contract.someMethod();
   const receipt = await tx.wait();
   
   // 检查交易状态
   if (receipt.status === 1) {
       console.log('交易成功');
   } else {
       console.log('交易失败');
   }
   ```

4. **处理大数**
   ```javascript
   // 使用 BigNumber 处理大数
   const balance = await contract.balanceOf(address);
   const formatted = ethers.utils.formatEther(balance);  // 转换为可读的 MEER
   ```

---

*文档版本: 1.0*  
*最后更新: 2026-03-14*
