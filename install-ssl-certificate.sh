#!/bin/bash

# ==========================================
# 安装 SSL 证书脚本
# 域名: zjsifan.com, www.zjsifan.com
# ==========================================

set -e

echo "=========================================="
echo "安装 SSL 证书 (Let's Encrypt)"
echo "时间: $(date)"
echo "=========================================="

# 检查 certbot 是否已安装
if ! command -v certbot &> /dev/null; then
    echo "未安装 certbot，正在安装..."
    
    # 检测系统版本
    if [ -f /etc/os-release ]; then
        . /etc/os-release
        OS=$ID
    else
        echo "无法检测操作系统版本"
        exit 1
    fi
    
    case $OS in
        ubuntu|debian)
            echo "安装 certbot (Ubuntu/Debian)..."
            apt-get update
            apt-get install -y certbot python3-certbot-nginx
            ;;
        centos|rhel|rocky|almalinux)
            echo "安装 certbot (CentOS/RHEL)..."
            yum install -y epel-release
            yum install -y certbot python3-certbot-nginx
            ;;
        *)
            echo "不支持的操作系统: $OS"
            exit 1
            ;;
    esac
else
    echo "✓ certbot 已安装"
fi

echo ""
echo "步骤 1: 检查 Nginx 配置"
echo "----------------------------------------"

# 检查 Nginx 是否安装
if ! command -v nginx &> /dev/null; then
    echo "未安装 Nginx，正在安装..."
    
    case $OS in
        ubuntu|debian)
            apt-get install -y nginx
            ;;
        centos|rhel)
            yum install -y nginx
            ;;
    esac
fi

# 检查 Nginx 状态
if systemctl is-active --quiet nginx; then
    echo "✓ Nginx 正在运行"
else
    echo "启动 Nginx..."
    systemctl start nginx
fi

echo ""
echo "步骤 2: 配置 Nginx 反向代理"
echo "----------------------------------------"

# 备份现有配置
if [ -f /etc/nginx/sites-available/default ]; then
    cp /etc/nginx/sites-available/default /etc/nginx/sites-available/default.backup.$(date +%s)
fi

# 创建 Nginx 配置
cat > /etc/nginx/sites-available/sifan.conf << 'EOF'
# HTTP 重定向到 HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name zjsifan.com www.zjsifan.com;

    location / {
        return 301 https://$server_name$request_uri;
    }
}

# HTTPS 配置
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name zjsifan.com www.zjsifan.com;

    # SSL 证书路径 (certbot 会自动配置)
    ssl_certificate /etc/letsencrypt/live/zjsifan.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/zjsifan.com/privkey.pem;

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
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;

        # 超时配置
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }
}
EOF

# 创建符号链接
ln -sf /etc/nginx/sites-available/sifan.conf /etc/nginx/sites-enabled/

# 删除默认配置（如果存在）
rm -f /etc/nginx/sites-enabled/default

echo ""
echo "步骤 3: 测试 Nginx 配置"
echo "----------------------------------------"
nginx -t

echo ""
echo "步骤 4: 重启 Nginx"
echo "----------------------------------------"
systemctl reload nginx

echo ""
echo "步骤 5: 申请 SSL 证书"
echo "----------------------------------------"
echo "请确保："
echo "  1. 域名 zjsifan.com 和 www.zjsifan.com 的 DNS 已解析到服务器 IP"
echo "  2. 服务器的 80 和 443 端口已开放"
echo ""
read -p "是否继续申请 SSL 证书？(y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    # 使用 standalone 模式申请证书（certbot 会临时占用 80 端口）
    certbot certonly --standalone -d zjsifan.com -d www.zjsifan.com --email your-email@example.com --agree-tos --no-eff-email
    
    echo ""
    echo "✓ SSL 证书申请成功"
    echo ""
    echo "步骤 6: 设置自动续期"
    echo "----------------------------------------"
    
    # 设置自动续期任务
    (crontab -l 2>/dev/null | grep -v "certbot renew"; echo "0 3 * * * certbot renew --quiet && systemctl reload nginx") | crontab -
    
    echo "✓ 自动续期任务已添加 (每天凌晨 3 点)"
    
    echo ""
    echo "步骤 7: 重新加载 Nginx"
    echo "----------------------------------------"
    systemctl reload nginx
    
    echo ""
    echo "=========================================="
    echo "SSL 证书安装完成！"
    echo "=========================================="
    echo ""
    echo "访问网站："
    echo "  https://zjsifan.com"
    echo "  https://www.zjsifan.com"
    echo ""
    echo "证书信息："
    certbot certificates
else
    echo "已取消 SSL 证书申请"
fi

echo ""
echo "=========================================="
echo "完成"
echo "=========================================="
