require('dotenv').config();
const { ethers } = require('hardhat');
const fs = require('fs');

async function main() {
  console.log('🚀 部署 ECHOFusion 合约...\n');
  
  const [deployer] = await ethers.getSigners();
  console.log('📋 部署账户:', deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log('💰 账户余额:', ethers.formatEther(balance), 'MEER');
  
  // ECHOAsset 合约地址（主网）
  const echoAssetAddress = '0x5f5AAe09BB85f561b21845729B79E840AB026148';
  console.log('🔗 ECHOAsset 合约:', echoAssetAddress);
  
  console.log('\n📦 部署 ECHOFusion...');
  const ECHOFusion = await ethers.getContractFactory('ECHOFusion');
  const echoFusion = await ECHOFusion.deploy(echoAssetAddress);
  
  console.log('⏳ 等待确认...');
  await echoFusion.waitForDeployment();
  
  const address = await echoFusion.getAddress();
  console.log('\n✅ 部署成功！');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('合约地址:', address);
  console.log('交易哈希:', echoFusion.deploymentTransaction().hash);
  console.log('区块浏览器: https://qng.qitmeer.io/address/' + address);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // 保存部署信息
  const deploymentInfo = {
    contractName: 'ECHOFusion',
    address: address,
    echoAssetAddress: echoAssetAddress,
    deployer: deployer.address,
    network: 'qitmeer',
    chainId: 813,
    transactionHash: echoFusion.deploymentTransaction().hash,
    timestamp: new Date().toISOString(),
  };
  
  fs.writeFileSync('deployment-fusion.json', JSON.stringify(deploymentInfo, null, 2));
  console.log('\n📝 部署信息已保存到 deployment-fusion.json');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ 部署失败:', error.message);
    process.exit(1);
  });