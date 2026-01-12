# 🔧 支付功能 500 错误 - 快速修复

## 立即执行的诊断步骤

### 步骤 1: 运行实时诊断（最重要）

```bash
ssh root@42.121.218.14
cd /root/sifan

# 下载并运行诊断脚本
curl -o scripts/realtime-diagnose.sh https://raw.githubusercontent.com/MFCR7788/sifan/main/scripts/realtime-diagnose.sh
chmod +x scripts/realtime-diagnose.sh
./scripts/realtime-diagnose.sh
```

---

### 步骤 2: 查看实时日志

```bash
ssh root@42.121.218.14
cd /root/sifan

# 实时监控日志
pm2 logs enterprise-website --lines 0

# 然后在浏览器中触发支付操作，观察日志
# 按 Ctrl+C 退出
```

---

### 步骤 3: 检查最近的错误

```bash
ssh root@42.121.218.14

# 查看最近的 100 行日志
pm2 logs enterprise-website --lines 100

# 只查看错误日志
pm2 logs enterprise-website --err --lines 50
```

---

## 快速修复命令

### 如果 SDK 未初始化

```bash
ssh root@42.121.218.14 << 'ENDSSH'
cd /root/sifan

# 运行快速修复脚本
curl -o scripts/quick-fix-payment.sh https://raw.githubusercontent.com/MFCR7788/sifan/main/scripts/quick-fix-payment.sh
chmod +x scripts/quick-fix-payment.sh
./scripts/quick-fix-payment.sh

# 查看初始化日志
sleep 5
pm2 logs enterprise-website --lines 30 | grep -E "微信支付|SDK|初始化"
ENDSSH
```

---

### 如果证书文件缺失

```bash
# 在本地执行
scp certs/apiclient_key.pem root@42.121.218.14:/root/sifan/certs/
scp certs/apiclient_cert.pem root@42.121.218.14:/root/sifan/certs/

# 重启服务
ssh root@42.121.218.14 "pm2 restart enterprise-website"
```

---

### 如果配置文件缺失

```bash
ssh root@42.121.218.14 << 'ENDSSH'
cd /root/sifan

# 更新 .env.production
cat > .env.production << 'EOF'
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

# 重启服务
pm2 restart enterprise-website

# 等待 5 秒
sleep 5

# 查看日志
pm2 logs enterprise-website --lines 30
ENDSSH
```

---

## 测试支付接口

### 方法 1: 使用诊断脚本

```bash
ssh root@42.121.218.14
cd /root/sifan
./scripts/realtime-diagnose.sh

# 按照提示输入你的 userId
```

### 方法 2: 手动测试

```bash
# 先获取有效的 userId
# 打开浏览器 -> http://www.zjsifan.com/login
# 登录后打开浏览器控制台 (F12)
# Application -> Cookies -> userId

# 替换 <你的userId> 后执行
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

---

## 浏览器检查

### 检查 Cookie

1. 打开浏览器控制台 (F12)
2. Application -> Cookies -> `www.zjsifan.com`
3. 确认 `userId` Cookie 存在且不为空

### 检查网络请求

1. 打开浏览器控制台 (F12)
2. Network 标签页
3. 触发支付操作
4. 找到 `/api/payment/create` 请求
5. 查看响应内容

---

## 一键诊断（推荐）

```bash
ssh root@42.121.218.14 << 'ENDSSH'
cd /root/sifan

echo "=== 1. PM2 状态 ==="
pm2 status

echo ""
echo "=== 2. SDK 初始化日志 ==="
pm2 logs enterprise-website --lines 100 | grep -E "微信支付|SDK|初始化" | tail -20

echo ""
echo "=== 3. 配置文件检查 ==="
cat .env.production | grep -E "WECHAT|NEXT_PUBLIC_BASE_URL"

echo ""
echo "=== 4. 证书文件检查 ==="
ls -lh certs/

echo ""
echo "=== 5. 最近错误日志 ==="
pm2 logs enterprise-website --err --lines 20

echo ""
echo "=== 6. 端口监听 ==="
ss -tuln | grep :5000
ENDSSH
```

---

## 常见问题速查

| 问题 | 快速解决 |
|-----|---------|
| SDK 未初始化 | 运行 `scripts/quick-fix-payment.sh` |
| 证书文件缺失 | 从本地上传证书文件 |
| userId 无效 | 重新登录获取有效 userId |
| 数据库连接失败 | 检查数据库连接字符串 |
| 端口未监听 | `pm2 restart enterprise-website` |

---

## 详细文档

- `docs/PAYMENT_500_ERROR_TROUBLESHOOTING.md` - 完整排查指南
- `docs/PAYMENT_FIX_SUMMARY.md` - 修复说明
- `scripts/realtime-diagnose.sh` - 实时诊断脚本

---

## 需要帮助？

如果以上步骤都无法解决问题，请提供：

1. 诊断脚本输出
2. PM2 日志：
```bash
pm2 logs enterprise-website --lines 200
```
3. 浏览器控制台错误
4. Network 请求详情

---

**立即执行诊断:**

```bash
ssh root@42.121.218.14 "cd /root/sifan && bash scripts/realtime-diagnose.sh"
```
