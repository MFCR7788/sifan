#!/bin/bash

echo "========================================="
echo "Coze API 网络诊断脚本"
echo "========================================="
echo ""

# 1. 测试 DNS 解析
echo "1. 测试 DNS 解析"
echo "----------------------------------------"
echo "测试 api.coze.cn 解析..."
nslookup api.coze.cn
DNS_RESULT=$?
echo ""

# 2. 测试端口连接
echo "2. 测试端口连接"
echo "----------------------------------------"
echo "测试 api.coze.cn:443 连接..."
timeout 5 nc -zv api.coze.cn 443
PORT_RESULT=$?
echo ""

# 3. 测试 HTTP 连接
echo "3. 测试 HTTP 连接"
echo "----------------------------------------"
echo "测试 https://api.coze.cn 的可访问性..."
curl -I --connect-timeout 10 --max-time 10 https://api.coze.cn
HTTP_RESULT=$?
echo ""

# 4. 测试其他 Coze 域名
echo "4. 测试其他 Coze 域名"
echo "----------------------------------------"
echo "测试 www.coze.cn 解析..."
nslookup www.coze.cn
echo ""
echo "测试 www.coze.cn:443 连接..."
timeout 5 nc -zv www.coze.cn 443
echo ""

# 5. 检查防火墙规则
echo "5. 检查出站防火墙规则"
echo "----------------------------------------"
if command -v iptables &> /dev/null; then
    echo "iptables 出站规则:"
    iptables -L OUTPUT -n -v | grep -E "ACCEPT|DROP|REJECT" | head -20
fi
echo ""

# 6. 总结
echo "========================================="
echo "诊断总结"
echo "========================================="
if [ $DNS_RESULT -eq 0 ]; then
    echo "✅ DNS 解析: 成功"
else
    echo "❌ DNS 解析: 失败"
fi

if [ $PORT_RESULT -eq 0 ]; then
    echo "✅ 端口连接: 成功"
else
    echo "❌ 端口连接: 失败"
fi

if [ $HTTP_RESULT -eq 0 ]; then
    echo "✅ HTTP 连接: 成功"
else
    echo "❌ HTTP 连接: 失败"
fi

echo ""
echo "========================================="
