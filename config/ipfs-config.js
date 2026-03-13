/**
 * IPFS Configuration
 * 
 * IPFS 服务配置文件
 * 支持从环境变量读取配置
 * 
 * @module config/ipfs-config
 */

// 加载环境变量
require('dotenv').config();

/**
 * IPFS 配置对象
 */
const ipfsConfig = {
  /**
   * 提供商类型: 'pinata' | 'infura' | 'local'
   */
  provider: process.env.IPFS_PROVIDER || 'pinata',

  /**
   * Pinata 配置
   * 注册地址: https://pinata.cloud
   */
  pinata: {
    apiKey: process.env.PINATA_API_KEY || '',
    secretKey: process.env.PINATA_SECRET_KEY || '',
    jwt: process.env.PINATA_JWT || ''
  },

  /**
   * Infura IPFS 配置
   * 注册地址: https://infura.io
   */
  infura: {
    projectId: process.env.INFURA_IPFS_PROJECT_ID || '',
    projectSecret: process.env.INFURA_IPFS_PROJECT_SECRET || ''
  },

  /**
   * 本地 IPFS 节点配置
   * 用于开发环境
   */
  local: {
    apiUrl: process.env.IPFS_LOCAL_API_URL || 'http://localhost:5001',
    gatewayUrl: process.env.IPFS_LOCAL_GATEWAY_URL || 'http://localhost:8080'
  },

  /**
   * 主要 IPFS 网关
   */
  gatewayUrl: process.env.IPFS_GATEWAY_URL || 'https://gateway.pinata.cloud',

  /**
   * 备用 IPFS 网关列表
   * 用于 fallback
   */
  gatewayFallbacks: [
    process.env.IPFS_GATEWAY_URL || 'https://gateway.pinata.cloud',
    'https://ipfs.io',
    'https://cloudflare-ipfs.com',
    'https://dweb.link',
    'https://gateway.ipfs.io'
  ],

  /**
   * 上传配置
   */
  upload: {
    // 最大文件大小 (MB)
    maxFileSize: parseInt(process.env.IPFS_MAX_FILE_SIZE, 10) || 100,
    // 超时时间 (ms)
    timeout: parseInt(process.env.IPFS_UPLOAD_TIMEOUT, 10) || 300000,
    // 是否 pin 文件
    pin: process.env.IPFS_PIN !== 'false'
  }
};

/**
 * 验证配置是否完整
 * @returns {Object}
 */
function validateConfig() {
  const errors = [];
  const warnings = [];

  switch (ipfsConfig.provider) {
    case 'pinata':
      if (!ipfsConfig.pinata.apiKey) {
        errors.push('PINATA_API_KEY is required when using Pinata');
      }
      if (!ipfsConfig.pinata.secretKey) {
        errors.push('PINATA_SECRET_KEY is required when using Pinata');
      }
      break;

    case 'infura':
      if (!ipfsConfig.infura.projectId) {
        errors.push('INFURA_IPFS_PROJECT_ID is required when using Infura');
      }
      if (!ipfsConfig.infura.projectSecret) {
        errors.push('INFURA_IPFS_PROJECT_SECRET is required when using Infura');
      }
      break;

    case 'local':
      warnings.push('Using local IPFS node - ensure ipfs daemon is running');
      break;

    default:
      errors.push(`Unknown IPFS provider: ${ipfsConfig.provider}`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    provider: ipfsConfig.provider
  };
}

/**
 * 获取当前配置摘要（隐藏敏感信息）
 * @returns {Object}
 */
function getConfigSummary() {
  const mask = (str) => str ? `${str.slice(0, 4)}...${str.slice(-4)}` : 'not set';
  
  return {
    provider: ipfsConfig.provider,
    pinata: {
      apiKey: mask(ipfsConfig.pinata.apiKey),
      secretKey: mask(ipfsConfig.pinata.secretKey),
      jwt: ipfsConfig.pinata.jwt ? 'set' : 'not set'
    },
    infura: {
      projectId: mask(ipfsConfig.infura.projectId),
      projectSecret: ipfsConfig.infura.projectSecret ? 'set' : 'not set'
    },
    local: ipfsConfig.local,
    gatewayUrl: ipfsConfig.gatewayUrl,
    gatewayFallbacks: ipfsConfig.gatewayFallbacks
  };
}

module.exports = {
  ...ipfsConfig,
  validateConfig,
  getConfigSummary
};
