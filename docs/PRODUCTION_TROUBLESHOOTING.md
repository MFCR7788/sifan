# 生产环境故障排查指南

## 错误：生成支付二维码失败

### 错误信息
```
Unexpected token 'I', "Internal S"... is not valid JSON
```

### 原因分析
服务器返回了非 JSON 格式的响应（通常是 HTML 错误页面），导致前端 JSON 解析失败。

常见原因：
1. **微信支付 SDK 未初始化** - 证书文件不存在或路径错误
2. **数据库连接失败** - 数据库服务未启动或连接配置错误
3. **环境变量缺失** - 必需的环境变量未配置
4. **支付接口异常** - 微信支付 API 调用失败

---

## 排查步骤

### 步骤 1: 查看服务器日志

```bash
# SSH 连接到服务器
ssh root@your-server-ip

# 查看 PM2 服务日志（最近 100 行）
pm2 logs enterprise-website --lines 100

# 实时查看日志
pm2 logs enterprise-website
```

### 步骤 2: 检查微信支付 SDK 初始化

在日志中查找：
```
=== 微信支付 SDK 初始化 ===
私钥路径: /root/sifan/certs/apiclient_key.pem
证书路径: /root/sifan/certs/apiclient_cert.pem
私钥文件存在: true/false
证书文件存在: true/false
✅ 微信支付 SDK 初始化成功
```

**如果看到初始化失败：**
```
❌ 微信支付 SDK 初始化失败: ENOENT: no such file or directory
```

**解决方案：**

#### 2.1 检查证书文件是否存在

```bash
ls -la /root/sifan/certs/
```

应该看到：
```
apiclient_key.pem    # 商户私钥
apiclient_cert.pem   # 商户证书（可选）
```

#### 2.2 下载微信支付商户证书

1. 登录微信支付商户平台
2. 进入：账户中心 > API 安全 > API 证书
3. 下载证书包并解压
4. 上传 `apiclient_key.pem` 到服务器：

```bash
# 在本地执行
scp apiclient_key.pem root@your-server-ip:/root/sifan/certs/
```

#### 2.3 设置正确的权限

```bash
chmod 600 /root/sifan/certs/apiclient_key.pem
chown root:root /root/sifan/certs/apiclient_key.pem
```

#### 2.4 验证文件内容

```bash
# 检查私钥文件格式（应该以 -----BEGIN PRIVATE KEY----- 开头）
head -1 /root/sifan/certs/apiclient_key.pem

# 检查文件是否损坏
openssl rsa -in /root/sifan/certs/apiclient_key.pem -check -noout
```

---

### 步骤 3: 检查环境变量配置

```bash
# 查看环境变量文件
cat /root/sifan/.env.production

# 或者通过 PM2 查看环境变量
pm2 env enterprise-website
```

**必需的环境变量：**

```bash
# 数据库配置
DATABASE_URL=postgresql://username:password@localhost:5432/sifan

# 微信支付配置（生产环境必须配置）
WECHAT_PAY_ENABLE_REAL=true
WECHAT_PAY_APPID=wx1234567890abcdef
WECHAT_PAY_MCHID=1234567890
WECHAT_PAY_SERIAL_NO=证书序列号
WECHAT_PAY_PRIVATE_KEY_PATH=/root/sifan/certs/apiclient_key.pem
WECHAT_PAY_API_V3_KEY=你的API v3密钥（32位）
WECHAT_PAY_NOTIFY_URL=https://yourdomain.com/api/payment/wechat/notify
```

**检查要点：**
- ✅ `WECHAT_PAY_ENABLE_REAL=true`（生产环境必须为 true）
- ✅ `WECHAT_PAY_MCHID` 是你的商户号
- ✅ `WECHAT_PAY_SERIAL_NO` 是证书序列号
- ✅ `WECHAT_PAY_API_V3_KEY` 是 32 位的 API v3 密钥
- ✅ `WECHAT_PAY_PRIVATE_KEY_PATH` 指向正确的私钥文件路径
- ✅ `WECHAT_PAY_NOTIFY_URL` 是完整的 HTTPS 地址

