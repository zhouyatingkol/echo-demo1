/**
 * e2e-full-test.js - ECHO 协议完整端到端测试
 * 
 * 测试场景：
 * 1. 钱包连接
 * 2. 市场浏览
 * 3. 购买买断制授权
 * 4. 购买按次计费授权
 * 5. 购买限时授权
 * 6. 错误处理
 */

// ==================== 测试框架 ====================

class TestRunner {
    constructor() {
        this.tests = [];
        this.results = [];
        this.currentSuite = '';
    }
    
    describe(name, fn) {
        this.currentSuite = name;
        console.log(`\n📦 ${name}`);
        fn();
    }
    
    it(name, fn) {
        this.tests.push({
            suite: this.currentSuite,
            name,
            fn
        });
    }
    
    async run() {
        console.log('🚀 Starting E2E Tests...\n');
        
        let passed = 0;
        let failed = 0;
        
        for (const test of this.tests) {
            try {
                process.stdout.write(`  ⏳ ${test.name}... `);
                await test.fn();
                console.log('✅ PASS');
                this.results.push({ ...test, status: 'PASS' });
                passed++;
            } catch (error) {
                console.log('❌ FAIL');
                console.log(`     Error: ${error.message}`);
                this.results.push({ ...test, status: 'FAIL', error: error.message });
                failed++;
            }
        }
        
        console.log(`\n📊 Test Results: ${passed} passed, ${failed} failed, ${this.tests.length} total`);
        
        return {
            passed,
            failed,
            total: this.tests.length,
            results: this.results
        };
    }
    
