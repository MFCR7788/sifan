# 生产环境数据库连接问题修复方案

## 问题分析

生产环境 `www.zjsifan.com` 显示错误：
```
Database URL not configured. Set PGDATABASE_URL environment variable.
Did you create a database? You can create one via the CozeCoding platform.
```

## 根本原因

1. GitHub Actions 自动部署可能执行失败或未触发
2. `.env.production` 文件虽然在代码仓库中，但服务器上的 PM2 进程可能没有正确读取环境变量
3. Next.js 在生产环境中需要环境变量在进程启动时就加载

## 解决方案（按优先级排序）

### 方案一：手动重新部署（推荐）

在阿里云服务器（42.121.218.14）上执行以下命令：

```bash
# 1. 进入项目目录
cd /root/sifan

# 2. 拉取最新代码（包含 .env.production 配置）
git fetch origin main
git reset --hard origin/main

# 3. 检查 .env.production 文件是否存在且包含数据库配置
cat .env.production | grep PGDATABASE_URL

# 4. 确保环境变量被 PM2 加载
# 方式 A：使用 PM2 ecosystem 配置文件（推荐）
pm2 delete enterprise-website
pm2 start npm --name "enterprise-website" -- start -- --env-file=.env.production

# 方式 B：直接在 shell 中设置环境变量后启动
export PGDATABASE_URL="postgresql://user_7591422450290704422:aef1a966-5890-4e13-a499-e5a8b0e8b0b4@cp-cute-mist-247e1363.pg2.aidap-global.cn-beijing.volces.com:5432/Database_1767516520571?sslmode=require&channel_binding=require"
export PGDATABASE="Database_1767516520571"
export DATABASE_URL="postgresql://user_7591422450290704422:aef1a966-5890-4e13-a499-e5a8b0e8b0b4@cp-cute-mist-247e1363.pg2.aidap-global.cn-beijing.volces.com:5432/Database_1767516520571?sslmode=require&channel_binding=require"
pm2 restart enterprise-website --update-env

# 5. 验证服务状态
pm2 list
pm2 logs enterprise-website --lines 50

# 6. 测试数据库连接
curl http://localhost:5000/api/user/me
```

### 方案二：创建 PM2 ecosystem 配置文件

在服务器上创建 `ecosystem.config.js` 文件：

```javascript
// 在 /root/sifan 目录下创建
module.exports = {
  apps: [{
    name: 'enterprise-website',
    script: 'npm',
    args: 'start',
    cwd: '/root/sifan',
    env: {
      NODE_ENV: 'production',
      PGDATABASE_URL: 'postgresql://user_7591422450290704422:aef1a966-5890-4e13-a499-e5a8b0e8b0b4@cp-cute-mist-247e1363.pg2.aidap-global.cn-beijing.volces.com:5432/Database_1767516520571?sslmode=require&channel_binding=require',
      PGDATABASE: 'Database_1767516520571',
      DATABASE_URL: 'postgresql://user_7591422450290704422:aef1a966-5890-4e13-a499-e5a8b0e8b0b4@cp-cute-mist-247e1363.pg2.aidap-global.cn-beijing.volces.com:5432/Database_1767516520571?sslmode=require&channel_binding=require'
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    error_file: '/root/sifan/logs/err.log',
    out_file: '/root/sifan/logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
```

然后使用配置文件重启：

```bash
cd /root/sifan
pm2 delete enterprise-website
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### 方案三：检查 GitHub Actions 部署日志

如果 GitHub Actions 自动部署已配置，检查部署是否成功：

1. 访问 https://github.com/MFCR7788/sifan/actions
2. 查看最新的部署工作流运行状态
3. 如果失败，查看错误日志并修复

### 方案四：本地手动部署脚本

使用本地创建的 `deploy-to-production.sh` 脚本：

```bash
# 在本地沙箱执行
chmod +x deploy-to-production.sh
./deploy-to-production.sh
```

## 验证修复

执行以下命令验证数据库连接是否正常：

```bash
# 1. 检查首页
curl -I http://www.zjsifan.com

# 2. 检查数据库连接
curl http://www.zjsifan.com/api/user/me

# 3. 测试订单创建
curl -X POST http://www.zjsifan.com/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "customerName":"测试客户",
    "customerPhone":"13800138000",
    "customerEmail":"test@example.com",
    "platform":"single-store",
    "serviceLevel":"basic",
    "selectedFeatures":[],
    "valueServices":[],
    "totalPrice":2980,
    "monthlyFee":0
  }'
```

## 临时应急方案（如果以上方案都失败）

如果需要快速恢复网站，可以在 `src/storage/database/orderManager.ts` 中添加错误处理：

```typescript
async createOrder(data: InsertOrder & { orderNumber: string }): Promise<Order> {
  try {
    const db = await getDb();
    // ... 原有代码
  } catch (error: any) {
    console.error('Database connection error:', error);
    if (error.message?.includes('Database URL not configured')) {
      throw new Error('数据库连接失败，请联系管理员');
    }
    throw error;
  }
}
```

## 安全提醒

⚠️ **重要**：数据库连接字符串包含了敏感信息（用户名和密码）。在生产环境中，建议：

1. 使用环境变量管理工具（如 AWS Secrets Manager、Azure Key Vault）
2. 定期轮换数据库密码
3. 限制数据库 IP 白名单访问
4. 使用只读用户进行查询操作

## 联系支持

如果以上方案都无法解决问题，请提供：

1. 服务器上的 PM2 日志：`pm2 logs enterprise-website --lines 100`
2. Nginx 访问日志：`tail -100 /var/log/nginx/access.log`
3. Next.js 应用日志：`tail -100 /root/sifan/logs/out.log`
