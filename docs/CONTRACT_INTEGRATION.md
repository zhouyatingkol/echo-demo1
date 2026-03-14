# ECHO 智能合约集成文档

## 概述

本文档描述 ECHO 平台与 Qitmeer 主网智能合约的集成实现。

## 合约信息

| 合约 | 地址 | 版本 |
|------|------|------|
| ECHOAssetV2V3 | `0xF98f63b7e8064Dcf9c2f25A906B2af89Af4840ce` | 3.0.0 |
| LicenseNFTV3 | `0x2f79b56047050FD2Ee7C62d2d0fe644c15c68e23` | 3.0.0 |
| ECHOFusionV2 | `0x8Eb7a29C41478a3f32015C1330DFf7cc683d0952` | 2.0.0 |

**网络**: Qitmeer Mainnet (Chain ID: 813)  
**RPC**: https://qng.rpc.qitmeer.io  
**浏览器**: https://qng.qitmeer.io

## 核心模块

### 1. 合约服务 (`scripts/core/contract-service.js`)

封装所有智能合约交互的底层服务。

#### 主要方法

**ECHOAssetV2V3 合约:**
- `mintECHO(metadata, rightsConfig)` - 铸造新作品
- `getAssetInfo(tokenId)` - 获取作品信息
- `getCurrentTokenId()` - 获取当前 Token ID

**LicenseNFTV3 合约:**
- `purchaseOneTime(assetId, usageType)` - 购买一次性授权
- `purchasePerUse(assetId, usageType, usageCount)` - 购买按次授权
- `purchaseTimed(assetId, usageType, days)` - 购买限时授权
- `calculateLicensePrice(...)` - 计算授权价格
- `getLicenseInfo(licenseId)` - 获取 License 信息

#### 枚举定义

```javascript
// UsageType 使用场景
UsageType.PERSONAL = 0      // 个人创作
UsageType.GAME = 1          // 游戏配乐
UsageType.AI_TRAINING = 2   // AI 训练
UsageType.COMMERCIAL = 3    // 商业广告
UsageType.BROADCAST = 4     // 广播
UsageType.STREAMING = 5     // 流媒体

// LicenseType 授权类型
LicenseType.ONE_TIME = 0    // 买断制
LicenseType.PER_USE = 1     // 按次计费
LicenseType.TIMED = 2       // 限时授权
```

### 2. 铸造服务 (`scripts/core/mint-service.js`)

处理作品上链的完整流程。

#### 铸造状态

```javascript
MintStatus.IDLE             // 空闲
MintStatus.UPLOADING        // 上传中
MintStatus.BUILDING_METADATA // 构建元数据
MintStatus.APPROVING        // 等待授权
MintStatus.CONFIRMING       // 等待确认
MintStatus.SUCCESS          // 成功
MintStatus.ERROR            // 失败
```

#### 使用示例

```javascript
const mintService = new MintService();

mintService.setCallbacks({
    onStatusChange: (status, progress) => {
        console.log(`Status: ${status}, Progress: ${progress}%`);
    },
    onSuccess: (result) => {
        console.log('Minted!', result.tokenId);
    },
    onError: (error) => {
        console.error('Failed:', error);
    }
});

await mintService.mint({
    name: '作品名称',
    description: '作品描述',
    assetType: 'music',
    file: fileObject,
    buyoutPrice: 100,
    perUsePrice: 0.5,
    dailyPrice: 10
});
```

### 3. 钱包模块 (`scripts/core/wallet.js`)

增强的钱包连接功能。

#### 主要功能

- 支持 MetaMask 和其他 EVM 钱包
- 自动检测 Qitmeer 网络
- 一键切换网络
- 账户变更监听
- Toast 通知系统

#### 使用示例

```javascript
// 自动连接
await walletManager.autoConnect();

// 手动连接
const result = await walletManager.connect();
if (result.success) {
    console.log('Connected:', result.address);
}

// 切换网络
await walletManager.switchToQitmeer();

// 确保正确网络
await walletManager.ensureCorrectNetwork();
```

## 页面集成

### 作品生成页面 (`pages/creator/mint.html`)

**新增功能:**
1. 钱包连接检查
2. 网络状态提示
3. 交易状态模态框
4. 智能合约铸造调用

**流程:**
1. 用户填写作品信息
2. 上传文件到 IPFS (模拟/真实)
3. 配置权益和价格
4. 检查钱包连接
5. 调用 `mintService.mint()`
6. 显示交易状态
7. 成功后跳转到作品详情

### 作品详情页面 (`pages/market/work-detail.html`)

**新增功能:**
1. 授权购买模态框
2. 三合一授权模式选择
3. 使用场景选择
4. 价格实时计算
5. 智能合约购买调用

**流程:**
1. 用户点击"立即购买"
2. 检查/连接钱包
3. 选择授权类型 (买断/按次/限时)
4. 选择使用场景
5. 设置数量/时长 (如需要)
6. 显示价格明细
7. 调用合约购买函数
8. 显示交易结果

## 价格计算

### 授权价格公式

```
基础价格 = 作品设置的对应类型价格
调整后价格 = 基础价格 × 场景倍率 × 数量
平台费 = 调整后价格 × 5%
总计 = 调整后价格 + 平台费
```

### 场景倍率

| 场景 | 倍率 |
|------|------|
| 个人创作 | ×1.0 |
| 游戏配乐 | ×1.5 |
| AI 训练 | ×2.0 |
| 商业广告 | ×3.0 |
| 广播 | ×2.5 |
| 流媒体 | ×1.2 |

## 错误处理

### 常见错误码

| 错误 | 说明 | 处理 |
|------|------|------|
| 4001 | 用户取消 | 提示用户重新操作 |
| 4902 | 链未添加 | 自动添加 Qitmeer 网络 |
| insufficient funds | 余额不足 | 提示充值 |

### 合约错误

- `InvalidRightsBlueprint` - 权益配置无效
- `AssetNotFound` - 作品不存在
- `LicenseNotAvailable` - 授权不可用
- `InsufficientPayment` - 支付金额不足

## 测试

### 合约测试页面

访问 `test-contract.html` 进行以下测试:
1. 钱包连接测试
2. 网络切换测试
3. 合约读取测试

### 主要测试用例

1. **铸造测试**
   - 连接钱包
   - 填写作品信息
   - 确认交易
   - 验证 Token ID 生成

2. **购买测试**
   - 选择授权类型
   - 选择使用场景
   - 确认价格
   - 完成购买
   - 验证 License NFT

## 安全注意事项

1. 私钥永不暴露
2. 所有交易需用户确认
3. 价格计算双重验证
4. 交易状态实时反馈
5. 错误信息友好显示

## 后续优化

1. 接入真实 IPFS 服务
2. 添加更多钱包支持
3. 实现批量购买
4. 添加授权验证功能
5. 集成更多合约功能

## 参考链接

- [Ethers.js v6 文档](https://docs.ethers.org/v6/)
- [Qitmeer 文档](https://github.com/Qitmeer)
- [MetaMask 文档](https://docs.metamask.io/)
