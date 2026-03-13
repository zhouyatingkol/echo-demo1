#!/bin/bash
# ECHO Protocol 合约验证助手
# 用于生成区块浏览器验证所需的所有信息

echo "🌳 ECHO Protocol 合约验证助手"
echo "================================"
echo ""

# 合约地址
ECHO_ASSET="0x6195f16cb8d32397032c6031e89c567a5fdbec9d"
ECHO_FUSION="0xa91499036db8a9501d4116c12114d24a906d7b97"
LICENSE_NFT="0x13c0637d86d179b66f22e0806c98b34bdbf48adf"

echo "📋 合约地址:"
echo "  ECHOAssetV2: $ECHO_ASSET"
echo "  ECHOFusion:  $ECHO_FUSION"
echo "  LicenseNFT:  $LICENSE_NFT"
echo ""

echo "🔧 编译器设置:"
echo "  Solidity: 0.8.19"
echo "  Optimization: Enabled"
echo "  Runs: 200"
echo ""

echo "📁 源码文件:"
echo "  ECHOAssetV2: ECHOAssetV2_flat.sol ($(wc -c < ECHOAssetV2_flat.sol) bytes)"
echo "  ECHOFusion:  ECHOFusion_flat.sol ($(wc -c < ECHOFusion_flat.sol) bytes)"
echo "  LicenseNFT:  LicenseNFT_flat.sol ($(wc -c < LicenseNFT_flat.sol) bytes)"
echo ""

echo "🔗 构造参数:"
echo "  ECHOFusion:  0x0000000000000000000000006195f16cb8d32397032c6031e89c567a5fdbec9d"
echo "  LicenseNFT:  0x0000000000000000000000006195f16cb8d32397032c6031e89c567a5fdbec9d"
echo ""

echo "🌐 验证链接:"
echo "  ECHOAssetV2: https://qng.qitmeer.io/address/$ECHO_ASSET/verify-via-flattened-code/new"
echo "  ECHOFusion:  https://qng.qitmeer.io/address/$ECHO_FUSION/verify-via-flattened-code/new"
echo "  LicenseNFT:  https://qng.qitmeer.io/address/$LICENSE_NFT/verify-via-flattened-code/new"
echo ""

echo "📖 完整指南: VERIFICATION_GUIDE.md"
echo ""

echo "✅ 准备就绪！请访问上述链接进行验证。"
