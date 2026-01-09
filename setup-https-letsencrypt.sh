#!/bin/bash

# HTTPS 配置脚本 - 使用 Let's Encrypt 免费SSL证书
# 作者: 自动生成
# 日期: $(date '+%Y-%m-%d')

set -e

echo "========================================="
echo "    HTTPS 配置脚本 (Let's Encrypt)"
echo "========================================="

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 配置变量
DOMAIN="zjsifan.com"
WWW_DOMAIN="www.zjsifan.com"
BACKEND_PORT="5000"
NGINX_CONF="/etc/nginx/sites-available/${DOMAIN}"

# 检查是否为root用户
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}请使用 sudo 运行此脚本${NC}"
    exit 1
fi

echo -e "${GREEN}[1/7] 检查系统环境...${NC}"

# 检查操作系统
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
    VERSION=$VERSION_ID
    echo -e "${GREEN}检测到操作系统: $OS $VERSION${NC}"
else
    echo -e "${RED}无法检测操作系统${NC}"
    exit 1
fi

echo -e "${GREEN}[2/7] 检查域名DNS解析...${NC}"

# 检查域名解析
if command -v nslookup &> /dev/null; then
    SERVER_IP=$(hostname -I | awk '{print $1}')
    DOMAIN_IP=$(nslookup ${WWW_DOMAIN} | grep -A 1 "Name:" | tail -1 | awk '{print $2}')
    
    if [ "$SERVER_IP" == "$DOMAIN_IP" ]; then
        echo -e "${GREEN}域名DNS解析正确: ${WWW_DOMAIN} -> ${DOMAIN_IP}${NC}"
    else
        echo -e "${YELLOW}警告: 域名解析IP (${DOMAIN_IP}) 与服务器IP (${SERVER_IP}) 不匹配${NC}"
        echo -e "${YELLOW}请确保DNS已正确解析后继续${NC}"
        read -p "是否继续? (y/N): " continue_install
        if [[ ! $continue_install =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
else
    echo -e "${YELLOW}未安装 nslookup，跳过DNS检查${NC}"
fi

echo -e "${GREEN}[3/7] 检查80端口可访问性...${NC}"

# 检查80端口是否监听
if ss -tuln | grep -q ':80.*LISTEN'; then
    echo -e "${GREEN}80端口已在监听${NC}"
else
    echo -e "${RED}80端口未监听，无法完成Let's Encrypt验证${NC}"
    exit 1
fi

echo -e "${GREEN}[4/7] 更新nginx配置（修正后端端口）...${NC}"

# 创建备份
if [ -f "$NGINX_CONF" ]; then
    cp "$NGINX_CONF" "${NGINX_CONF}.backup.$(date +%Y%m%d_%H%M%S)"
    echo -e "${GREEN}已备份原配置${NC}"
fi

# 更新nginx配置
cat > "$NGINX_CONF" << 'EOF'
# HTTP配置（临时，用于Let's Encrypt验证）
server {
    listen 80;
    server_name zjsifan.com www.zjsifan.com;

    # Let's Encrypt验证目录
    location ^~ /.well-known/acme-challenge/ {
        root /var/www/certbot;
        allow all;
    }

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
EOF

echo -e "${GREEN}nginx配置已更新${NC}"

# 创建certbot验证目录
mkdir -p /var/www/certbot
chown -R www-data:www-data /var/www/certbot 2>/dev/null || chown -R nginx:nginx /var/www/certbot 2>/dev/null || true

echo -e "${GREEN}[5/7] 安装Certbot...${NC}"

# 根据操作系统安装certbot
case $OS in
    ubuntu|debian)
        apt-get update
        apt-get install -y certbot python3-certbot-nginx
        ;;
    centos|rhel|fedora)
        if [ "$OS" == "centos" ] && [ "$VERSION" == "7" ]; then
            yum install -y epel-release
            yum install -y certbot python2-certbot-nginx
        else
            dnf install -y certbot python3-certbot-nginx
        fi
        ;;
    alpine)
        apk add --no-cache certbot certbot-nginx
        ;;
    *)
        echo -e "${RED}不支持的操作系统: $OS${NC}"
        exit 1
        ;;
esac

echo -e "${GREEN}Certbot安装完成${NC}"

echo -e "${GREEN}[6/7] 获取SSL证书...${NC}"

# 获取SSL证书
echo ""
echo -e "${YELLOW}请输入您的邮箱（用于证书过期提醒）:${NC}"
read -p "> " EMAIL

