# GitHub代码同步命令

## 方式1：一键部署脚本（推荐）

```bash
# 在服务器上执行：
cd /root/code_deploy_application
bash scripts/deploy.sh
```

---

## 方式2：手动执行步骤

### 1. 进入项目目录
```bash
cd /root/code_deploy_application
```

### 2. 停止当前服务
```bash
pm2 stop sifan-web
pm2 delete sifan-web
```

### 3. 拉取最新代码
```bash
git fetch origin
git reset --hard origin/main
git pull origin main
```

### 4. 安装依赖
```bash
pnpm install --frozen-lockfile
```

### 5. 构建生产版本
```bash
pnpm run build
```

### 6. 启动服务
```bash
pm2 start ecosystem.config.js
pm2 save
```

### 7. 查看服务状态
```bash
pm2 status
pm2 logs sifan-web --lines 10
```

---

## 方式3：快速更新（无重启）

如果只是代码更新，不需要重新构建，可以快速重启：

```bash
cd /root/code_deploy_application
git pull origin main
pm2 restart sifan-web
```

---

## 方式4：设置自动同步（定时任务）

每天凌晨2点自动同步代码：

```bash
# 编辑crontab
crontab -e

# 添加以下行（每天凌晨2点执行）
0 2 * * * cd /root/code_deploy_application && bash scripts/deploy.sh >> /var/log/deploy.log 2>&1

# 保存退出
```

---

## 验证部署

### 检查服务状态
```bash
pm2 status
```

### 查看日志
```bash
pm2 logs sifan-web
```

### 测试网站访问
```bash
curl -I http://localhost:3000
curl -I https://zjsifan.com
```

---

## 常见问题

### 如果Git报错"需要配置用户信息"
```bash
git config --global user.email "admin@zjsifan.com"
git config --global user.name "Admin"
```

### 如果遇到冲突
```bash
# 强制使用远程代码
git reset --hard origin/main
```

### 如果PM2进程不存在
```bash
# 重新启动
pm2 start ecosystem.config.js
pm2 save
```

---

## 推荐使用方式1

**一键部署脚本**最简单，包含完整的部署流程：
- 停止服务 → 拉取代码 → 安装依赖 → 构建 → 启动服务 → 显示状态

只需一条命令：
```bash
cd /root/code_deploy_application && bash scripts/deploy.sh
```
