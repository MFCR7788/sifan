# Nginx域名访问部署指南

## 问题诊断

当前情况：
- ✅ 通过 `http://42.121.218.14:3000` 可以正常访问
- ❌ 通过 `http://www.zjsifan.com` 无法访问（ERR_CONNECTION_CLOSED）

## 根本原因

Nginx配置文件中的 `server_name` 只配置了IP地址，没有包含域名：
```nginx
server_name 42.121.218.14;  # ❌ 缺少域名
```

## 修复方案

已更新 `nginx.conf` 文件，添加域名支持：
```nginx
server_name 42.121.218.14 www.zjsifan.com zjsifan.com;  # ✅ 包含所有域名
```

## 部署步骤

### 1. 给脚本添加执行权限
```bash
chmod +x deploy-nginx-config.sh
chmod +x check-deployment.sh
```

### 2. 部署Nginx配置
```bash
./deploy-nginx-config.sh
```

该脚本会：
- 备份现有配置
- 上传新的nginx.conf到服务器
- 更新站点配置
- 测试配置语法
- 重启Nginx服务

### 3. 验证部署
```bash
./check-deployment.sh
```

该脚本会检查：
- Nginx服务状态
- PM2应用状态
- 端口监听情况
- 本地访问测试
- 配置是否正确
- 错误日志
- 防火墙规则

## 如果部署后仍然无法访问

### DNS检查
```bash
# 检查域名解析
nslookup www.zjsifan.com
ping www.zjsifan.com
```

应该返回 `42.121.218.14`

### 安全组检查（阿里云）
登录阿里云控制台，检查安全组规则：
1. 进入 ECS 实例管理
2. 点击"安全组"
3. 检查入方向规则是否允许：
   - 协议类型：TCP
   - 端口：80/80
   - 授权对象：0.0.0.0/0

### 服务器防火墙检查
```bash
# 检查firewalld状态
ssh root@42.121.218.14 "sudo firewall-cmd --state"

# 如果firewalld开启，添加80端口
ssh root@42.121.218.14 "sudo firewall-cmd --permanent --add-service=http"
ssh root@42.121.218.14 "sudo firewall-cmd --reload"

# 检查iptables
ssh root@42.121.218.14 "sudo iptables -L -n | grep 80"
```

### 查看详细日志
```bash
# 访问日志
ssh root@42.121.218.14 "sudo tail -f /var/log/nginx/enterprise-website-access.log"

# 错误日志
ssh root@42.121.218.14 "sudo tail -f /var/log/nginx/enterprise-website-error.log"

# PM2日志
ssh root@42.121.218.14 "pm2 logs enterprise-website"
```

## 手动部署步骤（如果脚本失败）

如果自动脚本无法使用，可以手动执行：

```bash
# 1. 备份现有配置
ssh root@42.121.218.14 "sudo cp /etc/nginx/sites-available/enterprise-website /etc/nginx/sites-available/enterprise-website.backup"

# 2. 上传配置文件
scp nginx.conf root@42.121.218.14:/tmp/nginx.conf

# 3. 移动到正确位置
ssh root@42.121.218.14 "sudo mv /tmp/nginx.conf /etc/nginx/sites-available/enterprise-website"

# 4. 确保软链接存在
ssh root@42.121.218.14 "sudo ln -sf /etc/nginx/sites-available/enterprise-website /etc/nginx/sites-enabled/enterprise-website"

# 5. 测试配置
ssh root@42.121.218.14 "sudo nginx -t"

# 6. 重启Nginx
ssh root@42.121.218.14 "sudo systemctl reload nginx"
```

## 访问方式

部署成功后，以下方式都应该可以访问：
- http://42.121.218.14
- http://www.zjsifan.com
- http://zjsifan.com

## 常见问题

### Q: ERR_CONNECTION_CLOSED
A: 检查防火墙、安全组、DNS解析

### Q: 403 Forbidden
A: 检查Nginx配置和文件权限

### Q: 502 Bad Gateway
A: 检查Next.js应用是否正常运行（pm2 status）

### Q: 404 Not Found
A: 检查Nginx配置文件路径和软链接

## 下一步优化

### 启用HTTPS（可选）
1. 安装Certbot: `sudo apt install certbot python3-certbot-nginx`
2. 获取证书: `sudo certbot --nginx -d www.zjsifan.com -d zjsifan.com`
3. 自动续期: `sudo certbot renew --dry-run`

### 配置CDN（可选）
可以在阿里云CDN中配置：
- 源站IP: 42.121.218.14
- 端口: 80
- 加速域名: www.zjsifan.com
