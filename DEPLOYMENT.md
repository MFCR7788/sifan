# 生产环境部署文档

## 概述

本文档详细说明了如何将Next.js企业官网项目部署到阿里云服务器（42.121.218.14）。

## 技术栈

- **框架**: Next.js 16 (App Router)
- **运行时**: Node.js 20
- **进程管理**: PM2
- **Web服务器**: Nginx
- **数据库**: PostgreSQL
- **包管理**: pnpm

## 服务器信息

- **IP地址**: 42.121.218.14
- **端口**: 3000 (应用) / 80 (Nginx)
- **项目目录**: /workspace/projects
- **运行用户**: root

## 部署前准备

### 1. 安装必要软件

```bash
# 更新系统
sudo apt update && sudo apt upgrade -y

# 安装Node.js 20
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 安装pnpm
npm install -g pnpm

# 安装PM2
npm install -g pm2

# 安装Nginx
sudo apt install -y nginx

# 安装PostgreSQL客户端（如果需要）
sudo apt install -y postgresql-client
```

### 2. 配置数据库

```bash
# 连接到PostgreSQL服务器
psql -U postgres -h your_db_host -p 5432

# 创建数据库
CREATE DATABASE your_database_name;

# 创建用户并授权
CREATE USER your_username WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE your_database_name TO your_username;

# 退出
\q
```

### 3. 配置环境变量

编辑 `.env.production` 文件，填入实际的配置信息：

```bash
vim .env.production
```

**必须配置项**:
- `DATABASE_URL`: PostgreSQL数据库连接字符串
- `JWT_SECRET`: JWT密钥（建议使用随机字符串）
- `COOKIE_DOMAIN`: 域名（如果有域名的话）
- `S3_*`: 对象存储配置（如果使用）
- `ALIYUN_*`: 短信服务配置（如果使用）

**生成随机密钥**:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## 部署步骤

### 方法1: 自动部署（推荐）

```bash
# 进入项目目录
cd /workspace/projects

# 执行部署脚本
./deploy.sh
```

### 方法2: 手动部署

#### 步骤1: 安装依赖

```bash
cd /workspace/projects
pnpm install
```

#### 步骤2: 构建项目

```bash
pnpm run build
```

#### 步骤3: 配置环境变量

```bash
cp .env.production .env
```

#### 步骤4: 配置Nginx

```bash
# 复制配置文件
sudo cp nginx.conf /etc/nginx/sites-available/enterprise-website

# 创建软链接
sudo ln -s /etc/nginx/sites-available/enterprise-website /etc/nginx/sites-enabled/enterprise-website

# 测试配置
sudo nginx -t

# 重载Nginx
sudo systemctl reload nginx
```

#### 步骤5: 使用PM2启动应用

```bash
# 启动应用
pm2 start ecosystem.config.js --env production

# 保存PM2配置
pm2 save

# 设置开机自启
pm2 startup systemd -u root --hp /root
```

## 验证部署

### 检查应用状态

```bash
# 查看PM2进程状态
pm2 status

# 查看应用日志
pm2 logs enterprise-website

# 查看实时日志
pm2 logs enterprise-website --lines 100
```

### 检查端口

```bash
# 检查3000端口是否监听
netstat -tuln | grep 3000
```

### 测试HTTP访问

```bash
# 本地测试
curl http://localhost:3000

# 外网测试
curl http://42.121.218.14
```

### 检查Nginx日志

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

### 查看应用监控

```bash
pm2 monit
```

### 清除日志

```bash
pm2 flush
```

### 更新部署（代码更新后）

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 重新执行部署脚本
./deploy.sh

# 或者手动重启
pm2 restart enterprise-website
```

## 监控和日志

### PM2监控面板

```bash
pm2 monit
```

### 系统资源监控

```bash
# CPU和内存使用
htop

# 磁盘使用
df -h

# 进程监控
ps aux | grep node
```

### 日志查看

```bash
# PM2日志
pm2 logs enterprise-website --lines 100

# PM2错误日志
pm2 logs enterprise-website --err --lines 100

# Nginx访问日志
tail -f /var/log/nginx/enterprise-website-access.log

# Nginx错误日志
tail -f /var/log/nginx/enterprise-website-error.log
```

## 备份和恢复

### 数据备份

```bash
# PostgreSQL数据库备份
pg_dump -U username -h host database_name > backup_$(date +%Y%m%d).sql

# 应用文件备份
cp -r /workspace/projects/.next /var/backups/enterprise-website/backup_$(date +%Y%m%d)
```

### 数据恢复

```bash
# PostgreSQL数据库恢复
psql -U username -h host database_name < backup_file.sql

# 应用文件恢复
cp -r /var/backups/enterprise-website/backup_date/.next /workspace/projects/
```

## 性能优化

### Nginx优化

在 `nginx.conf` 中已配置：
- Gzip压缩
- 静态资源缓存
- Keep-alive连接
- 请求大小限制

### PM2优化

在 `ecosystem.config.js` 中已配置：
- 集群模式（2个实例）
- 内存限制1G
- 自动重启

### Next.js优化

在 `next.config.ts` 中已配置：
- 图片优化
- 代码压缩
- 静态资源缓存

## 安全配置

### 防火墙配置

```bash
# 允许SSH、HTTP、HTTPS
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# 启用防火墙
sudo ufw enable
```

### SSL证书配置（使用Let's Encrypt）

```bash
# 安装Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d yourdomain.com

# 自动续期
sudo certbot renew --dry-run
```

## 故障排查

### 应用无法启动

1. 检查环境变量配置
2. 查看PM2日志: `pm2 logs enterprise-website`
3. 检查端口占用: `netstat -tuln | grep 3000`
4. 检查数据库连接

### Nginx 502错误

1. 检查应用是否正常运行: `pm2 status`
2. 检查防火墙规则
3. 查看Nginx错误日志

### 数据库连接失败

1. 检查 `DATABASE_URL` 配置
2. 检查数据库服务是否运行
3. 检查网络连接

## 联系信息

- **服务器**: 42.121.218.14
- **应用端口**: 3000
- **Nginx端口**: 80 / 443

## 附录

### 目录结构

```
/workspace/projects/
├── src/
│   ├── app/              # Next.js应用目录
│   ├── components/       # 组件目录
│   └── storage/          # 数据存储
├── .env                  # 生产环境变量（从.env.production复制）
├── .env.production       # 生产环境配置模板
├── ecosystem.config.js   # PM2配置文件
├── nginx.conf            # Nginx配置文件
├── deploy.sh             # 部署脚本
└── logs/                 # 应用日志目录
```

### 环境变量说明

| 变量名 | 说明 | 示例 |
|--------|------|------|
| NODE_ENV | 运行环境 | production |
| PORT | 应用端口 | 3000 |
| DATABASE_URL | 数据库连接 | postgresql://user:pass@host:5432/db |
| JWT_SECRET | JWT密钥 | 随机字符串 |
| COOKIE_DOMAIN | Cookie域名 | .example.com |

### 端口说明

| 端口 | 用途 | 说明 |
|------|------|------|
| 22 | SSH | 远程登录 |
| 80 | HTTP | Nginx HTTP服务 |
| 443 | HTTPS | Nginx HTTPS服务 |
| 3000 | 应用 | Next.js应用服务 |

---

**最后更新**: 2025-01-21
**版本**: 1.0.0
