# 修复 "Cannot find module 'formidable'" 错误

## 问题描述

生产环境 PM2 日志显示以下错误：

```
Error: Cannot find module 'formidable'
Require stack:
- /root/sifan/.next/server/app/api/payment/create/route.js
```

## 根本原因

1. `next.config.ts` 中将 `formidable` 配置为 webpack external 依赖
2. `formidable` 在 `package.json` 中被声明，但在整个项目中没有实际使用
3. 构建后的包期望 `formidable` 在运行时环境中可用，但可能未被正确安装

## 解决方案

### 修复 1：移除 next.config.ts 中的 formidable 配置

**文件**：`next.config.ts`

**修改前**：
```typescript
// 解决 formidable 动态导入问题
webpack: (config, { isServer }) => {
  if (isServer) {
    config.externals = config.externals || [];
    config.externals.push({
      'formidable': 'commonjs formidable'
    });
  }
  return config;
},
```

**修改后**：完全删除这段代码。

### 修复 2：移除 package.json 中的 formidable 依赖

**文件**：`package.json`

**修改前**：
```json
"dependencies": {
  ...
  "formidable": "^3.5.4",
  ...
}
```

**修改后**：删除 `"formidable": "^3.5.4",` 这一行。

## 部署步骤

### 方案 1：使用自动部署脚本（推荐）

```bash
bash deploy-formidable-fix.sh
```

### 方案 2：手动部署

**步骤 1：上传更新的文件**
```bash
scp next.config.ts root@42.121.218.14:/root/sifan/
scp package.json root@42.121.218.14:/root/sifan/
```

**步骤 2：在服务器上卸载 formidable 并重新安装依赖**
```bash
ssh root@42.121.218.14
cd /root/sifan

# 卸载 formidable
pnpm remove formidable

# 重新安装依赖
pnpm install --production=false

# 重新构建
pnpm run build
```

**步骤 3：重启 PM2**
```bash
pm2 restart enterprise-website
```

## 验证修复

### 1. 查看 PM2 日志

```bash
pm2 logs enterprise-website --lines 50
```

**预期结果**：不应该再看到 "Cannot find module 'formidable'" 错误。

### 2. 运行诊断脚本

```bash
bash scripts/realtime-diagnose.sh
```

### 3. 浏览器测试

访问 https://www.zjsifan.com，登录后测试充值功能。

## 说明

- `formidable` 通常用于处理文件上传（`multipart/form-data`）
- 本项目支付接口只处理 JSON 数据，不需要 `formidable`
- 移除不必要的依赖可以减小打包体积，提高构建速度

## 相关文件

- `next.config.ts` - Next.js 配置文件（已修复）
- `package.json` - 项目依赖配置（已修复）
- `deploy-formidable-fix.sh` - 自动部署脚本
