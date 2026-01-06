# 魔法超人平台开发文档

## 一、项目概述

### 1.1 项目目标
为校服企业打造一体化数字化管理平台，实现订单、库存、分销、数据驱动、私域运营全链路数字化管理。

### 1.2 核心价值
- **效率提升**：订单处理时间缩短80%，错误率降低90%
- **渠道拓宽**：分销商数量增长300%，订单来源多元化
- **库存优化**：库存周转率提升50%，库存准确率达99%以上
- **数据驱动**：实时掌握经营数据，决策更加精准

### 1.3 技术栈
- **前端**：Next.js 16 + React 19 + TypeScript 5 + Tailwind CSS 4
- **后端**：Next.js API Routes + PostgreSQL
- **数据库**：PostgreSQL
- **部署**：容器化部署 + CDN加速

---

## 二、技术架构

### 2.1 系统架构图
```
┌─────────────────────────────────────────────────────────┐
│                        客户端层                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ Web管理端│  │小程序端  │  │分销商端  │  │数据看板  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                       API Gateway                        │
│          (Next.js API Routes + 鉴权 + 限流)              │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                       业务服务层                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │订单服务  │  │库存服务  │  │分销服务  │  │数据服务  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                 │
│  │CRM服务   │  │生产服务  │  │财务服务  │                 │
│  └──────────┘  └──────────┘  └──────────┘                 │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                       数据访问层                          │
│              (ORM + 缓存 + 事务管理)                     │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                       数据存储层                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐              │
│  │PostgreSQL│  │  Redis   │  │  OSS存储 │              │
│  │  主数据库 │  │  缓存    │  │ 文件存储 │              │
│  └──────────┘  └──────────┘  └──────────┘              │
└─────────────────────────────────────────────────────────┘
```

### 2.2 目录结构
```
src/
├── app/                          # Next.js App Router
│   ├── page.tsx                 # 首页
│   ├── pricing/                 # 产品报价页
│   ├── configurator/            # 方案配置页
│   ├── about/                   # 关于我们
│   ├── franchise/               # 招商加盟
│   ├── contact/                 # 联系我们
│   ├── login/                   # 登录页
│   ├── dashboard/               # 管理后台
│   └── api/                     # API Routes
│       ├── pricing/             # 报价数据接口
│       ├── orders/              # 订单接口
│       ├── inventory/           # 库存接口
│       ├── distribution/        # 分销接口
│       ├── crm/                 # CRM接口
│       └── auth/                # 认证接口
├── components/                  # 组件
│   ├── Navigation.tsx           # 导航栏
│   ├── AppleFeature.tsx         # Apple风格功能展示
│   ├── ScrollAnimation.tsx      # 滚动动画
│   ├── ValueProposition.tsx     # 价值主张
│   ├── ProductPreview.tsx       # 产品预览
│   ├── CompanyProfile.tsx       # 企业资质
│   ├── StoreShowcase.tsx        # 门店展示
│   ├── configurator/            # 配置器组件
│   │   ├── ConfiguratorStep1.tsx
│   │   ├── ConfiguratorStep2.tsx
│   │   ├── ConfiguratorStep3.tsx
│   │   └── SummaryPanel.tsx
│   └── dashboard/               # 管理后台组件
│       ├── OrderList.tsx
│       ├── InventoryChart.tsx
│       ├── DistributionStats.tsx
│       └── DataDashboard.tsx
├── lib/                         # 工具库
│   db.ts                        # 数据库连接
│   auth.ts                      # 认证工具
│   utils.ts                     # 通用工具
│   types.ts                     # TypeScript类型定义
└── styles/                      # 样式文件
```

---

## 三、功能模块设计

### 3.1 订单与库存中心

#### 3.1.1 功能清单
- **订单管理**
  - 多平台订单抓取（企业微信、淘宝、手工导入）
  - 订单审核与分配
  - 订单状态跟踪
  - 退换货处理
  - 发货与物流跟踪

- **库存管理**
  - 实时库存同步
  - 多仓库/网点库存管理
  - 库存预警（阈值设置）
  - 库存盘点
  - 库存调拨
  - 库存报表