---

### 步骤 4: 检查数据库连接

```bash
# 测试 PostgreSQL 连接
psql -U your_username -d sifan

# 如果连接失败，检查 PostgreSQL 服务状态
systemctl status postgresql

# 查看数据库日志
tail -f /var/log/postgresql/postgresql-*.log
```

**常见问题：**
- 数据库密码错误
- 数据库服务未启动
- 数据库不存在

**解决方案：**

```bash
# 启动 PostgreSQL
systemctl start postgresql
systemctl enable postgresql

# 创建数据库（如果不存在）
sudo -u postgres createdb sifan

# 创建用户（如果不存在）
sudo -u postgres createuser -P your_username
```

---

### 步骤 5: 检查 PM2 服务状态

```bash
# 查看服务状态
pm2 status

# 查看服务详细信息
pm2 describe enterprise-website

# 查看内存和 CPU 使用
pm2 monit

# 重启服务
pm2 restart enterprise-website

# 如果服务异常，完全重启
pm2 delete enterprise-website
pm2 start ecosystem.config.js
```

---

### 步骤 6: 检查网络和端口

```bash
# 检查 5000 端口是否监听
ss -tuln | grep :5000

# 测试本地访问
curl -I http://localhost:5000

# 检查防火墙
systemctl status firewalld  # CentOS
systemctl status ufw         # Ubuntu

# 开放端口（如果需要）
firewall-cmd --permanent --add-port=5000/tcp  # CentOS
ufw allow 5000/tcp                                   # Ubuntu
```

---

## 常见错误及解决方案

### 错误 1: "微信支付未初始化，请检查证书配置和环境变量"

**原因：** 证书文件不存在或环境变量配置错误

**解决方案：**
1. 检查证书文件是否存在：`ls -la /root/sifan/certs/`
2. 检查 `.env.production` 中的 `WECHAT_PAY_PRIVATE_KEY_PATH`
3. 上传证书文件并设置正确权限

---

### 错误 2: "用户未登录，请刷新页面重试或重新登录"

**原因：** Cookie 未发送到后端

**解决方案：**
1. 确保使用 HTTPS（生产环境必需）
2. 检查 Nginx 配置中的 `proxy_set_header` 设置
3. 刷新页面重新登录

---

### 错误 3: "数据库未配置" 或 "获取用户信息失败"

**原因：** 数据库连接失败

**解决方案：**
1. 检查 `.env.production` 中的 `DATABASE_URL`
2. 测试数据库连接：`psql -U username -d sifan`
3. 检查 PostgreSQL 服务状态

---

### 错误 4: "创建微信支付订单失败: xxx"

**原因：** 微信支付 API 调用失败

**解决方案：**

#### 4.1 检查商户信息
```bash
# 登录微信支付商户平台，验证：
# 1. 商户号 (MCHID)
# 2. AppID
# 3. API v3 密钥
# 4. 证书序列号
```

#### 4.2 检查证书是否过期
```bash
# 查看证书有效期
openssl x509 -in /root/sifan/certs/apiclient_cert.pem -noout -dates
```

#### 4.3 测试微信支付连接
```bash
# 查看完整日志
pm2 logs enterprise-website | grep -i "wechat"
```

常见 API 错误：
- `APPID_MCHID_NOT_MATCH` - AppID 和商户号不匹配
- `SIGN_ERROR` - 签名错误（检查 API v3 密钥）
- `CERT_ERROR` - 证书错误（检查证书文件）

---

### 错误 5: "Internal Server Error" (500)

**原因：** 服务器内部错误

**解决方案：**

1. **查看完整错误堆栈**
```bash
pm2 logs enterprise-website --err --lines 50
```

2. **检查常见问题**
- 数据库查询失败
- 文件权限问题
- 内存不足

