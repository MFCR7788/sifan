# 支付功能测试指南

## 问题已修复

### 原因
前端和后端的订单类型不匹配：
- 前端发送：`'member'`, `'balance'`, `'points'`
- 后端验证：`'recharge'`, `'membership'`, `'points'`

### 解决方案
已在前端添加类型映射：
- `'member'` → `'membership'` (购买会员)
- `'balance'` → `'recharge'` (会员充值)
- `'points'` → `'points'` (积分充值)

---

## 开发环境测试步骤

### 1. 测试支付二维码生成

1. **登录账号**
   - 访问 http://localhost:5000
   - 登录测试账号

2. **打开充值对话框**
   - 点击"充值"按钮

3. **测试不同类型**
   - **购买会员**：选择任意会员套餐 → 应该成功生成二维码
   - **会员充值**：选择充值金额 → 应该成功生成二维码
   - **积分充值**：选择积分套餐 → 应该成功生成二维码

4. **查看控制台**
   - 打开浏览器开发者工具（F12）
   - 查看 Console 标签，应该看到：
     ```
     === 支付接口响应 ===
     Response status: 200
     Response data: { success: true, orderNo: "membership_xxx", ... }
     ====================
     ```

### 2. 测试模拟支付完成（开发环境专用）

生成二维码后，点击 **"⚡ 模拟支付完成（开发环境）"** 按钮：

1. 按钮位于二维码下方
2. 点击后会调用 `/api/payment/mock-complete` 接口
3. 支付状态会自动更新为"支付成功"
4. 显示绿色勾选图标和"支付成功"提示

### 3. 验证支付结果

1. **查看用户余额/积分**
   - 关闭充值对话框
   - 刷新页面
   - 查看用户余额或积分是否增加

2. **查看交易记录**
   - 访问个人中心 → 交易记录
   - 应该能看到刚才的支付记录

---

## 生产环境部署

### 1. 配置微信支付参数

在服务器上创建 `.env.production` 文件：

```bash
# 启用真实支付
WECHAT_PAY_ENABLE_REAL=true

# 微信支付商户号
WECHAT_PAY_MCHID=你的商户号

# 微信支付证书序列号
WECHAT_PAY_SERIAL_NO=你的证书序列号

# 商户私钥文件路径
WECHAT_PAY_PRIVATE_KEY_PATH=/path/to/apiclient_key.pem

# API v3 密钥
WECHAT_PAY_API_V3_KEY=你的APIv3密钥

# 支付回调通知地址（必须是 HTTPS）
WECHAT_PAY_NOTIFY_URL=https://yourdomain.com/api/payment/notify
```

### 2. 上传商户私钥文件

将微信支付商户平台的 `apiclient_key.pem` 文件上传到服务器，确保路径与配置一致。

### 3. 测试微信支付

1. 在生产环境生成支付二维码
2. 使用微信扫码支付
3. 等待支付成功回调
4. 验证余额/积分是否增加

---

## 常见问题

### Q1: 模拟支付按钮不显示？

**原因**：不是开发环境

**解决**：
```bash
# 本地开发时确保环境变量设置正确
NODE_ENV=development pnpm dev
```

### Q2: 点击模拟支付按钮没反应？

**解决**：
1. 打开浏览器控制台查看错误
2. 检查接口调用是否成功：Network 标签 → `/api/payment/mock-complete`
3. 确认订单号是否正确

### Q3: 支付成功后余额没更新？

**解决**：
1. 刷新页面
2. 检查数据库 `members` 表中的 `balance` 和 `points` 字段
3. 查看控制台日志确认订单状态更新

### Q4: 生产环境支付失败？

**解决**：
1. 检查 `.env.production` 配置是否正确
2. 检查商户私钥文件路径是否正确
3. 检查证书序列号是否正确
4. 查看后端日志：`tail -f logs/server.log`

---

## API 接口说明

### 1. 创建支付订单
```
POST /api/payment/create
Content-Type: application/json

{
  "paymentMethod": "wechat",
  "amount": 100,
  "description": "充值 ¥100",
  "type": "recharge",  // recharge | membership | points
  "metadata": {}
}
```

### 2. 查询支付状态
```
GET /api/payment/query?orderNo=xxx
```

### 3. 模拟支付完成（开发环境）
```
POST /api/payment/mock-complete
Content-Type: application/json

{
  "orderNo": "xxx"
}
```

---

## 故障排查工具

### 调试页面
访问：http://localhost:5000/payment-debug

自动检测：
- 用户认证状态
- Cookie 和 SessionStorage
- 接口调用测试

### 查看后端日志
```bash
# 实时查看后端日志
pm2 logs enterprise-website
```

### 测试支付接口
```bash
# 手动测试支付接口（需要登录获取 userId）
curl -X POST http://localhost:5000/api/payment/create \
  -H "Content-Type: application/json" \
  -H "Cookie: userId=YOUR_USER_ID" \
  -d '{
    "paymentMethod": "wechat",
    "amount": 0.01,
    "description": "测试支付",
    "type": "recharge"
  }'
```