#### 3.1.2 数据模型
```sql
-- 订单表
CREATE TABLE orders (
  id BIGSERIAL PRIMARY KEY,
  order_no VARCHAR(50) UNIQUE NOT NULL,
  customer_id BIGINT NOT NULL,
  warehouse_id BIGINT NOT NULL,
  status VARCHAR(20) NOT NULL, -- pending, confirmed, shipped, completed, cancelled
  total_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 订单明细表
CREATE TABLE order_items (
  id BIGSERIAL PRIMARY KEY,
  order_id BIGINT NOT NULL REFERENCES orders(id),
  product_id BIGINT NOT NULL,
  sku_id BIGINT NOT NULL,
  quantity INT NOT NULL,
  unit_price DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 库存表
CREATE TABLE inventory (
  id BIGSERIAL PRIMARY KEY,
  warehouse_id BIGINT NOT NULL,
  sku_id BIGINT NOT NULL,
  quantity INT NOT NULL DEFAULT 0,
  available_quantity INT NOT NULL DEFAULT 0,
  locked_quantity INT NOT NULL DEFAULT 0,
  updated_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(warehouse_id, sku_id)
);

-- 库存预警表
CREATE TABLE inventory_alerts (
  id BIGSERIAL PRIMARY KEY,
  sku_id BIGINT NOT NULL,
  warehouse_id BIGINT NOT NULL,
  threshold INT NOT NULL,
  alert_type VARCHAR(20) NOT NULL, -- low, high
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 3.1.3 核心接口
```
POST   /api/orders/create              # 创建订单
GET    /api/orders/:id                  # 获取订单详情
GET    /api/orders                      # 订单列表
PUT    /api/orders/:id/status           # 更新订单状态
POST   /api/orders/:id/allocate          # 分配仓库
POST   /api/orders/:id/ship             # 发货

