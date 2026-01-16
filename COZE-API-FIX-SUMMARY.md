# Coze API 调用问题修复总结

## 问题分析

### 生产环境错误日志
```
Coze API 错误响应: {"code":4000,"msg":"The requested API endpoint POST /v3/chat/completions does not exist. Please verify the URL and try again."}
```

### 根本原因
`src/app/api/test/coze-direct/route.ts` 尝试直接调用 Coze REST API 端点 `https://api.coze.cn/v3/chat/completions`，但该端点不存在（返回 404）。

**正确的做法**：应该使用 `coze-coding-dev-sdk` 提供的 `LLMClient` 和 `ImageGenerationClient`，SDK 会自动处理正确的 API 端点和认证。

## 修复内容

### 1. 修复测试接口 - 使用 SDK 而非直接调用 REST API
**文件**: `src/app/api/test/coze-direct/route.ts`

**修改前**:
```typescript
// 直接调用不存在的 REST API 端点
const response = await fetch('https://api.coze.cn/v3/chat/completions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    model: 'doubao-seed-1-6-251015',
    messages: [...],
    temperature: 0.7,
    max_tokens: 100,
  }),
});
```

**修改后**:
```typescript
// 使用 SDK（正确方式）
import { LLMClient, Config } from 'coze-coding-dev-sdk';

const config = new Config({
  apiKey: apiKey,
  baseUrl: 'https://api.coze.cn', // SDK 端点
  modelBaseUrl: 'https://api.coze.cn/v3', // 模型 API 端点
  timeout: 30000,
});

const client = new LLMClient(config);
const stream = client.stream(messages, {
  model: 'doubao-seed-1-6-251015',
  temperature: 0.7,
});
```

### 2. 为所有 SDK 配置添加 modelBaseUrl 参数

确保所有使用 LLMClient 和 ImageGenerationClient 的 API 路由都正确配置了以下参数：

```typescript
const config = new Config({
  apiKey: process.env.COZE_WORKLOAD_IDENTITY_API_KEY,
  baseUrl: 'https://api.coze.cn', // SDK 端点
  modelBaseUrl: 'https://api.coze.cn/v3', // 模型 API 端点（关键！）
  timeout: 30000, // 可选：超时时间
});
```

**已修复的文件列表**:
- ✅ `src/app/api/test/coze/route.ts` - 添加 `modelBaseUrl`
- ✅ `src/app/api/test/coze-direct/route.ts` - 改用 SDK 并添加 `modelBaseUrl`
- ✅ `src/app/api/tool/ai-copywriting/route.ts` - 已配置
- ✅ `src/app/api/tool/ai-image-generation/route.ts` - 已配置
- ✅ `src/app/api/tool/rewrite/route.ts` - 已配置
- ✅ `src/app/api/tool/title-gen/route.ts` - 已配置
- ✅ `src/app/api/tool/cover-generator/route.ts` - 已配置
- ✅ `src/app/api/chat/route.ts` - 已配置
- ✅ `src/app/api/admin/knowledge-base/parse/route.ts` - 已配置

## 关键技术点

### 1. SDK vs REST API
- **SDK**: 自动处理正确的 API 端点、认证、错误处理等 ✅
- **REST API**: 需要手动管理端点、认证、错误处理 ❌（不推荐）

### 2. baseUrl vs modelBaseUrl
- `baseUrl`: SDK 端点，用于 SDK 内部调用
- `modelBaseUrl`: 模型 API 端点，用于 LLM/ImageGeneration 调用
- 两者缺一不可，否则会导致连接超时

### 3. 正确的模型 ID
根据集成文档，支持的模型包括：
- `doubao-seed-1-6-251015` - 通用模型（默认）
- `doubao-seed-1-6-flash-250615` - 快速模型
- `doubao-seed-1-6-thinking-250715` - 思考模型
- `doubao-seed-1-6-vision-250815` - 视觉模型
- `doubao-seed-1-6-lite-251015` - 轻量级模型
- `deepseek-v3-2-251201` - DeepSeek V3.2 模型
- `deepseek-r1-250528` - DeepSeek R1 模型
- `kimi-k2-250905` - Kimi K2 模型

