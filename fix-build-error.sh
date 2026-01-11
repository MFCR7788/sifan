#!/bin/bash

# ==========================================
# 修复构建错误脚本
# 在服务器上直接执行此脚本
# ==========================================

set -e

echo "=========================================="
echo "修复 Next.js 构建错误"
echo "时间: $(date)"
echo "=========================================="

cd /root/sifan

echo ""
echo "步骤 1: 停止 PM2 服务"
echo "----------------------------------------"
pm2 stop enterprise-website || true

echo ""
echo "步骤 2: 完全删除 .next 目录和缓存"
echo "----------------------------------------"

# 删除 .next 目录
rm -rf .next

# 删除 Next.js 缓存
rm -rf .next-turbopack-cache

# 删除 node_modules/.cache
rm -rf node_modules/.cache

echo "✓ 缓存已清理"

echo ""
echo "步骤 3: 重新安装依赖"
echo "----------------------------------------"
pnpm install
echo "✓ 依赖已安装"

echo ""
echo "步骤 4: 重新构建"
echo "----------------------------------------"
pnpm run build
echo "✓ 构建成功"

echo ""
echo "步骤 5: 重启 PM2 服务"
echo "----------------------------------------"
pm2 restart enterprise-website
echo "✓ 服务已重启"

echo ""
echo "步骤 6: 验证服务状态"
echo "----------------------------------------"
pm2 list

echo ""
echo "检查进程..."
if pm2 list | grep enterprise-website | grep -q "online"; then
    echo "✓ 服务运行正常"
else
    echo "✗ 服务未运行"
    pm2 logs enterprise-website --lines 20
fi

echo ""
echo "=========================================="
echo "修复完成！"
echo "时间: $(date)"
echo "=========================================="

# 测试服务
echo ""
echo "测试服务..."
curl -I http://localhost:3000 2>&1 | head -1
