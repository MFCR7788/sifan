# 支付功能 500 错误故障排查指南

## 问题现象

生产环境生成支付二维码时返回 500 Internal Server Error。

## 可能的原因

### 1. 认证失败（401 错误）

**症状**：前端显示"用户未登录，请刷新页面重试或重新登录"

**原因分析**：
- 生产环境 Cookie 配置为 `secure: true`，需要 HTTPS 才能发送 Cookie
- Cookie domain 配置为 `.zjsifan.com`，如果访问的是其他域名，Cookie 不会发送
- 登录状态丢失，前端显示已登录但后端收不到 Cookie

**解决方案**：
```typescript
// 检查生产环境 Cookie 配置
// .env.production
COOKIE_SECURE="true"
COOKIE_DOMAIN=".zjsifan.com"

// 确保 HTTPS 已正确配置
// Nginx 配置示例：
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
    }
}
```

**验证方法**：
```bash
# 在浏览器开发者工具中检查 Cookie
1. 打开开发者工具 (F12)
2. 切换到 Application 标签
3. 查看 Cookies -> https://www.zjsifan.com
4. 确认 userId Cookie 是否存在且 value 不为空
```

### 2. 微信支付 SDK 未初始化

**症状**：控制台输出"微信支付未初始化，请检查证书配置"

**原因分析**：
- 证书文件不存在或路径错误
- 环境变量未正确加载
- 证书文件格式不正确

**解决方案**：

**步骤 1：检查证书文件**
```bash
# 在服务器上执行
ls -la certs/
# 应该看到：
# apiclient_cert.pem
# apiclient_key.pem

# 检查文件大小
wc -c certs/apiclient_key.pem
wc -c certs/apiclient_cert.pem
# 文件大小应该 > 1000 字节
```

**步骤 2：检查环境变量**
```bash
# 在服务器上执行
cd /path/to/enterprise-website
pm2 show enterprise-website | grep -A 50 "env:"
```

确认以下环境变量已配置：
- `WECHAT_PAY_APPID`
- `WECHAT_PAY_MCHID`
- `WECHAT_PAY_API_V3_KEY`
- `WECHAT_PAY_SERIAL_NO`
- `WECHAT_PAY_PRIVATE_KEY_PATH`
- `WECHAT_PAY_CERT_PATH`
- `PGDATABASE_URL`

**步骤 3：重启 PM2 重新加载环境变量**
```bash
pm2 restart enterprise-website
```

**步骤 4：查看 PM2 日志**
```bash
# 实时查看日志
pm2 logs enterprise-website

# 查看错误日志
pm2 logs enterprise-website --err

# 查看初始化日志（包含 SDK 初始化信息）
pm2 logs enterprise-website --lines 100 --nostream | grep "微信支付"
```

**预期日志输出**：
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

### 3. 调用微信支付 API 失败

**症状**：控制台输出"创建微信支付订单失败"

**原因分析**：
- 网络问题（服务器无法访问微信支付 API）
- 参数错误（金额、订单号等）
- 商户配置问题（未开通 Native 支付）

**解决方案**：

**步骤 1：检查网络连通性**
```bash
# 测试能否访问微信支付 API
curl -I https://api.mch.weixin.qq.com

# 检查 DNS 解析
nslookup api.mch.weixin.qq.com
```

**步骤 2：检查订单参数**
```bash
# 查看 PM2 日志中的订单参数
pm2 logs enterprise-website --nostream | grep "创建订单参数"
```

**步骤 3：查看详细错误信息**
```bash
pm2 logs enterprise-website --err --lines 50 --nostream
```

### 4. 数据库连接失败

**症状**：无法创建支付订单，无法查询订单状态

**原因分析**：
- 数据库连接字符串错误
- 数据库服务不可用
- SSL 配置问题

**解决方案**：

**步骤 1：测试数据库连接**
```bash
# 在服务器上安装 psql 客户端
apt-get install postgresql-client

# 测试连接
psql "$PGDATABASE_URL" -c "SELECT 1;"
```

**步骤 2：检查数据库表**
```sql
-- 连接到数据库
psql "$PGDATABASE_URL"

-- 检查支付订单表
\d payment_orders

-- 查看最近的订单
SELECT order_no, status, amount, created_at
FROM payment_orders
ORDER BY created_at DESC
LIMIT 10;
```

## 诊断流程

### 方法 1：使用诊断脚本

```bash
# 在服务器上执行
bash scripts/realtime-diagnose.sh
```

### 方法 2：手动诊断

```bash
# 1. 检查 PM2 状态
pm2 list

# 2. 检查端口
curl -I http://localhost:5000

# 3. 查看环境变量
cat .env.production | grep WECHAT

# 4. 检查证书文件
ls -la certs/

# 5. 查看错误日志
pm2 logs enterprise-website --err --lines 100
```

### 方法 3：测试支付接口

```bash
# 使用 curl 测试（需要先登录获取 Cookie）
# 步骤 1：登录获取 token
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -c cookies.txt \
  -d '{"phone":"13800138000","password":"password123"}'

# 步骤 2：使用 Cookie 创建支付订单
curl -X POST http://localhost:5000/api/payment/create \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "paymentMethod":"wechat",
    "amount":1,
    "description":"测试",
    "type":"recharge"
  }'
```

## 常见错误代码

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| 用户未登录 | Cookie 未发送到后端 | 检查 Cookie 配置和 HTTPS |
| 微信支付未初始化 | 证书文件或环境变量问题 | 检查证书路径和环境变量，重启 PM2 |
| 创建微信支付订单失败 | API 调用失败 | 检查网络和参数配置 |
| 订单不存在 | 数据库查询失败 | 检查数据库连接和订单号 |
| 500 Internal Server Error | 服务器内部错误 | 查看 PM2 错误日志 |

## 生产环境部署检查清单

- [ ] 证书文件已上传到服务器（`certs/` 目录）
- [ ] 环境变量已配置（`.env.production`）
- [ ] PM2 已重启并加载新环境变量
- [ ] HTTPS 已正确配置
- [ ] Cookie domain 配置正确（`.zjsifan.com`）
- [ ] 数据库连接正常
- [ ] PM2 日志中显示"微信支付 SDK 初始化成功"
- [ ] 测试支付接口返回正常

## 联系信息

如果以上方法无法解决问题，请收集以下信息并联系技术支持：

1. PM2 日志（最近 100 行）：`pm2 logs enterprise-website --lines 100 --nostream > logs.txt`
2. 环境变量配置（隐藏敏感信息）：`cat .env.production | sed 's/=.*/=***/' > env.txt`
3. 浏览器控制台截图
4. 错误复现步骤
