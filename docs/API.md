# ECHO Protocol - API 文档

本文档详细说明 ECHO Protocol 智能合约的所有公共方法。

---

## 📍 合约地址

### Qitmeer 主网

| 合约 | 地址 | ABI 文件 |
|------|------|----------|
| ECHOAssetV2V3 | `0xF98f63b7e8064Dcf9c2f25A906B2af89Af4840ce` | `frontend/abi.js` |
| ECHOFusionV2 | `0x8Eb7a29C41478a3f32015C1330DFf7cc683d0952` | `frontend/abi.js` |
| LicenseNFTV3 | `0x2f79b56047050FD2Ee7C62d2d0fe644c15c68e23` | `frontend/abi.js` |

---

## 📚 ECHOAssetV2V3 合约

### 概述

核心资产合约，支持四权分离、版本控制、内容验证。

### 数据结构

#### RightsBlueprint（权属蓝图）

```solidity
struct RightsBlueprint {
    UsageRights usage;
    DerivativeRights derivative;
    ExtensionRights extension;
    RevenueRights revenue;
}

struct UsageRights {
    address owner;              // 使用权所有者
    uint256 fee;                // 使用费（wei）
    bool commercialUse;         // 是否允许商业使用
    bool modificationAllowed;   // 是否允许修改
    string[] allowedScopes;     // 允许的使用范围
    string[] restrictedScopes;  // 禁止的使用范围
    uint256 maxUsers;           // 最大用户数
    uint256 licenseDuration;    // 授权时长（秒）
}

struct DerivativeRights {
    address owner;              // 衍生权所有者
    uint256 fee;                // 衍生费（wei）
    bool allowDerivatives;      // 是否允许衍生
    uint256 revenueShare;       // 收益分成比例（基点，10000=100%）
    string[] allowedTypes;      // 允许的衍生类型
}

struct ExtensionRights {
    address owner;              // 扩展权所有者
    uint256 fee;                // 扩展费（wei）
    bool allowExtensions;       // 是否允许扩展
    string[] allowedExtensions; // 允许的扩展类型
}

struct RevenueRights {
    address owner;              // 收益权所有者
    uint256 sharePercentage;    // 收益分成比例（基点）
    bool autoDistribute;        // 是否自动分配
}
```

#### AssetMetadata（资产元数据）

```solidity
struct AssetMetadata {
    string name;                // 资产名称
    string description;         // 资产描述
    string assetType;           // 资产类型
    string uri;                 // 元数据 URI
    bytes32 contentHash;        // 内容哈希
    uint256 createdAt;          // 创建时间戳
    uint256 lastUpdated;        // 最后更新时间戳
}
```

### 写入方法

#### 1. mintAsset - 生成资产

生成新的 ECHO 资产。

```solidity
function mintAsset(
    string memory _name,
    string memory _description,
    string memory _assetType,
    string memory _uri,
    bytes32 _contentHash,
    RightsBlueprint memory _blueprint
) public whenNotPaused nonReentrant returns (uint256)
```

**参数说明**：

| 参数 | 类型 | 说明 |
|------|------|------|
| `_name` | string | 资产名称（最大 100 字符） |
| `_description` | string | 资产描述（最大 1000 字符） |
| `_assetType` | string | 资产类型（如 "music", "code"） |
| `_uri` | string | 元数据 URI（最大 500 字符） |
| `_contentHash` | bytes32 | 内容哈希（keccak256） |
| `_blueprint` | RightsBlueprint | 权属蓝图配置 |

**返回值**：
- `uint256` - 新生成的 Token ID

**示例代码**：

