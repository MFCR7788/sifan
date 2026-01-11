#!/bin/bash

# ==========================================
# 完整部署 + SSL 证书安装脚本
# 在服务器上执行此脚本
# ==========================================

set -e

echo "=========================================="
echo "完整部署 + SSL 证书安装"
echo "时间: $(date)"
echo "=========================================="

# 配置
APP_DIR="/root/sifan"
DOMAIN="zjsifan.com"

cd /root

# ==========================================
# 步骤 1: 同步代码
# ==========================================
echo ""
echo "步骤 1: 同步代码"
echo "----------------------------------------"

# 克隆或拉取代码
if [ ! -d "$APP_DIR" ]; then
    echo "克隆仓库..."
    git clone https://ghproxy.com/https://github.com/MFCR7788/sifan.git $APP_DIR
else
    cd $APP_DIR
    echo "设置 GitHub 镜像 URL..."
    git remote set-url origin https://ghproxy.com/https://github.com/MFCR7788/sifan.git
    echo "拉取最新代码..."
    git fetch origin main
    git reset --hard origin/main
    git clean -fd
fi

cd $APP_DIR

# ==========================================
# 步骤 2: 安装依赖并构建
# ==========================================
echo ""
echo "步骤 2: 安装依赖并构建"
echo "----------------------------------------"

# 安装 pnpm（如果未安装）
if ! command -v pnpm &> /dev/null; then
    echo "安装 pnpm..."
    npm install -g pnpm
fi

# 安装依赖
echo "安装依赖..."
pnpm install

# 构建项目
echo "构建项目..."
pnpm run build

# ==========================================
# 步骤 3: 配置环境变量
# ==========================================
echo ""
echo "步骤 3: 配置环境变量"
echo "----------------------------------------"

if [ ! -f ".env.production" ]; then
    echo "创建 .env.production..."
    cat > .env.production << EOF
NODE_ENV=production
PORT=5000
PGDATABASE_URL=postgresql://user_7591422450290704422:aef1a966-5890-4e13-a499-e5a8b0e8b0b4@cp-cute-mist-247e1363.pg2.aidap-global.cn-beijing.volces.com:5432/Database_1767516520571?sslmode=require&channel_binding=require
PGDATABASE=Database_1767516520571
DATABASE_URL=postgresql://user_7591422450290704422:aef1a966-5890-4e13-a499-e5a8b0e8b0b4@cp-cute-mist-247e1363.pg2.aidap-global.cn-beijing.volces.com:5432/Database_1767516520571?sslmode=require&channel_binding=require
EOF
else
    echo ".env.production 已存在"
fi

# ==========================================
# 步骤 4: 启动 Next.js 应用
# ==========================================
echo ""
echo "步骤 4: 启动 Next.js 应用"
echo "----------------------------------------"

# 确保 ecosystem.config.js 存在
if [ ! -f "ecosystem.config.js" ]; then
    echo "创建 PM2 配置..."
    cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'enterprise-website',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -p 5000',
    cwd: '/root/sifan',
    instances: 2,
    exec_mode: 'cluster',
    autorestart: true,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
      PGDATABASE_URL: 'postgresql://user_7591422450290704422:aef1a966-5890-4e13-a499-e5a8b0e8b0b4@cp-cute-mist-247e1363.pg2.aidap-global.cn-beijing.volces.com:5432/Database_1767516520571?sslmode=require&channel_binding=require',
      PGDATABASE: 'Database_1767516520571'
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log'
  }]
};
EOF
fi

# 重启服务
echo "重启 PM2 服务..."
if pm2 list | grep -q "enterprise-website"; then
    pm2 restart enterprise-website
else
    pm2 start ecosystem.config.js
fi
pm2 save

# 等待服务启动
echo "等待服务启动..."
sleep 5

# 检查服务状态
if pm2 list | grep "enterprise-website" | grep -q "online"; then
    echo "✓ Next.js 应用已启动"
else
    echo "✗ Next.js 应用启动失败"
    pm2 logs enterprise-website --lines 20
fi

# ==========================================
# 步骤 5: 安装 Nginx 和 Certbot
# ==========================================
echo ""
echo "步骤 5: 安装 Nginx 和 Certbot"
echo "----------------------------------------"

