#!/bin/bash

# 部署前检查脚本
# 使用方法：./scripts/check-deploy.sh <server-ip>

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SSH_HOST=${1:-"your-aliyun-server-ip"}
SSH_USERNAME="root"
SSH_PORT="22"
SSH_KEY_PATH="$HOME/.ssh/id_rsa"

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}    部署前检查${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# 检查计数
PASS=0
FAIL=0
WARN=0

# 检查函数
check_pass() {
    echo -e "${GREEN}✓${NC} $1"
    ((PASS++))
}

check_fail() {
    echo -e "${RED}✗${NC} $1"
    ((FAIL++))
}

check_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
    ((WARN++))
}

echo -e "${BLUE}1. 本地环境检查${NC}"
echo "----------------------------"

# 检查 Git
if command -v git &> /dev/null; then
    check_pass "Git 已安装: $(git --version | cut -d' ' -f3)"
else
    check_fail "Git 未安装"
fi

# 检查 Node.js
if command -v node &> /dev/null; then
    check_pass "Node.js 已安装: $(node --version)"
else
    check_fail "Node.js 未安装"
fi

# 检查 pnpm
if command -v pnpm &> /dev/null; then
    check_pass "pnpm 已安装: $(pnpm --version)"
else
    check_fail "pnpm 未安装，请运行: npm install -g pnpm"
fi

# 检查工作目录
if [ -f "package.json" ]; then
    check_pass "项目目录正确"
else
    check_fail "package.json 未找到，请在项目根目录运行"
fi

# 检查 .env 文件
if [ -f ".env" ] || [ -f ".env.local" ]; then
    check_pass "环境变量文件存在"
else
    check_warn ".env 或 .env.local 文件不存在（生产环境需要配置）"
fi

echo ""
echo -e "${BLUE}2. Git 状态检查${NC}"
echo "----------------------------"

# 检查是否有未提交的修改
git_status=$(git status --porcelain)
if [ -z "$git_status" ]; then
    check_pass "工作目录干净，无未提交的修改"
else
    UNCOMMITTED=$(git status --short | wc -l)
    check_warn "发现 $UNCOMMITTED 个未提交的文件"

    # 检查是否已推送到远程
    AHEAD=$(git rev-list --count origin/main..main 2>/dev/null || echo "0")
    if [ "$AHEAD" -gt 0 ]; then
        check_warn "有 $AHEAD 个提交未推送到 GitHub"
    else
        check_pass "所有提交已推送到 GitHub"
    fi
fi

echo ""
echo -e "${BLUE}3. SSH 连接检查${NC}"
echo "----------------------------"

if [ "$SSH_HOST" = "your-aliyun-server-ip" ]; then
    check_fail "未指定服务器 IP 地址"
    echo ""
    echo "使用方法: ./scripts/check-deploy.sh <server-ip>"
    echo "示例: ./scripts/check-deploy.sh 192.168.1.100"
    exit 1
fi

# 检查 SSH 密钥
if [ -f "$SSH_KEY_PATH" ]; then
    check_pass "SSH 密钥存在: $SSH_KEY_PATH"
    chmod 600 "$SSH_KEY_PATH" 2>/dev/null || true
else
    check_fail "SSH 密钥不存在: $SSH_KEY_PATH"
    echo "  请运行: ssh-keygen -t rsa -b 4096"
fi

# 检查 SSH 连接
if ssh -p $SSH_PORT -i $SSH_KEY_PATH -o ConnectTimeout=5 -o StrictHostKeyChecking=no ${SSH_USERNAME}@${SSH_HOST} "echo 'SSH 连接成功'" 2>/dev/null; then
    check_pass "SSH 连接正常: ${SSH_USERNAME}@${SSH_HOST}:${SSH_PORT}"
else
    check_fail "SSH 连接失败: ${SSH_USERNAME}@${SSH_HOST}:${SSH_PORT}"
    echo "  请检查："
    echo "    1. 服务器 IP 地址是否正确"
    echo "    2. SSH 密钥是否已复制到服务器"
    echo "    3. 服务器防火墙是否开放 22 端口"
