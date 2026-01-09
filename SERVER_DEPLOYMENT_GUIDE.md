# 阿里云服务器部署完整指南

## 概述

本文档指导你如何将 Next.js 企业官网项目部署到阿里云服务器（42.121.218.14）。

## 服务器信息

- **IP 地址**: 42.121.218.14
- **操作系统**: Linux (Ubuntu/Debian)
- **项目目录**: /workspace/projects
- **应用端口**: 3000
- **Web 服务器端口**: 80 (HTTP), 443 (HTTPS)

## 快速部署（推荐）

### 第一步：配置环境变量

在本地沙箱环境中编辑 `.env.production` 文件：

```bash
vim .env.production
```

**必须配置的变量**：

```bash
# 数据库配置（必填）
DATABASE_URL="postgresql://username:password@database-host:5432/database-name"

# JWT密钥（必填，建议生成随机字符串）
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# Cookie配置
COOKIE_DOMAIN=".yourdomain.com"  # 如果有域名
COOKIE_SECURE="true"
COOKIE_SAME_SITE="lax"

# 其他配置（根据需要）
S3_REGION="your-region"
S3_BUCKET="your-bucket"
S3_ACCESS_KEY_ID="your-access-key"
S3_SECRET_ACCESS_KEY="your-secret-key"

# 阿里云短信（如果需要）
ALIYUN_ACCESS_KEY_ID="your-aliyun-key"
ALIYUN_ACCESS_KEY_SECRET="your-aliyun-secret"
ALIYUN_SMS_SIGN_NAME="your-sign-name"
```

**生成随机 JWT 密钥**：

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**提交环境变量到 Git**：

```bash
git add .env.production
git commit -m "chore: 配置生产环境变量"
git push origin main
```

### 第二步：初始化服务器环境

将 `server-init.sh` 上传到服务器并执行：

```bash
# 在本地执行（将脚本上传到服务器）
scp server-init.sh root@42.121.218.14:/root/

# 登录到服务器
ssh root@42.121.218.14

# 在服务器上执行初始化脚本
chmod +x server-init.sh
./server-init.sh
```

### 第三步：部署应用

将 `deploy-server.sh` 上传到服务器并执行：

```bash
# 在本地执行
scp deploy-server.sh root@42.121.218.14:/root/

# 在服务器上执行
chmod +x deploy-server.sh
./deploy-server.sh
```

### 第四步：验证部署

```bash
# 在服务器上检查应用状态
pm2 status

# 访问网站（在本地浏览器）
http://42.121.218.14
```

## 详细步骤

### 1. 准备工作

#### 1.1 确认代码已推送到 GitHub

```bash
# 检查远程仓库
git remote -v

# 提交并推送所有更改
git add .
git commit -m "准备部署到阿里云"
git push origin main
```

#### 1.2 配置环境变量

```bash
# 编辑 .env.production
vim .env.production

# 至少配置：
# - DATABASE_URL（数据库连接字符串）
# - JWT_SECRET（JWT密钥）

# 提交到 Git
git add .env.production
git commit -m "chore: 配置生产环境变量"
git push origin main
```

### 2. 初始化服务器环境

#### 2.1 上传初始化脚本

```bash
# 在本地执行
scp server-init.sh root@42.121.218.14:/root/
```

#### 2.2 登录服务器

```bash
ssh root@42.121.218.14
```

#### 2.3 执行初始化脚本

```bash
cd /root
chmod +x server-init.sh
./server-init.sh
```

**初始化脚本会自动安装**：
- Node.js 20
- pnpm
- PM2
- Nginx
- PostgreSQL 客户端
- 基础工具（git, curl, wget 等）
- 配置防火墙（UFW）

### 3. 部署应用

#### 3.1 上传部署脚本

```bash
# 在另一个终端窗口（本地）
scp deploy-server.sh root@42.121.218.14:/root/
```

#### 3.2 执行部署脚本

```bash
# 在服务器上
cd /root
chmod +x deploy-server.sh
./deploy-server.sh
```

**部署脚本会自动执行**：
- 克隆代码仓库
- 安装依赖
- 构建项目
- 配置环境变量
- 配置 Nginx
- 启动 PM2 进程
- 健康检查

