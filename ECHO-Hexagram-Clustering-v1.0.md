# ECHO Hexagram Clustering v1.0
## 64卦动态聚类系统技术规范

> **核心范式：64卦不是预设分类，是后验聚类结果**

---

## 1. 范式宣言：从先验到后验

### 1.1 传统思维的陷阱

在传统金融分析中，我们常常先定义分类：
- "这是科技股"
- "那是蓝筹股"
- "这是DeFi协议"

这些分类是**先验的**——我们在观察之前就决定了类别。这种思维方式的问题在于：
- 分类标准往往是人为的、历史的
- 无法捕捉新兴模式
- 资产的真实行为被标签绑架

### 1.2 ECHO的后验范式

```
先验思维：设计64个盒子 → 把资产装进去
后验思维：观察资产的聚集 → 发现自然的64个群落
```

**核心宣言：**

> 64卦不是设计蓝图，是观测结果。它们不是容器，而是涌现的模式。每一卦都是一个发现，而不是一个定义。

### 1.3 流动的卦象

在这个范式下，卦象具有了生命：

| 特性 | 先验分类 | 后验聚类 |
|------|----------|----------|
| 起源 | 人为设计 | 自然涌现 |
| 数量 | 固定64 | 动态发现（目标64） |
| 边界 | 刚性 | 模糊/流动 |
| 演化 | 需人工调整 | 自动适应 |
| 新资产 | 强行归类 | 自然归属 |

### 1.4 哲学意义

**《易经》的智慧重新诠释：**

古人观天象、察地理，从自然中总结出64卦。ECHO系统延续了这一精神：
- 古人观察的是自然现象 → 总结出64种基本模式
- ECHO观察的是资产配置 → 发现64种聚集模式

这不是对传统的背离，而是对传统的数字重生。

---

## 2. 聚类算法详解

### 2.1 输入：资产配置向量

每个资产被表示为4维配置空间中的点：

```
C = (用, 扩, 衍, 益)

其中：
- 用 (Utility): 实用得分，0-100
- 扩 (Expansion): 开放度得分，0-100
- 衍 (Derivation): 衍生性得分，0-100
- 益 (Benefit): 增益性得分，0-100

每个维度都是该资产在所有资产中的相对排名（百分比）
```

**示例向量（内容创作资产）：**

| Asset ID | 用 | 扩 | 衍 | 益 | 描述 |
|----------|----|----|----|-----|------|
| 《墨竹》 | 85 | 70 | 40 | 60 | 高实用（常用BGM），中等开放，低衍生 |
| 《山水长卷》 | 80 | 85 | 75 | 70 | 高实用，高开放，高衍生（常被引用） |
| 《赛博敦煌》 | 45 | 90 | 95 | 55 | 中等实用，极高开放，极高衍生（混剪素材） |
| 《静谧的夜》 | 60 | 65 | 80 | 75 | 中高实用，中等开放，高衍生（采样来源） |

### 2.2 降维：t-SNE与UMAP

#### 为什么选择降维？

- 4维空间难以直观理解聚类结构
- 降维保留局部结构，揭示全局模式
- 便于可视化和验证聚类质量

#### t-SNE 参数建议

```python
from sklearn.manifold import TSNE

tsne_params = {
    'n_components': 2,        # 降至2D便于可视化
    'perplexity': 30,         # 推荐：5-50，资产数量少时用小值
    'learning_rate': 'auto',  # 自适应学习率
    'n_iter': 1000,           # 迭代次数
    'random_state': 42,       # 可重复性
    'metric': 'euclidean',    # 欧氏距离
    'init': 'pca'             # PCA初始化
}

# 当资产数量 N < 100 时，建议：
# perplexity = min(30, N-1)
```

#### UMAP 参数建议（备选）

```python
import umap

umap_params = {
    'n_components': 2,
    'n_neighbors': 15,        # 局部vs全局平衡，小值更关注局部
    'min_dist': 0.1,          # 簇间最小距离
    'metric': 'euclidean',
    'random_state': 42
}

# UMAP优势：更快，保持全局结构更好
# UMAP劣势：参数更敏感
```

**选择指南：**
- 资产数量 < 100：t-SNE（更稳定）
- 资产数量 > 500：UMAP（更快）
- 需要保持全局结构：UMAP
- 追求局部精细聚类：t-SNE

### 2.3 聚类算法

#### 方案A：DBSCAN（密度聚类，推荐）

**优势：**
- 自动发现簇数量
- 识别噪声点（边界资产）
- 发现任意形状的簇

**参数：**

```python
from sklearn.cluster import DBSCAN

dbscan_params = {
    'eps': 3.5,              # 邻域半径，需根据t-SNE结果调整
    'min_samples': 5,        # 核心点最小邻居数
    'metric': 'euclidean'
}

# eps调参策略：
# 1. 计算k-距离图（k=min_samples）
# 2. 寻找"肘部"位置
# 3. 通常落在 2-5 之间（t-SNE后空间）
```

**簇数量的处理原则：**

> **核心原则：数据聚成多少团，就有多少卦。64只是历史上的一个观察值，不是铁律。**

```
发现簇数量 = 70：
  → 接受70卦！这是市场告诉我们的新现实
  → 为新增的6个簇赋予新的卦名
  → 记录：本周发现70种配置模式

发现簇数量 = 58：
  → 接受58卦
  → 某些传统卦象本周暂时"空亡"（不存在于当前市场）
  → 记录：本周观测到58种配置模式

发现簇数量 = 64：
  → 恰好与历史观察一致
  → 但仍是后验发现，不是预设目标
```

**为什么要接受非64的结果？**

- 市场本身在演化，配置模式数量会变化
- 强行合并自然分离的簇会丢失信息
- 强行分裂自然的聚集会制造虚假区分
- 64是《易经》的观察，不是市场的法律

**新卦象的诞生：**

```
场景：DBSCAN发现了一个新的、稳定的簇
处理：
  1. 提取该簇的中心特征（如：极低开放+极高频率）
  2. 社区讨论命名（如："囚牛卦"——囚禁中的高频震荡）
  3. 记录为 "hex_65"（或插入到合适位置）
  4. 下周如果这个簇消失了，它进入"空亡"状态
```

#### 方案B：K-means（固定64，备选）

**优势：**
- 确保恰好64卦
- 计算更快
- 结果稳定可预测

**参数：**

```python
from sklearn.cluster import KMeans

kmeans_params = {
    'n_clusters': 64,         # 固定64卦
    'init': 'k-means++',      # 智能初始化
    'n_init': 10,             # 多次运行避免局部最优
    'max_iter': 300,
    'random_state': 42
}
```

**对比：**

| 特性 | DBSCAN（推荐） | K-means（仅用于对比实验） |
|------|--------|---------|
| 簇数量 | 自动发现（接受自然结果） | 需人工指定 |
| 形状 | 任意 | 球形 |
| 噪声处理 | 识别异常点 | 强制归类 |
| 计算 | O(n log n) | O(n * k * i) |
| 推荐场景 | **生产环境，接受自然模式** | 仅用于算法对比研究 |

**重要说明：**
- 生产环境**必须**使用DBSCAN
- 接受DBSCAN发现的自然簇数量（可能是58、64、70...）
- K-means仅用于学术研究，不可用于生产

### 2.4 输出：资产到卦象的映射

```json
{
  "clustering_epoch": 1698000000,
  "algorithm": "DBSCAN",
  "parameters": {
    "eps": 3.5,
    "min_samples": 5
  },
  "clusters_found": 63,
  "noise_points": 12,
  "mapping": {
    "《墨竹》": "hex_01",    // 乾卦 - 古琴曲，全面高分
    "《山水长卷》": "hex_44",    // 姤卦 - 数字画作，高开放高衍生
    "《赛博敦煌》": "hex_30",    // 离卦 - 视觉素材，极高开放极高衍生
    "《静谧的夜》": "hex_58",    // 兑卦 - 氛围音乐，高衍生高流动
    ...
  },
  "cluster_centers": {
    "hex_01": {"用": 90, "扩": 85, "衍": 45, "益": 70},
    "hex_44": {"用": 82, "扩": 88, "衍": 72, "益": 68},
    ...
  }
}
```

