#!/bin/bash

# ==========================================
# 修复 GitHub 镜像配置
# 在服务器上执行此脚本
# ==========================================

set -e

echo "=========================================="
echo "修复 GitHub 镜像配置"
echo "时间: $(date)"
echo "=========================================="

cd /root/sifan

echo ""
echo "步骤 1: 修改远程仓库 URL 为镜像地址"
echo "----------------------------------------"
git remote set-url origin https://ghproxy.com/https://github.com/MFCR7788/sifan.git
echo "✓ 远程仓库 URL 已修改为镜像地址"

echo ""
echo "步骤 2: 验证远程仓库 URL"
echo "----------------------------------------"
git remote -v

echo ""
echo "步骤 3: 拉取最新代码"
echo "----------------------------------------"
git fetch origin main
git reset --hard origin/main
git clean -fd

echo ""
echo "步骤 4: 重新构建"
echo "----------------------------------------"
pnpm install
pnpm run build

echo ""
echo "步骤 5: 重启服务"
echo "----------------------------------------"
pm2 restart enterprise-website

echo ""
echo "=========================================="
echo "修复完成！"
echo "=========================================="
