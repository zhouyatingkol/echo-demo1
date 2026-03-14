// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title LicenseNFT
 * @dev ECHO Music 授权 NFT 合约
 * 支持三种授权模式：买断制、按次计费、限时授权
 */
contract LicenseNFT is ERC721, ERC721Enumerable, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;
    using Strings for uint256;

    Counters.Counter private _licenseIdCounter;
    
    // ECHO 资产合约地址
    address public echoAssetContract;
    
    // 平台手续费（5% = 500）
    uint256 public platformFeeRate = 500;
    uint256 public constant FEE_DENOMINATOR = 10000;
    
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
    
    // 场景倍率（以 100 为基准）
    mapping(UsageType => uint256) public usageMultipliers;
    
    // License ID => License 数据
    mapping(uint256 => License) public licenses;
    
    // 父资产 ID => License ID 列表
    mapping(uint256 => uint256[]) public assetLicenses;
    
    // 用户地址 => License ID 列表
    mapping(address => uint256[]) public userLicenses;
    
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
        string reason
    );
    
    event LicenseRevoked(
        uint256 indexed licenseId,
        address indexed initiator
    );
    
    constructor(address _echoAssetContract) ERC721("ECHO License", "ECHOL") {
        echoAssetContract = _echoAssetContract;
        
        // 初始化场景倍率
        usageMultipliers[UsageType.PERSONAL] = 100;      // ×1.0
        usageMultipliers[UsageType.GAME] = 150;          // ×1.5
        usageMultipliers[UsageType.AI_TRAINING] = 200;   // ×2.0
        usageMultipliers[UsageType.COMMERCIAL] = 300;    // ×3.0
        usageMultipliers[UsageType.BROADCAST] = 250;     // ×2.5
        usageMultipliers[UsageType.STREAMING] = 120;     // ×1.2
    }
    
    /**
     * @dev 购买买断制授权
     * @param _parentAssetId 父 ECHO 资产 ID
     * @param _usageType 使用场景
     */
    function purchaseOneTime(
        uint256 _parentAssetId,
        UsageType _usageType
    ) public payable nonReentrant returns (uint256) {
        // 获取资产基础价格（从 ECHOAsset 合约读取）
        uint256 basePrice = getAssetBasePrice(_parentAssetId);
        require(basePrice > 0, "Asset not found");
        
        // 计算实际价格（含场景倍率）
        uint256 adjustedPrice = (basePrice * usageMultipliers[_usageType]) / 100;
        uint256 totalPrice = adjustedPrice + (adjustedPrice * platformFeeRate / FEE_DENOMINATOR);
        
        require(msg.value >= totalPrice, "Insufficient payment");
        
        // 创建 License
        uint256 licenseId = _createLicense(
            _parentAssetId,
            LicenseType.ONE_TIME,
            _usageType,
            0,  // 永久有效
            0,  // 无限次数
            totalPrice
        );
        
        // 分配收益
        _distributeRevenue(_parentAssetId, adjustedPrice);
        
        // 退还多余金额
        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }
        
        emit LicensePurchased(licenseId, _parentAssetId, msg.sender, LicenseType.ONE_TIME, _usageType, totalPrice);
        
        return licenseId;
    }
    
    /**
     * @dev 购买按次计费授权
     * @param _parentAssetId 父 ECHO 资产 ID
     * @param _usageType 使用场景
     * @param _usageCount 购买次数
     */
    function purchasePerUse(
        uint256 _parentAssetId,
        UsageType _usageType,
        uint256 _usageCount
    ) public payable nonReentrant returns (uint256) {
        require(_usageCount > 0, "Usage count must be > 0");
        
        uint256 perUsePrice = getAssetPerUsePrice(_parentAssetId);
        require(perUsePrice > 0, "Per-use pricing not enabled");
        
        // 计算价格
        uint256 basePrice = perUsePrice * _usageCount;
        uint256 adjustedPrice = (basePrice * usageMultipliers[_usageType]) / 100;
        uint256 totalPrice = adjustedPrice + (adjustedPrice * platformFeeRate / FEE_DENOMINATOR);
        
        require(msg.value >= totalPrice, "Insufficient payment");
        
        // 创建 License
        uint256 licenseId = _createLicense(
            _parentAssetId,
            LicenseType.PER_USE,
            _usageType,
            0,  // 无时间限制
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
    
    /**
     * @dev 购买限时授权
     * @param _parentAssetId 父 ECHO 资产 ID
     * @param _usageType 使用场景
     * @param _days 购买天数
     */
    function purchaseTimed(
        uint256 _parentAssetId,
        UsageType _usageType,
        uint256 _days
    ) public payable nonReentrant returns (uint256) {
        require(_days >= 30, "Minimum 30 days");
        
        uint256 dailyPrice = getAssetDailyPrice(_parentAssetId);
        require(dailyPrice > 0, "Timed pricing not enabled");
        
        // 计算价格
        uint256 basePrice = dailyPrice * _days;
        uint256 adjustedPrice = (basePrice * usageMultipliers[_usageType]) / 100;
        uint256 totalPrice = adjustedPrice + (adjustedPrice * platformFeeRate / FEE_DENOMINATOR);
        
        require(msg.value >= totalPrice, "Insufficient payment");
        
        uint256 validUntil = block.timestamp + (_days * 1 days);
        
        // 创建 License
        uint256 licenseId = _createLicense(
            _parentAssetId,
            LicenseType.TIMED,
            _usageType,
            validUntil,
            0,  // 无限次数
            totalPrice
        );
        
        _distributeRevenue(_parentAssetId, adjustedPrice);
        
        if (msg.value > totalPrice) {
            payable(msg.sender).transfer(msg.value - totalPrice);
        }
        
        emit LicensePurchased(licenseId, _parentAssetId, msg.sender, LicenseType.TIMED, _usageType, totalPrice);
        
        return licenseId;
    }
    
    /**
     * @dev 验证 License 有效性
     */
    function verifyLicense(
        uint256 _licenseId,
        address _user,
        UsageType _usageType
    ) public view returns (bool) {
        License storage license = licenses[_licenseId];
        
        // 检查 License 存在
        require(_exists(_licenseId), "License does not exist");
        
        // 检查持有者
        require(ownerOf(_licenseId) == _user, "Not license owner");
        
        // 检查是否被冻结或撤销
        require(!license.isFrozen, "License is frozen");
        require(!license.isRevoked, "License is revoked");
        
        // 检查有效期
        require(block.timestamp >= license.validFrom, "License not yet active");
        if (license.validUntil > 0) {
            require(block.timestamp <= license.validUntil, "License expired");
        }
        
        // 检查使用次数
        if (license.maxUsageCount > 0) {
            require(license.usedCount < license.maxUsageCount, "Usage limit reached");
        }
        
        // 检查使用场景
        require(license.usageType == _usageType, "Usage type mismatch");
        
        return true;
    }
    
    /**
     * @dev 记录 License 使用
     */
    function recordUsage(uint256 _licenseId, address _user) public returns (bool) {
        License storage license = licenses[_licenseId];
        
        // 验证 License
        verifyLicense(_licenseId, _user, license.usageType);
        
        // 增加使用次数
        license.usedCount++;
        
        emit LicenseUsed(_licenseId, _user, license.maxUsageCount - license.usedCount);
        
        return true;
    }
    
    /**
     * @dev 紧急冻结 License
     */
    function freezeLicense(
        uint256 _licenseId,
        string memory _reason
    ) public {
        require(_exists(_licenseId), "License does not exist");
        
        License storage license = licenses[_licenseId];
        
        // 检查权限（创作者或平台管理员）
        require(
            isAssetCreator(license.parentAssetId, msg.sender) ||
            msg.sender == owner(),
            "Not authorized"
        );
        
        license.isFrozen = true;
        
        emit LicenseFrozen(_licenseId, msg.sender, _reason);
    }
    
    /**
     * @dev 撤销 License
     */
    function revokeLicense(uint256 _licenseId) public {
        require(_exists(_licenseId), "License does not exist");
        
        License storage license = licenses[_licenseId];
        
        require(
            isAssetCreator(license.parentAssetId, msg.sender) ||
            msg.sender == owner(),
            "Not authorized"
        );
        
        license.isRevoked = true;
        
        // 退还剩余金额（简化处理）
        if (license.licenseType == LicenseType.PER_USE && license.usedCount < license.maxUsageCount) {
            uint256 remaining = license.pricePaid * (license.maxUsageCount - license.usedCount) / license.maxUsageCount;
            payable(ownerOf(_licenseId)).transfer(remaining);
        }
        
        emit LicenseRevoked(_licenseId, msg.sender);
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
            isTransferable: true,  // 默认可转让
            isFrozen: false,
            isRevoked: false
        });
        
        licenses[licenseId] = newLicense;
        
        // 铸造 NFT
        _safeMint(msg.sender, licenseId);
        
        // 更新索引
        assetLicenses[_parentAssetId].push(licenseId);
        userLicenses[msg.sender].push(licenseId);
        
        return licenseId;
    }
    
    function _distributeRevenue(uint256 _assetId, uint256 _amount) internal {
        // 简化的收益分配逻辑
        // 实际应该从 ECHOAsset 合约读取创作者、协作者地址和分成比例
        
        uint256 platformFee = (_amount * platformFeeRate) / FEE_DENOMINATOR;
        uint256 creatorShare = _amount - platformFee;
        
        // 发送给平台
        payable(owner()).transfer(platformFee);
        
        // 发送给创作者（简化，实际应该调用 ECHOAsset 合约）
        address creator = getAssetCreator(_assetId);
        payable(creator).transfer(creatorShare);
    }
    
    // ============ 查询函数（占位符，实际应调用 ECHOAsset 合约）============
    
    function getAssetBasePrice(uint256 _assetId) internal view returns (uint256) {
        // 调用 ECHOAsset 合约获取买断价格
        return 100 * 10**18;  // 100 MEER 占位符
    }
    
    function getAssetPerUsePrice(uint256 _assetId) internal view returns (uint256) {
        // 调用 ECHOAsset 合约获取单次价格
        return 0.5 * 10**18;  // 0.5 MEER 占位符
    }
    
    function getAssetDailyPrice(uint256 _assetId) internal view returns (uint256) {
        // 调用 ECHOAsset 合约获取日租价格
        return 10 * 10**18;  // 10 MEER 占位符
    }
    
    function getAssetCreator(uint256 _assetId) internal view returns (address) {
        // 调用 ECHOAsset 合约获取创作者地址
        return address(this);  // 占位符
    }
    
    function isAssetCreator(uint256 _assetId, address _user) internal view returns (bool) {
        return getAssetCreator(_assetId) == _user;
    }
    
    // ============ 管理函数 ============
    
    function setPlatformFeeRate(uint256 _newRate) public onlyOwner {
        require(_newRate <= 1000, "Fee rate cannot exceed 10%");
        platformFeeRate = _newRate;
    }
    
    function setUsageMultiplier(UsageType _type, uint256 _multiplier) public onlyOwner {
        require(_multiplier >= 100 && _multiplier <= 500, "Multiplier must be 1x-5x");
        usageMultipliers[_type] = _multiplier;
    }
    
    function setEchoAssetContract(address _contract) public onlyOwner {
        echoAssetContract = _contract;
    }
    
    // ============ 必需的覆盖函数 ============
    
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
        
        // 转让时更新 License 记录
        if (from != address(0) && to != address(0)) {
            licenses[tokenId].licensee = to;
            
            // 更新用户索引
            // 注意：这里简化处理，实际应该维护更复杂的索引结构
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