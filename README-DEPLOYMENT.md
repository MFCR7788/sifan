# 服务器快速部署指南

## 📋 快速开始

### 1️⃣ 推送代码到 GitHub（在你的本地电脑）

由于 Git 需要认证，请选择以下方式之一：

#### 方式一：使用 Personal Access Token（推荐）

```bash
# 1. 访问 https://github.com/settings/tokens 生成 token
# 2. 配置 Git
git remote set-url origin https://<YOUR_TOKEN>@github.com/MFCR7788/sifan.git

# 3. 推送代码
git push origin main
```

#### 方式二：使用 SSH Key

```bash
# 1. 生成 SSH Key
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# 2. 添加到 GitHub（Settings → SSH and GPG keys）

# 3. 修改远程地址
git remote set-url origin git@github.com:MFCR7788/sifan.git

# 4. 推送代码
git push origin main
```

---

### 2️⃣ 服务器部署（SSH 登录服务器）

```bash
# 登录服务器
ssh root@42.121.218.14

# 进入项目目录
cd /workspace/projects

# 脚本已添加执行权限，直接运行
sudo ./deploy-to-server.sh
```

---

### 3️⃣ 验证部署

访问以下地址：
- http://www.zjsifan.com
- http://zjsifan.com
- http://42.121.218.14

---

## 🛠️ 脚本说明

### `deploy-to-server.sh` - 首次部署

**功能：**
- ✅ 安装 Node.js、pnpm、PM2、Nginx
- ✅ 安装依赖并构建
- ✅ 启动应用（PM2 管理在 5000 端口）
- ✅ 配置 Nginx 反向代理

**使用：**
```bash
sudo ./deploy-to-server.sh
```

---

### `update-server.sh` - 快速更新

**功能：**
- ✅ 拉取最新代码
- ✅ 更新依赖
- ✅ 重新构建
- ✅ 重启应用

**使用：**
```bash
sudo ./update-server.sh
```

---

### `fix-nginx-configuration.sh` - Nginx 修复

**功能：**
- ✅ 修正配置端口（3000 → 5000）
- ✅ 启动 Nginx 服务
- ✅ 验证 80 端口

**使用：**
```bash
sudo ./fix-nginx-configuration.sh
```

---

### `setup-https-fixed.sh` - HTTPS 配置

**功能：**
- ✅ 安装 Certbot
- ✅ 申请 Let's Encrypt 证书
- ✅ 配置 HTTPS
- ✅ 自动续期

**使用：**
```bash
sudo ./setup-https-fixed.sh
```

---

## 📝 常用命令

### PM2 管理

```bash
pm2 status                    # 查看状态
pm2 logs nextjs-app           # 查看日志
pm2 restart nextjs-app        # 重启应用
pm2 stop nextjs-app           # 停止应用
```

### Nginx 管理

```bash
sudo service nginx status     # 查看状态
sudo service nginx restart    # 重启 Nginx
sudo nginx -t                 # 测试配置
sudo tail -f /var/log/nginx/enterprise-website-error.log  # 查看日志
```

### Git 操作

```bash
git status                    # 查看状态
git pull origin main          # 拉取代码
git log --oneline -10         # 查看提交
```

---

## 🔍 故障排查

### 应用无法启动？

```bash
pm2 logs nextjs-app           # 查看日志
ss -tuln | grep :5000         # 检查端口
```

### Nginx 502 错误？

```bash
pm2 status                    # 检查应用状态
curl http://localhost:5000    # 测试应用
sudo tail -f /var/log/nginx/error.log  # 查看 Nginx 日志
```

### 域名无法访问？

```bash
dig www.zjsifan.com +short    # 检查 DNS
sudo service nginx status     # 检查 Nginx
curl -I http://42.121.218.14 # 测试 IP 访问
```

---

## 📚 详细文档

- [完整部署指南](DEPLOYMENT-GUIDE.md) - 详细的部署步骤和说明
- [域名访问问题诊断](DOMAIN-ACCESS-PROBLEM.md) - 解决域名无法访问问题
- [HTTPS 配置指南](HTTPS-SETUP-GUIDE.md) - 配置 HTTPS 访问

---

## ✅ 检查清单

部署前确认：
- [ ] 服务器已配置 SSH 访问
- [ ] 已推送代码到 GitHub
- [ ] 阿里云安全组开放 80、443 端口
- [ ] 域名 DNS 解析已生效

部署后验证：
- [ ] PM2 应用运行正常
- [ ] Nginx 服务运行正常
- [ ] IP 地址可以访问
- [ ] 域名可以访问
- [ ] 日志无错误

---

## 📞 联系支持

如有问题，查看日志：
- PM2: `pm2 logs nextjs-app`
- Nginx: `/var/log/nginx/enterprise-website-error.log`
- 应用: `/workspace/projects/.next/server/logs`

---

**部署脚本已就绪，祝部署顺利！** 🚀
