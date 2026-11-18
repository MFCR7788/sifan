#!/bin/bash

# 在阿里云服务器上设置自动部署
# 包括：GitHub拉取、Webhook服务器、定时任务

set -e

PROJECT_DIR="/root/sifan"
WEBHOOK_PORT=3001

echo "======================================"
echo "设置自动部署"
echo "======================================"
echo ""

# 1. 进入项目目录
echo "步骤 1/7: 进入项目目录..."
cd ${PROJECT_DIR}

# 2. 配置GitHub访问（使用token避免每次输入密码）
echo ""
echo "步骤 2/7: 配置GitHub访问..."

# 检查是否已配置token
if git config --get remote.origin.url | grep -q "https://"; then
    echo "检测到HTTPS URL，建议配置访问Token"
    echo ""
    echo "请按以下步骤操作："
    echo "1. 访问 https://github.com/settings/tokens"
    echo "2. 创建新的Personal Access Token"
    echo "3. 勾选 'repo' 权限"
    echo "4. 复制token"
    echo ""
    read -p "请输入GitHub Token (留空跳过): " GITHUB_TOKEN

    if [ ! -z "$GITHUB_TOKEN" ]; then
        # 更新远程URL，包含token
        REPO_URL="https://x-access-token:${GITHUB_TOKEN}@github.com/MFCR7788/sifan.git"
        git remote set-url origin ${REPO_URL}
        echo "✓ GitHub Token已配置"
    else
        echo "⚠️  跳过Token配置，使用SSH或手动输入密码"
    fi
fi

# 3. 创建logs目录
echo ""
echo "步骤 3/7: 创建日志目录..."
mkdir -p ${PROJECT_DIR}/logs
echo "✓ 日志目录已创建"

# 4. 给脚本添加执行权限
echo ""
echo "步骤 4/7: 设置脚本执行权限..."
chmod +x auto-deploy.sh
echo "✓ 脚本执行权限已设置"

# 5. 测试自动部署脚本
echo ""
echo "步骤 5/7: 测试自动部署..."
./auto-deploy.sh
echo "✓ 自动部署测试通过"

# 6. 设置Webhook服务器（可选）
echo ""
echo "步骤 6/7: 设置Webhook服务器..."
read -p "是否设置GitHub Webhook自动触发? (y/n): " SETUP_WEBHOOK

if [ "$SETUP_WEBHOOK" = "y" ] || [ "$SETUP_WEBHOOK" = "Y" ]; then
    # 检查端口是否被占用
    if ss -tlnp | grep -q ":${WEBHOOK_PORT}\s"; then
        echo "⚠️  端口 ${WEBHOOK_PORT} 已被占用"
        echo "请手动配置或使用其他端口"
    else
        # 安装依赖
        echo "安装Node.js依赖..."
        npm install --production

        # 启动webhook服务器
        echo "启动Webhook服务器..."
        pm2 start ecosystem-webhook.config.js
        pm2 save
        echo "✓ Webhook服务器已启动"

        echo ""
        echo "======================================"
        echo "📌 配置GitHub Webhook"
        "======================================"
        echo ""
        echo "1. 访问仓库: https://github.com/MFCR7788/sifan/settings/hooks"
        echo "2. 点击 'Add webhook'"
        echo "3. 填写以下信息："
        echo "   - Payload URL: http://42.121.218.14:3001/webhook"
        echo "   - Content type: application/json"
        echo "   - Secret: sifan-webhook-secret-2026"
        echo "   - 勾选: Just the push event"
        echo "4. 点击 'Add webhook'"
        echo ""
        echo "⚠️  重要：需要开放阿里云安全组3001端口"
    fi
else
    echo "跳过Webhook设置"
fi

# 7. 设置定时任务（可选）
echo ""
echo "步骤 7/7: 设置定时自动拉取..."
read -p "是否设置定时任务(每小时检查一次)? (y/n): " SETUP_CRON

if [ "$SETUP_CRON" = "y" ] || [ "$SETUP_CRON" = "Y" ]; then
    # 添加定时任务
    CRON_JOB="0 * * * * cd ${PROJECT_DIR} && ./auto-deploy.sh >> ${PROJECT_DIR}/logs/auto-deploy.log 2>&1"

    # 检查是否已存在
    if crontab -l 2>/dev/null | grep -q "auto-deploy.sh"; then
        echo "定时任务已存在，跳过"
    else
        (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
        echo "✓ 定时任务已添加（每小时执行一次）"
        echo ""
        echo "查看定时任务: crontab -l"
        echo "查看日志: tail -f ${PROJECT_DIR}/logs/auto-deploy.log"
    fi
else
    echo "跳过定时任务设置"
fi

echo ""
echo "======================================"
echo "✅ 自动部署设置完成！"
echo "======================================"
echo ""
echo "使用方法："
echo ""
echo "1. 手动部署："
echo "   cd ${PROJECT_DIR} && ./auto-deploy.sh"
echo ""
echo "2. Webhook自动触发（如果已配置）："
echo "   推送代码到GitHub后自动部署"
echo ""
echo "3. 定时自动拉取（如果已配置）："
echo "   每小时自动检查并部署"
echo ""
echo "查看日志："
echo "   pm2 logs webhook-server"
echo "   tail -f ${PROJECT_DIR}/logs/auto-deploy.log"
