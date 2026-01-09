#!/bin/bash

################################################################################
# 阿里云 ECS 生产环境部署脚本
# 用途：将 Next.js 项目从开发模式部署到生产模式
# 使用方法：sudo bash deploy_production.sh
################################################################################

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 日志函数
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

# 检查是否为 root 用户
check_root() {
    if [ "$EUID" -ne 0 ]; then
        log_error "请使用 sudo 运行此脚本"
        exit 1
    fi
}

# 检查项目目录
check_project_dir() {
    PROJECT_DIR="/root/sifan"  # 修改为你的实际项目路径

    if [ ! -d "$PROJECT_DIR" ]; then
        log_error "项目目录不存在: $PROJECT_DIR"
        log_info "请修改脚本中的 PROJECT_DIR 变量为你的实际项目路径"
        exit 1
    fi

    if [ ! -f "$PROJECT_DIR/package.json" ]; then
        log_error "package.json 不存在: $PROJECT_DIR/package.json"
        exit 1
    fi

    log_success "项目目录检查通过: $PROJECT_DIR"
}

# 停止开发服务
stop_dev_server() {
    log_info "正在停止开发服务..."

    # 查找并停止所有 next dev 进程
    DEV_PIDS=$(ps aux | grep "next dev" | grep -v grep | awk '{print $2}')

    if [ -n "$DEV_PIDS" ]; then
        log_warn "找到开发服务进程: $DEV_PIDS"
        kill -9 $DEV_PIDS
        sleep 2
        log_success "开发服务已停止"
    else
        log_info "未发现运行中的开发服务"
    fi

    # 检查端口 3000 是否被占用
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        log_warn "端口 3000 仍被占用，强制释放..."
        lsof -ti :3000 | xargs kill -9 2>/dev/null || true
        sleep 1
    fi
}

# 检查并安装 Node.js
check_nodejs() {
    log_info "检查 Node.js 版本..."

    if ! command -v node &> /dev/null; then
        log_error "Node.js 未安装，正在安装..."
        curl -fsSL https://rpm.nodesource.com/setup_20.x | bash -
        yum install -y nodejs
    fi

    NODE_VERSION=$(node -v)
    log_success "Node.js 版本: $NODE_VERSION"
}

# 检查并安装 PM2
check_pm2() {
    log_info "检查 PM2..."

    if ! command -v pm2 &> /dev/null; then
        log_info "安装 PM2..."
        npm install -g pm2
    fi

    PM2_VERSION=$(pm2 -v)
    log_success "PM2 版本: $PM2_VERSION"
}

# 安装项目依赖
install_dependencies() {
    log_info "安装项目依赖..."

    cd "$PROJECT_DIR"

    if [ ! -d "node_modules" ] || [ "package.json" -nt "node_modules" ]; then
        log_info "安装 npm 依赖..."
        npm install --production=false  # 安装所有依赖（包括 devDependencies）
    else
        log_info "依赖已安装，跳过"
    fi

    log_success "依赖安装完成"
}

# 清理旧构建
clean_build() {
    log_info "清理旧构建..."

    cd "$PROJECT_DIR"

    rm -rf .next
    rm -rf out

    log_success "清理完成"
}

# 构建生产版本
build_production() {
    log_info "开始构建生产版本..."

    cd "$PROJECT_DIR"

    # 设置生产环境变量
    export NODE_ENV=production

    # 构建项目
    npm run build

    if [ $? -eq 0 ]; then
        log_success "生产版本构建成功"

        # 显示构建产物大小
        log_info "构建产物大小:"
        du -sh .next
    else
        log_error "构建失败，请检查错误信息"
        exit 1
    fi
}

# 启动生产服务
start_production() {
    log_info "启动生产服务..."

    cd "$PROJECT_DIR"

    # 停止旧的 PM2 进程
    pm2 delete sifan 2>/dev/null || true

    # 启动新进程
    pm2 start npm --name "sifan" -- start

    # 配置 PM2 自动重启
    pm2 save

    # 设置开机自启
    pm2 startup 2>/dev/null || log_warn "PM2 startup 配置失败（可能已配置）"

    log_success "生产服务已启动"
}

