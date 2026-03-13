// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ECHOFusion V2
 * @dev ECHO Protocol 资产融合合约 V2 - 安全修复版
 * 
 * 修复内容：
 * - 添加 onlyTreeOwner 权限控制到 distributeRevenue
 * - 添加 Pausable 紧急暂停功能
 * - 添加 owner 管理功能
 * 
 * 部署后需要替换现有 ECHOFusion 合约
 */
contract ECHOFusionV2 is ERC721, ReentrancyGuard, Pausable, Ownable {
    using Counters for Counters.Counter;
    
    Counters.Counter private _treeIdCounter;
    
    // 外部ECHOAsset合约地址
    address public echoAssetContract;
    
    // 树的数据结构
    struct Tree {
        uint256 treeId;
        string name;
        string description;
        uint256[] seedIds;
        uint256[] weights;
        address[] seedOwners;
        uint256 totalWeight;
        uint256 createdAt;
        uint256 accumulatedRevenue;
        bool isActive;
    }
    
    // 种子在树中的信息
    struct SeedInTree {
        uint256 treeId;
        uint256 weight;
        uint256 revenueShare;
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
    
    event TreeDeactivated(uint256 indexed treeId);
    event TreeReactivated(uint256 indexed treeId);

    constructor(address _echoAssetContract) ERC721("ECHO Tree V2", "ETREEV2") {
        require(_echoAssetContract != address(0), "Invalid contract address");
        echoAssetContract = _echoAssetContract;
    }
    
    // ============ 修饰符 ============
    
    /**
     * @dev 检查是否是树的所有者
     */
    modifier onlyTreeOwner(uint256 treeId) {
        require(_exists(treeId), "Tree does not exist");
        require(ownerOf(treeId) == msg.sender, "Not tree owner");
        _;
    }
    
    /**
     * @dev 检查树是否活跃
     */
    modifier onlyActiveTree(uint256 treeId) {
        require(trees[treeId].isActive, "Tree not active");
        _;
    }
    
    // ============ 核心功能 ============
    
    /**
     * @dev 融合多颗种子创建树
     */
    function fuseTree(
        uint256[] calldata seedIds,
        uint256[] calldata weights,
        string calldata name,
        string calldata description
    ) external whenNotPaused returns (uint256) {
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
            require(_isSeedOwner(seedId, msg.sender), "Not seed owner");
            
            isSeedFused[seedId] = true;
            seedToTree[seedId] = treeId;
            
            newTree.seedIds.push(seedId);
            newTree.weights.push(weight);
            totalWeight += weight;
            
            address seedOwner = _getSeedOwner(seedId);
            owners[i] = seedOwner;
            
            emit SeedAddedToTree(treeId, seedId, weight);
        }
        
        newTree.totalWeight = totalWeight;
        newTree.seedOwners = owners;
        
        _safeMint(msg.sender, treeId);
        
        emit TreeFused(treeId, msg.sender, seedIds, weights);
        
        return treeId;
    }
    
    /**
     * @dev 向树分配收益 - 修复：添加权限控制
     */
    function distributeRevenue(uint256 treeId) 
        external 
        payable 
        nonReentrant 
        whenNotPaused
        onlyTreeOwner(treeId)
        onlyActiveTree(treeId)
    {
        require(msg.value > 0, "Must send revenue");
        
        Tree storage tree = trees[treeId];
        tree.accumulatedRevenue += msg.value;
        
        // 按权重分配收益给各种子所有者
        for (uint i = 0; i < tree.seedIds.length; i++) {
            address owner = tree.seedOwners[i];
            uint256 weight = tree.weights[i];
            
            uint256 share = (msg.value * weight) / tree.totalWeight;
            pendingRevenue[treeId][owner] += share;
        }
        
        emit RevenueDistributed(treeId, msg.value, msg.sender);
    }
    
    /**
     * @dev 领取收益
     */
    function claimRevenue(uint256 treeId) 
        external 
        nonReentrant 
        whenNotPaused 
    {
        require(_exists(treeId), "Tree does not exist");
        require(trees[treeId].isActive, "Tree not active");
        
        uint256 amount = pendingRevenue[treeId][msg.sender];
        require(amount > 0, "No revenue to claim");
        
        pendingRevenue[treeId][msg.sender] = 0;
        
        (bool success, ) = payable(msg.sender).call{value: amount}("");
        require(success, "Transfer failed");
        
        emit RevenueClaimed(treeId, msg.sender, amount);
    }
    
    // ============ 管理功能 ============
    
    /**
     * @dev 停用树（紧急情况下使用）
     */
    function deactivateTree(uint256 treeId) 
        external 
        onlyTreeOwner(treeId) 
    {
        trees[treeId].isActive = false;
        emit TreeDeactivated(treeId);
    }
    
    /**
     * @dev 重新激活树
     */
    function reactivateTree(uint256 treeId) 
        external 
        onlyTreeOwner(treeId) 
    {
        trees[treeId].isActive = true;
        emit TreeReactivated(treeId);
    }
    
    /**
     * @dev 紧急暂停（仅 owner）
     */
    function pause() external onlyOwner {
        _pause();
    }
    
    /**
     * @dev 解除暂停（仅 owner）
     */
    function unpause() external onlyOwner {
        _unpause();
    }
    
    /**
     * @dev 更新 ECHOAsset 合约地址（仅 owner）
     */
    function setEchoAssetContract(address _contract) external onlyOwner {
        require(_contract != address(0), "Invalid address");
        echoAssetContract = _contract;
    }
    
    // ============ 查询功能 ============
    
    function getTreeInfo(uint256 treeId) external view returns (
        string memory name,
        string memory description,
        uint256[] memory seedIds,
        uint256[] memory weights,
        uint256 totalRevenue,
        address owner,
        bool isActive
    ) {
        require(_exists(treeId), "Tree does not exist");
        Tree storage tree = trees[treeId];
        
        return (
            tree.name,
            tree.description,
            tree.seedIds,
            tree.weights,
            tree.accumulatedRevenue,
            ownerOf(treeId),
            tree.isActive
        );
    }
    
    function getPendingRevenue(uint256 treeId, address user) external view returns (uint256) {
        return pendingRevenue[treeId][user];
    }
    
    function getSeedTree(uint256 seedId) external view returns (uint256) {
        require(isSeedFused[seedId], "Seed not fused");
        return seedToTree[seedId];
    }
    
    function checkSeedFused(uint256 seedId) external view returns (bool) {
        return isSeedFused[seedId];
    }
    
    function getCurrentTreeId() external view returns (uint256) {
        return _treeIdCounter.current();
    }
    
    // ============ 内部函数 ============
    
    function _isSeedOwner(uint256 seedId, address user) internal view returns (bool) {
        (bool success, bytes memory data) = echoAssetContract.staticcall(
            abi.encodeWithSignature("ownerOf(uint256)", seedId)
        );
        
        if (!success || data.length < 32) return false;
        
        address owner = abi.decode(data, (address));
        return owner == user;
    }
    
    function _getSeedOwner(uint256 seedId) internal view returns (address) {
        (bool success, bytes memory data) = echoAssetContract.staticcall(
            abi.encodeWithSignature("ownerOf(uint256)", seedId)
        );
        
        require(success && data.length >= 32, "Failed to get seed owner");
        return abi.decode(data, (address));
    }
    
    receive() external payable {}
}
