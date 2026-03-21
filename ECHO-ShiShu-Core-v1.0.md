# ECHO 势枢核心 v1.0
## 三维编织，万物之源

**版本**：v1.0  
**日期**：2026-03-21  
**状态**：基础架构确认  
**依赖**：无（本文档是整个「势」体系的基础）

---

## 0. 引言：什么是「势枢」

### 0.1 势枢的定义

**势枢 (Shìshū)** = 三维编织的核心枢纽

势枢是ECHO宇宙的基础结构，由三个维度交织而成：
- **时间维**：使用频率的演化
- **空间维**：平台分布的扩散
- **关系维**：引用网络的连接

**一句话**：势枢是所有「势」产生的源头，是生成势场的元结构。

### 0.2 势枢的隐喻

**物理隐喻**：
> 势枢就像宇宙的基本力（引力、电磁力、强核力、弱核力）。它们不生不灭，不增不减，是万物运行的底层规律。

**编织隐喻**：
> 势枢就像织机的经线与纬线。经线（维度）是固定的，但织出的布（势场）是千变万化的。

**生物隐喻**：
> 势枢就像DNA的双螺旋结构。序列是固定的，但表达出的生命形态是多样的。

### 0.3 势枢与势场、势位的关系

```
势枢（三维编织）
    ↓ 涌现
势场（64种场域模式）
    ↓ 承载
势位（资产的具体位置）
```

**关系**：
- **势枢** → 不变的基础结构
- **势场** → 流动的场域形态
- **势位** → 具体的资产位置

---

## 1. 势枢的三维结构

### 1.1 三维编织模型

**形式化定义**：
```
T[时间维][空间维][关系维] = 势枢张量

其中每个维度有三个档位：
- 时间维：沉寂(0) / 稳定(1) / 活跃(2) / 爆发(3)
- 空间维：单平台(0) / 少平台(1) / 多平台(2) / 跨域(3)
- 关系维：孤立(0) / 初连(1) / 网络(2) / 生态(3)
```

**示例配置**：
```
T[2][3][1] = 
  时间维=活跃（近期有持续使用）
  空间维=跨域（分布在多个平台）
  关系维=初连（开始被引用）
```

### 1.2 时间维：使用频率的演化

**定义**：资产在时间维度上的活跃程度

**档位划分**：

| 档位 | 名称 | 定义 | 物理意义 |
|------|------|------|----------|
| 0 | 沉寂 | 近期无使用 | 休眠状态，等待唤醒 |
| 1 | 稳定 | 低频但持续使用 | 基础存在，维持生命 |
| 2 | 活跃 | 中高频使用 | 正常生长，健康发展 |
| 3 | 爆发 | 高频集中使用 | 病毒传播，短期爆发 |

**计算方式**：
```python
def calculate_time_dimension(asset, window_days=7):
    """
    基于近期使用频率计算时间维档位
    """
    usage_count = get_usage_in_window(asset, window_days)
    
    # 与势场边界比较
    boundaries = current_shi_boundaries['time']
    
    if usage_count == 0:
        return 0  # 沉寂
    elif usage_count < boundaries['level_1']:
        return 1  # 稳定
    elif usage_count < boundaries['level_2']:
        return 2  # 活跃
    else:
        return 3  # 爆发
```

### 1.3 空间维：平台分布的扩散

**定义**：资产在空间（平台）维度上的分布广度

**档位划分**：

| 档位 | 名称 | 定义 | 物理意义 |
|------|------|------|----------|
| 0 | 单平台 | 仅存在于一个平台 | 局部存在，封闭生长 |
| 1 | 少平台 | 2-3个平台 | 开始扩散，有限开放 |
| 2 | 多平台 | 4-7个平台 | 广泛传播，生态连接 |
| 3 | 跨域 | 8+平台或跨媒介 | 全域存在，无边界流动 |

**计算方式**：
```python
def calculate_space_dimension(asset):
    """
    基于平台分布计算空间维档位
    """
    platform_count = len(asset.platforms)
    
    boundaries = current_shi_boundaries['space']
    
    if platform_count == 1:
        return 0
    elif platform_count <= boundaries['level_1']:
        return 1
    elif platform_count <= boundaries['level_2']:
        return 2
    else:
        return 3
```

