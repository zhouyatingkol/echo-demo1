#!/bin/bash
# Qitmeer Blockscout 合约验证微服务 - 生产部署脚本 (v2.0)
# 适用于: Ubuntu 20.04/22.04, CentOS 8, Debian 11+
# 作者: OpenClaw for Qitmeer Network
# 改进: 根据 Qitmeer 团队建议优化

set -euo pipefail

# 配置
VERIFIER_VERSION="v1.7.0"
INSTALL_DIR="/opt/smart-contract-verifier"
SERVICE_USER="blockscout"
VERIFIER_PORT="8050"
METRICS_PORT="8051"
BLOCKSCOUT_ENV="/etc/blockscout/env"
MAX_RETRIES=5

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

log() { echo -e "${GREEN}[$(date +%H:%M:%S)]${NC} $1"; }
warn() { echo -e "${YELLOW}[$(date +%H:%M:%S)] WARNING:${NC} $1"; }
error() { echo -e "${RED}[$(date +%H:%M:%S)] ERROR:${NC} $1"; exit 1; }
info() { echo -e "${BLUE}[$(date +%H:%M:%S)] INFO:${NC} $1"; }

# 检查 root 权限
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "请使用 sudo 或 root 用户运行此脚本"
    fi
}

# 检查系统
check_system() {
    log "检查系统环境..."
    
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
}

