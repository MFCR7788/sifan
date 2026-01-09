# 数据库配置完成说明

## 配置状态
✅ 数据库已成功配置并验证通过

## 数据库表结构

### 1. users（用户表）
- 支持用户注册、登录
- 包含管理员字段（isAdmin）
- 支持手机号和邮箱双重登录

### 2. orders（订单表）
- 存储客户订单信息
- 支持订单号查询
- 订单状态管理（pending/paid/cancelled）

### 3. members（会员表）
- 用户会员信息
- 余额和积分管理
- 会员等级和状态

### 4. member_transactions（会员交易记录表）
- 充值、消费记录
- 交易状态追踪
- 支付方式记录

### 5. contact_messages（联系消息表）
- 存储客户咨询信息

## 已测试功能

### ✅ 用户注册功能
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"phone":"13900139000","name":"新用户","password":"123456","email":"newuser@example.com"}' \
  http://localhost:5000/api/auth/register
```

### ✅ 用户登录功能
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"phone":"13900139000","password":"123456"}' \
  http://localhost:5000/api/auth/login
```

### ✅ 获取当前用户信息
```bash
curl http://localhost:5000/api/user/me \
  -b /tmp/cookies.txt
```

### ✅ 管理员登录
```bash
# 管理员账号信息
手机号：15967675767
邮箱：admin@magic-superman.com
密码：Qf229888777

curl -X POST -H "Content-Type: application/json" \
  -d '{"phone":"15967675767","password":"Qf229888777"}' \
  http://localhost:5000/api/auth/login
```

### ✅ 创建订单
```bash
curl -X POST -H "Content-Type: application/json" \
  -d '{"customerName":"张三","customerPhone":"13800138001","customerEmail":"zhangsan@example.com","platform":"电商平台","serviceLevel":"旗舰版","selectedFeatures":[],"totalPrice":999900}' \
  http://localhost:5000/api/orders
```

### ✅ 查询订单
```bash
curl http://localhost:5000/api/orders/by-number/ORD1767937975255TTGN2I
```

## API 端点列表

### 用户认证
- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `POST /api/auth/logout` - 用户登出

### 用户管理
- `GET /api/user/me` - 获取当前用户信息
- `PUT /api/user/me/update` - 更新用户信息
- `POST /api/user/me/password` - 修改密码

### 订单管理
- `POST /api/orders` - 创建订单
- `GET /api/orders/by-number/{orderNumber}` - 根据订单号查询
- `GET /api/orders/[orderNumber]` - 查询订单详情

### 管理后台
- `GET /api/admin/members` - 获取会员列表

## 部署说明

### Netlify 部署环境变量配置

数据库已经在 CozeCoding 平台自动创建和配置，无需手动设置环境变量。

### 本地开发环境

数据库连接通过 `coze-coding-dev-sdk` 自动管理，无需额外配置。

## 常见问题

### Q: 如何重置管理员密码？
A: 管理员密码硬编码在 `src/app/api/auth/login/route.ts` 中，可以在文件中修改：
```typescript
const isValidAdmin = password === '你的新密码';
```

### Q: 如何添加新的管理员？
A: 目前管理员是硬编码的，如需更多管理员，可以在登录逻辑中添加更多账号判断。

### Q: 数据库连接失败怎么办？
A: 请检查：
1. 网络连接是否正常
2. CozeCoding 平台数据库服务是否运行
3. 控制台是否有详细的错误信息

## 技术栈
- **数据库**: PostgreSQL
- **ORM**: Drizzle ORM
- **验证**: Zod
- **密码加密**: bcrypt
