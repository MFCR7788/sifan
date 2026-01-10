#!/bin/bash

# 快速启动 Webhook 服务器的脚本
# 使用方法：bash start-webhook.sh

echo "========================================="
echo "启动 GitHub Webhook 自动部署服务器"
echo "========================================="
echo ""

# 检查是否在正确的目录
if [ ! -f "webhook-server.js" ]; then
    echo "❌ 错误: 未找到 webhook-server.js 文件"
    echo "   请确保在项目目录中运行此脚本"
    exit 1
fi

# 检查 PM2 是否已安装
if ! command -v pm2 &> /dev/null; then
    echo "❌ 错误: PM2 未安装"
    echo "   请先安装 PM2: npm install -g pm2"
    exit 1
fi

echo "✅ 环境检查通过"
echo ""

# 停止旧的服务（如果存在）
echo "停止旧的 webhook 服务..."
pm2 stop webhook-server 2>/dev/null || echo "无旧服务运行中"
pm2 delete webhook-server 2>/dev/null || echo "无旧服务需删除"

# 创建日志目录
echo "创建日志目录..."
mkdir -p logs

# 启动 webhook 服务器
echo ""
echo "启动 webhook 服务器..."
pm2 start ecosystem-webhook.config.js

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ Webhook 服务器启动成功！"
    echo ""
    echo "========================================="
    echo "服务信息"
    echo "========================================="
    echo "PM2 进程名: webhook-server"
    echo "监听端口: 3001"
    echo "Webhook URL: http://42.121.218.14:3001/webhook"
    echo "Webhook 密钥: sifan-webhook-secret-2026"
    echo ""
    echo "PM2 状态:"
    pm2 status | grep webhook-server
    echo ""
    echo "========================================="
    echo "下一步操作"
    echo "========================================="
    echo "1. 在 GitHub 仓库中添加 Webhook:"
    echo "   - 进入: https://github.com/MFCR7788/sifan/settings/hooks"
    echo "   - 点击 'Add webhook'"
    echo "   - Payload URL: http://42.121.218.14:3001/webhook"
    echo "   - Content type: application/json"
    echo "   - Secret: sifan-webhook-secret-2026"
    echo ""
    echo "2. 查看实时日志:"
    echo "   pm2 logs webhook-server"
    echo ""
    echo "3. 测试自动部署:"
    echo "   git push origin main"
    echo ""
    echo "========================================="
else
    echo "❌ 启动失败，请查看错误信息"
    pm2 logs webhook-server --lines 20
    exit 1
fi

# 保存 PM2 配置
echo ""
echo "保存 PM2 配置..."
pm2 save

echo ""
echo "完成！"
