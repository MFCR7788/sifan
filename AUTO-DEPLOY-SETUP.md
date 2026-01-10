# GitHub 到阿里云自动同步配置指南

## 当前状态分析

### ✅ 已配置的组件

1. **Webhook 服务器**
   - 文件：`webhook-server.js`
   - PM2 进程名：`webhook-server`
   - 运行端口：3001
   - Webhook 密钥：`sifan-webhook-secret-2026`

2. **自动部署脚本**
   - 文件：`auto-deploy.sh`
   - 路径：`/root/sifan/auto-deploy.sh`
   - 功能：
     - 从 GitHub 拉取最新代码
     - 检查并更新 Nginx 配置
     - 重新安装依赖（如果需要）
     - 重启 PM2 应用

3. **PM2 配置**
   - `ecosystem-webhook.config.js` - Webhook 服务器配置
   - `ecosystem.config.js` - 网站应用配置

### ❌ 缺失的配置

**GitHub Webhook 未配置**：需要在 GitHub 仓库中添加 webhook URL，才能触发自动部署。

---

## 激活自动同步的步骤

### 步骤 1：在服务器上启动 Webhook 服务器

登录到阿里云服务器，执行：

```bash
# 切换到项目目录（注意：这里是 /root/sifan，不是 /workspace/projects）
cd /root/sifan

# 启动 webhook 服务器
pm2 start ecosystem-webhook.config.js

# 查看 webhook 服务器状态
pm2 status
pm2 logs webhook-server
```

### 步骤 2：在 GitHub 仓库中配置 Webhook

1. 登录 [GitHub](https://github.com/MFCR7788/sifan/settings/hooks)
2. 进入仓库设置：**Settings** → **Webhooks**
3. 点击 **Add webhook**
4. 填写以下信息：

   **Payload URL：**
   ```
   http://42.121.218.14:3001/webhook
   ```

   **Content type：**
   ```
   application/json
   ```

   **Secret：**
   ```
   sifan-webhook-secret-2026
   ```

5. 配置事件触发：
   - 选择 **Just the push event**
   - 或者选择 **Send me everything**

6. 点击 **Add webhook**

### 步骤 3：验证 Webhook 配置

1. 在 GitHub Webhook 页面，点击刚创建的 webhook
2. 查看最近的 deliveries，点击最新的交付记录
3. 确认状态为 **200 OK** 或 **204 No Content**

### 步骤 4：测试自动同步

1. 在本地修改代码并推送到 GitHub：
   ```bash
   git add .
   git commit -m "test: 测试自动部署"
   git push origin main
   ```

2. 登录服务器查看日志：
   ```bash
   pm2 logs webhook-server
   ```

3. 查看部署日志：
   ```bash
   tail -f /root/sifan/logs/webhook-out.log
   ```

4. 访问网站验证：
   ```bash
   curl -I http://localhost:3000
   ```

---

## 自动同步的工作流程

```
GitHub 代码推送
    ↓
GitHub Webhook 触发
    ↓
HTTP 请求发送到 42.121.218.14:3001/webhook
    ↓
webhook-server.js 验证签名
    ↓
执行 /root/sifan/auto-deploy.sh
    ↓
    ├─ 拉取最新代码
    ├─ 检查 Nginx 配置变更
    ├─ 重新安装依赖（如果需要）
    └─ 重启 enterprise-website PM2 应用
    ↓
网站自动更新 ✅
```

---

## 常见问题排查

### 问题 1：Webhook 服务器未运行

**检查方法：**
```bash
pm2 list
pm2 logs webhook-server
```

**解决方法：**
```bash
cd /root/sifan
pm2 start ecosystem-webhook.config.js
pm2 save
pm2 startup
```

### 问题 2：GitHub Webhook 连接失败

**原因：** 服务器防火墙阻止了 3001 端口

**解决方法：**
```bash
# 开放 3001 端口
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --reload

# 或者使用 iptables
sudo iptables -I INPUT -p tcp --dport 3001 -j ACCEPT
sudo service iptables save
```

### 问题 3：自动部署失败

**查看日志：**
```bash
# Webhook 服务器日志
pm2 logs webhook-server

# 部署脚本日志
tail -f /root/sifan/logs/webhook-out.log
tail -f /root/sifan/logs/webhook-error.log

# PM2 应用日志
pm2 logs enterprise-website
```

### 问题 4：部署后网站无法访问

**检查方法：**
```bash
# 检查 PM2 应用状态
pm2 status

# 检查端口监听
netstat -tuln | grep 3000

# 检查 Nginx 配置
sudo nginx -t
sudo systemctl status nginx
```

---

## 高级配置

### 修改 Webhook 密钥

1. 编辑 `ecosystem-webhook.config.js`：
   ```javascript
   env: {
     WEBHOOK_SECRET: 'your-new-secret-key'
   }
   ```

2. 重启 webhook 服务器：
   ```bash
   pm2 restart webhook-server
   ```

3. 在 GitHub 中更新 webhook 的 Secret

### 自定义部署脚本

编辑 `/root/sifan/auto-deploy.sh`，添加自定义部署逻辑：

```bash
#!/bin/bash

# 原有逻辑...

# 添加自定义命令
echo "执行自定义部署命令..."
npm run test
npm run build
# 其他命令...

# 重启应用
pm2 restart enterprise-website
```

### 使用不同的项目路径

如果项目路径不是 `/root/sifan`，需要修改：

1. `auto-deploy.sh` 中的 `PROJECT_DIR` 变量
2. `ecosystem-webhook.config.js` 中的 `cwd` 路径
3. GitHub Webhook 中的服务器 IP 地址

---

## 监控和日志

### 实时监控部署

```bash
# 监控 webhook 服务器
pm2 monit

# 实时查看日志
tail -f /root/sifan/logs/webhook-out.log
```

### 部署历史记录

```bash
# 查看 Git 提交历史
cd /root/sifan
git log --oneline --graph --all
```

---

## 安全建议

1. **使用 HTTPS**：建议使用反向代理为 webhook 服务器提供 HTTPS 支持
2. **限制访问 IP**：在 Nginx 中限制只有 GitHub 的 IP 可以访问 webhook
3. **定期更换密钥**：定期更新 webhook secret
4. **备份配置**：定期备份 PM2 配置和部署脚本

---

## 总结

### 当前状态
- ✅ Webhook 服务器代码已配置
- ✅ 自动部署脚本已配置
- ✅ PM2 配置文件已准备
- ❌ GitHub Webhook 未配置

### 需要完成的步骤
1. 在服务器上启动 webhook 服务器
2. 在 GitHub 仓库中添加 webhook
3. 测试自动部署功能

### 预期效果
完成配置后，每次推送到 GitHub 的 main 分支时：
- ✅ 自动拉取最新代码
- ✅ 自动重新安装依赖（如果需要）
- ✅ 自动重启应用
- ✅ 网站自动更新

---

## 联系支持

如果遇到问题，请提供：
1. PM2 日志：`pm2 logs webhook-server --lines 50`
2. Webhook 日志：`tail -100 /root/sifan/logs/webhook-out.log`
3. GitHub Webhook 的交付记录截图