# 检查最新版本
check_version() {
    log "检查最新版本..."
    local latest_version
    latest_version=$(curl -s https://api.github.com/repos/blockscout/blockscout-rs/releases/latest 2>/dev/null | grep -Po '"tag_name": "\K.*?(?=")' | sed 's/smart-contract-verifier-//' || echo "")
    
    if [[ -n "$latest_version" && "$latest_version" != "$VERIFIER_VERSION" ]]; then
        warn "当前版本: ${VERIFIER_VERSION}, 最新版本: ${latest_version}"
        read -p "是否使用最新版本? [y/N] " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            VERIFIER_VERSION="$latest_version"
            log "将使用版本: $VERIFIER_VERSION"
        fi
    fi
}

# 安装依赖
install_deps() {
    log "安装系统依赖..."
    local deps="wget tar curl"
    
    if command -v apt-get &> /dev/null; then
        apt-get update -qq
        apt-get install -y -qq $deps
    elif command -v yum &> /dev/null; then
        yum install -y -q $deps
    elif command -v dnf &> /dev/null; then
        dnf install -y -q $deps
    else
        error "不支持的包管理器"
    fi
    
    log "依赖安装完成"
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
        wget -q --show-progress "$download_url" -O "$filename" || error "下载失败"
    else
        curl -sL --progress-bar "$download_url" -o "$filename" || error "下载失败"
    fi
    
    # 解压
    mkdir -p "$INSTALL_DIR"
    tar -xzf "$filename" -C "$INSTALL_DIR"
    chmod +x "$INSTALL_DIR/smart-contract-verifier"
    chown -R "$SERVICE_USER:$SERVICE_USER" "$INSTALL_DIR"
    
    # 创建编译器目录
    mkdir -p "$INSTALL_DIR/compilers"
    chown "$SERVICE_USER:$SERVICE_USER" "$INSTALL_DIR/compilers"
    
    # 清理
    rm -f "$filename"
    
    log "验证服务已安装到 $INSTALL_DIR"
}

# 创建配置
create_config() {
    log "创建配置文件..."
    
    # 备份现有配置
    if [[ -f "$INSTALL_DIR/config.toml" ]]; then
        cp "$INSTALL_DIR/config.toml" "$INSTALL_DIR/config.toml.backup.$(date +%Y%m%d%H%M%S)"
        log "已备份现有配置"
    fi
    
    # 生成编译器版本列表
    local compiler_list=""
    for i in {25..4}; do
        compiler_list="${compiler_list}\n    \"v0.8.${i}\","
    done
    compiler_list="${compiler_list%,}"  # 移除最后一个逗号
    
    cat > "$INSTALL_DIR/config.toml" << EOF
[server]
addr = "0.0.0.0:${VERIFIER_PORT}"

[smart_contract_verifier]
enabled = true

[logger]
level = "info"
format = "json"

[solidity]
enabled = true

[solidity.compilers]
list = [${compiler_list}
]

[solidity.fetchers.list]
type = "SOLIDITY"
dir = "${INSTALL_DIR}/compilers"
refresh_interval = "1d"

[vyper]
enabled = true

[sourcify]
enabled = true
api_url = "https://sourcify.dev/server/"

[metrics]
enabled = true
addr = "0.0.0.0:${METRICS_PORT}"
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

# 配置防火墙
configure_firewall() {
    log "配置防火墙..."
    
    # 检查是否需要配置防火墙
    if command -v ufw &> /dev/null; then
        if ufw status | grep -q "Status: active"; then
            ufw allow ${VERIFIER_PORT}/tcp comment "smart-contract-verifier"
            log "已添加 ufw 规则"
        fi
    elif command -v firewall-cmd &> /dev/null; then
        if systemctl is-active --quiet firewalld; then
            firewall-cmd --permanent --add-port=${VERIFIER_PORT}/tcp
            firewall-cmd --reload
            log "已添加 firewall-cmd 规则"
        fi
    else
        info "未检测到防火墙，跳过配置"
    fi
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
        "/app/.env"
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
        cp "$found_env" "$found_env.backup.$(date +%Y%m%d%H%M%S)"
        
        # 添加验证服务配置
        if ! grep -q "MICROSERVICE_SC_VERIFIER" "$found_env"; then
            cat >> "$found_env" << EOF

# 合约验证微服务配置 (由 Qitmeer 部署脚本自动添加)
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
    log "等待服务启动..."
    sleep 3
    
    # 检查状态
    if systemctl is-active --quiet smart-contract-verifier; then
        log "✅ 验证服务进程启动成功"
    else
        error "验证服务启动失败，查看日志: journalctl -u smart-contract-verifier -n 50"
    fi
}

# 健康检查
health_check() {
    log "执行健康检查..."
    local retry_count=0
    
    while [ $retry_count -lt $MAX_RETRIES ]; do
        if curl -s "http://localhost:${VERIFIER_PORT}/health" > /dev/null 2>&1; then
            log "✅ 健康检查通过"
            return 0
        fi
        
        retry_count=$((retry_count + 1))
        info "等待服务就绪... ($retry_count/$MAX_RETRIES)"
        sleep 2
    done
    
    error "健康检查失败，服务可能未正常运行"
}

# 验证部署
verify_deployment() {
    log "验证部署..."
    
    # 检查编译器列表
    local versions
    versions=$(curl -s "http://localhost:${VERIFIER_PORT}/api/v1/solidity/versions" 2>/dev/null | head -c 300)
    
    if [[ "$versions" == *"v0.8.19"* ]]; then
        log "✅ Solidity 编译器列表正常 (包含 v0.8.19)"
    else
        warn "编译器列表可能未完全加载，等待自动下载..."
    fi
}

# 显示完成信息
show_completion() {
    echo ""
    echo "=========================================="
    echo -e "${GREEN}✅ Qitmeer Blockscout 验证微服务部署完成!${NC}"
    echo "=========================================="
    echo ""
    echo "服务信息:"
    echo "  - 服务名: smart-contract-verifier"
    echo "  - 监听端口: $VERIFIER_PORT"
    echo "  - 指标端口: $METRICS_PORT"
    echo "  - 安装目录: $INSTALL_DIR"
    echo "  - 版本: $VERIFIER_VERSION"
    echo ""
    echo "管理命令:"
    echo "  查看状态: sudo systemctl status smart-contract-verifier"
    echo "  查看日志: sudo journalctl -u smart-contract-verifier -f"
    echo "  重启服务: sudo systemctl restart smart-contract-verifier"
    echo ""
    echo "测试命令:"
    echo "  健康检查: curl http://localhost:$VERIFIER_PORT/health"
    echo "  编译器列表: curl http://localhost:$VERIFIER_PORT/api/v1/solidity/versions | head -20"
    echo ""
    echo "=========================================="
}

# 卸载函数
uninstall() {
    log "卸载 smart-contract-verifier..."
    
    systemctl stop smart-contract-verifier 2>/dev/null || true
    systemctl disable smart-contract-verifier 2>/dev/null || true
    rm -f /etc/systemd/system/smart-contract-verifier.service
    
    read -p "是否删除安装目录 $INSTALL_DIR? [y/N] " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf "$INSTALL_DIR"
        log "安装目录已删除"
    fi
    
    systemctl daemon-reload
    log "✅ 已卸载"
}

# 主函数
main() {
    log "🚀 Qitmeer Blockscout 验证微服务部署脚本 v2.0"
    log "=========================================="
    
    check_root
    check_system
    check_version      # 新增：版本检查
    install_deps
    create_user
    download_verifier
    create_config
    create_service
    configure_firewall  # 新增：防火墙配置
    configure_blockscout
    start_service
    health_check        # 新增：健康检查
    verify_deployment
    show_completion
}

# 参数处理
case "${1:-}" in
    --uninstall|-u)
        uninstall
        ;;
    --help|-h)
        echo "Qitmeer Blockscout 验证微服务部署脚本"
        echo ""
        echo "用法: $0 [选项]"
        echo ""
        echo "选项:"
        echo "  --uninstall, -u  卸载验证服务"
        echo "  --help, -h       显示帮助"
        echo ""
        echo "示例:"
        echo "  sudo $0                    # 安装/部署"
        echo "  sudo $0 --uninstall        # 卸载"
        exit 0
        ;;
    *)
        main
        ;;
esac
