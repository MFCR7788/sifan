# 生产环境部署指南

## 问题：AI 图像生成/封面图制作功能在生产环境失败

### 症状
- 开发环境测试成功
- 生产环境提示"生成失败，请重试"

### 原因
生产环境缺少 `COZE_WORKLOAD_IDENTITY_API_KEY` 环境变量配置

---

## 解决步骤

### 第一步：获取 Coze API Key

1. **访问 Coze 平台**
   - 国内版：https://www.coze.cn/
   - 国际版：https://www.coze.com/

2. **登录/注册账号**
   - 使用手机号或邮箱登录

3. **获取 API Key**
   - 进入个人中心或项目设置
   - 找到「API 管理」或「开发者设置」
   - 复制 `COZE_WORKLOAD_IDENTITY_API_KEY` 或 API 访问密钥

### 第二步：配置生产环境

#### 方式一：直接修改服务器配置文件

1. **SSH 登录到生产服务器**
   ```bash
   ssh user@42.121.218.14
   cd /path/to/your/project
   ```

2. **编辑 .env.production 文件**
   ```bash
   vim .env.production
   ```

3. **找到并修改以下配置**
   ```bash
   # 将这行：
   COZE_WORKLOAD_IDENTITY_API_KEY=your_coze_api_key_here

   # 修改为（替换为你的实际 API Key）：
   COZE_WORKLOAD_IDENTITY_API_KEY=pat_xxxxxxxx（你的实际key）
   ```

4. **保存并退出**（vim 编辑器）
   - 按 `Esc`
   - 输入 `:wq` 并回车

#### 方式二：通过 CI/CD 或部署平台配置

如果使用 GitHub Actions 或其他 CI/CD 平台，在环境变量配置中添加：

**变量名**：`COZE_WORKLOAD_IDENTITY_API_KEY`
**变量值**：你的实际 API Key

### 第三步：重启生产服务

1. **重启服务（如果使用 PM2）**
   ```bash
   pm2 restart enterprise-website
   ```

2. **或者重新构建和部署**
   ```bash
   # 根据你的部署脚本执行
   npm run build
   pm2 restart all
   ```

### 第四步：验证配置

1. **访问生产环境测试**
   - 打开 https://www.zjsifan.com/tool/ai-image-generation
   - 测试 AI 图像生成功能

2. **查看日志（如果仍然失败）**
   ```bash
   pm2 logs enterprise-website
   # 或查看应用日志目录
   tail -f /var/log/enterprise-website/error.log
   ```

---

## 环境变量完整清单

### 必需配置（✅ 已配置）

| 变量名 | 状态 | 说明 |
|--------|------|------|
| `NODE_ENV` | ✅ | 环境标识 |
| `NEXT_PUBLIC_BASE_URL` | ✅ | 网站 URL |
| `PGDATABASE_URL` | ✅ | 数据库连接 |
| `JWT_SECRET` | ✅ | JWT 密钥 |
| `WECHAT_PAY_*` | ✅ | 微信支付配置 |

### 缺失配置（❌ 需要添加）

| 变量名 | 状态 | 说明 | 优先级 |
|--------|------|------|--------|
| `COZE_WORKLOAD_IDENTITY_API_KEY` | ❌ | Coze 生图 API | 🔴 高 |

### 可选配置

| 变量名 | 状态 | 说明 |
|--------|------|------|
| `S3_*` | ⚪ | 对象存储（未使用） |
| `ALIYUN_*` | ⚪ | 短信服务（未使用） |

---

## 其他可能的问题

### 问题 1：数据库连接失败

**症状**：其他功能也无法使用

**检查**：
```bash
# 测试数据库连接
psql $PGDATABASE_URL
```

**解决**：确认数据库 URL 和凭证正确

### 问题 2：证书文件缺失

**症状**：支付功能报错

**检查**：
```bash
ls -l ./certs/
# 确认以下文件存在：
# - apiclient_key.pem
# - apiclient_cert.pem
```

**解决**：从微信商户平台下载证书并上传到服务器

### 问题 3：端口冲突

**症状**：服务无法启动

**检查**：
```bash
netstat -tlnp | grep :3000
# 或
lsof -i :3000
```

**解决**：修改端口配置或停止占用端口的进程

---

## 常见错误代码

| 错误信息 | 可能原因 | 解决方案 |
|---------|---------|---------|
| `API key is required` | 缺少 COZE_API_KEY | 配置环境变量 |
| `Invalid API key` | API Key 错误 | 检查并更新 Key |
| `Database connection failed` | 数据库连接失败 | 检查数据库 URL |
| `Request timeout` | API 请求超时 | 检查网络连接 |
| `Rate limit exceeded` | API 调用超限 | 等待或升级套餐 |

---

## 联系支持

如果以上步骤都无法解决问题，请提供以下信息：

1. 错误截图或错误日志
2. 具体是哪个功能失败（AI 图像生成/封面图制作）
3. 生产环境配置的 `.env.production` 文件内容（隐藏敏感信息）
4. 服务器日志

---

## 更新日志

- **2025-01-15**：添加 COZE_WORKLOAD_IDENTITY_API_KEY 配置说明
- **2025-01-15**：创建部署指南文档
