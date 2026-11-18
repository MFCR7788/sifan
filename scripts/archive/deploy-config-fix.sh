#!/bin/bash

# ==========================================
# 快速部署到生产环境（仅更新配置和重启）
# ==========================================

set -e

SERVER_HOST="42.121.218.14"
SERVER_USER="root"
SERVER_PATH="/root/sifan"

echo "=========================================="
echo "快速部署到生产环境"
echo "时间: $(date)"
echo "=========================================="

# 1. 上传更新的配置文件
echo ""
echo "步骤 1: 上传更新的配置文件"
echo "----------------------------------------"

# 上传 ecosystem.config.js
echo "上传 ecosystem.config.js..."
scp ecosystem.config.js ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/

# 上传 .env.production
echo "上传 .env.production..."
scp .env.production ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/

# 上传 RechargeDialog.tsx（如果有更新）
echo "上传 RechargeDialog.tsx..."
scp src/components/RechargeDialog.tsx ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/src/components/

# 上传 wechatPay.ts（如果有更新）
echo "上传 wechatPay.ts..."
scp src/services/wechatPay.ts ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/src/services/

# 2. 重新构建项目
echo ""
echo "步骤 2: 在服务器上重新构建项目"
echo "----------------------------------------"

ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
set -e
cd /root/sifan

echo "卸载 formidable（如果有）..."
pnpm remove formidable || npm uninstall formidable || true

echo "重新安装依赖..."
pnpm install --production=false

echo "重新构建项目..."
npm run build

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
echo "查看最近日志..."
pm2 logs enterprise-website --lines 30 --nostream
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
echo "部署完成！"
echo "=========================================="
echo ""
echo "后续操作："
echo "1. 在服务器上运行诊断脚本验证配置："
echo "   ssh root@42.121.218.14"
echo "   cd /root/sifan"
echo "   bash scripts/realtime-diagnose.sh"
echo ""
echo "2. 查看 PM2 日志："
echo "   pm2 logs enterprise-website"
echo ""
echo "3. 在浏览器中测试支付功能："
echo "   https://www.zjsifan.com"
echo ""
