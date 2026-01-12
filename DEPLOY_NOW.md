# 🚀 部署到阿里云 - 快速操作指南

## 当前状态

✓ 代码已推送到 GitHub
✓ 支付功能修复已完成
✓ 部署脚本已更新

## ⚠️ 重要安全提醒

你提供的 GitHub Token 已被使用。**强烈建议立即撤销此 Token！**

撤销步骤：
1. 访问 https://github.com/settings/tokens
2. 找到使用的 Token 并点击删除
3. 生成新的 Token 用于后续操作

---

## 📋 部署步骤（在本地执行）

由于当前环境无法直接连接服务器，请在本地执行以下步骤：

### 方式 1: 一键部署（推荐）✨

#### 前置条件
- 确保本地已安装 `ssh` 和 `scp` 命令
- 确保有服务器的 SSH 访问权限

#### 执行部署

在本地项目目录打开终端，执行：

```bash
# 1. 拉取最新代码
git pull origin main

# 2. 执行部署脚本
./deploy-local.sh
```

**预计耗时**: 5-10 分钟（取决于网络速度）

---

### 方式 2: 快速修复支付功能（如果只是修复支付）

如果只需要修复支付配置，可以快速执行：

```bash
# 1. 登录服务器
ssh root@42.121.218.14

# 2. 进入项目目录
cd /root/sifan

# 3. 上传并运行快速修复脚本
# (从 GitHub 下载并执行)
curl -o scripts/quick-fix-payment.sh https://raw.githubusercontent.com/MFCR7788/sifan/main/scripts/quick-fix-payment.sh
chmod +x scripts/quick-fix-payment.sh
./scripts/quick-fix-payment.sh

# 4. 退出服务器
exit
```

---

### 方式 3: 手动部署（如果脚本失败）

#### 步骤 1: 本地构建

```bash
# 拉取最新代码
git pull origin main

# 安装依赖
pnpm install --production=false

# 构建项目
pnpm run build
```

#### 步骤 2: 打包文件

```bash
# 创建临时目录
LOCAL_BUILD_DIR="/tmp/sifan-build-$(date +%s)"
rm -rf "$LOCAL_BUILD_DIR"
mkdir -p "$LOCAL_BUILD_DIR"

# 复制必要文件
cp -r .next "$LOCAL_BUILD_DIR/"
cp -r node_modules "$LOCAL_BUILD_DIR/"
cp -r public "$LOCAL_BUILD_DIR/"
cp -r certs "$LOCAL_BUILD_DIR/"
cp package.json "$LOCAL_BUILD_DIR/"
cp pnpm-lock.yaml "$LOCAL_BUILD_DIR/"
cp next.config.ts "$LOCAL_BUILD_DIR/"
cp tsconfig.json "$LOCAL_BUILD_DIR/"
cp .env.production "$LOCAL_BUILD_DIR/"

# 打包
cd /tmp && tar -czf sifan-deploy.tar.gz -C sifan-build-* . && cd -

# 查看打包大小
ls -lh /tmp/sifan-deploy.tar.gz
```

#### 步骤 3: 上传到服务器

```bash
# 上传压缩包
scp /tmp/sifan-deploy.tar.gz root@42.121.218.14:/tmp/
```

#### 步骤 4: 服务器端部署

```bash
# 登录服务器
ssh root@42.121.218.14

# 进入项目目录
cd /root/sifan

# 备份当前版本
BACKUP_TIME=$(date +%s)
mv .next .next.backup.$BACKUP_TIME || true
mv node_modules node_modules.backup.$BACKUP_TIME || true

# 清空当前目录（保留 .git）
find . -maxdepth 1 ! -name '.git' ! -name '.' ! -name '..' -exec rm -rf {} + 2>/dev/null || true

# 解压新版本
tar -xzf /tmp/sifan-deploy.tar.gz -C /root/sifan

# 清理临时文件
rm -f /tmp/sifan-deploy.tar.gz

# 重启 PM2 服务
pm2 delete enterprise-website 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

# 等待服务启动
sleep 10

# 检查服务状态
pm2 status

# 退出服务器
exit
```

---

## ✅ 验证部署

### 1. 检查服务状态

```bash
ssh root@42.121.218.14 "pm2 status"
```

应该看到 `enterprise-website` 进程状态为 `online`。

