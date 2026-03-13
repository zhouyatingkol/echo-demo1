#!/usr/bin/env node
/**
 * 直接 API 提交验证（绕过前端下拉框问题）
 * 硬编码编译器版本
 */

const https = require('https');
const fs = require('fs');

const API_HOST = 'qng.qitmeer.io';

// 读取极简版源码
const sourceCode = fs.readFileSync('ECHOAssetV2_minimal.sol', 'utf8');

// 构造 multipart 表单
function createFormData(fields) {
    const boundary = '----FormBoundary' + Date.now();
    let body = '';
    
    for (const [key, value] of Object.entries(fields)) {
        body += `--${boundary}\r\n`;
        body += `Content-Disposition: form-data; name="${key}"\r\n\r\n`;
        body += `${value}\r\n`;
    }
    
    body += `--${boundary}--\r\n`;
    
    return {
        boundary,
        body: Buffer.from(body, 'utf8')
    };
}

async function verifyDirect() {
    const fields = {
        addressHash: '0x6195f16cb8d32397032c6031e89c567a5fdbec9d',
        compilerVersion: 'v0.8.19+commit.7dd6d404',
        contractSourceCode: sourceCode,
        name: 'ECHOAssetV2',
        optimization: 'true',
        optimizationRuns: '200',
        licenseType: '3', // MIT
        evmVersion: 'default'
    };
    
    const { boundary, body } = createFormData(fields);
    
    const options = {
        hostname: API_HOST,
        port: 443,
        path: '/api?module=contract&action=verify',
        method: 'POST',
        headers: {
            'Content-Type': `multipart/form-data; boundary=${boundary}`,
            'Content-Length': body.length,
            'Accept': 'application/json'
        },
        timeout: 120000
    };
    
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const result = JSON.parse(data);
                    console.log('API 响应:', JSON.stringify(result, null, 2));
                    resolve(result);
                } catch (e) {
                    console.log('原始响应:', data);
                    reject(e);
                }
            });
        });
        
        req.on('error', reject);
        req.on('timeout', () => { req.destroy(); reject(new Error('Timeout')); });
        
        req.write(body);
        req.end();
    });
}

console.log('🚀 尝试直接 API 验证...');
console.log('源码大小:', (sourceCode.length / 1024).toFixed(2), 'KB');
verifyDirect().catch(console.error);
