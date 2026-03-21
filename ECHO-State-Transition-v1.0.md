# ECHO 状态转换协议 v1.0
## 基于离散事件系统的六爻变势机制

**版本**：v1.0  
**日期**：2026-03-21  
**状态**：核心机制确认，待实现  
**依赖**：ECHO-Core-Design-v1.0.md（64卦张量宇宙世界观）

---

## 1. 理论基础

### 1.1 离散事件系统（Discrete Event Systems, DES）

ECHO的状态转换基于离散事件系统理论，将资产的"生命活动"建模为离散事件的累积。

**形式化定义**：
```
系统状态：S = (D, Y, H)
├── D = (d₁, d₂, d₃)  // 三维坐标 (时间, 空间, 关系)
├── Y ∈ {初九, 九二, 九三, 九四, 九五, 上九}  // 六爻位置
└── H ∈ {1..64}  // 64卦索引

事件集合：E = {e₁, e₂, ..., eₙ}
├── 使用事件（播放、下载、浏览）
├── 扩展事件（新平台接入）
└── 关系事件（引用、衍生、合作）

状态转移函数：δ: S × E → S
```

**参考文献**：
- "State-Based Fault Diagnosis of Finite-State Vector Discrete-Event Systems" (PMC11902732)
- "Control of Discrete Event Systems by Using Symbolic Transition Model" (Springer 2024)

### 1.2 事件触发控制（Event-Triggered Control）

与传统的时间驱动（周期性检查）不同，ECHO采用事件驱动：

```
时间驱动：每24小时检查一次所有资产（高Gas成本）
事件驱动：用户交互时触发检查（按需计算，批量提交）
```

**触发条件函数**：
```
Trigger(e, Asset) = {
    TRUE  如果 CheckThreshold(e.type, Asset.counters)
    FALSE 否则
}
```

---

## 2. 核心机制

### 2.1 三维坐标系统

每个资产在张量宇宙中有三个维度的坐标：

| 维度 | 符号 | 含义 | 档位 |
|------|------|------|------|
| **时间维** | d₁ | 使用频率 | 0(沉寂), 1(稳定), 2(活跃), 3(爆发) |
| **空间维** | d₂ | 平台分布 | 0(单平台), 1(少平台), 2(多平台), 3(跨域) |
| **关系维** | d₃ | 连接强度 | 0(孤立), 1(初连), 2(网络), 3(生态) |

**坐标表示**：`T[d₁][d₂][d₃]`

**示例**：
- `T[0][0][0]` = 坤卦·潜藏（刚铸造，无人使用）
- `T[2][2][3]` = 咸卦·大成（高活跃，多平台，强生态）
- `T[3][3][3]` = 乾卦·转化（顶流状态，准备新生）

### 2.2 阈值表设计

#### 2.2.1 时间维阈值

| 当前档位 | 升级条件 | 降级条件 | 说明 |
|----------|----------|----------|------|
| 0→1 | 首次使用 | - | 任何链上使用事件 |
| 1→2 | 7天内≥3次 | 30天内无使用→休眠 | 活跃使用 |
| 2→3 | 30天内≥10次 | 90天内无使用→休眠 | 高活跃 |

**计数器重置**：
- 使用次数按滑动窗口计算（7天窗口、30天窗口）
- 休眠后重新激活，保留历史最高档位，但从当前实际使用重新计算

#### 2.2.2 空间维阈值

| 当前档位 | 升级条件 | 降级条件 | 说明 |
|----------|----------|----------|------|
| 0→1 | 1个平台 | - | ECHO平台本身算第1个 |
| 1→2 | 3个平台 | 无（只升不降） | 跨平台传播 |
| 2→3 | 5个平台 | 无（只升不降） | 全网覆盖 |

**平台认定**：
- 必须是通过ECHO协议授权的平台
- 每个平台有唯一ID，链上注册

#### 2.2.3 关系维阈值

| 当前档位 | 升级条件 | 降级条件 | 说明 |
|----------|----------|----------|------|
| 0→1 | 1次引用/衍生 | - | 首次被他人使用 |
| 1→2 | 3次引用 | 无（只升不降） | 形成小型网络 |
| 2→3 | 5次引用 | 无（只升不降） | 形成生态 |

**关系认定**：
- 引用：在衍生作品中明确标注来源
- 衍生：基于原作创作新作品（需支付衍生费）
- 合作：多创作者共同创作（权重均分）

