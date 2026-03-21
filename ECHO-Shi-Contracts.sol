// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title ECHO Shi Framework - Smart Contracts MVP
 * @notice 势体系智能合约最小可行版本
 * @dev 链下计算 + 链上验证模式
 * 
 * 架构说明：
 * - ShiShuRegistry: 存储势场边界（每周更新）
 * - ShiPositionRegistry: 存储资产势位（每次交互更新）
 * - ShiFieldRegistry: 存储64势场区域（每周更新）
 * - ShiMerkleVerifier: Merkle证明验证工具
 */

// ============================================
// 1. 势枢注册表 - 存储三维编织的基础结构
// ============================================
contract ShiShuRegistry {
    
    // 权限控制
    address public oracle;
    address public owner;
    
    modifier onlyOracle() {
        require(msg.sender == oracle, "Only oracle");
        _;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    // 势场边界结构
    struct ShiBoundaries {
        uint8[3] time;        // [level_1, level_2, level_3]
        uint8[3] space;       // [level_1, level_2, level_3]  
        uint8[3] relation;    // [level_1, level_2, level_3]
        uint256 updatedAt;    // 更新时间
        uint256 epoch;        // 第几周期
    }
    
    // 资产在势枢中的坐标
    struct ShiShuCoordinate {
        uint8 timeLevel;      // 0-3 (沉寂/稳定/活跃/爆发)
        uint8 spaceLevel;     // 0-3 (单平台/少平台/多平台/跨域)
        uint8 relationLevel;  // 0-3 (孤立/初连/网络/生态)
        uint256 recordedAt;   // 记录时间
    }
    
    // 当前势场边界
    ShiBoundaries public currentBoundaries;
    
    // 历史边界（可查询）
    mapping(uint256 => ShiBoundaries) public boundaryHistory;
    
    // 资产 => 势枢坐标
    mapping(bytes32 => ShiShuCoordinate) public assetCoordinates;
    
    // 事件
    event BoundariesUpdated(
        uint256 indexed epoch,
        uint256 timestamp,
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
    
    constructor() {
        owner = msg.sender;
        oracle = msg.sender; // 初始时owner也是oracle
        
        // 初始化默认边界（冷启动用）
        currentBoundaries = ShiBoundaries({
            time: [1, 5, 20],      // 1次=稳定, 5次=活跃, 20次=爆发
            space: [2, 5, 8],      // 2平台=少, 5平台=多, 8平台=跨域
            relation: [3, 10, 50], // 3引用=初连, 10=网络, 50=生态
            updatedAt: block.timestamp,
            epoch: 0
        });
    }
    
    /**
     * @notice 更新势场边界（每周调用一次）
     * @param time 时间维三档边界 [level_1, level_2, level_3]
     * @param space 空间维三档边界
     * @param relation 关系维三档边界
     */
    function updateBoundaries(
        uint8[3] calldata time,
        uint8[3] calldata space,
        uint8[3] calldata relation
    ) external onlyOracle {
        uint256 newEpoch = currentBoundaries.epoch + 1;
        
        // 保存历史
        boundaryHistory[newEpoch - 1] = currentBoundaries;
        
        // 更新当前
        currentBoundaries = ShiBoundaries({
            time: time,
            space: space,
            relation: relation,
            updatedAt: block.timestamp,
            epoch: newEpoch
        });
        
        emit BoundariesUpdated(
            newEpoch,
            block.timestamp,
            time,
            space,
            relation
        );
    }
    
    /**
     * @notice 记录资产在势枢中的坐标
     * @param assetId 资产ID
     * @param timeUsage 时间维使用次数
     * @param spaceCount 平台数量
     * @param relationCount 引用数量
     */
    function recordCoordinate(
        bytes32 assetId,
        uint8 timeUsage,
        uint8 spaceCount,
        uint8 relationCount
    ) external onlyOracle returns (ShiShuCoordinate memory) {
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
        if (value == 0) return 0;                    // 沉寂/孤立
        if (value < boundaries[0]) return 1;         // 稳定/少平台/初连
        if (value < boundaries[1]) return 2;         // 活跃/多平台/网络
        return 3;                                     // 爆发/跨域/生态
    }
    
    /**
     * @notice 查询资产当前坐标
     */
    function getCoordinate(bytes32 assetId)
        external
        view
        returns (uint8 time, uint8 space, uint8 relation, uint256 recordedAt)
    {
        ShiShuCoordinate storage coord = assetCoordinates[assetId];
        return (coord.timeLevel, coord.spaceLevel, coord.relationLevel, coord.recordedAt);
    }
    
    /**
     * @notice 设置预言机地址
     */
    function setOracle(address newOracle) external onlyOwner {
        oracle = newOracle;
    }
}

// ============================================
// 2. 势位注册表 - 存储资产的六爻坐标和势能
// ============================================
contract ShiPositionRegistry {
    
    address public oracle;
    address public owner;
    
    modifier onlyOracle() {
        require(msg.sender == oracle, "Only oracle");
        _;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    // 六爻枚举
    enum Yao { ChuJiu, JiuEr, JiuSan, JiuSi, JiuWu, ShangJiu }
    
    // 势位结构
    struct ShiPosition {
        Yao timeYao;          // 时间势位
        Yao spaceYao;         // 空间势位
        Yao relationYao;      // 关系势位
        uint256 shiEnergy;    // 势能值 (0-10000)
        uint256 lastUpdate;   // 最后更新
    }
    
    // 势位跃迁记录
    struct ShiTransition {
        uint8 dimension;      // 0=时间, 1=空间, 2=关系
        Yao fromYao;
        Yao toYao;
        uint8 percentileBefore;  // 跃迁前百分位
        uint8 percentileAfter;   // 跃迁后百分位
        uint256 timestamp;
        bytes32 triggerEvent;    // 触发事件哈希
    }
    
    // 资产 => 当前势位
    mapping(bytes32 => ShiPosition) public positions;
    
    // 资产 => 跃迁历史
    mapping(bytes32 => ShiTransition[]) public transitionHistory;
    
    // 事件
    event PositionUpdated(
        bytes32 indexed assetId,
        Yao timeYao,
        Yao spaceYao,
        Yao relationYao,
        uint256 shiEnergy
    );
    
    event PositionTransition(
        bytes32 indexed assetId,
        uint8 dimension,
        Yao fromYao,
        Yao toYao,
        uint256 timestamp
    );
    
    constructor() {
        owner = msg.sender;
        oracle = msg.sender;
    }
    
    /**
     * @notice 更新资产势位
     * @param assetId 资产ID
     * @param timePercentile 时间维百分位 (0-100)
     * @param spacePercentile 空间维百分位
     * @param relationPercentile 关系维百分位
     * @param shiEnergy 势能值
     */
    function updatePosition(
        bytes32 assetId,
        uint8 timePercentile,
        uint8 spacePercentile,
        uint8 relationPercentile,
        uint256 shiEnergy
    ) external onlyOracle {
        require(timePercentile <= 100, "Invalid percentile");
        require(spacePercentile <= 100, "Invalid percentile");
        require(relationPercentile <= 100, "Invalid percentile");
        
        // 计算新的六爻坐标
        Yao newTimeYao = _percentileToYao(timePercentile);
        Yao newSpaceYao = _percentileToYao(spacePercentile);
        Yao newRelationYao = _percentileToYao(relationPercentile);
        
        ShiPosition storage current = positions[assetId];
        
        // 检查是否跃迁
        if (current.timeYao != newTimeYao) {
            _recordTransition(
                assetId,
                0,
                current.timeYao,
                newTimeYao,
                0, // 需要传入旧百分位，这里简化
                timePercentile
            );
        }
        if (current.spaceYao != newSpaceYao) {
            _recordTransition(assetId, 1, current.spaceYao, newSpaceYao, 0, spacePercentile);
        }
        if (current.relationYao != newRelationYao) {
            _recordTransition(assetId, 2, current.relationYao, newRelationYao, 0, relationPercentile);
        }
        
        // 更新势位
        positions[assetId] = ShiPosition({
            timeYao: newTimeYao,
            spaceYao: newSpaceYao,
            relationYao: newRelationYao,
            shiEnergy: shiEnergy,
            lastUpdate: block.timestamp
        });
        
        emit PositionUpdated(
            assetId,
            newTimeYao,
            newSpaceYao,
            newRelationYao,
            shiEnergy
        );
    }
    
    /**
     * @notice 百分位转六爻
     */
    function _percentileToYao(uint8 percentile) internal pure returns (Yao) {
        if (percentile < 25) return Yao.ChuJiu;      // 初九: 后25%
        if (percentile < 50) return Yao.JiuEr;       // 九二: 25-50%
        if (percentile < 70) return Yao.JiuSan;      // 九三: 50-70%
        if (percentile < 85) return Yao.JiuSi;       // 九四: 70-85%
        if (percentile < 95) return Yao.JiuWu;       // 九五: 85-95%
        return Yao.ShangJiu;                          // 上九: 前5%
    }
    
    /**
     * @notice 记录跃迁
     */
    function _recordTransition(
        bytes32 assetId,
        uint8 dimension,
        Yao fromYao,
        Yao toYao,
        uint8 percentileBefore,
        uint8 percentileAfter
    ) internal {
        transitionHistory[assetId].push(ShiTransition({
            dimension: dimension,
            fromYao: fromYao,
            toYao: toYao,
            percentileBefore: percentileBefore,
            percentileAfter: percentileAfter,
            timestamp: block.timestamp,
            triggerEvent: bytes32(0) // 简化版
        }));
        
        emit PositionTransition(
            assetId,
            dimension,
            fromYao,
            toYao,
            block.timestamp
        );
    }
    
    /**
     * @notice 获取资产势位
     */
    function getPosition(bytes32 assetId)
        external
        view
        returns (
            Yao timeYao,
            Yao spaceYao,
            Yao relationYao,
            uint256 shiEnergy,
            uint256 lastUpdate
        )
    {
        ShiPosition storage pos = positions[assetId];
        return (
            pos.timeYao,
            pos.spaceYao,
            pos.relationYao,
            pos.shiEnergy,
            pos.lastUpdate
        );
    }
    
    /**
     * @notice 获取跃迁历史长度
     */
    function getTransitionCount(bytes32 assetId) external view returns (uint256) {
        return transitionHistory[assetId].length;
    }
    
    function setOracle(address newOracle) external onlyOwner {
        oracle = newOracle;
    }
}

// ============================================
// 3. 势场注册表 - 存储64势场区域
// ============================================
contract ShiFieldRegistry {
    
    address public oracle;
    address public owner;
    
    modifier onlyOracle() {
        require(msg.sender == oracle, "Only oracle");
        _;
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }
    
    // 势场区域结构
    struct ShiFieldRegion {
        string traditionalName;  // 传统卦名，如"乾"
        uint8[4] center;         // 中心特征 [用, 扩, 衍, 益]
        uint256 memberCount;     // 成员数量
        string description;      // 描述
    }
    
    // 势场周期
    struct ShiFieldEpoch {
        uint256 timestamp;
        uint256 epoch;
        bytes32 merkleRoot;      // 资产-区域映射的Merkle根
        mapping(uint8 => ShiFieldRegion) regions;  // 1-64区域
    }
    
    // 周期ID => 势场周期
    mapping(uint256 => ShiFieldEpoch) public epochs;
    
    // 当前周期
    uint256 public currentEpoch;
    
    // 资产 => 当前所属区域 (简化版，不存历史)
    mapping(bytes32 => uint8) public assetToRegion;
    
    // Merkle验证器地址
    address public merkleVerifier;
    
    event ShiFieldUpdated(
        uint256 indexed epoch,
        uint256 timestamp,
        bytes32 merkleRoot
    );
    
    event AssetRegionAssigned(
        bytes32 indexed assetId,
        uint8 regionId,
        string regionName
    );
    
    constructor(address _merkleVerifier) {
        owner = msg.sender;
        oracle = msg.sender;
        merkleVerifier = _merkleVerifier;
        currentEpoch = 0;
    }
    
    /**
     * @notice 创建新的势场周期（每周调用）
     */
    function createEpoch(
        bytes32 merkleRoot,
        ShiFieldRegion[64] calldata regions
    ) external onlyOracle returns (uint256 epochId) {
        uint256 newEpoch = currentEpoch + 1;
        
        ShiFieldEpoch storage epoch = epochs[newEpoch];
        epoch.timestamp = block.timestamp;
        epoch.epoch = newEpoch;
        epoch.merkleRoot = merkleRoot;
        
        // 存储64个区域信息
        for (uint8 i = 0; i < 64; i++) {
            epoch.regions[i + 1] = regions[i]; // 区域ID从1开始
        }
        
        currentEpoch = newEpoch;
        
        emit ShiFieldUpdated(newEpoch, block.timestamp, merkleRoot);
        
        return newEpoch;
    }
    
    /**
     * @notice 验证并记录资产所属区域（用户自己调用，带Merkle证明）
     * @param assetId 资产ID
     * @param regionId 声称的区域ID
     * @param merkleProof Merkle证明路径
     */
    function assignRegion(
        bytes32 assetId,
        uint8 regionId,
        bytes32[] calldata merkleProof
    ) external {
        require(regionId >= 1 && regionId <= 64, "Invalid region");
        
        // 构建叶子节点：keccak256(assetId, regionId)
        bytes32 leaf = keccak256(abi.encodePacked(assetId, regionId));
        
        // 验证Merkle证明
        require(
            _verifyMerkleProof(epochs[currentEpoch].merkleRoot, leaf, merkleProof),
            "Invalid Merkle proof"
        );
        
        // 记录
        assetToRegion[assetId] = regionId;
        
        emit AssetRegionAssigned(
            assetId,
            regionId,
            epochs[currentEpoch].regions[regionId].traditionalName
        );
    }
    
    /**
     * @notice 验证Merkle证明（简化版，实际可用OpenZeppelin库）
     */
    function _verifyMerkleProof(
        bytes32 root,
        bytes32 leaf,
        bytes32[] memory proof
    ) internal pure returns (bool) {
        bytes32 computedHash = leaf;
        
        for (uint256 i = 0; i < proof.length; i++) {
            bytes32 proofElement = proof[i];
            
            if (computedHash < proofElement) {
                computedHash = keccak256(abi.encodePacked(computedHash, proofElement));
            } else {
                computedHash = keccak256(abi.encodePacked(proofElement, computedHash));
            }
        }
        
        return computedHash == root;
    }
    
    /**
     * @notice 获取区域信息
     */
    function getRegion(uint256 epoch, uint8 regionId)
        external
        view
        returns (ShiFieldRegion memory)
    {
        return epochs[epoch].regions[regionId];
    }
    
    /**
     * @notice 获取资产当前区域
     */
    function getAssetRegion(bytes32 assetId) external view returns (uint8) {
        return assetToRegion[assetId];
    }
    
    function setOracle(address newOracle) external onlyOwner {
        oracle = newOracle;
    }
    
    function setMerkleVerifier(address newVerifier) external onlyOwner {
        merkleVerifier = newVerifier;
    }
}

// ============================================
// 4. 部署脚本示例
// ============================================
/*
// 部署顺序：
// 1. 部署 ShiShuRegistry
// 2. 部署 ShiPositionRegistry
// 3. 部署 ShiFieldRegistry（传入 ShiShuRegistry 地址作为 verifier，或单独部署 verifier）
// 4. 设置 oracle 地址为链下服务地址

// Hardhat 部署脚本示例：
async function main() {
    const ShiShu = await ethers.getContractFactory("ShiShuRegistry");
    const shu = await ShiShu.deploy();
    await shu.waitForDeployment();
    console.log("ShiShu deployed to:", await shu.getAddress());
    
    const ShiPosition = await ethers.getContractFactory("ShiPositionRegistry");
    const pos = await ShiPosition.deploy();
    await pos.waitForDeployment();
    console.log("ShiPosition deployed to:", await pos.getAddress());
    
    const ShiField = await ethers.getContractFactory("ShiFieldRegistry");
    const field = await ShiField.deploy(await shu.getAddress()); // 简化，实际可能需要单独verifier
    await field.waitForDeployment();
    console.log("ShiField deployed to:", await field.getAddress());
    
    // 设置oracle（替换为实际的链下服务地址）
    await shu.setOracle("0x...");
    await pos.setOracle("0x...");
    await field.setOracle("0x...");
}
*/

// ============================================
// 5. 使用流程示例
// ============================================
/*
【每周更新流程】（由oracle执行）

1. 链下计算：
   - 收集所有资产的使用数据
   - 计算新的势场边界（百分位数）
   - 计算每个资产的势位（六爻坐标）
   - 运行聚类算法，发现64个势场区域
   - 生成Merkle树（资产 => 区域映射）

2. 链上提交（批量）：
   ShiShuRegistry.updateBoundaries([...], [...], [...])
   ShiFieldRegistry.createEpoch(merkleRoot, regions)
   
   // 对每个资产
   ShiShuRegistry.recordCoordinate(assetId, usage, platforms, citations)
   ShiPositionRegistry.updatePosition(assetId, timePct, spacePct, relationPct, energy)

【用户查询流程】（用户自己调用）

1. 用户知道自己的assetId
2. 从链下服务获取Merkle证明（证明自己属于哪个区域）
3. 调用 ShiFieldRegistry.assignRegion(assetId, regionId, proof)
4. 查询 ShiPositionRegistry.getPosition(assetId) 获取势位
5. 前端展示："你处于姤势场·九四势位"
*/