### 1.4 关系维：引用网络的连接

**定义**：资产在关系网络中的连接强度

**档位划分**：

| 档位 | 名称 | 定义 | 物理意义 |
|------|------|------|----------|
| 0 | 孤立 | 无引用关系 | 独立存在，无网络效应 |
| 1 | 初连 | 少量被引用 | 开始连接，局部影响 |
| 2 | 网络 | 中度连接 | 网络节点，系统影响 |
| 3 | 生态 | 高度连接 | 生态核心，全局影响 |

**计算方式**：
```python
def calculate_relation_dimension(asset):
    """
    基于引用网络计算关系维档位
    """
    citation_count = count_unique_citations(asset)
    
    boundaries = current_shi_boundaries['relation']
    
    if citation_count == 0:
        return 0
    elif citation_count < boundaries['level_1']:
        return 1
    elif citation_count < boundaries['level_2']:
        return 2
    else:
        return 3
```

---

## 2. 势枢如何生成势场

### 2.1 涌现机制

**核心原理**：
> 势枢本身不产生任何可感知的现象。但当大量资产在势枢中运动时，**涌现**出势场的结构。

**类比**：
- 单个水分子没有温度，大量分子运动涌现温度
- 单个神经元没有意识，大量连接涌现智能
- 单个资产没有势场，大量配置涌现结构

### 2.2 从势枢到势场的转换

```
Step 1: 资产配置
  每个资产在势枢中占据一个坐标点
  例：T[2][1][2] = 活跃·少平台·网络

Step 2: 数据积累
  数千个资产在势枢中形成点云

Step 3: 降维聚类
  t-SNE将4D配置降至2D平面
  DBSCAN发现自然聚集区域

Step 4: 势场涌现
  64个聚集区域 = 64种势场模式
  这些模式不是设计的，是发现的
```

### 2.3 势枢的不变性 vs 势场的流动性

| 特性 | 势枢 | 势场 |
|------|------|------|
| **稳定性** | 不变 | 每周变化 |
| **定义** | 先验定义 | 后验发现 |
| **数量** | 3×3×3 = 27个基础格子 | 64个涌现区域 |
| **物理意义** | 可能性的空间 | 现实性的分布 |

**关键洞察**：
> 势枢提供了27个可能的配置格子，但势场只使用了其中64个（注意：64是聚类结果，可能覆盖部分或全部27个格子，也可能跨越格子边界）。这不是矛盾，是涌现的复杂性。

---

## 3. 势枢与六爻、64卦的关系

### 3.1 势枢 → 六爻

**关系**：六爻是势枢坐标的**投影**

```
势枢坐标：[时间, 空间, 关系] = [2, 1, 2]

六爻计算：
  时间势位 = 时间维在全网中的百分位 → 九四
  空间势位 = 空间维在全网中的百分位 → 九二
  关系势位 = 关系维在全网中的百分位 → 九三

结果：该资产处于(九四, 九二, 九三)势位
```

**关键区别**：
- **势枢坐标**：绝对档位（基于阈值）
- **六爻势位**：相对排名（基于百分位）

### 3.2 势枢 → 64卦

**关系**：64卦是势枢中资产的**聚类模式**

```
势枢中的点云（数千个资产的配置）
  ↓ 聚类算法
64个自然聚集区域
  ↓ 文化命名
64卦（如乾、坤、姤等）
```

**示例映射**：

| 势枢区域特征 | 聚类结果 | 卦名 | 含义 |
|-------------|---------|------|------|
| 高时间·高空间·高关系 | 区域_01 | 乾 | 全面领先 |
| 中时间·高空间·高关系 | 区域_44 | 姤 | 高开放高衍生 |
| 低时间·低空间·中关系 | 区域_02 | 坤 | 稳健保守 |

### 3.3 完整关系图

