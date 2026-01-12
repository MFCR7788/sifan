# 生产环境支付功能修复说明

## 问题诊断

### 现象
- 开发环境：✓ 可以正常生成支付二维码
- 生产环境：✗ 返回 500 Internal Server Error

### 根本原因

生产环境缺少微信支付相关配置，导致 SDK 初始化失败。

**配置缺失对比：**

| 配置项 | 开发环境 (.env.local) | 生产环境 (修复前) |
|--------|----------------------|-------------------|
| WECHAT_PAY_APPID | ✓ wx314d6d3cfbd33e79 | ✗ 未配置 |
| WECHAT_PAY_MCHID | ✓ 1624143377 | ✗ 未配置 |
| WECHAT_PAY_SERIAL_NO | ✓ 531F07BDA98C557D7D718285B3DDDB35DE8CEA32 | ✗ 未配置 |
| WECHAT_PAY_API_V3_KEY | ✓ SmallFish7788Admin03072298887777 | ✗ 未配置 |
| WECHAT_PAY_PRIVATE_KEY_PATH | ✓ ./certs/apiclient_key.pem | ✗ 未配置 |
| WECHAT_PAY_CERT_PATH | ✓ ./certs/apiclient_cert.pem | ✗ 未配置 |
| NEXT_PUBLIC_BASE_URL | http://localhost:5000 | 未配置 |

## 修复方案

### 已完成的修复

1. ✓ 更新 `.env.production` 文件，添加完整的微信支付配置
2. ✓ 更新 `deploy-local.sh` 部署脚本，包含微信支付配置和证书文件
3. ✓ 创建 `scripts/diagnose-payment.sh` 诊断脚本
4. ✓ 创建 `scripts/quick-fix-payment.sh` 快速修复脚本
5. ✓ 创建 `docs/PAYMENT_PRODUCTION_DEBUG.md` 完整故障排查文档

## 部署步骤

### 方式 1: 使用快速修复脚本（最简单）

直接在服务器上运行：

```bash
ssh root@42.121.218.14
cd /root/sifan

# 上传并运行快速修复脚本
curl -o scripts/quick-fix-payment.sh https://raw.githubusercontent.com/MFCR7788/sifan/main/scripts/quick-fix-payment.sh
chmod +x scripts/quick-fix-payment.sh
./scripts/quick-fix-payment.sh
```

### 方式 2: 使用部署脚本（推荐）

在本地执行完整部署：

```bash
./deploy-local.sh
```

### 方式 3: 手动修复（如果脚本无法运行）

在服务器上手动执行：

```bash
ssh root@42.121.218.14
cd /root/sifan

# 1. 更新 .env.production
cat > .env.production << 'EOF'
# 应用配置
NODE_ENV="production"
PORT="5000"
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
EOF

# 2. 更新 PM2 配置
cat > ecosystem.config.js << 'EOF'
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
    }
  }]
};
EOF

# 3. 重启服务
pm2 delete enterprise-website
pm2 start ecosystem.config.js
pm2 save

# 4. 验证
sleep 10
pm2 logs enterprise-website --lines 30
```

## 验证修复

### 1. 检查服务状态

```bash
ssh root@42.121.218.14 "pm2 status"
```

### 2. 查看初始化日志

```bash
ssh root@42.121.218.14 "pm2 logs enterprise-website --lines 30"
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
✅ 微信支付 SDK 初始化成功
========================
```

### 3. 测试支付接口

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
  http://www.zjsifan.com/api/payment/create
```

应该返回 200 并包含 `qrCodeImage` 字段。

### 4. 浏览器测试

访问 http://www.zjsifan.com/recharge，尝试充值功能。

## 故障排查

### 如果仍然失败

#### 运行诊断脚本

```bash
ssh root@42.121.218.14
cd /root/sifan
./scripts/diagnose-payment.sh
```

#### 查看完整日志

```bash
ssh root@42.121.218.14 "pm2 logs enterprise-website --lines 100"
```

#### 检查证书文件

```bash
ssh root@42.121.218.14 "ls -lh /root/sifan/certs/"
```

#### 测试数据库连接

```bash
ssh root@42.121.218.14 << 'ENDSSH'
export PGPASSWORD='aef1a966-5890-4e13-a499-e5a8b0e8b0b4'
psql -h cp-cute-mist-247e1363.pg2.aidap-global.cn-beijing.volces.com \
     -p 5432 \
     -U user_7591422450290704422 \
     -d Database_1767516520571 \
     -c "SELECT 1;"
ENDSSH
```

## 常见问题

### Q1: 证书文件不存在

**解决方案：**
```bash
# 从本地上传证书
scp certs/apiclient_key.pem root@42.121.218.14:/root/sifan/certs/
scp certs/apiclient_cert.pem root@42.121.218.14:/root/sifan/certs/
```

### Q2: PM2 无法读取环境变量

**解决方案：**
确保在 `ecosystem.config.js` 中直接配置了所有环境变量，而不是依赖 `.env` 文件。

### Q3: 支付回调失败

**解决方案：**
1. 检查 `NEXT_PUBLIC_BASE_URL` 是否为 `http://www.zjsifan.com`
2. 确保微信支付配置中的 notify_url 正确
3. 测试回调接口是否可访问：
   ```bash
   curl -I http://www.zjsifan.com/api/payment/wechat/notify
   ```

## 相关文档

- 完整故障排查指南: `docs/PAYMENT_PRODUCTION_DEBUG.md`
- 生产环境部署指南: `docs/DEPLOYMENT_GUIDE.md`
- 支付功能故障排查: `docs/PRODUCTION_PAYMENT_TROUBLESHOOTING.md`

## 技术支持

如果以上步骤都无法解决问题，请提供：
1. PM2 完整日志
2. 诊断脚本输出
3. 错误截图
4. 支付接口请求和响应

---

**修复时间**: $(date)
**版本**: 3.1
**修复内容**: 添加生产环境微信支付配置，修复二维码生成失败问题
