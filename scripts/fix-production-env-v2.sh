#!/bin/bash

#############################################
# 生产环境配置自动修复脚本 v2
# 功能：
# 1. 备份原始配置文件
# 2. 删除重复的 API Key 配置
# 3. 生成新的 JWT_SECRET
# 4. 验证修改
# 5. 可选：重启应用
#############################################

set -e  # 遇到错误立即退出

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印函数
print_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_section() {
    echo ""
    echo "=========================================="
    echo "$1"
    echo "=========================================="
}

# 检查是否在正确的目录
print_info "检查工作目录..."
if [ ! -f ".env.production" ]; then
    print_error "未找到 .env.production 文件"
    print_info "请确保在项目根目录执行此脚本"
    exit 1
fi

print_success "找到 .env.production 文件"

# 1. 备份配置文件
print_section "步骤 1: 备份原始配置文件"
BACKUP_FILE=".env.production.backup.$(date +%Y%m%d_%H%M%S)"
print_info "备份配置文件到: $BACKUP_FILE"
cp .env.production "$BACKUP_FILE"
print_success "备份完成"

# 2. 修复重复的 API Key
print_section "步骤 2: 修复重复的 API Key 配置"

# 统计 API Key 配置行数
API_KEY_COUNT=$(grep -c "^COZE_WORKLOAD_IDENTITY_API_KEY=" .env.production || true)

if [ "$API_KEY_COUNT" -eq 0 ]; then
    print_warning "未找到 API Key 配置"
elif [ "$API_KEY_COUNT" -eq 1 ]; then
    print_success "API Key 配置正常，无需修复"
else
    print_warning "发现 $API_KEY_COUNT 个 API Key 配置，需要修复"

    # 保留第一个 API Key，删除后续的
    awk '!p && /^COZE_WORKLOAD_IDENTITY_API_KEY=/ {p=1} !/^COZE_WORKLOAD_IDENTITY_API_KEY=/ || p' .env.production > .env.production.tmp
    mv .env.production.tmp .env.production

    NEW_COUNT=$(grep -c "^COZE_WORKLOAD_IDENTITY_API_KEY=" .env.production || true)
    print_success "修复完成，现在有 $NEW_COUNT 个 API Key 配置"
fi

# 3. 生成新的 JWT_SECRET
print_section "步骤 3: 生成新的 JWT_SECRET"

# 检查当前 JWT_SECRET
CURRENT_JWT=$(grep "^JWT_SECRET=" .env.production | cut -d= -f2-)

if [[ "$CURRENT_JWT" == *"your-"* ]] || [[ "$CURRENT_JWT" == *"YOUR_"* ]] || [[ "$CURRENT_JWT" == *"change-in-production"* ]]; then
    print_warning "检测到占位符 JWT_SECRET，需要生成新密钥"

    # 生成新的 JWT_SECRET（使用 openssl）
    if command -v openssl &> /dev/null; then
        NEW_JWT=$(openssl rand -base64 64)
    elif command -v node &> /dev/null; then
        NEW_JWT=$(node -e "console.log(require('crypto').randomBytes(64).toString('base64'))")
    elif command -v python3 &> /dev/null; then
        NEW_JWT=$(python3 -c "import secrets; print(secrets.token_urlsafe(64))")
    else
        print_error "未找到可用的密钥生成工具（openssl、node、python3）"
        exit 1
    fi

    # 替换 JWT_SECRET（使用 awk 避免 sed 的特殊字符问题）
    awk -v new_jwt="$NEW_JWT" '/^JWT_SECRET=/ { print "JWT_SECRET=" new_jwt; next } { print }' .env.production > .env.production.tmp
    mv .env.production.tmp .env.production

    print_success "JWT_SECRET 已更新"
    print_info "新密钥：${NEW_JWT:0:20}..."
else
    print_success "JWT_SECRET 已配置，无需更新"
fi

# 4. 检查并提示对象存储配置
print_section "步骤 4: 检查对象存储配置"