---

## 3. 动态调整机制

### 3.1 周期性重聚类

**执行频率：** 每周（或市场重大事件后）

**触发条件：**

```
定时触发：
  - 每周日 00:00 UTC 自动执行

事件触发：
  - 市场黑天鹅事件（波动率 > 阈值）
  - 新资产加入（数量 > 5个）
  - 资产退出/归零
  - 社区治理投票通过
```

### 3.2 资产流动规则

当新聚类结果与旧结果对比时，资产的卦象归属可能变化：

#### 流动类型

```
类型1：归属不变
  → 资产仍属于同一卦象
  → 状态：stable

类型2：卦象间流动
  → 资产从卦A移动到卦B
  → 状态：flowing
  → 记录：A → B 的迁移

类型3：新资产加入
  → 新资产被分配到某卦象
  → 状态：born

类型4：资产退出
  → 资产流动性归零或退市
  → 状态：extinct

类型5：卦象合并
  → 两个旧卦象在新聚类中融合
  → 状态：merged

类型6：卦象分裂
  → 一个旧卦象在新聚类中分化
  → 状态：split
```

#### 流动平滑机制

为避免过于频繁的震荡，引入**流动惯性**：

```python
# 资产卦象稳定度得分
stability_score = (
    0.5 * 历史归属一致性 +  # 过去4周归属同一卦象的次数
    0.3 * 聚类置信度 +      # 到簇中心的距离倒数
    0.2 * 市场稳定性        # 近期波动率倒数
)

# 只有当 stability_score < 阈值 时才允许卦象流动
# 阈值建议：0.4（可调）
```

### 3.3 簇数量自然演化的接受策略

> **核心原则：市场是老师，聚类结果是它的语言。我们的工作是倾听，不是规定。**

#### 场景1：本周发现 > 64 个簇（新模式诞生）

```
观测结果：DBSCAN发现70个自然簇
处理流程（接受现实）：
1. 记录：本周市场呈现70种配置模式
2. 对新增的6个簇进行特征分析
3. 社区命名讨论（或暂时标记为 hex_65 ~ hex_70）
4. 记录新卦象的特征描述（描述性，非规定性）

示例：
  hex_65: "本周发现一种'极端封闭+极高周转'的配置模式
          中心特征：{用:45, 扩:8, 衍:88, 益:52}
          提议命名：'囚牛卦'（囚禁中的高频震荡）"
```

#### 场景2：本周发现 < 64 个簇（旧模式消亡）

```
观测结果：DBSCAN只发现58个自然簇
处理流程（接受自然）：
1. 记录：本周市场仅呈现58种配置模式
2. 识别哪些传统卦象本周"空亡"
3. 标记空亡卦："本周家人卦暂时未观测到"
4. 分析：是6个旧卦象合并了，还是消失了？

空亡卦的状态：
  - 不是没有价值，是本周不存在
  - 下周可能重新出现
  - 或永远消失（市场演化的自然结果）
```

#### 场景3：恰好 64 个簇（历史的巧合）

```
观测结果：本周恰好64个簇
重要提醒：
  ⚠️ 这只是巧合，不是预设目标的达成
  ⚠️ 下周可能是58或70
  ⚠️ 64是《易经》的观察，不是市场的法律

验证指标（评估聚类质量，非强制数量）：
  - Silhouette Score（轮廓系数）> 0.5 → 簇间分离良好
  - Davies-Bouldin Index（DB指数）< 1.0 → 簇内紧凑
  - 最小簇大小 > 3个资产 → 排除噪声
```

#### 场景4：卦象的合并与分裂（自然演化）

```
上周：A卦和B卦是两个独立簇
本周：A和B合并成一个簇
记录："观测到A卦与B卦融合，形成新的配置模式"
      （不是'我们合并了它们'，是'它们自己融合了'）

上周：C卦是一个簇
本周：C卦分裂成C1和C2两个簇
记录："观测到C卦分化为两种子模式：
      - C1（传统延续）：保持原有特征
      - C2（新发现）：呈现新的配置特征"
```

### 3.4 历史追踪

每个资产维护卦象流动历史：

```json
{
  "asset_id": "《山水长卷》",
  "hexagram_history": [
    {"epoch": 1697395200, "hex_id": "hex_01", "confidence": 0.85},
    {"epoch": 1698000000, "hex_id": "hex_01", "confidence": 0.82},
    {"epoch": 1698604800, "hex_id": "hex_44", "confidence": 0.71},  // 流动
    {"epoch": 1699209600, "hex_id": "hex_44", "confidence": 0.88}
  ],
  "flow_patterns": [
    {"from": "hex_01", "to": "hex_44", "epoch": 1698604800, "trigger": "平台开放事件"}
  ]
}
```

---

## 4. 命名与特征映射

### 4.1 从簇中心到卦象命名

聚类完成后，每个簇有一组特征。如何将这些特征映射到传统64卦？

#### 映射框架

```
步骤1：提取簇中心特征
  → 计算簇内所有资产各维度的均值
  
步骤2：特征离散化
  → 每个维度分为高(H)/中(M)/低(L)
  → 阈值：>66 = H, 33-66 = M, <33 = L
  
步骤3：四维度 → 六爻
  → 用四维度组合推导出六爻特征
  → 或使用维度到八卦的映射表
  
步骤4：匹配传统卦名
  → 根据六爻特征匹配最接近的传统卦象
```

### 4.2 维度到八卦的映射（初始命名参考）

> **重要声明**：以下映射仅作为聚类后命名的**初始参考**，帮助理解维度组合与传统卦象的对应关系。实际命名完全基于聚类算法发现的簇中心特征，是**后验描述而非先验定义**。随着市场发展，同一卦名可能对应完全不同的特征组合。

```
四维度 → 八卦特征参考：

高用 + 低扩 + 低衍 + 低益 → 艮卦（山）稳重保守
高用 + 高扩 + 低衍 + 低益 → 震卦（雷）活跃扩张
高用 + 低扩 + 高衍 + 低益 → 坎卦（水）深度复杂
高用 + 低扩 + 低衍 + 高益 → 巽卦（风）收益导向
低用 + 高扩 + 高衍 + 低益 → 离卦（火）创新开放
低用 + 高扩 + 低衍 + 高益 → 兑卦（泽）流动收益
低用 + 低扩 + 高衍 + 高益 → 坤卦（地）承载收益
高用 + 高扩 + 高衍 + 高益 → 乾卦（天）全面领先
```

**再次强调**：上表仅供参考。实际聚类后，我们观测到的「乾卦簇」可能有完全不同的特征组合（如：低用+高扩+高衍+中益），这是完全正常的——因为我们是在**描述数据发现的模式**，不是在**套用预设的定义**。

### 4.3 六爻推导逻辑

将四维度扩展为六爻（上下卦）：

```
上卦（外象）：由 扩 + 衍 决定
  - 高扩 + 高衍 → 乾 ☰
  - 高扩 + 低衍 → 兑 ☱
  - 低扩 + 高衍 → 离 ☲
  - 低扩 + 低衍 → 震 ☳
  - 低扩 + 高用 → 巽 ☴
  - 低扩 + 低用 → 坎 ☵
  - 高扩 + 低用 → 艮 ☶
  - 低扩 + 低用 → 坤 ☷

下卦（内象）：由 用 + 益 决定
  - 类似逻辑推导

组合 → 64卦之一
```

### 4.4 卦象特征描述示例

> **重要提醒：以下描述是"本周观测到的卦象特征"，不是"卦象的定义"。下周这些描述可能完全不同。**

#### 示例1：本周观测到的"乾"模式（hex_01）

