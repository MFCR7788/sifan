# HTTPS 不安全问题完整解决方案

## ✅ 配置完成状态

**项目**: 魔法超人系统
**域名**: zjsifan.com, www.zjsifan.com
**证书**: Let's Encrypt (有效期至 2026-04-11)
**状态**: ✅ HTTPS 已配置并正常运行

---

## 问题现象

访问 `www.zjsifan.com` 时浏览器显示"不安全"或出现警告：

```
⚠ 您的连接不是私密连接
⚠ 此站点使用了不支持的协议
⚠ 此证书无效
```

---

## 问题诊断

### 在服务器上执行以下诊断命令：

```bash
# 1. 检查 SSL 证书是否存在
ls -la /etc/letsencrypt/live/zjsifan.com/

# 2. 检查证书有效期
certbot certificates

# 3. 检查 Nginx 是否配置 SSL
grep -r "ssl_certificate" /etc/nginx/

# 4. 检查 443 端口是否监听
netstat -tuln | grep 443

# 5. 测试 HTTPS 连接
curl -I https://www.zjsifan.com

# 6. 检查 Nginx 错误日志
tail -50 /var/log/nginx/error.log
```

---

## 快速解决方案（推荐）

### 方案 1：一键安装脚本 ⚡

**在服务器上直接执行**：

```bash
# 上传脚本到服务器
chmod +x quick-https-install.sh
./quick-https-install.sh
```

脚本会自动：
1. 安装 certbot 和 nginx
2. 检查 DNS 解析
3. 申请 SSL 证书
4. 配置 Nginx HTTPS
5. 配置自动续期

---

### 方案 2：手动命令安装

```bash
# 1. 安装 certbot
apt-get update && apt-get install -y certbot python3-certbot-nginx

# 2. 申请证书（使用 standalone 模式）
certbot certonly --standalone \
    -d zjsifan.com \
    -d www.zjsifan.com \
    --non-interactive \
    --agree-tos \
    --email admin@zjsifan.com

# 3. 配置 Nginx（见下方配置）
# 4. 重启 Nginx
systemctl restart nginx
```

---

## Nginx 配置

### 完整配置文件

将以下内容保存到 `/etc/nginx/conf.d/sifan.conf`：

```nginx
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

    # 反向代理到 Next.js (端口 3000)
    location / {
        proxy_pass http://localhost:3000;
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
```

---

## 常见问题及解决

### 问题 1：证书申请失败

**错误信息**：
```
The client lacks sufficient authorization
```

**原因**：DNS 解析未生效或 80 端口被占用

**解决方案**：
```bash
# 1. 检查 DNS 解析
dig +short zjsifan.com

# 2. 检查 80 端口
netstat -tuln | grep 80

# 3. 如果 80 端口被占用，停止占用的服务
systemctl stop nginx
systemctl stop apache2

# 4. 重新申请证书
certbot certonly --standalone -d zjsifan.com -d www.zjsifan.com
```

---

### 问题 2：证书路径错误

**错误信息**：
```
nginx: [emerg] BIO_new_file("/etc/letsencrypt/live/zjsifan.com/fullchain.pem") failed
```

**解决方案**：
```bash
# 检查证书路径
ls -la /etc/letsencrypt/live/zjsifan.com/

# 如果路径不对，修改 Nginx 配置中的证书路径
nano /etc/nginx/conf.d/sifan.conf

# 重新测试配置
nginx -t
systemctl restart nginx
```

---

### 问题 3：混合内容警告

**现象**：HTTPS 显示不安全，但证书有效

**原因**：网站中包含 HTTP 资源

**解决方案**：
- 检查 Next.js 代码中的资源引用
- 将所有 HTTP 链接改为 HTTPS
- 使用相对路径或 `//` 协议

```javascript
// ❌ 错误
const img = 'http://example.com/image.jpg'

// ✅ 正确
const img = 'https://example.com/image.jpg'
const img = '//example.com/image.jpg'
```

---

### 问题 4：证书过期

**错误信息**：
```
SSL certificate has expired
```

**解决方案**：
```bash
# 手动续期
certbot renew --nginx

# 检查续期状态
certbot certificates

# 重启 Nginx
systemctl reload nginx
```

---

## 验证 HTTPS 配置

### 1. 检查证书状态

```bash
certbot certificates
```

输出示例：
```
Certificate Name: zjsifan.com
    Domains: zjsifan.com www.zjsifan.com
    Expiry Date: 2026-04-11 (valid for 89 days)
    Certificate Path: /etc/letsencrypt/live/zjsifan.com/fullchain.pem
    Private Key Path: /etc/letsencrypt/live/zjsifan.com/privkey.pem
```

### 2. 检查端口监听

```bash
netstat -tuln | grep -E ':(80|443)'
```

应该看到：
```
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN
tcp        0      0 0.0.0.0:443             0.0.0.0:*               LISTEN
```

### 3. 测试 HTTPS 连接

```bash
curl -I https://www.zjsifan.com
```

