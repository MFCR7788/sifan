# 支付功能 500 错误实时排查指南

## 问题描述

账户充值弹出对话框生成二维码失败：
```
服务器返回错误 (500): Internal Server Error
```

## 可能的原因

1. **微信支付 SDK 未初始化** - 环境变量未配置或配置错误
2. **证书文件不存在** - 证书文件路径错误或文件丢失
3. **数据库连接失败** - 数据库配置错误或网络问题
4. **用户未登录** - userId 无效或不存在于数据库中
5. **支付接口调用失败** - 微信支付 API 调用失败

## 快速排查步骤（按顺序执行）

### 步骤 1: 运行实时诊断脚本

```bash
ssh root@42.121.218.14
cd /root/sifan

# 上传诊断脚本（如果还没有）
# 从 GitHub 下载
curl -o scripts/realtime-diagnose.sh https://raw.githubusercontent.com/MFCR7788/sifan/main/scripts/realtime-diagnose.sh
chmod +x scripts/realtime-diagnose.sh

# 运行诊断
./scripts/realtime-diagnose.sh
```

诊断脚本会自动检查：
- PM2 服务状态
- 端口监听
- 环境变量配置
- 证书文件
- SDK 初始化日志
- 数据库连接
- 支付接口

---

### 步骤 2: 查看实时日志（重要）

```bash
ssh root@42.121.218.14
cd /root/sifan

# 方法 1: 实时监控日志
pm2 logs enterprise-website --lines 0

# 然后在浏览器中触发支付操作，观察日志输出
# 按 Ctrl+C 退出监控
```

---

### 步骤 3: 查看最近的错误日志

```bash
ssh root@42.121.218.14

# 查看最近的 100 行日志
pm2 logs enterprise-website --lines 100

# 只查看错误日志
pm2 logs enterprise-website --err --lines 50

# 查找特定关键词
pm2 logs enterprise-website --lines 200 | grep -E "微信支付|SDK|错误|Error|failed"
```

---

## 根据错误类型排查

### 情况 1: 日志显示 "微信支付 SDK 未初始化"

**错误日志示例：**
```
❌ 微信支付未初始化，请检查证书配置和环境变量
```

**排查步骤：**

1. 检查 `.env.production` 文件
```bash
ssh root@42.121.218.14 "cat /root/sifan/.env.production | grep WECHAT"
```

应该看到：
```
WECHAT_PAY_APPID=wx314d6d3cfbd33e79
WECHAT_PAY_MCHID=1624143377
WECHAT_PAY_SERIAL_NO=531F07BDA98C557D7D718285B3DDDB35DE8CEA32
WECHAT_PAY_API_V3_KEY=SmallFish7788Admin03072298887777
WECHAT_PAY_PRIVATE_KEY_PATH=./certs/apiclient_key.pem
WECHAT_PAY_CERT_PATH=./certs/apiclient_cert.pem
```

2. 如果配置缺失，执行快速修复：
```bash
ssh root@42.121.218.14 << 'ENDSSH'
cd /root/sifan
bash scripts/quick-fix-payment.sh
ENDSSH
```

---

### 情况 2: 日志显示 "证书文件不存在"

**错误日志示例：**
```
私钥文件存在: false
证书文件存在: false
```

**排查步骤：**

1. 检查证书文件
```bash
ssh root@42.121.218.14 "ls -lh /root/sifan/certs/"
```

2. 如果文件不存在，从本地上传：
```bash
# 在本地执行
scp certs/apiclient_key.pem root@42.121.218.14:/root/sifan/certs/
scp certs/apiclient_cert.pem root@42.121.218.14:/root/sifan/certs/
```

3. 验证文件
```bash
ssh root@42.121.218.14 << 'ENDSSH'
cd /root/sifan
ls -lh certs/
head -2 certs/apiclient_key.pem
head -2 certs/apiclient_cert.pem
ENDSSH
```

4. 重启服务
```bash
ssh root@42.121.218.14 "pm2 restart enterprise-website"
```

---

### 情况 3: 日志显示数据库错误

**错误日志示例：**
```
Failed query: insert into "payment_orders" ...
violates foreign key constraint
```

**排查步骤：**

1. 测试数据库连接
```bash
ssh root@42.121.218.14 << 'ENDSSH'
export PGPASSWORD='aef1a966-5890-4e13-a499-e5a8b0e8b0b4'
psql -h cp-cute-mist-247e1363.pg2.aidap-global.cn-beijing.volces.com \
     -p 5432 \
     -U user_7591422450290704422 \
     -d Database_1767516520571 \
     -c "SELECT COUNT(*) FROM users;"
ENDSSH
```

2. 检查用户是否已登录
   - 打开浏览器控制台 (F12)
   - Application -> Cookies -> 查找 `userId`
   - 如果没有或为空，需要先登录

3. 确保 userId 在数据库中存在
```bash
# 先获取你的 userId（从浏览器控制台）
# 然后查询数据库
ssh root@42.121.218.14 << 'ENDSSH'
export PGPASSWORD='aef1a966-5890-4e13-a499-e5a8b0e8b0b4'
psql -h cp-cute-mist-247e1363.pg2.aidap-global.cn-beijing.volces.com \
     -p 5432 \
     -U user_7591422450290704422 \
     -d Database_1767516520571 \
     -c "SELECT id, name, phone, email FROM users WHERE id = '<你的userId>';"
ENDSSH
```

