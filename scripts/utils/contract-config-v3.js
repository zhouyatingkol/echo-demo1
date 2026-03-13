// ECHO Protocol V3 - Qitmeer Mainnet Configuration
// Deployed: 2026-03-13
// Last Updated: 2026-03-13 (Config Verify Fix)

const CONTRACT_CONFIG = {
    network: {
        name: 'Qitmeer Mainnet',
        chainId: 813,
        chainIdHex: '0x32d',
        rpcUrl: 'https://qng.rpc.qitmeer.io',
        explorerUrl: 'https://qng.qitmeer.io',
        currency: 'MEER',
        nativeCurrency: {
            name: 'MEER',
            symbol: 'MEER',
            decimals: 18
        }
    },
    contracts: {
        ECHOAssetV2: {
            address: '0xF98f63b7e8064Dcf9c2f25A906B2af89Af4840ce',
            version: '3.0.0',
            abiPath: './artifacts/contracts/ECHOAssetV2V3.sol/ECHOAssetV2V3.json'
        },
        ECHOFusion: {
            address: '0x8Eb7a29C41478a3f32015C1330DFf7cc683d0952',
            version: '2.0.0',
            abiPath: './artifacts/contracts/ECHOFusionV2.sol/ECHOFusionV2.json'
        },
        LicenseNFT: {
            address: '0x2f79b56047050FD2Ee7C62d2d0fe644c15c68e23',
            version: '3.0.0',
            abiPath: './artifacts/contracts/LicenseNFTV3.sol/LicenseNFTV3.json'
        }
    },
    // 部署记录引用
    deployments: {
        ECHOAssetV2: './deployment-v2-mainnet.json',
        ECHOFusion: './deployment-fusionv2-mainnet.json'
    }
};

module.exports = CONTRACT_CONFIG;
