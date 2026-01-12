# 部署指南

## 一、推送代码到 GitHub

由于当前环境无法直接推送，你需要在本地执行以下步骤：

### 1. 配置 GitHub 认证

选择以下任一方式：

#### 方式 1: 使用 GitHub Token（推荐）

```bash
# 设置远程仓库使用 Token 认证
git remote set-url origin https://<YOUR_TOKEN>@github.com/MFCR7788/sifan.git

# 推送代码
git push origin main
```

#### 方式 2: 使用 SSH 密钥

```bash
# 生成 SSH 密钥（如果还没有）
ssh-keygen -t ed25519 -C "your_email@example.com"

# 将公钥添加到 GitHub
cat ~/.ssh/id_ed25519.pub
# 复制内容到 GitHub -> Settings -> SSH and GPG keys -> New SSH key

# 使用 SSH URL
git remote set-url origin git@github.com:MFCR7788/sifan.git

# 推送代码
git push origin main
```

### 2. 推送当前代码

```bash
git push origin main
```

---

## 二、部署到阿里云服务器

### 前置条件

1. 本地安装了 `ssh` 和 `scp` 命令
2. 有服务器的 SSH 访问权限
3. 已安装 Node.js 和 pnpm

### 一键部署

在本地项目目录执行：

```bash
./deploy-local.sh
```

这个脚本会自动完成以下步骤：
1. 本地构建项目
2. 打包部署文件
3. 上传到服务器
4. 在服务器上部署
5. 验证部署结果

### 手动部署（如果脚本失败）

#### 1. 本地构建

```bash
# 安装依赖
pnpm install --production=false

# 构建项目
pnpm run build
```

#### 2. 打包文件

```bash
# 创建临时目录
mkdir -p /tmp/sifan-build
rm -rf /tmp/sifan-build/*

# 复制必要文件
cp -r .next /tmp/sifan-build/
cp -r node_modules /tmp/sifan-build/
cp -r public /tmp/sifan-build/
cp package.json /tmp/sifan-build/
cp pnpm-lock.yaml /tmp/sifan-build/
cp next.config.ts /tmp/sifan-build/
cp tsconfig.json /tmp/sifan-build/

# 创建 PM2 配置
cat > /tmp/sifan-build/ecosystem.config.js << 'EOF'
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
      PGDATABASE_URL: 'postgresql://user_7591422450290704422:aef1a966-5890-4e13-a499-e5a8b0e8b0b4@cp-cute-mist-247e1363.pg2.aidap-global.cn-beijing.volces.com:5432/Database_1767516520571?sslmode=require&channel_binding=require',
      PGDATABASE: 'Database_1767516520571'
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log'
  }]
};
EOF

# 打包
cd /tmp && tar -czf sifan-deploy.tar.gz -C sifan-build . && cd -
```

#### 3. 上传到服务器

```bash
scp /tmp/sifan-deploy.tar.gz root@42.121.218.14:/tmp/
```

#### 4. 服务器端部署

```bash
ssh root@42.121.218.14
```

在服务器上执行：

```bash
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

# 保存 PM2 配置
pm2 save

# 等待服务启动
sleep 10

# 检查服务状态
pm2 status

# 测试服务
curl -I http://localhost:5000
```

---

## 三、验证部署

### 1. 检查服务状态

```bash
ssh root@42.121.218.14 "pm2 status"
```

### 2. 检查端口监听

```bash
ssh root@42.121.218.14 "ss -tuln | grep :5000"
```

### 3. 测试网站访问

```bash
curl -I http://www.zjsifan.com
```

### 4. 查看日志

```bash
ssh root@42.121.218.14 "pm2 logs enterprise-website --lines 50"
```

---

## 四、故障排查

### 问题 1: 端口 5000 未监听

```bash
# 检查 PM2 进程
ssh root@42.121.218.14 "pm2 status"

# 查看错误日志
ssh root@42.121.218.14 "pm2 logs enterprise-website --err --lines 100"

# 重启服务
ssh root@42.121.218.14 "pm2 restart enterprise-website"
```

### 问题 2: 构建失败

```bash
# 清理构建缓存
rm -rf .next
pnpm run build
```

### 问题 3: 支付功能异常

参考 `docs/PRODUCTION_PAYMENT_TROUBLESHOOTING.md` 进行排查。

---

## 五、快速回滚

如果部署后出现问题，可以快速回滚到上一个版本：

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

## 六、更新版本号

根据需求，版本号统一为 3.1。如需更新版本号：

1. 编辑 `package.json` 中的 version 字段
2. 提交并推送代码
3. 执行部署脚本

---

## 七、联系信息

- 服务器地址: 42.121.218.14
- 域名: www.zjsifan.com
- PM2 应用名称: enterprise-website
- 运行端口: 5000
