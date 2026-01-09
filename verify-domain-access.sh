#!/bin/bash

# 验证域名访问

echo "======================================"
echo "验证域名访问"
echo "======================================"

# 1. 检查Nginx配置中的server_name
echo ""
echo "步骤 1: 检查server_name配置"
sudo grep "server_name" /etc/nginx/conf.d/zjsifan.conf

# 2. 测试本地访问
echo ""
echo "步骤 2: 测试本地80端口访问"
curl -I -m 5 http://127.0.0.1:80 2>&1 | head -n 15

# 3. 测试公网IP访问（从服务器本地）
echo ""
echo "步骤 3: 测试公网IP访问"
curl -I -m 5 http://42.121.218.14:80 2>&1 | head -n 15

# 4. 测试域名访问（从服务器本地）
echo ""
echo "步骤 4: 测试域名访问（从服务器）"
curl -I -m 5 http://www.zjsifan.com 2>&1 | head -n 15

# 5. 检查防火墙
echo ""
echo "步骤 5: 检查防火墙规则"
echo "--- firewalld ---"
sudo firewall-cmd --list-all 2>/dev/null || echo "firewalld not active"

echo ""
echo "--- iptables ---"
sudo iptables -L -n | grep -E "Chain INPUT|80" | head -n 20

# 6. 检查端口监听
echo ""
echo "步骤 6: 检查端口监听状态"
ss -tlnp | grep -E ':(80|3000)\s'

# 7. 检查Nginx错误日志
echo ""
echo "步骤 7: 检查最近的Nginx错误日志"
sudo tail -n 10 /var/log/nginx/error.log

echo ""
echo "======================================"
echo "请在本地浏览器测试以下地址："
echo "======================================"
echo "  1. http://42.121.218.14"
echo "  2. http://www.zjsifan.com"
echo "  3. http://zjsifan.com"
echo ""
echo "如果域名无法访问，请检查阿里云安全组80端口是否开放"
