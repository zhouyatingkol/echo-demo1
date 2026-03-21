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

**示例向量：**

| Asset ID | 用 | 扩 | 衍 | 益 | 描述 |
|----------|----|----|----|-----|------|
| BTC | 85 | 70 | 40 | 60 | 高实用，中等开放，低衍生 |
| ETH | 80 | 85 | 75 | 70 | 高实用，高开放，高衍生 |
| UNI | 45 | 90 | 95 | 55 | 中等实用，极高开放，极高衍生 |
| MKR | 60 | 65 | 80 | 75 | 中高实用，中等开放，高衍生 |

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

**簇数量 != 64 的处理：**

```
发现簇数量 > 64：
  → 对最大的簇进行分裂（使用K-means子聚类）
  → 或提高eps参数重新聚类

发现簇数量 < 64：
  → 接受自然模式（可能某些"卦象"暂时不存在）
  → 或降低eps，允许更精细的划分
  → 或引入"空亡"概念，标记缺失的卦象

理想情况 = 64：
  → 直接采用
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

| 特性 | DBSCAN | K-means |
|------|--------|---------|
| 簇数量 | 自动发现 | 固定64 |
| 形状 | 任意 | 球形 |
| 噪声处理 | 识别异常点 | 强制归类 |
| 计算 | O(n log n) | O(n * k * i) |
| 推荐场景 | 探索阶段，接受自然模式 | 生产阶段，需要固定结构 |

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
    "BTC": "hex_01",    // 乾卦
    "ETH": "hex_44",    // 姤卦
    "UNI": "hex_30",    // 离卦
    "MKR": "hex_58",    // 兑卦
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

### 3.3 簇数量偏离64的处理策略

#### 场景1：发现 > 64 个簇

```
处理流程：
1. 识别最大的簇
2. 对该簇进行子聚类（K-means, k=2）
3. 重复直到簇数 = 64
4. 或：标记某些簇为"变卦"（类似易经中的变爻概念）
```

#### 场景2：发现 < 64 个簇

```
处理选项：

选项A - 接受自然（推荐）：
  → 允许某些卦象暂时"空亡"
  → 空卦标记为 "hex_null_XX"
  → 哲学意义：某些模式在当前市场不存在

选项B - 强制分裂：
  → 选择最分散的簇进行分裂
  → 使用簇内方差作为分裂指标
  
选项C - 引入噪声点：
  → 将DBSCAN识别的噪声点单独成簇
  → 标记为 "hex_chaos"（混沌卦）
```

#### 场景3：恰好 64 个簇

```
理想情况 → 直接采用
验证指标：
  - Silhouette Score（轮廓系数）> 0.5
  - Davies-Bouldin Index（DB指数）< 1.0
  - 最小簇大小 > 3个资产
