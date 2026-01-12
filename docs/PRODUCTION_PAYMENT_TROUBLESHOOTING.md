# 生产环境支付功能故障排查指南

## 问题现象
用户在充值页面点击"确认充值"后，显示错误信息：
```
服务器返回错误 (500): Internal Server Error...
```

## 快速诊断步骤

### 1. 检查 PM2 服务状态
```bash
# 查看服务是否运行
pm2 status

# 查看实时日志
pm2 logs enterprise-website --lines 100

# 查看错误日志
pm2 logs enterprise-website --err --lines 50
```

### 2. 检查端口监听
```bash
# 检查 5000 端口是否在监听
ss -tuln | grep :5000

# 测试服务是否响应
curl -I http://localhost:5000
```

### 3. 检查环境变量
```bash
# 查看生产环境配置
cat /path/to/sifan/.env.production

# 确认以下环境变量是否配置正确：
# - WECHAT_PAY_APPID
# - WECHAT_PAY_MCHID
# - WECHAT_PAY_SERIAL_NO
# - WECHAT_PAY_API_V3_KEY
# - WECHAT_PAY_PRIVATE_KEY_PATH
# - WECHAT_PAY_CERT_PATH
# - PGDATABASE_URL
# - NEXT_PUBLIC_BASE_URL
```

### 4. 检查微信支付证书文件
```bash
# 检查证书文件是否存在
ls -la /path/to/sifan/certs/

# 检查证书文件权限（应该是 600 或 644）
ls -l /path/to/sifan/certs/apiclient_key.pem
ls -l /path/to/sifan/certs/apiclient_cert.pem

# 查看证书文件内容（前几行）
head -5 /path/to/sifan/certs/apiclient_key.pem
head -5 /path/to/sifan/certs/apiclient_cert.pem
```

**注意：**
- 私钥文件 (`apiclient_key.pem`) 应该以 `-----BEGIN PRIVATE KEY-----` 开头
- 证书文件 (`apiclient_cert.pem`) 应该以 `-----BEGIN CERTIFICATE-----` 开头
- 文件路径应该是相对于项目根目录的路径，例如 `./certs/apiclient_key.pem`

### 5. 测试数据库连接
```bash
# 检查 PostgreSQL 是否运行
systemctl status postgresql

# 测试数据库连接
psql -U your_user -d your_database -c "SELECT 1;"

# 或使用环境变量连接
psql $PGDATABASE_URL -c "SELECT 1;"
```

## 常见错误及解决方案

### 错误 1：微信支付 SDK 未初始化

**症状：**
后端日志显示：
```
❌ 微信支付 SDK 初始化失败: ...
```

**可能原因：**
1. 证书文件不存在
2. 证书文件路径配置错误
3. 环境变量未配置
4. 证书文件格式错误

**解决方案：**

1. **检查证书文件是否存在**
   ```bash
   # 在项目根目录下查找证书文件
   find /path/to/sifan -name "*.pem"

   # 确认路径
   ls -la /path/to/sifan/certs/
   ```

2. **检查 .env.production 配置**
   ```bash
   # 证书路径应该是相对路径（相对于项目根目录）
   WECHAT_PAY_PRIVATE_KEY_PATH=./certs/apiclient_key.pem
   WECHAT_PAY_CERT_PATH=./certs/apiclient_cert.pem
   ```

3. **检查证书文件内容**
   ```bash
   # 私钥应该包含以下内容
   cat /path/to/sifan/certs/apiclient_key.pem | grep "BEGIN PRIVATE KEY"

   # 证书应该包含以下内容
   cat /path/to/sifan/certs/apiclient_cert.pem | grep "BEGIN CERTIFICATE"
   ```

4. **如果证书不存在，需要从微信商户平台下载**
   - 登录微信支付商户平台
   - 进入账户中心 → API 安全
   - 下载 API 证书（包含 apiclient_cert.pem 和 apiclient_key.pem）
   - 上传到服务器的 `certs/` 目录

### 错误 2：调用微信支付 API 失败

**症状：**
后端日志显示：
```
❌ 微信支付接口调用失败: ...
```

**可能原因：**
1. 网络连接问题
2. 签名错误
3. 商户配置错误
4. 金额格式错误

**解决方案：**

1. **检查网络连接**
   ```bash
   # 测试能否访问微信支付 API
   curl -I https://api.mch.weixin.qq.com

   # 检查服务器防火墙
   sudo ufw status
   ```

2. **检查商户配置**
   - 确认商户号（MCHID）正确
   - 确认 APPID 与商户号已绑定
   - 确认已开通 Native Pay 支付方式

