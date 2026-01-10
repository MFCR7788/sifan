#!/bin/bash

# 修复 Apache 和 Nginx 端口冲突脚本
# 解决 www.zjsifan.com 显示 Apache 测试页面的问题

set -e

echo "========================================="
echo "    修复 Apache 和 Nginx 端口冲突"
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

echo -e "${GREEN}[1/6] 检查当前Web服务器状态...${NC}"

# 检查Apache
if command -v apachectl &> /dev/null; then
    if pgrep -x httpd > /dev/null || pgrep -x apache2 > /dev/null; then
        echo -e "${YELLOW}检测到 Apache 正在运行${NC}"
        APACHE_RUNNING=true
    else
        echo -e "${GREEN}Apache 未运行${NC}"
        APACHE_RUNNING=false
    fi
else
    echo -e "${GREEN}Apache 未安装${NC}"
    APACHE_RUNNING=false
fi

# 检查Nginx
if command -v nginx &> /dev/null; then
    if pgrep nginx > /dev/null; then
        echo -e "${GREEN}Nginx 正在运行${NC}"
        NGINX_RUNNING=true
    else
        echo -e "${YELLOW}Nginx 未运行${NC}"
        NGINX_RUNNING=false
    fi
else
    echo -e "${RED}Nginx 未安装${NC}"
    exit 1
fi

# 检查80端口占用
if ss -tuln | grep -q ':80.*LISTEN'; then
    PID=$(ss -lptn 'sport = :80' 2>/dev/null | grep pid | sed -n 's/.*pid=\([0-9]*\).*/\1/p' | head -1)
    PROC_NAME=$(ps -p $PID -o comm= 2>/dev/null || echo "unknown")
    echo -e "${YELLOW}80端口被占用: PID=$PID, 进程=$PROC_NAME${NC}"
    PORT_80_OCCUPIED=true
else
    echo -e "${GREEN}80端口未被占用${NC}"
    PORT_80_OCCUPIED=false
fi

echo ""
echo -e "${GREEN}[2/6] 检测问题...${NC}"

