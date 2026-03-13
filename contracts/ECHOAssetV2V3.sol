// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title ECHOAssetV2 V3 - Security Hardened
 * @dev 升级版本：权属蓝图 + 内容验证 + 版本控制 - 安全修复版
 * 
 * 安全改进:
 * - ReentrancyGuard 防重入攻击
 * - Pausable 紧急暂停功能
 * - Checks-Effects-Interactions 模式
 * - 字符串长度限制
 * - 访问控制修饰符
 * - 价格上限保护
 * 
 * Author: OpenClaw for Qitmeer Network
 * Version: 3.0.0
 */
contract ECHOAssetV2V3 is ERC721, ReentrancyGuard, Pausable, Ownable {
    using Counters for Counters.Counter;
    
    // ============ 常量 ============
    uint256 public constant MAX_NAME_LENGTH = 100;
    uint256 public constant MAX_DESCRIPTION_LENGTH = 1000;
    uint256 public constant MAX_URI_LENGTH = 500;
    uint256 public constant MAX_FEE = 10000 ether;           // 最大费用 10000 MEER
    uint256 public constant MAX_REVENUE_SHARE = 10000;       // 最大分成 100%
    uint256 public constant MAX_USERS = 1000000;             // 最大用户数
    uint256 public constant MAX_LICENSE_DURATION = 365 days; // 最大授权期 1年
    
    // ============ 状态变量 ============
    Counters.Counter private _tokenIdCounter;
    
    // ============ 数据结构 ============
    struct RightsBlueprint {
        UsageRights usage;
        DerivativeRights derivative;
        ExtensionRights extension;
        RevenueRights revenue;
    }
    
    struct UsageRights {
        address owner;
        uint256 fee;
        bool commercialUse;
        bool modificationAllowed;
        string[] allowedScopes;
        string[] restrictedScopes;
        uint256 maxUsers;
        uint256 licenseDuration;
    }
    
    struct DerivativeRights {
        address owner;
        uint256 fee;
        bool allowDerivatives;
        uint256 revenueShare;
        string[] allowedTypes;
    }
    
    struct ExtensionRights {
        address owner;
        uint256 fee;
        bool allowExtensions;
        string[] allowedExtensions;
    }
    
    struct RevenueRights {
        address owner;
        uint256 sharePercentage;
        bool autoDistribute;
    }
    
    struct AssetMetadata {
        string name;
        string description;
        string assetType;
        string uri;
        bytes32 contentHash;
        uint256 createdAt;
        uint256 lastUpdated;
    }
    
    struct VersionHistory {
        uint256 version;
        bytes32 contentHash;
        string uri;
        uint256 timestamp;
        string updateReason;
    }
    
    struct UsageAuthorization {
        uint256 expiryTime;
        uint256 paidAmount;
        bool isActive;
    }
    
    // ============ 存储映射 ============
    mapping(uint256 => AssetMetadata) public assetMetadata;
    mapping(uint256 => RightsBlueprint) public rightsBlueprint;
    mapping(uint256 => address) public originalCreator;
    mapping(uint256 => VersionHistory[]) public versionHistory;
    mapping(uint256 => uint256) public currentVersion;
    mapping(bytes32 => uint256) public contentHashToToken;
    mapping(uint256 => mapping(address => UsageAuthorization)) public usageAuthorizations;
    mapping(uint256 => uint256[]) public derivativeWorks;
    mapping(uint256 => uint256) public parentAsset;
    
    // 价格设置 (可配置)
    mapping(uint256 => uint256) public basePrices;
    mapping(uint256 => uint256) public perUsePrices;
    mapping(uint256 => uint256) public dailyPrices;
    
    // ============ 事件 ============
    event AssetMinted(
        uint256 indexed tokenId,
        address indexed creator,
        bytes32 contentHash,
        string name,
        uint256 timestamp
    );
    
    event RightsBlueprintConfigured(
        uint256 indexed tokenId,
        address indexed creator
    );
    
    event ContentUpdated(
        uint256 indexed tokenId,
        uint256 version,
        bytes32 newContentHash,
        string updateReason,
        uint256 timestamp
    );
    
    event RightTransferred(
        uint256 indexed tokenId,
        string rightType,
        address indexed from,
        address indexed to,
        uint256 timestamp
    );
    
    event UsageAuthorized(
        uint256 indexed tokenId,
        address indexed user,
        uint256 expiryTime,
        uint256 paidAmount
    );
    
    event DerivativeCreated(
        uint256 indexed parentId,
        uint256 indexed derivativeId,
        address creator,
        uint256 feePaid
    );
    
    event RevenueShared(
        uint256 indexed parentId,
        uint256 indexed derivativeId,
        uint256 amount
    );
    
    event PriceUpdated(
        uint256 indexed tokenId,
        string priceType,
        uint256 oldPrice,
        uint256 newPrice
    );
    
    // ============ 修饰符 ============
    modifier onlyAssetCreator(uint256 tokenId) {
        require(msg.sender == originalCreator[tokenId], "Not asset creator");
        _;
    }
    
    modifier onlyUsageOwner(uint256 tokenId) {
        require(msg.sender == rightsBlueprint[tokenId].usage.owner, "Not usage owner");
        _;
    }
    
    modifier onlyDerivativeOwner(uint256 tokenId) {
        require(msg.sender == rightsBlueprint[tokenId].derivative.owner, "Not derivative owner");
        _;
    }
    
    modifier onlyRevenueOwner(uint256 tokenId) {
        require(msg.sender == rightsBlueprint[tokenId].revenue.owner, "Not revenue owner");
        _;
    }
    
    modifier validAsset(uint256 tokenId) {
        require(_exists(tokenId), "Asset does not exist");
        _;
    }
    
    modifier validString(string memory str, uint256 maxLength) {
        require(bytes(str).length > 0, "Empty string");
        require(bytes(str).length <= maxLength, "String too long");
        _;
    }
    
    modifier validContentHash(bytes32 hash) {
        require(hash != bytes32(0), "Invalid content hash");
        _;
    }
    
    modifier validRightsBlueprint(RightsBlueprint memory blueprint) {
        require(blueprint.usage.fee <= MAX_FEE, "Usage fee too high");
        require(blueprint.derivative.fee <= MAX_FEE, "Derivative fee too high");
        require(blueprint.extension.fee <= MAX_FEE, "Extension fee too high");
        require(blueprint.derivative.revenueShare <= MAX_REVENUE_SHARE, "Revenue share too high");
        require(blueprint.usage.maxUsers <= MAX_USERS, "Max users too high");
        require(blueprint.usage.licenseDuration <= MAX_LICENSE_DURATION, "License duration too long");
        _;
    }
    
    // ============ 构造函数 ============
    constructor() ERC721("ECHO Asset V2", "ECHOV2") {}
    
    // ============ 铸造函数 ============
    
    /**
     * @dev 铸造新的 ECHO 资产
     */
    function mintECHO(
        string memory name,
        string memory description,
        string memory assetType,
        string memory uri,
        bytes32 contentHash,
        RightsBlueprint memory blueprint
    ) 
        public 
        whenNotPaused
        validString(name, MAX_NAME_LENGTH)
        validString(description, MAX_DESCRIPTION_LENGTH)
        validString(uri, MAX_URI_LENGTH)
        validContentHash(contentHash)
        validRightsBlueprint(blueprint)
        returns (uint256) 
    {
        // CHECKS
        require(contentHashToToken[contentHash] == 0, "Content already minted");
        
        // EFFECTS
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(msg.sender, tokenId);
        
        assetMetadata[tokenId] = AssetMetadata({
            name: name,
            description: description,
            assetType: assetType,
            uri: uri,
            contentHash: contentHash,
            createdAt: block.timestamp,
            lastUpdated: block.timestamp
        });
        
        rightsBlueprint[tokenId] = blueprint;
        originalCreator[tokenId] = msg.sender;
        contentHashToToken[contentHash] = tokenId;
        
        versionHistory[tokenId].push(VersionHistory({
            version: 1,
            contentHash: contentHash,
            uri: uri,
            timestamp: block.timestamp,
            updateReason: "Initial mint"
        }));
        currentVersion[tokenId] = 1;
        
        // 设置默认价格
        basePrices[tokenId] = 100 * 10**18;      // 100 MEER
        perUsePrices[tokenId] = 0.5 * 10**18;    // 0.5 MEER
        dailyPrices[tokenId] = 10 * 10**18;      // 10 MEER
        
        emit AssetMinted(tokenId, msg.sender, contentHash, name, block.timestamp);
        emit RightsBlueprintConfigured(tokenId, msg.sender);
        
        return tokenId;
    }
    
    // ============ 版本控制 ============
    
    /**
     * @dev 更新资产内容
     */
    function updateContent(
        uint256 tokenId,
        string memory newUri,
        bytes32 newContentHash,
        string memory updateReason
    ) 
        public 
        validAsset(tokenId)
        onlyAssetCreator(tokenId)
        validString(newUri, MAX_URI_LENGTH)
        validString(updateReason, 200)
        validContentHash(newContentHash)
    {
        AssetMetadata storage meta = assetMetadata[tokenId];
        
        // 检查新哈希是否已被使用（但不是当前资产）
        uint256 existingToken = contentHashToToken[newContentHash];
        require(existingToken == 0 || existingToken == tokenId, "Content hash already used");
        
        // 更新内容哈希映射
        delete contentHashToToken[meta.contentHash];
        contentHashToToken[newContentHash] = tokenId;
        
        // 更新元数据
        meta.uri = newUri;
        meta.contentHash = newContentHash;
        meta.lastUpdated = block.timestamp;
        
        // 增加版本
        uint256 newVersion = currentVersion[tokenId] + 1;
        currentVersion[tokenId] = newVersion;
        
        versionHistory[tokenId].push(VersionHistory({
            version: newVersion,
            contentHash: newContentHash,
            uri: newUri,
            timestamp: block.timestamp,
            updateReason: updateReason
        }));
        
        emit ContentUpdated(tokenId, newVersion, newContentHash, updateReason, block.timestamp);
    }
    
    // ============ 权利转让 ============
    
    function transferUsageRight(uint256 tokenId, address newOwner) 
        public 
        validAsset(tokenId)
        onlyUsageOwner(tokenId)
    {
        require(newOwner != address(0), "Invalid new owner");
        address oldOwner = rightsBlueprint[tokenId].usage.owner;
        rightsBlueprint[tokenId].usage.owner = newOwner;
        emit RightTransferred(tokenId, "usage", oldOwner, newOwner, block.timestamp);
    }
    
    function transferDerivativeRight(uint256 tokenId, address newOwner) 
        public 
        validAsset(tokenId)
        onlyDerivativeOwner(tokenId)
    {
        require(newOwner != address(0), "Invalid new owner");
        address oldOwner = rightsBlueprint[tokenId].derivative.owner;
        rightsBlueprint[tokenId].derivative.owner = newOwner;
        emit RightTransferred(tokenId, "derivative", oldOwner, newOwner, block.timestamp);
    }
    
    function transferExtensionRight(uint256 tokenId, address newOwner) 
        public 
        validAsset(tokenId)
    {
        require(msg.sender == rightsBlueprint[tokenId].extension.owner, "Not extension owner");
        require(newOwner != address(0), "Invalid new owner");
        address oldOwner = rightsBlueprint[tokenId].extension.owner;
        rightsBlueprint[tokenId].extension.owner = newOwner;
        emit RightTransferred(tokenId, "extension", oldOwner, newOwner, block.timestamp);
    }
    
    function transferRevenueRight(uint256 tokenId, address newOwner) 
        public 
        validAsset(tokenId)
        onlyRevenueOwner(tokenId)
    {
        require(newOwner != address(0), "Invalid new owner");
        address oldOwner = rightsBlueprint[tokenId].revenue.owner;
        rightsBlueprint[tokenId].revenue.owner = newOwner;
        emit RightTransferred(tokenId, "revenue", oldOwner, newOwner, block.timestamp);
    }
    
    // ============ 使用授权 ============
    
    /**
     * @dev 支付使用费获得使用权
     */
    function payForUsage(uint256 tokenId, uint256 durationDays) 
        public 
        payable 
        nonReentrant
        whenNotPaused
        validAsset(tokenId)
    {
        // CHECKS
        require(durationDays > 0, "Duration must be > 0");
        require(durationDays <= 365, "Duration must be <= 365 days");
        
        RightsBlueprint storage blueprint = rightsBlueprint[tokenId];
        uint256 requiredFee = blueprint.usage.fee * durationDays;
        require(requiredFee <= MAX_FEE * 365, "Fee calculation overflow");
        require(msg.value >= requiredFee, "Insufficient fee");
        
        if (blueprint.usage.maxUsers > 0) {
            require(getActiveUserCount(tokenId) < blueprint.usage.maxUsers, "Max users reached");
        }
        
        // EFFECTS
        uint256 duration = durationDays * 1 days;
        if (blueprint.usage.licenseDuration > 0 && duration > blueprint.usage.licenseDuration) {
            duration = blueprint.usage.licenseDuration;
        }
        
        uint256 expiry = block.timestamp + duration;
        
        // 更新授权状态
        UsageAuthorization storage auth = usageAuthorizations[tokenId][msg.sender];
        if (auth.isActive && auth.expiryTime > block.timestamp) {
            // 延长现有授权
            auth.expiryTime += duration;
            auth.paidAmount += msg.value;
        } else {
            // 新授权
            auth.expiryTime = expiry;
            auth.paidAmount = msg.value;
            auth.isActive = true;
        }
        
        // INTERACTIONS (最后转账)
        address revenueOwner = blueprint.revenue.owner;
        require(revenueOwner != address(0), "Revenue owner not set");
        
        (bool success, ) = payable(revenueOwner).call{value: requiredFee}("");
        require(success, "Transfer to revenue owner failed");
        
        // 退还多余金额
        if (msg.value > requiredFee) {
            uint256 refund = msg.value - requiredFee;
            (bool refundSuccess, ) = payable(msg.sender).call{value: refund}("");
            require(refundSuccess, "Refund failed");
        }
        
        emit UsageAuthorized(tokenId, msg.sender, auth.expiryTime, msg.value);
    }
    
    /**
     * @dev 检查用户是否有使用权
     */
    function hasUsageRight(uint256 tokenId, address user) public view returns (bool) {
        if (rightsBlueprint[tokenId].usage.owner == user) {
            return true;
        }
        
        UsageAuthorization memory auth = usageAuthorizations[tokenId][user];
        return auth.isActive && auth.expiryTime > block.timestamp;
    }
    
    function getActiveUserCount(uint256 tokenId) public view returns (uint256) {
        // 简化实现，实际应该遍历所有授权用户
        // TODO: 实现完整的用户计数逻辑
        return 0;
    }
    
    // ============ 衍生作品 ============
    
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
    ) 
        public 
        payable 
        nonReentrant
        whenNotPaused
        validAsset(parentId)
        validString(name, MAX_NAME_LENGTH)
        validString(description, MAX_DESCRIPTION_LENGTH)
        validString(uri, MAX_URI_LENGTH)
        validContentHash(contentHash)
        validRightsBlueprint(blueprint)
        returns (uint256) 
    {
        // CHECKS
        RightsBlueprint storage parentBlueprint = rightsBlueprint[parentId];
        require(parentBlueprint.derivative.allowDerivatives, "Derivatives not allowed");
        
        uint256 fee = parentBlueprint.derivative.fee;
        
        // EFFECTS
        uint256 derivativeId = mintECHO(name, description, assetType, uri, contentHash, blueprint);
        
        derivativeWorks[parentId].push(derivativeId);
        parentAsset[derivativeId] = parentId;
        
        // INTERACTIONS
        if (fee > 0) {
            require(msg.value >= fee, "Insufficient derivative fee");
            
            address parentOwner = parentBlueprint.derivative.owner;
            require(parentOwner != address(0), "Parent owner not set");
            
            (bool success, ) = payable(parentOwner).call{value: fee}("");
            require(success, "Derivative fee transfer failed");
            
            // 退还多余金额
            if (msg.value > fee) {
                uint256 refund = msg.value - fee;
                (bool refundSuccess, ) = payable(msg.sender).call{value: refund}("");
                require(refundSuccess, "Refund failed");
            }
        }
        
        emit DerivativeCreated(parentId, derivativeId, msg.sender, fee);
        
        return derivativeId;
    }
    
    /**
     * @dev 分享衍生作品收益给父资产
     */
    function shareRevenue(uint256 derivativeId) 
        public 
        payable 
        nonReentrant
        validAsset(derivativeId)
    {
        require(msg.value > 0, "Must send revenue");
        require(msg.value <= 10000 ether, "Revenue amount too large");
        
        uint256 parentId = parentAsset[derivativeId];
        require(parentId != 0, "Not a derivative work");
        
        // EFFECTS
        RightsBlueprint storage parentBlueprint = rightsBlueprint[parentId];
        uint256 share = (msg.value * parentBlueprint.derivative.revenueShare) / 10000;
        
        // INTERACTIONS
        if (share > 0) {
            address parentRevenueOwner = parentBlueprint.revenue.owner;
            require(parentRevenueOwner != address(0), "Parent revenue owner not set");
            
            (bool success, ) = payable(parentRevenueOwner).call{value: share}("");
            require(success, "Revenue share transfer failed");
            
            emit RevenueShared(parentId, derivativeId, share);
        }
    }
    
    // ============ 价格管理 ============
    
    function setBasePrice(uint256 tokenId, uint256 price) public validAsset(tokenId) onlyAssetCreator(tokenId) {
        require(price <= MAX_FEE, "Price too high");
        uint256 oldPrice = basePrices[tokenId];
        basePrices[tokenId] = price;
        emit PriceUpdated(tokenId, "base", oldPrice, price);
    }
    
    function setPerUsePrice(uint256 tokenId, uint256 price) public validAsset(tokenId) onlyAssetCreator(tokenId) {
        require(price <= MAX_FEE, "Price too high");
        uint256 oldPrice = perUsePrices[tokenId];
        perUsePrices[tokenId] = price;
        emit PriceUpdated(tokenId, "perUse", oldPrice, price);
    }
    
    function setDailyPrice(uint256 tokenId, uint256 price) public validAsset(tokenId) onlyAssetCreator(tokenId) {
        require(price <= MAX_FEE, "Price too high");
        uint256 oldPrice = dailyPrices[tokenId];
        dailyPrices[tokenId] = price;
        emit PriceUpdated(tokenId, "daily", oldPrice, price);
    }
    
    // ============ 查询函数 ============
    
    function getAssetInfo(uint256 tokenId) public view validAsset(tokenId) returns (
        AssetMetadata memory metadata,
        RightsBlueprint memory blueprint,
        address creator,
        uint256 version
    ) {
        return (
            assetMetadata[tokenId],
            rightsBlueprint[tokenId],
            originalCreator[tokenId],
            currentVersion[tokenId]
        );
    }
    
    function getVersionHistory(uint256 tokenId) public view validAsset(tokenId) returns (VersionHistory[] memory) {
        return versionHistory[tokenId];
    }
    
    function getDerivativeWorks(uint256 tokenId) public view returns (uint256[] memory) {
        return derivativeWorks[tokenId];
    }
    
    function getCurrentTokenId() public view returns (uint256) {
        return _tokenIdCounter.current();
    }
    
    // ============ 紧急功能 ============
    
    function pause() public onlyOwner {
        _pause();
    }
    
    function unpause() public onlyOwner {
        _unpause();
    }
    
    // ============ 接收 ETH ============
    receive() external payable {}
}
