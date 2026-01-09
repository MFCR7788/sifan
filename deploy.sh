#!/bin/bash

# ==========================================
# 生产环境部署脚本
# 服务器: 42.121.218.14
# 使用方法: ./deploy.sh
# ==========================================

set -e  # 遇到错误立即退出

echo "=========================================="
echo "开始部署到生产环境"
echo "=========================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 项目目录
PROJECT_DIR="/workspace/projects"
BACKUP_DIR="/var/backups/enterprise-website"
LOG_DIR="/var/log/enterprise-website"
NGINX_SITES_AVAILABLE="/etc/nginx/sites-available"
NGINX_SITES_ENABLED="/etc/nginx/sites-enabled"

# 1. 备份当前版本
echo -e "${YELLOW}[1/8] 备份当前版本...${NC}"
mkdir -p "$BACKUP_DIR"
if [ -d "$PROJECT_DIR/.next" ]; then
    BACKUP_NAME="backup_$(date +%Y%m%d_%H%M%S)"
    cp -r "$PROJECT_DIR/.next" "$BACKUP_DIR/$BACKUP_NAME"
    echo -e "${GREEN}✓ 备份完成: $BACKUP_NAME${NC}"
else
    echo -e "${YELLOW}⚠ 未找到构建产物，跳过备份${NC}"
fi

# 2. 安装依赖
echo -e "${YELLOW}[2/8] 安装生产依赖...${NC}"
cd "$PROJECT_DIR"
pnpm install --prod=false  # 安装所有依赖（包括dev，用于构建）
echo -e "${GREEN}✓ 依赖安装完成${NC}"

# 3. 构建项目
echo -e "${YELLOW}[3/8] 构建Next.js项目...${NC}"
pnpm run build
echo -e "${GREEN}✓ 项目构建完成${NC}"

# 4. 创建必要目录
echo -e "${YELLOW}[4/8] 创建日志和临时目录...${NC}"
mkdir -p "$LOG_DIR"
mkdir -p "$PROJECT_DIR/logs"
mkdir -p "$PROJECT_DIR/.next/cache"
echo -e "${GREEN}✓ 目录创建完成${NC}"

# 5. 配置环境变量
echo -e "${YELLOW}[5/8] 配置环境变量...${NC}"
if [ ! -f "$PROJECT_DIR/.env.production" ]; then
    echo -e "${RED}✗ 错误: .env.production 文件不存在${NC}"
    echo "请先配置 .env.production 文件"
    exit 1
fi
# 复制生产环境变量
cp "$PROJECT_DIR/.env.production" "$PROJECT_DIR/.env"
echo -e "${GREEN}✓ 环境变量配置完成${NC}"

# 6. 配置Nginx
echo -e "${YELLOW}[6/8] 配置Nginx...${NC}"
# 复制Nginx配置文件
if [ -f "$PROJECT_DIR/nginx.conf" ]; then
    sudo cp "$PROJECT_DIR/nginx.conf" "$NGINX_SITES_AVAILABLE/enterprise-website"
    
    # 创建软链接（如果不存在）
    if [ ! -L "$NGINX_SITES_ENABLED/enterprise-website" ]; then
        sudo ln -s "$NGINX_SITES_AVAILABLE/enterprise-website" "$NGINX_SITES_ENABLED/enterprise-website"
    fi
    
    # 测试Nginx配置
    if sudo nginx -t; then
        echo -e "${GREEN}✓ Nginx配置测试通过${NC}"
        sudo systemctl reload nginx
        echo -e "${GREEN}✓ Nginx重载完成${NC}"
    else
        echo -e "${RED}✗ Nginx配置测试失败${NC}"
        exit 1
    fi
else
    echo -e "${RED}✗ 错误: nginx.conf 文件不存在${NC}"
    exit 1
fi

# 7. 启动/重启PM2
echo -e "${YELLOW}[7/8] 启动PM2进程...${NC}"
# 检查PM2是否安装
if ! command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}⚠ PM2未安装，正在安装...${NC}"
    sudo npm install -g pm2
fi

# 停止旧进程
if pm2 list | grep -q "enterprise-website"; then
    echo -e "${YELLOW}停止旧进程...${NC}"
    pm2 stop enterprise-website || true
    pm2 delete enterprise-website || true
fi

# 启动新进程
echo -e "${YELLOW}启动新进程...${NC}"
pm2 start ecosystem.config.js --env production

# 保存PM2进程列表
pm2 save

# 设置PM2开机自启
pm2 startup systemd -u root --hp /root

echo -e "${GREEN}✓ PM2进程启动完成${NC}"

# 8. 验证部署
echo -e "${YELLOW}[8/8] 验证部署...${NC}"
sleep 5

# 检查端口
if netstat -tuln | grep -q ':3000'; then
    echo -e "${GREEN}✓ 应用正在端口3000上运行${NC}"
else
    echo -e "${RED}✗ 应用未在端口3000上运行${NC}"
    pm2 logs --lines 20
    exit 1
fi

# 检查HTTP响应
if curl -f -s -o /dev/null http://localhost:3000; then
    echo -e "${GREEN}✓ 应用HTTP响应正常${NC}"
else
    echo -e "${RED}✗ 应用HTTP响应异常${NC}"
    pm2 logs --lines 20
    exit 1
fi

# 显示PM2状态
echo -e "${GREEN}=========================================="
echo "部署成功！"
echo "==========================================${NC}"
pm2 status

echo ""
echo -e "${GREEN}访问地址: http://42.121.218.14${NC}"
echo -e "${GREEN}应用日志: pm2 logs enterprise-website${NC}"
echo -e "${GREEN}Nginx日志: tail -f /var/log/nginx/enterprise-website-access.log${NC}"
echo ""

# 清理旧备份（保留最近5个）
echo -e "${YELLOW}[可选] 清理旧备份...${NC}"
cd "$BACKUP_DIR"
ls -t backup_* | tail -n +6 | xargs -r rm -rf
echo -e "${GREEN}✓ 旧备份清理完成${NC}"

echo "=========================================="
echo "部署完成！"
echo "=========================================="
