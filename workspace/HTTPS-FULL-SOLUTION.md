# HTTPS 完整解决方案文档

## 项目信息
- **域名**: zjsifan.com, www.zjsifan.com
- **框架**: Next.js 16
- **应用端口**: 3000
- **代理端口**: 443 (HTTPS)
- **证书**: Let's Encrypt
- **有效期**: 2026-04-11

## 配置完成状态
✅ SSL 证书申请成功
✅ Nginx HTTPS 配置完成
✅ HTTP 自动重定向到 HTTPS
✅ Next.js 应用运行在 3000 端口
✅ Nginx 反向代理配置正确

## Nginx 配置文件
位置: `/etc/nginx/conf.d/sifan.conf`

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

    # 反向代理到 Next.js
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
    }
}
```

## SSL 证书信息
```bash
# 查看证书详情
certbot certificates

# 证书路径
/etc/letsencrypt/live/zjsifan.com/fullchain.pem
/etc/letsencrypt/live/zjsifan.com/privkey.pem

# 自动续期
certbot 已配置自动续期任务
```

## 服务管理

### PM2 应用管理
```bash
# 查看应用状态
pm2 list

# 重启应用
pm2 restart enterprise-website

# 查看日志
pm2 logs enterprise-website --lines 50

# 停止应用
pm2 stop enterprise-website

# 启动应用
pm2 start enterprise-website
```

### Nginx 服务管理
```bash
# 重启 Nginx
systemctl restart nginx

# 测试配置
nginx -t

# 查看状态
systemctl status nginx

# 重载配置（不中断服务）
systemctl reload nginx
```

## 常见问题解决

### 1. 502 Bad Gateway
**原因**: Next.js 应用未运行或端口配置错误

**解决方案**:
```bash
# 检查应用状态
pm2 list

# 检查端口监听
ss -lptn 'sport = :3000'

# 重启应用
pm2 restart enterprise-website
```

### 2. SSL 证书过期
**解决方案**:
```bash
# 手动续期
certbot renew

# 检查续期状态
certbot certificates

# 重启 Nginx
systemctl restart nginx
```

### 3. 配置冲突警告
**原因**: 多个 Nginx 配置文件定义了相同的 server_name

**解决方案**:
```bash
# 查看 /etc/nginx/conf.d 目录
ls -lh /etc/nginx/conf.d/

# 只保留 sifan.conf，删除其他配置文件
mv /etc/nginx/conf.d/zjsifan.conf /etc/nginx/conf.d/zjsifan.conf.old
```

## 访问地址
- HTTPS: https://zjsifan.com
- HTTPS: https://www.zjsifan.com
- HTTP: http://zjsifan.com (自动重定向到 HTTPS)

## 部署记录
- 2026-01-12: 配置 Let's Encrypt SSL 证书
- 2026-01-12: 配置 Nginx HTTPS 代理
- 2026-01-12: 修复 Nginx 配置冲突
- 2026-01-12: 修正代理端口 (5000 -> 3000)

## 配置文件备份
所有旧配置文件已移动到:
`/etc/nginx/conf.d/backups/`