### 2. 查看初始化日志

```bash
ssh root@42.121.218.14 "pm2 logs enterprise-website --lines 30 | grep 微信支付"
```

应该看到：
```
=== 微信支付 SDK 初始化 ===
✅ 微信支付 SDK 初始化成功
========================
```

### 3. 测试网站访问

```bash
curl -I http://www.zjsifan.com
```

应该返回 200 OK。

### 4. 测试支付功能

在浏览器中：
1. 访问 http://www.zjsifan.com/login
2. 登录账号
3. 访问 http://www.zjsifan.com/recharge
4. 输入金额（如 0.01 元）
5. 点击生成二维码
6. 应该正常显示微信支付二维码

---

## 🔍 故障排查

### 如果部署失败

#### 运行诊断脚本

```bash
ssh root@42.121.218.14
cd /root/sifan
./scripts/diagnose-payment.sh
```

#### 查看详细日志

```bash
ssh root@42.121.218.14 "pm2 logs enterprise-website --lines 100"
```

#### 检查端口监听

```bash
ssh root@42.121.218.14 "ss -tuln | grep :5000"
```

### 如果支付功能仍然失败

#### 确认环境变量

```bash
ssh root@42.121.218.14 "pm2 show enterprise-website | grep -A 20 env"
```

#### 检查证书文件

```bash
ssh root@42.121.218.14 "ls -lh /root/sifan/certs/"
```

#### 测试支付接口

```bash
# 先登录获取 userId
# 然后测试支付接口
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

## 📊 部署后功能验证清单

- [ ] 网站首页正常访问（http://www.zjsifan.com）
- [ ] 登录功能正常
- [ ] 充值页面正常打开
- [ ] 生成支付二维码成功
- [ ] 二维码显示正常
- [ ] 扫码可以完成支付
- [ ] 支付成功后余额正确更新
- [ ] 管理后台正常访问（http://www.zjsifan.com/admin/members）
- [ ] 其他页面功能正常

---

## 🆘 遇到问题？

### 查看文档

- `docs/PAYMENT_FIX_SUMMARY.md` - 支付修复说明
- `docs/PAYMENT_PRODUCTION_DEBUG.md` - 支付故障排查
- `docs/DEPLOYMENT_GUIDE.md` - 完整部署指南
- `docs/PRODUCTION_PAYMENT_TROUBLESHOOTING.md` - 生产环境故障排查

### 快速回滚

如果部署后出现问题，可以快速回滚：

```bash
ssh root@42.121.218.14 << 'ENDSSH'
cd /root/sifan

# 找到最新的备份
LATEST_BACKUP=$(ls -td .next.backup.* | head -1)
LATEST_NODE_BACKUP=$(ls -td node_modules.backup.* | head -1)

# 停止服务
pm2 stop enterprise-website

# 恢复备份
rm -rf .next node_modules
mv $LATEST_BACKUP .next
mv $LATEST_NODE_BACKUP node_modules

# 重启服务
pm2 restart enterprise-website
ENDSSH
```

---

## 📝 本次更新内容

### 主要修复
1. ✓ 添加生产环境微信支付配置
2. ✓ 修复 NEXT_PUBLIC_BASE_URL 为生产环境域名
3. ✓ 更新部署脚本包含支付配置和证书

### 新增工具
1. ✓ `scripts/diagnose-payment.sh` - 支付功能诊断脚本
2. ✓ `scripts/quick-fix-payment.sh` - 快速修复脚本

### 更新文档
1. ✓ `docs/PAYMENT_FIX_SUMMARY.md` - 修复说明
2. ✓ `docs/PAYMENT_PRODUCTION_DEBUG.md` - 故障排查指南

---

## 🌐 关键信息

- **服务器地址**: 42.121.218.14
- **网站域名**: www.zjsifan.com
- **PM2 应用名**: enterprise-website
- **运行端口**: 5000
- **最新提交**: 0613b17

---

## 🎯 下一步

1. **在本地执行**: `./deploy-local.sh`
2. **等待部署完成**（约 5-10 分钟）
3. **验证部署结果**
4. **测试支付功能**

如果遇到任何问题，请参考故障排查部分或查看相关文档。

---

**部署准备完成！请在本地执行部署脚本。** 🚀
