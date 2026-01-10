# www.zjsifan.com 网站访问问题诊断报告

## 问题概述

**用户反馈**：www.zjsifan.com 无法正常访问网站

**诊断时间**：2026-01-10

**问题严重程度**：🔴 高（网站无法访问）

---

## 诊断结果

### ✅ 正常项目

1. **DNS域名解析**
   - ✅ 域名正确解析到服务器IP
   - 解析结果：www.zjsifan.com → 42.121.218.14
   - DNS配置正确

2. **域名可访问性**
   - ✅ 域名可以访问（HTTP 200）
   - 80端口可以从外网访问
   - 阿里云安全组已开放80端口

### ❌ 发现的问题

#### 问题1：Apache HTTP Server 占用80端口 🔴

**现象**：
- 访问 http://www.zjsifan.com 返回 Apache 默认测试页面
- 页面内容：`Welcome to HTTP Server Test Page!`
- 服务器标识：`Server: nginx/1.20.1`（实际是Apache代理或配置错误）

**原因**：
- Apache HTTP Server 占用了80端口
- Nginx 无法绑定80端口
- 请求被Apache处理，返回默认测试页面

**影响**：
- ❌ 用户访问域名看到的是Apache测试页面
- ❌ 无法访问Next.js应用
- ❌ 网站功能完全不可用

#### 问题2：Nginx配置错误 🔴

**现象**：
- Nginx配置的 proxy_pass 指向错误端口
- 当前配置：`proxy_pass http://localhost:3000;`
- 实际Next.js运行端口：5000

**原因**：
- 开发环境和生产环境配置不一致
- 配置文件未正确更新

#### 问题3：端口冲突 🔴

**现象**：
- Apache监听80端口
- Nginx无法正常启动或工作
- 只有Apache在处理HTTP请求

---

## 根本原因

**核心问题**：Apache HTTP Server 占用了80端口，导致Nginx无法正常工作，从而无法将请求转发到Next.js应用。

**架构问题**：
```
用户请求 → 80端口 → Apache (默认测试页面)
                ↓
            ❌ 无法到达 Nginx → Next.js (5000端口)
```

**预期架构**：
```
用户请求 → 80端口 → Nginx → Next.js (5000端口)
                           ↓
                       正常网站内容
```

---

## 解决方案

### 方案1：使用修复脚本（推荐） ✅

**步骤**：
1. 上传脚本到服务器
2. 执行修复脚本
3. 验证网站访问

**执行命令**：
```bash
# 登录服务器
ssh root@42.121.218.14

# 下载脚本（或从GitHub获取）
wget https://raw.githubusercontent.com/MFCR7788/sifan/main/fix-apache-nginx-conflict.sh

# 赋予执行权限
chmod +x fix-apache-nginx-conflict.sh

# 执行修复
sudo ./fix-apache-nginx-conflict.sh
```

**脚本功能**：
- ✅ 自动检测Apache和Nginx状态
- ✅ 停止Apache服务并禁用开机启动
- ✅ 检测Next.js运行端口（3000或5000）
- ✅ 更新Nginx配置
- ✅ 启动Nginx服务
- ✅ 验证修复结果

### 方案2：手动修复

如果脚本执行失败，可以手动执行以下步骤：

#### 步骤1：停止Apache

```bash
# 检查Apache状态
service httpd status
# 或
systemctl status httpd

# 停止Apache
systemctl stop httpd
service httpd stop

# 禁用Apache开机启动
systemctl disable httpd
chkconfig httpd off

# 确认Apache已停止
ps aux | grep httpd
ss -tuln | grep :80
```

#### 步骤2：检查Next.js端口

```bash
# 检查Next.js运行端口
ss -tuln | grep -E ':(3000|5000)'

# 检查Next.js进程
ps aux | grep next
```

#### 步骤3：更新Nginx配置

```bash
# 编辑Nginx配置
nano /etc/nginx/sites-available/zjsifan.com
# 或
vim /etc/nginx/sites-available/zjsifan.com
```

**配置内容**（假设Next.js运行在5000端口）：
```nginx
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
```

#### 步骤4：启动Nginx

