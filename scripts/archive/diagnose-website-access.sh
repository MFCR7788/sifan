#!/bin/bash

# 网站访问诊断脚本
# 用于排查 www.zjsifan.com 无法访问的问题

set -e

echo "========================================="
echo "    网站访问诊断脚本"
echo "========================================="

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置变量
DOMAIN="www.zjsifan.com"
SERVER_IP="42.121.218.14"
NGINX_PORT="80"
BACKEND_PORTS=("3000" "5000")

# 诊断结果数组
declare -a ISSUES
declare -a OKS

# 添加问题
add_issue() {
    ISSUES+=("$1")
}

# 添加正常项
add_ok() {
    OKS+=("$1")
}

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}步骤 1: 检查DNS域名解析${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# 检查域名解析
if command -v nslookup &> /dev/null; then
    echo "使用 nslookup 检查DNS解析..."
    DNS_RESULT=$(nslookup $DOMAIN 2>&1)
    DNS_IP=$(echo "$DNS_RESULT" | grep -A 1 "Name:" | tail -1 | awk '{print $2}')

    echo "域名: $DOMAIN"
    echo "解析结果: $DNS_IP"
    echo "服务器IP: $SERVER_IP"

    if [ -z "$DNS_IP" ]; then
        echo -e "${RED}❌ 域名无法解析${NC}"
        add_issue "域名DNS解析失败 - 域名可能未正确配置"
    elif [ "$DNS_IP" == "$SERVER_IP" ]; then
        echo -e "${GREEN}✅ DNS解析正确${NC}"
        add_ok "DNS解析正确: $DOMAIN -> $SERVER_IP"
    else
        echo -e "${YELLOW}⚠️  DNS解析IP与服务器IP不匹配${NC}"
        add_issue "DNS解析IP($DNS_IP) 与服务器IP($SERVER_IP) 不匹配"
    fi
else
    echo -e "${YELLOW}⚠️  未安装nslookup，跳过DNS检查${NC}"
fi

echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}步骤 2: 检查服务器端口监听${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# 检查80端口
if ss -tuln | grep -q ":${NGINX_PORT}.*LISTEN"; then
    echo -e "${GREEN}✅ ${NGINX_PORT}端口(nginx) 已监听${NC}"
    add_ok "80端口(nginx)正常监听"
else
    echo -e "${RED}❌ ${NGINX_PORT}端口(nginx) 未监听${NC}"
    add_issue "80端口未监听 - nginx可能未运行"
fi

# 检查后端端口
BACKEND_RUNNING=""
for port in "${BACKEND_PORTS[@]}"; do
    if ss -tuln | grep -q ":${port}.*LISTEN"; then
        echo -e "${GREEN}✅ ${port}端口(Next.js) 已监听${NC}"
        BACKEND_RUNNING=$port
        add_ok "Next.js运行在${port}端口"
    fi
done

if [ -z "$BACKEND_RUNNING" ]; then
    echo -e "${RED}❌ 后端端口(${BACKEND_PORTS[@]}) 均未监听${NC}"
    add_issue "Next.js未运行 - ${BACKEND_PORTS[@]}端口均无服务"
fi

echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}步骤 3: 检查Nginx配置${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

NGINX_CONF="/etc/nginx/sites-available/zjsifan.com"

if [ -f "$NGINX_CONF" ]; then
    echo -e "${GREEN}✅ Nginx配置文件存在${NC}"
    echo ""
    echo "Nginx配置内容："
    echo "----------------------------------------"
    cat "$NGINX_CONF"
    echo "----------------------------------------"
    echo ""

    # 检查proxy_pass配置
    PROXY_PASS=$(cat "$NGINX_CONF" | grep "proxy_pass" | awk '{print $2}')
    echo "proxy_pass配置: $PROXY_PASS"

    if echo "$PROXY_PASS" | grep -q "3000"; then
        if [ "$BACKEND_RUNNING" == "5000" ]; then
            echo -e "${RED}❌ Nginx配置错误：指向3000端口，但Next.js运行在5000端口${NC}"
            add_issue "Nginx配置错误 - proxy_pass指向3000，应指向${BACKEND_RUNNING}"
        fi
    elif echo "$PROXY_PASS" | grep -q "5000"; then
        if [ "$BACKEND_RUNNING" == "5000" ]; then
            echo -e "${GREEN}✅ Nginx配置正确${NC}"
            add_ok "Nginx配置正确 - proxy_pass指向${BACKEND_RUNNING}端口"
        fi
    fi

    # 检查nginx配置语法
    if nginx -t 2>&1 | grep -q "successful"; then
        echo -e "${GREEN}✅ Nginx配置语法正确${NC}"
        add_ok "Nginx配置语法正确"
    else
        echo -e "${RED}❌ Nginx配置语法错误${NC}"
        nginx -t 2>&1 | tail -5
        add_issue "Nginx配置语法错误 - 请检查配置文件"
    fi

else
    echo -e "${RED}❌ Nginx配置文件不存在${NC}"
    add_issue "Nginx配置文件不存在 - 需要创建配置文件"
fi

echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}步骤 4: 测试HTTP访问${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# 测试本地访问
echo "测试1: 本地访问服务器"
if curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:$NGINX_PORT | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✅ 本地可以访问服务器${NC}"
    add_ok "本地访问成功 - http://localhost:$NGINX_PORT"
else
    echo -e "${RED}❌ 本地无法访问服务器${NC}"
    add_issue "本地访问失败 - nginx配置或服务可能有问题"
fi

echo ""
echo "测试2: 本地访问后端"
if [ -n "$BACKEND_RUNNING" ]; then
    BACKEND_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://localhost:$BACKEND_RUNNING)
    if echo "$BACKEND_CODE" | grep -q "200\|301\|302"; then
        echo -e "${GREEN}✅ 后端服务正常 (HTTP $BACKEND_CODE)${NC}"
        add_ok "后端服务正常 - 端口$BACKEND_RUNNING返回$BACKEND_CODE"
    else
        echo -e "${YELLOW}⚠️  后端服务异常 (HTTP $BACKEND_CODE)${NC}"
        add_issue "后端服务异常 - 端口$BACKEND_RUNNING返回$BACKEND_CODE"
    fi
fi

echo ""
echo "测试3: 本地访问域名"
DOMAIN_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 5 http://$DOMAIN 2>&1)
if echo "$DOMAIN_CODE" | grep -q "200\|301\|302"; then
    echo -e "${GREEN}✅ 域名访问正常 (HTTP $DOMAIN_CODE)${NC}"
    add_ok "域名访问成功 - http://$DOMAIN"
elif echo "$DOMAIN_CODE" | grep -q "000"; then
    echo -e "${RED}❌ 域名无法访问 (连接超时/拒绝)${NC}"
    add_issue "域名无法访问 - 可能DNS解析失败或防火墙阻止"
else
    echo -e "${YELLOW}⚠️  域名访问异常 (HTTP $DOMAIN_CODE)${NC}"
    add_issue "域名访问异常 - HTTP状态码: $DOMAIN_CODE"
fi

echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}步骤 5: 检查防火墙配置${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# 检查防火墙
if command -v firewall-cmd &> /dev/null; then
    echo "检测到 firewalld"
    if firewall-cmd --list-ports | grep -q "80/tcp"; then
        echo -e "${GREEN}✅ 防火墙已开放80端口${NC}"
        add_ok "firewalld已开放80端口"
    else
        echo -e "${YELLOW}⚠️  防火墙可能未开放80端口${NC}"
        add_issue "firewalld可能未开放80端口"
    fi
elif command -v ufw &> /dev/null; then
    echo "检测到 ufw"
    if ufw status | grep -q "80/tcp"; then
        echo -e "${GREEN}✅ 防火墙已开放80端口${NC}"
        add_ok "ufw已开放80端口"
    else
        echo -e "${YELLOW}⚠️  防火墙可能未开放80端口${NC}"
        add_issue "ufw可能未开放80端口"
    fi
else
    echo -e "${YELLOW}⚠️  未检测到防火墙管理工具${NC}"
fi

echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}步骤 6: 检查阿里云安全组提示${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

echo -e "${YELLOW}⚠️  需要手动检查阿里云安全组配置${NC}"
echo ""
echo "请在阿里云控制台检查："
echo "  1. 实例ID: 找到服务器(42.121.218.14)"
echo "  2. 安全组: 检查安全组规则"
echo "  3. 入方向规则: 确认80端口已开放"
echo ""
echo "期望的入方向规则："
echo "  端口范围: 80/80"
echo "  协议类型: TCP"
echo "  授权对象: 0.0.0.0/0"

add_issue "需要手动检查阿里云安全组是否开放80端口"

echo ""
echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}诊断总结${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

if [ ${#OKS[@]} -gt 0 ]; then
    echo -e "${GREEN}正常项 (${#OKS[@]}):${NC}"
    for item in "${OKS[@]}"; do
        echo "  ✅ $item"
    done
    echo ""
fi

if [ ${#ISSUES[@]} -gt 0 ]; then
    echo -e "${RED}发现的问题 (${#ISSUES[@]}):${NC}"
    for i in "${!ISSUES[@]}"; do
        echo "  $((i+1)). ${ISSUES[$i]}"
    done
    echo ""
fi

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}解决方案${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# 根据问题提供解决方案
if echo "${ISSUES[@]}" | grep -q "Nginx配置错误"; then
    echo -e "${GREEN}1. 修复Nginx配置${NC}"
    echo "   执行: sudo ./fix-nginx-port.sh"
    echo ""
fi

if echo "${ISSUES[@]}" | grep -q "阿里云安全组"; then
    echo -e "${GREEN}2. 配置阿里云安全组${NC}"
    echo "   步骤:"
    echo "   1) 登录阿里云控制台"
    echo "   2) 进入 ECS > 实例 > 安全组"
    echo "   3) 添加入方向规则: 端口80, 协议TCP, 授权对象0.0.0.0/0"
    echo ""
fi

if echo "${ISSUES[@]}" | grep -q "DNS解析"; then
    echo -e "${GREEN}3. 检查DNS配置${NC}"
    echo "   确保 www.zjsifan.com 已解析到 42.121.218.14"
    echo "   使用: nslookup www.zjsifan.com"
    echo ""
fi

if echo "${ISSUES[@]}" | grep -q "Nginx未运行\|80端口未监听"; then
    echo -e "${GREEN}4. 启动Nginx${NC}"
    echo "   执行: sudo service nginx start"
    echo "   检查: sudo service nginx status"
    echo ""
fi

if echo "${ISSUES[@]}" | grep -q "Next.js未运行"; then
    echo -e "${GREEN}5. 启动Next.js${NC}"
    echo "   执行: pnpm run dev"
    echo "   或者使用PM2: pm2 start npm --name \"nextjs\" -- start"
    echo ""
fi

echo -e "${BLUE}=========================================${NC}"
echo ""
echo "诊断完成！"
echo ""
