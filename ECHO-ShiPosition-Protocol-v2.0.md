# ECHO 势位协议 v2.0
## 势枢生势场，势场藏势位，势位定生长

**版本**：v2.0  
**日期**：2026-03-21  
**状态**：核心范式升级  
**依赖**：ECHO-Core-Design-v1.0.md（64卦张量宇宙世界观）

---

## 0. 引言：什么是「势」

### 0.1 「势」的三层架构

```
势枢 (Shìshū) —— 底层结构
├── 三维编织 T[时间][空间][关系]
└── 生成一切的枢纽

势场 (Shìchǎng) —— 涌现场域  
├── 64种势场模式（64卦）
└── 自适应的物理边界

势位 (Shìwèi) —— 资产位置
├── 六爻坐标（横向定位）
└── 势能度量（生长潜力）
```

### 0.2 本文档聚焦：势位

本文档定义**势位**的计算、跃迁与度量。

**势位** = 资产在势场中的相对位置，由六爻坐标（排名）和势能（气数）共同决定。

---

## 1. 范式宣言：从设计到涌现

### 1.1 旧范式的局限

v1.0 是**设计者的傲慢**：
- 我们设定固定阈值（7天3次、30天10次）
- 我们认为知道什么算"好"的内容
- 我们试图控制资产如何生长

**问题在于**：内容生态的复杂性远超任何设计团队的能力边界。

### 1.2 新范式：势场观测者

v2.0 承认一个根本事实：

> **我们不是规则的设计者，而是势场的观测者。**

就像物理学家不"设计"重力，而是**发现**并**描述**它——ECHO 不设计内容的价值标准，而是：
1. **观测**全网创作者的行为数据
2. **计算**涌现的势场规律（阈值作为势场边界）
3. **验证**观测数据的合理性
4. **记录**异常事件（可能是刷量、误差，或新势场现象）

### 1.3 核心哲学转变

| 维度 | v1.0（设计） | v2.0（涌现） |
|------|-------------|-------------|
| **阈值** | 固定常量（人工设定） | 势场边界（自适应） |
| **六爻** | 绝对档位（固定标准） | 势位坐标（竞争位置） |
| **气数** | 累积分数 | 势能度量（位置决定能量） |
| **验证** | 禁止不符合规则的行为 | 标记势场异常 |
| **角色** | 平台设计者 | 势场观测者 |
| **叙事** | "我们设定了规则" | "势场由你们塑造" |

**关键洞察**：
> 创作者的选择改变势场边界。当更多创作者选择某种创作模式，势场边界自然漂移，新的"势"就此形成。

---

## 2. 势场边界：动态阈值机制

### 2.1 势场边界作为自适应常数

在涌现范式中，阈值不再是人工设定的常数，而是**势场的自适应边界**。

**形式化定义**：
```
B_t(dimension, level) = percentile(D_{t-1}, 75%)

其中：
- B_t: 第t周的势场边界
- D_{t-1}: 第t-1周的全网数据分布
- percentile(·, 75%): 75%分位数（前25%算高势位）
- dimension ∈ {time, space, relation}
- level ∈ {1, 2, 3}（三个势位层级）
```

### 2.2 三维势场边界计算

#### 2.2.1 时间维边界（使用频率）

```python
def calculate_time_boundaries(usage_data_week_t_minus_1):
    """
    计算时间维的三个势场边界
    """
    usage_7d = [asset.usage_7d for asset in all_assets]
    usage_30d = [asset.usage_30d for asset in all_assets]
    
    boundaries = {
        'level_1': 1,  # 任意使用即激活
        'level_2': percentile(usage_7d, 75%),   # 7天活跃边界
        'level_3': percentile(usage_30d, 75%)   # 30天爆发边界
    }
    
    return boundaries
```

**势场边界示例**：
- 第10周统计：全网7天使用的75%分位数 = 5次
- 第11周势场边界 B_time(2) = 5
- 含义：7天内使用≥5次，进入较高时间势位

#### 2.2.2 空间维边界（平台分布）

```python
def calculate_space_boundaries(platform_data):
    """
    计算空间维的势场边界
    """
    platform_counts = [asset.platform_count for asset in all_assets]
    
    boundaries = {
        'level_1': 1,   # 单平台
        'level_2': percentile(platform_counts, 75%),  # 跨平台边界
        'level_3': percentile(platform_counts, 90%)   # 全域边界
    }
    
    return boundaries
```

#### 2.2.3 关系维边界（引用网络）

```python
def calculate_relation_boundaries(citation_data):
    """
    计算关系维的势场边界
    """
    citation_counts = [asset.citation_count for asset in all_assets]
    
    boundaries = {
        'level_1': 1,   # 首次被引用
        'level_2': percentile(citation_counts, 75%),  # 网络连接边界
        'level_3': percentile(citation_counts, 90%)   # 生态核心边界
    }
    
    return boundaries
```

