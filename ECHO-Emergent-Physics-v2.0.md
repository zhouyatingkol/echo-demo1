# ECHO 涌现物理协议 v2.0
## 从设计到涌现：观测者而非设计者

**版本**：v2.0  
**日期**：2026-03-21  
**状态**：核心范式升级  
**依赖**：ECHO-Core-Design-v1.0.md（64卦张量宇宙世界观）

---

## 1. 范式宣言：从设计到涌现

### 1.1 旧范式的局限

v1.0 是**设计者的傲慢**：
- 我们设定固定阈值（7天3次、30天10次）
- 我们认为知道什么算"好"的内容
- 我们试图控制资产如何生长

**问题在于**：内容生态的复杂性远超任何设计团队的能力边界。

### 1.2 新范式：涌现物理

v2.0 承认一个根本事实：

> **我们不是规则的设计者，而是物理法则的观测者。**

就像物理学家不"设计"重力，而是**发现**并**描述**它——ECHO 不设计内容的价值标准，而是：
1. **观测**全网创作者的行为数据
2. **计算**涌现的统计规律（阈值作为物理常数）
3. **验证**观测数据的合理性
4. **记录**异常事件（可能是刷量、误差，或新物理现象）

### 1.3 核心哲学转变

| 维度 | v1.0（设计） | v2.0（涌现） |
|------|-------------|-------------|
| **阈值** | 固定常量（人工设定） | 动态分位数（数据驱动） |
| **六爻** | 绝对档位（固定标准） | 相对排名（竞争位置） |
| **验证** | 禁止不符合规则的行为 | 标记异常，记录现象 |
| **角色** | 平台设计者 | 物理观测者 |
| **叙事** | "我们设定了规则" | "物理常数由你们塑造" |

**关键洞察**：
> 创作者的选择改变物理常数。当更多创作者选择某种创作模式，阈值自然漂移，新的"物理"就此形成。

---

## 2. 动态阈值机制

### 2.1 阈值作为物理常数

在涌现范式中，阈值不再是人工设定的常数，而是**全网数据的统计特征**。

**形式化定义**：
```
T_t(dimension, level) = percentile(D_{t-1}, 75%)

其中：
- T_t: 第t周的阈值（物理常数）
- D_{t-1}: 第t-1周的全网数据分布
- percentile(·, 75%): 75%分位数
- dimension ∈ {time, space, relation}
- level ∈ {1, 2, 3}（三个升级门槛）
```

### 2.2 三维动态阈值计算

#### 2.2.1 时间维阈值（使用频率）

```python
def calculate_time_thresholds(usage_data_week_t_minus_1):
    """
    计算时间维的三个阈值档位
    usage_data: 所有资产在t-1周的7天和30天使用次数列表
    """
    # 提取所有资产的7天使用次数
    usage_7d = [asset.usage_7d for asset in all_assets]
    # 提取所有资产的30天使用次数  
    usage_30d = [asset.usage_30d for asset in all_assets]
    
    thresholds = {
        # 档位1：首次活跃（较低门槛，保留人工设定）
        'level_1': 1,  # 任意使用即激活，保持开放性
        
        # 档位2：7天使用次数的75%分位数
        'level_2': percentile(usage_7d, 75%),
        
        # 档位3：30天使用次数的75%分位数
        'level_3': percentile(usage_30d, 75%)
    }
    
    return thresholds
```

**示例**：
- 第10周统计：全网资产7天使用次数的75%分位数 = 5次
- 则第11周的阈值 T_time(2) = 5
- 意味着：7天内使用≥5次的资产，进入时间维档位2

#### 2.2.2 空间维阈值（平台分布）

```python
def calculate_space_thresholds(platform_data_week_t_minus_1):
    """
    计算空间维的三个阈值档位
    """
    # 提取所有资产的平台分布数量
    platform_counts = [asset.platform_count for asset in all_assets]
    
    thresholds = {
        # 档位1：任意平台出现
        'level_1': 1,
        
        # 档位2：平台数量的75%分位数
        'level_2': max(2, percentile(platform_counts, 75%)),
        
        # 档位3：更高端的分位数（如90%）以突出头部
        'level_3': max(3, percentile(platform_counts, 90%))
    }
    
    return thresholds
```

#### 2.2.3 关系维阈值（连接强度）

```python
def calculate_relation_thresholds(relation_data_week_t_minus_1):
    """
    计算关系维的三个阈值档位
    """
    # 提取所有资产的引用/衍生/连接数量
    citation_counts = [asset.citation_count for asset in all_assets]
    
    # 过滤掉0（避免大量无引用资产拉低阈值）
    non_zero_citations = [c for c in citation_counts if c > 0]
    
    if len(non_zero_citations) < 100:  # 数据不足时使用默认值
        return {'level_1': 1, 'level_2': 3, 'level_3': 5}
    
    thresholds = {
        'level_1': 1,  # 首次被引用即激活
        'level_2': percentile(non_zero_citations, 75%),
        'level_3': percentile(non_zero_citations, 90%)
    }
    
    return thresholds
```

### 2.3 阈值更新周期

**更新频率**：每周一次（UTC时间每周一00:00）

**流程**：
```
周日23:59: 快照全网数据
周一00:00: 链下计算新阈值
周一00:30: 生成ZK proof证明计算正确性
周一01:00: 提交链上，更新全局参数
```

**平滑过渡机制**：
```python
# 避免阈值剧烈波动，使用指数移动平均
T_t_smooth = α * T_t_new + (1-α) * T_t_minus_1
# α = 0.7（70%新值 + 30%旧值）
```

### 2.4 阈值的历史记录

每个阈值的变更都被记录，形成"物理历史"：

```solidity
struct ThresholdHistory {
    uint256 week;           // 周序号
    uint256 timestamp;      // 更新时间
    uint8[3] timeThresholds;     // 时间维三档
    uint8[3] spaceThresholds;    // 空间维三档  
    uint8[3] relationThresholds; // 关系维三档
    bytes32 zkProofHash;    // 计算证明
    string dataSnapshotCID; // IPFS上的原始数据快照
}
```

---

## 3. 相对排名六爻

