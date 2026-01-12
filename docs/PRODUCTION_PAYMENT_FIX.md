# 生产环境支付功能问题 - 根本原因分析与修复方案

## 问题现象

生产环境生成支付二维码失败，返回 500 Internal Server Error。

## 根本原因分析

### 主要问题：PM2 环境变量缺失

**问题文件**：`ecosystem.config.js`

**问题描述**：
PM2 配置文件中缺少所有微信支付相关的环境变量。虽然 `.env.production` 文件中配置了完整的环境变量，但 PM2 在启动应用时，并不会自动加载 `.env.production` 文件。环境变量必须在 `ecosystem.config.js` 的 `env` 或 `env_production` 字段中显式声明。

**原始配置**（缺失）：
```javascript
env: {
  NODE_ENV: 'production',
  PORT: 5000,
  PGDATABASE_URL: '...',
  PGDATABASE: 'Database_1767516520571'
  // ❌ 缺少微信支付相关配置
}
```

**影响**：
- `src/services/wechatPay.ts` 在初始化微信支付 SDK 时，读取到的环境变量为 `undefined` 或空值
- SDK 初始化失败，`pay` 实例为 `null`
- 调用支付接口时抛出错误："微信支付未初始化，请检查证书配置"
- 返回 500 Internal Server Error

### 次要问题：NEXT_PUBLIC_BASE_URL 配置错误

**问题文件**：`.env.production`

**问题描述**：
`NEXT_PUBLIC_BASE_URL` 配置为 `http://www.zjsifan.com`（HTTP），而不是 HTTPS。

**影响**：
- 生产环境的 Cookie 配置为 `COOKIE_SECURE="true"`，要求 HTTPS
- 如果用户通过 HTTP 访问，浏览器不会发送 Cookie 到服务器
- 支付接口无法获取用户 ID，返回"用户未登录"错误

## 修复方案

### 修复 1：更新 ecosystem.config.js

**文件**：`ecosystem.config.js`

**修改内容**：在 `env` 和 `env_production` 中添加完整的环境变量配置。

```javascript
env: {
  NODE_ENV: 'production',
  PORT: 5000,

  // 网站基础 URL（用于支付回调通知）- 使用 HTTPS
  NEXT_PUBLIC_BASE_URL: 'https://www.zjsifan.com',

  // 微信支付配置（新增）
  WECHAT_PAY_APPID: 'wx314d6d3cfbd33e79',
  WECHAT_PAY_MCHID: '1624143377',
  WECHAT_PAY_SERIAL_NO: '531F07BDA98C557D7D718285B3DDDB35DE8CEA32',
  WECHAT_PAY_API_V3_KEY: 'SmallFish7788Admin03072298887777',
  WECHAT_PAY_PRIVATE_KEY_PATH: './certs/apiclient_key.pem',
  WECHAT_PAY_CERT_PATH: './certs/apiclient_cert.pem',

  // 数据库配置
  PGDATABASE_URL: 'postgresql://user_7591422450290704422:aef1a966-5890-4e13-a499-e5a8b0e8b0b4@cp-cute-mist-247e1363.pg2.aidap-global.cn-beijing.volces.com:5432/Database_1767516520571?sslmode=require&channel_binding=require',
  PGDATABASE: 'Database_1767516520571',

  // Cookie 配置
  COOKIE_DOMAIN: '.zjsifan.com',
  COOKIE_SECURE: 'true',
  COOKIE_SAME_SITE: 'lax',

  // JWT 配置
  JWT_SECRET: 'your-jwt-secret-key-change-in-production',
  JWT_EXPIRES_IN: '7d'
}
```

**验证**：
```bash
# 在服务器上查看 PM2 环境变量
pm2 show enterprise-website | grep -A 50 "env:"

# 应该看到所有环境变量已配置
```

### 修复 2：更新 .env.production

**文件**：`.env.production`

**修改内容**：将 `NEXT_PUBLIC_BASE_URL` 改为 HTTPS。

```bash
# 修改前
NEXT_PUBLIC_BASE_URL=http://www.zjsifan.com

# 修改后
NEXT_PUBLIC_BASE_URL=https://www.zjsifan.com
```

**说明**：
- 生产环境已配置 HTTPS，确保 Nginx 正确配置 SSL 证书
- 使用 HTTPS 确保 Cookie 能够正确发送

## 部署步骤

### 方案 1：快速部署（推荐）

使用提供的快速部署脚本：

```bash
# 在本地项目根目录执行
bash deploy-config-fix.sh
```

