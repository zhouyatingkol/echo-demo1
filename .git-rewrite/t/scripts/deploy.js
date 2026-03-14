require('dotenv').config();
const { ethers } = require('hardhat');
const fs = require('fs');

async function main() {
  console.log('🚀 部署 ECHOAsset 合约到 Qitmeer 主网...\n');
  
  const [deployer] = await ethers.getSigners();
  console.log('📋 部署账户:', deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log('💰 账户余额:', ethers.formatEther(balance), 'MEER');
  
  console.log('\n📦 编译并部署合约...');
  const ECHOAsset = await ethers.getContractFactory('ECHOAsset');
  const echoAsset = await ECHOAsset.deploy();
  
  console.log('⏳ 等待交易确认...');
  await echoAsset.waitForDeployment();
  
  const address = await echoAsset.getAddress();
  console.log('\n✅ 部署成功！');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('合约地址:', address);
  console.log('交易哈希:', echoAsset.deploymentTransaction().hash);
  console.log('区块浏览器: https://qng.qitmeer.io/address/' + address);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  // 保存部署信息
  const deploymentInfo = {
    contractName: 'ECHOAsset',
    address: address,
    deployer: deployer.address,
    network: 'qitmeer',
    chainId: 813,
    transactionHash: echoAsset.deploymentTransaction().hash,
    timestamp: new Date().toISOString(),
  };
  
  fs.writeFileSync('deployment.json', JSON.stringify(deploymentInfo, null, 2));
  console.log('\n📝 部署信息已保存到 deployment.json');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ 部署失败:', error.message);
    process.exit(1);
  });