3. **临时解决方案**
```bash
# 增加内存限制
pm2 restart enterprise-website --max-memory-restart 500M

# 或者完全重启
pm2 delete enterprise-website
pm2 start ecosystem.config.js
```

---

## 快速诊断命令

### 一键诊断脚本

```bash
#!/bin/bash

echo "=== 生产环境快速诊断 ==="

# 1. 检查 PM2 服务
echo "1. PM2 服务状态:"
pm2 status | grep enterprise-website

# 2. 检查端口
echo -e "\n2. 端口监听:"
ss -tuln | grep :5000

# 3. 检查证书文件
echo -e "\n3. 证书文件:"
ls -la /root/sifan/certs/

# 4. 检查数据库连接
echo -e "\n4. 数据库连接:"
psql -U $(echo $DATABASE_URL | cut -d':' -f2 | cut -d'@' -f1) -d sifan -c "SELECT 1" 2>&1 | head -1

# 5. 检查磁盘空间
echo -e "\n5. 磁盘空间:"
df -h /root

# 6. 检查最近错误日志
echo -e "\n6. 最近错误日志:"
pm2 logs enterprise-website --err --lines 10

echo -e "\n=== 诊断完成 ==="
```

---

## 测试支付接口

### 手动测试支付接口

```bash
# 1. 获取 userId（登录后在浏览器 Cookie 中查看）

# 2. 测试支付接口
curl -X POST http://localhost:5000/api/payment/create \
  -H "Content-Type: application/json" \
  -H "Cookie: userId=YOUR_USER_ID" \
  -d '{
    "paymentMethod": "wechat",
    "amount": 0.01,
    "description": "测试支付",
    "type": "recharge",
    "metadata": {}
  }' -v

# 3. 查看响应
# - 成功：返回 JSON { success: true, orderNo: "...", qrCodeImage: "..." }
# - 失败：返回 JSON { success: false, error: "..." }
# - 服务器错误：返回 HTML（Internal Server Error）
```

---

## 生产环境配置清单

### ✅ 部署前检查清单

- [ ] 已配置 `.env.production` 环境变量
- [ ] `WECHAT_PAY_ENABLE_REAL=true`
- [ ] 已上传微信支付证书文件
- [ ] 证书文件权限设置为 600
- [ ] `DATABASE_URL` 配置正确
- [ ] PostgreSQL 服务运行正常
- [ ] Nginx 已配置并启用 HTTPS
- [ ] Let's Encrypt 证书有效
- [ ] 防火墙已开放必要端口
- [ ] PM2 服务正常运行

### ✅ 支付功能检查清单

- [ ] 微信支付 SDK 初始化成功（查看日志）
- [ ] 商户号、AppID、证书序列号配置正确
- [ ] API v3 密钥正确（32 位）
- [ ] 支付回调 URL 可访问（HTTPS）
- [ ] 数据库连接正常
- [ ] 可以成功创建订单
- [ ] 二维码可以正常显示
- [ ] 支付回调可以正常接收
- [ ] 订单状态可以正常更新

---

## 联系技术支持

如果以上方法都无法解决问题，请收集以下信息：

1. **服务器日志**
```bash
pm2 logs enterprise-website --lines 200 > logs.txt
```

2. **环境变量配置（脱敏）**
```bash
cat /root/sifan/.env.production | sed 's/=.*/=***/'
```

3. **PM2 状态**
```bash
pm2 describe enterprise-website > pm2-status.txt
```

4. **错误截图**
- 浏览器控制台错误
- 前端显示的错误信息
- 网络请求的响应内容

---

## 相关文档

- [阿里云部署指南](./ALIYUN_DEPLOYMENT.md)
- [支付功能测试指南](./TEST_PAYMENT_FLOW.md)
- [支付故障排查](./PAYMENT_TROUBLESHOOTING.md)
- [GitHub Actions 配置](./DEPLOYMENT.md)
