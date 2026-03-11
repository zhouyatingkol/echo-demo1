require('@nomicfoundation/hardhat-toolbox');

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: '0.8.19',
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  networks: {
    // Qitmeer Testnet (QNG)
    qitmeerTestnet: {
      url: 'https://testnet-qng.rpc.qitmeer.io',
      chainId: 8131,
      accounts: process.env.PRIVATE_KEY ? [process.env.PRIVATE_KEY] : [],
    },
    // 本地开发
    localhost: {
      url: 'http://127.0.0.1:8545',
    },
  },
  etherscan: {
    apiKey: {
      qitmeerTestnet: 'your-api-key',
    },
    customChains: [
      {
        network: 'qitmeerTestnet',
        chainId: 8131,
        urls: {
          apiURL: 'https://testnet-qng.rpc.qitmeer.io',
          browserURL: 'https://testnet-qngexplorer.qitmeer.io',
        },
      },
    ],
  },
};