const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("ECHO Shi Framework", function () {
  let shu, pos, field;
  let owner, oracle, user1, user2;

  beforeEach(async function () {
    [owner, oracle, user1, user2] = await ethers.getSigners();
    
    // Deploy contracts
    const ShiShu = await ethers.getContractFactory("ShiShuRegistry");
    shu = await ShiShu.deploy();
    await shu.waitForDeployment();
    
    const ShiPosition = await ethers.getContractFactory("ShiPositionRegistry");
    pos = await ShiPosition.deploy();
    await pos.waitForDeployment();
    
    const ShiField = await ethers.getContractFactory("ShiFieldRegistry");
    field = await ShiField.deploy(await shu.getAddress());
    await field.waitForDeployment();
    
    // Set oracle
    await shu.setOracle(oracle.address);
    await pos.setOracle(oracle.address);
    await field.setOracle(oracle.address);
  });

  describe("ShiShuRegistry", function () {
    it("Should deploy with default boundaries", async function () {
      const boundaries = await shu.currentBoundaries();
      expect(boundaries.time).to.deep.equal([1, 5, 20]);
      expect(boundaries.space).to.deep.equal([2, 5, 8]);
      expect(boundaries.relation).to.deep.equal([3, 10, 50]);
    });

    it("Should allow oracle to update boundaries", async function () {
      await shu.connect(oracle).updateBoundaries(
        [2, 8, 25],
        [3, 6, 10],
        [5, 15, 60]
      );
      
      const boundaries = await shu.currentBoundaries();
      expect(boundaries.time).to.deep.equal([2, 8, 25]);
      expect(boundaries.epoch).to.equal(1);
    });

    it("Should not allow non-oracle to update boundaries", async function () {
      await expect(
        shu.connect(user1).updateBoundaries([2, 8, 25], [3, 6, 10], [5, 15, 60])
      ).to.be.revertedWith("Only oracle");
    });

    it("Should record asset coordinates correctly", async function () {
      const assetId = ethers.id("asset_001");
      
      await shu.connect(oracle).recordCoordinate(
        assetId,
        10,  // time usage
        3,   // space count
        5    // relation count
      );
      
      const coord = await shu.getCoordinate(assetId);
      expect(coord.time).to.equal(2);  // 10 >= 5, so level 2 (active)
      expect(coord.space).to.equal(1); // 3 < 5, so level 1 (few platforms)
      expect(coord.relation).to.equal(1); // 5 < 10, so level 1 (initial connection)
    });
  });

  describe("ShiPositionRegistry", function () {
    it("Should update position correctly", async function () {
      const assetId = ethers.id("asset_001");
      
      await pos.connect(oracle).updatePosition(
        assetId,
        75,   // time percentile
        60,   // space percentile
        45,   // relation percentile
        7200  // shi energy
      );
      
      const position = await pos.getPosition(assetId);
      expect(position.timeYao).to.equal(3);  // 九四 (70-85%)
      expect(position.spaceYao).to.equal(2); // 九三 (50-70%)
      expect(position.relationYao).to.equal(1); // 九二 (25-50%)
      expect(position.shiEnergy).to.equal(7200);
    });

    it("Should record transitions", async function () {
      const assetId = ethers.id("asset_001");
      
      // First update
      await pos.connect(oracle).updatePosition(assetId, 60, 60, 60, 5000);
      
      // Second update (causing transition)
      await pos.connect(oracle).updatePosition(assetId, 80, 60, 60, 6000);
      
      const transitions = await pos.getTransitionCount(assetId);
      expect(transitions).to.be.greaterThan(0);
    });
  });

  describe("ShiFieldRegistry", function () {
    it("Should create epoch", async function () {
      const merkleRoot = ethers.keccak256(ethers.toUtf8Bytes("test"));
      
      // Create 64 regions
      const regions = [];
      for (let i = 0; i < 64; i++) {
        regions.push({
          traditionalName: `Region_${i + 1}`,
          center: [50, 50, 50, 50],
          memberCount: 10,
          description: `Test region ${i + 1}`
        });
      }
      
      await field.connect(oracle).createEpoch(merkleRoot, regions);
      
      expect(await field.currentEpoch()).to.equal(1);
      
      const epoch = await field.epochs(1);
      expect(epoch.merkleRoot).to.equal(merkleRoot);
    });
  });
});
