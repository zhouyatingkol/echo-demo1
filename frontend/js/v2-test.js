// V2/V3 快速测试脚本
// 在浏览器控制台运行这些命令测试功能
// Updated: 2026-03-13 (Config Verify Fix)

const V2_ADDRESS = '0xF98f63b7e8064Dcf9c2f25A906B2af89Af4840ce'; // V3 地址

const V2_ABI = [
    "function getAssetInfo(uint256 tokenId) view returns (tuple(string name, string description, string assetType, string uri, bytes32 contentHash, uint256 createdAt, uint256 lastUpdated), tuple(tuple(address owner, uint256 fee, bool commercialUse, bool modificationAllowed, string[] allowedScopes, string[] restrictedScopes, uint256 maxUsers, uint256 licenseDuration) usage, tuple(address owner, uint256 fee, bool allowDerivatives, uint256 revenueShare, string[] allowedTypes) derivative, tuple(address owner, uint256 fee, bool allowExtensions, string[] allowedExtensions) extension, tuple(address owner, uint256 sharePercentage, bool autoDistribute) revenue), address creator, uint256 version)",
    "function getVersionHistory(uint256 tokenId) view returns (tuple(uint256 version, bytes32 contentHash, string uri, uint256 timestamp, string updateReason)[])",
    "function currentVersion(uint256 tokenId) view returns (uint256)",
    "function originalCreator(uint256 tokenId) view returns (address)"
];

// 测试函数
const V2Test = {
    contract: null,
    
    // 初始化
    async init() {
        const provider = new ethers.BrowserProvider(window.ethereum);
        this.contract = new ethers.Contract(V2_ADDRESS, V2_ABI, provider);
        console.log('✅ V2 合约已连接');
        return this;
    },

    // 测试 1: 查询资产信息
    async testAssetInfo(tokenId) {
        console.log(`🔍 查询资产 #${tokenId}...`);
        try {
            const [metadata, blueprint, creator, version] = await this.contract.getAssetInfo(tokenId);
            console.log('✅ 资产信息:', {
                name: metadata.name,
                type: metadata.assetType,
                creator: creator,
                version: version.toString(),
                contentHash: metadata.contentHash.slice(0, 20) + '...'
            });
            return true;
        } catch (error) {
            console.error('❌ 查询失败:', error.message);
            return false;
        }
    },

    // 测试 2: 查询版本历史
    async testVersionHistory(tokenId) {
        console.log(`📜 查询版本历史 #${tokenId}...`);
        try {
            const history = await this.contract.getVersionHistory(tokenId);
            console.log(`✅ 共 ${history.length} 个版本:`);
            history.forEach(h => {
                console.log(`  版本 ${h.version}: ${h.updateReason} (${new Date(Number(h.timestamp) * 1000).toLocaleDateString()})`);
            });
            return true;
        } catch (error) {
            console.error('❌ 查询失败:', error.message);
            return false;
        }
    },

    // 测试 3: 查询当前版本
    async testCurrentVersion(tokenId) {
        console.log(`🔢 查询当前版本 #${tokenId}...`);
        try {
            const version = await this.contract.currentVersion(tokenId);
            console.log('✅ 当前版本:', version.toString());
            return true;
        } catch (error) {
            console.error('❌ 查询失败:', error.message);
            return false;
        }
    },

    // 运行所有测试
    async runAllTests(tokenId = 1) {
        console.log('🚀 开始 V2 功能测试...\n');
        
        await this.init();
        
        console.log('\n--- 测试 1: 资产信息 ---');
        const test1 = await this.testAssetInfo(tokenId);
        
        console.log('\n--- 测试 2: 版本历史 ---');
        const test2 = await this.testVersionHistory(tokenId);
        
        console.log('\n--- 测试 3: 当前版本 ---');
        const test3 = await this.testCurrentVersion(tokenId);
        
        console.log('\n--- 测试结果汇总 ---');
        console.log(`资产信息查询: ${test1 ? '✅ 通过' : '❌ 失败'}`);
        console.log(`版本历史查询: ${test2 ? '✅ 通过' : '❌ 失败'}`);
        console.log(`当前版本查询: ${test3 ? '✅ 通过' : '❌ 失败'}`);
        
        const allPassed = test1 && test2 && test3;
        console.log(`\n${allPassed ? '✅ 所有测试通过！' : '⚠️ 部分测试失败'}`);
        
        return allPassed;
    }
};

// 使用说明
console.log(`
🧪 V2 测试脚本已加载

使用方法:
1. 先连接钱包: await V2Test.init()
2. 测试单个功能: await V2Test.testAssetInfo(1)
3. 运行全部测试: await V2Test.runAllTests(1)

测试 Token ID 可以替换为您的资产 ID
`);

// 导出到全局
window.V2Test = V2Test;