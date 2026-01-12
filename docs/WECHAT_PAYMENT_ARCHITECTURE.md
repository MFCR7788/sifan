# 微信支付架构说明与正确排查指南

## 项目架构说明

### 实际实现方式

本项目使用 **Next.js 集成微信支付**，而不是独立的微信支付服务。

```
┌─────────────────────────────────────────────┐
│   PM2 (Process Manager)                    │
│   ┌─────────────────────────────────────┐  │
│   │  Next.js 应用 (enterprise-website)   │  │
│   │  - 端口: 5000                        │  │
│   │  - 路径: /root/sifan                 │  │
│   │                                     │  │
│   │  ┌───────────────────────────────┐  │  │
│   │  │ wechatpay-node-v3 SDK         │  │  │
│   │  │ - 创建订单                     │  │  │
│   │  │ - 查询订单                     │  │  │
│   │  │ - 处理回调                     │  │  │
│   │  └───────────────────────────────┘  │  │
│   │                                     │  │
│   │  配置: PM2 环境变量                 │  │
│   │  - WECHAT_PAY_APPID                 │  │
│   │  - WECHAT_PAY_MCHID                 │  │
│   │  - WECHAT_PAY_SERIAL_NO             │  │
│   │  - WECHAT_PAY_API_V3_KEY            │  │
│   │  - WECHAT_PAY_PRIVATE_KEY_PATH       │  │
│   │  - WECHAT_PAY_CERT_PATH             │  │
│   │                                     │  │
│   │  证书文件: ./certs/                 │  │
│   │  - apiclient_key.pem                │  │
│   │  - apiclient_cert.pem               │  │
│   └─────────────────────────────────────┘  │
└─────────────────────────────────────────────┘
                  ↓
        微信支付 API
    (api.mch.weixin.qq.com)
```

### 关键特征

| 特征 | 说明 |
|-----|------|
| **集成方式** | Node.js SDK（wechatpay-node-v3）集成在 Next.js 应用内 |
| **服务管理** | 由 PM2 管理，不是独立的 systemd 服务 |
| **配置方式** | 通过 PM2 环境变量传递 |
| **证书位置** | 项目 `certs/` 目录 |
| **日志位置** | PM2 日志：`~/.pm2/logs/enterprise-website-*.log` |
| **运行端口** | 5000 |

## 常见误解

### ❌ 误解 1：需要独立的微信支付服务

**错误理解**：
- 以为需要安装一个名为 "wechat-pay" 或 "wechatpay" 的 systemd 服务
- 以为有独立的守护进程

**实际情况**：
- 微信支付功能集成在 Next.js 应用内部
- 随 Next.js 应用一起启动和停止
- 由 PM2 统一管理

### ❌ 误解 2：配置文件在 /etc/wechatpay/

**错误理解**：
- 以为配置文件应该在 `/etc/wechatpay/config.json`
- 以为没有这个目录就是配置错误

**实际情况**：
- 配置通过 PM2 环境变量传递
- 证书文件在项目 `./certs/` 目录
- 不需要 `/etc/wechatpay/` 目录

### ❌ 误解 3：需要单独查看微信支付日志

**错误理解**：
- 以为有独立的日志文件，如 `/var/log/wechatpay.log`

**实际情况**：
- 所有日志都在 PM2 日志中
- 包括 SDK 初始化日志和 API 调用日志

## 正确的诊断步骤

### 方式 1：使用专用诊断脚本（推荐）

```bash
cd /root/sifan
bash scripts/diagnose-wechat-payment.sh
```

这个脚本会检查：
1. ✅ PM2 应用状态
2. ✅ 服务端口（5000）
3. ✅ PM2 环境变量（微信支付配置）
4. ✅ 证书文件（存在性、大小、格式）
5. ✅ 网络连通性（微信支付 API）
6. ✅ SDK 初始化日志
7. ✅ 数据库连接
8. ✅ 支付接口测试

### 方式 2：手动检查

#### 步骤 1：检查 PM2 状态

```bash
pm2 list
```

应该看到：
```
┌─────┬────────────────────┬──────────┬────────┬───────┬──────────┬──────────┐
│ id  │ name               │ mode     │ status │ ↺     │ cpu      │ memory   │
├─────┼────────────────────┼──────────┼────────┼───────┼──────────┼──────────┤
│ 0   │ enterprise-website│ cluster  │ online │ 0     │ 0%       │ 100MB    │
└─────┴────────────────────┴──────────┴────────┴───────┴──────────┴──────────┘
```

#### 步骤 2：检查 PM2 环境变量

```bash
pm2 show enterprise-website | grep -A 200 "env:"
```

应该看到所有微信支付环境变量已配置：
- WECHAT_PAY_APPID
- WECHAT_PAY_MCHID
- WECHAT_PAY_SERIAL_NO
- WECHAT_PAY_API_V3_KEY
- WECHAT_PAY_PRIVATE_KEY_PATH
- WECHAT_PAY_CERT_PATH

#### 步骤 3：检查证书文件

```bash
ls -la ./certs/
```

应该看到：
```
-rw------- 1 root root 1704 Jan 12 21:15 apiclient_cert.pem
-rw------- 1 root root 1493 Jan 12 21:15 apiclient_key.pem
```

验证文件格式：
```bash
head -n 1 ./certs/apiclient_key.pem
# 应该看到：-----BEGIN PRIVATE KEY----- 或 -----BEGIN RSA PRIVATE KEY-----

head -n 1 ./certs/apiclient_cert.pem
# 应该看到：-----BEGIN CERTIFICATE-----
```

#### 步骤 4：查看 SDK 初始化日志

```bash
pm2 logs enterprise-website --lines 100 --nostream | grep -A 20 "微信支付 SDK"
```

