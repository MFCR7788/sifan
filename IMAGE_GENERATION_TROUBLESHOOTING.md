# 文生图功能生产环境排查指南

## 问题：生产环境文生图显示 "Invalid URL"

### 可能的原因

1. **对象存储环境变量未配置**
2. **生图 API 返回的 URL 格式不正确**
3. **签名 URL 生成失败**
4. **网络连接问题**

### 排查步骤

#### 1. 检查生产环境日志

登录生产服务器，查看应用日志：

```bash
# 查看最近的日志
pm2 logs enterprise-website --lines 100

# 或者查看应用日志文件
tail -f /path/to/app/logs/error.log
```

#### 2. 查看关键日志信息

在日志中查找以下关键字：

- `对象存储环境变量未配置`
- `生成的图片 URL 格式无效`
- `对象存储操作失败`
- `生成的签名 URL 格式无效`

#### 3. 检查环境变量配置

确认生产服务器上是否配置了以下环境变量：

```bash
# 登录生产服务器
ssh user@42.121.218.14

# 检查环境变量（根据你的部署方式）
pm2 env 0
# 或者
cat .env.production
# 或者
pm2 show enterprise-website | grep env
```

确保以下环境变量已配置：
- `COZE_BUCKET_ENDPOINT_URL`
- `COZE_BUCKET_NAME`

#### 4. 测试生图 API

在生产服务器上测试生图 API：

```bash
curl -X POST http://localhost:3000/api/tool/ai-image-generation \
  -H "Content-Type: application/json" \
  -d '{
    "themeContent": "测试图片",
    "style": "写实摄影",
    "detailRequirement": "",
    "quality": "2K",
    "lighting": "柔和光线",
    "ratio": "16:9"
  }'
```

#### 5. 查看返回的 URL 格式

检查 API 返回的 `imageUrl` 是否符合以下格式：

**正确的 URL 格式：**
- `https://...` 开头
- 包含有效的域名和路径
- 没有 `null` 或 `undefined`

**错误的 URL 格式：**
- `null`
- `undefined`
- 空字符串
- 不以 `http` 或 `https` 开头

### 解决方案

#### 方案 1：配置对象存储环境变量

如果日志显示"对象存储环境变量未配置"，需要在生产环境配置这些变量：

**方式 1：修改 .env.production 文件**
```bash
# 编辑 .env.production
vim .env.production

# 添加以下配置（根据实际值填写）
COZE_BUCKET_ENDPOINT_URL=https://your-bucket-endpoint.com
COZE_BUCKET_NAME=your-bucket-name

# 重启应用
pm2 restart enterprise-website
```

**方式 2：通过 PM2 配置**
```bash
pm2 set enterprise-website:env.COZE_BUCKET_ENDPOINT_URL https://your-bucket-endpoint.com
pm2 set enterprise-website:env.COZE_BUCKET_NAME your-bucket-name
pm2 restart enterprise-website
```

#### 方案 2：检查对象存储配置

如果环境变量已配置但仍然报错，检查对象存储的配置：

```bash
# 查看环境变量值
echo $COZE_BUCKET_ENDPOINT_URL
echo $COZE_BUCKET_NAME
```

如果这些变量为空，需要在应用的启动脚本中加载 `.env.production` 文件。

#### 方案 3：使用原始图片 URL（临时方案）

如果对象存储暂时无法配置，代码已经做了降级处理，会直接返回生图 API 生成的原始 URL。

**注意：** 原始 URL 可能有过期时间限制，不适合长期使用。

### 常见问题

#### Q1: 如何获取对象存储的配置信息？

对象存储配置通常由平台提供。在 CozeCoding 环境中，这些配置会自动注入到环境变量中。

#### Q2: 为什么开发环境正常，生产环境报错？

可能的原因：
1. 生产环境缺少环境变量配置
2. 生产环境的网络限制导致无法访问某些 URL
3. 生产环境的对象存储配置与开发环境不同

#### Q3: 如何验证对象存储是否正常？

在应用中添加测试接口：

```typescript
// 创建测试接口：src/app/api/test/storage/route.ts
import { NextResponse } from 'next/server';
import { S3Storage } from 'coze-coding-dev-sdk';

export async function GET() {
  try {
    const storage = new S3Storage({
      endpointUrl: process.env.COZE_BUCKET_ENDPOINT_URL,
      accessKey: '',
      secretKey: '',
      bucketName: process.env.COZE_BUCKET_NAME,
      region: 'cn-beijing',
    });

    // 测试列出文件
    const result = await storage.listFiles({ maxKeys: 10 });

    return NextResponse.json({
      success: true,
      message: '对象存储连接正常',
      data: result,
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : '未知错误',
    }, { status: 500 });
  }
}
```

访问测试接口：`https://www.zjsifan.com/api/test/storage`

### 前端调试

如果 API 返回正常，但前端显示"Invalid URL"，检查：

1. 浏览器控制台的错误信息
2. 网络请求返回的数据格式
3. 前端代码是否正确处理了 `imageUrl`

### 联系支持

如果以上步骤都无法解决问题，请提供以下信息：

1. 生产环境的完整错误日志
2. API 返回的完整响应数据
3. 浏览器控制台的错误信息
4. 环境变量配置情况（隐藏敏感信息）

---

**更新日期：** 2025-01-XX
**文档版本：** 1.0