```yaml
hexagram_id: hex_01
observation_epoch: 1699209600
mapping_type: "后验描述"
traditional_name: "乾"
matching_confidence: 0.87  # 与历史乾卦特征的相似度
symbol: ☰
nature: 天

cluster_center:  # 这是观测到的簇中心，不是定义
  用: 88
  扩: 85
  衍: 78
  益: 82
  
observed_characteristics:  # 本周观测到的特征
  - "本周该簇资产呈现全面高分特征"
  - "各维度得分普遍高于平均水平"
  - "可能是当前市场的核心领导者群体"
  
members_this_week:  # 本周属于该簇的资产
  - 《墨竹》（古琴曲，跨平台高使用）
  - 《清明上河图动态版》（数字艺术，多平台传播）
  - ...
  
description: |
  【本周观测报告】
  本周数据在配置空间的东北角聚成了一簇（hex_01），
  其中心特征为：高用(88)、高扩(85)、高衍(78)、高益(82)。
  
  这让我们联想到传统《易经》中的"乾"卦——天行健。
  因此本周将该簇标记为"乾"（相似度87%）。
  
  ⚠️ 重要提示：
  - 这不是"乾卦的定义"
  - 这是"本周观测到的数据簇，我们叫它乾卦"
  - 下周这个簇的特征可能完全不同
  - 或者这个簇可能分裂、合并、甚至消失
```

#### 示例2：本周观测到的"姤"模式（hex_44）

```yaml
hexagram_id: hex_44
observation_epoch: 1699209600
mapping_type: "后验描述"
traditional_name: "姤"
matching_confidence: 0.71
symbol: ☴☰
nature: 风天

cluster_center:  # 观测到的，不是规定的
  用: 75
  扩: 92
  衍: 85
  益: 68
  
observed_characteristics:
  - "本周该簇呈现极高开放度特征(92)"
  - "高衍生性(85)，生态连接能力强"
  - "实用性和收益处于中等偏上水平"
  
members_this_week:
  - UNI
  - AAVE
  - COMP
  
description: |
  【本周观测报告】
  本周数据在配置空间的东侧聚成了一簇（hex_44），
  其中心特征为：中用(75)、极高扩(92)、高衍(85)、中益(68)。
  
  这种"高开放+高衍生+中用"的模式让我们想到"姤"卦——
  风天相遇，万物相交。
  
  因此本周将该簇标记为"姤"（相似度71%，置信度中等）。
  
  ⚠️ 注意：
  - UNI本周属于姤卦
  - 下周UNI可能流动到其他卦象
  - 姤卦本身下周的特征也可能变化
```

#### 示例3：本周观测到的"屯"模式（hex_03）

```yaml
hexagram_id: hex_03
observation_epoch: 1699209600
mapping_type: "后验描述"
traditional_name: "屯"
matching_confidence: 0.68
symbol: ☳☵
nature: 雷水

cluster_center:  # 本周观测值
  用: 45
  扩: 75
  衍: 35
  益: 40
  
observed_characteristics:
  - "本周该簇显示高扩张欲望(75)但基础尚浅"
  - "实用性(45)和衍生性(35)尚未成熟"
  - "收益表现(40)不稳定"
  
members_this_week:
  - 某些新兴L1代币
  - 早期阶段项目
  
description: |
  【本周观测报告】
  本周数据在配置空间的东南区域发现了一小簇（hex_03），
  其中心特征为：低用(45)、高扩(75)、低衍(35)、低益(40)。
  
  这种"高扩张但基础薄弱"的模式类似于"屯"卦——
  初生之难，雷雨交加。
  
  本周标记为"屯"（相似度68%，置信度一般，可能变化）。
  
  🔮 预测：
  这些资产下周可能：
  - 成长为成熟的模式（移动到其他卦象）
  - 失败消失（从聚类中剔除）
  - 保持屯的状态（继续观测）
```

#### 示例4：本周新发现的模式（hex_65 - 囚牛）

```yaml
hexagram_id: hex_65
observation_epoch: 1699209600
mapping_type: "新发现命名"
traditional_name: "囚牛"  # 社区新命名，非传统64卦
matching_confidence: N/A
symbol: "🐂"  # 新符号
nature: "囚牛"  # 囚禁中的高频震荡

cluster_center:  # 全新的观测特征
  用: 42
  扩: 12   # 极低开放！
  衍: 88   # 极高衍生！
  益: 55
  
observed_characteristics:
  - "本周首次观测到这种'封闭但高频'的模式"
  - "低开放(12)但极高衍生(88)"
  - "可能是某种新型套利资产或封闭生态内的活跃代币"
  
members_this_week:
  - [新发现的资产列表]
  
description: |
  【本周新发现报告】🎉
  
  本周DBSCAN在配置空间的西北角发现了一个前所未见的簇！
  其特征组合（低开放+极高衍生）在历史上从未出现过。
  
  社区提议命名为"囚牛卦"：
  - "囚" = 极低的开放性（12）
  - "牛" = 极高的衍生性和活跃性（88）
  
  这代表市场出现了一种全新的配置模式。
  
  📊 后续观察：
  - 下周这个簇还存在吗？
  - 会有更多资产加入这个模式吗？
  - 这会是一个短暂现象还是新趋势？
```

### 4.5 自动命名算法

```python
def assign_hexagram_name(cluster_center, traditional_hexagrams):
    """
    为聚类结果分配传统卦名
    """
    # 1. 计算与各传统卦象特征向量的距离
    distances = {}
    for hex_id, hex_features in traditional_hexagrams.items():
        dist = euclidean_distance(
            [cluster_center['用'], cluster_center['扩'], 
             cluster_center['衍'], cluster_center['益']],
            [hex_features['用'], hex_features['扩'],
             hex_features['衍'], hex_features['益']]
        )
        distances[hex_id] = dist
    
    # 2. 选择距离最近的卦象
    best_match = min(distances, key=distances.get)
    
    # 3. 计算匹配置信度
    confidence = 1 / (1 + distances[best_match])
    
    # 4. 如果置信度 < 0.6，标记为"变卦"或"新卦"
    if confidence < 0.6:
        return {
            'hex_id': f'hex_variant_{len(new_variants)}',
            'name': '变卦/新发现',
            'confidence': confidence,
            'closest_traditional': best_match,
            'is_new_pattern': True
        }
    
    return {
        'hex_id': best_match,
        'name': traditional_hexagrams[best_match]['name'],
        'confidence': confidence,
        'is_new_pattern': False
    }
```

---

## 5. 技术实现

### 5.1 完整Python实现