应该看到：
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

#### 步骤 5：测试支付接口

```bash
curl -X POST http://localhost:5000/api/payment/create \
    -H "Content-Type: application/json" \
    -d '{
        "paymentMethod":"wechat",
        "amount":1,
        "description":"测试",
        "type":"recharge"
    }'
```

可能的结果：

**成功响应**：
```json
{
  "success": true,
  "orderNo": "recharge_...",
  "qrCodeImage": "data:image/png;base64,...",
  ...
}
```

**错误响应（未登录）**：
```json
{
  "success": false,
  "error": "用户未登录，请刷新页面重试或重新登录"
}
```

**错误响应（SDK 未初始化）**：
```json
{
  "success": false,
  "error": "微信支付配置错误",
  "details": "微信支付 SDK 未正确初始化..."
}
```

## 常见问题与解决方案

### 问题 1：SDK 初始化失败

**症状**：日志显示"微信支付 SDK 初始化失败"

**可能原因**：
1. 环境变量未正确加载
2. 证书文件不存在
3. 证书文件格式错误
4. 证书文件权限问题

**解决方案**：

```bash
# 1. 检查环境变量
pm2 show enterprise-website | grep -A 200 "env:"

# 2. 如果环境变量缺失，重启 PM2
pm2 restart enterprise-website

# 3. 检查证书文件
ls -la ./certs/

# 4. 如果证书文件缺失，从开发环境上传
# 在开发环境：
scp certs/apiclient_key.pem root@42.121.218.14:/root/sifan/certs/
scp certs/apiclient_cert.pem root@42.121.218.14:/root/sifan/certs/

# 5. 设置正确的权限
chmod 600 ./certs/apiclient_key.pem
chmod 644 ./certs/apiclient_cert.pem
```

### 问题 2：API 调用失败

**症状**：日志显示"创建微信支付订单失败"

**可能原因**：
1. 网络问题
2. 商户号或密钥错误
3. 证书过期
4. 请求参数错误

**解决方案**：

```bash
# 1. 检查网络连通性
curl -I https://api.mch.weixin.qq.com

# 2. 查看详细错误日志
pm2 logs enterprise-website --err --lines 50

# 3. 检查环境变量是否正确
pm2 show enterprise-website | grep -A 200 "env:" | grep WECHAT

# 4. 在微信支付商户平台检查：
#    - 商户号是否正确
#    - API 密钥是否正确
#    - API 证书是否有效
```

### 问题 3：证书文件格式错误

**症状**：日志显示"私钥文件存在: false" 或 SDK 初始化失败

**解决方案**：

```bash
# 1. 检查文件格式
head -n 1 ./certs/apiclient_key.pem
# 应该看到：-----BEGIN PRIVATE KEY----- 或 -----BEGIN RSA PRIVATE KEY-----

tail -n 1 ./certs/apiclient_key.pem
# 应该看到：-----END PRIVATE KEY----- 或 -----END RSA PRIVATE KEY-----

# 2. 如果格式错误，需要重新从微信商户平台下载证书

# 3. 确保文件编码为 UTF-8
file ./certs/apiclient_key.pem
# 应该显示：PEM RSA private key
```

### 问题 4：用户未登录错误

**症状**：浏览器显示"用户未登录"

**原因**：Cookie 未正确发送到服务器

**解决方案**：

```bash
# 1. 确认使用 HTTPS 访问
# 浏览器地址栏应该是：https://www.zjsifan.com

# 2. 检查 Nginx HTTPS 配置
cat /etc/nginx/sites-enabled/default | grep ssl

# 3. 在浏览器开发者工具中检查 Cookie
# F12 -> Application -> Cookies -> https://www.zjsifan.com
# 确认 userId Cookie 存在

# 4. 检查 Cookie 配置
pm2 show enterprise-website | grep COOKIE
# 应该看到：
# COOKIE_DOMAIN: .zjsifan.com
# COOKIE_SECURE: true
# COOKIE_SAME_SITE: lax
```

## 文件位置总结

| 文件/目录 | 位置 | 说明 |
|----------|------|------|
| **应用根目录** | `/root/sifan` | Next.js 项目目录 |
| **证书目录** | `/root/sifan/certs/` | 微信支付证书 |
| **私钥文件** | `/root/sifan/certs/apiclient_key.pem` | 商户私钥 |
| **证书文件** | `/root/sifan/certs/apiclient_cert.pem` | 商户证书 |
| **PM2 日志** | `~/.pm2/logs/enterprise-website-*.log` | 应用日志 |
| **PM2 配置** | `/root/sifan/ecosystem.config.js` | PM2 启动配置 |
| **环境变量** | `/root/sifan/.env.production` | 环境变量文件 |

## 相关文档

- [支付功能故障排查指南](PAYMENT_500_ERROR_TROUBLESHOOTING.md)
- [formidable 错误修复指南](FORMIDABLE_ERROR_FIX.md)
- [生产环境支付修复总结](PRODUCTION_PAYMENT_FIX.md)
- [快速修复指南](../QUICK_FIX_PAYMENT.md)

## 总结

**重要**：本项目不使用独立的微信支付服务。微信支付功能集成在 Next.js 应用内部，通过 `wechatpay-node-v3` SDK 调用微信支付 API。

**正确的排查方向**：
1. ✅ 检查 PM2 应用状态
2. ✅ 检查 PM2 环境变量
3. ✅ 检查证书文件
4. ✅ 查看 PM2 日志
5. ✅ 测试支付接口

**不需要**：
- ❌ 安装独立的微信支付服务
- ❌ 创建 /etc/wechatpay/ 目录
- ❌ 配置 systemd 服务