### 4. 验证部署

#### 4.1 检查应用状态

```bash
# 查看 PM2 状态
pm2 status

# 查看应用日志
pm2 logs enterprise-website

# 查看实时日志
pm2 logs enterprise-website --lines 100
```

#### 4.2 检查端口

```bash
# 检查 3000 端口
netstat -tuln | grep 3000

# 检查 Nginx
netstat -tuln | grep :80
```

#### 4.3 测试访问

```bash
# 本地测试
curl http://localhost:3000

# 外网测试（在本地浏览器访问）
http://42.121.218.14
```

#### 4.4 检查 Nginx 日志

```bash
# 访问日志
tail -f /var/log/nginx/enterprise-website-access.log

# 错误日志
tail -f /var/log/nginx/enterprise-website-error.log
```

## 常用操作

### 重启应用

```bash
pm2 restart enterprise-website
```

### 停止应用

```bash
pm2 stop enterprise-website
```

### 查看应用信息

```bash
pm2 show enterprise-website
```

### 查看监控

```bash
pm2 monit
```

### 更新部署

```bash
# 方法1：重新执行部署脚本
./deploy-server.sh

# 方法2：手动更新
cd /workspace/projects
git pull origin main
pnpm install
pnpm run build
pm2 restart enterprise-website
```

### 查看日志

```bash
# PM2 日志
pm2 logs enterprise-website --lines 100

# PM2 错误日志
pm2 logs enterprise-website --err --lines 100

# Nginx 访问日志
tail -f /var/log/nginx/enterprise-website-access.log

# Nginx 错误日志
tail -f /var/log/nginx/enterprise-website-error.log
```

## 故障排查

### 应用无法启动

**症状**：PM2 显示应用处于 `errored` 状态

**排查步骤**：

```bash
# 1. 查看详细日志
pm2 logs enterprise-website --lines 50

# 2. 检查环境变量
cat /workspace/projects/.env

# 3. 检查数据库连接
psql $DATABASE_URL -c "SELECT 1;"

# 4. 手动测试构建
cd /workspace/projects
pnpm run build
pnpm run start --port 3000
```

### Nginx 502 错误

**症状**：浏览器显示 "502 Bad Gateway"

**排查步骤**：

```bash
# 1. 检查应用是否运行
pm2 status

# 2. 检查端口监听
netstat -tuln | grep 3000

# 3. 测试本地访问
curl http://localhost:3000

# 4. 检查 Nginx 配置
nginx -t

# 5. 查看 Nginx 错误日志
tail -f /var/log/nginx/enterprise-website-error.log
```

### 数据库连接失败

**症状**：日志显示数据库连接错误

**排查步骤**：

```bash
# 1. 检查 DATABASE_URL 配置
grep DATABASE_URL /workspace/projects/.env

# 2. 测试数据库连接
psql "$DATABASE_URL" -c "SELECT version();"

# 3. 检查数据库服务状态
#（如果在同一台服务器）
systemctl status postgresql
```

### 端口被占用

**症状**：应用启动失败，提示端口已被占用

**排查步骤**：

```bash
# 1. 查找占用端口的进程
lsof -i:3000

# 2. 停止占用端口的进程
kill -9 <PID>

# 3. 重启应用
pm2 restart enterprise-website
```

### 内存不足

**症状**：应用频繁重启或无响应

**排查步骤**：

```bash
# 1. 查看系统内存
free -h

# 2. 查看应用内存使用
pm2 show enterprise-website

# 3. 增加 swap 空间（如果需要）
dd if=/dev/zero of=/swapfile bs=1M count=1024
chmod 600 /swapfile
mkswap /swapfile
swapon /swapfile
echo '/swapfile none swap sw 0 0' >> /etc/fstab
```

## 性能优化

### PM2 优化

已配置在 `ecosystem.config.js` 中：
- 集群模式（2 个实例）
- 内存限制 1G
- 自动重启
- 日志轮转

### Nginx 优化

已配置在 `nginx.conf` 中：
- Gzip 压缩
- 静态资源缓存
- Keep-alive 连接
- 上传大小限制（50M）

