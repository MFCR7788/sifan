# 手机号绑定功能说明

## 功能概述

根据微信登录指南（docs/WECHAT_LOGIN_GUIDE.md），微信扫码登录后无法直接获取用户手机号。本功能为用户提供后续绑定真实手机号的途径。

## 实现功能

### 1. 手机号绑定 API

**接口地址**: `POST /api/user/me/bind-phone`

**请求参数**:
```json
{
  "phone": "13800138000"
}
```

**响应示例**:
```json
{
  "message": "手机号绑定成功",
  "user": {
    "id": "user-id",
    "phone": "13800138000",
    "name": "用户昵称",
    "avatar": "https://thirdwx.qlogo.cn/...",
    "email": null,
    "isActive": true,
    "isAdmin": false,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**错误响应**:
- `401`: 未登录
- `400`: 手机号格式不正确
- `409`: 该手机号已被使用
- `500`: 服务器错误

### 2. 个人中心更新

#### 显示微信头像和昵称
- 如果用户有微信头像，会在个人信息页面显示
- 显示用户的微信昵称

#### 手机号绑定流程
1. 在个人中心"个人信息"标签页查看手机号
2. 如果手机号是临时标识（以 `WX` 开头），会显示"未设置"
3. 点击"绑定手机号"按钮打开绑定弹窗
4. 输入手机号并确认绑定
5. 绑定成功后可以使用手机号登录

#### 临时手机号识别
- 微信扫码登录的用户，手机号会被设置为 `WX{timestamp}` 格式
- 个人中心会识别这种格式，显示"未设置"并提供绑定按钮
- 正常的手机号不会显示绑定按钮

## 技术实现

### 数据库更新

#### 1. 用户 Schema 更新
```typescript
// src/storage/database/shared/schema.ts
export const updateUserSchema = createCoercedInsertSchema(users)
  .pick({
    email: true,
    name: true,
    avatar: true,
    phone: true,  // 新增 phone 字段
  })
  .partial()
```

#### 2. UserManager 新增方法
```typescript
// src/storage/database/userManager.ts

/**
 * 检查手机号是否已存在（排除当前用户）
 */
async isPhoneExists(phone: string, excludeUserId?: string): Promise<boolean> {
  const db = await getDb();
  const conditions = excludeUserId
    ? and(eq(users.phone, phone), sql`${users.id} != ${excludeUserId}`)
    : eq(users.phone, phone);
  
  const [user] = await db.select().from(users).where(conditions as SQL);
  return !!user;
}
```

### API 实现

#### 手机号绑定接口
```typescript
// src/app/api/user/me/bind-phone/route.ts

- 验证用户登录状态
- 验证手机号格式（/^1[3-9]\d{9}$/）
- 检查手机号唯一性（排除当前用户）
- 更新用户手机号
```

### 前端实现

#### 个人中心页面更新
```typescript
// src/app/profile/page.tsx

- 新增状态：
  * showBindPhoneModal: 控制绑定弹窗显示
  * bindPhoneForm: 绑定表单数据
  * isBindingPhone: 绑定状态

- 新增方法：
  * handleBindPhone: 处理手机号绑定

- UI 更新：
  * 显示微信头像（如果有）
  * 识别临时手机号并显示"未设置"
  * 显示"绑定手机号"按钮
  * 手机号绑定弹窗
```

## 使用场景

### 场景 1: 微信扫码登录后绑定手机号
1. 用户通过微信扫码登录
2. 系统生成临时手机号 `WX1704067200000`
3. 用户访问个人中心
4. 看到手机号显示为"未设置"
5. 点击"绑定手机号"按钮
6. 输入真实手机号并确认
7. 绑定成功，可以使用手机号登录

### 场景 2: 已有用户绑定手机号
1. 用户已注册账号
2. 在个人中心查看手机号
3. 如果手机号是临时标识，可以绑定真实手机号
4. 绑定后不影响其他功能

## 安全措施

1. **手机号格式验证**: 使用正则表达式 `/^1[3-9]\d{9}$/` 验证手机号格式
2. **手机号唯一性**: 绑定前检查手机号是否已被其他用户使用
3. **登录状态验证**: 必须登录才能绑定手机号
4. **双重认证**: 支持 Cookie 和 HTTP Header 两种认证方式

## 测试建议

### 功能测试
1. [ ] 微信扫码登录后，临时手机号显示为"未设置"
2. [ ] 点击"绑定手机号"按钮打开弹窗
3. [ ] 输入正确的手机号格式
4. [ ] 绑定成功后刷新页面，手机号更新
5. [ ] 绑定已存在的手机号，显示错误提示
6. [ ] 输入错误格式的手机号，显示错误提示

### 边界测试
1. [ ] 未登录状态下调用 API，返回 401
2. [ ] 绑定自己的手机号（如果已经是真实手机号），返回成功
3. [ ] 绑定其他用户的手机号，返回 409
4. [ ] 输入非数字字符，返回 400

## 后续优化建议

1. **短信验证**: 添加短信验证码验证，提高安全性
2. **手机号解绑**: 支持解绑手机号（需登录验证）
3. **手机号修改**: 支持修改已绑定的手机号（需验证）
4. **登录方式切换**: 支持在登录页面选择手机号登录或微信登录

## 相关文件

- `src/storage/database/shared/schema.ts` - 数据库 Schema 定义
- `src/storage/database/userManager.ts` - 用户管理逻辑
- `src/app/api/user/me/bind-phone/route.ts` - 手机号绑定 API
- `src/app/profile/page.tsx` - 个人中心页面
- `docs/WECHAT_LOGIN_GUIDE.md` - 微信登录配置指南

## 注意事项

1. **临时手机号格式**: `WX{timestamp}`，便于识别微信登录用户
2. **手机号唯一性**: 全局唯一，不能与其他用户重复
3. **绑定后登录**: 绑定成功后，用户可以使用绑定的手机号登录
4. **邮箱字段**: 当前未实现邮箱绑定功能，后续可扩展
