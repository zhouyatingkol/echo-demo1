require('dotenv').config();
require('@nomicfoundation/hardhat-toolbox');

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: '0.8.19',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,  // 与验证配置保持一致
      },
      viaIR: true,  // 恢复 viaIR 以支持复杂合约
    },
  },
  networks: {
    // Qitmeer 主网
    qitmeer: {
      url: 'https://qng.rpc.qitmeer.io',
      chainId: 813,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    // Qitmeer Testnet
    qitmeerTestnet: {
      url: 'https://testnet-qng.rpc.qitmeer.io',
      chainId: 8131,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    localhost: {
      url: 'http://127.0.0.1:8545',
    },
  },
  // Qitmeer 区块浏览器验证配置
  etherscan: {
    apiKey: {
      qitmeer: 'no-api-key-needed',
    },
    customChains: [
      {
        network: 'qitmeer',
        chainId: 813,
        urls: {
          // 关键修正：使用区块浏览器的 API 地址
          apiURL: 'https://qng.qitmeer.io/api',  // ✅ 验证 API 地址
          browserURL: 'https://qng.qitmeer.io',   // ✅ 区块浏览器地址
        },
      },
    ],
  },
  // 禁用 Sourcify 警告
  sourcify: {
    enabled: false
  }
};
