# Multi-Agent 协作系统 - ECHO Demo

## Agent 角色定义

### 1. Developer (开发Agent)
**职责**：编写功能代码
**工作流程**：
- 接收功能需求
- 编写实现代码
- 自测基础语法
- 提交给 Reviewer

### 2. Reviewer (审查Agent)  
**职责**：代码审查和质量检查
**工作流程**：
- 检查代码逻辑
- 检查语法错误
- 检查常见陷阱（如中文编码、重复定义等）
- 提供修改建议或批准

### 3. Tester (测试Agent)
**职责**：功能验证
**工作流程**：
- 模拟用户操作场景
- 检查边界条件
- 验证合约交互逻辑
- 报告测试结果

## 协作流程

```
Developer → Reviewer → Tester → 推送
    ↑________↓_________↓______↓
    发现问题时回退
```

## 当前任务队列

### Task 1: 修复生成页面的 Bug
- [ ] Developer: 修复已知问题
- [ ] Reviewer: 代码审查
- [ ] Tester: 功能验证
- [ ] 推送上线

### Task 2: 添加表单验证增强
- [ ] Developer: 实现前端验证
- [ ] Reviewer: 审查验证逻辑
- [ ] Tester: 测试各种边界输入

## 会话管理
每个 Task 使用独立的会话标签：
- `echo-dev` - Developer Agent
- `echo-review` - Reviewer Agent  
- `echo-test` - Tester Agent