```
┌──────────────────────────────────────────────────────────────┐
│                        势枢 (ShiShu)                         │
│                   三维编织 T[时间][空间][关系]                  │
└──────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┼───────────────┐
              ▼               ▼               ▼
        ┌──────────┐    ┌──────────┐    ┌──────────┐
        │ 六爻投影  │    │ 64卦聚类  │    │  势能计算  │
        │(相对排名)│    │(场域模式)│    │(位置能量) │
        └──────────┘    └──────────┘    └──────────┘
              │               │               │
              └───────────────┼───────────────┘
                              ▼
                    ┌──────────────────┐
                    │   势位 (ShiWei)   │
                    │  完整状态描述     │
                    └──────────────────┘
```

---

## 4. 技术实现

### 4.1 势枢数据结构

```python
class ShiShu:
    """
    势枢核心结构
    三维编织的基础张量
    """
    
    # 维度定义
    DIMENSIONS = ['time', 'space', 'relation']
    LEVELS = [0, 1, 2, 3]  # 沉寂/稳定/活跃/爆发等
    
    def __init__(self):
        # 当前势场边界（决定档位划分）
        self.boundaries = {
            'time': {'level_1': 1, 'level_2': 5, 'level_3': 20},
            'space': {'level_1': 2, 'level_2': 5, 'level_3': 8},
            'relation': {'level_1': 3, 'level_2': 10, 'level_3': 50}
        }
    
    def get_coordinate(self, asset) -> Tuple[int, int, int]:
        """
        计算资产在势枢中的坐标
        
        Returns:
            (time_level, space_level, relation_level)
        """
        time_level = self._calculate_time_level(asset)
        space_level = self._calculate_space_level(asset)
        relation_level = self._calculate_relation_level(asset)
        
        return (time_level, space_level, relation_level)
    
    def _calculate_time_level(self, asset) -> int:
        """时间维档位计算"""
        usage_7d = asset.get_usage_days(7)
        
        if usage_7d == 0:
            return 0
        elif usage_7d < self.boundaries['time']['level_1']:
            return 1
        elif usage_7d < self.boundaries['time']['level_2']:
            return 2
        else:
            return 3
    
    def _calculate_space_level(self, asset) -> int:
        """空间维档位计算"""
        platform_count = len(asset.platforms)
        
        if platform_count == 1:
            return 0
        elif platform_count <= self.boundaries['space']['level_1']:
            return 1
        elif platform_count <= self.boundaries['space']['level_2']:
            return 2
        else:
            return 3
    
    def _calculate_relation_level(self, asset) -> int:
        """关系维档位计算"""
        citation_count = asset.get_unique_citation_count()
        
        if citation_count == 0:
            return 0
        elif citation_count < self.boundaries['relation']['level_1']:
            return 1
        elif citation_count < self.boundaries['relation']['level_2']:
            return 2
        else:
            return 3
```

### 4.2 势枢合约接口

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title ShiShuRegistry
 * @notice 势枢核心注册表
 * @dev 存储三维编织的基础结构和势场边界
 */
