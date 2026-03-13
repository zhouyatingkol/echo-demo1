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
    
    // 合约地址（2026-03-13 部署）
    contracts: {
        // 核心资产合约
        ECHOAssetV2: {
            address: '0x6195f16cb8d32397032c6031e89c567a5fdbec9d',
            abi: null // 从 artifacts 加载
        },
        // 融合合约
        ECHOFusion: {
            address: '0xa91499036db8a9501d4116c12114d24a906d7b97',
            abi: null
        },
        // 授权 NFT 合约
        LicenseNFT: {
            address: '0x13c0637d86d179b66f22e0806c98b34bdbf48adf',
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
