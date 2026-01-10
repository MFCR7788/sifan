#!/bin/bash
# Nginx配置修复脚本
# 修复Next.js端口配置并启动Nginx

set -e

echo "=========================================="
echo " Nginx 配置修复脚本"
echo "=========================================="
echo ""

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then
    echo "请使用 sudo 运行此脚本"
    exit 1
fi

# 1. 检查Next.js实际运行端口
echo "步骤 1: 检查 Next.js 运行端口..."
NEXTJS_PORT=$(ss -tlnp 2>/dev/null | grep -oP ':(\d+)' | grep -E '^(3000|5000|4000)' | head -1 || echo "5000")
echo "✓ Next.js 运行在端口: $NEXTJS_PORT"
echo ""

# 2. 检查Nginx是否安装
echo "步骤 2: 检查 Nginx 安装状态..."
if ! command -v nginx &> /dev/null; then
    echo "⚠ Nginx 未安装，正在安装..."
    apt-get update -qq
    apt-get install -y nginx
else
    echo "✓ Nginx 已安装"
fi
echo ""

# 3. 创建修复后的Nginx配置
echo "步骤 3: 更新 Nginx 配置文件..."

NGINX_CONF="/etc/nginx/sites-available/enterprise-website"
NGINX_ENABLED="/etc/nginx/sites-enabled/enterprise-website"

# 备份现有配置
if [ -f "$NGINX_CONF" ]; then
    cp "$NGINX_CONF" "${NGINX_CONF}.backup.$(date +%Y%m%d_%H%M%S)"
    echo "✓ 已备份现有配置"
fi

# 创建新配置
cat > "$NGINX_CONF" << 'EOF'
# Nginx 配置文件
# 上游服务器配置 - 指向Next.js实际运行端口
upstream nextjs_backend {
    server 127.0.0.1:5000;
    keepalive 64;
}

# HTTP服务器配置 (80端口)
server {
    listen 80;
    listen [::]:80;
    server_name 42.121.218.14 www.zjsifan.com zjsifan.com;

    # 访问日志和错误日志
    access_log /var/log/nginx/enterprise-website-access.log;
    error_log /var/log/nginx/enterprise-website-error.log;

    # 客户端请求大小限制
    client_max_body_size 50M;

    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript
               application/json application/javascript application/xml+rss
               application/rss+xml font/truetype font/opentype
               application/vnd.ms-fontobject image/svg+xml;

    # 静态资源缓存
    location /_next/static {
        proxy_pass http://nextjs_backend;
        proxy_cache_valid 200 60m;
        proxy_cache_bypass $http_pragma $http_authorization;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location /static {
        proxy_pass http://nextjs_backend;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # API路由
    location /api/ {
        proxy_pass http://nextjs_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }

    # Next.js图片优化
    location /_next/image {
        proxy_pass http://nextjs_backend;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # 所有其他请求
    location / {
        proxy_pass http://nextjs_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 安全头
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }

    # 健康检查端点
    location /health {
        proxy_pass http://nextjs_backend;
        access_log off;
    }
}
EOF

echo "✓ Nginx 配置已更新，端口指向: 5000"
echo ""

# 4. 创建软链接
echo "步骤 4: 启用站点配置..."
ln -sf "$NGINX_CONF" "$NGINX_ENABLED"
echo "✓ 站点配置已启用"
echo ""

# 5. 测试Nginx配置
echo "步骤 5: 测试 Nginx 配置..."
if nginx -t 2>&1; then
    echo "✓ Nginx 配置测试通过"
else
    echo "✗ Nginx 配置测试失败"
    exit 1
fi
echo ""

# 6. 启动Nginx
echo "步骤 6: 启动 Nginx 服务..."
service nginx start
echo "✓ Nginx 已启动"
echo ""

# 7. 验证服务状态
echo "步骤 7: 验证服务状态..."
echo "正在检查端口监听..."
sleep 2

if ss -tuln 2>/dev/null | grep -E ':80[[:space:]]' | grep -q LISTEN; then
    echo "✓ 80 端口正在监听"
else
    echo "⚠ 80 端口未检测到监听"
fi

if command -v curl &> /dev/null; then
    echo ""
    echo "测试本地访问..."
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/ --max-time 5)
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "307" ] || [ "$HTTP_CODE" = "308" ]; then
        echo "✓ 本地访问成功 (HTTP $HTTP_CODE)"
    else
        echo "⚠ 本地访问返回 HTTP $HTTP_CODE"
    fi
fi
echo ""

echo "=========================================="
echo " 修复完成！"
echo "=========================================="
echo ""
echo "现在可以通过以下方式访问网站："
echo "  - http://www.zjsifan.com"
echo "  - http://zjsifan.com"
echo "  - http://42.121.218.14"
echo ""
echo "如果域名仍然无法访问，请检查："
echo "  1. DNS 解析是否正确 (应指向 42.121.218.14)"
echo "  2. 阿里云安全组是否开放 80 端口"
echo ""
echo "查看 Nginx 日志："
echo "  tail -f /var/log/nginx/enterprise-website-access.log"
echo "  tail -f /var/log/nginx/enterprise-website-error.log"
echo ""
