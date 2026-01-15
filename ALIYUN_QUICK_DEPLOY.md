# 阿里云服务器快速部署指南

## 📋 本次更新内容

- ✅ 添加 `COZE_WORKLOAD_IDENTITY_API_KEY` 环境变量
- ✅ 修复 AI 图像生成功能
- ✅ 修复封面图制作功能
- ✅ 代码已推送到 GitHub

## 🚀 快速部署（推荐）

### 方式一：直接在阿里云服务器执行（最简单）

SSH 登录到阿里云服务器（42.121.218.14）：

```bash
# 1. SSH 登录服务器
ssh root@42.121.218.14

# 2. 进入项目目录
cd /root/sifan

# 3. 拉取最新代码
git pull origin main

# 4. 重启服务
pm2 restart enterprise-website

# 5. 查看日志
pm2 logs enterprise-website --lines 50
```

### 方式二：使用自动化部署脚本

如果需要完整部署流程（包括安装依赖、构建等）：

```bash
# 在服务器上执行
cd /root/sifan
chmod +x quick-deploy-to-aliyun.sh
./quick-deploy-to-aliyun.sh
```

### 方式三：一键命令（快速）

```bash
cd /root/sifan && \
pm2 stop enterprise-website && \
git pull origin main && \
pnpm install && \
pnpm run build && \
pm2 restart enterprise-website && \
pm2 save && \
pm2 logs enterprise-website --lines 20
```

## 🔍 验证部署

### 1. 检查应用状态

```bash
# 查看 PM2 应用状态
pm2 list

# 查看应用日志
pm2 logs enterprise-website --lines 50
```

### 2. 检查端口监听

```bash
# 检查 3000 端口（Next.js 应用）
ss -lptn 'sport = :3000'

# 检查 443 端口（Nginx HTTPS）
ss -lptn 'sport = :443'
```

### 3. 测试本地访问

```bash
# 测试 Next.js 应用
curl -I http://localhost:3000

# 测试 HTTPS 访问
curl -I https://www.zjsifan.com
```

### 4. 浏览器验证

访问以下地址并测试功能：
- https://www.zjsifan.com/tool/cover-generator - 封面图制作
- https://www.zjsifan.com/tool/ai-image-generation - AI 图像生成

**验证清单：**
- [ ] 封面图制作功能正常
- [ ] AI 图像生成功能正常
- [ ] 不再出现 "生成失败，请重试" 提示

## 🔧 故障排查

### 问题 1：代码拉取失败

```bash
# 尝试使用 GitHub 镜像
git remote set-url origin https://ghproxy.com/https://github.com/MFCR7788/sifan.git
git pull origin main
```

### 问题 2：构建失败

```bash
# 清理缓存后重新构建
rm -rf .next .next-turbopack-cache node_modules/.cache
pnpm install
pnpm run build
```

### 问题 3：应用启动失败

```bash
# 查看详细错误日志
pm2 logs enterprise-website --lines 100

# 重启应用
pm2 restart enterprise-website
```

### 问题 4：环境变量未生效

```bash
# 检查 .env.production 文件
cat .env.production | grep COZE_WORKLOAD_IDENTITY_API_KEY

# 如果不存在，手动添加
echo "COZE_WORKLOAD_IDENTITY_API_KEY=pat_3rd0Mjj7Wqo0ThZIu2NEbiiL9p2cMLuqaoJw1Sld47Qa9tYOzyDZ90nitaS7VvEv" >> .env.production

# 重启应用
pm2 restart enterprise-website
```

## 📊 部署日志

### 本次提交信息

- **提交哈希**: 9ff7f4d
- **提交信息**: fix: 添加生产环境COZE API密钥配置，修复AI生图功能
- **修改文件**: .env.production

### 环境变量配置

```bash
COZE_WORKLOAD_IDENTITY_API_KEY=pat_3rd0Mjj7Wqo0ThZIu2NEbiiL9p2cMLuqaoJw1Sld47Qa9tYOzyDZ90nitaS7VvEv
```

## 📝 后续更新

下次更新代码时，只需执行：

```bash
cd /root/sifan
git pull origin main
pm2 restart enterprise-website
```

## 🎯 预期结果

部署成功后：
- ✅ PM2 应用状态为 "online"
- ✅ Next.js 应用运行在 3000 端口
- ✅ Nginx 运行正常，443 端口监听
- ✅ 网站可以正常访问
- ✅ AI 生图功能正常工作

## 🆘 获取帮助

如果遇到问题：
1. 查看应用日志：`pm2 logs enterprise-website`
2. 检查 Nginx 日志：`tail -f /var/log/nginx/enterprise-website-error.log`
3. 联系技术支持