### Next.js 优化

已配置在 `next.config.ts` 中：
- 图片优化
- 代码压缩
- 静态资源缓存

## 安全加固

### 配置 SSL 证书（HTTPS）

```bash
# 安装 Certbot
apt install -y certbot python3-certbot-nginx

# 获取证书（需要域名）
certbot --nginx -d yourdomain.com

# 自动续期
certbot renew --dry-run
```

### 配置防火墙

```bash
# 查看防火墙状态
ufw status

# 允许 SSH
ufw allow 22/tcp

# 允许 HTTP/HTTPS
ufw allow 80/tcp
ufw allow 443/tcp

# 启用防火墙
ufw enable
```

### 限制 SSH 访问

```bash
# 编辑 SSH 配置
vim /etc/ssh/sshd_config

# 禁用 root 登录（推荐）
PermitRootLogin no

# 禁用密码登录（使用密钥认证）
PasswordAuthentication no

# 重启 SSH
systemctl restart sshd
```

## 监控和维护

### 系统监控

```bash
# CPU 和内存使用
htop

# 磁盘使用
df -h

# 进程监控
ps aux | grep node
```

### 日志轮转

PM2 会自动轮转日志，但也可以手动配置：

```bash
# 安装 PM2-logrotate
pm2 install pm2-logrotate

# 配置日志轮转
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 定期备份

建议创建定期备份脚本：

```bash
#!/bin/bash
# backup.sh

BACKUP_DIR="/var/backups/enterprise-website"
DATE=$(date +%Y%m%d_%H%M%S)

# 备份数据库
pg_dump $DATABASE_URL > "$BACKUP_DIR/database_$DATE.sql"

# 备份应用文件
cp -r /workspace/projects/.next "$BACKUP_DIR/app_$DATE/"

# 清理 7 天前的备份
find $BACKUP_DIR -name "database_*.sql" -mtime +7 -delete
find $BACKUP_DIR -type d -name "app_*" -mtime +7 -exec rm -rf {} \;
```

## 回滚操作

如果部署出现问题，可以快速回滚：

```bash
# 1. 停止当前应用
pm2 stop enterprise-website

# 2. 恢复之前的备份
BACKUP_NAME="backup_20250110_123456"  # 替换为实际的备份名称
cp -r "/var/backups/enterprise-website/$BACKUP_NAME/.next" /workspace/projects/

# 3. 重启应用
pm2 start enterprise-website

# 4. 验证
curl http://localhost:3000
```

## 附录

### 文件结构

```
/workspace/projects/
├── src/                  # 源代码
├── .next/                # 构建产物
├── .env                  # 环境变量（运行时）
├── .env.production       # 生产环境配置（Git 管理）
├── ecosystem.config.js   # PM2 配置
├── nginx.conf           # Nginx 配置
└── logs/                # 应用日志

/var/log/enterprise-website/
├── enterprise-website-access.log  # Nginx 访问日志
└── enterprise-website-error.log   # Nginx 错误日志

/var/backups/enterprise-website/
└── backup_*            # 应用备份
```

### 环境变量说明

| 变量名 | 说明 | 必填 |
|--------|------|------|
| NODE_ENV | 运行环境 | 是 |
| PORT | 应用端口 | 否（默认 3000） |
| DATABASE_URL | 数据库连接 | 是 |
| JWT_SECRET | JWT 密钥 | 是 |
| COOKIE_DOMAIN | Cookie 域名 | 否 |
| S3_* | 对象存储配置 | 否 |
| ALIYUN_* | 短信服务配置 | 否 |

### 端口说明

| 端口 | 用途 | 说明 |
|------|------|------|
| 22 | SSH | 远程登录 |
| 80 | HTTP | Web 访问 |
| 443 | HTTPS | 安全 Web 访问 |
| 3000 | 应用 | Next.js 应用 |

## 联系信息

- **服务器 IP**: 42.121.218.14
- **项目仓库**: https://github.com/MFCR7788/sifan.git
- **应用端口**: 3000
- **Web 端口**: 80

---

**最后更新**: 2025-01-21  
**版本**: 1.0.0