```javascript
const contentHash = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes(name + description)
);

const blueprint = {
    usage: {
        owner: creatorAddress,
        fee: ethers.utils.parseEther('0.01'),
        commercialUse: true,
        modificationAllowed: false,
        allowedScopes: ['personal', 'commercial'],
        restrictedScopes: ['illegal'],
        maxUsers: 1000,
        licenseDuration: 30 * 24 * 60 * 60  // 30 天
    },
    derivative: {
        owner: creatorAddress,
        fee: ethers.utils.parseEther('0.1'),
        allowDerivatives: true,
        revenueShare: 1000,  // 10%
        allowedTypes: ['remix', 'cover']
    },
    extension: {
        owner: creatorAddress,
        fee: ethers.utils.parseEther('0.05'),
        allowExtensions: true,
        allowedExtensions: ['plugin', 'integration']
    },
    revenue: {
        owner: creatorAddress,
        sharePercentage: 10000,  // 100%
        autoDistribute: true
    }
};

const tx = await contract.mintAsset(
    "My Music Track",
    "A great song",
    "music",
    "ipfs://Qm...",
    contentHash,
    blueprint
);
const receipt = await tx.wait();
```

---

#### 2. transferRight - 转让权利

转让特定类型的权利。

```solidity
function transferRight(
    uint256 _tokenId,
    string memory _rightType,
    address _to
) public whenNotPaused validAsset(_tokenId)
```

**参数说明**：

| 参数 | 类型 | 说明 |
|------|------|------|
| `_tokenId` | uint256 | 资产 ID |
| `_rightType` | string | 权利类型（"usage"/"derivative"/"extension"/"revenue"） |
| `_to` | address | 接收者地址 |

**权限要求**：
- 必须是该权利的当前所有者

**示例代码**：

```javascript
// 转让使用权
await contract.transferRight(123, 'usage', '0xRecipient...');

// 转让衍生权
await contract.transferRight(123, 'derivative', '0xRecipient...');

// 转让收益权
await contract.transferRight(123, 'revenue', '0xRecipient...');
```

---

#### 3. updateContent - 更新内容

更新资产内容（创建新版本）。

```solidity
function updateContent(
    uint256 _tokenId,
    bytes32 _newContentHash,
    string memory _newUri,
    string memory _updateReason
) public whenNotPaused onlyAssetCreator(_tokenId)
```

**参数说明**：

| 参数 | 类型 | 说明 |
|------|------|------|
| `_tokenId` | uint256 | 资产 ID |
| `_newContentHash` | bytes32 | 新内容哈希 |
| `_newUri` | string | 新元数据 URI |
| `_updateReason` | string | 更新原因说明 |

**权限要求**：
- 必须是资产原始创建者

**示例代码**：

```javascript
const newContentHash = ethers.utils.keccak256(
    ethers.utils.toUtf8Bytes('new content')
);

await contract.updateContent(
    123,
    newContentHash,
    'ipfs://QmNew...',
    'Fixed audio quality'
);
```

---

### 读取方法

#### 4. assetMetadata - 获取资产元数据

```solidity
function assetMetadata(uint256 _tokenId) 
    public 
    view 
    validAsset(_tokenId) 
    returns (AssetMetadata memory)
```

**参数**：`_tokenId` (uint256) - 资产 ID

**返回值**：`AssetMetadata` - 资产元数据结构

**示例代码**：

```javascript
const metadata = await contract.assetMetadata(123);
console.log('Name:', metadata.name);
console.log('Type:', metadata.assetType);
console.log('Created:', new Date(metadata.createdAt * 1000));
```

---

#### 5. rightsBlueprint - 获取权属蓝图

```solidity
function rightsBlueprint(uint256 _tokenId) 
    public 
    view 
    validAsset(_tokenId) 
    returns (RightsBlueprint memory)
```

**参数**：`_tokenId` (uint256) - 资产 ID

**返回值**：`RightsBlueprint` - 权属蓝图结构

**示例代码**：

```javascript
const rights = await contract.rightsBlueprint(123);
console.log('Usage Owner:', rights.usage.owner);
console.log('Usage Fee:', ethers.utils.formatEther(rights.usage.fee));
console.log('Revenue Owner:', rights.revenue.owner);
```

---

#### 6. ownerOf - 获取资产所有者

```solidity
function ownerOf(uint256 tokenId) public view returns (address)
```

**参数**：`tokenId` (uint256) - 资产 ID

**返回值**：`address` - 所有者地址

---

#### 7. balanceOf - 获取用户资产数量

```solidity
function balanceOf(address owner) public view returns (uint256)
```