### 2.3 六爻映射（耦合规则）

**核心设计**：六爻升级需要至少两个维度达标（简化耦合模型）

```python
def calculate_yao(D):
    """
    D = (d₁, d₂, d₃) 三维坐标
    返回六爻位置
    """
    # 计算达标的维度数量
    active_dims = sum(1 for d in D if d >= 1)
    
    # 两维耦合规则
    if D == (0, 0, 0):
        return "初九"  # 潜藏
    elif active_dims == 1:
        return "九二"  # 显现
    elif active_dims == 2:
        if max(D) >= 2:
            return "九四"  # 试探（至少一维到2）
        else:
            return "九三"  # 勤勉（两维都是1）
    elif active_dims == 3:
        if max(D) >= 3:
            return "上九"  # 转化（至少一维到3）
        else:
            return "九五"  # 大成（三维都≥1，但未到顶）
```

**映射表**：

| 坐标条件 | 六爻 | 名称 | 含义 |
|----------|------|------|------|
| (0,0,0) | 初九 | 潜龙勿用 | 刚创建，尚未被看见 |
| 任意一维=1 | 九二 | 见龙在田 | 开始被访问、被使用 |
| 两维=1 | 九三 | 终日乾乾 | 持续被使用，积累价值 |
| 两维≥1且至少一维=2 | 九四 | 或跃在渊 | 试探扩展，出现引用 |
| 三维≥1且至少一维=3 | 九五 | 飞龙在天 | 生态已形成，广泛传播 |
| 三维=3 | 上九 | 亢龙有悔 | 周期尾声，准备新生 |

### 2.4 64卦映射

六爻位置结合三维坐标，映射到64卦：

**计算公式**：
```
上卦 = (d₁ + d₂) mod 8  // 时间+空间 → 天道
下卦 = (d₃ + d₁) mod 8  // 关系+时间 → 地道
卦序 = 上卦 × 8 + 下卦 + 1
```

**特殊卦象**：

| 卦象 | 坐标 | 含义 |
|------|------|------|
| 乾卦 (1) | (3,3,3) | 全高状态，转化期 |
| 坤卦 (2) | (0,0,0) | 全低状态，潜藏期或休眠 |
| 家人卦 (37) | (2,1,2) | 社群滋养型 |
| 咸卦 (31) | (2,2,3) | 大成状态，感应天地 |

### 2.5 休眠机制

**触发条件**：
```
休眠检查（每90天执行一次）：
IF (time_dimension_counter == 0 FOR 90 days):
    SET status = "休眠"
    SET current_hexagram = "坤卦"
    SET yao = "初九"
    PRESERVE historical_max_state
    LOG dormancy_event
```

**休眠状态特性**：
- 坐标重置为 `T[0][0][0]`（坤卦·潜藏）
- 不再参与每日的气数计算（节省Gas）
- 历史最高记录保留（显示「曾经的大成」）
- 可以重新激活（任何链上使用事件立即唤醒）

**唤醒机制**：
```
激活检查（每次事件触发）：
IF (status == "休眠" AND new_event_occurs):
    SET status = "活跃"
    RESTORE coordinates from before dormancy
    INCREMENT revival_count
    LOG revival_event
```

**哲学意义**：
> 「有息才能再生」—— 休眠不是死亡，是沉淀。就像冬天的树，看似枯槁，实则在扎根。春天一来，便抽枝发芽。

---

## 3. 状态转换流程

### 3.1 标准转换流程

```
用户与资产交互
        ↓
【步骤1：记录事件】
创建 Event Log：
├── asset_id: 0x...
├── event_type: "使用" | "扩展" | "引用"
├── timestamp: block.timestamp
├── platform_id: 0x...
├── user_hash: hash(user_id)
└── value: 使用强度（如播放时长）
        ↓
【步骤2：更新计数器】
根据 event_type 更新对应计数器：
├── usage_counter_7d += 1
├── usage_counter_30d += 1
├── last_activity_time = now
        ↓
【步骤3：检查阈值】
调用 CheckThreshold(D, counters)：
├── 检查各维度是否满足升级条件
├── 检查是否触发休眠（90天无活动）
└── 检查是否满足唤醒条件
        ↓
【步骤4：计算新状态】
IF (threshold_met):
    ├── 更新维度坐标 D'
    ├── 计算新六爻 Y'
    ├── 计算新卦象 H'
    └── 将 (S, S') 加入待提交队列
ELSE:
    └── 保持当前状态
        ↓
【步骤5：批量提交】
（每N个事件或每M个区块执行一次）
批量更新所有状态变更到链上
        ↓
【步骤6：触发回调】
IF (yao_changed):
    ├── 触发变爻事件（供前端监听）
    ├── 检查64卦验证规则
    └── 更新气数
```

