# HTTPS 安全配置指南

## 🚨 问题：网站显示"不安全"

### 当前状态

```
当前协议: HTTP ❌
浏览器提示: 不安全
证书状态: 未配置
```

访问 http://www.zjsifan.com 时，浏览器会显示：
- 🔒 不安全
- ⚠️ 此连接不是私密连接

---

## ✅ 解决方案：配置 HTTPS

### 前置条件

在配置 HTTPS 之前，确保：

1. ✅ **域名 DNS 解析已生效**
   ```bash
   # 检查域名是否指向服务器 IP
   dig www.zjsifan.com +short
   # 应该返回: 42.121.218.14
   ```

2. ✅ **80 端口可以访问**
   ```bash
   # 检查 Nginx 是否运行
   sudo service nginx status

   # 检查 80 端口监听
   ss -tuln | grep :80
   ```

3. ✅ **阿里云安全组开放 443 端口**
   - 登录阿里云控制台
   - 找到云服务器 ECS
   - 配置安全组规则
   - 添加入方向规则：TCP 443 端口

---

## 🚀 方法一：使用自动化脚本（推荐）

### 步骤 1：运行 HTTPS 配置脚本

```bash
# SSH 登录服务器
ssh root@42.121.218.14

# 进入项目目录
cd /workspace/projects

# 运行 HTTPS 配置脚本
sudo ./setup-https-fixed.sh
```

### 脚本会自动完成：

1. ✅ 安装 Certbot
2. ✅ 申请 Let's Encrypt 免费证书
3. ✅ 配置 Nginx HTTPS
4. ✅ 配置 HTTP 到 HTTPS 重定向
5. ✅ 设置证书自动续期

### 步骤 2：输入邮箱

脚本运行时会要求输入邮箱：

```
请输入您的邮箱（用于证书到期提醒）: your-email@example.com
```

### 步骤 3：选择证书类型

```
请选择要配置的域名：
1) 仅 zjsifan.com
2) 仅 www.zjsifan.com
3) 同时配置两者（推荐）
请输入选项 [1-3]: 3
```

### 步骤 4：同意服务条款

```
请阅读服务条款 (TOS): https://letsencrypt.org/repository/
(A)gree/(C)ancel: A
```

### 步骤 5：验证配置

```bash
# 访问 HTTPS 网站
curl -I https://www.zjsifan.com

# 检查 SSL 证书
curl -vI https://www.zjsifan.com 2>&1 | grep SSL
```

---

## 🛠️ 方法二：手动配置（如果脚本失败）

### 步骤 1：安装 Certbot

```bash
# 更新包管理器
sudo apt-get update

# 安装 Certbot
sudo apt-get install -y certbot python3-certbot-nginx
```

### 步骤 2：申请 SSL 证书

```bash
# 申请证书（自动配置 Nginx）
sudo certbot --nginx -d zjsifan.com -d www.zjsifan.com

# 或手动申请（需要自己配置 Nginx）
sudo certbot certonly --nginx -d zjsifan.com -d www.zjsifan.com
```

### 步骤 3：配置 Nginx HTTPS

编辑 Nginx 配置：

```bash
sudo nano /etc/nginx/sites-available/zjsifan.com
```

添加 HTTPS 配置：

```nginx
# HTTP 到 HTTPS 重定向
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

    # SSL 证书配置
    ssl_certificate /etc/letsencrypt/live/zjsifan.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/zjsifan.com/privkey.pem;

    # SSL 配置（推荐）
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # HSTS（可选，提高安全性）
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    # 其他配置（保持原有配置）
    client_max_body_size 50M;

    # ... 其他 location 配置 ...
}
```

### 步骤 4：测试并重启 Nginx

```bash
# 测试配置
sudo nginx -t

# 重启 Nginx
sudo service nginx restart
```

### 步骤 5：设置自动续期

```bash
# 测试续期命令
sudo certbot renew --dry-run

# 设置自动续期（cron job）
sudo crontab -e

# 添加以下行（每天凌晨 2 点检查续期）
0 2 * * * certbot renew --quiet --post-hook "service nginx reload"
```

---

## 🔍 验证 HTTPS 配置

### 1. 检查 SSL 证书

```bash
# 查看证书信息
sudo certbot certificates

# 检查证书有效期
echo | openssl s_client -servername www.zjsifan.com -connect www.zjsifan.com:443 2>/dev/null | openssl x509 -noout -dates
```

