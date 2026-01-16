# 生产环境文生图问题修复总结

## 日期
2025-01-16

## 问题描述

生产环境文生图和封面图生成功能出现以下问题：
1. 点击"开始生成"后报错 `Error [NetworkError]: Invalid URL`
2. 生成的图片未显示在历史记录中
3. 前端显示错误提示

## 根本原因

**缺少 API Key 配置**：代码中的 `ImageGenerationClient` 初始化时没有传入 API Key，导致生产环境无法调用生图 API。

错误代码：
```typescript
const config = new Config();  // ❌ 没有传入 API Key
const client = new ImageGenerationClient(config);
```

根据豆包生图集成文档，SDK 需要通过 `COZE_WORKLOAD_IDENTITY_API_KEY` 环境变量或显式传入 API Key 来进行认证。

## 已完成的修复

### 1. 修复封面图生成 API

文件：`src/app/api/tool/cover-generator/route.ts`

**修改前：**
```typescript
const config = new Config();
const client = new ImageGenerationClient(config);
```

**修改后：**
```typescript
const apiKey = process.env.COZE_WORKLOAD_IDENTITY_API_KEY;
if (!apiKey) {
  console.error('COZE_WORKLOAD_IDENTITY_API_KEY 环境变量未配置');
  throw new Error('生图功能需要配置 API Key，请联系管理员');
}

const config = new Config({
  apiKey: apiKey,
});
const client = new ImageGenerationClient(config);

console.log('生图客户端初始化成功，API Key 已配置');
```

### 2. 修复 AI 图像生成 API

文件：`src/app/api/tool/ai-image-generation/route.ts`

**修改前：**
```typescript
const config = new Config();
const client = new ImageGenerationClient(config);
```

**修改后：**
```typescript
const apiKey = process.env.COZE_WORKLOAD_IDENTITY_API_KEY;
if (!apiKey) {
  console.error('COZE_WORKLOAD_IDENTITY_API_KEY 环境变量未配置');
  throw new Error('生图功能需要配置 API Key，请联系管理员');
}

const config = new Config({
  apiKey: apiKey,
});
const client = new ImageGenerationClient(config);

console.log('生图客户端初始化成功，API Key 已配置');
```

### 3. 新增文档

1. **PRODUCTION_ENV_SETUP.md** - 生产环境环境变量配置指南
   - 详细说明了必需的环境变量
   - 提供了完整的配置步骤
   - 包含了常见问题和解决方案

2. **更新 PRODUCTION_IMAGE_GENERATION_DEBUG.md** - 更新了调试文档
   - 添加了 API Key 配置问题说明
   - 更新了常见问题顺序

3. **更新 IMAGE_GENERATION_TROUBLESHOOTING.md** - 更新了排查文档
   - 添加了快速诊断步骤
   - 强调了 API Key 配置的重要性

## 用户需要执行的配置步骤

### 1. 配置 API Key（必需）

在生产服务器上执行以下操作：

```bash
# 1. 登录生产服务器
ssh root@42.121.218.14

# 2. 进入项目目录
cd /root/sifan

# 3. 编辑环境变量文件
vim .env.production

# 4. 添加以下配置（替换为实际的 API Key）
COZE_WORKLOAD_IDENTITY_API_KEY=your-actual-api-key-here

# 5. 保存文件并退出
# 在 vim 中按 Esc，然后输入 :wq 保存退出

# 6. 重启应用
pm2 restart enterprise-website
```

### 2. （可选）配置对象存储

如果希望将生成的图片上传到对象存储，添加以下配置：

```bash
# 继续编辑 .env.production 文件
vim .env.production

# 添加以下配置
COZE_BUCKET_ENDPOINT_URL=https://your-bucket-endpoint.com
COZE_BUCKET_NAME=your-bucket-name

# 保存并重启
pm2 restart enterprise-website
```

**注意：** 对象存储是可选的。如果不配置，系统会降级返回生图 API 的原始 URL（但前提是必须配置 API Key）。

## 验证方法

### 1. 检查应用日志

```bash
pm2 logs enterprise-website --lines 50
```

应该能看到：
```
生图客户端初始化成功，API Key 已配置
========== 开始生成AI图像 ==========
生图 API 响应: {...}
```

### 2. 测试生图功能

访问以下页面测试：
- 文生图：`https://www.zjsifan.com/tool/ai-image-generation`
- 封面图：`https://www.zjsifan.com/tool/cover-generator`

### 3. 验证历史记录

确认生成的图片能够正常添加到历史记录中。

## 技术细节

### 修改文件列表

1. `src/app/api/tool/cover-generator/route.ts` - 封面图生成 API
2. `src/app/api/tool/ai-image-generation/route.ts` - AI 图像生成 API
3. `PRODUCTION_ENV_SETUP.md` - 新增文档
4. `PRODUCTION_IMAGE_GENERATION_DEBUG.md` - 更新文档
5. `IMAGE_GENERATION_TROUBLESHOOTING.md` - 更新文档

### 关键技术点

1. **SDK 使用规范**：根据 `integration-doubao-seedream` 集成文档，`Config` 对象需要传入 API Key 才能正确调用生图 API。

2. **环境变量优先**：SDK 支持从环境变量自动加载 API Key，但显式传入更加明确和可控。

3. **错误处理**：在初始化时检查 API Key 是否存在，如果缺失则立即抛出错误，避免在后续调用时出现难以诊断的 "Invalid URL" 错误。

4. **日志记录**：添加了初始化成功的日志，方便问题排查。

## 后续建议

1. **监控 API 调用**：关注生图 API 的调用次数和配额使用情况

2. **定期检查日志**：每天检查一次应用日志，确保没有异常错误

3. **配置对象存储**：建议配置对象存储以获得更好的图片管理和访问体验

4. **更新文档**：将此次修复的经验添加到系统维护手册中

## 联系支持

如果配置后仍然有问题，请提供：
1. 完整的应用日志（`pm2 logs enterprise-website --lines 500`）
2. 环境变量配置（脱敏后的 API Key）
3. 浏览器控制台错误信息
4. Network 请求的响应内容

---

**修复完成时间**：2025-01-16
**修复人员**：AI 助手
**审核状态**：待用户验证
