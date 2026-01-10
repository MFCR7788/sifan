# 📦 服务器部署脚本包

已为您生成完整的服务器部署脚本，可直接在服务器上运行。

## 🚀 快速使用（3 步完成部署）

### 第 1 步：推送代码到 GitHub（在你的本地电脑）

由于 Git 需要认证，请选择以下方式之一：

#### 方式 A：使用 Personal Access Token（推荐）

```bash
# 1. 访问 https://github.com/settings/tokens
# 2. 生成新 token，勾选 repo 权限
# 3. 复制 token（只显示一次）

# 4. 在本地项目目录执行
git remote set-url origin https://<YOUR_TOKEN>@github.com/MFCR7788/sifan.git
git push origin main
```

#### 方式 B：使用 SSH Key

```bash
# 1. 生成 SSH Key
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# 2. 复制公钥内容
cat ~/.ssh/id_rsa.pub

# 3. 添加到 GitHub（Settings → SSH and GPG keys → New SSH key）

# 4. 在本地项目目录执行
git remote set-url origin git@github.com:MFCR7788/sifan.git
git push origin main
```

---

### 第 2 步：登录服务器并拉取代码

```bash
# SSH 登录服务器
ssh root@42.121.218.14

# 进入工作目录
cd /workspace/projects

# 拉取代码并部署（首次部署）
sudo ./pull-and-deploy.sh
```

**或手动拉取：**

```bash
# 方式 1：使用 HTTPS（可能需要配置 token）
git clone https://github.com/MFCR7788/sifan.git .

# 方式 2：使用 SSH（推荐，需先配置 SSH key）
git clone git@github.com:MFCR7788/sifan.git .

# 进入项目目录
cd sifan

# 运行部署脚本
sudo ./deploy-to-server.sh
```

---

### 第 3 步：验证部署

访问以下地址：
- http://www.zjsifan.com
- http://zjsifan.com
- http://42.121.218.14

---

## 📋 脚本文件说明

### 核心部署脚本

| 脚本文件 | 功能 | 使用场景 |
|---------|------|---------|
| `pull-and-deploy.sh` | 从 GitHub 拉取代码并部署 | 首次部署 |
| `deploy-to-server.sh` | 完整部署（安装依赖、构建、启动） | 首次部署、环境重置 |
| `update-server.sh` | 快速更新代码并重启 | 日常更新 |
| `fix-nginx-configuration.sh` | 修复 Nginx 配置 | Nginx 问题修复 |
| `setup-https-fixed.sh` | 配置 HTTPS | 申请 SSL 证书 |

### 文档文件

| 文档 | 内容 |
|------|------|
| `README-DEPLOYMENT.md` | 快速开始指南 |
| `DEPLOYMENT-GUIDE.md` | 完整部署文档 |
| `DOMAIN-ACCESS-PROBLEM.md` | 域名访问问题诊断 |

---

## 🛠️ 常用命令速查

### PM2 应用管理

```bash
pm2 status                    # 查看应用状态
pm2 logs nextjs-app           # 查看日志
pm2 restart nextjs-app        # 重启应用
pm2 stop nextjs-app           # 停止应用
pm2 delete nextjs-app         # 删除应用
```

### Nginx 管理

```bash
sudo service nginx status     # 查看状态
sudo service nginx restart    # 重启
sudo nginx -t                 # 测试配置
sudo tail -f /var/log/nginx/enterprise-website-error.log  # 查看日志
```

### Git 操作

```bash
git status                    # 查看状态
git pull origin main          # 拉取最新代码
git log --oneline -10         # 查看提交历史
```

---

## 🔍 故障排查

### 1. 应用无法启动

```bash
# 查看日志
pm2 logs nextjs-app

# 检查端口
ss -tuln | grep :5000

# 手动启动测试
pnpm run start -p 5000
```

### 2. Nginx 502 错误

```bash
# 检查应用状态
pm2 status

# 测试应用
curl http://localhost:5000

# 查看日志
sudo tail -f /var/log/nginx/error.log
```

### 3. 域名无法访问

```bash
# 检查 DNS
dig www.zjsifan.com +short

# 检查 Nginx
sudo service nginx status
ss -tuln | grep :80

# 测试 IP
curl -I http://42.121.218.14
```

### 4. Git 推送失败

```bash
# 检查远程仓库
git remote -v

# 重新配置
git remote set-url origin https://<TOKEN>@github.com/MFCR7788/sifan.git
git push origin main
```

---

## 📝 部署流程图

```
本地开发
    ↓
git commit & push
    ↓
GitHub 仓库
    ↓
服务器：git pull / git clone
    ↓
sudo ./deploy-to-server.sh
    ↓
├─ 安装依赖 (pnpm install)
├─ 构建应用 (pnpm run build)
├─ 启动应用 (PM2)
└─ 配置 Nginx
    ↓
✓ 部署完成
```

---

## ✅ 部署前检查清单

- [ ] 已推送代码到 GitHub
- [ ] 服务器 SSH 可以访问
- [ ] 阿里云安全组开放 80、443 端口
- [ ] 域名 DNS 解析已生效（指向 42.121.218.14）
- [ ] 服务器有足够的磁盘空间

## ✅ 部署后验证清单

- [ ] PM2 应用运行正常（`pm2 status`）
- [ ] Nginx 服务运行正常（`sudo service nginx status`）
- [ ] 5000 端口监听正常（`ss -tuln | grep :5000`）
- [ ] 80 端口监听正常（`ss -tuln | grep :80`）
- [ ] IP 地址可以访问（http://42.121.218.14）
- [ ] 域名可以访问（http://www.zjsifan.com）
- [ ] 无错误日志

---

## 📞 获取帮助

### 查看日志

```bash
# PM2 应用日志
pm2 logs nextjs-app

# Nginx 错误日志
sudo tail -f /var/log/nginx/enterprise-website-error.log

# Nginx 访问日志
sudo tail -f /var/log/nginx/enterprise-website-access.log
```

### 查看文档

- 快速开始：`cat README-DEPLOYMENT.md`
- 完整指南：`cat DEPLOYMENT-GUIDE.md`
- 问题诊断：`cat DOMAIN-ACCESS-PROBLEM.md`

---

## 🔐 安全建议

### 1. 配置防火墙

```bash
# 安装 UFW
apt-get install -y ufw

# 开放端口
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS

# 启用防火墙
ufw enable
```

### 2. 使用 SSH Key 登录

避免使用密码登录，使用 SSH Key 更安全。

### 3. 定期备份

```bash
# 备份数据库
pg_dump zjsifan_db > backup_$(date +%Y%m%d).sql

# 备份配置
tar -czf config_backup_$(date +%Y%m%d).tar.gz /etc/nginx/
```

---

## 📅 后续优化

### 1. 配置 HTTPS

```bash
sudo ./setup-https-fixed.sh
```

### 2. 配置数据库备份

设置定时任务自动备份数据库。

### 3. 配置监控

使用 PM2 监控功能：

```bash
pm2 monit
```

### 4. 配置日志轮转

防止日志文件过大：

```bash
sudo nano /etc/logrotate.d/enterprise-website
```

---

## 🎯 总结

您现在拥有：

✅ 5 个自动化部署脚本
✅ 3 个详细文档
✅ 完整的故障排查指南
✅ 一键部署和更新能力

**开始部署：**

```bash
# 在本地电脑推送代码
git push origin main

# 在服务器上拉取并部署
ssh root@42.121.218.14
cd /workspace/projects
sudo ./pull-and-deploy.sh
```

---

**祝部署顺利！** 🚀

如有问题，请查看对应文档或日志。
