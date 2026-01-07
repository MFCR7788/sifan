# 网站部署详细指南

本项目基于 Next.js 16，提供多种部署方式。请根据您的需求选择合适的方案。

---

## 方案一：Vercel 部署（推荐，最简单）

### 优势
- Next.js 官方平台，零配置
- 全球 CDN，访问速度快
- 自动 HTTPS
- 免费额度充足
- 支持持续部署

### 部署步骤

#### 1. 注册 Vercel 账号
- 访问 https://vercel.com
- 使用 GitHub、GitLab 或邮箱注册

#### 2. 关联代码仓库
- 登录后点击 "Add New Project"
- 选择 "Import Git Repository"
- 选择您的项目仓库

#### 3. 配置项目设置
- Framework Preset: Next.js
- Root Directory: `./` (保持默认)
- Build Command: `npm run build`
- Output Directory: `.next`
- Install Command: `npm install` 或 `pnpm install`

#### 4. 环境变量配置（如果需要）
在 Environment Variables 中添加：
```
DATABASE_URL=your_database_url
# 其他需要的环境变量
```

#### 5. 部署
- 点击 "Deploy" 按钮
- 等待构建完成（约 2-5 分钟）
- 部署成功后会获得类似 `your-project.vercel.app` 的域名

#### 6. 自定义域名（可选）
- 进入项目 Settings → Domains
- 添加您自己的域名
- 按提示配置 DNS 记录

### 注意事项
- 确保项目已推送到 GitHub
- 如果使用 pnpm，需在项目根目录创建 `package-lock.json` 或使用 npm
- 免费版有限制：100GB 带宽/月，6,000 分钟构建时间/月

---

## 方案二：Netlify 部署

### 优势
- 界面友好，配置简单
- 免费额度充足
- 支持 Serverless Functions
- 自动 SSL

### 部署步骤

#### 1. 注册 Netlify 账号
- 访问 https://netlify.com
- 使用 GitHub、GitLab 等账号登录

#### 2. 新建站点
- 点击 "Add new site" → "Import an existing project"
- 选择您的 GitHub 仓库

#### 3. 配置构建设置
```
Build command: pnpm run build
Publish directory: .next
```

#### 4. 环境变量配置
在 Site settings → Environment variables 中添加：
```
NODE_VERSION=20
DATABASE_URL=your_database_url
```

#### 5. 部署
- 点击 "Deploy site"
- 等待构建完成

---

## 方案三：云服务器部署（最灵活）

适用场景：需要完全控制服务器，或需要自定义配置

### 前置准备
1. 购买云服务器（阿里云、腾讯云、华为云等）
2. 推荐配置：
   - CPU: 2 核
   - 内存: 4GB
   - 带宽: 5Mbps
   - 系统: Ubuntu 22.04 LTS

### 详细部署步骤

#### 步骤 1：服务器初始化配置

```bash
# 1. 更新系统
sudo apt update && sudo apt upgrade -y

# 2. 安装 Node.js (建议使用 Node.js 20)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 3. 安装 pnpm
npm install -g pnpm

# 4. 安装 PM2（进程管理工具）
sudo npm install -g pm2

# 5. 安装 Nginx
sudo apt install -y nginx

# 6. 配置防火墙
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
sudo ufw enable
```

#### 步骤 2：上传项目代码

**方式 A：使用 Git（推荐）**
```bash
# 在服务器上克隆代码
cd /var/www
sudo git clone https://github.com/your-username/your-repo.git your-project
cd your-project

# 安装依赖
pnpm install

# 构建项目
pnpm run build
```

**方式 B：使用 SCP 上传**
```bash
# 在本地执行
scp -r /path/to/your/project user@your-server-ip:/var/www/
```

#### 步骤 3：配置环境变量

创建 `.env.production` 文件：
```bash
nano .env.production
```

添加环境变量：
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
# 其他必要的环境变量
```

#### 步骤 4：使用 PM2 启动应用

```bash
# 启动应用（端口 5000）
pm2 start npm --name "nextjs-app" -- start