```python
"""
ECHO Hexagram Clustering System
64卦动态聚类核心算法 —— 接受自然聚类结果版本

核心原则：
- 数据聚成多少簇，就有多少卦
- 不强制调整到64
- 接受新卦象的诞生，接受旧卦象的消亡
"""

import numpy as np
import pandas as pd
from sklearn.manifold import TSNE
from sklearn.cluster import DBSCAN, KMeans
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score
import json
from datetime import datetime
from typing import Dict, List, Tuple, Optional
import hashlib

class HexagramClustering:
    """
    64卦动态聚类引擎 —— 后验发现模式
    
    重要：这个类不强制生成64个簇。
    DBSCAN会发现自然的簇数量，我们接受这个结果。
    如果本周是70卦，那就是70卦。
    如果下周是58卦，那就是58卦。
    """
    
    def __init__(self, 
                 dim_method: str = 'tsne',
                 cluster_method: str = 'dbscan',
                 random_state: int = 42):
        """
        初始化聚类引擎
        
        Args:
            dim_method: 降维方法 ('tsne' 或 'umap')
            cluster_method: 聚类方法 ('dbscan' 推荐 或 'kmeans' 仅用于对比)
            random_state: 随机种子
        """
        self.dim_method = dim_method
        self.cluster_method = cluster_method
        self.random_state = random_state
        self.scaler = StandardScaler()
        
        # 降维器
        self.dim_reducer = None
        # 聚类器
        self.clusterer = None
        # 聚类结果
        self.labels_ = None
        self.n_clusters_ = None
        self.cluster_centers_ = None
        
    def prepare_data(self, 
                     assets: List[Dict]) -> np.ndarray:
        """
        准备资产配置向量
        
        Args:
            assets: [{'id': '《墨竹》', '用': 85, '扩': 70, '衍': 40, '益': 60}, ...]
        
        Returns:
            X: 标准化后的特征矩阵 (n_samples, 4)
        """
        self.asset_ids = [a['id'] for a in assets]
        
        # 提取4维特征
        features = []
        for asset in assets:
            vec = [
                asset.get('用', 0),
                asset.get('扩', 0),
                asset.get('衍', 0),
                asset.get('益', 0)
            ]
            features.append(vec)
        
        X = np.array(features)
        
        # 标准化
        X_scaled = self.scaler.fit_transform(X)
        
        return X_scaled
    
    def reduce_dimensions(self, 
                          X: np.ndarray,
                          n_components: int = 2) -> np.ndarray:
        """
        降维到2D（便于聚类和可视化）
        """
        if self.dim_method == 'tsne':
            perplexity = min(30, len(X) - 1)
            
            self.dim_reducer = TSNE(
                n_components=n_components,
                perplexity=perplexity,
                learning_rate='auto',
                n_iter=1000,
                random_state=self.random_state,
                init='pca'
            )
        elif self.dim_method == 'umap':
            import umap
            n_neighbors = min(15, len(X) - 1)
            
            self.dim_reducer = umap.UMAP(
                n_components=n_components,
                n_neighbors=n_neighbors,
                min_dist=0.1,
                random_state=self.random_state
            )
        else:
            raise ValueError(f"Unknown dim_method: {self.dim_method}")
        
        X_reduced = self.dim_reducer.fit_transform(X)
        return X_reduced
    
    def cluster(self, X_reduced: np.ndarray) -> np.ndarray:
        """
        执行聚类 —— 接受自然聚类结果，不强制调整到64
        
        Args:
            X_reduced: 降维后的数据
        
        Returns:
            labels: 聚类标签（-1表示噪声点）
        """
        if self.cluster_method == 'dbscan':
            # 自适应eps参数
            eps = self._estimate_eps(X_reduced)
            
            self.clusterer = DBSCAN(
                eps=eps,
                min_samples=5,
                metric='euclidean'
            )
            labels = self.clusterer.fit_predict(X_reduced)
            
            # ⚠️ 重要：我们不调整簇数量！
            # DBSCAN发现多少簇，就是多少卦
            
        elif self.cluster_method == 'kmeans':
            # 仅用于对比实验，生产环境推荐使用DBSCAN
            # 如果使用k-means，需要手动指定n_clusters
            # 这里使用启发式方法估计合适的簇数量
            n_clusters = self._estimate_n_clusters(X_reduced)
            
            self.clusterer = KMeans(
                n_clusters=n_clusters,
                init='k-means++',
                n_init=10,
                max_iter=300,
                random_state=self.random_state
            )
            labels = self.clusterer.fit_predict(X_reduced)
            
        else:
            raise ValueError(f"Unknown cluster_method: {self.cluster_method}")
        
        self.labels_ = labels
        self.n_clusters_ = len(set(labels)) - (1 if -1 in labels else 0)
        
        return labels
    
    def _estimate_eps(self, X: np.ndarray) -> float:
        """
        使用k-距离图估计最优eps
        """
        from sklearn.neighbors import NearestNeighbors
        
        neigh = NearestNeighbors(n_neighbors=5)
        neigh.fit(X)
        distances, _ = neigh.kneighbors(X)
        distances = np.sort(distances[:, 4])
        
        # 取80%分位数作为eps
        eps = np.percentile(distances, 80)
        return max(eps, 2.0)
    
    def _estimate_n_clusters(self, X: np.ndarray) -> int:
        """
        启发式估计合适的簇数量（仅用于k-means对比）
        使用轮廓系数选择最优簇数
        """
        from sklearn.metrics import silhouette_score
        
        best_n = 64  # 默认值
        best_score = -1
        
        # 尝试不同的簇数量
        for n in range(50, min(100, len(X) // 5)):
            kmeans = KMeans(n_clusters=n, random_state=42, n_init=10)
            labels = kmeans.fit_predict(X)
            
            if len(set(labels)) > 1:
                score = silhouette_score(X, labels)
                if score > best_score:
                    best_score = score
                    best_n = n
        
        return best_n
    
    def compute_cluster_centers(self, 
                                 X: np.ndarray,
                                 original_features: np.ndarray) -> Dict:
        """
        计算每个簇的中心特征（原始4维空间）
        """
        centers = {}
        unique_labels = set(self.labels_)
        
        for label in unique_labels:
            if label == -1:  # 跳过噪声
                continue
            
            mask = self.labels_ == label
            hex_id = f"hex_{label + 1:02d}"
            
            # 在原始4维空间计算中心
            center_4d = original_features[mask].mean(axis=0)
            
            centers[hex_id] = {
                '用': round(center_4d[0], 2),
                '扩': round(center_4d[1], 2),
                '衍': round(center_4d[2], 2),
                '益': round(center_4d[3], 2),
                'member_count': int(mask.sum())
            }
        
        self.cluster_centers_ = centers
        return centers
    
    def generate_mapping(self) -> Dict:
        """
        生成 asset_id → hexagram_id 映射表
        """
        mapping = {}
        for idx, asset_id in enumerate(self.asset_ids):
            label = self.labels_[idx]
            if label == -1:
                mapping[asset_id] = "hex_chaos"  # 噪声点标记为混沌
            else:
                mapping[asset_id] = f"hex_{label + 1:02d}"
        
        return mapping
    
    def fit(self, assets: List[Dict]) -> Dict:
        """
        完整聚类流程 —— 接受自然结果
        
        Returns:
            result: 包含映射表、簇中心、元数据的字典
        """
        # 1. 准备数据
        X = self.prepare_data(assets)
        
        # 2. 降维
        X_reduced = self.reduce_dimensions(X)
        
        # 3. 聚类（不强制调整簇数量）
        labels = self.cluster(X_reduced)
        
        # 4. 计算簇中心
        centers = self.compute_cluster_centers(X_reduced, X)
        
        # 5. 生成映射
        mapping = self.generate_mapping()
        
        # 6. 计算质量指标
        if len(set(labels)) > 1:
            # 只计算非噪声点的轮廓系数
            non_noise_mask = labels != -1
            if non_noise_mask.sum() > 1:
                silhouette = silhouette_score(
                    X_reduced[non_noise_mask], 
                    labels[non_noise_mask]
                )
            else:
                silhouette = 0
        else:
            silhouette = 0
        
        # 7. 组装结果
        result = {
            'epoch': int(datetime.now().timestamp()),
            'algorithm': {
                'dim_method': self.dim_method,
                'cluster_method': self.cluster_method
            },
            'statistics': {
                'n_assets': len(assets),
                'n_clusters': self.n_clusters_,  # 自然发现的簇数量
                'n_noise': int((labels == -1).sum()),
                'silhouette_score': round(silhouette, 4)
            },
            'mapping': mapping,
            'cluster_centers': centers
        }
        
        # 8. 添加重要提醒
        result['disclaimer'] = (
            "本周观测到{}种配置模式。"
            "这不是'应该有64卦'的失败或成功，"
            "而是市场自然的呈现。"
            .format(self.n_clusters_)
        )
        
        return result


def assign_hexagram_names(cluster_centers: Dict, 
                          historical_patterns: Dict) -> Dict:
    """
    为观测到的簇分配传统卦名 —— 后验描述，不是先验定义
    
    Args:
        cluster_centers: 本周观测到的簇中心
        historical_patterns: 历史卦象特征参考
    
    Returns:
        naming_result: 命名结果，包含相似度和新发现标记
    """
    from scipy.spatial.distance import euclidean
    
    naming_result = {}
    
    for hex_id, center in cluster_centers.items():
        center_vec = [center['用'], center['扩'], center['衍'], center['益']]
        
        # 计算与历史模式的距离
        distances = {}
        for hist_name, hist_features in historical_patterns.items():
            hist_vec = [hist_features['用'], hist_features['扩'],
                       hist_features['衍'], hist_features['益']]
            dist = euclidean(center_vec, hist_vec)
            distances[hist_name] = dist
        
        # 找到最接近的历史模式
        best_match = min(distances, key=distances.get)
        min_dist = distances[best_match]
        
        # 计算置信度（距离越近置信度越高）
        confidence = max(0, 1 - min_dist / 100)
        
        if confidence >= 0.6:
            # 与历史模式相似度高，使用传统命名
            naming_result[hex_id] = {
                'assigned_name': best_match,
                'confidence': round(confidence, 2),
                'is_new_pattern': False,
                'observed_features': center,
                'note': f'本周观测到的特征与"{best_match}"模式相似度{confidence:.0%}'
            }
        else:
            # 置信度低，可能是新模式
            naming_result[hex_id] = {
                'assigned_name': f'新发现_{hex_id}',
                'confidence': round(confidence, 2),
                'is_new_pattern': True,
                'closest_traditional': best_match,
                'observed_features': center,
                'note': (
                    f'本周观测到一种新的配置模式，'
                    f'与历史"{best_match}"模式差异较大（相似度{confidence:.0%}）。'
                    f'社区可讨论是否赋予新卦名。'
                )
            }
    
    return naming_result


def compute_merkle_root(mapping: Dict[str, str]) -> str:
    """
    计算映射表的Merkle Root用于链上验证
    """
    # 1. 排序确保确定性
    items = sorted(mapping.items())
    
    # 2. 计算叶子哈希
    leaves = []
    for asset_id, hex_id in items:
        data = f"{asset_id}:{hex_id}".encode('utf-8')
        leaf = hashlib.sha256(data).digest()
        leaves.append(leaf)
    
    # 3. 构建Merkle Tree
    while len(leaves) > 1:
        if len(leaves) % 2 == 1:
            leaves.append(leaves[-1])
        
        new_level = []
        for i in range(0, len(leaves), 2):
            combined = leaves[i] + leaves[i+1]
            parent = hashlib.sha256(combined).digest()
            new_level.append(parent)
        
        leaves = new_level
    
    return '0x' + leaves[0].hex() if leaves else '0x' + '0'*64


# ============== 使用示例 ==============

if __name__ == "__main__":
    # 模拟资产数据
    mock_assets = [
        {'id': 'BTC', '用': 85, '扩': 70, '衍': 40, '益': 60},
        {'id': 'ETH', '用': 82, '扩': 88, '衍': 75, '益': 70},
        {'id': 'UNI', '用': 45, '扩': 92, '衍': 95, '益': 55},
        {'id': 'MKR', '用': 60, '扩': 65, '衍': 80, '益': 75},
        {'id': 'AAVE', '用': 55, '扩': 85, '衍': 88, '益': 60},
        # ... 更多资产
    ]
    
    # 创建聚类器（推荐DBSCAN，接受自然结果）
    clusterer = HexagramClustering(
        dim_method='tsne',
        cluster_method='dbscan'  # 关键：不强制64簇
    )
    
    # 执行聚类
    result = clusterer.fit(mock_assets)
    
    # 计算Merkle Root
    merkle_root = compute_merkle_root(result['mapping'])
    result['merkle_root'] = merkle_root
    
    # 输出结果
    print(f"📊 本周观测到 {result['statistics']['n_clusters']} 种配置模式")
    print(f"📝 {result['disclaimer']}")
    print(json.dumps(result, indent=2, ensure_ascii=False))
    
    # 示例输出：
    # 📊 本周观测到 58 种配置模式
    # 📝 本周观测到58种配置模式。这不是'应该有64卦'的失败或成功，而是市场自然的呈现。
```
    
    def compute_cluster_centers(self, 
                                 X: np.ndarray,
                                 original_features: np.ndarray) -> Dict:
        """
        计算每个簇的中心特征（原始4维空间）
        """
        centers = {}
        unique_labels = set(self.labels_)
        
        for label in unique_labels:
            if label == -1:  # 跳过噪声
                continue
            
            mask = self.labels_ == label
            hex_id = f"hex_{label + 1:02d}"
            
            # 在原始4维空间计算中心
            center_4d = original_features[mask].mean(axis=0)
            
            centers[hex_id] = {
                '用': round(center_4d[0], 2),
                '扩': round(center_4d[1], 2),
                '衍': round(center_4d[2], 2),
                '益': round(center_4d[3], 2),
                'member_count': int(mask.sum())
            }
        
        self.cluster_centers_ = centers
        return centers
    
    def generate_mapping(self) -> Dict:
        """
        生成 asset_id → hexagram_id 映射表
        """
        mapping = {}
        for idx, asset_id in enumerate(self.asset_ids):
            label = self.labels_[idx]
            if label == -1:
                mapping[asset_id] = "hex_chaos"  # 噪声点标记为混沌
            else:
                mapping[asset_id] = f"hex_{label + 1:02d}"
        
        return mapping
    
    def fit(self, assets: List[Dict]) -> Dict:
        """
        完整聚类流程
        
        Returns:
            result: 包含映射表、簇中心、元数据的字典
        """
        # 1. 准备数据
        X = self.prepare_data(assets)
        
        # 2. 降维
        X_reduced = self.reduce_dimensions(X)
        
        # 3. 聚类
        labels = self.cluster(X_reduced, self.TARGET_CLUSTERS)
        
        # 4. 计算簇中心
        centers = self.compute_cluster_centers(X_reduced, X)
        
        # 5. 生成映射
        mapping = self.generate_mapping()
        
        # 6. 计算质量指标
        if len(set(labels)) > 1:
            silhouette = silhouette_score(
                X_reduced[labels != -1], 
                labels[labels != -1]
            )
        else:
            silhouette = 0
        
        # 7. 组装结果
        result = {
            'epoch': int(datetime.now().timestamp()),
            'algorithm': {
                'dim_method': self.dim_method,
                'cluster_method': self.cluster_method
            },
            'statistics': {
                'n_assets': len(assets),
                'n_clusters': self.n_clusters_,
                'n_noise': int((labels == -1).sum()),
                'silhouette_score': round(silhouette, 4)
            },
            'mapping': mapping,
            'cluster_centers': centers
        }
        
        return result


