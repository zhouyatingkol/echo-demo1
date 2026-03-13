# Blockscout 合约验证微服务部署指南

## 问题背景
Qitmeer Blockscout v7.0.2 的合约验证功能缺失，表现为：
- Compiler 下拉框为空
- API 返回 "verification microservice" 错误

## 原因
Blockscout 从 v5.x 开始，合约验证功能拆分为独立的微服务：
**smart-contract-verifier** (Rust 编写)

## 解决方案

### 方案 1：Docker Compose 部署（推荐）

```yaml
# docker-compose.yml 添加验证服务
version: '3.8'

services:
  # 原有 Blockscout 服务
  blockscout:
    image: blockscout/blockscout:latest
    environment:
      - MICROSERVICE_SC_VERIFIER_ENABLED=true
      - MICROSERVICE_SC_VERIFIER_URL=http://smart-contract-verifier:8050
    depends_on:
      - smart-contract-verifier

  # 新增：验证微服务
  smart-contract-verifier:
    image: ghcr.io/blockscout/smart-contract-verifier:latest
    ports:
      - "8050:8050"
    environment:
      - SMART_CONTRACT_VERIFIER__ENABLED=true
      - SMART_CONTRACT_VERIFIER__SOLIDITY__ENABLED=true
      - SMART_CONTRACT_VERIFIER__SOLIDITY__FETCHERS__LIST__0__TYPE=SOLIDITY
      - SMART_CONTRACT_VERIFIER__SOLIDITY__FETCHERS__LIST__0__DIR=/tmp/solc-compilers
    volumes:
      - ./solc-compilers:/tmp/solc-compilers
```

### 方案 2：Systemd 服务部署

```bash
# 1. 下载验证服务
wget https://github.com/blockscout/blockscout-rs/releases/download/smart-contract-verifier-v1.7.0/smart-contract-verifier-x86_64-unknown-linux-gnu.tar.gz
tar -xzf smart-contract-verifier-*.tar.gz

# 2. 创建配置文件
mkdir -p /etc/smart-contract-verifier
cat > /etc/smart-contract-verifier/config.toml << 'EOF'
[server]
addr = "0.0.0.0:8050"

[smart_contract_verifier]
enabled = true

[solidity]
enabled = true

[solidity.fetchers.list]
type = "SOLIDITY"
dir = "/opt/solc-compilers"
EOF

# 3. 创建 systemd 服务
cat > /etc/systemd/system/smart-contract-verifier.service << 'EOF'
[Unit]
Description=Blockscout Smart Contract Verifier
After=network.target

[Service]
Type=simple
User=blockscout
ExecStart=/usr/local/bin/smart-contract-verifier -c /etc/smart-contract-verifier/config.toml
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

# 4. 启动服务
systemctl daemon-reload
systemctl enable smart-contract-verifier
systemctl start smart-contract-verifier

# 5. 验证服务状态
curl http://localhost:8050/api/v1/health
```

### 方案 3：配置 Blockscout 连接验证服务

```bash
# 在 Blockscout 服务器上设置环境变量
export MICROSERVICE_SC_VERIFIER_ENABLED=true
export MICROSERVICE_SC_VERIFIER_URL=http://localhost:8050

# 重启 Blockscout
systemctl restart blockscout
```

## 关键配置参数

| 环境变量 | 说明 | 示例值 |
|---------|------|--------|
| `MICROSERVICE_SC_VERIFIER_ENABLED` | 启用验证服务 | `true` |
| `MICROSERVICE_SC_VERIFIER_URL` | 验证服务地址 | `http://localhost:8050` |
| `SMART_CONTRACT_VERIFIER__SOLIDITY__ENABLED` | 启用 Solidity | `true` |

## 验证部署

```bash
# 1. 检查验证服务健康
curl http://localhost:8050/api/v1/health

# 2. 获取支持的编译器版本
curl http://localhost:8050/api/v1/solidity/versions

# 3. 测试验证 API
curl -X POST http://localhost:8050/api/v1/solidity/verify \
  -H "Content-Type: application/json" \
  -d '{
    "contract_address": "0x...",
    "compiler_version": "v0.8.19",
    "source_code": "pragma solidity...",
    "optimization": true,
    "optimization_runs": 200
  }'
```

## 给 Qitmeer 团队的部署脚本

```bash
#!/bin/bash
# deploy-verifier.sh

set -e

VERIFIER_VERSION="v1.7.0"
INSTALL_DIR="/opt/smart-contract-verifier"

echo "📦 安装 Blockscout 验证微服务..."

# 创建目录
mkdir -p $INSTALL_DIR
mkdir -p $INSTALL_DIR/compilers

# 下载
cd /tmp
wget -q "https://github.com/blockscout/blockscout-rs/releases/download/smart-contract-verifier-${VERIFIER_VERSION}/smart-contract-verifier-x86_64-unknown-linux-gnu.tar.gz"
tar -xzf smart-contract-verifier-*.tar.gz
mv smart-contract-verifier $INSTALL_DIR/
chmod +x $INSTALL_DIR/smart-contract-verifier

# 创建配置
cat > $INSTALL_DIR/config.toml << 'EOF'
[server]
addr = "0.0.0.0:8050"

[smart_contract_verifier]
enabled = true

[solidity]
enabled = true
compilers_dir = "/opt/smart-contract-verifier/compilers"

[solidity.fetchers.list]
type = "SOLIDITY"
dir = "/opt/smart-contract-verifier/compilers"
refresh_interval = "1d"
EOF

# 创建 systemd 服务
cat > /etc/systemd/system/smart-contract-verifier.service << 'EOF'
[Unit]
Description=Blockscout Smart Contract Verifier
After=network.target

[Service]
Type=simple
WorkingDirectory=/opt/smart-contract-verifier
ExecStart=/opt/smart-contract-verifier/smart-contract-verifier -c /opt/smart-contract-verifier/config.toml
Restart=always
RestartSec=5
StandardOutput=journal
StandardError=journal

[Install]
WantedBy=multi-user.target
EOF

# 启动
systemctl daemon-reload
systemctl enable smart-contract-verifier
systemctl start smart-contract-verifier

# 配置 Blockscout
echo "export MICROSERVICE_SC_VERIFIER_ENABLED=true" >> /etc/blockscout/env
echo "export MICROSERVICE_SC_VERIFIER_URL=http://localhost:8050" >> /etc/blockscout/env

# 重启 Blockscout
systemctl restart blockscout

echo "✅ 验证微服务部署完成！"
echo "检查状态: systemctl status smart-contract-verifier"
echo "查看日志: journalctl -u smart-contract-verifier -f"
```

## 参考资料

- Blockscout 文档: https://docs.blockscout.com/
- 验证服务源码: https://github.com/blockscout/blockscout-rs/tree/main/smart-contract-verifier
- 官方 Docker: https://github.com/blockscout/blockscout-rs/pkgs/container/smart-contract-verifier

## 注意事项

1. **端口**: 确保 8050 端口开放
2. **防火墙**: 允许 Blockscout 访问验证服务
3. **存储**: 编译器文件需要 ~500MB 存储
4. **内存**: 验证服务需要 ~1GB 内存
