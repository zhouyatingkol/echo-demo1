require('dotenv').config();
const { ethers } = require('hardhat');
const fs = require('fs');

async function main() {
    console.log('🚀 部署 ECHO Protocol V3 到 Qitmeer 主网...\n');
    
    const [deployer] = await ethers.getSigners();
    console.log('📋 部署账户:', deployer.address);
    
    const balance = await ethers.provider.getBalance(deployer.address);
    console.log('💰 账户余额:', ethers.formatEther(balance), 'MEER');
    
    if (balance < ethers.parseEther('1')) {
        console.error('❌ 余额不足，需要至少 1 MEER');
        process.exit(1);
    }
    
    // 1. Deploy ECHOAssetV2V3
    console.log('\n📦 部署 ECHOAssetV2V3...');
    const ECHOAsset = await ethers.getContractFactory('ECHOAssetV2V3');
    const echoAsset = await ECHOAsset.deploy();
    console.log('⏳ 等待交易确认...');
    await echoAsset.waitForDeployment();
    const echoAssetAddress = await echoAsset.getAddress();
    console.log('✅ ECHOAssetV2V3 部署成功:', echoAssetAddress);
    
    // 2. Deploy ECHOFusion
    console.log('\n📦 部署 ECHOFusion...');
    const ECHOFusion = await ethers.getContractFactory('ECHOFusion');
    const echoFusion = await ECHOFusion.deploy(echoAssetAddress);
    console.log('⏳ 等待交易确认...');
    await echoFusion.waitForDeployment();
    const echoFusionAddress = await echoFusion.getAddress();
    console.log('✅ ECHOFusion 部署成功:', echoFusionAddress);
    
    // 3. Deploy LicenseNFTV3
    console.log('\n📦 部署 LicenseNFTV3...');
    const LicenseNFT = await ethers.getContractFactory('LicenseNFTV3');
    const licenseNFT = await LicenseNFT.deploy(echoAssetAddress);
    console.log('⏳ 等待交易确认...');
    await licenseNFT.waitForDeployment();
    const licenseNFTAddress = await licenseNFT.getAddress();
    console.log('✅ LicenseNFTV3 部署成功:', licenseNFTAddress);
    
    // Summary
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('🎉 ECHO Protocol V3 部署成功！');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('网络: Qitmeer 主网 (Chain ID: 813)');
    console.log('部署账户:', deployer.address);
    console.log('\n合约地址:');
    console.log('  ECHOAssetV2V3:', echoAssetAddress);
    console.log('  ECHOFusion:', echoFusionAddress);
    console.log('  LicenseNFTV3:', licenseNFTAddress);
    console.log('\n区块浏览器:');
    console.log('  https://qng.qitmeer.io/address/' + echoAssetAddress);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    
    // Save deployment info
    const deploymentInfo = {
        network: 'qitmeer',
        chainId: 813,
        deployer: deployer.address,
        timestamp: new Date().toISOString(),
        contracts: {
            ECHOAssetV2V3: {
                name: 'ECHOAssetV2V3',
                address: echoAssetAddress,
                txHash: echoAsset.deploymentTransaction().hash
            },
            ECHOFusion: {
                name: 'ECHOFusion',
                address: echoFusionAddress,
                txHash: echoFusion.deploymentTransaction().hash
            },
            LicenseNFTV3: {
                name: 'LicenseNFTV3',
                address: licenseNFTAddress,
                txHash: licenseNFT.deploymentTransaction().hash
            }
        }
    };
    
    fs.writeFileSync('deployment-v3-mainnet.json', JSON.stringify(deploymentInfo, null, 2));
    console.log('\n📝 部署信息已保存到 deployment-v3-mainnet.json');
    
    // Update frontend config
    const configContent = `
// ECHO Protocol V3 - Qitmeer Mainnet Configuration
// Deployed: ${new Date().toISOString()}

const CONTRACT_CONFIG = {
    network: {
        name: 'Qitmeer Mainnet',
        chainId: 813,
        rpcUrl: 'https://qng.rpc.qitmeer.io',
        currency: 'MEER'
    },
    contracts: {
        ECHOAssetV2: {
            address: '${echoAssetAddress}',
            version: '3.0.0'
        },
        ECHOFusion: {
            address: '${echoFusionAddress}',
            version: '3.0.0'
        },
        LicenseNFT: {
            address: '${licenseNFTAddress}',
            version: '3.0.0'
        }
    }
};

module.exports = CONTRACT_CONFIG;
`;
    fs.writeFileSync('contract-config-v3.js', configContent);
    console.log('📝 前端配置已保存到 contract-config-v3.js');
}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error('\n❌ 部署失败:', error.message);
        console.error(error);
        process.exit(1);
    });
