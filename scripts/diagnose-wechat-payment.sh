#!/bin/bash

# ==========================================
# 微信支付功能诊断脚本（适配实际架构）
# ==========================================

echo "========================================="
echo "微信支付功能诊断"
echo "========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 检查函数
check_pass() {
    echo -e "${GREEN}✓${NC} $1"
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

check_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# 1. 检查 PM2 状态
echo "1. 检查 PM2 应用状态"
echo "----------------------------------------"
PM2_STATUS=$(pm2 list 2>/dev/null | grep enterprise-website)
if [ -z "$PM2_STATUS" ]; then
    check_fail "PM2 应用 enterprise-website 未运行"
    echo "请先启动应用：pm2 start ecosystem.config.js"
    exit 1
else
    check_pass "PM2 应用 enterprise-website 正在运行"
    echo "   状态: $PM2_STATUS"
fi
echo ""

# 2. 检查端口
echo "2. 检查服务端口"
echo "----------------------------------------"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000)
if [ "$HTTP_CODE" = "200" ]; then
    check_pass "5000 端口服务正常 (HTTP $HTTP_CODE)"
else
    check_fail "5000 端口服务异常 (HTTP $HTTP_CODE)"
fi
echo ""

# 3. 检查 PM2 环境变量
echo "3. 检查 PM2 环境变量"
echo "----------------------------------------"

# 使用 pm2 show 获取环境变量
PM2_ENV=$(pm2 show enterprise-website 2>/dev/null | grep -A 200 "env:")

# 检查关键环境变量
if echo "$PM2_ENV" | grep -q "WECHAT_PAY_APPID"; then
    check_pass "WECHAT_PAY_APPID 已配置"
else
    check_fail "WECHAT_PAY_APPID 未配置"
fi

if echo "$PM2_ENV" | grep -q "WECHAT_PAY_MCHID"; then
    check_pass "WECHAT_PAY_MCHID 已配置"
else
    check_fail "WECHAT_PAY_MCHID 未配置"
fi

if echo "$PM2_ENV" | grep -q "WECHAT_PAY_API_V3_KEY"; then
    check_pass "WECHAT_PAY_API_V3_KEY 已配置"
else
    check_fail "WECHAT_PAY_API_V3_KEY 未配置"
fi

if echo "$PM2_ENV" | grep -q "WECHAT_PAY_SERIAL_NO"; then
    check_pass "WECHAT_PAY_SERIAL_NO 已配置"
else
    check_fail "WECHAT_PAY_SERIAL_NO 未配置"
fi

if echo "$PM2_ENV" | grep -q "WECHAT_PAY_PRIVATE_KEY_PATH"; then
    check_pass "WECHAT_PAY_PRIVATE_KEY_PATH 已配置"
else
    check_fail "WECHAT_PAY_PRIVATE_KEY_PATH 未配置"
fi

if echo "$PM2_ENV" | grep -q "WECHAT_PAY_CERT_PATH"; then
    check_pass "WECHAT_PAY_CERT_PATH 已配置"
else
    check_fail "WECHAT_PAY_CERT_PATH 未配置"
fi
echo ""

# 4. 检查证书文件
echo "4. 检查证书文件"
echo "----------------------------------------"
if [ ! -f "./certs/apiclient_key.pem" ]; then
    check_fail "私钥文件不存在: ./certs/apiclient_key.pem"
    echo "   请从开发环境上传证书文件"
else
    check_pass "私钥文件存在: ./certs/apiclient_key.pem"
    KEY_SIZE=$(wc -c < ./certs/apiclient_key.pem)
    echo "   文件大小: $KEY_SIZE 字节"

    # 检查文件内容格式
    if head -n 1 ./certs/apiclient_key.pem | grep -q "BEGIN.*PRIVATE KEY"; then
        check_pass "私钥文件格式正确"
    else
        check_fail "私钥文件格式可能不正确"
        echo "   第一行应该是: -----BEGIN [TYPE] PRIVATE KEY-----"
    fi
fi

if [ ! -f "./certs/apiclient_cert.pem" ]; then
    check_fail "证书文件不存在: ./certs/apiclient_cert.pem"
