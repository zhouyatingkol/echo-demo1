# ECHO v1.0 技术架构设计方案
**核心：资产有生命，六爻循天道**

---

## 一、核心设计理念

> **不是"模拟生命"，是"记录生命"**

- 资产的生命状态不由算法决定，由**真实使用**决定
- 卦象不是预测，是**身份标识**
- 气数不是随机，是**状态可视化**
- 变势不是计算，是**使用证明的累积**

---

## 二、六爻变势系统（技术实现）

### 2.1 六爻与生命阶段

```
乾卦六爻 = 资产的六个生命阶段

初九(1/6): 潜龙勿用  →  资产创建，尚未激活
九二(2/6): 见龙在田  →  首次被访问/使用
九三(3/6): 终日乾乾  →  持续被使用（勤勉期）
九四(4/6): 或跃在渊  →  出现衍生/讨论（试探期）
九五(5/6): 飞龙在天  →  广泛传播，生态形成（大成）
上九(6/6): 亢龙有悔  →  盛极而变，触发转化

用九: 六爻皆变 → 卦象转化，进入新周期
```

### 2.2 技术实现：Proof of Usage (使用证明)

**不是算法算出来的，是真实发生的：**

```solidity
struct UsageProof {
    uint256 timestamp;      // 使用时间
    address user;           // 使用者
    uint8 usageType;        // 使用类型：1=查看 2=引用 3=衍生 4=交易
    bytes32 txHash;         // 交易哈希（可验证）
    string platform;        // 平台标识
}

mapping(uint256 => UsageProof[]) public assetUsageHistory;
```

**变势升级条件（链上可验证）：**

| 当前爻 | 升级条件 | 技术检测 |
|:------:|:---------|:---------|
| 初九→九二 | 首次被访问 | Oracle检测到首次view |
| 九二→九三 | 7天内被使用≥3次 | 时间窗口统计 |
| 九三→九四 | 出现衍生作品 | 检测到带有基因码引用的新资产 |
| 九四→九五 | 衍生作品≥5个或讨论≥100条 | 链上事件统计 |
| 九五→上九 | 30天内无新衍生 | 活跃度衰减检测 |
| 上九→用九 | 社区投票或自然衰减 | 治理机制触发 |

### 2.3 变势的链上自动化

```solidity
contract ECHOVital {
    
    // 变势状态
    enum Yao { CHU, JIAN, QIAN, YUE, FEI, KANG, YONG }
    
    struct AssetLife {
        uint8 currentYao;           // 当前爻 1-6
        uint256 lastUpdateTime;
        uint256 usageCount;         // 使用次数
        uint256 derivativeCount;    // 衍生数
        bytes32 currentHexagram;    // 当前卦象
    }
    
    // 任何人都可以提交使用证明
    function submitUsageProof(
        uint256 assetId,
        uint8 usageType,
        bytes memory signature  // 平台签名证明
    ) external {
        // 验证签名（防止伪造）
        require(verifyPlatformSignature(assetId, usageType, signature), "Invalid proof");
        
        // 记录使用
        assetUsageHistory[assetId].push(UsageProof({
            timestamp: block.timestamp,
            user: msg.sender,
            usageType: usageType,
            txHash: blockhash(block.number - 1),
            platform: getPlatformName(msg.sender)
        }));
        
        // 检查是否满足升级条件
        checkAndUpgradeYao(assetId);
    }
    
    // 检查升级条件（链上自动执行）
    function checkAndUpgradeYao(uint256 assetId) internal {
        AssetLife storage life = assetLives[assetId];
        uint8 current = life.currentYao;
        
        // 根据当前爻检查升级条件
        if (current == 1 && shouldUpgradeToJian(assetId)) {
            life.currentYao = 2;  // 九二
            emit YaoUpgrade(assetId, 1, 2, "见龙在田");
        } else if (current == 2 && shouldUpgradeToQian(assetId)) {
            life.currentYao = 3;  // 九三
            emit YaoUpgrade(assetId, 2, 3, "终日乾乾");
        }
        // ... 其他升级逻辑
        
        // 上九满后触发用九（卦象转化）
        if (current == 6 && shouldTransform(assetId)) {
            triggerHexagramTransform(assetId);
        }
    }
}
```

