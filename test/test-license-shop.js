/**
 * test-license-shop.js - License Shop 功能测试
 * 在浏览器控制台运行测试
 */

// 测试套件
const LicenseShopTests = {
    
    // 测试结果
    results: {
        passed: 0,
        failed: 0,
        errors: []
    },
    
    // 断言函数
    assert(condition, message) {
        if (condition) {
            this.results.passed++;
            console.log(`✅ PASS: ${message}`);
        } else {
            this.results.failed++;
            this.results.errors.push(message);
            console.error(`❌ FAIL: ${message}`);
        }
    },
    
    // 运行所有测试
    async runAll() {
        console.log('🧪 开始测试 License Shop...\n');
        
        await this.testPriceCalculation();
        await this.testContractManager();
        await this.testEnumValues();
        
        this.printSummary();
    },
    
    // 测试价格计算
    async testPriceCalculation() {
        console.log('📊 测试价格计算...');
        
        // 模拟 LicenseShop 实例
        const shop = {
            selectedLicenseType: 'onetime',
            selectedUsageType: 'personal',
            prices: {
                base: 100,
                perUse: 0.5,
                daily: 10,
                multiplier: 1.0,
                feeRate: 0.05
            },
            calculatePrice() {
                let basePrice = 0;
                
                switch (this.selectedLicenseType) {
                    case 'onetime':
                        basePrice = this.prices.base;
                        break;
                    case 'peruse':
                        basePrice = this.prices.perUse * 100; // 默认100次
                        break;
                    case 'timed':
                        basePrice = this.prices.daily * 30; // 默认30天
                        break;
                }
                
                const adjustedPrice = basePrice * this.prices.multiplier;
                const platformFee = adjustedPrice * this.prices.feeRate;
                const totalPrice = adjustedPrice + platformFee;
                
                return {
                    basePrice,
                    multiplier: this.prices.multiplier,
                    adjustedPrice,
                    platformFee,
                    totalPrice
                };
            }
        };
        
        // 测试买断制
        const price1 = shop.calculatePrice();
        this.assert(price1.basePrice === 100, '买断制基础价格应为 100 MEER');
        this.assert(price1.adjustedPrice === 100, '买断制调整后价格应为 100 MEER');
        this.assert(price1.platformFee === 5, '买断制平台费应为 5 MEER (5%)');
        this.assert(price1.totalPrice === 105, '买断制总价应为 105 MEER');
        
        // 测试按次计费
        shop.selectedLicenseType = 'peruse';
        const price2 = shop.calculatePrice();
        this.assert(price2.basePrice === 50, '按次计费基础价格应为 50 MEER (0.5 * 100)');
        
        // 测试限时授权
        shop.selectedLicenseType = 'timed';
        const price3 = shop.calculatePrice();
        this.assert(price3.basePrice === 300, '限时授权基础价格应为 300 MEER (10 * 30)');
        
        // 测试场景倍率
        shop.selectedLicenseType = 'onetime';
        shop.prices.multiplier = 2.0; // AI训练
        const price4 = shop.calculatePrice();
        this.assert(price4.adjustedPrice === 200, 'AI训练倍率 ×2.0 调整后价格应为 200 MEER');
        this.assert(price4.totalPrice === 210, 'AI训练总价应为 210 MEER');
        
        console.log('');
    },
    
    // 测试合约管理器
    async testContractManager() {
        console.log('📋 测试合约管理器...');
        
        // 检查合约地址
        const expectedAddresses = {
            licenseNFT: '0x2f79b56047050FD2Ee7C62d2d0fe644c15c68e23',
            echoAsset: '0xF98f63b7e8064Dcf9c2f25A906B2af89Af4840ce',
            echoFusion: '0x31Cd483Ee827A272816808AD49b90c71B1c82E11'
        };
        
        // 如果有 ContractManagerV3 实例
        if (typeof ContractManagerV3 !== 'undefined') {
            const manager = new ContractManagerV3(null, null);
            this.assert(manager.addresses.licenseNFT === expectedAddresses.licenseNFT, 'LicenseNFT 地址正确');
            this.assert(manager.addresses.echoAsset === expectedAddresses.echoAsset, 'ECHOAsset 地址正确');
            this.assert(manager.addresses.echoFusion === expectedAddresses.echoFusion, 'ECHOFusion 地址正确');
        } else {
            console.log('⚠️ ContractManagerV3 未加载，跳过合约测试');
        }
        
        console.log('');
    },
    
    // 测试枚举值
    async testEnumValues() {
        console.log('🔢 测试枚举值...');
        
        // 检查 UsageType 枚举
        this.assert(UsageType.PERSONAL === 0, 'UsageType.PERSONAL 应为 0');
        this.assert(UsageType.GAME === 1, 'UsageType.GAME 应为 1');
        this.assert(UsageType.AI_TRAINING === 2, 'UsageType.AI_TRAINING 应为 2');
        this.assert(UsageType.COMMERCIAL === 3, 'UsageType.COMMERCIAL 应为 3');
        
        // 检查 LicenseType 枚举
        this.assert(LicenseType.ONE_TIME === 0, 'LicenseType.ONE_TIME 应为 0');
        this.assert(LicenseType.PER_USE === 1, 'LicenseType.PER_USE 应为 1');
        this.assert(LicenseType.TIMED === 2, 'LicenseType.TIMED 应为 2');
        
        console.log('');
    },
    
    // 打印测试摘要
    printSummary() {
        console.log('═'.repeat(50));
        console.log('📊 测试摘要');
        console.log('═'.repeat(50));
        console.log(`✅ 通过: ${this.results.passed}`);
        console.log(`❌ 失败: ${this.results.failed}`);
        console.log(`📈 通过率: ${((this.results.passed / (this.results.passed + this.results.failed)) * 100).toFixed(1)}%`);
        
        if (this.results.errors.length > 0) {
            console.log('\n❌ 失败的测试:');
            this.results.errors.forEach((error, index) => {
                console.log(`  ${index + 1}. ${error}`);
            });
        }
        
        console.log('═'.repeat(50));
    }
};

// 在控制台运行测试
// LicenseShopTests.runAll();

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LicenseShopTests;
}
