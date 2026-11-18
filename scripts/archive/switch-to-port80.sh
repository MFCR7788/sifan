#!/bin/bash

# 将Next.js应用从直接访问3000端口改为通过Nginx 80端口访问
# 提升安全性：Next.js只监听localhost，通过Nginx对外提供服务

set -e

PROJECT_DIR="/root/sifan"
PM2_CONFIG="${PROJECT_DIR}/ecosystem.config.js"
NEXT_START="node_modules/next/dist/bin/next start -p 3000"

echo "======================================"
echo "配置应用通过80端口访问"
echo "======================================"
echo ""

# 1. 检查当前访问方式
echo "步骤 1/4: 检查当前访问..."
echo "检查3000端口是否对外开放..."
if curl -I -m 5 http://127.0.0.1:3000 2>&1 | grep -q "HTTP/1.1 200"; then
    echo "✓ 3000端口可访问（本地）"
fi

echo ""
echo "检查80端口访问..."
if curl -I -m 5 http://127.0.0.1:80 2>&1 | grep -q "HTTP/1.1 200"; then
    echo "✓ 80端口可访问（Nginx代理）"
fi

# 2. 修改Next.js只监听localhost（可选，提升安全性）
echo ""
echo "步骤 2/4: 配置Next.js应用..."
echo "当前配置：Next.js可能监听 0.0.0.0:3000（允许外部直接访问）"
echo "建议配置：Next.js只监听 127.0.0.1:3000（只允许Nginx访问）"

read -p "是否修改为只监听localhost？(推荐选择y以提升安全性) (y/n): " BIND_LOCALHOST

if [ "$BIND_LOCALHOST" = "y" ] || [ "$BIND_LOCALHOST" = "Y" ]; then
    echo "修改PM2配置..."

    # 备份当前配置
    cp ${PM2_CONFIG} ${PM2_CONFIG}.backup

    # 修改配置文件
    sed -i 's/args: .*/args: "start -p 3000 -H 127.0.0.1",/' ${PM2_CONFIG}

    echo "✓ 已配置Next.js只监听127.0.0.1:3000"
    echo "✓ 外部无法直接访问3000端口"
    echo "✓ 所有访问必须通过Nginx 80端口"
else
    echo "⚠️  保持当前配置（Next.js监听0.0.0.0:3000）"
fi

# 3. 重启PM2应用
echo ""
echo "步骤 3/4: 重启应用..."
cd ${PROJECT_DIR}
pm2 restart enterprise-website
echo "✓ 应用已重启"

# 4. 验证配置
echo ""
echo "步骤 4/4: 验证配置..."
echo ""
echo "测试80端口访问（推荐）："
curl -I -m 5 http://127.0.0.1:80 2>&1 | head -n 5

echo ""
echo "测试3000端口本地访问："
curl -I -m 5 http://127.0.0.1:3000 2>&1 | head -n 5

echo ""
echo "======================================"
echo "✅ 配置完成！"
echo "======================================"
echo ""
echo "访问方式："
echo ""
echo "✓ 正确的访问方式："
echo "  http://42.121.218.14"
echo "  http://42.121.218.14:80"
echo "  http://www.zjsifan.com"
echo "  http://zjsifan.com"
echo ""
if [ "$BIND_LOCALHOST" = "y" ] || [ "$BIND_LOCALHOST" = "Y" ]; then
    echo "✗ 不再支持的访问方式："
    echo "  http://42.121.218.14:3000 （已禁用，提升安全性）"
    echo ""
    echo "安全说明："
    echo "  - Next.js只监听127.0.0.1:3000"
    echo "  - 外部无法直接访问3000端口"
    echo "  - 所有访问必须通过Nginx 80端口"
    echo "  - Nginx提供反向代理和安全防护"
fi
echo ""
echo "Nginx反向代理配置："
echo "  外部请求 → Nginx 80端口 → Next.js 3000端口"
echo ""
echo "优势："
echo "  ✓ 只需开放80端口（阿里云安全组）"
echo "  ✓ Nginx提供静态资源缓存"
echo "  ✓ Nginx提供SSL/TLS支持"
echo "  ✓ Nginx提供访问控制和日志"
