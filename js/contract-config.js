// ECHO Protocol V3 - Qitmeer Mainnet Configuration
// Updated: 2026-03-13
// Deployer: 0x3a163461692222F7b986a9D3DcCe5d88390EC63C

const CONTRACT_CONFIG = {
    network: {
        name: 'Qitmeer Mainnet',
        chainId: 813,
        rpcUrl: 'https://qng.rpc.qitmeer.io',
        currency: 'MEER',
        blockExplorer: 'https://qng.qitmeer.io'
    },
    contracts: {
        // V3 合约地址（已验证）
        ECHOAssetV2: {
            address: '0xF98f63b7e8064Dcf9c2f25A906B2af89Af4840ce',
            version: '3.0.0',
            abi: 'ECHOAssetV2V3'
        },
        ECHOFusion: {
            address: '0x8Eb7a29C41478a3f32015C1330DFf7cc683d0952',
            version: '2.0.0',
            abi: 'ECHOFusionV2'
        },
        LicenseNFT: {
            address: '0x2f79b56047050FD2Ee7C62d2d0fe644c15c68e23',
            version: '3.0.0',
            abi: 'LicenseNFTV3'
        }
    },
    // 使用场景倍率配置
    pricing: {
        multipliers: {
            personal: 100,      // ×1.0
            game: 150,          // ×1.5
            ai_training: 200,   // ×2.0
            commercial: 300,    // ×3.0
            broadcast: 250,     // ×2.5
            streaming: 120      // ×1.2
        },
        basePrices: {
            onetime: 100,       // 100 MEER
            peruse: 0.5,        // 0.5 MEER/次
            timed: 10           // 10 MEER/天
        }
    }
};

// 兼容 ES Module 和 CommonJS
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONTRACT_CONFIG;
}
