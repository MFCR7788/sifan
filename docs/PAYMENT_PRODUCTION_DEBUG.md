# 生产环境支付功能故障排查

## 问题描述

- **开发环境**: ✓ 可以正常生成支付二维码
- **生产环境**: ✗ 返回 500 Internal Server Error

## 根本原因

生产环境缺少微信支付相关配置，导致 SDK 初始化失败。

### 配置对比

| 配置项 | 开发环境 (.env.local) | 生产环境 (.env.production) |
|--------|----------------------|---------------------------|
| WECHAT_PAY_APPID | ✓ 已配置 | ✗ 未配置 |
| WECHAT_PAY_MCHID | ✓ 已配置 | ✗ 未配置 |
| WECHAT_PAY_SERIAL_NO | ✓ 已配置 | ✗ 未配置 |
| WECHAT_PAY_API_V3_KEY | ✓ 已配置 | ✗ 未配置 |
| WECHAT_PAY_PRIVATE_KEY_PATH | ✓ 已配置 | ✗ 未配置 |
| WECHAT_PAY_CERT_PATH | ✓ 已配置 | ✗ 未配置 |
| NEXT_PUBLIC_BASE_URL | http://localhost:5000 (错误) | 需要设置为 http://www.zjsifan.com |

## 解决方案

### 方案 1: 更新 .env.production 文件（推荐）

已更新 `.env.production` 文件，添加了完整的微信支付配置：

```bash
# 微信支付配置
WECHAT_PAY_APPID=wx314d6d3cfbd33e79
WECHAT_PAY_MCHID=1624143377
WECHAT_PAY_SERIAL_NO=531F07BDA98C557D7D718285B3DDDB35DE8CEA32
WECHAT_PAY_API_V3_KEY=SmallFish7788Admin03072298887777
WECHAT_PAY_PRIVATE_KEY_PATH=./certs/apiclient_key.pem
WECHAT_PAY_CERT_PATH=./certs/apiclient_cert.pem

# 网站基础 URL
NEXT_PUBLIC_BASE_URL=http://www.zjsifan.com
```

### 方案 2: 更新 PM2 配置

如果使用 PM2 启动，可以在 `ecosystem.config.js` 中添加环境变量：

```javascript
module.exports = {
  apps: [{
    name: 'enterprise-website',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -p 5000',
    cwd: '/root/sifan',
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
      // 微信支付配置
      WECHAT_PAY_APPID: 'wx314d6d3cfbd33e79',
      WECHAT_PAY_MCHID: '1624143377',
      WECHAT_PAY_SERIAL_NO: '531F07BDA98C557D7D718285B3DDDB35DE8CEA32',
      WECHAT_PAY_API_V3_KEY: 'SmallFish7788Admin03072298887777',
      WECHAT_PAY_PRIVATE_KEY_PATH: './certs/apiclient_key.pem',
      WECHAT_PAY_CERT_PATH: './certs/apiclient_cert.pem',
      NEXT_PUBLIC_BASE_URL: 'http://www.zjsifan.com',
      // 数据库配置
      PGDATABASE_URL: 'postgresql://...',
      PGDATABASE: 'Database_1767516520571'
    }
  }]
};
```

## 部署步骤

### 1. 本地更新代码

```bash
# 确认 .env.production 已更新
cat .env.production | grep WECHAT_PAY

# 提交更改
git add .env.production
git commit -m "fix: 添加生产环境微信支付配置"
git push origin main
```

### 2. 部署到服务器

```bash
# 执行部署脚本
./deploy-local.sh
```

### 3. 验证配置

在服务器上运行诊断脚本：

```bash
# 复制诊断脚本到服务器
scp scripts/diagnose-payment.sh root@42.121.218.14:/root/sifan/scripts/

# 登录服务器并运行
ssh root@42.121.218.14
cd /root/sifan
chmod +x scripts/diagnose-payment.sh
./scripts/diagnose-payment.sh
```

## 手动排查步骤

如果部署后仍有问题，按以下步骤排查：

### 1. 检查环境变量

```bash
# 登录服务器
ssh root@42.121.218.14

# 检查 PM2 进程的环境变量
pm2 show enterprise-website | grep env

# 或查看 ecosystem.config.js
cat /root/sifan/ecosystem.config.js
```

### 2. 检查证书文件

```bash
ls -lh /root/sifan/certs/
cat /root/sifan/certs/apiclient_key.pem | head -5
```

### 3. 查看 PM2 日志

```bash
# 查看所有日志
pm2 logs enterprise-website --lines 100

# 只看错误日志
pm2 logs enterprise-website --err --lines 50
```

### 4. 测试支付接口

```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Cookie: userId=test-user-123" \
  -d '{
    "paymentMethod":"wechat",
    "amount":0.01,
    "description":"测试订单",
    "type":"recharge"
  }' \
  http://localhost:5000/api/payment/create
```

