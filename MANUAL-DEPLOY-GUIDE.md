# 手动部署指南

## 重要提示

由于阿里云服务器无法连接任何外部 GitHub 镜像，**已禁用 GitHub Actions 自动部署**。

## 推荐部署方式：本地上传

### 一键执行（推荐）

在本地项目目录执行：

```bash
chmod +x deploy-local-upload-fixed.sh
./deploy-local-upload-fixed.sh
```

### 手动部署步骤

#### 步骤 1：本地构建

```bash
cd /path/to/sifan
pnpm install
pnpm run build
```

#### 步骤 2：打包部署文件

```bash
# 创建临时目录
mkdir -p /tmp/sifan-deploy

# 复制必要文件
cp -r .next /tmp/sifan-deploy/
cp -r node_modules /tmp/sifan-deploy/
cp -r public /tmp/sifan-deploy/ 2>/dev/null || mkdir -p /tmp/sifan-deploy/public
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
cd /tmp/sififan-deploy
tar -czf sifan-deploy.tar.gz .
```

#### 步骤 3：上传到服务器

```bash
scp /tmp/sifan-deploy/sifan-deploy.tar.gz root@42.121.218.14:/tmp/
```

#### 步骤 4：服务器端部署

SSH 到服务器：

```bash
ssh root@42.121.218.14
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

## SSL 证书安装

如果还没有安装 SSL 证书，在服务器上执行：

```bash
# 安装 certbot
yum install -y epel-release certbot python3-certbot-nginx

# 安装 nginx
yum install -y nginx

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

## 验证部署

```bash
# 检查 PM2 服务
pm2 list

# 检查端口监听
netstat -tuln | grep 5000

# 访问网站
curl http://www.zjsifan.com
curl https://www.zjsifan.com
```

## 重新启用自动部署（未来）

如果服务器网络问题解决后，可以重新启用 GitHub Actions：

1. 删除 `if: false` 行
2. 恢复正常的部署脚本
3. 推送代码触发部署

## 相关文件

- `deploy-local-upload-fixed.sh` - 本地上传自动脚本
- `EMERGENCY-DEPLOY-GUIDE.md` - 紧急部署指南
- `SSL-SETUP-GUIDE.md` - SSL 证书安装指南
