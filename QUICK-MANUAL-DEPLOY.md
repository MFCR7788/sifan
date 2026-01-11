# 快速手动部署指南

## 当前状态
✅ GitHub Actions 自动部署已禁用
✅ 需要使用本地上传方式

## 立即执行

### 步骤 1：本地构建

```bash
cd /path/to/sifan
pnpm install
pnpm run build
```

### 步骤 2：打包文件

```bash
# 创建临时目录
mkdir -p /tmp/sifan-deploy

# 复制必要文件
cp -r .next /tmp/sifan-deploy/
cp -r node_modules /tmp/sifan-deploy/
cp -r public /tmp/sifan-deploy/ 2>/dev/null || mkdir -p /tmp/sifan-deploy/public
cp package.json /tmp/sifan-deploy/

# 创建 PM2 配置
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
scp /tmp/sifan-deploy/sifan-deploy.tar.gz root@42.121.218.14:/tmp/
```

### 步骤 4：服务器端部署

SSH 到服务器：

```bash
ssh root@42.121.218.14
cd /root/sifan

# 备份
mv .next .next.backup.$(date +%s)
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

### 步骤 5：验证部署

```bash
# 在本地浏览器访问
http://www.zjsifan.com
```

## SSL 证书安装（可选）

如果需要 HTTPS，在服务器上执行：

```bash
# 安装 certbot 和 nginx
yum install -y epel-release certbot python3-certbot-nginx nginx

# 申请证书
certbot certonly --standalone -d zjsifan.com -d www.zjsifan.com --non-interactive --agree-tos --email admin@zjsifan.com

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
systemctl enable nginx
systemctl restart nginx

# 配置自动续期
(crontab -l 2>/dev/null | grep -v "certbot renew"; echo "0 3 * * * certbot renew --quiet --nginx && systemctl reload nginx") | crontab -
```

## 故障排除

### SCP 上传失败
```bash
# 测试 SSH 连接
ssh root@42.121.218.14 "echo 'Connection OK'"

# 检查服务器磁盘空间
ssh root@42.121.218.14 "df -h"
```

### 服务无法启动
```bash
# 查看日志
ssh root@42.121.218.14 "pm2 logs enterprise-website --lines 50"

# 手动测试
ssh root@42.121.218.14 "cd /root/sifan && node_modules/next/dist/bin/next start -p 5000"
```

### 端口冲突
```bash
# 检查端口占用
ssh root@42.121.218.14 "netstat -tuln | grep 5000"

# 停止旧进程
ssh root@42.121.218.14 "pm2 stop all && pm2 delete all"
```

## 重要提醒

✅ 不要等待 GitHub Actions 自动部署
✅ 直接使用本地上传方式
✅ 服务器无法连接 GitHub，这是正常现象
✅ 本地上传方式不依赖服务器网络
