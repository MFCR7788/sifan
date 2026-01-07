# 快速部署指南

## 🚀 5分钟快速部署到 Vercel（推荐新手）

### 步骤 1：准备代码
```bash
# 提交代码到 GitHub
git add .
git commit -m "Ready to deploy"
git push origin main
```

### 步骤 2：部署到 Vercel
1. 访问 https://vercel.com 并注册账号
2. 点击 "Add New Project" → "Import Git Repository"
3. 选择您的项目仓库
4. 点击 "Deploy"（使用默认配置即可）

### 步骤 3：完成
等待 2-5 分钟，部署完成！您会获得一个类似 `your-project.vercel.app` 的域名。

---

## 🐳 Docker 一键部署（推荐开发者）

### 前置要求
- 已安装 Docker 和 Docker Compose

### 步骤
```bash
# 1. 克隆项目
git clone your-repo-url
cd your-repo

# 2. 创建 .env 文件
cp .env.example .env
nano .env  # 编辑配置

# 3. 启动
docker-compose up -d

# 4. 访问
# 浏览器打开 http://localhost:5000
```

---

## 🌐 云服务器部署（推荐企业）

### 快速部署脚本

在服务器上执行：

```bash
# 1. 下载部署脚本
wget https://your-domain.com/deploy.sh

# 2. 添加执行权限
chmod +x deploy.sh

# 3. 运行部署脚本
sudo bash deploy.sh

# 4. 配置域名 DNS 解析
# 将您的域名 A 记录指向服务器 IP

# 5. 配置 HTTPS（可选）
sudo certbot --nginx -d your-domain.com
```

### 手动部署（推荐用于生产环境）

详细步骤请查看 [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

## 📋 部署前检查清单

在部署前，请确保：

- [ ] 代码已提交到 Git 仓库
- [ ] `.env` 文件已配置（如有必要）
- [ ] 数据库连接字符串正确（如有必要）
- [ ] 所有依赖都在 package.json 中
- [ ] 图片等静态资源路径正确
- [ ] 已在本地测试通过

---

## 🛠️ 常见问题

### 1. Vercel 部署失败
- 检查 GitHub 仓库是否公开
- 确保构建命令正确：`npm run build`
- 查看部署日志定位错误

### 2. Docker 启动失败
```bash
# 查看日志
docker-compose logs

# 重新构建
docker-compose build --no-cache
docker-compose up -d
```

### 3. 服务器部署失败
- 检查端口 5000 是否被占用
- 检查 Nginx 配置是否正确
- 查看 PM2 日志：`pm2 logs`

---

## 📞 需要帮助？

- 查看完整部署指南：[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- Next.js 官方文档：https://nextjs.org/docs/deployment
- Vercel 文档：https://vercel.com/docs

---

## 🔥 部署方式推荐

| 使用场景 | 推荐方案 | 难度 | 时间 |
|---------|---------|------|------|
| 个人项目 / 演示 | Vercel | ⭐ | 5分钟 |
| 开发测试 | Docker | ⭐⭐ | 10分钟 |
| 生产环境 | 云服务器 | ⭐⭐⭐⭐ | 30分钟 |

选择适合您的方案开始部署吧！🚀
