const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("LicenseNFT 合约测试", function () {
  let LicenseNFT;
  let licenseNFT;
  let owner;
  let creator;
  let buyer;
  let addrs;

  beforeEach(async function () {
    // 获取测试账户
    [owner, creator, buyer, ...addrs] = await ethers.getSigners();

    // 部署 LicenseNFT 合约
    // 使用一个模拟的 ECHOAsset 合约地址
    const mockAssetContract = addrs[0].address;
    
    LicenseNFT = await ethers.getContractFactory("LicenseNFT");
    licenseNFT = await LicenseNFT.deploy(mockAssetContract);
    await licenseNFT.waitForDeployment();
  });

  describe("部署", function () {
    it("应该正确部署合约", async function () {
      expect(await licenseNFT.name()).to.equal("ECHO License");
      expect(await licenseNFT.symbol()).to.equal("ECHOL");
    });

    it("应该正确初始化场景倍率", async function () {
      // UsageType.PERSONAL = 0, 倍率应该是 100
      expect(await licenseNFT.usageMultipliers(0)).to.equal(100);
      // UsageType.AI_TRAINING = 2, 倍率应该是 200
      expect(await licenseNFT.usageMultipliers(2)).to.equal(200);
    });
  });

  describe("买断制授权", function () {
    it("应该允许购买买断制授权", async function () {
      // 购买买断制授权，个人使用场景
      // 基础价格 100 MEER × 1.0 + 5% 手续费 = 105 MEER
      const price = ethers.parseEther("105");
      
      await expect(
        licenseNFT.connect(buyer).purchaseOneTime(1, 0, { value: price })
      ).to.emit(licenseNFT, "LicensePurchased")
       .withArgs(1, 1, buyer.address, 0, 0, price);

      // 验证 License 被铸造
      expect(await licenseNFT.ownerOf(1)).to.equal(buyer.address);
      
      // 验证 License 数据
      const license = await licenseNFT.licenses(1);
      expect(license.licenseType).to.equal(0); // ONE_TIME
      expect(license.usageType).to.equal(0);   // PERSONAL
      expect(license.licensee).to.equal(buyer.address);
    });

    it("AI 训练场景应该应用 ×2.0 倍率", async function () {
      // UsageType.AI_TRAINING = 2, 倍率 200
      // 基础价格 100 × 2.0 = 200, 加手续费 5% = 210 MEER
      const price = ethers.parseEther("210");
      
      await expect(
        licenseNFT.connect(buyer).purchaseOneTime(1, 2, { value: price })
      ).to.not.be.reverted;
    });

    it("支付金额不足应该失败", async function () {
      const insufficientPrice = ethers.parseEther("50");
      
      await expect(
        licenseNFT.connect(buyer).purchaseOneTime(1, 0, { value: insufficientPrice })
      ).to.be.revertedWith("Insufficient payment");
    });

    it("应该退还多余金额", async function () {
      const overPrice = ethers.parseEther("200");
      const correctPrice = ethers.parseEther("105");
      
      const balanceBefore = await ethers.provider.getBalance(buyer.address);
      
      const tx = await licenseNFT.connect(buyer).purchaseOneTime(1, 0, { value: overPrice });
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;
      
      const balanceAfter = await ethers.provider.getBalance(buyer.address);
      
      // 应该只扣除 correctPrice + gas
      const expectedBalance = balanceBefore - correctPrice - gasUsed;
      expect(balanceAfter).to.be.closeTo(expectedBalance, ethers.parseEther("0.01"));
    });
  });

  describe("按次计费授权", function () {
    it("应该允许购买按次计费授权", async function () {
      // 购买 100 次，个人使用
      // 基础价格 0.5 × 100 = 50 MEER × 1.0 + 5% = 52.5 MEER
      const price = ethers.parseEther("52.5");
      
      await expect(
        licenseNFT.connect(buyer).purchasePerUse(1, 0, 100, { value: price })
      ).to.emit(licenseNFT, "LicensePurchased");

      const license = await licenseNFT.licenses(1);
      expect(license.licenseType).to.equal(1); // PER_USE
      expect(license.maxUsageCount).to.equal(100);
      expect(license.usedCount).to.equal(0);
    });

    it("购买 0 次应该失败", async function () {
      await expect(
        licenseNFT.connect(buyer).purchasePerUse(1, 0, 0, { value: 100 })
      ).to.be.revertedWith("Usage count must be \u003e 0");
    });
  });

  describe("限时授权", function () {
    it("应该允许购买限时授权", async function () {
      // 购买 30 天，个人使用
      // 基础价格 10 × 30 = 300 MEER × 1.0 + 5% = 315 MEER
      const price = ethers.parseEther("315");
      
      await expect(
        licenseNFT.connect(buyer).purchaseTimed(1, 0, 30, { value: price })
      ).to.emit(licenseNFT, "LicensePurchased");

      const license = await licenseNFT.licenses(1);
      expect(license.licenseType).to.equal(2); // TIMED
      expect(license.validUntil).to.be.gt(0);
    });

    it("购买少于 30 天应该失败", async function () {
      await expect(
        licenseNFT.connect(buyer).purchaseTimed(1, 0, 15, { value: 100 })
      ).to.be.revertedWith("Minimum 30 days");
    });
  });

  describe("License 验证", function () {
    beforeEach(async function () {
      // 先购买一个 License
      const price = ethers.parseEther("105");
      await licenseNFT.connect(buyer).purchaseOneTime(1, 0, { value: price });
    });

    it("应该验证有效的 License", async function () {
      const isValid = await licenseNFT.verifyLicense(1, buyer.address, 0);
      expect(isValid).to.be.true;
    });

    it("非持有者验证应该失败", async function () {
      await expect(
        licenseNFT.verifyLicense(1, addrs[1].address, 0)
      ).to.be.revertedWith("Not license owner");
    });

    it("使用场景不匹配应该失败", async function () {
      // 购买的是 PERSONAL (0)，尝试用 GAME (1)
      await expect(
        licenseNFT.verifyLicense(1, buyer.address, 1)
      ).to.be.revertedWith("Usage type mismatch");
    });

    it("被冻结的 License 应该验证失败", async function () {
      // owner 冻结 License
      await licenseNFT.connect(owner).freezeLicense(1, "Test freeze");
      
      await expect(
        licenseNFT.verifyLicense(1, buyer.address, 0)
      ).to.be.revertedWith("License is frozen");
    });
  });

  describe("使用记录", function () {
    beforeEach(async function () {
      // 购买按次计费 License，100 次
      const price = ethers.parseEther("52.5");
      await licenseNFT.connect(buyer).purchasePerUse(1, 0, 100, { value: price });
    });

    it("应该记录使用次数", async function () {
      await licenseNFT.recordUsage(1, buyer.address);
      
      const license = await licenseNFT.licenses(1);
      expect(license.usedCount).to.equal(1);
    });

    it("超过使用次数应该失败", async function () {
      // 使用 100 次
      for (let i = 0; i < 100; i++) {
        await licenseNFT.recordUsage(1, buyer.address);
      }
      
      // 第 101 次应该失败
      await expect(
        licenseNFT.recordUsage(1, buyer.address)
      ).to.be.revertedWith("Usage limit reached");
    });
  });

  describe("紧急冻结", function () {
    beforeEach(async function () {
      const price = ethers.parseEther("105");
      await licenseNFT.connect(buyer).purchaseOneTime(1, 0, { value: price });
    });

    it("创作者应该可以冻结 License", async function () {
      // 注意：这里的 creator 检查是占位符逻辑
      // 实际应该检查是否是 parentAsset 的创作者
      // 目前只有 owner 可以冻结
      
      await expect(
        licenseNFT.connect(owner).freezeLicense(1, "Violation detected")
      ).to.emit(licenseNFT, "LicenseFrozen")
       .withArgs(1, owner.address, "Violation detected");

      const license = await licenseNFT.licenses(1);
      expect(license.isFrozen).to.be.true;
    });

    it("普通用户不应该可以冻结 License", async function () {
      await expect(
        licenseNFT.connect(buyer).freezeLicense(1, "Test")
      ).to.be.revertedWith("Not authorized");
    });
  });

  describe("管理功能", function () {
    it("owner 应该可以修改平台费率", async function () {
      await licenseNFT.connect(owner).setPlatformFeeRate(1000); // 10%
      expect(await licenseNFT.platformFeeRate()).to.equal(1000);
    });

    it("超过 10% 的费率应该失败", async function () {
      await expect(
        licenseNFT.connect(owner).setPlatformFeeRate(1100)
      ).to.be.revertedWith("Fee rate cannot exceed 10%");
    });

    it("owner 应该可以修改场景倍率", async function () {
      // 将 AI 训练倍率从 200 改为 250
      await licenseNFT.connect(owner).setUsageMultiplier(2, 250);
      expect(await licenseNFT.usageMultipliers(2)).to.equal(250);
    });

    it("非 owner 不应该可以修改参数", async function () {
      // OpenZeppelin v5 的错误消息格式
      await expect(
        licenseNFT.connect(buyer).setPlatformFeeRate(500)
      ).to.be.reverted;
    });
  });

  describe("NFT 功能", function () {
    beforeEach(async function () {
      const price = ethers.parseEther("105");
      await licenseNFT.connect(buyer).purchaseOneTime(1, 0, { value: price });
    });

    it("应该可以转让 License NFT", async function () {
      await licenseNFT.connect(buyer).transferFrom(buyer.address, addrs[0].address, 1);
      expect(await licenseNFT.ownerOf(1)).to.equal(addrs[0].address);
    });

    it("转让后 License  licensee 应该更新", async function () {
      await licenseNFT.connect(buyer).transferFrom(buyer.address, addrs[0].address, 1);
      
      const license = await licenseNFT.licenses(1);
      expect(license.licensee).to.equal(addrs[0].address);
    });
  });
});
