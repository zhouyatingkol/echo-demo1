# ECHO 权属蓝图技术方案 v0.1

> 文档版本：2026-03-12  
> 文档状态：技术草案  
> 适用范围：ECHO Music V1.0

---

## 一、核心概念定义

### 1.1 什么是权属蓝图（Rights Blueprint）

权属蓝图是 ECHO 协议的核心创新，它将传统版权的"模糊权利"转化为**链上可编程、可验证、可流转**的智能合约结构。

**与传统版权的区别：**

| 维度 | 传统版权 | ECHO 权属蓝图 |
|------|---------|--------------|
| 载体 | 纸质合同/法律文件 | 链上智能合约 |
| 验证 | 法院诉讼 | 链上即时验证 |
| 流转 | 复杂法律程序 | 一键授权/转让 |
| 收益 | 月结/季结 | 实时自动分配 |
| 使用追踪 | 难以监控 | 全程链上记录 |

### 1.2 四权分离模型

每个 ECHO 资产包含四个独立的权利维度：

```solidity
struct RightsBlueprint {
    UsageRights usage;           // 使用权
    DerivativeRights derivative; // 衍生权
    ExtensionRights extension;   // 扩展权
    RevenueRights revenue;       // 收益权
}
```

---

## 二、权利维度详解

### 2.1 使用权（Usage Rights）

**定义**：允许使用方在特定场景、特定时间、特定次数内使用该音乐资产。

**核心参数：**
```solidity
struct UsageRights {
    // 授权模式
    bool allowOneTimePurchase;    // 允许买断
    bool allowPerUse;             // 允许按次计费
    bool allowTimedLicense;       // 允许限时授权
    
    // 价格配置
    uint256 oneTimePrice;         // 买断价格 (MEER)
    uint256 perUsePrice;          // 单次价格 (MEER)
    uint256 dailyPrice;           // 日租价格 (MEER)
    uint256 minDuration;          // 最低购买时长 (天)
    
    // 使用限制
    UsageType[] allowedTypes;     // 允许的使用场景
    uint256 maxUsagePerDay;       // 每日最大使用次数
    bool requiresAttribution;     // 是否需要署名
}

enum UsageType {
    PERSONAL,      // 个人创作
    GAME,          // 游戏配乐
    AI_TRAINING,   // AI训练
    COMMERCIAL,    // 商业广告
    BROADCAST,     // 广播/电视
    STREAMING      // 流媒体
}
```

**场景倍率定价：**
- 个人创作：×1.0
- 游戏配乐：×1.5
- AI训练：×2.0
- 商业广告：×3.0

### 2.2 衍生权（Derivative Rights）

**定义**：允许基于原作创作 remix、翻唱、改编等衍生作品的权利。

**核心参数：**
```solidity
struct DerivativeRights {
    bool isTransferable;          // 是否可转让
    bool allowRemix;              // 允许混音
    bool allowCover;              // 允许翻唱
    bool allowAdaptation;         // 允许改编
    
    // 收益分配
    uint256 parentRevenueShare;   // 原作分成比例 (如 30%)
    uint256 minDerivativePrice;   // 衍生作品最低定价
    
    // 混音特有参数
    uint256 maxParentAssets;      // 最大混音父资产数
    bool requireAllApprovals;     // 是否需要所有父资产同意
    uint256 negotiationPeriod;    // 协商期 (小时)
}
```

### 2.3 扩展权（Extension Rights）

**定义**：允许将音乐资产扩展到新平台、新媒体、新地域的权利。

**核心参数：**
```solidity
struct ExtensionRights {
    bool allowPlatformExtension;  // 允许扩展到新平台
    bool allowMediaExtension;     // 允许扩展到新媒体
    bool allowTerritoryExtension; // 允许扩展到新地域
    
    // 自动扩展条款
    uint256 autoExtensionFee;     // 自动扩展费用
    uint256 extensionNoticePeriod;// 提前通知期 (天)
}
```

### 2.4 收益权（Revenue Rights）

**定义**：资产产生收益时，各参与方的分配比例和规则。

**核心参数：**
```solidity
struct RevenueRights {
    address creator;              // 创作者地址
    uint256 creatorShare;         // 创作者分成 (如 70%)
    
    address[] collaborators;      // 协作者地址列表
    uint256[] collaboratorShares; // 协作者分成列表
    
    address platform;             // 平台地址
    uint256 platformShare;        // 平台分成 (如 5%)
    
    bool autoDistribute;          // 是否自动分配
    uint256 distributionInterval; // 分配周期 (秒)
}
```

---

## 三、License NFT 机制

### 3.1 License NFT 定义

License NFT 是使用权购买的链上凭证，代表持有者对特定 ECHO 资产的**有限使用权**。

```solidity
struct LicenseNFT {
    uint256 tokenId;              // License ID
    uint256 parentAssetId;        // 父资产 ID
    address licensee;             // 被授权方
    
    LicenseType licenseType;      // 授权类型
    UsageType usageType;          // 使用场景
    
    uint256 validFrom;            // 生效时间
    uint256 validUntil;           // 过期时间 (0 = 永久)
    uint256 maxUsageCount;        // 最大使用次数 (0 = 无限)
    uint256 usedCount;            // 已使用次数
    
    bool isTransferable;          // 是否可转让
    uint256 royaltyToCreator;     // 转让时创作者抽成
    
    bytes32 termsHash;            // 授权条款哈希
}
```

