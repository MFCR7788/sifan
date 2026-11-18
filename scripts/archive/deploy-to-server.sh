#!/bin/bash
# 服务器部署脚本
# 在服务器上运行此脚本来部署应用

set -e

echo "=========================================="
echo " Next.js 企业官网服务器部署脚本"
echo "=========================================="
echo ""

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 配置变量
APP_DIR="/workspace/projects"
APP_NAME="nextjs-app"
NODE_PORT=5000
NGINX_CONF_FILE="/etc/nginx/sites-available/enterprise-website"

# 打印带颜色的消息
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
    echo "使用方法: sudo ./deploy-to-server.sh"
    exit 1
fi

print_step "步骤 1: 环境检查"

# 检查 Node.js
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    print_success "Node.js 已安装: $NODE_VERSION"
else
    print_error "Node.js 未安装"
    echo "正在安装 Node.js..."
    curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
    apt-get install -y nodejs
    print_success "Node.js 安装完成"
fi

# 检查 pnpm
if command -v pnpm &> /dev/null; then
    PNPM_VERSION=$(pnpm -v)
    print_success "pnpm 已安装: $PNPM_VERSION"
else
    print_warning "pnpm 未安装，正在安装..."
    npm install -g pnpm
    print_success "pnpm 安装完成"
fi

print_step "步骤 2: 安装依赖"

cd $APP_DIR

if [ -f "package.json" ]; then
    echo "正在安装项目依赖..."
    pnpm install
    print_success "依赖安装完成"
else
    print_error "未找到 package.json 文件"
    exit 1
fi

print_step "步骤 3: 构建生产版本"

echo "正在构建生产版本..."
pnpm run build
print_success "生产版本构建完成"

print_step "步骤 4: 安装 PM2"

if command -v pm2 &> /dev/null; then
    print_success "PM2 已安装"
else
    echo "正在安装 PM2..."
    npm install -g pm2
    print_success "PM2 安装完成"
fi

print_step "步骤 5: 启动应用"

# 停止旧进程
pm2 delete $APP_NAME 2>/dev/null || true

# 启动新进程
pm2 start npm --name "$APP_NAME" -- start -- -p $NODE_PORT -H 0.0.0.0

# 保存 PM2 配置
pm2 save

# 设置开机自启
pm2 startup systemd -u root --hp /root 2>/dev/null || true

print_success "应用已启动在端口 $NODE_PORT"

# 显示应用状态
pm2 status

print_step "步骤 6: 配置 Nginx"

# 检查 Nginx 是否安装
if ! command -v nginx &> /dev/null; then
    echo "正在安装 Nginx..."
    apt-get update -qq
    apt-get install -y nginx
    print_success "Nginx 安装完成"
else
    print_success "Nginx 已安装"
fi

# 创建 Nginx 配置
print_warning "正在配置 Nginx..."

# 备份现有配置
if [ -f "$NGINX_CONF_FILE" ]; then
    cp "$NGINX_CONF_FILE" "${NGINX_CONF_FILE}.backup.$(date +%Y%m%d_%H%M%S)"
    print_success "已备份现有 Nginx 配置"
fi

# 创建 Nginx 配置文件
cat > "$NGINX_CONF_FILE" << 'EOF'
# Nginx 配置文件
# Next.js 企业官网

# 上游服务器配置
upstream nextjs_backend {
    server 127.0.0.1:5000;
    keepalive 64;
}

