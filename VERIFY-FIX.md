# 服务已启动，请验证修复结果

## 当前状态

✅ PM2 服务已启动并运行正常
✅ Next.js 已在 localhost:3000 启动成功

```
✓ Starting...
✓ Ready in 477ms
```

---

## 验证步骤

### 1. 在服务器上测试

SSH 登录到服务器后，执行：

```bash
# 测试首页（应该返回 200 OK）
curl -I http://localhost:3000

# 测试数据库连接 API
curl http://localhost:3000/api/user/me

# 如果返回 {"error":"未登录"}，说明数据库连接正常
# 如果返回 "Database URL not configured"，说明环境变量未生效
```

### 2. 在浏览器中测试

访问：**https://www.zjsifan.com**

检查：
- [ ] 首页是否能正常打开
- [ ] 是否还有 "Database URL not configured" 错误
- [ ] 定制方案页面（/configurator）是否能正常访问

---

## 如果问题仍然存在

### 可能的原因

1. **端口不匹配**：Next.js 启动在 3000 端口，但 Nginx 可能配置为代理到 5000 端口

### 解决方案 A：检查 Nginx 配置

```bash
# 查看 Nginx 配置
cat /etc/nginx/conf.d/*.conf | grep -A 5 "proxy_pass"

# 或者查看主配置文件
cat /etc/nginx/nginx.conf | grep -A 10 "zjsifan.com"
```

如果 Nginx 配置的是 `proxy_pass http://localhost:5000;`，需要改为 `http://localhost:3000;`

### 解决方案 B：修改 ecosystem.config.js 让 Next.js 启动在 5000 端口

```bash
cd /root/sifan

cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'enterprise-website',
    script: 'npm',
    args: 'start -- -p 5000',
    cwd: '/root/sifan',
    env: {
      NODE_ENV: 'production',
      PGDATABASE_URL: 'postgresql://user_7591422450290704422:aef1a966-5890-4e13-a499-e5a8b0e8b0b4@cp-cute-mist-247e1363.pg2.aidap-global.cn-beijing.volces.com:5432/Database_1767516520571?sslmode=require&channel_binding=require',
      PGDATABASE: 'Database_1767516520571',
      DATABASE_URL: 'postgresql://user_7591422450290704422:aef1a966-5890-4e13-a499-e5a8b0e8b4@cp-cute-mist-247e1363.pg2.aidap-global.cn-beijing.volces.com:5432/Database_1767516520571?sslmode=require&channel_binding=require'
    },
    instances: 1,
    autorestart: true
  }]
};
EOF

pm2 restart enterprise-website
pm2 save
```

注意 `args: 'start -- -p 5000'` 这一行，指定了 5000 端口。

---

## 快速诊断命令

```bash
# 1. 检查哪些端口在监听
netstat -tuln | grep -E "3000|5000"

# 2. 测试本地 3000 端口
curl -I http://localhost:3000

# 3. 测试本地 5000 端口
curl -I http://localhost:5000

# 4. 查看 PM2 详细日志
pm2 logs enterprise-website --lines 50

# 5. 查看环境变量
pm2 env 3
```

---

## 请反馈测试结果

执行以上验证后，请告诉我：

1. ✅ 或 ❌ 首页 www.zjsifan.com 能否正常打开？
2. ✅ 或 ❌ 是否还显示 "Database URL not configured" 错误？
3. ✅ 或 ❌ 定制方案功能能否正常提交订单？

我会根据反馈进一步调整配置。
