# ECHO 势场聚类 v1.0
## 势枢生势场，势场藏64象

**版本**：v1.0  
**日期**：2026-03-21  
**状态**：核心机制确认  
**依赖**：ECHO-ShiPosition-Protocol-v2.0.md（势位协议）

---

## 0. 引言：什么是「势场」

### 0.1 势场的定义

**势场 (Shìchǎng)** = 由势枢（三维编织）涌现的配置空间场域

在势场中：
- 资产不是孤立的点，而是场中的能量节点
- 相似配置的资产自然聚集，形成**势场区域**
- 势场结构每周重新测绘，随市场演化

### 0.2 势场与势位的关系

```
势枢（三维编织）
    ↓ 涌现为
势场（配置空间场域）
    ↓ 资产占据
势位（相对位置 + 六爻坐标）
```

**本文档聚焦：势场的结构发现与描述。**

---

## 1. 范式宣言：势场是涌现的，不是设计的

### 1.1 传统思维的陷阱

在传统分类系统中：
- 先定义类别（"这是A类，那是B类"）
- 再把实例装进类别
- 类别是**先验的**、固定的

**问题在于**：内容生态的复杂性无法被预先定义的类别穷尽。

### 1.2 ECHO的势场范式

```
先验分类：设计64个盒子 → 把资产装进去
势场范式：观察数据聚集 → 发现64个势场区域 → 描述每个区域的特征
```

**核心宣言**：
> **64势场区域不是设计蓝图，是观测结果。它们不是容器，而是涌现的模式。**

### 1.3 势场的流动性

| 特性 | 先验分类 | 势场范式 |
|------|----------|----------|
| **起源** | 人为设计 | 自然涌现 |
| **数量** | 固定64 | 动态发现（目标64） |
| **边界** | 刚性 | 模糊/流动 |
| **演化** | 需人工调整 | 自动适应（每周重测绘） |
| **新资产** | 强行归类 | 自然归属 |

---

## 2. 势场结构发现算法

### 2.1 输入：资产配置向量

每个资产是势场中的一个能量点：

```
C = (用, 扩, 衍, 益)

其中：
- 用 (Utility): 实用得分，0-100（百分位）
- 扩 (Expansion): 开放度得分，0-100
- 衍 (Derivation): 衍生性得分，0-100
- 益 (Benefit): 增益性得分，0-100
```

**示例（内容创作资产）**：

| Asset ID | 用 | 扩 | 衍 | 益 | 势场描述 |
|----------|----|----|----|-----|----------|
| 《墨竹》 | 85 | 70 | 40 | 60 | 高实用，中等开放，低衍生 |
| 《山水长卷》 | 80 | 85 | 75 | 70 | 高实用，高开放，高衍生 |
| 《赛博敦煌》 | 45 | 90 | 95 | 55 | 中等实用，极高开放，极高衍生 |

### 2.2 降维：势场的可视化

#### t-SNE 参数

```python
from sklearn.manifold import TSNE

tsne_params = {
    'n_components': 2,        # 降至2D
    'perplexity': 30,         # 局部vs全局平衡
    'learning_rate': 'auto',
    'n_iter': 1000,
    'random_state': 42
}
```

**目的**：在2D平面上揭示势场的聚类结构。

### 2.3 聚类：发现势场区域

#### DBSCAN（密度聚类，推荐）

```python
from sklearn.cluster import DBSCAN

dbscan = DBSCAN(
    eps=3.5,              # 邻域半径
    min_samples=5,        # 核心点最小邻居数
    metric='euclidean'
)

labels = dbscan.fit_predict(X_reduced)
```

**优势**：
- 自动发现簇数量（可能≠64）
- 识别噪声点（边界资产）
- 发现任意形状的势场区域

#### 势场区域数量调整

```
发现区域 > 64：
  → 合并最接近的区域
  
发现区域 < 64：
  → 接受自然模式（某些势场暂时"空亡"）
  
发现区域 = 64：
  → 理想情况，直接采用
```

### 2.4 输出：势场区域特征

```json
{
  "epoch": 1699209600,
  "shi_field_mapping": {
    "region_01": {
      "traditional_name": "乾",
      "center": {"用": 88, "扩": 85, "衍": 78, "益": 82},
      "member_count": 28,
      "description": "本周观测到的全面领先型势场区域"
    },
    "region_44": {
      "traditional_name": "姤",
      "center": {"用": 75, "扩": 92, "衍": 85, "益": 68},
      "member_count": 22,
      "description": "本周观测到的高开放高衍生型势场区域"
    }
  },
  "merkle_root": "0x..."
}
```

---

## 3. 势场的周周测绘

### 3.1 为什么要每周重测绘

**因为势场是活的**：
- 新资产加入，改变势场结构
- 旧资产变化，移动势场边界
- 市场演化，产生新的聚集模式

### 3.2 测绘流程

```
Step 1: 数据采集
  ├─ 获取所有资产的4维配置
  └─ 输出: assets.json

Step 2: 势场降维
  ├─ t-SNE降至2D
  └─ 输出: 势场坐标

Step 3: 结构发现
  ├─ DBSCAN聚类
  ├─ 调整区域数量至64
  └─ 输出: 区域标签

Step 4: 特征描述
  ├─ 计算每个区域的中心特征
  ├─ 匹配传统卦名
  └─ 输出: 区域描述

Step 5: 链上提交
  ├─ 计算Merkle Root
  ├─ 生成ZK proof
  └─ 提交到合约
```