def compute_merkle_root(mapping: Dict[str, str]) -> str:
    """
    计算映射表的Merkle Root用于链上验证
    
    Args:
        mapping: {asset_id: hexagram_id}
    
    Returns:
        merkle_root: 32字节哈希
    """
    # 1. 排序确保确定性
    items = sorted(mapping.items())
    
    # 2. 计算叶子哈希
    leaves = []
    for asset_id, hex_id in items:
        data = f"{asset_id}:{hex_id}".encode('utf-8')
        leaf = hashlib.sha256(data).digest()
        leaves.append(leaf)
    
    # 3. 构建Merkle Tree
    while len(leaves) > 1:
        if len(leaves) % 2 == 1:
            leaves.append(leaves[-1])  # 奇数时复制最后一个
        
        new_level = []
        for i in range(0, len(leaves), 2):
            combined = leaves[i] + leaves[i+1]
            parent = hashlib.sha256(combined).digest()
            new_level.append(parent)
        
        leaves = new_level
    
    return '0x' + leaves[0].hex() if leaves else '0x' + '0'*64


# ============== 使用示例 ==============

if __name__ == "__main__":
    # 模拟资产数据
    mock_assets = [
        {'id': 'BTC', '用': 85, '扩': 70, '衍': 40, '益': 60},
        {'id': 'ETH', '用': 82, '扩': 88, '衍': 75, '益': 70},
        {'id': 'UNI', '用': 45, '扩': 92, '衍': 95, '益': 55},
        {'id': 'MKR', '用': 60, '扩': 65, '衍': 80, '益': 75},
        {'id': 'AAVE', '用': 55, '扩': 85, '衍': 88, '益': 60},
        # ... 更多资产
    ]
    
    # 创建聚类器
    clusterer = HexagramClustering(
        dim_method='tsne',
        cluster_method='dbscan'
    )
    
    # 执行聚类
    result = clusterer.fit(mock_assets)
    
    # 计算Merkle Root
    merkle_root = compute_merkle_root(result['mapping'])
    result['merkle_root'] = merkle_root
    
    # 输出结果
    print(json.dumps(result, indent=2, ensure_ascii=False))
