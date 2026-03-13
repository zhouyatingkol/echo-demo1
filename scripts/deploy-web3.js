/**
 * 使用纯 Web3.js 部署 LicenseNFT 合约
 * 绕过 Hardhat，直接调用 RPC
 */

const Web3 = require('web3');
const fs = require('fs');

// Qitmeer 主网配置
const QITMEER_RPC = 'https://qng.rpc.qitmeer.io';
const CHAIN_ID = 813;

// 从环境变量获取私钥
require('dotenv').config();
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!PRIVATE_KEY) {
    console.error('❌ 未设置 PRIVATE_KEY');
    process.exit(1);
}

// 初始化 Web3
const web3 = new Web3(QITMEER_RPC);

// 创建账户
const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
console.log('📍 部署地址:', account.address);

// 读取合约 ABI 和字节码
const contractJson = JSON.parse(
    fs.readFileSync('./artifacts/contracts/LicenseNFT.sol/LicenseNFT.json', 'utf8')
);

const abi = contractJson.abi;
const bytecode = contractJson.bytecode;

// 构造函数参数：ECHOAsset 地址（临时为零地址）
const constructorArgs = ['0x0000000000000000000000000000000000000000'];

async function deploy() {
    try {
        // 检查余额
        const balance = await web3.eth.getBalance(account.address);
        console.log('💰 余额:', web3.utils.fromWei(balance, 'ether'), 'MEER');
        
        // 创建合约实例
        const contract = new web3.eth.Contract(abi);
        
        // 估算 Gas
        const deployTx = contract.deploy({
            data: bytecode,
            arguments: constructorArgs
        });
        
        const gasEstimate = await deployTx.estimateGas({ from: account.address });
        console.log('⛽ 估算 Gas:', gasEstimate);
        
        // 获取 Gas Price
        const gasPrice = await web3.eth.getGasPrice();
        console.log('⛽ Gas Price:', web3.utils.fromWei(gasPrice, 'gwei'), 'gwei');
        
        // 计算总费用
        const totalCost = BigInt(gasEstimate) * BigInt(gasPrice);
        console.log('💸 预估费用:', web3.utils.fromWei(totalCost.toString(), 'ether'), 'MEER');
        
        // 检查余额是否足够
        if (BigInt(balance) < totalCost) {
            console.error('❌ 余额不足');
            process.exit(1);
        }
        
        // 创建交易
        const tx = {
            from: account.address,
            data: deployTx.encodeABI(),
            gas: gasEstimate,
            gasPrice: gasPrice,
            chainId: CHAIN_ID
        };
        
        // 签名交易
        console.log('✍️  签名交易...');
        const signedTx = await account.signTransaction(tx);
        
        // 发送交易
        console.log('🚀 发送交易...');
        const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        
        console.log('✅ 部署成功!');
        console.log('📄 合约地址:', receipt.contractAddress);
        console.log('🔗 交易哈希:', receipt.transactionHash);
        console.log('⛽ 实际 Gas 使用:', receipt.gasUsed);
        
        // 保存部署信息
        const deploymentInfo = {
            network: 'qitmeer',
            chainId: CHAIN_ID,
            contractAddress: receipt.contractAddress,
            transactionHash: receipt.transactionHash,
            deployer: account.address,
            gasUsed: receipt.gasUsed,
            timestamp: new Date().toISOString()
        };
        
        fs.writeFileSync(
            'deployment-web3.json',
            JSON.stringify(deploymentInfo, null, 2)
        );
        
        console.log('\n💾 部署信息已保存到 deployment-web3.json');
        
        // 验证合约
        console.log('\n📊 验证合约...');
        const deployedContract = new web3.eth.Contract(abi, receipt.contractAddress);
        const name = await deployedContract.methods.name().call();
        const symbol = await deployedContract.methods.symbol().call();
        console.log('  - 名称:', name);
        console.log('  - 符号:', symbol);
        
        return receipt.contractAddress;
        
    } catch (error) {
        console.error('❌ 部署失败:', error.message);
        if (error.message.includes('insufficient funds')) {
            console.error('💡 提示: 余额不足，需要更多 MEER');
        }
        if (error.message.includes('replacement transaction')) {
            console.error('💡 提示: 有_pending_交易，请等待或提高 Gas Price');
        }
        throw error;
    }
}

deploy()
    .then(addr => {
        console.log('\n🎉 合约部署完成:', addr);
        process.exit(0);
    })
    .catch(err => {
        console.error('\n💥 错误:', err);
        process.exit(1);
    });