# Qitmeer Blockscout 验证微服务 - 快速部署指南

## 🚀 一键部署

在 Qitmeer Blockscout 服务器上执行：

```bash
# 1. 下载脚本
wget https://your-domain.com/deploy-verifier-prod.sh
# 或从本机复制
scp deploy-verifier-prod.sh root@your-server:/root/

# 2. 运行部署
chmod +x deploy-verifier-prod.sh
sudo ./deploy-verifier-prod.sh
```

部署完成后，区块浏览器的合约验证功能将自动恢复。

## 📋 部署前检查清单

- [ ] Blockscout 服务器 root 权限
- [ ] 端口 8050 未被占用（或被释放）
- [ ] 服务器内存 ≥ 2GB（推荐 4GB）
- [ ] 磁盘空间 ≥ 1GB（编译器缓存）

## 🔧 手动配置（如果自动配置失败）

找到 Blockscout 的 `.env` 文件，添加：

```bash
# 合约验证微服务
MICROSERVICE_SC_VERIFIER_ENABLED=true
MICROSERVICE_SC_VERIFIER_URL=http://localhost:8050
```

然后重启 Blockscout：
```bash
sudo systemctl restart blockscout
```

## ✅ 验证部署

```bash
# 检查服务状态
sudo systemctl status smart-contract-verifier

# 查看健康状态
curl http://localhost:8050/api/v1/health

# 查看支持的编译器版本
curl http://localhost:8050/api/v1/solidity/versions | head -20
```

## 📊 支持的 Solidity 版本

验证服务预配置支持：
- v0.8.25 - v0.8.5（共 22 个版本）
- 自动下载新版本的编译器

## 🛠️ 运维命令

| 操作 | 命令 |
|-----|------|
| 查看日志 | `sudo journalctl -u smart-contract-verifier -f` |
| 重启服务 | `sudo systemctl restart smart-contract-verifier` |
| 停止服务 | `sudo systemctl stop smart-contract-verifier` |
| 卸载服务 | `sudo ./deploy-verifier-prod.sh --uninstall` |

## 🔍 故障排查

### 问题 1: 端口 8050 被占用
```bash
# 查找占用端口的进程
sudo lsof -i :8050
# 或
sudo netstat -tlnp | grep 8050

# 停止占用进程后重新部署
sudo kill -9 <PID>
```

### 问题 2: 服务启动失败
```bash
# 查看详细错误日志
sudo journalctl -u smart-contract-verifier -n 100 --no-pager

# 常见原因：权限问题
sudo chown -R blockscout:blockscout /opt/smart-contract-verifier
```

### 问题 3: Blockscout 无法连接验证服务
```bash
# 检查防火墙
sudo ufw allow 8050/tcp
# 或
sudo firewall-cmd --add-port=8050/tcp --permanent
sudo firewall-cmd --reload

# 检查网络连通性
curl http://localhost:8050/api/v1/health
```

## 📁 文件位置

| 文件 | 路径 |
|-----|------|
| 验证服务二进制 | `/opt/smart-contract-verifier/smart-contract-verifier` |
| 配置文件 | `/opt/smart-contract-verifier/config.toml` |
| 编译器缓存 | `/opt/smart-contract-verifier/compilers` |
| 服务日志 | `journalctl -u smart-contract-verifier` |

## 🌐 架构说明

```
用户浏览器 → Blockscout (port 80/443)
                ↓
        调用验证 API
                ↓
    Smart Contract Verifier (port 8050)
                ↓
        编译并验证合约源码
```

## 📞 技术支持

- Blockscout 官方文档: https://docs.blockscout.com/
- 验证服务源码: https://github.com/blockscout/blockscout-rs
- Qitmeer Discord: https://discord.com/invite/xzGSmrzXTM

---

**部署完成后，刷新区块浏览器验证页面，Compiler 下拉框将显示 Solidity 版本列表。**
