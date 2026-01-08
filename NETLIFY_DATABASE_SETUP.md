# Netlify 数据库配置指南

## 问题描述

在 Netlify 部署时，如果应用使用了数据库但没有配置环境变量，可能会看到以下错误：
```
Database URL not configured. Set PGDATABASE URL environment variable.
Did you create a database? You can create one via CozeCoding platform.
```

## 解决方案

### 方案 1：配置 Netlify 环境变量（如果需要数据库功能）

如果您的应用需要数据库功能（如用户登录、订单系统等），请在 Netlify 中配置数据库环境变量。

#### 步骤：

1. **登录 Netlify Dashboard**
   - 访问 https://app.netlify.com
   - 选择您的站点

2. **进入环境变量配置**
   - 点击 "Site configuration"
   - 选择 "Environment variables"

3. **添加环境变量**
   根据您的数据库类型，添加以下环境变量之一：

   **PostgreSQL（推荐）**：
   ```
   PGDATABASE=your_database_name
   PGUSER=your_username
   PGPASSWORD=your_password
   PGHOST=your_host
   PGPORT=5432
   ```

   或使用连接字符串格式：
   ```
   DATABASE_URL=postgresql://username:password@host:port/database
   ```

4. **保存并重新部署**
   - 保存环境变量后
   - 进入 "Deploys" 标签
   - 点击 "Trigger deploy" -> "Deploy site"

#### 从 CozeCoding 平台获取数据库连接信息

如果您在 CozeCoding 平台创建了数据库，可以通过以下方式获取连接信息：

1. 登录 CozeCoding 平台
2. 进入您的项目
3. 找到数据库服务
4. 查看连接信息或生成的连接字符串

### 方案 2：禁用数据库功能（仅展示型网站）

如果您的网站只是展示型，不需要数据库功能（如用户登录、订单等），可以保留当前配置。

当前代码已经优化：
- ✅ 数据库连接失败时不会影响主页显示
- ✅ 用户会被视为未登录状态
- ✅ 静态内容（如首页、产品页）可以正常访问

### 方案 3：使用外部数据库服务

如果不使用 CozeCoding 平台的数据库，可以使用其他数据库服务：

#### 推荐的托管数据库服务：

1. **Supabase**（推荐，免费额度大）
   - 访问 https://supabase.com
   - 创建免费项目
   - 获取连接字符串
   - 在 Netlify 中配置环境变量

2. **Neon**
   - 访问 https://neon.tech
   - 创建免费 PostgreSQL 数据库
   - 获取连接信息

3. **PlanetScale**
   - 访问 https://planetscale.com
   - 创建免费 MySQL 数据库
   - 修改代码适配 MySQL

## 验证配置

配置完成后，访问以下页面验证：

1. **主页**：`https://你的域名.netlify.app/`
   - 应该能正常显示

2. **登录页面**：`https://你的域名.netlify.app/login`
   - 如果配置了数据库，可以尝试登录
   - 如果未配置数据库，页面仍可正常显示

3. **检查浏览器控制台**
   - 按 F12 打开开发者工具
   - 查看 Console 标签
   - 不应该有数据库连接错误

## 常见问题

### Q: 为什么首页能访问，但显示数据库错误？

A: 因为代码优化了错误处理，数据库连接失败不会导致整个应用崩溃。这保证了静态内容可以正常显示。

### Q: 是否必须配置数据库？

A: 不一定。如果您的网站只是展示型（如企业官网、产品介绍），不需要配置数据库。

### Q: 数据库错误会影响哪些功能？

A: 会影响以下功能：
- 用户登录/注册
- 订单系统
- 业务管理后台
- 联系表单（如果保存到数据库）

不影响以下功能：
- 首页展示
- 产品介绍
- 方案页面
- 关于我们

### Q: 如何检查数据库是否正确配置？

A: 在浏览器控制台运行以下代码：
```javascript
fetch('/api/user/me')
  .then(res => res.json())
  .then(data => console.log(data))
  .catch(err => console.error('Error:', err));
```

如果返回 `{ error: '未登录' }` 说明数据库可能配置成功。
如果返回 `{ error: '数据库未配置' }` 说明需要配置环境变量。

## 联系支持

如果问题仍然存在：
1. 检查 Netlify 构建日志（Deploys -> Latest deploy -> Deploy log）
2. 查看浏览器控制台错误信息
3. 确认环境变量是否正确配置