if [ -z "$EMAIL" ]; then
    echo -e "${RED}邮箱不能为空${NC}"
    exit 1
fi

# 获取证书（使用webroot方式）
certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email "$EMAIL" \
    --agree-tos \
    --no-eff-email \
    -d "$DOMAIN" \
    -d "$WWW_DOMAIN" || {
    echo -e "${RED}获取SSL证书失败${NC}"
    echo -e "${YELLOW}可能原因：${NC}"
    echo "  1. 域名DNS解析未正确配置"
    echo "  2. 80端口无法从外网访问"
    echo "  3. 阿里云安全组未开放80端口"
    exit 1
}

echo -e "${GREEN}SSL证书获取成功${NC}"

echo -e "${GREEN}[7/7] 配置HTTPS和自动重定向...${NC}"

# 创建HTTPS配置
cat > "$NGINX_CONF" << 'EOF'
# HTTP到HTTPS重定向
server {
    listen 80;
    listen [::]:80;
    server_name zjsifan.com www.zjsifan.com;

    # Let's Encrypt验证目录
    location ^~ /.well-known/acme-challenge/ {
        root /var/www/certbot;
        allow all;
    }

    # 其他所有请求重定向到HTTPS
    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS配置
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name zjsifan.com www.zjsifan.com;

    # SSL证书配置
    ssl_certificate /etc/letsencrypt/live/zjsifan.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/zjsifan.com/privkey.pem;

    # SSL安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_stapling on;
    ssl_stapling_verify on;

    # 安全头
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # 访问日志和错误日志
    access_log /var/log/nginx/zjsifan.com-https-access.log;
    error_log /var/log/nginx/zjsifan.com-https-error.log;

    # 客户端请求大小限制
    client_max_body_size 50M;

    # Gzip压缩
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript
               application/json application/javascript application/xml+rss
               application/rss+xml font/truetype font/opentype
               application/vnd.ms-fontobject image/svg+xml;

    # 静态资源缓存
    location /_next/static {
        proxy_pass http://localhost:5000;
        proxy_cache_valid 200 60m;
        proxy_cache_bypass $http_pragma $http_authorization;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    location /static {
        proxy_pass http://localhost:5000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # Next.js图片优化
    location /_next/image {
        proxy_pass http://localhost:5000;
        proxy_cache_valid 200 60m;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # API路由
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        add_header Cache-Control "no-store, no-cache, must-revalidate";
    }

    # 所有其他请求
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 健康检查端点
    location /health {
        proxy_pass http://localhost:5000;
        access_log off;
    }
}
EOF

echo -e "${GREEN}HTTPS配置已更新${NC}"

echo -e "${GREEN}[8/8] 配置证书自动续期...${NC}"

# 配置证书自动续期
(crontab -l 2>/dev/null; echo "0 2 * * * certbot renew --quiet && service nginx reload") | crontab -

echo -e "${GREEN}证书自动续期已配置（每天凌晨2点检查）${NC}"

echo -e "${GREEN}[9/9] 测试并重启nginx...${NC}"

# 测试nginx配置
if nginx -t; then
    echo -e "${GREEN}nginx配置测试通过${NC}"
else
    echo -e "${RED}nginx配置测试失败${NC}"
    exit 1
fi

# 重启nginx
service nginx restart

echo -e "${GREEN}nginx已重启${NC}"

echo ""
echo -e "${GREEN}========================================="
echo -e "    HTTPS配置完成！"
echo "========================================="
echo ""
echo -e "${GREEN}配置信息：${NC}"
echo "  域名: $DOMAIN, $WWW_DOMAIN"
echo "  HTTPS端口: 443"
echo "  证书位置: /etc/letsencrypt/live/$DOMAIN/"
echo "  证书有效期: 90天（自动续期已配置）"
echo ""
echo -e "${GREEN}访问地址：${NC}"
echo "  HTTPS: https://$DOMAIN"
echo "  HTTPS: https://$WWW_DOMAIN"
echo ""
echo -e "${GREEN}后续操作：${NC}"
echo "  1. 在阿里云安全组开放443端口"
echo "  2. 测试HTTPS访问：curl -I https://$DOMAIN"
echo "  3. 检查证书状态：certbot certificates"
echo ""
echo -e "${YELLOW}注意事项：${NC}"
echo "  - HTTP请求会自动重定向到HTTPS"
echo "  - 证书会在到期前自动续期"
echo "  - 确保服务器防火墙开放443端口"
echo ""
