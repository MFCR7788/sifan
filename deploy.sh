#!/bin/bash

echo "======================================="
echo "开始部署魔法超人3.0系统"
echo "======================================="

# 拉取最新代码
echo "📥 拉取最新代码..."
git pull origin main

if [ $? -ne 0 ]; then
    echo "❌ 拉取代码失败"
    exit 1
fi

# 安装依赖
echo "📦 安装依赖..."
pnpm install

if [ $? -ne 0 ]; then
    echo "❌ 安装依赖失败"
    exit 1
fi

# 构建项目
echo "🔨 构建项目..."
pnpm run build

if [ $? -ne 0 ]; then
    echo "❌ 构建失败"
    exit 1
fi

# 重启服务（使用 PM2）
echo "🔄 重启服务..."
pm2 restart sifan

if [ $? -ne 0 ]; then
    echo "❌ 重启服务失败，尝试使用 npm start..."
    pm2 start npm --name "sifan" -- start
fi

echo ""
echo "✅ 部署完成！"
echo "🌐 网站地址：https://www.zjsifan.com"
echo "======================================="
