#!/bin/bash

# ==========================================
# 阿里云服务器部署脚本
# 目标服务器: 42.121.218.14
# 使用方法: ./deploy-server.sh
# ==========================================

set -e  # 遇到错误立即退出

echo "=========================================="
echo "开始部署到阿里云服务器"
echo "=========================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 配置
PROJECT_DIR="/workspace/projects"
REPO_URL="https://github.com/MFCR7788/sifan.git"
BRANCH="main"
BACKUP_DIR="/var/backups/enterprise-website"
LOG_DIR="/var/log/enterprise-website"
NGINX_SITES_AVAILABLE="/etc/nginx/sites-available"
NGINX_SITES_ENABLED="/etc/nginx/sites-enabled"

# 1. 检查必要软件
echo -e "${YELLOW}[1/10] 检查环境...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}✗ Node.js 未安装，请先运行 server-init.sh${NC}"
    exit 1
fi
if ! command -v pnpm &> /dev/null; then
    echo -e "${RED}✗ pnpm 未安装，请先运行 server-init.sh${NC}"
    exit 1
fi
if ! command -v pm2 &> /dev/null; then
    echo -e "${RED}✗ PM2 未安装，请先运行 server-init.sh${NC}"
    exit 1
fi
if ! command -v nginx &> /dev/null; then
    echo -e "${RED}✗ Nginx 未安装，请先运行 server-init.sh${NC}"
    exit 1
fi
echo -e "${GREEN}✓ 环境检查通过${NC}"

# 2. 停止并删除旧项目（如果存在）
echo -e "${YELLOW}[2/10] 清理旧项目...${NC}"
if [ -d "$PROJECT_DIR" ]; then
    # 备份当前版本
    if [ -d "$PROJECT_DIR/.next" ]; then
        BACKUP_NAME="backup_$(date +%Y%m%d_%H%M%S)"
        mkdir -p "$BACKUP_DIR"
        cp -r "$PROJECT_DIR/.next" "$BACKUP_DIR/$BACKUP_NAME"
        echo -e "${GREEN}✓ 备份完成: $BACKUP_NAME${NC}"
    fi
    
    # 停止 PM2 进程
    if pm2 list | grep -q "enterprise-website"; then
        echo -e "${YELLOW}停止旧进程...${NC}"
        pm2 stop enterprise-website || true
        pm2 delete enterprise-website || true
    fi
    
    # 删除旧项目
    rm -rf "$PROJECT_DIR"
    echo -e "${GREEN}✓ 旧项目清理完成${NC}"
fi

# 3. 克隆代码仓库
echo -e "${YELLOW}[3/10] 克隆代码仓库...${NC}"
git clone -b "$BRANCH" "$REPO_URL" "$PROJECT_DIR"
cd "$PROJECT_DIR"
echo -e "${GREEN}✓ 代码克隆完成${NC}"

# 4. 安装依赖
echo -e "${YELLOW}[4/10] 安装依赖...${NC}"
cd "$PROJECT_DIR"
pnpm install
echo -e "${GREEN}✓ 依赖安装完成${NC}"

# 5. 构建项目
echo -e "${YELLOW}[5/10] 构建项目...${NC}"
cd "$PROJECT_DIR"
pnpm run build
echo -e "${GREEN}✓ 项目构建完成${NC}"

# 6. 配置环境变量
echo -e "${YELLOW}[6/10] 配置环境变量...${NC}"
if [ ! -f "$PROJECT_DIR/.env.production" ]; then
    echo -e "${RED}✗ .env.production 文件不存在${NC}"
    echo "请先配置 .env.production 文件"
    echo "至少需要配置："
    echo "  - DATABASE_URL"
    echo "  - JWT_SECRET"
    exit 1
fi

# 检查必要的环境变量
source "$PROJECT_DIR/.env.production"
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}✗ DATABASE_URL 未配置${NC}"
    exit 1
fi
if [ -z "$JWT_SECRET" ]; then
    echo -e "${RED}✗ JWT_SECRET 未配置${NC}"
    exit 1
fi

# 复制生产环境变量
cp "$PROJECT_DIR/.env.production" "$PROJECT_DIR/.env"
echo -e "${GREEN}✓ 环境变量配置完成${NC}"

