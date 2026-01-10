# GitHub 同步与服务器部署指南

## 一、GitHub 同步

由于 Git 需要认证，请在你的本地电脑上执行以下步骤：

### 1. 配置 Git 认证（如果未配置）

#### 方法一：使用 Personal Access Token（推荐）

1. 生成 GitHub Personal Access Token：
   - 访问 https://github.com/settings/tokens
   - 点击 "Generate new token" → "Generate new token (classic)"
   - 选择权限：`repo` (完全控制仓库)
   - 点击 "Generate token"
   - **复制生成的 token**（只显示一次）

2. 在本地电脑配置 Git：
   ```bash
   cd /path/to/sifan  # 进入项目目录
   git remote set-url origin https://<YOUR_TOKEN>@github.com/MFCR7788/sifan.git
   git push origin main
   ```

#### 方法二：使用 SSH Key

1. 生成 SSH Key：
   ```bash
   ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
   ```

2. 添加到 GitHub：
   - 复制 `~/.ssh/id_rsa.pub` 内容
   - 访问 https://github.com/settings/keys
   - 点击 "New SSH key"，粘贴内容

3. 修改远程仓库地址：
   ```bash
   git remote set-url origin git@github.com:MFCR7788/sifan.git
   git push origin main
   ```

### 2. 推送到 GitHub

```bash
# 查看本地提交
git log --oneline -5

# 推送到 GitHub
git push origin main
```

### 3. 验证推送成功

访问：https://github.com/MFCR7788/sifan

---

## 二、服务器部署步骤

### 方案一：自动部署（推荐）

#### 1. 上传脚本到服务器

将以下脚本上传到服务器 `/workspace/projects/` 目录：
- `deploy-to-server.sh`
- `update-server.sh`
- `fix-nginx-configuration.sh`
- `setup-https-fixed.sh`

#### 2. 首次部署

```bash
# SSH 登录服务器
ssh root@42.121.218.14

# 进入项目目录
cd /workspace/projects

# 赋予脚本执行权限
chmod +x deploy-to-server.sh

# 运行部署脚本
sudo ./deploy-to-server.sh
```

#### 3. 更新部署（后续代码更新）

```bash
cd /workspace/projects

# 方式一：使用更新脚本
sudo ./update-server.sh

# 方式二：手动更新
git pull origin main
pnpm install
pnpm run build
pm2 restart nextjs-app
```

### 方案二：手动部署

如果自动脚本失败，可以手动执行：

```bash
# 1. 进入项目目录
cd /workspace/projects

# 2. 安装依赖
pnpm install

# 3. 构建生产版本
pnpm run build

# 4. 使用 PM2 启动应用
pm2 start npm --name "nextjs-app" -- start -- -p 5000 -H 0.0.0.0

# 5. 保存 PM2 配置
pm2 save

# 6. 配置 Nginx
sudo nano /etc/nginx/sites-available/enterprise-website
# 确保端口指向 5000

# 7. 测试 Nginx 配置
sudo nginx -t

# 8. 重启 Nginx
sudo service nginx restart
```

---

## 三、服务器脚本说明

### 1. deploy-to-server.sh（首次部署脚本）

**功能：**
- ✅ 检查并安装 Node.js、pnpm、PM2
- ✅ 安装项目依赖
- ✅ 构建生产版本
- ✅ 使用 PM2 启动应用（端口 5000）
- ✅ 配置 Nginx 反向代理
- ✅ 验证部署状态

**使用方法：**
```bash
sudo ./deploy-to-server.sh
```

**适用场景：**
- 首次部署
- 服务器重装后重新部署
- 完整环境搭建

---

### 2. update-server.sh（快速更新脚本）

**功能：**
- ✅ 拉取最新代码（git pull）
- ✅ 更新依赖
- ✅ 重新构建
- ✅ 重启 PM2 应用
- ✅ 验证更新状态

**使用方法：**
```bash
sudo ./update-server.sh
```

**适用场景：**
- 代码更新后快速部署
- 修复 bug 后立即发布
- 功能迭代发布

---

### 3. fix-nginx-configuration.sh（Nginx 修复脚本）

**功能：**
- ✅ 修正 Nginx 配置端口（3000 → 5000）
- ✅ 启动 Nginx 服务
- ✅ 验证 80 端口监听

**使用方法：**
```bash
sudo ./fix-nginx-configuration.sh
```

