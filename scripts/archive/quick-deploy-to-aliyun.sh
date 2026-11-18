#!/bin/bash
# 快速部署脚本 - 阿里云服务器
# 用途：部署包含 COZE API 密钥更新的版本

set -e

echo "=========================================="
echo "  快速部署到阿里云服务器"
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

# 配置变量
PROJECT_DIR="/root/sifan"
APP_NAME="enterprise-website"
GITHUB_REPO="https://github.com/MFCR7788/sifan.git"

# 检查是否在服务器上运行
if [ "$EUID" -ne 0 ]; then
    print_warning "提示：此脚本应在阿里云服务器上以 root 用户运行"
    print_warning "或者使用 sudo 运行"
fi

print_step "步骤 1: 检查项目目录"

if [ ! -d "$PROJECT_DIR" ]; then
    print_warning "项目目录不存在: $PROJECT_DIR"
    print_warning "是否需要克隆项目？"
    read -p "克隆项目到 $PROJECT_DIR (y/n): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        print_step "克隆项目仓库"
        git clone "$GITHUB_REPO" "$PROJECT_DIR"
        cd "$PROJECT_DIR"
        print_success "项目克隆完成"
    else
        print_error "无法继续，项目目录不存在"
        exit 1
    fi
else
    print_success "项目目录存在: $PROJECT_DIR"
    cd "$PROJECT_DIR"
fi

print_step "步骤 2: 拉取最新代码"

# 停止应用
if pm2 describe $APP_NAME &> /dev/null; then
    print_warning "停止应用..."
    pm2 stop $APP_NAME
    print_success "应用已停止"
fi

# 拉取最新代码
print_warning "从 GitHub 拉取最新代码..."
if ! git pull origin main; then
    print_error "代码拉取失败"
    print_warning "尝试使用 GitHub 镜像..."
    git remote set-url origin https://ghproxy.com/https://github.com/MFCR7788/sifan.git
    if git pull origin main; then
        print_success "代码拉取成功（使用镜像）"
    else
        print_error "代码拉取完全失败"
        exit 1
    fi
else
    print_success "代码拉取成功"
fi

print_step "步骤 3: 清理缓存"

print_warning "清理构建缓存..."
rm -rf .next .next-turbopack-cache node_modules/.cache
print_success "缓存已清理"

print_step "步骤 4: 安装依赖"

print_warning "安装项目依赖..."
if pnpm install; then
    print_success "依赖安装完成"
else
    print_error "依赖安装失败"
    exit 1
fi

print_step "步骤 5: 构建项目"

print_warning "构建生产版本..."
if pnpm run build; then
    print_success "构建完成"
else
    print_error "构建失败"
    print_warning "查看详细错误信息："
    pm2 logs $APP_NAME --lines 50 2>/dev/null || true
    exit 1
fi

print_step "步骤 6: 启动应用"

# 检查应用是否存在
if pm2 describe $APP_NAME &> /dev/null; then
    print_warning "重启现有应用..."
    pm2 restart $APP_NAME
else
    print_warning "启动新应用..."
    pm2 start npm --name "$APP_NAME" -- start
fi

# 保存 PM2 配置
pm2 save

# 设置开机自启
pm2 startup systemd -u root --hp /root 2>/dev/null || true

print_success "应用已启动"

print_step "步骤 7: 验证部署"

sleep 3

# 检查 PM2 进程状态
if pm2 describe $APP_NAME &> /dev/null; then
    STATUS=$(pm2 jlist | grep -o '"name":"enterprise-website"[^}]*"status":"[^"]*"' | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
    if [ "$STATUS" = "online" ]; then
        print_success "PM2 应用状态: online"
    else
        print_warning "PM2 应用状态: $STATUS"
    fi
else
    print_error "PM2 应用未运行"
fi

# 检查端口监听
if ss -tuln 2>/dev/null | grep -E ":3000[[:space:]]" | grep -q LISTEN; then
    print_success "Next.js 应用端口 3000 监听正常"
else
    print_warning "端口 3000 未检测到监听"
fi

# 测试本地访问
if command -v curl &> /dev/null; then
    echo ""
    print_warning "测试本地访问..."
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ --max-time 5)
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "307" ] || [ "$HTTP_CODE" = "308" ]; then
        print_success "本地访问测试通过 (HTTP $HTTP_CODE)"
    else
        print_warning "本地访问返回 HTTP $HTTP_CODE"
    fi
fi

print_step "部署完成！"

echo ""
echo "=========================================="
echo "  本次更新内容"
echo "=========================================="
echo "✓ 添加 COZE_WORKLOAD_IDENTITY_API_KEY 配置"
echo "✓ 修复 AI 图像生成功能"
echo "✓ 修复封面图制作功能"
echo ""
echo "=========================================="
echo "  访问地址"
echo "=========================================="
echo "  - https://www.zjsifan.com"
echo "  - https://zjsifan.com"
echo ""
echo "=========================================="
echo "  管理命令"
echo "=========================================="
echo "  查看应用状态: pm2 list"
echo "  查看应用日志: pm2 logs $APP_NAME --lines 50"
echo "  重启应用: pm2 restart $APP_NAME"
echo "  停止应用: pm2 stop $APP_NAME"
echo ""
echo "=========================================="
echo "  验证清单"
echo "=========================================="
echo "  [ ] 封面图制作功能正常"
echo "  [ ] AI 图像生成功能正常"
echo "  [ ] 不再出现 '生成失败，请重试' 提示"
echo ""
