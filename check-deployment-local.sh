#!/bin/bash

# 在阿里云服务器上检查部署状态
# 无需SSH，因为已经在服务器上执行

echo "======================================"
echo "检查部署状态（本地）"
echo "======================================"

# 1. 检查Nginx状态
echo ""
echo "📊 步骤 1: 检查Nginx服务状态"
sudo systemctl status nginx --no-pager | head -n 10

# 2. 检查PM2状态
echo ""
echo "📊 步骤 2: 检查PM2应用状态"
pm2 status

# 3. 检查端口监听
echo ""
echo "📊 步骤 3: 检查端口监听情况"
ss -tlnp | grep -E ':(80|3000|443)\s'

# 4. 测试本地访问
echo ""
echo "📊 步骤 4: 测试本地访问"
echo "测试IP访问 (80端口)..."
curl -I -m 5 http://127.0.0.1:80 2>&1 | head -n 5
echo ""
echo "测试IP访问 (3000端口)..."
curl -I -m 5 http://127.0.0.1:3000 2>&1 | head -n 5

# 5. 检查Nginx配置
echo ""
echo "📊 步骤 5: 检查Nginx配置中的server_name"
grep -A2 'server_name' /etc/nginx/sites-available/enterprise-website

# 6. 检查最近的错误日志
echo ""
echo "📊 步骤 6: 检查最近的Nginx错误日志"
sudo tail -n 20 /var/log/nginx/enterprise-website-error.log

# 7. 检查防火墙
echo ""
echo "📊 步骤 7: 检查防火墙规则"
sudo firewall-cmd --list-all 2>/dev/null || echo 'firewalld not active'
echo ""
echo "检查iptables规则..."
sudo iptables -L -n | grep -E ':(80|3000|443)' | head -n 10 || echo 'No iptables rules found'

echo ""
echo "======================================"
echo "✅ 检查完成"
echo "======================================"
