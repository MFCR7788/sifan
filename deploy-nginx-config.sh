#!/bin/bash

# 部署Nginx配置到阿里云服务器
# 服务器: 42.121.218.14

set -e

SERVER_IP="42.121.218.14"
SERVER_USER="root"  # 请根据实际情况修改
NGINX_CONF="nginx.conf"
REMOTE_NGINX_CONF="/etc/nginx/sites-available/enterprise-website"
NGINX_ENABLED_LINK="/etc/nginx/sites-enabled/enterprise-website"

echo "======================================"
echo "开始部署Nginx配置到 $SERVER_IP"
echo "======================================"

# 1. 备份现有配置
echo "步骤 1/5: 备份现有Nginx配置..."
ssh ${SERVER_USER}@${SERVER_IP} "sudo cp ${REMOTE_NGINX_CONF} ${REMOTE_NGINX_CONF}.backup.\$(date +%Y%m%d_%H%M%S) || true"

# 2. 上传新配置
echo "步骤 2/5: 上传新配置文件..."
scp ${NGINX_CONF} ${SERVER_USER}@${SERVER_IP}:/tmp/nginx.conf
ssh ${SERVER_USER}@${SERVER_IP} "sudo mv /tmp/nginx.conf ${REMOTE_NGINX_CONF}"

# 3. 创建软链接（如果不存在）
echo "步骤 3/5: 配置站点软链接..."
ssh ${SERVER_USER}@${SERVER_IP} "sudo ln -sf ${REMOTE_NGINX_CONF} ${NGINX_ENABLED_LINK}"

# 4. 测试Nginx配置
echo "步骤 4/5: 测试Nginx配置..."
ssh ${SERVER_USER}@${SERVER_IP} "sudo nginx -t"

# 5. 重启Nginx服务
echo "步骤 5/5: 重启Nginx服务..."
ssh ${SERVER_USER}@${SERVER_IP} "sudo systemctl reload nginx"

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
echo "  ssh root@${SERVER_IP} 'tail -f /var/log/nginx/enterprise-website-access.log'"
echo "  ssh root@${SERVER_IP} 'tail -f /var/log/nginx/enterprise-website-error.log'"