fi

echo ""
echo -e "${BLUE}4. 服务器环境检查${NC}"
echo "----------------------------"

if ssh -p $SSH_PORT -i $SSH_KEY_PATH ${SSH_USERNAME}@${SSH_HOST} "command -v node" &> /dev/null; then
    NODE_VERSION=$(ssh -p $SSH_PORT -i $SSH_KEY_PATH ${SSH_USERNAME}@${SSH_HOST} "node --version")
    check_pass "服务器 Node.js: $NODE_VERSION"
else
    check_fail "服务器 Node.js 未安装"
    echo "  请在服务器上安装: curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash - && sudo apt-get install -y nodejs"
fi

if ssh -p $SSH_PORT -i $SSH_KEY_PATH ${SSH_USERNAME}@${SSH_HOST} "command -v pm2" &> /dev/null; then
    PM2_VERSION=$(ssh -p $SSH_PORT -i $SSH_KEY_PATH ${SSH_USERNAME}@${SSH_HOST} "pm2 --version")
    check_pass "服务器 PM2: $PM2_VERSION"
else
    check_fail "服务器 PM2 未安装"
    echo "  请在服务器上安装: npm install -g pm2"
fi

if ssh -p $SSH_PORT -i $SSH_KEY_PATH ${SSH_USERNAME}@${SSH_HOST} "command -v psql" &> /dev/null; then
    check_pass "服务器 PostgreSQL 已安装"
else
    check_fail "服务器 PostgreSQL 未安装"
    echo "  请在服务器上安装: sudo apt-get install postgresql postgresql-contrib"
fi

echo ""
echo -e "${BLUE}5. 磁盘空间检查${NC}"
echo "----------------------------"

# 本地磁盘空间
LOCAL_DISK=$(df -h . | tail -1 | awk '{print $4}')
check_pass "本地可用磁盘空间: $LOCAL_DISK"

# 服务器磁盘空间
if ssh -p $SSH_PORT -i $SSH_KEY_PATH ${SSH_USERNAME}@${SSH_HOST} "df -h /root | tail -1" &> /dev/null; then
    SERVER_DISK=$(ssh -p $SSH_PORT -i $SSH_KEY_PATH ${SSH_USERNAME}@${SSH_HOST} "df -h /root | tail -1 | awk '{print \$4}'")
    check_pass "服务器可用磁盘空间: $SERVER_DISK"
else
    check_warn "无法获取服务器磁盘空间"
fi

echo ""
echo -e "${BLUE}6. 网络检查${NC}"
echo "----------------------------"

# 检查 GitHub 连接
if curl -s --connect-timeout 5 https://github.com > /dev/null; then
    check_pass "可以访问 GitHub"
else
    check_fail "无法访问 GitHub"
fi

# 检查服务器端口 5000 是否被占用
if ssh -p $SSH_PORT -i $SSH_KEY_PATH ${SSH_USERNAME}@${SSH_HOST} "ss -tuln | grep -q :5000" 2>/dev/null; then
    check_warn "服务器 5000 端口已被占用（可能是旧服务）"
    OCCUPIED_BY=$(ssh -p $SSH_PORT -i $SSH_KEY_PATH ${SSH_USERNAME}@${SSH_HOST} "lsof -i :5000 2>/dev/null | tail -1 | awk '{print \$1}'")
    echo "  占用进程: $OCCUPIED_BY"
else
    check_pass "服务器 5000 端口可用"
fi

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}    检查完成${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "总计: ${GREEN}${PASS} 通过${NC}, ${YELLOW}${WARN} 警告${NC}, ${RED}${FAIL} 失败${NC}"
echo ""

if [ $FAIL -eq 0 ]; then
    echo -e "${GREEN}✓ 所有检查通过，可以开始部署！${NC}"
    echo ""
    echo "运行部署命令:"
    echo -e "  ${YELLOW}./scripts/deploy.sh $SSH_HOST${NC}"
    exit 0
else
    echo -e "${RED}✗ 检查失败，请先修复以上问题${NC}"
    exit 1
fi
