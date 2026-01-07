#!/bin/bash

# Next.js 项目部署脚本
# 使用方法: bash deploy.sh

set -e  # 遇到错误立即退出

echo "========================================="
echo "    Next.js 项目自动部署脚本"
echo "========================================="

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 配置变量
PROJECT_NAME="nextjs-app"
APP_DIR="/var/www/${PROJECT_NAME}"
PORT=5000
PM2_NAME="nextjs-app"

# 检查是否以 root 用户运行
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}请使用 sudo 运行此脚本${NC}"
    exit 1
fi

echo -e "${GREEN}[1/6] 检查系统环境...${NC}"

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}未检测到 Node.js，开始安装...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
fi

# 检查 pnpm
if ! command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}未检测到 pnpm，开始安装...${NC}"
    npm install -g pnpm
fi

# 检查 PM2
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}未检测到 PM2，开始安装...${NC}"
    npm install -g pm2
fi

# 检查 Nginx
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}未检测到 Nginx，开始安装...${NC}"
    apt-get update
    apt-get install -y nginx
fi

echo -e "${GREEN}[2/6] 安装项目依赖...${NC}"

# 检查项目目录是否存在
if [ ! -d "$APP_DIR" ]; then
    echo -e "${YELLOW}项目目录不存在，请先上传代码到 $APP_DIR${NC}"
    exit 1
fi

cd "$APP_DIR"

# 安装依赖
pnpm install

echo -e "${GREEN}[3/6] 构建项目...${NC}"

# 构建项目
pnpm run build

echo -e "${GREEN}[4/6] 配置 PM2...${NC}"

# 使用 PM2 启动应用
if pm2 list | grep -q "$PM2_NAME"; then
    echo -e "${YELLOW}应用已在运行，重启中...${NC}"
    pm2 restart "$PM2_NAME"
else
    echo -e "${YELLOW}启动新应用...${NC}"
    pm2 start npm --name "$PM2_NAME" -- start
fi

# 设置开机自启
pm2 startup
pm2 save

echo -e "${GREEN}[5/6] 配置 Nginx...${NC}"

# 读取域名
read -p "请输入您的域名（如 example.com）: " DOMAIN

if [ -z "$DOMAIN" ]; then
    echo -e "${RED}域名不能为空${NC}"
    exit 1
fi

# 创建 Nginx 配置
NGINX_CONF="/etc/nginx/sites-available/$DOMAIN"

cat > "$NGINX_CONF" << EOF
server {
    listen 80;
    server_name $DOMAIN www.$DOMAIN;

    location / {
        proxy_pass http://localhost:$PORT;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }

    location /_next/static {
        proxy_pass http://localhost:$PORT;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# 启用配置
ln -sf "$NGINX_CONF" "/etc/nginx/sites-enabled/$DOMAIN"

# 测试 Nginx 配置
nginx -t

if [ $? -eq 0 ]; then
    systemctl restart nginx
    echo -e "${GREEN}Nginx 配置成功${NC}"
else
    echo -e "${RED}Nginx 配置错误${NC}"
    exit 1
fi

echo -e "${GREEN}[6/6] 配置防火墙...${NC}"

# 配置防火墙
ufw allow ssh
ufw allow http
ufw allow https

echo -e "${GREEN}========================================="
echo -e "    部署完成！"
echo "========================================="
echo ""
echo "应用信息："
echo "  - 项目目录: $APP_DIR"
echo "  - 应用端口: $PORT"
echo "  - PM2 名称: $PM2_NAME"
echo "  - 域名: $DOMAIN"
echo ""
echo "常用命令："
echo "  查看应用状态: pm2 status"
echo "  查看日志: pm2 logs $PM2_NAME"
echo "  重启应用: pm2 restart $PM2_NAME"
echo "  重启 Nginx: systemctl restart nginx"
echo ""
echo -e "${YELLOW}下一步：${NC}"
echo "  1. 配置域名 DNS 解析到服务器 IP"
echo "  2. 配置 HTTPS（可选）: sudo certbot --nginx -d $DOMAIN"
echo ""
