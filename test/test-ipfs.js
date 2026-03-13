/**
 * IPFS 服务测试脚本
 * 
 * 使用方法:
 *   node test/test-ipfs.js
 * 
 * 环境变量:
 *   - IPFS_PROVIDER: pinata | infura | local
 *   - PINATA_API_KEY / PINATA_SECRET_KEY (for pinata)
 */

const ipfsService = require('../scripts/core/ipfs-service');
const fs = require('fs');
const path = require('path');

// 彩色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logStep(step) {
  log(`\n${'='.repeat(50)}`, 'bright');
  log(`  ${step}`, 'cyan');
  log(`${'='.repeat(50)}\n`, 'bright');
}

async function test() {
  logStep('ECHO IPFS 服务测试');
  
  // 1. 显示配置摘要
  logStep('1. 配置检查');
  const configSummary = ipfsService.config.getConfigSummary();
  console.log('提供商:', configSummary.provider);
  console.log('主网关:', configSummary.gatewayUrl);
  console.log('备用网关数量:', configSummary.gatewayFallbacks.length);
  
  if (configSummary.provider === 'pinata') {
    console.log('Pinata API Key:', configSummary.pinata.apiKey);
  } else if (configSummary.provider === 'infura') {
    console.log('Infura Project ID:', configSummary.infura.projectId);
  } else if (configSummary.provider === 'local') {
    console.log('本地 API:', configSummary.local.apiUrl);
  }
  
  // 2. 验证配置
  logStep('2. 配置验证');
  const validation = ipfsService.config.validateConfig();
  
  if (!validation.valid) {
    log('❌ 配置验证失败:', 'red');
    validation.errors.forEach(err => console.log(`   - ${err}`));
    process.exit(1);
  }
  
  log('✅ 配置验证通过', 'green');
  
  if (validation.warnings.length > 0) {
    log('\n⚠️  警告:', 'yellow');
    validation.warnings.forEach(warn => console.log(`   - ${warn}`));
  }
  
  // 3. 测试连接
  logStep('3. 连接测试');
  const connected = await ipfsService.testConnection();
  
  if (!connected) {
    log('❌ 连接测试失败！请检查网络连接和 API 密钥。', 'red');
    process.exit(1);
  }
  
  log('✅ 连接测试通过', 'green');
  
  // 4. 测试文件上传
  logStep('4. 文件上传测试');
  
  // 创建测试文件
  const testContent = `ECHO Protocol IPFS Test
Generated: ${new Date().toISOString()}
Provider: ${ipfsService.config.provider}
Random: ${Math.random().toString(36).substring(7)}`;
  
  const testFile = path.join(__dirname, 'test-file.txt');
  fs.writeFileSync(testFile, testContent);
  
  log('创建测试文件: test-file.txt');
  
  try {
    const fileResult = await ipfsService.uploadFile(testFile, {
      onProgress: (progress) => {
        process.stdout.write(`\r   上传进度: ${progress}%`);
      }
    });
    
    console.log(); // 换行
    log('✅ 文件上传成功!', 'green');
    console.log('   CID:', fileResult.cid);
    console.log('   URL:', fileResult.url);
    console.log('   Size:', formatFileSize(fileResult.size));
    
    // 5. 测试元数据上传
    logStep('5. 元数据上传测试');
    
    const metadata = {
      name: 'ECHO Test Music',
      description: 'Test music metadata for ECHO Protocol',
      image: 'ipfs://QmTestCoverImageCID',
      animation_url: `ipfs://${fileResult.cid}`,
      attributes: [
        { trait_type: 'Artist', value: 'ECHO Test' },
        { trait_type: 'Genre', value: 'Electronic' },
        { trait_type: 'Test', value: true }
      ],
      properties: {
        audio: {
          cid: fileResult.cid,
          url: fileResult.url
        }
      }
    };
    
    const metaResult = await ipfsService.uploadMetadata(metadata, (progress) => {
      process.stdout.write(`\r   上传进度: ${progress}%`);
    });
    
    console.log();
    log('✅ 元数据上传成功!', 'green');
    console.log('   CID:', metaResult.cid);
    console.log('   URL:', metaResult.url);
    console.log('   Size:', formatFileSize(metaResult.size));
    
    // 6. 测试完整作品上传流程
    logStep('6. 完整作品上传流程测试');
    
    const workData = {
      name: '夏日测试曲',
      description: '这是一首测试用的夏日音乐作品',
      artist: 'ECHO Tester'
    };
    
    const workResult = await ipfsService.uploadWorkMetadata(
      workData,
      fileResult.cid,
      null, // 没有封面图
      {
        genre: 'Test',
        duration: '0:30',
        timestamp: Date.now()
      }
    );
    
    log('✅ 作品元数据创建成功!', 'green');
    console.log('   Metadata CID:', workResult.cid);
    console.log('   Metadata URL:', workResult.url);
    console.log('   Audio CID:', workResult.metadata.properties.audio.cid);
    
    // 7. 测试网关 URL 获取
    logStep('7. 网关 URL 测试');
    
    const cid = workResult.cid;
    console.log('Primary Gateway:', ipfsService.getGatewayUrl(cid));
    console.log('Gateway 1:', ipfsService.getGatewayUrl(cid, { gatewayIndex: 1 }));
    console.log('Gateway 2:', ipfsService.getGatewayUrl(cid, { gatewayIndex: 2 }));
    
    log('\n✅ 所有测试通过!', 'green');
    logStep('测试完成');
    
    console.log('\n📋 总结:');
    console.log('   文件 CID:', fileResult.cid);
    console.log('   元数据 CID:', workResult.cid);
    console.log('   元数据 URI (用于 NFT):', `ipfs://${workResult.cid}`);
    
  } catch (error) {
    log(`\n❌ 测试失败: ${error.message}`, 'red');
    if (error.response) {
      console.log('   Status:', error.response.status);
      console.log('   Data:', error.response.data);
    }
    process.exit(1);
  } finally {
    // 清理测试文件
    if (fs.existsSync(testFile)) {
      fs.unlinkSync(testFile);
    }
  }
}

function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 运行测试
test().catch(error => {
  log(`\n❌ 未捕获的错误: ${error.message}`, 'red');
  console.error(error);
  process.exit(1);
});
