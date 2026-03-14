require('dotenv').config();
const { ethers } = require('hardhat');
const fs = require('fs');

async function main() {
  console.log('🚀 部署 ECHOAssetV2 到 Qitmeer 主网...\n');
  
  const [deployer] = await ethers.getSigners();
  console.log('📋 部署账户:', deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log('💰 账户余额:', ethers.formatEther(balance), 'MEER');
  
  console.log('\n📦 部署 ECHOAssetV2...');
  const ECHOAssetV2 = await ethers.getContractFactory('ECHOAssetV2');
  const echoAssetV2 = await ECHOAssetV2.deploy();
  
  console.log('⏳ 等待确认...');
  await echoAssetV2.waitForDeployment();
  
  const address = await echoAssetV2.getAddress();
  console.log('\n✅ 部署成功！');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('合约地址:', address);
  console.log('交易哈希:', echoAssetV2.deploymentTransaction().hash);
  console.log('区块浏览器: https://qng.qitmeer.io/address/' + address);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // 保存部署信息
  const deploymentInfo = {
    contractName: 'ECHOAssetV2',
    address: address,
    deployer: deployer.address,
    network: 'qitmeer',
    chainId: 813,
    timestamp: new Date().toISOString(),
  };
  
  fs.writeFileSync('deployment-v2.json', JSON.stringify(deploymentInfo, null, 2));
  console.log('\n📝 部署信息已保存到 deployment-v2.json');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ 部署失败:', error);
    process.exit(1);
  });