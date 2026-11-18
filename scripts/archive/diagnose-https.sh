#!/bin/bash

# ==========================================
# HTTPS 问题快速诊断脚本
# 在服务器上执行此脚本诊断 HTTPS 问题
# ==========================================

echo "=========================================="
echo "HTTPS 问题诊断"
echo "域名: zjsifan.com"
echo "时间: $(date)"
echo "=========================================="
echo ""

SUCCESS_COUNT=0
FAIL_COUNT=0

# 检查函数
check() {
    local name=$1
    local command=$2

    echo -n "检查 $name... "
    if eval "$command" > /dev/null 2>&1; then
        echo "✓ 通过"
        ((SUCCESS_COUNT++))
        return 0
    else
        echo "✗ 失败"
        ((FAIL_COUNT++))
        return 1
    fi
}

# ==========================================
# 1. 证书检查
# ==========================================
echo "=========================================="
echo "1. SSL 证书检查"
echo "=========================================="

if [ -f "/etc/letsencrypt/live/zjsifan.com/fullchain.pem" ]; then
    echo "✓ SSL 证书文件存在"
    echo ""
    echo "证书详情："
    certbot certificates
    echo ""
    ((SUCCESS_COUNT++))
else
    echo "✗ SSL 证书文件不存在"
    ((FAIL_COUNT++))
    echo ""
fi

# ==========================================
# 2. Nginx 配置检查
# ==========================================
echo "=========================================="
echo "2. Nginx 配置检查"
echo "=========================================="

if [ -f "/etc/nginx/conf.d/sifan.conf" ]; then
    echo "✓ Nginx 配置文件存在"
    
    if grep -q "ssl_certificate" /etc/nginx/conf.d/sifan.conf; then
        echo "✓ SSL 证书路径已配置"
        ((SUCCESS_COUNT++))
    else
        echo "✗ SSL 证书路径未配置"
        ((FAIL_COUNT++))
    fi
    
    echo ""
    echo "Nginx 配置测试："
    nginx -t 2>&1 | grep -E "(successful|error)"
    echo ""
else
    echo "✗ Nginx 配置文件不存在"
    ((FAIL_COUNT++))
    echo ""
fi

# ==========================================
# 3. 端口检查
# ==========================================
echo "=========================================="
echo "3. 端口监听检查"
echo "=========================================="

echo "端口监听状态："
netstat -tuln | grep -E ':(80|443|5000)' || echo "未找到相关端口"
echo ""

if netstat -tuln | grep -q ":80 "; then
    echo "✓ 80 端口已监听"
    ((SUCCESS_COUNT++))
else
    echo "✗ 80 端口未监听"
    ((FAIL_COUNT++))
fi

if netstat -tuln | grep -q ":443 "; then
    echo "✓ 443 端口已监听"
    ((SUCCESS_COUNT++))
else
    echo "✗ 443 端口未监听"
    ((FAIL_COUNT++))
fi

if netstat -tuln | grep -q ":5000 "; then
    echo "✓ 5000 端口已监听（Next.js）"
    ((SUCCESS_COUNT++))
else
    echo "✗ 5000 端口未监听（Next.js）"
    ((FAIL_COUNT++))
fi

echo ""

# ==========================================
# 4. DNS 解析检查
# ==========================================
echo "=========================================="
echo "4. DNS 解析检查"
echo "=========================================="

DOMAIN="zjsifan.com"

if command -v dig &> /dev/null; then
    DNS_IP=$(dig +short $DOMAIN | head -1)
    SERVER_IP=$(hostname -I | awk '{print $1}')
    
    echo "DNS 解析: $DOMAIN → $DNS_IP"
    echo "服务器 IP: $SERVER_IP"
    echo ""
    
    if [ "$DNS_IP" = "$SERVER_IP" ]; then
        echo "✓ DNS 解析正确"
        ((SUCCESS_COUNT++))
    else
        echo "✗ DNS 解析不匹配"
        ((FAIL_COUNT++))
    fi
else
    echo "⚠ 无法检查 DNS 解析（dig 命令不存在）"
    echo ""
fi

# ==========================================
# 5. HTTPS 连接测试
# ==========================================
echo "=========================================="
echo "5. HTTPS 连接测试"
echo "=========================================="

echo "测试 HTTP (80端口):"
curl -I --connect-timeout 5 http://$DOMAIN 2>&1 | head -2
echo ""

echo "测试 HTTPS (443端口):"
curl -I --connect-timeout 5 https://$DOMAIN 2>&1 | head -2
echo ""

if curl -I --connect-timeout 5 https://$DOMAIN > /dev/null 2>&1; then
    echo "✓ HTTPS 连接成功"
    ((SUCCESS_COUNT++))
else
    echo "✗ HTTPS 连接失败"
    ((FAIL_COUNT++))
fi

# ==========================================
# 6. Nginx 服务状态
# ==========================================
echo "=========================================="
echo "6. Nginx 服务状态"
echo "=========================================="

if systemctl is-active --quiet nginx; then
    echo "✓ Nginx 服务运行中"
    systemctl status nginx --no-pager -l | grep -E "(Active|Loaded)" | head -2
    ((SUCCESS_COUNT++))
else
    echo "✗ Nginx 服务未运行"
    ((FAIL_COUNT++))
fi
echo ""

# ==========================================
# 7. PM2 服务状态
# ==========================================
echo "=========================================="
echo "7. PM2 服务状态"
echo "=========================================="

if command -v pm2 &> /dev/null; then
    pm2 list
    echo ""
    
    if pm2 list | grep -q "enterprise-website"; then
        if pm2 list | grep "enterprise-website" | grep -q "online"; then
            echo "✓ PM2 服务运行中"
            ((SUCCESS_COUNT++))
        else
            echo "✗ PM2 服务未运行"
            ((FAIL_COUNT++))
        fi
    else
        echo "⚠ 未找到 enterprise-website 服务"
        ((FAIL_COUNT++))
    fi
else
    echo "⚠ PM2 未安装"
    echo ""
fi

# ==========================================
# 8. 防火墙检查
# ==========================================
echo "=========================================="
echo "8. 防火墙检查"
echo "=========================================="

if command -v ufw &> /dev/null; then
    echo "UFW 状态："
    ufw status | head -10
    echo ""
fi

if command -v firewall-cmd &> /dev/null; then
    echo "firewalld 状态："
    firewall-cmd --list-all | grep -E "(public|services|ports)"
    echo ""
fi

# ==========================================
# 9. Nginx 错误日志
# ==========================================
echo "=========================================="
echo "9. Nginx 错误日志（最近 10 行）"
echo "=========================================="

if [ -f "/var/log/nginx/error.log" ]; then
    tail -10 /var/log/nginx/error.log
else
    echo "Nginx 错误日志文件不存在"
fi
echo ""

# ==========================================
# 总结
# ==========================================
echo "=========================================="
echo "诊断总结"
echo "=========================================="
echo "通过: $SUCCESS_COUNT 项"
echo "失败: $FAIL_COUNT 项"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo "✓ 所有检查通过！HTTPS 配置正常"
    echo ""
    echo "访问网站："
    echo "  https://$DOMAIN"
    echo "  https://www.$DOMAIN"
    exit 0
else
    echo "✗ 发现 $FAIL_COUNT 个问题"
    echo ""
    echo "推荐解决方案："
    echo ""
    echo "1. 一键修复（推荐）："
    echo "   chmod +x quick-https-install.sh"
    echo "   ./quick-https-install.sh"
    echo ""
    echo "2. 手动修复（参考文档）："
    echo "   HTTPS-FULL-SOLUTION.md"
    echo ""
    exit 1
fi