```bash
# 测试Nginx配置
nginx -t

# 启动Nginx
systemctl start nginx
service nginx start

# 启用Nginx开机启动
systemctl enable nginx
chkconfig nginx on

# 检查Nginx状态
systemctl status nginx
ss -tuln | grep :80
```

#### 步骤5：验证修复

```bash
# 本地测试
curl -I http://localhost
curl http://localhost | head -20

# 域名测试
curl -I http://www.zjsifan.com
curl http://www.zjsifan.com | head -20
```

---

## 验证清单

修复完成后，请确认以下项目：

- [ ] Apache已停止（`ps aux | grep httpd` 无输出）
- [ ] Nginx正在运行（`ps aux | grep nginx` 有输出）
- [ ] 80端口被Nginx占用（`ss -tuln | grep :80`）
- [ ] Next.js正在运行（`ss -tuln | grep :5000`）
- [ ] 访问 http://www.zjsifan.com 显示正常网站内容
- [ ] 访问 http://42.121.218.14 显示正常网站内容
- [ ] 不再显示Apache测试页面

---

## 常见问题

### Q1: 停止Apache后，它又自动启动了怎么办？

**A**: 检查开机启动项：
```bash
# systemd系统
systemctl disable httpd
systemctl disable apache2

# 传统系统
chkconfig httpd off
update-rc.d -f apache2 remove
```

### Q2: Nginx启动失败怎么办？

**A**: 检查配置和日志：
```bash
# 测试配置
nginx -t

# 查看错误日志
tail -f /var/log/nginx/error.log

# 检查端口占用
ss -tuln | grep :80
```

### Q3: Next.js应用无法启动怎么办？

**A**: 启动Next.js：
```bash
# 进入项目目录
cd /workspace/projects  # 或您的项目路径

# 安装依赖（如果需要）
pnpm install

# 启动开发模式
pnpm run dev

# 或使用PM2（推荐生产环境）
pm2 start "pnpm run dev" --name "nextjs"
pm2 save
pm2 startup
```

### Q4: 修复后仍然显示Apache页面？

**A**: 可能原因：
1. Apache仍在运行 → 再次停止
2. 浏览器缓存 → 清除缓存或使用隐私模式
3. CDN缓存 → 等待刷新或手动清除
4. Nginx配置错误 → 检查配置文件

---

## 长期解决方案

### 1. 移除Apache（可选）

如果不需要Apache，可以彻底移除：

```bash
# CentOS/RHEL
yum remove httpd

# Ubuntu/Debian
apt-get remove apache2
```

### 2. 使用PM2管理Next.js（推荐）

```bash
# 安装PM2
npm install -g pm2

# 启动应用
pm2 start "pnpm run dev" --name "nextjs"

# 保存进程列表
pm2 save

# 设置开机启动
pm2 startup
```

### 3. 配置HTTPS

按照 `HTTPS-SETUP-GUIDE.md` 配置Let's Encrypt免费SSL证书。

### 4. 监控服务

```bash
# 查看Nginx状态
systemctl status nginx

# 查看Next.js状态
pm2 status

# 查看日志
tail -f /var/log/nginx/access.log
tail -f /var/log/nginx/error.log
```

---

## 脚本文件说明

| 文件名 | 功能 |
|--------|------|
| `fix-apache-nginx-conflict.sh` | 自动修复Apache和Nginx端口冲突 |
| `diagnose-website-access.sh` | 网站访问诊断工具 |
| `fix-nginx-port.sh` | 修复Nginx端口配置 |
| `setup-https-letsencrypt.sh` | 配置HTTPS（修复后执行） |

---

## 技术支持

如果遇到问题，请提供以下信息：

1. 诊断脚本输出：`bash diagnose-website-access.sh`
2. 错误日志：
   ```bash
   tail -50 /var/log/nginx/error.log
   pm2 logs nextjs --lines 50
   ```
3. 服务状态：
   ```bash
   ss -tuln | grep -E ':(80|3000|5000)'
   ps aux | grep -E 'nginx|httpd|next'
   ```

---

## 相关文档

- `HTTPS-SETUP-GUIDE.md` - HTTPS配置指南
- `PORT-600-GUIDE.md` - 端口配置指南
- `DEPLOYMENT.md` - 部署文档

---

**最后更新**：2026-01-10
**版本**：1.0
