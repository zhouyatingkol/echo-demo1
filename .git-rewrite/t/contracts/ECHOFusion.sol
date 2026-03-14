// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title ECHOFusion
 * @dev ECHO Protocol 资产融合合约 - 种子合成树
 * 
 * 核心功能：
 * - 多颗种子（ECHOAsset）融合成树
 * - 收益按权重分配给种子所有者
 * - 记录父子关系
 */
contract ECHOFusion is ERC721, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    Counters.Counter private _treeIdCounter;
    
    // 外部ECHOAsset合约地址
    address public echoAssetContract;
    
    // 树的数据结构
    struct Tree {
        uint256 treeId;
        string name;
        string description;
        uint256[] seedIds;           // 父种子ID数组
        uint256[] weights;           // 每颗种子的权重
        address[] seedOwners;        // 每颗种子的原所有者
        uint256 totalWeight;         // 总权重
        uint256 createdAt;
        uint256 accumulatedRevenue;  // 累计收益
        bool isActive;               // 是否活跃
    }
    
    // 种子在树中的信息
    struct SeedInTree {
        uint256 treeId;
        uint256 weight;
        uint256 revenueShare;        // 收益份额 (basis points, 10000 = 100%)
        bool exists;
    }
    
    // 用户收益记录 (treeId => user => amount)
    mapping(uint256 => mapping(address => uint256)) public pendingRevenue;
    
    // 树的存储
    mapping(uint256 => Tree) public trees;
    
    // 种子是否已被融合 (seedId => bool)
    mapping(uint256 => bool) public isSeedFused;
    
    // 种子属于哪棵树 (seedId => treeId)
    mapping(uint256 => uint256) public seedToTree;
    
    // 事件
    event TreeFused(
        uint256 indexed treeId,
        address indexed creator,
        uint256[] seedIds,
        uint256[] weights
    );
    
    event RevenueDistributed(
        uint256 indexed treeId,
        uint256 amount,
        address distributor
    );
    
    event RevenueClaimed(
        uint256 indexed treeId,
        address indexed user,
        uint256 amount
    );
    
    event SeedAddedToTree(
        uint256 indexed treeId,
        uint256 indexed seedId,
        uint256 weight
    );

    constructor(address _echoAssetContract) ERC721("ECHO Tree", "ETREE") {
        require(_echoAssetContract != address(0), "Invalid contract address");
        echoAssetContract = _echoAssetContract;
    }
    
    /**
     * @dev 融合多颗种子创建树
     * @param seedIds 种子ID数组
     * @param weights 权重数组（与seedIds一一对应）
     * @param name 树的名称
     * @param description 树的描述
     */
    function fuseTree(
        uint256[] calldata seedIds,
        uint256[] calldata weights,
        string calldata name,
        string calldata description
    ) external returns (uint256) {
        require(seedIds.length >= 2, "Need at least 2 seeds");
        require(seedIds.length <= 10, "Max 10 seeds allowed");
        require(seedIds.length == weights.length, "Length mismatch");
        
        uint256 treeId = _treeIdCounter.current();
        _treeIdCounter.increment();
        
        Tree storage newTree = trees[treeId];
        newTree.treeId = treeId;
        newTree.name = name;
        newTree.description = description;
        newTree.createdAt = block.timestamp;
        newTree.isActive = true;
        
        uint256 totalWeight = 0;
        address[] memory owners = new address[](seedIds.length);
        
        for (uint i = 0; i < seedIds.length; i++) {
            uint256 seedId = seedIds[i];
            uint256 weight = weights[i];
            
            require(weight > 0, "Weight must be positive");
            require(!isSeedFused[seedId], "Seed already fused");
            
            // 验证调用者是否是种子的所有者
            require(_isSeedOwner(seedId, msg.sender), "Not seed owner");
            
            isSeedFused[seedId] = true;
            seedToTree[seedId] = treeId;
            
            newTree.seedIds.push(seedId);
            newTree.weights.push(weight);
            totalWeight += weight;
            
            // 记录种子所有者
            address seedOwner = _getSeedOwner(seedId);
            owners[i] = seedOwner;
            
            emit SeedAddedToTree(treeId, seedId, weight);
        }
        
        newTree.totalWeight = totalWeight;
        newTree.seedOwners = owners;
        
        // 铸造树NFT给调用者
        _safeMint(msg.sender, treeId);
        
        emit TreeFused(treeId, msg.sender, seedIds, weights);
        
        return treeId;
    }
    
    /**
     * @dev 向树分配收益
     */
    function distributeRevenue(uint256 treeId) external payable nonReentrant {
        require(_exists(treeId), "Tree does not exist");
        require(trees[treeId].isActive, "Tree not active");
        require(msg.value > 0, "Must send revenue");
        
        Tree storage tree = trees[treeId];
        tree.accumulatedRevenue += msg.value;
        
        // 按权重分配收益给各种子所有者
        for (uint i = 0; i < tree.seedIds.length; i++) {
            address owner = tree.seedOwners[i];
            uint256 weight = tree.weights[i];
            
            // 计算份额: (weight / totalWeight) * msg.value
            uint256 share = (msg.value * weight) / tree.totalWeight;
            pendingRevenue[treeId][owner] += share;
        }
        
        emit RevenueDistributed(treeId, msg.value, msg.sender);
    }
    
    /**
     * @dev 领取收益
     */
    function claimRevenue(uint256 treeId) external nonReentrant {
        require(_exists(treeId), "Tree does not exist");
        
        uint256 amount = pendingRevenue[treeId][msg.sender];
        require(amount > 0, "No revenue to claim");
        
        pendingRevenue[treeId][msg.sender] = 0;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit RevenueClaimed(treeId, msg.sender, amount);
    }
    
    /**
     * @dev 查询树的完整信息
     */
    function getTreeInfo(uint256 treeId) external view returns (
        string memory name,
        string memory description,
        uint256[] memory seedIds,
        uint256[] memory weights,
        uint256 totalRevenue,
        address owner
    ) {
        require(_exists(treeId), "Tree does not exist");
        Tree storage tree = trees[treeId];
        
        return (
            tree.name,
            tree.description,
            tree.seedIds,
            tree.weights,
            tree.accumulatedRevenue,
            ownerOf(treeId)
        );
    }
    
    /**
     * @dev 查询用户在树的待领取收益
     */
    function getPendingRevenue(uint256 treeId, address user) external view returns (uint256) {
        return pendingRevenue[treeId][user];
    }
    
    /**
     * @dev 查询种子属于哪棵树
     */
    function getSeedTree(uint256 seedId) external view returns (uint256) {
        require(isSeedFused[seedId], "Seed not fused");
        return seedToTree[seedId];
    }
    
    /**
     * @dev 检查种子是否已被融合
     */
    function checkSeedFused(uint256 seedId) external view returns (bool) {
        return isSeedFused[seedId];
    }
    
    /**
     * @dev 获取当前树数量
     */
    function getCurrentTreeId() external view returns (uint256) {
        return _treeIdCounter.current();
    }
    
    // ============ 内部函数 ============
    
    /**
     * @dev 检查是否是种子的所有者
     */
    function _isSeedOwner(uint256 seedId, address user) internal view returns (bool) {
        // 调用ECHOAsset合约的ownerOf
        (bool success, bytes memory data) = echoAssetContract.staticcall(
            abi.encodeWithSignature("ownerOf(uint256)", seedId)
        );
        
        if (!success || data.length < 32) return false;
        
        address owner = abi.decode(data, (address));
        return owner == user;
    }
    
    /**
     * @dev 获取种子的所有者
     */
    function _getSeedOwner(uint256 seedId) internal view returns (address) {
        (bool success, bytes memory data) = echoAssetContract.staticcall(
            abi.encodeWithSignature("ownerOf(uint256)", seedId)
        );
        
        require(success && data.length >= 32, "Failed to get seed owner");
        return abi.decode(data, (address));
    }
    
    // 接收ETH
    receive() external payable {}
}