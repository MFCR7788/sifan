#!/bin/bash

# ========================================
# 支付功能实时诊断脚本
# ========================================

echo "========================================="
echo "支付功能实时诊断"
echo "========================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
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

# 1. 检查 PM2 状态
echo "1. 检查 PM2 应用状态"
echo "----------------------------------------"
PM2_STATUS=$(pm2 list | grep enterprise-website)
if [ -z "$PM2_STATUS" ]; then
    check_fail "PM2 应用 enterprise-website 未运行"
    PM2_RUNNING=false
else
    PM2_RUNNING=true
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

# 3. 检查环境变量
echo "3. 检查环境变量"
echo "----------------------------------------"
ENV_FILE=".env.production"
if [ ! -f "$ENV_FILE" ]; then
    check_fail ".env.production 文件不存在"
else
    check_pass ".env.production 文件存在"

    # 检查关键环境变量
    source "$ENV_FILE"

    [ -n "$WECHAT_PAY_APPID" ] && check_pass "WECHAT_PAY_APPID 已配置" || check_fail "WECHAT_PAY_APPID 未配置"
    [ -n "$WECHAT_PAY_MCHID" ] && check_pass "WECHAT_PAY_MCHID 已配置" || check_fail "WECHAT_PAY_MCHID 未配置"
    [ -n "$WECHAT_PAY_API_V3_KEY" ] && check_pass "WECHAT_PAY_API_V3_KEY 已配置" || check_fail "WECHAT_PAY_API_V3_KEY 未配置"
    [ -n "$WECHAT_PAY_SERIAL_NO" ] && check_pass "WECHAT_PAY_SERIAL_NO 已配置" || check_fail "WECHAT_PAY_SERIAL_NO 未配置"
    [ -n "$PGDATABASE_URL" ] && check_pass "PGDATABASE_URL 已配置" || check_fail "PGDATABASE_URL 未配置"
fi
echo ""

# 4. 检查证书文件
echo "4. 检查证书文件"
echo "----------------------------------------"
KEY_PATH="./certs/apiclient_key.pem"
CERT_PATH="./certs/apiclient_cert.pem"

if [ -f "$KEY_PATH" ]; then
    check_pass "私钥文件存在: $KEY_PATH"
    KEY_SIZE=$(wc -c < "$KEY_PATH")
    echo "   文件大小: $KEY_SIZE 字节"
else
    check_fail "私钥文件不存在: $KEY_PATH"
fi

if [ -f "$CERT_PATH" ]; then
    check_pass "证书文件存在: $CERT_PATH"
    CERT_SIZE=$(wc -c < "$CERT_PATH")
    echo "   文件大小: $CERT_SIZE 字节"
else
    check_fail "证书文件不存在: $CERT_PATH"
fi
echo ""

# 5. 检查 PM2 环境变量
echo "5. 检查 PM2 环境变量"
echo "----------------------------------------"
if [ "$PM2_RUNNING" = true ]; then
    # 尝试获取 PM2 环境变量
    PM2_ENV=$(pm2 show enterprise-website | grep -A 50 "env:")
    if echo "$PM2_ENV" | grep -q "WECHAT_PAY_APPID"; then
        check_pass "PM2 环境变量中包含 WECHAT_PAY_APPID"
    else
        check_warn "无法确认 PM2 是否加载了微信支付环境变量"
    fi
else
    check_warn "PM2 未运行，跳过 PM2 环境变量检查"
fi
echo ""

# 6. 检查最近错误日志
echo "6. 检查最近错误日志"
echo "----------------------------------------"
if [ "$PM2_RUNNING" = true ]; then
    echo "--- 最近 20 行错误日志 ---"
    pm2 logs enterprise-website --err --lines 20 --nostream
else
    check_warn "PM2 未运行，无法查看日志"
fi
echo ""

# 7. 检查数据库连接
echo "7. 检查数据库连接"
echo "----------------------------------------"
if [ -n "$PGDATABASE_URL" ]; then
    # 尝试连接数据库
    DB_CHECK=$(psql "$PGDATABASE_URL" -c "SELECT 1;" -t -A 2>&1)
    if [ $? -eq 0 ]; then
        check_pass "数据库连接成功"
        # 检查支付订单表
        TABLE_CHECK=$(psql "$PGDATABASE_URL" -c "SELECT COUNT(*) FROM payment_orders;" -t -A 2>&1)
        if [ $? -eq 0 ]; then
            check_pass "支付订单表存在，当前订单数: $TABLE_CHECK"
        else
            check_fail "无法查询支付订单表"
        fi
    else
        check_fail "数据库连接失败: $DB_CHECK"
    fi
else
    check_warn "未配置数据库连接字符串"
fi
echo ""

# 8. 测试支付接口
echo "8. 测试支付创建接口"
echo "----------------------------------------"
PAYMENT_TEST=$(curl -s -X POST http://localhost:5000/api/payment/create \
    -H "Content-Type: application/json" \
    -d '{"paymentMethod":"wechat","amount":1,"description":"测试","type":"recharge"}' 2>&1)
echo "响应: $PAYMENT_TEST"

if echo "$PAYMENT_TEST" | grep -q "success.*true"; then
    check_pass "支付接口测试成功"
else
    check_fail "支付接口测试失败"
fi
echo ""

# 9. 汇总
echo "========================================="
echo "诊断完成"
echo "========================================="
echo ""
echo "建议:"
echo "1. 如果环境变量未加载，请重启 PM2: pm2 restart enterprise-website"
echo "2. 如果证书文件不存在，请确保从开发环境上传到服务器"
echo "3. 如果数据库连接失败，请检查 PGDATABASE_URL 配置"
echo "4. 查看完整日志: pm2 logs enterprise-website"
echo ""