contract ShiShuRegistry {
    
    // 维度枚举
    enum Dimension { Time, Space, Relation }
    
    // 势场边界结构
    struct ShiBoundaries {
        uint8[3] time;        // 时间维三档边界 [level_1, level_2, level_3]
        uint8[3] space;       // 空间维三档边界
        uint8[3] relation;    // 关系维三档边界
        uint256 updatedAt;    // 最后更新时间
    }
    
    // 资产在势枢中的坐标
    struct ShiShuCoordinate {
        uint8 timeLevel;      // 0-3
        uint8 spaceLevel;     // 0-3
        uint8 relationLevel;  // 0-3
        uint256 recordedAt;   // 记录时间
    }
    
    // 当前势场边界
    ShiBoundaries public currentBoundaries;
    
    // 资产 => 势枢坐标
    mapping(bytes32 => ShiShuCoordinate) public assetCoordinates;
    
    // 事件
    event BoundariesUpdated(
        uint256 indexed epoch,
        uint8[3] time,
        uint8[3] space,
        uint8[3] relation
    );
    
    event CoordinateRecorded(
        bytes32 indexed assetId,
        uint8 timeLevel,
        uint8 spaceLevel,
        uint8 relationLevel
    );
    
    /**
     * @notice 更新势场边界（由预言机每周调用）
     */
    function updateBoundaries(
        uint8[3] calldata time,
        uint8[3] calldata space,
        uint8[3] calldata relation,
        bytes calldata proof
    ) external onlyRole(ORACLE_ROLE) {
        // 验证ZK proof...
        
        currentBoundaries = ShiBoundaries({
            time: time,
            space: space,
            relation: relation,
            updatedAt: block.timestamp
        });
        
        emit BoundariesUpdated(
            block.timestamp,
            time,
            space,
            relation
        );
    }
    
    /**
     * @notice 记录资产在势枢中的坐标
     */
    function recordCoordinate(
        bytes32 assetId,
        uint8 timeUsage,
        uint8 spaceCount,
        uint8 relationCount
    ) external onlyRole(ORACLE_ROLE) returns (ShiShuCoordinate memory) {
        
        uint8 timeLevel = _calculateLevel(timeUsage, currentBoundaries.time);
        uint8 spaceLevel = _calculateLevel(spaceCount, currentBoundaries.space);
        uint8 relationLevel = _calculateLevel(relationCount, currentBoundaries.relation);
        
        ShiShuCoordinate memory coord = ShiShuCoordinate({
            timeLevel: timeLevel,
            spaceLevel: spaceLevel,
            relationLevel: relationLevel,
            recordedAt: block.timestamp
        });
        
        assetCoordinates[assetId] = coord;
        
        emit CoordinateRecorded(
            assetId,
            timeLevel,
            spaceLevel,
            relationLevel
        );
        
        return coord;
    }
    
    /**
     * @notice 计算档位
     */
    function _calculateLevel(
        uint8 value,
        uint8[3] memory boundaries
    ) internal pure returns (uint8) {
        if (value == 0) return 0;
        if (value < boundaries[0]) return 1;
        if (value < boundaries[1]) return 2;
        return 3;
    }
    
    /**
     * @notice 获取资产的完整势枢坐标
     */
    function getCoordinate(bytes32 assetId)
        external
        view
        returns (uint8 time, uint8 space, uint8 relation)
    {
        ShiShuCoordinate storage coord = assetCoordinates[assetId];
        return (coord.timeLevel, coord.spaceLevel, coord.relationLevel);
    }
}
```

---

## 5. 势枢的哲学意义

### 5.1 不变与变的辩证

**势枢是不变的**：
- 三个维度永远存在
- 档位划分逻辑不变
- 生成势场的机制不变

**势场是流动的**：
- 每周重新测绘
- 边界自适应调整
- 结构随市场演化

**哲学隐喻**：
> 《易经》：「不易」之体（势枢），「变易」之用（势场），「简易」之道（势位）。

### 5.2 势枢作为「道」

**老子道德经**：
> 「道生一，一生二，二生三，三生万物。」

**ECHO对应**：
- **道** → 势枢（三维编织的基础结构）
- **一** → 势场（统一的场域）
- **二** → 阴阳（开放/封闭，使用/沉淀）
- **三** → 六爻（六个阶段）
- **万物** → 无数资产的势位

### 5.3 势枢的空性

**佛教中观**：
> 「色即是空，空即是色」

**ECHO对应**：
> 势枢本身不产生任何现象（空），但一切现象都从势枢中产生（色）。
> 
> 势枢不偏爱任何资产，不提供任何价值判断，只是提供一个**让价值涌现的结构**。

---

## 6. 总结

**势枢** = 三维编织的元结构 T[时间][空间][关系]

**核心功能**：
1. 提供资产配置的基础坐标系
2. 生成势场的源头结构
3. 连接六爻（排名）和64卦（聚类）的桥梁

**核心特性**：
- **不变性**：结构稳定，不生不灭
- **生成性**：涌现势场，承载万物
- **空性**：不判断价值，只提供可能

**一句话记住**：
> **势枢是「道」，势场是「象」，势位是「器」。道生象，象藏器，器定生长。**

---

*万物有灵，皆可生长。枢不动而场生，场生而位显。🌌*