3. **检查通知 URL 配置**
   ```bash
   # 确认回调地址正确
   NEXT_PUBLIC_BASE_URL=https://your-domain.com

   # 完整的回调地址应该是：
   # https://your-domain.com/api/payment/wechat/notify
   ```

4. **检查金额格式**
   - 金额必须为整数（分）
   - 例如：1 元 = 100 分
   - 不能有小数点

### 错误 3：数据库连接失败

**症状：**
后端日志显示：
```
❌ 数据库错误: ...
```

**可能原因：**
1. PostgreSQL 服务未运行
2. 数据库连接字符串错误
3. 数据库用户权限不足

**解决方案：**

1. **启动 PostgreSQL**
   ```bash
   sudo systemctl start postgresql
   sudo systemctl enable postgresql
   ```

2. **检查连接字符串**
   ```bash
   # 格式应该是：
   # postgresql://username:password@host:port/database
   echo $PGDATABASE_URL
   ```

3. **测试数据库连接**
   ```bash
   psql $PGDATABASE_URL -c "SELECT NOW();"
   ```

### 错误 4：生成二维码失败

**症状：**
后端日志显示：
```
❌ 生成二维码失败: ...
```

**可能原因：**
1. qrcode 库未安装
2. 二维码内容为空
3. 内存不足

**解决方案：**

1. **检查依赖**
   ```bash
   cd /path/to/sifan/standalone
   pnpm list qrcode
   ```

2. **如果缺少依赖，重新安装**
   ```bash
   pnpm install qrcode
   pm2 restart enterprise-website
   ```

## 使用诊断脚本

我们提供了一个自动诊断脚本，可以快速检查所有配置：

```bash
# 在项目根目录下运行
bash scripts/diagnose-production.sh

# 或者手动执行各项检查
curl -I http://localhost:5000/api/payment/debug
```

## 日志分析

### 查看最近的错误日志
```bash
# 查看 PM2 日志
pm2 logs enterprise-website --err --lines 200

# 或查看系统日志
journalctl -u pm2-enterprise-website -n 100 --no-pager
```

### 关键日志标识

| 日志标识 | 含义 | 解决方案 |
|---------|------|---------|
| `❌ 微信支付 SDK 初始化失败` | 证书配置错误 | 检查证书文件和路径 |
| `❌ 微信支付接口调用失败` | API 调用失败 | 检查网络和商户配置 |
| `❌ 数据库错误` | 数据库连接失败 | 检查 PostgreSQL 和连接字符串 |
| `❌ code_url` | 微信支付返回异常 | 检查商户号和 APPID 配置 |

## 验证修复

### 1. 重启服务
```bash
# 完全重启 PM2 服务
pm2 restart enterprise-website

# 等待几秒钟
sleep 5

# 检查服务状态
pm2 status
pm2 logs enterprise-website --lines 20
```

### 2. 测试支付接口
```bash
# 使用 curl 测试支付接口（需要先登录获取 token）
curl -X POST http://localhost:5000/api/payment/create \
  -H "Content-Type: application/json" \
  -H "Cookie: userId=your-user-id" \
  -d '{
    "paymentMethod": "wechat",
    "amount": 0.01,
    "description": "测试支付",
    "type": "recharge",
    "metadata": {}
  }'
```

### 3. 前端测试
1. 打开浏览器开发者工具（F12）
2. 切换到 Console 标签
3. 点击充值按钮
4. 查看是否有错误信息
5. 切换到 Network 标签
6. 查看 `/api/payment/create` 请求的响应内容

## 联系支持

如果以上步骤都无法解决问题，请收集以下信息并联系技术支持：

1. PM2 日志（最近 500 行）：
   ```bash
   pm2 logs enterprise-website --lines 500 > logs.txt
   ```

2. 系统信息：
   ```bash
   uname -a > system-info.txt
   node -v >> system-info.txt
   npm -v >> system-info.txt
   pm2 list >> system-info.txt
   ```

3. 环境变量（隐藏敏感信息）：
   ```bash
   env | grep -E "(WECHAT_PAY|PGDATABASE|NEXT_PUBLIC)" > env-info.txt
   # 手动编辑文件，隐藏 API_KEY、密码等敏感信息
   ```

4. 错误截图（浏览器控制台和网络请求）

## 预防措施

1. **定期备份**
   - 数据库定期备份
   - 证书文件备份

2. **监控告警**
   - 设置 PM2 日志监控
   - 配置错误告警通知

3. **日志管理**
   - 配置日志轮转
   - 定期清理旧日志

4. **定期测试**
   - 定期测试支付功能
   - 验证证书有效期
