# 生产环境文生图调试指南

## 问题描述
- 开发环境可以正常文生图
- 生产环境点击开始生成后报错
- 没有显示在历史记录中

## 调试步骤

### 1. 打开浏览器开发者工具

在生产环境访问文生图页面：
```
https://www.zjsifan.com/tool/ai-image-generation
```

按 F12 打开开发者工具，切换到以下标签页：
- **Console**（控制台）：查看前端日志
- **Network**（网络）：查看 API 请求

### 2. 查看前端控制台日志

在 Console 标签页，点击"开始生成"按钮后，查找以下日志：

**正常情况的日志：**
```
API 响应状态: 200 OK
API 返回数据: {
  "success": true,
  "data": {
    "success": true,
    "imageUrl": "https://...",
    ...
  }
}
图片 URL: https://...
添加到历史记录: {...}
```

**错误情况的日志（可能的错误）：**
```
❌ API 响应状态: 500 Internal Server Error
❌ API 错误: { error: "..." }
❌ API 返回数据格式错误: {...}
❌ API 未返回图片 URL: {...}
❌ 对象存储操作失败: {...}
```

### 3. 查看 Network 请求

在 Network 标签页：
1. 点击"开始生成"按钮
2. 找到 `/api/tool/ai-image-generation` 请求
3. 点击查看详细信息
4. 查看 **Response** 标签页的内容

**正常的响应：**
```json
{
  "success": true,
  "data": {
    "success": true,
    "imageUrl": "https://...",
    "imageKey": "...",
    "prompt": "...",
    ...
  }
}
```

**错误的响应：**
```json
{
  "error": "错误信息"
}
```

### 4. 查看服务器端日志

登录生产服务器：
```bash
ssh user@42.121.218.14
```

查看应用日志：
```bash
# 查看最近的日志
pm2 logs enterprise-website --lines 200

# 实时查看日志
pm2 logs enterprise-website

# 只看错误日志
pm2 logs enterprise-website --err
```

在日志中查找以下关键字：
- `========== 开始生成AI图像 ==========`
- `生图 API 响应:`
- `开始上传图片到对象存储`
- `对象存储操作失败`
- `降级返回原始生成的图片 URL`

### 5. 常见问题及解决方案

#### 问题 1：API Key 未配置（Invalid URL 错误）

**错误日志：**
```
Error [NetworkError]: Invalid URL
    at g.request (.next/server/chunks/5409.js:204:21957)
```

**原因：**
- 生产环境未配置 `COZE_WORKLOAD_IDENTITY_API_KEY` 环境变量
- SDK 无法正确调用生图 API，导致请求 URL 无效

**解决方案：**

1. 登录生产服务器：
```bash
ssh root@42.121.218.14
```

2. 编辑环境变量文件：
```bash
cd /root/sifan
vim .env.production
```

3. 添加以下配置：
```bash
COZE_WORKLOAD_IDENTITY_API_KEY=your-actual-api-key-here
```

4. 保存文件并重启应用：
```bash
pm2 restart enterprise-website
```

5. 验证配置：
```bash
pm2 logs enterprise-website --lines 50
# 应该能看到：生图客户端初始化成功，API Key 已配置
```

**详细配置说明：** 请参考 [PRODUCTION_ENV_SETUP.md](./PRODUCTION_ENV_SETUP.md)

---

#### 问题 2：对象存储环境变量未配置

**错误日志：**
```
对象存储环境变量未配置
COZE_BUCKET_ENDPOINT_URL: undefined
COZE_BUCKET_NAME: undefined
```

**解决方案：**
1. 检查 `.env.production` 文件
2. 添加以下配置：
   ```bash
   COZE_BUCKET_ENDPOINT_URL=https://your-bucket-endpoint.com
   COZE_BUCKET_NAME=your-bucket-name
   ```
3. 重启应用：
   ```bash
   pm2 restart enterprise-website
   ```

---

#### 问题 3：生图 API 返回的 URL 无法访问

**错误日志：**
```
生成的图片 URL: https://some-invalid-url
下载失败: ...
```

**解决方案：**
1. 检查网络连接
2. 检查生图 API 的 API Key 是否正确
3. 确认生产环境可以访问生图 API 的域名

---

#### 问题 4：uploadFromUrl 超时

**错误日志：**
```
对象存储操作失败: TimeoutError: Request timeout
```

**解决方案：**
1. 增加超时时间（当前为 30 秒）
2. 检查网络连接是否正常
3. 检查对象存储服务是否可用

---

#### 问题 5：签名 URL 生成失败

**错误日志：**
```
生成的签名 URL 格式无效: undefined
```

**解决方案：**
1. 检查对象存储配置
2. 确认 `fileKey` 返回值有效
3. 检查对象存储服务的权限配置

### 6. 降级机制说明

代码已实现降级机制：
- ✅ 对象存储上传失败 → 返回生图 API 原始 URL
- ✅ 签名 URL 生成失败 → 返回生图 API 原始 URL
- ✅ 任何对象存储错误 → 返回生图 API 原始 URL

**注意：** 如果降级到原始 URL，请确认：
1. 生图 API 返回的 URL 是否可以直接访问
2. 生产环境的网络是否可以访问该 URL
3. 原始 URL 是否有过期时间限制

### 7. 手动测试 API

在生产服务器上测试 API：

```bash
# 测试文生图 API
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

查看返回的 JSON 数据，检查：
- `success` 是否为 `true`
- `data.imageUrl` 是否存在且有效
- `data.imageKey` 是否存在（如果使用了对象存储）

### 8. 对比开发和生产环境

| 项目 | 开发环境 | 生产环境 |
|------|---------|---------|
| 对象存储配置 | ✅ 已配置 | ❓ 需检查 |
| 网络访问 | ✅ 无限制 | ❓ 可能有限制 |
| 生图 API | ✅ 正常 | ✅ 正常 |
| API Key | ✅ 正确 | ✅ 正确 |

### 9. 临时解决方案

如果生产环境暂时无法解决对象存储问题，可以：

1. **暂时移除对象存储逻辑**（不推荐）：
   - 直接返回生图 API 的原始 URL
   - 前端使用原始 URL 加载图片

2. **使用 CDN 加速**：
   - 将生成的图片上传到 CDN
   - 使用 CDN URL 返回给前端

3. **配置反向代理**：
   - 配置 Nginx 反向代理生图 API 的图片 URL
   - 避免跨域问题

### 10. 联系支持

如果以上步骤都无法解决问题，请收集以下信息：

1. **前端日志**：Console 标签页的所有日志
2. **网络请求**：Network 标签页的请求和响应
3. **服务器日志**：PM2 的完整错误日志
4. **环境配置**：`.env.production` 文件内容（隐藏敏感信息）
5. **API 响应**：完整的 JSON 响应数据

---

**更新日期：** 2025-01-XX
**文档版本：** 1.1