### 3.1 从固定档位到百分位排名

v1.0的六爻是**绝对标准**：达到固定阈值即升级。

v2.0的六爻是**相对位置**：你在全网创作者中的排名决定你的爻位。

**核心公式**：
```
Rank(asset, dimension) = percentile_score(asset.dimension_value, all_assets)

其中：
- Rank ∈ [0, 100]（百分位数）
- dimension_value: 资产在对应维度的当前值
- all_assets: 全网所有活跃资产在该维度的值分布
```

### 3.2 六爻百分位定义

| 六爻 | 排名区间 | 含义 | 旧名称 |
|------|---------|------|--------|
| **初九** | 后25%（0-25%） | 潜藏 | 潜龙勿用 |
| **九二** | 25-50% | 显现 | 见龙在田 |
| **九三** | 50-70% | 勤勉 | 终日乾乾 |
| **九四** | 70-85% | 试探 | 或跃在渊 |
| **九五** | 85-95% | 大成 | 飞龙在天 |
| **上九** | 前5%（95-100%） | 转化 | 亢龙有悔 |

**可视化**：
```
排名分布：
0%        25%       50%       70%       85%       95%       100%
|----初九----|----九二----|----九三----|----九四----|----九五----|---上九---|
  后25%        25-50%      50-70%      70-85%      85-95%      前5%
```

### 3.3 综合六爻计算

由于每个资产有三个维度（时间、空间、关系），需要综合计算最终六爻：

```python
def calculate_yao(asset, all_assets):
    """
    基于相对排名计算六爻位置
    """
    # 计算三个维度的百分位排名
    time_rank = percentile(asset.time_value, [a.time_value for a in all_assets])
    space_rank = percentile(asset.space_value, [a.space_value for a in all_assets])
    relation_rank = percentile(asset.relation_value, [a.relation_value for a in all_assets])
    
    # 计算综合排名（加权平均）
    # 权重可根据资产类型动态调整
    composite_rank = (time_rank * 0.5 + 
                      space_rank * 0.3 + 
                      relation_rank * 0.2)
    
    # 映射到六爻
    if composite_rank < 25:
        return "初九"
    elif composite_rank < 50:
        return "九二"
    elif composite_rank < 70:
        return "九三"
    elif composite_rank < 85:
        return "九四"
    elif composite_rank < 95:
        return "九五"
    else:
        return "上九"
```

### 3.4 排名动态性

**关键特性**：六爻位置是**相对的**而非绝对的。

- 如果你的内容保持活跃，但全网活跃度上升更快 → 排名可能下降
- 如果全网进入"淡季"，你的相对排名可能上升，即使绝对数据不变
- 这模拟了真实的竞争环境：不进则退

**示例场景**：
```
第10周：
- 你的7天使用次数：8次
- 全网75%分位数：5次
- 你的排名：85% → 九四

第11周（全网爆发式增长）：
- 你的7天使用次数：10次（绝对增长）
- 全网75%分位数：15次（更快增长）
- 你的排名：60% → 九三（相对下降）
```

---

## 4. 异常检测验证

### 4.1 从禁止到观测

v1.0：验证不通过 → 禁止交易 ❌  
v2.0：检测到异常 → 标记并记录 ⚠️

**哲学转变**：
> 我们不声称知道"正确"是什么样子。我们只识别"与常态显著不同"的现象，并记录它们。

### 4.2 Z-Score 异常检测

使用统计学中的 Z-Score 识别异常值：

```python
def calculate_z_score(value, population):
    """
    计算Z-Score
    Z = (X - μ) / σ
    """
    mean = sum(population) / len(population)
    std_dev = (sum((x - mean)**2 for x in population) / len(population))**0.5
    
    if std_dev == 0:
        return 0
    
    return (value - mean) / std_dev


def detect_anomaly(asset_event, historical_pattern):
    """
    检测异常事件
    """
    z_score = calculate_z_score(asset_event.value, historical_pattern)
    
    if abs(z_score) < 2:
        return "NORMAL", z_score, None
    elif abs(z_score) < 3:
        return "SUSPICIOUS", z_score, "中度偏离常态"
    else:
        return "ANOMALY", z_score, "显著异常"
```

### 4.3 异常检测维度

#### 4.3.1 时间模式异常

```python
def check_temporal_pattern(asset_id, recent_events):
    """
    检测时间模式异常
    - 正常：事件在时间上相对均匀分布
    - 异常：短时间内爆发式增长（可能的刷量）
    """
    if len(recent_events) < 10:
        return "INSUFFICIENT_DATA"
    
    # 计算事件间的时间间隔
    intervals = []
    for i in range(1, len(recent_events)):
        interval = recent_events[i].timestamp - recent_events[i-1].timestamp
        intervals.append(interval)
    
    # 如果最近10个事件都发生在1小时内
    recent_intervals = intervals[-10:]
    if sum(recent_intervals) < 3600:  # 1小时 = 3600秒
        return "ANOMALY_BURST", "短时间内大量事件"
    
    # 如果间隔过于规律（可能的机器人行为）
    interval_variance = variance(recent_intervals)
    if interval_variance < 1.0:  # 几乎相同间隔
        return "ANOMALY_ROBOTIC", "过于规律的时间模式"
    
    return "NORMAL"
```

#### 4.3.2 空间分布异常

```python
def check_spatial_distribution(asset_id, platform_events):
    """
    检测跨平台分布异常
    - 正常：多平台分布相对均衡
    - 异常：单一来源占比过高
    """
    platform_counts = {}
    for event in platform_events:
        platform_counts[event.platform] = platform_counts.get(event.platform, 0) + 1
    
    total = sum(platform_counts.values())
    max_platform_ratio = max(platform_counts.values()) / total
    
    if max_platform_ratio > 0.95:  # 95%来自单一平台
        return "ANOMALY_SINGLE_SOURCE", "过度依赖单一平台"
    
    # 检测平台间的时间一致性（可能的协同刷量）
    platform_times = {}
    for event in platform_events:
        if event.platform not in platform_times:
            platform_times[event.platform] = []
        platform_times[event.platform].append(event.timestamp)
    
    # 如果多个平台的事件高度同步
    for p1, times1 in platform_times.items():
        for p2, times2 in platform_times.items():
            if p1 >= p2:
                continue
            correlation = time_correlation(times1, times2)
            if correlation > 0.9:  # 高度时间相关
                return "ANOMALY_COORDINATED", f"平台 {p1} 和 {p2} 事件高度同步"
    
    return "NORMAL"
```