# 验证服务
verify_service() {
    log_info "等待服务启动..."
    sleep 5

    # 检查 PM2 状态
    pm2 status

    # 检查端口
    log_info "检查端口 3000..."
    if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1; then
        log_success "端口 3000 监听正常"
    else
        log_error "端口 3000 未监听"
        exit 1
    fi

    # 测试 HTTP 响应
    log_info "测试 HTTP 响应..."
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/ || echo "000")

    if [ "$HTTP_CODE" = "200" ]; then
        log_success "HTTP 响应正常 (200 OK)"

        # 测量响应时间
        RESPONSE_TIME=$(curl -o /dev/null -s -w "%{time_total}\n" http://localhost:3000/)
        log_info "响应时间: ${RESPONSE_TIME}秒"
    else
        log_error "HTTP 响应异常 (状态码: $HTTP_CODE)"
        exit 1
    fi

    # 检查日志
    log_info "最近的日志:"
    pm2 logs sifan --lines 10 --nostream
}

# 配置 Nginx（可选）
configure_nginx() {
    read -p "是否配置 Nginx 反向代理? (y/n): " -n 1 -r
    echo

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log_info "安装 Nginx..."

        if ! command -v nginx &> /dev/null; then
            yum install -y nginx
            systemctl enable nginx
        fi

        log_info "配置 Nginx..."

        cat > /etc/nginx/conf.d/sifan.conf <<'EOF'
server {
    listen 80;
    server_name 47.86.104.44;

    # 启用 Gzip 压缩
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript
               application/x-javascript application/xml+rss
               application/javascript application/json
               image/svg+xml;

    # 静态资源缓存（30 天）
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|webp)$ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_cache_bypass $http_upgrade;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }

    # Next.js 静态资源
    location /_next/static/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API 路由
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;
    }

    # 其他请求
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_cache_bypass $http_upgrade;

        # 超时设置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 健康检查
    location /health {
        access_log off;
        return 200 "healthy\n";
        add_header Content-Type text/plain;
    }
}
EOF

        # 测试 Nginx 配置
        nginx -t

        if [ $? -eq 0 ]; then
            # 重启 Nginx
            systemctl restart nginx
            systemctl enable nginx
            log_success "Nginx 配置并启动成功"
        else
            log_error "Nginx 配置有误，请检查"
            exit 1
        fi
    else
        log_info "跳过 Nginx 配置"
    fi
}

# 防火墙配置
configure_firewall() {
    log_info "检查防火墙..."

    if command -v firewall-cmd &> /dev/null; then
        # 如果 firewalld 在运行
        if systemctl is-active --quiet firewalld; then
            log_info "开放端口 80 和 443..."
            firewall-cmd --permanent --add-service=http
            firewall-cmd --permanent --add-service=https
            firewall-cmd --reload
            log_success "防火墙配置完成"
        fi
    fi
}

# 显示部署信息
show_deployment_info() {
    echo ""
    echo "========================================"
    echo "  部署完成！"
    echo "========================================"
    echo ""
    echo "服务信息:"
    echo "  - 应用名称: sifan"
    echo "  - 访问地址: http://47.86.104.44:3000/"
    if [ -f "/etc/nginx/conf.d/sifan.conf" ]; then
        echo "  - Nginx 地址: http://47.86.104.44"
    fi
    echo ""
    echo "常用命令:"
    echo "  查看状态: pm2 status"
    echo "  查看日志: pm2 logs sifan"
    echo "  重启服务: pm2 restart sifan"
    echo "  停止服务: pm2 stop sifan"
    echo "  Nginx 重启: systemctl restart nginx"
    echo ""
    echo "性能优化建议:"
    echo "  1. 配置 CDN 加速静态资源"
    echo "  2. 启用 HTTPS（使用 Let's Encrypt）"
    echo "  3. 配置阿里云 SLB 负载均衡"
    echo ""
    echo "========================================"
}

# 主函数
main() {
    echo ""
    echo "========================================"
    echo "  Next.js 生产环境部署脚本"
    echo "========================================"
    echo ""

    check_root
    check_project_dir

    echo ""
    read -p "是否继续部署? (y/n): " -n 1 -r
    echo ""

    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "部署已取消"
        exit 0
    fi

    echo ""
    log_info "开始部署流程..."
    echo ""

    stop_dev_server
    check_nodejs
    check_pm2
    install_dependencies
    clean_build
    build_production
    start_production
    verify_service
    configure_nginx
    configure_firewall

    show_deployment_info
}

# 执行主函数
main "$@"
