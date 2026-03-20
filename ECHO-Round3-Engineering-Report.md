# ECHO 协议 - 工程验证报告 v1.0
## Round 3: 区块链实现方案

> 分析者：区块链开发者  
> 日期：2026-03-20  
> 协议版本：v0.1-draft

---

## 目录
1. [变势防作弊机制](#1-变势防作弊机制)
2. [权利上链实现](#2-权利上链实现)
3. [跨平台一致性](#3-跨平台一致性)
4. [MVP 方案总结](#4-mvp-方案总结)

---

## 1. 变势防作弊机制

### 1.1 问题分析

**核心矛盾**：变势(BianShi)依赖"使用次数"来升级，但链上无法直接感知链下真实使用行为。

**攻击向量**：
- **女巫攻击(Sybil Attack)**：一用户多钱包，刷使用次数
- **机器人刷量**：自动化脚本模拟使用
- **虚假证明**：伪造使用证明交易

### 1.2 证明机制设计

#### 方案A：平台背书证明 (推荐MVP)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

/**
 * @title ProofOfUsageRegistry
 * @notice 使用证明注册合约 - 平台背书模式
 */
contract ProofOfUsageRegistry is AccessControl {
    using ECDSA for bytes32;
    
    // ============ Roles ============
    bytes32 public constant PLATFORM_SIGNER_ROLE = keccak256("PLATFORM_SIGNER_ROLE");
    bytes32 public constant AUDITOR_ROLE = keccak256("AUDITOR_ROLE");
    
    // ============ Structs ============
    struct UsageProof {
        uint256 tokenId;          // 资产ID
        address user;             // 使用者
        uint256 usageType;        // 使用类型 (1=浏览, 2=播放, 3=创作, 4=交易)
        uint256 timestamp;        // 使用时间
        uint256 platformId;       // 平台标识
        bytes32 contextHash;      // 使用上下文哈希 (脱敏后)
        bool verified;            // 是否已验证
    }
    
    struct BianShiState {
        uint8 level;              // 当前变势 0-9
        uint256 lastUpdateTime;   // 最后更新时间
        uint256 usageCount;       // 总使用次数
        uint256 consecutiveDays;  // 连续使用天数
    }
    
    // ============ Storage ============
    // tokenId => 变势状态
    mapping(uint256 => BianShiState) public bianShiStates;
    
    // proofId => 使用证明 (防重放)
    mapping(bytes32 => bool) public usedProofs;
    
    // user => tokenId => 当日使用次数 (防单日刷量)
    mapping(address => mapping(uint256 => mapping(uint256 => uint256))) public dailyUsageCount;
    
    // ============ Config ============
    uint256 public constant DECAY_PERIOD = 3 days;      // 衰减周期
    uint256 public constant MAX_DAILY_USAGE = 10;       // 单日最大使用次数
    uint256 public constant LEVEL_UP_THRESHOLD = 100;   // 升级所需使用次数
    
    // ============ Events ============
    event UsageProved(bytes32 indexed proofId, uint256 indexed tokenId, address user, uint8 newLevel);
    event BianShiDecayed(uint256 indexed tokenId, uint8 oldLevel, uint8 newLevel);
    event PlatformSignerAdded(address signer, uint256 platformId);
    
    // ============ Core Functions ============
    
    /**
     * @notice 提交使用证明并更新变势
     * @param proof 使用证明数据
     * @param signature 平台签名
     */
    function submitUsageProof(
        UsageProof calldata proof,
        bytes calldata signature
    ) external returns (uint8 newLevel) {
        // 1. 验证证明未被使用
        bytes32 proofId = keccak256(abi.encode(proof));
        require(!usedProofs[proofId], "Proof already used");
        
        // 2. 验证签名者权限
        bytes32 messageHash = keccak256(abi.encode(proof));
        bytes32 ethSignedHash = messageHash.toEthSignedMessageHash();
        address signer = ethSignedHash.recover(signature);
        require(hasRole(PLATFORM_SIGNER_ROLE, signer), "Invalid signer");
        
        // 3. 防刷量检查
        uint256 today = block.timestamp / 1 days;
        uint256 userDailyCount = dailyUsageCount[proof.user][proof.tokenId][today];
        require(userDailyCount < MAX_DAILY_USAGE, "Daily limit exceeded");
        
        // 4. 检查衰减
        _applyDecay(proof.tokenId);
        
        // 5. 更新状态
        usedProofs[proofId] = true;
        dailyUsageCount[proof.user][proof.tokenId][today] = userDailyCount + 1;
        
        BianShiState storage state = bianShiStates[proof.tokenId];
        state.usageCount++;
        state.lastUpdateTime = block.timestamp;
        
        // 6. 计算连续使用天数
        if (block.timestamp - state.lastUpdateTime < 2 days) {
            state.consecutiveDays++;
        } else {
            state.consecutiveDays = 1;
        }
        
        // 7. 升级检查
        newLevel = _calculateLevel(state);
        state.level = newLevel;
        
        emit UsageProved(proofId, proof.tokenId, proof.user, newLevel);
        return newLevel;
    }
    
    /**
     * @notice 应用衰减机制 (闲置3天降级)
     */
    function _applyDecay(uint256 tokenId) internal {
        BianShiState storage state = bianShiStates[tokenId];
        if (state.level == 0) return;
        
        uint256 idleTime = block.timestamp - state.lastUpdateTime;
        uint256 decayUnits = idleTime / DECAY_PERIOD;
        
        if (decayUnits > 0 && state.level > decayUnits) {
            uint8 oldLevel = state.level;
            state.level -= uint8(decayUnits);
            emit BianShiDecayed(tokenId, oldLevel, state.level);
        }
    }
    
    /**
     * @notice 计算变势等级
     */
    function _calculateLevel(BianShiState memory state) internal pure returns (uint8) {
        // 基于使用次数和连续天数计算
        uint256 score = state.usageCount + (state.consecutiveDays * 5);
        
        if (score >= 500) return 9;      // 用九 · 群龙无首
        if (score >= 400) return 6;      // 上九 · 亢龙有悔
        if (score >= 300) return 5;      // 九五 · 飞龙在天
        if (score >= 200) return 4;      // 九四 · 或跃在渊
        if (score >= 150) return 3;      // 九三 · 终日乾乾
        if (score >= 100) return 2;      // 九二 · 见龙在田
        if (score >= 50) return 1;       // 初九 · 潜龙勿用
        return 0;
    }
    
    /**
     * @notice 查询当前变势状态 (自动应用衰减)
     */
    function getCurrentBianShi(uint256 tokenId) external returns (BianShiState memory) {
        _applyDecay(tokenId);
        return bianShiStates[tokenId];
    }
}
```

#### 方案B：零知识证明 + 使用挑战 (高安全)

```solidity
/**
 * @title ZKProofOfUsage
 * @notice 基于zk-SNARK的使用证明 - 隐私保护
 */
contract ZKProofOfUsage is AccessControl {
    
    // zk-SNARK验证密钥
    uint256[2] public verifyingKeyAlpha;
    uint256[2] public verifyingKeyBeta;
    // ... 其他密钥参数
    
    struct ZKUsageProof {
        uint256[2] a;           // 证明点A
        uint256[2][2] b;        // 证明点B
        uint256[2] c;           // 证明点C
        uint256[3] publicSignals; // 公开信号 [tokenId, usageHash, timestamp]
    }
    
    // 链下生成证明：用户使用了tokenId，但隐藏具体使用细节
    function submitZKProof(ZKUsageProof calldata proof) external {
        // 验证zk证明
        require(verifyProof(proof), "Invalid ZK proof");
        
        uint256 tokenId = proof.publicSignals[0];
        // ... 更新变势
    }
    
    function verifyProof(ZKUsageProof calldata proof) public view returns (bool) {
        // 调用zk-SNARK验证器
        // 实际实现需要集成snarkjs或类似库
        return true; // 占位
    }
}
```

### 1.3 防女巫攻击策略

| 策略 | 实现方式 | Gas成本 | 适用场景 |
|------|----------|---------|----------|
| **人机验证** | 平台集成reCAPTCHA/v3 | 低 | Web平台 |
| **行为分析** | 链下AI模型检测异常模式 | 中 | 全平台 |
| **社交质押** | 需要质押小额度代币 | 中 | 链上操作 |
| **DID绑定** | 绑定WorldID/Civic等 | 高 | 高价值资产 |
| **设备指纹** | 链下记录设备ID哈希 | 低 | 移动端 |

**推荐组合**：平台签名 + 单日限流 + 行为分析（MVP阶段）

### 1.4 Gas成本评估

```
submitUsageProof 函数估算 (Optimism L2):
├── 基础交易: ~21,000 gas
├── 存储证明ID (SSTORE): ~20,000 gas (首次) / 5,000 gas (后续)
├── 更新变势状态: ~15,000 gas
├── 事件日志: ~2,000 gas
└── 总计: ~60,000 - 75,000 gas (~$0.02-0.03 @ 0.3gwei)

衰减检查 (getCurrentBianShi):
├── 读取状态: ~2,100 gas (warm)
├── 条件判断: ~500 gas
└── 总计: ~3,000 gas (可忽略)
```

---

## 2. 权利上链实现

### 2.1 四权力数据结构

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title ECHORightsToken
 * @notice ECHO协议四权力NFT合约
 * @dev 扩展ERC-721，支持权利拆分和授权
 */
contract ECHORightsToken is ERC721, ERC721Enumerable, AccessControl {
    
    // ============ Rights Structure ============
    
    /**
     * @notice 四权力结构
     * @dev 每个权力0-7级，3bit存储，共12bit
     * 
     * 权力位分配：
     * [11:9] 用 - 存在方式 (怎么用)
     * [ 8:6] 扩 - 连接范围 (谁能用)  
     * [ 5:3] 衍 - 衍生能力 (能改吗)
     * [ 2:0] 益 - 代谢模式 (稀缺吗)
     */
    struct FourPowers {
        uint8 usage;      // 用 (0-7)
        uint8 expansion;  // 扩 (0-7)
        uint8 derivation; // 衍 (0-7)
        uint8 benefit;    // 益 (0-7)
    }
    
    /**
     * @notice 权利所有权记录
     * @dev 支持部分权利转让和授权
     */
    struct RightsOwnership {
        address owner;           // 所有者
        uint16 geneCode;         // 基因码 (12bit存储)
        uint64 acquiredAt;       // 获得时间
        uint64 expiresAt;        // 过期时间 (0=永久)
        bool isFractional;       // 是否为分式权利
        uint256 parentTokenId;   // 父资产ID (衍生品)
    }
    
    /**
     * @notice 授权记录
     */
    struct Delegation {
        address delegate;        // 被授权人
        uint8 delegatedPowers;   // 授权的权力位图 (用|扩|衍|益)
        uint64 grantedAt;
        uint64 expiresAt;
        uint256 usageLimit;      // 使用次数限制
        uint256 usageUsed;       // 已使用次数
    }
    
    // ============ State Variables ============
    
    // tokenId => 基因码 (紧凑存储)
    mapping(uint256 => uint16) public geneCodes;
    
    // tokenId => 所有权详情
    mapping(uint256 => RightsOwnership) public ownershipDetails;
    
    // tokenId => delegate => 授权详情
    mapping(uint256 => mapping(address => Delegation)) public delegations;
    
    // 权力位掩码
    uint8 constant POWER_USAGE_MASK = 0x08;      // 1000
    uint8 constant POWER_EXPANSION_MASK = 0x04;  // 0100
    uint8 constant POWER_DERIVATION_MASK = 0x02; // 0010
    uint8 constant POWER_BENEFIT_MASK = 0x01;    // 0001
    
    // ============ Events ============
    
    event PowersMinted(uint256 indexed tokenId, uint16 geneCode, address owner);
    event PowersTransferred(uint256 indexed tokenId, address from, address to, uint8 powerMask);
    event PowersDelegated(uint256 indexed tokenId, address delegate, uint8 powerMask, uint64 expiresAt);
    event PowersRevoked(uint256 indexed tokenId, address delegate);
    event GeneCodeUpdated(uint256 indexed tokenId, uint16 oldCode, uint16 newCode);
    
    // ============ Constructor ============
    
    constructor() ERC721("ECHO Rights Token", "ECHOR") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    // ============ Core Functions ============
    
    /**
     * @notice 铸造新资产
     * @param to 接收地址
     * @param geneCode 基因码 (0-4095)
     * @param uri 元数据URI
     */
    function mint(
        address to,
        uint16 geneCode,
        string calldata uri
    ) external onlyRole(MINTER_ROLE) returns (uint256 tokenId) {
        require(geneCode < 4096, "Invalid gene code");
        
        tokenId = totalSupply() + 1;
        geneCodes[tokenId] = geneCode;
        
        ownershipDetails[tokenId] = RightsOwnership({
            owner: to,
            geneCode: geneCode,
            acquiredAt: uint64(block.timestamp),
            expiresAt: 0,
            isFractional: false,
            parentTokenId: 0
        });
        
        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);
        
        emit PowersMinted(tokenId, geneCode, to);
        return tokenId;
    }
    
    /**
     * @notice 解析基因码为四权力结构
     */
    function decodeGeneCode(uint16 geneCode) public pure returns (FourPowers memory) {
        return FourPowers({
            usage: uint8((geneCode >> 9) & 0x7),      // bits 11-9
            expansion: uint8((geneCode >> 6) & 0x7),  // bits 8-6
            derivation: uint8((geneCode >> 3) & 0x7), // bits 5-3
            benefit: uint8(geneCode & 0x7)            // bits 2-0
        });
    }
    
    /**
     * @notice 编码四权力为基因码
     */
    function encodeGeneCode(FourPowers calldata powers) public pure returns (uint16) {
        require(powers.usage < 8 && powers.expansion < 8 && 
                powers.derivation < 8 && powers.benefit < 8, "Invalid power level");
        
        // 依赖检查: 用=0时，其他权力必须为0
        if (powers.usage == 0) {
            require(powers.expansion == 0 && powers.derivation == 0 && powers.benefit == 0,
                    "Usage=0 requires all powers to be 0");
        }
        
        return uint16(
            (powers.usage << 9) |
            (powers.expansion << 6) |
            (powers.derivation << 3) |
            powers.benefit
        );
    }
    
    /**
     * @notice 计算卦象
     * @return guaIndex 卦序 1-64
     * @return upperGua 上卦 0-7
     * @return lowerGua 下卦 0-7
     */
    function calculateGuaXiang(uint256 tokenId) external view returns (
        uint8 guaIndex,
        uint8 upperGua,
        uint8 lowerGua
    ) {
        FourPowers memory powers = decodeGeneCode(geneCodes[tokenId]);
        
        // 上卦 = (用 + 扩) mod 8
        upperGua = uint8((powers.usage + powers.expansion) % 8);
        
        // 下卦 = (衍 + 益) mod 8
        lowerGua = uint8((powers.derivation + powers.benefit) % 8);
        
        // 卦序 = 上卦 × 8 + 下卦 + 1
        guaIndex = upperGua * 8 + lowerGua + 1;
        
        return (guaIndex, upperGua, lowerGua);
    }
    
    /**
     * @notice 权利转让（支持部分权力转让）
     * @param to 接收方
     * @param tokenId 资产ID
     * @param powerMask 转让的权力位图 (如 0x0C = 用+扩)
     */
    function transferPowers(
        address to,
        uint256 tokenId,
        uint8 powerMask
    ) external {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Not authorized");
        require(powerMask > 0 && powerMask <= 0x0F, "Invalid power mask");
        
        FourPowers memory currentPowers = decodeGeneCode(geneCodes[tokenId]);
        
        // 检查要转让的权力是否可用
        if (powerMask & POWER_USAGE_MASK != 0) require(currentPowers.usage > 0, "Usage locked");
        if (powerMask & POWER_EXPANSION_MASK != 0) require(currentPowers.expansion > 0, "Expansion locked");
        
        // 方案1: 创建分式权利NFT (推荐)
        uint256 newTokenId = _fractionalize(tokenId, powerMask, to);
        
        // 方案2: 修改原资产权利并创建新资产 (可选)
        // _splitPowers(tokenId, powerMask, to);
        
        emit PowersTransferred(tokenId, msg.sender, to, powerMask);
    }
    
    /**
     * @notice 分式化资产 - 创建子权利NFT
     */
    function _fractionalize(
        uint256 parentTokenId,
        uint8 powerMask,
        address to
    ) internal returns (uint256 newTokenId) {
        FourPowers memory parent = decodeGeneCode(geneCodes[parentTokenId]);
        
        // 构建子权力
        FourPowers memory childPowers = FourPowers({
            usage: (powerMask & POWER_USAGE_MASK) != 0 ? parent.usage : 0,
            expansion: (powerMask & POWER_EXPANSION_MASK) != 0 ? parent.expansion : 0,
            derivation: (powerMask & POWER_DERIVATION_MASK) != 0 ? parent.derivation : 0,
            benefit: (powerMask & POWER_BENEFIT_MASK) != 0 ? parent.benefit : 0
        });
        
        newTokenId = totalSupply() + 1;
        uint16 childGeneCode = encodeGeneCode(childPowers);
        
        geneCodes[newTokenId] = childGeneCode;
        ownershipDetails[newTokenId] = RightsOwnership({
            owner: to,
            geneCode: childGeneCode,
            acquiredAt: uint64(block.timestamp),
            expiresAt: 0,
            isFractional: true,
            parentTokenId: parentTokenId
        });
        
        _safeMint(to, newTokenId);
        return newTokenId;
    }
    
    /**
     * @notice 授权权力给他人使用
     */
    function delegatePowers(
        uint256 tokenId,
        address delegate,
        uint8 powerMask,
        uint64 duration,
        uint256 usageLimit
    ) external {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Not owner");
        require(powerMask > 0, "Empty delegation");
        require(delegate != address(0), "Invalid delegate");
        
        delegations[tokenId][delegate] = Delegation({
            delegate: delegate,
            delegatedPowers: powerMask,
            grantedAt: uint64(block.timestamp),
            expiresAt: uint64(block.timestamp + duration),
            usageLimit: usageLimit,
            usageUsed: 0
        });
        
        emit PowersDelegated(tokenId, delegate, powerMask, uint64(block.timestamp + duration));
    }
    
    /**
     * @notice 检查某地址是否拥有特定权力
     */
    function hasPower(
        uint256 tokenId,
        address user,
        uint8 powerMask
    ) external view returns (bool) {
        // 直接拥有者
        if (ownerOf(tokenId) == user) {
            FourPowers memory powers = decodeGeneCode(geneCodes[tokenId]);
            return _checkPowerMask(powers, powerMask);
        }
        
        // 被授权人
        Delegation memory del = delegations[tokenId][user];
        if (del.delegate == user && 
            block.timestamp < del.expiresAt &&
            del.usageUsed < del.usageLimit) {
            return (del.delegatedPowers & powerMask) == powerMask;
        }
        
        return false;
    }
    
    /**
     * @notice 记录权力使用（由应用合约调用）
     */
    function recordUsage(uint256 tokenId, address user, uint8 powerUsed) external {
        Delegation storage del = delegations[tokenId][user];
        if (del.delegate == user) {
            require(del.usageUsed < del.usageLimit, "Usage limit exceeded");
            del.usageUsed++;
        }
    }
    
    function _checkPowerMask(FourPowers memory powers, uint8 mask) internal pure returns (bool) {
        if (mask & POWER_USAGE_MASK != 0 && powers.usage == 0) return false;
        if (mask & POWER_EXPANSION_MASK != 0 && powers.expansion == 0) return false;
        if (mask & POWER_DERIVATION_MASK != 0 && powers.derivation == 0) return false;
        if (mask & POWER_BENEFIT_MASK != 0 && powers.benefit == 0) return false;
        return true;
    }
    
    // ============ Overrides ============
    
    function _beforeTokenTransfer(
        address from,
        address to,
        uint256 tokenId,
        uint256 batchSize
    ) internal override(ERC721, ERC721Enumerable) {
        super._beforeTokenTransfer(from, to, tokenId, batchSize);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721Enumerable, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
    
    // ERC721URIStorage 需要实现
    mapping(uint256 => string) private _tokenURIs;
    
    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireMinted(tokenId);
        return _tokenURIs[tokenId];
    }
    
    function _setTokenURI(uint256 tokenId, string memory _tokenURI) internal {
        _tokenURIs[tokenId] = _tokenURI;
    }
    
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
}
```

### 2.2 ERC-1155 多权利资产方案

```solidity
/**
 * @title ECHORights1155
 * @notice 适用于大量同质化权利的场景
 */
contract ECHORights1155 is ERC1155, AccessControl {
    
    // tokenId => 基因码
    mapping(uint256 => uint16) public geneCodes;
    
    // 用户 => 基因码 => 余额
    mapping(address => mapping(uint16 => uint256)) public powerBalances;
    
    /**
     * @notice 铸造特定基因码的权利
     */
    function mintRights(
        address to,
        uint16 geneCode,
        uint256 amount,
        bytes memory data
    ) external onlyRole(MINTER_ROLE) {
        uint256 tokenId = uint256(geneCode);
        geneCodes[tokenId] = geneCode;
        _mint(to, tokenId, amount, data);
    }
    
    /**
     * @notice 批量转移特定权力
     */
    function transferPowerBatch(
        address from,
        address to,
        uint16[] calldata geneCodes,
        uint256[] calldata amounts
    ) external {
        uint256[] memory tokenIds = new uint256[](geneCodes.length);
        for (uint i = 0; i < geneCodes.length; i++) {
            tokenIds[i] = uint256(geneCodes[i]);
        }
        _safeBatchTransferFrom(from, to, tokenIds, amounts, "");
    }
}
```

### 2.3 Gas成本对比

| 操作 | ERC-721 | ERC-1155 | 估算 (L2) |
|------|---------|----------|-----------|
| Mint | ~80k | ~50k | $0.02-0.03 |
| Transfer | ~25k | ~20k | $0.01 |
| Batch Transfer | N/A | ~30k (10 items) | $0.015 |
| Delegate | ~35k | ~35k | $0.015 |
| Query Rights | ~3k | ~3k | $0 (view) |
| Calculate Gua | ~2k | ~2k | $0 (pure) |

**推荐**：非同质化资产用ERC-721，同质化/批量权利用ERC-1155

---

## 3. 跨平台一致性

### 3.1 架构设计

```
┌─────────────────────────────────────────────────────────────┐
│                       应用层 (Clients)                       │
├─────────────┬─────────────┬─────────────┬───────────────────┤
│   Web APP   │  Mobile APP │    Game     │     Social        │
└──────┬──────┴──────┬──────┴──────┬──────┴─────────┬─────────┘
       │             │             │                │
       └─────────────┴──────┬──────┴────────────────┘
                            │
              ┌─────────────▼─────────────┐
              │    API Gateway (REST)     │
              │  - 认证/限流/缓存          │
              └─────────────┬─────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼──────┐   ┌────────▼────────┐  ┌──────▼───────┐
│  Indexer     │   │   Oracle        │  │   Sync       │
│  (The Graph) │   │   (Chainlink)   │  │   Service    │
└───────┬──────┘   └────────┬────────┘  └──────┬───────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            │
              ┌─────────────▼─────────────┐
              │      Blockchain Layer      │
              │  ┌─────────────────────┐  │
              │  │  ECHORightsToken    │  │
              │  │  ProofOfUsage       │  │
              │  │  QiCalculator       │  │
              │  └─────────────────────┘  │
              └─────────────────────────────┘
```

### 3.2 索引服务 (The Graph)

```graphql
# subgraph/schema.graphql

enum PowerLevel {
  NONE
  BASIC
  STANDARD
  ADVANCED
  FULL
}

type Asset @entity {
  id: ID!                          # tokenId
  geneCode: Int!                   # 基因码
  owner: User!                     # 所有者
  powers: FourPowers!              # 四权力
  guaIndex: Int!                   # 卦序 1-64
  qiLevel: String!                 # 气数等级
  bianShi: BianShiState!           # 变势状态
  proofs: [UsageProof!]! @derivedFrom(field: "asset")
  createdAt: BigInt!
  updatedAt: BigInt!
}

type FourPowers @entity {
  id: ID!
  usage: PowerLevel!
  expansion: PowerLevel!
  derivation: PowerLevel!
  benefit: PowerLevel!
}

type BianShiState @entity {
  id: ID!
  level: Int!                      # 0-9
  usageCount: BigInt!
  consecutiveDays: BigInt!
  lastUpdateTime: BigInt!
}

type UsageProof @entity {
  id: ID!                          # proof hash
  asset: Asset!
  user: User!
  usageType: Int!                  # 1=浏览, 2=播放, etc.
  platform: String!                # 平台标识
  timestamp: BigInt!
  verified: Boolean!
}

type User @entity {
  id: ID!                          # address
  assets: [Asset!]! @derivedFrom(field: "owner")
  totalUsageCount: BigInt!
  reputation: BigInt!              # 基于使用行为的信誉分
}
```

```typescript
// subgraph/src/mappings.ts
import { 
  PowersMinted, 
  PowersDelegated,
  UsageProved 
} from '../generated/ECHORightsToken/ECHORightsToken';

export function handleMint(event: PowersMinted): void {
  let asset = new Asset(event.params.tokenId.toString());
  asset.geneCode = event.params.geneCode;
  asset.owner = event.params.owner.toHex();
  
  // 解析四权力
  let powers = decodeGeneCode(event.params.geneCode);
  asset.powers = saveFourPowers(powers);
  
  // 计算卦象
  let gua = calculateGuaXiang(powers);
  asset.guaIndex = gua.index;
  
  // 初始气数
  asset.qiLevel = 'dormant';
  asset.bianShi = createInitialBianShi();
  asset.createdAt = event.block.timestamp;
  asset.save();
}

export function handleUsageProof(event: UsageProved): void {
  let proof = new UsageProof(event.params.proofId.toHex());
  proof.asset = event.params.tokenId.toString();
  proof.user = event.params.user.toHex();
  proof.timestamp = event.block.timestamp;
  proof.verified = true;
  proof.save();
  
  // 更新变势
  let asset = Asset.load(event.params.tokenId.toString());
  if (asset) {
    asset.bianShi = updateBianShi(asset.bianShi, event.params.newLevel);
    asset.updatedAt = event.block.timestamp;
    asset.save();
  }
}
```

### 3.3 预言机方案

#### 方案A: Chainlink Functions (推荐)

```solidity
// Chainlink Functions 请求合约
contract ECHOOracleClient is FunctionsClient {
    
    using FunctionsRequest for FunctionsRequest.Request;
    
    struct SyncRequest {
        uint256 tokenId;
        address user;
        uint256 offchainUsageCount;
        bytes32 platformDataHash;
    }
    
    // Chainlink Functions订阅ID
    uint64 public subscriptionId;
    
    // 同步回调
    function fulfillSyncRequest(
        bytes32 requestId,
        bytes memory response,
        bytes memory error
    ) internal override {
        // 解析链下返回的使用数据
        (uint256 tokenId, uint256 verifiedUsageCount) = abi.decode(response, (uint256, uint256));
        
        // 更新链上变势
        _updateBianShiFromOracle(tokenId, verifiedUsageCount);
    }
    
    /**
     * @notice 请求链下平台数据同步
     */
    function requestOffchainSync(
        uint256 tokenId,
        string[] calldata platformIds
    ) external returns (bytes32 requestId) {
        // 构建JavaScript源码，调用各平台API
        string memory source = string.concat(
            "const platforms = args;",
            "let totalUsage = 0;",
            "for (const platform of platforms) {",
            "  const response = await Functions.makeHttpRequest({",
            "    url: `https://${platform}.api/echo/usage/${args[0]}`,",
            "    headers: { 'Authorization': secrets.apiKey }",
            "  });",
            "  if (response.error) throw Error('Platform API failed');",
            "  totalUsage += response.data.usageCount;",
            "}",
            "return Functions.encodeUint256(totalUsage);"
        );
        
        FunctionsRequest.Request memory req;
        req.initializeRequestForInlineJavaScript(source);
        req.addArgs([tokenId.toString()]);
        for (uint i = 0; i < platformIds.length; i++) {
            req.addArgs([platformIds[i]]);
        }
        
        requestId = _sendRequest(req, subscriptionId, CALLBACK_GAS_LIMIT);
        return requestId;
    }
}
```

#### 方案B: 自建预言机网络

```solidity
/**
 * @title ECHOOracleNetwork
 * @notice 多签预言机网络 - 平台节点共识
 */
contract ECHOOracleNetwork is AccessControl {
    
    struct PlatformNode {
        address signer;
        uint256 platformId;
        uint256 reputation;
        bool isActive;
    }
    
    struct SyncData {
        uint256 tokenId;
        uint256 usageDelta;
        uint256 timestamp;
        bytes32 dataHash;
    }
    
    mapping(address => PlatformNode) public nodes;
    mapping(bytes32 => mapping(address => bool)) public syncSignatures;
    mapping(bytes32 => uint256) public syncConfirmationCount;
    
    uint256 public constant REQUIRED_CONFIRMATIONS = 3;
    
    /**
     * @notice 平台节点提交同步数据
     */
    function submitSyncData(
        SyncData calldata data,
        bytes calldata signature
    ) external {
        require(nodes[msg.sender].isActive, "Not a valid node");
        
        bytes32 dataHash = keccak256(abi.encode(data));
        require(!syncSignatures[dataHash][msg.sender], "Already signed");
        
        // 验证签名
        bytes32 ethHash = dataHash.toEthSignedMessageHash();
        require(ethHash.recover(signature) == msg.sender, "Invalid signature");
        
        syncSignatures[dataHash][msg.sender] = true;
        syncConfirmationCount[dataHash]++;
        
        // 达到共识阈值后执行同步
        if (syncConfirmationCount[dataHash] >= REQUIRED_CONFIRMATIONS) {
            _executeSync(data);
        }
    }
}
```

### 3.4 同步策略对比

| 策略 | 延迟 | 去中心化程度 | 成本 | 适用场景 |
|------|------|--------------|------|----------|
| **The Graph索引** | ~1-5区块 | 高 | 低 | 查询类操作 |
| **平台签名证明** | 即时 | 中 | 极低 | 高频使用记录 |
| **Chainlink Functions** | ~2-5分钟 | 高 | 中 | 定期对账 |
| **自建预言机网络** | ~1分钟 | 中 | 中 | 高价值资产 |

---

## 4. MVP 方案总结

### 4.1 第一阶段：核心权利上链 (4周)

**合约部署**：
1. `ECHORightsToken` (ERC-721) - 四权力NFT
2. `ProofOfUsageRegistry` - 平台签名证明

**平台集成**：
- 部署1个官方签名服务节点
- 实现基础使用证明API
- 单日限流：10次/用户/资产

**索引**：
- 部署The Graph子图
- 提供基础查询接口

**成本估算**：
- 合约部署: ~$50 (L2)
- 每日运营成本: ~$20 (索引+签名服务)

### 4.2 第二阶段：变势与防刷 (4周)

- 实现衰减机制
- 引入行为分析层（链下）
- 添加人机验证
- 多平台签名节点

### 4.3 第三阶段：跨平台同步 (4周)

- Chainlink Functions集成
- 链上链下对账机制
- 开放第三方平台接入

### 4.4 技术选型总结

```yaml
区块链网络: Optimism / Base (L2, 低Gas)
代币标准: ERC-721 (主要) + ERC-1155 (批量)
索引服务: The Graph
预言机: Chainlink Functions (阶段3)
存储: IPFS + Arweave (永久元数据)
开发框架: Foundry + Hardhat
```

### 4.5 风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| 平台中心化 | 高 | 逐步过渡到多签节点网络 |
| Gas波动 | 中 | 使用L2 + 批量操作 |
| 女巫攻击 | 高 | 组合多种防刷策略 |
| 跨平台延迟 | 低 | 设计容忍延迟的算法 |

---

**结论**：ECHO协议的工程实现可行，建议采用分阶段部署策略，优先实现核心权利NFT和基础使用证明机制。
