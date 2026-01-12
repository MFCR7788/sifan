# 支付功能故障排查指南

## 快速诊断

### 1. 打开支付调试页面
访问：`http://localhost:5000/payment-debug`

这个页面会自动运行以下测试：
- ✅ 用户认证状态
- ✅ Cookie 检查
- ✅ SessionStorage 检查
- ✅ `/api/test/cookies` 接口测试
- ✅ `/api/user/me` 接口测试
- ✅ `/api/payment/create` 接口测试

### 2. 查看浏览器控制台
打开浏览器开发者工具（F12），切换到 Console 标签页，查看以下日志：

```
=== 充值对话框打开 ===
isAuthenticated: true/false
user: {...}
浏览器 Cookie: {...}
sessionStorage userId: {...}
```

```
=== 支付接口响应 ===
Response status: 200/401/500
Response data: {...}
====================
```

## 常见问题及解决方案

### 问题 1: "用户未登录，请刷新页面重试或重新登录"

**原因**：
- Cookie 中的 userId 丢失或过期
- SessionStorage 中没有 userId

**解决方案**：
1. 刷新页面
2. 重新登录
3. 检查浏览器是否阻止了 Cookie
4. 如果是 localhost 开发环境，确保使用 sessionStorage 备选方案

### 问题 2: "生成支付二维码失败" + 具体错误信息

#### 错误：参数不完整
**原因**：未正确传递支付参数

**解决方案**：
1. 确保选择了充值金额或会员套餐
2. 检查浏览器控制台的完整错误日志
3. 查看调试页面中的 `/api/payment/create` 测试结果

#### 错误：不支持的支付方式
**原因**：paymentMethod 参数错误

**解决方案**：
- 目前只支持微信支付（`wechat`）
- 检查代码中是否正确设置了 `paymentMethod: 'wechat'`

#### 错误：金额必须大于0
**原因**：金额参数为 0 或负数

**解决方案**：
- 确保选择的金额大于 0
- 最低充值金额为 0.01 元

#### 错误：微信支付失败: xxx
**原因**：微信支付接口调用失败

**解决方案**：

**开发环境**：
```env
# .env.local
# 设置为 false 使用模拟支付（默认）
WECHAT_PAY_ENABLE_REAL=false
```

**生产环境**：
```env
# .env.production
# 设置为 true 使用真实支付
WECHAT_PAY_ENABLE_REAL=true

# 配置微信支付参数
WECHAT_PAY_MCHID=你的商户号
WECHAT_PAY_SERIAL_NO=你的证书序列号
WECHAT_PAY_PRIVATE_KEY_PATH=/path/to/private_key.pem
WECHAT_PAY_API_V3_KEY=你的API v3密钥
WECHAT_PAY_NOTIFY_URL=https://yourdomain.com/api/payment/notify
```

### 问题 3: "网络错误，请稍后重试"

**原因**：
- 后端服务未启动
- 网络连接问题
- CORS 配置问题

**解决方案**：
1. 检查后端服务是否正常运行：`curl -I http://localhost:5000`
2. 检查端口 5000 是否被占用
3. 查看浏览器 Network 标签页中的请求状态

## 开发环境调试

### 启用详细日志

确保 `src/app/api/payment/create/route.ts` 中的详细日志已启用：

```typescript
console.log('=== 支付接口认证调试 ===');
console.log('Cookie数量:', allCookies.length);
console.log('所有Cookie:', allCookies.map(c => ({ name: c.name, value: c.value?.substring(0, 10) + '...' })));
console.log('Cookie userId:', request.cookies.get('userId')?.value);
console.log('Header userId:', request.headers.get('x-user-id'));
console.log('最终 userId:', userId);
console.log('==========================');
```

### 测试支付流程

1. **模拟支付**（开发环境默认）
   - 生成假的二维码链接
   - 需要手动调用支付完成接口进行测试

2. **真实支付**（生产环境）
   - 调用微信支付 API
   - 需要配置正确的商户信息
   - 需要配置支付回调 URL

## 验证修复

修复问题后，按以下步骤验证：

1. **清除浏览器缓存**
   - Chrome: Ctrl + Shift + Delete
   - Mac: Cmd + Shift + Delete

2. **重新登录**
   - 退出登录
   - 重新登录账号

3. **测试支付流程**
   - 打开充值对话框
   - 选择充值金额
   - 查看是否成功生成二维码
   - 查看浏览器控制台无错误

4. **检查调试页面**
   - 访问 `/payment-debug`
   - 所有测试应该显示 ✅ 成功

## 技术支持

如果以上方法都无法解决问题，请提供以下信息：

1. 浏览器控制台的完整日志
2. `/payment-debug` 页面的测试结果
3. Network 标签页中 `/api/payment/create` 请求的详细信息
4. 操作系统、浏览器版本
5. 是否是 localhost 还是部署环境
