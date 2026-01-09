#!/bin/bash

# 自动部署脚本 - 从GitHub拉取最新代码并应用
# 使用方法：在服务器上执行 ./auto-deploy.sh

set -e

PROJECT_DIR="/root/sifan"
REPO_URL="https://github.com/MFCR7788/sifan.git"
BRANCH="main"
NGINX_CONF="/etc/nginx/conf.d/zjsifan.conf"

echo "======================================"
echo "自动部署 - 从GitHub拉取最新代码"
echo "======================================"
echo ""
echo "项目目录: ${PROJECT_DIR}"
echo "仓库: ${REPO_URL}"
echo "分支: ${BRANCH}"
echo ""

# 1. 进入项目目录
echo "步骤 1/5: 进入项目目录..."
cd ${PROJECT_DIR}

# 2. 拉取最新代码
echo ""
echo "步骤 2/5: 拉取最新代码..."
git fetch origin
git reset --hard origin/${BRANCH}
echo "✓ 代码已更新到最新版本"

# 3. 检查是否有nginx.conf更新
echo ""
echo "步骤 3/5: 检查配置文件变更..."
if [ -f "nginx.conf" ]; then
    echo "发现nginx.conf，检查是否需要更新..."

    # 备份当前Nginx配置
    sudo cp ${NGINX_CONF} ${NGINX_CONF}.backup.$(date +%Y%m%d_%H%M%S)

    # 应用新配置
    sudo cp nginx.conf ${NGINX_CONF}

    # 测试配置
    sudo nginx -t

    # 重启Nginx
    sudo systemctl reload nginx
    echo "✓ Nginx配置已更新并重启"
else
    echo "nginx.conf无变更，跳过"
fi

# 4. 检查是否有package.json更新（需要重新安装依赖）
if git diff --name-only HEAD@{1} HEAD | grep -q "package.json"; then
    echo ""
    echo "步骤 4/5: 检测到package.json变更，重新安装依赖..."
    npm install --production
    echo "✓ 依赖已更新"
fi

# 5. 重启PM2应用（如果需要）
echo ""
echo "步骤 5/5: 检查是否需要重启应用..."

# 检查是否有代码变更
if git diff --name-only HEAD@{1} HEAD | grep -E "^(src/|app/|pages/|components/|lib/)" > /dev/null; then
    echo "检测到代码变更，重启PM2应用..."
    cd ${PROJECT_DIR}
    pm2 restart enterprise-website
    echo "✓ 应用已重启"
else
    echo "无代码变更，跳过应用重启"
fi

echo ""
echo "======================================"
echo "✅ 自动部署完成！"
echo "======================================"
echo ""
echo "当前版本信息："
git log -1 --oneline

echo ""
echo "验证访问："
curl -I -m 5 http://127.0.0.1:80 2>&1 | head -n 3