### 2.3 势场边界的平滑处理

为避免边界剧烈波动，引入**指数移动平均（EMA）**：

```
B_t_smooth = α × B_t_raw + (1-α) × B_{t-1}

其中：
- α = 0.3（平滑系数，可治理调整）
- B_t_raw: 本周原始计算边界
- B_{t-1}: 上周平滑后边界
```

**意义**：势场边界变化不会过于突兀，给创作者适应时间。

---

## 3. 势位：六爻坐标系

### 3.1 势位的定义

**势位 (Shìwèi)** = 资产在势场中的相对位置

势位由两部分组成：
1. **六爻坐标**：横向定位（各维度的相对排名）
2. **势能度量**：纵向能量（位置决定的生长潜力）

### 3.2 六爻作为势位坐标

在势位体系中，六爻不是「档位」，而是**势位坐标的刻度**。

```
势位坐标 = (时间势位, 空间势位, 关系势位)

每个维度用六爻刻度表示：
- 初九：后25%（潜藏势位）
- 九二：25-50%（显现势位）
- 九三：50-70%（勤勉势位）
- 九四：70-85%（试探势位）
- 九五：85-95%（大成势位）
- 上九：前5%（转化势位）
```

### 3.3 势位跃迁规则

**势位跃迁** = 资产从一个六爻坐标移动到另一个

**跃迁触发条件**：
```
当资产的某维度百分位跨越势场边界时，触发势位跃迁

示例：
- 上周：7天使用排名第60百分位 → 九三（勤勉）
- 本周：7天使用排名第80百分位 → 跨越75%边界 → 跃迁至九四（试探）
```

**势位跃迁的事件记录**：
```solidity
struct ShiPositionTransition {
    bytes32 assetId;
    uint256 timestamp;
    Dimension dimension;      // 时间/空间/关系
    YaoPosition fromYao;      // 原势位坐标
    YaoPosition toYao;        // 新势位坐标
    uint8 percentileBefore;   // 跃迁前百分位
    uint8 percentileAfter;    // 跃迁后百分位
    bytes32 triggerEvent;     // 触发事件
}
```

### 3.4 势位跃迁的物理意义

| 跃迁 | 含义 | 创作者感知 |
|------|------|-----------|
| 初九→九二 | 从潜藏到显现 | "我的作品开始被看见了" |
| 九二→九三 | 从显现到勤勉 | "需要持续创作积累" |
| 九三→九四 | 从勤勉到试探 | "可以尝试更大胆的扩展" |
| 九四→九五 | 从试探到大成 | "已经成为领域内标杆" |
| 九五→上九 | 从大成到转化 | "需要寻找新方向或传承" |

---

## 4. 势能：气数作为能量度量

### 4.1 势能的定义

**势能 (Shìnéng)** = 势位决定的生长潜力

**核心原理**：
> 在势场中，位置决定能量。高势位 = 高势能 = 更容易生长。

### 4.2 势能计算公式

```
势能 = f(势位, 势场梯度, 历史轨迹)

简化计算：
E_shi = α × E_position + β × E_gradient + γ × E_momentum

其中：
- E_position: 当前势位的基准势能（上九 > 九五 > ... > 初九）
- E_gradient: 势场梯度势能（在快速上升的势场区域，势能加成）
- E_momentum: 历史动量（近期势位跃迁趋势）
- α, β, γ: 权重系数（α=0.5, β=0.3, γ=0.2）
```

### 4.3 势能与势位的关系

```
同一势位，不同势能示例：

资产A：《墨竹》
- 势位：九五（大成）
- 势能：85（稳定高势，但增长放缓）

资产B：《新国风》
- 势位：九五（大成）
- 势能：92（快速上升势头，势场梯度加成）

结论：两者都是大成势位，但《新国风》势能更高，未来增长潜力更大。
```

---

## 5. 势场异常检测

### 5.1 什么是势场异常

**势场异常** = 偏离势场统计规律的现象

**检测方法**：Z-Score
```
Z = (X - μ) / σ

其中：
- X: 资产的观测值
- μ: 势场均值
- σ: 势场标准差

|Z| > 3 → 标记为势场异常
```

### 5.2 异常类型与可能原因

| 异常类型 | Z-Score阈值 | 可能原因 |
|---------|------------|---------|
| **时间爆发** | >3 | 病毒传播、刷量、活动推广 |
| **空间跳跃** | >3 | 突然多平台分发、平台接入 |
| **关系集群** | >3 | 互刷引用、合作创作、小圈子 |
| **新势场现象** | >4 | 全新传播模式、测量误差 |

### 5.3 异常处理原则

**不是惩罚，是记录**：
> 异常的标记不意味着惩罚。它只是说："这里有些不同寻常，值得关注。"
>
> 历史上，异常往往是革命的起点。