# 查看应用状态
pm2 status

# 查看日志
pm2 logs nextjs-app

# 设置开机自启
pm2 startup
pm2 save
```

#### 步骤 5：配置 Nginx 反向代理

创建 Nginx 配置文件：
```bash
sudo nano /etc/nginx/sites-available/your-domain.com
```

添加以下内容：
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

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

    # 静态资源缓存
    location /_next/static {
        proxy_pass http://localhost:5000;
        expires 365d;
        add_header Cache-Control "public, immutable";
    }
}
```

启用配置：
```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/your-domain.com /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启 Nginx
sudo systemctl restart nginx
```

#### 步骤 6：配置 HTTPS（SSL 证书）

使用 Let's Encrypt 免费证书：
```bash
# 安装 Certbot
sudo apt install -y certbot python3-certbot-nginx

# 获取证书并自动配置
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# 测试自动续期
sudo certbot renew --dry-run
```

#### 步骤 7：域名解析

在您的域名服务商处添加 DNS 记录：
```
类型: A
主机记录: @ 或 www
记录值: 您的服务器公网 IP
TTL: 600
```

### 日常维护

```bash
# 更新代码
cd /var/www/your-project
sudo git pull origin main
pnpm install
pnpm run build
pm2 restart nextjs-app

# 查看应用日志
pm2 logs nextjs-app

# 重启应用
pm2 restart nextjs-app

# 停止应用
pm2 stop nextjs-app
```

---

## 方案四：Docker 部署

### 创建 Dockerfile

在项目根目录创建 `Dockerfile`：

```dockerfile
# 使用官方 Node.js 镜像
FROM node:20-alpine AS base

# 安装依赖阶段
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 复制依赖文件
COPY package.json pnpm-lock.yaml* ./
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# 构建阶段
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 禁用遥测
ENV NEXT_TELEMETRY_DISABLED 1

# 构建应用
RUN pnpm run build

# 运行阶段
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 5000

ENV PORT 5000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
```

### 创建 docker-compose.yml

```yaml
version: '3.8'

services:
  nextjs-app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://user:password@db:5432/mydb
    restart: unless-stopped
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_DB: mydb
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    restart: unless-stopped

volumes:
  postgres_data:
```

### 构建和运行

```bash
# 构建镜像
docker-compose build

# 启动服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down
```

---

## 方案对比

| 方案 | 难度 | 成本 | 控制度 | 适用场景 |
|------|------|------|--------|----------|
| Vercel | ⭐ | 免费/低成本 | 中 | 个人项目、快速上线 |
| Netlify | ⭐⭐ | 免费/低成本 | 中 | 个人项目、喜欢界面操作 |
| 云服务器 | ⭐⭐⭐⭐ | 中等 | 高 | 企业项目、需要完全控制 |
| Docker | ⭐⭐⭐ | 中等 | 高 | 微服务架构、需要环境隔离 |

---

## 推荐选择

1. **个人项目 / 快速演示**：选择 Vercel
2. **企业项目 / 需要完全控制**：选择云服务器 + Nginx
3. **微服务架构**：选择 Docker
4. **不熟悉服务器运维**：选择 Vercel 或 Netlify

---

## 常见问题

### 1. 构建失败怎么办？
- 检查依赖是否正确安装：`pnpm install`
- 检查 Node.js 版本是否匹配
- 查看构建日志定位错误

### 2. 图片无法加载？
- 确保 Next.js 配置中正确配置了图片域名
- 检查图片路径是否正确

### 3. 数据库连接失败？
- 检查数据库连接字符串
- 确保数据库白名单配置正确
- 检查防火墙设置

### 4. 如何备份数据？
```bash
# PostgreSQL 备份
pg_dump -U username -d dbname > backup.sql

# 恢复
psql -U username -d dbname < backup.sql
```

---

## 需要帮助？

如果在部署过程中遇到问题，可以：
1. 查看 Next.js 官方文档：https://nextjs.org/docs/deployment
2. 查看各平台的官方文档
3. 联系技术支持

祝部署顺利！🚀
