#!/bin/bash

# 本地部署脚本：将项目构建并部署到阿里云服务器
# 使用方法：./scripts/deploy.sh

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 服务器配置
SSH_HOST="your-aliyun-server-ip"
SSH_USERNAME="root"
SSH_PORT="22"
SSH_KEY_PATH="$HOME/.ssh/id_rsa"
DEPLOY_PATH="/root/sifan"
PM2_APP_NAME="enterprise-website"

echo -e "${GREEN}=== 开始部署流程 ===${NC}"

# 1. 检查本地修改
echo -e "${YELLOW}步骤 1: 检查本地修改...${NC}"
git status

read -p "是否有未提交的修改需要提交？(y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}正在提交本地修改...${NC}"
    git add .
    git commit -m "deploy: $(date +'%Y-%m-%d %H:%M:%S') 自动部署"
    git push origin main
fi

# 2. 构建项目
echo -e "${YELLOW}步骤 2: 构建项目...${NC}"
pnpm install
pnpm run build

# 3. 创建部署包
echo -e "${YELLOW}步骤 3: 创建部署包...${NC}"
cd .next
tar -czf ../build-package.tar.gz .
cd ..
ls -lh build-package.tar.gz

# 4. 上传到服务器
echo -e "${YELLOW}步骤 4: 上传到服务器...${NC}"
scp -P $SSH_PORT -i $SSH_KEY_PATH build-package.tar.gz ${SSH_USERNAME}@${SSH_HOST}:${DEPLOY_PATH}/

# 5. 在服务器上部署
echo -e "${YELLOW}步骤 5: 在服务器上部署...${NC}"
ssh -p $SSH_PORT -i $SSH_KEY_PATH ${SSH_USERNAME}@${SSH_HOST} << EOF
    echo "开始部署..."

    cd ${DEPLOY_PATH} || exit 1

    # 备份当前构建
    if [ -d ".next" ]; then
        echo "备份当前构建..."
        mv .next .next.backup.\$(date +%Y%m%d_%H%M%S)
    fi

    # 创建 .next 目录
    echo "创建 .next 目录..."
    mkdir -p .next

    # 解压新构建
    echo "解压新构建..."
    tar -xzf build-package.tar.gz -C .next

    # 重启服务
    echo "重启服务..."
    if pm2 describe $PM2_APP_NAME > /dev/null 2>&1; then
        pm2 restart $PM2_APP_NAME
        echo "✓ 服务已重启"
    else
        echo "服务不存在，正在启动..."
        pm2 start ecosystem.config.js
        echo "✓ 服务已启动"
    fi

    # 保存 PM2 配置
    pm2 save

    # 清理
    rm -f build-package.tar.gz

    echo "✓ 部署完成！"
EOF

# 6. 清理本地临时文件
echo -e "${YELLOW}步骤 6: 清理临时文件...${NC}"
rm -f build-package.tar.gz

echo -e "${GREEN}=== 部署成功完成！ ===${NC}"
echo -e "访问地址: http://your-aliyun-server-ip:5000"
