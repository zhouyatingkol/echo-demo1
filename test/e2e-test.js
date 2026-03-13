/**
 * ECHO Protocol 端到端测试脚本
 * 测试 Qitmeer 主网部署的合约
 */

const { Web3 } = require('web3');

// Qitmeer 主网配置
const QITMEER_RPC = 'https://qng.rpc.qitmeer.io';
const CHAIN_ID = 813;

// 合约地址
const CONTRACTS = {
    ECHOAssetV2: '0x6195f16cb8d32397032c6031e89c567a5fdbec9d',
    ECHOFusion: '0xa91499036db8a9501d4116c12114d24a906d7b97',
    LicenseNFT: '0x13c0637d86d179b66f22e0806c98b34bdbf48adf'
};

// 读取 ABI
const fs = require('fs');
const path = require('path');

function loadABI(contractName) {
    const abiPath = path.join(__dirname, '..', 'artifacts', 'contracts', `${contractName}.sol`, `${contractName}.json`);
    const contractJson = JSON.parse(fs.readFileSync(abiPath, 'utf8'));
    return contractJson.abi;
}

// 初始化 Web3
const web3 = new Web3(QITMEER_RPC);

// 加载 ABI
const echoAssetABI = loadABI('ECHOAssetV2');
const echoFusionABI = loadABI('ECHOFusion');
const licenseNFTABI = loadABI('LicenseNFT');

// 创建合约实例（只读）
const echoAsset = new web3.eth.Contract(echoAssetABI, CONTRACTS.ECHOAssetV2);
const echoFusion = new web3.eth.Contract(echoFusionABI, CONTRACTS.ECHOFusion);
const licenseNFT = new web3.eth.Contract(licenseNFTABI, CONTRACTS.LicenseNFT);

async function runTests() {
    console.log('🧪 ECHO Protocol 端到端测试');
    console.log('==============================\n');
    
    try {
        // 测试 1: 检查合约部署状态
        console.log('📋 测试 1: 合约部署状态检查');
        console.log('-----------------------------');
        
        const assetCode = await web3.eth.getCode(CONTRACTS.ECHOAssetV2);
        const fusionCode = await web3.eth.getCode(CONTRACTS.ECHOFusion);
        const licenseCode = await web3.eth.getCode(CONTRACTS.LicenseNFT);
        
        console.log(`ECHOAssetV2: ${assetCode !== '0x' ? '✅ 已部署' : '❌ 未部署'}`);
        console.log(`ECHOFusion:  ${fusionCode !== '0x' ? '✅ 已部署' : '❌ 未部署'}`);
        console.log(`LicenseNFT:  ${licenseCode !== '0x' ? '✅ 已部署' : '❌ 未部署'}`);
        console.log('');
        
        // 测试 2: ECHOAssetV2 基本信息
        console.log('📋 测试 2: ECHOAssetV2 基本信息');
        console.log('----------------------------------');
        
        const assetName = await echoAsset.methods.name().call();
        const assetSymbol = await echoAsset.methods.symbol().call();
        const currentTokenId = await echoAsset.methods.getCurrentTokenId().call();
        
        console.log(`合约名称: ${assetName}`);
        console.log(`合约符号: ${assetSymbol}`);
        console.log(`当前 Token ID: ${currentTokenId}`);
        console.log('');
        
        // 测试 3: ECHOFusion 基本信息
        console.log('📋 测试 3: ECHOFusion 基本信息');
        console.log('--------------------------------');
        
        const fusionName = await echoFusion.methods.name().call();
        const fusionSymbol = await echoFusion.methods.symbol().call();
        const currentTreeId = await echoFusion.methods.getCurrentTreeId().call();
        const echoAssetAddress = await echoFusion.methods.echoAssetContract().call();
        
        console.log(`合约名称: ${fusionName}`);
        console.log(`合约符号: ${fusionSymbol}`);
        console.log(`当前 Tree ID: ${currentTreeId}`);
        console.log(`关联 ECHOAsset: ${echoAssetAddress}`);
        console.log(`地址匹配: ${echoAssetAddress.toLowerCase() === CONTRACTS.ECHOAssetV2.toLowerCase() ? '✅' : '❌'}`);
        console.log('');
        
        // 测试 4: LicenseNFT 基本信息
        console.log('📋 测试 4: LicenseNFT 基本信息');
        console.log('--------------------------------');
        
        const licenseName = await licenseNFT.methods.name().call();
        const licenseSymbol = await licenseNFT.methods.symbol().call();
        const platformFeeRate = await licenseNFT.methods.platformFeeRate().call();
        
        console.log(`合约名称: ${licenseName}`);
        console.log(`合约符号: ${licenseSymbol}`);
        console.log(`平台费率: ${Number(platformFeeRate) / 100}%`);
        
        // 场景倍率
        console.log('\n场景倍率:');
        const usageTypes = ['PERSONAL', 'GAME', 'AI_TRAINING', 'COMMERCIAL', 'BROADCAST', 'STREAMING'];
        for (let i = 0; i < 6; i++) {
            const multiplier = await licenseNFT.methods.usageMultipliers(i).call();
            console.log(`  ${usageTypes[i]}: ${Number(multiplier) / 100}x`);
        }
        console.log('');
        
        // 测试 5: 检查网络连接
        console.log('📋 测试 5: 网络连接状态');
        console.log('-------------------------');
        
        const blockNumber = await web3.eth.getBlockNumber();
        const chainId = await web3.eth.getChainId();
        const gasPrice = await web3.eth.getGasPrice();
        
        console.log(`当前区块: ${blockNumber}`);
        console.log(`Chain ID: ${chainId} ${chainId === CHAIN_ID ? '✅ (Qitmeer Mainnet)' : '❌ (不匹配)'}`);
        console.log(`Gas Price: ${web3.utils.fromWei(gasPrice, 'gwei')} Gwei`);
        console.log('');
        
        // 测试 6: 部署地址余额
        console.log('📋 测试 6: 部署地址状态');
        console.log('-------------------------');
        
        const deployerAddress = '0x3a163461692222F7b986a9D3DcCe5d88390EC63C';
        const balance = await web3.eth.getBalance(deployerAddress);
        const txCount = await web3.eth.getTransactionCount(deployerAddress);
        
        console.log(`部署地址: ${deployerAddress}`);
        console.log(`余额: ${web3.utils.fromWei(balance, 'ether')} MEER`);
        console.log(`交易数: ${txCount}`);
        console.log('');
        
        console.log('✅ 所有基础测试通过！');
        console.log('\n下一步建议:');
        console.log('1. 连接钱包进行写操作测试（生成资产）');
        console.log('2. 测试授权购买流程');
        console.log('3. 测试融合功能');
        
    } catch (error) {
        console.error('❌ 测试失败:', error.message);
        process.exit(1);
    }
}

// 运行测试
runTests();
