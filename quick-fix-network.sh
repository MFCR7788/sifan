#!/bin/bash

# 服务器网络快速修复脚本
# 尝试最常见和有效的修复方案

echo "======================================"
echo "服务器网络快速修复脚本"
echo "======================================"
echo ""

# 检查是否为 root
if [ "$EUID" -ne 0 ]; then
    echo "请使用 sudo 运行此脚本"
    exit 1
fi

# 方案 1：配置 DNS
echo "[方案 1] 配置 DNS 服务器..."
cp /etc/resolv.conf /etc/resolv.conf.backup.$(date +%Y%m%d_%H%M%S)

# 使用阿里云 DNS
cat > /etc/resolv.conf <<EOF
nameserver 223.5.5.5
nameserver 223.6.6.6
nameserver 114.114.114.114
EOF

echo "✓ DNS 已配置为阿里云 DNS"
echo ""

# 方案 2：配置 Git 镜像
echo "[方案 2] 配置 Git 镜像（GitHub 加速）..."
git config --global url."https://ghproxy.com/https://github.com/".insteadOf "https://github.com/"
git config --global url."https://github.com.cnpmjs.org/".insteadOf "https://github.com/"
git config --global url."https://hub.fastgit.xyz/".insteadOf "https://github.com/"

echo "✓ Git 镜像已配置"
echo "  - ghproxy.com"
echo "  - github.com.cnpmjs.org"
echo "  - hub.fastgit.xyz"
echo ""

# 方案 3：配置 npm 镜像
echo "[方案 3] 配置 npm 镜像（淘宝镜像）..."
if command -v npm &> /dev/null; then
    npm config set registry https://registry.npmmirror.com
    echo "✓ npm 镜像已配置为淘宝镜像"
else
    echo "○ npm 未安装，跳过"
fi
echo ""

if command -v pnpm &> /dev/null; then
    pnpm config set registry https://registry.npmmirror.com
    echo "✓ pnpm 镜像已配置为淘宝镜像"
else
    echo "○ pnpm 未安装，跳过"
fi
echo ""

# 方案 4：测试连接
echo "[方案 4] 测试 GitHub 连接..."
echo "测试 HTTP 连接..."
curl -I --connect-timeout 5 http://github.com 2>&1 | head -1

echo ""
echo "测试 HTTPS 连接..."
curl -I --connect-timeout 5 https://github.com 2>&1 | head -1

echo ""
echo "测试 Git 克隆..."
cd /tmp
if [ -d "test-git" ]; then
    rm -rf test-git
fi
timeout 10 git clone https://github.com/octocat/Hello-World.git test-git 2>&1 | tail -3
if [ $? -eq 0 ]; then
    echo "✓ Git 克隆成功！"
else
    echo "✗ Git 克隆失败"
fi

echo ""
echo "======================================"
echo "修复完成"
echo "======================================"
echo ""
echo "已应用的修复："
echo "1. ✓ DNS 配置（阿里云 DNS）"
echo "2. ✓ Git 镜像配置（多个镜像源）"
echo "3. ✓ npm/pnpm 镜像配置（淘宝镜像）"
echo ""
echo "如果问题仍未解决，请参考 NETWORK-FIX-GUIDE.md 中的其他方案"
echo ""