### 3.2 License 使用验证

每次使用音乐资产时，必须验证 License：

```solidity
function verifyLicense(
    uint256 licenseId,
    address user,
    UsageType usageType
) public view returns (bool) {
    LicenseNFT storage license = licenses[licenseId];
    
    // 1. 验证持有者
    require(ownerOf(licenseId) == user, "非 License 持有者");
    
    // 2. 验证有效期
    require(block.timestamp >= license.validFrom, "尚未生效");
    if (license.validUntil > 0) {
        require(block.timestamp <= license.validUntil, "已过期");
    }
    
    // 3. 验证使用次数
    if (license.maxUsageCount > 0) {
        require(license.usedCount < license.maxUsageCount, "次数已用完");
    }
    
    // 4. 验证使用场景
    require(license.usageType == usageType, "使用场景不符");
    
    return true;
}
```

---

## 四、混音作品权属继承

### 4.1 混音创作流程

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  父资产 A   │     │  父资产 B   │     │  父资产 C   │
│  (30%)     │     │  (50%)     │     │  (20%)     │
└──────┬──────┘     └──────┬──────┘     └──────┬──────┘
       │                   │                   │
       └───────────────────┼───────────────────┘
                           │
                    ┌──────▼──────┐
                    │  混音作品 X  │
                    │  (新 ECHO)  │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
           收益分配    治理权      授权收益
              │            │            │
           A: 30%      协商决定     自动分配
           B: 50%
           C: 20%
```

### 4.2 混音智能合约

```solidity
function createRemix(
    uint256[] memory parentAssetIds,
    uint256[] memory proposedShares,
    string memory metadataURI
) public returns (uint256 newAssetId) {
    // 1. 验证父资产数量
    require(parentAssetIds.length >= 2, "至少需要 2 个父资产");
    require(parentAssetIds.length <= 5, "最多 5 个父资产");
    
    // 2. 验证分成比例总和为 100
    uint256 totalShare = 0;
    for (uint i = 0; i < proposedShares.length; i++) {
        totalShare += proposedShares[i];
    }
    require(totalShare == 100, "分成比例总和必须等于 100");
    
    // 3. 创建混音提议
    uint256 proposalId = createRemixProposal(
        parentAssetIds,
        proposedShares,
        msg.sender
    );
    
    // 4. 启动协商期 (48小时)
    remixProposals[proposalId].deadline = block.timestamp + 48 hours;
    
    // 5. 自动通知所有父资产创作者
    for (uint i = 0; i < parentAssetIds.length; i++) {
        address creator = assets[parentAssetIds[i]].creator;
        notifyCreator(creator, proposalId);
    }
    
    return proposalId;
}

// 父资产创作者确认
function approveRemix(uint256 proposalId) public {
    RemixProposal storage proposal = remixProposals[proposalId];
    
    // 验证是否为父资产创作者
    bool isParentCreator = false;
    for (uint i = 0; i < proposal.parentAssetIds.length; i++) {
        if (assets[proposal.parentAssetIds[i]].creator == msg.sender) {
            isParentCreator = true;
            break;
        }
    }
    require(isParentCreator, "非父资产创作者");
    
    proposal.approvals[msg.sender] = true;
    proposal.approvalCount++;
    
    // 如果所有人都同意，立即创建
    if (proposal.approvalCount == proposal.parentAssetIds.length) {
        finalizeRemix(proposalId);
    }
}

