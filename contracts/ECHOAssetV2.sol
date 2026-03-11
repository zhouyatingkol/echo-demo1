// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title ECHOAsset V2
 * @dev 升级版本：权属蓝图 + 内容验证 + 版本控制
 */
contract ECHOAssetV2 is ERC721 {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    // ========== 数据结构 ==========
    
    // 权属蓝图 - 详细权利配置
    struct RightsBlueprint {
        // 使用权详细条款
        UsageRights usage;
        
        // 衍生权限制
        DerivativeRights derivative;
        
        // 扩展权范围
        ExtensionRights extension;
        
        // 收益权分配
        RevenueRights revenue;
    }
    
    struct UsageRights {
        address owner;                 // 使用权所有者
        uint256 fee;                   // 使用费
        bool commercialUse;            // 允许商业使用
        bool modificationAllowed;      // 允许修改
        string[] allowedScopes;        // 允许的使用范围
        string[] restrictedScopes;     // 禁止的使用范围
        uint256 maxUsers;              // 最大使用人数（0=无限）
        uint256 licenseDuration;       // 授权时长（秒，0=永久）
    }
    
    struct DerivativeRights {
        address owner;                 // 衍生权所有者
        uint256 fee;                   // 衍生授权费
        bool allowDerivatives;         // 是否允许创作衍生作品
        uint256 revenueShare;          // 衍生作品收益分成比例（基点，10000=100%）
        string[] allowedTypes;         // 允许的衍生类型
    }
    
    struct ExtensionRights {
        address owner;                 // 扩展权所有者
        uint256 fee;                   // 扩展费
        bool allowExtensions;          // 是否允许扩展
        string[] allowedExtensions;    // 允许的扩展方式
    }
    
    struct RevenueRights {
        address owner;                 // 收益权所有者
        uint256 sharePercentage;       // 收益分成比例（基点）
        bool autoDistribute;           // 是否自动分配
    }
    
    // 资产元数据
    struct AssetMetadata {
        string name;                   // 资产名称
        string description;            // 描述
        string assetType;              // 类型：code/algorithm/data/patent
        string uri;                    // IPFS地址
        bytes32 contentHash;           // 内容指纹（keccak256）
        uint256 createdAt;             // 创建时间
        uint256 lastUpdated;           // 最后更新时间
    }
    
    // 版本历史
    struct VersionHistory {
        uint256 version;               // 版本号
        bytes32 contentHash;           // 该版本的内容哈希
        string uri;                    // 该版本的IPFS地址
        uint256 timestamp;             // 更新时间
        string updateReason;           // 更新原因
    }
    
    // ========== 存储映射 ==========
    
    // 资产元数据
    mapping(uint256 => AssetMetadata) public assetMetadata;
    
    // 权属蓝图
    mapping(uint256 => RightsBlueprint) public rightsBlueprint;
    
    // 原始创作者
    mapping(uint256 => address) public originalCreator;
    
    // 版本历史
    mapping(uint256 => VersionHistory[]) public versionHistory;
    
    // 当前版本号
    mapping(uint256 => uint256) public currentVersion;
    
    // 内容哈希到TokenID的映射（确保一数据一资产）
    mapping(bytes32 => uint256) public contentHashToToken;
    
    // 使用授权记录
    mapping(uint256 => mapping(address => UsageAuthorization)) public usageAuthorizations;
    
    struct UsageAuthorization {
        uint256 expiryTime;            // 授权到期时间
        uint256 paidAmount;            // 已支付金额
        bool isActive;                 // 是否有效
    }
    
    // 衍生作品记录（父资产 => 衍生作品数组）
    mapping(uint256 => uint256[]) public derivativeWorks;
    
    // 父资产映射（衍生作品 => 父资产）
    mapping(uint256 => uint256) public parentAsset;
    
    // ========== 事件 ==========
    
    event AssetMinted(
        uint256 indexed tokenId,
        address indexed creator,
        bytes32 contentHash,
        string name
    );
    
    event RightsBlueprintConfigured(
        uint256 indexed tokenId,
        RightsBlueprint blueprint
    );
    
    event ContentUpdated(
        uint256 indexed tokenId,
        uint256 version,
        bytes32 newContentHash,
        string updateReason
    );
    
    event RightTransferred(
        uint256 indexed tokenId,
        string rightType,
        address indexed from,
        address indexed to
    );
    
    event UsageAuthorized(
        uint256 indexed tokenId,
        address indexed user,
        uint256 expiryTime
    );
    
    event DerivativeCreated(
        uint256 indexed parentId,
        uint256 indexed derivativeId,
        address creator
    );
    
    event RevenueShared(
        uint256 indexed parentId,
        uint256 indexed derivativeId,
        uint256 amount
    );

    constructor() ERC721("ECHO Asset V2", "ECHOV2") {}
    
    // ========== 铸造函数 ==========
    
    /**
     * @dev 铸造新的ECHO资产（带权属蓝图）
     * @param name 资产名称
     * @param description 资产描述
     * @param assetType 资产类型
     * @param uri IPFS地址
     * @param contentHash 内容指纹
     * @param blueprint 权属蓝图
     */
    function mintECHO(
        string memory name,
        string memory description,
        string memory assetType,
        string memory uri,
        bytes32 contentHash,
        RightsBlueprint memory blueprint
    ) public returns (uint256) {
        // 验证：一数据一资产
        require(contentHashToToken[contentHash] == 0, "Content already minted");
        require(contentHash != bytes32(0), "Invalid content hash");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(msg.sender, tokenId);
        
        // 存储元数据
        assetMetadata[tokenId] = AssetMetadata({
            name: name,
            description: description,
            assetType: assetType,
            uri: uri,
            contentHash: contentHash,
            createdAt: block.timestamp,
            lastUpdated: block.timestamp
        });
        
        // 存储权属蓝图
        rightsBlueprint[tokenId] = blueprint;
        
        // 记录创作者
        originalCreator[tokenId] = msg.sender;
        
        // 记录内容哈希映射
        contentHashToToken[contentHash] = tokenId;
        
        // 初始化版本历史
        versionHistory[tokenId].push(VersionHistory({
            version: 1,
            contentHash: contentHash,
            uri: uri,
            timestamp: block.timestamp,
            updateReason: "Initial mint"
        }));
        currentVersion[tokenId] = 1;
        
        emit AssetMinted(tokenId, msg.sender, contentHash, name);
        emit RightsBlueprintConfigured(tokenId, blueprint);
        
        return tokenId;
    }
    
    // ========== 版本控制 ==========
    
    /**
     * @dev 更新资产内容（仅限创作者）
     * @param tokenId Token ID
     * @param newUri 新的IPFS地址
     * @param newContentHash 新的内容哈希
     * @param updateReason 更新原因
     */
    function updateContent(
        uint256 tokenId,
        string memory newUri,
        bytes32 newContentHash,
        string memory updateReason
    ) public {
        require(_exists(tokenId), "Asset does not exist");
        require(msg.sender == originalCreator[tokenId], "Only creator can update");
        require(newContentHash != bytes32(0), "Invalid content hash");
        
        AssetMetadata storage meta = assetMetadata[tokenId];
        
        // 更新元数据
        meta.uri = newUri;
        meta.contentHash = newContentHash;
        meta.lastUpdated = block.timestamp;
        
        // 更新内容哈希映射
        delete contentHashToToken[meta.contentHash];
        contentHashToToken[newContentHash] = tokenId;
        
        // 增加版本
        uint256 newVersion = currentVersion[tokenId] + 1;
        currentVersion[tokenId] = newVersion;
        
        // 记录版本历史
        versionHistory[tokenId].push(VersionHistory({
            version: newVersion,
            contentHash: newContentHash,
            uri: newUri,
            timestamp: block.timestamp,
            updateReason: updateReason
        }));
        
        emit ContentUpdated(tokenId, newVersion, newContentHash, updateReason);
    }
    
    // ========== 权利转让 ==========
    
    function transferUsageRight(uint256 tokenId, address newOwner) public {
        require(_exists(tokenId), "Asset does not exist");
        require(rightsBlueprint[tokenId].usage.owner == msg.sender, "Not usage owner");
        
        address oldOwner = rightsBlueprint[tokenId].usage.owner;
        rightsBlueprint[tokenId].usage.owner = newOwner;
        
        emit RightTransferred(tokenId, "usage", oldOwner, newOwner);
    }
    
    function transferDerivativeRight(uint256 tokenId, address newOwner) public {
        require(_exists(tokenId), "Asset does not exist");
        require(rightsBlueprint[tokenId].derivative.owner == msg.sender, "Not derivative owner");
        
        address oldOwner = rightsBlueprint[tokenId].derivative.owner;
        rightsBlueprint[tokenId].derivative.owner = newOwner;
        
        emit RightTransferred(tokenId, "derivative", oldOwner, newOwner);
    }
    
    function transferExtensionRight(uint256 tokenId, address newOwner) public {
        require(_exists(tokenId), "Asset does not exist");
        require(rightsBlueprint[tokenId].extension.owner == msg.sender, "Not extension owner");
        
        address oldOwner = rightsBlueprint[tokenId].extension.owner;
        rightsBlueprint[tokenId].extension.owner = newOwner;
        
        emit RightTransferred(tokenId, "extension", oldOwner, newOwner);
    }
    
    function transferRevenueRight(uint256 tokenId, address newOwner) public {
        require(_exists(tokenId), "Asset does not exist");
        require(rightsBlueprint[tokenId].revenue.owner == msg.sender, "Not revenue owner");
        
        address oldOwner = rightsBlueprint[tokenId].revenue.owner;
        rightsBlueprint[tokenId].revenue.owner = newOwner;
        
        emit RightTransferred(tokenId, "revenue", oldOwner, newOwner);
    }
    
    // ========== 使用授权 ==========
    
    /**
     * @dev 支付使用费获得使用权
     */
    function payForUsage(uint256 tokenId, uint256 durationDays) public payable {
        require(_exists(tokenId), "Asset does not exist");
        
        RightsBlueprint storage blueprint = rightsBlueprint[tokenId];
        uint256 requiredFee = blueprint.usage.fee * durationDays;
        
        require(msg.value >= requiredFee, "Insufficient fee");
        require(blueprint.usage.maxUsers == 0 || getActiveUserCount(tokenId) < blueprint.usage.maxUsers, "Max users reached");
        
        // 转账给收益权所有者
        payable(blueprint.revenue.owner).transfer(msg.value);
        
        // 计算授权时长
        uint256 duration = durationDays * 1 days;
        if (blueprint.usage.licenseDuration > 0 && duration > blueprint.usage.licenseDuration) {
            duration = blueprint.usage.licenseDuration;
        }
        
        // 授权使用
        uint256 expiry = block.timestamp + duration;
        usageAuthorizations[tokenId][msg.sender] = UsageAuthorization({
            expiryTime: expiry,
            paidAmount: msg.value,
            isActive: true
        });
        
        emit UsageAuthorized(tokenId, msg.sender, expiry);
    }
    
    /**
     * @dev 检查用户是否有使用权
     */
    function hasUsageRight(uint256 tokenId, address user) public view returns (bool) {
        // 使用权所有者永远有使用权
        if (rightsBlueprint[tokenId].usage.owner == user) {
            return true;
        }
        
        // 检查授权
        UsageAuthorization memory auth = usageAuthorizations[tokenId][user];
        return auth.isActive && auth.expiryTime > block.timestamp;
    }
    
    function getActiveUserCount(uint256 tokenId) internal view returns (uint256) {
        // 简化实现，实际应该遍历所有授权用户
        return 0;
    }
    
    // ========== 衍生作品 ==========
    
    /**
     * @dev 创建衍生作品
     */
    function createDerivative(
        uint256 parentId,
        string memory name,
        string memory description,
        string memory assetType,
        string memory uri,
        bytes32 contentHash,
        RightsBlueprint memory blueprint
    ) public payable returns (uint256) {
        require(_exists(parentId), "Parent asset does not exist");
        
        RightsBlueprint storage parentBlueprint = rightsBlueprint[parentId];
        require(parentBlueprint.derivative.allowDerivatives, "Derivatives not allowed");
        
        // 支付衍生授权费
        if (parentBlueprint.derivative.fee > 0) {
            require(msg.value >= parentBlueprint.derivative.fee, "Insufficient derivative fee");
            payable(parentBlueprint.derivative.owner).transfer(parentBlueprint.derivative.fee);
        }
        
        // 铸造衍生作品
        uint256 derivativeId = mintECHO(name, description, assetType, uri, contentHash, blueprint);
        
        // 记录关系
        derivativeWorks[parentId].push(derivativeId);
        parentAsset[derivativeId] = parentId;
        
        emit DerivativeCreated(parentId, derivativeId, msg.sender);
        
        return derivativeId;
    }
    
    /**
     * @dev 分享衍生作品收益给父资产
     */
    function shareRevenue(uint256 derivativeId) public payable {
        require(_exists(derivativeId), "Derivative does not exist");
        require(msg.value > 0, "Must send revenue");
        
        uint256 parentId = parentAsset[derivativeId];
        if (parentId == 0) return; // 不是衍生作品
        
        RightsBlueprint storage parentBlueprint = rightsBlueprint[parentId];
        uint256 share = (msg.value * parentBlueprint.derivative.revenueShare) / 10000;
        
        if (share > 0) {
            payable(parentBlueprint.revenue.owner).transfer(share);
            emit RevenueShared(parentId, derivativeId, share);
        }
    }
    
    // ========== 查询函数 ==========
    
    function getAssetInfo(uint256 tokenId) public view returns (
        AssetMetadata memory metadata,
        RightsBlueprint memory blueprint,
        address creator,
        uint256 version
    ) {
        require(_exists(tokenId), "Asset does not exist");
        return (
            assetMetadata[tokenId],
            rightsBlueprint[tokenId],
            originalCreator[tokenId],
            currentVersion[tokenId]
        );
    }
    
    function getVersionHistory(uint256 tokenId) public view returns (VersionHistory[] memory) {
        require(_exists(tokenId), "Asset does not exist");
        return versionHistory[tokenId];
    }
    
    function getDerivativeWorks(uint256 tokenId) public view returns (uint256[] memory) {
        return derivativeWorks[tokenId];
    }
    
    function getCurrentTokenId() public view returns (uint256) {
        return _tokenIdCounter.current();
    }
    
    // 接收ETH
    receive() external payable {}
}