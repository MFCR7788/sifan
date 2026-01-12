# 阿里云部署指南

## 部署策略说明

由于阿里云服务器无法连接 GitHub，**GitHub Actions 自动部署已被禁用**。

采用 **本地上传部署方案**：
1. 本地构建项目
2. 打包构建产物
3. 上传到阿里云服务器
4. 重启 PM2 服务

---

## 快速部署步骤

### 前置准备

1. **本地安装依赖**
```bash
pnpm install
```

2. **配置服务器信息**
编辑 `scripts/deploy.sh`，修改以下配置：
```bash
SSH_HOST="你的阿里云服务器IP"
SSH_USERNAME="root"  # 或其他用户名
SSH_PORT="22"
SSH_KEY_PATH="$HOME/.ssh/id_rsa"  # SSH 私钥路径
DEPLOY_PATH="/root/sifan"  # 服务器部署路径
PM2_APP_NAME="enterprise-website"  # PM2 应用名称
```

3. **配置 SSH 免密登录**
```bash
# 生成 SSH 密钥（如果还没有）
ssh-keygen -t rsa -b 4096

# 将公钥复制到服务器
ssh-copy-id root@your-server-ip

# 测试连接
ssh root@your-server-ip
```

---

## 部署方法

### 方法 1: 使用自动部署脚本（推荐）

```bash
# 运行部署脚本
./scripts/deploy.sh
```

脚本会自动完成以下步骤：
1. 检查本地修改（可选择提交）
2. 安装依赖
3. 构建项目
4. 创建部署包
5. 上传到服务器
6. 在服务器上解压并重启服务

### 方法 2: 手动部署（需要更多控制）

#### 步骤 1: 本地构建
```bash
# 安装依赖
pnpm install

# 构建项目（使用 Webpack）
pnpm run build
```

#### 步骤 2: 打包构建产物
```bash
# 进入构建目录
cd .next

# 创建压缩包
tar -czf ../build-package.tar.gz .

# 返回项目根目录
cd ..

# 查看压缩包大小
ls -lh build-package.tar.gz
```

#### 步骤 3: 上传到服务器
```bash
# 上传构建包
scp -P 22 build-package.tar.gz root@your-server-ip:/root/sifan/
```

#### 步骤 4: 在服务器上部署
```bash
# SSH 连接到服务器
ssh root@your-server-ip

# 进入部署目录
cd /root/sifan

# 备份当前构建（可选）
mv .next .next.backup.$(date +%Y%m%d_%H%M%S)

# 创建 .next 目录
mkdir -p .next

# 解压新构建
tar -xzf build-package.tar.gz -C .next

# 重启 PM2 服务
pm2 restart enterprise-website

# 保存 PM2 配置
pm2 save

# 清理
rm -f build-package.tar.gz
```

---

## 服务器配置检查

### 1. 检查 PM2 服务状态
```bash
# 查看服务状态
pm2 status

# 查看服务日志
pm2 logs enterprise-website

# 查看服务详细信息
pm2 describe enterprise-website
```

### 2. 检查端口监听
```bash
# 检查 5000 端口是否在监听
ss -tuln | grep :5000

# 测试服务是否可访问
curl -I http://localhost:5000
```

### 3. 检查数据库连接
```bash
# 进入项目目录
cd /root/sifan

# 运行数据库测试（如果有测试脚本）
# pnpm test:db
```

### 4. 查看服务器资源
```bash
# 查看 CPU 和内存使用
htop

# 查看磁盘使用
df -h

# 查看端口占用
netstat -tuln | grep 5000
```

---

## 生产环境配置

### 1. 环境变量配置

在服务器上创建 `.env.production` 文件：

```bash
cd /root/sifan
nano .env.production
```

添加以下配置：

```bash
# 数据库配置
DATABASE_URL=postgresql://username:password@localhost:5432/sifan

# 微信支付配置
WECHAT_PAY_ENABLE_REAL=true
WECHAT_PAY_MCHID=你的商户号
WECHAT_PAY_SERIAL_NO=你的证书序列号
WECHAT_PAY_PRIVATE_KEY_PATH=/root/sifan/certs/apiclient_key.pem
WECHAT_PAY_API_V3_KEY=你的APIv3密钥
WECHAT_PAY_NOTIFY_URL=https://yourdomain.com/api/payment/notify

# 应用配置
NODE_ENV=production
PORT=5000
```

### 2. 配置 HTTPS（使用 Nginx）

#### 安装 Nginx
```bash
# CentOS/RHEL
sudo yum install nginx -y

# Ubuntu/Debian
sudo apt-get install nginx -y
```

