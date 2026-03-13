const hre = require("hardhat");

async function main() {
  console.log("开始部署 ECHOFusionV2 合约到 Qitmeer 主网...");
  
  // 获取部署账户
  const [deployer] = await hre.ethers.getSigners();
  console.log("部署账户:", deployer.address);
  
  // 检查账户余额 - ethers v6 语法
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("账户余额:", hre.ethers.formatEther(balance), "MEER");
  
  // ECHOAssetV2V3 合约地址（构造函数参数）
  const echoAssetAddress = "0xF98f63b7e8064Dcf9c2f25A906B2af89Af4840ce";
  console.log("ECHOAssetV2V3 地址:", echoAssetAddress);
  
  // 编译合约
  console.log("\n编译合约...");
  await hre.run("compile");
  
  // 部署 ECHOFusionV2
  console.log("\n部署 ECHOFusionV2 合约...");
  const ECHOFusionV2 = await hre.ethers.getContractFactory("ECHOFusionV2");
  const fusionV2 = await ECHOFusionV2.deploy(echoAssetAddress);
  
  console.log("等待交易确认...");
  await fusionV2.waitForDeployment();
  
  const contractAddress = await fusionV2.getAddress();
  const deployTx = fusionV2.deploymentTransaction();
  
  console.log("\n========== 部署成功 ==========");
  console.log("合约地址:", contractAddress);
  console.log("交易哈希:", deployTx.hash);
  console.log("部署账户:", deployer.address);
  
  // 保存部署信息
  const deploymentInfo = {
    contractName: "ECHOFusionV2",
    network: "qitmeer",
    chainId: 813,
    contractAddress: contractAddress,
    transactionHash: deployTx.hash,
    deployer: deployer.address,
    echoAssetAddress: echoAssetAddress,
    timestamp: new Date().toISOString()
  };
  
  const fs = require("fs");
  fs.writeFileSync(
    "deployment-fusionv2-mainnet.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  console.log("\n部署信息已保存到 deployment-fusionv2-mainnet.json");
  
  // 等待区块确认
  console.log("\n等待区块确认 (3个区块)...");
  await deployTx.wait(3);
  console.log("区块确认完成！");
  
  // 尝试验证合约
  console.log("\n尝试验证合约...");
  try {
    await hre.run("verify:verify", {
      address: contractAddress,
      constructorArguments: [echoAssetAddress],
    });
    console.log("合约验证成功！");
  } catch (error) {
    console.log("合约验证失败或暂不支持:", error.message);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
