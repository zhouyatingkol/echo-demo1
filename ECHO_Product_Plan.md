# ECHO Protocol 产品化规划

## 1. 现状分析

### 当前纯前端演示功能
| Stage | 功能 | 当前状态 |
|-------|------|----------|
| Stage 0 | 开场动画 | 纯展示 |
| Stage 0.5 | 铸造说明 | 纯展示 |
| Stage 1 | 资产铸造 | 模拟数据，无真实上链 |
| Stage 1.5 | 融合说明 | 纯展示 |
| Stage 2 | 协作衍生 | 模拟拖拽融合 |
| Stage 3 | 权属蓝图 | 纯展示 |
| Stage 4 | 数字账本 | 纯展示 |
| Stage 5 | 融资变现 | 纯展示 |

### 核心技术缺失
- ❌ 用户系统（注册/登录/钱包绑定）
- ❌ 区块链交互（NFT铸造/转移）
- ❌ 数据库（资产存储/查询）
- ❌ 后端API（业务逻辑）
- ❌ 文件存储（资产文件/IPFS）

---

## 2. MVP版本规划

### 目标
实现最核心业务闭环：**铸造 → 融合 → 展示**

### 技术栈推荐

#### 前端（保留现有 + 扩展）
```
框架: Next.js 14 (App Router)
状态: Zustand
样式: Tailwind CSS (保留现有glass-card设计系统)
Web3: wagmi + viem
组件: shadcn/ui
```

#### 后端
```
语言: Node.js + TypeScript
框架: Express / NestJS
数据库: PostgreSQL + Redis
ORM: Prisma
存储: IPFS (Pinata) + AWS S3
```

#### 区块链
```
链: Polygon (低gas费) / Ethereum (主网)
合约: ERC-721 (NFT) + ERC-1155 (权益份额)
工具: Hardhat + OpenZeppelin
```

---

## 3. 数据库模型设计

```prisma
// User 用户
model User {
  id        String   @id @default(uuid())
  wallet    String   @unique // 钱包地址
  email     String?  @unique
  name      String?
  avatar    String?
  createdAt DateTime @default(now())
  
  assets    Asset[]
  fusionTrees FusionTree[]
}

// Asset 数字资产
model Asset {
  id          String   @id @default(uuid())
  tokenId     String?  @unique // 链上NFT ID
  name        String
  description String
  type        AssetType // PATENT, SOFTWARE, DATA, etc.
  
  // 文件存储
  fileUrl     String   // IPFS哈希
  metadataUrl String   // NFT metadata JSON
  
  // 权利属性（对应现有5维权利）
  ownership    Boolean @default(true)  // 所有权
  usage        Boolean @default(false) // 使用权
  distribution Boolean @default(false) // 分发权
  derivative   Boolean @default(false) // 衍生权
  pricing      Boolean @default(false) // 定价权
  
  // 状态
  status      AssetStatus @default(DRAFT)
  
  // 关系
  creatorId   String
  creator     User     @relation(fields: [creatorId], references: [id])
  
  // 融合关系
  parentTreeId String?
  parentTree   FusionTree? @relation(fields: [parentTreeId], references: [id])
  
  createdAt   DateTime @default(now())
  mintedAt    DateTime?
  txHash      String?  // 铸造交易哈希
}

// FusionTree 融合树
model FusionTree {
  id          String   @id @default(uuid())
  name        String
  tokenId     String?  @unique // 融合后的NFT
  
  // 融合规则
  totalShares Int      @default(10000) // 总权益份额
  
  // 关系
  creatorId   String
  creator     User     @relation(fields: [creatorId], references: [id])
  
  assets      Asset[]  // 包含的资产
  shares      Share[]  // 权益分配
  
  createdAt   DateTime @default(now())
  txHash      String?
}

// Share 权益份额
model Share {
  id        String @id @default(uuid())
  treeId    String
  tree      FusionTree @relation(fields: [treeId], references: [id])
  
  assetId   String
  asset     Asset      @relation(fields: [assetId], references: [id])
  
  shares    Int        // 占比份额
  percentage Float     // 百分比缓存
}

enum AssetType {
  PATENT
  SOFTWARE
  DATASET
  TRADEMARK
  COPYRIGHT
}

enum AssetStatus {
  DRAFT      // 草稿
  MINTING    // 铸造中
  MINTED     // 已铸造
  FUSING     // 融合中
  FUSED      // 已融合
}
```

---

## 4. API 接口设计

### 用户相关
```
POST /api/auth/nonce        - 获取签名nonce
POST /api/auth/verify       - 验证签名登录
GET  /api/user/me           - 获取当前用户
PUT  /api/user/profile      - 更新用户信息
```

### 资产相关
```
GET    /api/assets          - 获取资产列表（支持分页/筛选）
GET    /api/assets/:id      - 获取单个资产详情
POST   /api/assets          - 创建资产（上传文件+metadata）
PUT    /api/assets/:id      - 更新资产信息
DELETE /api/assets/:id      - 删除草稿资产

POST   /api/assets/:id/mint - 铸造NFT
GET    /api/assets/:id/status - 查询铸造状态
```

### 融合相关
```
POST /api/fusions           - 创建融合树
GET  /api/fusions           - 获取融合树列表
GET  /api/fusions/:id       - 获取融合树详情
POST /api/fusions/:id/execute - 执行融合（上链）
```