---

### 情况 4: 日志显示 "微信支付接口调用失败"

**错误日志示例：**
```
❌ 微信支付接口调用失败: ...
```

**排查步骤：**

1. 检查网络连接
```bash
ssh root@42.121.218.14 "curl -I https://api.mch.weixin.qq.com"
```

2. 检查微信支付配置是否正确
```bash
ssh root@42.121.218.14 "cat /root/sifan/.env.production | grep WECHAT"
```

3. 检查 SDK 初始化日志
```bash
ssh root@42.121.218.14 "pm2 logs enterprise-website --lines 100 | grep -E '微信支付|初始化|SDK'"
```

应该看到：
```
=== 微信支付 SDK 初始化 ===
私钥路径: ./certs/apiclient_key.pem
证书路径: ./certs/apiclient_cert.pem
私钥文件存在: true
证书文件存在: true
✅ 微信支付 SDK 初始化成功
========================
```

---

## 前端排查

### 检查浏览器控制台

1. 打开浏览器控制台 (F12)
2. 查看 Console 标签页
3. 观察是否有错误信息

### 检查网络请求

1. 打开浏览器控制台 (F12)
2. 切换到 Network 标签页
3. 触发支付操作
4. 找到 `/api/payment/create` 请求
5. 查看请求和响应详情

**响应示例（成功）：**
```json
{
  "success": true,
  "orderNo": "recharge_1234567890_abc123def",
  "orderId": "xxx-xxx-xxx",
  "transactionId": "wx...",
  "qrCodeImage": "data:image/png;base64,...",
  "amount": 0.01
}
```

**响应示例（失败）：**
```json
{
  "success": false,
  "error": "错误描述",
  "details": "详细错误信息"
}
```

### 检查 Cookie

1. 打开浏览器控制台 (F12)
2. Application -> Cookies
3. 查找 `userId` Cookie
4. 确认值不为空

---

## 测试支付接口

### 方法 1: 使用 curl 测试

```bash
# 1. 先登录获取 userId
# 打开浏览器，登录 http://www.zjsifan.com/login
# 打开浏览器控制台，获取 userId Cookie

# 2. 测试支付接口
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Cookie: userId=<你的userId>" \
  -d '{
    "paymentMethod":"wechat",
    "amount":0.01,
    "description":"测试订单",
    "type":"recharge"
  }' \
  http://www.zjsifan.com/api/payment/create
```

### 方法 2: 使用诊断脚本

```bash
ssh root@42.121.218.14
cd /root/sifan
./scripts/realtime-diagnose.sh

# 按照提示输入你的 userId
```

---

## 完整的排查流程

### 1. 检查服务状态
```bash
ssh root@42.121.218.14 "pm2 status"
ssh root@42.121.218.14 "ss -tuln | grep :5000"
```

### 2. 检查 SDK 初始化
```bash
ssh root@42.121.218.14 "pm2 logs enterprise-website --lines 100 | grep -E '微信支付|SDK'"
```

### 3. 检查配置文件
```bash
ssh root@42.121.218.14 "cat /root/sifan/.env.production | grep WECHAT"
ssh root@42.121.218.14 "ls -lh /root/sifan/certs/"
```

### 4. 检查数据库连接
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

### 5. 测试支付接口
```bash
# 使用有效的 userId 测试
curl -X POST \
  -H "Content-Type: application/json" \
  -H "Cookie: userId=<有效的userId>" \
  -d '{"paymentMethod":"wechat","amount":0.01,"description":"测试订单","type":"recharge"}' \
  http://www.zjsifan.com/api/payment/create
```

### 6. 查看实时日志
```bash
ssh root@42.121.218.14 "pm2 logs enterprise-website --lines 0"

# 然后在浏览器中触发支付操作
```

---

## 常见错误及解决方案

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| 微信支付 SDK 未初始化 | 环境变量未配置 | 运行 `scripts/quick-fix-payment.sh` |
| 证书文件不存在 | 证书文件丢失 | 从本地上传证书文件 |
| 违反外键约束 | userId 不存在 | 先登录获取有效的 userId |
| 数据库连接失败 | 数据库配置错误 | 检查数据库连接字符串 |
| 网络请求超时 | 网络问题 | 检查服务器网络连接 |

---

## 获取帮助

如果以上步骤都无法解决问题，请提供以下信息：

1. PM2 日志：
```bash
ssh root@42.121.218.14 "pm2 logs enterprise-website --lines 200"
```

2. 诊断脚本输出：
```bash
ssh root@42.121.218.14 "bash /root/sifan/scripts/realtime-diagnose.sh"
```

3. 浏览器控制台的错误信息
4. Network 请求的详细信息
5. 你的 userId（可以脱敏）

---

## 相关文档

- `docs/PAYMENT_FIX_SUMMARY.md` - 支付修复说明
- `docs/PAYMENT_PRODUCTION_DEBUG.md` - 生产环境故障排查
- `scripts/realtime-diagnose.sh` - 实时诊断脚本
- `scripts/quick-fix-payment.sh` - 快速修复脚本

---

**最后更新**: $(date)
**版本**: 3.1
