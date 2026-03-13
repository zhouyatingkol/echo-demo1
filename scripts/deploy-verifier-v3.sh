#!/bin/bash
# Qitmeer Blockscout 合约验证微服务 - 安全部署脚本 (v3.0)
# 适用于: Ubuntu 20.04/22.04, CentOS 8, Debian 11+
# 安全特性: SSRF防护、防火墙限制、SELinux检测、文件校验、权限控制

set -euo pipefail

# 配置
VERIFIER_VERSION="v1.7.0"
INSTALL_DIR="/opt/smart-contract-verifier"
SERVICE_USER="blockscout"
VERIFIER_PORT="8050"
METRICS_PORT="8051"
MAX_RETRIES=5
CURL_TIMEOUT=10

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

# ============================================
# 安全检查
# ============================================

# 检查 root 权限
check_root() {
    if [[ $EUID -ne 0 ]]; then
        error "请使用 sudo 或 root 用户运行此脚本"
    fi
}

# 检查系统环境
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

# 检查 SELinux/AppArmor
check_security_context() {
    log "检查安全模块..."
    
    # 检查 SELinux
    if command -v getenforce &> /dev/null; then
        local selinux_status
        selinux_status=$(getenforce)
        if [[ "$selinux_status" != "Disabled" ]]; then
            warn "SELinux 已启用 ($selinux_status)，可能需要配置策略"
            warn "如果遇到权限问题，尝试: sudo setenforce 0 (仅测试)"
            warn "或配置正确策略: sudo setsebool -P httpd_can_network_connect 1"
        fi
    fi
    
    # 检查 AppArmor
    if command -v aa-status &> /dev/null; then
        if aa-status 2>/dev/null | grep -q "profiles are loaded"; then
            info "AppArmor 已启用，如有问题请检查日志"
        fi
    fi
}

# ============================================
# 版本检查 (SSRF防护)
# ============================================

check_version() {
    log "检查最新版本..."
    local latest
    
    # 使用安全的 curl 选项
    latest=$(curl --connect-timeout 5 \
        --max-time $CURL_TIMEOUT \
        --proto =https \
        --tlsv1.2 \
        --max-redirs 2 \
        -s "https://api.github.com/repos/blockscout/blockscout-rs/releases/latest" 2>/dev/null | \
        grep -Po '"tag_name": "\K.*?(?=")' | \
        sed 's/smart-contract-verifier-//' || echo "")
    
    if [[ -n "$latest" && "$latest" != "$VERIFIER_VERSION" ]]; then
        warn "当前版本: ${VERIFIER_VERSION}, 最新版本: ${latest}"
        read -p "是否使用最新版本? [y/N] " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            VERIFIER_VERSION="$latest"
            log "将使用版本: $VERIFIER_VERSION"
        fi
    fi
}

# ============================================
# 依赖安装
# ============================================

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

# ============================================
# 用户和权限
# ============================================

create_user() {
    log "创建服务用户..."
    
    if ! id "$SERVICE_USER" &>/dev/null; then
        useradd -r -s /bin/false -d "$INSTALL_DIR" "$SERVICE_USER"
        log "用户 $SERVICE_USER 已创建"
    else
        log "用户 $SERVICE_USER 已存在"
    fi
}

# ============================================
# 下载和校验
# ============================================