### 文件上传
```
POST /api/upload/presigned  - 获取预签名上传URL
POST /api/upload/ipfs       - 上传到IPFS
```

---

## 5. 智能合约设计

```solidity
// ECHOAsset.sol - ERC-721 资产合约
contract ECHOAsset is ERC721, Ownable {
    uint256 private _tokenIdCounter;
    
    struct AssetMetadata {
        string name;
        string description;
        string metadataURI;
        AssetType assetType;
        uint256 createdAt;
    }
    
    mapping(uint256 => AssetMetadata) public assets;
    
    function mint(address to, AssetMetadata memory metadata) 
        external 
        returns (uint256) 
    {
        uint256 tokenId = _tokenIdCounter++;
        _safeMint(to, tokenId);
        assets[tokenId] = metadata;
        return tokenId;
    }
}

// ECHOFusion.sol - 融合合约
contract ECHOFusion is ERC1155, Ownable {
    uint256 private _fusionIdCounter;
    
    struct FusionTree {
        uint256[] sourceTokens;    // 源资产token IDs
        uint256[] shares;          // 各资产权益占比
        address creator;
        uint256 createdAt;
    }
    
    mapping(uint256 => FusionTree) public fusionTrees;
    
    // 融合多个资产创建新的权益代币
    function fuse(
        uint256[] calldata sourceTokens,
        uint256[] calldata shares,
        string calldata uri
    ) external returns (uint256 fusionId) {
        // 验证所有权
        for (uint i = 0; i < sourceTokens.length; i++) {
            require(
                ECHOAsset.ownerOf(sourceTokens[i]) == msg.sender,
                "Not owner"
            );
        }
        
        fusionId = _fusionIdCounter++;
        _mint(msg.sender, fusionId, 1, "");
        
        fusionTrees[fusionId] = FusionTree({
            sourceTokens: sourceTokens,
            shares: shares,
            creator: msg.sender,
            createdAt: block.timestamp
        });
        
        _setURI(fusionId, uri);
    }
}
```

---

## 6. 开发阶段规划

### Phase 1: 基础设施 (2周)
- [ ] 后端项目搭建 (NestJS + Prisma)
- [ ] 数据库部署 (PostgreSQL + Redis)
- [ ] 区块链环境配置 (Hardhat本地网络)
- [ ] 部署脚本和CI/CD

### Phase 2: 用户系统 (1周)
- [ ] 钱包登录/签名验证
- [ ] JWT Token机制
- [ ] 用户信息管理

### Phase 3: 资产铸造 (2周)
- [ ] 文件上传 (IPFS)
- [ ] 资产CRUD API
- [ ] NFT合约部署
- [ ] 铸造流程打通

### Phase 4: 融合功能 (2周)
- [ ] 融合树CRUD API
- [ ] 融合合约开发
- [ ] 融合流程打通

### Phase 5: 前端改造 (2周)
- [ ] Next.js项目搭建
- [ ] Web3连接 (wagmi)
- [ ] 页面迁移 + API对接
- [ ] 现有设计系统保留

### Phase 6: 测试上线 (1周)
- [ ] 合约审计
- [ ] 集成测试
- [ ] 部署到测试网

**总计: 约10周（2个半月）**

---

## 7. 团队配置建议

### 方案A：最小团队 (3人)
| 角色 | 人数 | 职责 |
|------|------|------|
| 全栈工程师 | 1人 | 前端 + 后端 + 合约 |
| 前端工程师 | 1人 | 专注前端改造 |
| 产品经理 | 1人 | 需求 + 测试 |

### 方案B：标准团队 (5人)
| 角色 | 人数 | 职责 |
|------|------|------|
| 后端工程师 | 1人 | API + 数据库 |
| Web3工程师 | 1人 | 合约 + 链交互 |
| 前端工程师 | 2人 | Next.js + Web3 |
| 产品经理 | 1人 | 需求 + 设计协调 |

---

## 8. 成本估算

### 开发成本（按月）
- 人力: ¥150,000 - 300,000
- 服务器: ¥2,000 - 5,000
- 区块链费用: ¥5,000 - 10,000 (测试网+主网部署)

### 运营成本（每月）
- 服务器: ¥3,000 - 8,000
- IPFS存储: ¥1,000 - 3,000
- 数据库: ¥2,000 - 5,000

---

## 9. 风险与建议

### 技术风险
1. **区块链交互复杂性** → 建议先上Polygon测试网
2. **IPFS存储成本** → 考虑Arweave作为备选
3. **合约安全性** → 必须找专业审计

### 产品风险
1. **合规问题** → RWA需要法律框架支持
2. **用户教育成本** → Web3钱包使用门槛高
3. **流动性问题** → 融合后的权益如何交易？

### 建议
1. 先做 **MVP**（铸造+展示），不上链
2. 验证市场需求后再投入合约开发
3. 与法律团队确认合规性
4. 考虑从 **联盟链/私有链** 起步

---

## 10. 下一步行动

请告诉我：
1. **预算范围**？（决定团队规模和开发周期）
2. **时间要求**？（是否有硬性上线时间）
3. **上链必须性**？（MVP可以先不上链）
4. **目标用户**？（B端企业还是C端个人）

我会根据您的回答调整规划并启动开发。