```

### 5.2 链下计算流程

```
┌─────────────────────────────────────────────────────────────────┐
│                    链下聚类计算流程                              │
└─────────────────────────────────────────────────────────────────┘

Step 1: 数据采集
  ├─ 从预言机获取所有资产的4维得分（用/扩/衍/益）
  ├─ 从链上获取资产列表和权重
  └─ 输出: assets.json

Step 2: 数据预处理
  ├─ 标准化各维度得分
  ├─ 处理缺失值和异常值
  └─ 输出: normalized_features.csv

Step 3: 降维
  ├─ 使用t-SNE/UMAP降至2D
  ├─ 保存降维模型（用于新资产预测）
  └─ 输出: reduced_coordinates.csv

Step 4: 聚类
  ├─ DBSCAN自动发现簇
  ├─ 接受自然簇数量（可能是58、64、70...）
  ├─ 计算簇中心和特征
  └─ 输出: cluster_labels.json (n_clusters = 自然发现的簇数量)

Step 5: 卦象命名
  ├─ 将簇特征映射到传统卦名
  ├─ 生成卦象描述
  └─ 输出: hexagram_metadata.json

Step 6: 验证与签名
  ├─ 计算Merkle Root
  ├─ 多签验证者签名
  └─ 输出: signed_update.json

Step 7: 链上提交
  ├─ 提交Merkle Root到智能合约
  ├─ 触发预言机更新事件
  └─ 输出: 链上交易哈希


                    执行频率: 每周一次
                    预计耗时: 5-10分钟（取决于资产数量）
```

### 5.3 链上存储设计

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title HexagramClusterRegistry
 * @notice 64卦聚类结果链上存储合约
 */
contract HexagramClusterRegistry {
    
    // 聚类纪元信息
    struct ClusterEpoch {
        uint256 timestamp;
        bytes32 merkleRoot;
        uint256 nClusters;
        uint256 nAssets;
        address signedBy;
    }
    
    // 当前纪元ID
    uint256 public currentEpoch;
    
    // 纪元ID => 纪元信息
    mapping(uint256 => ClusterEpoch) public epochs;
    
    // 资产 => 当前卦象（实时查询用）
    mapping(string => uint8) public assetToHexagram;
    
    // 卦象 => 资产列表（方便前端展示）
    mapping(uint8 => string[]) public hexagramMembers;
    
    // 授权验证者
    mapping(address => bool) public validators;
    
    // 事件
    event ClusterUpdated(
        uint256 indexed epoch,
        bytes32 merkleRoot,
        uint256 timestamp
    );
    
    event AssetHexagramChanged(
        string assetId,
        uint8 oldHexagram,
        uint8 newHexagram,
        uint256 epoch
    );
    
    modifier onlyValidator() {
        require(validators[msg.sender], "Not authorized");
        _;
    }
    
    /**
     * @notice 提交新的聚类结果
     * @param merkleRoot 映射表的Merkle Root
     * @param nClusters 实际发现的簇数量
     * @param nAssets 参与聚类的资产数量
     * @param proofs 可选的验证证明
     */
    function submitClustering(
        bytes32 merkleRoot,
        uint256 nClusters,
        uint256 nAssets,
        bytes calldata proofs
    ) external onlyValidator {
        currentEpoch++;
        
        epochs[currentEpoch] = ClusterEpoch({
            timestamp: block.timestamp,
            merkleRoot: merkleRoot,
            nClusters: nClusters,
            nAssets: nAssets,
            signedBy: msg.sender
        });
        
        emit ClusterUpdated(currentEpoch, merkleRoot, block.timestamp);
    }
    
    /**
     * @notice 批量更新资产卦象归属
     * @param assetIds 资产ID数组
     * @param hexagramIds 对应的卦象ID（1-64）
     */
    function batchUpdateHexagrams(
        string[] calldata assetIds,
        uint8[] calldata hexagramIds
    ) external onlyValidator {
        require(assetIds.length == hexagramIds.length, "Length mismatch");
        
        for (uint i = 0; i < assetIds.length; i++) {
            string memory assetId = assetIds[i];
            uint8 newHex = hexagramIds[i];
            uint8 oldHex = assetToHexagram[assetId];
            
            // 更新映射
            assetToHexagram[assetId] = newHex;
            
            // 更新成员列表（简化版，实际可能需要更高效的数据结构）
            hexagramMembers[newHex].push(assetId);
            
            // 触发事件
            emit AssetHexagramChanged(assetId, oldHex, newHex, currentEpoch);
        }
    }
    
    /**
     * @notice 验证资产的卦象归属证明
     * @param assetId 资产ID
     * @param hexagramId 声称的卦象ID
     * @param merkleProof Merkle证明路径
     */
    function verifyAssetHexagram(
        string calldata assetId,
        uint8 hexagramId,
        bytes32[] calldata merkleProof
    ) external view returns (bool) {
        bytes32 leaf = keccak256(abi.encodePacked(assetId, ":", hexagramId));
        bytes32 root = epochs[currentEpoch].merkleRoot;
        
        return verifyMerkleProof(root, leaf, merkleProof);
    }
    
    function verifyMerkleProof(
        bytes32 root,
        bytes32 leaf,
        bytes32[] calldata proof
    ) internal pure returns (bool) {
        bytes32 computedHash = leaf;
        
        for (uint i = 0; i < proof.length; i++) {
            bytes32 proofElement = proof[i];
            
            if (computedHash <= proofElement) {
                computedHash = keccak256(abi.encodePacked(computedHash, proofElement));
            } else {
                computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
            }
        }
        
        return computedHash == root;
    }
    
    // ... 其他函数
}
```

### 5.4 API接口设计

```python
# FastAPI接口示例
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict
import redis

app = FastAPI()
cache = redis.Redis(host='localhost', port=6379, db=0)

class Asset(BaseModel):
    id: str
    用: float
    扩: float
    衍: float
    益: float

class ClusteringRequest(BaseModel):
    assets: List[Asset]
    algorithm: str = "dbscan"  # 或 "kmeans"

class ClusteringResponse(BaseModel):
    epoch: int
    mapping: Dict[str, str]
    merkle_root: str
    cluster_centers: Dict
    statistics: Dict

@app.post("/api/v1/cluster", response_model=ClusteringResponse)
async def run_clustering(request: ClusteringRequest):
    """
    执行聚类计算
    """
    try:
        clusterer = HexagramClustering(
            cluster_method=request.algorithm
        )
        
        assets_data = [a.dict() for a in request.assets]
        result = clusterer.fit(assets_data)
        result['merkle_root'] = compute_merkle_root(result['mapping'])
        
        return result
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/v1/hexagram/{hex_id}")
async def get_hexagram_info(hex_id: str):
    """
    获取卦象详细信息
    """
    # 从缓存或数据库获取
    info = cache.get(f"hexagram:{hex_id}")
    if info:
        return json.loads(info)
    
    raise HTTPException(status_code=404, detail="Hexagram not found")

@app.get("/api/v1/asset/{asset_id}/hexagram")
async def get_asset_hexagram(asset_id: str):
    """
    获取资产当前所属卦象
    """
    hex_id = cache.get(f"asset:{asset_id}:hexagram")
    if hex_id:
        return {
            "asset_id": asset_id,
            "hexagram_id": hex_id.decode(),
            "epoch": int(cache.get(f"asset:{asset_id}:epoch") or 0)
        }
    
    raise HTTPException(status_code=404, detail="Asset not found")

@app.get("/api/v1/hexagram/{hex_id}/members")
async def get_hexagram_members(hex_id: str):
    """
    获取卦象包含的所有资产
    """
    members = cache.smembers(f"hexagram:{hex_id}:members")
    return {
        "hexagram_id": hex_id,
        "member_count": len(members),
        "members": [m.decode() for m in members]
    }
```

