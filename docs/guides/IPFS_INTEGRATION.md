# IPFS 与作品上链流程集成指南

本文档说明如何在 ECHO 作品生成和上链流程中集成 IPFS 存储。

## 流程概述

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  创建作品   │───>│ 上传 IPFS   │───>│  获取 CID   │───>│ 铸造 NFT    │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
      │                  │                  │                  │
      ▼                  ▼                  ▼                  ▼
  音频文件           音频 CID         metadata URI      链上记录
  封面图片           图片 CID         tokenURI          作品数据
  元数据 JSON        metadata CID
```

## 集成步骤

### 1. 在作品创建脚本中引入 IPFS 服务

```javascript
// scripts/core/creator.js 或其他作品创建脚本

const ipfsService = require('./ipfs-service');

class ECHOWorkCreator {
  constructor() {
    // 验证 IPFS 配置
    const validation = ipfsService.config.validateConfig();
    if (!validation.valid) {
      throw new Error(`IPFS 配置错误: ${validation.errors.join(', ')}`);
    }
  }
  
  /**
   * 创建并上传作品
   */
  async createWork(workData, files) {
    const { audioPath, coverPath } = files;
    
    // 1. 上传音频文件
    console.log('📤 上传音频到 IPFS...');
    const audioResult = await ipfsService.uploadFile(audioPath, {
      onProgress: (progress) => {
        this.emit('uploadProgress', { type: 'audio', progress });
      }
    });
    
    // 2. 上传封面图片
    console.log('📤 上传封面到 IPFS...');
    const coverResult = await ipfsService.uploadFile(coverPath, {
      onProgress: (progress) => {
        this.emit('uploadProgress', { type: 'cover', progress });
      }
    });
    
    // 3. 创建元数据并上传
    console.log('📝 创建作品元数据...');
    const { cid: metadataCid, url: metadataUrl } = await ipfsService.uploadWorkMetadata(
      workData,
      audioResult.cid,
      coverResult.cid,
      workData.attributes || {}
    );
    
    return {
      // 用于铸造 NFT
      tokenURI: `ipfs://${metadataCid}`,
      metadataUrl,
      
      // 资源 CID
      audioCid: audioResult.cid,
      coverCid: coverResult.cid,
      metadataCid,
      
      // 完整数据
      workData: {
        ...workData,
        audioUrl: audioResult.url,
        coverUrl: coverResult.url
      }
    };
  }
  
  emit(event, data) {
    // 事件通知，用于 UI 更新
    console.log(`[${event}]`, data);
  }
}

module.exports = ECHOWorkCreator;
```

### 2. 在铸造流程中使用

```javascript
// 作品铸造脚本

const ECHOWorkCreator = require('./creator');
const ContractManager = require('./contract-manager');

async function mintWork(workData, files) {
  // 1. 创建作品并上传到 IPFS
  const creator = new ECHOWorkCreator();
  const ipfsResult = await creator.createWork(workData, files);
  
  console.log('✅ IPFS 上传完成');
  console.log('  Token URI:', ipfsResult.tokenURI);
  console.log('  Audio CID:', ipfsResult.audioCid);
  console.log('  Cover CID:', ipfsResult.coverCid);
  
  // 2. 铸造 NFT
  const contract = new ContractManager();
  const tx = await contract.mintAsset(
    workData.creatorAddress,
    ipfsResult.tokenURI,  // 使用 IPFS URI
    workData.initialPrice,
    workData.royaltyPercentage
  );
  
  console.log('✅ NFT 铸造完成');
  console.log('  Transaction:', tx.hash);
  console.log('  Token ID:', tx.tokenId);
  
  // 3. 保存作品记录
  const workRecord = {
    tokenId: tx.tokenId,
    tokenURI: ipfsResult.tokenURI,
    audioCid: ipfsResult.audioCid,
    coverCid: ipfsResult.coverCid,
    metadataCid: ipfsResult.metadataCid,
    transactionHash: tx.hash,
    createdAt: new Date().toISOString()
  };
  
  // 保存到数据库或文件
  await saveWorkRecord(workRecord);
  
  return workRecord;
}
```

### 3. 前端集成示例

```javascript
// 前端上传组件

import { uploadFile, uploadMetadata, getGatewayUrl } from './ipfs-service';