应该看到：
```
HTTP/1.1 200 OK
Server: nginx
Content-Type: text/html
```

### 4. 在线测试

使用以下在线工具测试 SSL 配置：
- https://www.ssllabs.com/ssltest/
- https://www.whynopadlock.com/

---

## 防火墙配置

### 确保防火墙开放必要端口

```bash
# Ubuntu/Debian (ufw)
ufw allow 80/tcp
ufw allow 443/tcp
ufw reload

# CentOS/RHEL (firewalld)
firewall-cmd --permanent --add-service=http
firewall-cmd --permanent --add-service=https
firewall-cmd --reload

# iptables
iptables -A INPUT -p tcp --dport 80 -j ACCEPT
iptables -A INPUT -p tcp --dport 443 -j ACCEPT
service iptables save
```

---

## 证书自动续期

### 检查自动续期任务

```bash
crontab -l | grep certbot
```

应该看到：
```
0 3 * * * certbot renew --quiet --nginx && systemctl reload nginx
```

### 手动测试续期

```bash
certbot renew --dry-run
```

---

## Next.js 配置调整

### 确保 Next.js 正确处理 HTTPS

在 `next.config.js` 中添加：

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 确保生产环境使用正确的协议
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          }
        ]
      }
    ]
  }
}

module.exports = nextConfig
```

---

## 完整验证步骤

### 在服务器上执行：

```bash
# 1. 检查证书
certbot certificates

# 2. 检查 Nginx 配置
nginx -t

# 3. 重启 Nginx
systemctl restart nginx

# 4. 检查端口
netstat -tuln | grep -E ':(80|443)'

# 5. 测试 HTTPS
curl -I https://www.zjsifan.com

# 6. 检查日志
tail -20 /var/log/nginx/sifan-error.log
```

### 在浏览器中测试：

1. 访问 https://www.zjsifan.com
2. 检查浏览器地址栏是否显示 🔒 锁图标
3. 点击锁图标查看证书信息
4. 确认证书有效且域名匹配

---

## 快速修复命令（直接复制执行）

```bash
# 上传并执行一键脚本
chmod +x quick-https-install.sh
./quick-https-install.sh
```

或者手动执行：

```bash
# 安装依赖
apt-get update && apt-get install -y certbot python3-certbot-nginx nginx

# 申请证书
certbot certonly --standalone -d zjsifan.com -d www.zjsifan.com --non-interactive --agree-tos --email admin@zjsifan.com

# 配置 Nginx（复制上面的配置内容到 /etc/nginx/conf.d/sifan.conf）

# 测试并重启
nginx -t && systemctl restart nginx

# 验证
curl -I https://www.zjsifan.com
```

---

## 相关文档

- `quick-https-install.sh` - 一键 HTTPS 安装脚本
- `SSL-QUICK-START.md` - SSL 快速配置
- `install-ssl-only.sh` - SSL 证书安装脚本

---

## 总结

**推荐步骤**：
1. ✓ 使用 `quick-https-install.sh` 一键安装（最简单）
2. ✓ 或者使用手动命令安装
3. ✓ 检查证书和 Nginx 配置
4. ✓ 验证 HTTPS 访问

**关键点**：
- DNS 解析必须正确
- 80 和 443 端口必须开放
- Next.js 必须在 3000 端口运行（PM2 应用 enterprise-website）
- Nginx 配置必须正确

现在就去执行 `quick-https-install.sh` 脚本吧！

---

## 🎉 配置完成记录

**2026-01-12 配置完成**：
- ✅ Let's Encrypt SSL 证书申请成功
- ✅ 证书有效期至 2026-04-11（89天）
- ✅ Nginx HTTPS 配置完成
- ✅ HTTP 自动重定向到 HTTPS
- ✅ Next.js 应用运行在 3000 端口
- ✅ Nginx 反向代理配置正确
- ✅ 证书自动续期任务已配置

**访问地址**：
- HTTPS: https://zjsifan.com
- HTTPS: https://www.zjsifan.com
- HTTP: http://zjsifan.com (自动重定向到 HTTPS)

**服务管理**：
- PM2 应用名称: `enterprise-website`
- Next.js 端口: 3000
- Nginx 配置文件: `/etc/nginx/conf.d/sifan.conf`
- 证书路径: `/etc/letsencrypt/live/zjsifan.com/`

**遇到的问题和解决**：
1. ❌ Nginx 配置冲突（多个配置文件定义了相同域名）
   - ✅ 解决：清理了旧配置文件 `zjsifan.conf` 和备份文件
2. ❌ 502 Bad Gateway（Next.js 应用未运行）
   - ✅ 解决：PM2 应用已运行在 3000 端口
3. ❌ Nginx 代理端口错误（配置为 5000，应用运行在 3000）
   - ✅ 解决：修改 Nginx 配置，将 proxy_pass 改为 http://localhost:3000

**验证结果**：
- ✅ 浏览器访问 https://www.zjsifan.com 正常
- ✅ 显示安全锁图标
- ✅ 证书信息正确
- ✅ 页面加载正常
