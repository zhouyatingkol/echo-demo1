/**
 * 部署 LicenseNFT 合约到 Qitmeer 主网
 */

const { Web3 } = require('web3');
const fs = require('fs');

const QITMEER_RPC = 'https://qng.rpc.qitmeer.io';
const CHAIN_ID = 813;
const ECHO_ASSET_ADDRESS = '0x6195f16cb8d32397032c6031e89c567a5fdbec9d';

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
    fs.readFileSync('./artifacts/contracts/LicenseNFT.sol/LicenseNFT.json', 'utf8')
);

const abi = contractJson.abi;
const bytecode = contractJson.bytecode;

// 构造函数参数：ECHOAsset 地址
const constructorArgs = [ECHO_ASSET_ADDRESS];

async function deploy() {
    try {
        const balance = await web3.eth.getBalance(account.address);
        console.log('💰 余额:', web3.utils.fromWei(balance, 'ether'), 'MEER');
        console.log('🔗 ECHOAssetV2 地址:', ECHO_ASSET_ADDRESS);
        
        const contract = new web3.eth.Contract(abi);
        const deployTx = contract.deploy({ data: bytecode, arguments: constructorArgs });
        
        const gasEstimate = await deployTx.estimateGas({ from: account.address });
        console.log('⛽ 估算 Gas:', gasEstimate.toString());
        
        const gasPrice = await web3.eth.getGasPrice();
        console.log('⛽ Gas Price:', web3.utils.fromWei(gasPrice, 'gwei'), 'gwei');
        
        const gasCost = BigInt(gasEstimate) * BigInt(gasPrice);
        if (BigInt(balance) < gasCost) {
            console.error('❌ 余额不足');
            process.exit(1);
        }
        
        const tx = {
            from: account.address,
            data: deployTx.encodeABI(),
            gas: Number(gasEstimate) + 100000,
            gasPrice: gasPrice,
            chainId: CHAIN_ID
        };
        
        console.log('✍️  签名交易...');
        const signedTx = await account.signTransaction(tx);
        
        console.log('🚀 发送交易...');
        const sendPromise = web3.eth.sendSignedTransaction(signedTx.rawTransaction);
        
        sendPromise.once('transactionHash', (hash) => {
            console.log('🔗 交易哈希:', hash);
            console.log('🌐 查看交易: https://qng.qitmeer.io/tx/' + hash);
            console.log('⏳ 等待确认中...');
        });
        
        const receipt = await sendPromise;
        
        console.log('\n✅ LicenseNFT 部署成功!');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📄 合约地址:', receipt.contractAddress);
        console.log('🔗 交易哈希:', receipt.transactionHash);
        console.log('⛽ Gas 使用:', receipt.gasUsed.toString());
        console.log('📦 区块号:', receipt.blockNumber.toString());
        console.log('🌐 区块浏览器: https://qng.qitmeer.io/address/' + receipt.contractAddress);
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        
        // 验证合约配置
        const deployedContract = new web3.eth.Contract(abi, receipt.contractAddress);
        const name = await deployedContract.methods.name().call();
        const symbol = await deployedContract.methods.symbol().call();
        console.log('\n📊 合约配置:');
        console.log('  - 名称:', name);
        console.log('  - 符号:', symbol);
        
        const deploymentInfo = {
            contractName: 'LicenseNFT',
            network: 'qitmeer',
            chainId: CHAIN_ID,
            contractAddress: receipt.contractAddress,
            transactionHash: receipt.transactionHash,
            deployer: account.address,
            gasUsed: receipt.gasUsed.toString(),
            blockNumber: Number(receipt.blockNumber),
            echoAssetAddress: ECHO_ASSET_ADDRESS,
            timestamp: new Date().toISOString()
        };
        
        fs.writeFileSync('deployment-license-mainnet.json', JSON.stringify(deploymentInfo, null, 2));
        console.log('\n💾 部署信息已保存到 deployment-license-mainnet.json');
        
        return receipt.contractAddress;
        
    } catch (error) {
        console.error('\n❌ 部署失败:', error.message);
        process.exit(1);
    }
}

deploy().then(addr => {
    console.log('\n🎉 LicenseNFT 部署完成:', addr);
    process.exit(0);
}).catch(err => {
    console.error('\n💥 错误:', err);
    process.exit(1);
});