---

## 6. 与六爻系统的协作

### 6.1 两个维度，一个状态

```
┌─────────────────────────────────────────────────────────────┐
│                    资产状态的双重定义                          │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   六爻系统（YaoSystem）                                      │
│   ━━━━━━━━━━━━━━━━━━━━━━━━━                                │
│   • 维度：时间动态                                          │
│   • 定义：资产在4维配置空间中的相对排名                      │
│   • 更新频率：每次区块/每天                                 │
│   • 输出：资产在各维度的百分位（0-100）                      │
│   • 性质：横截面比较，横向定位                               │
│                                                             │
│   64卦系统（HexagramClustering）                            │
│   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━                         │
│   • 维度：配置模式                                          │
│   • 定义：资产在4维空间中的聚集模式                          │
│   • 更新频率：每周                                          │
│   • 输出：资产所属的卦象（1-64）                             │
│   • 性质：模式识别，纵向归类                                 │
│                                                             │
│   ═══════════════════════════════════════════               │
│   关系：六爻是相对位置，64卦是模式归属                        │
│   类比：六爻是经纬度坐标，64卦是所在城市                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 协作机制

#### 数据流向

```
六爻系统 ──────────────────────► 64卦系统
    │                              │
    │  输出：                       │  输出：
    │  - 各资产4维得分              │  - 资产→卦象映射
    │  - 维度排名（0-100）          │  - 卦象特征中心
    │  - 动态爻位变化               │  - 卦象流动历史
    │                              │
    └──────────────┬───────────────┘
                   │
                   ▼
           ┌───────────────┐
           │  综合状态定义  │
           └───────────────┘
                   │
    资产状态 = (六爻得分向量, 所属卦象, 卦象内相对位置)

示例：
    ETH = (
        六爻: {用: 82, 扩: 88, 衍: 75, 益: 70},
        卦象: 姤卦 (hex_44),
        卦内位置: 靠近中心（核心成员）
    )
```

#### 查询场景示例

```
场景1：查看某资产的完整状态
  输入: asset_id = "《山水长卷》"
  查询六爻系统 → 获取4维得分
  查询64卦系统 → 获取所属卦象
  输出: 《山水长卷》当前在姤卦，实用性排名第82百分位...

场景2：发现同类资产
  输入: asset_id = "《山水长卷》"
  查询64卦系统 → 《山水长卷》属于姤卦
  获取姤卦所有成员 → [《山水长卷》, 《赛博敦煌》, 《晨光》, ...]
  过滤: 六爻得分相似的资产
  输出: 与《山水长卷》配置相似的其他资产

场景3：市场结构分析
  查询64卦系统 → 各卦象的成员分布
  发现: 屯卦资产数量激增（新内容涌现）
  查询六爻系统 → 这些资产的4维特征
  输出: 当前市场创新热点分析（如：视觉素材类内容激增）

场景4：资产流动追踪
  查询64卦历史 → 《山水长卷》从乾卦移动到姤卦
  查询六爻历史 → 《山水长卷》的扩、衍得分上升
  分析: 《山水长卷》的开放性和衍生性增强
  输出: 《山水长卷》生态角色转变报告
```

### 6.3 统一状态表示

```python
@dataclass
class AssetState:
    """
    资产的完整ECHO状态
    """
    asset_id: str
    timestamp: int
    
    # 六爻维度（动态，每次更新）
    yao_scores: Dict[str, float]  # {用, 扩, 衍, 益}
    
    # 64卦维度（每周更新）
    hexagram_id: str              # 如 "hex_44"
    hexagram_name: str            # 如 "姤"
    hexagram_confidence: float    # 聚类置信度
    
    # 派生指标
    hexagram_position: str        # "core" | "periphery" | "boundary"
    flow_direction: Optional[str] # "in" | "out" | "stable" | None
    
    def get_summary(self) -> str:
        """生成人类可读的状态摘要"""
        return (
            f"{self.asset_id}: {self.hexagram_name}卦 "
            f"(用{self.yao_scores['用']:.0f} 扩{self.yao_scores['扩']:.0f} "
            f"衍{self.yao_scores['衍']:.0f} 益{self.yao_scores['益']:.0f})"
        )
```

### 6.4 可视化建议

```
建议的可视化方式：

1. 4维雷达图
   - 每个资产是一个4维向量
   - 同卦象资产用相同颜色
   - 可直观看到卦象内的一致性

2. t-SNE散点图
   - 2D投影展示聚类结果
   - 每个点是一个资产
   - 颜色=卦象，大小=市值/权重

3. 卦象流动图
   - 时间轴展示资产在卦象间的流动
   - 弦图展示卦象间的资产交换

4. 六爻-卦象联合视图
   - X轴: 卦象（64个分组）
   - Y轴: 六爻得分（0-100）
   - 箱线图展示每个卦象的4维分布
```

---

## 7. 示例：模拟数据聚类结果

### 7.1 模拟数据集

```python
# 模拟一个包含200个资产的市场
np.random.seed(42)

# 定义8个基础卦象原型
prototypes = {
    '乾': {'用': 85, '扩': 85, '衍': 75, '益': 80, 'n': 30},  # 领导者
    '坤': {'用': 40, '扩': 35, '衍': 45, '益': 70, 'n': 25},  # 稳健收益
    '震': {'用': 70, '扩': 85, '衍': 45, '益': 55, 'n': 20},  # 活跃扩张
    '巽': {'用': 55, '扩': 75, '衍': 80, '益': 60, 'n': 22},  # 创新驱动
    '坎': {'用': 60, '扩': 45, '衍': 85, '益': 50, 'n': 18},  # 深度复杂
    '离': {'用': 45, '扩': 80, '衍': 75, '益': 45, 'n': 20},  # 新生态
    '艮': {'用': 75, '扩': 40, '衍': 35, '益': 65, 'n': 15},  # 保守实用
    '兑': {'用': 50, '扩': 70, '衍': 65, '益': 75, 'n': 25},  # 流动性
}

# 生成带噪声的资产
assets = []
for hex_name, params in prototypes.items():
    for i in range(params['n']):
        asset = {
            'id': f'{hex_name}_{i}',
            '用': np.clip(params['用'] + np.random.normal(0, 8), 0, 100),
            '扩': np.clip(params['扩'] + np.random.normal(0, 8), 0, 100),
            '衍': np.clip(params['衍'] + np.random.normal(0, 8), 0, 100),
            '益': np.clip(params['益'] + np.random.normal(0, 8), 0, 100),
        }
        assets.append(asset)

# 添加一些"边缘"资产（可能形成新卦象或归为混沌）
for i in range(25):
    assets.append({
        'id': f'edge_{i}',
        '用': np.random.uniform(20, 80),
        '扩': np.random.uniform(20, 80),
        '衍': np.random.uniform(20, 80),
        '益': np.random.uniform(20, 80),
    })