#### 4.3.3 关系网络异常

```python
def check_relation_network(asset_id, citation_graph):
    """
    检测引用网络异常
    - 正常：引用网络呈现自然的幂律分布
    - 异常：闭环引用、自引用集群等
    """
    # 检测闭环引用（A引用B，B引用A）
    citations = citation_graph.get(asset_id, [])
    for cited in citations:
        if asset_id in citation_graph.get(cited, []):
            return "ANOMALY_MUTUAL_CITATION", f"与 {cited} 存在双向引用"
    
    # 检测引用爆发异常
    recent_citations = [c for c in citations if c.time > now() - 7*24*3600]
    z_score = calculate_z_score(len(recent_citations), historical_citation_counts)
    
    if z_score > 3:
        return "ANOMALY_CITATION_BURST", f"引用增长Z-Score: {z_score:.2f}"
    
    return "NORMAL"
```

### 4.4 异常事件日志

所有检测到的异常都被记录在链上，但不阻止交易：

```solidity
struct AnomalyEvent {
    bytes32 assetId;
    uint256 timestamp;
    AnomalyType anomalyType;
    string description;
    int256 zScore;
    string possibleCauses;  // 可能原因列表
    bool resolved;          // 是否已解决/确认
    string resolution;      // 解决说明
}

enum AnomalyType {
    TEMPORAL_BURST,      // 时间爆发
    ROBOTIC_PATTERN,     // 机器人模式
    SINGLE_SOURCE,       // 单一来源
    COORDINATED,         // 协同行为
    MUTUAL_CITATION,     // 相互引用
    CITATION_BURST,      // 引用爆发
    SPATIAL_JUMP,        // 空间跳跃（突然出现在多平台）
    RELATION_CLUSTER,    // 关系集群
    PHYSICAL_PHENOMENON  // 可能是新物理现象
}
```

### 4.5 可能原因与处理

每个异常类型都有预设的可能原因：

| 异常类型 | 可能原因 | 建议处理 |
|---------|---------|---------|
| **TEMPORAL_BURST** | 1. 刷量攻击<br>2. 病毒式传播<br>3. 活动推广期 | 标记观察，7天后重新评估 |
| **ROBOTIC_PATTERN** | 1. 自动化脚本<br>2. 定时任务同步<br>3. 平台API限制导致 | 标记为"待人工复核" |
| **SINGLE_SOURCE** | 1.  niche内容<br>2. 平台独占协议<br>3. 刷量集中在单一平台 | 正常记录，无特殊处理 |
| **COORDINATED** | 1. 跨平台营销活动<br>2. 有组织刷量<br>3. 大型联动事件 | 提高验证频率，增加采样 |
| **MUTUAL_CITATION** | 1. 合作创作<br>2. 互刷引用<br>3. 闭环小圈子 | 记录关系图，分析网络结构 |
| **CITATION_BURST** | 1. 热点事件关联<br>2. 引用刷量<br>3. 新类型内容爆发 | 追踪引用来源质量 |
| **PHYSICAL_PHENOMENON** | 可能是新的内容传播模式 | 深入研究，可能更新模型 |

**关键原则**：
> 异常的标记不意味着惩罚。它只是说："这里有些不同寻常的东西，值得关注。" 
> 
> 牛顿的苹果也是异常——它向下落而不是向任意方向。关注异常，可能发现新物理。

---

## 5. 技术架构：链下统计 + 链上验证

### 5.1 架构概览

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            ECHO v2.0 架构                                │
├─────────────────────────────────────────────────────────────────────────┤
│  链下层 (Off-Chain)          │        链上层 (On-Chain)                 │
│                              │                                          │
│  ┌─────────────────────┐    │    ┌─────────────────────────────────┐   │
│  │ 数据聚合器          │    │    │ 阈值注册合约                     │   │
│  │ - 抓取全平台数据    │───►│───►│ - 存储当前阈值参数               │   │
│  │ - 清洗和标准化      │    │    │ - 验证并更新阈值                 │   │
│  └─────────────────────┘    │    └─────────────────────────────────┘   │
│           │                  │                    ▲                     │
│           ▼                  │                    │                     │
│  ┌─────────────────────┐    │    ┌─────────────────────────────────┐   │
│  │ 统计计算引擎        │    │    │ 证明验证合约                     │   │
│  │ - 计算分位数        │───►│───►│ - 验证ZK proof                  │   │
│  │ - 计算排名          │    │    │ - 验证Merkle proof              │   │
│  │ - 异常检测          │    │    │ - 拒绝无效证明                  │   │
│  └─────────────────────┘    │    └─────────────────────────────────┘   │
│           │                  │                                          │
│           ▼                  │    ┌─────────────────────────────────┐   │
│  ┌─────────────────────┐    │    │ 资产状态合约                     │   │
│  │ 证明生成器          │───►│───►│ - 查询资产排名/六爻             │   │
│  │ - 生成ZK proof      │    │    │ - 记录异常事件                   │   │
│  │ - 生成Merkle proof  │    │    │ - 更新资产状态                   │   │
│  └─────────────────────┘    │    └─────────────────────────────────┘   │
│                              │                                          │
└──────────────────────────────┴──────────────────────────────────────────┘
```

### 5.2 链下组件详解

#### 5.2.1 数据聚合器（Data Aggregator）

```python
class DataAggregator:
    """
    从所有接入ECHO协议的平台抓取数据
    """
    
    def __init__(self):
        self.platform_adapters = {}  # 平台适配器注册表
        self.raw_data_cache = []
    
    def register_platform(self, platform_id, adapter):
        """注册新平台的数据适配器"""
        self.platform_adapters[platform_id] = adapter
    
    def fetch_weekly_data(self, week_start, week_end):
        """
        抓取一周的全网数据
        """
        all_data = []
        
        for platform_id, adapter in self.platform_adapters.items():
            try:
                platform_data = adapter.fetch(
                    start_time=week_start,
                    end_time=week_end,
                    data_types=['usage', 'platform_distribution', 'citations']
                )
                all_data.extend(platform_data)
            except Exception as e:
                logger.error(f"平台 {platform_id} 数据抓取失败: {e}")
                # 使用上一周期的数据作为fallback
                all_data.extend(self.get_fallback_data(platform_id))
        
        return self.normalize_and_dedup(all_data)
    
    def normalize_and_dedup(self, raw_data):
        """数据清洗：统一格式、去重、处理冲突"""
        # ... 实现细节
        pass
