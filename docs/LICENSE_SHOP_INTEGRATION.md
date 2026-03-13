# ECHO License Shop - 合约交互集成说明

## 📁 新增文件

| 文件 | 说明 |
|------|------|
| `contract-manager-v3.js` | V3 合约交互管理器 |
| `license-shop.js` (更新) | 集成合约交互的商店逻辑 |
| `license-shop.html` (更新) | 包含合约管理器脚本 |

---

## 🔗 合约集成架构

```
license-shop.html
    ├── wallet.js (钱包连接)
    ├── contract-manager-v3.js (合约交互)
    └── license-shop.js (业务逻辑)
        └── 调用 ContractManagerV3
            └── 调用 LicenseNFTV3 合约
```

---

## 🎯 已实现功能

### 1. 实时价格获取
- ✅ 从合约读取资产基础价格
- ✅ 从合约读取场景倍率
- ✅ 从合约读取平台费率

### 2. License 购买
- ✅ `purchaseOneTime()` - 买断制购买
- ✅ `purchasePerUse()` - 按次计费购买
- ✅ `purchaseTimed()` - 限时授权购买

### 3. 用户交互
- ✅ 连接钱包检测
- ✅ 购买确认对话框
- ✅ 交易状态反馈
- ✅ 错误处理

---

## 📝 使用说明

### 页面加载流程

1. **加载配置** - `contract-config.js` 提供合约地址
2. **连接钱包** - `wallet.js` 处理钱包连接
3. **初始化合约** - `contract-manager-v3.js` 创建合约实例
4. **加载价格** - 从合约读取实时价格
5. **用户交互** - 选择授权类型和场景，计算价格
6. **购买** - 调用合约函数完成购买

### 购买流程

```javascript
// 用户点击购买按钮
handlePurchase()
    ├── 检查钱包连接
    ├── 计算价格
    ├── 显示确认对话框
    ├── 调用 purchaseLicense()
    │   └── contractManager.purchaseOneTime/PerUse/Timed()
    │       └── 发送交易到区块链
    └── 显示交易结果
```

---

## 🔧 合约地址 (V3)

```javascript
const ADDRESSES = {
    echoAsset: '0xF98f63b7e8064Dcf9c2f25A906B2af89Af4840ce',
    echoFusion: '0x31Cd483Ee827A272816808AD49b90c71B1c82E11',
    licenseNFT: '0x2f79b56047050FD2Ee7C62d2d0fe644c15c68e23'
};
```

---

## 💡 重要枚举值

### UsageType (使用场景)
```javascript
const UsageType = {
    PERSONAL: 0,      // 个人创作
    GAME: 1,          // 游戏配乐
    AI_TRAINING: 2,   // AI训练
    COMMERCIAL: 3,    // 商业广告
    BROADCAST: 4,     // 广播/电视
    STREAMING: 5      // 流媒体
};
```

### LicenseType (授权类型)
```javascript
const LicenseType = {
    ONE_TIME: 0,      // 买断制
    PER_USE: 1,       // 按次计费
    TIMED: 2          // 限时授权
};
```

---

## ⚠️ 注意事项

1. **资产ID**: 当前使用硬编码 `assetId = 1`，实际应从 URL 参数获取
2. **价格精度**: 所有价格计算使用 MEER，合约交互时转换为 wei
3. **错误处理**: 需要钱包连接和合约初始化才能购买
4. **Gas 费**: 用户需要支付 MEER 作为 Gas 费

---

## 🚀 下一步优化

- [ ] 从 URL 参数获取资产ID
- [ ] 添加交易历史记录
- [ ] 添加 License NFT 展示
- [ ] 集成 IPFS 音频播放
- [ ] 添加加载动画

---

**集成完成！现在可以在浏览器中测试购买流程了！** 🎉
