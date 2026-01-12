#!/bin/bash

# ==========================================
# 生产环境支付功能诊断脚本
# 在生产服务器上运行
# ==========================================

set -e

echo "=========================================="
echo "生产环境支付功能诊断"
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

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

# 检查函数
check_item() {
    if [ $? -eq 0 ]; then
        print_ok "$1"
        return 0
    else
        print_error "$1"
        return 1
    fi
}

# 检查 PM2 进程
echo ""
echo "1. 检查 PM2 进程"
echo "----------------------------------------"
pm2 status | grep enterprise-website && print_ok "PM2 进程正在运行" || print_error "PM2 进程未运行"

# 检查端口监听
echo ""
echo "2. 检查端口监听"
echo "----------------------------------------"
ss -tuln | grep -q ":5000" && print_ok "端口 5000 正在监听" || print_error "端口 5000 未监听"

# 检查证书文件
echo ""
echo "3. 检查微信支付证书文件"
echo "----------------------------------------"
cd /root/sifan

if [ -f "certs/apiclient_key.pem" ]; then
    print_ok "私钥文件存在: certs/apiclient_key.pem"
    ls -lh certs/apiclient_key.pem
else
    print_error "私钥文件不存在: certs/apiclient_key.pem"
fi

if [ -f "certs/apiclient_cert.pem" ]; then
    print_ok "证书文件存在: certs/apiclient_cert.pem"
    ls -lh certs/apiclient_cert.pem
else
    print_error "证书文件不存在: certs/apiclient_cert.pem"
fi

# 检查环境变量
echo ""
echo "4. 检查环境变量配置"
echo "----------------------------------------"

# 检查 .env 文件
if [ -f ".env" ]; then
    print_ok ".env 文件存在"
else
    print_error ".env 文件不存在"
fi

if [ -f ".env.production" ]; then
    print_ok ".env.production 文件存在"
else
    print_error ".env.production 文件不存在"
fi

# 显示微信支付相关环境变量
echo ""
echo "微信支付环境变量检查:"
echo "----------------------------------------"

# 从 PM2 配置中读取
echo "从 PM2 ecosystem.config.js 检查配置:"
grep -A 20 "env:" ecosystem.config.js 2>/dev/null | grep -E "PGDATABASE|WECHAT" || print_warning "未找到相关配置"

# 检查 NEXT_PUBLIC_BASE_URL
echo ""
echo "NEXT_PUBLIC_BASE_URL 配置:"
echo "----------------------------------------"
export NEXT_PUBLIC_BASE_URL="${NEXT_PUBLIC_BASE_URL:-http://www.zjsifan.com}"
echo "NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL"

# 检查日志
echo ""
echo "5. 检查最近的错误日志"
echo "----------------------------------------"
echo "PM2 错误日志（最近 20 行）:"
pm2 logs enterprise-website --err --lines 20 --nostream

# 测试支付接口
echo ""
echo "6. 测试支付接口"
echo "----------------------------------------"
echo "测试创建支付订单接口..."
TEST_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
    -H "Content-Type: application/json" \
    -H "Cookie: userId=test-user-123" \
    -d '{"paymentMethod":"wechat","amount":0.01,"description":"测试订单","type":"recharge"}' \
    http://localhost:5000/api/payment/create || true)

HTTP_CODE=$(echo "$TEST_RESPONSE" | tail -1)
RESPONSE_BODY=$(echo "$TEST_RESPONSE" | head -n -1)

echo "HTTP 状态码: $HTTP_CODE"
echo "响应内容:"
echo "$RESPONSE_BODY" | head -50

if [ "$HTTP_CODE" = "200" ]; then
    print_ok "支付接口返回 200"
else
    print_error "支付接口返回错误: $HTTP_CODE"
fi

# 生成诊断报告
echo ""
echo "=========================================="
echo "诊断总结"
echo "=========================================="
echo ""
echo "建议检查项:"
echo "1. 确认 .env.production 文件中包含完整的微信支付配置"
echo "2. 确认证书文件路径正确（相对路径 ./certs/xxx.pem）"
echo "3. 确认 NEXT_PUBLIC_BASE_URL 设置为生产环境域名"
echo "4. 检查 PM2 ecosystem.config.js 中的环境变量配置"
echo "5. 查看完整日志: pm2 logs enterprise-website --lines 100"
echo ""