**处理流程**：
1. 标记异常（链上记录）
2. 观察7天
3. 分类：刷量/测量误差/新势场现象
4. 如果是新势场现象 → 更新势场模型

---

## 6. 技术架构：链下统计 + 链上验证

### 6.1 架构概览

```
链下层：势场测绘
├── 数据聚合器（抓取全平台数据）
├── 势场计算引擎（计算边界、排名、势能）
└── 证明生成器（生成ZK proof）

链上层：势位验证
├── 势场边界合约（存储当前边界）
├── 势位注册合约（记录资产势位）
└── 异常记录合约（记录势场异常）
```

### 6.2 智能合约核心接口

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title ShiPositionRegistry
 * @notice 势位注册与跃迁记录合约
 */
contract ShiPositionRegistry {
    
    // 势位结构
    struct ShiPosition {
        uint8 timeYao;        // 时间势位坐标 (0-5)
        uint8 spaceYao;       // 空间势位坐标 (0-5)
        uint8 relationYao;    // 关系势位坐标 (0-5)
        uint256 shiEnergy;    // 势能值
        uint256 lastUpdate;   // 最后更新时间
    }
    
    // 资产 => 当前势位
    mapping(bytes32 => ShiPosition) public assetPosition;
    
    // 势位跃迁历史
    mapping(bytes32 => ShiTransition[]) public transitionHistory;
    
    // 当前势场边界
    struct ShiBoundaries {
        uint8[3] time;        // 时间维三档边界
        uint8[3] space;       // 空间维三档边界
        uint8[3] relation;    // 关系维三档边界
        uint256 updatedAt;    // 更新时间
    }
    
    ShiBoundaries public currentBoundaries;
    
    // 事件
    event ShiPositionTransition(
        bytes32 indexed assetId,
        uint8 fromYao,
        uint8 toYao,
        uint8 dimension,
        uint256 timestamp
    );
    
    /**
     * @notice 更新资产势位（由预言机调用）
     */
    function updateShiPosition(
        bytes32 assetId,
        uint8 timePercentile,
        uint8 spacePercentile,
        uint8 relationPercentile,
        bytes calldata proof
    ) external onlyRole(ORACLE_ROLE) {
        // 验证proof...
        
        // 计算新势位坐标
        ShiPosition memory newPosition = calculatePosition(
            timePercentile,
            spacePercentile,
            relationPercentile
        );
        
        // 检查是否跃迁
        ShiPosition storage current = assetPosition[assetId];
        if (current.timeYao != newPosition.timeYao) {
            recordTransition(assetId, 0, current.timeYao, newPosition.timeYao);
        }
        // ... 其他维度
        
        // 更新势位
        assetPosition[assetId] = newPosition;
    }
    
    /**
     * @notice 计算六爻坐标
     */
    function calculateYao(uint8 percentile) internal pure returns (uint8) {
        if (percentile < 25) return 0;      // 初九
        if (percentile < 50) return 1;      // 九二
        if (percentile < 70) return 2;      // 九三
        if (percentile < 85) return 3;      // 九四
        if (percentile < 95) return 4;      // 九五
        return 5;                           // 上九
    }
}
```

---

## 7. 给创作者的新叙事

### 7.1 你不是在遵守规则，你是在塑造势场

**旧叙事**：
> "欢迎来到ECHO平台。请遵守我们的规则。"

**新叙事**：
> "欢迎来到ECHO势场。这里没有固定规则，只有涌现的势场规律。**你**的每一次创作、每一次分享、每一次连接，都在塑造这个势场的边界。"

### 7.2 势位是你的位置，不是分数

**不要问**："我需要多少次使用才能升级？"

**要问**："我在这个势场中处于什么位置？"

- **初九（后25%）**：你在潜藏。这不是失败，是扎根。
- **九二（25-50%）**：你开始被看见。
- **九三（50-70%）**：你进入了主流。
- **九四（70-85%）**：你在前30%，关键转折点。
- **九五（85-95%）**：大成。不可替代的位置。
- **上九（前5%）**：转化临界点。新的势在等待。

### 7.3 势能在变化，势位在流动

如果你的势位变化了，不要恐慌：
- 可能是你的特征变了（创作方向调整）
- 可能是势场边界变了（市场整体变化）
- 可能是新的势场结构被发现（聚类重新计算）

**这不是退步，是势的流动。**

---

## 8. 总结

**势枢**（三维编织）生**势场**，**势场**藏**势位**，**势位**定生长。

**核心公式**：
```
势场边界 B_t = percentile(D_{t-1}, 75%)
势位坐标 = (时间百分位, 空间百分位, 关系百分位) → 六爻刻度
势能 E = f(势位, 势场梯度, 历史动量)
```

**我们不是设计者，是势场的观测者。**

**万物有灵，皆可生长。势在流动，位在变化。🌌**