# 检测系统版本
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    OS="centos"
fi

case $OS in
    ubuntu|debian)
        if ! command -v nginx &> /dev/null; then
            apt-get update
            apt-get install -y nginx
        fi
        if ! command -v certbot &> /dev/null; then
            apt-get install -y certbot python3-certbot-nginx
        fi
        ;;
    centos|rhel|rocky|almalinux)
        if ! command -v nginx &> /dev/null; then
            yum install -y nginx
        fi
        if ! command -v certbot &> /dev/null; then
            yum install -y epel-release
            yum install -y certbot python3-certbot-nginx
        fi
        ;;
esac

echo "✓ Nginx 和 Certbot 已安装"

# ==========================================
# 步骤 6: 申请 SSL 证书
# ==========================================
echo ""
echo "步骤 6: 申请 SSL 证书"
echo "----------------------------------------"

# 检查证书是否已存在
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo "SSL 证书已存在，跳过申请"
else
    echo "申请 SSL 证书..."

    # 停止 Nginx 以释放 80 端口
    systemctl stop nginx 2>/dev/null || true

    # 使用 standalone 模式申请证书
    certbot certonly --standalone \
        -d $DOMAIN \
        -d www.$DOMAIN \
        --non-interactive \
        --agree-tos \
        --email admin@$DOMAIN || {
        echo "✗ SSL 证书申请失败"
        systemctl start nginx
        exit 1
    }

    echo "✓ SSL 证书申请成功"
fi

# ==========================================
# 步骤 7: 配置 Nginx
# ==========================================
echo ""
echo "步骤 7: 配置 Nginx"
echo "----------------------------------------"

# 创建 Nginx 配置
cat > /etc/nginx/conf.d/sifan.conf << EOF
# HTTP 重定向到 HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name $DOMAIN www.$DOMAIN;
    return 301 https://\$server_name\$request_uri;
}

# HTTPS 配置
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name $DOMAIN www.$DOMAIN;

    # SSL 证书
    ssl_certificate /etc/letsencrypt/live/$DOMAIN/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/$DOMAIN/privkey.pem;

    # SSL 安全配置
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # 日志
    access_log /var/log/nginx/sifan-access.log;
    error_log /var/log/nginx/sifan-error.log;

    # 反向代理到 Next.js (端口 5000)
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;

        # 超时配置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# 删除默认配置
rm -f /etc/nginx/conf.d/default.conf

# 测试配置
nginx -t

# 重启 Nginx
systemctl enable nginx
systemctl restart nginx

echo "✓ Nginx 已配置并启动"

# ==========================================
# 步骤 8: 配置自动续期
# ==========================================
echo ""
echo "步骤 8: 配置自动续期"
echo "----------------------------------------"

# 添加自动续期任务
(crontab -l 2>/dev/null | grep -v "certbot renew"; \
echo "0 3 * * * certbot renew --quiet --nginx && systemctl reload nginx") | crontab -

echo "✓ 自动续期任务已配置 (每天凌晨 3 点)"

# ==========================================
# 步骤 9: 验证部署
# ==========================================
echo ""
echo "步骤 9: 验证部署"
echo "--------------------------------========="

# 检查 PM2 服务
echo ""
echo "PM2 服务状态："
pm2 list

# 检查 Nginx 服务
echo ""
echo "Nginx 服务状态："
systemctl status nginx --no-pager | head -10

# 检查端口监听
echo ""
echo "端口监听状态："
netstat -tuln | grep -E ':(80|443|5000)'

# 测试 HTTP
echo ""
echo "测试 HTTP 访问："
curl -I -m 5 http://$DOMAIN 2>&1 | head -3

# 测试 HTTPS
echo ""
echo "测试 HTTPS 访问："
curl -I -m 5 https://$DOMAIN 2>&1 | head -3

# 显示证书信息
echo ""
echo "SSL 证书信息："
certbot certificates

echo ""
echo "=========================================="
echo "部署完成！"
echo "=========================================="
echo ""
echo "访问网站："
echo "  https://$DOMAIN"
echo "  https://www.$DOMAIN"
echo ""
echo "浏览器地址栏应显示锁形图标"
