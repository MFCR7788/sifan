# 快速部署修复

## 错误

构建失败：缺少 `.next/server/pages-manifest.json`

## 原因

`.next` 目录备份还原导致文件不完整。

---

## 最快解决方案 ⚡

在服务器（**42.121.218.14**）上直接执行以下命令：

```bash
cd /root/sifan && \
pm2 stop enterprise-website && \
rm -rf .next .next-turbopack-cache node_modules/.cache && \
git fetch origin main && \
git reset --hard origin/main && \
git clean -fd && \
pnpm install && \
pnpm run build && \
pm2 restart enterprise-website && \
pm2 save
```

---

## 如果 GitHub 连接失败，直接本地清理重建

```bash
cd /root/sifan && \
pm2 stop enterprise-website && \
rm -rf .next .next-turbopack-cache node_modules/.cache && \
pnpm install && \
pnpm run build && \
pm2 restart enterprise-website && \
pm2 save
```

---

## 验证部署

```bash
# 检查服务状态
pm2 list

# 查看日志
pm2 logs enterprise-website --lines 20

# 测试本地访问
curl -I http://localhost:3000
```

---

## 推荐方式：本地上传部署（最可靠）

如果服务器网络不稳定，使用本地构建上传：

在**本地沙箱**执行：

```bash
chmod +x deploy-local-upload.sh
./deploy-local-upload.sh
```

---

## 预期结果

构建成功后应该看到：

```
✓ Compiled successfully in 11.3s
  Running TypeScript ...
  Collecting page data using 1 worker ...
  Collecting build traces ...
  Finalizing page optimization ...
```

然后访问：
- http://localhost:3000
- https://www.zjsifan.com（如果已配置 SSL）
