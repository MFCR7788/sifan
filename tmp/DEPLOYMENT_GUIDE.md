# 阿里云 ECS 生产环境部署指南

## 📋 目录

1. [快速开始](#快速开始)
2. [版本 3.0 更新说明](#版本-30-更新说明)
3. [详细部署步骤](#详细部署步骤)
4. [后续更新流程](#后续更新流程)
5. [故障排查](#故障排查)
6. [性能优化](#性能优化)
7. [安全加固](#安全加固)

---

## 🚀 快速开始

### 前提条件

- ✅ 已购买阿里云 ECS 服务器
- ✅ 服务器操作系统：CentOS 7/8 或 Ubuntu 20.04/22.04
- ✅ 已安装 Node.js 20.x
- ✅ 项目代码已上传到服务器

### 版本 3.0 更新说明

**更新日期：** 2025-01-12

**本次更新内容：**
- ✅ 修复登录/注册后 Cookie 未正确设置问题
- ✅ 修复会员信息显示"请先登录"的问题
- ✅ 修复管理员账户（15967675767）特殊处理逻辑
- ✅ 修复导航栏悬浮窗口交互问题
- ✅ 添加详细调试日志，便于问题排查
- ✅ 优化 Cookie 配置：httpOnly: false, secure: false, sameSite: 'lax'

**技术修复详情：**
1. **Cookie 配置优化**：开发环境设置 httpOnly: false 和 secure: false，确保 Cookie 正确传递
2. **AuthContext 逻辑优化**：移除登录/注册中不必要的 refreshUser 调用，直接使用 API 返回的用户信息
3. **管理员账户特殊处理**：在 /api/user/me 和 /api/user/me/member 中为 'admin-id' 添加特殊处理逻辑
4. **悬浮窗口交互优化**：使用 setTimeout 延迟 150ms 关闭，防止鼠标移动时意外关闭
5. **调试日志增强**：在登录、注册、会员查询等关键环节输出 Cookie 和用户状态

### 版本 3.1 更新说明

**更新日期：** 2025-01-12

**本次更新内容：**
- ✅ 个人中心新增会员创建时间和过期时间显示
- ✅ 个人中心累计充值/消费支持点击查看详细记录
- ✅ 导航栏悬浮窗口新增到期时间字段
- ✅ 导航栏悬浮窗口新增充值按钮
- ✅ 新增充值页面（/recharge）
- ✅ 实现充值API接口及赠送金额机制

**新增功能详情：**
1. **个人中心功能增强**：
   - 会员创建时间和过期时间显示
   - 累计充值/消费记录查询弹窗
   - 支持分页显示交易记录（每页10条）

2. **导航栏悬浮窗口优化**：
   - 在积分下方添加到期时间字段
   - 在"个人中心"按钮前添加充值按钮（黑色高亮样式）

3. **充值功能**：
   - 预设充值金额（¥100-¥10000）
   - 自定义金额输入
   - 支付方式选择（支付宝、微信支付、银行卡）
   - 充值赠送金额机制：
     - ¥500赠送¥20、¥1000赠送¥50、¥2000赠送¥120
     - ¥5000赠送¥350、¥10000赠送¥800
   - 充值成功后自动跳转到个人中心

4. **交易记录查询**：
   - 新增 `/api/user/me/member/transactions` 接口
   - 支持按类型（recharge/consumption）筛选
   - 支持分页查询

### 一键部署（推荐）

```bash
# 1. 上传部署脚本到服务器
scp deploy_production.sh root@47.86.104.44:/root/

# 2. SSH 登录服务器
ssh root@47.86.104.44

# 3. 赋予执行权限
chmod +x deploy_production.sh

# 4. 执行部署
sudo bash deploy_production.sh
```

**预计时间：** 5-10 分钟

---

## 📝 详细部署步骤

### 步骤 1：准备环境

#### 1.1 更新系统

```bash
# CentOS/RHEL
sudo yum update -y

# Ubuntu/Debian
sudo apt update && sudo apt upgrade -y
```

#### 1.2 安装 Node.js

```bash
# 安装 Node.js 20.x
curl -fsSL https://rpm.nodesource.com/setup_20.x | sudo bash -
sudo yum install -y nodejs

# 验证安装
node -v  # 应该显示 v20.x.x
npm -v
```

#### 1.3 安装 PM2（进程管理器）

```bash
sudo npm install -g pm2

# 验证安装
pm2 -v
```

#### 1.4 安装 Git

```bash
# CentOS/RHEL
sudo yum install -y git

# Ubuntu/Debian
sudo apt install -y git

# 验证安装
git --version
```

---

### 步骤 2：上传项目代码

#### 方式 A：使用 Git Clone（推荐）

```bash
# 进入项目目录
cd /root

# 克隆代码
git clone https://github.com/MFCR7788/sifan.git

# 进入项目目录
cd sifan
```

#### 方式 B：使用 SCP 上传

```bash
# 在本地机器上执行
scp -r /path/to/local/sifan root@47.86.104.44:/root/
```

---

### 步骤 3：修改部署脚本配置

编辑 `deploy_production.sh`，修改项目路径：

```bash
nano deploy_production.sh

# 修改这一行：
PROJECT_DIR="/root/sifan"  # 改为你的实际路径
```

---

### 步骤 4：执行部署

```bash
# 赋予执行权限
chmod +x deploy_production.sh

# 执行部署脚本
sudo bash deploy_production.sh
```

**脚本会自动执行以下操作：**
1. ✅ 停止开发服务（npm run dev）
2. ✅ 检查并安装 Node.js 和 PM2
3. ✅ 安装项目依赖
4. ✅ 清理旧构建
5. ✅ 构建生产版本（npm run build）
6. ✅ 启动 PM2 服务
7. ✅ 验证服务运行状态
8. ✅ 可选：配置 Nginx 反向代理
9. ✅ 配置防火墙

---

### 步骤 5：验证部署

#### 5.1 检查 PM2 状态

```bash
pm2 status
```

**期望输出：**
```
┌────┬──────────┬──────────┬─────────┬────────┬──────────┐
│ id │ name     │ mode     │ status  │ cpu    │ memory   │
├────┼──────────┼──────────┼─────────┼────────┼──────────┤
│ 0  │ sifan    │ fork     │ online  │ 0%     │ 150MB    │
└────┴──────────┴──────────┴─────────┴────────┴──────────┘
```

#### 5.2 测试 HTTP 响应

```bash
curl -I http://localhost:3000/
```

**期望输出：**
```
HTTP/1.1 200 OK
Content-Type: text/html; charset=utf-8
Cache-Control: public, max-age=0, must-revalidate
...
```

#### 5.3 查看日志

```bash
# 查看实时日志
pm2 logs sifan

# 查看最近 20 条日志
pm2 logs sifan --lines 20

# 清空日志
pm2 flush
```

#### 5.4 测试外部访问

在浏览器访问：`http://47.86.104.44:3000/`

或如果配置了 Nginx：`http://47.86.104.44/`

---

## 🔄 后续更新流程

### 日常更新（推荐）

**本地操作：**
```bash
# 1. 修改代码
# 2. 提交代码
git add .
git commit -m "描述你的修改"
git push origin main
```

**服务器操作：**
```bash
# 上传更新脚本（只需一次）
scp update_production.sh root@47.86.104.44:/root/

# 在服务器上执行
ssh root@47.86.104.44
bash update_production.sh
```

### 回滚到上一版本

```bash
bash rollback_production.sh
```

### 查看 PM2 监控

```bash
# 实时监控
pm2 monit

# 查看详细信息
pm2 show sifan
```

---

## 🔧 故障排查

### 问题 1：端口 3000 被占用

**症状：**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**解决方案：**
```bash
# 查找占用端口的进程
lsof -i :3000

# 或者
netstat -tunlp | grep 3000

# 停止进程
kill -9 <进程ID>
```

---

### 问题 2：npm install 失败

**症状：**
```
npm ERR! code ENOENT
```

**解决方案：**
```bash
# 清理缓存
npm cache clean --force

# 删除 node_modules
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

---

### 问题 3：构建失败

**症状：**
```
Error: Failed to compile
```

**解决方案：**
```bash
# 查看构建日志
npm run build

# 检查 TypeScript 错误
npx tsc --noEmit

# 查看完整错误信息
npm run build -- --debug
```

---

### 问题 4：PM2 服务异常

**症状：**
```
[PM2] Process sifan is restarting too frequently
```

**解决方案：**
```bash
# 查看错误日志
pm2 logs sifan --err

# 重启服务
pm2 restart sifan

# 重置 PM2
pm2 delete sifan
pm2 start npm --name "sifan" -- start
```

---

### 问题 5：Nginx 502 错误

**症状：**
浏览器显示 502 Bad Gateway

**解决方案：**
```bash
# 检查 Node.js 服务是否运行
pm2 status

# 检查 Nginx 配置
nginx -t

# 重启 Nginx
systemctl restart nginx

# 查看 Nginx 日志
tail -f /var/log/nginx/error.log
```

---

### 问题 6：响应慢

**症状：** 首页加载超过 3 秒

**解决方案：**

#### 检查构建产物
```bash
cd /root/sifan
ls -lh .next
```

应该看到生产版本，而不是开发版本：
- ❌ 开发版：文件名包含 turbopack、dev、hmr
- ✅ 生产版：.next/static/chunks/*.js

#### 启用 Nginx Gzip
编辑 `/etc/nginx/nginx.conf`：
```nginx
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css text/xml text/javascript
           application/x-javascript application/xml+rss
           application/javascript application/json;
```

重启 Nginx：
```bash
systemctl restart nginx
```

---

## ⚡ 性能优化

### 1. 启用 PM2 集群模式

适用于多核 CPU 服务器：

```bash
# 查看核心数
nproc

# 启动集群模式（使用 2 个进程）
pm2 delete sifan
pm2 start npm --name "sifan" -i 2 -- start

# 或使用所有 CPU 核心
pm2 start npm --name "sifan" -i max -- start

# 保存配置
pm2 save
```

### 2. 配置 Nginx 缓存

编辑 `/etc/nginx/nginx.conf`，在 http 块中添加：

```nginx
# 缓存路径配置
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g
                 inactive=60m use_temp_path=off;

# 在 server 块中配置缓存
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    proxy_cache my_cache;
    proxy_pass http://localhost:3000;
    proxy_cache_valid 200 30d;
    proxy_cache_key $request_uri;
    expires 30d;
}
```

重启 Nginx：
```bash
mkdir -p /var/cache/nginx
chown nginx:nginx /var/cache/nginx
systemctl restart nginx
```

### 3. 启用 Brotli 压缩（高级）

```bash
# 安装 Brotli 模块（需要重新编译 Nginx，较复杂）
# 或者使用云厂商的 CDN
```

### 4. 优化 Next.js 配置

在 `next.config.js` 中：

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // 启用 SWC 压缩
  compress: true,

  // 图片优化
  images: {
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
  },

  // 实验性功能
  experimental: {
    optimizeCss: true,
  },
}

module.exports = nextConfig
```

重新构建：
```bash
npm run build
pm2 restart sifan
```

---

## 🔒 安全加固

### 1. 配置防火墙

```bash
# CentOS/RHEL (firewalld)
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --permanent --remove-port=3000/tcp  # 关闭直连 3000 端口
sudo firewall-cmd --reload

# Ubuntu (UFW)
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### 2. 启用 HTTPS（Let's Encrypt）

```bash
# 安装 Certbot
sudo yum install -y certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

### 3. 限制 SSH 访问

编辑 `/etc/ssh/sshd_config`：
```bash
# 禁用 root 登录（创建新用户后）
PermitRootLogin no

# 禁用密码登录（使用 SSH 密钥）
PasswordAuthentication no

# 更改默认端口
Port 2222
```

重启 SSH：
```bash
sudo systemctl restart sshd
```

### 4. 配置 fail2ban（防止暴力破解）

```bash
# 安装 fail2ban
sudo yum install -y fail2ban

# 创建配置文件
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local

# 编辑配置
sudo nano /etc/fail2ban/jail.local

# 添加以下内容
[sshd]
enabled = true
port = ssh
maxretry = 3
bantime = 3600
```

启动服务：
```bash
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## 📊 监控和日志

### 1. PM2 监控

```bash
# 实时监控
pm2 monit

# Web 监控面板
pm2 web
# 访问: http://server-ip:9615
```

### 2. 日志管理

```bash
# 查看所有日志
pm2 logs

# 查看错误日志
pm2 logs --err

# 日志轮转（防止日志过大）
pm2 install pm2-logrotate

# 配置日志轮转
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
```

### 3. 系统监控

```bash
# CPU 使用率
top
# 或
htop

# 内存使用
free -h

# 磁盘使用
df -h

# 网络监控
iftop
```

---

## 🎯 最佳实践

### 1. 使用环境变量

创建 `.env.production` 文件：
```env
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@host:5432/db
NEXT_PUBLIC_API_URL=https://api.example.com
```

在代码中使用：
```javascript
const dbUrl = process.env.DATABASE_URL
const apiUrl = process.env.NEXT_PUBLIC_API_URL
```

### 2. 定期备份

```bash
# 备份数据库
pg_dump your_database > backup_$(date +%Y%m%d).sql

# 备份项目代码
tar -czf sifan_backup_$(date +%Y%m%d).tar.gz /root/sifan

# 上传到云存储
# 使用阿里云 OSS 或其他云存储
```

### 3. 定期更新依赖

```bash
# 检查过时的包
npm outdated

# 更新依赖
npm update

# 测试构建
npm run build
```

### 4. 使用 CDN

推荐使用阿里云 CDN 加速静态资源：

1. **开通 CDN 服务**
   - 访问：https://cdn.console.aliyun.com/

2. **添加域名**
   - 域名：your-domain.com
   - 业务类型：静态加速

3. **配置回源**
   - 回源协议：HTTP
   - 回源地址：47.86.104.44

4. **配置缓存规则**
   - 静态文件：1 年
   - API 接口：不缓存

---

## 📞 获取帮助

### 文档资源

- Next.js 官方文档：https://nextjs.org/docs
- PM2 官方文档：https://pm2.keymetrics.io/docs/
- Nginx 官方文档：https://nginx.org/en/docs/
- 阿里云文档：https://help.aliyun.com/

### 常用命令速查表

| 操作 | 命令 |
|------|------|
| 查看状态 | `pm2 status` |
| 重启服务 | `pm2 restart sifan` |
| 停止服务 | `pm2 stop sifan` |
| 删除服务 | `pm2 delete sifan` |
| 查看日志 | `pm2 logs sifan` |
| 实时监控 | `pm2 monit` |
| 重启 Nginx | `systemctl restart nginx` |
| 查看 Nginx 日志 | `tail -f /var/log/nginx/error.log` |

---

## ✅ 部署检查清单

- [ ] Node.js 20.x 已安装
- [ ] PM2 已安装并配置
- [ ] 项目代码已上传
- [ ] 生产版本构建成功
- [ ] PM2 服务运行正常
- [ ] HTTP 响应正常 (200 OK)
- [ ] Nginx 已配置并运行
- [ ] 防火墙已配置
- [ ] HTTPS 已启用（可选）
- [ ] 监控已配置（可选）
- [ ] 备份策略已制定（可选）

---

## 🎉 部署成功！

恭喜你完成了生产环境部署！现在你的网站应该运行在最佳性能状态。

**预期性能指标：**
- ✅ 首页加载时间：< 1 秒
- ✅ 首字节时间 (TTFB)：< 200ms
- ✅ JS 文件压缩率：> 70%
- ✅ 浏览器缓存：已启用

**下一步：**
1. 配置自定义域名
2. 启用 HTTPS
3. 配置 CDN 加速
4. 设置监控告警

祝你使用愉快！🚀