## 测试验证

### 开发环境测试
```bash
# 测试 SDK 调用
curl -X POST http://localhost:5000/api/test/coze \
  -H "Content-Type: application/json" \
  -d '{}'

# 测试 AI 文案生成
curl -X POST http://localhost:5000/api/tool/ai-copywriting \
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

### 生产环境测试
```bash
# 测试 SDK 调用
curl -X POST https://www.zjsifan.com/api/test/coze \
  -H "Content-Type: application/json" \
  -d '{}'

# 测试 AI 文案生成
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

## 生产环境部署

### 部署步骤
1. **提交代码到 GitHub**
   ```bash
   git add .
   git commit -m "fix: 修复 Coze API 调用问题，使用 SDK 而非直接调用 REST API"
   git push origin main
   ```

2. **检查 GitHub Actions**
   访问: https://github.com/MFCR7788/sifan/actions

3. **等待自动部署完成**
   - GitHub Actions 会自动触发部署流程
   - 检查部署日志，确保构建成功

4. **验证生产环境**
   ```bash
   # 检查 PM2 状态
   ssh root@your-server
   pm2 status

   # 查看日志
   pm2 logs enterprise-website --lines 100

   # 测试 API
   curl -X POST https://www.zjsifan.com/api/test/coze \
     -H "Content-Type: application/json" \
     -d '{}'
   ```

### 如果自动部署失败，手动部署
```bash
# SSH 登录服务器
ssh root@your-server

# 拉取最新代码
cd /root/sifan
git pull origin main

# 安装依赖（如果需要）
pnpm install

# 构建项目
pnpm run build

# 重启 PM2
pm2 restart enterprise-website

# 查看日志
pm2 logs enterprise-website --lines 100
```

## 验证清单

- [x] 所有 SDK 配置都包含 `baseUrl: 'https://api.coze.cn'`
- [x] 所有 SDK 配置都包含 `modelBaseUrl: 'https://api.coze.cn/v3'`
- [x] 移除了所有直接调用 REST API 的代码
- [x] 使用正确的模型 ID（如 `doubao-seed-1-6-251015`）
- [x] 环境变量 `COZE_WORKLOAD_IDENTITY_API_KEY` 已配置
- [x] 错误处理使用 try-catch 包裹
- [x] 日志输出包含关键信息（API Key 前缀、响应状态等）

## 预期结果

修复后，生产环境应该能够：
1. ✅ 成功调用 Coze API，不再出现 404 错误
2. ✅ AI 文案生成功能正常工作
3. ✅ AI 图像生成功能正常工作
4. ✅ 封面图制作功能正常工作
5. ✅ 智能客服功能正常工作
6. ✅ 知识库文档解析功能正常工作

## 参考资料

- [coze-coding-dev-sdk 集成文档](https://www.coze.cn/docs/developer_guides/api_overview)
- [LLM 集成指南](https://www.coze.cn/docs/developer_guides/llm_integration)
- [Image Generation 集成指南](https://www.coze.cn/docs/developer_guides/image_generation_integration)

## 注意事项

1. **禁止直接调用 REST API**：始终使用 SDK，SDK 会自动处理正确的端点和认证
2. **必须配置 baseUrl 和 modelBaseUrl**：两者缺一不可，否则会导致连接超时
3. **使用正确的模型 ID**：参考集成文档中的模型列表，使用官方支持的模型 ID
4. **环境变量配置**：确保 `COZE_WORKLOAD_IDENTITY_API_KEY` 在生产环境正确配置
5. **错误处理**：所有 API 调用都应该使用 try-catch 包裹，提供友好的错误提示
