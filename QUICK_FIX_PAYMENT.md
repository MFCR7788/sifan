# 快速修复支付功能指南

## 当前问题

生产环境生成支付二维码失败，返回 500 错误。

## 立即诊断步骤

### 1. 在服务器上运行诊断脚本

```bash
cd /path/to/enterprise-website
bash scripts/realtime-diagnose.sh
```

### 2. 查看关键日志

```bash
# 查看 SDK 初始化日志
pm2 logs enterprise-website --lines 200 --nostream | grep "微信支付"

# 查看支付接口错误
pm2 logs enterprise-website --err --lines 50 --nostream
```

### 3. 检查关键配置

#### 环境变量检查

```bash
# 切换到项目目录
cd /path/to/enterprise-website

# 查看 PM2 环境变量
pm2 show enterprise-website | grep -A 100 "env:"

# 应该看到以下环境变量：
# - WECHAT_PAY_APPID
# - WECHAT_PAY_MCHID
# - WECHAT_PAY_API_V3_KEY
# - WECHAT_PAY_SERIAL_NO
# - WECHAT_PAY_PRIVATE_KEY_PATH
# - WECHAT_PAY_CERT_PATH
# - PGDATABASE_URL
# - NEXT_PUBLIC_BASE_URL
# - COOKIE_DOMAIN
```

#### 证书文件检查

```bash
# 检查证书文件是否存在
ls -la certs/

# 应该看到：
# apiclient_cert.pem
# apiclient_key.pem

# 检查文件大小（应该 > 1000 字节）
wc -c certs/apiclient_key.pem
wc -c certs/apiclient_cert.pem

# 查看证书内容（验证是否正确）
head -n 1 certs/apiclient_key.pem
# 应该看到：-----BEGIN PRIVATE KEY-----
```

## 常见问题修复

### 问题 1：PM2 未加载环境变量

**症状**：
- SDK 初始化日志显示环境变量为空
- 支付接口返回"微信支付未初始化"

**解决方案**：

```bash
# 方法 1：重启 PM2（推荐）
pm2 restart enterprise-website

# 方法 2：完全重启 PM2
pm2 delete enterprise-website
pm2 start npm --name enterprise-website -- start

# 方法 3：更新 PM2 配置
pm2 delete enterprise-website
pm2 start ecosystem.config.js
```

**验证**：
```bash
# 重启后查看日志
pm2 logs enterprise-website --lines 50 --nostream

# 应该看到：
# ✅ 微信支付 SDK 初始化成功
```

### 问题 2：证书文件不存在或路径错误

**症状**：
- 日志显示"私钥文件存在: false"
- 日志显示"证书文件存在: false"

**解决方案**：

```bash
# 1. 从开发环境获取证书文件
# 在开发环境：
scp certs/apiclient_key.pem user@42.121.218.14:/path/to/enterprise-website/certs/
scp certs/apiclient_cert.pem user@42.121.218.14:/path/to/enterprise-website/certs/

# 2. 设置正确的权限
chmod 600 certs/apiclient_key.pem
chmod 644 certs/apiclient_cert.pem

# 3. 验证文件存在
ls -la certs/

# 4. 重启 PM2
pm2 restart enterprise-website
```

### 问题 3：环境变量文件未加载

**症状**：
- PM2 日志显示环境变量为空
- 但 .env.production 文件存在且内容正确

**解决方案**：

```bash
# 1. 检查 .env.production 文件
cat .env.production | grep WECHAT

# 2. 确保 PM2 启动脚本加载了环境变量
# 查看 ecosystem.config.js 或启动命令
pm2 show enterprise-website

# 3. 如果未加载，手动设置环境变量
pm2 restart enterprise-website --update-env

# 4. 或者修改启动脚本，在 package.json 中添加：
# "start:prod": "NODE_ENV=production node .next/standalone/server.js"

# 5. 使用 env-cmd 加载环境变量（推荐）
# 安装 env-cmd
npm install -g env-cmd

# 使用 env-cmd 启动
pm2 delete enterprise-website
pm2 start env-cmd --name enterprise-website -- .next/standalone/server.js
```

### 问题 4：Cookie 配置问题