---

## 三、四权力框架（链上实现）

### 3.1 基因码结构

```
完整基因码 = 权力基因(12bit) + 时间戳(64bit) + 创作者签名(256bit)
           = 332bit（约42字节）

权力基因 = (用:3bit) | (扩:3bit) | (衍:3bit) | (益:3bit)
         = 12bit = 0-4095

链上存储：bytes42 geneCode
```

### 3.2 权力依赖的强制执行

```solidity
contract ECHORights {
    
    // 四权力配置
    struct RightsConfig {
        uint8 yong;  // 0-7
        uint8 kuo;   // 0-7
        uint8 yan;   // 0-7
        uint8 yi;    // 0-7
    }
    
    // 创建资产时强制校验权力依赖
    function createAsset(RightsConfig memory config) external returns (uint256) {
        // 强制规则：用=0时，扩、衍必须为0
        if (config.yong == 0) {
            require(config.kuo == 0, "Yong=0 requires Kuo=0");
            require(config.yan == 0, "Yong=0 requires Yan=0");
        }
        
        // 权力配置不可更改（写入后锁定）
        uint256 assetId = _mint(msg.sender, config);
        
        // 记录卦象
        bytes32 hexagram = calculateHexagram(config);
        assetHexagram[assetId] = hexagram;
        
        return assetId;
    }
    
    // 权力转让（可拆分）
    function transferRights(
        uint256 assetId,
        uint8 rightType,    // 1=用 2=扩 3=衍 4=益
        uint8 portion,      // 转让比例 0-100
        address to
    ) external {
        // 检查转让权限
        require(hasRight(msg.sender, assetId, rightType), "No right to transfer");
        
        // 执行转让
        _transferRightPortion(assetId, rightType, portion, to);
    }
}
```

---

## 四、气数系统（可视化实现）

### 4.1 气数不是随机，是状态聚合

```
气数 = f(使用频率, 社区活跃度, 时间衰减, 衍生数量)

不是算法生成，是链上数据的可视化
```

### 4.2 技术实现

```solidity
contract ECHOQi {
    
    // 气数由多个维度聚合而成
    struct QiFactors {
        uint256 usageFrequency;     // 使用频率（7天统计）
        uint256 communityScore;     // 社区评分（0-1000）
        uint256 derivativeCount;    // 衍生数量
        uint256 timeDecay;          // 时间衰减（闲置天数）
    }
    
    // 计算气数（链上可验证的确定性计算）
    function calculateQi(uint256 assetId) public view returns (uint8) {
        QiFactors memory f = getQiFactors(assetId);
        
        // 聚合公式（公开透明）
        uint256 score = 
            f.usageFrequency * 30 +      // 30%
            f.communityScore * 25 +      // 25%
            f.derivativeCount * 100 +    // 20%（每个衍生+100分）
            (100 - f.timeDecay * 5) * 25; // 25%（衰减）
            
        // 归一化到 0-100
        uint8 qi = uint8(score / 100);
        if (qi > 100) qi = 100;
        
        return qi;
    }
    
    // 气数等级（前端可视化用）
    function getQiLevel(uint8 qi) public pure returns (string memory) {
        if (qi < 20) return "DORMANT";   // 蛰藏
        if (qi < 40) return "GENTLE";    // 萌发
        if (qi < 60) return "VIGOROUS";  // 蓬勃
        if (qi < 80) return "FIERCE";    // 盛极
        return "HARMONIOUS";             // 归和
    }
}
```

### 4.3 前端可视化