// 超时自动执行 (任何人都可以调用)
function finalizeRemix(uint256 proposalId) public {
    RemixProposal storage proposal = remixProposals[proposalId];
    
    require(block.timestamp >= proposal.deadline, "协商期未结束");
    require(!proposal.isFinalized, "已最终确定");
    
    // 如果有分歧，使用贡献度算法调整分成
    if (proposal.approvalCount < proposal.parentAssetIds.length) {
        proposal.finalShares = calculateFairShares(proposal);
    } else {
        proposal.finalShares = proposal.proposedShares;
    }
    
    // 创建新的 ECHO 资产
    uint256 newAssetId = mintRemixAsset(proposal);
    
    proposal.isFinalized = true;
    proposal.resultAssetId = newAssetId;
    
    emit RemixCreated(newAssetId, proposal.parentAssetIds, proposal.finalShares);
}
```

### 4.3 贡献度算法

当父资产创作者对分成比例有分歧时，系统自动计算公平分配：

```solidity
function calculateFairShares(RemixProposal memory proposal) 
    internal view returns (uint256[] memory) {
    
    uint256[] memory fairShares = new uint256[](proposal.parentAssetIds.length);
    uint256[] memory scores = new uint256[](proposal.parentAssetIds.length);
    uint256 totalScore = 0;
    
    for (uint i = 0; i < proposal.parentAssetIds.length; i++) {
        uint256 assetId = proposal.parentAssetIds[i];
        ECHOAsset storage asset = assets[assetId];
        
        // 贡献度 = 历史播放量 × 0.4 + 历史收益 × 0.4 + 创作时间权重 × 0.2
        uint256 playScore = asset.totalPlays * 40 / 100;
        uint256 revenueScore = asset.totalRevenue * 40 / 100;
        uint256 timeScore = (block.timestamp - asset.createdAt) / 1 days * 20 / 100;
        
        scores[i] = playScore + revenueScore + timeScore;
        totalScore += scores[i];
    }
    
    // 转换为百分比
    for (uint i = 0; i < scores.length; i++) {
        fairShares[i] = (scores[i] * 100) / totalScore;
    }
    
    return fairShares;
}
```

---

## 五、紧急撤销机制（熔断）

### 5.1 熔断触发条件

创作者可以在以下情况触发紧急冻结：

```solidity
enum FreezeReason {
    ILLEGAL_USAGE,      // 非法使用
    RIGHTS_VIOLATION,   // 权利侵犯
    FRAUD,              // 欺诈行为
    SAFETY_CONCERN,     // 安全顾虑
    OTHER               // 其他原因
}
```

### 5.2 熔断流程

```solidity
function emergencyFreeze(
    uint256 licenseId,
    FreezeReason reason,
    string memory evidenceURI
) public {
    LicenseNFT storage license = licenses[licenseId];
    ECHOAsset storage asset = assets[license.parentAssetId];
    
    // 1. 验证权限（只有创作者或授权管理员可以冻结）
    require(
        asset.creator == msg.sender || 
        hasRole(ARBITRATOR_ROLE, msg.sender),
        "无权冻结"
    );
    
    // 2. 记录冻结信息
    license.isFrozen = true;
    license.freezeReason = reason;
    license.freezeEvidence = evidenceURI;
    license.freezeTime = block.timestamp;
    license.freezeInitiator = msg.sender;
    
    // 3. 立即生效（下次使用验证时会失败）
    emit LicenseFrozen(licenseId, reason, msg.sender);
    
    // 4. 启动 7 天申诉期
    license.appealDeadline = block.timestamp + 7 days;
}

// 被授权方申诉
function appealFreeze(uint256 licenseId, string memory defenseURI) public {
    LicenseNFT storage license = licenses[licenseId];
    
    require(license.isFrozen, "未处于冻结状态");
    require(block.timestamp <= license.appealDeadline, "申诉期已过");
    require(ownerOf(licenseId) == msg.sender, "非 License 持有者");
    
    license.appealDefense = defenseURI;
    license.hasAppealed = true;
    
    emit FreezeAppealed(licenseId, msg.sender);
}

// 7 天后仲裁（社区陪审团）
function arbitrateFreeze(uint256 licenseId, bool upholdFreeze) public {
    LicenseNFT storage license = licenses[licenseId];
    
    require(block.timestamp > license.appealDeadline, "申诉期未结束");
    require(hasRole(ARBITRATOR_ROLE, msg.sender), "非仲裁员");
    
    if (upholdFreeze) {
        // 维持冻结，退还未使用费用
        refundRemaining(licenseId);
        license.isRevoked = true;
    } else {
        // 解除冻结
        license.isFrozen = false;
    }
    
    license.isArbitrated = true;
    emit FreezeArbitrated(licenseId, upholdFreeze);
}
```

---

## 六、技术实现时间表

| 阶段 | 功能 | 预计工时 | 优先级 |
|------|------|---------|--------|
| Phase 1 | RightsBlueprint 数据结构 | 1天 | ⭐⭐⭐⭐⭐ |
| Phase 1 | License NFT 合约 | 1天 | ⭐⭐⭐⭐⭐ |
| Phase 2 | 授权商店前端 | 1天 | ⭐⭐⭐⭐⭐ |
| Phase 2 | 价格计算器 | 0.5天 | ⭐⭐⭐⭐⭐ |
| Phase 3 | 混音创建流程 | 2天 | ⭐⭐⭐⭐ |
| Phase 3 | 贡献度算法 | 1天 | ⭐⭐⭐⭐ |
| Phase 4 | 紧急冻结机制 | 1天 | ⭐⭐⭐ |
| Phase 4 | 仲裁系统（简化版）| 1天 | ⭐⭐⭐ |

**总计：约 8.5 天**

---

## 七、风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| Gas 费用过高 | 用户流失 | 使用 Layer 2 或侧链 |
| 智能合约漏洞 | 资产损失 | 多重审计 + 漏洞赏金 |
| 法律合规问题 | 项目叫停 | 咨询法律专家，保留证据 |
| 用户理解门槛 | 采用率低 | 简化 UI，提供教程 |

---

## 八、附录

### 8.1 相关合约地址（测试网）

- RightsBlueprint: `TBD`
- LicenseNFT: `TBD`
- RemixFactory: `TBD`
- Arbitration: `TBD`

### 8.2 参考文档

- ERC-721 标准
- ERC-1155 标准（多 Token）
- OpenZeppelin 合约库

---

**文档作者**：ECHO Agent 团队  
**最后更新**：2026-03-12  
**审核状态**：待技术评审
