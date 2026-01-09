#!/bin/bash

################################################################################
# 快速更新脚本（用于后续代码更新）
# 用途：拉取最新代码并重新部署
# 使用方法：bash update_production.sh
################################################################################

set -e

# 颜色定义
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

PROJECT_DIR="/root/sifan"  # 修改为你的实际项目路径

log_info "开始更新部署..."

cd "$PROJECT_DIR"

# 拉取最新代码
log_info "拉取最新代码..."
git pull origin main

# 安装依赖
log_info "检查依赖..."
npm install

# 构建
log_info "构建生产版本..."
npm run build

# 重启 PM2
log_info "重启服务..."
pm2 restart sifan

# 等待启动
sleep 5

# 验证
log_info "验证服务..."
pm2 status

HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ || echo "000")

if [ "$HTTP_CODE" = "200" ]; then
    log_success "更新成功！"
else
    log_info "HTTP 状态码: $HTTP_CODE"
fi

log_info "日志: pm2 logs sifan --lines 20"
