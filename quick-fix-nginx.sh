#!/bin/bash

# 快速修复Nginx域名配置

echo "======================================"
echo "快速修复Nginx域名配置"
echo "======================================"

# 1. 找到所有监听80端口的配置文件
echo ""
echo "步骤 1: 查找监听80端口的配置文件..."
CONFIG_FILE=$(sudo grep -r "listen.*80" /etc/nginx/nginx.conf /etc/nginx/conf.d/*.conf 2>/dev/null | grep -v "default" | grep "listen 80" | head -n 1 | cut -d: -f1)

if [ -z "$CONFIG_FILE" ]; then
    echo "未找到配置文件，列出所有.conf文件..."
    sudo find /etc/nginx -name "*.conf" -type f | grep -v default
    echo ""
    echo "请手动指定配置文件路径，例如："
    echo "  CONFIG_FILE=/etc/nginx/conf.d/your-config.conf"
    exit 1
fi

echo "找到配置文件: $CONFIG_FILE"

# 2. 检查当前server_name
echo ""
echo "步骤 2: 检查当前server_name配置..."
sudo grep "server_name" "$CONFIG_FILE"

# 3. 备份配置
echo ""
echo "步骤 3: 备份配置文件..."
BACKUP_FILE="${CONFIG_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
sudo cp "$CONFIG_FILE" "$BACKUP_FILE"
echo "已备份到: $BACKUP_FILE"

# 4. 更新server_name
echo ""
echo "步骤 4: 更新server_name添加域名..."
sudo sed -i 's/server_name 42.121.218.14;/server_name 42.121.218.14 www.zjsifan.com zjsifan.com;/g' "$CONFIG_FILE"

# 5. 显示更新后的配置
echo ""
echo "步骤 5: 显示更新后的server_name..."
sudo grep "server_name" "$CONFIG_FILE"

# 6. 测试配置
echo ""
echo "步骤 6: 测试Nginx配置..."
sudo nginx -t

if [ $? -eq 0 ]; then
    # 7. 重启Nginx
    echo ""
    echo "步骤 7: 重启Nginx服务..."
    sudo systemctl reload nginx
    echo "✓ Nginx已重启"

    # 8. 验证
    echo ""
    echo "步骤 8: 验证访问..."
    echo "测试本地80端口..."
    curl -I -m 5 http://127.0.0.1:80 2>&1 | head -n 10

    echo ""
    echo "======================================"
    echo "✅ 配置更新完成！"
    echo "======================================"
    echo ""
    echo "现在可以访问："
    echo "  - http://42.121.218.14"
    echo "  - http://www.zjsifan.com"
    echo "  - http://zjsifan.com"
    echo ""
    echo "如果域名仍然无法访问，请检查："
    echo "  - 阿里云安全组80端口是否开放"
    echo "  - 服务器防火墙是否允许80端口"
else
    echo ""
    echo "❌ Nginx配置测试失败，正在恢复备份..."
    sudo cp "$BACKUP_FILE" "$CONFIG_FILE"
    echo "已恢复备份配置"
fi
