# ECHO Protocol Demo 规划
## Qitmeer网络 + ECHO资产小Demo

---

## 1. Demo范围

**目标**：验证核心概念 - ECHO资产的铸造和四权分配

**包含功能**：
1. 钱包连接（Qitmeer/MeerEVM）
2. 铸造ECHO资产（带四权配置）
3. 查看资产详情（展示四权）
4. 简单的权利转移（使用权授权）

**不包含**：
- 复杂的资产融合
- 交易 marketplace
- 完整的前端页面

---

## 2. 技术栈

| 层级 | 技术 | 说明 |
|-----|------|-----|
| 区块链 | Qitmeer Testnet | MeerEVM兼容，低gas |
| 合约 | Solidity | ERC-721变种 |
| 前端 | HTML + ethers.js | 极简，仅验证功能 |
| 存储 | IPFS/Local | 资产元数据 |

---

## 3. 智能合约设计

### ECHOAsset.sol

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ECHOAsset is ERC721 {
    // ECHO资产的四种权利
    struct Rights {
        address usageOwner;      // 使用权所有者
        address derivativeOwner; // 衍生权所有者
        address extensionOwner;  // 扩展权所有者
        address revenueOwner;    // 收益权所有者
        
        uint256 usageFee;        // 使用费（每次）
        uint256 derivativeShare; // 衍生收益分成（百分比）
        uint256 revenueShare;    // 收益分成（百分比）
    }
    
    mapping(uint256 => Rights) public assetRights;
    mapping(uint256 => string) public assetURIs;
    
    uint256 private _tokenIdCounter;
    
    event AssetMinted(
        uint256 indexed tokenId,
        address indexed creator,
        string uri
    );
    
    event RightsUpdated(
        uint256 indexed tokenId,
        string rightType,
        address newOwner
    );

    constructor() ERC721("ECHO Asset", "ECHO") {}
    
    // 铸造ECHO资产
    function mintECHO(
        string memory uri,
        Rights memory rights
    ) public returns (uint256) {
        uint256 tokenId = _tokenIdCounter++;
        
        _safeMint(msg.sender, tokenId);
        assetURIs[tokenId] = uri;
        assetRights[tokenId] = rights;
        
        emit AssetMinted(tokenId, msg.sender, uri);
        return tokenId;
    }
    
    // 转移使用权
    function transferUsageRight(
        uint256 tokenId, 
        address newOwner
    ) public {
        require(
            assetRights[tokenId].usageOwner == msg.sender,
            "Not usage owner"
        );
        assetRights[tokenId].usageOwner = newOwner;
        emit RightsUpdated(tokenId, "usage", newOwner);
    }
    
    // 支付使用费获得使用权
    function payForUsage(uint256 tokenId) public payable {
        Rights storage rights = assetRights[tokenId];
        require(msg.value >= rights.usageFee, "Insufficient fee");
        
        // 支付给收益权所有者
        payable(rights.revenueOwner).transfer(msg.value);
        
        // 临时获得使用权（简化版）
        // 实际应有时效机制
    }
    
    // 获取资产完整信息
    function getAssetInfo(uint256 tokenId) public view returns (
        string memory uri,
        Rights memory rights
    ) {
        return (assetURIs[tokenId], assetRights[tokenId]);
    }
}
```

---

## 4. 前端Demo页面

### 页面结构
```
demo/
├── index.html          # 主页面
├── app.js              # 交互逻辑
├── contract.js         # 合约ABI和地址
└── style.css           # 极简样式
```

### 核心功能
1. **连接钱包** - 连接Qitmeer Testnet
2. **铸造表单** - 输入资产信息和四权配置
3. **资产列表** - 显示用户拥有的ECHO资产
4. **权利管理** - 查看和转移各项权利

---

## 5. 开发步骤

### Step 1: 环境准备（1天）
- [ ] 配置Hardhat + Qitmeer Testnet
- [ ] 获取Testnet MEER代币
- [ ] 准备IPFS上传工具

### Step 2: 合约开发（2天）
- [ ] 编写ECHOAsset.sol
- [ ] 编写测试用例
- [ ] 部署到Testnet
- [ ] 验证合约

### Step 3: 前端Demo（2天）
- [ ] 创建极简HTML界面
- [ ] 集成ethers.js
- [ ] 实现铸造功能
- [ ] 实现查询功能

### Step 4: 测试验证（1天）
- [ ] 端到端测试
- [ ] 演示视频录制

**总计：约6天**

---

## 6. 关键设计决策

### 为什么是四权分离？
```
传统NFT: 所有权 = 使用权 + 收益权（捆绑）

ECHO资产: 
  ├── 所有权（token本身）
  ├── 使用权（可以单独授权）
  ├── 衍生权（别人基于此开发）
  ├── 扩展权（功能扩展）
  └── 收益权（收益分配）
```

### 使用权如何实现？
- 支付使用费 → 获得临时使用权
- 使用费自动分配给收益权所有者
- 使用权可以单独转移

### 衍生权是什么？
- 别人用你的资产创建新资产
- 衍生作品收益按约定分成
- 类似开源许可证的商业模式

---

## 7. Demo验收标准

- [ ] 能连接Qitmeer Testnet钱包
- [ ] 能成功铸造ECHO资产
- [ ] 铸造时正确设置四权
- [ ] 能查看资产的四权信息
- [ ] 能转移使用权
- [ ] 能支付使用费

---

## 8. 后续扩展方向

Demo验证成功后：
1. 资产融合功能（多资产组合）
2. 交易市场（权利买卖）
3. 完整前端（ECHO Protocol完整界面）
4. 跨链支持（Qitmeer ↔ 其他链）