# ECHO Protocol 未来功能规划

## 🚀 Phase 4: 交易市场 (Marketplace)

### 功能概述
让用户可以买卖ECHO资产（种子和树）

### 核心功能

#### 1. 挂单出售
```solidity
function listAsset(
    uint256 tokenId,
    uint256 price,
    address assetType  // "ECHOAsset" or "ECHOFusion"
) external;
```

#### 2. 购买资产
```solidity
function buyAsset(uint256 listingId) external payable;
```

#### 3. 取消挂单
```solidity
function cancelListing(uint256 listingId) external;
```

#### 4. 查询市场
```solidity
function getListings() external view returns (Listing[] memory);
function getListingsByType(string memory assetType) external view returns (Listing[] memory);
```

### 前端界面
- 市场首页：展示所有在售资产
- 资产详情页：显示价格、历史、出售按钮
- 我的挂单：管理自己发布的出售
- 购买确认：MetaMask支付流程

### 技术要点
- 手续费：平台收取2%交易费
- 版税：创作者可设置转售版税（0-10%）
- 即时交易：无需等待确认

---

## 🍎 Phase 5: 果实NFT (Fruit NFT)

### 功能概述
树产生的收益以"果实"形式体现，果实本身也是NFT

### 核心概念
- **果实**：树产生的可交易收益凭证
- **成熟**：果实随时间成熟，价值增长
- **采摘**：所有者可以采摘果实获得收益

### 智能合约设计

```solidity
contract ECHOFruit is ERC721 {
    struct Fruit {
        uint256 fruitId;
        uint256 parentTreeId;    // 来自哪棵树
        uint256 birthTime;       // 创建时间
        uint256 maturityTime;    // 成熟时间
        uint256 value;           // 价值（MEER）
        bool isPicked;           // 是否已被采摘
    }
    
    // 树产生果实
    function growFruit(uint256 treeId) external;
    
    // 采摘果实（获得MEER）
    function pickFruit(uint256 fruitId) external;
    
    // 交易果实（无需成熟）
    function transferFruit(address to, uint256 fruitId) external;
}
```

### 游戏化设计

#### 果实类型
| 类型 | 成熟时间 | 收益率 | 稀有度 |
|------|---------|--------|--------|
| 普通果实 | 7天 | 5% | 70% |
| 稀有果实 | 14天 | 15% | 25% |
| 传说果实 | 30天 | 50% | 5% |

#### 互动玩法
- **施肥**：支付MEER加速果实成熟
- **守护**：防止他人偷取（可选功能）
- **合成**：多个低级果实合成高级果实

### 前端界面
- 我的果园：展示所有树的果实
- 果实市场：买卖果实
- 成熟倒计时：显示果实成熟时间
- 采摘动画：获得收益的视觉效果

---

## 📊 Phase 6: DAO治理

### 功能概述
让ECHO持有者参与协议治理

### 治理内容
- 平台手续费调整
- 新功能投票
- 紧急暂停/恢复
- 合约升级决策

### 代币设计
```solidity
contract ECHOGovernance is ERC20 {
    // 质押ECHO获得治理代币
    function stake(uint256 amount) external;
    
    // 创建提案
    function propose(string memory description, bytes memory callData) external;
    
    // 投票
    function vote(uint256 proposalId, bool support) external;
    
    // 执行
    function execute(uint256 proposalId) external;
}
```

---

## 🎯 开发优先级

### 高优先级（推荐先做）
1. **交易市场** - 产生收入，提高资产流动性
2. **前端完善** - 融合界面、收益界面

### 中优先级
3. **果实NFT** - 增加趣味性，提高留存

### 低优先级
4. **DAO治理** - 用户量大了再做

---

## 💰 预估开发成本

| 功能 | 合约开发 | 前端开发 | 测试审计 | 总计 |
|------|---------|---------|---------|------|
| 交易市场 | 3天 | 5天 | 2天 | 10天 |
| 果实NFT | 5天 | 7天 | 3天 | 15天 |
| DAO治理 | 7天 | 5天 | 3天 | 15天 |
| **总计** | | | | **40天** |

### Gas费用预估
- 部署交易市场：~0.1 MEER
- 部署果实NFT：~0.15 MEER
- 部署DAO：~0.2 MEER
- **总计：~0.45 MEER**

---

## 🚀 推荐路线图

### 本周
- ✅ ECHOAsset（种子） - 已完成
- ✅ ECHOFusion（树） - 已完成
- 🔄 前端界面完善 - 进行中

### 下周
- 🎯 交易市场开发
- 🎯 前端市场界面

### 下下周
- 🎯 果实NFT开发
- 🎯 前端果园界面

### 一个月后
- 🎯 DAO治理（可选）

---

规划完成 ✓