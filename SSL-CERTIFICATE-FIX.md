# SSL 证书配置指南

## 问题

访问 zjsifan.com 时浏览器提示：
```
您与此网站之间建立的连接不安全
请勿在此网站上输入任何敏感信息(例如密码或信用卡信息)，因为攻击者可能会盗取这些信息。
```

## 原因

网站没有配置 HTTPS/SSL 证书，或者证书已过期。

---

## 解决方案：使用 Let's Encrypt 免费证书

### 步骤 1：安装 certbot

在服务器（42.121.218.14）上执行：

```bash
# CentOS/RHEL 8/9 (根据系统选择)
sudo dnf install -y epel-release
sudo dnf install -y certbot python3-certbot-nginx

# 或者使用 yum（如果是较老的系统）
sudo yum install -y epel-release
sudo yum install -y certbot python3-certbot-nginx

# 或者 Ubuntu/Debian
sudo apt update
sudo apt install -y certbot python3-certbot-nginx
```

### 步骤 2：获取 SSL 证书

```bash
# 方式 A：自动配置 Nginx（推荐）
sudo certbot --nginx -d zjsifan.com -d www.zjsifan.com

# 方式 B：仅获取证书，手动配置 Nginx
sudo certbot certonly --nginx -d zjsifan.com -d www.zjsifan.com
```

执行过程中会提示：
1. 输入邮箱地址（用于证书过期提醒）
2. 同意服务条款
3. 选择是否共享邮箱
4. 选择是否强制 HTTPS 重定向（推荐选择是）

### 步骤 3：验证 Nginx 配置

certbot 会自动修改 Nginx 配置文件，查看修改：

```bash
# 查看 Nginx 配置
sudo cat /etc/nginx/conf.d/*.conf

# 或者查看主配置
sudo cat /etc/nginx/nginx.conf
```

应该能看到类似这样的配置：

```nginx
server {
    listen 80;
    server_name zjsifan.com www.zjsifan.com;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name zjsifan.com www.zjsifan.com;

    ssl_certificate /etc/letsencrypt/live/zjsifan.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/zjsifan.com/privkey.pem;

    # ... 其他配置
}
```

### 步骤 4：重启 Nginx

```bash
# 测试 Nginx 配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx

# 查看状态
sudo systemctl status nginx
```

### 步骤 5：验证 HTTPS

```bash
# 检查 443 端口是否监听
sudo netstat -tuln | grep 443

# 测试 HTTPS 连接
curl -I https://www.zjsifan.com
```

然后访问浏览器：
- https://www.zjsifan.com
- https://zjsifan.com

应该能看到浏览器地址栏的锁形图标 ✅

---

## 证书自动续期

Let's Encrypt 证书有效期为 90 天，需要自动续期：

```bash
# 测试续期（不实际续期）
sudo certbot renew --dry-run

# 添加自动续期任务（cron）
echo "0 3 * * * root certbot renew --quiet --post-hook 'systemctl reload nginx'" | sudo tee -a /etc/crontab
```

或者使用 systemd timer：

```bash
sudo systemctl enable certbot-renew.timer
sudo systemctl start certbot-renew.timer
```

---

## 如果遇到问题

### 问题 1：端口 80 被占用

```bash
# 检查 80 端口占用
sudo netstat -tuln | grep :80

# 如果被占用，停止占用 80 端口的服务
sudo systemctl stop <占用服务的名称>
```

### 问题 2：域名 DNS 未解析

```bash
# 检查域名解析
nslookup zjsifan.com
dig zjsifan.com

# 确保 A 记录指向 42.121.218.14
```

### 问题 3：防火墙阻止 80/443 端口

```bash
# 检查防火墙状态
sudo firewall-cmd --list-all

# 开放端口
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload
```

### 问题 4：Nginx 配置错误

```bash
# 查看错误日志
sudo tail -100 /var/log/nginx/error.log

# 测试配置
sudo nginx -t
```

---

## 手动配置 Nginx（如果自动配置失败）

如果 certbot 自动配置失败，可以手动配置 Nginx：

```bash
# 编辑 Nginx 配置文件
sudo vim /etc/nginx/conf.d/sifan.conf
```

添加以下内容：

```nginx
# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name zjsifan.com www.zjsifan.com;
    return 301 https://$host$request_uri;
}

# HTTPS 配置
server {
    listen 443 ssl http2;
    server_name zjsifan.com www.zjsifan.com;

    # SSL 证书路径
    ssl_certificate /etc/letsencrypt/live/zjsifan.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/zjsifan.com/privkey.pem;

    # SSL 配置优化
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;
    ssl_prefer_server_ciphers on;

    # 代理到 Next.js
    location / {
        proxy_pass http://localhost:3000;  # 或 5000，根据实际端口
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
```

然后重启 Nginx：

```bash
sudo nginx -t
sudo systemctl restart nginx
```

---

## 验证 SSL 证书

访问以下网站验证证书配置：
- https://www.ssllabs.com/ssltest/analyze.html?d=www.zjsifan.com
- https://decoder.link/sslchecker/www.zjsifan.com

---

## 快速修复命令汇总

```bash
# 1. 安装 certbot
sudo dnf install -y certbot python3-certbot-nginx

# 2. 获取证书（自动配置 Nginx）
sudo certbot --nginx -d zjsifan.com -d www.zjsifan.com

# 3. 重启 Nginx
sudo systemctl restart nginx

# 4. 验证
curl -I https://www.zjsifan.com
```

---

## 注意事项

⚠️ **重要**：
1. 确保域名 DNS 已正确解析到服务器 IP
2. 确保防火墙已开放 80 和 443 端口
3. 证书有效期为 90 天，需要配置自动续期
4. 配置后访问 `https://zjsifan.com`（注意是 https）
