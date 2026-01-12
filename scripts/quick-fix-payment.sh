#!/bin/bash

# ==========================================
# 快速修复生产环境支付功能
# 在生产服务器上运行此脚本
# ==========================================

set -e

echo "=========================================="
echo "快速修复生产环境支付功能"
echo "时间: $(date)"
echo "=========================================="

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

# 打印函数
print_ok() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_step() {
    echo ""
    echo "=========================================="
    echo " $1"
    echo "=========================================="
}

cd /root/sifan

print_step "步骤 1: 更新 .env.production 文件"

cat > .env.production << 'EOF'
# ==========================================
# 生产环境配置
# 部署服务器: 42.121.218.14
# ==========================================

# 应用配置
NODE_ENV="production"
PORT="5000"
APP_NAME="enterprise-website"

# 网站基础 URL（用于支付回调通知）
NEXT_PUBLIC_BASE_URL=http://www.zjsifan.com

# ==================== 微信支付配置 ====================
WECHAT_PAY_APPID=wx314d6d3cfbd33e79
WECHAT_PAY_MCHID=1624143377
WECHAT_PAY_SERIAL_NO=531F07BDA98C557D7D718285B3DDDB35DE8CEA32
WECHAT_PAY_API_V3_KEY=SmallFish7788Admin03072298887777
WECHAT_PAY_PRIVATE_KEY_PATH=./certs/apiclient_key.pem
WECHAT_PAY_CERT_PATH=./certs/apiclient_cert.pem

# ==================== 数据库配置 ====================
# 生产环境数据库连接（CozeCoding 平台 PostgreSQL）
PGDATABASE_URL="postgresql://user_7591422450290704422:aef1a966-5890-4e13-a499-e5a8b0e8b0b4@cp-cute-mist-247e1363.pg2.aidap-global.cn-beijing.volces.com:5432/Database_1767516520571?sslmode=require&channel_binding=require"
PGDATABASE="Database_1767516520571"

# 兼容性配置（部分代码可能使用 DATABASE_URL）
DATABASE_URL="postgresql://user_7591422450290704422:aef1a966-5890-4e13-a499-e5a8b0e8b0b4@cp-cute-mist-247e1363.pg2.aidap-global.cn-beijing.volces.com:5432/Database_1767516520571?sslmode=require&channel_binding=require"

# JWT配置
JWT_SECRET="your-jwt-secret-key-change-in-production"
JWT_EXPIRES_IN="7d"

# Cookie配置
COOKIE_DOMAIN=".zjsifan.com"
COOKIE_SECURE="true"
COOKIE_SAME_SITE="lax"

# 对象存储配置 (如果使用S3)
S3_REGION="your-region"
S3_BUCKET="your-bucket-name"
S3_ACCESS_KEY_ID="your-access-key-id"
S3_SECRET_ACCESS_KEY="your-secret-access-key"

# 短信服务配置 (阿里云)
ALIYUN_ACCESS_KEY_ID="your-aliyun-access-key"
ALIYUN_ACCESS_KEY_SECRET="your-aliyun-access-secret"
ALIYUN_SMS_SIGN_NAME="your-sign-name"
ALIYUN_SMS_TEMPLATE_CODE_REGISTER="your-template-code-register"
ALIYUN_SMS_TEMPLATE_CODE_LOGIN="your-template-code-login"

# 日志配置
LOG_LEVEL="info"

# API限流
RATE_LIMIT_WINDOW_MS="900000"
RATE_LIMIT_MAX_REQUESTS="100"
EOF

print_ok ".env.production 文件已更新"

print_step "步骤 2: 检查证书文件"

mkdir -p certs

if [ -f "certs/apiclient_key.pem" ]; then
    print_ok "私钥文件存在"
else
    print_error "私钥文件不存在！需要从本地上传"
    echo "请执行: scp certs/apiclient_key.pem root@42.121.218.14:/root/sifan/certs/"
    exit 1
fi

if [ -f "certs/apiclient_cert.pem" ]; then
    print_ok "证书文件存在"
else
    print_error "证书文件不存在！需要从本地上传"
    echo "请执行: scp certs/apiclient_cert.pem root@42.121.218.14:/root/sifan/certs/"
    exit 1
fi

print_step "步骤 3: 更新 PM2 配置"

cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'enterprise-website',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -p 5000',
    cwd: '/root/sifan',
    instances: 2,
    exec_mode: 'cluster',
    autorestart: true,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
      NEXT_PUBLIC_BASE_URL: 'http://www.zjsifan.com',
      WECHAT_PAY_APPID: 'wx314d6d3cfbd33e79',
      WECHAT_PAY_MCHID: '1624143377',
      WECHAT_PAY_SERIAL_NO: '531F07BDA98C557D7D718285B3DDDB35DE8CEA32',
      WECHAT_PAY_API_V3_KEY: 'SmallFish7788Admin03072298887777',
      WECHAT_PAY_PRIVATE_KEY_PATH: './certs/apiclient_key.pem',
      WECHAT_PAY_CERT_PATH: './certs/apiclient_cert.pem',
      PGDATABASE_URL: 'postgresql://user_7591422450290704422:aef1a966-5890-4e13-a499-e5a8b0e8b0b4@cp-cute-mist-247e1363.pg2.aidap-global.cn-beijing.volces.com:5432/Database_1767516520571?sslmode=require&channel_binding=require',
      PGDATABASE: 'Database_1767516520571'
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log'
  }]
};
EOF

print_ok "ecosystem.config.js 已更新"

print_step "步骤 4: 重启 PM2 服务"

pm2 delete enterprise-website 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save

print_ok "PM2 服务已重启"

print_step "步骤 5: 等待服务启动并验证"

sleep 10

# 检查服务状态
pm2 status | grep enterprise-website

# 检查端口
if ss -tuln | grep -q ":5000"; then
    print_ok "端口 5000 正在监听"
else
    print_error "端口 5000 未监听"
fi

# 测试服务
curl -I http://localhost:5000 2>&1 | head -5

print_step "步骤 6: 查看初始化日志"

echo "PM2 启动日志（最近 30 行）:"
pm2 logs enterprise-website --lines 30 --nostream | grep -E "微信支付|SDK|初始化|error|Error" || echo "未找到相关日志"

print_step "步骤 7: 测试支付接口"

echo "测试创建支付订单..."
TEST_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -H "Cookie: userId=test-user-123" \
    -d '{"paymentMethod":"wechat","amount":0.01,"description":"测试订单","type":"recharge"}' \
    http://localhost:5000/api/payment/create || true)

HTTP_CODE=$(echo "$TEST_RESPONSE" | tail -1)
RESPONSE_BODY=$(echo "$TEST_RESPONSE" | head -n -1)

echo "HTTP 状态码: $HTTP_CODE"
echo "响应内容:"
echo "$RESPONSE_BODY" | jq . 2>/dev/null || echo "$RESPONSE_BODY"

if [ "$HTTP_CODE" = "200" ]; then
    print_ok "支付接口测试成功！二维码生成正常"
elif [ "$HTTP_CODE" = "500" ]; then
    print_error "支付接口返回 500 错误"
    echo ""
    echo "查看详细错误日志:"
    pm2 logs enterprise-website --err --lines 50 --nostream
else
    print_warning "支付接口返回 $HTTP_CODE"
fi

echo ""
echo "=========================================="
echo "修复完成"
echo "=========================================="
echo ""
echo "如果问题仍然存在，请查看完整日志:"
echo "  pm2 logs enterprise-website --lines 100"
echo ""
echo "或运行完整诊断:"
echo "  bash scripts/diagnose-payment.sh"
echo ""
