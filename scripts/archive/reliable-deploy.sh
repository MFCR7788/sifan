#!/bin/bash

# ==========================================
# 可靠部署脚本（完全清理重建）
# 在服务器上直接执行此脚本
# ==========================================

set -e

echo "=========================================="
echo "可靠部署 - 完全清理重建"
echo "时间: $(date)"
echo "=========================================="

cd /root/sifan

echo ""
echo "步骤 1: 停止 PM2 服务"
echo "----------------------------------------"
pm2 stop enterprise-website || true

echo ""
echo "步骤 2: 完全删除 .next 目录"
echo "----------------------------------------"
rm -rf .next
rm -rf .next-turbopack-cache
rm -rf node_modules/.cache
echo "✓ 缓存已完全清理"

echo ""
echo "步骤 3: 同步代码"
echo "----------------------------------------"
# 设置 GitHub 镜像 URL
git remote set-url origin https://ghproxy.com/https://github.com/MFCR7788/sifan.git

git fetch origin main
git reset --hard origin/main
git clean -fd
echo "✓ 代码已同步"

echo ""
echo "步骤 4: 安装依赖"
echo "----------------------------------------"
pnpm install
echo "✓ 依赖已安装"

echo ""
echo "步骤 5: 重新构建"
echo "----------------------------------------"
pnpm run build

if [ ! -d ".next" ]; then
    echo "✗ 构建失败，.next 目录不存在"
    exit 1
fi

echo "✓ 构建成功"

echo ""
echo "步骤 6: 重启服务"
echo "----------------------------------------"
pm2 restart enterprise-website || pm2 start ecosystem.config.js
echo "✓ 服务已启动"

echo ""
echo "步骤 7: 保存 PM2 配置"
echo "----------------------------------------"
pm2 save

echo ""
echo "步骤 8: 验证服务状态"
echo "----------------------------------------"
pm2 list

echo ""
echo "检查端口监听..."
if netstat -tuln 2>/dev/null | grep -q ":3000"; then
    echo "✓ 端口 3000 正在监听"
else
    echo "⚠ 端口 3000 未监听，可能需要几秒钟启动"
fi

echo ""
echo "=========================================="
echo "部署完成！"
echo "时间: $(date)"
echo "=========================================="

# 等待服务启动
echo ""
echo "等待服务启动..."
sleep 3

echo ""
echo "测试服务..."
curl -I http://localhost:3000 2>&1 | head -1

echo ""
echo "查看日志（前 20 行）"
pm2 logs enterprise-website --lines 20 --nostream
