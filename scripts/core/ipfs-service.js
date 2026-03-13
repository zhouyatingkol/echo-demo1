/**
 * IPFS Service Module
 * 
 * 提供文件和元数据上传到 IPFS 的功能
 * 支持 Pinata 和本地 IPFS 节点
 * 包含多网关 fallback 机制
 * 
 * @module scripts/core/ipfs-service
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
const FormData = require('form-data');

// 导入配置
const ipfsConfig = require('../../config/ipfs-config');

/**
 * 上传文件到 IPFS
 * @param {string|Buffer|Stream} file - 文件路径、Buffer 或 Stream
 * @param {Object} options - 上传选项
 * @param {string} options.filename - 文件名（当 file 为 Buffer/Stream 时需要）
 * @param {Function} options.onProgress - 进度回调函数 (progress: number) => void
 * @returns {Promise<{cid: string, url: string, size: number}>}
 */
async function uploadFile(file, options = {}) {
  const { filename, onProgress } = options;
  
  try {
    let fileData;
    let fileName;
    let fileSize;

    // 处理不同类型的输入
    if (typeof file === 'string') {
      // 文件路径
      if (!fs.existsSync(file)) {
        throw new Error(`File not found: ${file}`);
      }
      fileData = fs.createReadStream(file);
      fileName = filename || path.basename(file);
      const stats = fs.statSync(file);
      fileSize = stats.size;
    } else if (Buffer.isBuffer(file)) {
      // Buffer
      fileData = file;
      fileName = filename || 'file';
      fileSize = file.length;
    } else {
      // 假设是 Stream
      fileData = file;
      fileName = filename || 'file';
      fileSize = 0;
    }

    console.log(`[IPFS] Uploading file: ${fileName} (${formatFileSize(fileSize)})`);

    // 根据配置选择上传方式
    if (ipfsConfig.provider === 'pinata') {
      return await uploadToPinata(fileData, fileName, onProgress);
    } else if (ipfsConfig.provider === 'infura') {
      return await uploadToInfura(fileData, fileName, onProgress);
    } else if (ipfsConfig.provider === 'local') {
      return await uploadToLocal(fileData, fileName, onProgress);
    } else {
      throw new Error(`Unknown IPFS provider: ${ipfsConfig.provider}`);
    }
  } catch (error) {
    console.error('[IPFS] Upload failed:', error.message);
    throw error;
  }
}

/**
 * 上传 JSON 元数据到 IPFS
 * @param {Object} metadata - 元数据对象
 * @param {Function} onProgress - 进度回调函数
 * @returns {Promise<{cid: string, url: string, size: number}>}
 */
async function uploadMetadata(metadata, onProgress) {
  try {
    console.log('[IPFS] Uploading metadata...');
    
    // 将元数据转换为 Buffer
    const jsonBuffer = Buffer.from(JSON.stringify(metadata, null, 2));
    
    // 使用 uploadFile 上传，但指定为 JSON 文件
    return await uploadFile(jsonBuffer, {
      filename: 'metadata.json',
      onProgress
    });
  } catch (error) {
    console.error('[IPFS] Metadata upload failed:', error.message);
    throw error;
  }
}

/**
 * 上传音乐作品完整元数据（包含音频和封面）
 * @param {Object} workData - 作品数据
 * @param {string} workData.name - 作品名称
 * @param {string} workData.description - 作品描述
 * @param {string} workData.artist - 艺术家
 * @param {string} audioCid - 音频文件 CID
 * @param {string} coverCid - 封面图片 CID（可选）
 * @param {Object} attributes - 额外属性
 * @returns {Promise<{cid: string, url: string, metadata: Object}>}
 */
async function uploadWorkMetadata(workData, audioCid, coverCid, attributes = {}) {
  try {
    console.log('[IPFS] Creating work metadata...');

    const metadata = {
      name: workData.name,
      description: workData.description,
      image: coverCid ? getGatewayUrl(coverCid) : '',
      animation_url: getGatewayUrl(audioCid),
      attributes: [
        { trait_type: 'Artist', value: workData.artist },
        { trait_type: 'Type', value: 'Music' },
        ...Object.entries(attributes).map(([key, value]) => ({
          trait_type: key,
          value: value
        }))
      ],
      properties: {
        audio: {
          cid: audioCid,
          url: getGatewayUrl(audioCid)
        },
        cover: coverCid ? {
          cid: coverCid,
          url: getGatewayUrl(coverCid)
        } : null
      }
    };

    const result = await uploadMetadata(metadata);
    
    return {
      ...result,
      metadata
    };
  } catch (error) {
    console.error('[IPFS] Work metadata upload failed:', error.message);
    throw error;
  }
}

/**
 * 获取 IPFS 网关 URL
 * @param {string} cid - IPFS CID
 * @param {Object} options - 选项
 * @param {number} options.gatewayIndex - 指定网关索引
 * @returns {string}
 */