# HTTP服务器配置 (80端口)
server {
    listen 80;
    listen [::]:80;
    server_name 42.121.218.14 www.zjsifan.com zjsifan.com;

    # 访问日志和错误日志
    access_log /var/log/nginx/enterprise-website-access.log;
    error_log /var/log/nginx/enterprise-website-error.log;

    # 客户端请求大小限制
    client_max_body_size 50M;

    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript
               application/json application/javascript application/xml+rss
               application/rss+xml font/truetype font/opentype
               application/vnd.ms-fontobject image/svg+xml;

    # 静态资源缓存
    location /_next/static {
        proxy_pass http://nextjs_backend;
        proxy_cache_valid 200 60m;
        proxy_cache_bypass $http_pragma $http_authorization;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location /static {
        proxy_pass http://nextjs_backend;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # API路由
    location /api/ {
        proxy_pass http://nextjs_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }

    # Next.js图片优化
    location /_next/image {
        proxy_pass http://nextjs_backend;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # 所有其他请求
    location / {
        proxy_pass http://nextjs_backend;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # 安全头
        add_header X-Frame-Options "SAMEORIGIN" always;
        add_header X-Content-Type-Options "nosniff" always;
        add_header X-XSS-Protection "1; mode=block" always;
    }

    # 健康检查端点
    location /health {
        proxy_pass http://nextjs_backend;
        access_log off;
    }
}

# HTTPS服务器配置 (443端口) - 需要SSL证书时取消注释
# 
# server {
#     listen 443 ssl http2;
#     listen [::]:443 ssl http2;
#     server_name 42.121.218.14 www.zjsifan.com zjsifan.com;
#
#     # SSL证书配置
#     ssl_certificate /etc/letsencrypt/live/zjsifan.com/fullchain.pem;
#     ssl_certificate_key /etc/letsencrypt/live/zjsifan.com/privkey.pem;
#
#     # SSL优化配置
#     ssl_protocols TLSv1.2 TLSv1.3;
#     ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
#     ssl_prefer_server_ciphers off;
#     ssl_session_cache shared:SSL:10m;
#     ssl_session_timeout 10m;
#
#     # 其他配置与HTTP相同
#     # ... (同上)
# }
#
# # HTTP到HTTPS重定向
# server {
#     listen 80;
#     listen [::]:80;
#     server_name 42.121.218.14 www.zjsifan.com zjsifan.com;
#     return 301 https://$server_name$request_uri;
# }
EOF

# 创建软链接
ln -sf "$NGINX_CONF_FILE" "/etc/nginx/sites-enabled/enterprise-website"

# 测试 Nginx 配置
if nginx -t 2>&1; then
    print_success "Nginx 配置测试通过"
else
    print_error "Nginx 配置测试失败"
    exit 1
fi

# 重启 Nginx
service nginx restart
print_success "Nginx 已重启"

print_step "步骤 7: 验证部署"

sleep 3

# 检查 PM2 进程
if pm2 describe $APP_NAME &> /dev/null; then
    print_success "PM2 进程运行正常"
else
    print_error "PM2 进程未运行"
fi

# 检查端口监听
if ss -tuln 2>/dev/null | grep -E ":${NODE_PORT}[[:space:]]" | grep -q LISTEN; then
    print_success "应用端口 $NODE_PORT 监听正常"
else
    print_warning "应用端口 $NODE_PORT 未检测到监听"
fi

if ss -tuln 2>/dev/null | grep -E ":80[[:space:]]" | grep -q LISTEN; then
    print_success "Nginx 80 端口监听正常"
else
    print_warning "Nginx 80 端口未检测到监听"
fi

# 测试本地访问
if command -v curl &> /dev/null; then
    echo ""
    echo "正在测试本地访问..."
    
    # 测试 Next.js 直接访问
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:$NODE_PORT/ --max-time 5)
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "307" ] || [ "$HTTP_CODE" = "308" ]; then
        print_success "Next.js 应用访问正常 (HTTP $HTTP_CODE)"
    else
        print_warning "Next.js 应用返回 HTTP $HTTP_CODE"
    fi
    
    # 测试 Nginx 访问
    HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost/ --max-time 5)
    if [ "$HTTP_CODE" = "200" ] || [ "$HTTP_CODE" = "307" ] || [ "$HTTP_CODE" = "308" ]; then
        print_success "Nginx 反向代理访问正常 (HTTP $HTTP_CODE)"
    else
        print_warning "Nginx 反向代理返回 HTTP $HTTP_CODE"
    fi
fi

print_step "部署完成！"

echo ""
echo "=========================================="
echo "  部署总结"
echo "=========================================="
echo ""
echo "✓ 应用已部署并运行"
echo ""
echo "访问地址："
echo "  - http://www.zjsifan.com"
echo "  - http://zjsifan.com"
echo "  - http://42.121.218.14"
echo ""
echo "管理命令："
echo "  - 查看应用状态: pm2 status"
echo "  - 查看应用日志: pm2 logs $APP_NAME"
echo "  - 重启应用: pm2 restart $APP_NAME"
echo "  - 停止应用: pm2 stop $APP_NAME"
echo ""
echo "Nginx 日志："
echo "  - 访问日志: tail -f /var/log/nginx/enterprise-website-access.log"
echo "  - 错误日志: tail -f /var/log/nginx/enterprise-website-error.log"
echo ""
echo "后续优化："
echo "  1. 配置 HTTPS: sudo ./setup-https-fixed.sh"
echo "  2. 配置 SSL 证书自动续期"
echo "  3. 配置数据库备份"
echo ""
