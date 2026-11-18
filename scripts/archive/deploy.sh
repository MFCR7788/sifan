#!/bin/bash

# 本地部署脚本：将项目构建并部署到阿里云服务器
# 使用方法：./scripts/deploy.sh [server-ip]

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 默认服务器配置（可从命令行参数覆盖）
SSH_HOST=${1:-"your-aliyun-server-ip"}
SSH_USERNAME="root"
SSH_PORT="22"
SSH_KEY_PATH="$HOME/.ssh/id_rsa"
DEPLOY_PATH="/root/sifan"
PM2_APP_NAME="enterprise-website"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}    阿里云自动部署脚本${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}服务器配置:${NC}"
echo -e "  服务器: ${SSH_HOST}"
echo -e "  用户: ${SSH_USERNAME}"
echo -e "  端口: ${SSH_PORT}"
echo -e "  部署路径: ${DEPLOY_PATH}"
echo -e "  PM2 应用: ${PM2_APP_NAME}"
echo ""

# 检查命令行参数
if [ "$SSH_HOST" = "your-aliyun-server-ip" ]; then
    echo -e "${RED}错误: 请指定服务器 IP 地址${NC}"
    echo ""
    echo "使用方法:"
    echo "  ./scripts/deploy.sh <server-ip>"
    echo ""
    echo "示例:"
    echo "  ./scripts/deploy.sh 192.168.1.100"
    exit 1
fi

# 1. 检查本地修改
echo -e "${YELLOW}步骤 1/6: 检查本地修改...${NC}"
git_status=$(git status --porcelain)
if [ -n "$git_status" ]; then
    echo -e "${YELLOW}发现未提交的修改:${NC}"
    git status --short
    echo ""
    read -p "是否要提交这些修改？(y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        echo -e "${YELLOW}正在提交本地修改...${NC}"
        git add .
        git commit -m "deploy: $(date +'%Y-%m-%d %H:%M:%S') 自动部署"
        echo -e "${GREEN}✓ 本地修改已提交${NC}"
        echo ""
        read -p "是否要推送到 GitHub？(y/n) " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo -e "${YELLOW}正在推送到 GitHub...${NC}"
            git push origin main
            echo -e "${GREEN}✓ 已推送到 GitHub${NC}"
        fi
    fi
else
    echo -e "${GREEN}✓ 工作目录干净，无需提交${NC}"
fi
echo ""

# 2. 检查 SSH 连接
echo -e "${YELLOW}步骤 2/6: 检查 SSH 连接...${NC}"
if ! ssh -p $SSH_PORT -i $SSH_KEY_PATH -o ConnectTimeout=5 -o StrictHostKeyChecking=no ${SSH_USERNAME}@${SSH_HOST} "echo 'SSH 连接成功'" 2>/dev/null; then
    echo -e "${RED}✗ SSH 连接失败${NC}"
    echo ""
    echo "请检查:"
    echo "  1. 服务器 IP 地址是否正确"
    echo "  2. SSH 密钥是否配置正确"
    echo "  3. 服务器是否可访问"
    exit 1
fi
echo -e "${GREEN}✓ SSH 连接正常${NC}"
echo ""

# 3. 安装依赖并构建项目
echo -e "${YELLOW}步骤 3/6: 构建项目...${NC}"
echo -e "${BLUE}安装依赖...${NC}"
pnpm install
echo -e "${GREEN}✓ 依赖安装完成${NC}"
echo ""
echo -e "${BLUE}开始构建...${NC}"
pnpm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 项目构建成功${NC}"
else
    echo -e "${RED}✗ 项目构建失败${NC}"
    exit 1
fi
echo ""

# 4. 创建部署包
echo -e "${YELLOW}步骤 4/6: 创建部署包...${NC}"
if [ ! -d ".next" ]; then
    echo -e "${RED}✗ .next 目录不存在，构建失败${NC}"
    exit 1
fi

cd .next
tar -czf ../build-package.tar.gz .
cd ..

BUILD_SIZE=$(du -h build-package.tar.gz | cut -f1)
echo -e "${GREEN}✓ 部署包创建成功 (大小: $BUILD_SIZE)${NC}"
echo ""

# 5. 上传到服务器
echo -e "${YELLOW}步骤 5/6: 上传到服务器...${NC}"
echo -e "${BLUE}正在上传...${NC}"
scp -P $SSH_PORT -i $SSH_KEY_PATH -o StrictHostKeyChecking=no build-package.tar.gz ${SSH_USERNAME}@${SSH_HOST}:${DEPLOY_PATH}/

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ 上传成功${NC}"
else
    echo -e "${RED}✗ 上传失败${NC}"
    exit 1
fi
echo ""

# 6. 在服务器上部署
echo -e "${YELLOW}步骤 6/6: 在服务器上部署...${NC}"
ssh -p $SSH_PORT -i $SSH_KEY_PATH ${SSH_USERNAME}@${SSH_HOST} << 'ENDSSH'
    set -e
    echo "开始部署..."

    cd /root/sifan || exit 1

    # 备份当前构建
    if [ -d ".next" ]; then
        BACKUP_NAME=".next.backup.$(date +%Y%m%d_%H%M%S)"
        echo "备份当前构建到 $BACKUP_NAME..."
        mv .next "$BACKUP_NAME"

        # 保留最近 5 个备份
        ls -t .next.backup.* 2>/dev/null | tail -n +6 | xargs -r rm -rf
    fi

    # 创建 .next 目录
    echo "创建 .next 目录..."
    mkdir -p .next

    # 解压新构建
    echo "解压新构建..."
    tar -xzf build-package.tar.gz -C .next

    # 检查 PM2 服务
    if pm2 describe enterprise-website > /dev/null 2>&1; then
        echo "重启 PM2 服务..."
        pm2 restart enterprise-website
        echo "✓ 服务已重启"
    else
        echo "PM2 服务不存在，正在启动..."
        pm2 start .next/server.js --name enterprise-website || pm2 start ecosystem.config.js
        echo "✓ 服务已启动"
    fi

    # 保存 PM2 配置
    pm2 save

    # 检查服务状态
    if pm2 describe enterprise-website > /dev/null 2>&1; then
        echo "✓ PM2 服务运行正常"
        echo ""
        echo "服务信息:"
        pm2 describe enterprise-website | grep -A 5 "restart time"
    else
        echo "⚠️  PM2 服务状态异常，请检查日志"
    fi

    # 清理
    rm -f build-package.tar.gz

    echo "✓ 服务器部署完成！"
ENDSSH

# 清理本地临时文件
echo ""
echo -e "${YELLOW}清理临时文件...${NC}"
rm -f build-package.tar.gz

# 显示部署结果
echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}    部署成功完成！${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}访问地址:${NC}"
echo -e "  HTTP:  http://${SSH_HOST}:5000"
echo ""
echo -e "${BLUE}常用命令:${NC}"
echo -e "  查看服务状态:  ssh ${SSH_USERNAME}@${SSH_HOST} 'pm2 status'"
echo -e "  查看服务日志:  ssh ${SSH_USERNAME}@${SSH_HOST} 'pm2 logs ${PM2_APP_NAME}'"
echo -e "  重启服务:      ssh ${SSH_USERNAME}@${SSH_HOST} 'pm2 restart ${PM2_APP_NAME}'"
echo ""
echo -e "${BLUE}故障排查:${NC}"
echo -e "  查看 doc/PAYMENT_TROUBLESHOOTING.md"
echo -e "  查看 doc/ALIYUN_DEPLOYMENT.md"
echo ""
