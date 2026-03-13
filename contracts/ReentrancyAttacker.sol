// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

interface ILicenseNFT {
    function purchaseOneTime(uint256 _parentAssetId, uint8 _usageType) external payable;
    function revokeLicense(uint256 _licenseId) external;
}

/**
 * @title ReentrancyAttacker
 * @dev 用于测试重入攻击防护的恶意合约
 */
contract ReentrancyAttacker {
    ILicenseNFT public target;
    uint256 public attackCount;
    uint256 public constant MAX_ATTACKS = 3;
    
    constructor(address _target) {
        target = ILicenseNFT(_target);
    }
    
    function attackPurchaseOneTime(uint256 assetId, uint8 usageType) external payable {
        attackCount = 0;
        target.purchaseOneTime{value: msg.value}(assetId, usageType);
    }
    
    function attackRevokeLicense(uint256 licenseId) external {
        attackCount = 0;
        target.revokeLicense(licenseId);
    }
    
    receive() external payable {
        attackCount++;
        if (attackCount < MAX_ATTACKS) {
            // 尝试重入攻击
            try target.purchaseOneTime{value: msg.value}(1, 0) {
                // 如果成功，说明有漏洞
            } catch {
                // 被阻止，这是预期的行为
            }
        }
    }
}