## 常见错误及解决方案

### 错误 1: 微信支付 SDK 未初始化

**错误信息:**
```
微信支付未初始化，请检查证书配置和环境变量
```

**解决方案:**
1. 检查 `WECHAT_PAY_PRIVATE_KEY_PATH` 和 `WECHAT_PAY_CERT_PATH` 是否正确
2. 确认证书文件存在于 `/root/sifan/certs/` 目录
3. 检查 PM2 环境变量是否已加载

### 错误 2: 证书文件不存在

**错误信息:**
```
私钥文件存在: false
证书文件存在: false
```

**解决方案:**
```bash
# 上传证书到服务器
scp certs/apiclient_key.pem root@42.121.218.14:/root/sifan/certs/
scp certs/apiclient_cert.pem root@42.121.218.14:/root/sifan/certs/
```

### 错误 3: 支付回调 URL 错误

**错误信息:**
```
notify_url 配置错误
```

**解决方案:**
1. 检查 `NEXT_PUBLIC_BASE_URL` 是否设置为生产环境域名
2. 确保回调地址可以被微信支付服务器访问
3. 测试回调接口是否正常：

```bash
curl -I http://www.zjsifan.com/api/payment/wechat/notify
```

### 错误 4: 数据库连接失败

**错误信息:**
```
Database error: ...
```

**解决方案:**
1. 检查 `PGDATABASE_URL` 配置
2. 测试数据库连接：

```bash
psql "$PGDATABASE_URL" -c "SELECT 1;"
```

## 调试模式

如果需要更详细的调试信息，可以临时启用开发模式：

```bash
# 修改 PM2 配置，添加 NODE_ENV=development
pm2 restart enterprise-website --update-env NODE_ENV=development
```

然后查看日志：

```bash
pm2 logs enterprise-website --lines 200
```

## 验证修复

修复后，验证以下功能：

1. ✓ 充值页面可以打开
2. ✓ 输入金额后可以生成二维码
3. ✓ 二维码可以正常显示
4. ✓ 扫码后可以完成支付
5. ✓ 支付成功后订单状态正确更新
6. ✓ 会员余额正确增加

## 联系支持

如果以上步骤都无法解决问题，请提供以下信息：

1. PM2 完整日志: `pm2 logs enterprise-website --lines 200`
2. 诊断脚本输出: `./scripts/diagnose-payment.sh`
3. 错误截图
4. 支付接口请求和响应

---

## 附录：完整配置示例

### .env.production (完整版)

```bash
# 应用配置
NODE_ENV="production"
PORT="5000"
APP_NAME="enterprise-website"

# 网站基础 URL
NEXT_PUBLIC_BASE_URL=http://www.zjsifan.com

# 微信支付配置
WECHAT_PAY_APPID=wx314d6d3cfbd33e79
WECHAT_PAY_MCHID=1624143377
WECHAT_PAY_SERIAL_NO=531F07BDA98C557D7D718285B3DDDB35DE8CEA32
WECHAT_PAY_API_V3_KEY=SmallFish7788Admin03072298887777
WECHAT_PAY_PRIVATE_KEY_PATH=./certs/apiclient_key.pem
WECHAT_PAY_CERT_PATH=./certs/apiclient_cert.pem

# 数据库配置
PGDATABASE_URL="postgresql://user_7591422450290704422:aef1a966-5890-4e13-a499-e5a8b0e8b0b4@cp-cute-mist-247e1363.pg2.aidap-global.cn-beijing.volces.com:5432/Database_1767516520571?sslmode=require&channel_binding=require"
PGDATABASE="Database_1767516520571"
```

### ecosystem.config.js (完整版)

```javascript
module.exports = {
  apps: [{
    name: 'enterprise-website',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -p 5000',
    cwd: '/root/sifan',
    instances: 2,
    exec_mode: 'cluster',
    autorestart: true,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
      NEXT_PUBLIC_BASE_URL: 'http://www.zjsifan.com',
      WECHAT_PAY_APPID: 'wx314d6d3cfbd33e79',
      WECHAT_PAY_MCHID: '1624143377',
      WECHAT_PAY_SERIAL_NO: '531F07BDA98C557D7D718285B3DDDB35DE8CEA32',
      WECHAT_PAY_API_V3_KEY: 'SmallFish7788Admin03072298887777',
      WECHAT_PAY_PRIVATE_KEY_PATH: './certs/apiclient_key.pem',
      WECHAT_PAY_CERT_PATH: './certs/apiclient_cert.pem',
      PGDATABASE_URL: 'postgresql://user_7591422450290704422:aef1a966-5890-4e13-a499-e5a8b0e8b0b4@cp-cute-mist-247e1363.pg2.aidap-global.cn-beijing.volces.com:5432/Database_1767516520571?sslmode=require&channel_binding=require',
      PGDATABASE: 'Database_1767516520571'
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log'
  }]
};
```
