#!/bin/bash

# ==========================================
# 从 GitHub 自动部署到阿里云服务器
# 在本地环境执行此脚本
# ==========================================

set -e

# GitHub 配置
GITHUB_REPO="https://github.com/MFCR7788/sifan.git"
# GITHUB_TOKEN: 请手动设置环境变量 export GITHUB_TOKEN=<your_token>

# 阿里云服务器配置
SERVER_HOST="42.121.218.14"
SERVER_USER="root"
SERVER_PATH="/root/sifan"

echo "=========================================="
echo "从 GitHub 自动部署到阿里云"
echo "时间: $(date)"
echo "=========================================="

# 1. 推送最新代码到 GitHub
echo ""
echo "步骤 1: 推送最新代码到 GitHub"
echo "----------------------------------------"

echo "检查 git 状态..."
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  工作区有未提交的更改"
    echo "建议先提交更改："
    echo "  git add -A"
    echo "  git commit -m '描述'"
    echo "  git push origin main"
    exit 1
fi

echo "✓ 工作区干净，准备推送..."

# 设置 GitHub token
git remote set-url origin "https://${GITHUB_TOKEN}@github.com/MFCR7788/sifan.git"

echo "推送代码到 GitHub..."
if git push origin main; then
    echo "✓ 推送到 GitHub 成功"
else
    echo "✗ 推送到 GitHub 失败"
    exit 1
fi

# 2. 在阿里云服务器上拉取代码
echo ""
echo "步骤 2: 在阿里云服务器上拉取代码"
echo "----------------------------------------"

ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
set -e
cd /root/sifan

echo "拉取最新代码..."
git fetch origin
git checkout main
git pull origin main

if [ $? -eq 0 ]; then
    echo "✓ 拉取代码成功"
else
    echo "✗ 拉取代码失败"
    exit 1
fi
ENDSSH

# 3. 在服务器上构建项目
echo ""
echo "步骤 3: 在服务器上构建项目"
echo "----------------------------------------"

ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
set -e
cd /root/sifan

echo "卸载 formidable（如果有）..."
pnpm remove formidable || npm uninstall formidable || true

echo "安装依赖..."
pnpm install --production=false

echo "构建项目..."
pnpm run build

if [ $? -eq 0 ]; then
    echo "✓ 构建成功"
else
    echo "✗ 构建失败"
    exit 1
fi
ENDSSH

# 4. 重启 PM2 服务
echo ""
echo "步骤 4: 重启 PM2 服务"
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
echo "查看最近日志（检查错误）..."
pm2 logs enterprise-website --lines 30 --nostream
ENDSSH

# 5. 验证部署
echo ""
echo "步骤 5: 验证部署"
echo "----------------------------------------"

echo "测试首页访问..."
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" https://www.zjsifan.com)
if [ "$HTTP_CODE" = "200" ]; then
    echo "✓ 首页访问正常 (HTTP $HTTP_CODE)"
else
    echo "⚠ 首页访问异常 (HTTP $HTTP_CODE)"
fi

echo ""
echo "检查是否有 formidable 错误..."
ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
pm2 logs enterprise-website --lines 50 --nostream | grep -i "formidable" || echo "✓ 没有发现 formidable 错误"
ENDSSH

echo ""
echo "=========================================="
echo "部署完成！"
echo "=========================================="
echo ""
echo "后续操作："
echo "1. 在服务器上运行诊断脚本："
echo "   ssh root@42.121.218.14"
echo "   cd /root/sifan"
echo "   bash scripts/realtime-diagnose.sh"
echo ""
echo "2. 查看完整日志："
echo "   pm2 logs enterprise-website"
echo ""
echo "3. 在浏览器中测试支付功能："
echo "   https://www.zjsifan.com"
echo ""
