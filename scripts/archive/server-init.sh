#!/bin/bash

# ==========================================
# 阿里云服务器环境初始化脚本
# 目标服务器: 42.121.218.14
# 使用方法: 
#   1. 上传到服务器: scp server-init.sh root@42.121.218.14:/root/
#   2. 登录服务器: ssh root@42.121.218.14
#   3. 执行脚本: chmod +x server-init.sh && ./server-init.sh
# ==========================================

set -e  # 遇到错误立即退出

echo "=========================================="
echo "开始初始化阿里云服务器环境"
echo "=========================================="

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 1. 更新系统
echo -e "${YELLOW}[1/9] 更新系统包...${NC}"
apt update && apt upgrade -y
echo -e "${GREEN}✓ 系统更新完成${NC}"

# 2. 安装基础工具
echo -e "${YELLOW}[2/9] 安装基础工具...${NC}"
apt install -y curl wget git vim unzip net-tools build-essential
echo -e "${GREEN}✓ 基础工具安装完成${NC}"

# 3. 安装 Node.js 20
echo -e "${YELLOW}[3/9] 安装 Node.js 20...${NC}"
if command -v node &> /dev/null; then
    echo -e "${YELLOW}⚠ Node.js 已安装，版本: $(node -v)${NC}"
else
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt install -y nodejs
    echo -e "${GREEN}✓ Node.js 安装完成: $(node -v)${NC}"
fi

# 4. 安装 pnpm
echo -e "${YELLOW}[4/9] 安装 pnpm...${NC}"
if command -v pnpm &> /dev/null; then
    echo -e "${YELLOW}⚠ pnpm 已安装，版本: $(pnpm -v)${NC}"
else
    npm install -g pnpm
    echo -e "${GREEN}✓ pnpm 安装完成: $(pnpm -v)${NC}"
fi

# 5. 安装 PM2
echo -e "${YELLOW}[5/9] 安装 PM2...${NC}"
if command -v pm2 &> /dev/null; then
    echo -e "${YELLOW}⚠ PM2 已安装，版本: $(pm2 -v)${NC}"
else
    npm install -g pm2
    echo -e "${GREEN}✓ PM2 安装完成: $(pm2 -v)${NC}"
fi

# 6. 安装并配置 Nginx
echo -e "${YELLOW}[6/9] 安装和配置 Nginx...${NC}"
if command -v nginx &> /dev/null; then
    echo -e "${YELLOW}⚠ Nginx 已安装${NC}"
    # 停止并禁用 Apache
    systemctl stop apache2 || true
    systemctl disable apache2 || true
else
    apt install -y nginx
    # 停止并禁用 Apache
    systemctl stop apache2 || true
    systemctl disable apache2 || true
    echo -e "${GREEN}✓ Nginx 安装完成${NC}"
fi

# 启动 Nginx
systemctl start nginx
systemctl enable nginx
echo -e "${GREEN}✓ Nginx 已启动${NC}"

# 7. 配置防火墙
echo -e "${YELLOW}[7/9] 配置防火墙...${NC}"
if command -v ufw &> /dev/null; then
    # 允许 SSH
    ufw allow 22/tcp
    # 允许 HTTP
    ufw allow 80/tcp
    # 允许 HTTPS
    ufw allow 443/tcp
    # 启用防火墙（如果未启用）
    ufw --force enable
    echo -e "${GREEN}✓ 防火墙配置完成${NC}"
else
    echo -e "${YELLOW}⚠ ufw 未安装，跳过防火墙配置${NC}"
fi

# 8. 安装 PostgreSQL 客户端（可选）
echo -e "${YELLOW}[8/9] 安装 PostgreSQL 客户端...${NC}"
apt install -y postgresql-client
echo -e "${GREEN}✓ PostgreSQL 客户端安装完成${NC}"

# 9. 创建项目目录
echo -e "${YELLOW}[9/9] 创建项目目录...${NC}"
mkdir -p /workspace/projects
mkdir -p /var/backups/enterprise-website
mkdir -p /var/log/enterprise-website
echo -e "${GREEN}✓ 目录创建完成${NC}"

# 显示安装结果
echo ""
echo -e "${GREEN}=========================================="
echo "环境初始化完成！"
echo "==========================================${NC}"
echo ""
echo "已安装的软件版本："
echo "  - Node.js: $(node -v)"
echo "  - npm: $(npm -v)"
echo "  - pnpm: $(pnpm -v)"
echo "  - PM2: $(pm2 -v)"
echo "  - Nginx: $(nginx -v 2>&1 | cut -d'/' -f2)"
echo ""
echo "下一步："
echo "  1. 将 deploy-server.sh 上传到服务器"
echo "  2. 编辑 .env.production 配置数据库连接"
echo "  3. 执行部署脚本: ./deploy-server.sh"
echo ""
echo -e "${GREEN}==========================================${NC}"
