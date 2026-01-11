# 本地部署指南

## 重要提示
沙箱环境无法直接连接到阿里云服务器。请在您的**本地电脑**执行以下步骤。

---

## 前提条件

1. ✅ 已安装 Git
2. ✅ 已安装 Node.js 和 pnpm
3. ✅ 可以 SSH 连接到阿里云服务器（42.121.218.14）

---

## 部署步骤

### 步骤 1：克隆代码到本地

```bash
# 克隆仓库
git clone https://github.com/MFCR7788/sifan.git sifan
cd sifan
```

### 步骤 2：本地构建

```bash
# 安装依赖
pnpm install

# 构建项目
pnpm run build
```

### 步骤 3：打包部署文件

**Windows (PowerShell):**

```powershell
# 创建临时目录
New-Item -ItemType Directory -Force -Path C:\temp\sifan-deploy
$deployDir = "C:\temp\sifan-deploy"

# 复制文件
Copy-Item -Recurse -Force .next $deployDir\
Copy-Item -Recurse -Force node_modules $deployDir\
Copy-Item -Recurse -Force public $deployDir\
Copy-Item package.json $deployDir\

# 创建 ecosystem.config.js
@"
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
"@ | Out-File -FilePath "$deployDir\ecosystem.config.js" -Encoding utf8

# 打包（使用 7-Zip 或其他压缩工具）
# 压缩 C:\temp\sifan-deploy 目录为 sifan-deploy.tar.gz
```

**Mac/Linux:**

```bash
# 创建临时目录
mkdir -p /tmp/sifan-deploy

# 复制文件
cp -r .next node_modules public /tmp/sifan-deploy/
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

### 步骤 4：上传到服务器

**Windows (PowerShell):**

```powershell
# 上传压缩包
scp C:\temp\sifan-deploy\sifan-deploy.tar.gz root@42.121.218.14:/tmp/
```

**Mac/Linux:**

```bash
# 上传压缩包
scp /tmp/sifan-deploy/sifan-deploy.tar.gz root@42.121.218.14:/tmp/
```

### 步骤 5：服务器端部署

SSH 到服务器：

```bash
ssh root@42.121.218.14
cd /root/sifan

# 备份
mv .next .next.backup.$(date +%s) 2>/dev/null || true
mv node_modules node_modules.backup.$(date +%s) 2>/dev/null || true

# 清理并解压
find . -maxdepth 1 ! -name '.git' ! -name '.' ! -name '..' -exec rm -rf {} + 2>/dev/null || true
tar -xzf /tmp/sifan-deploy.tar.gz

# 重启服务
pm2 restart enterprise-website || pm2 start ecosystem.config.js
pm2 save

# 等待启动
sleep 3

# 检查状态
pm2 list
curl -I http://localhost:5000
```

### 步骤 6：验证部署

在浏览器访问：
- http://www.zjsifan.com

---

## 安装 SSL 证书（可选）

SSH 到服务器，执行：

```bash
# 安装 certbot 和 nginx
yum install -y epel-release certbot python3-certbot-nginx nginx

# 停止 nginx
systemctl stop nginx

# 申请证书
certbot certonly --standalone \
  -d zjsifan.com \
  -d www.zjsifan.com \
  --non-interactive \
  --agree-tos \
  --email admin@zjsifan.com

# 配置 nginx
cat > /etc/nginx/conf.d/sifan.conf << 'EOF'
server {
    listen 80;
    server_name zjsifan.com www.zjsifan.com;
    return 301 https://$server_name$request_uri;
}
server {
    listen 443 ssl http2;
    server_name zjsifan.com www.zjsifan.com;
    ssl_certificate /etc/letsencrypt/live/zjsifan.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/zjsifan.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# 重启 nginx
nginx -t && systemctl enable nginx && systemctl restart nginx

# 配置自动续期
(crontab -l 2>/dev/null | grep -v "certbot renew"; \
echo "0 3 * * * certbot renew --quiet --nginx && systemctl reload nginx") | crontab -
```

访问 https://zjsifan.com 验证 SSL 证书。

---

## 故障排除

### SSH 连接失败

```bash
# 测试连接
ssh -v root@42.121.218.14

# 检查密钥
ls -la ~/.ssh/
```

### 上传失败

```bash
# 检查服务器磁盘空间
ssh root@42.121.218.14 "df -h"

# 检查上传文件
ssh root@42.121.218.14 "ls -lh /tmp/sifan-deploy.tar.gz"
```

### 服务无法启动

```bash
# 查看日志
ssh root@42.121.218.14 "pm2 logs enterprise-website --lines 50"

# 手动测试
ssh root@42.121.218.14 "cd /root/sifan && node_modules/next/dist/bin/next start -p 5000"
```

---

## 更新代码

下次更新代码时，只需重复步骤 2-5。

---

## ⚠️ 安全提醒

**立即撤销 GitHub Token！**

您之前提供的 token 已暴露，请立即在 GitHub 设置中撤销：
1. 访问 https://github.com/settings/tokens
2. 找到并删除暴露的 token
3. 创建新的 token（如果需要）
