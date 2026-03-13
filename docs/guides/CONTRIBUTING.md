# 贡献指南 Contributing Guide

感谢您对 ECHO Protocol 的兴趣！我们欢迎所有形式的贡献。

## 🤝 如何贡献

### 1. 提交 Issue

如果您发现了 bug 或有新功能建议：

1. 检查是否已存在相关 issue
2. 使用 [Issue 模板](.github/ISSUE_TEMPLATE/bug_report.md) 提交
3. 提供详细的问题描述和复现步骤

### 2. 提交代码

#### 工作流程

```bash
# 1. Fork 项目
# 2. 克隆您的 fork
git clone https://github.com/YOUR_USERNAME/echo-demo1.git

# 3. 创建功能分支
git checkout -b feature/your-feature-name

# 4. 提交更改
git add .
git commit -m "feat: 添加新功能"

# 5. 推送到您的 fork
git push origin feature/your-feature-name

# 6. 提交 Pull Request
```

#### 代码规范

##### JavaScript/ Solidity 代码风格

- 使用 4 空格缩进
- 使用单引号
- 行尾分号
- 最大行长度 120 字符

```javascript
// ✅ Good
const result = await contract.purchaseOneTime(assetId, usageType, {
    value: priceWei
});

// ❌ Bad
const result=await contract.purchaseOneTime(assetId,usageType,{value:priceWei})
```

##### 提交信息规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/)：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**类型 (type)：**

- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式（不影响功能）
- `refactor`: 重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

**示例：**

```bash
git commit -m "feat(contract): 添加紧急暂停功能

- 实现 Pausable 合约继承
- 添加 pause() 和 unpause() 函数
- 更新测试用例

Closes #123"
```

##### Solidity 智能合约规范

1. **版本声明**
```solidity
pragma solidity ^0.8.19;
```

2. **NatSpec 注释**
```solidity
/**
 * @title LicenseNFT V3
 * @dev 授权 ECHO 合约
 * @author ECHO Team
 */
contract LicenseNFTV3 {
    /**
     * @notice 购买买断制授权
     * @param _parentAssetId 父资产ID
     * @param _usageType 使用场景
     */
    function purchaseOneTime(uint256 _parentAssetId, uint8 _usageType) 
        public 
        payable 
    {
        // ...
    }
}
```

3. **安全检查**
   - 使用 `require` 进行输入验证
   - 使用 `ReentrancyGuard` 防重入
   - 遵循 CEI 模式

### 3. 代码审查

提交 PR 后，维护者会进行审查：

- ✅ 代码质量
- ✅ 测试覆盖
- ✅ 安全审查
- ✅ 文档更新

## 🧪 测试

### 运行测试

```bash
# 运行所有测试
npm test

# 运行特定测试文件
npx hardhat test test/security-test.js

# 运行并生成覆盖率报告
npm run coverage
```

### 测试规范

1. **单元测试**
```javascript
describe('LicenseShop', () => {
    it('should calculate price correctly', async () => {
        const price = shop.calculatePrice();
        expect(price.totalPrice).to.be.gt(0);
    });
});
```

2. **安全测试**
   - 重入攻击测试
   - 访问控制测试
   - 边界条件测试

## 📚 文档

### 需要更新的文档

- [ ] README.md - 项目说明
- [ ] 代码注释 - 函数和变量
- [ ] API 文档 - 合约接口
- [ ] 使用指南 - 用户手册

## 🎨 前端贡献

### 文件结构

```
frontend/
├── css/           # 样式文件
├── js/            # 脚本文件
├── html/          # HTML 页面
└── assets/        # 静态资源
```

### CSS 命名规范

使用 BEM 命名法：

```css
/* Block */
.license-card { }

/* Element */
.license-card__title { }
.license-card__price { }

/* Modifier */
.license-card--selected { }
.license-card--disabled { }
```

## 🔐 安全

### 报告安全漏洞

如果您发现了安全漏洞，请：

1. **不要** 在公共 issue 中披露
2. 提交 GitHub Security Advisory
3. 提供详细的漏洞描述和复现步骤

### 安全最佳实践

- 永远不要提交私钥
- 使用 `.env` 管理敏感信息
- 合约部署前必须通过安全审计

## 🏆 贡献者荣誉

感谢所有为 ECHO Protocol 做出贡献的人！

[贡献者列表](https://github.com/zhouyatingkol/echo-demo1/graphs/contributors)

## ❓ 常见问题

**Q: 我需要多少 MEER 才能部署合约？**  
A: 大约需要 1-2 MEER 用于部署和验证。

**Q: 如何获取测试币？**  
A: Qitmeer 测试网可以从水龙头获取。

**Q: 合约部署后可以修改吗？**  
A: 不可以，合约一旦部署就不可修改。请确保在测试网充分测试。

## 📞 联系我们

- GitHub Issues: [提交问题](https://github.com/zhouyatingkol/echo-demo1/issues)

---

**感谢您的贡献！让我们一起保护创作者的权益。** 🌱