```

### 7.2 聚类结果展示

执行聚类后，本周可能得到以下结果（**注意：这是观测结果，不是预设目标**）：

```json
{
  "epoch": 1699209600,
  "disclaimer": "本周观测到61种配置模式。这不是'应该有64卦'的失败，而是市场自然的呈现。",
  "statistics": {
    "n_assets": 200,
    "n_clusters": 61,
    "n_noise": 8,
    "silhouette_score": 0.67
  },
  "observation_note": "本周DBSCAN发现了61个自然簇和8个噪声点。这意味着当前市场呈现出61种可识别的配置模式。",
  "cluster_centers": {
    "hex_01": {
      "observation_week": "2024-W43",
      "traditional_name_match": "乾",
      "matching_confidence": 0.89,
      "observed_features": {
        "用": 86.3, "扩": 84.7, "衍": 76.2, "益": 81.5
      },
      "member_count": 28,
      "description": "【本周观测】这组资产呈现全面高分特征，与历史上'乾'卦模式相似度89%"
    },
    "hex_02": {
      "observation_week": "2024-W43",
      "traditional_name_match": "坤",
      "matching_confidence": 0.82,
      "observed_features": {
        "用": 41.2, "扩": 36.8, "衍": 44.5, "益": 71.3
      },
      "member_count": 24,
      "description": "【本周观测】这组资产呈现稳健收益特征，与历史上'坤'卦模式相似度82%"
    },
    "...": "...",
    "hex_chaos": {
      "member_count": 8,
      "description": "本周8个资产无法归入任何明确模式，标记为混沌"
    }
  },
  "notable_findings": [
    {
      "type": "new_pattern",
      "hex_id": "hex_61",
      "description": "🎉 本周发现一种前所未见的配置模式！特征：极低开放(15)+极高衍生(92)。社区可提议新卦名。"
    },
    {
      "type": "extinct_pattern",
      "traditional_name": "家人卦",
      "description": "⚠️ 本周未观测到家人卦模式。该卦象进入'空亡'状态。"
    },
    {
      "type": "merge_observed",
      "description": "观测到师卦与比卦融合为一个簇，反映市场整合趋势"
    }
  ],
  "next_week_prediction": "下周聚类结果可能完全不同。某些簇可能分裂、合并或消失。"
}
```

### 7.3 可视化示意

```
t-SNE可视化（ASCII示意）—— 本周观测结果：

                    乾卦模式 (hex_01)  ← 本周观测到
                        ☰
                      ● ● ●
                    ● ● ● ●
                      ● ● ●
                          
    艮卦模式               │               兑卦模式
    (hex_52)               │              (hex_58)
      ◆ ◆                  │                 ▲ ▲
       ◆                   │                  ▲
                           │
◄──────────────────────────┼──────────────────────────►
                           │
    坤卦模式               │              离卦模式
    (hex_02)               │              (hex_30)
      ■ ■                  │                ○ ○
     ■ ■ ■                 │               ○ ○ ○
      ■ ■                  │                ○ ○
                           │
                    震卦模式 (hex_03)
                        ☳
                      ◆ ◆ ◆
                    ◆ ◆ ◆ ◆

散落的 · 点 = 本周未归入任何模式的噪声资产 (hex_chaos)

【本周观测说明】
- ● 乾卦模式：本周观测到28个资产呈现高用+高扩+高衍+高益特征
- ■ 坤卦模式：本周观测到24个资产呈现稳健收益特征
- ◆ 震卦模式：本周观测到19个资产呈现活跃扩张特征
- ○ 离卦模式：本周观测到20个资产呈现创新驱动特征
- ▲ 兑卦模式：本周观测到25个资产呈现流动性特征
- ◆ 艮卦模式：本周观测到15个资产呈现保守实用特征

⚠️ 重要提示：
- 以上所有"卦象"都是本周观测到的数据簇
- 下周这些簇可能分裂、合并或消失
- 下周可能有新簇出现，旧簇"空亡"
- 这不是"乾卦的定义"，是"本周被标记为乾卦的数据簇"
```

### 7.4 卦象流动示例

```
资产 BTC 的卦象归属历史（后验观测记录）：

周次    观测卦象    状态        说明
─────────────────────────────────────────────────────
W1      乾(01)    观测记录    本周聚类发现BTC属于乾模式
W2      乾(01)    观测记录    本周BTC继续属于乾模式
W3      乾(01)    观测记录    本周BTC继续属于乾模式
W4      乾(01)    观测记录    本周BTC继续属于乾模式
W5      乾(01)    分裂观测    本周乾模式分化为两个子簇
W6      夬(43)    流动观测    本周聚类显示BTC进入夬模式
W7      夬(43)    观测记录    本周BTC继续属于夬模式
W8      姤(44)    流动观测    本周聚类显示BTC进入姤模式
...
W52     姤(44)    观测记录    本周BTC属于姤模式

【重要理解】
这不是"BTC从乾卦移动到姤卦"（暗示卦象是固定的）
这是"本周观测到BTC属于乾模式，下周观测到属于姤模式"

变化的原因可能是：
1. BTC本身的特征变了（六爻得分变化）
2. 其他资产的变化导致聚类边界移动
3. 市场整体配置空间的结构变了

这不是BTC"变差了"，而是：
- BTC的配置特征发生了变化
- 或：聚类算法发现了更细致的市场结构
- 或：市场的整体模式分布发生了变化

每一周的记录都是独立的观测结果，不是对固定卦象的追踪。
```

---

## 8. 总结与展望

### 8.1 核心创新

```
┌────────────────────────────────────────────────────────────────┐
│                    ECHO 64卦聚类系统的创新                      │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  1. 后验分类范式                                                │
│     • 分类从数据中来，而非人脑预设                              │
│     • 64卦是发现，不是设计                                      │
│                                                                │
│  2. 动态演化能力                                                │
│     • 卦象随市场自然流动                                        │
│     • 新模式的自动发现（新卦象诞生）                            │
│     • 旧模式的消逝（空亡卦象）                                  │
│                                                                │
│  3. 传统智慧的数字重生                                          │
│     • 《易经》从占卜书变为分析框架                              │
│     • 64卦从神秘符号变为数据模式                                │
│     • 保持哲学深度，获得技术精度                                │
│                                                                │
│  4. 双重动态性                                                  │
│     • 六爻：相对排名的动态                                      │
│     • 64卦：配置聚类的动态                                      │
│     • 两个维度共同定义资产状态                                  │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### 8.2 技术亮点

- **DBSCAN密度聚类**：自动发现自然簇数量，不强制64卦
- **自然演化接受**：接受58卦、64卦或70卦，尊重市场真实结构
- **新卦象发现机制**：自动识别前所未见的配置模式
- **Merkle Tree验证**：链上可验证的聚类结果
- **完整的流动追踪**：资产的卦象历史完整记录
- **后验命名系统**：根据观测特征匹配传统卦名，非先验定义

### 8.3 哲学意义重申

```
64卦不是容器，而是涌现。
它们不是先验的设计，而是后验的发现。
每一卦都是一个在特定时间点观测到的模式，
会随数据变化而变化，会诞生，也会消逝。

当市场发生变化，卦象随之流动——
这不是系统的失效，而是系统的生命力。

本周观测到64卦 ≠ 成功
本周观测到58卦 ≠ 失败
本周观测到70卦 ≠ 异常

这些都是市场自然的呈现。

新卦象的"诞生" = 新市场模式的发现
旧卦象的"空亡" = 该模式在当前市场不存在
资产的"流动" = 资产配置特征的演化

传统《易经》说："易者，变易也。"
ECHO系统说："卦者，数据之涌现也。"

我们不是在用64个盒子分类资产，
我们是在倾听数据告诉我们的市场真相。

这，就是ECHO的道。
```

### 8.4 下一步工作

1. **回测验证**：使用历史数据验证聚类的稳定性和预测性
2. **参数优化**：根据实际资产数量优化t-SNE和DBSCAN参数
3. **前端可视化**：开发交互式的卦象浏览和流动追踪界面
4. **预言机集成**：完成链下聚类到链上存储的全流程自动化
5. **社区治理**：设计卦象命名和参数调整的DAO治理机制

---

**文档版本**: v1.0  
**创建日期**: 2024  
**作者**: ECHO Protocol Team  
**状态**: 技术规范草案

---

> *"易者，象也。象也者，像也。"* ——《易传》  
> *在数据中寻找象，在象中发现道。*
