# 阿里云服务器部署快速指南

## 📋 快速开始（5 分钟部署）

### 第一步：配置环境变量（本地）

```bash
# 1. 编辑 .env.production
vim .env.production

# 2. 必须配置：
#    DATABASE_URL="postgresql://username:password@host:5432/dbname"
#    JWT_SECRET="随机生成的32位字符串"

# 3. 生成 JWT 密钥
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 4. 提交到 Git
git add .env.production
git commit -m "chore: 配置生产环境变量"
git push origin main
```

### 第二步：初始化服务器（服务器）

```bash
# 1. 上传初始化脚本
scp server-init.sh root@42.121.218.14:/root/

# 2. 登录服务器
ssh root@42.121.218.14

# 3. 执行初始化（自动安装 Node.js, PM2, Nginx 等）
chmod +x server-init.sh && ./server-init.sh
```

### 第三步：部署应用（服务器）

```bash
# 1. 上传部署脚本（在另一个终端）
scp deploy-server.sh root@42.121.218.14:/root/

# 2. 执行部署（自动克隆代码、构建、启动）
chmod +x deploy-server.sh && ./deploy-server.sh
```

### 第四步：验证部署

```bash
# 查看应用状态
pm2 status

# 访问网站（在本地浏览器）
http://42.121.218.14
```

## ✅ 部署成功！

访问 http://42.121.218.14 查看你的网站。

## 📚 常用命令

```bash
# 查看日志
pm2 logs enterprise-website

# 重启应用
pm2 restart enterprise-website

# 查看状态
pm2 status

# 重新部署
./deploy-server.sh

# Nginx 日志
tail -f /var/log/nginx/enterprise-website-access.log
```

## 🔧 快速修复

### 问题：应用无法启动

```bash
pm2 logs enterprise-website --lines 50
```

### 问题：502 错误

```bash
pm2 status
netstat -tuln | grep 3000
```

### 问题：重新部署

```bash
cd /workspace/projects
git pull origin main
pm2 restart enterprise-website
```

## 📖 详细文档

查看 [SERVER_DEPLOYMENT_GUIDE.md](SERVER_DEPLOYMENT_GUIDE.md) 了解完整部署流程。

## 🎯 文件说明

- `server-init.sh` - 服务器环境初始化脚本
- `deploy-server.sh` - 应用部署脚本
- `.env.production` - 生产环境变量配置
- `SERVER_DEPLOYMENT_GUIDE.md` - 详细部署文档

## 🆘 需要帮助？

- 检查日志：`pm2 logs enterprise-website`
- 查看状态：`pm2 status`
- 详细文档：`SERVER_DEPLOYMENT_GUIDE.md`

---

**部署完成！** 🎉
