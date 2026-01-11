# SSL 证书安装指南

## 问题
网站显示"连接不安全"，需要安装 SSL 证书启用 HTTPS。

## 解决方案

### 方法 1：一键安装（推荐）

在阿里云服务器上执行以下命令：

```bash
# 1. 安装 certbot 和 Nginx
yum install -y epel-release certbot python3-certbot-nginx || \
apt-get update && apt-get install -y certbot python3-certbot-nginx

# 2. 启动 Nginx
systemctl start nginx
systemctl enable nginx

# 3. 申请 SSL 证书
certbot certonly --standalone -d zjsifan.com -d www.zjsifan.com --non-interactive --agree-tos --email admin@zjsifan.com

# 4. 配置 Nginx 使用 HTTPS
cat > /etc/nginx/conf.d/sifan-ssl.conf << 'EOF'
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

# 5. 测试并重启 Nginx
nginx -t && systemctl reload nginx

# 6. 设置自动续期（每天凌晨 3 点）
(crontab -l 2>/dev/null | grep -v "certbot renew"; echo "0 3 * * * certbot renew --quiet --nginx && systemctl reload nginx") | crontab -

# 7. 查看证书状态
certbot certificates
```

### 方法 2：使用安装脚本

1. 上传 `install-ssl-certificate.sh` 到服务器
2. 在服务器上执行：
```bash
cd /root/sifan
chmod +x install-ssl-certificate.sh
bash install-ssl-certificate.sh
```

## 前提条件

1. **DNS 解析**
   - zjsifan.com → 42.121.218.14
   - www.zjsifan.com → 42.121.218.14

2. **端口开放**
   - 在阿里云控制台开放 80 端口
   - 在阿里云控制台开放 443 端口

3. **Next.js 服务运行**
   - 确保 Next.js 应用在 5000 端口运行
   - 检查：`pm2 list`

## 验证安装

安装完成后，访问：
- https://zjsifan.com
- https://www.zjsifan.com

浏览器地址栏应显示锁形图标，表示连接安全。

## 常见问题

### 证书申请失败
- 检查 DNS 解析是否生效：`nslookup zjsifan.com`
- 检查端口是否开放：`netstat -tuln | grep -E ':(80|443)'`
- 检查防火墙：`firewall-cmd --list-all` 或 `ufw status`

### Nginx 配置错误
- 测试配置：`nginx -t`
- 查看错误日志：`tail -f /var/log/nginx/error.log`

### 自动续期失败
- 查看续期日志：`cat /var/log/letsencrypt/letsencrypt.log`
- 手动测试续期：`certbot renew --dry-run`

## 证书信息

- **颁发机构**：Let's Encrypt
- **有效期**：90 天
- **自动续期**：每天凌晨 3 点检查并续期
- **证书路径**：/etc/letsencrypt/live/zjsifan.com/

## 参考资料

- [Certbot 官方文档](https://certbot.eff.org/)
- [Let's Encrypt 官网](https://letsencrypt.org/)
- [Nginx SSL 配置](https://nginx.org/en/docs/http/configuring_https_servers.html)
