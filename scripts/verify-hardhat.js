#!/usr/bin/env node
/**
 * 使用 Hardhat 绕过 Blockscout 前端验证
 */

const { execSync } = require('child_process');
const path = require('path');

// 切换到项目目录
process.chdir(path.join(__dirname, '..'));

const contracts = [
  {
    name: 'ECHOAssetV2',
    address: '0x6195f16cb8d32397032c6031e89c567a5fdbec9d',
    args: []
  },
  {
    name: 'ECHOFusion', 
    address: '0xa91499036db8a9501d4116c12114d24a906d7b97',
    args: ['0x6195f16cb8d32397032c6031e89c567a5fdbec9d']
  },
  {
    name: 'LicenseNFT',
    address: '0x13c0637d86d179b66f22e0806c98b34bdbf48adf',
    args: ['0x6195f16cb8d32397032c6031e89c567a5fdbec9d']
  }
];

console.log('🚀 尝试 Hardhat 验证...\n');

for (const contract of contracts) {
  console.log(`验证 ${contract.name} at ${contract.address}`);
  try {
    const args = contract.args.length > 0 ? contract.args.join(' ') : '';
    const cmd = `npx hardhat verify --network qitmeer ${contract.address} ${args}`;
    console.log(`运行: ${cmd}`);
    // 只打印命令，不实际执行（因为需要 API key）
  } catch (e) {
    console.error(`失败: ${e.message}`);
  }
}
