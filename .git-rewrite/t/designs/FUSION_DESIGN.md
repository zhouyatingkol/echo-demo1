# ECHO Fusion 架构设计文档

## 1. 核心概念

### 1.1 比喻说明
- **种子 (Seed)**: 单个ECHO资产（已有）
- **树 (Tree)**: 多个种子融合后的新资产
- **果实 (Fruit)**: 树产生的收益

### 1.2 融合规则

#### 谁可以融合？
- 必须是种子的**所有权所有者**
- 可以选择用自己的多个种子融合
- 也可以和他人协作（各方提供种子）

#### 融合条件
- 最少2颗种子
- 最多10颗种子（防止过于复杂）
- 一颗种子只能属于一棵树（防止重复）

#### 权益分配
树的四权分配基于种子的"价值权重"：
- 每颗种子可以设置权重（默认1:1:1...）
- 树的使用权 = 按权重比例分配
- 树的收益权 = 按权重比例分配
- 衍生权和扩展权可以由所有种子所有者共同拥有

## 2. 合约架构

### 2.1 数据结构

```solidity
struct Tree {
    uint256 treeId;
    string name;
    string description;
    uint256[] parentSeeds;  // 父种子tokenIds
    uint256[] weights;      // 每颗种子的权重
    Rights rights;          // 四权配置
    uint256 createdAt;
    uint256 totalRevenue;   // 累计收益
}

struct SeedInTree {
    uint256 treeId;         // 属于哪棵树
    uint256 weight;         // 在这棵树中的权重
    bool isActive;          // 是否还在树中（不能退出）
}
```

### 2.2 核心功能

#### 融合铸造
```solidity
function fuseTrees(
    uint256[] memory seedTokenIds,
    uint256[] memory weights,
    string memory name,
    string memory description,
    Rights memory treeRights
) external returns (uint256 treeId);
```

#### 收益分配
```solidity
function distributeRevenue(uint256 treeId) external payable;
function claimRevenue(uint256 treeId, uint256 seedIndex) external;
```

#### 查询
```solidity
function getTreeInfo(uint256 treeId) external view returns (Tree memory);
function getSeedTrees(uint256 seedId) external view returns (uint256[] memory);
```

## 3. 前端交互流程

### 3.1 融合页面
1. **选择种子** - 用户从自己的资产中选择要融合的种子
2. **设置权重** - 拖动滑块调整每颗种子的贡献比例
3. **配置权利** - 设置树的四权所有者
4. **预览确认** - 显示融合后的权益分配预览
5. **确认融合** - 签名交易，铸造树资产

### 3.2 树的展示
- 树形结构图展示父子关系
- 显示每颗种子的权重和收益占比
- 累计收益统计

## 4. 技术要点

### 4.1 与ECHOAsset的关系
- ECHOFusion合约需要调用ECHOAsset的ownerOf()验证所有权
- 融合后，种子的使用权可以保留给原所有者，但收益权部分转移给树

### 4.2 安全考虑
- 防止同一颗种子被多次融合
- 防止权重计算溢出
- 防止收益分配重入攻击

### 4.3 Gas优化
- 限制最多10颗种子
- 使用Merkle树存储大数组
- 收益累积模式而非实时分配

## 5. UI设计建议

### 5.1 视觉风格
- 保持与ECHO Protocol一致的科技感
- 树形结构用可视化图形展示
- 权重调整用直观的饼图/柱状图

### 5.2 文案规范
- "选择你的种子" → 选择要融合的资产
- "培育新树" → 融合铸造
- "收获果实" → 领取收益

---

设计完成 ✓