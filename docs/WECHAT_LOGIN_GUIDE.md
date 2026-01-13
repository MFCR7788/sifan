# 微信扫码登录配置指南

## 功能说明

本系统支持微信扫码登录功能，用户可以通过微信扫描二维码快速登录网站。

## 配置步骤

### 1. 申请微信开放平台账号

访问 [微信开放平台](https://open.weixin.qq.com/) 注册并完成企业认证。

**注意**：
- 微信开放平台需要企业认证才能使用
- 个人账号无法创建网站应用
- 认证需要营业执照等企业资质

### 2. 创建网站应用

1. 登录微信开放平台
2. 进入"管理中心" > "网站应用"
3. 点击"创建网站应用"
4. 填写应用信息：
   - **应用名称**：魔法超人系统
   - **应用简介**：企业官网管理系统
   - **应用官网**：https://www.zjsifan.com
   - **应用图标**：上传应用Logo
   - **应用简介**：详细描述
5. 提交审核（通常需要1-3个工作日）

### 3. 获取应用凭证

应用审核通过后，你将获得：
- **AppID**：应用唯一标识
- **AppSecret**：应用密钥（需要妥善保管）

### 4. 配置回调域名

在微信开放平台配置回调域名：
- **授权回调域**：www.zjsifan.com
- **注意**：不需要加 `http://` 或 `https://` 前缀

### 5. 配置环境变量

在项目的 `.env.local` 和 `.env.production` 文件中添加以下配置：

```bash
# 微信开放平台配置（扫码登录）
WECHAT_OPEN_APPID=your_wechat_open_appid
WECHAT_OPEN_APPSECRET=your_wechat_open_appsecret
WECHAT_OPEN_REDIRECT_URI=https://www.zjsifan.com/api/auth/wechat/callback
```

**配置说明**：
- `WECHAT_OPEN_APPID`：从微信开放平台获取的AppID
- `WECHAT_OPEN_APPSECRET`：从微信开放平台获取的AppSecret
- `WECHAT_OPEN_REDIRECT_URI`：回调地址，必须与微信开放平台配置的一致

### 6. 部署配置

**重要**：
- 微信开放平台的回调域名必须使用 HTTPS
- 确保服务器已配置 SSL 证书
- 回调地址必须能被微信服务器访问

## 功能特性

### 当前实现的功能

1. ✅ 生成微信OAuth二维码
2. ✅ 扫码后自动获取用户基本信息（昵称、头像等）
3. ✅ 自动创建或更新用户账户
4. ✅ 生成JWT token完成登录
5. ✅ 扫码状态实时轮询
6. ✅ 二维码过期管理（2分钟）

### 关于获取手机号

**重要说明**：
- 微信开放平台OAuth 2.0协议**不直接支持**通过扫码获取用户手机号
- 获取用户手机号需要以下条件之一：

#### 方案一：微信小程序（推荐）
- 开发微信小程序，用户在小程序内授权获取手机号
- 通过小程序与网站账号绑定的方式获取手机号
- 需要开发微信小程序

#### 方案二：企业微信（推荐企业内部使用）
- 使用企业微信的登录接口
- 支持获取员工手机号
- 仅适用于企业内部使用

#### 方案三：补充手机号（最通用）
- 用户扫码登录后，要求补充手机号
- 在用户中心添加绑定手机号功能
- 用户体验稍差，但实施简单

### 当前实现的手机号处理

当前实现采用以下方式：
1. 用户扫码登录后，生成临时手机号标识（`WX{timestamp}`）
2. 用户可以在后续绑定真实手机号
3. 可以在个人中心完善手机号信息

## 用户登录流程

### 微信扫码登录流程

```
1. 用户点击"微信扫码登录"
   ↓
2. 前端请求生成二维码
   ↓
3. 后端生成state和微信授权URL
   ↓
4. 前端显示二维码（包含微信授权URL）
   ↓
5. 用户用微信扫描二维码
   ↓
6. 微信跳转到回调地址（/api/auth/wechat/callback）
   ↓
7. 后端接收code和state
   ↓
8. 后端用code换取access_token
   ↓
9. 后端获取用户基本信息
   ↓
10. 后端查找或创建用户账户
   ↓
11. 后端生成JWT token
   ↓
12. 前端轮询检测到登录成功
   ↓
13. 自动跳转到首页或admin后台
```

## 技术细节

### OAuth 2.0 流程

1. **生成授权URL**
   ```
   https://open.weixin.qq.com/connect/qrconnect?appid=APPID&redirect_uri=REDIRECT_URI&response_type=code&scope=snsapi_login&state=STATE
   ```

2. **用code换取access_token**
   ```
   https://api.weixin.qq.com/sns/oauth2/access_token?appid=APPID&secret=SECRET&code=CODE&grant_type=authorization_code
   ```

3. **获取用户信息**
   ```
   https://api.weixin.qq.com/sns/userinfo?access_token=ACCESS_TOKEN&openid=OPENID&lang=zh_CN
   ```

### 存储机制

当前使用内存存储session，生产环境建议使用Redis：
- 开发环境：Map（内存）
- 生产环境：Redis（推荐）

### 安全措施

1. ✅ 使用state参数防止CSRF攻击
2. ✅ 二维码过期机制（2分钟）
3. ✅ JWT token认证
4. ✅ HTTPS加密传输

## 注意事项

### 开发环境配置

开发环境下，由于微信开放平台回调域名限制：
- 需要配置内网穿透服务（如ngrok）
- 或使用微信开发者工具进行调试
- 或直接在生产环境测试

### 常见问题

**Q: 提示"微信开放平台未配置"？**
A: 请检查环境变量中是否正确配置了 `WECHAT_OPEN_APPID` 和 `WECHAT_OPEN_APPSECRET`

**Q: 提示"二维码已过期"？**
A: 二维码有效期为2分钟，过期后需要重新生成

**Q: 提示"redirect_uri参数错误"？**
A: 请确保 `WECHAT_OPEN_REDIRECT_URI` 与微信开放平台配置的回调域名一致

**Q: 无法获取用户手机号？**
A: 微信开放平台OAuth协议不支持直接获取手机号，需要使用其他方案（见上文）

## 后续优化建议

1. **添加Redis存储**
   - 使用Redis替代内存存储
   - 提高并发性能

2. **手机号绑定功能**
   - 在个人中心添加绑定手机号功能
   - 使用短信验证码验证

3. **多账号绑定**
   - 支持一个微信绑定多个账号
   - 支持账号切换功能

4. **登录日志**
   - 记录用户登录历史
   - 异常登录提醒

5. **扫码登录优化**
   - 使用WebSocket替代轮询
   - 减少服务器压力

## 相关文件

- `src/lib/wechat-oauth.ts` - 微信OAuth认证工具
- `src/app/api/auth/wechat/qrcode/route.ts` - 生成二维码API
- `src/app/api/auth/wechat/check/route.ts` - 检查扫码状态API
- `src/app/api/auth/wechat/callback/route.ts` - 微信回调处理API
- `src/app/login/page.tsx` - 登录页面（包含扫码登录UI）

## 联系方式

如有问题，请联系技术支持或查看微信开放平台官方文档：
https://developers.weixin.qq.com/doc/oplatform/Website_App/WeChat_Login/Wechat_Login.html