GET    /api/inventory/stock             # 获取库存
POST   /api/inventory/adjust            # 库存调整
POST   /api/inventory/check             # 库存盘点
GET    /api/inventory/alerts            # 库存预警列表
```

---

### 3.2 分销裂变体系

#### 3.2.1 功能清单
- **分销商管理**
  - 分销商注册与审核
  - 分销商等级管理（推广员、核心代理、VIP合伙人）
  - 专属推广码生成
  - 分销商数据看板

- **佣金管理**
  - 佣金自动计算
  - 佣金结算
  - 提现管理
  - 佣金明细

- **裂变活动**
  - 推荐有礼
  - 销售竞赛
  - 活动配置
  - 活动数据统计

#### 3.2.2 数据模型
```sql
-- 分销商表
CREATE TABLE distributors (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  level VARCHAR(20) NOT NULL, -- promoter, agent, vip
  referral_code VARCHAR(20) UNIQUE NOT NULL,
  parent_id BIGINT, -- 上级分销商
  total_sales DECIMAL(10,2) DEFAULT 0,
  commission DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 佣金表
CREATE TABLE commissions (
  id BIGSERIAL PRIMARY KEY,
  distributor_id BIGINT NOT NULL REFERENCES distributors(id),
  order_id BIGINT NOT NULL REFERENCES orders(id),
  commission_rate DECIMAL(5,2) NOT NULL,
  commission_amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL, -- pending, settled, withdrawn
  created_at TIMESTAMP DEFAULT NOW()
);

-- 提现记录表
CREATE TABLE withdrawals (
  id BIGSERIAL PRIMARY KEY,
  distributor_id BIGINT NOT NULL REFERENCES distributors(id),
  amount DECIMAL(10,2) NOT NULL,
  status VARCHAR(20) NOT NULL, -- pending, approved, rejected, completed
  created_at TIMESTAMP DEFAULT NOW()
);

-- 分销等级配置表
CREATE TABLE distributor_levels (
  id BIGSERIAL PRIMARY KEY,
  level_code VARCHAR(20) UNIQUE NOT NULL,
  level_name VARCHAR(50) NOT NULL,
  discount_rate DECIMAL(5,2) NOT NULL,
  commission_rate DECIMAL(5,2) NOT NULL,
  min_sales_amount DECIMAL(10,2) NOT NULL
);
```

#### 3.2.3 核心接口
```
POST   /api/distributors/register       # 分销商注册
GET    /api/distributors/:id            # 分销商详情
GET    /api/distributors                # 分销商列表
PUT    /api/distributors/:id/level      # 升级等级

GET    /api/commissions                 # 佣金列表
POST   /api/commissions/settle          # 佣金结算
POST   /api/withdrawals                 # 提现申请
GET    /api/withdrawals                 # 提现记录

GET    /api/distributors/:id/referral-code  # 获取推广码
POST   /api/activities                  # 创建活动
GET    /api/activities                  # 活动列表
```

---

### 3.3 数据驱动运营

#### 3.3.1 功能清单
- **数据看板**
  - 实时销售战报
  - 商品销售排行
  - 库存周转率
  - 分销商业绩龙虎榜
  - 区域销售对比

- **报表分析**
  - 销售报表
  - 库存报表
  - 分销商报表
  - 客户分析报表

- **客户数据**
  - 客户画像
  - 客户标签
  - 购买行为分析

#### 3.3.2 数据模型
```sql
-- 数据看板配置表
CREATE TABLE dashboard_configs (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  chart_type VARCHAR(50) NOT NULL,
  title VARCHAR(100) NOT NULL,
  config JSONB NOT NULL,
  position INT NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 客户表
CREATE TABLE customers (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(100),
  school VARCHAR(100),
  grade VARCHAR(20),
  height INT,
  weight INT,
  tags JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 客户行为记录表
CREATE TABLE customer_behaviors (
  id BIGSERIAL PRIMARY KEY,
  customer_id BIGINT NOT NULL REFERENCES customers(id),
  behavior_type VARCHAR(50) NOT NULL, -- view, purchase, share
  behavior_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 3.3.3 核心接口
```
GET    /api/dashboard/widgets          # 数据看板组件
GET    /api/dashboard/sales            # 销售数据
GET    /api/dashboard/inventory         # 库存数据
GET    /api/dashboard/distribution      # 分销数据
GET    /api/dashboard/customers         # 客户数据

GET    /api/reports/sales               # 销售报表
GET    /api/reports/inventory           # 库存报表
GET    /api/reports/distribution        # 分销商报表
GET    /api/reports/customers           # 客户分析报表

GET    /api/customers/:id               # 客户详情
PUT    /api/customers/:id               # 更新客户信息
POST   /api/customers/tags              # 添加标签
```

---

### 3.4 私域流量运营

#### 3.4.1 功能清单
- **客户管理**
  - 客户信息管理
  - 客户标签管理
  - 客户分层

- **营销工具**
  - 自动化营销
  - 优惠券管理
  - 会员积分体系
  - 消息推送

- **运营活动**
  - 活动配置
  - 活动执行
  - 活动效果分析

#### 3.4.2 数据模型
```sql
-- 优惠券表
CREATE TABLE coupons (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL, -- fixed, percentage
  value DECIMAL(10,2) NOT NULL,
  min_amount DECIMAL(10,2),
  max_discount DECIMAL(10,2),
  quantity INT NOT NULL,
  used_quantity INT DEFAULT 0,
  start_time TIMESTAMP NOT NULL,
  end_time TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 用户优惠券表
CREATE TABLE user_coupons (
  id BIGSERIAL PRIMARY KEY,
  coupon_id BIGINT NOT NULL REFERENCES coupons(id),
  user_id BIGINT NOT NULL,
  status VARCHAR(20) NOT NULL, -- unused, used, expired
  used_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 积分记录表
CREATE TABLE points (
  id BIGSERIAL PRIMARY KEY,
  user_id BIGINT NOT NULL,
  points INT NOT NULL,
  type VARCHAR(20) NOT NULL, -- earn, redeem
  reason VARCHAR(200),
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 3.4.3 核心接口
```
GET    /api/customers/:id/profile      # 客户画像
GET    /api/customers/:id/behaviors    # 客户行为

POST   /api/coupons                    # 创建优惠券
GET    /api/coupons                    # 优惠券列表
GET    /api/user/coupons               # 用户优惠券
POST   /api/coupons/:id/redeem         # 使用优惠券

GET    /api/points                     # 积分列表
POST   /api/points/redeem              # 积分兑换

POST   /api/marketing/automation       # 自动化营销配置
GET    /api/marketing/campaigns        # 营销活动列表
```

---

### 3.5 生产与供应链

#### 3.5.1 功能清单
- **生产管理**
  - 生产计划
  - 生产订单
  - 生产进度跟踪
  - 生产成本核算

- **供应链管理**
  - 供应商管理
  - 采购管理
  - 入库管理
  - 供应商评价

#### 3.5.2 数据模型
```sql
-- 生产订单表
CREATE TABLE production_orders (
  id BIGSERIAL PRIMARY KEY,
  order_no VARCHAR(50) UNIQUE NOT NULL,
  product_id BIGINT NOT NULL,
  quantity INT NOT NULL,
  status VARCHAR(20) NOT NULL, -- pending, in_production, completed
  start_time TIMESTAMP,
  end_time TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 供应商表
CREATE TABLE suppliers (
  id BIGSERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  contact_person VARCHAR(50),
  phone VARCHAR(20),
  address TEXT,
  rating DECIMAL(3,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW()
);

-- 采购订单表
CREATE TABLE purchase_orders (
  id BIGSERIAL PRIMARY KEY,
  order_no VARCHAR(50) UNIQUE NOT NULL,
  supplier_id BIGINT NOT NULL REFERENCES suppliers(id),
  status VARCHAR(20) NOT NULL, -- pending, confirmed, received
  total_amount DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

#### 3.5.3 核心接口
```
POST   /api/production/orders          # 创建生产订单
GET    /api/production/orders          # 生产订单列表
PUT    /api/production/orders/:id      # 更新生产订单

GET    /api/suppliers                  # 供应商列表
POST   /api/suppliers                  # 添加供应商
PUT    /api/suppliers/:id              # 更新供应商

POST   /api/purchase/orders            # 创建采购订单
GET    /api/purchase/orders            # 采购订单列表
PUT    /api/purchase/orders/:id        # 更新采购订单
```

---

## 四、实施计划

### 4.1 项目里程碑

| 阶段 | 时间 | 交付物 | 负责人 |
|------|------|--------|--------|
| 需求分析 | 第1周 | 需求规格说明书 | 产品经理 |
| 系统设计 | 第2周 | 系统设计文档 | 架构师 |
| 开发阶段1 | 第3-6周 | 订单与库存中心 | 后端开发 |
| 开发阶段2 | 第7-10周 | 分销裂变体系 | 后端开发 |
| 开发阶段3 | 第11-14周 | 数据驱动运营 | 后端开发 |
| 开发阶段4 | 第15-18周 | 私域运营 | 前端开发 |
| 开发阶段5 | 第19-22周 | 生产供应链 | 全栈开发 |
| 测试阶段 | 第23-24周 | 测试报告 | 测试工程师 |
| 部署上线 | 第25-26周 | 系统上线 | 运维工程师 |

### 4.2 人员配置

- 项目经理：1人
- 产品经理：1人
- 架构师：1人
- 后端开发：3人
- 前端开发：2人
- 测试工程师：1人
- 运维工程师：1人

---

## 五、部署方案

### 5.1 部署架构
```
┌─────────────────────────────────────────────┐
│                CDN加速                       │
│            (静态资源缓存)                    │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│              负载均衡器                       │
│           (Nginx / ALB)                     │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│              应用服务器集群                   │
│         (Node.js + Next.js)                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │  App 1   │  │  App 2   │  │  App 3   │ │
│  └──────────┘  └──────────┘  └──────────┘ │
└─────────────────────────────────────────────┘
                    ↓
┌─────────────────────────────────────────────┐
│               数据库层                       │
│  ┌──────────────┐  ┌──────────────┐        │
│  │ PostgreSQL   │  │    Redis     │        │
│  │   (主从)     │  │   (缓存)     │        │
│  └──────────────┘  └──────────────┘        │
└─────────────────────────────────────────────┘
```

### 5.2 部署步骤

1. **环境准备**
   - 准备服务器资源
   - 安装基础环境（Node.js, PostgreSQL, Redis）
   - 配置网络与安全组

2. **数据库部署**
   - 创建数据库实例
   - 执行数据库迁移脚本
   - 配置主从复制

3. **应用部署**
   - 构建应用镜像
   - 部署应用容器
   - 配置健康检查

4. **配置与测试**
   - 配置环境变量
   - 配置域名与SSL证书
   - 执行冒烟测试

5. **监控与告警**
   - 配置监控指标
   - 配置告警规则
   - 配置日志收集

---

## 六、测试策略

### 6.1 测试类型

| 测试类型 | 测试内容 | 工具 |
|----------|----------|------|
| 单元测试 | 函数、组件测试 | Jest |
| 集成测试 | API接口测试 | Supertest |
| E2E测试 | 端到端流程测试 | Playwright |
| 性能测试 | 负载、压力测试 | JMeter |
| 安全测试 | 漏洞扫描、渗透测试 | OWASP ZAP |

### 6.2 测试覆盖率目标
- 语句覆盖率：≥80%
- 分支覆盖率：≥75%
- 函数覆盖率：≥90%

---

## 七、运维文档

### 7.1 监控指标

#### 系统指标
- CPU使用率
- 内存使用率
- 磁盘使用率
- 网络流量

#### 应用指标
- QPS（每秒查询数）
- 响应时间
- 错误率
- 并发数

#### 业务指标
- 订单量
- 支付成功率
- 用户活跃度
- 转化率

### 7.2 告警规则

| 指标 | 告警阈值 | 级别 |
|------|----------|------|
| CPU使用率 | >80% | 警告 |
| CPU使用率 | >90% | 严重 |
| 内存使用率 | >85% | 警告 |
| 内存使用率 | >95% | 严重 |
| API错误率 | >5% | 警告 |
| API错误率 | >10% | 严重 |
| 响应时间 | >3s | 警告 |
| 响应时间 | >5s | 严重 |

### 7.3 日志规范

#### 日志级别
- **ERROR**：系统错误，需要立即处理
- **WARN**：警告信息，需要注意
- **INFO**：关键业务操作
- **DEBUG**：调试信息

#### 日志格式
```
[时间] [级别] [模块] [用户ID] [消息] [额外信息]
```

示例：
```
2025-01-06 16:30:45 [ERROR] [OrderService] [123456] 订单创建失败: 库存不足 {"orderId": "ORD20250106163045"}
```

---

## 八、附录

### 8.1 主数据管理规范

#### SKU编码规则
推荐使用以下格式：`<基础款号><颜色码><尺码码>`

示例：
- `ST01BL120`：ST01(夏季男生T恤款) + BL(藏蓝色) + 120(120cm身高)
- `WT02WH130`：WT02(冬季女生运动服款) + WH(白色) + 130(130cm身高)

#### 核心原则
1. **唯一性**：一个SKU代码唯一对应一款商品的一个特定款式、颜色、尺码组合
2. **简洁性**：尽量简短，便于打印、识别和录入
3. **稳定性**：编码应在其生命周期内保持不变

### 8.2 接口规范

#### 请求格式
```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

#### 响应格式
```json
{
  "code": 0,
  "message": "success",
  "data": {}
}
```

#### 错误码
| 错误码 | 说明 |
|--------|------|
| 0 | 成功 |
| 1001 | 参数错误 |
| 1002 | 未授权 |
| 1003 | 权限不足 |
| 2001 | 订单不存在 |
| 2002 | 库存不足 |
| 3001 | 分销商不存在 |
| 3002 | 佣金不足 |

### 8.3 安全规范

#### 认证与授权
- 使用JWT进行身份认证
- Token有效期：2小时
- Refresh Token有效期：7天

#### 数据加密
- 密码使用bcrypt加密
- 敏感数据使用AES-256加密
- 传输使用HTTPS

#### 权限控制
- 基于角色的访问控制（RBAC）
- 接口级别权限校验
- 数据级别权限控制

---

**文档版本**：v1.0
**最后更新**：2025-01-06
**维护人员**：魔法超人技术团队
