# 魔法超人系统 - 企业官网

基于 Next.js 16 构建的现代化企业官网，采用 Apple 极简设计风格。

## 🚀 快速开始

### 本地开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器（端口 5000）
pnpm dev

# 构建项目
pnpm run build
```

### 访问应用

- 开发环境: http://localhost:5000
- 支付调试: http://localhost:5000/payment-debug

## 📋 功能特性

### 核心功能
- ✅ **会员系统** - 银牌/金牌/白金会员
- ✅ **余额充值** - 支持多种充值金额
- ✅ **积分充值** - 积分套餐购买
- ✅ **微信支付** - 原生扫码支付
- ✅ **订单管理** - 完整的订单追踪
- ✅ **管理员后台** - 用户和订单管理

### 页面列表
- 🏠 主页 - 产品展示与介绍
- 💰 产品报价 - 价格方案
- 🔧 定制方案 - 方案配置系统
- 📊 关于我们 - 公司介绍
- 🤝 招商加盟 - 加盟合作
- 📞 联系我们 - 联系方式
- 🔐 用户中心 - 会员信息与订单
- 💎 充值中心 - 会员/余额/积分充值
- ⚙️ 管理后台 - 系统管理

## 🛠️ 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript 5
- **样式**: Tailwind CSS 4
- **数据库**: PostgreSQL
- **ORM**: Drizzle ORM
- **认证**: Cookie + SessionStorage 双重认证
- **支付**: 微信支付（weChatPay Node.js SDK）
- **部署**: PM2 + Nginx
- **CI/CD**: GitHub Actions（已禁用，改用本地上传）

## 📦 部署指南

### 部署到阿里云

#### 快速部署

```bash
# 1. 配置 SSH 免密登录（首次使用）
ssh-copy-id root@your-server-ip

# 2. 运行部署前检查
./scripts/check-deploy.sh your-server-ip

# 3. 一键部署
./scripts/deploy.sh your-server-ip
```

#### 详细文档

- [📖 快速开始部署](docs/DEPLOY_QUICKSTART.md)
- [📖 阿里云部署完整指南](docs/ALIYUN_DEPLOYMENT.md)
- [📖 部署前检查清单](scripts/check-deploy.sh)

### 生产环境配置

创建 `.env.production` 文件：

```bash
# 数据库
DATABASE_URL=postgresql://user:pass@localhost:5432/sifan

# 微信支付
WECHAT_PAY_ENABLE_REAL=true
WECHAT_PAY_MCHID=your_mchid
WECHAT_PAY_SERIAL_NO=your_serial_no
WECHAT_PAY_PRIVATE_KEY_PATH=/path/to/private_key.pem
WECHAT_PAY_API_V3_KEY=your_api_v3_key
WECHAT_PAY_NOTIFY_URL=https://yourdomain.com/api/payment/notify

# 应用配置
NODE_ENV=production
PORT=5000
```

## 🧪 测试

### 支付功能测试

开发环境提供完整的支付调试工具：

- [📖 支付功能测试指南](docs/TEST_PAYMENT_FLOW.md)
- [📖 支付故障排查](docs/PAYMENT_TROUBLESHOOTING.md)

### 访问调试页面

```
http://localhost:5000/payment-debug
```

自动检测：
- 用户认证状态
- Cookie 和 SessionStorage
- 接口调用测试
- 支付接口测试

## 🔧 故障排查

### 常见问题

#### 1. 支付二维码生成失败

**原因**：订单类型不匹配

**解决**：已在前端修复（`member` → `membership`, `balance` → `recharge`）

#### 2. 用户认证失败

**原因**：Cookie 未发送（localhost 特有问题）

**解决**：使用 sessionStorage 备选方案（已实现）

#### 3. 支付接口调用失败

**排查步骤**：
1. 访问 `/payment-debug` 查看详细诊断
2. 检查浏览器控制台日志
3. 查看服务器 PM2 日志：`ssh server 'pm2 logs enterprise-website'`

### 文档

- [📖 支付故障排查指南](docs/PAYMENT_TROUBLESHOOTING.md)
- [📖 GitHub Actions 配置](docs/DEPLOYMENT.md)
- [📖 数据库 Schema](docs/DATABASE_SCHEMA.md)

## 📁 项目结构

```
.
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API 路由
│   │   ├── payment-debug/     # 支付调试页面
│   │   ├── cookie-debug/      # Cookie 调试页面
│   │   └── ...                # 其他页面
│   ├── components/            # React 组件
│   │   ├── RechargeDialog.tsx # 充值对话框
│   │   └── ...
│   ├── contexts/              # React Context
│   ├── services/              # 业务服务
│   │   ├── wechatPay.ts       # 微信支付
│   │   └── alipay.ts          # 支付宝（已移除）
│   └── storage/
│       └── database/          # 数据库相关
│           ├── db.ts           # Drizzle 配置
│           ├── memberManager.ts # 会员管理
│           └── paymentOrderManager.ts # 订单管理
├── docs/                      # 文档
├── scripts/                   # 脚本
│   ├── deploy.sh              # 部署脚本
│   └── check-deploy.sh        # 部署前检查
└── .coze                      # 项目配置
```

## 🔐 安全说明

- ✅ 所有支付操作需要用户认证
- ✅ 支持 Cookie + Header 双重认证
- ✅ SessionStorage 作为 localhost 备选方案
- ✅ 生产环境强制 HTTPS
- ✅ SQL 注入防护（Drizzle ORM）
- ✅ XSS 防护（React 默认）

## 📝 版本历史

### v3.1 (当前版本)
- ✅ 修复支付二维码生成失败问题
- ✅ 添加支付调试工具
- ✅ 优化错误提示
- ✅ 完善部署文档

### v3.0
- ✅ 重构为 Apple 极简风格
- ✅ 集成会员系统和充值功能
- ✅ 实现微信支付
- ✅ 添加管理员后台

## 🤝 贡献指南

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'feat: Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建 Pull Request

## 📄 许可证

本项目采用 MIT 许可证 - 详见 LICENSE 文件

## 💬 联系方式

- 邮箱: contact@example.com
- 官网: https://yourdomain.com

---

**注意**: 本项目为示例项目，请根据实际需求修改配置和代码。
