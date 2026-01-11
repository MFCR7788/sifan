#!/bin/bash

echo "=== HTTPS 诊断工具 ==="
echo ""

echo "1. 检查 Nginx 服务状态"
systemctl status nginx --no-pager | head -15

echo ""
echo "2. 检查端口监听状态"
echo "=== 80 端口 (HTTP) ==="
ss -lptn 'sport = :80' || echo "80 端口未监听"

echo ""
echo "=== 443 端口 (HTTPS) ==="
ss -lptn 'sport = :443' || echo "443 端口未监听"

echo ""
echo "=== 3000 端口 (Next.js) ==="
ss -lptn 'sport = :3000' || echo "3000 端口未监听"

echo ""
echo "3. 检查 SSL 证书"
certbot certificates 2>/dev/null || echo "未找到 SSL 证书"

echo ""
echo "4. 测试 Nginx 配置"
nginx -t

echo ""
echo "5. 检查 Nginx 配置文件"
echo "=== /etc/nginx/conf.d 目录 ==="
ls -lh /etc/nginx/conf.d/ | grep -v "total"

echo ""
echo "=== 包含 proxy_pass 的配置 ==="
grep -r "proxy_pass" /etc/nginx/conf.d/*.conf 2>/dev/null || echo "未找到 proxy_pass 配置"

echo ""
echo "6. 检查 PM2 应用状态"
pm2 list 2>/dev/null || echo "PM2 未安装或无运行的应用"

echo ""
echo "7. 本地 HTTPS 测试"
echo "=== 测试 HTTPS 响应 ==="
curl -I -k https://localhost 2>&1 | head -10

echo ""
echo "=== 测试 HTTP 重定向 ==="
curl -I http://localhost 2>&1 | head -10

echo ""
echo "8. 检查防火墙状态"
if command -v firewall-cmd &> /dev/null; then
    echo "=== 防火墙规则 ==="
    firewall-cmd --list-all 2>/dev/null | grep -E "(ports|services)" || echo "防火墙未配置或未启用"
elif command -v ufw &> /dev/null; then
    echo "=== 防火墙状态 ==="
    ufw status
fi

echo ""
echo "=== 诊断完成 ==="
echo ""
echo "常见问题排查:"
echo "1. 502 Bad Gateway -> 检查 PM2 应用是否运行在 3000 端口"
echo "2. 连接超时 -> 检查防火墙是否开放 80 和 443 端口"
echo "3. SSL 错误 -> 检查证书路径和 Nginx 配置"
echo "4. 配置冲突 -> 检查是否有多个配置文件定义了相同的 server_name"
