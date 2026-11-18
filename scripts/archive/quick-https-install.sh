#!/bin/bash

# ==========================================
# HTTPS/SSL 证书一键安装脚本
# 在服务器上直接执行此脚本即可
# ==========================================

set -e

echo "=========================================="
echo "HTTPS/SSL 证书一键安装"
echo "域名: zjsifan.com"
echo "时间: $(date)"
echo "=========================================="
echo ""

# 检测系统
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
    echo "操作系统: $OS $VERSION_ID"
else
    echo "✗ 无法检测操作系统"
    exit 1
fi

# ==========================================
# 步骤 1: 安装 certbot 和 nginx
# ==========================================
echo "[步骤 1/5] 安装 certbot 和 nginx..."

if command -v certbot &> /dev/null; then
    echo "✓ certbot 已安装"
else
    echo "正在安装 certbot..."
    if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
        apt-get update -qq
        apt-get install -y certbot python3-certbot-nginx
    else
        yum install -y epel-release
        yum install -y certbot python3-certbot-nginx
    fi
    echo "✓ certbot 安装完成"
fi

if command -v nginx &> /dev/null; then
    echo "✓ nginx 已安装"
else
    echo "正在安装 nginx..."
    if [ "$OS" = "ubuntu" ] || [ "$OS" = "debian" ]; then
        apt-get install -y nginx
    else
        yum install -y nginx
    fi
    echo "✓ nginx 安装完成"
fi

# ==========================================
# 步骤 2: 检查 DNS 解析
# ==========================================
echo ""
echo "[步骤 2/5] 检查 DNS 解析..."

DOMAIN="zjsifan.com"
if command -v dig &> /dev/null; then
    DNS_IP=$(dig +short $DOMAIN | head -1)
    SERVER_IP=$(hostname -I | awk '{print $1}')
    echo "DNS 解析: $DOMAIN → $DNS_IP"
    echo "服务器 IP: $SERVER_IP"
    
    if [ "$DNS_IP" = "$SERVER_IP" ]; then
        echo "✓ DNS 解析正确"
    else
        echo "⚠ DNS 解析不匹配，可能需要等待"
    fi
else
    echo "⚠ 无法检查 DNS 解析（dig 命令不存在）"
fi

# ==========================================
# 步骤 3: 申请 SSL 证书
# ==========================================
echo ""
echo "[步骤 3/5] 申请 SSL 证书..."

# 检查证书是否已存在
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo "✓ SSL 证书已存在"
    certbot certificates
else
    echo "正在申请 SSL 证书..."
    
    # 停止占用 80 端口的服务
    echo "停止 nginx..."
    systemctl stop nginx 2>/dev/null || true
    
    # 检查 5000 端口是否被 PM2 管理
    if command -v pm2 &> /dev/null; then
        echo "PM2 状态："
        pm2 list
    fi
    
    # 申请证书（使用 standalone 模式）
    certbot certonly --standalone \
        -d $DOMAIN \
        -d www.$DOMAIN \
        --non-interactive \
        --agree-tos \
        --email admin@$DOMAIN || {
        echo ""
        echo "✗ SSL 证书申请失败"
        echo "可能的原因："
        echo "1. DNS 解析未生效（等待 5-10 分钟后重试）"
        echo "2. 80 端口被其他服务占用"
        echo "3. 防火墙阻止了 80 端口"
        echo ""
        echo "请检查后重新运行脚本"
        systemctl start nginx 2>/dev/null || true
        exit 1
    }
    
    echo "✓ SSL 证书申请成功"
fi

# ==========================================
# 步骤 4: 配置 Nginx
# ==========================================
echo ""
echo "[步骤 4/5] 配置 Nginx..."

    # 检查 Next.js 是否在 3000 端口运行
if netstat -tuln | grep -q ":3000"; then
    echo "✓ Next.js 在 3000 端口运行"
else
    echo "⚠ Next.js 未在 3000 端口运行"
    echo "尝试启动 PM2 服务..."
    if pm2 list | grep -q "enterprise-website"; then
        pm2 restart enterprise-website
        echo "✓ PM2 服务已重启"
    fi
fi

# 创建 Nginx 配置
cat > /etc/nginx/conf.d/sifan.conf << 'EOF'
# HTTP 重定向到 HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name zjsifan.com www.zjsifan.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS 配置
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name zjsifan.com www.zjsifan.com;

    # SSL 证书
    ssl_certificate /etc/letsencrypt/live/zjsifan.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/zjsifan.com/privkey.pem;

    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 日志
    access_log /var/log/nginx/sifan-access.log;
    error_log /var/log/nginx/sifan-error.log;

    # 反向代理到 Next.js (端口 3000)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # 超时配置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# 删除默认配置
rm -f /etc/nginx/conf.d/default.conf 2>/dev/null || true

# 测试 Nginx 配置
echo "测试 Nginx 配置..."
nginx -t || {
    echo "✗ Nginx 配置测试失败"
    exit 1
}

# 启动并启用 Nginx
systemctl enable nginx
systemctl restart nginx

echo "✓ Nginx 已配置并启动"

# ==========================================
# 步骤 5: 配置自动续期
# ==========================================
echo ""
echo "[步骤 5/5] 配置证书自动续期..."

# 添加自动续期任务
(crontab -l 2>/dev/null | grep -v "certbot renew"; \
echo "0 3 * * * certbot renew --quiet --nginx && systemctl reload nginx") | crontab -

echo "✓ 自动续期任务已配置（每天凌晨 3 点）"

# ==========================================
# 验证安装
# ==========================================
echo ""
echo "=========================================="
echo "SSL 证书安装完成！"
echo "=========================================="
echo ""
echo "证书信息："
certbot certificates
echo ""
echo "端口监听状态："
netstat -tuln | grep -E ':(80|443)'
echo ""
echo "测试 HTTPS 连接："
curl -I https://$DOMAIN 2>&1 | head -5
echo ""
echo "=========================================="
echo "访问网站："
echo "  https://$DOMAIN"
echo "  https://www.$DOMAIN"
echo "=========================================="
echo ""
echo "✓ HTTPS 配置完成！"
echo ""
