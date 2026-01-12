#!/bin/bash

# 生产环境快速诊断脚本
# 使用方法：./scripts/diagnose-production.sh server-ip

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

SSH_HOST=${1:-""}

if [ -z "$SSH_HOST" ]; then
    echo -e "${RED}错误: 请提供服务器 IP 地址${NC}"
    echo "使用方法: ./scripts/diagnose-production.sh <server-ip>"
    echo "示例: ./scripts/diagnose-production.sh 192.168.1.100"
    exit 1
fi

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}    生产环境快速诊断${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "服务器: ${SSH_HOST}"
echo ""

echo -e "${BLUE}1. PM2 服务状态${NC}"
echo "----------------------------"
ssh root@${SSH_HOST} "pm2 status | grep enterprise-website || echo '❌ PM2 服务未运行'"
echo ""

echo -e "${BLUE}2. 端口监听检查${NC}"
echo "----------------------------"
if ssh root@${SSH_HOST} "ss -tuln | grep -q :5000"; then
    echo -e "${GREEN}✓ 端口 5000 正在监听${NC}"
else
    echo -e "${RED}✗ 端口 5000 未监听${NC}"
fi
echo ""

echo -e "${BLUE}3. 证书文件检查${NC}"
echo "----------------------------"
if ssh root@${SSH_HOST} "test -f /root/sifan/certs/apiclient_key.pem"; then
    echo -e "${GREEN}✓ 私钥文件存在${NC}"
    ssh root@${SSH_HOST} "ls -la /root/sifan/certs/"
else
    echo -e "${RED}✗ 私钥文件不存在: /root/sifan/certs/apiclient_key.pem${NC}"
    echo -e "  请上传微信支付商户证书"
fi
echo ""

echo -e "${BLUE}4. 环境变量检查${NC}"
echo "----------------------------"
echo "检查关键配置："
ssh root@${SSH_HOST} "echo 'WECHAT_PAY_ENABLE_REAL: \$WECHAT_PAY_ENABLE_REAL'"
ssh root@${SSH_HOST} "echo 'WECHAT_PAY_MCHID: \$WECHAT_PAY_MCHID'"
ssh root@${SSH_HOST} "echo 'WECHAT_PAY_PRIVATE_KEY_PATH: \$WECHAT_PAY_PRIVATE_KEY_PATH'"
ssh root@${SSH_HOST} "echo 'DATABASE_URL 配置: \$(echo \$DATABASE_URL | cut -d'@' -f2 | cut -d'/' -f1)'"
echo ""

echo -e "${BLUE}5. 数据库连接测试${NC}"
echo "----------------------------"
if ssh root@${SSH_HOST} "which psql > /dev/null 2>&1"; then
    if ssh root@${SSH_HOST} "psql -h localhost -U sifan -d sifan -c 'SELECT 1' > /dev/null 2>&1"; then
        echo -e "${GREEN}✓ 数据库连接正常${NC}"
    else
        echo -e "${RED}✗ 数据库连接失败${NC}"
        echo -e "  请检查数据库服务状态和配置"
    fi
else
    echo -e "${YELLOW}⚠ PostgreSQL 客户端未安装${NC}"
fi
echo ""

echo -e "${BLUE}6. 磁盘空间检查${NC}"
echo "----------------------------"
ssh root@${SSH_HOST} "df -h /root | tail -1"
echo ""

echo -e "${BLUE}7. PM2 日志（最近 20 行错误）${NC}"
echo "----------------------------"
ssh root@${SSH_HOST} "pm2 logs enterprise-website --err --lines 20"
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}    诊断完成${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}下一步操作：${NC}"
echo "1. 查看完整日志: ssh root@${SSH_HOST} 'pm2 logs enterprise-website'"
echo "2. 重启服务: ssh root@${SSH_HOST} 'pm2 restart enterprise-website'"
echo "3. 查看故障排查: docs/PRODUCTION_TROUBLESHOOTING.md"
echo ""
