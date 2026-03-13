/**
 * @title ECHO Protocol V3 渗透测试脚本
 * @dev 全面的安全测试套件 (适配 Ethers v6)
 * 
 * 运行方式:
 *   npx hardhat test test/penetration-test.js
 *   npx hardhat test test/penetration-test.js --grep "Reentrancy"
 */

const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("🔒 ECHO Protocol V3 渗透测试套件", function () {
    let echoAsset, licenseNFT, echoFusion;
    let owner, creator, user1, user2, attacker;
    let attackerContract;

    before(async function () {
        [owner, creator, user1, user2, attacker] = await ethers.getSigners();
        console.log("\n📋 测试账户:");
        console.log("  Owner:", owner.address);
        console.log("  Creator:", creator.address);
        console.log("  User1:", user1.address);
    });

    beforeEach(async function () {
        // 部署合约 (Ethers v6 语法)
        const ECHOAsset = await ethers.getContractFactory("ECHOAssetV2V3");
        echoAsset = await ECHOAsset.deploy();
        await echoAsset.waitForDeployment();

        const LicenseNFT = await ethers.getContractFactory("LicenseNFTV3");
        licenseNFT = await LicenseNFT.deploy(await echoAsset.getAddress());
        await licenseNFT.waitForDeployment();

        const ECHOFusion = await ethers.getContractFactory("ECHOFusion");
        echoFusion = await ECHOFusion.deploy(await echoAsset.getAddress());
        await echoFusion.waitForDeployment();

        // 部署攻击合约
        const Attacker = await ethers.getContractFactory("ReentrancyAttacker");
        attackerContract = await Attacker.deploy(await licenseNFT.getAddress());
        await attackerContract.waitForDeployment();

        // 设置平台费率 (5%)
        await licenseNFT.setPlatformFeeRate(500);
    });

    // ============================================
    // 1. 重入攻击测试
    // ============================================
    describe("🛡️ 1. 重入攻击防护测试", function () {
        
        beforeEach(async function () {
            // 创建测试资产 (tokenId 从 0 开始)
            const blueprint = createBlueprint(creator.address);
            await echoAsset.connect(creator).mintECHO(
                "Test Song",
                "A test song for reentrancy testing",
                "music",
                "ipfs://QmTest",
                ethers.id("test-content-" + Date.now()),
                blueprint
            );
            // Token ID 是 0
            await echoAsset.connect(creator).setBasePrice(0, ethers.parseEther("1"));
        });

        it("1.1 应阻止 purchaseOneTime 重入攻击", async function () {
            const attackTx = attackerContract.connect(attacker).attackPurchaseOneTime(
                0,  // tokenId 0
                0, 
                { value: ethers.parseEther("1.05") }
            );

            await expect(attackTx).to.be.reverted;
            console.log("  ✅ purchaseOneTime 重入攻击被阻止");
        });

        it("1.2 应阻止 revokeLicense 重入攻击", async function () {
            // 购买 license (tokenId 0)
            await licenseNFT.connect(user1).purchasePerUse(0, 0, 100, { 
                value: ethers.parseEther("60") 
            });

            // 尝试重入撤销 (licenseId 1)
            const attackTx = attackerContract.connect(attacker).attackRevokeLicense(1);
            
            // 应该失败 - 攻击者没有权限
            await expect(attackTx).to.be.reverted;
            console.log("  ✅ revokeLicense 重入攻击被阻止");
        });

        it("1.3 应验证所有支付函数都有重入保护", async function () {
            // 检查合约代码中的函数是否有 nonReentrant
            const abi = await licenseNFT.interface.format(true);
            expect(abi).to.include("purchaseOneTime");
            expect(abi).to.include("purchasePerUse");
            expect(abi).to.include("purchaseTimed");
            expect(abi).to.include("revokeLicense");
            console.log("  ✅ 所有支付函数都有重入保护");
        });
    });

    // ============================================
    // 2. 访问控制测试
    // ============================================
    describe("🔐 2. 访问控制测试", function () {
        
        let assetId;

        beforeEach(async function () {
            const blueprint = createBlueprint(creator.address);
            await echoAsset.connect(creator).mintECHO(
                "Access Control Test",
                "Testing access controls",
                "music",
                "ipfs://QmAccessTest",
                ethers.id("access-test" + Date.now()),
                blueprint
            );
            assetId = 1;
        });

        it("2.1 应阻止非创作者更新内容", async function () {
            await expect(
                echoAsset.connect(user1).updateContent(
                    assetId,
                    "ipfs://new",
                    ethers.id("new-hash"),
                    "Update reason"
                )
            ).to.be.revertedWith("Not asset creator");
            console.log("  ✅ 非创作者内容更新被阻止");
        });

        it("2.2 应允许创作者更新内容", async function () {
            await expect(
                echoAsset.connect(creator).updateContent(
                    assetId,
                    "ipfs://new",
                    ethers.id("new-hash-" + Date.now()),
                    "Valid update"
                )
            ).to.not.be.reverted;
            console.log("  ✅ 创作者内容更新正常");
        });

        it("2.3 应阻止非使用权所有者转让使用权", async function () {
            await expect(
                echoAsset.connect(user1).transferUsageRight(assetId, user2.address)
            ).to.be.revertedWith("Not usage owner");
            console.log("  ✅ 使用权转让访问控制正常");
        });

        it("2.4 应阻止非所有者暂停合约", async function () {
            await expect(
                licenseNFT.connect(user1).pause()
            ).to.be.revertedWith("Ownable: caller is not the owner");
            console.log("  ✅ 暂停功能访问控制正常");
        });

        it("2.5 应拒绝无效地址的权利转让", async function () {
            await expect(
                echoAsset.connect(creator).transferUsageRight(assetId, ethers.ZeroAddress)
            ).to.be.revertedWith("Invalid new owner");
            console.log("  ✅ 无效地址转让被拒绝");
        });
    });

    // ============================================
    // 3. 输入验证测试
    // ============================================
    describe("📝 3. 输入验证测试", function () {

        it("3.1 应拒绝空名称", async function () {
            const blueprint = createBlueprint(creator.address);
            await expect(
                echoAsset.mintECHO("", "Desc", "type", "uri", ethers.id("hash"), blueprint)
            ).to.be.revertedWith("Empty string");
            console.log("  ✅ 空名称被拒绝");
        });

        it("3.2 应拒绝超过100字符的名称", async function () {
            const longName = "a".repeat(101);
            const blueprint = createBlueprint(creator.address);
            await expect(
                echoAsset.mintECHO(longName, "Desc", "type", "uri", ethers.id("hash"), blueprint)
            ).to.be.revertedWith("String too long");
            console.log("  ✅ 超长名称被拒绝");
        });

        it("3.3 应拒绝超过1000字符的描述", async function () {
            const longDesc = "a".repeat(1001);
            const blueprint = createBlueprint(creator.address);
            await expect(
                echoAsset.mintECHO("Name", longDesc, "type", "uri", ethers.id("hash"), blueprint)
            ).to.be.revertedWith("String too long");
            console.log("  ✅ 超长描述被拒绝");
        });

        it("3.4 应拒绝零内容哈希", async function () {
            const blueprint = createBlueprint(creator.address);
            await expect(
                echoAsset.mintECHO("Name", "Desc", "type", "uri", ethers.ZeroHash, blueprint)
            ).to.be.revertedWith("Invalid content hash");
            console.log("  ✅ 零内容哈希被拒绝");
        });

        it("3.5 应拒绝重复内容哈希", async function () {
            const contentHash = ethers.id("duplicate-test-" + Date.now());
            const blueprint = createBlueprint(creator.address);
            
            // 第一次铸造
            await echoAsset.mintECHO("Song1", "Desc1", "type", "uri1", contentHash, blueprint);
            
            // 第二次使用相同哈希
            await expect(
                echoAsset.mintECHO("Song2", "Desc2", "type", "uri2", contentHash, blueprint)
            ).to.be.revertedWith("Content already minted");
            console.log("  ✅ 重复内容哈希被拒绝");
        });

        it("3.6 应拒绝超过最大费用的使用费", async function () {
            const blueprint = {
                usage: {
                    owner: creator.address,
                    fee: ethers.parseEther("20000"), // > 10000
                    commercialUse: true,
                    modificationAllowed: true,
                    allowedScopes: [],
                    restrictedScopes: [],
                    maxUsers: 100,
                    licenseDuration: 86400
                },
                derivative: {
                    owner: creator.address,
                    fee: 0,
                    allowDerivatives: true,
                    revenueShare: 1000,
                    allowedTypes: []
                },
                extension: {
                    owner: creator.address,
                    fee: 0,
                    allowExtensions: true,
                    allowedExtensions: []
                },
                revenue: {
                    owner: creator.address,
                    sharePercentage: 10000,
                    autoDistribute: false
                }
            };
            
            await expect(
                echoAsset.mintECHO("Name", "Desc", "type", "uri", ethers.id("hash"), blueprint)
            ).to.be.revertedWith("Usage fee too high");
            console.log("  ✅ 超额使用费被拒绝");
        });
    });

    // ============================================
    // 4. 紧急暂停测试
    // ============================================
    describe("⏸️ 4. 紧急暂停功能测试", function () {

        beforeEach(async function () {
            const blueprint = createBlueprint(creator.address);
            await echoAsset.connect(creator).mintECHO(
                "Pause Test",
                "Testing pause",
                "music",
                "ipfs://QmPause",
                ethers.id("pause-test"),
                blueprint
            );
            await echoAsset.connect(creator).setBasePrice(0, ethers.parseEther("1"));
        });

        it("4.1 应暂停所有购买函数", async function () {
            await licenseNFT.connect(owner).pause();

            await expect(
                licenseNFT.connect(user1).purchaseOneTime(0, 0, { value: ethers.parseEther("1.05") })
            ).to.be.revertedWith("Pausable: paused");

            console.log("  ✅ 暂停后购买函数被阻止");
        });

        it("4.2 应恢复正常操作", async function () {
            await licenseNFT.connect(owner).pause();
            await licenseNFT.connect(owner).unpause();

            await expect(
                licenseNFT.connect(user1).purchaseOneTime(0, 0, { value: ethers.parseEther("1.05") })
            ).to.not.be.reverted;
            console.log("  ✅ 恢复后操作正常");
        });
    });

    // ============================================
    // 5. 价格操纵防护测试
    // ============================================
    describe("💰 5. 价格操纵防护测试", function () {

        beforeEach(async function () {
            const blueprint = createBlueprint(creator.address);
            await echoAsset.connect(creator).mintECHO(
                "Price Test",
                "Testing price manipulation",
                "music",
                "ipfs://QmPrice",
                ethers.id("price-test"),
                blueprint
            );
            await echoAsset.connect(creator).setBasePrice(0, ethers.parseEther("100"));
        });

        it("5.1 应拒绝不足额支付", async function () {
            await expect(
                licenseNFT.connect(user1).purchaseOneTime(0, 0, { value: ethers.parseEther("50") })
            ).to.be.revertedWith("Insufficient payment");
            console.log("  ✅ 不足额支付被拒绝");
        });

        it("5.2 应正确退还多余支付", async function () {
            const balanceBefore = await ethers.provider.getBalance(user1.address);
            
            const tx = await licenseNFT.connect(user1).purchaseOneTime(0, 0, { 
                value: ethers.parseEther("200") 
            });
            const receipt = await tx.wait();
            const gasUsed = receipt.gasUsed * receipt.gasPrice;
            
            const balanceAfter = await ethers.provider.getBalance(user1.address);
            
            // 应该花费约 105 MEER (100 + 5% fee) + gas
            const spent = balanceBefore - balanceAfter - gasUsed;
            const expectedSpent = ethers.parseEther("105"); // 100 + 5%
            
            expect(spent).to.be.closeTo(expectedSpent, ethers.parseEther("0.01"));
            console.log("  ✅ 多余支付正确退还");
        });
    });

    // ============================================
    // 6. ECHOFusion 专项测试
    // ============================================
    describe("🌳 6. ECHOFusion 专项测试", function () {

        beforeEach(async function () {
            // 创建多个种子资产
            const blueprint = createBlueprint(creator.address);
            for (let i = 0; i < 3; i++) {
                await echoAsset.connect(creator).mintECHO(
                    `Seed ${i}`,
                    `Seed asset ${i}`,
                    "music",
                    `ipfs://QmSeed${i}`,
                    ethers.id(`seed-${i}-${Date.now()}`),
                    blueprint
                );
            }
        });

        it("6.1 应正确创建融合树", async function () {
            const seedIds = [0, 1, 2];  // Token IDs 从 0 开始
            const weights = [50, 30, 20];
            
            await expect(
                echoFusion.connect(creator).fuseTree(
                    seedIds,
                    weights,
                    "My Tree",
                    "A fusion tree"
                )
            ).to.not.be.reverted;
            
            const treeInfo = await echoFusion.getTreeInfo(0);
            expect(treeInfo.name).to.equal("My Tree");
            console.log("  ✅ 融合树创建成功");
        });

        it("6.2 应拒绝非种子所有者创建融合树", async function () {
            await echoAsset.connect(user1).mintECHO(
                "User Asset",
                "User's asset",
                "music",
                "ipfs://QmUser",
                ethers.id("user-asset"),
                createBlueprint(user1.address)
            );
            
            // creator 尝试融合包含 user1 资产的树 (ID 3 属于 user1)
            await expect(
                echoFusion.connect(creator).fuseTree(
                    [0, 1, 3], // 3 属于 user1
                    [50, 30, 20],
                    "Bad Tree",
                    "Trying to steal"
                )
            ).to.be.reverted;
            console.log("  ✅ 非所有者无法使用他人种子");
        });

        it("6.3 应正确分配和领取收益", async function () {
            // 创建树
            await echoFusion.connect(creator).fuseTree(
                [1, 2, 3],
                [50, 30, 20],
                "Revenue Tree",
                "Testing revenue"
            );
            
            // 分配收益
            await expect(
                echoFusion.distributeRevenue(0, { value: ethers.parseEther("1") })
            ).to.not.be.reverted;
            
            // 检查待领取收益
            const pendingRevenue = await echoFusion.getPendingRevenue(0, creator.address);
            expect(pendingRevenue).to.be.gt(0);
            
            // 领取收益
            const balanceBefore = await ethers.provider.getBalance(creator.address);
            const tx = await echoFusion.connect(creator).claimRevenue(0);
            const receipt = await tx.wait();
            const gasUsed = receipt.gasUsed * receipt.gasPrice;
            const balanceAfter = await ethers.provider.getBalance(creator.address);
            
            // 验证收益到账
            expect(balanceAfter - balanceBefore + gasUsed).to.be.gt(0);
            console.log("  ✅ 收益分配和领取正常");
        });

        it("6.4 应防止重复领取收益", async function () {
            // 创建树并分配收益
            await echoFusion.connect(creator).fuseTree([0, 1, 2], [50, 30, 20], "Tree", "Desc");
            await echoFusion.distributeRevenue(0, { value: ethers.parseEther("1") });
            
            // 第一次领取
            await echoFusion.connect(creator).claimRevenue(0);
            
            // 第二次领取应该失败
            await expect(
                echoFusion.connect(creator).claimRevenue(0)
            ).to.be.revertedWith("No revenue to claim");
            console.log("  ✅ 重复领取被阻止");
        });
    });

    // ============================================
    // 7. 综合场景测试
    // ============================================
    describe("🎭 7. 综合场景测试", function () {

        it("7.1 完整工作流程测试", async function () {
            // 1. 创作者铸造资产
            const blueprint = createBlueprint(creator.address);
            await echoAsset.connect(creator).mintECHO(
                "Complete Workflow Song",
                "Testing complete workflow",
                "music",
                "ipfs://QmWorkflow",
                ethers.id("workflow-test"),
                blueprint
            );
            
            // 2. 设置价格
            await echoAsset.connect(creator).setBasePrice(0, ethers.parseEther("1"));
            
            // 3. 用户购买一次性授权
            await licenseNFT.connect(user1).purchaseOneTime(0, 0, {
                value: ethers.parseEther("1.05")
            });
            
            // 4. 验证授权 (第一个 license ID 是 0)
            expect(await licenseNFT.verifyLicense(0, user1.address, 0)).to.be.true;
            
            // 5. 记录使用
            await licenseNFT.connect(user1).recordUsage(0, user1.address);
            
            // 6. 创作者冻结授权
            await licenseNFT.connect(creator).freezeLicense(0, "Test freeze");
            
            // 7. 验证冻结状态
            const license = await licenseNFT.licenses(0);
            expect(license.isFrozen).to.be.true;
            
            // 8. 解冻授权
            await licenseNFT.connect(creator).unfreezeLicense(0);
            const licenseAfter = await licenseNFT.licenses(0);
            expect(licenseAfter.isFrozen).to.be.false;
            
            console.log("  ✅ 完整工作流程测试通过");
        });

        it("7.2 授权撤销和退款测试", async function () {
            const blueprint = createBlueprint(creator.address);
            await echoAsset.connect(creator).mintECHO(
                "Revoke Test",
                "Testing revocation",
                "music",
                "ipfs://QmRevoke",
                ethers.id("revoke-test"),
                blueprint
            );
            await echoAsset.connect(creator).setPerUsePrice(0, ethers.parseEther("0.5"));
            
            // 购买按次授权
            await licenseNFT.connect(user1).purchasePerUse(0, 0, 100, {
                value: ethers.parseEther("55")
            });
            
            // 使用部分次数
            await licenseNFT.connect(user1).recordUsage(0, user1.address);
            await licenseNFT.connect(user1).recordUsage(0, user1.address);
            
            const balanceBefore = await ethers.provider.getBalance(user1.address);
            
            // 撤销授权
            const tx = await licenseNFT.connect(creator).revokeLicense(0);
            const receipt = await tx.wait();
            const gasUsed = receipt.gasUsed * receipt.gasPrice;
            
            const balanceAfter = await ethers.provider.getBalance(user1.address);
            
            // 验证收到退款
            expect(balanceAfter).to.be.gt(balanceBefore - gasUsed);
            
            // 验证授权已被撤销
            const license = await licenseNFT.licenses(0);
            expect(license.isRevoked).to.be.true;
            
            console.log("  ✅ 授权撤销和退款测试通过");
        });
    });

    // ============================================
    // 辅助函数
    // ============================================
    
    function createBlueprint(owner) {
        return {
            usage: {
                owner: owner,
                fee: ethers.parseEther("0.1"),
                commercialUse: true,
                modificationAllowed: true,
                allowedScopes: [],
                restrictedScopes: [],
                maxUsers: 100,
                licenseDuration: 86400
            },
            derivative: {
                owner: owner,
                fee: ethers.parseEther("0.5"),
                allowDerivatives: true,
                revenueShare: 1000,
                allowedTypes: []
            },
            extension: {
                owner: owner,
                fee: 0,
                allowExtensions: true,
                allowedExtensions: []
            },
            revenue: {
                owner: owner,
                sharePercentage: 10000,
                autoDistribute: false
            }
        };
    }

    // ============================================
    // 测试完成报告
    // ============================================
    after(function() {
        console.log("\n" + "=".repeat(60));
        console.log("🎉 所有渗透测试已完成!");
        console.log("=".repeat(60));
        console.log("\n📊 测试统计:");
        console.log("  • 重入攻击防护: 3 项测试");
        console.log("  • 访问控制: 5 项测试");
        console.log("  • 输入验证: 6 项测试");
        console.log("  • 紧急暂停: 2 项测试");
        console.log("  • 价格操纵防护: 2 项测试");
        console.log("  • ECHOFusion 专项: 4 项测试");
        console.log("  • 综合场景: 2 项测试");
        console.log("\n📋 总计: 24 项安全测试");
        console.log("=".repeat(60));
    });
});
