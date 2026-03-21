const { ethers } = require("hardhat");

async function main() {
  const [deployer, oracle] = await ethers.getSigners();
  
  console.log("Deploying contracts with account:", deployer.address);
  console.log("Oracle will be:", oracle.address);
  
  // 1. Deploy ShiShuRegistry
  console.log("\n1. Deploying ShiShuRegistry...");
  const ShiShu = await ethers.getContractFactory("ShiShuRegistry");
  const shu = await ShiShu.deploy();
  await shu.waitForDeployment();
  console.log("   ShiShuRegistry deployed to:", await shu.getAddress());
  
  // 2. Deploy ShiPositionRegistry
  console.log("\n2. Deploying ShiPositionRegistry...");
  const ShiPosition = await ethers.getContractFactory("ShiPositionRegistry");
  const pos = await ShiPosition.deploy();
  await pos.waitForDeployment();
  console.log("   ShiPositionRegistry deployed to:", await pos.getAddress());
  
  // 3. Deploy ShiFieldRegistry
  console.log("\n3. Deploying ShiFieldRegistry...");
  const ShiField = await ethers.getContractFactory("ShiFieldRegistry");
  const field = await ShiField.deploy(await shu.getAddress());
  await field.waitForDeployment();
  console.log("   ShiFieldRegistry deployed to:", await field.getAddress());
  
  // 4. Set oracle for all contracts
  console.log("\n4. Setting oracle address...");
  await (await shu.setOracle(oracle.address)).wait();
  await (await pos.setOracle(oracle.address)).wait();
  await (await field.setOracle(oracle.address)).wait();
  console.log("   Oracle set to:", oracle.address);
  
  // 5. Save deployment info
  const deploymentInfo = {
    network: network.name,
    timestamp: new Date().toISOString(),
    deployer: deployer.address,
    oracle: oracle.address,
    contracts: {
      ShiShuRegistry: await shu.getAddress(),
      ShiPositionRegistry: await pos.getAddress(),
      ShiFieldRegistry: await field.getAddress()
    }
  };
  
  const fs = require('fs');
  fs.writeFileSync(
    'deployed.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n✅ Deployment completed!");
  console.log("   Info saved to deployed.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
