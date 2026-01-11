# Next.js 构建错误修复

## 错误信息

```
Error: ENOENT: no such file or directory, open '/***/sifan/.next/static/Xas9EdVcV7tBvSscS6agE/_buildManifest.js.tmp.lt98rf0ktm'
```

## 原因

`.next` 目录中有残留的缓存文件，导致 Turbopack 构建失败。

---

## 解决方案

### 方式一：使用修复脚本（推荐）⚡

在服务器（42.121.218.14）上执行：

```bash
cd /root/sifan

# 停止服务
pm2 stop enterprise-website

# 完全删除 .next 目录和缓存
rm -rf .next
rm -rf .next-turbopack-cache
rm -rf node_modules/.cache

# 重新构建
pnpm run build

# 重启服务
pm2 start ecosystem.config.js
pm2 save
```

---

### 方式二：使用修复脚本（已上传到 GitHub）

```bash
# 如果能连接 GitHub，先拉取最新代码
cd /root/sifan
git pull origin main
bash fix-build-error.sh
```

---

### 方式三：本地上传部署（最可靠）

在本地沙箱执行：

```bash
chmod +x deploy-local-upload.sh
./deploy-local-upload.sh
```

---

## 验证修复

构建成功后，验证服务：

```bash
# 检查服务状态
pm2 list

# 测试本地访问
curl -I http://localhost:3000

# 查看日志
pm2 logs enterprise-website --lines 20
```

---

## 如果构建仍然失败

### 方案 A：禁用 Turbopack

修改 `package.json` 中的构建命令：

```bash
cd /root/sifan
sed -i 's/turbopack//g' package.json
pnpm run build
```

### 方案 B：清理 node_modules

```bash
cd /root/sifan
rm -rf node_modules
pnpm install
pnpm run build
```

### 方案 C：增加 Node.js 内存

```bash
cd /root/sifan
NODE_OPTIONS='--max-old-space-size=4096' pnpm run build
```

---

## 快速命令（推荐直接复制粘贴）

```bash
cd /root/sifan && \
pm2 stop enterprise-website && \
rm -rf .next .next-turbopack-cache node_modules/.cache && \
pnpm install && \
pnpm run build && \
pm2 restart enterprise-website && \
pm2 save && \
pm2 logs enterprise-website --lines 20
```

执行后应该能看到：
```
✓ Compiled successfully
```

然后访问：
- http://localhost:3000
- https://www.zjsifan.com

---

## 预防措施

为了避免将来出现类似的构建错误，可以在部署脚本中添加清理步骤：

```bash
# 部署前先清理
rm -rf .next .next-turbopack-cache node_modules/.cache

# 然后构建
pnpm run build
```
