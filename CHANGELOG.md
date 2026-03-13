# Changelog

所有重要的更改都将记录在此文件中。

格式基于 [Keep a Changelog](https://keepachangelog.com/zh-CN/1.0.0/)，
并且本项目遵循 [语义化版本](https://semver.org/lang/zh-CN/)。

## [Unreleased]

### Added
- 待添加新功能

## [3.0.0] - 2026-03-13

### 🚀 重大更新

#### 智能合约 V3
- **ECHOAssetV2V3** - 资产合约升级，添加完整安全保护
  - ✅ ReentrancyGuard 防重入攻击
  - ✅ Pausable 紧急暂停功能
  - ✅ CEI 模式合规
  - ✅ 字符串长度限制
  - ✅ 访问控制修饰符

- **LicenseNFTV3** - 授权 NFT 合约升级
  - ✅ 三合一授权模式（买断/按次/限时）
  - ✅ 场景差异化定价
  - ✅ 完整的购买和验证流程
  - ✅ 紧急暂停功能

- **ECHOFusion** - 资产融合合约
  - ✅ 种子合成树
  - ✅ 收益分配机制

#### 前端功能
- **License Shop** - 授权商店页面
  - ✅ 三合一授权模式选择界面
  - ✅ 使用场景选择（个人/游戏/AI/商业）
  - ✅ 实时价格计算
  - ✅ 交易状态显示
  - ✅ 加载动画

- **ContractManagerV3** - 合约交互管理器
  - ✅ 完整的购买函数集成
  - ✅ 实时价格查询
  - ✅ 错误处理和事件解析

### 🔐 安全改进

- 修复所有已知安全漏洞
- 通过专业代码审查
- 完成安全测试套件
- 合约源码已验证（Qitmeer 主网）

### 📋 部署信息

**Qitmeer 主网合约地址：**

| 合约 | 地址 | 验证状态 |
|------|------|----------|
| ECHOAssetV2V3 | `0xF98f63b7e8064Dcf9c2f25A906B2af89Af4840ce` | ✅ 已验证 |
| ECHOFusion | `0x31Cd483Ee827A272816808AD49b90c71B1c82E11` | ✅ 已验证 |
| LicenseNFTV3 | `0x2f79b56047050FD2Ee7C62d2d0fe644c15c68e23` | ✅ 已验证 |

**交易哈希：**
- ECHOAssetV2V3: `0xffe9b254465323b96e00bec13786bef4719de964623b86394ebb968d60a5be75`
- ECHOFusion: `0x7ace547390591b970ae7683abc35f2f1b17c0dd700b48406b7c0e7be221195bd`
- LicenseNFTV3: `0xab93099d83ea59e88c26b65e26b45da66b60423a66cbd66148ceb6b9c4de1999`

### 🐛 修复

- 修复 Hardhat 验证 API 地址配置
- 修复合约代码中 ETH 转账顺序（CEI 模式）
- 修复前端价格计算精度问题
- 修复事件解析错误处理

### 📚 文档

- 新增 README.md 项目说明
- 新增 CONTRIBUTING.md 贡献指南
- 新增 CODE_REVIEW_REPORT.md 代码审查报告
- 新增 LICENSE_SHOP_INTEGRATION.md 集成说明
- 新增 ECHO-Vision-Conversation.md 项目愿景

### 🧪 测试

- 新增安全测试套件
- 新增 License Shop 功能测试
- 价格计算单元测试

## [2.0.0] - 2026-03-12

### Added
- Phase 6 功能增强
  - 移动端适配
  - 增强播放器
  - 主题切换
  - 多语言支持
  - 数据分析面板
- 权属蓝图 (Rights Blueprint) 基础架构

### Changed
- 前端架构重构
- 合约结构优化

## [1.0.0] - 2026-03-11

### Added
- 初始版本发布
- 基础智能合约（ECHOAsset, LicenseNFT）
- 前端基础框架
- 钱包连接功能

### Features
- 音乐资产铸造
- 基础授权功能
- 钱包集成

---

## 版本说明

### 版本号格式

`主版本号.次版本号.修订号`

- **主版本号**：重大更新，不兼容的 API 修改
- **次版本号**：新增功能，向下兼容
- **修订号**：问题修复，向下兼容

### 标签说明

- `Added` - 新功能
- `Changed` - 现有功能的变更
- `Deprecated` - 即将删除的功能
- `Removed` - 已删除的功能
- `Fixed` - 问题修复
- `Security` - 安全相关改进

---

**查看完整更新历史**：[GitHub Releases](https://github.com/zhouyatingkol/echo-demo1/releases)