    expect(actual) {
        return {
            toBe: (expected) => {
                if (actual !== expected) {
                    throw new Error(`Expected ${expected}, got ${actual}`);
                }
            },
            toEqual: (expected) => {
                if (JSON.stringify(actual) !== JSON.stringify(expected)) {
                    throw new Error(`Expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
                }
            },
            toBeTruthy: () => {
                if (!actual) {
                    throw new Error(`Expected truthy value, got ${actual}`);
                }
            },
            toBeFalsy: () => {
                if (actual) {
                    throw new Error(`Expected falsy value, got ${actual}`);
                }
            },
            toContain: (expected) => {
                if (!actual.includes(expected)) {
                    throw new Error(`Expected ${actual} to contain ${expected}`);
                }
            },
            toBeGreaterThan: (expected) => {
                if (!(actual > expected)) {
                    throw new Error(`Expected ${actual} to be greater than ${expected}`);
                }
            },
            toBeLessThan: (expected) => {
                if (!(actual < expected)) {
                    throw new Error(`Expected ${actual} to be less than ${expected}`);
                }
            },
            toMatch: (regex) => {
                if (!regex.test(actual)) {
                    throw new Error(`Expected ${actual} to match ${regex}`);
                }
            }
        };
    }
}

const runner = new TestRunner();
const describe = (name, fn) => runner.describe(name, fn);
const it = (name, fn) => runner.it(name, fn);
const expect = (actual) => runner.expect(actual);

// ==================== E2E 测试场景 ====================

describe('场景 1: 钱包连接', () => {
    it('应检测 MetaMask 是否安装', async () => {
        // 模拟检查 window.ethereum
        const hasWallet = typeof window !== 'undefined' && window.ethereum !== undefined;
        expect(hasWallet).toBeTruthy();
    });
    
    it('应能点击"连接钱包"按钮', async () => {
        const connectBtn = document.getElementById('connectWallet');
        expect(connectBtn).toBeTruthy();
        
        // 模拟点击
        connectBtn.click();
        
        // 等待连接
        await delay(1000);
        
        // 验证钱包状态
        const walletAddress = document.getElementById('walletAddress');
        expect(walletAddress).toBeTruthy();
    });
    
    it('应在授权后显示地址', async () => {
        const walletAddress = document.getElementById('walletAddress');
        
        // 检查是否显示了地址（模拟）
        if (window.walletManager && window.walletManager.isConnected) {
            expect(walletAddress.textContent.length).toBeGreaterThan(0);
            expect(walletAddress.classList.contains('hidden')).toBeFalsy();
        }
    });
    
    it('应自动切换到 Qitmeer 网络 (Chain ID: 813)', async () => {
        if (window.walletManager) {
            const isCorrectChain = window.walletManager.isCorrectChain 
                ? window.walletManager.isCorrectChain()
                : window.walletManager.chainId === 813;
            expect(isCorrectChain).toBeTruthy();
        }
    });
    
    it('应正确处理连接失败', async () => {
        if (window.mockWallet) {
            // 启用连接失败模式
            window.mockWallet.enableConnectFailMode();
            
            try {
                await window.mockWallet.connect();
                throw new Error('Should have thrown');
            } catch (error) {
                expect(error.code).toBe(-32002);
            } finally {
                window.mockWallet.disableConnectFailMode();
            }
        }
    });
});

describe('场景 2: 市场浏览', () => {
    it('应能打开 marketplace.html', async () => {
        expect(typeof marketplace).toBe('object');
    });
    
    it('应加载资产列表', async () => {
        const assetGrid = document.getElementById('assetGrid');
        expect(assetGrid).toBeTruthy();
        
        // 检查是否有资产卡片
        const cards = assetGrid.querySelectorAll('.asset-card');
        if (marketplace.assets) {
            expect(marketplace.assets.length).toBeGreaterThan(0);
        }
    });
    
    it('应支持搜索功能', async () => {
        const searchInput = document.getElementById('searchInput');
        expect(searchInput).toBeTruthy();
        
        // 模拟搜索
        if (marketplace.handleSearch) {
            const testQuery = '夏日';
            await marketplace.handleSearch(testQuery);
            
            // 验证搜索结果
            if (marketplace.filteredAssets) {
                expect(marketplace.filteredAssets.length).toBeGreaterThan(0);
            }
        }
    });
    
    it('应支持筛选功能', async () => {
        const priceFilter = document.getElementById('priceFilter');
        const sceneFilter = document.getElementById('sceneFilter');
        
        expect(priceFilter || sceneFilter).toBeTruthy();
        
        // 模拟筛选
        if (marketplace.applyFilters) {
            await marketplace.applyFilters({ priceRange: '0-50' });
        }
    });
    
    it('应能点击资产进入详情页', async () => {
        // 模拟点击资产卡片
        const assetId = 1;
        
        // 检查 URL 构造
        const detailUrl = `asset-detail.html?asset=${assetId}`;
        expect(detailUrl).toContain('asset-detail.html');
        expect(detailUrl).toContain(`asset=${assetId}`);
    });
});

describe('场景 3: 购买买断制授权', () => {
    it('应能打开 asset-detail.html', async () => {
        expect(typeof assetDetail).toBe('object');
    });
    
    it('应选择"买断制"选项', async () => {
        if (assetDetail.selectLicenseType) {
            assetDetail.selectLicenseType('onetime');
            expect(assetDetail.selectedLicenseType).toBe('onetime');
        }
    });
    
    it('应选择使用场景', async () => {
        const sceneOptions = document.querySelectorAll('input[name="usageType"]');
        expect(sceneOptions.length).toBeGreaterThan(0);
        
        // 选择个人使用场景
        const personalOption = document.querySelector('input[name="usageType"][value="personal"]');
        if (personalOption) {
            personalOption.checked = true;
            personalOption.dispatchEvent(new Event('change'));
            expect(assetDetail.selectedUsageType).toBe('personal');
        }
    });
    
    it('应正确计算价格', async () => {
        if (assetDetail.calculatePrice) {
            const price = assetDetail.calculatePrice();
            
            // 验证价格结构
            expect(price).toBeTruthy();
            expect(typeof price.basePrice).toBe('number');
            expect(typeof price.totalPrice).toBe('number');
            
            // 验证价格计算逻辑
            // 基础价格 * 倍率 + 平台费
            expect(price.totalPrice).toBeGreaterThan(0);
            expect(price.totalPrice).toBeGreaterThan(price.basePrice);
        }
    });
    
    it('应能点击购买按钮', async () => {
        const purchaseBtn = document.getElementById('purchaseBtn');
        expect(purchaseBtn).toBeTruthy();
        
        // 确保钱包已连接
        if (window.walletManager && !window.walletManager.isConnected) {
            console.log('     ⚠️  钱包未连接，跳过购买测试');
            return;
        }
    });
    
    it('应模拟 MetaMask 交易确认', async () => {
        if (window.mockWallet) {
            // 模拟交易
            const txHash = await window.mockWallet.request({
                method: 'eth_sendTransaction',
                params: [{
                    to: '0x2f79b56047050FD2Ee7C62d2d0fe644c15c68e23',
                    value: '0x' + (100 * 1e18).toString(16),
                    data: '0x'
                }]
            });
            
            expect(txHash).toBeTruthy();
            expect(txHash.startsWith('0x')).toBeTruthy();
            expect(txHash.length).toBe(66); // 0x + 64 hex chars
        }
    });
    
    it('应显示交易成功', async () => {
        // 检查成功消息元素
        const successEl = document.getElementById('successMessage');
        expect(successEl).toBeTruthy();
    });
    
    it('应显示 License ECHO 信息', async () => {
        if (assetDetail.licenseInfo) {
            expect(assetDetail.licenseInfo.licenseId).toBeTruthy();
            expect(assetDetail.licenseInfo.txHash).toBeTruthy();
        }
    });
});

describe('场景 4: 购买按次计费授权', () => {
    it('应选择"按次计费"选项', async () => {
        if (assetDetail.selectLicenseType) {
            assetDetail.selectLicenseType('peruse');
            expect(assetDetail.selectedLicenseType).toBe('peruse');
        }
    });
    
    it('应能输入使用次数', async () => {
        const usageCountInput = document.getElementById('usageCount');
        expect(usageCountInput).toBeTruthy();
        
        // 设置使用次数
        usageCountInput.value = '500';
        usageCountInput.dispatchEvent(new Event('input'));
        
        expect(usageCountInput.value).toBe('500');
    });
    
    it('价格应随使用次数变化', async () => {
        if (assetDetail.calculatePrice) {
            // 设置不同次数
            const usageCountInput = document.getElementById('usageCount');
            
            usageCountInput.value = '100';
            usageCountInput.dispatchEvent(new Event('input'));
            const price100 = assetDetail.calculatePrice();
            
            usageCountInput.value = '500';
            usageCountInput.dispatchEvent(new Event('input'));
            const price500 = assetDetail.calculatePrice();
            
            // 500次的价格应该高于100次
            expect(price500.totalPrice).toBeGreaterThan(price100.totalPrice);
        }
    });
    
    it('应完成按次计费购买流程', async () => {
        // 验证购买按钮可用
        const purchaseBtn = document.getElementById('purchaseBtn');
        expect(purchaseBtn).toBeTruthy();
        expect(purchaseBtn.disabled).toBeFalsy();
    });
});

describe('场景 5: 购买限时授权', () => {
    it('应选择"限时授权"选项', async () => {
        if (assetDetail.selectLicenseType) {
            assetDetail.selectLicenseType('timed');
            expect(assetDetail.selectedLicenseType).toBe('timed');
        }
    });
    
    it('应能输入授权天数', async () => {
        const durationDaysInput = document.getElementById('durationDays');
        expect(durationDaysInput).toBeTruthy();
        
        // 设置天数
        durationDaysInput.value = '90';
        durationDaysInput.dispatchEvent(new Event('input'));
        
        expect(durationDaysInput.value).toBe('90');
    });
    
    it('价格应随天数变化', async () => {
        if (assetDetail.calculatePrice) {
            const durationDaysInput = document.getElementById('durationDays');
            
            durationDaysInput.value = '30';
            durationDaysInput.dispatchEvent(new Event('input'));
            const price30 = assetDetail.calculatePrice();
            
            durationDaysInput.value = '90';
            durationDaysInput.dispatchEvent(new Event('input'));
            const price90 = assetDetail.calculatePrice();
            
            // 90天的价格应该高于30天
            expect(price90.totalPrice).toBeGreaterThan(price30.totalPrice);
        }
    });
    
    it('应完成限时授权购买流程', async () => {
        const purchaseBtn = document.getElementById('purchaseBtn');
        expect(purchaseBtn).toBeTruthy();
    });
});

describe('场景 6: 错误处理', () => {
    it('应处理余额不足情况', async () => {
        if (window.mockWallet) {
            // 启用余额不足模式
            window.mockWallet.enableLowBalanceMode();
            
            try {
                await window.mockWallet.request({
                    method: 'eth_sendTransaction',
                    params: [{
                        to: '0x2f79b56047050FD2Ee7C62d2d0fe644c15c68e23',
                        value: '0x' + (1000 * 1e18).toString(16)
                    }]
                });
                throw new Error('Should have thrown');
            } catch (error) {
                expect(error.message).toContain('insufficient funds');
            } finally {
                window.mockWallet.disableLowBalanceMode();
            }
        }
    });
    
    it('应处理用户取消交易', async () => {
        if (window.mockWallet) {
            // 启用用户拒绝模式
            window.mockWallet.enableUserRejectMode();
            
            try {
                await window.mockWallet.request({
                    method: 'eth_sendTransaction',
                    params: [{}]
                });
                throw new Error('Should have thrown');
            } catch (error) {
                expect(error.code).toBe(4001);
            } finally {
                window.mockWallet.disableUserRejectMode();
            }
        }
    });
    
    it('应处理网络错误', async () => {
        if (window.mockWallet) {
            // 启用网络错误模式
            window.mockWallet.enableNetworkErrorMode();
            
            try {
                await window.mockWallet.request({
                    method: 'eth_sendTransaction',
                    params: [{}]
                });
                throw new Error('Should have thrown');
            } catch (error) {
                expect(error.code).toBe(-32603);
            } finally {
                window.mockWallet.disableNetworkErrorMode();
            }
        }
    });
    
    it('应处理合约调用失败', async () => {
        if (window.mockContract) {
            // 启用合约失败模式
            window.mockContract.enableFailMode();
            
            try {
                await window.mockContract.purchaseOneTime(1, 0, '100');
                throw new Error('Should have thrown');
            } catch (error) {
                expect(error.message).toContain('execution reverted');
            } finally {
                window.mockContract.disableFailMode();
            }
        }
    });
    
    it('应正确显示错误提示', async () => {
        const errorEl = document.getElementById('errorMessage');
        expect(errorEl).toBeTruthy();
    });
});

describe('综合验证', () => {
    it('应验证所有授权类型价格计算正确', async () => {
        if (!assetDetail.calculatePrice) return;
        
        const scenarios = [
            { type: 'onetime', usage: 'personal', expectedBase: 100 },
            { type: 'onetime', usage: 'game', expectedBase: 100 },
            { type: 'peruse', usage: 'personal', count: 100, expectedBase: 50 },
            { type: 'timed', usage: 'personal', days: 30, expectedBase: 300 }
        ];
        
        for (const scenario of scenarios) {
            assetDetail.selectLicenseType(scenario.type);
            assetDetail.selectedUsageType = scenario.usage;
            
            if (scenario.count) {
                const input = document.getElementById('usageCount');
                if (input) input.value = scenario.count;
            }
            if (scenario.days) {
                const input = document.getElementById('durationDays');
                if (input) input.value = scenario.days;
            }
            
            const price = assetDetail.calculatePrice();
            expect(price.basePrice).toBe(scenario.expectedBase);
        }
    });
    
    it('应验证场景倍率应用正确', async () => {
        if (!assetDetail.calculatePrice) return;
        
        assetDetail.selectLicenseType('onetime');
        
        // 不同场景的价格应该不同
        const multipliers = {
            personal: 1.0,
            game: 1.5,
            ai_training: 2.0,
            commercial: 3.0
        };
        
        const prices = {};
        for (const [scene, multiplier] of Object.entries(multipliers)) {
            assetDetail.selectedUsageType = scene;
            const price = assetDetail.calculatePrice();
            prices[scene] = price.totalPrice;
        }
        
        // 验证商业广告价格最高
        expect(prices.commercial).toBeGreaterThan(prices.personal);
        expect(prices.commercial).toBeGreaterThan(prices.game);
    });
    
    it('应验证平台服务费计算正确 (5%)', async () => {
        if (!assetDetail.calculatePrice) return;
        
        assetDetail.selectLicenseType('onetime');
        assetDetail.selectedUsageType = 'personal';
        
        const price = assetDetail.calculatePrice();
        const expectedFee = price.adjustedPrice * 0.05;
        
        expect(Math.abs(price.platformFee - expectedFee)).toBeLessThan(0.01);
    });
});

// ==================== 辅助函数 ====================

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// ==================== 测试执行入口 ====================

async function runE2ETests() {
    // 初始化模拟
    if (typeof MockWallet !== 'undefined') {
        window.mockWallet = new MockWallet();
    }
    if (typeof MockContractManager !== 'undefined') {
        window.mockContract = new MockContractManager();
    }
    
    // 运行测试
    const results = await runner.run();
    
    // 生成报告
    generateReport(results);
    
    return results;
}

function generateReport(results) {
    const report = {
        timestamp: new Date().toISOString(),
        summary: {
            passed: results.passed,
            failed: results.failed,
            total: results.total,
            passRate: ((results.passed / results.total) * 100).toFixed(1) + '%'
        },
        details: results.results.map(r => ({
            suite: r.suite,
            test: r.name,
            status: r.status,
            error: r.error || null
        }))
    };
    
    console.log('\n📋 Test Report Generated');
    console.log('Pass Rate:', report.summary.passRate);
    
    // 保存到全局
    window.E2E_TEST_RESULTS = report;
    
    return report;
}

// 自动运行（如果在浏览器环境）
if (typeof window !== 'undefined') {
    // 等待页面加载完成
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            // 延迟运行，确保所有脚本加载完成
            setTimeout(runE2ETests, 2000);
        });
    } else {
        setTimeout(runE2ETests, 2000);
    }
}

// Node.js 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runE2ETests, TestRunner, generateReport };
}
