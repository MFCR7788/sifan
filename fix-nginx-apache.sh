#!/bin/bash

# 修复Apache和Nginx端口冲突问题
# Apache占用了80端口，需要停止Apache并启动Nginx

set -e

echo "======================================"
echo "修复Apache和Nginx端口冲突"
echo "======================================"
echo ""

# 1. 检查80端口占用情况
echo "步骤 1/5: 检查80端口占用..."
ss -tlnp | grep :80
echo ""

# 2. 检查Apache状态
echo "步骤 2/5: 检查Apache状态..."
if systemctl is-active --quiet httpd; then
    echo "⚠️  Apache(httpd)正在运行，占用80端口"
    HTTPD_RUNNING=true
else
    echo "✓ Apache未运行"
    HTTPD_RUNNING=false
fi
echo ""

# 3. 检查Nginx状态
echo "步骤 3/5: 检查Nginx状态..."
if systemctl is-active --quiet nginx; then
    echo "✓ Nginx正在运行"
    NGINX_RUNNING=true
else
    echo "⚠️  Nginx未运行"
    NGINX_RUNNING=false
fi
echo ""

# 4. 停止Apache并启动Nginx
echo "步骤 4/5: 停止Apache并启动Nginx..."

if [ "$HTTPD_RUNNING" = true ]; then
    echo "停止Apache..."
    sudo systemctl stop httpd
    sudo systemctl disable httpd
    echo "✓ Apache已停止并禁用开机启动"
fi

if [ "$NGINX_RUNNING" = false ]; then
    echo "启动Nginx..."
    sudo systemctl start nginx
    sudo systemctl enable nginx
    echo "✓ Nginx已启动并设置开机启动"
else
    echo "重启Nginx..."
    sudo systemctl restart nginx
    echo "✓ Nginx已重启"
fi

echo ""

# 5. 验证80端口
echo "步骤 5/5: 验证80端口服务..."
echo "检查80端口监听："
ss -tlnp | grep :80

echo ""
echo "测试本地访问："
curl -I -m 5 http://127.0.0.1:80 2>&1 | head -n 10

echo ""
echo "======================================"
echo "✅ 修复完成！"
echo "======================================"
echo ""
echo "现在请访问："
echo "  - http://42.121.218.14"
echo "  - http://www.zjsifan.com"
echo ""
echo "应该能看到你的网站，而不是Apache测试页面"
