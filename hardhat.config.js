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
  etherscan: {
    apiKey: {
      qitmeer: 'no-api-key-needed',
    },
    customChains: [
      {
        network: 'qitmeer',
        chainId: 813,
        urls: {
          apiURL: 'https://qng.rpc.qitmeer.io',
          browserURL: 'https://qng.qitmeer.io',
        },
      },
    ],
  },
};