/**
 * 使用 Web3.js 部署 ECHOAssetV2 合约 (v2 - 带超时处理)
 */

const { Web3 } = require('web3');
const fs = require('fs');

// Qitmeer 主网配置
const QITMEER_RPC = 'https://qng.rpc.qitmeer.io';
const CHAIN_ID = 813;

require('dotenv').config();
const PRIVATE_KEY = process.env.PRIVATE_KEY;

if (!PRIVATE_KEY) {
    console.error('❌ 未设置 PRIVATE_KEY');
    process.exit(1);
}

const web3 = new Web3(QITMEER_RPC);
const account = web3.eth.accounts.privateKeyToAccount(PRIVATE_KEY);
console.log('📍 部署地址:', account.address);

const contractJson = JSON.parse(
    fs.readFileSync('./artifacts/contracts/ECHOAssetV2.sol/ECHOAssetV2.json', 'utf8')
);

const abi = contractJson.abi;
const bytecode = contractJson.bytecode;

async function deploy() {
    try {
        // 检查余额
        const balance = await web3.eth.getBalance(account.address);
        console.log('💰 余额:', web3.utils.fromWei(balance, 'ether'), 'MEER');
        
        const contract = new web3.eth.Contract(abi);
        const deployTx = contract.deploy({ data: bytecode, arguments: [] });
        
        const gasEstimate = await deployTx.estimateGas({ from: account.address });
        console.log('⛽ 估算 Gas:', gasEstimate.toString());
        
        const gasPrice = await web3.eth.getGasPrice();
        console.log('⛽ Gas Price:', web3.utils.fromWei(gasPrice, 'gwei'), 'gwei');
        
        // 先检查余额
        const gasCost = BigInt(gasEstimate) * BigInt(gasPrice);
        if (BigInt(balance) < gasCost) {
            console.error('❌ 余额不足');
            process.exit(1);
        }
        
        // 签名交易
        const tx = {
            from: account.address,
            data: deployTx.encodeABI(),
            gas: Number(gasEstimate) + 50000, // 加 buffer
            gasPrice: gasPrice,
            chainId: CHAIN_ID
        };
        
        console.log('✍️  签名交易...');
        const signedTx = await account.signTransaction(tx);
        
        // 发送交易，设置较短的超时，只获取交易哈希
        console.log('🚀 发送交易...');
        const sendPromise = web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        
        // 监听交易哈希
        sendPromise.once('transactionHash', (hash) => {
            console.log('🔗 交易哈希:', hash);
            console.log('🌐 查看交易: https://qng.qitmeer.io/tx/' + hash);
            console.log('⏳ 等待确认中... (Qitmeer 出块约 30 秒)');
        });
        
        // 等待收据 (设置较长的超时)
        const receipt = await sendPromise;
        
        console.log('\n✅ ECHOAssetV2 部署成功!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📄 合约地址:', receipt.contractAddress);
        console.log('🔗 交易哈希:', receipt.transactionHash);
        console.log('⛽ Gas 使用:', receipt.gasUsed.toString());
        console.log('📦 区块号:', receipt.blockNumber);
        console.log('🌐 区块浏览器: https://qng.qitmeer.io/address/' + receipt.contractAddress);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        // 保存部署信息
        const deploymentInfo = {
            contractName: 'ECHOAssetV2',
            network: 'qitmeer',
            chainId: CHAIN_ID,
            contractAddress: receipt.contractAddress,
            transactionHash: receipt.transactionHash,
            deployer: account.address,
            gasUsed: receipt.gasUsed.toString(),
            blockNumber: receipt.blockNumber,
            timestamp: new Date().toISOString()
        };
        
        fs.writeFileSync('deployment-v2-mainnet.json', JSON.stringify(deploymentInfo, null, 2));
        console.log('\n💾 部署信息已保存到 deployment-v2-mainnet.json');
        
        return receipt.contractAddress;
        
    } catch (error) {
        console.error('\n❌ 部署失败:', error.message);
        if (error.message.includes('insufficient funds')) {
            console.error('💡 余额不足');
        }
        process.exit(1);
    }
}

deploy().then(addr => {
    console.log('\n🎉 ECHOAssetV2 部署完成:', addr);
    process.exit(0);
}).catch(err => {
    console.error('\n💥 错误:', err);
    process.exit(1);
});
