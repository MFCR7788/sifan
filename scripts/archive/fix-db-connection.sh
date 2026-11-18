#!/bin/bash

# ==========================================
# 服务器端数据库连接修复脚本
# 在服务器（42.121.218.14）上直接执行此脚本
# ==========================================

set -e

echo "=========================================="
echo "修复数据库连接配置"
echo "时间: $(date)"
echo "=========================================="

# 数据库配置
PGDATABASE_URL="postgresql://user_7591422450290704422:aef1a966-5890-4e13-a499-e5a8b0e8b0b4@cp-cute-mist-247e1363.pg2.aidap-global.cn-beijing.volces.com:5432/Database_1767516520571?sslmode=require&channel_binding=require"
PGDATABASE="Database_1767516520571"
DATABASE_URL="$PGDATABASE_URL"

echo ""
echo "步骤 1: 进入项目目录"
echo "----------------------------------------"
cd /root/sifan

echo ""
echo "步骤 2: 创建 ecosystem.config.js（包含环境变量）"
echo "----------------------------------------"

cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'enterprise-website',
    script: 'npm',
    args: 'start',
    cwd: '/root/sifan',
    env: {
      NODE_ENV: 'production',
      PGDATABASE_URL: '$PGDATABASE_URL',
      PGDATABASE: '$PGDATABASE',
      DATABASE_URL: '$DATABASE_URL'
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
EOF

echo "✓ ecosystem.config.js 已创建"
echo ""
echo "环境变量配置："
echo "  PGDATABASE_URL: ${PGDATABASE_URL:0:50}..."
echo "  PGDATABASE: $PGDATABASE"

echo ""
echo "步骤 3: 验证 .env.production 文件"
echo "----------------------------------------"

if [ -f ".env.production" ]; then
    echo "✓ .env.production 存在"
    echo "数据库配置检查："
    grep -E "PGDATABASE_URL|DATABASE_URL" .env.production | head -2 || echo "  未找到数据库配置"
else
    echo "✗ .env.production 不存在，正在创建..."

    cat > .env.production << EOF
# 生产环境配置
NODE_ENV="production"

# 数据库配置
PGDATABASE_URL="$PGDATABASE_URL"
PGDATABASE="$PGDATABASE"
DATABASE_URL="$DATABASE_URL"
EOF

    echo "✓ .env.production 已创建"
fi

echo ""
echo "步骤 4: 停止并删除现有服务"
echo "----------------------------------------"

if pm2 list | grep -q "enterprise-website"; then
    echo "停止现有服务..."
    pm2 stop enterprise-website
    pm2 delete enterprise-website
    echo "✓ 服务已停止"
else
    echo "未找到运行中的服务"
fi

echo ""
echo "步骤 5: 启动新服务（使用 ecosystem.config.js）"
echo "----------------------------------------"

pm2 start ecosystem.config.js
echo "✓ 服务已启动"

echo ""
echo "步骤 6: 保存 PM2 配置"
echo "----------------------------------------"
pm2 save
echo "✓ PM2 配置已保存"

echo ""
echo "步骤 7: 验证服务状态"
echo "----------------------------------------"

pm2 list

echo ""
echo "检查环境变量..."
pm2 env 0 | grep -E "PGDATABASE_URL|PGDATABASE|DATABASE_URL" || echo "  注意: PM2 env 可能不显示完整变量"

echo ""
echo "检查端口监听..."
if netstat -tuln | grep -q ":5000"; then
    echo "✓ 端口 5000 正在监听"
else
    echo "✗ 端口 5000 未监听"
fi

echo ""
echo "步骤 8: 查看最新日志（前 20 行）"
echo "----------------------------------------"
pm2 logs enterprise-website --lines 20 --nostream

echo ""
echo "步骤 9: 测试数据库连接"
echo "----------------------------------------"

echo "测试首页..."
curl -I -m 5 http://localhost:5000 2>&1 | head -1

echo ""
echo "测试用户 API..."
curl -s http://localhost:5000/api/user/me 2>&1 | head -100

echo ""
echo "=========================================="
echo "修复完成！"
echo "时间: $(date)"
echo "=========================================="
echo ""
echo "如果问题仍然存在，请执行以下命令查看详细日志："
echo "  pm2 logs enterprise-website --lines 100"
echo ""
echo "如果需要实时查看日志："
echo "  pm2 logs enterprise-website"
