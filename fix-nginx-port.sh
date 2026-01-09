#!/bin/bash

# 修复nginx配置 - 将代理端口从3000改为5000
# 作者: 自动生成
# 日期: $(date '+%Y-%m-%d')

set -e

echo "========================================="
echo "    修复Nginx配置端口"
echo "========================================="

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}请使用 sudo 运行此脚本${NC}"
    exit 1
fi

NGINX_CONF="/etc/nginx/sites-available/zjsifan.com"

echo -e "${GREEN}[1/4] 备份当前配置...${NC}"

if [ -f "$NGINX_CONF" ]; then
    cp "$NGINX_CONF" "${NGINX_CONF}.backup.$(date +%Y%m%d_%H%M%S)"
    echo -e "${GREEN}配置已备份${NC}"
else
    echo -e "${RED}nginx配置文件不存在${NC}"
    exit 1
fi

echo -e "${GREEN}[2/4] 检查Next.js运行端口...${NC}"

# 检查5000端口
if ss -tuln | grep -q ':5000.*LISTEN'; then
    BACKEND_PORT="5000"
    echo -e "${GREEN}检测到Next.js运行在5000端口${NC}"
elif ss -tuln | grep -q ':3000.*LISTEN'; then
    BACKEND_PORT="3000"
    echo -e "${GREEN}检测到Next.js运行在3000端口${NC}"
else
    echo -e "${RED}未检测到Next.js在3000或5000端口运行${NC}"
    exit 1
fi

echo -e "${GREEN}[3/4] 更新nginx配置...${NC}"

# 更新nginx配置
cat > "$NGINX_CONF" << EOF
server {
    listen 80;
    server_name zjsifan.com www.zjsifan.com;

    location / {
        proxy_pass http://localhost:${BACKEND_PORT};
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_cache_bypass \$http_upgrade;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

echo -e "${GREEN}nginx配置已更新（代理端口: ${BACKEND_PORT}）${NC}"

echo -e "${GREEN}[4/4] 测试并重启nginx...${NC}"

# 测试nginx配置
if nginx -t; then
    echo -e "${GREEN}nginx配置测试通过${NC}"
else
    echo -e "${RED}nginx配置测试失败，正在恢复备份...${NC}"
    # 找到最新的备份文件
    BACKUP_FILE=$(ls -t ${NGINX_CONF}.backup.* | head -1)
    cp "$BACKUP_FILE" "$NGINX_CONF"
    exit 1
fi

# 重启nginx
service nginx restart

echo -e "${GREEN}nginx已重启${NC}"

echo ""
echo -e "${GREEN}========================================="
echo -e "    配置修复完成！"
echo "========================================="
echo ""
echo -e "${GREEN}配置信息：${NC}"
echo "  后端端口: ${BACKEND_PORT}"
echo "  配置文件: $NGINX_CONF"
echo ""
echo -e "${GREEN}访问地址：${NC}"
echo "  http://zjsifan.com"
echo "  http://www.zjsifan.com"
echo "  http://42.121.218.14"
echo ""
echo -e "${YELLOW}注意事项：${NC}"
echo "  - 如果仍然无法访问，请检查阿里云安全组80端口"
echo "  - 确保防火墙开放80端口"
echo ""