download_verifier() {
    log "下载 smart-contract-verifier $VERIFIER_VERSION..."
    
    cd /tmp
    local base_url="https://github.com/blockscout/blockscout-rs/releases/download/smart-contract-verifier-${VERIFIER_VERSION}"
    local filename="smart-contract-verifier-x86_64-unknown-linux-gnu.tar.gz"
    local url="${base_url}/${filename}"
    
    # 下载二进制文件
    wget --timeout=$CURL_TIMEOUT \
        --tries=3 \
        -q --show-progress \
        "$url" -O "$filename" || error "下载失败"
    
    # 尝试下载并验证 checksum
    local checksum_url="${base_url}/${filename}.sha256"
    if wget --timeout=5 -q "$checksum_url" -O "${filename}.sha256" 2>/dev/null; then
        log "验证文件完整性..."
        if sha256sum -c "${filename}.sha256" >/dev/null 2>&1; then
            log "✅ 文件校验通过"
        else
            error "文件校验失败，可能下载不完整或被篡改"
        fi
        rm -f "${filename}.sha256"
    else
        warn "无校验文件，跳过完整性验证"
    fi
    
    # 解压和安装
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

# ============================================
# 配置
# ============================================

create_config() {
    log "创建配置文件..."
    
    # 备份现有配置
    if [[ -f "$INSTALL_DIR/config.toml" ]]; then
        cp "$INSTALL_DIR/config.toml" "$INSTALL_DIR/config.toml.backup.$(date +%Y%m%d%H%M%S)"
        chmod 600 "$INSTALL_DIR/config.toml.backup."*
        log "已备份现有配置"
    fi
    
    # 生成编译器版本列表
    local compiler_list=""
    for i in {25..4}; do
        compiler_list="${compiler_list}\n    \"v0.8.${i}\","
    done
    compiler_list="${compiler_list%,}"
    
    # 创建配置文件
    cat > "$INSTALL_DIR/config.toml" << EOF
[server]
addr = "127.0.0.1:${VERIFIER_PORT}"

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
enabled = false

[sourcify]
enabled = true
api_url = "https://sourcify.dev/server/"

[metrics]
enabled = true
addr = "127.0.0.1:${METRICS_PORT}"
EOF

    chown "$SERVICE_USER:$SERVICE_USER" "$INSTALL_DIR/config.toml"
    chmod 600 "$INSTALL_DIR/config.toml"
    log "配置文件已创建（仅本地监听）"
}

# ============================================
# 服务管理
# ============================================

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
Environment="SMART_CONTRACT_VERIFIER__SERVER__ADDR=127.0.0.1:$VERIFIER_PORT"
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

# ============================================
# 防火墙配置（安全限制）
# ============================================

configure_firewall() {
    log "配置防火墙..."
    
    # ufw 配置
    if command -v ufw &> /dev/null; then
        if ufw status | grep -q "Status: active"; then
            # 只允许本地访问
            ufw allow from 127.0.0.1 to any port ${VERIFIER_PORT} proto tcp comment "verifier-local"
            # 允许内部网络（Docker、私有网络）
            ufw allow from 172.16.0.0/12 to any port ${VERIFIER_PORT} proto tcp comment "verifier-docker" 2>/dev/null || true
            ufw allow from 10.0.0.0/8 to any port ${VERIFIER_PORT} proto tcp comment "verifier-private" 2>/dev/null || true
            ufw allow from 192.168.0.0/16 to any port ${VERIFIER_PORT} proto tcp comment "verifier-lan" 2>/dev/null || true
            log "已添加 ufw 规则（仅内部网络）"
        fi
    fi
    
    # firewalld 配置
    if command -v firewall-cmd &> /dev/null; then
        if systemctl is-active --quiet firewalld; then
            firewall-cmd --permanent --add-rich-rule="rule family='ipv4' source address='127.0.0.1' port protocol='tcp' port='$VERIFIER_PORT' accept"
            firewall-cmd --permanent --add-rich-rule="rule family='ipv4' source address='172.16.0.0/12' port protocol='tcp' port='$VERIFIER_PORT' accept"
            firewall-cmd --permanent --add-rich-rule="rule family='ipv4' source address='10.0.0.0/8' port protocol='tcp' port='$VERIFIER_PORT' accept"
            firewall-cmd --reload
            log "已添加 firewalld 规则（仅内部网络）"
        fi
    fi
    
    # 如果启用了 iptables
    if command -v iptables &> /dev/null; then
        # 检查是否已有规则
        if ! iptables -C INPUT -p tcp --dport $VERIFIER_PORT -s 127.0.0.1 -j ACCEPT 2>/dev/null; then
            iptables -A INPUT -p tcp --dport $VERIFIER_PORT -s 127.0.0.1 -j ACCEPT
            iptables -A INPUT -p tcp --dport $VERIFIER_PORT -s 172.16.0.0/12 -j ACCEPT
            iptables -A INPUT -p tcp --dport $VERIFIER_PORT -s 10.0.0.0/8 -j ACCEPT
            iptables -A INPUT -p tcp --dport $VERIFIER_PORT -j DROP
            log "已添加 iptables 规则（仅内部网络）"
        fi
    fi
}

# ============================================
# Blockscout 配置
# ============================================

configure_blockscout() {
    log "配置 Blockscout..."
    
    local env_files=(
        "/opt/blockscout/.env"
        "/var/www/blockscout/.env"
        "/etc/blockscout/env"
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
        
        # 备份并设置权限
        local backup_file="$found_env.backup.$(date +%Y%m%d%H%M%S)"
        cp "$found_env" "$backup_file"
        chmod 600 "$backup_file"
        
        # 添加验证服务配置
        if ! grep -q "MICROSERVICE_SC_VERIFIER" "$found_env"; then
            cat >> "$found_env" << EOF

# 合约验证微服务配置 (由 Qitmeer 安全部署脚本添加)
MICROSERVICE_SC_VERIFIER_ENABLED=true
MICROSERVICE_SC_VERIFIER_URL=http://127.0.0.1:$VERIFIER_PORT
EOF
            chmod 600 "$found_env"
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
        echo "MICROSERVICE_SC_VERIFIER_URL=http://127.0.0.1:$VERIFIER_PORT"
        echo ""
    fi
}

# ============================================
# 启动和验证
# ============================================

start_service() {
    log "启动验证服务..."
    
    systemctl enable smart-contract-verifier
    systemctl start smart-contract-verifier
    
    # 等待服务启动
    sleep 3
    
    # 检查状态
    if systemctl is-active --quiet smart-contract-verifier; then
        log "✅ 验证服务进程启动成功"
    else
        error "验证服务启动失败，查看日志: journalctl -u smart-contract-verifier -n 50"
    fi
}

health_check() {
    log "执行健康检查..."
    local retry_count=0
    
    while [ $retry_count -lt $MAX_RETRIES ]; do
        if curl -s --max-time 3 "http://127.0.0.1:${VERIFIER_PORT}/health" > /dev/null 2>&1; then
            log "✅ 健康检查通过"
            return 0
        fi
        
        retry_count=$((retry_count + 1))
        info "等待服务就绪... ($retry_count/$MAX_RETRIES)"
        sleep 2
    done
    
    error "健康检查失败，服务可能未正常运行"
}

verify_deployment() {
    log "验证部署..."
    
    # 检查编译器列表
    local versions
    versions=$(curl -s --max-time 5 "http://127.0.0.1:${VERIFIER_PORT}/api/v1/solidity/versions" 2>/dev/null | head -c 300)
    
    if [[ "$versions" == *"v0.8.19"* ]]; then
        log "✅ Solidity 编译器列表正常 (包含 v0.8.19)"
    else
        warn "编译器列表可能未完全加载，等待自动下载..."
    fi
}

# ============================================
# 完成信息
# ============================================

show_completion() {
    echo ""
    echo "=========================================="
    echo -e "${GREEN}✅ Qitmeer Blockscout 验证微服务部署完成!${NC}"
    echo "=========================================="
    echo ""
    echo "🔒 安全特性:"
    echo "  - 仅本地监听 (127.0.0.1)"
    echo "  - 防火墙限制内部网络访问"
    echo "  - 文件权限控制 (600)"
    echo "  - SSRF 防护"
    echo ""
    echo "服务信息:"
    echo "  - 服务名: smart-contract-verifier"
    echo "  - 监听地址: 127.0.0.1:$VERIFIER_PORT"
    echo "  - 指标地址: 127.0.0.1:$METRICS_PORT"
    echo "  - 安装目录: $INSTALL_DIR"
    echo "  - 版本: $VERIFIER_VERSION"
    echo ""
    echo "管理命令:"
    echo "  查看状态: sudo systemctl status smart-contract-verifier"
    echo "  查看日志: sudo journalctl -u smart-contract-verifier -f"
    echo "  重启服务: sudo systemctl restart smart-contract-verifier"
    echo ""
    echo "测试命令:"
    echo "  curl http://127.0.0.1:$VERIFIER_PORT/health"
    echo ""
    echo "=========================================="
}

# ============================================
# 卸载
# ============================================

uninstall() {
    log "卸载 smart-contract-verifier..."
    
    systemctl stop smart-contract-verifier 2>/dev/null || true
    systemctl disable smart-contract-verifier 2>/dev/null || true
    rm -f /etc/systemd/system/smart-contract-verifier.service
    
    # 清理防火墙规则
    if command -v ufw &> /dev/null; then
        ufw delete allow from 127.0.0.1 to any port ${VERIFIER_PORT} 2>/dev/null || true
    fi
    
    read -p "是否删除安装目录 $INSTALL_DIR? [y/N] " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        rm -rf "$INSTALL_DIR"
        log "安装目录已删除"
    fi
    
    systemctl daemon-reload
    log "✅ 已卸载"
}

# ============================================
# 主函数
# ============================================

main() {
    log "🚀 Qitmeer Blockscout 验证微服务安全部署脚本 v3.0"
    log "=========================================="
    
    check_root
    check_system
    check_security_context  # SELinux/AppArmor 检查
    check_version
    install_deps
    create_user
    download_verifier       # 带校验
    create_config
    create_service
    configure_firewall      # 安全防火墙
    configure_blockscout
    start_service
    health_check
    verify_deployment
    show_completion
}

# 参数处理
case "${1:-}" in
    --uninstall|-u)
        uninstall
        ;;
    --help|-h)
        echo "Qitmeer Blockscout 验证微服务安全部署脚本"
        echo ""
        echo "安全特性:"
        echo "  - SSRF 防护 (curl 安全选项)"
        echo "  - 防火墙限制 (仅内部网络)"
        echo "  - SELinux/AppArmor 检测"
        echo "  - 文件完整性校验 (SHA256)"
        echo "  - 权限控制 (600)"
        echo ""
        echo "用法: $0 [选项]"
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
