# 自动部署到阿里云指南

本项目支持两种部署方式：

## 方式一：GitHub Actions 自动部署（推荐）

### 配置步骤

1. **配置 GitHub Secrets**

   进入 GitHub 仓库：`Settings` → `Secrets and variables` → `Actions` → `New repository secret`

   添加以下 Secrets：

   | Secret 名称 | 说明 | 示例 |
   |------------|------|------|
   | `SSH_HOST` | 阿里云服务器 IP 地址 | `47.98.xxx.xxx` |
   | `SSH_USERNAME` | 服务器用户名 | `root` |
   | `SSH_PORT` | SSH 端口 | `22` |
   | `SSH_PRIVATE_KEY` | SSH 私钥内容 | 从本地 `~/.ssh/id_rsa` 复制 |

2. **获取 SSH 私钥**

   ```bash
   cat ~/.ssh/id_rsa
   ```

   将输出的内容（包括 `-----BEGIN PRIVATE KEY-----` 和 `-----END PRIVATE KEY-----`）复制到 GitHub Secret `SSH_PRIVATE_KEY`

3. **测试连接**

   确保本地能通过 SSH 连接到服务器：

   ```bash
   ssh root@your-aliyun-server-ip
   ```

4. **首次手动触发**

   进入 GitHub 仓库：`Actions` → 选择 `Build and Deploy to Aliyun` → `Run workflow`

5. **自动触发**

   以后每次推送到 `main` 分支会自动触发部署

### 工作流程

1. GitHub Actions 拉取代码
2. 安装依赖并构建项目
3. 打包 `.next` 目录
4. 通过 SCP 上传到服务器
5. 在服务器上解压并重启 PM2 服务

---

## 方式二：本地手动部署

如果 GitHub Actions 不可用，可以使用本地脚本部署。

### 配置

编辑 `scripts/deploy.sh`，修改以下变量：

```bash
SSH_HOST="your-aliyun-server-ip"       # 服务器 IP
SSH_USERNAME="root"                     # 用户名
SSH_PORT="22"                           # SSH 端口
SSH_KEY_PATH="$HOME/.ssh/id_rsa"        # SSH 私钥路径
DEPLOY_PATH="/root/sifan"               # 服务器部署路径
PM2_APP_NAME="enterprise-website"       # PM2 应用名称
```

### 使用

```bash
# 执行部署脚本
./scripts/deploy.sh
```

脚本会自动：
1. 检查本地修改（可选择提交并推送）
2. 构建 Next.js 项目
3. 打包构建产物
4. 上传到服务器
5. 在服务器上解压并重启服务

---

## 服务器端配置

### 1. 安装 PM2

```bash
npm install -g pm2
```

### 2. 确保目录存在

```bash
mkdir -p /root/sifan
cd /root/sifan
```

### 3. 配置环境变量

在 `/root/sifan/.env.production` 中配置：

```bash
# 数据库配置
PGDATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require

# 微信支付配置
WECHAT_PAY_APPID=xxx
WECHAT_PAY_MCHID=xxx
WECHAT_PAY_API_V3_KEY=xxx
WECHAT_PAY_SERIAL_NO=xxx
WECHAT_PAY_PRIVATE_KEY_PATH=/root/sifan/certs/apiclient_key.pem
WECHAT_PAY_CERT_PATH=/root/sifan/certs/apiclient_cert.pem

# 网站基础 URL
NEXT_PUBLIC_BASE_URL=https://your-domain.com
```

### 4. PM2 配置文件

项目已包含 `ecosystem.config.js`，无需额外配置。

### 5. 启动服务

```bash
pm2 start ecosystem.config.js
pm2 save
```

---

## 常见问题

### 1. GitHub Actions 部署失败

- 检查 GitHub Secrets 是否正确配置
- 确认服务器防火墙允许 SSH 连接（端口 22）
- 查看 Actions 日志排查具体错误

### 2. SSH 连接失败

```bash
# 测试 SSH 连接
ssh -p 22 -i ~/.ssh/id_rsa root@your-server-ip

# 检查服务器 SSH 服务
systemctl status sshd
```

### 3. PM2 服务无法启动

```bash
# 查看 PM2 日志
pm2 logs enterprise-website

# 查看 PM2 状态
pm2 status
pm2 describe enterprise-website
```

### 4. 服务端口被占用

```bash
# 检查端口占用
netstat -tlnp | grep 5000
```

---

## 监控和维护

### 查看 PM2 状态

```bash
pm2 status              # 查看所有应用状态
pm2 logs enterprise-website  # 查看应用日志
pm2 restart enterprise-website  # 重启应用
pm2 stop enterprise-website     # 停止应用
pm2 delete enterprise-website   # 删除应用
```

### 日志文件位置

- PM2 日志：`/root/sifan/logs/pm2-error.log` 和 `/root/sifan/logs/pm2-out.log`
- Next.js 日志：`/root/sifan/.next/trace`

---

## 回滚

如果新版本有问题，可以快速回滚：

```bash
ssh root@your-server-ip

cd /root/sifan

# 列出备份
ls -la .next.backup.*

# 恢复备份（替换为具体的备份目录名）
mv .next .next.failed
mv .next.backup.20250112_150000 .next

# 重启服务
pm2 restart enterprise-website
```