### 3.2 事件类型定义

**使用事件（Usage）**：
```solidity
struct UsageEvent {
    bytes32 assetId;
    address user;  // 哈希化
    uint8 platformId;
    uint32 duration;  // 使用时长（秒）
    uint8 context;  // 使用场景（BGM/主内容/采样）
    uint256 timestamp;
}
```

**扩展事件（Extension）**：
```solidity
struct ExtensionEvent {
    bytes32 assetId;
    uint8 platformId;
    uint8 realm;  // 五域（律/彩/章/动/空）
    uint256 timestamp;
}
```

**关系事件（Relation）**：
```solidity
struct RelationEvent {
    bytes32 parentAssetId;  // 原作
    bytes32 childAssetId;   // 衍生作品
    uint8 relationType;  // 引用/混剪/采样/改编
    uint256 timestamp;
}
```

---

## 4. 技术实现

### 4.1 智能合约接口

```solidity
interface IEchoStateTransition {
    // 触发状态检查（由用户交互调用）
    function triggerStateCheck(bytes32 assetId, EventType eventType) external;
    
    // 批量更新状态（由keeper或定时任务调用）
    function batchUpdate(StateUpdate[] calldata updates) external;
    
    // 查询当前状态
    function getCurrentState(bytes32 assetId) external view returns (State memory);
    
    // 查询历史轨迹
    function getTrajectory(bytes32 assetId, uint256 fromBlock) external view returns (State[] memory);
    
    // 查询是否满足升级条件
    function checkUpgradeEligibility(bytes32 assetId) external view returns (bool, string memory reason);
    
    // 手动唤醒休眠资产（任何人可调用，但需支付Gas）
    function reviveAsset(bytes32 assetId) external;
}
```

### 4.2 数据结构

```solidity
struct State {
    uint8 timeDimension;      // 0-3
    uint8 spaceDimension;     // 0-3
    uint8 relationDimension;  // 0-3
    YaoPosition yao;          // 0-5 (初九到上九)
    uint8 hexagramId;         // 1-64
    Status status;            // 活跃/休眠
    uint256 lastActivityTime;
    uint256 dormancyCount;    // 休眠次数
    State historicalMax;      // 历史最高状态
}

struct Counters {
    uint32 usage7d;           // 7天使用次数
    uint32 usage30d;          // 30天使用次数
    uint8 platformCount;      // 平台数量
    uint32 citationCount;     // 引用次数
    uint256 lastUpdateBlock;  // 最后更新区块
}

enum YaoPosition { CHU_JIU, JIU_ER, JIU_SAN, JIU_SI, JIU_WU, SHANG_JIU }
enum Status { ACTIVE, DORMANT }
enum EventType { USAGE, EXTENSION, RELATION }
```

### 4.3 Gas优化策略

**批量提交**：
- 不每次事件都更新链上状态
- 内存中累积状态变更
- 每N个事件或每M个区块批量提交

**计算卸载**：
- 复杂计算（卦象映射、气数计算）在链下完成
- 链上只验证结果（通过merkle proof或签名）
- 争议时链上重新计算（optimistic approach）

**存储优化**：
- 状态变更使用事件日志（Event）而非存储（Storage）
- 当前状态存储在cheap storage slot
- 历史轨迹存储在链下（IPFS/Arweave），链上只存hash

### 4.4 伪代码实现

