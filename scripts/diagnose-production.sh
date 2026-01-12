#!/bin/bash

# 生产环境支付功能自动诊断脚本
# 用途：快速检查支付功能相关的配置和服务状态

set -e

echo "================================"
echo "生产环境支付功能诊断脚本"
echo "================================"
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 统计变量
PASS_COUNT=0
FAIL_COUNT=0
WARN_COUNT=0

# 检查函数
check_pass() {
    echo -e "${GREEN}✓ PASS${NC}: $1"
    ((PASS_COUNT++))
}

check_fail() {
    echo -e "${RED}✗ FAIL${NC}: $1"
    ((FAIL_COUNT++))
}

check_warn() {
    echo -e "${YELLOW}⚠ WARN${NC}: $1"
    ((WARN_COUNT++))
}

# 获取项目根目录
PROJECT_ROOT=$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)
echo "项目根目录: $PROJECT_ROOT"
echo ""

# 1. 检查 PM2 服务状态
echo "================================"
echo "1. 检查 PM2 服务状态"
echo "================================"
if command -v pm2 &> /dev/null; then
    PM2_STATUS=$(pm2 status 2>/dev/null || echo "")
    if echo "$PM2_STATUS" | grep -q "online"; then
        check_pass "PM2 服务运行中"
        echo "$PM2_STATUS"
    else
        check_fail "PM2 服务未运行或状态异常"
        echo "$PM2_STATUS"
    fi
else
    check_fail "PM2 未安装"
fi
echo ""

# 2. 检查端口监听
echo "================================"
echo "2. 检查端口监听"
echo "================================"
if ss -tuln 2>/dev/null | grep -q ':5000'; then
    check_pass "端口 5000 正在监听"
    ss -tuln | grep ':5000'
else
    check_fail "端口 5000 未监听"
fi
echo ""

# 3. 测试 HTTP 响应
echo "================================"
echo "3. 测试 HTTP 响应"
echo "================================"
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:5000 || echo "000")
if [ "$HTTP_CODE" = "200" ]; then
    check_pass "HTTP 服务响应正常 (200)"
else
    check_fail "HTTP 服务响应异常 ($HTTP_CODE)"
fi
echo ""

# 4. 检查环境变量文件
echo "================================"
echo "4. 检查环境变量文件"
echo "================================"
ENV_FILE="$PROJECT_ROOT/.env.production"
if [ -f "$ENV_FILE" ]; then
    check_pass "环境变量文件存在: $ENV_FILE"
    
    # 检查关键环境变量
    echo "检查关键环境变量配置:"
    
    if grep -q "WECHAT_PAY_APPID=" "$ENV_FILE"; then
        APPID=$(grep "WECHAT_PAY_APPID=" "$ENV_FILE" | cut -d'=' -f2)
        if [ -n "$APPID" ]; then
            check_pass "WECHAT_PAY_APPID 已配置"
        else
            check_fail "WECHAT_PAY_APPID 值为空"
        fi
    else
        check_fail "WECHAT_PAY_APPID 未配置"
    fi
    
    if grep -q "WECHAT_PAY_MCHID=" "$ENV_FILE"; then
        MCHID=$(grep "WECHAT_PAY_MCHID=" "$ENV_FILE" | cut -d'=' -f2)
        if [ -n "$MCHID" ]; then
            check_pass "WECHAT_PAY_MCHID 已配置"
        else
            check_fail "WECHAT_PAY_MCHID 值为空"
        fi
    else
        check_fail "WECHAT_PAY_MCHID 未配置"
    fi
    
    if grep -q "WECHAT_PAY_PRIVATE_KEY_PATH=" "$ENV_FILE"; then
        KEY_PATH=$(grep "WECHAT_PAY_PRIVATE_KEY_PATH=" "$ENV_FILE" | cut -d'=' -f2)
        echo "  WECHAT_PAY_PRIVATE_KEY_PATH=$KEY_PATH"
    else
        check_fail "WECHAT_PAY_PRIVATE_KEY_PATH 未配置"
    fi
    
    if grep -q "PGDATABASE_URL=" "$ENV_FILE"; then
        check_pass "PGDATABASE_URL 已配置"
    else
        check_fail "PGDATABASE_URL 未配置"
    fi
    
    if grep -q "NEXT_PUBLIC_BASE_URL=" "$ENV_FILE"; then
        BASE_URL=$(grep "NEXT_PUBLIC_BASE_URL=" "$ENV_FILE" | cut -d'=' -f2)
        check_pass "NEXT_PUBLIC_BASE_URL 已配置: $BASE_URL"
    else
        check_fail "NEXT_PUBLIC_BASE_URL 未配置"
    fi
else
    check_fail "环境变量文件不存在: $ENV_FILE"
fi
echo ""

