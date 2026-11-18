#!/bin/bash

# ==========================================
# 使用多个备用 GitHub 镜像部署脚本
# 在服务器上执行此脚本
# ==========================================

set -e

echo "=========================================="
echo "使用备用 GitHub 镜像部署"
echo "时间: $(date)"
echo "=========================================="

cd /root/sifan

# 备用镜像列表
MIRRORS=(
    "https://github.com.cnpmjs.org/"
    "https://hub.fastgit.xyz/"
    "https://mirror.ghproxy.com/"
    "https://ghproxy.com/"
)

echo ""
echo "步骤 1: 尝试连接 GitHub 镜像"
echo "----------------------------------------"

for MIRROR in "${MIRRORS[@]}"; do
    echo "尝试镜像: $MIRROR"

    # 设置镜像 URL
    git remote set-url origin ${MIRROR}MFCR7788/sifan.git

    # 尝试连接
    if git fetch origin main 2>&1 | grep -q "fatal"; then
        echo "✗ 此镜像不可用"
    else
        echo "✓ 此镜像可用"
        break
    fi
done

echo ""
echo "步骤 2: 同步代码"
echo "----------------------------------------"
git reset --hard origin/main
git clean -fd

echo ""
echo "步骤 3: 重新构建"
echo "----------------------------------------"
pnpm install
pnpm run build

echo ""
echo "步骤 4: 重启服务"
echo "----------------------------------------"
pm2 restart enterprise-website

echo ""
echo "=========================================="
echo "部署完成！"
echo "=========================================="
