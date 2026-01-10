# 域名访问问题诊断报告

## 问题描述

用户反馈：
- ✅ `http://42.121.218.14:3000/` 能访问网页
- ❌ `www.zjsifan.com` 不能访问

## 根本原因

### 1. 端口配置错误
- **Nginx 配置文件指向 3000 端口**
- **Next.js 实际运行在 5000 端口**
- 导致反向代理无法转发请求

### 2. Nginx 服务未运行
- Nginx 服务未启动
- 80 端口没有服务监听
- 因此域名访问（默认80端口）无法连接

### 3. IP:3000 访问说明
用户提到的 `http://42.121.218.14:3000/` 能访问可能是：
- 之前测试时运行在 3000 端口的残留
- 记错了端口号
- 实际应该是 `http://42.121.218.14:5000/`

## 诊断过程

```bash
# 检查端口监听
$ ss -tuln | grep LISTEN
tcp   LISTEN  0.0.0.0:5000  # Next.js 在 5000 端口

# 检查 80 端口
$ curl -I http://localhost:80
curl: Failed to connect to localhost port 80

# 检查 Nginx 配置
$ cat /etc/nginx/sites-available/enterprise-website
upstream nextjs_backend {
    server 127.0.0.1:3000;  # ❌ 错误：指向 3000
}
```

## 解决方案

### 自动修复脚本

执行以下命令：

```bash
sudo ./fix-nginx-configuration.sh
```

脚本会自动：
1. ✅ 检测 Next.js 实际运行端口（5000）
2. ✅ 修正 Nginx 配置文件（3000 → 5000）
3. ✅ 启动 Nginx 服务
4. ✅ 验证 80 端口监听状态
5. ✅ 测试本地访问

### 手动修复步骤

如果需要手动修复：

```bash
# 1. 修改 Nginx 配置
sudo nano /etc/nginx/sites-available/enterprise-website

# 将这一行：
# server 127.0.0.1:3000;
# 改为：
# server 127.0.0.1:5000;

# 2. 测试配置
sudo nginx -t

# 3. 启动 Nginx
sudo service nginx start

# 4. 检查状态
sudo service nginx status
ss -tuln | grep :80
```

## 验证步骤

修复后按以下步骤验证：

### 1. 检查端口监听
```bash
$ ss -tuln | grep :80
tcp   LISTEN  0.0.0.0:80  # 应该能看到这一行
```

### 2. 本地测试
```bash
$ curl -I http://localhost/
HTTP/1.1 200 OK  # 应该返回 200
```

### 3. IP 访问测试
```bash
$ curl -I http://42.121.218.14/
HTTP/1.1 200 OK
```

### 4. 域名访问测试
- 访问 `http://www.zjsifan.com`
- 访问 `http://zjsifan.com`

## DNS 解析检查

如果修复 Nginx 后域名仍无法访问，检查 DNS 解析：

```bash
# 检查域名解析
$ dig www.zjsifan.com +short
42.121.218.14

# 或
$ nslookup www.zjsifan.com
```

确保域名解析指向正确的 IP：`42.121.218.14`

## 阿里云安全组配置

确保阿里云安全组已开放以下端口：

| 协议 | 端口 | 用途 |
|------|------|------|
| TCP | 80 | HTTP 访问 |
| TCP | 443 | HTTPS 访问（后续配置） |

## 常见问题

### Q1: 修复后本地能访问，外网无法访问？
**A:** 检查阿里云安全组是否开放 80 端口

### Q2: 域名解析正确但仍无法访问？
**A:** 
1. 等待 DNS 生效（最多 48 小时，通常 5-10 分钟）
2. 检查是否有 CDN 或代理服务
3. 使用 `nslookup` 确认本地 DNS 缓存

### Q3: Nginx 启动失败？
**A:**
```bash
# 查看错误日志
sudo tail -f /var/log/nginx/error.log

# 检查配置
sudo nginx -t
```

### Q4: 页面显示 502 Bad Gateway？
**A:** 检查 Next.js 应用是否在 5000 端口正常运行：
```bash
$ curl -I http://localhost:5000
```

## 后续建议

### 1. 配置 HTTPS（推荐）

使用 Let's Encrypt 免费证书：

```bash
sudo ./setup-https-fixed.sh
```

### 2. 配置 PM2 进程管理

确保 Next.js 应用稳定运行：

```bash
# 使用 PM2 启动
pm2 start npm --name "nextjs-app" -- start

# 设置开机自启
pm2 startup
pm2 save
```

### 3. 配置日志轮转

防止日志文件过大：

```bash
sudo nano /etc/logrotate.d/enterprise-website
```

## 相关文件

- `fix-nginx-configuration.sh` - Nginx 配置修复脚本
- `nginx.conf` - Nginx 配置文件
- `nginx-600.conf` - 备份配置文件

## 技术架构

```
用户访问 (80/443)
    ↓
Nginx (反向代理)
    ↓
Next.js 应用 (5000 端口)
    ↓
PostgreSQL 数据库
```

## 更新时间

2025-01-15 诊断并修复