**参数**：`owner` (address) - 用户地址

**返回值**：`uint256` - 资产数量

---

#### 8. getVersionHistory - 获取版本历史

```solidity
function getVersionHistory(uint256 _tokenId) 
    public 
    view 
    validAsset(_tokenId) 
    returns (VersionHistory[] memory)
```

**参数**：`_tokenId` (uint256) - 资产 ID

**返回值**：`VersionHistory[]` - 版本历史数组

---

### 事件

#### AssetMinted

```solidity
event AssetMinted(
    uint256 indexed tokenId,
    address indexed creator,
    bytes32 contentHash,
    string name,
    uint256 timestamp
);
```

#### RightTransferred

```solidity
event RightTransferred(
    uint256 indexed tokenId,
    string rightType,
    address indexed from,
    address indexed to,
    uint256 timestamp
);
```

#### ContentUpdated

```solidity
event ContentUpdated(
    uint256 indexed tokenId,
    uint256 version,
    bytes32 newContentHash,
    string updateReason,
    uint256 timestamp
);
```

---

## 📚 LicenseNFTV3 合约

### 概述

授权 NFT 合约，支持三种授权模式：买断制、按次计费、限时授权。

### 数据结构

#### License（授权信息）

```solidity
struct License {
    uint256 id;                 // 授权 ID
    uint256 parentAssetId;      // 父资产 ID
    address owner;              // 授权持有者
    uint8 licenseType;          // 授权类型（0=买断, 1=按次, 2=限时）
    uint8 usageType;            // 使用场景类型
    uint256 purchaseTime;       // 购买时间
    uint256 expiryTime;         // 过期时间（限时授权）
    uint256 useCount;           // 可用次数（按次授权）
    uint256 usedCount;          // 已使用次数
    bool isActive;              // 是否有效
}
```

### 授权类型

| 类型值 | 名称 | 说明 |
|--------|------|------|
| 0 | OneTime | 买断制，永久使用 |
| 1 | PerUse | 按次计费，次数用完失效 |
| 2 | TimeBased | 限时授权，到期失效 |

### 使用场景类型

| 类型值 | 名称 | 倍率 |
|--------|------|------|
| 0 | Personal | 个人使用 ×1.0 |
| 1 | Commercial | 商业使用 ×1.5 |
| 2 | AI | AI 训练 ×2.0 |
| 3 | Game | 游戏配乐 ×1.5 |
| 4 | Advertisement | 广告使用 ×3.0 |

### 写入方法

#### 1. purchaseOneTime - 购买买断制授权

```solidity
function purchaseOneTime(
    uint256 _parentAssetId,
    uint8 _usageType
) public payable whenNotPaused nonReentrant returns (uint256)
```

**参数说明**：

| 参数 | 类型 | 说明 |
|------|------|------|
| `_parentAssetId` | uint256 | 父资产 ID |
| `_usageType` | uint8 | 使用场景类型（0-4） |

**支付要求**：需支付足够的 MEER

**返回值**：`uint256` - 新 License ID

**示例代码**：

```javascript
// 获取价格
const price = await contract.calculatePrice(assetId, 0, 0);

// 购买买断制授权（个人使用）
const tx = await contract.purchaseOneTime(assetId, 0, {
    value: price.totalPrice
});
await tx.wait();
```

---

#### 2. purchasePerUse - 购买按次计费授权

```solidity
function purchasePerUse(
    uint256 _parentAssetId,
    uint8 _usageType,
    uint256 _useCount
) public payable whenNotPaused nonReentrant returns (uint256)
```

**参数说明**：

| 参数 | 类型 | 说明 |
|------|------|------|
| `_parentAssetId` | uint256 | 父资产 ID |
| `_usageType` | uint8 | 使用场景类型 |
| `_useCount` | uint256 | 购买使用次数 |

**示例代码**：

```javascript
const useCount = 100;  // 购买 100 次使用权
const price = await contract.calculatePrice(assetId, 1, useCount);

const tx = await contract.purchasePerUse(assetId, 0, useCount, {
    value: price.totalPrice
});
```

---

