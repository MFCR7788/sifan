#!/bin/bash

# 诊断Nginx配置位置

echo "======================================"
echo "诊断Nginx配置位置"
echo "======================================"

echo ""
echo "1. 检查Nginx主配置文件"
sudo grep "include" /etc/nginx/nginx.conf | grep -v "^#"

echo ""
echo "2. 列出/etc/nginx/目录下的文件"
sudo ls -la /etc/nginx/

echo ""
echo "3. 检查conf.d目录"
sudo ls -la /etc/nginx/conf.d/ 2>/dev/null || echo "conf.d目录不存在"

echo ""
echo "4. 检查所有.conf文件"
sudo find /etc/nginx -name "*.conf" -type f

echo ""
echo "5. 检查当前server_name配置"
sudo grep -r "server_name" /etc/nginx/*.conf /etc/nginx/conf.d/*.conf 2>/dev/null | grep -v "^#"

echo ""
echo "6. 检查哪个配置文件监听80端口"
sudo grep -r "listen.*80" /etc/nginx/*.conf /etc/nginx/conf.d/*.conf 2>/dev/null
