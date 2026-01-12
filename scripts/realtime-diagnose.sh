#!/bin/bash

# ==========================================
# 实时支付功能诊断脚本
# 在生产服务器上运行，实时查看日志
# ==========================================

set -e

echo "=========================================="
echo "实时支付功能诊断"
echo "时间: $(date)"
echo "=========================================="

# 颜色输出
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
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

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

print_section() {
    echo ""
    echo "=========================================="
    echo " $1"
    echo "=========================================="
}

cd /root/sifan

print_section "1. PM2 服务状态"

pm2 status
echo ""

if pm2 status | grep -q "enterprise-website.*online"; then
    print_ok "PM2 进程正在运行"
else
    print_error "PM2 进程未运行"
    exit 1
fi

print_section "2. 端口监听检查"

if ss -tuln | grep -q ":5000"; then
    print_ok "端口 5000 正在监听"
    ss -tuln | grep ":5000"
else
    print_error "端口 5000 未监听"
fi

print_section "3. 环境变量配置"

echo "=== 从 PM2 配置中读取环境变量 ==="
pm2 show enterprise-website | grep -A 50 "env:" | grep -E "WECHAT|NEXT_PUBLIC|PGDATABASE" || print_warning "未找到环境变量"

echo ""
echo "=== 检查 .env.production 文件 ==="
if [ -f ".env.production" ]; then
    print_ok ".env.production 文件存在"
    echo "微信支付配置:"
    grep "WECHAT" .env.production || print_error "未找到微信支付配置"
    echo ""
    echo "基础 URL 配置:"
    grep "NEXT_PUBLIC_BASE_URL" .env.production || print_warning "未找到 NEXT_PUBLIC_BASE_URL"
else
    print_error ".env.production 文件不存在"
fi

print_section "4. 证书文件检查"

echo "检查证书目录:"
ls -lh certs/ 2>/dev/null || print_error "certs 目录不存在"

echo ""
if [ -f "certs/apiclient_key.pem" ]; then
    print_ok "私钥文件存在"
    echo "  大小: $(ls -lh certs/apiclient_key.pem | awk '{print $5}')"
    echo "  前几行内容:"
    head -2 certs/apiclient_key.pem | sed 's/^/    /'
else
    print_error "私钥文件不存在: certs/apiclient_key.pem"
fi

echo ""
if [ -f "certs/apiclient_cert.pem" ]; then
    print_ok "证书文件存在"
    echo "  大小: $(ls -lh certs/apiclient_cert.pem | awk '{print $5}')"
    echo "  前几行内容:"
    head -2 certs/apiclient_cert.pem | sed 's/^/    /'
else
    print_error "证书文件不存在: certs/apiclient_cert.pem"
fi

print_section "5. SDK 初始化日志"

echo "=== 查找微信支付 SDK 初始化日志 ==="
echo ""
pm2 logs enterprise-website --lines 100 --nostream | grep -E "微信支付|SDK|初始化|WECHAT" | tail -20 || print_warning "未找到 SDK 初始化日志"

print_section "6. 最近的错误日志"

echo "=== 最近 50 行错误日志 ==="
echo ""
pm2 logs enterprise-website --err --lines 50 --nostream

print_section "7. 最近的所有日志"

echo "=== 最近 30 行日志（包含支付相关） ==="
echo ""
pm2 logs enterprise-website --lines 30 --nostream

print_section "8. 数据库连接测试"

echo "尝试连接数据库..."
export PGPASSWORD='aef1a966-5890-4e13-a499-e5a8b0e8b0b4'
if psql -h cp-cute-mist-247e1363.pg2.aidap-global.cn-beijing.volces.com \
     -p 5432 \
     -U user_7591422450290704422 \
     -d Database_1767516520571 \
     -c "SELECT 1;" 2>/dev/null | grep -q "1"; then
    print_ok "数据库连接成功"
else
    print_error "数据库连接失败"
fi

print_section "9. 测试支付接口"

echo "提示：测试支付接口需要有效的 userId"
echo ""
echo "步骤 1：请先在浏览器登录，获取 userId（打开浏览器控制台 -> Application -> Cookies -> userId）"
echo ""
read -p "输入 userId（留空跳过）: " TEST_USER_ID

if [ -n "$TEST_USER_ID" ]; then
    echo ""
    echo "步骤 2：测试支付接口创建订单..."
    echo ""

    TEST_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -H "Cookie: userId=$TEST_USER_ID" \
        -d '{
            "paymentMethod":"wechat",
            "amount":0.01,
            "description":"测试订单",
            "type":"recharge"
        }' \
        http://localhost:5000/api/payment/create)

    HTTP_CODE=$(echo "$TEST_RESPONSE" | tail -1)
    RESPONSE_BODY=$(echo "$TEST_RESPONSE" | head -n -1)

    echo "HTTP 状态码: $HTTP_CODE"
    echo ""
    echo "响应内容:"
    echo "$RESPONSE_BODY" | jq . 2>/dev/null || echo "$RESPONSE_BODY"

    if [ "$HTTP_CODE" = "200" ]; then
        echo ""
        print_ok "支付接口测试成功！二维码生成正常"

        # 提取订单号
        ORDER_NO=$(echo "$RESPONSE_BODY" | jq -r '.orderNo' 2>/dev/null)
        if [ -n "$ORDER_NO" ]; then
            echo ""
            print_info "订单号: $ORDER_NO"

            # 测试查询接口
            echo ""
            echo "步骤 3：测试查询订单状态..."
            QUERY_RESPONSE=$(curl -s -w "\n%{http_code}" \
                "http://localhost:5000/api/orders/by-number/$ORDER_NO")

            QUERY_HTTP_CODE=$(echo "$QUERY_RESPONSE" | tail -1)
            QUERY_BODY=$(echo "$QUERY_RESPONSE" | head -n -1)

            echo "HTTP 状态码: $QUERY_HTTP_CODE"
            echo "响应内容:"
            echo "$QUERY_BODY" | jq . 2>/dev/null || echo "$QUERY_BODY"
        fi
    else
        echo ""
        print_error "支付接口返回错误: $HTTP_CODE"
    fi
else
    echo ""
    print_warning "跳过支付接口测试"
fi

print_section "10. 实时监控模式"

echo ""
echo "现在进入实时日志监控模式..."
echo "请尝试在浏览器中触发支付操作，观察日志输出"
echo ""
echo "按 Ctrl+C 退出监控"
echo ""
read -p "按回车键开始监控..."

pm2 logs enterprise-website --lines 0

print_section "诊断完成"

echo ""
echo "=========================================="
echo "诊断建议"
echo "=========================================="
echo ""
echo "如果发现问题，请按以下步骤排查："
echo ""
echo "1. SDK 未初始化"
echo "   - 检查 .env.production 中微信支付配置"
echo "   - 检查证书文件是否存在"
echo "   - 检查 PM2 环境变量是否正确"
echo ""
echo "2. 数据库错误"
echo "   - 确认数据库连接字符串正确"
echo "   - 测试数据库连接"
echo "   - 检查用户是否已登录"
echo ""
echo "3. 支付接口调用失败"
echo "   - 查看详细错误日志"
echo "   - 检查微信支付配置是否正确"
echo "   - 检查网络连接"
echo ""
echo "4. 其他问题"
echo "   - 运行: pm2 logs enterprise-website --lines 200"
echo "   - 或运行: bash scripts/diagnose-payment.sh"
echo ""
