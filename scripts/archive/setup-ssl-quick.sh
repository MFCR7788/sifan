#!/bin/bash

# ==========================================
# 快速 SSL 证书配置脚本（在本地执行，通过 SSH 操作服务器）
# ==========================================

SERVER_HOST="42.121.218.14"
SERVER_USER="root"
DOMAIN="zjsifan.com"

echo "=========================================="
echo "快速配置 SSL 证书"
echo "时间: $(date)"
echo "=========================================="

ssh root@${SERVER_HOST} << 'ENDSSH'
set -e

echo "步骤 1: 检查并安装 certbot"
echo "----------------------------------------"
if ! command -v certbot &> /dev/null; then
    echo "安装 certbot..."
    yum install -y epel-release || apt-get update && apt-get install -y certbot
    yum install -y certbot python3-certbot-nginx || apt-get install -y certbot python3-certbot-nginx
else
    echo "✓ certbot 已安装"
fi

echo ""
echo "步骤 2: 检查 Nginx"
echo "----------------------------------------"
if ! command -v nginx &> /dev/null; then
    echo "安装 Nginx..."
    yum install -y nginx || apt-get install -y nginx
fi

# 检查 Nginx 状态
if ! systemctl is-active --quiet nginx; then
    echo "启动 Nginx..."
    systemctl start nginx
fi

echo ""
echo "步骤 3: 配置 Nginx（HTTP）"
echo "----------------------------------------"

# 创建基础配置
cat > /etc/nginx/conf.d/sifan-ssl.conf << 'NGINXEOF'
server {
    listen 80;
    listen [::]:80;
    server_name zjsifan.com www.zjsifan.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINXEOF

# 测试并重启 Nginx
nginx -t
systemctl reload nginx

echo ""
echo "步骤 4: 申请 SSL 证书"
echo "----------------------------------------"

# 暂时停止 Nginx，使用 standalone 模式
systemctl stop nginx

# 申请证书
certbot certonly --standalone -d zjsifan.com -d www.zjsifan.com --non-interactive --agree-tos --email admin@zjsifan.com || {
    echo "证书申请失败，可能是 DNS 未解析或端口被占用"
    systemctl start nginx
    exit 1
}

# 重启 Nginx
systemctl start nginx

echo ""
echo "步骤 5: 配置 HTTPS"
echo "----------------------------------------"

cat > /etc/nginx/conf.d/sifan-ssl.conf << 'NGINXEOF'
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
    ssl_prefer_server_certs on;

    # 反向代理
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
NGINXEOF

# 测试并重启
nginx -t
systemctl reload nginx

echo ""
echo "步骤 6: 设置自动续期"
echo "----------------------------------------"
(crontab -l 2>/dev/null | grep -v "certbot renew"; echo "0 3 * * * certbot renew --quiet --nginx && systemctl reload nginx") | crontab -

echo "✓ 自动续期已配置 (每天凌晨 3 点)"

echo ""
echo "=========================================="
echo "SSL 证书配置完成！"
echo "=========================================="
echo ""
echo "证书信息："
certbot certificates 2>/dev/null || echo "无法读取证书信息"

echo ""
echo "访问测试："
curl -I https://zjsifan.com 2>&1 | head -3

ENDSSH

echo ""
echo "=========================================="
echo "SSL 证书已配置完成"
echo "=========================================="
echo ""
echo "现在可以访问："
echo "  https://zjsifan.com"
echo "  https://www.zjsifan.com"
echo ""
echo "浏览器应该显示安全连接（锁形图标）"