#### 配置 Nginx
创建配置文件 `/etc/nginx/conf.d/sifan.conf`：

```nginx
server {
    listen 80;
    server_name yourdomain.com;

    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com;

    # SSL 证书（使用 Let's Encrypt）
    ssl_certificate /etc/letsencrypt/live/yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # 反向代理到 Next.js 应用
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
```

#### 获取 Let's Encrypt 证书
```bash
# 安装 Certbot
sudo yum install certbot python3-certbot-nginx -y  # CentOS
sudo apt-get install certbot python3-certbot-nginx -y  # Ubuntu

# 获取证书
sudo certbot --nginx -d yourdomain.com

# 自动续期
sudo certbot renew --dry-run
```

#### 重启 Nginx
```bash
sudo nginx -t  # 测试配置
sudo systemctl restart nginx
sudo systemctl enable nginx  # 开机自启
```

### 3. 配置防火墙
```bash
# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --add-port=5000/tcp  # 如果需要直接访问
sudo firewall-cmd --reload

# Ubuntu/Debian (ufw)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 5000/tcp  # 如果需要直接访问
sudo ufw enable
```

---

## 故障排查

### 问题 1: 部署后无法访问

**排查步骤**：
```bash
# 1. 检查 PM2 服务是否运行
pm2 status

# 2. 查看服务日志
pm2 logs enterprise-website --lines 50

# 3. 检查端口是否监听
ss -tuln | grep :5000

# 4. 测试本地访问
curl http://localhost:5000
```

### 问题 2: 数据库连接失败

**排查步骤**：
```bash
# 1. 检查 PostgreSQL 是否运行
sudo systemctl status postgresql

# 2. 检查数据库连接
psql -U username -d sifan

# 3. 检查环境变量
cat /root/sifan/.env.production
```

### 问题 3: 支付功能异常

**排查步骤**：
```bash
# 1. 检查支付配置
cat /root/sifan/.env.production | grep WECHAT_PAY

# 2. 检查证书文件
ls -l /root/sifan/certs/

# 3. 查看支付接口日志
pm2 logs enterprise-website | grep -i payment
```

### 问题 4: HTTPS 证书问题

**排查步骤**：
```bash
# 1. 检查证书有效期
sudo certbot certificates

# 2. 手动续期
sudo certbot renew

# 3. 检查 Nginx 配置
sudo nginx -t
```

---

## 回滚部署

如果部署出现问题，可以快速回滚：

```bash
# SSH 连接到服务器
ssh root@your-server-ip

# 进入部署目录
cd /root/sifan

# 查看备份
ls -la .next.backup.*

# 回滚到指定备份
rm -rf .next
mv .next.backup.YYYYMMDD_HHMMSS .next

# 重启服务
pm2 restart enterprise-website
```

---

## 监控和维护

### 1. 设置日志轮转
```bash
# 创建日志轮转配置
sudo nano /etc/logrotate.d/enterprise-website

# 添加以下内容
/root/.pm2/logs/*.log {
    daily
    rotate 7
    compress
    missingok
    notifempty
    create 0640 root root
}
```

### 2. 监控服务状态
```bash
# 设置 PM2 开机自启
pm2 startup
pm2 save

# 监控服务
pm2 monit
```

### 3. 定期备份
```bash
# 备份数据库
pg_dump -U username sifan > backup_$(date +%Y%m%d).sql

# 备份构建产物
tar -czf next_backup_$(date +%Y%m%d).tar.gz .next
```

---

## 部署检查清单

部署前：
- [ ] 代码已提交并推送到 GitHub
- [ ] 本地构建成功（`pnpm run build`）
- [ ] 环境变量已配置（`.env.production`）
- [ ] SSH 免密登录已配置
- [ ] 服务器有足够磁盘空间

部署后：
- [ ] PM2 服务正常运行（`pm2 status`）
- [ ] 端口 5000 正常监听
- [ ] 网站可以正常访问
- [ ] 数据库连接正常
- [ ] 支付功能正常（生产环境）
- [ ] HTTPS 证书有效
- [ ] 日志无错误信息

---

## 常用命令速查

```bash
# 本地
pnpm run build              # 构建项目
tar -czf build.tar.gz .next  # 打包
scp build.tar.gz root@server:/path  # 上传

# 服务器
ssh root@server            # 连接服务器
pm2 status                 # 查看服务状态
pm2 logs app-name          # 查看日志
pm2 restart app-name       # 重启服务
pm2 stop app-name          # 停止服务
pm2 delete app-name        # 删除服务
systemctl status nginx     # 查看 Nginx 状态
systemctl restart nginx    # 重启 Nginx
```
