# 快速部署指南

## 一键部署

```bash
# 1. 进入项目目录
cd /workspace/projects

# 2. 配置环境变量（首次部署必须）
vim .env.production
# 修改以下配置：
# - DATABASE_URL（必填）
# - JWT_SECRET（必填，建议生成随机字符串）

# 3. 执行部署脚本
./deploy.sh
```

## 快速命令

```bash
# 查看应用状态
pm2 status

# 查看日志
pm2 logs enterprise-website

# 重启应用
pm2 restart enterprise-website

# 停止应用
pm2 stop enterprise-website

# 启动应用
pm2 start ecosystem.config.js --env production

# 重新部署
./deploy.sh

# 查看Nginx日志
tail -f /var/log/nginx/enterprise-website-access.log
tail -f /var/log/nginx/enterprise-website-error.log
```

## 访问地址

- **HTTP**: http://42.121.218.14
- **本地测试**: http://localhost:3000

## 重要文件

- `.env.production` - 环境变量配置（首次部署前必须配置）
- `ecosystem.config.js` - PM2配置
- `nginx.conf` - Nginx配置
- `deploy.sh` - 部署脚本
- `DEPLOYMENT.md` - 完整部署文档

## 故障排查

```bash
# 应用不响应
pm2 logs enterprise-website --lines 100

# Nginx 502错误
pm2 status  # 检查应用是否运行
sudo nginx -t  # 检查Nginx配置

# 数据库连接失败
检查 .env.production 中的 DATABASE_URL 配置
```

## 联系信息

- 服务器IP: 42.121.218.14
- 应用端口: 3000
- 项目目录: /workspace/projects