async function handleWorkSubmit(formData) {
  const { audioFile, coverFile, name, description, artist } = formData;
  
  try {
    // 1. 上传音频
    setUploadStatus('上传音频文件...');
    const audioResult = await uploadFile(audioFile, {
      onProgress: (progress) => setAudioProgress(progress)
    });
    
    // 2. 上传封面
    setUploadStatus('上传封面图片...');
    const coverResult = await uploadFile(coverFile, {
      onProgress: (progress) => setCoverProgress(progress)
    });
    
    // 3. 创建元数据
    const metadata = {
      name,
      description,
      image: `ipfs://${coverResult.cid}`,
      animation_url: `ipfs://${audioResult.cid}`,
      attributes: [
        { trait_type: 'Artist', value: artist }
      ]
    };
    
    setUploadStatus('上传元数据...');
    const metaResult = await uploadMetadata(metadata);
    
    // 4. 铸造 NFT（调用智能合约）
    setUploadStatus('铸造 NFT...');
    const tokenURI = `ipfs://${metaResult.cid}`;
    const tx = await contract.mint(tokenURI, price);
    
    return {
      success: true,
      tokenId: tx.tokenId,
      tokenURI,
      metadataUrl: metaResult.url
    };
    
  } catch (error) {
    console.error('上传失败:', error);
    return { success: false, error: error.message };
  }
}
```

## 元数据格式规范

ECHO 协议推荐使用以下元数据格式：

```json
{
  "name": "作品名称",
  "description": "作品描述",
  "image": "ipfs://封面图片CID",
  "animation_url": "ipfs://音频文件CID",
  "external_url": "https://echo.protocol/work/123",
  "attributes": [
    { "trait_type": "Artist", "value": "艺术家名称" },
    { "trait_type": "Genre", "value": "Electronic" },
    { "trait_type": "BPM", "value": 128 },
    { "trait_type": "Key", "value": "C Major" },
    { "trait_type": "Duration", "value": "3:45" },
    { "trait_type": "Release Date", "value": "2024-03-14" }
  ],
  "properties": {
    "audio": {
      "cid": "音频CID",
      "url": "https://gateway.pinata.cloud/ipfs/音频CID",
      "format": "mp3",
      "duration": 225
    },
    "cover": {
      "cid": "封面CID",
      "url": "https://gateway.pinata.cloud/ipfs/封面CID",
      "format": "jpg"
    },
    "creator": {
      "address": "0x...",
      "name": "艺术家名称"
    }
  }
}
```

## 错误处理

```javascript
async function safeUpload(file) {
  try {
    return await ipfsService.uploadFile(file);
  } catch (error) {
    if (error.response?.status === 401) {
      throw new Error('IPFS API 认证失败，请检查 API Key');
    } else if (error.code === 'ENOTFOUND') {
      throw new Error('无法连接到 IPFS 服务，请检查网络');
    } else if (error.response?.status === 413) {
      throw new Error('文件过大，超过服务限制');
    }
    throw error;
  }
}
```

## 性能优化

### 1. 并发上传

```javascript
async function concurrentUpload(audioFile, coverFile) {
  const [audioResult, coverResult] = await Promise.all([
    ipfsService.uploadFile(audioFile, { onProgress: setAudioProgress }),
    ipfsService.uploadFile(coverFile, { onProgress: setCoverProgress })
  ]);
  
  return { audioResult, coverResult };
}
```

### 2. 断点续传（对于大文件）

```javascript
// 分片上传（需要 IPFS 服务支持）
async function chunkedUpload(filePath, chunkSize = 10 * 1024 * 1024) {
  const fileSize = fs.statSync(filePath).size;
  const chunks = Math.ceil(fileSize / chunkSize);
  
  for (let i = 0; i < chunks; i++) {
    const start = i * chunkSize;
    const end = Math.min(start + chunkSize, fileSize);
    const chunk = fs.createReadStream(filePath, { start, end: end - 1 });
    
    // 上传分片...
  }
}
```

### 3. 缓存 CID

```javascript
// 避免重复上传相同文件
const cidCache = new Map();

async function cachedUpload(filePath) {
  const fileHash = await calculateFileHash(filePath);
  
  if (cidCache.has(fileHash)) {
    console.log('使用缓存的 CID');
    return cidCache.get(fileHash);
  }
  
  const result = await ipfsService.uploadFile(filePath);
  cidCache.set(fileHash, result);
  return result;
}
```

## 监控与日志

```javascript
// 上传统计
class IPFSMetrics {
  constructor() {
    this.stats = {
      totalUploads: 0,
      totalBytes: 0,
      failedUploads: 0,
      averageUploadTime: 0
    };
  }
  
  async trackUpload(uploadFn, filePath) {
    const start = Date.now();
    const fileSize = fs.statSync(filePath).size;
    
    try {
      const result = await uploadFn();
      const duration = Date.now() - start;
      
      this.stats.totalUploads++;
      this.stats.totalBytes += fileSize;
      this.stats.averageUploadTime = 
        (this.stats.averageUploadTime * (this.stats.totalUploads - 1) + duration) / 
        this.stats.totalUploads;
      
      console.log(`上传成功: ${formatFileSize(fileSize)} in ${duration}ms`);
      return result;
      
    } catch (error) {
      this.stats.failedUploads++;
      throw error;
    }
  }
}
```

## 注意事项

1. **不要在客户端暴露 API Key**
   - 前端代码中不应包含 Pinata API Key
   - 使用后端代理或预签名 URL

2. **文件大小限制**
   - Pinata 免费版: 1GB 存储
   - 单个文件建议不超过 100MB
   - 大文件考虑压缩或分片

3. **网络稳定性**
   - 使用重试机制
   - 实现上传进度保存
   - 支持断点续传

4. **元数据不可变性**
   - 元数据一旦上链不可修改
   - 需要更新时创建新版本
   - 考虑使用 IPNS 指向可更新内容

---

更多信息请参考：
- [IPFS_SETUP.md](./IPFS_SETUP.md) - 配置指南
- [ipfs-service.js](../../scripts/core/ipfs-service.js) - 完整 API 文档
- [ipfs-examples.js](../../scripts/core/ipfs-examples.js) - 使用示例
