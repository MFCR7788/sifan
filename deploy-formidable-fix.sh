#!/bin/bash

# ==========================================
# 修复 formidable 模块缺失问题
# ==========================================

set -e

SERVER_HOST="42.121.218.14"
SERVER_USER="root"
SERVER_PATH="/root/sifan"

echo "=========================================="
echo "修复 formidable 模块缺失问题"
echo "时间: $(date)"
echo "=========================================="

# 1. 上传更新的文件
echo ""
echo "步骤 1: 上传更新的文件"
echo "----------------------------------------"

# 上传 next.config.ts
echo "上传 next.config.ts..."
scp next.config.ts ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/

# 上传 package.json
echo "上传 package.json..."
scp package.json ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/

# 上传 ecosystem.config.js（如果有更新）
echo "上传 ecosystem.config.js..."
scp ecosystem.config.js ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/

# 上传 .env.production（如果有更新）
echo "上传 .env.production..."
scp .env.production ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/

# 2. 在服务器上重新安装依赖并构建
echo ""
echo "步骤 2: 重新安装依赖并构建"
echo "----------------------------------------"

ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
set -e
cd /root/sifan

echo "卸载 formidable..."
pnpm remove formidable || npm uninstall formidable

echo "安装依赖..."
pnpm install --production=false

echo "重新构建项目..."
pnpm run build

if [ $? -eq 0 ]; then
    echo "✓ 构建成功"
else
    echo "✗ 构建失败"
    exit 1
fi
ENDSSH

# 3. 重启 PM2 服务
echo ""
echo "步骤 3: 重启 PM2 服务"
echo "----------------------------------------"

ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
set -e
cd /root/sifan

echo "重启 PM2 应用..."
pm2 restart enterprise-website

echo "等待服务启动..."
sleep 10

echo "查看 PM2 状态..."
pm2 status

echo ""
echo "查看最近日志（检查是否还有 formidable 错误）..."
pm2 logs enterprise-website --lines 50 --nostream
ENDSSH

# 4. 验证服务
echo ""
echo "步骤 4: 验证服务"
echo "----------------------------------------"

echo "测试首页访问..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://www.zjsifan.com)
if [ "$HTTP_CODE" = "200" ]; then
    echo "✓ 首页访问正常 (HTTP $HTTP_CODE)"
else
    echo "⚠ 首页访问异常 (HTTP $HTTP_CODE)"
fi

echo ""
echo "=========================================="
echo "修复完成！"
echo "=========================================="
echo ""
echo "后续操作："
echo "1. 在服务器上查看日志确认没有 formidable 错误："
echo "   ssh root@42.121.218.14"
echo "   cd /root/sifan"
echo "   pm2 logs enterprise-website --lines 50"
echo ""
echo "2. 测试支付功能："
echo "   https://www.zjsifan.com"
echo ""