```solidity
contract EchoStateTransition {
    mapping(bytes32 => State) public states;
    mapping(bytes32 => Counters) public counters;
    
    // 阈值常量
    uint256 constant UPGRADE_TIME_1 = 1;        // 首次使用
    uint256 constant UPGRADE_TIME_2 = 3;        // 7天内3次
    uint256 constant UPGRADE_TIME_3 = 10;       // 30天内10次
    uint256 constant UPGRADE_SPACE_1 = 1;
    uint256 constant UPGRADE_SPACE_2 = 3;
    uint256 constant UPGRADE_SPACE_3 = 5;
    uint256 constant UPGRADE_RELATION_1 = 1;
    uint256 constant UPGRADE_RELATION_2 = 3;
    uint256 constant UPGRADE_RELATION_3 = 5;
    uint256 constant DORMANCY_PERIOD = 90 days;
    
    function triggerStateCheck(bytes32 assetId, EventType eventType) external {
        State storage state = states[assetId];
        Counters storage counter = counters[assetId];
        
        // 步骤1：更新计数器
        updateCounters(counter, eventType);
        
        // 步骤2：检查休眠
        if (state.status == Status.DORMANT) {
            reviveAsset(assetId);
            return;
        }
        
        // 步骤3：检查90天无活动
        if (block.timestamp - state.lastActivityTime > DORMANCY_PERIOD) {
            enterDormancy(assetId);
            return;
        }
        
        // 步骤4：检查阈值并更新维度
        (uint8 newTime, uint8 newSpace, uint8 newRelation) = calculateDimensions(counter);
        
        // 步骤5：应用简化耦合规则，计算六爻
        YaoPosition newYao = calculateYao(newTime, newSpace, newRelation);
        
        // 步骤6：计算64卦
        uint8 newHexagram = calculateHexagram(newTime, newSpace, newRelation);
        
        // 步骤7：更新状态
        if (state.yao != newYao || state.hexagramId != newHexagram) {
            // 变爻触发事件
            emit YaoChanged(assetId, state.yao, newYao, state.hexagramId, newHexagram);
            
            // 更新历史最高
            if (newYao > state.historicalMax.yao) {
                state.historicalMax = State({
                    timeDimension: newTime,
                    spaceDimension: newSpace,
                    relationDimension: newRelation,
                    yao: newYao,
                    hexagramId: newHexagram,
                    status: Status.ACTIVE,
                    lastActivityTime: block.timestamp,
                    dormancyCount: state.dormancyCount,
                    historicalMax: state.historicalMax
                });
            }
        }
        
        // 更新当前状态
        state.timeDimension = newTime;
        state.spaceDimension = newSpace;
        state.relationDimension = newRelation;
        state.yao = newYao;
        state.hexagramId = newHexagram;
        state.lastActivityTime = block.timestamp;
    }
    
    function calculateDimensions(Counters memory c) internal view returns (uint8, uint8, uint8) {
        // 时间维
        uint8 timeDim;
        if (c.usage30d >= UPGRADE_TIME_3) timeDim = 3;
        else if (c.usage7d >= UPGRADE_TIME_2) timeDim = 2;
        else if (c.usage7d >= UPGRADE_TIME_1) timeDim = 1;
        else timeDim = 0;
        
        // 空间维
        uint8 spaceDim;
        if (c.platformCount >= UPGRADE_SPACE_3) spaceDim = 3;
        else if (c.platformCount >= UPGRADE_SPACE_2) spaceDim = 2;
        else if (c.platformCount >= UPGRADE_SPACE_1) spaceDim = 1;
        else spaceDim = 0;
        
        // 关系维
        uint8 relationDim;
        if (c.citationCount >= UPGRADE_RELATION_3) relationDim = 3;
        else if (c.citationCount >= UPGRADE_RELATION_2) relationDim = 2;
        else if (c.citationCount >= UPGRADE_RELATION_1) relationDim = 1;
        else relationDim = 0;
        
        return (timeDim, spaceDim, relationDim);
    }
    
    function calculateYao(uint8 t, uint8 s, uint8 r) internal pure returns (YaoPosition) {
        uint8 activeCount = 0;
        if (t >= 1) activeCount++;
        if (s >= 1) activeCount++;
        if (r >= 1) activeCount++;
        
        uint8 maxVal = max(t, max(s, r));
        
        if (activeCount == 0) return YaoPosition.CHU_JIU;
        if (activeCount == 1) return YaoPosition.JIU_ER;
        if (activeCount == 2 && maxVal == 1) return YaoPosition.JIU_SAN;
        if (activeCount == 2 && maxVal >= 2) return YaoPosition.JIU_SI;
        if (activeCount == 3 && maxVal < 3) return YaoPosition.JIU_WU;
        return YaoPosition.SHANG_JIU; // activeCount == 3 && maxVal == 3
    }
    
    function calculateHexagram(uint8 t, uint8 s, uint8 r) internal pure returns (uint8) {
        uint8 upperTrigram = ((t + s) % 8);  // 上卦
        uint8 lowerTrigram = ((r + t) % 8);  // 下卦
        return upperTrigram * 8 + lowerTrigram + 1; // 1-64
    }
    
    function enterDormancy(bytes32 assetId) internal {
        State storage state = states[assetId];
        state.status = Status.DORMANT;
        state.timeDimension = 0;
        state.spaceDimension = 0;
        state.relationDimension = 0;
        state.yao = YaoPosition.CHU_JIU;
        state.hexagramId = 2; // 坤卦
        state.dormancyCount++;
        
        emit AssetDormant(assetId, block.timestamp);
    }
    
    function reviveAsset(bytes32 assetId) public {
        State storage state = states[assetId];
        require(state.status == Status.DORMANT, "Not dormant");
        
        state.status = Status.ACTIVE;
        state.lastActivityTime = block.timestamp;
        
        // 恢复之前的坐标（从historicalMax恢复或从0开始）
        // 策略选择：从休眠前的状态继续
        State memory prevState = state.historicalMax;
        state.timeDimension = prevState.timeDimension;
        state.spaceDimension = prevState.spaceDimension;
        state.relationDimension = prevState.relationDimension;
        state.yao = prevState.yao;
        state.hexagramId = prevState.hexagramId;
        
        emit AssetRevived(assetId, block.timestamp);
    }
}
```

