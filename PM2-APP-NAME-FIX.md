# PM2 应用名称错误修复

## 问题现象

GitHub Actions 部署时出现错误：
```
Error: PM2][ERROR] Process or Namespace sifan not found
```

## 问题原因

部署脚本中使用的 PM2 应用名称是 `sifan`，但 `ecosystem.config.js` 中实际配置的应用名称是 `enterprise-website`。

### 部署脚本（错误）
```bash
pm2 restart sifan
```

### ecosystem.config.js（正确）
```javascript
module.exports = {
  apps: [{
    name: 'enterprise-website',  // ← 实际应用名称
    script: 'node_modules/next/dist/bin/next',
    // ...
  }]
};
```

**结果**：PM2 找不到名为 `sifan` 的进程，导致部署失败。

---

## 已实施的修复

### 更新部署脚本

修改了 `.github/workflows/deploy-build-and-upload.yml`：

```bash
# 修复前
pm2 restart sifan

# 修复后
if pm2 describe enterprise-website > /dev/null 2>&1; then
    pm2 restart enterprise-website
    echo "✓ 服务已重启"
else
    echo "服务不存在，正在启动..."
    pm2 start ecosystem.config.js
    echo "✓ 服务已启动"
fi

# 保存 PM2 配置
pm2 save
```

### 改进内容

1. ✓ 使用正确的应用名称 `enterprise-website`
2. ✓ 检查进程是否存在（避免不存在的进程错误）
3. ✓ 如果不存在则启动新进程
4. ✓ 添加 `pm2 save` 保存配置

---

## PM2 相关命令

### 查看所有应用
```bash
pm2 list
```

### 查看应用详情
```bash
pm2 describe enterprise-website
```

### 启动应用
```bash
pm2 start ecosystem.config.js
```

### 重启应用
```bash
pm2 restart enterprise-website
```

### 停止应用
```bash
pm2 stop enterprise-website
```

### 删除应用
```bash
pm2 delete enterprise-website
```

### 查看日志
```bash
pm2 logs enterprise-website
pm2 logs enterprise-website --lines 50
```

### 查看监控信息
```bash
pm2 monit
```

---

## 生态系统配置文件

### ecosystem.config.js

```javascript
module.exports = {
  apps: [{
    name: 'enterprise-website',        // 应用名称
    script: 'node_modules/next/dist/bin/next',
    args: 'start -p 5000',
    cwd: '/root/sifan',                 // 工作目录
    instances: 2,                       // 实例数量
    exec_mode: 'cluster',               // 集群模式
    autorestart: true,                  // 自动重启
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
      PGDATABASE_URL: 'postgresql://...',  // 数据库连接
      PGDATABASE: 'Database_1767516520571'
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
    merge_logs: true,
    min_uptime: '10s',
    max_restarts: 10,
    kill_timeout: 5000,
    wait_ready: true,
    listen_timeout: 10000,
    health_check_grace_period: 1000
  }]
};
```

### 配置说明

| 配置项 | 值 | 说明 |
|-------|---|------|
| name | enterprise-website | 应用名称（PM2 识别和管理的唯一标识） |
| script | node_modules/next/dist/bin/next | 启动脚本 |
| args | start -p 5000 | 启动参数 |
| cwd | /root/sifan | 工作目录 |
| instances | 2 | 运行实例数 |
| exec_mode | cluster | 执行模式（cluster/fork） |
| autorestart | true | 自动重启 |
| PORT | 5000 | 应用端口 |

---

## 验证修复

### 在服务器上验证

```bash
# 1. 查看 PM2 应用列表
pm2 list

# 2. 检查应用状态
pm2 describe enterprise-website

# 3. 查看应用日志
pm2 logs enterprise-website --lines 20

# 4. 检查端口监听
curl -I http://localhost:5000
```

### 预期输出

```bash
$ pm2 list
┌─────┬────────────────────┬───────────┬──────────┬──────────┐
│ id  │ name               │ mode      │ status   │ cpu      │
├─────┼────────────────────┼───────────┼──────────┼──────────┤
│ 0   │ enterprise-website │ cluster   │ online   │ 0%       │
│ 1   │ enterprise-website │ cluster   │ online   │ 0%       │
└─────┴────────────────────┴───────────┴──────────┴──────────┘
```

---

## 本地手动部署

如果 GitHub Actions 仍然失败，可以手动在服务器上部署：

```bash
# 1. SSH 到服务器
ssh root@your-server

# 2. 进入项目目录
cd /root/sifan

# 3. 备份当前构建
if [ -d ".next" ]; then
    mv .next .next.backup.$(date +%Y%m%d_%H%M%S)
fi

# 4. 本地构建（或者上传 build-package.tar.gz）
# 如果上传了构建包：
mkdir -p .next
tar -xzf build-package.tar.gz -C .next

# 或者直接在服务器上构建：
# pnpm install
# pnpm run build

# 5. 重启服务
pm2 restart enterprise-website

# 6. 保存 PM2 配置
pm2 save

# 7. 检查服务状态
pm2 status
pm2 logs enterprise-website --lines 20
```

---

## 相关文档

- `LOCAL-DEPLOY-INSTRUCTIONS.md` - 本地上传部署指南
- `MANUAL-DEPLOY-GUIDE.md` - 手动部署指南
- `GITHUB-WORKFLOW-DUPLICATE-EXPLAINED.md` - 工作流重复执行问题
- `DEPLOY-FAILED-SOLUTION.md` - 部署失败解决方案

---

## 总结

**关键问题**：PM2 应用名称配置不一致

**修复方案**：
1. ✓ 更新部署脚本，使用正确的应用名称 `enterprise-website`
2. ✓ 添加进程存在性检查
3. ✓ 添加 `pm2 save` 保存配置

**重要提醒**：
- PM2 应用名称必须与 `ecosystem.config.js` 中的 `name` 配置一致
- 使用 `pm2 list` 查看所有运行中的应用
- 使用 `pm2 describe <app-name>` 查看应用详情

---

## 下一步

观察 GitHub Actions 运行结果：

访问：https://github.com/MFCR7788/sifan/actions

如果这次运行成功，说明问题已解决。
如果仍然失败，请查看错误信息并参考相关文档。
