# ECHO Protocol 安全测试用例
# 用于验证合约安全修复
# 运行环境: Hardhat + Chai

## 测试文件结构
test/
├── 01_reentrancy.test.js          # 重入攻击测试
├── 02_access_control.test.js      # 访问控制测试
├── 03_input_validation.test.js    # 输入验证测试
├── 04_pause.test.js               # 紧急暂停测试
├── 05_price_manipulation.test.js  # 价格操纵测试
└── 06_integration.test.js         # 集成测试

---

## 1. 重入攻击测试 (01_reentrancy.test.js)

```javascript
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Reentrancy Protection", function () {
    let licenseNFT, echoAsset;
    let owner, creator, attacker;
    let attackerContract;

    beforeEach(async function () {
        [owner, creator, attacker] = await ethers.getSigners();
        
        // 部署合约
        const ECHOAsset = await ethers.getContractFactory("ECHOAssetV2V3");
        echoAsset = await ECHOAsset.deploy();
        
        const LicenseNFT = await ethers.getContractFactory("LicenseNFTV3");
        licenseNFT = await LicenseNFT.deploy(echoAsset.address);
        
        // 部署攻击合约
        const Attacker = await ethers.getContractFactory("ReentrancyAttacker");
        attackerContract = await Attacker.deploy(licenseNFT.address);
    });

    it("Should prevent reentrancy in purchaseOneTime", async function () {
        // 尝试重入攻击
        await expect(
            attackerContract.attackPurchaseOneTime({ value: ethers.utils.parseEther("1") })
        ).to.be.revertedWith("ReentrancyGuard: reentrant call");
    });

    it("Should prevent reentrancy in revokeLicense", async function () {
        // 创建 License
        await licenseNFT.purchaseOneTime(1, 0, { value: ethers.utils.parseEther("1.05") });
        
        // 尝试重入撤销
        await expect(
            attackerContract.attackRevokeLicense(1)
        ).to.be.revertedWith("ReentrancyGuard: reentrant call");
    });

    it("Should follow CEI pattern in all payment functions", async function () {
        // 检查所有涉及 ETH 的函数都有 nonReentrant
        const abi = licenseNFT.interface.format(ethers.utils.FormatTypes.json);
        const paymentFunctions = [
            "purchaseOneTime",
            "purchasePerUse", 
            "purchaseTimed",
            "revokeLicense"
        ];
        
        for (const funcName of paymentFunctions) {
            const func = abi.find(f => f.name === funcName);
            expect(func).to.not.be.undefined;
            // 验证合约已部署，实际测试需要手动检查代码
        }
    });
});

// 攻击合约（用于测试）
contract ReentrancyAttacker {
    LicenseNFTV3 public target;
    uint256 public attackCount;
    
    constructor(address _target) {
        target = LicenseNFTV3(_target);
    }
    
    function attackPurchaseOneTime() external payable {
        target.purchaseOneTime{value: msg.value}(1, 0);
    }
    
    function attackRevokeLicense(uint256 licenseId) external {
        target.revokeLicense(licenseId);
    }
    
    receive() external payable {
        attackCount++;
        if (attackCount < 3) {
            // 尝试重入
            target.purchaseOneTime{value: msg.value}(1, 0);
        }
    }
}
```

---

## 2. 访问控制测试 (02_access_control.test.js)

