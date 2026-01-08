# 留言管理页面登录验证说明

## 功能概述

留言管理页面（`/contact/messages`）现已添加登录验证功能，只有登录用户才能访问。

## 已实现的功能

1. **ProtectedRoute 组件** - 路由保护组件
2. **登录验证** - 未登录用户自动跳转到登录页
3. **会话管理** - 基于 Cookie 的会话管理
4. **加载状态** - 加载时显示加载动画

## 如何使用

### 1. 创建管理员账户

#### 方法一：通过注册页面创建

访问注册页面：`http://localhost:5000/register`

填写表单：
- 邮箱：`admin@example.com`（或您的邮箱）
- 姓名：`管理员`
- 密码：设置您的密码
- 电话：可选

#### 方法二：通过 API 创建

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "name": "管理员",
    "password": "your_password",
    "phone": "13800138000"
  }'
```

### 2. 登录系统

访问登录页面：`http://localhost:5000/login`

填写表单：
- 邮箱：您注册时使用的邮箱
- 密码：您设置的密码

或通过 API 登录：

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "your_password"
  }' \
  -c cookies.txt
```

### 3. 访问留言管理页面

登录成功后，访问：`http://localhost:5000/contact/messages`

如果未登录，系统会自动跳转到登录页面。

## 受保护的页面

- `/contact/messages` - 留言管理页面

## 公开页面（无需登录）

- `/` - 首页
- `/pricing` - 产品报价
- `/about` - 关于我们
- `/franchise` - 招商加盟
- `/contact` - 联系我们（留言表单）
- `/configurator` - 方案定制
- `/login` - 登录页面
- `/register` - 注册页面

## API 接口

### 认证相关

- `POST /api/auth/login` - 登录
- `POST /api/auth/register` - 注册
- `POST /api/auth/logout` - 登出
- `GET /api/user/me` - 获取当前用户信息

### 留言管理

- `GET /api/contact/messages` - 获取所有留言
- `DELETE /api/contact/messages/{id}` - 删除留言

## 安全说明

1. **Cookie 配置**：
   - `httpOnly: true` - 防止 XSS 攻击
   - `secure: true`（生产环境）- 仅 HTTPS 传输
   - `sameSite: lax` - CSRF 保护
   - `maxAge: 60 * 60 * 24 * 7` - 7 天有效期

2. **密码安全**：
   - 使用 bcrypt 加密存储
   - 密码验证在服务端进行

3. **生产环境建议**：
   - 添加更多管理员权限控制
   - 实现角色权限管理（RBAC）
   - 添加操作日志记录
   - 定期审计访问日志

## 故障排查

### 无法访问留言管理页面

1. 确认是否已登录：
```bash
curl http://localhost:5000/api/user/me
```

2. 如果未登录，请先登录

3. 检查 Cookie 是否设置正确

### 登录失败

1. 检查邮箱和密码是否正确
2. 检查数据库连接是否正常
3. 查看浏览器控制台是否有错误信息

### 数据库连接错误

如果看到 "数据库未配置" 错误：
- 确认数据库服务已启动
- 检查环境变量是否配置正确
- 查看 PostgreSQL 连接配置

## 代码结构

```
src/
├── components/
│   └── ProtectedRoute.tsx      # 受保护路由组件
├── contexts/
│   └── AuthContext.tsx          # 认证上下文
├── app/
│   ├── contact/
│   │   └── messages/
│   │       └── page.tsx        # 留言管理页面（已受保护）
│   ├── login/
│   │   └── page.tsx            # 登录页面
│   ├── register/
│   │   └── page.tsx            # 注册页面
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts  # 登录 API
│       │   ├── register/route.ts  # 注册 API
│       │   └── logout/route.ts # 登出 API
│       └── user/
│           └── me/route.ts     # 当前用户信息 API
```

## 开发建议

如果需要保护更多页面，只需在页面中包裹 `ProtectedRoute` 组件：

```tsx
import ProtectedRoute from '@/components/ProtectedRoute';

export default function AdminPage() {
  return (
    <ProtectedRoute>
      {/* 页面内容 */}
    </ProtectedRoute>
  );
}
```
