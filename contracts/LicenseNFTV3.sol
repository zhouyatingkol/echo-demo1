// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

/**
 * @title LicenseNFT V3 - Security Hardened
 * @dev ECHO Music 授权 NFT 合约 - 安全修复版
 * 
 * 安全改进:
 * - ReentrancyGuard 防重入攻击
 * - Pausable 紧急暂停功能
 * - Checks-Effects-Interactions 模式
 * - 字符串长度限制
 * - 完整事件日志
 * - 访问控制增强
 * 
 * Author: OpenClaw for Qitmeer Network
 * Version: 3.0.0
 */
contract LicenseNFTV3 is ERC721, ERC721Enumerable, Ownable, ReentrancyGuard, Pausable {
    using Counters for Counters.Counter;
    using Strings for uint256;

    // ============ 常量 ============
    uint256 public constant FEE_DENOMINATOR = 10000;
    uint256 public constant MAX_PLATFORM_FEE = 1000;      // 10% 上限
    uint256 public constant MAX_MULTIPLIER = 500;         // 5x 上限
    uint256 public constant MIN_MULTIPLIER = 100;         // 1x 下限
    uint256 public constant REFUND_DENOMINATOR = 10000;   // 退款计算精度
    
    // 字符串长度限制
    uint256 public constant MAX_REASON_LENGTH = 200;      // 冻结原因最大长度
    
    // ============ 状态变量 ============
    Counters.Counter private _licenseIdCounter;
    
    address public echoAssetContract;
    uint256 public platformFeeRate = 500;                 // 默认 5%
    
    // 使用场景枚举
    enum UsageType {
        PERSONAL,      // 个人创作 ×1.0
        GAME,          // 游戏配乐 ×1.5
        AI_TRAINING,   // AI训练 ×2.0
        COMMERCIAL,    // 商业广告 ×3.0
        BROADCAST,     // 广播/电视 ×2.5
        STREAMING      // 流媒体 ×1.2
    }
    
    // 授权类型枚举
    enum LicenseType {
        ONE_TIME,      // 买断制
        PER_USE,       // 按次计费
        TIMED          // 限时授权
    }
    
    // License 结构
    struct License {
        uint256 id;
        uint256 parentAssetId;
        address licensee;
        LicenseType licenseType;
        UsageType usageType;
        uint256 validFrom;
        uint256 validUntil;           // 0 = 永久
        uint256 maxUsageCount;        // 0 = 无限
        uint256 usedCount;
        uint256 pricePaid;
        bool isTransferable;
        bool isFrozen;
        bool isRevoked;
    }
    
    // 场景倍率
    mapping(UsageType => uint256) public usageMultipliers;
    
    // License 数据
    mapping(uint256 => License) public licenses;
    mapping(uint256 => uint256[]) public assetLicenses;
    mapping(address => uint256[]) public userLicenses;
    
    // ============ 事件 ============
    event LicensePurchased(
        uint256 indexed licenseId,
        uint256 indexed parentAssetId,
        address indexed licensee,
        LicenseType licenseType,
        UsageType usageType,
        uint256 price,
        uint256 timestamp
    );
    
    event LicenseUsed(
        uint256 indexed licenseId,
        address indexed user,
        uint256 usedCount,
        uint256 remainingCount
    );
    
    event LicenseFrozen(
        uint256 indexed licenseId,
        address indexed initiator,
        string reason,
        uint256 timestamp
    );
    
    event LicenseRevoked(
        uint256 indexed licenseId,
        address indexed initiator,
        uint256 refundAmount,
        uint256 timestamp
    );
    
    event LicenseUnfrozen(
        uint256 indexed licenseId,
        address indexed initiator
    );
    
    event PlatformFeeRateUpdated(
        uint256 oldRate,
        uint256 newRate,
        address indexed updater
    );
    
    event UsageMultiplierUpdated(
        UsageType indexed usageType,
        uint256 oldMultiplier,
        uint256 newMultiplier
    );
    
    event EchoAssetContractUpdated(
        address oldContract,
        address newContract
    );
    
    event RevenueDistributed(
        uint256 indexed licenseId,
        address indexed creator,
        uint256 creatorShare,
        uint256 platformShare
    );
    
    // ============ 修饰符 ============
    modifier validAsset(uint256 _assetId) {
        require(_assetId > 0, "Invalid asset ID");
        _;
    }
    
    modifier validString(string memory str, uint256 maxLength) {
        require(bytes(str).length <= maxLength, "String too long");
        _;
    }
    
    modifier validLicense(uint256 _licenseId) {
        require(_exists(_licenseId), "License does not exist");
        _;
    }
    
    modifier onlyAssetCreator(uint256 _assetId) {
        require(isAssetCreator(_assetId, msg.sender), "Not asset creator");
        _;
    }
    
    modifier notFrozen(uint256 _licenseId) {
        require(!licenses[_licenseId].isFrozen, "License is frozen");
        _;
    }
    
    modifier notRevoked(uint256 _licenseId) {
        require(!licenses[_licenseId].isRevoked, "License is revoked");
        _;
    }
    
    // ============ 构造函数 ============
    constructor(address _echoAssetContract) ERC721("ECHO License", "ECHOL") {
        require(_echoAssetContract != address(0), "Invalid contract address");
        echoAssetContract = _echoAssetContract;
        
        // 初始化场景倍率
        usageMultipliers[UsageType.PERSONAL] = 100;
        usageMultipliers[UsageType.GAME] = 150;
        usageMultipliers[UsageType.AI_TRAINING] = 200;
        usageMultipliers[UsageType.COMMERCIAL] = 300;
        usageMultipliers[UsageType.BROADCAST] = 250;
        usageMultipliers[UsageType.STREAMING] = 120;
    }
    
    // ============ 购买函数 ============
    
    /**
     * @dev 购买买断制授权
     * @param _parentAssetId 父 ECHO 资产 ID
     * @param _usageType 使用场景
     */
    function purchaseOneTime(
        uint256 _parentAssetId,
        UsageType _usageType
    ) 
        public 
        payable 
        nonReentrant 
        whenNotPaused
        validAsset(_parentAssetId)
        returns (uint256) 
    {
        // 1. CHECKS
        uint256 basePrice = getAssetBasePrice(_parentAssetId);
        require(basePrice > 0, "Asset price not set");
        
        uint256 adjustedPrice = (basePrice * usageMultipliers[_usageType]) / 100;
        uint256 platformFee = (adjustedPrice * platformFeeRate) / FEE_DENOMINATOR;
        uint256 totalPrice = adjustedPrice + platformFee;
        
        require(msg.value >= totalPrice, "Insufficient payment");
        
        // 2. EFFECTS
        uint256 licenseId = _createLicense(
            _parentAssetId,
            LicenseType.ONE_TIME,
            _usageType,
            0,
            0,
            totalPrice
        );
        
        // 3. INTERACTIONS (转账)
        _distributeRevenue(_parentAssetId, adjustedPrice, platformFee);
        
        // 退还多余金额
        if (msg.value > totalPrice) {
            uint256 refund = msg.value - totalPrice;
            (bool success, ) = payable(msg.sender).call{value: refund}("");
            require(success, "Refund failed");
        }
        
        emit LicensePurchased(
            licenseId,
            _parentAssetId,
            msg.sender,
            LicenseType.ONE_TIME,
            _usageType,
            totalPrice,
            block.timestamp
        );
        
        return licenseId;
    }
    
    /**
     * @dev 购买按次计费授权
     */
    function purchasePerUse(
        uint256 _parentAssetId,
        UsageType _usageType,
        uint256 _usageCount
    ) 
        public 
        payable 
        nonReentrant 
        whenNotPaused
        validAsset(_parentAssetId)
        returns (uint256) 
    {
        // CHECKS
        require(_usageCount > 0, "Usage count must be > 0");
        require(_usageCount <= 1000000, "Usage count too large"); // 上限保护
        
        uint256 perUsePrice = getAssetPerUsePrice(_parentAssetId);
        require(perUsePrice > 0, "Per-use pricing not enabled");
        
        uint256 basePrice = perUsePrice * _usageCount;
        uint256 adjustedPrice = (basePrice * usageMultipliers[_usageType]) / 100;
        uint256 platformFee = (adjustedPrice * platformFeeRate) / FEE_DENOMINATOR;
        uint256 totalPrice = adjustedPrice + platformFee;
        
        require(msg.value >= totalPrice, "Insufficient payment");
        
        // EFFECTS
        uint256 licenseId = _createLicense(
            _parentAssetId,
            LicenseType.PER_USE,
            _usageType,
            0,
            _usageCount,
            totalPrice
        );
        
        // INTERACTIONS
        _distributeRevenue(_parentAssetId, adjustedPrice, platformFee);
        
        if (msg.value > totalPrice) {
            uint256 refund = msg.value - totalPrice;
            (bool success, ) = payable(msg.sender).call{value: refund}("");
            require(success, "Refund failed");
        }
        
        emit LicensePurchased(
            licenseId,
            _parentAssetId,
            msg.sender,
            LicenseType.PER_USE,
            _usageType,
            totalPrice,
            block.timestamp
        );
        
        return licenseId;
    }
    
    /**
     * @dev 购买限时授权
     */
    function purchaseTimed(
        uint256 _parentAssetId,
        UsageType _usageType,
        uint256 _days
    ) 
        public 
        payable 
        nonReentrant 
        whenNotPaused
        validAsset(_parentAssetId)
        returns (uint256) 
    {
        // CHECKS
        require(_days >= 30, "Minimum 30 days");
        require(_days <= 3650, "Maximum 10 years"); // 上限保护
        
        uint256 dailyPrice = getAssetDailyPrice(_parentAssetId);
        require(dailyPrice > 0, "Timed pricing not enabled");
        
        uint256 basePrice = dailyPrice * _days;
        uint256 adjustedPrice = (basePrice * usageMultipliers[_usageType]) / 100;
        uint256 platformFee = (adjustedPrice * platformFeeRate) / FEE_DENOMINATOR;
        uint256 totalPrice = adjustedPrice + platformFee;
        
        require(msg.value >= totalPrice, "Insufficient payment");
        
        uint256 validUntil = block.timestamp + (_days * 1 days);
        
        // EFFECTS
        uint256 licenseId = _createLicense(
            _parentAssetId,
            LicenseType.TIMED,
            _usageType,
            validUntil,
            0,
            totalPrice
        );
        
        // INTERACTIONS
        _distributeRevenue(_parentAssetId, adjustedPrice, platformFee);
        
        if (msg.value > totalPrice) {
            uint256 refund = msg.value - totalPrice;
            (bool success, ) = payable(msg.sender).call{value: refund}("");
            require(success, "Refund failed");
        }
        
        emit LicensePurchased(
            licenseId,
            _parentAssetId,
            msg.sender,
            LicenseType.TIMED,
            _usageType,
            totalPrice,
            block.timestamp
        );
        
        return licenseId;
    }
    
    // ============ 验证和记录 ============
    
    /**
     * @dev 验证 License 有效性
     */
    function verifyLicense(
        uint256 _licenseId,
        address _user,
        UsageType _usageType
    ) 
        public 
        view 
        validLicense(_licenseId)
        returns (bool) 
    {
        License storage license = licenses[_licenseId];
        
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
    
    /**
     * @dev 记录 License 使用
     */
    function recordUsage(
        uint256 _licenseId, 
        address _user
    ) 
        public 
        validLicense(_licenseId)
        notFrozen(_licenseId)
        notRevoked(_licenseId)
        returns (bool) 
    {
        License storage license = licenses[_licenseId];
        
        // 验证 License
        require(verifyLicense(_licenseId, _user, license.usageType), "License verification failed");
        
        // 修改状态
        license.usedCount++;
        
        uint256 remaining = license.maxUsageCount > 0 
            ? license.maxUsageCount - license.usedCount 
            : type(uint256).max;
        
        emit LicenseUsed(_licenseId, _user, license.usedCount, remaining);
        
        return true;
    }
    
    // ============ 管理函数 ============
    
    /**
     * @dev 冻结 License
     */
    function freezeLicense(
        uint256 _licenseId,
        string memory _reason
    ) 
        public 
        validLicense(_licenseId)
        validString(_reason, MAX_REASON_LENGTH)
        notRevoked(_licenseId)
    {
        License storage license = licenses[_licenseId];
        
        require(
            isAssetCreator(license.parentAssetId, msg.sender) || msg.sender == owner(),
            "Not authorized"
        );
        
        license.isFrozen = true;
        
        emit LicenseFrozen(_licenseId, msg.sender, _reason, block.timestamp);
    }
    
    /**
     * @dev 解冻 License
     */
    function unfreezeLicense(uint256 _licenseId) 
        public 
        validLicense(_licenseId)
    {
        License storage license = licenses[_licenseId];
        
        require(
            isAssetCreator(license.parentAssetId, msg.sender) || msg.sender == owner(),
            "Not authorized"
        );
        
        license.isFrozen = false;
        
        emit LicenseUnfrozen(_licenseId, msg.sender);
    }
    
    /**
     * @dev 撤销 License
     */
    function revokeLicense(uint256 _licenseId) 
        public 
        nonReentrant
        validLicense(_licenseId)
    {
        License storage license = licenses[_licenseId];
        
        require(
            isAssetCreator(license.parentAssetId, msg.sender) || msg.sender == owner(),
            "Not authorized"
        );
        
        // 先标记为撤销（Effects）
        license.isRevoked = true;
        
        // 计算退款（Interactions - 最后）
        uint256 refundAmount = 0;
        if (license.licenseType == LicenseType.PER_USE && license.usedCount < license.maxUsageCount) {
            refundAmount = license.pricePaid * (license.maxUsageCount - license.usedCount) / license.maxUsageCount;
            
            if (refundAmount > 0) {
                (bool success, ) = payable(ownerOf(_licenseId)).call{value: refundAmount}("");
                require(success, "Refund failed");
            }
        }
        
        emit LicenseRevoked(_licenseId, msg.sender, refundAmount, block.timestamp);
    }
    
    // ============ 紧急功能 ============
    
    /**
     * @dev 紧急暂停
     */
    function pause() public onlyOwner {
        _pause();
    }
    
    /**
     * @dev 解除暂停
     */
    function unpause() public onlyOwner {
        _unpause();
    }
    
    // ============ 内部函数 ============
    
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
    
    function _distributeRevenue(
        uint256 _assetId, 
        uint256 _creatorShare,
        uint256 _platformFee
    ) internal {
        address creator = getAssetCreator(_assetId);
        require(creator != address(0), "Creator not found");
        
        // 平台费
        if (_platformFee > 0) {
            (bool success, ) = payable(owner()).call{value: _platformFee}("");
            require(success, "Platform fee transfer failed");
        }
        
        // 创作者收益
        if (_creatorShare > 0) {
            (bool success, ) = payable(creator).call{value: _creatorShare}("");
            require(success, "Creator payment failed");
        }
        
        emit RevenueDistributed(
            _assetId,
            creator,
            _creatorShare,
            _platformFee
        );
    }
    
    // ============ 查询函数 ============
    
    function isAssetCreator(uint256 _assetId, address _user) public view returns (bool) {
        return getAssetCreator(_assetId) == _user;
    }
    
    // TODO: 实现实际的价格查询逻辑
    function getAssetBasePrice(uint256 _assetId) public view returns (uint256) {
        // 调用 ECHOAssetV2 获取价格
        (bool success, bytes memory data) = echoAssetContract.staticcall(
            abi.encodeWithSignature("getBasePrice(uint256)", _assetId)
        );
        if (success && data.length >= 32) {
            return abi.decode(data, (uint256));
        }
        return 100 * 10**18; // 默认 100 MEER
    }
    
    function getAssetPerUsePrice(uint256 _assetId) public view returns (uint256) {
        (bool success, bytes memory data) = echoAssetContract.staticcall(
            abi.encodeWithSignature("getPerUsePrice(uint256)", _assetId)
        );
        if (success && data.length >= 32) {
            return abi.decode(data, (uint256));
        }
        return 0.5 * 10**18; // 默认 0.5 MEER
    }
    
    function getAssetDailyPrice(uint256 _assetId) public view returns (uint256) {
        (bool success, bytes memory data) = echoAssetContract.staticcall(
            abi.encodeWithSignature("getDailyPrice(uint256)", _assetId)
        );
        if (success && data.length >= 32) {
            return abi.decode(data, (uint256));
        }
        return 10 * 10**18; // 默认 10 MEER
    }
    
    function getAssetCreator(uint256 _assetId) public view returns (address) {
        (bool success, bytes memory data) = echoAssetContract.staticcall(
            abi.encodeWithSignature("originalCreator(uint256)", _assetId)
        );
        if (success && data.length >= 32) {
            return abi.decode(data, (address));
        }
        return address(this);
    }
    
    // ============ 管理函数 ============
    
    function setPlatformFeeRate(uint256 _newRate) public onlyOwner {
        require(_newRate <= MAX_PLATFORM_FEE, "Fee rate cannot exceed 10%");
        
        uint256 oldRate = platformFeeRate;
        platformFeeRate = _newRate;
        
        emit PlatformFeeRateUpdated(oldRate, _newRate, msg.sender);
    }
    
    function setUsageMultiplier(UsageType _type, uint256 _multiplier) public onlyOwner {
        require(_multiplier >= MIN_MULTIPLIER && _multiplier <= MAX_MULTIPLIER, "Multiplier must be 1x-5x");
        
        uint256 oldMultiplier = usageMultipliers[_type];
        usageMultipliers[_type] = _multiplier;
        
        emit UsageMultiplierUpdated(_type, oldMultiplier, _multiplier);
    }
    
    function setEchoAssetContract(address _contract) public onlyOwner {
        require(_contract != address(0), "Invalid address");
        require(_contract != echoAssetContract, "Same address");
        
        address oldContract = echoAssetContract;
        echoAssetContract = _contract;
        
        emit EchoAssetContractUpdated(oldContract, _contract);
    }
    
    // ============ 必需的覆盖函数 ============
    
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) whenNotPaused {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        
        if (from != address(0) && to != address(0)) {
            licenses[tokenId].licensee = to;
            userLicenses[to].push(tokenId);
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
    
    // 接收 ETH
    receive() external payable {}
}