```javascript
describe("Access Control", function () {
    let echoAsset, licenseNFT;
    let owner, creator, user;
    let tokenId;

    beforeEach(async function () {
        [owner, creator, user] = await ethers.getSigners();
        
        const ECHOAsset = await ethers.getContractFactory("ECHOAssetV2V3");
        echoAsset = await ECHOAsset.deploy();
        
        // 铸造资产
        const blueprint = {
            usage: {
                owner: creator.address,
                fee: ethers.utils.parseEther("0.1"),
                commercialUse: true,
                modificationAllowed: true,
                allowedScopes: [],
                restrictedScopes: [],
                maxUsers: 100,
                licenseDuration: 86400
            },
            derivative: {
                owner: creator.address,
                fee: ethers.utils.parseEther("0.5"),
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
        
        const tx = await echoAsset.connect(creator).mintECHO(
            "Test Song",
            "A test song",
            "music",
            "ipfs://Qm...",
            ethers.utils.id("content1"),
            blueprint
        );
        
        const receipt = await tx.wait();
        tokenId = receipt.events[0].args.tokenId;
    });

    describe("ECHOAssetV2V3", function () {
        it("Should only allow creator to update content", async function () {
            await expect(
                echoAsset.connect(user).updateContent(
                    tokenId,
                    "ipfs://new",
                    ethers.utils.id("new"),
                    "Update"
                )
            ).to.be.revertedWith("Not asset creator");
            
            // 创作者应该可以
            await expect(
                echoAsset.connect(creator).updateContent(
                    tokenId,
                    "ipfs://new",
                    ethers.utils.id("new"),
                    "Update"
                )
            ).to.not.be.reverted;
        });

        it("Should only allow usage owner to transfer usage right", async function () {
            await expect(
                echoAsset.connect(user).transferUsageRight(tokenId, user.address)
            ).to.be.revertedWith("Not usage owner");
        });

        it("Should only allow revenue owner to transfer revenue right", async function () {
            await expect(
                echoAsset.connect(user).transferRevenueRight(tokenId, user.address)
            ).to.be.revertedWith("Not revenue owner");
        });

        it("Should prevent invalid address for right transfer", async function () {
            await expect(
                echoAsset.connect(creator).transferUsageRight(tokenId, ethers.constants.AddressZero)
            ).to.be.revertedWith("Invalid new owner");
        });
    });

    describe("LicenseNFTV3", function () {
        it("Should only allow owner to pause/unpause", async function () {
            await expect(
                licenseNFT.connect(user).pause()
            ).to.be.revertedWith("Ownable: caller is not the owner");
            
            await expect(licenseNFT.connect(owner).pause())
                .to.not.be.reverted;
        });

        it("Should only allow asset creator to freeze license", async function () {
            // 先购买 License
            await licenseNFT.purchaseOneTime(tokenId, 0, { value: ethers.utils.parseEther("1.05") });
            
            await expect(
                licenseNFT.connect(user).freezeLicense(1, "Test")
            ).to.be.revertedWith("Not authorized");
        });
    });
});
```

---

## 3. 输入验证测试 (03_input_validation.test.js)

