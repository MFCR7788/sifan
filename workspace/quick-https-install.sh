#!/bin/bash

echo "=== HTTPS 快速安装脚本 ==="
echo "此脚本将自动安装 SSL 证书并配置 Nginx HTTPS 访问"
echo ""

# 检查是否为 root 用户
if [ "$EUID" -ne 0 ]; then 
    echo "请使用 root 权限运行此脚本"
    exit 1
fi

echo "1. 安装 Certbot 和 Nginx 插件"
if command -v yum &> /dev/null; then
    yum install -y certbot python3-certbot-nginx
elif command -v apt &> /dev/null; then
    apt install -y certbot python3-certbot-nginx
else
    echo "不支持的包管理器"
    exit 1
fi

echo ""
echo "2. 停止 Nginx 服务"
systemctl stop nginx

echo ""
echo "3. 申请 SSL 证书"
read -p "请输入你的域名 (例如: example.com): " DOMAIN
read -p "请输入你的邮箱 (用于证书通知): " EMAIL

certbot certonly --standalone \
    -d $DOMAIN \
    -d www.$DOMAIN \
    --non-interactive \
    --agree-tos \
    --email $EMAIL

if [ $? -ne 0 ]; then
    echo "SSL 证书申请失败"
    exit 1
fi

echo ""
echo "4. 配置 Nginx"
cat > /etc/nginx/conf.d/$DOMAIN.conf <<EOF
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

    # 反向代理到 Next.js (默认 3000 端口)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

echo ""
echo "5. 测试 Nginx 配置"
nginx -t

if [ $? -ne 0 ]; then
    echo "Nginx 配置测试失败"
    exit 1
fi

echo ""
echo "6. 重启 Nginx"
systemctl restart nginx

echo ""
echo "7. 检查服务状态"
systemctl status nginx --no-pager

echo ""
echo "8. 查看证书信息"
certbot certificates

echo ""
echo "=== 安装完成！==="
echo "HTTPS 访问地址: https://$DOMAIN"
echo "HTTPS 访问地址: https://www.$DOMAIN"
echo ""
echo "注意事项:"
echo "- SSL 证书已配置自动续期"
echo "- 请确保 Next.js 应用运行在 3000 端口"
echo "- 如果应用运行在其他端口，请修改 /etc/nginx/conf.d/$DOMAIN.conf 中的 proxy_pass"