#### 3. purchaseTimeBased - 购买限时授权

```solidity
function purchaseTimeBased(
    uint256 _parentAssetId,
    uint8 _usageType,
    uint256 _days
) public payable whenNotPaused nonReentrant returns (uint256)
```

**参数说明**：

| 参数 | 类型 | 说明 |
|------|------|------|
| `_parentAssetId` | uint256 | 父资产 ID |
| `_usageType` | uint8 | 使用场景类型 |
| `_days` | uint256 | 授权天数 |

**示例代码**：

```javascript
const days = 30;  // 30 天授权
const price = await contract.calculatePrice(assetId, 2, days);

const tx = await contract.purchaseTimeBased(assetId, 0, days, {
    value: price.totalPrice
});
```

---

#### 4. useLicense - 使用授权（按次授权）

```solidity
function useLicense(uint256 _licenseId) public whenNotPaused
```

**参数**：`_licenseId` (uint256) - 授权 ID

**权限要求**：
- 必须是授权持有者
- 授权必须有剩余次数
- 授权必须未过期

---

### 读取方法

#### 5. calculatePrice - 计算价格

```solidity
function calculatePrice(
    uint256 _parentAssetId,
    uint8 _usageType,
    uint256 _quantity
) public view returns (
    uint256 basePrice,
    uint256 multiplier,
    uint256 totalPrice
)
```

**参数说明**：

| 参数 | 类型 | 说明 |
|------|------|------|
| `_parentAssetId` | uint256 | 父资产 ID |
| `_usageType` | uint8 | 使用场景类型 |
| `_quantity` | uint256 | 数量（次数或天数） |

**返回值**：
- `basePrice` - 基础价格
- `multiplier` - 倍率（基点）
- `totalPrice` - 总价

**示例代码**：

```javascript
const price = await contract.calculatePrice(assetId, 3, 0);  // 买断制游戏配乐
console.log('基础价格:', ethers.utils.formatEther(price.basePrice));
console.log('倍率:', price.multiplier / 100 + '%');
console.log('总价:', ethers.utils.formatEther(price.totalPrice));
```

---

#### 6. getLicense - 获取授权详情

```solidity
function getLicense(uint256 _licenseId) public view returns (License memory)
```

**参数**：`_licenseId` (uint256) - 授权 ID

**返回值**：`License` - 授权信息结构

---

#### 7. validateLicense - 验证授权有效性

```solidity
function validateLicense(uint256 _licenseId) public view returns (bool)
```

**参数**：`_licenseId` (uint256) - 授权 ID

**返回值**：`bool` - 是否有效

---

### 事件

#### LicenseIssued

```solidity
event LicenseIssued(
    uint256 indexed licenseId,
    uint256 indexed parentAssetId,
    address indexed owner,
    uint8 licenseType,
    uint256 timestamp
);
```

#### LicenseUsed

```solidity
event LicenseUsed(
    uint256 indexed licenseId,
    address indexed user,
    uint256 remainingUses,
    uint256 timestamp
);
```

---

## 📚 ECHOFusionV2 合约

### 概述

资产融合合约，支持将多个资产融合成树（Tree）结构。

### 数据结构

#### Fusion（融合信息）

```solidity
struct Fusion {
    uint256 id;                 // 融合 ID
    uint256[] componentIds;     // 组成资产的 ID 数组
    uint256[] weights;          // 各资产权重（基点）
    address creator;            // 创建者
    string name;                // 融合名称
    string description;         // 融合描述
    uint256 createdAt;          // 创建时间
    uint256 totalRevenue;       // 总收益
}
```

### 写入方法

#### 1. createFusion - 创建融合

```solidity
function createFusion(
    uint256[] memory _assetIds,
    uint256[] memory _weights,
    string memory _name,
    string memory _description
) public whenNotPaused nonReentrant returns (uint256)
```

**参数说明**：

| 参数 | 类型 | 说明 |
|------|------|------|
| `_assetIds` | uint256[] | 资产 ID 数组（2-10 个） |
| `_weights` | uint256[] | 权重数组（总和必须 = 10000） |
| `_name` | string | 融合名称 |
| `_description` | string | 融合描述 |