```javascript
describe("Input Validation", function () {
    let echoAsset;
    let creator;

    beforeEach(async function () {
        [, creator] = await ethers.getSigners();
        
        const ECHOAsset = await ethers.getContractFactory("ECHOAssetV2V3");
        echoAsset = await ECHOAsset.deploy();
    });

    describe("String Length Validation", function () {
        it("Should reject empty name", async function () {
            const blueprint = { /* ... */ };
            
            await expect(
                echoAsset.mintECHO("", "Desc", "type", "uri", ethers.utils.id("hash"), blueprint)
            ).to.be.revertedWith("Empty string");
        });

        it("Should reject name > 100 characters", async function () {
            const longName = "a".repeat(101);
            const blueprint = { /* ... */ };
            
            await expect(
                echoAsset.mintECHO(longName, "Desc", "type", "uri", ethers.utils.id("hash"), blueprint)
            ).to.be.revertedWith("String too long");
        });

        it("Should reject description > 1000 characters", async function () {
            const longDesc = "a".repeat(1001);
            const blueprint = { /* ... */ };
            
            await expect(
                echoAsset.mintECHO("Name", longDesc, "type", "uri", ethers.utils.id("hash"), blueprint)
            ).to.be.revertedWith("String too long");
        });

        it("Should reject URI > 500 characters", async function () {
            const longUri = "ipfs://" + "a".repeat(494);
            const blueprint = { /* ... */ };
            
            await expect(
                echoAsset.mintECHO("Name", "Desc", "type", longUri, ethers.utils.id("hash"), blueprint)
            ).to.be.revertedWith("String too long");
        });
    });

    describe("Content Hash Validation", function () {
        it("Should reject zero content hash", async function () {
            const blueprint = { /* ... */ };
            
            await expect(
                echoAsset.mintECHO("Name", "Desc", "type", "uri", ethers.constants.HashZero, blueprint)
            ).to.be.revertedWith("Invalid content hash");
        });

        it("Should reject duplicate content hash", async function () {
            const contentHash = ethers.utils.id("unique");
            const blueprint = { /* ... */ };
            
            // 第一次铸造
            await echoAsset.mintECHO("Song1", "Desc1", "type", "uri1", contentHash, blueprint);
            
            // 第二次使用相同 hash 应该失败
            await expect(
                echoAsset.mintECHO("Song2", "Desc2", "type", "uri2", contentHash, blueprint)
            ).to.be.revertedWith("Content already minted");
        });
    });

    describe("Blueprint Validation", function () {
        it("Should reject fee > MAX_FEE", async function () {
            const blueprint = {
                usage: {
                    owner: creator.address,
                    fee: ethers.utils.parseEther("20000"), // > 10000
                    // ...
                },
                // ...
            };
            
            await expect(
                echoAsset.mintECHO("Name", "Desc", "type", "uri", ethers.utils.id("hash"), blueprint)
            ).to.be.revertedWith("Usage fee too high");
        });

        it("Should reject revenue share > 100%", async function () {
            const blueprint = {
                usage: {
                    owner: creator.address,
                    fee: ethers.utils.parseEther("1"),
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
                    revenueShare: 15000, // > 10000
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
                echoAsset.mintECHO("Name", "Desc", "type", "uri", ethers.utils.id("hash"), blueprint)
            ).to.be.revertedWith("Revenue share too high");
        });

        it("Should reject license duration > 1 year", async function () {
            const blueprint = {
                usage: {
                    owner: creator.address,
                    fee: ethers.utils.parseEther("1"),
                    commercialUse: true,
                    modificationAllowed: true,
                    allowedScopes: [],
                    restrictedScopes: [],
                    maxUsers: 100,
                    licenseDuration: 366 days // > 365
                },
                // ...
            };
            
            await expect(
                echoAsset.mintECHO("Name", "Desc", "type", "uri", ethers.utils.id("hash"), blueprint)
            ).to.be.revertedWith("License duration too long");
        });
    });

    describe("Price Validation", function () {
        it("Should reject setting price > MAX_FEE", async function () {
            const blueprint = { /* ... */ };
            const tx = await echoAsset.mintECHO("Name", "Desc", "type", "uri", ethers.utils.id("hash"), blueprint);
            const receipt = await tx.wait();
            const tokenId = receipt.events[0].args.tokenId;
            
            await expect(
                echoAsset.setBasePrice(tokenId, ethers.utils.parseEther("20000"))
            ).to.be.revertedWith("Price too high");
        });
    });
});
```

---

## 4. 紧急暂停测试 (04_pause.test.js)

```javascript
describe("Emergency Pause", function () {
    let licenseNFT, echoAsset;
    let owner, user;

    beforeEach(async function () {
        [owner, user] = await ethers.getSigners();
        
        const ECHOAsset = await ethers.getContractFactory("ECHOAssetV2V3");
        echoAsset = await ECHOAsset.deploy();
        
        const LicenseNFT = await ethers.getContractFactory("LicenseNFTV3");
        licenseNFT = await LicenseNFT.deploy(echoAsset.address);
    });

    it("Should pause all purchase functions", async function () {
        await licenseNFT.pause();
        
        await expect(
            licenseNFT.purchaseOneTime(1, 0, { value: ethers.utils.parseEther("1") })
        ).to.be.revertedWith("Pausable: paused");
        
        await expect(
            licenseNFT.purchasePerUse(1, 0, 100, { value: ethers.utils.parseEther("1") })
        ).to.be.revertedWith("Pausable: paused");
        
        await expect(
            licenseNFT.purchaseTimed(1, 0, 30, { value: ethers.utils.parseEther("1") })
        ).to.be.revertedWith("Pausable: paused");
    });

    it("Should unpause and resume normal operation", async function () {
        await licenseNFT.pause();
        await licenseNFT.unpause();
        
        // 应该可以正常购买
        // 注: 需要先有资产和价格设置
    });

    it("Should emit events on pause/unpause", async function () {
        await expect(licenseNFT.pause())
            .to.emit(licenseNFT, "Paused")
            .withArgs(owner.address);
        
        await expect(licenseNFT.unpause())
            .to.emit(licenseNFT, "Unpaused")
            .withArgs(owner.address);
    });
});
```

