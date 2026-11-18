#!/bin/bash
# HTTPS 快速配置脚本
# 最简化的 HTTPS 配置流程

set -e

echo "=========================================="
echo " HTTPS 快速配置"
echo "=========================================="
echo ""

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# 检查 root
if [ "$EUID" -ne 0 ]; then
    print_error "请使用 sudo 运行此脚本"
    exit 1
fi

# 配置
DOMAIN="zjsifan.com"
EMAIL=""

echo "步骤 1: 检查域名解析"
echo ""

if ! dig +short www.$DOMAIN | grep -q "42.121.218.14"; then
    print_warning "域名 DNS 解析未正确指向服务器 IP"
    echo ""
    echo "请确保："
    echo "  - www.$DOMAIN 解析到 42.121.218.14"
    echo "  - $DOMAIN 解析到 42.121.218.14"
    echo ""
    read -p "是否继续？(y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    print_success "域名解析正确"
fi

echo ""
echo "步骤 2: 检查 Nginx 和 80 端口"
echo ""

if ! command -v nginx &> /dev/null; then
    print_error "Nginx 未安装"
    echo "正在安装 Nginx..."
    apt-get update -qq
    apt-get install -y nginx
    print_success "Nginx 安装完成"
fi

if ! ss -tuln 2>/dev/null | grep -q ':80.*LISTEN'; then
    print_error "80 端口未监听"
    echo "正在启动 Nginx..."
    service nginx start
    sleep 2

    if ! ss -tuln 2>/dev/null | grep -q ':80.*LISTEN'; then
        print_error "无法启动 Nginx"
        exit 1
    fi
    print_success "Nginx 已启动"
else
    print_success "Nginx 运行正常"
fi

echo ""
echo "步骤 3: 安装 Certbot"
echo ""

if command -v certbot &> /dev/null; then
    print_success "Certbot 已安装"
else
    echo "正在安装 Certbot..."
    apt-get update -qq
    apt-get install -y certbot python3-certbot-nginx
    print_success "Certbot 安装完成"
fi

echo ""
echo "步骤 4: 申请 SSL 证书"
echo ""

read -p "请输入邮箱地址（用于证书提醒）: " EMAIL

if [ -z "$EMAIL" ]; then
    print_error "邮箱地址不能为空"
    exit 1
fi

echo ""
echo "正在申请 SSL 证书..."
echo ""

# 申请证书
if certbot --nginx -d $DOMAIN -d www.$DOMAIN --email $EMAIL --agree-tos --non-interactive; then
    print_success "SSL 证书申请成功"
else
    print_error "SSL 证书申请失败"
    echo ""
    echo "可能原因："
    echo "  1. DNS 解析未生效"
    echo "  2. 阿里云安全组未开放 80/443 端口"
    echo "  3. 防火墙阻止 80 端口"
    echo ""
    echo "请检查后重试"
    exit 1
fi

echo ""
echo "步骤 5: 配置自动续期"
echo ""

# 设置自动续期
(crontab -l 2>/dev/null; echo "0 2 * * * certbot renew --quiet --post-hook 'service nginx reload'") | crontab -

print_success "自动续期已配置（每天凌晨 2 点检查）"

echo ""
echo "步骤 6: 验证配置"
echo ""

sleep 2

if curl -s -o /dev/null -w "%{http_code}" --insecure https://$DOMAIN/ | grep -q "200"; then
    print_success "HTTPS 配置成功！"
else
    print_warning "HTTPS 访问测试失败，请手动检查"
fi

echo ""
echo "=========================================="
echo "  配置完成！"
echo "=========================================="
echo ""
echo "🎉 HTTPS 已配置成功！"
echo ""
echo "访问地址："
echo "  - https://$DOMAIN"
echo "  - https://www.$DOMAIN"
echo ""
echo "浏览器访问时会显示安全图标 🔒"
echo ""
echo "查看证书："
echo "  sudo certbot certificates"
echo ""
echo "续期测试："
echo "  sudo certbot renew --dry-run"
echo ""
echo "如遇问题，查看日志："
echo "  sudo tail -f /var/log/letsencrypt/letsencrypt.log"
echo ""
