# IPFS 存储集成配置指南

本文档介绍如何在 ECHO 协议中配置和使用 IPFS 去中心化存储。

## 目录

- [简介](#简介)
- [快速开始](#快速开始)
- [Pinata 配置（推荐）](#pinata-配置推荐)
- [Infura IPFS 配置](#infura-ipfs-配置)
- [本地 IPFS 节点配置](#本地-ipfs-节点配置)
- [使用方法](#使用方法)
- [测试上传](#测试上传)
- [故障排除](#故障排除)

## 简介

ECHO 协议使用 IPFS（InterPlanetary File System）作为去中心化存储解决方案，用于存储：

- 音乐音频文件
- 封面图片
- 作品元数据（NFT metadata）

## 快速开始

1. 选择 IPFS 服务提供商（推荐 Pinata）
2. 注册账号并获取 API 密钥
3. 配置环境变量
4. 运行测试脚本验证连接

## Pinata 配置（推荐）

Pinata 是最友好的 IPFS 托管服务，提供免费套餐。

### 1. 注册账号

访问 https://pinata.cloud 注册账号。

### 2. 获取 API 密钥

1. 登录后点击左侧菜单 "API Keys"
2. 点击 "New Key" 创建新密钥
3. 选择 "Admin" 权限（或使用自定义权限）
4. 复制生成的 **API Key** 和 **API Secret**

### 3. 配置环境变量

在 `.env` 文件中添加：

```bash
# IPFS 提供商选择
IPFS_PROVIDER=pinata

# Pinata API 密钥（必需）
PINATA_API_KEY=your_api_key_here
PINATA_SECRET_KEY=your_secret_key_here

# 可选: Pinata JWT（用于高级功能）
# PINATA_JWT=your_jwt_token_here
```

## Infura IPFS 配置

如果你已有 Infura 账号，可以使用 Infura 的 IPFS 服务。

### 1. 获取 IPFS 项目凭证

1. 登录 https://infura.io
2. 创建新项目或选择现有项目
3. 在项目设置中找到 "IPFS" 部分
4. 复制 **Project ID** 和 **Project Secret**

### 2. 配置环境变量

```bash
# 切换到 Infura 提供商
IPFS_PROVIDER=infura

# Infura IPFS 凭证
INFURA_IPFS_PROJECT_ID=your_project_id
INFURA_IPFS_PROJECT_SECRET=your_project_secret
```

## 本地 IPFS 节点配置

适用于本地开发环境。

### 1. 安装 IPFS

**选项 A: IPFS Desktop（推荐）**
```bash
# macOS
brew install --cask ipfs

# Windows
# 从 https://github.com/ipfs/ipfs-desktop/releases 下载安装

# Linux
wget https://github.com/ipfs/ipfs-desktop/releases/latest/download/ipfs-desktop-linux-amd64.deb
sudo dpkg -i ipfs-desktop-linux-amd64.deb
```

**选项 B: Go-IPFS 命令行**
```bash
# macOS/Linux
wget https://dist.ipfs.io/go-ipfs/v0.20.0/go-ipfs_v0.20.0_linux-amd64.tar.gz
tar -xvzf go-ipfs_v0.20.0_linux-amd64.tar.gz
cd go-ipfs
sudo bash install.sh

# 初始化并启动
ipfs init
ipfs daemon
```

### 2. 配置环境变量

```bash
# 使用本地节点
IPFS_PROVIDER=local

# 本地节点地址（默认）
IPFS_LOCAL_API_URL=http://localhost:5001
IPFS_LOCAL_GATEWAY_URL=http://localhost:8080
```

## 使用方法

### 基本 API

```javascript
const ipfsService = require('./scripts/core/ipfs-service');

// 上传文件
const result = await ipfsService.uploadFile('/path/to/file.mp3', {
  onProgress: (progress) => console.log(`上传进度: ${progress}%`)
});
console.log('CID:', result.cid);
console.log('URL:', result.url);

// 上传元数据
const metadata = {
  name: '我的音乐作品',
  description: '这是一首很棒的歌',
  image: 'ipfs://cover_cid_here',
  animation_url: 'ipfs://audio_cid_here'
};
const metaResult = await ipfsService.uploadMetadata(metadata);

// 获取网关 URL
const url = ipfsService.getGatewayUrl('QmXxx...');
```

### 上传音乐作品完整流程

```javascript
const ipfsService = require('./scripts/core/ipfs-service');

async function uploadMusicWork(workData, audioPath, coverPath) {
  // 1. 上传音频文件
  console.log('上传音频...');
  const audioResult = await ipfsService.uploadFile(audioPath, {
    onProgress: (p) => console.log(`音频上传: ${p}%`)
  });
  
  // 2. 上传封面图片
  console.log('上传封面...');
  const coverResult = await ipfsService.uploadFile(coverPath, {
    onProgress: (p) => console.log(`封面上传: ${p}%`)
  });
  
  // 3. 创建并上传元数据
  console.log('创建元数据...');
  const { cid, url, metadata } = await ipfsService.uploadWorkMetadata(
    workData,
    audioResult.cid,
    coverResult.cid,
    {
      genre: 'Electronic',
      bpm: 128,
      duration: '3:45'
    }
  );
  
  return {
    metadataCid: cid,
    metadataUrl: url,
    audioCid: audioResult.cid,
    coverCid: coverResult.cid,
    metadata
  };
}

// 使用示例
const result = await uploadMusicWork(
  {
    name: '夏日微风',
    description: '一首轻快的夏日电子音乐',
    artist: 'ECHO Artist'
  },
  './assets/summer-breeze.mp3',
  './assets/summer-breeze-cover.jpg'
);

console.log('作品元数据 URI:', result.metadataUrl);
// 用于 NFT 铸造: tokenURI = ipfs://{result.metadataCid}
```

## 测试上传

### 方法 1: 使用测试脚本

创建测试文件 `test-ipfs.js`：

```javascript
const ipfsService = require('./scripts/core/ipfs-service');
const fs = require('fs');
const path = require('path');

async function test() {
  console.log('=== ECHO IPFS 测试 ===\n');
  
  // 显示配置摘要
  console.log('配置:', ipfsService.config.getConfigSummary());
  console.log();
  
  // 验证配置
  const validation = ipfsService.config.validateConfig();
  if (!validation.valid) {
    console.error('配置错误:', validation.errors);
    process.exit(1);
  }
  
  // 测试连接
  console.log('测试连接...');
  const connected = await ipfsService.testConnection();
  if (!connected) {
    console.error('连接失败！');
    process.exit(1);
  }
  
  // 创建测试文件
  const testContent = `ECHO Protocol Test - ${new Date().toISOString()}`;
  const testFile = path.join(__dirname, 'test-file.txt');
  fs.writeFileSync(testFile, testContent);
  
  // 测试文件上传
  console.log('\n测试文件上传...');
  const fileResult = await ipfsService.uploadFile(testFile, {
    onProgress: (p) => process.stdout.write(`\r进度: ${p}%`)
  });
  console.log('\n文件上传成功:');
  console.log('  CID:', fileResult.cid);
  console.log('  URL:', fileResult.url);
  console.log('  Size:', fileResult.size);
  
  // 测试元数据上传
  console.log('\n测试元数据上传...');
  const metaResult = await ipfsService.uploadMetadata({
    name: 'Test NFT',
    description: 'Test metadata for ECHO',
    test: true,
    timestamp: Date.now()
  });
  console.log('元数据上传成功:');
  console.log('  CID:', metaResult.cid);
  console.log('  URL:', metaResult.url);
  
  // 清理测试文件
  fs.unlinkSync(testFile);
  
  console.log('\n✅ 所有测试通过！');
}

test().catch(console.error);
```

运行测试：
```bash
cd echo-demo
node test-ipfs.js
```

### 方法 2: 快速验证

```bash
# 验证配置
node -e "const c = require('./config/ipfs-config'); console.log(c.validateConfig());"

# 测试连接
node -e "const s = require('./scripts/core/ipfs-service'); s.testConnection();"
```

## 故障排除

### 1. "PINATA_API_KEY is required" 错误

**原因**: 环境变量未设置
**解决**: 
- 检查 `.env` 文件是否存在
- 确认变量名正确（PINATA_API_KEY, PINATA_SECRET_KEY）
- 重启终端以加载新环境变量

### 2. 上传超时

**原因**: 文件过大或网络问题
**解决**:
```bash
# 增加超时时间
IPFS_UPLOAD_TIMEOUT=600000  # 10分钟
```

### 3. 网关无法访问

**原因**: IPFS 网络拥堵或网关故障
**解决**: 使用 `getAvailableGatewayUrl()` 自动选择可用网关

```javascript
const url = await ipfsService.getAvailableGatewayUrl(cid);
```

### 4. 本地节点连接失败

**原因**: IPFS 守护进程未运行
**解决**:
```bash
# 检查 IPFS 状态
ipfs daemon

# 或在另一个终端运行
ipfs id
```

### 5. CORS 错误（浏览器环境）

如果在浏览器中使用，需要配置 IPFS 节点 CORS：

```bash
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Origin '["*"]'
ipfs config --json API.HTTPHeaders.Access-Control-Allow-Methods '["PUT", "POST", "GET"]'
```

## 安全注意事项

⚠️ **永远不要将真实的 API Key 提交到 Git！**

1. `.env` 文件已在 `.gitignore` 中被忽略
2. 提交前检查：
   ```bash
   git status  # 确保 .env 不在待提交列表中
   ```
3. 如意外提交敏感信息，立即轮换 API Key

## 相关资源

- [Pinata 文档](https://docs.pinata.cloud/)
- [IPFS 官方文档](https://docs.ipfs.io/)
- [Infura IPFS](https://infura.io/docs/ipfs)

---

如有问题，请参考 `scripts/core/ipfs-service.js` 中的完整 API 文档。
