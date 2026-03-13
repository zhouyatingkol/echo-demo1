const hre = require("hardhat");
require('dotenv').config();

async function main() {
  console.log("🚀 开始部署 LicenseNFT 合约...");
  
  // 从环境变量获取私钥
  const privateKey = process.env.PRIVATE_KEY;
  if (!privateKey) {
    console.error("❌ 未设置 PRIVATE_KEY 环境变量");
    process.exit(1);
  }
  
  // 创建 wallet
  const deployer = new hre.ethers.Wallet(privateKey, hre.ethers.provider);
  console.log("📍 部署地址:", deployer.address);
  
  // 验证地址
  const expectedAddress = "0x3a163461692222F7b986a9D3DcCe5d88390EC63C";
  if (deployer.address.toLowerCase() !== expectedAddress.toLowerCase()) {
    console.warn("⚠️  部署地址与预期不符");
    console.warn("  预期:", expectedAddress);
    console.warn("  实际:", deployer.address);
  }
  
  // 检查余额
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 账户余额:", hre.ethers.formatEther(balance), "MEER");
  
  if (balance < hre.ethers.parseEther("0.01")) {
    console.error("❌ 余额不足，需要至少 0.01 MEER");
    process.exit(1);
  }
  
  // ECHOAsset 合约地址（临时使用零地址，后续更新）
  const echoAssetAddress = "0x0000000000000000000000000000000000000000";
  console.log("🔗 ECHOAsset 地址:", echoAssetAddress);
  
  // 部署 LicenseNFT
  const LicenseNFT = await hre.ethers.getContractFactory("LicenseNFT", deployer);
  console.log("⏳ 部署中，请等待...");
  
  // 设置 gas 选项
  const gasOptions = {
    gasPrice: await hre.ethers.provider.getFeeData().then(fee => fee.gasPrice),
    gasLimit: 5000000  // 5M gas limit
  };
  console.log("⛽ Gas Price:", hre.ethers.formatUnits(gasOptions.gasPrice, "gwei"), "gwei");
  
  const licenseNFT = await LicenseNFT.deploy(echoAssetAddress, gasOptions);
  await licenseNFT.waitForDeployment();
  
  const contractAddress = await licenseNFT.getAddress();
  console.log("✅ LicenseNFT 部署成功!");
  console.log("📄 合约地址:", contractAddress);
  
  // 验证初始配置
  console.log("\n📊 初始配置验证:");
  console.log("  - 名称:", await licenseNFT.name());
  console.log("  - 符号:", await licenseNFT.symbol());
  const feeRate = await licenseNFT.platformFeeRate();
  console.log("  - 平台费率:", (feeRate * 100 / 10000).toString() + "%");
  
  // 场景倍率
  const multipliers = [
    { name: "PERSONAL", type: 0, expected: "1.0x" },
    { name: "GAME", type: 1, expected: "1.5x" },
    { name: "AI_TRAINING", type: 2, expected: "2.0x" },
    { name: "COMMERCIAL", type: 3, expected: "3.0x" },
  ];
  
  console.log("\n🎯 场景倍率配置:");
  for (const m of multipliers) {
    const value = await licenseNFT.usageMultipliers(m.type);
    const actualX = (Number(value) / 100).toFixed(1);
    console.log(`  - ${m.name}: ${value.toString()} = ${actualX}x (${m.expected})`);
  }
  
  // 保存部署信息
  const deploymentInfo = {
    network: hre.network.name,
    chainId: 813,
    contractName: "LicenseNFT",
    contractAddress: contractAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
    echoAssetAddress: echoAssetAddress,
  };
  
  const fs = require("fs");
  fs.writeFileSync(
    "deployment-license.json",
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n💾 部署信息已保存到 deployment-license.json");
  console.log("\n🎉 部署完成！");
  console.log("\n⚠️  重要提醒:");
  console.log("  1. 请保存合约地址，后续需要使用");
  console.log("  2. 更新 frontend/js/wallet.js 中的合约地址");
  console.log("  3. 部署后合约不可修改，请谨慎操作");
  
  return contractAddress;
}

main()
  .then((address) => {
    console.log("\n✨ 合约地址:", address);
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ 部署失败:", error);
    process.exit(1);
  });