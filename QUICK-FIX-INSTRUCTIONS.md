# 紧急修复：生产环境数据库连接问题

## 问题
www.zjsifan.com 仍然显示：
```
Database URL not configured. Set PGDATABASE_URLenvironment variable.
Did you create a database? You can create one via the CozeCoding platform.
```

## 解决方案（3 种方式，任选其一）

---

## 方式一：直接在服务器执行命令（最快）⚡

SSH 登录到服务器后，**复制粘贴**以下命令：

```bash
# 1. 进入项目目录
cd /root/sifan

# 2. 创建 ecosystem.config.js
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
    autorestart: true
  }]
};
EOF

# 3. 停止并删除现有服务
pm2 stop enterprise-website
pm2 delete enterprise-website

# 4. 启动新服务
pm2 start ecosystem.config.js

# 5. 保存 PM2 配置
pm2 save

# 6. 验证服务状态
pm2 list

# 7. 测试数据库连接
curl http://localhost:5000/api/user/me
```

---

## 方式二：通过 SCP 上传脚本后执行

在**本地沙箱**执行：

```bash
# 上传修复脚本到服务器
scp fix-db-connection.sh root@42.121.218.14:/tmp/

# 然后在服务器上执行
ssh root@42.121.218.14 "chmod +x /tmp/fix-db-connection.sh && /tmp/fix-db-connection.sh"
```

---

## 方式三：使用本地上传部署脚本（包含最新代码）

在**本地沙箱**执行：

```bash
chmod +x deploy-local-upload.sh
./deploy-local-upload.sh
```

这个脚本会：
- 本地构建项目
- 上传到服务器
- 自动配置环境变量
- 部署并重启服务

---

## 验证修复

执行完上述任一方案后，在服务器上验证：

```bash
# 查看服务状态
pm2 list

# 查看日志（确认没有数据库错误）
pm2 logs enterprise-website --lines 50

# 测试首页
curl -I http://localhost:5000

# 测试数据库 API
curl http://localhost:5000/api/user/me
```

然后访问 https://www.zjsifan.com 查看是否正常。

---

## 如果仍然失败

执行以下命令收集错误信息：

```bash
# 1. 查看 PM2 日志
pm2 logs enterprise-website --lines 100

# 2. 查看 Nginx 日志
tail -100 /var/log/nginx/error.log

# 3. 检查环境变量是否正确设置
pm2 env 0 | grep PGDATABASE

# 4. 检查端口是否监听
netstat -tuln | grep 5000

# 5. 检查进程是否运行
ps aux | grep "next start"
```

将输出发送给我，我会进一步分析。

---

## 推荐：方式一（直接执行命令）

最快、最可靠的方式，无需文件传输，直接在服务器上执行即可。