# 检测访问 www.zjsifan.com 返回的页面
RESPONSE=$(curl -s http://localhost 2>&1 | head -20)
if echo "$RESPONSE" | grep -qi "apache"; then
    echo -e "${RED}发现问题：当前返回的是 Apache 默认测试页面${NC}"
    echo -e "${RED}原因：Apache 占用了80端口，Nginx无法正常工作${NC}"
    ISSUE_FOUND=true
else
    echo -e "${YELLOW}当前80端口状态正常${NC}"
    ISSUE_FOUND=false
fi

echo ""
echo -e "${GREEN}[3/6] 停止 Apache 服务...${NC}"

# 停止Apache
if [ "$APACHE_RUNNING" = true ]; then
    echo "正在停止 Apache..."
    
    # 尝试不同的Apache停止命令
    if systemctl list-unit-files | grep -q httpd; then
        systemctl stop httpd
        systemctl disable httpd
    elif systemctl list-unit-files | grep -q apache2; then
        systemctl stop apache2
        systemctl disable apache2
    else
        service httpd stop
        service apache2 stop 2>/dev/null || true
        # 禁止Apache开机启动
        chkconfig httpd off 2>/dev/null || true
        update-rc.d -f apache2 remove 2>/dev/null || true
    fi
    
    # 确保进程被杀死
    pkill -9 httpd 2>/dev/null || true
    pkill -9 apache2 2>/dev/null || true
    
    sleep 2
    
    # 验证Apache已停止
    if ! pgrep -x httpd > /dev/null && ! pgrep -x apache2 > /dev/null; then
        echo -e "${GREEN}✅ Apache 已停止${NC}"
    else
        echo -e "${RED}❌ Apache 停止失败${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}Apache 未运行，无需停止${NC}"
fi

echo ""
echo -e "${GREEN}[4/6] 检查 Next.js 运行端口...${NC}"

# 检测Next.js运行端口
BACKEND_PORT=""
if ss -tuln | grep -q ':5000.*LISTEN'; then
    BACKEND_PORT="5000"
    echo -e "${GREEN}检测到 Next.js 运行在 5000 端口${NC}"
elif ss -tuln | grep -q ':3000.*LISTEN'; then
    BACKEND_PORT="3000"
    echo -e "${GREEN}检测到 Next.js 运行在 3000 端口${NC}"
else
    echo -e "${YELLOW}未检测到 Next.js 在常见端口运行${NC}"
    echo -e "${YELLOW}将使用默认端口 5000${NC}"
    BACKEND_PORT="5000"
fi

echo ""
echo -e "${GREEN}[5/6] 更新 Nginx 配置...${NC}"

NGINX_CONF="/etc/nginx/sites-available/zjsifan.com"

# 备份当前配置
if [ -f "$NGINX_CONF" ]; then
    cp "$NGINX_CONF" "${NGINX_CONF}.backup.$(date +%Y%m%d_%H%M%S)"
    echo -e "${GREEN}已备份 Nginx 配置${NC}"
fi

# 创建Nginx配置目录
mkdir -p /etc/nginx/sites-available
mkdir -p /etc/nginx/sites-enabled

# 更新配置
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

echo -e "${GREEN}Nginx 配置已更新（代理端口: ${BACKEND_PORT}）${NC}"

# 创建软链接（如果不存在）
if [ ! -L "/etc/nginx/sites-enabled/zjsifan.com" ]; then
    ln -sf "$NGINX_CONF" /etc/nginx/sites-enabled/zjsifan.com
    echo -e "${GREEN}已创建配置软链接${NC}"
fi

echo ""
echo -e "${GREEN}[6/6] 启动 Nginx 服务...${NC}"

# 测试Nginx配置
if nginx -t; then
    echo -e "${GREEN}Nginx 配置测试通过${NC}"
else
    echo -e "${RED}Nginx 配置测试失败${NC}"
    exit 1
fi

# 重启Nginx
if systemctl list-unit-files | grep -q nginx; then
    systemctl restart nginx
    systemctl enable nginx
else
    service nginx restart
    # 确保 Nginx 开机启动
    chkconfig nginx on 2>/dev/null || update-rc.d nginx defaults 2>/dev/null || true
fi

sleep 2

# 验证Nginx运行
if pgrep nginx > /dev/null; then
    echo -e "${GREEN}✅ Nginx 已启动${NC}"
else
    echo -e "${RED}❌ Nginx 启动失败${NC}"
    exit 1
fi

# 验证80端口
if ss -tuln | grep -q ':80.*LISTEN'; then
    echo -e "${GREEN}✅ 80端口已监听${NC}"
else
    echo -e "${RED}❌ 80端口未监听${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}[7/7] 测试网站访问...${NC}"

# 测试本地访问
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost)
if echo "$HTTP_CODE" | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✅ 本地访问成功 (HTTP $HTTP_CODE)${NC}"
else
    echo -e "${YELLOW}⚠️  本地访问异常 (HTTP $HTTP_CODE)${NC}"
fi

# 检查是否还返回Apache页面
RESPONSE=$(curl -s http://localhost 2>&1 | head -20)
if echo "$RESPONSE" | grep -qi "apache"; then
    echo -e "${RED}❌ 仍然返回 Apache 页面${NC}"
    echo -e "${RED}可能Apache仍在运行或占用80端口${NC}"
else
    echo -e "${GREEN}✅ 不再返回 Apache 页面${NC}"
fi

echo ""
echo -e "${GREEN}========================================="
echo -e "    修复完成！"
echo "========================================="
echo ""
echo -e "${GREEN}状态总结：${NC}"
echo "  ✅ Apache 已停止并禁用"
echo "  ✅ Nginx 已启动并配置"
echo "  ✅ Next.js 端口: ${BACKEND_PORT}"
echo "  ✅ 80端口已监听"
echo ""
echo -e "${GREEN}访问地址：${NC}"
echo "  http://zjsifan.com"
echo "  http://www.zjsifan.com"
echo "  http://42.121.218.14"
echo ""
echo -e "${YELLOW}注意事项：${NC}"
echo "  1. 请验证网站是否正常显示"
echo "  2. 如果问题仍存在，请检查阿里云安全组"
echo "  3. Next.js 应用必须保持运行"
echo ""
echo -e "${YELLOW}验证命令：${NC}"
echo "  curl http://www.zjsifan.com"
echo "  curl -I http://localhost"
echo ""
