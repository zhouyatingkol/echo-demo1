/**
 * IPFS 服务使用示例
 * 
 * 展示如何在 ECHO 作品生成流程中使用 IPFS 服务
 */

const ipfsService = require('./scripts/core/ipfs-service');
const fs = require('fs');
const path = require('path');

// ============================================
// 示例 1: 上传单个文件
// ============================================
async function example1_uploadFile() {
  console.log('=== 示例 1: 上传单个文件 ===\n');
  
  // 方式 1: 通过文件路径上传
  // const result = await ipfsService.uploadFile('./assets/song.mp3');
  
  // 方式 2: 通过 Buffer 上传
  const buffer = Buffer.from('Hello ECHO Protocol!');
  const result = await ipfsService.uploadFile(buffer, {
    filename: 'hello.txt'
  });
  
  console.log('CID:', result.cid);
  console.log('URL:', result.url);
  console.log('Size:', result.size);
  
  return result;
}

// ============================================
// 示例 2: 上传带进度反馈的大文件
// ============================================
async function example2_uploadWithProgress(filePath) {
  console.log('\n=== 示例 2: 上传带进度反馈 ===\n');
  
  const result = await ipfsService.uploadFile(filePath, {
    onProgress: (progress) => {
      // 更新进度条
      const bar = '█'.repeat(Math.floor(progress / 5)) + '░'.repeat(20 - Math.floor(progress / 5));
      process.stdout.write(`\r[${bar}] ${progress}%`);
    }
  });
  
  console.log('\n上传完成!');
  console.log('CID:', result.cid);
  
  return result;
}

// ============================================
// 示例 3: 上传音乐作品完整流程
// ============================================
async function example3_uploadMusicWork(audioPath, coverPath) {
  console.log('\n=== 示例 3: 上传完整音乐作品 ===\n');
  
  // 作品信息
  const workData = {
    name: '夏日微风',
    description: '一首轻快愉悦的夏日电子音乐，灵感来自海滩和阳光',
    artist: 'ECHO Creator'
  };
  
  // 1. 上传音频文件
  console.log('1. 上传音频文件...');
  const audioResult = await ipfsService.uploadFile(audioPath, {
    onProgress: (p) => process.stdout.write(`\r   音频上传: ${p}%`)
  });
  console.log('\n   音频 CID:', audioResult.cid);
  
  // 2. 上传封面图片
  console.log('2. 上传封面图片...');
  const coverResult = await ipfsService.uploadFile(coverPath, {
    onProgress: (p) => process.stdout.write(`\r   封面上传: ${p}%`)
  });
  console.log('\n   封面 CID:', coverResult.cid);
  
  // 3. 创建并上传完整元数据
  console.log('3. 创建作品元数据...');
  const { cid, url, metadata } = await ipfsService.uploadWorkMetadata(
    workData,
    audioResult.cid,
    coverResult.cid,
    {
      genre: 'Electronic',
      bpm: 128,
      key: 'C Major',
      duration: '3:45',
      releaseDate: '2024-03-14'
    }
  );
  
  console.log('\n✅ 作品上传完成!');
  console.log('Metadata CID:', cid);
  console.log('Metadata URL:', url);
  console.log('Token URI (for NFT):', `ipfs://${cid}`);
  
  return {
    metadataCid: cid,
    metadataUrl: url,
    audioCid: audioResult.cid,
    coverCid: coverResult.cid,
    metadata
  };
}

// ============================================
// 示例 4: 批量上传多个文件
// ============================================
async function example4_batchUpload(filePaths) {
  console.log('\n=== 示例 4: 批量上传 ===\n');
  
  const results = [];
  
  for (let i = 0; i < filePaths.length; i++) {
    const filePath = filePaths[i];
    console.log(`上传文件 ${i + 1}/${filePaths.length}: ${path.basename(filePath)}`);
    
    try {
      const result = await ipfsService.uploadFile(filePath);
      results.push({
        file: filePath,
        cid: result.cid,
        url: result.url,
        success: true
      });
      console.log('  ✅ CID:', result.cid);
    } catch (error) {
      results.push({
        file: filePath,
        error: error.message,
        success: false
      });
      console.log('  ❌ Error:', error.message);
    }
  }
  
  console.log('\n批量上传完成!');
  console.log('成功:', results.filter(r => r.success).length);
  console.log('失败:', results.filter(r => !r.success).length);
  
  return results;
}

// ============================================
// 示例 5: 获取网关 URL
// ============================================
async function example5_gatewayUrls(cid) {
  console.log('\n=== 示例 5: 获取网关 URL ===\n');
  
  // 获取主网关 URL
  const primaryUrl = ipfsService.getGatewayUrl(cid);
  console.log('主网关:', primaryUrl);
  
  // 获取备用网关 URL
  const backupUrl1 = ipfsService.getGatewayUrl(cid, { gatewayIndex: 1 });
  console.log('备用网关 1:', backupUrl1);
  
  const backupUrl2 = ipfsService.getGatewayUrl(cid, { gatewayIndex: 2 });
  console.log('备用网关 2:', backupUrl2);
  
  // 测试哪个网关可用
  console.log('\n测试网关可用性...');
  const availableUrl = await ipfsService.getAvailableGatewayUrl(cid);
  console.log('可用网关:', availableUrl);
}

// ============================================
// 示例 6: 验证配置
// ============================================
async function example6_validateConfig() {
  console.log('\n=== 示例 6: 验证配置 ===\n');
  
  const validation = ipfsService.config.validateConfig();
  
  console.log('配置有效:', validation.valid);
  console.log('提供商:', validation.provider);
  
  if (validation.errors.length > 0) {
    console.log('\n错误:');
    validation.errors.forEach(err => console.log('  ❌', err));
  }
  
  if (validation.warnings.length > 0) {
    console.log('\n警告:');
    validation.warnings.forEach(warn => console.log('  ⚠️ ', warn));
  }
  
  // 显示配置摘要
  console.log('\n配置摘要:');
  console.log(ipfsService.config.getConfigSummary());
}

// ============================================
// 运行示例
// ============================================
async function runExamples() {
  console.log('🚀 ECHO IPFS 服务示例\n');
  
  // 先验证配置
  const validation = ipfsService.config.validateConfig();
  if (!validation.valid) {
    console.error('配置验证失败:', validation.errors);
    return;
  }
  
  try {
    // 运行示例 1
    await example1_uploadFile();
    
    // 运行示例 6
    await example6_validateConfig();
    
    // 运行示例 5
    // await example5_gatewayUrls('QmTestCID');
    
    console.log('\n✅ 示例运行完成!');
    
  } catch (error) {
    console.error('\n❌ 示例运行失败:', error.message);
  }
}

// 导出示例函数供外部使用
module.exports = {
  example1_uploadFile,
  example2_uploadWithProgress,
  example3_uploadMusicWork,
  example4_batchUpload,
  example5_gatewayUrls,
  example6_validateConfig,
  runExamples
};

// 如果直接运行此文件
if (require.main === module) {
  runExamples();
}
