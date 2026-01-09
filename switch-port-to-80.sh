#!/bin/bash

# 将Nginx端口从600改回80

set -e

PROJECT_DIR="/root/sifan"
NGINX_CONF="${PROJECT_DIR}/nginx.conf"
NGINX_SERVER_CONF="/etc/nginx/conf.d/zjsifan.conf"
OLD_PORT=600
NEW_PORT=80

echo "======================================"
echo "将Nginx端口从 ${OLD_PORT} 改为 ${NEW_PORT}"
echo "======================================"
echo ""

# 1. 检查当前配置
echo "步骤 1/5: 检查当前配置..."
echo "当前Nginx配置文件:"
grep "listen ${OLD_PORT}" ${NGINX_SERVER_CONF} || echo "未找到${OLD_PORT}端口配置"
echo ""

# 2. 备份Nginx配置
echo "步骤 2/5: 备份Nginx配置..."
sudo cp ${NGINX_SERVER_CONF} ${NGINX_SERVER_CONF}.backup.$(date +%Y%m%d_%H%M%S)
echo "✓ 配置已备份"
echo ""

# 3. 修改配置文件
echo "步骤 3/5: 修改配置文件..."
cd ${PROJECT_DIR}

# 备份本地配置文件
cp ${NGINX_CONF} ${NGINX_CONF}.backup

# 修改nginx.conf中的端口
sed -i "s/listen ${OLD_PORT};/listen ${NEW_PORT};/g" ${NGINX_CONF}
sed -i "s/listen \[::\]:${OLD_PORT};/listen [::]:${NEW_PORT};/g" ${NGINX_CONF}

# 修改注释中的端口
sed -i "s/(${OLD_PORT}端口)/(${NEW_PORT}端口)/g" ${NGINX_CONF}

echo "✓ nginx.conf已修改"
echo ""

# 4. 应用配置到服务器
echo "步骤 4/5: 应用配置到Nginx..."
sudo cp ${NGINX_CONF} ${NGINX_SERVER_CONF}

# 测试配置
echo "测试Nginx配置..."
sudo nginx -t

if [ $? -eq 0 ]; then
    # 重启Nginx
    echo "重启Nginx..."
    sudo systemctl reload nginx
    echo "✓ Nginx已重启"
else
    echo "❌ Nginx配置测试失败，正在恢复备份..."
    sudo cp ${NGINX_SERVER_CONF}.backup.* ${NGINX_SERVER_CONF}
    sudo systemctl reload nginx
    exit 1
fi
echo ""

# 5. 验证新端口
echo "步骤 5/5: 验证新端口..."
echo "检查端口监听:"
ss -tlnp | grep :${NEW_PORT}

echo ""
echo "测试本地访问:"
curl -I -m 5 http://127.0.0.1:${NEW_PORT} 2>&1 | head -n 5

echo ""
echo "======================================"
echo "✅ 端口已切换回 ${NEW_PORT}"
echo "======================================"
echo ""
echo "现在请访问："
echo "  - http://42.121.218.14"
echo "  - http://www.zjsifan.com"
echo "  - http://zjsifan.com"
echo ""
echo "如果之前开放了${OLD_PORT}端口，可以在安全组删除该规则"
