#!/bin/bash

# ==========================================
# 生产环境部署脚本
# 部署服务器: 42.121.218.14
# ==========================================

set -e  # 遇到错误立即退出

echo "=========================================="
echo "开始部署到生产服务器"
echo "时间: $(date)"
echo "=========================================="

# 服务器配置
SERVER_HOST="42.121.218.14"
SERVER_USER="root"
SERVER_PATH="/root/sifan"
PROJECT_NAME="enterprise-website"

echo ""
echo "步骤 1: 同步代码到服务器"
echo "----------------------------------------"

# 检查本地是否有未提交的更改
if [ -n "$(git status --porcelain)" ]; then
    echo "错误: 有未提交的更改，请先提交"
    exit 1
fi

# 推送代码到 GitHub
echo "推送代码到 GitHub..."
git push origin main

# 连接到服务器并部署
ssh root@${SERVER_HOST} << 'ENDSSH'
set -e

echo ""
echo "进入项目目录..."
cd /root/sifan

echo ""
echo "步骤 2: 拉取最新代码"
echo "----------------------------------------"

# 设置 GitHub 镜像 URL
echo "设置 GitHub 镜像 URL..."
git remote set-url origin https://ghproxy.com/https://github.com/MFCR7788/sifan.git

git fetch origin main
git reset --hard origin/main

echo ""
echo "当前提交信息:"
git log -1 --oneline

echo ""
echo "步骤 3: 检查环境变量配置"
echo "----------------------------------------"
if [ -f ".env.production" ]; then
    echo "✓ .env.production 文件存在"
    echo "数据库配置检查:"
    grep -E "PGDATABASE_URL|DATABASE_URL" .env.production | head -2
else
    echo "✗ .env.production 文件不存在"
    exit 1
fi

echo ""
echo "步骤 4: 安装依赖"
echo "----------------------------------------"
pnpm install --production=false

echo ""
echo "步骤 5: 构建项目"
echo "----------------------------------------"
pnpm run build

echo ""
echo "步骤 6: 重启服务"
echo "----------------------------------------"
if pm2 list | grep -q "enterprise-website"; then
    echo "重启现有服务..."
    pm2 restart enterprise-website
else
    echo "启动新服务..."
    pm2 start npm --name "enterprise-website" -- start
fi

echo ""
echo "步骤 7: 验证服务状态"
echo "----------------------------------------"
pm2 list | grep enterprise-website

echo ""
echo "检查端口 5000 是否监听..."
if netstat -tuln | grep -q ":5000"; then
    echo "✓ 端口 5000 正在监听"
else
    echo "✗ 端口 5000 未监听"
fi

echo ""
echo "=========================================="
echo "部署完成！"
echo "时间: $(date)"
echo "=========================================="
ENDSSH

echo ""
echo "=========================================="
echo "测试服务"
echo "=========================================="

# 测试首页
echo "测试首页..."
curl -I -m 5 http://www.zjsifan.com 2>&1 | head -1

# 测试数据库 API
echo ""
echo "测试用户 API（预期返回: 数据库未配置）..."
curl -s http://www.zjsifan.com/api/user/me | head -50

echo ""
echo "=========================================="
echo "部署流程结束"
echo "=========================================="
