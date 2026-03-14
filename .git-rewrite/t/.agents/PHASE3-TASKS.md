# Phase 3 开发任务 - 收益系统

## 目标
开发创作者收益管理功能

## 任务分解

### Task 3.1: 收益统计面板 ⭐ 最高优先级
**需求**: 可视化展示创作者收益数据

**功能点**:
- [ ] 总收益概览卡片
- [ ] 日/周/月收益趋势图 (Chart.js)
- [ ] 收益来源分布饼图 (使用费 vs 衍生费)
- [ ] 最畅销作品排行
- [ ] 收益对比 (本月 vs 上月)

**技术方案**:
```javascript
// 从合约事件读取收益数据
// AssetUsed(tokenId, user, amount)
// DerivativeCreated(parentTokenId, childTokenId, creator, revenueShare)
```

**文件**:
- 新建: `frontend/dashboard.html` - 创作者收益面板
- 新建: `frontend/js/dashboard.js` - 图表逻辑
- 新建: `frontend/js/revenue-chart.js` - Chart.js 封装

---

### Task 3.2: 交易明细列表
**需求**: 展示每笔收益交易详情

**功能点**:
- [ ] 交易列表表格
- [ ] 时间筛选 (今日/本周/本月/全部)
- [ ] 类型筛选 (使用费/衍生费/其他)
- [ ] 交易哈希链接到区块浏览器
- [ ] 分页加载
- [ ] 导出 CSV

**数据结构**:
```javascript
{
  txHash: "0x...",
  timestamp: 1234567890,
  type: "usage", // usage | derivative
  tokenId: 123,
  musicName: "夏日微风",
  amount: "0.1",
  from: "0x...",
  description: "AI训练使用授权"
}
```

**文件**:
- 修改: `frontend/dashboard.html` - 添加交易列表
- 新建: `frontend/js/transaction-list.js`

---

### Task 3.3: 提现功能
**需求**: 将收益提现到钱包

**功能点**:
- [ ] 可提现余额显示
- [ ] 提现金额输入
- [ ] 提现按钮
- [ ] 提现记录列表
- [ ] 最低提现额度提示
- [ ] 提现手续费显示

**合约调用**:
```javascript
// 调用 RevenueShare 合约
contract.withdrawRevenue(amount)
```

**文件**:
- 修改: `frontend/dashboard.html` - 添加提现区域
- 新建: `frontend/js/withdraw.js`

---

### Task 3.4: 收益预测 (可选增强)
**需求**: 基于历史数据预测未来收益

**功能点**:
- [ ] 基于过去30天平均预测本月收益
- [ ] 年度收益预测
- [ ] 达成目标进度条

---

## 协作流程
```
Developer → Reviewer → Tester → 推送
    ↑________↓_________↓______↓
```

## 会话分配
- `echo-dev-revenue-dashboard` - 收益面板
- `echo-dev-transactions` - 交易明细
- `echo-dev-withdraw` - 提现功能
