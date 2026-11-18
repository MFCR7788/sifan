#!/bin/bash
# 服务器自动拉取并部署脚本
# 从 GitHub 拉取代码并自动部署

set -e

echo "=========================================="
echo " 从 GitHub 拉取代码并部署"
echo "=========================================="
echo ""

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# 配置变量
REPO_URL="https://github.com/MFCR7788/sifan.git"
APP_DIR="/workspace/projects"

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then
    print_error "请使用 sudo 运行此脚本"
    exit 1
fi

print_step() {
    echo ""
    echo "=========================================="
    echo " $1"
    echo "=========================================="
}

# 检查 Git
if ! command -v git &> /dev/null; then
    print_warning "Git 未安装，正在安装..."
    apt-get update -qq
    apt-get install -y git
    print_success "Git 安装完成"
fi

# 检查项目目录
if [ ! -d "$APP_DIR" ]; then
    print_warning "项目目录不存在，正在创建..."
    mkdir -p $APP_DIR
fi

# 克隆或拉取代码
print_step "步骤 1: 拉取最新代码"

cd $APP_DIR

if [ -d ".git" ]; then
    echo "检测到现有 Git 仓库"
    echo "正在拉取最新代码..."
    git fetch origin
    git reset --hard origin/main
    git clean -fd
    print_success "代码更新完成"
else
    echo "正在克隆仓库..."
    git clone $REPO_URL .
    print_success "仓库克隆完成"
fi

print_step "步骤 2: 检查脚本文件"

# 检查必需的脚本文件
REQUIRED_SCRIPTS=(
    "deploy-to-server.sh"
    "update-server.sh"
    "fix-nginx-configuration.sh"
)

for script in "${REQUIRED_SCRIPTS[@]}"; do
    if [ -f "$script" ]; then
        chmod +x "$script"
        print_success "找到脚本: $script"
    else
        print_error "缺失脚本: $script"
    fi
done

print_step "步骤 3: 执行部署"

# 执行部署脚本
if [ -f "deploy-to-server.sh" ]; then
    bash ./deploy-to-server.sh
else
    print_error "部署脚本不存在"
    exit 1
fi

print_step "部署完成！"

echo ""
echo "✓ 代码已从 GitHub 拉取并部署完成"
echo ""
echo "后续更新代码，运行："
echo "  sudo ./update-server.sh"
echo ""
