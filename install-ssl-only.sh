#!/bin/bash

# ==========================================
# SSL 证书安装脚本（仅安装 SSL，不依赖 GitHub）
# 在服务器上执行此脚本
# ==========================================

set -e

echo "=========================================="
echo "安装 SSL 证书（Let's Encrypt）"
echo "时间: $(date)"
echo "=========================================="

# 检测系统版本
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    echo "无法检测操作系统版本"
    exit 1
fi

# ==========================================
# 步骤 1: 安装 certbot 和 nginx
# ==========================================
echo ""
echo "步骤 1: 安装 certbot 和 nginx"
echo "----------------------------------------"

case $OS in
    ubuntu|debian)
        if ! command -v certbot &> /dev/null; then
            echo "安装 certbot..."
            apt-get update
            apt-get install -y certbot python3-certbot-nginx
        fi
        if ! command -v nginx &> /dev/null; then
            echo "安装 nginx..."
            apt-get install -y nginx
        fi
        ;;
    centos|rhel|rocky|almalinux)
        if ! command -v certbot &> /dev/null; then
            echo "安装 epel-release 和 certbot..."
            yum install -y epel-release
            yum install -y certbot python3-certbot-nginx
        fi
        if ! command -v nginx &> /dev/null; then
            echo "安装 nginx..."
            yum install -y nginx
        fi
        ;;
    *)
        echo "不支持的操作系统: $OS"
        exit 1
        ;;
esac

echo "✓ certbot 和 nginx 已安装"

# ==========================================
# 步骤 2: 检查 DNS 解析
# ==========================================
echo ""
echo "步骤 2: 检查 DNS 解析"
echo "----------------------------------------"

DOMAIN="zjsifan.com"
SERVER_IP=$(hostname -I | awk '{print $1}')

echo "服务器 IP: $SERVER_IP"

# 检查域名解析
if command -v dig &> /dev/null; then
    DNS_IP=$(dig +short $DOMAIN | head -1)
    if [ "$DNS_IP" == "$SERVER_IP" ]; then
        echo "✓ DNS 解析正确: $DOMAIN → $DNS_IP"
    else
        echo "⚠ DNS 解析不匹配: $DOMAIN → $DNS_IP (服务器: $SERVER_IP)"
    fi
else
    echo "无法检查 DNS 解析（dig 命令不存在）"
fi

# ==========================================
# 步骤 3: 申请 SSL 证书
# ==========================================
echo ""
echo "步骤 3: 申请 SSL 证书"
echo "----------------------------------------"

# 检查证书是否已存在
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo "SSL 证书已存在"
    certbot certificates
else
    echo "申请 SSL 证书..."

    # 停止 nginx 以释放 80 端口
    systemctl stop nginx 2>/dev/null || true

    # 检查 80 端口是否被占用
    if netstat -tuln | grep -q ":80 "; then
        echo "⚠ 80 端口被占用，尝试清理..."
        # 检查是否有服务占用 80 端口
        PID=$(lsof -ti :80 2>/dev/null || echo "")
        if [ -n "$PID" ]; then
            echo "停止占用 80 端口的进程: $PID"
            kill -9 $PID 2>/dev/null || true
        fi
        sleep 2
    fi

    # 申请证书
    certbot certonly --standalone \
        -d $DOMAIN \
        -d www.$DOMAIN \
        --non-interactive \
        --agree-tos \
        --email admin@$DOMAIN || {
        echo "✗ SSL 证书申请失败"
        systemctl start nginx 2>/dev/null || true
        exit 1
    }

    echo "✓ SSL 证书申请成功"
fi

# ==========================================
# 步骤 4: 配置 Nginx
# ==========================================
echo ""
echo "步骤 4: 配置 Nginx"
echo "----------------------------------------"

# 检查 Next.js 是否在 5000 端口运行
if netstat -tuln | grep -q ":5000"; then
    echo "✓ Next.js 在 5000 端口运行"
else
    echo "⚠ Next.js 未在 5000 端口运行"
    read -p "是否继续配置 Nginx？(y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# 创建 Nginx 配置
cat > /etc/nginx/conf.d/sifan.conf << EOF
# HTTP 重定向到 HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

# HTTPS 配置
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    # SSL 证书
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 日志
    access_log /var/log/nginx/sifan-access.log;
    error_log /var/log/nginx/sifan-error.log;

    # 反向代理到 Next.js (端口 5000)
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;

        # 超时配置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# 删除默认配置
rm -f /etc/nginx/conf.d/default.conf

# 测试配置
nginx -t

# 启动并启用 nginx
systemctl enable nginx
systemctl restart nginx

echo "✓ Nginx 已配置并启动"

# ==========================================
# 步骤 5: 配置自动续期
# ==========================================
echo ""
echo "步骤 5: 配置自动续期"
echo "----------------------------------------"

# 添加自动续期任务
(crontab -l 2>/dev/null | grep -v "certbot renew"; \
echo "0 3 * * * certbot renew --quiet --nginx && systemctl reload nginx") | crontab -

echo "✓ 自动续期任务已配置 (每天凌晨 3 点)"

# ==========================================
# 步骤 6: 验证安装
# ==========================================
echo ""
echo "步骤 6: 验证安装"
echo "----------------------------------------"

echo ""
echo "证书信息："
certbot certificates

echo ""
echo "端口监听状态："
netstat -tuln | grep -E ':(80|443)'

echo ""
echo "测试 HTTPS："
curl -I https://$DOMAIN 2>&1 | head -5

echo ""
echo "=========================================="
echo "SSL 证书安装完成！"
echo "=========================================="
echo ""
echo "访问网站："
echo "  https://$DOMAIN"
echo "  https://www.$DOMAIN"
echo ""
echo "浏览器地址栏应显示锁形图标"