else
    check_pass "证书文件存在: ./certs/apiclient_cert.pem"
    CERT_SIZE=$(wc -c < ./certs/apiclient_cert.pem)
    echo "   文件大小: $CERT_SIZE 字节"

    # 检查文件内容格式
    if head -n 1 ./certs/apiclient_cert.pem | grep -q "BEGIN.*CERTIFICATE"; then
        check_pass "证书文件格式正确"
    else
        check_fail "证书文件格式可能不正确"
        echo "   第一行应该是: -----BEGIN CERTIFICATE-----"
    fi
fi
echo ""

# 5. 检查网络连通性
echo "5. 检查网络连通性"
echo "----------------------------------------"
if curl -I -s -o /dev/null --connect-timeout 10 https://api.mch.weixin.qq.com; then
    check_pass "可以访问微信支付 API (api.mch.weixin.qq.com)"
else
    check_fail "无法访问微信支付 API"
    echo "   请检查服务器网络配置或防火墙"
fi
echo ""

# 6. 查看微信支付 SDK 初始化日志
echo "6. 查看 SDK 初始化日志"
echo "----------------------------------------"
echo "--- 最近 100 行日志中的 SDK 初始化信息 ---"
if pm2 logs enterprise-website --lines 100 --nostream 2>/dev/null | grep -q "微信支付 SDK"; then
    pm2 logs enterprise-website --lines 100 --nostream 2>/dev/null | grep -A 20 "微信支付 SDK"
    check_pass "找到 SDK 初始化日志"
else
    check_warn "未找到 SDK 初始化日志，可能应用刚重启"
    echo "   正在查看所有日志..."
    pm2 logs enterprise-website --lines 50 --nostream 2>/dev/null | tail -20
fi
echo ""

# 7. 检查数据库连接
echo "7. 检查数据库连接"
echo "----------------------------------------"
# 使用 PM2 日志检查数据库连接
if pm2 logs enterprise-website --lines 50 --nostream 2>/dev/null | grep -q "数据库连接成功"; then
    check_pass "数据库连接正常"
elif pm2 logs enterprise-website --lines 50 --nostream 2>/dev/null | grep -iq "postgres.*connected"; then
    check_pass "数据库连接正常"
else
    check_warn "未在日志中找到数据库连接确认信息"
fi
echo ""

# 8. 测试支付创建接口
echo "8. 测试支付创建接口"
echo "----------------------------------------"
check_info "注意：需要有效的 userId Cookie，否则会返回 401"

echo ""
echo "--- 测试接口响应 ---"
TEST_RESPONSE=$(curl -s -X POST http://localhost:5000/api/payment/create \
    -H "Content-Type: application/json" \
    -d '{
        "paymentMethod":"wechat",
        "amount":1,
        "description":"测试",
        "type":"recharge"
    }' 2>&1)

echo "$TEST_RESPONSE" | head -20

if echo "$TEST_RESPONSE" | grep -q '"success":true'; then
    check_pass "支付接口测试成功"
elif echo "$TEST_RESPONSE" | grep -q '"success":false'; then
    check_warn "支付接口返回错误"
    ERROR_MSG=$(echo "$TEST_RESPONSE" | grep -o '"error":"[^"]*"' | head -1)
    echo "   错误信息: $ERROR_MSG"
else
    check_fail "支付接口返回异常响应"
fi
echo ""

# 9. 查看最近的错误日志
echo "9. 查看最近的错误日志"
echo "----------------------------------------"
echo "--- 最近 30 行错误日志 ---"
pm2 logs enterprise-website --err --lines 30 --nostream 2>/dev/null | tail -30
echo ""

# 10. 总结和建议
echo "========================================="
echo "诊断总结"
echo "========================================="
echo ""

echo "架构说明："
echo "  - 本项目使用 Next.js 集成微信支付（wechatpay-node-v3 SDK）"
echo "  - 不需要独立的微信支付服务或 /etc/wechatpay/ 目录"
echo "  - 配置通过 PM2 环境变量传递"
echo "  - 证书文件位于项目 ./certs/ 目录"
echo ""

echo "常见问题修复："
echo "  1. 环境变量缺失：重启 PM2 - pm2 restart enterprise-website"
echo "  2. 证书文件缺失：从开发环境上传证书到 ./certs/"
echo "  3. SDK 初始化失败：检查证书文件格式和内容"
echo "  4. API 调用失败：检查网络和商户配置"
echo ""

echo "查看完整日志："
echo "  pm2 logs enterprise-website"
echo ""
echo "查看实时日志："
echo "  pm2 logs enterprise-website --lines 0"
echo ""

echo "========================================="
