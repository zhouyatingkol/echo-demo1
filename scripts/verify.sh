#!/bin/bash
# ECHO Protocol 合约验证助手
# 用于生成区块浏览器验证所需的所有信息

echo "🌳 ECHO Protocol 合约验证助手"
echo "================================"
echo ""

# 合约地址 (V3 最新版本 - 2026-03-13 部署)
ECHO_ASSET="0xF98f63b7e8064Dcf9c2f25A906B2af89Af4840ce"
ECHO_FUSION="0x8Eb7a29C41478a3f32015C1330DFf7cc683d0952"
LICENSE_NFT="0x2f79b56047050FD2Ee7C62d2d0fe644c15c68e23"

echo "📋 合约地址:"
echo "  ECHOAssetV2V3: $ECHO_ASSET"
echo "  ECHOFusionV2:  $ECHO_FUSION"
echo "  LicenseNFTV3:  $LICENSE_NFT"
echo ""

echo "🔧 编译器设置:"
echo "  Solidity: 0.8.19"
echo "  Optimization: Enabled"
echo "  Runs: 200"
echo ""

echo "📁 源码文件:"
echo "  ECHOAssetV2V3: contracts/ECHOAssetV2V3.sol"
echo "  ECHOFusionV2:  contracts/ECHOFusionV2.sol"
echo "  LicenseNFTV3:  contracts/LicenseNFTV3.sol"
echo ""

echo "🔗 构造参数:"
echo "  ECHOFusion:  0x000000000000000000000000F98f63b7e8064Dcf9c2f25A906B2af89Af4840ce"
echo "  LicenseNFT:  0x000000000000000000000000F98f63b7e8064Dcf9c2f25A906B2af89Af4840ce"
echo ""

echo "🌐 验证链接:"
echo "  ECHOAssetV2V3: https://qng.qitmeer.io/address/$ECHO_ASSET/verify-via-flattened-code/new"
echo "  ECHOFusionV2:  https://qng.qitmeer.io/address/$ECHO_FUSION/verify-via-flattened-code/new"
echo "  LicenseNFTV3:  https://qng.qitmeer.io/address/$LICENSE_NFT/verify-via-flattened-code/new"
echo ""

echo "📖 完整指南: VERIFICATION_GUIDE.md"
echo ""

echo "✅ 准备就绪！请访问上述链接进行验证。"
