// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// ============================================================
// ECHOAssetV2 - 简化版（用于验证）
// 移除了 OpenZeppelin 依赖，使用内联定义
// ============================================================

// ERC721 接口定义
interface IERC721 {
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
    function balanceOf(address owner) external view returns (uint256);
    function ownerOf(uint256 tokenId) external view returns (address);
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
    function transferFrom(address from, address to, uint256 tokenId) external;
    function approve(address to, uint256 tokenId) external;
    function getApproved(uint256 tokenId) external view returns (address);
    function setApprovalForAll(address operator, bool approved) external;
    function isApprovedForAll(address owner, address operator) external view returns (bool);
}

// ERC721Metadata 接口
interface IERC721Metadata {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function tokenURI(uint256 tokenId) external view returns (string memory);
}

// Counters 库
library Counters {
    struct Counter {
        uint256 _value;
    }
    function current(Counter storage counter) internal view returns (uint256) {
        return counter._value;
    }
    function increment(Counter storage counter) internal {
        unchecked { counter._value += 1; }
    }
}

// Strings 库
library Strings {
    function toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) return "0";
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) { digits++; temp /= 10; }
        bytes memory buffer = new bytes(digits);
        while (value != 0) { digits -= 1; buffer[digits] = bytes1(uint8(48 + uint256(value % 10))); value /= 10; }
        return string(buffer);
    }
}

// Context
abstract contract Context {
    function _msgSender() internal view virtual returns (address) { return msg.sender; }
}

// ERC165
abstract contract ERC165 {
    function supportsInterface(bytes4 interfaceId) public view virtual returns (bool) {
        return interfaceId == 0x01ffc9a7;
    }
}

// ERC721 核心实现
contract ERC721 is Context, ERC165, IERC721, IERC721Metadata {
    using Strings for uint256;
    
    string private _name;
    string private _symbol;
    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => address) private _tokenApprovals;
    mapping(address => mapping(address => bool)) private _operatorApprovals;
    
    constructor(string memory name_, string memory symbol_) {
        _name = name_;
        _symbol = symbol_;
    }
    
    function name() public view virtual override returns (string memory) { return _name; }
    function symbol() public view virtual override returns (string memory) { return _symbol; }
    function balanceOf(address owner) public view virtual override returns (uint256) {
        require(owner != address(0), "ERC721: zero address");
        return _balances[owner];
    }
    function ownerOf(uint256 tokenId) public view virtual override returns (address) {
        address owner = _owners[tokenId];
        require(owner != address(0), "ERC721: invalid token");
        return owner;
    }
    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(_exists(tokenId), "ERC721: invalid token");
        return "";
    }
    function _exists(uint256 tokenId) internal view virtual returns (bool) {
        return _owners[tokenId] != address(0);
    }
    function approve(address to, uint256 tokenId) public virtual override {
        address owner = ownerOf(tokenId);
        require(to != owner, "ERC721: approve to owner");
        require(_msgSender() == owner || isApprovedForAll(owner, _msgSender()), "ERC721: not authorized");
        _tokenApprovals[tokenId] = to;
        emit Approval(owner, to, tokenId);
    }
    function getApproved(uint256 tokenId) public view virtual override returns (address) {
        require(_exists(tokenId), "ERC721: invalid token");
        return _tokenApprovals[tokenId];
    }
    function setApprovalForAll(address operator, bool approved) public virtual override {
        require(operator != _msgSender(), "ERC721: approve to caller");
        _operatorApprovals[_msgSender()][operator] = approved;
        emit ApprovalForAll(_msgSender(), operator, approved);
    }
    function isApprovedForAll(address owner, address operator) public view virtual override returns (bool) {
        return _operatorApprovals[owner][operator];
    }
    function transferFrom(address from, address to, uint256 tokenId) public virtual override {
        require(_isApprovedOrOwner(_msgSender(), tokenId), "ERC721: not authorized");
        _transfer(from, to, tokenId);
    }
    function safeTransferFrom(address from, address to, uint256 tokenId) public virtual override {
        transferFrom(from, to, tokenId);
    }
    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view virtual returns (bool) {
        address owner = ownerOf(tokenId);
        return (spender == owner || getApproved(tokenId) == spender || isApprovedForAll(owner, spender));
    }
    function _transfer(address from, address to, uint256 tokenId) internal virtual {
        require(ownerOf(tokenId) == from, "ERC721: wrong owner");
        require(to != address(0), "ERC721: zero address");
        delete _tokenApprovals[tokenId];
        _balances[from] -= 1;
        _balances[to] += 1;
        _owners[tokenId] = to;
        emit Transfer(from, to, tokenId);
    }
    function _mint(address to, uint256 tokenId) internal virtual {
        require(to != address(0), "ERC721: zero address");
        require(!_exists(tokenId), "ERC721: exists");
        _balances[to] += 1;
        _owners[tokenId] = to;
        emit Transfer(address(0), to, tokenId);
    }
}