# 7. 创建日志目录
echo -e "${YELLOW}[7/10] 创建日志目录...${NC}"
mkdir -p "$LOG_DIR"
mkdir -p "$PROJECT_DIR/logs"
echo -e "${GREEN}✓ 日志目录创建完成${NC}"

# 8. 配置 Nginx
echo -e "${YELLOW}[8/10] 配置 Nginx...${NC}"
if [ -f "$PROJECT_DIR/nginx.conf" ]; then
    # 复制 Nginx 配置
    cp "$PROJECT_DIR/nginx.conf" "$NGINX_SITES_AVAILABLE/enterprise-website"
    
    # 删除默认配置（如果存在）
    rm -f "$NGINX_SITES_ENABLED/default"
    
    # 创建软链接
    if [ -L "$NGINX_SITES_ENABLED/enterprise-website" ]; then
        rm "$NGINX_SITES_ENABLED/enterprise-website"
    fi
    ln -s "$NGINX_SITES_AVAILABLE/enterprise-website" "$NGINX_SITES_ENABLED/enterprise-website"
    
    # 测试 Nginx 配置
    if nginx -t; then
        echo -e "${GREEN}✓ Nginx 配置测试通过${NC}"
        systemctl reload nginx
        echo -e "${GREEN}✓ Nginx 重载完成${NC}"
    else
        echo -e "${RED}✗ Nginx 配置测试失败${NC}"
        exit 1
    fi
else
    echo -e "${RED}✗ nginx.conf 文件不存在${NC}"
    exit 1
fi

# 9. 启动应用
echo -e "${YELLOW}[9/10] 启动应用...${NC}"
cd "$PROJECT_DIR"

# 更新 ecosystem.config.js 中的端口（确保使用 3000）
if [ -f "$PROJECT_DIR/ecosystem.config.js" ]; then
    echo "PM2 配置文件已存在"
else
    echo -e "${RED}✗ ecosystem.config.js 文件不存在${NC}"
    exit 1
fi

# 启动 PM2
pm2 start ecosystem.config.js --env production

# 保存 PM2 配置
pm2 save

# 设置开机自启
pm2 startup systemd -u root --hp /root

echo -e "${GREEN}✓ 应用启动完成${NC}"

# 10. 验证部署
echo -e "${YELLOW}[10/10] 验证部署...${NC}"
sleep 5

# 检查端口
if netstat -tuln | grep -q ':3000'; then
    echo -e "${GREEN}✓ 应用正在端口 3000 上运行${NC}"
else
    echo -e "${RED}✗ 应用未在端口 3000 上运行${NC}"
    pm2 logs --lines 50
    exit 1
fi

# 检查 HTTP 响应
if curl -f -s -o /dev/null http://localhost:3000; then
    echo -e "${GREEN}✓ 应用 HTTP 响应正常${NC}"
else
    echo -e "${RED}✗ 应用 HTTP 响应异常${NC}"
    pm2 logs --lines 50
    exit 1
fi

# 清理旧备份（保留最近 5 个）
echo -e "${YELLOW}清理旧备份...${NC}"
cd "$BACKUP_DIR"
ls -t backup_* 2>/dev/null | tail -n +6 | xargs -r rm -rf
echo -e "${GREEN}✓ 旧备份清理完成${NC}"

# 显示部署结果
echo ""
echo -e "${GREEN}=========================================="
echo "部署成功！"
echo "==========================================${NC}"
pm2 status

echo ""
echo -e "${GREEN}访问地址:${NC}"
echo "  - HTTP:  http://42.121.218.14"
echo "  - 应用:  http://42.121.218.14:3000"
echo ""
echo -e "${GREEN}常用命令:${NC}"
echo "  - 查看日志: pm2 logs enterprise-website"
echo "  - 重启应用: pm2 restart enterprise-website"
echo "  - 停止应用: pm2 stop enterprise-website"
echo "  - 查看状态: pm2 status"
echo "  - Nginx日志: tail -f /var/log/nginx/enterprise-website-access.log"
echo ""
echo -e "${GREEN}=========================================="
echo "部署完成！"
echo "==========================================${NC}"
