# SSL 证书安装 - 立即执行

## 前提条件
✅ DNS 解析已生效（zjsifan.com → 42.121.218.14）
✅ 80 和 443 端口已开放
✅ Next.js 应用在 5000 端口运行

## 方法 1：一键执行（推荐）

SSH 到服务器，执行以下命令：

```bash
# 创建 SSL 安装脚本
cat > /root/sifan/install-ssl-only.sh << 'EOFSCRIPT'
#!/bin/bash

set -e

echo "=========================================="
echo "安装 SSL 证书（Let's Encrypt）"
echo "时间: $(date)"
echo "=========================================="

# 检测系统版本
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$ID
else
    echo "无法检测操作系统版本"
    exit 1
fi

# 步骤 1: 安装 certbot 和 nginx
echo ""
echo "步骤 1: 安装 certbot 和 nginx"
echo "----------------------------------------"

case $OS in
    ubuntu|debian)
        if ! command -v certbot &> /dev/null; then
            echo "安装 certbot..."
            apt-get update
            apt-get install -y certbot python3-certbot-nginx
        fi
        if ! command -v nginx &> /dev/null; then
            echo "安装 nginx..."
            apt-get install -y nginx
        fi
        ;;
    centos|rhel|rocky|almalinux)
        if ! command -v certbot &> /dev/null; then
            echo "安装 epel-release 和 certbot..."
            yum install -y epel-release
            yum install -y certbot python3-certbot-nginx
        fi
        if ! command -v nginx &> /dev/null; then
            echo "安装 nginx..."
            yum install -y nginx
        fi
        ;;
esac

echo "✓ certbot 和 nginx 已安装"

# 步骤 2: 申请 SSL 证书
echo ""
echo "步骤 2: 申请 SSL 证书"
echo "----------------------------------------"

DOMAIN="zjsifan.com"

# 检查证书是否已存在
if [ -f "/etc/letsencrypt/live/$DOMAIN/fullchain.pem" ]; then
    echo "SSL 证书已存在"
    certbot certificates
else
    echo "申请 SSL 证书..."

    # 停止 nginx 以释放 80 端口
    systemctl stop nginx 2>/dev/null || true

    # 申请证书
    certbot certonly --standalone \
        -d $DOMAIN \
        -d www.$DOMAIN \
        --non-interactive \
        --agree-tos \
        --email admin@$DOMAIN || {
        echo "✗ SSL 证书申请失败"
        systemctl start nginx 2>/dev/null || true
        exit 1
    }

    echo "✓ SSL 证书申请成功"
fi

# 步骤 3: 配置 Nginx
echo ""
echo "步骤 3: 配置 Nginx"
echo "----------------------------------------"

cat > /etc/nginx/conf.d/sifan.conf << 'EOF'
# HTTP 重定向到 HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name zjsifan.com www.zjsifan.com;
    return 301 https://$server_name$request_uri;
}

# HTTPS 配置
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name zjsifan.com www.zjsifan.com;

    # SSL 证书
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

# 删除默认配置
rm -f /etc/nginx/conf.d/default.conf

# 测试配置
nginx -t

# 启动并启用 nginx
systemctl enable nginx
systemctl restart nginx

echo "✓ Nginx 已配置并启动"

# 步骤 4: 配置自动续期
echo ""
echo "步骤 4: 配置自动续期"
echo "----------------------------------------"

(crontab -l 2>/dev/null | grep -v "certbot renew"; \
echo "0 3 * * * certbot renew --quiet --nginx && systemctl reload nginx") | crontab -

echo "✓ 自动续期任务已配置 (每天凌晨 3 点)"

# 步骤 5: 验证安装
echo ""
echo "步骤 5: 验证安装"
echo "----------------------------------------"

echo ""
echo "证书信息："
certbot certificates

echo ""
echo "端口监听状态："
netstat -tuln | grep -E ':(80|443)'

echo ""
echo "测试 HTTPS："
curl -I https://zjsifan.com 2>&1 | head -5

echo ""
echo "=========================================="
echo "SSL 证书安装完成！"
echo "=========================================="
echo ""
echo "访问网站："
echo "  https://zjsifan.com"
echo "  https://www.zjsifan.com"
echo ""
echo "浏览器地址栏应显示锁形图标"
EOFSCRIPT

# 赋予执行权限并运行
chmod +x /root/sifan/install-ssl-only.sh
bash /root/sifan/install-ssl-only.sh
```

## 方法 2：分步执行

### 步骤 1：安装 certbot 和 nginx

```bash
# CentOS/RHEL
yum install -y epel-release certbot python3-certbot-nginx nginx

# Ubuntu/Debian
# apt-get update
# apt-get install -y certbot python3-certbot-nginx nginx
```

### 步骤 2：申请 SSL 证书

```bash
# 停止 nginx 以释放 80 端口
systemctl stop nginx

# 申请证书
certbot certonly --standalone \
  -d zjsifan.com \
  -d www.zjsifan.com \
  --non-interactive \
  --agree-tos \
  --email admin@zjsifan.com
```

### 步骤 3：配置 Nginx

```bash
# 创建 Nginx 配置
cat > /etc/nginx/conf.d/sifan.conf << 'EOF'
server {
    listen 80;
    server_name zjsifan.com www.zjsifan.com;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name zjsifan.com www.zjsifan.com;

    ssl_certificate /etc/letsencrypt/live/zjsifan.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/zjsifan.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;

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
    }
}
EOF

# 测试并重启
nginx -t
systemctl enable nginx
systemctl restart nginx
```

### 步骤 4：配置自动续期

```bash
(crontab -l 2>/dev/null | grep -v "certbot renew"; \
echo "0 3 * * * certbot renew --quiet --nginx && systemctl reload nginx") | crontab -
```

## 验证安装

### 检查证书状态

```bash
certbot certificates
```

### 测试 HTTPS

```bash
curl -I https://zjsifan.com
```

### 访问网站

在浏览器中访问：
- https://zjsifan.com
- https://www.zjsifan.com

浏览器地址栏应显示锁形图标。

## 故障排除

### 证书申请失败

```bash
# 检查 DNS 解析
dig +short zjsifan.com

# 检查 80 端口
netstat -tuln | grep :80

# 检查防火墙
firewall-cmd --list-all
# 或
ufw status
```

### Nginx 启动失败

```bash
# 查看错误日志
tail -f /var/log/nginx/error.log

# 测试配置
nginx -t
```

### 浏览器仍显示不安全

```bash
# 检查证书是否正确
certbot certificates

# 重启 nginx
systemctl restart nginx

# 清除浏览器缓存并刷新
```

## 注意事项

1. ⚠️ 确保服务器可以访问 Let's Encrypt 服务器（端口 443）
2. ⚠️ 确保域名 DNS 解析已生效
3. ⚠️ 确保阿里云安全组已开放 80 和 443 端口
4. ✅ 证书有效期为 90 天，自动续期已配置
