#!/bin/bash

# 直接部署到阿里云服务器（不经过GitHub）
# 将本地代码直接上传到服务器并部署

set -e

SERVER_IP="42.121.218.14"
SERVER_USER="root"
SERVER_DIR="/root/sifan"
LOCAL_DIR="/workspace/projects"

echo "======================================"
echo "直接部署到阿里云服务器"
echo "======================================"
echo ""
echo "目标服务器: ${SERVER_USER}@${SERVER_IP}"
echo "部署目录: ${SERVER_DIR}"
echo ""

# 1. 检查本地是否有所需文件
echo "步骤 1/7: 检查本地文件..."
if [ ! -f "${LOCAL_DIR}/nginx.conf" ]; then
    echo "❌ 错误: 找不到 nginx.conf"
    exit 1
fi
if [ ! -f "${LOCAL_DIR}/package.json" ]; then
    echo "❌ 错误: 找不到 package.json"
    exit 1
fi
echo "✓ 本地文件检查通过"

# 2. 在服务器上备份
echo ""
echo "步骤 2/7: 备份服务器现有配置..."
ssh ${SERVER_USER}@${SERVER_IP} "cd ${SERVER_DIR} && [ -f nginx.conf ] && cp nginx.conf nginx.conf.backup.\$(date +%Y%m%d_%H%M%S) || echo 'nginx.conf不存在，跳过备份'"
echo "✓ 服务器备份完成"

# 3. 上传核心配置文件
echo ""
echo "步骤 3/7: 上传Nginx配置..."
scp ${LOCAL_DIR}/nginx.conf ${SERVER_USER}@${SERVER_IP}:${SERVER_DIR}/nginx.conf
echo "✓ Nginx配置已上传"

# 4. 更新服务器上的Nginx配置
echo ""
echo "步骤 4/7: 更新Nginx配置..."
ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
cd /root/sifan

# 备份现有Nginx配置
sudo cp /etc/nginx/conf.d/zjsifan.conf /etc/nginx/conf.d/zjsifan.conf.backup.$(date +%Y%m%d_%H%M%S) || true

# 复制新配置
sudo cp nginx.conf /etc/nginx/conf.d/zjsifan.conf

# 测试配置
sudo nginx -t
ENDSSH
echo "✓ Nginx配置已更新并测试通过"

# 5. 重启Nginx
echo ""
echo "步骤 5/7: 重启Nginx服务..."
ssh ${SERVER_USER}@${SERVER_IP} "sudo systemctl reload nginx"
echo "✓ Nginx已重启"

# 6. 验证访问
echo ""
echo "步骤 6/7: 验证服务器访问..."
ssh ${SERVER_USER}@${SERVER_IP} << 'ENDSSH'
echo "测试本地访问..."
curl -I -m 5 http://127.0.0.1:80 2>&1 | head -n 5

echo ""
echo "测试域名访问（从服务器）..."
curl -I -m 5 http://www.zjsifan.com 2>&1 | head -n 5
ENDSSH

# 7. 显示配置
echo ""
echo "步骤 7/7: 显示当前配置..."
ssh ${SERVER_USER}@${SERVER_IP} "grep 'server_name' /etc/nginx/conf.d/zjsifan.conf"

echo ""
echo "======================================"
echo "✅ 部署完成！"
echo "======================================"
echo ""
echo "现在请在本地电脑浏览器访问："
echo "  - http://www.zjsifan.com"
echo "  - http://zjsifan.com"
echo "  - http://42.121.218.14"
echo ""
echo "如果域名仍然无法访问，请检查阿里云安全组80端口是否开放"
