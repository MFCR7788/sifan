#!/bin/bash

# Git 同步问题诊断脚本

echo "======================================"
echo "Git 同步问题诊断"
echo "======================================"
echo ""

# 1. 测试克隆（使用镜像）
echo "[测试 1] 使用镜像克隆测试仓库..."
cd /tmp
rm -rf test-sync 2>/dev/null

echo "执行: git clone https://github.com/octocat/Hello-World.git test-sync"
git clone https://github.com/octocat/Hello-World.git test-sync

if [ $? -eq 0 ]; then
    echo "✓ 克隆成功！"
    cd test-sync
    echo "远程仓库地址："
    git remote -v
    rm -rf /tmp/test-sync
else
    echo "✗ 克隆失败"
fi
echo ""

# 2. 测试直接访问 GitHub（不使用镜像）
echo "[测试 2] 直接访问 GitHub（禁用镜像）..."
cd /tmp
rm -rf test-direct 2>/dev/null

# 临时禁用镜像配置
OLD_GIT_CONFIG=$(git config --global --get-regexp url)
git config --global --unset-all url.https://ghproxy.com/https://github.com/.insteadOf

echo "执行: git clone https://github.com/octocat/Hello-World.git test-direct"
timeout 30 git clone https://github.com/octocat/Hello-World.git test-direct 2>&1

DIRECT_RESULT=$?
if [ $DIRECT_RESULT -eq 0 ]; then
    echo "✓ 直接克隆成功！"
    rm -rf /tmp/test-direct
    echo ""
    echo "【重要发现】"
    echo "直接访问 GitHub 成功，说明："
    echo "- GitHub 连接本身没问题"
    echo "- 问题可能出在镜像站配置或镜像站不稳定"
    echo ""
    echo "建议：取消镜像配置，直接访问 GitHub"
    echo "命令：git config --global --unset url.https://ghproxy.com/https://github.com/.insteadOf"
else
    echo "✗ 直接克隆失败"
    echo "错误代码: $DIRECT_RESULT"
    echo ""
    echo "可能的原因："
    echo "1. HTTPS 443 端口被防火墙阻止"
    echo "2. SSL/TLS 证书问题"
    echo "3. Git 版本过旧"
    echo ""
    echo "Git 版本："
    git --version
fi

# 恢复镜像配置
if [ -n "$OLD_GIT_CONFIG" ]; then
    git config --global url.https://ghproxy.com/https://github.com/.insteadOf "https://github.com/"
    echo ""
    echo "已恢复镜像配置"
fi
echo ""

# 3. 测试 HTTPS 连接详情
echo "[测试 3] 测试 HTTPS 连接详情..."
echo "测试 GitHub HTTPS（443端口）："
curl -Iv https://github.com 2>&1 | grep -E "(Connected|SSL|TLS|error|failed)" | head -10
echo ""

# 4. 测试 Git 协议
echo "[测试 4] 测试不同 Git 协议..."
echo "SSH 协议测试（22端口）："
timeout 5 ssh -T git@github.com 2>&1 | head -1

echo ""
echo "Git 协议测试（9418端口）："
timeout 5 git ls-remote git://github.com/octocat/Hello-World.git 2>&1 | head -1
echo ""

# 5. 检查 Git 配置
echo "[测试 5] 当前 Git 配置..."
git config --global --list | grep -E "(url|proxy|http)" | grep -v "^#"
echo ""

# 6. 测试项目仓库（如果配置了）
echo "[测试 6] 测试项目仓库..."
cd /root/sifan 2>/dev/null
if [ $? -eq 0 ] && [ -d ".git" ]; then
    echo "当前目录: /root/sifan"
    echo "远程仓库："
    git remote -v
    echo ""
    echo "尝试获取最新信息..."
    git fetch --dry-run 2>&1 | head -5
else
    echo "未找到项目仓库目录 /root/sifan"
fi
echo ""

# 7. 测试镜像站可用性
echo "[测试 7] 测试镜像站可用性..."
echo "ghproxy.com:"
curl -I --connect-timeout 3 https://ghproxy.com 2>&1 | head -1

echo ""
echo "github.com.cnpmjs.org:"
curl -I --connect-timeout 3 https://github.com.cnpmjs.org 2>&1 | head -1

echo ""
echo "hub.fastgit.xyz:"
curl -I --connect-timeout 3 https://hub.fastgit.xyz 2>&1 | head -1
echo ""

echo "======================================"
echo "诊断完成"
echo "======================================"