```

#### 5.2.2 统计计算引擎（Statistics Engine）

```python
class StatisticsEngine:
    """
    计算阈值、排名、异常检测
    """
    
    def calculate_thresholds(self, data, week):
        """
        计算下周的阈值参数
        """
        # 提取各维度数据
        time_data = self.extract_time_dimension(data)
        space_data = self.extract_space_dimension(data)
        relation_data = self.extract_relation_dimension(data)
        
        thresholds = {
            'week': week + 1,
            'time': {
                'level_1': 1,
                'level_2': self.percentile(time_data['usage_7d'], 75),
                'level_3': self.percentile(time_data['usage_30d'], 75)
            },
            'space': {
                'level_1': 1,
                'level_2': max(2, self.percentile(space_data['platform_count'], 75)),
                'level_3': max(3, self.percentile(space_data['platform_count'], 90))
            },
            'relation': {
                'level_1': 1,
                'level_2': self.percentile(relation_data['citations'], 75),
                'level_3': self.percentile(relation_data['citations'], 90)
            }
        }
        
        return thresholds
    
    def calculate_all_ranks(self, data):
        """
        计算所有资产的百分位排名
        """
        # 提取所有值
        all_time_values = [d.time_value for d in data]
        all_space_values = [d.space_value for d in data]
        all_relation_values = [d.relation_value for d in data]
        
        ranks = {}
        for asset in data:
            ranks[asset.id] = {
                'time_rank': self.percentile_rank(asset.time_value, all_time_values),
                'space_rank': self.percentile_rank(asset.space_value, all_space_values),
                'relation_rank': self.percentile_rank(asset.relation_value, all_relation_values)
            }
        
        return ranks
    
    def detect_anomalies(self, events, historical_data):
        """
        运行所有异常检测算法
        """
        anomalies = []
        
        for event in events:
            # 时间模式检测
            temporal_result = check_temporal_pattern(event)
            if temporal_result != "NORMAL":
                anomalies.append({
                    'event': event,
                    'type': temporal_result[0],
                    'description': temporal_result[1]
                })
            
            # 其他检测...
        
        return anomalies
```

#### 5.2.3 证明生成器（Proof Generator）

```python
class ProofGenerator:
    """
    为链下计算生成可验证证明
    支持两种证明类型：
    1. ZK-SNARK proof（高安全性，高成本）
    2. Merkle proof（中等安全性，低成本）
    """
    
    def generate_zk_proof(self, input_data, computation, output):
        """
        生成ZK proof证明：
        "我确实对input_data执行了computation，得到了output"
        但不泄露input_data的具体内容
        """
        # 使用circom/snarkjs或类似工具
        witness = self.compute_witness(input_data, computation)
        proof = self.zk_prove(witness, self.zk_circuit)
        return proof
    
    def generate_merkle_proof(self, data_items, root_hash):
        """
        生成Merkle proof证明数据集完整性
        """
        tree = MerkleTree(data_items)
        assert tree.root == root_hash
        
        proofs = {}
        for i, item in enumerate(data_items):
            proofs[item.id] = tree.get_proof(i)
        
        return proofs
    
    def generate_threshold_proof(self, raw_data, computed_thresholds):
        """
        综合证明：原始数据 → 计算过程 → 阈值结果
        """
        # 1. 数据完整性证明（Merkle root）
        data_root = self.merkle_root(raw_data)
        
        # 2. 计算正确性证明（ZK proof）
        zk_proof = self.generate_zk_proof(
            input_hash=data_root,
            computation='calculate_thresholds',
            output=computed_thresholds
        )
        
        return {
            'dataRoot': data_root,
            'zkProof': zk_proof,
            'thresholds': computed_thresholds,
            'timestamp': int(time.time())
        }
```

### 5.3 链上组件详解

#### 5.3.1 阈值注册合约

见第6节完整智能合约实现。

#### 5.3.2 数据可用性

原始数据存储在链下，但保证可用性：

```solidity
// 数据可用性承诺
struct DataAvailabilityCommitment {
    bytes32 dataRoot;           // Merkle root of raw data
    string ipfsCid;             // IPFS上的完整数据
    string arweaveId;           // Arweave永久备份
    uint256 expiresAt;          // 数据可用性保证到期时间
    address dataProvider;       // 数据提供方（需质押）
}

// 数据提供方需要质押以确保数据可用
mapping(address => uint256) public providerStakes;