### 3.3 势场区域的历史追踪

```json
{
  "asset_id": "《山水长卷》",
  "shi_field_history": [
    {"epoch": 1697395200, "region": "乾", "confidence": 0.85},
    {"epoch": 1698000000, "region": "乾", "confidence": 0.82},
    {"epoch": 1698604800, "region": "姤", "confidence": 0.71},
    {"epoch": 1699209600, "region": "姤", "confidence": 0.88}
  ]
}
```

**解读**：
- 《山水长卷》从"乾"势场流动到"姤"势场
- 原因：开放度和衍生性上升
- 不是资产"变差了"，是生态角色变化

---

## 4. 势场区域的文化命名

### 4.1 从区域特征到卦名

**步骤**：
1. 计算势场区域的中心特征（4维均值）
2. 特征离散化（高/中/低）
3. 匹配最接近的传统卦象
4. 赋予文化描述

### 4.2 命名示例

#### 势场区域：乾（本周观测）

```yaml
region_id: region_01
observation_epoch: 1699209600
traditional_name: 乾
matching_confidence: 0.87

center_features:
  用: 88
  扩: 85
  衍: 78
  益: 82

observed_description: |
  本周在势场的高用-高扩-高衍-高益区域发现聚集。
  该区域资产呈现全面领先的特征。
  类比传统《易经》乾卦"天行健"之意，命名为"乾"。
  
  ⚠️ 这是本周观测结果，下周该区域特征可能完全不同。

members_example:
  - "《墨竹》"（古琴曲，跨平台高使用）
  - "《清明上河图动态版》"（数字艺术，多平台传播）
```

#### 势场区域：姤（本周观测）

```yaml
region_id: region_44
traditional_name: 姤
center_features:
  用: 75
  扩: 92
  衍: 85
  益: 68

observed_description: |
  本周在势场的高扩-高衍区域发现聚集。
  该区域资产以开放性和衍生性见长。
  类比"风天相遇"之意，命名为"姤"。
```

### 4.3 重要声明

> **所有命名都是"本周观测结果的描述"，不是"该区域应该如此"的定义。**
> 
> 下周聚类后，同一个"姤"区域可能有完全不同的特征。这不是bug，是势场的自然演化。

---

## 5. 势场与势位的协作

### 5.1 两个维度，完整状态

```
势场（纵向）：你处于哪种势场模式？
  → 姤势场（高开放、高衍生型）

势位（横向）：你在该模式中的什么位置？
  → 九四势位（前70-85%，试探期）

完整描述：
  "《山水长卷》处于姤势场·九四势位"
  = 高开放高衍生型内容，正处于试探扩展阶段
```

### 5.2 协作关系

| 维度 | 势场 | 势位 |
|------|------|------|
| **更新频率** | 每周 | 每次交互/每日 |
| **性质** | 模式归类 | 排名定位 |
| **变化** | 区域边界流动 | 坐标跃迁 |
| **类比** | 所在城市 | 城市中的排名 |

---

## 6. 技术实现

### 6.1 Python实现

```python
class ShiFieldDiscovery:
    """势场结构发现引擎"""
    
    def __init__(self, target_regions=64):
        self.target_regions = target_regions
    
    def discover(self, assets):
        # 1. 准备数据
        X = self.prepare_features(assets)
        
        # 2. 降维
        X_2d = TSNE(n_components=2).fit_transform(X)
        
        # 3. 聚类发现势场区域
        labels = DBSCAN(eps=3.5, min_samples=5).fit_predict(X_2d)
        
        # 4. 调整区域数量
        labels = self.adjust_regions(X_2d, labels)
        
        # 5. 计算区域特征
        regions = self.describe_regions(X, labels)
        
        return regions
    
    def describe_regions(self, X, labels):
        """描述每个势场区域的特征"""
        regions = {}
        for label in set(labels):
            if label == -1:
                continue
            mask = labels == label
            center = X[mask].mean(axis=0)
            regions[f"region_{label+1:02d}"] = {
                "center": center,
                "count": mask.sum()
            }
        return regions
```

### 6.2 链上存储

```solidity
contract ShiFieldRegistry {
    struct ShiFieldEpoch {
        uint256 timestamp;
        bytes32 merkleRoot;
        uint256 regionCount;
        mapping(uint8 => Region) regions;
    }
    
    struct Region {
        string traditionalName;
        uint8[4] center;  // [用, 扩, 衍, 益]
        uint256 memberCount;
    }
    
    mapping(uint256 => ShiFieldEpoch) public epochs;
    mapping(string => uint8) public assetToRegion;
}
```

---

## 7. 总结

**势枢**生**势场**，**势场**藏**势位**。

**势场** = 由势枢涌现的配置空间场域
**势场区域** = 自然聚集的64种模式（每周重新测绘）
**势场命名** = 后验的文化描述（非先验定义）

**我们不是设计者，是势场的观测者。**

**势场在流动，区域在演化，万物在生长。🌌**
