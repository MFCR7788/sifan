#!/bin/bash

# 检查部署状态的脚本
# 服务器: 42.121.218.14

set -e

SERVER_IP="42.121.218.14"
SERVER_USER="root"

echo "======================================"
echo "检查部署状态 - $SERVER_IP"
echo "======================================"

# 1. 检查Nginx状态
echo ""
echo "📊 步骤 1: 检查Nginx服务状态"
ssh ${SERVER_USER}@${SERVER_IP} "sudo systemctl status nginx --no-pager | head -n 10"

# 2. 检查PM2状态
echo ""
echo "📊 步骤 2: 检查PM2应用状态"
ssh ${SERVER_USER}@${SERVER_IP} "pm2 status"

# 3. 检查端口监听
echo ""
echo "📊 步骤 3: 检查端口监听情况"
ssh ${SERVER_USER}@${SERVER_IP} "ss -tlnp | grep -E ':(80|3000|443)\\s'"

# 4. 测试本地访问
echo ""
echo "📊 步骤 4: 测试本地访问"
echo "测试IP访问 (80端口)..."
ssh ${SERVER_USER}@${SERVER_IP} "curl -I -m 5 http://127.0.0.1:80 2>&1 | head -n 5"
echo ""
echo "测试IP访问 (3000端口)..."
ssh ${SERVER_USER}@${SERVER_IP} "curl -I -m 5 http://127.0.0.1:3000 2>&1 | head -n 5"

# 5. 检查Nginx配置
echo ""
echo "📊 步骤 5: 检查Nginx配置中的server_name"
ssh ${SERVER_USER}@${SERVER_IP} "grep -A2 'server_name' /etc/nginx/sites-available/enterprise-website"

# 6. 检查最近的错误日志
echo ""
echo "📊 步骤 6: 检查最近的Nginx错误日志"
ssh ${SERVER_USER}@${SERVER_IP} "sudo tail -n 20 /var/log/nginx/enterprise-website-error.log"

# 7. 检查防火墙
echo ""
echo "📊 步骤 7: 检查防火墙规则"
ssh ${SERVER_USER}@${SERVER_IP} "sudo firewall-cmd --list-all 2>/dev/null || echo 'firewalld not active'"
echo ""
echo "检查iptables规则..."
ssh ${SERVER_USER}@${SERVER_IP} "sudo iptables -L -n | grep -E ':(80|3000|443)' | head -n 10 || echo 'No iptables rules found'"

echo ""
echo "======================================"
echo "✅ 检查完成"
echo "======================================"
