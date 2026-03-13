#!/usr/bin/env node
/**
 * ECHO Protocol 合约自动验证脚本
 * 使用 Qitmeer Blockscout API
 */

const fs = require('fs');
const https = require('https');
const path = require('path');

// 合约配置
const CONTRACTS = [
  {
    name: 'ECHOAssetV2',
    address: '0x6195f16cb8d32397032c6031e89c567a5fdbec9d',
    file: 'ECHOAssetV2_flat.sol',
    constructorArgs: ''
  },
  {
    name: 'ECHOFusion', 
    address: '0xa91499036db8a9501d4116c12114d24a906d7b97',
    file: 'ECHOFusion_flat.sol',
    constructorArgs: '0x0000000000000000000000006195f16cb8d32397032c6031e89c567a5fdbec9d'
  },
  {
    name: 'LicenseNFT',
    address: '0x13c0637d86d179b66f22e0806c98b34bdbf48adf', 
    file: 'LicenseNFT_flat.sol',
    constructorArgs: '0x0000000000000000000000006195f16cb8d32397032c6031e89c567a5fdbec9d'
  }
];

const API_HOST = 'qng.qitmeer.io';

async function verifyContract(contract) {
  console.log(`\n🔍 正在验证 ${contract.name}...`);
  console.log(`   地址: ${contract.address}`);
  
  const sourceCode = fs.readFileSync(contract.file, 'utf8');
  console.log(`   源码大小: ${(sourceCode.length / 1024).toFixed(2)} KB`);
  
  // 构造表单数据
  const boundary = '----FormBoundary' + Math.random().toString(36).substring(2);
  
  const formData = [
    `--${boundary}`,
    `Content-Disposition: form-data; name="addressHash"`,
    '',
    contract.address,
    `--${boundary}`,
    `Content-Disposition: form-data; name="compilerVersion"`,
    '',
    'v0.8.19+commit.7dd6d404',
    `--${boundary}`,
    `Content-Disposition: form-data; name="contractSourceCode"`,
    '',
    sourceCode,
    `--${boundary}`,
    `Content-Disposition: form-data; name="name"`,
    '',
    contract.name,
    `--${boundary}`,
    `Content-Disposition: form-data; name="optimization"`,
    '',
    'true',
    `--${boundary}`,
    `Content-Disposition: form-data; name="optimizationRuns"`,
    '',
    '200',
  ];
  
  if (contract.constructorArgs) {
    formData.push(
      `--${boundary}`,
      `Content-Disposition: form-data; name="constructorArguments"`,
      '',
      contract.constructorArgs
    );
  }
  
  formData.push(`--${boundary}--`, '');
  
  const postData = formData.join('\r\n');
  
  const options = {
    hostname: API_HOST,
    port: 443,
    path: '/api?module=contract&action=verify',
    method: 'POST',
    headers: {
      'Content-Type': `multipart/form-data; boundary=${boundary}`,
      'Content-Length': Buffer.byteLength(postData)
    },
    timeout: 120000 // 2分钟超时
  };
  
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          if (result.status === '1') {
            console.log(`   ✅ ${contract.name} 验证成功!`);
            console.log(`   🔗 https://qng.qitmeer.io/address/${contract.address}`);
            resolve(result);
          } else {
            console.log(`   ❌ ${contract.name} 验证失败: ${result.message}`);
            reject(new Error(result.message));
          }
        } catch (e) {
          console.log(`   ⚠️  响应解析失败: ${data.substring(0, 200)}`);
          reject(e);
        }
      });
    });
    
    req.on('error', (e) => {
      console.log(`   ❌ 请求错误: ${e.message}`);
      reject(e);
    });
    
    req.on('timeout', () => {
      req.destroy();
      console.log(`   ⏱️  请求超时`);
      reject(new Error('Timeout'));
    });
    
    console.log('   ⏳ 发送请求...');
    req.write(postData);
    req.end();
  });
}

async function main() {
  console.log('🚀 ECHO Protocol 合约自动验证');
  console.log('================================');
  
  for (const contract of CONTRACTS) {
    try {
      await verifyContract(contract);
      // 间隔 5 秒，避免限流
      await new Promise(r => setTimeout(r, 5000));
    } catch (e) {
      console.error(`   错误: ${e.message}`);
    }
  }
  
  console.log('\n✅ 验证流程完成');
}

main();