function challengeDataAvailability(bytes32 dataRoot) external {
    // 如果有人无法获取数据，可以发起挑战
    // 挑战成功则罚没提供方质押
}
```

---

## 6. 智能合约实现

### 6.1 完整合约代码

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title EchoEmergentPhysics
 * @notice ECHO涌现物理协议 v2.0 - 链上实现
 * @dev 管理动态阈值、相对排名六爻、异常检测
 */
contract EchoEmergentPhysics is AccessControl, Pausable {
    
    // ============ 角色定义 ============
    bytes32 public constant ORACLE_ROLE = keccak256("ORACLE_ROLE");
    bytes32 public constant DATA_PROVIDER_ROLE = keccak256("DATA_PROVIDER_ROLE");
    bytes32 public constant GOVERNANCE_ROLE = keccak256("GOVERNANCE_ROLE");
    
    // ============ 数据结构 ============
    
    /// @notice 三维阈值结构
    struct Thresholds {
        uint8[3] time;      // 时间维三档阈值
        uint8[3] space;     // 空间维三档阈值  
        uint8[3] relation;  // 关系维三档阈值
        uint256 updatedAt;  // 最后更新时间
        uint256 weekNumber; // 周序号
    }
    
    /// @notice 资产状态结构
    struct AssetState {
        uint32 timeValue;       // 时间维当前值
        uint32 spaceValue;      // 空间维当前值
        uint32 relationValue;   // 关系维当前值
        YaoPosition yao;        // 六爻位置
        uint8 percentileRank;   // 综合百分位排名 (0-100)
        uint256 lastUpdated;    // 最后更新时间
        bool isDormant;         // 是否休眠
    }
    
    /// @notice 百分位排名缓存（每周更新）
    struct PercentileRanks {
        uint8 timeRank;         // 时间维百分位
        uint8 spaceRank;        // 空间维百分位
        uint8 relationRank;     // 关系维百分位
        uint8 compositeRank;    // 综合百分位
        uint256 weekNumber;     // 所属周
    }
    
    /// @notice 异常事件记录
    struct AnomalyRecord {
        AnomalyType anomalyType;
        int256 zScore;          // Z-Score值
        string description;
        uint256 timestamp;
        bool resolved;
        string resolution;
    }
    
    /// @notice 阈值更新历史
    struct ThresholdHistory {
        uint256 week;
        uint256 timestamp;
        uint8[3] timeThresholds;
        uint8[3] spaceThresholds;
        uint8[3] relationThresholds;
        bytes32 zkProofHash;
        string dataSnapshotCID;
    }
    
    /// @notice 六爻位置枚举
    enum YaoPosition {
        CHU_JIU,    // 初九: 0-25%
        JIU_ER,     // 九二: 25-50%
        JIU_SAN,    // 九三: 50-70%
        JIU_SI,     // 九四: 70-85%
        JIU_WU,     // 九五: 85-95%
        SHANG_JIU   // 上九: 95-100%
    }
    
    /// @notice 异常类型枚举
    enum AnomalyType {
        TEMPORAL_BURST,
        ROBOTIC_PATTERN,
        SINGLE_SOURCE,
        COORDINATED,
        MUTUAL_CITATION,
        CITATION_BURST,
        SPATIAL_JUMP,
        RELATION_CLUSTER,
        PHYSICAL_PHENOMENON
    }
    
    /// @notice 证明类型
    enum ProofType {
        ZK_SNARK,
        MERKLE
    }
    
    /// @notice 证明结构
    struct Proof {
        ProofType proofType;
        bytes proofData;
        bytes32 dataRoot;
        uint256 timestamp;
    }
    
    // ============ 状态变量 ============
    
    /// @notice 当前阈值参数
    Thresholds public currentThresholds;
    
    /// @notice 资产状态映射
    mapping(bytes32 => AssetState) public assetStates;
    
    /// @notice 资产排名缓存（每周重置）
    mapping(bytes32 => PercentileRanks) public assetRanks;
    
    /// @notice 资产异常记录列表
    mapping(bytes32 => AnomalyRecord[]) public assetAnomalies;
    
    /// @notice 阈值历史记录
    ThresholdHistory[] public thresholdHistory;
    
    /// @notice 已验证的证明（防重放）
    mapping(bytes32 => bool) public verifiedProofs;
    
    /// @notice 数据提供方质押
    mapping(address => uint256) public providerStakes;
    
    /// @notice 全局统计
    uint256 public totalAssets;
    uint256 public currentWeek;
    uint256 public constant UPDATE_INTERVAL = 7 days;
    
    /// @notice 平滑系数（70%新值 + 30%旧值）
    uint256 public constant SMOOTHING_ALPHA = 70; // 70/100
    
    /// @notice 休眠阈值（90天无活动）
    uint256 public constant DORMANCY_PERIOD = 90 days;
    
    // ============ 事件定义 ============
    
    event ThresholdsUpdated(
        uint256 indexed week,
        uint8[3] timeThresholds,
        uint8[3] spaceThresholds,
        uint8[3] relationThresholds,
        bytes32 indexed zkProofHash
    );
    
    event AssetYaoChanged(
        bytes32 indexed assetId,
        YaoPosition oldYao,
        YaoPosition newYao,
        uint8 newRank
    );
    
    event AnomalyDetected(
        bytes32 indexed assetId,
        AnomalyType indexed anomalyType,
        int256 zScore,
        string description
    );
    
    event AnomalyResolved(
        bytes32 indexed assetId,
        uint256 indexed anomalyIndex,
        string resolution
    );
    
    event AssetDormant(
        bytes32 indexed assetId,
        uint256 timestamp
    );
    
    event AssetRevived(
        bytes32 indexed assetId,
        uint256 timestamp
    );
    
    event ProofVerified(
        bytes32 indexed proofHash,
        ProofType proofType,
        bool valid
    );
    
    event DataProviderStaked(
        address indexed provider,
        uint256 amount
    );
    
    event DataProviderSlashed(
        address indexed provider,
        uint256 amount,
        string reason
    );

    // ============ 构造函数 ============
    
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(GOVERNANCE_ROLE, msg.sender);
        
        // 初始化默认阈值（启动时使用保守值）
        currentThresholds = Thresholds({
            time: [1, 3, 10],
            space: [1, 3, 5],
            relation: [1, 3, 5],
            updatedAt: block.timestamp,
            weekNumber: 0
        });
        
        currentWeek = 0;
    }

    // ============ 核心功能：动态阈值更新 ============
    
    /**
     * @notice 更新阈值参数（带证明验证）
     * @param newTimeThresholds 时间维三档阈值
     * @param newSpaceThresholds 空间维三档阈值
     * @param newRelationThresholds 关系维三档阈值
     * @param proof 计算证明（ZK或Merkle）
     * @param dataSnapshotCID IPFS上的原始数据快照
     */
    function updateThresholds(
        uint8[3] calldata newTimeThresholds,
        uint8[3] calldata newSpaceThresholds,
        uint8[3] calldata newRelationThresholds,
        Proof calldata proof,
        string calldata dataSnapshotCID
    ) external onlyRole(ORACLE_ROLE) whenNotPaused {
        // 1. 验证时间窗口（每周只能更新一次）
        require(
            block.timestamp >= currentThresholds.updatedAt + UPDATE_INTERVAL,
            "Update too frequent"
        );
        
        // 2. 验证证明
        bytes32 proofHash = keccak256(abi.encode(proof));
        require(!verifiedProofs[proofHash], "Proof already used");
        
        bool proofValid = verifyProof(proof);
        require(proofValid, "Invalid proof");
        
        verifiedProofs[proofHash] = true;
        
        // 3. 应用平滑处理（避免阈值剧烈波动）
        uint8[3] memory smoothedTime = applySmoothing(
            currentThresholds.time,
            newTimeThresholds
        );
        uint8[3] memory smoothedSpace = applySmoothing(
            currentThresholds.space,
            newSpaceThresholds
        );
        uint8[3] memory smoothedRelation = applySmoothing(
            currentThresholds.relation,
            newRelationThresholds
        );
        
        // 4. 更新周序号
        currentWeek++;
        
        // 5. 记录历史
        thresholdHistory.push(ThresholdHistory({
            week: currentWeek,
            timestamp: block.timestamp,
            timeThresholds: smoothedTime,
            spaceThresholds: smoothedSpace,
            relationThresholds: smoothedRelation,
            zkProofHash: proofHash,
            dataSnapshotCID: dataSnapshotCID
        }));
        
        // 6. 更新当前阈值
        currentThresholds = Thresholds({
            time: smoothedTime,
            space: smoothedSpace,
            relation: smoothedRelation,
            updatedAt: block.timestamp,
            weekNumber: currentWeek
        });
        
        emit ThresholdsUpdated(
            currentWeek,
            smoothedTime,
            smoothedSpace,
            smoothedRelation,
            proofHash
        );
    }
    
    /**
     * @notice 应用平滑处理（指数移动平均）
     */
    function applySmoothing(
        uint8[3] memory oldValues,
        uint8[3] memory newValues
    ) internal pure returns (uint8[3] memory) {
        uint8[3] memory result;
        for (uint i = 0; i < 3; i++) {
            // smoothed = α * new + (1-α) * old
            // α = 70/100
            uint256 smoothed = (SMOOTHING_ALPHA * uint256(newValues[i]) + 
                               (100 - SMOOTHING_ALPHA) * uint256(oldValues[i])) / 100;
            result[i] = uint8(smoothed);
        }
        return result;
    }
    
    /**
     * @notice 验证证明（简化版，实际应集成ZK验证库）
     */
    function verifyProof(Proof calldata proof) internal view returns (bool) {
        if (proof.proofType == ProofType.ZK_SNARK) {
            // 调用ZK验证合约/库
            return verifyZKProof(proof.proofData, proof.dataRoot);
        } else if (proof.proofType == ProofType.MERKLE) {
            // 验证Merkle proof
            return verifyMerkleProof(proof.proofData, proof.dataRoot);
        }
        return false;
    }
    
    /**
     * @notice ZK proof验证（占位符，需集成实际ZK库）
     */
    function verifyZKProof(
        bytes calldata proof,
        bytes32 dataRoot
    ) internal view returns (bool) {
        // TODO: 集成 circom verifier 或其他ZK验证库
        // 当前简化为检查proof非空
        return proof.length > 0 && dataRoot != bytes32(0);
    }
    
    /**
     * @notice Merkle proof验证
     */
    function verifyMerkleProof(
        bytes calldata proof,
        bytes32 root
    ) internal pure returns (bool) {
        // TODO: 实现Merkle proof验证
        // 当前简化处理
        return proof.length > 0 && root != bytes32(0);
    }

    // ============ 核心功能：相对排名六爻 ============
    
    /**
     * @notice 批量更新资产排名（每周执行）
     * @param assetIds 资产ID数组
     * @param timeRanks 时间维百分位数组
     * @param spaceRanks 空间维百分位数组
     * @param relationRanks 关系维百分位数组
     */
    function batchUpdateRanks(
        bytes32[] calldata assetIds,
        uint8[] calldata timeRanks,
        uint8[] calldata spaceRanks,
        uint8[] calldata relationRanks
    ) external onlyRole(ORACLE_ROLE) whenNotPaused {
        require(
            assetIds.length == timeRanks.length &&
            assetIds.length == spaceRanks.length &&
            assetIds.length == relationRanks.length,
            "Array length mismatch"
        );
        
        for (uint i = 0; i < assetIds.length; i++) {
            // 计算综合排名（加权平均）
            // composite = 0.5*time + 0.3*space + 0.2*relation
            uint256 composite = (
                50 * uint256(timeRanks[i]) +
                30 * uint256(spaceRanks[i]) +
                20 * uint256(relationRanks[i])
            ) / 100;
            
            // 更新排名缓存
            assetRanks[assetIds[i]] = PercentileRanks({
                timeRank: timeRanks[i],
                spaceRank: spaceRanks[i],
                relationRank: relationRanks[i],
                compositeRank: uint8(composite),
                weekNumber: currentWeek
            });
            
            // 计算新六爻
            YaoPosition oldYao = assetStates[assetIds[i]].yao;
            YaoPosition newYao = calculateYaoFromRank(uint8(composite));
            
            // 如果六爻变化，更新状态并触发事件
            if (oldYao != newYao) {
                assetStates[assetIds[i]].yao = newYao;
                assetStates[assetIds[i]].percentileRank = uint8(composite);
                
                emit AssetYaoChanged(
                    assetIds[i],
                    oldYao,
                    newYao,
                    uint8(composite)
                );
            }
        }
    }
    
    /**
     * @notice 从百分位排名计算六爻
     */
    function calculateYaoFromRank(uint8 rank) public pure returns (YaoPosition) {
        require(rank <= 100, "Invalid rank");
        
        if (rank < 25) {
            return YaoPosition.CHU_JIU;     // 初九: 0-25%
        } else if (rank < 50) {
            return YaoPosition.JIU_ER;      // 九二: 25-50%
        } else if (rank < 70) {
            return YaoPosition.JIU_SAN;     // 九三: 50-70%
        } else if (rank < 85) {
            return YaoPosition.JIU_SI;      // 九四: 70-85%
        } else if (rank < 95) {
            return YaoPosition.JIU_WU;      // 九五: 85-95%
        } else {
            return YaoPosition.SHANG_JIU;   // 上九: 95-100%
        }
    }
    
    /**
     * @notice 获取资产当前六爻
     */
    function getAssetYao(bytes32 assetId) external view returns (YaoPosition) {
        return assetStates[assetId].yao;
    }
    
    /**
     * @notice 获取资产百分位排名
     */
    function getAssetRank(bytes32 assetId) external view returns (
        uint8 timeRank,
        uint8 spaceRank,
        uint8 relationRank,
        uint8 compositeRank
    ) {
        PercentileRanks memory ranks = assetRanks[assetId];
        return (
            ranks.timeRank,
            ranks.spaceRank,
            ranks.relationRank,
            ranks.compositeRank
        );
    }

    // ============ 核心功能：异常检测 ============
    
    /**
     * @notice 记录检测到的异常
     */
    function recordAnomaly(
        bytes32 assetId,
        AnomalyType anomalyType,
        int256 zScore,
        string calldata description
    ) external onlyRole(ORACLE_ROLE) {
        AnomalyRecord memory record = AnomalyRecord({
            anomalyType: anomalyType,
            zScore: zScore,
            description: description,
            timestamp: block.timestamp,
            resolved: false,
            resolution: ""
        });
        
        assetAnomalies[assetId].push(record);
        
        emit AnomalyDetected(assetId, anomalyType, zScore, description);
    }
    
    /**
     * @notice 标记异常已解决
     */
    function resolveAnomaly(
        bytes32 assetId,
        uint256 anomalyIndex,
        string calldata resolution
    ) external onlyRole(ORACLE_ROLE) {
        require(anomalyIndex < assetAnomalies[assetId].length, "Invalid index");
        
        AnomalyRecord storage record = assetAnomalies[assetId][anomalyIndex];
        require(!record.resolved, "Already resolved");
        
        record.resolved = true;
        record.resolution = resolution;
        
        emit AnomalyResolved(assetId, anomalyIndex, resolution);
    }
    
    /**
     * @notice 获取资产的所有异常记录
     */
    function getAnomalies(bytes32 assetId) external view returns (
        AnomalyRecord[] memory
    ) {
        return assetAnomalies[assetId];
    }
    
    /**
     * @notice 批量记录异常
     */
    function batchRecordAnomalies(
        bytes32[] calldata assetIds,
        AnomalyType[] calldata types,
        int256[] calldata zScores,
        string[] calldata descriptions
    ) external onlyRole(ORACLE_ROLE) {
        require(
            assetIds.length == types.length &&
            assetIds.length == zScores.length &&
            assetIds.length == descriptions.length,
            "Array length mismatch"
        );
        
        for (uint i = 0; i < assetIds.length; i++) {
            recordAnomaly(assetIds[i], types[i], zScores[i], descriptions[i]);
        }
    }

    // ============ 休眠机制 ============
    
    /**
     * @notice 检查并更新休眠状态
     */
    function checkDormancy(bytes32 assetId) external {
        AssetState storage state = assetStates[assetId];
        
        if (!state.isDormant && 
            block.timestamp - state.lastUpdated > DORMANCY_PERIOD) {
            // 进入休眠
            state.isDormant = true;
            state.yao = YaoPosition.CHU_JIU;
            state.percentileRank = 0;
            
            emit AssetDormant(assetId, block.timestamp);
        }
    }
    
    /**
     * @notice 唤醒休眠资产
     */
    function reviveAsset(bytes32 assetId) external whenNotPaused {
        AssetState storage state = assetStates[assetId];
        require(state.isDormant, "Asset not dormant");
        
        state.isDormant = false;
        state.lastUpdated = block.timestamp;
        
        emit AssetRevived(assetId, block.timestamp);
    }

    // ============ 数据提供者管理 ============
    
    /**
     * @notice 数据提供方质押
     */
    function stakeAsProvider() external payable {
        require(msg.value >= 1 ether, "Minimum 1 ETH stake");
        
        providerStakes[msg.sender] += msg.value;
        _grantRole(DATA_PROVIDER_ROLE, msg.sender);
        
        emit DataProviderStaked(msg.sender, msg.value);
    }
    
    /**
     * @notice 罚没数据提供方（治理调用）
     */
    function slashProvider(
        address provider,
        uint256 amount,
        string calldata reason
    ) external onlyRole(GOVERNANCE_ROLE) {
        require(providerStakes[provider] >= amount, "Insufficient stake");
        
        providerStakes[provider] -= amount;
        
        // 转移罚没资金到治理合约/国库
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
        
        if (providerStakes[provider] < 1 ether) {
            _revokeRole(DATA_PROVIDER_ROLE, provider);
        }
        
        emit DataProviderSlashed(provider, amount, reason);
    }

    // ============ 查询函数 ============
    
    /**
     * @notice 获取当前阈值
     */
    function getCurrentThresholds() external view returns (Thresholds memory) {
        return currentThresholds;
    }
    
    /**
     * @notice 获取阈值历史
     */
    function getThresholdHistory(uint256 index) external view returns (
        ThresholdHistory memory
    ) {
        require(index < thresholdHistory.length, "Invalid index");
        return thresholdHistory[index];
    }
    
    /**
     * @notice 获取阈值历史长度
     */
    function getThresholdHistoryLength() external view returns (uint256) {
        return thresholdHistory.length;
    }
    
    /**
     * @notice 获取资产完整状态
     */
    function getAssetState(bytes32 assetId) external view returns (
        AssetState memory
    ) {
        return assetStates[assetId];
    }

    // ============ 治理功能 ============
    
    /**
     * @notice 紧急暂停
     */
    function pause() external onlyRole(GOVERNANCE_ROLE) {
        _pause();
    }
    
    /**
     * @notice 恢复运行
     */
    function unpause() external onlyRole(GOVERNANCE_ROLE) {
        _unpause();
    }
    
    /**
     * @notice 手动设置阈值（紧急情况下使用）
     */
    function emergencySetThresholds(
        uint8[3] calldata time,
        uint8[3] calldata space,
        uint8[3] calldata relation
    ) external onlyRole(GOVERNANCE_ROLE) {
        currentThresholds.time = time;
        currentThresholds.space = space;
        currentThresholds.relation = relation;
        currentThresholds.updatedAt = block.timestamp;
    }
}
```