脚本会自动执行以下操作：
1. 上传更新的配置文件到服务器
2. 在服务器上重新构建项目
3. 重启 PM2 服务
4. 验证服务状态

### 方案 2：手动部署

如果需要手动部署，请按照以下步骤：

**步骤 1：上传配置文件**
```bash
# 上传 ecosystem.config.js
scp ecosystem.config.js root@42.121.218.14:/root/sifan/

# 上传 .env.production
scp .env.production root@42.121.218.14:/root/sifan/
```

**步骤 2：重新构建**
```bash
ssh root@42.121.218.14
cd /root/sifan
npm run build
```

**步骤 3：重启 PM2**
```bash
pm2 restart enterprise-website
```

**步骤 4：验证部署**
```bash
# 查看日志
pm2 logs enterprise-website --lines 50

# 应该看到：
# === 微信支付 SDK 初始化 ===
# 私钥路径: ./certs/apiclient_key.pem
# 证书路径: ./certs/apiclient_cert.pem
# 私钥文件存在: true
# 证书文件存在: true
# ...
# ✅ 微信支付 SDK 初始化成功

# 运行诊断脚本
bash scripts/realtime-diagnose.sh
```

## 验证步骤

### 1. 检查 PM2 日志

```bash
pm2 logs enterprise-website --lines 100 --nostream
```

**预期输出**：
```
=== 微信支付 SDK 初始化 ===
私钥路径: ./certs/apiclient_key.pem
证书路径: ./certs/apiclient_cert.pem
私钥文件存在: true
证书文件存在: true
APPID: wx314d6d3cfbd33e79
MCHID: 1624143377
API V3 KEY 已配置: true
SERIAL NO 已配置: true
配置: {
  appid: 'wx314d6d3cfbd33e79',
  mchid: '1624143377',
  hasPrivateKey: true,
  hasPublicKey: true,
  hasSerialNo: true
}
✅ 微信支付 SDK 初始化成功
========================
```

### 2. 运行诊断脚本

```bash
cd /root/sifan
bash scripts/realtime-diagnose.sh
```

**预期输出**：
- ✓ PM2 应用 enterprise-website 正在运行
- ✓ 5000 端口服务正常 (HTTP 200)
- ✓ .env.production 文件存在
- ✓ WECHAT_PAY_APPID 已配置
- ✓ WECHAT_PAY_MCHID 已配置
- ✓ WECHAT_PAY_API_V3_KEY 已配置
- ✓ WECHAT_PAY_SERIAL_NO 已配置
- ✓ 私钥文件存在: ./certs/apiclient_key.pem
- ✓ 证书文件存在: ./certs/apiclient_cert.pem
- ✓ 数据库连接成功
- ✓ 支付订单表存在

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

## 常见问题

### Q1: 重启后仍然报错"微信支付未初始化"

**A**：检查 PM2 是否正确加载了环境变量：

```bash
pm2 show enterprise-website | grep -A 50 "env:"
```

如果环境变量为空，尝试：
```bash
pm2 delete enterprise-website
pm2 start ecosystem.config.js
```

### Q2: 浏览器显示"用户未登录"

**A**：检查以下几点：

1. 确认使用 HTTPS 访问网站
2. 在浏览器开发者工具中检查 Cookie 是否存在
3. 确认 Cookie 域名配置正确（.zjsifan.com）

### Q3: 二维码生成但支付失败

**A**：检查微信支付 API 调用：

```bash
pm2 logs enterprise-website --err --lines 50 --nostream
```

查看是否有网络错误或 API 错误。

## 相关文件

- `ecosystem.config.js` - PM2 配置文件（已修复）
- `.env.production` - 生产环境变量（已修复）
- `src/services/wechatPay.ts` - 微信支付 SDK 初始化代码
- `src/app/api/payment/create/route.ts` - 支付创建接口
- `scripts/realtime-diagnose.sh` - 诊断脚本
- `deploy-config-fix.sh` - 快速部署脚本
- `docs/PAYMENT_500_ERROR_TROUBLESHOOTING.md` - 故障排查文档
- `QUICK_FIX_PAYMENT.md` - 快速修复指南

## 总结

生产环境支付功能失败的根本原因是 **PM2 配置文件中缺少微信支付相关的环境变量**。这导致微信支付 SDK 初始化失败，无法调用微信支付 API。

通过更新 `ecosystem.config.js` 文件，添加所有必要的环境变量，并将 `NEXT_PUBLIC_BASE_URL` 改为 HTTPS，可以彻底解决这个问题。

部署后，请务必运行诊断脚本验证配置，并在浏览器中测试支付功能。
