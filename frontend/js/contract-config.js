/**
 * ECHO Protocol 合约配置
 * Qitmeer 主网部署地址
 */

const CONTRACT_CONFIG = {
    // 网络配置
    network: {
        name: 'Qitmeer Mainnet',
        chainId: 813,
        chainIdHex: '0x32d',
        rpcUrl: 'https://qng.rpc.qitmeer.io',
        explorerUrl: 'https://qng.qitmeer.io',
        nativeCurrency: {
            name: 'MEER',
            symbol: 'MEER',
            decimals: 18
        }
    },
    
    // 合约地址（2026-03-13 部署 - V3 安全修复版）
    contracts: {
        // 核心资产合约 V3
        ECHOAssetV2: {
            address: '0xF98f63b7e8064Dcf9c2f25A906B2af89Af4840ce',
            abi: null // 从 artifacts 加载
        },
        // 融合合约 V3
        ECHOFusion: {
            address: '0x31Cd483Ee827A272816808AD49b90c71B1c82E11',
            abi: null
        },
        // 授权 NFT 合约 V3
        LicenseNFT: {
            address: '0x2f79b56047050FD2Ee7C62d2d0fe644c15c68e23',
            abi: null
        }
    },
    
    // 使用场景枚举（与合约对应）
    usageTypes: {
        PERSONAL: 0,      // 个人创作 ×1.0
        GAME: 1,          // 游戏配乐 ×1.5
        AI_TRAINING: 2,   // AI训练 ×2.0
        COMMERCIAL: 3,    // 商业广告 ×3.0
        BROADCAST: 4,     // 广播/电视 ×2.5
        STREAMING: 5      // 流媒体 ×1.2
    },
    
    // 场景倍率
    usageMultipliers: {
        0: 1.0,
        1: 1.5,
        2: 2.0,
        3: 3.0,
        4: 2.5,
        5: 1.2
    },
    
    // 授权类型
    licenseTypes: {
        ONE_TIME: 0,   // 买断制
        PER_USE: 1,    // 按次计费
        TIMED: 2       // 限时授权
    },
    
    // 平台费率 (5% = 500/10000)
    platformFeeRate: 0.05,
    
    // IPFS 配置
    ipfs: {
        gateway: 'https://ipfs.io/ipfs/',
        fallbackGateways: [
            'https://gateway.pinata.cloud/ipfs/',
            'https://cloudflare-ipfs.com/ipfs/'
        ]
    }
};

// 导出配置
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONTRACT_CONFIG;
}