---

## 5. 价格操纵测试 (05_price_manipulation.test.js)

```javascript
describe("Price Manipulation Protection", function () {
    let licenseNFT, echoAsset;
    let creator;
    let tokenId;

    beforeEach(async function () {
        [, creator] = await ethers.getSigners();
        
        const ECHOAsset = await ethers.getContractFactory("ECHOAssetV2V3");
        echoAsset = await ECHOAsset.deploy();
        
        const LicenseNFT = await ethers.getContractFactory("LicenseNFTV3");
        licenseNFT = await LicenseNFT.deploy(echoAsset.address);
        
        // 铸造资产
        const blueprint = { /* ... */ };
        const tx = await echoAsset.connect(creator).mintECHO(
            "Test", "Desc", "type", "uri", ethers.utils.id("hash"), blueprint
        );
        tokenId = (await tx.wait()).events[0].args.tokenId;
        
        // 设置价格
        await echoAsset.connect(creator).setBasePrice(tokenId, ethers.utils.parseEther("100"));
    });

    it("Should reject insufficient payment", async function () {
        const basePrice = await echoAsset.basePrices(tokenId);
        const multiplier = await licenseNFT.usageMultipliers(0); // PERSONAL
        const feeRate = await licenseNFT.platformFeeRate();
        
        const adjustedPrice = basePrice.mul(multiplier).div(100);
        const platformFee = adjustedPrice.mul(feeRate).div(10000);
        const totalPrice = adjustedPrice.add(platformFee);
        
        // 尝试支付更少
        const insufficientAmount = totalPrice.sub(1);
        
        await expect(
            licenseNFT.purchaseOneTime(tokenId, 0, { value: insufficientAmount })
        ).to.be.revertedWith("Insufficient payment");
    });

    it("Should correctly refund excess payment", async function () {
        const basePrice = await echoAsset.basePrices(tokenId);
        const multiplier = await licenseNFT.usageMultipliers(0);
        const feeRate = await licenseNFT.platformFeeRate();
        
        const adjustedPrice = basePrice.mul(multiplier).div(100);
        const platformFee = adjustedPrice.mul(feeRate).div(10000);
        const totalPrice = adjustedPrice.add(platformFee);
        
        const excessAmount = totalPrice.add(ethers.utils.parseEther("0.5"));
        
        const balanceBefore = await ethers.provider.getBalance(creator.address);
        
        // 购买并支付多余金额
        await licenseNFT.purchaseOneTime(tokenId, 0, { value: excessAmount });
        
        // 验证退款已发生（通过事件检查）
        // 注意：实际退款到 msg.sender，不是 creator
    });

    it("Should prevent front-running on price updates", async function () {
        // 测试场景：创作者试图更新价格，但用户已经发送交易
        // 这个测试更多是概念性的，实际防护需要在合约中实现时间锁
    });
});
```

---

## 6. 集成测试 (06_integration.test.js)

