# HTTPS配置指南（Let's Encrypt免费SSL证书）

## 概述

本指南将帮助您使用Let's Encrypt免费SSL证书为网站配置HTTPS，实现安全加密访问。

## 前置要求

1. **域名DNS解析**：域名已正确解析到服务器IP（42.121.218.14）
2. **80端口开放**：阿里云安全组已开放80端口（用于Let's Encrypt验证）
3. **服务器权限**：服务器需要root权限或sudo权限
4. **Nginx运行中**：当前Nginx已在80端口运行

## 配置步骤

### 步骤1：上传脚本到服务器

将 `setup-https-letsencrypt.sh` 上传到服务器，例如上传到 `/root/` 目录。

```bash
# 在本地执行（如果已配置SSH免密登录）
scp setup-https-letsencrypt.sh root@42.121.218.14:/root/
```

### 步骤2：登录服务器

SSH登录到您的服务器：

```bash
ssh root@42.121.218.14
```

### 步骤3：赋予脚本执行权限

```bash
chmod +x setup-https-letsencrypt.sh
```

### 步骤4：执行配置脚本

```bash
sudo ./setup-https-letsencrypt.sh
```

脚本会自动完成以下任务：
1. ✅ 检查系统环境
2. ✅ 验证域名DNS解析
3. ✅ 检查80端口可访问性
4. ✅ 更新nginx配置（修正后端端口为5000）
5. ✅ 安装Certbot
6. ✅ 获取SSL证书
7. ✅ 配置HTTPS和自动重定向
8. ✅ 配置证书自动续期
9. ✅ 测试并重启nginx

### 步骤5：配置阿里云安全组

在阿里云控制台配置安全组规则：

**入方向规则**：
- 端口：443
- 协议类型：TCP
- 授权对象：0.0.0.0/0（允许所有IP访问）

### 步骤6：测试HTTPS访问

脚本执行完成后，访问以下地址测试：

- https://zjsifan.com
- https://www.zjsifan.com

浏览器地址栏应显示**锁形图标** 🔒，表示连接安全。

## 常见问题排查

### 问题1：获取SSL证书失败

**错误信息**：`Failed to connect to ...`

**解决方案**：
1. 检查域名DNS解析是否正确
   ```bash
   nslookup www.zjsifan.com
   ```
2. 确认阿里云安全组已开放80端口
3. 检查服务器防火墙是否开放80端口
   ```bash
   firewall-cmd --list-ports  # CentOS
   ufw status  # Ubuntu
   ```

### 问题2：nginx配置测试失败

**错误信息**：`nginx: [emerg] ...`

**解决方案**：
1. 检查配置文件语法
   ```bash
   nginx -t
   ```
2. 查看错误日志
   ```bash
   tail -f /var/log/nginx/error.log
   ```
3. 恢复备份配置
   ```bash
   # 查看备份文件
   ls -la /etc/nginx/sites-available/*.backup.*

   # 恢复备份（替换filename为实际文件名）
   cp /etc/nginx/sites-available/zjsifan.com.backup.* /etc/nginx/sites-available/zjsifan.com
   ```

### 问题3：HTTPS访问显示证书错误

**解决方案**：
1. 检查证书是否正确获取
   ```bash
   certbot certificates
   ```
2. 查看nginx配置中的证书路径是否正确
   ```bash
   cat /etc/nginx/sites-available/zjsifan.com | grep ssl_certificate
   ```
3. 确认443端口已开放
   ```bash
   ss -tuln | grep :443
   ```

### 问题4：HTTP未重定向到HTTPS

**解决方案**：
1. 检查nginx配置是否包含重定向规则
   ```bash
   cat /etc/nginx/sites-available/zjsifan.com | grep return 301
   ```
2. 重新加载nginx配置
   ```bash
   service nginx reload
   ```

## 证书管理

### 查看证书信息

```bash
certbot certificates
```

### 手动续期证书

```bash
certbot renew --dry-run  # 测试续期
certbot renew            # 实际续期
```

### 撤销证书

```bash
certbot revoke --cert-path /etc/letsencrypt/live/zjsifan.com/cert.pem
```

### 删除证书

```bash
certbot delete --cert-name zjsifan.com
```

## 证书自动续期

脚本已自动配置证书自动续期任务，通过cron实现：

```bash
# 查看定时任务
crontab -l

# 输出示例：
0 2 * * * certbot renew --quiet && service nginx reload
```

这表示每天凌晨2点自动检查证书是否需要续期，如果需要则自动续期并重载nginx配置。

Let's Encrypt证书有效期为90天，建议在到期前30天自动续期。

## Nginx配置文件位置

- 配置文件：`/etc/nginx/sites-available/zjsifan.com`
- 软链接：`/etc/nginx/sites-enabled/zjsifan.com`
- 访问日志：`/var/log/nginx/zjsifan.com-https-access.log`
- 错误日志：`/var/log/nginx/zjsifan.com-https-error.log`

## SSL证书位置

- 证书文件：`/etc/letsencrypt/live/zjsifan.com/fullchain.pem`
- 私钥文件：`/etc/letsencrypt/live/zjsifan.com/privkey.pem`
- 链式证书：`/etc/letsencrypt/live/zjsifan.com/chain.pem`

## 验证HTTPS配置

### 使用curl测试

```bash
# 测试HTTPS响应
curl -I https://zjsifan.com

# 测试HTTP重定向
curl -I http://zjsifan.com
# 应返回: HTTP/1.1 301 Moved Permanently
# Location: https://zjsifan.com/
```

### 使用在线工具测试

- SSL Labs: https://www.ssllabs.com/ssltest/
  输入域名查看SSL证书配置和安全性评分

- HTTPS Checker: https://www.whynopadlock.com/
  检测HTTPS配置问题

## 回退到HTTP

如果需要临时回退到HTTP，执行以下步骤：

```bash
# 1. 备份当前配置
cp /etc/nginx/sites-available/zjsifan.com /etc/nginx/sites-available/zjsifan.com.https.backup

# 2. 恢复HTTP配置
cat > /etc/nginx/sites-available/zjsifan.com << 'EOF'
server {
    listen 80;
    server_name zjsifan.com www.zjsifan.com;

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

# 3. 测试并重启nginx
nginx -t
service nginx restart
```

## 技术支持

如遇到问题，请提供以下信息：

1. 错误信息截图
2. 执行的命令和输出
3. 相关日志内容
4. nginx配置文件内容

## 参考资料

- Let's Encrypt官网：https://letsencrypt.org/
- Certbot文档：https://certbot.eff.org/docs/
- Nginx SSL配置：https://nginx.org/en/docs/http/configuring_https_servers.html