**限制**：
- 最少 2 个资产，最多 10 个
- 权重总和必须等于 10000（100%）
- 调用者必须拥有所有资产

**返回值**：`uint256` - 新融合 ID

**示例代码**：

```javascript
const assetIds = [1, 2, 3];  // 融合资产 1、2、3
const weights = [5000, 3000, 2000];  // 权重 50%、30%、20%

const tx = await fusionContract.createFusion(
    assetIds,
    weights,
    "My Fusion Tree",
    "Combination of three assets"
);
const receipt = await tx.wait();
```

---

#### 2. distributeRevenue - 分配收益

```solidity
function distributeRevenue(uint256 _fusionId) public payable whenNotPaused nonReentrant
```

**参数**：`_fusionId` (uint256) - 融合 ID

**支付要求**：发送的 MEER 将按权重分配给各组件资产所有者

**示例代码**：

```javascript
const revenue = ethers.utils.parseEther('1.0');  // 1 MEER

await fusionContract.distributeRevenue(fusionId, {
    value: revenue
});
```

---

#### 3. burnFusion - 销毁融合

```solidity
function burnFusion(uint256 _fusionId) public whenNotPaused
```

**参数**：`_fusionId` (uint256) - 融合 ID

**权限要求**：必须是融合创建者

---

### 读取方法

#### 4. getFusion - 获取融合详情

```solidity
function getFusion(uint256 _fusionId) public view returns (Fusion memory)
```

**参数**：`_fusionId` (uint256) - 融合 ID

**返回值**：`Fusion` - 融合信息结构

**示例代码**：

```javascript
const fusion = await fusionContract.getFusion(1);
console.log('名称:', fusion.name);
console.log('组件:', fusion.componentIds.map(id => id.toString()));
console.log('权重:', fusion.weights.map(w => w / 100 + '%'));
```

---

#### 5. getUserFusions - 获取用户的融合列表

```solidity
function getUserFusions(address _user) public view returns (uint256[] memory)
```

**参数**：`_user` (address) - 用户地址

**返回值**：`uint256[]` - 融合 ID 数组

---

### 事件

#### FusionCreated

```solidity
event FusionCreated(
    uint256 indexed fusionId,
    address indexed creator,
    uint256[] componentIds,
    uint256 timestamp
);
```

#### RevenueDistributed

```solidity
event RevenueDistributed(
    uint256 indexed fusionId,
    uint256 amount,
    uint256 timestamp
);
```

---

## 🔐 安全修饰符

| 修饰符 | 说明 |
|--------|------|
| `whenNotPaused` | 合约未暂停时才能调用 |
| `nonReentrant` | 防重入攻击保护 |
| `onlyOwner` | 仅限合约所有者 |
| `validAsset` | 资产必须存在 |
| `onlyAssetCreator` | 必须是资产创建者 |
| `onlyUsageOwner` | 必须是使用权所有者 |
| `onlyDerivativeOwner` | 必须是衍生权所有者 |
| `onlyRevenueOwner` | 必须是收益权所有者 |

---

## ⚠️ 错误代码

| 错误信息 | 说明 |
|----------|------|
| `Asset does not exist` | 资产 ID 不存在 |
| `Not asset creator` | 不是资产创建者 |
| `Not usage owner` | 不是使用权所有者 |
| `Not derivative owner` | 不是衍生权所有者 |
| `Not revenue owner` | 不是收益权所有者 |
| `Invalid price` | 价格参数无效 |
| `Insufficient payment` | 支付的 MEER 不足 |
| `Asset not for sale` | 资产不出售 |
| `License expired` | 授权已过期 |
| `License exhausted` | 授权次数已用完 |
| `Invalid weights` | 权重总和不为 10000 |
| `Too few assets` | 资产数量少于 2 个 |
| `Too many assets` | 资产数量超过 10 个 |
| `ReentrancyGuard: reentrant call` | 检测到重入攻击 |
| `Pausable: paused` | 合约已暂停 |

---

*文档版本: 1.0*  
*最后更新: 2026-03-14*