# 5. 检查证书文件
echo "================================"
echo "5. 检查微信支付证书文件"
echo "================================"
if [ -f "$ENV_FILE" ]; then
    KEY_PATH=$(grep "WECHAT_PAY_PRIVATE_KEY_PATH=" "$ENV_FILE" | cut -d'=' -f2)
    CERT_PATH=$(grep "WECHAT_PAY_CERT_PATH=" "$ENV_FILE" | cut -d'=' -f2)
    
    # 处理相对路径
    if [[ "$KEY_PATH" == ./* ]]; then
        KEY_PATH="$PROJECT_ROOT/${KEY_PATH#./}"
    fi
    if [[ "$CERT_PATH" == ./* ]]; then
        CERT_PATH="$PROJECT_ROOT/${CERT_PATH#./}"
    fi
    
    echo "私钥路径: $KEY_PATH"
    echo "证书路径: $CERT_PATH"
    
    if [ -f "$KEY_PATH" ]; then
        check_pass "私钥文件存在"
        
        # 检查文件权限
        KEY_PERMS=$(stat -c "%a" "$KEY_PATH" 2>/dev/null || stat -f "%Lp" "$KEY_PATH" 2>/dev/null || echo "000")
        if [ "$KEY_PERMS" = "600" ] || [ "$KEY_PERMS" = "644" ]; then
            check_pass "私钥文件权限正确 ($KEY_PERMS)"
        else
            check_warn "私钥文件权限可能不安全 ($KEY_PERMS)，建议设置为 600"
        fi
        
        # 检查文件内容
        if grep -q "BEGIN PRIVATE KEY" "$KEY_PATH" || grep -q "BEGIN RSA PRIVATE KEY" "$KEY_PATH"; then
            check_pass "私钥文件格式正确"
        else
            check_fail "私钥文件格式错误"
        fi
    else
        check_fail "私钥文件不存在: $KEY_PATH"
    fi
    
    if [ -f "$CERT_PATH" ]; then
        check_pass "证书文件存在"
        
        CERT_PERMS=$(stat -c "%a" "$CERT_PATH" 2>/dev/null || stat -f "%Lp" "$CERT_PATH" 2>/dev/null || echo "000")
        if [ "$CERT_PERMS" = "600" ] || [ "$CERT_PERMS" = "644" ]; then
            check_pass "证书文件权限正确 ($CERT_PERMS)"
        else
            check_warn "证书文件权限可能不安全 ($CERT_PERMS)，建议设置为 600"
        fi
        
        if grep -q "BEGIN CERTIFICATE" "$CERT_PATH"; then
            check_pass "证书文件格式正确"
        else
            check_fail "证书文件格式错误"
        fi
    else
        check_fail "证书文件不存在: $CERT_PATH"
    fi
else
    check_warn "无法检查证书文件（环境变量文件不存在）"
fi
echo ""

# 6. 检查数据库连接
echo "================================"
echo "6. 检查数据库连接"
echo "================================"
if [ -f "$ENV_FILE" ]; then
    source "$ENV_FILE"
    if [ -n "$PGDATABASE_URL" ]; then
        if command -v psql &> /dev/null; then
            if psql "$PGDATABASE_URL" -c "SELECT 1;" &> /dev/null; then
                check_pass "数据库连接成功"
            else
                check_fail "数据库连接失败"
            fi
        else
            check_warn "psql 命令不存在，无法测试数据库连接"
        fi
    else
        check_warn "PGDATABASE_URL 未配置，无法测试数据库连接"
    fi
else
    check_warn "无法检查数据库连接（环境变量文件不存在）"
fi
echo ""

# 7. 检查 Node.js 版本
echo "================================"
echo "7. 检查 Node.js 版本"
echo "================================"
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v)
    check_pass "Node.js 版本: $NODE_VERSION"
    
    # 检查 package.json 中的依赖
    if [ -f "$PROJECT_ROOT/package.json" ]; then
        EXPECTED_NODE=$(grep '"engines"' -A 2 "$PROJECT_ROOT/package.json" | grep '"node"' | grep -oP '\d+\.\d+' || echo "")
        if [ -n "$EXPECTED_NODE" ]; then
            echo "  期望版本: $EXPECTED_NODE"
        fi
    fi
else
    check_fail "Node.js 未安装"
fi
echo ""

# 8. 检查 PM2 日志
echo "================================"
echo "8. 检查最近的 PM2 错误日志"
echo "================================"
if command -v pm2 &> /dev/null; then
    echo "最近的 20 行错误日志:"
    pm2 logs enterprise-website --err --lines 20 --nostream 2>&1 || echo "  无法读取日志"
else
    check_warn "PM2 未安装，无法读取日志"
fi
echo ""

# 9. 检查磁盘空间
echo "================================"
echo "9. 检查磁盘空间"
echo "================================"
DISK_USAGE=$(df -h "$PROJECT_ROOT" | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -lt 80 ]; then
    check_pass "磁盘空间充足 (使用率: ${DISK_USAGE}%)"
else
    check_warn "磁盘空间不足 (使用率: ${DISK_USAGE}%)"
fi
df -h "$PROJECT_ROOT" | tail -1
echo ""

# 10. 检查内存使用
echo "================================"
echo "10. 检查内存使用"
echo "================================"
if [ -f /proc/meminfo ]; then
    TOTAL_MEM=$(free -m | grep Mem | awk '{print $2}')
    USED_MEM=$(free -m | grep Mem | awk '{print $3}')
    MEM_PERCENT=$((USED_MEM * 100 / TOTAL_MEM))
    
    if [ "$MEM_PERCENT" -lt 80 ]; then
        check_pass "内存使用正常 (${USED_MEM}MB / ${TOTAL_MEM}MB, ${MEM_PERCENT}%)"
    else
        check_warn "内存使用较高 (${USED_MEM}MB / ${TOTAL_MEM}MB, ${MEM_PERCENT}%)"
    fi
else
    check_warn "无法读取内存信息"
fi
echo ""

# 总结
echo "================================"
echo "诊断总结"
echo "================================"
echo -e "${GREEN}通过: $PASS_COUNT${NC}"
echo -e "${YELLOW}警告: $WARN_COUNT${NC}"
echo -e "${RED}失败: $FAIL_COUNT${NC}"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}✓ 所有关键检查通过！${NC}"
    exit 0
elif [ $FAIL_COUNT -le 2 ]; then
    echo -e "${YELLOW}⚠ 发现少量问题，请参考上述检查结果修复${NC}"
    exit 1
else
    echo -e "${RED}✗ 发现多个严重问题，请立即修复！${NC}"
    exit 2
fi
