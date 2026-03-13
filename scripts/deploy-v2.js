require('dotenv').config();
const hre = require('hardhat');
const fs = require('fs');

async function main() {
  console.log('🚀 部署 ECHOAssetV2 到 Qitmeer 主网...\n');
  
  // 使用私钥创建 wallet
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error('❌ 未设置 PRIVATE_KEY 环境变量');
    process.exit(1);
  }
  
  const deployer = new hre.ethers.Wallet(privateKey, hre.ethers.provider);
  console.log('📋 部署账户:', deployer.address);
  
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log('💰 账户余额:', hre.ethers.formatEther(balance), 'MEER');
  
  if (balance < hre.ethers.parseEther('0.01')) {
    console.error('❌ 余额不足，需要至少 0.01 MEER');
    process.exit(1);
  }
  
  console.log('\n📦 部署 ECHOAssetV2...');
  const ECHOAssetV2 = await hre.ethers.getContractFactory('ECHOAssetV2', deployer);
  
  // 设置 gas 选项
  const gasOptions = {
    gasPrice: await hre.ethers.provider.getFeeData().then(fee => fee.gasPrice),
    gasLimit: 5000000
  };
  console.log('⛽ Gas Price:', hre.ethers.formatUnits(gasOptions.gasPrice, 'gwei'), 'gwei');
  
  const echoAssetV2 = await ECHOAssetV2.deploy(gasOptions);
  
  console.log('⏳ 等待确认...');
  await echoAssetV2.waitForDeployment();
  
  const address = await echoAssetV2.getAddress();
  console.log('\n✅ ECHOAssetV2 部署成功！');
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
    txHash: echoAssetV2.deploymentTransaction().hash
  };
  
  fs.writeFileSync('deployment-v2.json', JSON.stringify(deploymentInfo, null, 2));
  console.log('\n📝 部署信息已保存到 deployment-v2.json');
  
  return address;
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('\n❌ 部署失败:', error);
    process.exit(1);
  });