```

### 3.4 历史追踪

每个资产维护卦象流动历史：

```json
{
  "asset_id": "ETH",
  "hexagram_history": [
    {"epoch": 1697395200, "hex_id": "hex_01", "confidence": 0.85},
    {"epoch": 1698000000, "hex_id": "hex_01", "confidence": 0.82},
    {"epoch": 1698604800, "hex_id": "hex_44", "confidence": 0.71},  // 流动
    {"epoch": 1699209600, "hex_id": "hex_44", "confidence": 0.88}
  ],
  "flow_patterns": [
    {"from": "hex_01", "to": "hex_44", "epoch": 1698604800, "trigger": "market_event"}
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

### 4.2 维度到八卦的映射

```
四维度 → 八卦特征：

高用 + 低扩 + 低衍 + 低益 → 艮卦（山）稳重保守
高用 + 高扩 + 低衍 + 低益 → 震卦（雷）活跃扩张
高用 + 低扩 + 高衍 + 低益 → 坎卦（水）深度复杂
高用 + 低扩 + 低衍 + 高益 → 巽卦（风）收益导向
低用 + 高扩 + 高衍 + 低益 → 离卦（火）创新开放
低用 + 高扩 + 低衍 + 高益 → 兑卦（泽）流动收益
低用 + 低扩 + 高衍 + 高益 → 坤卦（地）承载收益
高用 + 高扩 + 高衍 + 高益 → 乾卦（天）全面领先
```

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

#### 示例1：乾卦（hex_01）

```yaml
hexagram_id: hex_01
traditional_name: 乾
symbol: ☰
nature: 天
cluster_center:
  用: 88
  扩: 85
  衍: 78
  益: 82
characteristics:
  - 全面高分，各方面表现优异
  - 市场领导者，生态核心
  - 高实用 + 高开放 + 高衍生
members_example:
  - BTC（某些时期）
  - ETH（大部分时间）
description: |
  乾卦资产如天行健，自强不息。
  它们在实用性、开放性、衍生性和收益性上都表现卓越，
  是整个生态的基石和引领者。
```

#### 示例2：姤卦（hex_44）

```yaml
hexagram_id: hex_44
traditional_name: 姤
symbol: ☴☰
nature: 风天
cluster_center:
  用: 75
  扩: 92
  衍: 85
  益: 68
characteristics:
  - 极高开放度，广泛连接
  - 高衍生性，生态复杂
  - 中等偏上的实用性和收益
members_example:
  - 主流DeFi协议
  - 跨链桥资产
description: |
  姤卦象征相遇与连接。
  这类资产以开放性和衍生性见长，
  是生态系统中的连接者和创新者，
  如风遇天，万物相交。
```

#### 示例3：屯卦（hex_03）

```yaml
hexagram_id: hex_03
traditional_name: 屯
symbol: ☳☵
nature: 雷水
cluster_center:
  用: 45
  扩: 75
  衍: 35
  益: 40
characteristics:
  - 高扩张性，积极增长
  - 但实用性和衍生性尚未成熟
  - 收益不稳定
members_example:
  - 新兴L1/L2代币
  - 早期阶段项目
description: |
  屯卦象征初生之难，万物始生。
  这类资产充满扩张欲望但基础尚浅，
  如雷雨交加，既有生机也有挑战。
  它们代表市场的创新前沿。
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
64卦动态聚类核心算法
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
    64卦动态聚类引擎
    """
    
    TARGET_CLUSTERS = 64  # 目标卦象数量
    
    def __init__(self, 
                 dim_method: str = 'tsne',
                 cluster_method: str = 'dbscan',
                 random_state: int = 42):
        """
        初始化聚类引擎
        
        Args:
            dim_method: 降维方法 ('tsne' 或 'umap')
            cluster_method: 聚类方法 ('dbscan' 或 'kmeans')
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
        self.cluster_centers_ = None
        
    def prepare_data(self, 
                     assets: List[Dict]) -> np.ndarray:
        """
        准备资产配置向量
        
        Args:
            assets: [{'id': 'BTC', '用': 85, '扩': 70, '衍': 40, '益': 60}, ...]
        
        Returns:
            X: 标准化后的特征矩阵 (n_samples, 4)
            asset_ids: 资产ID列表
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
            # t-SNE参数自适应
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
    
    def cluster(self, 
                X_reduced: np.ndarray,
                target_clusters: int = 64) -> np.ndarray:
        """
        执行聚类
        
        Args:
            X_reduced: 降维后的数据
            target_clusters: 目标簇数量
        
        Returns:
            labels: 聚类标签
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
            
            # 调整簇数量到目标值
            labels = self._adjust_clusters(
                X_reduced, labels, target_clusters
            )
            
        elif self.cluster_method == 'kmeans':
            self.clusterer = KMeans(
                n_clusters=target_clusters,
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
        distances = np.sort(distances[:, 4])  # 第5近邻距离
        
        # 简单启发式：取80%分位数
        eps = np.percentile(distances, 80)
        return max(eps, 2.0)  # 最小值2.0
    
    def _adjust_clusters(self, 
                         X: np.ndarray,
                         labels: np.ndarray,
                         target: int) -> np.ndarray:
        """
        调整簇数量到目标值
        """
        n_clusters = len(set(labels)) - (1 if -1 in labels else 0)
        noise_mask = (labels == -1)
        
        if n_clusters == target:
            return labels
        
        elif n_clusters > target:
            # 簇过多：合并最小的簇
            labels = self._merge_clusters(X, labels, n_clusters, target)
            
        elif n_clusters < target:
            # 簇过少：分裂最大的簇
            labels = self._split_clusters(X, labels, n_clusters, target)
        
        return labels
    
    def _merge_clusters(self, X, labels, current, target):
        """合并最小/最相似的簇"""
        # 简化实现：合并样本数最少的簇
        from collections import Counter
        
        while len(set(labels)) - (1 if -1 in labels else 0) > target:
            counts = Counter(l for l in labels if l != -1)
            smallest = counts.most_common()[-1][0]
            
            # 找到最近的簇进行合并
            centers = {}
            for c in counts:
                mask = labels == c
                centers[c] = X[mask].mean(axis=0)
            
            min_dist = float('inf')
            merge_to = None
            for c, center in centers.items():
                if c != smallest:
                    dist = np.linalg.norm(center - centers[smallest])
                    if dist < min_dist:
                        min_dist = dist
                        merge_to = c
            
            if merge_to is not None:
                labels[labels == smallest] = merge_to
        
        return labels
    
    def _split_clusters(self, X, labels, current, target):
        """分裂最大的簇"""
        from collections import Counter
        
        next_label = max(labels) + 1
        
        while len(set(labels)) - (1 if -1 in labels else 0) < target:
            counts = Counter(l for l in labels if l != -1)
            largest = counts.most_common(1)[0][0]
            
            # 对最大簇进行K-means二分
            mask = labels == largest
            X_largest = X[mask]
            
            if len(X_largest) < 10:  # 太小就不分裂了
                break
            
            kmeans = KMeans(n_clusters=2, random_state=42, n_init=10)
            sub_labels = kmeans.fit_predict(X_largest)
            
            # 更新标签
            indices = np.where(mask)[0]
            labels[indices[sub_labels == 1]] = next_label
            next_label += 1
        
        return labels
    
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
  ├─ 调整簇数量至64（如需要）
  ├─ 计算簇中心和特征
  └─ 输出: cluster_labels.json

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

#### 查询场景

```
场景1：查看某资产的完整状态
  输入: asset_id = "ETH"
  查询六爻系统 → 获取4维得分
  查询64卦系统 → 获取所属卦象
  输出: ETH当前在姤卦，实用性排名第82百分位...

场景2：发现同类资产
  输入: asset_id = "ETH"
  查询64卦系统 → ETH属于姤卦
  获取姤卦所有成员 → [ETH, UNI, AAVE, ...]
  过滤: 六爻得分相似的资产
  输出: 与ETH配置相似的其他资产

场景3：市场结构分析
  查询64卦系统 → 各卦象的成员分布
  发现: 屯卦资产数量激增（新资产涌现）
  查询六爻系统 → 这些资产的4维特征
  输出: 当前市场创新热点分析

场景4：资产流动追踪
  查询64卦历史 → ETH从乾卦移动到姤卦
  查询六爻历史 → ETH的扩、衍得分上升
  分析: ETH的开放性和衍生性增强
  输出: ETH生态角色转变报告
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

执行聚类后，可能得到以下结果：

```json
{
  "epoch": 1699209600,
  "statistics": {
    "n_assets": 200,
    "n_clusters": 61,
    "n_noise": 8,
    "silhouette_score": 0.67
  },
  "cluster_centers": {
    "hex_01": {
      "name": "乾",
      "用": 86.3, "扩": 84.7, "衍": 76.2, "益": 81.5,
      "member_count": 28,
      "description": "全面领先的领导者"
    },
    "hex_02": {
      "name": "坤",
      "用": 41.2, "扩": 36.8, "衍": 44.5, "益": 71.3,
      "member_count": 24,
      "description": "稳健收益型资产"
    },
    "hex_03": {
      "name": "屯",
      "用": 68.5, "扩": 83.2, "衍": 46.1, "益": 54.8,
      "member_count": 19,
      "description": "积极扩张的新生力量"
    },
    "hex_04": {
      "name": "蒙",
      "用": 54.3, "扩": 76.5, "衍": 79.2, "益": 59.1,
      "member_count": 21,
      "description": "创新驱动型资产"
    },
    "...": "...",
    "hex_chaos": {
      "name": "混沌",
      "member_count": 8,
      "description": "无法明确归类的边缘资产"
    }
  },
  "notable_findings": [
    {
      "type": "new_pattern",
      "hex_id": "hex_52",
      "description": "发现新的聚集模式：高益+低扩+中用+中衍，可能对应传统'蛊'卦"
    },
    {
      "type": "split",
      "from": "hex_01",
      "to": ["hex_01", "hex_43"],
      "description": "乾卦分化为两群：核心领导者(hex_01)和新兴挑战者(hex_43)"
    },
    {
      "type": "merge",
      "from": ["hex_07", "hex_08"],
      "to": "hex_07",
      "description": "师卦与比卦合并，可能反映市场整合趋势"
    }
  ]
}
```

### 7.3 可视化示意

```
t-SNE可视化（ASCII示意）：

                    乾卦集群 (hex_01)
                        ☰
                      ● ● ●
                    ● ● ● ●
                      ● ● ●
                          
    艮卦集群               │               兑卦集群
    (hex_52)               │              (hex_58)
      ◆ ◆                  │                 ▲ ▲
       ◆                   │                  ▲
                           │
◄──────────────────────────┼──────────────────────────►
                           │
    坤卦集群               │              离卦集群
    (hex_02)               │              (hex_30)
      ■ ■                  │                ○ ○
     ■ ■ ■                 │               ○ ○ ○
      ■ ■                  │                ○ ○
                           │
                    震卦集群 (hex_03)
                        ☳
                      ◆ ◆ ◆
                    ◆ ◆ ◆ ◆

散落的 · 点 = 噪声/混沌资产 (hex_chaos)

说明：
- ● 乾卦：高用+高扩+高衍+高益，市场领导者聚集区
- ■ 坤卦：低用+低扩+中衍+高益，稳健收益型
- ◆ 震卦：中用+高扩+低衍+中益，活跃扩张型
- ○ 离卦：低用+高扩+高衍+低益，创新驱动型
- ▲ 兑卦：中用+中扩+中衍+高益，流动性导向型
- ◆ 艮卦：高用+低扩+低衍+中益，保守实用型
```

### 7.4 卦象流动示例

```
资产 BTC 的历史卦象归属：

周次    卦象      状态        说明
─────────────────────────────────────────────────────
W1      乾(01)    诞生        聚类发现的核心领导者
W2      乾(01)    稳定        继续作为领导者
W3      乾(01)    稳定        继续作为领导者  
W4      乾(01)    稳定        继续作为领导者
W5      乾(01)    分裂        市场分化，仍为最大子群
W6      夬(43)    流动        新资产崛起，BTC退居次席
W7      夬(43)    稳定        适应新位置
W8      姤(44)    流动        生态角色进一步转变
...
W52     姤(44)    演化完成    新的稳定状态

说明：BTC从"天"(乾)退到"天风姤"，反映了市场格局的演变。
这不是BTC"变差了"，而是市场生态更加丰富了。
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

- **灵活的聚类算法**：支持DBSCAN（自动发现）和K-means（固定64）
- **智能簇数量调整**：自动合并或分裂以达到目标64卦
- **Merkle Tree验证**：链上可验证的聚类结果
- **完整的流动追踪**：资产的卦象历史完整记录
- **平滑过渡机制**：避免过于频繁的卦象震荡

### 8.3 哲学意义重申

```
64卦不是容器，而是涌现。
它们不是先验的设计，而是后验的发现。
每一卦都是一个活生生的模式，会呼吸、会成长、会消逝。

当市场发生变化，卦象随之流动——
这不是系统的失效，而是系统的生命力。

新卦象的诞生 = 新市场模式的发现
旧卦象的消亡 = 过时模式的退场
资产的流动 = 生态角色的自然演变

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