```javascript
// 气数可视化：基于真实数据的美观呈现
function renderQiVisualization(qiLevel, qiValue) {
    const colors = {
        DORMANT:   { from: '#2c3e50', to: '#34495e' },  // 深灰
        GENTLE:    { from: '#27ae60', to: '#2ecc71' },  // 嫩绿
        VIGOROUS:  { from: '#f39c12', to: '#f1c40f' },  // 金黄
        FIERCE:    { from: '#e74c3c', to: '#c0392b' },  // 赤红
        HARMONIOUS:{ from: '#9b59b6', to: '#8e44ad' }   // 紫气
    };
    
    // 使用CSS动画呈现"气的流动"
    return <QiFlow color={colors[qiLevel]} intensity={qiValue} />;
}
```

---

## 五、去中心化 Oracle 网络

### 5.1 问题：如何防止使用数据伪造？

**解决方案：去中心化使用证明网络**

```solidity
contract ECHOOracle {
    
    struct OracleNode {
        address nodeAddress;
        uint256 stake;          // 质押金额
        uint256 reputation;     // 信誉分
        bool isActive;
    }
    
    // 多节点验证
    function verifyUsage(
        uint256 assetId,
        uint8 usageType,
        bytes32 proofHash
    ) external {
        // 需要至少3个节点确认
        require(nodeConfirmations[proofHash] >= 3, "Insufficient confirmations");
        
        // 记录到链上
        submitToVitalContract(assetId, usageType);
    }
    
    // 节点共识机制
    function submitConfirmation(bytes32 proofHash, bool isValid) external onlyOracle {
        if (isValid) {
            nodeConfirmations[proofHash]++;
        }
        
        // 达到共识后执行
        if (nodeConfirmations[proofHash] >= CONSENSUS_THRESHOLD) {
            executeUsageProof(proofHash);
        }
    }
}
```

---

## 六、整体架构图

```
┌─────────────────────────────────────────────────────────────┐
│                      前端层（用户体验）                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ 四权力   │  │ 卦象卡片 │  │ 气数流动 │  │ 六爻变势 │   │
│  │ 配置界面 │  │ （身份） │  │ （状态） │  │ （生命） │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      服务层（可选增值）                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ 数据分析 │  │ 高级可视化│  │ 跨链桥接 │                  │
│  │ API服务  │  │ 服务     │  │ 服务     │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      智能合约层（核心）                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │ECHORights│  │ECHOVital │  │ECHOQi   │  │ECHOOracle│   │
│  │四权力管理│  │生命状态  │  │气数计算  │  │使用证明  │   │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                      数据层（去中心化）                      │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                  │
│  │ 链上存储 │  │ IPFS    │  │ TheGraph│                  │
│  │ 基因码   │  │ 内容存储 │  │ 索引查询 │                  │
│  └──────────┘  └──────────┘  └──────────┘                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 七、关键创新点

### 7.1 不是模拟，是记录
- 变势不由算法决定，由**真实使用**累积
- 气数不是随机生成，是**链上数据的可视化**
- 卦象不是预测，是**身份标识**

### 7.2 六爻循天道
- 严格遵循乾卦六爻
- 初九到上九，完成一个生命周期
- 用九触发卦象转化，进入新周期

### 7.3 权力可拆分流转
- 四权力可独立转让
- 收益权可分式化（如10000份）
- 署名权永远保留

### 7.4 去中心化验证
- 使用证明需多节点共识
- 防止伪造和刷量
- 信誉系统保证数据质量

---

## 八、技术选型建议

| 组件 | 推荐方案 | 理由 |
|------|----------|------|
| **公链** | Optimism/Base | L2低Gas，EVM兼容 |
| **标准** | ERC-721 + 扩展 | 成熟标准，易于集成 |
| **存储** | IPFS + Filecoin | 去中心化，永久存储 |
| **索引** | The Graph | 快速查询，去中心化 |
| **Oracle** | 自建PoU网络 | 专门优化使用证明验证 |

---

**这份设计把"资产有生命"从概念变成了可落地的技术方案。** 🎋

你觉得方向对吗？哪些部分需要调整？