// ECHO Protocol - 合约配置
// 自动生成的部署配置
// 生成时间: 2026-03-15
// 部署钱包: 雨娃 (0xD9B32068A1B316A5D26Ae50DADD7527F3a1fa3C2)

const CONFIG = {
  // 部署钱包
  deployer: {
    name: '雨娃',
    address: '0xD9B32068A1B316A5D26Ae50DADD7527F3a1fa3C2',
    network: 'MEER',
    chainId: 813,
    purpose: 'ECHO Protocol 合约部署与测试'
  },

  // 网络配置
  networks: {
    meer: {
      name: 'Qitmeer Mainnet',
      chainId: 813,
      rpc: [
        'https://qng.rpc.qitmeer.io',
        'https://evm-dataseed1.meerscan.io',
        'https://evm-dataseed.meerscan.com'
      ],
      explorer: 'https://qng.qitmeer.io'
    },
    meerTestnet: {
      name: 'Qitmeer Testnet',
      chainId: 8131,
      rpc: 'https://testnet-qng.rpc.qitmeer.io',
      explorer: 'https://testnet-qng.qitmeer.io'
    }
  },

  // 合约地址占位符（部署后更新）
  contracts: {
    // 主网合约地址
    mainnet: {
      ECHOAsset: '',
      ECHOAssetV2: '',
      ECHOFusion: '',
      LicenseNFT: ''
    },
    // 测试网合约地址
    testnet: {
      ECHOAsset: '',
      ECHOAssetV2: '',
      ECHOFusion: '',
      LicenseNFT: ''
    }
  },

  // Gas 配置
  gas: {
    // 默认 Gas 价格 (Gwei)
    price: 46,
    // 部署合约 Gas 限制
    deploy: {
      ECHOAsset: 3000000,
      ECHOAssetV2: 3500000,
      ECHOFusion: 4000000,
      LicenseNFT: 2500000
    }
  }
};

module.exports = CONFIG;
