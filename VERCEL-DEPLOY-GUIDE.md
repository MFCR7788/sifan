# Vercel 部署配置指南

## 部署失败原因分析

Vercel 部署失败通常是因为以下原因：

### 1. 环境变量未配置
Vercel 部署时需要配置生产环境变量，但 .env.production 中的变量不会自动同步到 Vercel。

### 2. 数据库连接问题
项目使用的数据库连接是本地服务器（42.121.218.14），Vercel 云服务器可能无法访问。

### 3. 数据库 SDK 兼容性
项目使用了 `coze-coding-dev-sdk` 的数据库连接功能，在 Vercel 环境下可能不兼容。

---

## 解决方案

### 方案一：在 Vercel Dashboard 中配置环境变量

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择 `sifan` 项目
3. 进入 **Settings** → **Environment Variables**
4. 添加以下环境变量：

```
DATABASE_URL=postgresql://username:password@42.121.218.14:5432/database_name
NODE_ENV=production
NEXT_PUBLIC_APP_NAME=魔法超人3.0系统
JWT_SECRET=your-jwt-secret
```

**注意**：需要将 `username:password@42.121.218.14:5432/database_name` 替换为实际的数据库连接信息。

### 方案二：使用 Vercel Postgres（推荐）

如果需要在 Vercel 上稳定运行，建议使用 Vercel 的数据库服务：

1. 在 Vercel Dashboard 中，进入 **Storage** → **Create Database** → **Postgres**
2. 创建数据库后，Vercel 会自动提供以下环境变量：
   - `POSTGRES_URL`
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
3. 在 Vercel 项目设置中，将这些变量添加到环境变量

然后修改 `src/storage/database/index.ts` 文件，使用 Vercel 提供的数据库连接。

### 方案三：使用自定义服务器部署（推荐）

由于项目使用了 `coze-coding-dev-sdk` 和自定义的数据库管理，建议继续使用自己的服务器部署，而不是 Vercel。

**部署命令：**

```bash
# 在你的服务器上执行
cd /path/to/your/sifan-project
git pull origin main
pnpm install
pnpm run build
pm2 restart sifan
```

---

## 检查部署日志

查看 Vercel 部署日志以获取详细错误信息：

1. 登录 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择 `sifan` 项目
3. 点击 **Deployments**
4. 点击最新的部署，查看 **Build Logs**

---

## 立即可行的操作

### 1. 查看具体错误信息

在 Vercel Dashboard 中：
- 进入 `sifan` 项目
- 点击 **Deployments**
- 查看最新部署的日志，找到具体的错误信息

### 2. 如果是数据库连接问题

将以下环境变量添加到 Vercel 的环境变量设置中：

```
PGDATABASE_URL=postgresql://username:password@42.121.218.14:5432/database_name
```

### 3. 如果是构建错误

在 Vercel Dashboard 中修改构建配置：
- 进入 **Settings** → **General** → **Build & Development Settings**
- 确认以下设置：
  - Framework Preset: Next.js
  - Build Command: `pnpm run build`
  - Output Directory: `.next`
  - Install Command: `pnpm install`

---

## 建议

由于项目的特殊性（使用 coze-coding-dev-sdk 和自定义数据库管理），**强烈建议使用自己的服务器部署**，而不是 Vercel。这样可以：

1. 完全控制数据库连接
2. 使用 PM2 进行进程管理
3. 更好的性能和稳定性
4. 避免平台兼容性问题

**当前网站部署地址：** https://www.zjsifan.com（应该已经在自己的服务器上运行）

---

## 获取帮助

如果需要进一步帮助，请提供：
1. Vercel 部署日志中的具体错误信息
2. Vercel Dashboard 中的环境变量配置截图
