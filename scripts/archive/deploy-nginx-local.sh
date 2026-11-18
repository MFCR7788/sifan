#!/bin/bash

# 在阿里云服务器上直接部署Nginx配置
# 无需SSH，因为已经在服务器上执行

set -e

NGINX_CONF="nginx.conf"
REMOTE_NGINX_CONF="/etc/nginx/sites-available/enterprise-website"
NGINX_ENABLED_LINK="/etc/nginx/sites-enabled/enterprise-website"

echo "======================================"
echo "开始部署Nginx配置（本地部署）"
echo "======================================"

# 1. 备份现有配置
echo "步骤 1/5: 备份现有Nginx配置..."
sudo cp ${REMOTE_NGINX_CONF} ${REMOTE_NGINX_CONF}.backup.$(date +%Y%m%d_%H%M%S) || true
echo "✓ 配置已备份"

# 2. 复制新配置
echo "步骤 2/5: 复制新配置文件..."
sudo cp ${NGINX_CONF} ${REMOTE_NGINX_CONF}
echo "✓ 配置文件已更新"

# 3. 创建软链接（如果不存在）
echo "步骤 3/5: 配置站点软链接..."
sudo ln -sf ${REMOTE_NGINX_CONF} ${NGINX_ENABLED_LINK}
echo "✓ 软链接已创建/更新"

# 4. 测试Nginx配置
echo "步骤 4/5: 测试Nginx配置..."
sudo nginx -t
echo "✓ 配置测试通过"

# 5. 重启Nginx服务
echo "步骤 5/5: 重启Nginx服务..."
sudo systemctl reload nginx
echo "✓ Nginx已重启"

echo ""
echo "======================================"
echo "✅ Nginx配置部署完成！"
echo "======================================"
echo ""
echo "现在您可以通过以下方式访问网站："
echo "  - http://42.121.218.14"
echo "  - http://www.zjsifan.com"
echo "  - http://zjsifan.com"
echo ""
echo "如果域名访问仍然失败，请检查："
echo "  1. DNS解析是否正确指向 42.121.218.14"
echo "  2. 阿里云安全组是否开放80端口"
echo "  3. 服务器防火墙是否允许80端口"
echo ""
echo "查看Nginx日志："
echo "  sudo tail -f /var/log/nginx/enterprise-website-access.log"
echo "  sudo tail -f /var/log/nginx/enterprise-website-error.log"
