# 部署到阿里云服务器指南

## 当前状态

✅ 代码已提交到 Git
✅ 代码已推送到 GitHub
✅ 项目构建成功
✅ 部署包已创建：`/workspace/deploy-20260112-005717.tar.gz` (243M)

## 方案一：使用 SCP 上传（推荐）

### 1. 上传部署包到服务器

在本地执行以下命令：

```bash
# 替换为你服务器的 IP 地址和用户名
scp /workspace/deploy-20260112-005717.tar.gz root@your-server-ip:/root/
```

### 2. 在服务器上执行部署脚本

SSH 登录到服务器后执行：

```bash
# 解压部署包
cd /root
tar -xzf deploy-20260112-005717.tar.gz -C /workspace/projects

# 进入项目目录
cd /workspace/projects

# 安装依赖
pnpm install

# 构建项目
pnpm run build

# 重启 PM2 应用
pm2 restart enterprise-website

# 查看应用状态
pm2 list
```

## 方案二：使用 GitHub 部署（服务器端执行）

如果服务器可以访问 GitHub，可以直接在服务器上执行以下命令：

```bash
# 进入项目目录
cd /workspace/projects

# 设置 GitHub 镜像 URL（如果无法直接访问）
git remote set-url origin https://ghproxy.com/https://github.com/MFCR7788/sifan.git

# 拉取最新代码
git fetch origin main
git reset --hard origin/main
git clean -fd

# 安装依赖
pnpm install

# 构建项目
pnpm run build

# 重启 PM2 应用
pm2 restart enterprise-website

# 查看应用状态
pm2 list

# 查看日志
pm2 logs enterprise-website --lines 50
```

## 方案三：使用完整的部署脚本

在服务器上执行完整的部署脚本（包含 SSL 证书配置）：

```bash
# 如果项目目录存在，先更新代码
cd /workspace/projects
git remote set-url origin https://ghproxy.com/https://github.com/MFCR7788/sifan.git
git pull origin main

# 安装依赖
pnpm install

# 构建项目
pnpm run build

# 重启应用
pm2 restart enterprise-website

# 验证部署
pm2 list
```

## 验证部署

### 1. 检查应用状态

```bash
# 查看 PM2 应用状态
pm2 list

# 查看应用日志
pm2 logs enterprise-website --lines 50
```

### 2. 检查端口监听

```bash
# 检查 3000 端口（Next.js 应用）
ss -lptn 'sport = :3000'

# 检查 443 端口（Nginx HTTPS）
ss -lptn 'sport = :443'
```

### 3. 测试网站访问

在浏览器中访问：
- https://zjsifan.com
- https://www.zjsifan.com

## 部署后检查清单

- [ ] PM2 应用状态为 "online"
- [ ] Next.js 应用运行在 3000 端口
- [ ] Nginx 运行正常，443 端口监听
- [ ] 网站可以正常访问
- [ ] HTTPS 证书有效，显示安全锁图标
- [ ] 首页显示"旗舰连锁版"和"至尊品牌版"
- [ ] 价格显示正确（¥2980/年）

## 常见问题

### 1. 构建失败

```bash
# 清理并重新构建
rm -rf .next
pnpm install
pnpm run build
```

### 2. PM2 应用启动失败

```bash
# 查看详细错误日志
pm2 logs enterprise-website --lines 100

# 重启应用
pm2 restart enterprise-website
```

### 3. 端口被占用

```bash
# 检查 3000 端口占用
lsof -i:3000

# 杀死占用端口的进程
kill -9 <PID>
```

## 下次更新

下次更新代码时，只需执行：

```bash
# 服务器上执行
cd /workspace/projects
git pull origin main
pnpm install
pnpm run build
pm2 restart enterprise-website
```

或者使用自动化脚本：

```bash
cd /workspace/projects
./deploy-to-server.sh
```