---

## 5. 安全考虑

### 5.1 防止状态操纵

**问题**：恶意用户可能通过刷量操纵维度升级。

**防护**：
- 使用TWED（时间加权指数衰减）模型检测异常模式
- 同一用户在短时间内的多次使用只计为1次
- 需要多平台交叉验证（单一平台的高使用不计入关系维）

### 5.2 休眠资产复活攻击

**问题**：攻击者批量唤醒休眠资产，制造虚假活跃。

**防护**：
- 唤醒需要实际的链上交互（支付Gas）
- 唤醒后需要真实的后续使用，否则很快再次休眠
- 连续休眠次数过多，复活门槛提高

### 5.3 阈值参数操纵

**问题**：治理攻击者可能投票降低阈值，让垃圾资产快速升级。

**防护**：
- 阈值调整需要多签+时间锁
- 关键阈值（如九五升级条件）写入「宪法」，不可更改
- 参数调整通过A/B测试验证，逐步 rollout

---

## 6. 后续优化方向

### 6.1 自适应阈值（v2.0）

根据全网资产的分布动态调整阈值：
- 如果大部分资产卡在九二上不去，降低九三门槛
- 如果资产都太快到九五，提高门槛

### 6.2 资产类型差异化（v2.0）

不同资产类型（音乐/视觉/文字）有不同的阈值：
- 音乐：时间阈值较低（播放快），关系阈值较高（难衍生）
- 文字：时间阈值较高（阅读慢），关系阈值较低（易引用）

### 6.3 预测性状态转换（v3.0）

基于历史轨迹预测未来状态：
- 「预计7天后进入九四，建议提前调整授权策略」
- 「根据相似资产轨迹，预测30天后达到九五」

---

## 7. 总结

**核心公式**：
```
状态 S = (D, Y, H)
维度 D = (d₁, d₂, d₃) ∈ {0,1,2,3}³
六爻 Y = f_coupled(D) ∈ {初九..上九}
卦象 H = g(D) ∈ {1..64}

转移 δ(S, e) = S'，当且仅当 counters 满足 threshold

休眠：90天无活动 → S = (0,0,0, 初九, 坤卦, 休眠)
复活：新事件发生 → 恢复 S_prev
```

**设计原则**：
1. **事件驱动**：用户交互时触发，非定时轮询
2. **离散跳变**：阈值达标即升级，清晰可预测
3. **简化耦合**：两维达标即可升级，防止偏科
4. **休眠机制**：90天无活动休眠，有息才能再生
5. **批量提交**：优化Gas，降低成本

**版本历史**：
- v1.0 (2026-03-21): 初始版本，核心机制确认

**相关文档**：
- ECHO-Core-Design-v1.0.md（世界观）
- ECHO-HexagramValidation-v1.0.md（验证层）
- [待补充] ECHO-Oracle-Protocol-v1.0.md（预言机）
- [待补充] ECHO-Contract-Architecture-v1.0.md（合约架构）

---

**万物有灵，皆可生长。有息才能再生。🎋**