**适用场景：**
- Nginx 配置错误
- Nginx 服务未启动
- 端口冲突修复

---

### 4. setup-https-fixed.sh（HTTPS 配置脚本）

**功能：**
- ✅ 安装 Certbot
- ✅ 申请 Let's Encrypt SSL 证书
- ✅ 配置 Nginx HTTPS
- ✅ 配置自动续期

**使用方法：**
```bash
sudo ./setup-https-fixed.sh
```

**适用场景：**
- 配置 HTTPS 访问
- 申请免费 SSL 证书
- SSL 证书续期

---

## 四、常用管理命令

### PM2 应用管理

```bash
# 查看应用状态
pm2 status

# 查看应用日志
pm2 logs nextjs-app

# 查看最近 20 行日志
pm2 logs nextjs-app --lines 20

# 重启应用
pm2 restart nextjs-app

# 停止应用
pm2 stop nextjs-app

# 删除应用
pm2 delete nextjs-app

# 查看详细信息
pm2 describe nextjs-app

# 监控
pm2 monit
```

### Nginx 管理

```bash
# 查看 Nginx 状态
sudo service nginx status

# 重启 Nginx
sudo service nginx restart

# 重新加载配置
sudo service nginx reload

# 测试配置
sudo nginx -t

# 查看 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# 查看访问日志
sudo tail -f /var/log/nginx/enterprise-website-access.log
```

### Git 操作

```bash
# 查看当前分支
git branch

# 查看提交历史
git log --oneline -10

# 查看状态
git status

# 拉取最新代码
git pull origin main
```

---

## 五、故障排查

### 问题 1: 应用无法启动

**检查步骤：**
```bash
# 1. 查看 PM2 日志
pm2 logs nextjs-app

# 2. 检查端口占用
ss -tuln | grep :5000

# 3. 手动启动测试
pnpm run start -p 5000
```

**常见原因：**
- 端口被占用
- 依赖缺失
- 配置文件错误

---

### 问题 2: Nginx 502 Bad Gateway

**检查步骤：**
```bash
# 1. 检查 Next.js 应用是否运行
pm2 status
curl http://localhost:5000

# 2. 检查 Nginx 错误日志
sudo tail -f /var/log/nginx/error.log

# 3. 检查 Nginx 配置
sudo nginx -t
```

**常见原因：**
- Next.js 应用未启动
- Nginx 配置端口错误
- 防火墙阻止

---

### 问题 3: 域名无法访问

**检查步骤：**
```bash
# 1. 检查 DNS 解析
dig www.zjsifan.com +short

# 2. 检查 Nginx 是否运行
sudo service nginx status

# 3. 检查 80 端口
ss -tuln | grep :80

# 4. 测试 IP 访问
curl -I http://42.121.218.14
```

**常见原因：**
- DNS 解析未生效
- 安全组未开放 80 端口
- Nginx 未启动

---

## 六、监控与日志

### 实时日志查看

```bash
# 应用日志
pm2 logs nextjs-app

# Nginx 访问日志
sudo tail -f /var/log/nginx/enterprise-website-access.log

# Nginx 错误日志
sudo tail -f /var/log/nginx/enterprise-website-error.log
```

### 系统资源监控

```bash
# CPU 和内存
top

# 磁盘使用
df -h

# 进程信息
ps aux | grep node
```

---

## 七、安全建议

### 1. 防火墙配置

```bash
# 安装 UFW
apt-get install -y ufw

# 开放必要端口
ufw allow 22    # SSH
ufw allow 80    # HTTP
ufw allow 443   # HTTPS
ufw enable
```

### 2. SSH 安全

```bash
# 禁用 root 登录
sudo nano /etc/ssh/sshd_config
# 修改：PermitRootLogin no

# 使用密钥登录
# (已在方案二中说明)
```

### 3. 定期备份

```bash
# 备份数据库
pg_dump zjsifan_db > backup_$(date +%Y%m%d).sql

# 备份配置文件
tar -czf config_backup_$(date +%Y%m%d).tar.gz /etc/nginx/
```

---

## 八、联系与支持

如有问题，请检查：
1. PM2 日志：`pm2 logs nextjs-app`
2. Nginx 日志：`/var/log/nginx/enterprise-website-error.log`
3. 应用日志：`/workspace/projects/.next/server/logs`

---

## 更新时间

2025-01-15 创建部署指南
