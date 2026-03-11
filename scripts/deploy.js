const { ethers } = require('hardhat');

async function main() {
  console.log('Deploying ECHOAsset contract...');
  
  const [deployer] = await ethers.getSigners();
  console.log('Deploying with account:', deployer.address);
  
  const balance = await ethers.provider.getBalance(deployer.address);
  console.log('Account balance:', ethers.formatEther(balance), 'MEER');
  
  const ECHOAsset = await ethers.getContractFactory('ECHOAsset');
  const echoAsset = await ECHOAsset.deploy();
  
  await echoAsset.waitForDeployment();
  
  const address = await echoAsset.getAddress();
  console.log('ECHOAsset deployed to:', address);
  console.log('');
  console.log('Contract Address:', address);
  console.log('Explorer URL: https://testnet-qngexplorer.qitmeer.io/address/' + address);
  
  // 保存部署信息
  const fs = require('fs');
  const deploymentInfo = {
    contractName: 'ECHOAsset',
    address: address,
    deployer: deployer.address,
    network: hre.network.name,
    timestamp: new Date().toISOString(),
  };
  
  fs.writeFileSync(
    'deployment.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log('');
  console.log('Deployment info saved to deployment.json');
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });