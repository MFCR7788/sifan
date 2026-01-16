# 生产环境环境变量配置指南

## 必需的环境变量

为了让文生图和封面图生成功能在生产环境正常工作，需要在服务器的 `.env.production` 文件中配置以下环境变量：

### 1. 生图 API Key（必需）

```bash
COZE_WORKLOAD_IDENTITY_API_KEY=your-api-key-here
```

**作用**：用于调用豆包生图大模型 API，是文生图和封面图生成功能的核心认证凭据。

**如何获取**：
- 从 Coze 平台获取 Workload Identity API Key
- 确保该 API Key 有调用生图服务的权限

**验证方法**：
```bash
# 查看环境变量是否配置
echo $COZE_WORKLOAD_IDENTITY_API_KEY

# 如果未配置，需要编辑 .env.production 文件
vim /root/sifan/.env.production
```

### 2. 对象存储配置（可选但推荐）

```bash
COZE_BUCKET_ENDPOINT_URL=https://your-bucket-endpoint.com
COZE_BUCKET_NAME=your-bucket-name
```

**作用**：将生成的图片上传到对象存储，生成带签名的访问 URL，避免直接使用生图 API 返回的临时 URL。

**配置说明**：
- `COZE_BUCKET_ENDPOINT_URL`：对象存储服务的端点 URL
- `COZE_BUCKET_NAME`：存储桶名称
- `accessKey` 和 `secretKey`：代码中已留空，使用 SDK 内部认证

**降级机制**：
如果对象存储配置缺失或上传失败，系统会自动降级返回生图 API 的原始 URL。

## 配置步骤

### 1. 登录生产服务器

```bash
ssh root@42.121.218.14
```

### 2. 进入项目目录

```bash
cd /root/sifan
```

### 3. 编辑环境变量文件

```bash
vim .env.production
```

### 4. 添加以下配置（根据实际情况修改）

```bash
# 生图 API Key（必需）
COZE_WORKLOAD_IDENTITY_API_KEY=your-actual-api-key-here

# 对象存储配置（可选但推荐）
COZE_BUCKET_ENDPOINT_URL=https://your-bucket-endpoint.com
COZE_BUCKET_NAME=your-bucket-name
```

### 5. 保存文件并退出

在 vim 中：
- 按 `Esc` 退出编辑模式
- 输入 `:wq` 保存并退出

### 6. 重启应用

```bash
pm2 restart enterprise-website
```

### 7. 验证配置

```bash
# 查看应用日志
pm2 logs enterprise-website --lines 50

# 应该能看到以下日志：
# 生图客户端初始化成功，API Key 已配置
```

## 常见问题

### 问题 1：配置后仍然报错 "Invalid URL"

**可能原因**：
- API Key 不正确或已过期
- API Key 没有调用生图服务的权限

**解决方法**：
1. 确认 API Key 是否正确复制
2. 检查 API Key 是否有调用 `integration-doubao-seedream` 的权限
3. 尝试在 Coze 平台重新生成 API Key

### 问题 2：生图成功但图片无法显示

**可能原因**：
- 生图 API 返回的 URL 无法在生产环境访问
- 对象存储配置缺失

**解决方法**：
1. 配置对象存储环境变量
2. 查看日志中的 `对象存储操作失败` 错误信息
3. 如果对象存储配置困难，可以临时使用生图 API 的原始 URL（注意 URL 可能会过期）

### 问题 3：历史记录无法显示

**可能原因**：
- 数据库连接问题
- 前端 API 请求失败

**解决方法**：
1. 检查数据库连接是否正常
2. 查看 Network 请求，确认 API 返回数据
3. 查看服务器日志，确认 SQL 查询是否正常

## 测试步骤

### 1. 测试生图功能

在生产环境访问：
- 文生图：`https://www.zjsifan.com/tool/ai-image-generation`
- 封面图：`https://www.zjsifan.com/tool/cover-generator`

### 2. 查看日志

```bash
pm2 logs enterprise-website --lines 100
```

应该能看到：
```
生图客户端初始化成功，API Key 已配置
========== 开始生成AI图像 ==========
生图 API 响应: {...}
开始上传图片到对象存储...
对象存储操作成功，返回签名 URL
```

### 3. 验证图片显示

确认生成的图片能够正常显示，并添加到历史记录中。

## 监控建议

### 1. 定期检查日志

```bash
# 每天检查一次
pm2 logs enterprise-website --lines 500 | grep -E "错误|失败|Error"
```

### 2. 监控 API 调用次数

关注生图 API 的调用次数和配额使用情况，避免超限。

### 3. 监控对象存储

定期检查对象存储的容量和费用，及时清理过期文件。

## 联系支持

如果遇到问题，请联系技术支持并提供：
1. 完整的错误日志
2. 环境变量配置（脱敏后）
3. 浏览器控制台的错误信息
4. Network 请求的响应内容
