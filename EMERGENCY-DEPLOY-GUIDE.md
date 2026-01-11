# 🔥 紧急修复 - 服务器无法连接任何 GitHub 镜像

## 问题
服务器无法连接到任何 GitHub 镜像（包括 ghproxy.com），所有外部网络访问都受限。

## 解决方案（三选一）

### 方案 1：本地上传部署（推荐，最可靠）

在**本地电脑**执行以下命令：

```bash
# 1. 确保在项目目录下
cd /path/to/your/sifan/project

# 2. 本地构建
pnpm install
pnpm run build

# 3. 上传到服务器
# 将以下文件/目录上传到服务器的 /root/sifan 目录：
#   - .next/
#   - node_modules/
#   - public/
#   - package.json
#   - ecosystem.config.js
```

**或者使用自动脚本（如果本地有 SSH）：**

```bash
# 给脚本执行权限
chmod +x deploy-local-upload-fixed.sh

# 执行部署
./deploy-local-upload-fixed.sh
```

### 方案 2：在服务器上手动构建

如果服务器可以访问 npm 仓库，直接在服务器上构建：

```bash
cd /root/sifan

# 手动创建必要的文件
# 需要先获取源代码到服务器上
# 方式 1: 从本地电脑上传整个项目
# 方式 2: 使用其他方式获取源代码

# 然后执行：
pnpm install
pnpm run build
pm2 restart enterprise-website
```

### 方案 3：尝试备用镜像

在服务器上尝试不同的镜像：

```bash
cd /root/sifan

# 尝试不同的镜像
git remote set-url origin https://github.com.cnpmjs.org/MFCR7788/sifan.git
git fetch origin main

# 如果失败，尝试：
git remote set-url origin https://hub.fastgit.xyz/MFCR7788/sifan.git
git fetch origin main

# 如果失败，尝试：
git remote set-url origin https://mirror.ghproxy.com/MFCR7788/sifan.git
git fetch origin main
```

## 方案 1 详细步骤（推荐）

### 步骤 1：在本地构建

```bash
# 本地执行
cd /path/to/sifan
pnpm install
pnpm run build
```

### 步骤 2：打包文件

```bash
# 创建临时目录
mkdir -p /tmp/sifan-deploy

# 复制文件
cp -r .next /tmp/sifan-deploy/
cp -r node_modules /tmp/sifan-deploy/
cp -r public /tmp/sifan-deploy/
cp package.json /tmp/sifan-deploy/

# 创建 ecosystem.config.js
cat > /tmp/sifan-deploy/ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'enterprise-website',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -p 5000',
    cwd: '/root/sifan',
    instances: 2,
    exec_mode: 'cluster',
    autorestart: true,
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
      PGDATABASE_URL: 'postgresql://user_7591422450290704422:aef1a966-5890-4e13-a499-e5a8b0e8b0b4@cp-cute-mist-247e1363.pg2.aidap-global.cn-beijing.volces.com:5432/Database_1767516520571?sslmode=require&channel_binding=require',
      PGDATABASE: 'Database_1767516520571'
    }
  }]
};
EOF

# 打包
cd /tmp/sifan-deploy
tar -czf sifan-deploy.tar.gz .
```

### 步骤 3：上传到服务器

```bash
# 使用 scp 上传
scp /tmp/sifan-deploy/sifan-deploy.tar.gz root@42.121.218.14:/tmp/
```

### 步骤 4：在服务器上解压部署

```bash
# SSH 到服务器
ssh root@42.121.218.14

# 进入项目目录
cd /root/sifan

# 备份
mv .next .next.backup.$(date +%s)
mv node_modules node_modules.backup.$(date +%s) 2>/dev/null || true

# 解压
tar -xzf /tmp/sifan-deploy.tar.gz

# 重启服务
pm2 restart enterprise-website || pm2 start ecosystem.config.js
pm2 save
```

## 验证

```bash
# 在服务器上查看服务状态
pm2 list

# 查看日志
pm2 logs enterprise-website --lines 20

# 访问网站
curl http://www.zjsifan.com
```

## 注意事项

1. **本地上传方式不依赖服务器网络**，最可靠
2. 如果本地也无法连接 npm 仓库，需要确保本地网络正常
3. 上传文件较大（可能 500MB+），需要等待
4. 确保本地和服务器上的 Node.js 版本一致

## 故障排除

### 上传失败
```bash
# 检查 SSH 连接
ssh root@42.121.218.14

# 检查服务器磁盘空间
df -h
```

### 服务无法启动
```bash
# 查看详细日志
pm2 logs enterprise-website --lines 100

# 检查端口占用
netstat -tuln | grep 5000

# 手动启动测试
cd /root/sifan
node_modules/next/dist/bin/next start -p 5000
```
