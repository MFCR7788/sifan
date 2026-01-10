# 数据库配置问题修复指南

## 问题描述

1. **网站显示数据库未配置错误**
   - 错误信息：`Database URL not configured. Set PGDATABASE URL environment variable. Did you create a database?`
   - 影响范围：整个网站的数据库相关功能

2. **定制方案模块提交失败**
   - 当用户在 `/configurator` 页面完成配置并提交订单时，出现错误

## 根本原因

### 1. Next.js 配置错误
- `next.config.ts` 中使用了无效的 `imageOptimization` 配置
- `quality` 字段在 Next.js 16 中的位置已改变

### 2. 缺失的 Zod Schema 定义
- 数据库同步后，`schema.ts` 中缺少必要的 Zod 验证 schema
- 缺少的 schema：
  - `insertUserSchema`
  - `updateUserSchema`
  - `loginSchema`
  - `insertOrderSchema`
  - `insertMemberSchema`
  - `updateMemberSchema`
  - 等其他 schema

### 3. 订单验证问题
- `insertOrderSchema` 包含了 `orderNumber` 字段，但该字段是在服务器端生成的
- 导致前端提交订单时验证失败

## 修复方案

### 1. 修复 Next.js 配置

**修改文件**: `next.config.ts`

```typescript
// 移除了无效的 imageOptimization 配置
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '42.121.218.14',
      },
      {
        protocol: 'https',
        hostname: 'www.zjsifan.com',
      },
      {
        protocol: 'https',
        hostname: 'zjsifan.com',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },
};
```

### 2. 添加 Zod Schema 定义

**修改文件**: `src/storage/database/shared/schema.ts`

```typescript
import { createSchemaFactory } from "drizzle-zod"
import { z } from "zod"

// 配置 date coercion（处理前端 string → Date 转换）
const { createInsertSchema: createCoercedInsertSchema } = createSchemaFactory({
	coerce: { date: true },
})

// 订单 Schema（排除服务器端生成的字段）
export const insertOrderSchema = createCoercedInsertSchema(orders).omit({
	id: true,
	orderNumber: true,
})

// 用户 Schema
export const insertUserSchema = createCoercedInsertSchema(users).pick({
	phone: true,
	name: true,
	email: true,
	password: true,
})

export const updateUserSchema = createCoercedInsertSchema(users)
	.pick({
		email: true,
		name: true,
		avatar: true,
	})
	.partial()

export const loginSchema = z.object({
	phone: z.string(),
	password: z.string(),
})

// 会员 Schema
export const insertMemberSchema = createCoercedInsertSchema(members)
export const updateMemberSchema = createCoercedInsertSchema(members).partial()

// 其他表 Schema...
```

### 3. 数据库环境变量

**重要**: 数据库连接信息已通过环境变量自动配置

```bash
# 系统环境变量（自动配置）
PGDATABASE_URL=postgresql://user_7591422450290704422:aef1a966-5890-4e13-a499-e5a8b0e8b0b4@cp-cute-mist-247e1363.pg2.aidap-global.cn-beijing.volces.com:5432/Database_1767516520571?sslmode=require&channel_binding=require
PGDATABASE=Database_1767516520571
```

**无需手动配置**，`coze-coding-dev-sdk` 会自动读取这些环境变量。

## 部署到服务器

### 方法 1: 使用部署脚本

```bash
# 使用新的数据库修复部署脚本
bash deploy-db-fix.sh
```

### 方法 2: 手动部署

```bash
# 1. 构建项目
pnpm run build

# 2. 上传到服务器
rsync -avz --delete \
  --exclude='.next' \
  --exclude='node_modules' \
  --exclude='.git' \
  ./ root@42.121.218.14:/var/www/enterprise-website/

# 3. 在服务器上安装依赖
ssh root@42.121.218.14 "cd /var/www/enterprise-website && pnpm install --production"

# 4. 重启服务
ssh root@42.121.218.14 "cd /var/www/enterprise-website && pm2 restart enterprise-website"
```

## 验证修复

### 1. 测试数据库连接

```bash
curl http://localhost:5000/api/user/me
# 预期响应: {"error":"未登录"}（这是正常的，因为没有登录）
```

### 2. 测试订单创建

```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{
    "customerName":"测试客户",
    "customerPhone":"13800138000",
    "customerEmail":"test@example.com",
    "platform":"single-store",
    "serviceLevel":"basic",
    "selectedFeatures":["积分商城2.0"],
    "valueServices":[],
    "totalPrice":2980,
    "monthlyFee":0
  }' \
  http://localhost:5000/api/orders

# 预期响应: {"success":true,"data":{...}}
```

### 3. 测试定制方案模块

1. 访问 `https://www.zjsifan.com/configurator`
2. 选择业务场景（单店运营/多门店连锁/品牌连锁）
3. 选择核心功能
4. 选择增值服务
5. 填写客户信息并提交
6. 预期：成功跳转到订单详情页面

## 常见问题

### Q: 为什么会出现"Database URL not configured"错误？
A: 这是因为 `schema.ts` 中缺少 Zod schema 定义，导致代码编译失败，数据库连接函数 `getDb()` 无法正常工作。

### Q: 为什么定制方案模块提交失败？
A: 订单创建 API (`/api/orders`) 在验证请求体时，要求包含 `orderNumber` 字段，但该字段是在服务器端生成的，导致验证失败。

### Q: 如何同步数据库结构？
A: 使用以下命令：
```bash
# 同步远端 → 本地
coze-coding-ai db generate-models

# 同步本地 → 远端
coze-coding-ai db upgrade
```

### Q: 环境变量需要手动配置吗？
A: 不需要。数据库连接信息已经自动配置在系统环境变量中，`coze-coding-dev-sdk` 会自动读取。

## 技术栈

- **数据库**: PostgreSQL
- **ORM**: Drizzle ORM
- **验证**: Zod + drizzle-zod
- **框架**: Next.js 16
- **部署**: PM2 + Nginx

## 相关文件

- `next.config.ts` - Next.js 配置
- `src/storage/database/shared/schema.ts` - 数据库模型和 Zod schema
- `src/app/api/orders/route.ts` - 订单创建 API
- `src/app/configurator/page.tsx` - 定制方案页面
- `src/components/configurator/SummaryPanel.tsx` - 方案概览组件
- `deploy-db-fix.sh` - 数据库修复部署脚本

## 更新日志

- **2026-01-11**: 修复数据库配置和定制方案模块错误
  - 修复 Next.js 配置错误
  - 添加缺失的 Zod schema 定义
  - 修复订单验证问题
  - 数据库连接已验证正常
