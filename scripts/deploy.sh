#!/bin/bash

echo "========================================="
echo "   从GitHub同步代码并部署到生产环境"
echo "========================================="

# 1. 检查并安装 Git
if ! command -v git &> /dev/null; then
    echo "📦 正在安装 Git..."
    yum install -y git
else
    echo "✅ Git 已安装"
fi

# 2. 进入项目目录
PROJECT_DIR="/root/code_deploy_application"
if [ -d "$PROJECT_DIR" ]; then
    echo "📁 进入项目目录: $PROJECT_DIR"
    cd "$PROJECT_DIR"
else
    echo "❌ 项目目录不存在: $PROJECT_DIR"
    exit 1
fi

# 3. 停止当前服务
echo "🛑 停止当前服务..."
pm2 stop sifan-web
pm2 delete sifan-web

# 4. 拉取最新代码
echo "📥 正在从GitHub拉取最新代码..."
git fetch origin
git reset --hard origin/main
git pull origin main

# 5. 安装依赖
echo "📦 安装依赖..."
pnpm install --frozen-lockfile

# 6. 构建生产版本
echo "🔨 构建生产版本..."
pnpm run build

# 7. 启动服务
echo "🚀 启动生产服务..."
pm2 start ecosystem.config.js
pm2 save

# 8. 显示服务状态
echo ""
echo "========================================="
echo "   服务状态"
echo "========================================="
pm2 status
pm2 logs sifan-web --lines 10 --nostream

echo ""
echo "✅ 部署完成！"
echo "🌐 访问地址："
echo "   - http://zjsifan.com"
echo "   - https://zjsifan.com"
echo "========================================="
