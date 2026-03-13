#!/bin/bash
# Qitmeer Blockscout 合约验证微服务 - 生产部署脚本
# 适用于: Ubuntu 20.04/22.04, CentOS 8, Debian 11+
# 作者: OpenClaw for Qitmeer Network

set -euo pipefail

# 配置
VERIFIER_VERSION="v1.7.0"
INSTALL_DIR="/opt/smart-contract-verifier"
SERVICE_USER="blockscout"
VERIFIER_PORT="8050"
BLOCKSCOUT_ENV="/etc/blockscout/env"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log() {
    echo -e "${GREEN}[$(date +%H:%M:%S)]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[$(date +%H:%M:%S)] WARNING:${NC} $1"
}

error() {
    echo -e "${RED}[$(date +%H:%M:%S)] ERROR:${NC} $1"
    exit 1
}

# 检查 root 权限
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "请使用 sudo 或 root 用户运行此脚本"
    fi
}

# 检查系统
check_system() {
    log "检查系统环境..."
    
    # 检查 systemd
    if ! command -v systemctl &> /dev/null; then
        error "systemd 未安装，此脚本需要 systemd"
    fi
    
    # 检查端口占用
    if netstat -tuln 2>/dev/null | grep -q ":$VERIFIER_PORT " || \
       ss -tuln 2>/dev/null | grep -q ":$VERIFIER_PORT "; then
        warn "端口 $VERIFIER_PORT 已被占用"
        read -p "是否继续? (y/n) " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    # 检查依赖
    if ! command -v wget &> /dev/null && ! command -v curl &> /dev/null; then
        error "需要 wget 或 curl"
    fi
}

# 安装依赖
install_deps() {
    log "安装系统依赖..."
    
    if command -v apt-get &> /dev/null; then
        # Debian/Ubuntu
        apt-get update -qq
        apt-get install -y -qq wget tar systemd
    elif command -v yum &> /dev/null; then
        # RHEL/CentOS
        yum install -y -q wget tar systemd
    elif command -v dnf &> /dev/null; then
        # Fedora
        dnf install -y -q wget tar systemd
    else
        error "不支持的包管理器"
    fi
}

# 创建用户
create_user() {
    log "创建服务用户..."
    
    if ! id "$SERVICE_USER" &>/dev/null; then
        useradd -r -s /bin/false -d "$INSTALL_DIR" "$SERVICE_USER"
        log "用户 $SERVICE_USER 已创建"
    else
        log "用户 $SERVICE_USER 已存在"
    fi
}

# 下载验证服务
download_verifier() {
    log "下载 smart-contract-verifier $VERIFIER_VERSION..."
    
    cd /tmp
    
    local download_url="https://github.com/blockscout/blockscout-rs/releases/download/smart-contract-verifier-${VERIFIER_VERSION}/smart-contract-verifier-x86_64-unknown-linux-gnu.tar.gz"
    local filename="smart-contract-verifier.tar.gz"
    
    if command -v wget &> /dev/null; then
        wget -q --show-progress "$download_url" -O "$filename"
    else
        curl -sL --progress-bar "$download_url" -o "$filename"
    fi
    
    # 解压
    mkdir -p "$INSTALL_DIR"
    tar -xzf "$filename" -C "$INSTALL_DIR"
    chmod +x "$INSTALL_DIR/smart-contract-verifier"
    chown -R "$SERVICE_USER:$SERVICE_USER" "$INSTALL_DIR"
    
    # 创建编译器目录
    mkdir -p "$INSTALL_DIR/compilers"
    chown "$SERVICE_USER:$SERVICE_USER" "$INSTALL_DIR/compilers"
    
    log "验证服务已安装到 $INSTALL_DIR"
}

# 创建配置
create_config() {
    log "创建配置文件..."
    
    cat > "$INSTALL_DIR/config.toml" << 'EOF'
[server]
addr = "0.0.0.0:8050"

[metrics]
enabled = true
addr = "0.0.0.0:6060"

[smart_contract_verifier]
enabled = true

[solidity]
enabled = true

# 支持的 Solidity 版本列表
[solidity.compilers]
list = [
    "v0.8.25",
    "v0.8.24",
    "v0.8.23",
    "v0.8.22",
    "v0.8.21",
    "v0.8.20",
    "v0.8.19",
    "v0.8.18",
    "v0.8.17",
    "v0.8.16",
    "v0.8.15",
    "v0.8.14",
    "v0.8.13",
    "v0.8.12",
    "v0.8.11",
    "v0.8.10",
    "v0.8.9",
    "v0.8.8",
    "v0.8.7",
    "v0.8.6",
    "v0.8.5",
    "v0.8.4",
]

# 自动下载编译器
[solidity.fetchers.list]
type = "SOLIDITY"
dir = "/opt/smart-contract-verifier/compilers"
refresh_interval = "1d"

[vyper]
enabled = true

[sourcify]
enabled = true
api_url = "https://sourcify.dev/server/"
EOF

    chown "$SERVICE_USER:$SERVICE_USER" "$INSTALL_DIR/config.toml"
    log "配置文件已创建"
}

# 创建 systemd 服务
create_service() {
    log "创建 systemd 服务..."
    
    cat > /etc/systemd/system/smart-contract-verifier.service << EOF
[Unit]
Description=Blockscout Smart Contract Verifier for Qitmeer
Documentation=https://github.com/blockscout/blockscout-rs
After=network.target
Wants=network.target

[Service]
Type=simple
User=$SERVICE_USER
Group=$SERVICE_USER
WorkingDirectory=$INSTALL_DIR
Environment="RUST_LOG=info"
Environment="SMART_CONTRACT_VERIFIER__SERVER__ADDR=0.0.0.0:$VERIFIER_PORT"
ExecStart=$INSTALL_DIR/smart-contract-verifier -c $INSTALL_DIR/config.toml
ExecReload=/bin/kill -HUP \$MAINPID
Restart=on-failure
RestartSec=5
StandardOutput=journal
StandardError=journal
SyslogIdentifier=smart-contract-verifier

# 安全限制
NoNewPrivileges=true
ProtectSystem=strict
ProtectHome=true
ReadWritePaths=$INSTALL_DIR/compilers

[Install]
WantedBy=multi-user.target
EOF

    systemctl daemon-reload
    log "systemd 服务已创建"
}