function getGatewayUrl(cid, options = {}) {
  const { gatewayIndex = 0 } = options;
  
  // 如果是完整 URL，直接返回
  if (cid.startsWith('http')) {
    return cid;
  }

  // 移除 ipfs:// 前缀
  const cleanCid = cid.replace(/^ipfs:\/\//, '');
  
  // 选择网关
  const gateways = ipfsConfig.gatewayFallbacks;
  const gateway = gateways[gatewayIndex] || gateways[0];
  
  return `${gateway}/ipfs/${cleanCid}`;
}

/**
 * 尝试多个网关获取内容
 * @param {string} cid - IPFS CID
 * @returns {Promise<string>} - 可用的网关 URL
 */
async function getAvailableGatewayUrl(cid) {
  const gateways = ipfsConfig.gatewayFallbacks;
  
  for (let i = 0; i < gateways.length; i++) {
    const url = getGatewayUrl(cid, { gatewayIndex: i });
    try {
      // 尝试 HEAD 请求检查可用性
      await axios.head(url, { timeout: 5000 });
      return url;
    } catch (error) {
      console.warn(`[IPFS] Gateway ${gateways[i]} unavailable, trying next...`);
      continue;
    }
  }
  
  // 都失败了，返回默认 URL
  console.warn('[IPFS] All gateways unavailable, returning default URL');
  return getGatewayUrl(cid);
}

/**
 * 上传到 Pinata
 * @private
 */
async function uploadToPinata(fileData, filename, onProgress) {
  const formData = new FormData();
  formData.append('file', fileData, filename);
  
  // 添加元数据
  const metadata = JSON.stringify({
    name: filename,
    keyvalues: {
      app: 'ECHO Protocol',
      timestamp: Date.now().toString()
    }
  });
  formData.append('pinataMetadata', metadata);

  const response = await axios.post(
    'https://api.pinata.cloud/pinning/pinFileToIPFS',
    formData,
    {
      maxBodyLength: 'Infinity',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
        'pinata_api_key': ipfsConfig.pinata.apiKey,
        'pinata_secret_api_key': ipfsConfig.pinata.secretKey
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      }
    }
  );

  const { IpfsHash, PinSize } = response.data;
  
  console.log(`[IPFS] Uploaded to Pinata: ${IpfsHash}`);
  
  return {
    cid: IpfsHash,
    url: getGatewayUrl(IpfsHash),
    size: PinSize
  };
}

/**
 * 上传到 Infura IPFS
 * @private
 */
async function uploadToInfura(fileData, filename, onProgress) {
  const formData = new FormData();
  formData.append('file', fileData, filename);

  const auth = Buffer.from(
    `${ipfsConfig.infura.projectId}:${ipfsConfig.infura.projectSecret}`
  ).toString('base64');

  const response = await axios.post(
    'https://ipfs.infura.io:5001/api/v0/add',
    formData,
    {
      maxBodyLength: 'Infinity',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${formData._boundary}`,
        'Authorization': `Basic ${auth}`
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      }
    }
  );

  const { Hash, Size } = response.data;
  
  console.log(`[IPFS] Uploaded to Infura: ${Hash}`);
  
  return {
    cid: Hash,
    url: getGatewayUrl(Hash),
    size: parseInt(Size, 10)
  };
}

/**
 * 上传到本地 IPFS 节点
 * @private
 */
async function uploadToLocal(fileData, filename, onProgress) {
  const formData = new FormData();
  formData.append('file', fileData, filename);

  const response = await axios.post(
    `${ipfsConfig.local.apiUrl}/api/v0/add`,
    formData,
    {
      maxBodyLength: 'Infinity',
      headers: {
        'Content-Type': `multipart/form-data; boundary=${formData._boundary}`
      },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          onProgress(progress);
        }
      }
    }
  );

  const { Hash, Size } = response.data;
  
  console.log(`[IPFS] Uploaded to local node: ${Hash}`);
  
  return {
    cid: Hash,
    url: getGatewayUrl(Hash),
    size: parseInt(Size, 10)
  };
}

/**
 * 格式化文件大小
 * @private
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * 测试 IPFS 连接
 * @returns {Promise<boolean>}
 */
async function testConnection() {
  try {
    console.log(`[IPFS] Testing ${ipfsConfig.provider} connection...`);
    
    // 上传测试数据
    const testData = Buffer.from(`ECHO Protocol Test ${Date.now()}`);
    const result = await uploadFile(testData, { filename: 'test.txt' });
    
    console.log('[IPFS] Connection test successful!');
    console.log(`  CID: ${result.cid}`);
    console.log(`  URL: ${result.url}`);
    
    return true;
  } catch (error) {
    console.error('[IPFS] Connection test failed:', error.message);
    return false;
  }
}

module.exports = {
  uploadFile,
  uploadMetadata,
  uploadWorkMetadata,
  getGatewayUrl,
  getAvailableGatewayUrl,
  testConnection,
  // 配置访问
  config: ipfsConfig
};