**症状**：
- 前端显示"用户未登录"
- 但浏览器中 Cookie 存在

**解决方案**：

**检查配置**：
```bash
# 查看 .env.production
cat .env.production | grep COOKIE

# 应该看到：
# COOKIE_DOMAIN=".zjsifan.com"
# COOKIE_SECURE="true"
# COOKIE_SAME_SITE="lax"
```

**验证 HTTPS**：
```bash
# 确认 Nginx 配置了 HTTPS
curl -I https://www.zjsifan.com

# 应该看到：
# HTTP/1.1 200 OK
# 或 301/302 重定向到 HTTPS
```

**检查 Nginx 配置**：
```nginx
server {
    listen 443 ssl http2;
    server_name www.zjsifan.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
```

### 问题 5：数据库连接失败

**症状**：
- 日志显示"数据库连接失败"
- 无法创建支付订单

**解决方案**：

```bash
# 1. 测试数据库连接
psql "$PGDATABASE_URL" -c "SELECT 1;"

# 2. 如果连接失败，检查连接字符串
# 在 .env.production 中查看：
cat .env.production | grep PGDATABASE

# 3. 检查数据库表
psql "$PGDATABASE_URL" -c "\d payment_orders"

# 4. 如果表不存在，运行迁移
npm run db:migrate

# 5. 重启 PM2
pm2 restart enterprise-website
```

## 完整修复流程

```bash
# 1. 切换到项目目录
cd /path/to/enterprise-website

# 2. 拉取最新代码
git pull origin main

# 3. 检查环境变量
cat .env.production

# 4. 检查证书文件
ls -la certs/

# 5. 安装依赖（如果需要）
npm install --production=false

# 6. 构建项目
npm run build

# 7. 重启 PM2
pm2 restart enterprise-website

# 8. 查看日志
pm2 logs enterprise-website --lines 100 --nostream

# 9. 运行诊断脚本
bash scripts/realtime-diagnose.sh

# 10. 测试支付功能
# 在浏览器中访问 https://www.zjsifan.com
# 登录 -> 点击充值 -> 选择金额 -> 生成二维码
```

## 验证修复成功

### 1. 检查 PM2 日志

```bash
pm2 logs enterprise-website --lines 50 --nostream
```

应该看到：
```
=== 微信支付 SDK 初始化 ===
私钥路径: ./certs/apiclient_key.pem
证书路径: ./certs/apiclient_cert.pem
私钥文件存在: true
证书文件存在: true
...
✅ 微信支付 SDK 初始化成功
========================
```

### 2. 测试支付接口

```bash
# 使用 curl 测试
curl -X POST https://www.zjsifan.com/api/payment/create \
  -H "Content-Type: application/json" \
  -H "Cookie: userId=YOUR_USER_ID" \
  -d '{
    "paymentMethod":"wechat",
    "amount":1,
    "description":"测试",
    "type":"recharge"
  }'
```

应该返回：
```json
{
  "success": true,
  "orderNo": "...",
  "qrCodeImage": "data:image/png;base64,..."
}
```

### 3. 浏览器测试

1. 访问 https://www.zjsifan.com
2. 登录账户
3. 点击"充值"按钮
4. 选择充值金额
5. 确认生成二维码

**预期结果**：
- 二维码成功显示
- 显示金额和支付描述
- 开始轮询支付状态

## 紧急回滚

如果修复后问题更严重，可以回滚到之前的版本：

```bash
# 1. 查看历史版本
git log --oneline -10

# 2. 回滚到指定版本
git checkout <commit-hash>

# 3. 重新构建
npm run build

# 4. 重启 PM2
pm2 restart enterprise-website
```

## 联系支持

如果以上方法都无法解决问题，请提供以下信息：

1. PM2 日志（最近 100 行）
   ```bash
   pm2 logs enterprise-website --lines 100 --nostream > logs.txt
   ```

2. 环境变量配置（隐藏敏感信息）
   ```bash
   cat .env.production | sed 's/=.*/=***/' > env.txt
   ```

3. 诊断脚本输出
   ```bash
   bash scripts/realtime-diagnose.sh > diagnose.txt
   ```

4. 浏览器控制台截图（F12 -> Console）

5. 错误复现步骤