// ============================================================
// ECHOAssetV2 核心合约
// ============================================================

contract ECHOAssetV2 is ERC721 {
    using Counters for Counters.Counter;
    
    Counters.Counter private _tokenIdCounter;
    
    // 数据结构
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
        uint256 maxUsers;
        uint256 licenseDuration;
    }
    
    struct DerivativeRights {
        address owner;
        uint256 fee;
        bool allowDerivatives;
        uint256 revenueShare;
    }
    
    struct ExtensionRights {
        address owner;
        uint256 fee;
        bool allowExtensions;
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
    
    // 存储映射
    mapping(uint256 => AssetMetadata) public assetMetadata;
    mapping(uint256 => RightsBlueprint) public rightsBlueprint;
    mapping(uint256 => address) public originalCreator;
    mapping(uint256 => VersionHistory[]) public versionHistory;
    mapping(uint256 => uint256) public currentVersion;
    mapping(bytes32 => uint256) public contentHashToToken;
    
    // 事件
    event AssetMinted(uint256 indexed tokenId, address indexed creator, bytes32 contentHash, string name);
    event RightsBlueprintConfigured(uint256 indexed tokenId, RightsBlueprint blueprint);
    event ContentUpdated(uint256 indexed tokenId, uint256 version, bytes32 newContentHash, string updateReason);
    
    constructor() ERC721("ECHO Asset V2", "ECHOV2") {}
    
    function mintECHO(
        string memory name,
        string memory description,
        string memory assetType,
        string memory uri,
        bytes32 contentHash,
        RightsBlueprint memory blueprint
    ) public returns (uint256) {
        require(contentHashToToken[contentHash] == 0, "Content already minted");
        require(contentHash != bytes32(0), "Invalid content hash");
        
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        
        _mint(msg.sender, tokenId);
        
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
        
        emit AssetMinted(tokenId, msg.sender, contentHash, name);
        emit RightsBlueprintConfigured(tokenId, blueprint);
        
        return tokenId;
    }
    
    function updateContent(
        uint256 tokenId,
        string memory newUri,
        bytes32 newContentHash,
        string memory updateReason
    ) public {
        require(_exists(tokenId), "Asset not found");
        require(msg.sender == originalCreator[tokenId], "Only creator");
        require(newContentHash != bytes32(0), "Invalid hash");
        
        AssetMetadata storage meta = assetMetadata[tokenId];
        meta.uri = newUri;
        meta.contentHash = newContentHash;
        meta.lastUpdated = block.timestamp;
        
        delete contentHashToToken[meta.contentHash];
        contentHashToToken[newContentHash] = tokenId;
        
        uint256 newVersion = currentVersion[tokenId] + 1;
        currentVersion[tokenId] = newVersion;
        
        versionHistory[tokenId].push(VersionHistory({
            version: newVersion,
            contentHash: newContentHash,
            uri: newUri,
            timestamp: block.timestamp,
            updateReason: updateReason
        }));
        
        emit ContentUpdated(tokenId, newVersion, newContentHash, updateReason);
    }
    
    function transferUsageRight(uint256 tokenId, address newOwner) public {
        require(_exists(tokenId), "Asset not found");
        require(rightsBlueprint[tokenId].usage.owner == msg.sender, "Not owner");
        rightsBlueprint[tokenId].usage.owner = newOwner;
    }
    
    function transferDerivativeRight(uint256 tokenId, address newOwner) public {
        require(_exists(tokenId), "Asset not found");
        require(rightsBlueprint[tokenId].derivative.owner == msg.sender, "Not owner");
        rightsBlueprint[tokenId].derivative.owner = newOwner;
    }
    
    function transferRevenueRight(uint256 tokenId, address newOwner) public {
        require(_exists(tokenId), "Asset not found");
        require(rightsBlueprint[tokenId].revenue.owner == msg.sender, "Not owner");
        rightsBlueprint[tokenId].revenue.owner = newOwner;
    }
    
    function getAssetInfo(uint256 tokenId) public view returns (
        AssetMetadata memory metadata,
        RightsBlueprint memory blueprint,
        address creator,
        uint256 version
    ) {
        require(_exists(tokenId), "Asset not found");
        return (
            assetMetadata[tokenId],
            rightsBlueprint[tokenId],
            originalCreator[tokenId],
            currentVersion[tokenId]
        );
    }
    
    function getVersionHistory(uint256 tokenId) public view returns (VersionHistory[] memory) {
        require(_exists(tokenId), "Asset not found");
        return versionHistory[tokenId];
    }
    
    function getCurrentTokenId() public view returns (uint256) {
        return _tokenIdCounter.current();
    }
    
    receive() external payable {}
}
