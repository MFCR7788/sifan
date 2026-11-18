#!/bin/bash
# 快速更新脚本
# 用于更新代码并重启服务

set -e

echo "=========================================="
echo " 快速更新脚本"
echo "=========================================="
echo ""

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

print_step() {
    echo ""
    echo "=========================================="
    echo " $1"
    echo "=========================================="
}

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then
    print_error "请使用 sudo 运行此脚本"
    exit 1
fi

APP_DIR="/workspace/projects"
APP_NAME="nextjs-app"

cd $APP_DIR

print_step "步骤 1: 拉取最新代码"

if [ -d ".git" ]; then
    echo "正在从 GitHub 拉取最新代码..."
    git fetch origin
    git pull origin main
    print_success "代码更新完成"
else
    print_error "这不是一个 Git 仓库"
    exit 1
fi

print_step "步骤 2: 安装依赖"

echo "正在更新依赖..."
pnpm install
print_success "依赖更新完成"

print_step "步骤 3: 构建生产版本"

echo "正在重新构建..."
pnpm run build
print_success "生产版本构建完成"

print_step "步骤 4: 重启应用"

echo "正在重启应用..."
pm2 restart $APP_NAME
print_success "应用已重启"

# 显示应用状态
pm2 status

print_step "步骤 5: 验证更新"

sleep 2

if command -v curl &> /dev/null; then
    echo "正在测试应用..."
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000/ --max-time 5)
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "307" ] || [ "$HTTP_CODE" = "308" ]; then
        print_success "应用访问正常 (HTTP $HTTP_CODE)"
    else
        print_warning "应用返回 HTTP $HTTP_CODE"
        echo "查看日志: pm2 logs $APP_NAME --lines 20"
    fi
fi

print_step "更新完成！"

echo ""
echo "✓ 应用已更新并重启"
echo ""
echo "如果发现问题，查看日志："
echo "  pm2 logs $APP_NAME --lines 50"
echo "  tail -f /var/log/nginx/enterprise-website-error.log"
echo ""