if grep -q "^COZE_BUCKET_ENDPOINT_URL=" .env.production || grep -q "^S3_BUCKET=" .env.production; then
    print_success "对象存储配置已存在"
else
    print_warning "未找到对象存储配置"
    print_info "如果需要使用对象存储功能，请手动添加以下配置："
    echo ""
    echo "COZE_BUCKET_ENDPOINT_URL=你的对象存储端点"
    echo "COZE_BUCKET_NAME=你的存储桶名称"
    echo ""
    echo "或者："
    echo ""
    echo "S3_ACCESS_KEY_ID=你的AccessKey"
    echo "S3_SECRET_ACCESS_KEY=你的SecretKey"
    echo "S3_REGION=cn-beijing"
    echo "S3_BUCKET=你的存储桶名称"
fi

# 5. 验证修改
print_section "步骤 5: 验证修改"

print_info "验证 API Key 配置..."
API_KEY_COUNT=$(grep -c "^COZE_WORKLOAD_IDENTITY_API_KEY=" .env.production || true)
if [ "$API_KEY_COUNT" -eq 1 ]; then
    print_success "✓ API Key 配置正常（1 个配置项）"
else
    print_error "✗ API Key 配置异常（$API_KEY_COUNT 个配置项）"
fi

print_info "验证 JWT_SECRET 配置..."
JWT_SECRET=$(grep "^JWT_SECRET=" .env.production | cut -d= -f2-)
if [[ "$JWT_SECRET" != *"your-"* ]] && [[ "$JWT_SECRET" != *"YOUR_"* ]] && [[ "$JWT_SECRET" != *"change-in-production"* ]]; then
    print_success "✓ JWT_SECRET 已更新为真实密钥"
    print_info "  密钥：${JWT_SECRET:0:20}..."
else
    print_error "✗ JWT_SECRET 仍为占位符"
fi

print_info "检查是否有重复配置..."
DUPLICATE_KEYS=$(awk -F= '{print $1}' .env.production | sort | uniq -d)
if [ -z "$DUPLICATE_KEYS" ]; then
    print_success "✓ 无重复配置项"
else
    print_warning "发现重复配置项："
    echo "$DUPLICATE_KEYS"
fi

# 6. 配置文件权限
print_section "步骤 6: 设置文件权限"

chmod 600 .env.production
print_success "已设置 .env.production 文件权限为 600"

# 7. 可选：重启应用
print_section "步骤 7: 重启应用"

read -p "是否要重启应用？(y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    print_info "查找运行中的应用..."

    if command -v pm2 &> /dev/null; then
        PM2_APPS=$(pm2 list | grep -v "┌\|│\|└" | grep -v "online\|stopped\|PM2" | awk '{print $2}' | grep -v "name" | head -1)

        if [ -n "$PM2_APPS" ]; then
            print_info "找到 PM2 应用: $PM2_APPS"
            print_info "重启应用..."
            pm2 restart $PM2_APPS
            print_success "应用已重启"

            print_info "查看最新日志..."
            sleep 2
            pm2 logs --lines 20 --nostream
        else
            print_warning "未找到运行中的 PM2 应用"
        fi
    else
        print_warning "未找到 PM2，跳过重启步骤"
        print_info "请手动重启应用"
    fi
else
    print_info "跳过重启步骤"
    print_info "请手动重启应用使配置生效"
fi

# 完成
print_section "修复完成"

print_success "配置文件已修复并备份到: $BACKUP_FILE"
print_info "如果发现问题，可以使用以下命令恢复备份："
print_info "  cp $BACKUP_FILE .env.production"
echo ""
print_success "建议操作："
echo "1. 检查应用是否正常运行"
echo "2. 测试关键功能（登录、支付、生图等）"
echo "3. 查看应用日志确认无错误"
echo ""
print_info "查看应用日志命令："
if command -v pm2 &> /dev/null; then
    echo "  pm2 logs --lines 50"
fi
echo ""
