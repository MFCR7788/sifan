#!/bin/bash

# 服务器网络诊断脚本
# 用途：诊断服务器无法访问 GitHub 的问题

echo "======================================"
echo "服务器网络诊断脚本"
echo "======================================"
echo ""

# 1. 检查网络连接
echo "[1] 检查网络连接..."
ping -c 2 8.8.8.8 > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✓ 基本网络连接正常"
else
    echo "✗ 基本网络连接失败，请检查网络配置"
fi
echo ""

# 2. 检查 DNS 解析
echo "[2] 检查 DNS 解析..."
nslookup github.com > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✓ DNS 解析正常"
    nslookup github.com | grep "Address:" | tail -1
else
    echo "✗ DNS 解析失败"
    echo "当前 DNS 服务器："
    cat /etc/resolv.conf | grep nameserver
fi
echo ""

# 3. 检查 GitHub HTTP 连接（80 端口）
echo "[3] 检查 GitHub HTTP 连接（80 端口）..."
curl -I --connect-timeout 5 http://github.com 2>&1 | head -1
echo ""

# 4. 检查 GitHub HTTPS 连接（443 端口）
echo "[4] 检查 GitHub HTTPS 连接（443 端口）..."
curl -I --connect-timeout 5 https://github.com 2>&1 | head -1
echo ""

# 5. 检查 GitHub 克隆测试（22 端口）
echo "[5] 检查 Git SSH 连接（22 端口）..."
timeout 5 ssh -T git@github.com 2>&1 | head -1
echo ""

# 6. 测试 GitHub API
echo "[6] 测试 GitHub API..."
curl -I --connect-timeout 5 https://api.github.com 2>&1 | head -1
echo ""

# 7. 检查防火墙规则
echo "[7] 检查防火墙规则..."
if command -v iptables &> /dev/null; then
    echo "当前 iptables 规则："
    iptables -L -n | grep -E "(REJECT|DROP)" | head -5
else
    echo "iptables 未安装"
fi
echo ""

if command -v ufw &> /dev/null; then
    echo "UFW 状态："
    ufw status
fi
echo ""

# 8. 检查代理设置
echo "[8] 检查代理设置..."
if [ -n "$http_proxy" ]; then
    echo "HTTP 代理：$http_proxy"
else
    echo "HTTP 代理：未设置"
fi

if [ -n "$https_proxy" ]; then
    echo "HTTPS 代理：$https_proxy"
else
    echo "HTTPS 代理：未设置"
fi
echo ""

# 9. 检查 hosts 文件
echo "[9] 检查 hosts 文件..."
if grep -q github.com /etc/hosts; then
    echo "发现 GitHub hosts 配置："
    grep github.com /etc/hosts
else
    echo "hosts 文件中无 GitHub 配置"
fi
echo ""

# 10. 测试 GitHub 镜像站
echo "[10] 测试 GitHub 镜像站..."
echo "gitee.com:"
curl -I --connect-timeout 3 https://gitee.com 2>&1 | head -1
echo "ghproxy.com:"
curl -I --connect-timeout 3 https://ghproxy.com 2>&1 | head -1
echo "hub.fastgit.xyz:"
curl -I --connect-timeout 3 https://hub.fastgit.xyz 2>&1 | head -1
echo ""

# 11. 测试端口连通性
echo "[11] 测试端口连通性..."
echo "测试 github.com:443..."
timeout 5 bash -c "echo > /dev/tcp/github.com/443" 2>&1
if [ $? -eq 0 ]; then
    echo "✓ 端口 443 可达"
else
    echo "✗ 端口 443 不可达"
fi
echo ""

# 12. 路由追踪
echo "[12] 路由追踪（前 5 跳）..."
traceroute -m 5 github.com 2>&1 || echo "traceroute 未安装，跳过"
echo ""

echo "======================================"
echo "诊断完成"
echo "======================================"