# 配置 Blockscout
configure_blockscout() {
    log "配置 Blockscout..."
    
    # 查找 Blockscout 环境变量文件
    local env_files=(
        "/opt/blockscout/.env"
        "/var/www/blockscout/.env"
        "$BLOCKSCOUT_ENV"
        "/home/blockscout/blockscout/.env"
    )
    
    local found_env=""
    for env_file in "${env_files[@]}"; do
        if [[ -f "$env_file" ]]; then
            found_env="$env_file"
            break
        fi
    done
    
    if [[ -n "$found_env" ]]; then
        log "找到 Blockscout 配置: $found_env"
        
        # 备份
        cp "$found_env" "$found_env.backup.$(date +%Y%m%d)"
        
        # 添加验证服务配置
        if ! grep -q "MICROSERVICE_SC_VERIFIER" "$found_env"; then
            cat >> "$found_env" << EOF

# 合约验证微服务配置
MICROSERVICE_SC_VERIFIER_ENABLED=true
MICROSERVICE_SC_VERIFIER_URL=http://localhost:$VERIFIER_PORT
EOF
            log "Blockscout 配置已更新"
        else
            warn "Blockscout 已有验证服务配置，请手动检查"
        fi
        
        # 尝试重启 Blockscout
        if systemctl is-active --quiet blockscout; then
            log "重启 Blockscout..."
            systemctl restart blockscout || warn "Blockscout 重启失败，请手动重启"
        fi
    else
        warn "未找到 Blockscout 配置文件，请手动添加以下配置："
        echo ""
        echo "MICROSERVICE_SC_VERIFIER_ENABLED=true"
        echo "MICROSERVICE_SC_VERIFIER_URL=http://localhost:$VERIFIER_PORT"
        echo ""
    fi
}

# 启动服务
start_service() {
    log "启动验证服务..."
    
    systemctl enable smart-contract-verifier
    systemctl start smart-contract-verifier
    
    # 等待服务启动
    sleep 3
    
    # 检查状态
    if systemctl is-active --quiet smart-contract-verifier; then
        log "✅ 验证服务运行正常"
    else
        error "验证服务启动失败，查看日志: journalctl -u smart-contract-verifier -n 50"
    fi
}

# 验证部署
verify_deployment() {
    log "验证部署..."
    
    # 检查健康状态
    local health
    health=$(curl -s http://localhost:$VERIFIER_PORT/api/v1/health 2>/dev/null || echo "")
    
    if [[ "$health" == *"healthy"* ]] || [[ "$health" == *"ok"* ]]; then
        log "✅ 健康检查通过"
    else
        warn "健康检查未返回预期结果: $health"
    fi
    
    # 检查编译器列表
    local versions
    versions=$(curl -s http://localhost:$VERIFIER_PORT/api/v1/solidity/versions 2>/dev/null | head -c 200)
    
    if [[ "$versions" == *"v0.8.19"* ]]; then
        log "✅ Solidity 编译器列表正常"
    else
        warn "编译器列表可能未加载完整，等待自动下载..."
    fi
}

# 显示完成信息
show_completion() {
    echo ""
    echo "=========================================="
    echo -e "${GREEN}✅ 部署完成!${NC}"
    echo "=========================================="
    echo ""
    echo "服务信息:"
    echo "  - 服务名: smart-contract-verifier"
    echo "  - 端口: $VERIFIER_PORT"
    echo "  - 安装目录: $INSTALL_DIR"
    echo ""
    echo "管理命令:"
    echo "  查看状态: sudo systemctl status smart-contract-verifier"
    echo "  查看日志: sudo journalctl -u smart-contract-verifier -f"
    echo "  重启服务: sudo systemctl restart smart-contract-verifier"
    echo ""
    echo "测试验证:"
    echo "  curl http://localhost:$VERIFIER_PORT/api/v1/health"
    echo ""
    echo "如果 Blockscout 未自动配置，请手动添加:"
    echo "  MICROSERVICE_SC_VERIFIER_ENABLED=true"
    echo "  MICROSERVICE_SC_VERIFIER_URL=http://localhost:$VERIFIER_PORT"
    echo ""
}

# 主函数
main() {
    log "🚀 Qitmeer Blockscout 验证微服务部署脚本"
    log "=========================================="
    
    check_root
    check_system
    install_deps
    create_user
    download_verifier
    create_config
    create_service
    configure_blockscout
    start_service
    verify_deployment
    show_completion
}

# 卸载函数
uninstall() {
    log "卸载 smart-contract-verifier..."
    systemctl stop smart-contract-verifier 2>/dev/null || true
    systemctl disable smart-contract-verifier 2>/dev/null || true
    rm -f /etc/systemd/system/smart-contract-verifier.service
    rm -rf "$INSTALL_DIR"
    systemctl daemon-reload
    log "✅ 已卸载"
}

# 参数处理
case "${1:-}" in
    --uninstall|-u)
        uninstall
        ;;
    --help|-h)
        echo "用法: $0 [--uninstall]"
        echo ""
        echo "选项:"
        echo "  --uninstall, -u  卸载验证服务"
        echo "  --help, -h       显示帮助"
        exit 0
        ;;
    *)
        main
        ;;
esac