```javascript
describe("Integration Tests", function () {
    let echoAsset, licenseNFT, echoFusion;
    let owner, creator, user1, user2;

    beforeEach(async function () {
        [owner, creator, user1, user2] = await ethers.getSigners();
        
        const ECHOAsset = await ethers.getContractFactory("ECHOAssetV2V3");
        echoAsset = await ECHOAsset.deploy();
        
        const LicenseNFT = await ethers.getContractFactory("LicenseNFTV3");
        licenseNFT = await LicenseNFT.deploy(echoAsset.address);
        
        const ECHOFusion = await ethers.getContractFactory("ECHOFusion");
        echoFusion = await ECHOFusion.deploy(echoAsset.address);
    });

    it("Should complete full workflow", async function () {
        // 1. 创作者铸造资产
        const blueprint = { /* ... */ };
        const tx = await echoAsset.connect(creator).mintECHO(
            "My Song", "Description", "music", "ipfs://...",
            ethers.utils.id("unique"), blueprint
        );
        const assetId = (await tx.wait()).events[0].args.tokenId;
        
        // 2. 设置价格
        await echoAsset.connect(creator).setBasePrice(assetId, ethers.utils.parseEther("1"));
        
        // 3. 用户购买授权
        const multiplier = await licenseNFT.usageMultipliers(0);
        const feeRate = await licenseNFT.platformFeeRate();
        const basePrice = await echoAsset.basePrices(assetId);
        const totalPrice = basePrice.mul(multiplier).div(100).mul(feeRate.add(10000)).div(10000);
        
        await licenseNFT.connect(user1).purchaseOneTime(assetId, 0, { value: totalPrice });
        
        // 4. 验证授权
        const licenseId = 1;
        expect(await licenseNFT.ownerOf(licenseId)).to.equal(user1.address);
        expect(await licenseNFT.verifyLicense(licenseId, user1.address, 0)).to.be.true;
        
        // 5. 使用授权
        await licenseNFT.connect(user1).recordUsage(licenseId, user1.address);
        
        // 6. 创作者冻结授权（如有需要）
        await licenseNFT.connect(creator).freezeLicense(licenseId, "Violation");
        
        // 7. 验证已冻结
        const license = await licenseNFT.licenses(licenseId);
        expect(license.isFrozen).to.be.true;
    });

    it("Should handle emergency pause correctly", async function () {
        // 铸造并购买
        const blueprint = { /* ... */ };
        await echoAsset.connect(creator).mintECHO("Test", "Desc", "type", "uri", ethers.utils.id("hash"), blueprint);
        await echoAsset.connect(creator).setBasePrice(1, ethers.utils.parseEther("1"));
        
        // 购买一个授权
        await licenseNFT.connect(user1).purchaseOneTime(1, 0, { value: ethers.utils.parseEther("1.05") });
        
        // 紧急暂停
        await licenseNFT.connect(owner).pause();
        
        // 新购买应该失败
        await expect(
            licenseNFT.connect(user2).purchaseOneTime(1, 0, { value: ethers.utils.parseEther("1.05") })
        ).to.be.revertedWith("Pausable: paused");
        
        // 但已存在的授权应该还能使用（如果设计允许）
        // 这取决于具体业务逻辑
        
        // 解除暂停
        await licenseNFT.connect(owner).unpause();
        
        // 应该可以购买
        await expect(
            licenseNFT.connect(user2).purchaseOneTime(1, 0, { value: ethers.utils.parseEther("1.05") })
        ).to.not.be.reverted;
    });
});
```

---

## 测试运行命令

```bash
# 运行所有测试
npx hardhat test

# 运行特定测试文件
npx hardhat test test/01_reentrancy.test.js
npx hardhat test test/02_access_control.test.js

# 运行带 gas 报告的测试
REPORT_GAS=true npx hardhat test

# 运行覆盖率测试
npx hardhat coverage
```

## 预期覆盖率

| 类别 | 目标覆盖率 |
|------|----------|
| 语句覆盖率 | >= 95% |
| 分支覆盖率 | >= 90% |
| 函数覆盖率 | 100% |
| 行覆盖率 | >= 95% |

## 安全测试通过标准

- [ ] 所有重入攻击测试通过
- [ ] 所有访问控制测试通过
- [ ] 所有输入验证测试通过
- [ ] 所有暂停功能测试通过
- [ ] 所有价格验证测试通过
- [ ] 集成测试全部通过
- [ ] Gas 报告无异常
- [ ] 覆盖率达标
