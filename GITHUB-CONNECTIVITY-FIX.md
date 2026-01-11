# GitHub 连接失败解决方案

## 问题

在服务器（42.121.218.14）上执行部署时出现错误：
```
error: RPC failed; curl 7 Failed to connect to github.com port 443: Connection timed out
fatal: expected flush after ref listing
```

## 原因

服务器无法访问 GitHub（可能是网络防火墙或 DNS 问题）。

---

## 解决方案（按推荐顺序）

### 方案一：使用本地构建 + 上传部署（推荐）

使用新创建的 `deploy-local-upload.sh` 脚本：

```bash
# 在本地沙箱执行
chmod +x deploy-local-upload.sh
./deploy-local-upload.sh
```

**优点**：
- 不依赖服务器访问 GitHub
- 本地构建速度快
- 包含完整的环境变量配置

---

### 方案二：配置 Git 使用镜像源

在服务器上执行：

```bash
# 方案 A：使用 Gitee 镜像（国内）
git config --global url."https://gitee.com/mirrors/".insteadOf "https://github.com/"

# 方案 B：使用 GitHub 镜像代理
git config --global url."https://ghproxy.com/https://github.com/".insteadOf "https://github.com/"

# 测试连接
git ls-remote https://github.com/MFCR7788/sifan.git
```

然后重新执行部署命令：

```bash
cd /root/sifan
git fetch origin main
git reset --hard origin/main
```

---

### 方案三：配置代理

如果服务器有代理服务：

```bash
# 设置 Git 使用代理
git config --global http.proxy http://proxy-server:port
git config --global https.proxy http://proxy-server:port

# 或者设置环境变量
export HTTP_PROXY=http://proxy-server:port
export HTTPS_PROXY=http://proxy-server:port

# 测试
git ls-remote https://github.com/MFCR7788/sifan.git
```

---

### 方案四：从本地上传代码到服务器

如果以上方案都不可行，可以手动同步：

```bash
# 1. 在本地打包代码
tar -czf sifan-code.tar.gz \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=.git \
  .

# 2. 上传到服务器
scp sifan-code.tar.gz root@42.121.218.14:/tmp/

# 3. 在服务器上解压并构建
ssh root@42.121.218.14
cd /root/sifan
tar -xzf /tmp/sifan-code.tar.gz -C /root/sifan --strip-components=1
rm /tmp/sifan-code.tar.gz
pnpm install
pnpm run build
pm2 restart enterprise-website
```

---

### 方案五：配置 DNS（临时解决方案）

可能是 DNS 解析问题：

```bash
# 1. 备份 DNS 配置
cp /etc/resolv.conf /etc/resolv.conf.backup

# 2. 使用公共 DNS
cat > /etc/resolv.conf << EOF
nameserver 8.8.8.8
nameserver 8.8.4.4
nameserver 114.114.114.114
EOF

# 3. 测试 GitHub 连接
ping github.com
curl -I https://github.com

# 4. 如果成功，重新执行部署
cd /root/sifan
git fetch origin main
git reset --hard origin/main
```

---

## 临时应急方案（快速恢复服务）

如果需要快速恢复网站，可以直接在服务器上手动设置环境变量并重启服务：

```bash
# 1. 设置环境变量
export PGDATABASE_URL="postgresql://user_7591422450290704422:aef1a966-5890-4e13-a499-e5a8b0e8b0b4@cp-cute-mist-247e1363.pg2.aidap-global.cn-beijing.volces.com:5432/Database_1767516520571?sslmode=require&channel_binding=require"
export PGDATABASE="Database_1767516520571"
export DATABASE_URL="postgresql://user_7591422450290704422:aef1a966-5890-4e13-a499-e5a8b0e8b0b4@cp-cute-mist-247e1363.pg2.aidap-global.cn-beijing.volces.com:5432/Database_1767516520571?sslmode=require&channel_binding=require"

# 2. 使用 ecosystem.config.js 启动
cd /root/sifan

# 创建配置文件
cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'enterprise-website',
    script: 'npm',
    args: 'start',
    cwd: '/root/sifan',
    env: {
      NODE_ENV: 'production',
      PGDATABASE_URL: 'postgresql://user_7591422450290704422:aef1a966-5890-4e13-a499-e5a8b0e8b0b4@cp-cute-mist-247e1363.pg2.aidap-global.cn-beijing.volces.com:5432/Database_1767516520571?sslmode=require&channel_binding=require',
      PGDATABASE: 'Database_1767516520571',
      DATABASE_URL: 'postgresql://user_7591422450290704422:aef1a966-5890-4e13-a499-e5a8b0e8b0b4@cp-cute-mist-247e1363.pg2.aidap-global.cn-beijing.volces.com:5432/Database_1767516520571?sslmode=require&channel_binding=require'
    },
    instances: 1,
    autorestart: true,
    error_file: '/root/sifan/logs/err.log',
    out_file: '/root/sifan/logs/out.log'
  }]
};
EOF

# 3. 重启服务
pm2 delete enterprise-website
pm2 start ecosystem.config.js
pm2 save

# 4. 验证服务
pm2 logs enterprise-website --lines 20
curl -I http://localhost:5000
```

---

## 验证 GitHub 连接

在服务器上执行以下命令测试网络连接：

```bash
# 测试 DNS 解析
nslookup github.com
dig github.com

# 测试 HTTP 连接
curl -I https://github.com
curl -I https://api.github.com

# 测试 Git 连接
git ls-remote https://github.com/MFCR7788/sifan.git
```

---

## 永久解决方案

建议配置服务器网络：

1. **添加 GitHub IP 到防火墙白名单**
2. **配置 DNS 使用可靠的 DNS 服务器**
3. **如果在中国大陆，使用国内的 Git 托管服务或镜像**

---

## 文件说明

- `deploy-local-upload.sh` - 本地构建 + 上传部署脚本（推荐使用）
- `GITHUB-CONNECTIVITY-FIX.md` - 本文档，包含各种解决方案
- `deploy-to-production.sh` - 原始的基于 Git 的部署脚本（需要 GitHub 连接）

---

## 快速操作建议

**最简单、最可靠的方式**：直接使用 `deploy-local-upload.sh`

```bash
chmod +x deploy-local-upload.sh
./deploy-local-upload.sh
```

这个脚本会：
1. 本地构建项目
2. 打包所有必要文件
3. 上传到服务器
4. 自动部署并重启服务
5. 验证部署结果