### 6.2 辅助合约：ZK Verifier（示例）

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title EchoThresholdVerifier
 * @notice ZK proof验证合约（需根据实际电路生成）
 * @dev 这是一个占位符接口，实际应使用snarkjs生成的verifier
 */
interface IEchoThresholdVerifier {
    /**
     * @notice 验证阈值计算的ZK proof
     * @param proof ZK proof数据
     * @param publicSignals 公开输入（如dataRoot、新阈值等）
     * @return 验证是否通过
     */
    function verifyProof(
        uint256[8] calldata proof,
        uint256[] calldata publicSignals
    ) external view returns (bool);
}

/**
 * @title Groth16Verifier
 * @notice Groth16证明验证实现
 */
contract Groth16Verifier is IEchoThresholdVerifier {
    // 验证密钥（由trusted setup生成）
    uint256[2] public vkAlpha1;
    uint256[2][2] public vkBeta2;
    uint256[2][2] public vkGamma2;
    uint256[2][2] public vkDelta2;
    uint256[2][] public vkIC;
    
    function verifyProof(
        uint256[8] calldata proof,
        uint256[] calldata publicSignals
    ) external view override returns (bool) {
        // Groth16验证算法实现
        // 参考：https://github.com/iden3/snarkjs/blob/master/templates/verifier_groth16.sol
        
        // 简化的验证逻辑（实际应使用完整实现）
        return _verifyProof(proof, publicSignals);
    }
    
    function _verifyProof(
        uint256[8] calldata proof,
        uint256[] calldata publicSignals
    ) internal view returns (bool) {
        // TODO: 完整的Groth16验证实现
        return true; // 占位符
    }
}
```

---

## 7. 给创作者的新叙事

### 7.1 你不是在"遵守规则"

**旧叙事**：
> "欢迎来到ECHO平台。我们设定了一套规则，你需要遵守这些规则来获得成功。"

**新叙事**：
> "欢迎来到ECHO宇宙。这里没有人为设计的规则，只有涌现的物理法则。**你**的每一次创作、每一次分享、每一次连接，都在塑造这个宇宙的物理常数。"

### 7.2 你在参与一场宇宙演化实验

> 想象一下：如果牛顿不是在描述已有的重力，而是**第一个发现**重力的观测者——并且他的观测行为本身改变了重力的大小。
> 
> 这就是ECHO。
> 
> 当你的作品被更多人使用，你不仅提升了自己的排名，你也参与了**重新定义**"什么是高使用"的过程。
> 
> 你不是在攀爬一座固定的山峰。你是在参与塑造这座山本身。

### 7.3 相对排名的真正含义

**不要问**："我需要多少次使用才能升级？"

**要问**："我在这个宇宙中处于什么位置？"

- **初九（后25%）**：你在潜藏。这不是失败，是沉淀。冬天的树在扎根。
- **九二（25-50%）**：你开始被看见。有人注意到了你的存在。
- **九三（50-70%）**：你进入了主流。稳定创作，积累复利。
- **九四（70-85%）**：你在前30%。这是一个关键时刻——继续试探，还是退守？
- **九五（85-95%）**：大成。你已经建立了不可替代的位置。
- **上九（前5%）**：转化的临界点。物理法则可能发生质变。

### 7.4 异常不是污点

如果你的作品被标记为"异常"，不要恐慌。

- 也许是有人试图刷你的数据
- 也许是一个测量误差  
- 也许是**你发现了一种新的内容传播模式**

历史上，异常往往是革命的起点。哥白尼的日心说在当时是异常。量子力学的早期也是异常。

**在ECHO，异常被记录，但不被审判。**

### 7.5 你是物理法则的创造者

> "我们认为这些真理是不言而喻的……" 
> 
> 不。在ECHO，真理不是不言而喻的。真理是**涌现的**。
> 
> 当你选择创作音乐而不是视频，你影响了时间维的阈值。
> 
> 当你选择在一个小众平台深耕而不是全网撒网，你影响了空间维的分布。
> 
> 当你选择引用他人而不是闭门造车，你影响了关系维的结构。
> 
> **我们不是设计者。我们是观测者。你们是创造者。**

---

## 8. 版本对比总结

| 特性 | v1.0（设计范式） | v2.0（涌现范式） |
|-----|----------------|----------------|
| **阈值** | 固定常量（7天3次、30天10次） | 动态75%分位数，每周更新 |
| **六爻** | 固定档位（达标即升级） | 相对排名（全网竞争位置） |
| **验证** | 禁止违规 | 标记异常，记录现象 |
| **架构** | 纯链上计算 | 链下统计 + 链上验证 |
| **叙事** | "遵守平台规则" | "塑造物理常数" |
| **角色** | 平台设计者 | 物理观测者 |
| **安全性** | 依赖固定规则 | ZK proof + 数据可用性 |

---

## 9. 附录

### 9.1 术语表

- **涌现（Emergence）**：复杂系统中，整体表现出的性质不能从个体性质简单推导
- **分位数（Percentile）**：将数据集分成100份的统计量，75%分位数表示75%的数据小于此值
- **Z-Score**：标准分数，衡量数据点偏离均值的标准差倍数
- **ZK Proof**：零知识证明，证明者可以在不泄露具体信息的情况下证明某陈述为真
- **物理常数**：物理学中不随时间、地点变化的常数（如引力常数G）

### 9.2 相关文档

- ECHO-Core-Design-v1.0.md（世界观）
- ECHO-HexagramValidation-v1.0.md（验证层）
- [待补充] ECHO-ZK-Circuit-Spec.md（ZK电路规范）
- [待补充] ECHO-Data-Availability.md（数据可用性方案）

---

**我们不是设计者。我们是观测者。你们是创造者。**

**万物有灵，皆可生长。物理由你书写。🌌**
