#!/bin/bash

# Netlify 直接部署脚本
# 使用方法: bash deploy-netlify.sh

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo "========================================="
echo "    Netlify 直接部署脚本"
echo "========================================="

# 检查是否已安装 Netlify CLI
if ! command -v netlify &> /dev/null; then
    echo -e "${YELLOW}未安装 Netlify CLI，正在安装...${NC}"
    npm install -g netlify-cli
fi

echo -e "${GREEN}[1/5] 检查构建...${NC}"

# 构建项目
npm run build

if [ $? -ne 0 ]; then
    echo -e "${RED}构建失败${NC}"
    exit 1
fi

echo -e "${GREEN}构建成功${NC}"

echo -e "${GREEN}[2/5] 准备部署...${NC}"

# 创建 .netlify 目录
mkdir -p .netlify

# 创建重定向文件
cat > .netlify/_redirects << 'EOF'
/* /index.html 200
EOF

# 创建头部文件
cat > .netlify/_headers << 'EOF'
/_next/static/*
  Cache-Control: public, max-age=31536000, immutable

/static/*
  Cache-Control: public, max-age=31536000, immutable
EOF

echo -e "${GREEN}[3/5] 登录 Netlify（如需要）...${NC}"
echo ""
echo -e "${YELLOW}请在浏览器中完成授权...${NC}"
echo ""

# 尝试登录（如果未登录）
netlify login || true

echo -e "${GREEN}[4/5] 初始化站点...${NC}"
echo ""

# 初始化 Netlify 站点
if [ ! -d ".netlify" ]; then
    netlify init
else
    echo "Netlify 站点已初始化"
fi

echo ""
echo -e "${GREEN}[5/5] 部署到 Netlify...${NC}"
echo ""

# 部署
netlify deploy --prod --dir=.next

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}========================================="
    echo -e "    部署成功！"
    echo "========================================="
    echo ""
    echo -e "${YELLOW}网站地址：${NC}"
    netlify status | grep "Website URL" || echo "请在 Netlify 控制台查看"
    echo ""
else
    echo -e "${RED}部署失败${NC}"
    exit 1
fi
