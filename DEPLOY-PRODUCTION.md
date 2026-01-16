# 生产环境部署指南

## 快速部署（自动部署）

### 1. 提交代码
```bash
git add .
git commit -m "fix: 修复 Coze API 调用问题，使用 SDK 而非直接调用 REST API"
git push origin main
```

### 2. 查看部署状态
访问 GitHub Actions 页面查看部署进度：
https://github.com/MFCR7788/sifan/actions

### 3. 验证部署
```bash
# SSH 登录服务器
ssh root@your-server

# 测试 API
curl -X POST https://www.zjsifan.com/api/test/coze \
  -H "Content-Type: application/json" \
  -d '{}'
```

预期返回：
```json
{
  "success": true,
  "result": "测试成功",
  "apiKeyPrefix": "sat_Gv5...",
  "message": "SDK 调用成功"
}
```

---

## 手动部署（如果自动部署失败）

### 步骤 1: SSH 登录服务器
```bash
ssh root@iZbp1iylcenpqgx9u0t6mpZ
```

### 步骤 2: 备份当前版本（可选但推荐）
```bash
cd /root/sifan
pm2 stop enterprise-website
git branch backup-$(date +%Y%m%d-%H%M%S)
git checkout backup-*
git checkout main
```

### 步骤 3: 拉取最新代码
```bash
cd /root/sifan
git pull origin main
```

### 步骤 4: 安装依赖
```bash
pnpm install
```

### 步骤 5: 构建项目
```bash
pnpm run build
```

### 步骤 6: 重启服务
```bash
pm2 restart enterprise-website
```

### 步骤 7: 查看日志
```bash
pm2 logs enterprise-website --lines 100
```

### 步骤 8: 验证服务
```bash
# 检查 PM2 状态
pm2 status

# 检查端口
ss -tuln | grep :5000

# 测试健康检查
curl -I https://www.zjsifan.com

# 测试 API
curl -X POST https://www.zjsifan.com/api/test/coze \
  -H "Content-Type: application/json" \
  -d '{}'
```

---

## 验证清单

### 基础功能
- [ ] 网站首页可以正常访问
- [ ] PM2 进程正常运行（`pm2 status` 显示 `online`）
- [ ] 端口 5000 正常监听（`ss -tuln | grep :5000`）

### AI 功能
- [ ] **AI 文案生成**正常工作
  ```bash
  curl -X POST https://www.zjsifan.com/api/tool/ai-copywriting \
    -H "Content-Type: application/json" \
    -d '{
      "text": "测试内容",
      "platform": "抖音",
      "type": "产品介绍",
      "wordCount": "100-200",
      "count": 1,
      "model": "doubao-seed-1-6-251015"
    }'
  ```

- [ ] **AI 图像生成**正常工作
  ```bash
  curl -X POST https://www.zjsifan.com/api/tool/ai-image-generation \
    -H "Content-Type: application/json" \
    -d '{
      "themeContent": "科技感未来城市",
      "style": "科技风格",
      "detailRequirement": "",
      "quality": "4K",
      "lighting": "蓝色晨曦",
      "ratio": "16:9"
    }'
  ```

- [ ] **封面图制作**正常工作
  ```bash
  curl -X POST https://www.zjsifan.com/api/tool/cover-generator \
    -H "Content-Type: application/json" \
    -d '{
      "text": "科技感未来城市",
      "platform": "抖音",
      "style": "科技",
      "ratio": "9:16"
    }'
  ```

- [ ] **智能客服**正常工作（前端测试）
- [ ] **知识库文档解析**正常工作（后台管理测试）

### 环境配置
- [ ] 环境变量 `COZE_WORKLOAD_IDENTITY_API_KEY` 已配置
- [ ] 环境变量 `COZE_BUCKET_ENDPOINT_URL` 已配置
- [ ] 环境变量 `COZE_BUCKET_NAME` 已配置

---

## 故障排查

### 问题 1: PM2 启动失败
```bash
# 查看错误日志
pm2 logs enterprise-website --err --lines 50

# 检查配置文件
cat ecosystem.config.js

# 检查环境变量
cat .env.production
```

### 问题 2: 端口被占用
```bash
# 查看占用 5000 端口的进程
ss -lptn 'sport = :5000'

# 杀死进程
pm2 stop enterprise-website
pm2 delete enterprise-website
pm2 start ecosystem.config.js --env production
```

### 问题 3: API 调用失败（404/401/500）
```bash
# 查看日志
pm2 logs enterprise-website --lines 100

# 检查环境变量
echo $COZE_WORKLOAD_IDENTITY_API_KEY

# 测试环境变量 API
curl https://www.zjsifan.com/api/test/env
```

### 问题 4: 构建失败
```bash
# 清理构建缓存
rm -rf .next
pnpm run build

# 如果依然失败，检查依赖
rm -rf node_modules
pnpm install
pnpm run build
```

---

## 回滚方案

如果部署后出现问题，可以快速回滚到之前的版本：

```bash
# 1. 查看提交历史
cd /root/sifan
git log --oneline -10

# 2. 回滚到上一个稳定版本
git checkout <上一个稳定版本的commit hash>

# 3. 重新部署
pnpm install
pnpm run build
pm2 restart enterprise-website

# 4. 验证服务
pm2 logs enterprise-website --lines 50
```

---

## 监控和日志

### 实时日志
```bash
# 查看所有日志
pm2 logs enterprise-website

# 只查看错误日志
pm2 logs enterprise-website --err

# 查看最近的 100 行
pm2 logs enterprise-website --lines 100
```

### PM2 监控
```bash
# 启动 PM2 监控（交互式界面）
pm2 monit
```

### 系统监控
```bash
# 查看 CPU 和内存使用
top

# 查看磁盘使用
df -h

# 查看端口监听
ss -tuln
```

---

## 性能优化建议

### 1. 增加 PM2 实例数量（可选）
编辑 `ecosystem.config.js`:
```javascript
module.exports = {
  apps: [{
    name: 'enterprise-website',
    instances: 2, // 改为 2 个实例
    exec_mode: 'cluster',
    // ...其他配置
  }]
}
```

### 2. 配置 Nginx 缓存（可选）
在 Nginx 配置中添加缓存规则，减少后端压力。

### 3. 启用 CDN（可选）
将静态资源上传到 CDN，加速访问。

---

## 安全建议

1. **定期更新依赖**
   ```bash
   pnpm update
   pnpm audit fix
   ```

2. **配置防火墙**
   ```bash
   # 只开放必要的端口（80, 443, 22）
   ufw allow 80
   ufw allow 443
   ufw allow 22
   ufw enable
   ```

3. **定期备份**
   ```bash
   # 备份数据库
   pg_dump -U username dbname > backup.sql

   # 备份代码
   git push origin backup-branch
   ```

---

## 联系支持

如果遇到无法解决的问题：
1. 查看 PM2 日志：`pm2 logs enterprise-website`
2. 查看修复总结文档：`COZE-API-FIX-SUMMARY.md`
3. 查看项目文档：`README.md`
