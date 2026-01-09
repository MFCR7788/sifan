#!/bin/bash

################################################################################
# 回滚脚本
# 用途：回滚到上一个 git commit
# 使用方法：bash rollback_production.sh
################################################################################

set -e

# 颜色定义
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

PROJECT_DIR="/root/sifan"  # 修改为你的实际项目路径

log_info "开始回滚..."

cd "$PROJECT_DIR"

# 显示最近的 commits
log_info "最近的 commits:"
git log --oneline -10

echo ""
read -p "确定要回滚到上一个版本吗? (y/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    log_info "回滚已取消"
    exit 0
fi

# 回滚到上一个 commit
log_info "执行回滚..."
git reset --hard HEAD~1

# 构建
log_info "重新构建..."
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
    log_success "回滚成功！"
else
    log_error "回滚后服务异常，状态码: $HTTP_CODE"
    log_info "查看日志: pm2 logs sifan"
    exit 1
fi
