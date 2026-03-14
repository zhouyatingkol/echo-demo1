// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

/**
 * @title ECHOAsset
 * @dev ECHO Protocol 智能合约 - 四权分离数字资产
 * 
 * 四种权利：
 * - 使用权 (Usage): 使用资产的权利
 * - 衍生权 (Derivative): 基于资产创建新作品的权利
 * - 扩展权 (Extension): 扩展资产功能的权利
 * - 收益权 (Revenue): 获得资产收益的权利
 */
contract ECHOAsset is ERC721 {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    // ECHO资产权利结构
    struct Rights {
        address usageOwner;      // 使用权所有者
        address derivativeOwner; // 衍生权所有者
        address extensionOwner;  // 扩展权所有者
        address revenueOwner;    // 收益权所有者
        
        uint256 usageFee;        // 使用费 (wei)
        uint256 revenueShare;    // 收益分成比例 (0-10000, 10000=100%)
    }
    
    // 资产元数据
    struct AssetMetadata {
        string name;
        string description;
        string assetType;        // 代码/算法/数据/专利
        string uri;              // IPFS或其他存储地址
        uint256 createdAt;
    }
    
    // 存储映射
    mapping(uint256 => Rights) public assetRights;
    mapping(uint256 => AssetMetadata) public assetMetadata;
    mapping(uint256 => address) public originalCreator;
    
    // 使用权授权记录 (tokenId => user => expiryTime)
    mapping(uint256 => mapping(address => uint256)) public usageAuthorization;
    
    // 事件
    event AssetMinted(
        uint256 indexed tokenId,
        address indexed creator,
        string name,
        string assetType
    );
    
    event RightsConfigured(
        uint256 indexed tokenId,
        address usageOwner,
        address derivativeOwner,
        address extensionOwner,
        address revenueOwner
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
    
    event UsagePaid(
        uint256 indexed tokenId,
        address indexed user,
        uint256 amount
    );

    constructor() ERC721("ECHO Asset", "ECHO") {}
    
    /**
     * @dev 铸造新的ECHO资产
     */
    function mintECHO(
        string memory name,
        string memory description,
        string memory assetType,
        string memory uri,
        Rights memory rights
    ) public returns (uint256) {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _safeMint(msg.sender, tokenId);
        
        assetMetadata[tokenId] = AssetMetadata({
            name: name,
            description: description,
            assetType: assetType,
            uri: uri,
            createdAt: block.timestamp
        });
        
        assetRights[tokenId] = rights;
        originalCreator[tokenId] = msg.sender;
        
        emit AssetMinted(tokenId, msg.sender, name, assetType);
        emit RightsConfigured(
            tokenId,
            rights.usageOwner,
            rights.derivativeOwner,
            rights.extensionOwner,
            rights.revenueOwner
        );
        
        return tokenId;
    }
    
    /**
     * @dev 转移使用权
     */
    function transferUsageRight(uint256 tokenId, address newOwner) public {
        require(_exists(tokenId), "Asset does not exist");
        require(assetRights[tokenId].usageOwner == msg.sender, "Not usage owner");
        
        address oldOwner = assetRights[tokenId].usageOwner;
        assetRights[tokenId].usageOwner = newOwner;
        
        emit RightTransferred(tokenId, "usage", oldOwner, newOwner);
    }
    
    /**
     * @dev 转移衍生权
     */
    function transferDerivativeRight(uint256 tokenId, address newOwner) public {
        require(_exists(tokenId), "Asset does not exist");
        require(assetRights[tokenId].derivativeOwner == msg.sender, "Not derivative owner");
        
        address oldOwner = assetRights[tokenId].derivativeOwner;
        assetRights[tokenId].derivativeOwner = newOwner;
        
        emit RightTransferred(tokenId, "derivative", oldOwner, newOwner);
    }
    
    /**
     * @dev 转移扩展权
     */
    function transferExtensionRight(uint256 tokenId, address newOwner) public {
        require(_exists(tokenId), "Asset does not exist");
        require(assetRights[tokenId].extensionOwner == msg.sender, "Not extension owner");
        
        address oldOwner = assetRights[tokenId].extensionOwner;
        assetRights[tokenId].extensionOwner = newOwner;
        
        emit RightTransferred(tokenId, "extension", oldOwner, newOwner);
    }
    
    /**
     * @dev 转移收益权
     */
    function transferRevenueRight(uint256 tokenId, address newOwner) public {
        require(_exists(tokenId), "Asset does not exist");
        require(assetRights[tokenId].revenueOwner == msg.sender, "Not revenue owner");
        
        address oldOwner = assetRights[tokenId].revenueOwner;
        assetRights[tokenId].revenueOwner = newOwner;
        
        emit RightTransferred(tokenId, "revenue", oldOwner, newOwner);
    }
    
    /**
     * @dev 支付使用费获得使用权（临时授权）
     */
    function payForUsage(uint256 tokenId, uint256 durationDays) public payable {
        require(_exists(tokenId), "Asset does not exist");
        
        Rights storage rights = assetRights[tokenId];
        uint256 requiredFee = rights.usageFee * durationDays;
        
        require(msg.value >= requiredFee, "Insufficient fee");
        
        // 转账给收益权所有者
        payable(rights.revenueOwner).transfer(msg.value);
        
        // 授权使用时间
        uint256 expiry = block.timestamp + (durationDays * 1 days);
        usageAuthorization[tokenId][msg.sender] = expiry;
        
        emit UsagePaid(tokenId, msg.sender, msg.value);
        emit UsageAuthorized(tokenId, msg.sender, expiry);
    }
    
    /**
     * @dev 检查用户是否有使用权
     */
    function hasUsageRight(uint256 tokenId, address user) public view returns (bool) {
        if (assetRights[tokenId].usageOwner == user) {
            return true;
        }
        return usageAuthorization[tokenId][user] > block.timestamp;
    }
    
    /**
     * @dev 获取资产完整信息
     */
    function getAssetInfo(uint256 tokenId) public view returns (
        AssetMetadata memory metadata,
        Rights memory rights,
        address creator
    ) {
        require(_exists(tokenId), "Asset does not exist");
        return (
            assetMetadata[tokenId],
            assetRights[tokenId],
            originalCreator[tokenId]
        );
    }
    
    /**
     * @dev 获取当前tokenId计数
     */
    function getCurrentTokenId() public view returns (uint256) {
        return _tokenIdCounter.current();
    }
}