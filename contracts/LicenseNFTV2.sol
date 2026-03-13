// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title LicenseNFT V2
 * @dev ECHO Music 授权 NFT 合约 V2
 * 新增：自定义版税、7天仲裁期、创作者调整倍率
 */
contract LicenseNFTV2 is ERC721, ERC721Enumerable, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    using Strings for uint256;

    Counters.Counter private _licenseIdCounter;
    
    // ECHO 资产合约地址
    address public echoAssetContract;
    
    // 平台手续费（5% = 500）
    uint256 public platformFeeRate = 500;
    uint256 public constant FEE_DENOMINATOR = 10000;
    
    // ========== V2 新增：版税配置 ==========
    // 资产 ID => 版税率 (basis points, 500-1500 = 5%-15%)
    mapping(uint256 => uint256) public assetRoyaltyRates;
    uint256 public constant MIN_ROYALTY = 500;   // 5%
    uint256 public constant MAX_ROYALTY = 1500;  // 15%
    
    // ========== V2 新增：仲裁机制 ==========
    struct Arbitration {
        uint256 freezeTime;       // 冻结时间
        uint256 expiryTime;       // 申诉到期时间 (freezeTime + 7 days)
        address initiator;        // 冻结发起者
        string reason;            // 冻结原因
        bool isAppealed;          // 是否已申诉
        string appealReason;      // 申诉理由
        bool isResolved;          // 是否已解决
    }
    
    // License ID => 仲裁信息
    mapping(uint256 => Arbitration) public arbitrations;
    uint256 public constant ARBITRATION_PERIOD = 7 days;
    
    // 使用场景枚举
    enum UsageType {
        PERSONAL,      // 个人创作 ×1.0
        GAME,          // 游戏配乐 ×1.5
        AI_TRAINING,   // AI训练 ×2.0
        COMMERCIAL,    // 商业广告 ×3.0
        BROADCAST,     // 广播/电视
        STREAMING      // 流媒体
    }
    
    // 授权类型枚举
    enum LicenseType {
        ONE_TIME,      // 买断制
        PER_USE,       // 按次计费
        TIMED          // 限时授权
    }
    
    // License 结构
    struct License {
        uint256 id;                   // License ID
        uint256 parentAssetId;        // 父 ECHO 资产 ID
        address licensee;             // 被授权方
        LicenseType licenseType;      // 授权类型
        UsageType usageType;          // 使用场景
        uint256 validFrom;            // 生效时间
        uint256 validUntil;           // 过期时间（0表示永久）
        uint256 maxUsageCount;        // 最大使用次数（0表示无限）
        uint256 usedCount;            // 已使用次数
        uint256 pricePaid;            // 支付金额
        bool isTransferable;          // 是否可转让
        bool isFrozen;                // 是否被冻结
        bool isRevoked;               // 是否被撤销
    }
    
    // ========== V2 修改：资产级场景倍率 ==========
    // 资产 ID => 场景类型 => 倍率
    mapping(uint256 => mapping(UsageType => uint256)) public assetUsageMultipliers;
    // 默认倍率（初始化用）
    mapping(UsageType => uint256) public defaultMultipliers;
    
    // License ID => License 数据
    mapping(uint256 => License) public licenses;
    
    // 父资产 ID => License ID 列表
    mapping(uint256 => uint256[]) public assetLicenses;
    
    // 用户地址 => License ID 列表
    mapping(address => uint256[]) public userLicenses;
    
    // ========== V2 新增：创作者授权 ==========
    // 资产 ID => 创作者地址（缓存）
    mapping(uint256 => address) public assetCreators;
    
    // 事件
    event LicensePurchased(
        uint256 indexed licenseId,
        uint256 indexed parentAssetId,
        address indexed licensee,
        LicenseType licenseType,
        UsageType usageType,
        uint256 price
    );
    
    event LicenseUsed(
        uint256 indexed licenseId,
        address indexed user,
        uint256 remainingCount
    );
    
    event LicenseFrozen(
        uint256 indexed licenseId,
        address indexed initiator,
        string reason,
        uint256 expiryTime
    );
    
    event LicenseRevoked(
        uint256 indexed licenseId,
        address indexed initiator
    );
    
    // ========== V2 新增事件 ==========
    event RoyaltyRateSet(
        uint256 indexed assetId,
        uint256 royaltyRate,
        address indexed creator
    );
    
    event LicenseAppealed(
        uint256 indexed licenseId,
        address indexed licensee,
        string appealReason
    );
    
    event ArbitrationResolved(
        uint256 indexed licenseId,
        bool isRevoked,
        address indexed resolver
    );
    
    event UsageMultiplierUpdated(
        uint256 indexed assetId,
        UsageType usageType,
        uint256 newMultiplier,
        address indexed creator
    );
    
    event AssetCreatorRegistered(
        uint256 indexed assetId,
        address indexed creator
    );

    constructor(address _echoAssetContract) ERC721("ECHO License", "ECHOL") {
        echoAssetContract = _echoAssetContract;
        
        // 初始化默认场景倍率
        defaultMultipliers[UsageType.PERSONAL] = 100;      // ×1.0
        defaultMultipliers[UsageType.GAME] = 150;          // ×1.5
        defaultMultipliers[UsageType.AI_TRAINING] = 200;   // ×2.0
        defaultMultipliers[UsageType.COMMERCIAL] = 300;    // ×3.0
        defaultMultipliers[UsageType.BROADCAST] = 250;     // ×2.5
        defaultMultipliers[UsageType.STREAMING] = 120;     // ×1.2
    }
    
    // ========== V2 新增：版税管理 ==========
    
    /**
     * @dev 设置资产版税率（仅创作者）
     * @param _assetId 资产 ID
     * @param _royaltyRate 版税率 (500-1500 = 5%-15%)
     */
    function setAssetRoyaltyRate(uint256 _assetId, uint256 _royaltyRate) public {
        require(_royaltyRate >= MIN_ROYALTY && _royaltyRate <= MAX_ROYALTY, 
                "Royalty must be 5%-15%");
        require(isAssetCreator(_assetId, msg.sender), "Not asset creator");
        
        assetRoyaltyRates[_assetId] = _royaltyRate;
        
        emit RoyaltyRateSet(_assetId, _royaltyRate, msg.sender);
    }
    
    /**
     * @dev 获取资产版税率（未设置则返回默认值 10%）
     */
    function getAssetRoyaltyRate(uint256 _assetId) public view returns (uint256) {
        uint256 rate = assetRoyaltyRates[_assetId];
        return rate > 0 ? rate : 1000; // 默认 10%
    }
    
    // ========== V2 新增：创作者注册 ==========
    
    /**
     * @dev 注册资产创作者（在 ECHOAssetV2 中调用）
     */
    function registerAssetCreator(uint256 _assetId, address _creator) public {
        // 简化版：允许任何人注册（实际应该限制为 ECHOAssetV2 合约调用）
        require(assetCreators[_assetId] == address(0), "Creator already registered");
        assetCreators[_assetId] = _creator;
        
        // 初始化该资产的场景倍率为默认值
        for (uint i = 0; i <= 5; i++) {
            assetUsageMultipliers[_assetId][UsageType(i)] = defaultMultipliers[UsageType(i)];
        }
        
        emit AssetCreatorRegistered(_assetId, _creator);
    }
    
    // ========== V2 新增：动态定价 ==========
    
    /**
     * @dev 创作者调整场景倍率
     * @param _assetId 资产 ID
     * @param _usageType 使用场景
     * @param _multiplier 新倍率 (100-500 = 1x-5x)
     */
    function updateUsageMultiplier(
        uint256 _assetId,
        UsageType _usageType,
        uint256 _multiplier
    ) public {
        require(_multiplier >= 100 && _multiplier <= 500, "Multiplier must be 1x-5x");
        require(isAssetCreator(_assetId, msg.sender), "Not asset creator");
        
        assetUsageMultipliers[_assetId][_usageType] = _multiplier;
        
        emit UsageMultiplierUpdated(_assetId, _usageType, _multiplier, msg.sender);
    }
    
    /**
     * @dev 获取场景倍率（资产级优先，未设置用默认）
     */
    function getUsageMultiplier(uint256 _assetId, UsageType _usageType) public view returns (uint256) {
        uint256 multiplier = assetUsageMultipliers[_assetId][_usageType];
        return multiplier > 0 ? multiplier : defaultMultipliers[_usageType];
    }
    
    // ========== 购买函数（使用资产级倍率） ==========
    
    function purchaseOneTime(
        uint256 _parentAssetId,
        UsageType _usageType
    ) public payable nonReentrant returns (uint256) {
        uint256 basePrice = getAssetBasePrice(_parentAssetId);
        require(basePrice > 0, "Asset not found");
        
        // 使用资产级场景倍率
        uint256 adjustedPrice = (basePrice * getUsageMultiplier(_parentAssetId, _usageType)) / 100;
        uint256 totalPrice = adjustedPrice + (adjustedPrice * platformFeeRate / FEE_DENOMINATOR);
        
        require(msg.value >= totalPrice, "Insufficient payment");
        
        uint256 licenseId = _createLicense(
            _parentAssetId,
            LicenseType.ONE_TIME,
            _usageType,
            0,
            0,
            totalPrice
        );
        
        _distributeRevenue(_parentAssetId, adjustedPrice);
        
        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }
        
        emit LicensePurchased(licenseId, _parentAssetId, msg.sender, LicenseType.ONE_TIME, _usageType, totalPrice);
        
        return licenseId;
    }
    
    function purchasePerUse(
        uint256 _parentAssetId,
        UsageType _usageType,
        uint256 _usageCount
    ) public payable nonReentrant returns (uint256) {
        require(_usageCount > 0, "Usage count must be > 0");
        
        uint256 perUsePrice = getAssetPerUsePrice(_parentAssetId);
        require(perUsePrice > 0, "Per-use pricing not enabled");
        
        uint256 basePrice = perUsePrice * _usageCount;
        uint256 adjustedPrice = (basePrice * getUsageMultiplier(_parentAssetId, _usageType)) / 100;
        uint256 totalPrice = adjustedPrice + (adjustedPrice * platformFeeRate / FEE_DENOMINATOR);
        
        require(msg.value >= totalPrice, "Insufficient payment");
        
        uint256 licenseId = _createLicense(
            _parentAssetId,
            LicenseType.PER_USE,
            _usageType,
            0,
            _usageCount,
            totalPrice
        );
        
        _distributeRevenue(_parentAssetId, adjustedPrice);
        
        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }
        
        emit LicensePurchased(licenseId, _parentAssetId, msg.sender, LicenseType.PER_USE, _usageType, totalPrice);
        
        return licenseId;
    }
    
    function purchaseTimed(
        uint256 _parentAssetId,
        UsageType _usageType,
        uint256 _days
    ) public payable nonReentrant returns (uint256) {
        require(_days >= 30, "Minimum 30 days");
        
        uint256 dailyPrice = getAssetDailyPrice(_parentAssetId);
        require(dailyPrice > 0, "Timed pricing not enabled");
        
        uint256 basePrice = dailyPrice * _days;
        uint256 adjustedPrice = (basePrice * getUsageMultiplier(_parentAssetId, _usageType)) / 100;
        uint256 totalPrice = adjustedPrice + (adjustedPrice * platformFeeRate / FEE_DENOMINATOR);
        
        require(msg.value >= totalPrice, "Insufficient payment");
        
        uint256 validUntil = block.timestamp + (_days * 1 days);
        
        uint256 licenseId = _createLicense(
            _parentAssetId,
            LicenseType.TIMED,
            _usageType,
            validUntil,
            0,
            totalPrice
        );
        
        _distributeRevenue(_parentAssetId, adjustedPrice);
        
        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }
        
        emit LicensePurchased(licenseId, _parentAssetId, msg.sender, LicenseType.TIMED, _usageType, totalPrice);
        
        return licenseId;
    }
    
    // ========== V2 修改：熔断 + 7天仲裁 ==========
    
    /**
     * @dev 冻结 License（启动 7天仲裁期）
     */
    function freezeLicense(uint256 _licenseId, string memory _reason) public {
        require(_exists(_licenseId), "License does not exist");
        require(!licenses[_licenseId].isFrozen, "Already frozen");
        
        License storage license = licenses[_licenseId];
        require(
            isAssetCreator(license.parentAssetId, msg.sender) || msg.sender == owner(),
            "Not authorized"
        );
        
        license.isFrozen = true;
        
        // V2: 启动仲裁期
        uint256 freezeTime = block.timestamp;
        uint256 expiryTime = freezeTime + ARBITRATION_PERIOD;
        
        arbitrations[_licenseId] = Arbitration({
            freezeTime: freezeTime,
            expiryTime: expiryTime,
            initiator: msg.sender,
            reason: _reason,
            isAppealed: false,
            appealReason: "",
            isResolved: false
        });
        
        emit LicenseFrozen(_licenseId, msg.sender, _reason, expiryTime);
    }
    
    /**
     * @dev V2 新增：申诉
     */
    function appealLicense(uint256 _licenseId, string memory _appealReason) public {
        require(_exists(_licenseId), "License does not exist");
        require(licenses[_licenseId].isFrozen, "License not frozen");
        require(ownerOf(_licenseId) == msg.sender, "Not license owner");
        
        Arbitration storage arb = arbitrations[_licenseId];
        require(!arb.isAppealed, "Already appealed");
        require(block.timestamp < arb.expiryTime, "Arbitration period expired");
        
        arb.isAppealed = true;
        arb.appealReason = _appealReason;
        
        emit LicenseAppealed(_licenseId, msg.sender, _appealReason);
    }
    
    /**
     * @dev V2 修改：撤销（7天后可执行）
     */
    function revokeLicense(uint256 _licenseId) public {
        require(_exists(_licenseId), "License does not exist");
        
        License storage license = licenses[_licenseId];
        Arbitration storage arb = arbitrations[_licenseId];
        
        // 检查权限
        bool isCreator = isAssetCreator(license.parentAssetId, msg.sender);
        bool isPlatform = msg.sender == owner();
        
        require(isCreator || isPlatform, "Not authorized");
        
        // 如果有申诉，必须等7天才能执行
        if (arb.isAppealed) {
            require(block.timestamp >= arb.expiryTime, "Wait for arbitration period");
        }
        
        license.isRevoked = true;
        arb.isResolved = true;
        
        // 退还逻辑（同 V1）
        if (license.licenseType == LicenseType.PER_USE && license.usedCount < license.maxUsageCount) {
            uint256 remaining = license.pricePaid * (license.maxUsageCount - license.usedCount) / license.maxUsageCount;
            payable(ownerOf(_licenseId)).transfer(remaining);
        }
        
        emit LicenseRevoked(_licenseId, msg.sender);
        emit ArbitrationResolved(_licenseId, true, msg.sender);
    }
    
    /**
     * @dev V2 新增：提前解冻（双方和解）
     */
    function unfreezeLicense(uint256 _licenseId) public {
        require(_exists(_licenseId), "License does not exist");
        
        License storage license = licenses[_licenseId];
        Arbitration storage arb = arbitrations[_licenseId];
        
        // 创作者或持有者可以解冻
        bool isCreator = isAssetCreator(license.parentAssetId, msg.sender);
        bool isHolder = ownerOf(_licenseId) == msg.sender;
        
        require(isCreator || isHolder, "Not authorized");
        
        license.isFrozen = false;
        arb.isResolved = true;
        
        emit ArbitrationResolved(_licenseId, false, msg.sender);
    }
    
    // ========== 验证和其他函数 ==========
    
    function verifyLicense(uint256 _licenseId, address _user, UsageType _usageType) public view returns (bool) {
        License storage license = licenses[_licenseId];
        
        require(_exists(_licenseId), "License does not exist");
        require(ownerOf(_licenseId) == _user, "Not license owner");
        require(!license.isFrozen, "License is frozen");
        require(!license.isRevoked, "License is revoked");
        require(block.timestamp >= license.validFrom, "License not yet active");
        
        if (license.validUntil > 0) {
            require(block.timestamp <= license.validUntil, "License expired");
        }
        
        if (license.maxUsageCount > 0) {
            require(license.usedCount < license.maxUsageCount, "Usage limit reached");
        }
        
        require(license.usageType == _usageType, "Usage type mismatch");
        
        return true;
    }
    
    function recordUsage(uint256 _licenseId, address _user) public returns (bool) {
        License storage license = licenses[_licenseId];
        verifyLicense(_licenseId, _user, license.usageType);
        
        license.usedCount++;
        
        emit LicenseUsed(_licenseId, _user, license.maxUsageCount - license.usedCount);
        
        return true;
    }
    
    // ========== 内部函数 ==========
    
    function _createLicense(
        uint256 _parentAssetId,
        LicenseType _licenseType,
        UsageType _usageType,
        uint256 _validUntil,
        uint256 _maxUsageCount,
        uint256 _pricePaid
    ) internal returns (uint256) {
        _licenseIdCounter.increment();
        uint256 licenseId = _licenseIdCounter.current();
        
        License memory newLicense = License({
            id: licenseId,
            parentAssetId: _parentAssetId,
            licensee: msg.sender,
            licenseType: _licenseType,
            usageType: _usageType,
            validFrom: block.timestamp,
            validUntil: _validUntil,
            maxUsageCount: _maxUsageCount,
            usedCount: 0,
            pricePaid: _pricePaid,
            isTransferable: true,
            isFrozen: false,
            isRevoked: false
        });
        
        licenses[licenseId] = newLicense;
        
        _safeMint(msg.sender, licenseId);
        
        assetLicenses[_parentAssetId].push(licenseId);
        userLicenses[msg.sender].push(licenseId);
        
        return licenseId;
    }
    
    function _distributeRevenue(uint256 _assetId, uint256 _amount) internal {
        uint256 platformFee = (_amount * platformFeeRate) / FEE_DENOMINATOR;
        
        // V2: 使用资产级版税率
        uint256 royaltyRate = getAssetRoyaltyRate(_assetId);
        uint256 royaltyAmount = (_amount * royaltyRate) / FEE_DENOMINATOR;
        
        uint256 creatorShare = _amount - platformFee - royaltyAmount;
        
        // 发送平台费
        payable(owner()).transfer(platformFee);
        
        // 发送版税（给原作者）
        address creator = getAssetCreator(_assetId);
        if (royaltyAmount > 0 && creator != address(0)) {
            payable(creator).transfer(royaltyAmount);
        }
        
        // 发送创作者收益
        if (creatorShare > 0 && creator != address(0)) {
            payable(creator).transfer(creatorShare);
        }
    }
    
    // ========== 查询函数 ==========
    
    function isAssetCreator(uint256 _assetId, address _user) public view returns (bool) {
        // V2: 优先检查注册的创作者
        address registeredCreator = assetCreators[_assetId];
        if (registeredCreator != address(0)) {
            return registeredCreator == _user;
        }
        // 回退到默认检查
        return getAssetCreator(_assetId) == _user;
    }
    
    function getAssetBasePrice(uint256 _assetId) internal view returns (uint256) {
        return 100 * 10**18;  // 100 MEER 占位符
    }
    
    function getAssetPerUsePrice(uint256 _assetId) internal view returns (uint256) {
        return 0.5 * 10**18;  // 0.5 MEER 占位符
    }
    
    function getAssetDailyPrice(uint256 _assetId) internal view returns (uint256) {
        return 10 * 10**18;  // 10 MEER 占位符
    }
    
    function getAssetCreator(uint256 _assetId) internal view returns (address) {
        // 优先返回注册的创作者
        if (assetCreators[_assetId] != address(0)) {
            return assetCreators[_assetId];
        }
        return address(this);  // 占位符
    }
    
    // ========== 管理函数 ==========
    
    function setPlatformFeeRate(uint256 _newRate) public onlyOwner {
        require(_newRate <= 1000, "Fee rate cannot exceed 10%");
        platformFeeRate = _newRate;
    }
    
    function setEchoAssetContract(address _contract) public onlyOwner {
        echoAssetContract = _contract;
    }
    
    // ========== 必需的覆盖函数 ==========
    
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        
        if (from != address(0) && to != address(0)) {
            licenses[tokenId].licensee = to;
        }
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    receive() external payable {}
}