### 2. 测试 HTTPS 访问

```bash
# 使用 curl 测试
curl -I https://www.zjsifan.com

# 应该看到：
# HTTP/1.1 200 OK
# Server: nginx
# Content-Type: text/html; charset=utf-8
```

### 3. 在线测试工具

访问以下网站测试 SSL 配置：

- **SSL Labs**: https://www.ssllabs.com/ssltest/
- **Why No Padlock**: https://www.whynopadlock.com/
- **SSL Checker**: https://www.sslshopper.com/ssl-checker.html

输入 `www.zjsifan.com` 进行测试。

---

## 🎯 预期结果

配置完成后：

### 浏览器显示

访问 https://www.zjsifan.com 时：
- ✅ 显示 🔒 安全图标
- ✅ 连接是安全的
- ✅ 证书有效

### curl 测试

```bash
$ curl -I https://www.zjsifan.com
HTTP/1.1 200 OK
Server: nginx
Strict-Transport-Security: max-age=31536000
```

### SSL Labs 评分

目标评分：**A+**

---

## 🚨 常见问题

### 问题 1：证书申请失败

**错误信息**：
```
Failed to connect to port 80 for TLS-SNI-01 challenge
```

**解决方案**：
1. 检查防火墙是否开放 80 端口
2. 检查阿里云安全组是否开放 80 端口
3. 确认域名 DNS 解析正确
4. 确认 Nginx 正在运行

### 问题 2：证书未自动续期

**检查方法**：
```bash
# 查看续期日志
sudo certbot renew --dry-run

# 查看 cron job
sudo crontab -l
```

**解决方案**：
```bash
# 手动续期
sudo certbot renew

# 检查自动续期配置
sudo cat /etc/cron.d/certbot
```

### 问题 3：HTTPS 访问 404

**原因**：Nginx 配置错误

**解决方案**：
```bash
# 检查 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# 测试配置
sudo nginx -t

# 检查配置文件
sudo cat /etc/nginx/sites-available/zjsifan.com
```

### 问题 4：混合内容警告

**现象**：部分资源通过 HTTP 加载

**解决方案**：
确保所有资源使用 HTTPS：

```html
<!-- ❌ 错误 -->
<img src="http://example.com/image.jpg">

<!-- ✅ 正确 -->
<img src="https://example.com/image.jpg">
<!-- 或使用相对路径 -->
<img src="/image.jpg">
```

---

## 📊 安全检查清单

配置完成后，确认：

- [ ] HTTPS 可以访问
- [ ] 浏览器显示安全图标
- [ ] SSL 证书有效期 > 30 天
- [ ] HTTP 自动重定向到 HTTPS
- [ ] 没有"混合内容"警告
- [ ] SSL Labs 评分 A 或更高
- [ ] 自动续期已配置

---

## 🔧 进阶配置

### 1. 配置 HSTS

强制使用 HTTPS：

```nginx
add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
```

### 2. 配置安全头

```nginx
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
```

### 3. 配置 OCSP Stapling

提高证书验证速度：

```nginx
ssl_stapling on;
ssl_stapling_verify on;
ssl_trusted_certificate /etc/letsencrypt/live/zjsifan.com/chain.pem;
resolver 8.8.8.8 8.8.4.4 valid=300s;
resolver_timeout 5s;
```

---

## 📞 获取帮助

### 查看日志

```bash
# Certbot 日志
sudo cat /var/log/letsencrypt/letsencrypt.log

# Nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# Nginx 访问日志
sudo tail -f /var/log/nginx/enterprise-website-error.log
```

### 重新申请证书

```bash
# 撤销现有证书
sudo certbot revoke --cert-path /etc/letsencrypt/live/zjsifan.com/cert.pem

# 重新申请
sudo certbot --nginx -d zjsifan.com -d www.zjsifan.com
```

---

## 🎉 总结

### 快速配置（5 分钟）

```bash
sudo ./setup-https-fixed.sh
```

### 配置后效果

- ✅ 网站使用 HTTPS
- ✅ 浏览器显示安全
- ✅ SSL 证书自动续期
- ✅ 用户数据加密传输

### 证书有效期

Let's Encrypt 证书有效期：**90 天**

自动续期：**每 60 天自动续期**

---

**配置 HTTPS 后，你的网站将安全可靠！** 🔒✨
