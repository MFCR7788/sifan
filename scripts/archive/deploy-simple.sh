#!/bin/bash

# 简化版：仅更新Nginx配置文件
# 适合只需要更新Nginx配置的情况

set -e

SERVER_IP="42.121.218.14"
SERVER_USER="root"
LOCAL_FILE="/workspace/projects/nginx.conf"
REMOTE_FILE="/root/sifan/nginx.conf"
NGINX_CONF="/etc/nginx/conf.d/zjsifan.conf"

echo "======================================"
echo "更新Nginx配置到阿里云服务器"
echo "======================================"

# 上传nginx.conf文件
echo "步骤 1: 上nginxx配置..."
scp ${LOCAL_FILE} ${SERVER_USER}@${SERVER_IP}:${REMOTE_FILE}

# 应用配置
echo "步骤 2: 应用配置到Nginx..."
ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
cd /root/sifan

# 备份
sudo cp /etc/nginx/conf.d/zjsifan.conf /etc/nginx/conf.d/zjsifan.conf.backup

# 更新
sudo cp nginx.conf /etc/nginx/conf.d/zjsifan.conf

# 测试
sudo nginx -t

# 重启
sudo systemctl reload nginx

# 验证
echo "验证访问："
curl -I http://127.0.0.1:80 2>&1 | head -n 3
curl -I http://www.zjsifan.com 2>&1 | head -n 3
ENDSSH

echo ""
echo "✅ 配置已更新并生效"
echo ""
echo "请在本地浏览器访问："
echo "  http://www.zjsifan.com"
