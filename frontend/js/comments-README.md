# ECHO Music Comment System

音乐评论系统 - 支持 IPFS 存储和可选的区块链合约记录

## 功能特性

1. **评论数据存储到 IPFS** - 去中心化存储评论内容
2. **评论哈希存到合约（可选）** - 可选的链上记录
3. **评论列表展示** - 支持嵌套回复
4. **发表评论** - 支持主评论和回复
5. **评论点赞** - 本地存储 + 可选链上记录

## 快速开始

### 基础使用

```javascript
// 引入评论系统
import { CommentSystem, CommentUI, injectCommentStyles } from './js/comments.js';

// 注入CSS样式
injectCommentStyles();

// 初始化评论系统
const commentSystem = new CommentSystem({
  userAddress: '0x...' // 当前用户地址
});

// 初始化UI
const commentUI = new CommentUI(commentSystem, 'comments-container');
commentUI.setToken(123); // 设置当前音乐NFT的tokenId
```

### 配合钱包使用

```javascript
// 使用 ethers.js 获取 signer
const provider = new ethers.BrowserProvider(window.ethereum);
const signer = await provider.getSigner();
const userAddress = await signer.getAddress();

// 初始化评论系统（完整配置）
const commentSystem = new CommentSystem({
  // IPFS配置
  pinataApiKey: 'your-pinata-api-key',
  pinataSecretKey: 'your-pinata-secret-key',
  // web3StorageToken: 'your-web3-storage-token', // 备选
  
  // 合约配置（可选）
  contractAddress: '0x...',
  signer: signer,
  
  // 用户配置
  userAddress: userAddress
});

// 设置UI
document.getElementById('connect-btn').addEventListener('click', async () => {
  await window.ethereum.request({ method: 'eth_requestAccounts' });
  commentSystem.setUser(userAddress);
  commentUI.render();
});
```

## API 参考

### CommentSystem 类

#### 构造函数选项

```javascript
new CommentSystem({
  // IPFS 配置
  ipfsGateway: 'https://ipfs.io/ipfs/',        // IPFS网关
  pinataApiKey: 'your-api-key',                // Pinata API Key
  pinataSecretKey: 'your-secret-key',          // Pinata Secret Key
  web3StorageToken: 'your-token',              // Web3.Storage Token
  
  // 合约配置（可选）
  contractAddress: '0x...',                   // 评论注册合约地址
  signer: ethersSigner,                         // Ethers signer
  
  // 用户配置
  userAddress: '0x...'                          // 当前用户地址
});
```

#### 主要方法

##### `loadComments(tokenId)`
加载指定Token的所有评论

```javascript
const comments = await commentSystem.loadComments(123);
// 返回: [{ id, tokenId, author, text, timestamp, likes, parentId, ipfsHash, contentHash }, ...]
```

##### `postComment(tokenId, text, parentId)`
发表评论

```javascript
// 发表主评论
const comment = await commentSystem.postComment(123, '这首歌太棒了！');

// 回复评论
const reply = await commentSystem.postComment(123, '我也觉得！', comment.id);
```

##### `likeComment(commentId, tokenId)`
点赞评论

```javascript
await commentSystem.likeComment('comment-uuid', 123);
```

##### `replyToComment(tokenId, parentId, text)`
回复评论（`postComment` 的别名）

```javascript
await commentSystem.replyToComment(123, parentCommentId, '同意你的观点！');
```

##### `getReplies(tokenId, parentId)`
获取评论的回复列表

```javascript
const replies = await commentSystem.getReplies(123, parentId);
```

##### `hasLiked(commentId)`
检查用户是否已点赞

```javascript
const liked = commentSystem.hasLiked('comment-uuid');
```

### CommentUI 类

#### 构造函数

```javascript
const commentUI = new CommentUI(commentSystem, 'container-id');
```

#### 方法

##### `setToken(tokenId)`
设置当前显示的Token ID

```javascript
commentUI.setToken(123);
```

##### `render()`
渲染评论列表（自动调用）

```javascript
await commentUI.render();
```

##### 回调函数

```javascript
// 评论提交成功回调
commentUI.onSubmit(() => {
  console.log('评论已提交！');
});

// 点赞成功回调
commentUI.onLike(() => {
  console.log('点赞成功！');
});
```

## 数据结构

### Comment 对象

```javascript
{
  id: "uuid",                    // 唯一标识符
  tokenId: 123,                  // NFT Token ID
  author: "0x...",               // 作者地址
  text: "评论内容",               // 评论文本
  timestamp: 1234567890,         // 时间戳（秒）
  likes: 5,                      // 点赞数
  parentId: null,                // 父评论ID（回复功能）
  ipfsHash: "Qm...",             // IPFS哈希
  contentHash: "0x..."           // 内容哈希（keccak256）
}
```

## IPFS 存储选项

### 1. Pinata (推荐用于生产)

```javascript
const commentSystem = new CommentSystem({
  pinataApiKey: 'your-api-key',
  pinataSecretKey: 'your-secret-key'
});
```

### 2. Web3.Storage

```javascript
const commentSystem = new CommentSystem({
  web3StorageToken: 'your-token'
});
```

### 3. 开发模式（使用 localStorage 模拟）

不配置任何IPFS选项时，自动使用 localStorage 作为开发环境备用

## 合约集成（可选）

### 部署评论注册合约

```solidity
// CommentRegistry.sol
contract CommentRegistry {
    struct CommentRecord {
        string ipfsHash;
        uint256 timestamp;
        uint256 likeCount;
    }
    
    mapping(uint256 => bytes32[]) public tokenComments;
    mapping(bytes32 => CommentRecord) public comments;
    
    event CommentStored(uint256 indexed tokenId, bytes32 indexed contentHash, string ipfsHash, address indexed author);
    event CommentLiked(bytes32 indexed contentHash, address indexed user, uint256 likeCount);
    
    function storeCommentHash(uint256 tokenId, bytes32 contentHash, string memory ipfsHash) external {
        // 实现存储逻辑
    }
    
    function likeComment(bytes32 contentHash) external {
        // 实现点赞逻辑
    }
}
```

### 配置合约地址

```javascript
const commentSystem = new CommentSystem({
  contractAddress: '0xYourContractAddress',
  signer: signer,  // Ethers signer
  userAddress: address
});
```

## 完整示例

```html
<!DOCTYPE html>
<html>
<head>
  <title>ECHO Music - Comments</title>
  <script src="./js/comments.js"></script>
</head>
<body>
  <div id="comments-section"></div>
  
  <script>
    // 注入样式
    injectCommentStyles();
    
    // 初始化
    const commentSystem = new CommentSystem({
      userAddress: '0x...'
    });
    
    const commentUI = new CommentUI(commentSystem, 'comments-section');
    commentUI.setToken(1);
  </script>
</body>
</html>
```

## 浏览器兼容性

- Chrome 80+
- Firefox 75+
- Safari 13.1+
- Edge 80+

## 依赖

- ethers.js (可选，用于合约交互)
- 现代浏览器支持 Fetch API 和 async/await

## 许可证

MIT