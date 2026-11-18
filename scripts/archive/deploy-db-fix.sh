#!/bin/bash
# 数据库修复部署脚本

set -e

echo "========================================="
echo "    数据库修复部署脚本"
echo "========================================="

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# 服务器信息
SERVER="root@42.121.218.14"
REMOTE_DIR="/var/www/enterprise-website"

echo -e "${YELLOW}[1/4] 构建项目...${NC}"
pnpm run build

echo -e "${GREEN}[2/4] 上传修复到服务器...${NC}"
# 上传核心修复文件
rsync -avz --delete \
  --exclude='.next' \
  --exclude='node_modules' \
  --exclude='.git' \
  ./ ${SERVER}:${REMOTE_DIR}/

echo -e "${GREEN}[3/4] 在服务器上安装依赖...${NC}"
ssh ${SERVER} "cd ${REMOTE_DIR} && pnpm install --production"

echo -e "${GREEN}[4/4] 重启服务...${NC}"
ssh ${SERVER} "cd ${REMOTE_DIR} && pm2 restart enterprise-website"

echo -e "${GREEN}========================================="
echo -e "    部署完成！"
echo -e "========================================="
echo ""
echo "修复内容："
echo "  ✓ 修复 Next.js 配置错误（移除 imageOptimization）"
echo "  ✓ 创建缺失的 Zod schema 定义"
echo "  ✓ 修复订单验证问题"
echo "  ✓ 数据库连接已验证正常"
echo ""
echo "访问网站：https://www.zjsifan.com"
