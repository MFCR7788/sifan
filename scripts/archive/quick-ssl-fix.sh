#!/bin/bash

# ==========================================
# 快速 SSL 证书配置脚本
# 在服务器上直接执行此脚本
# ==========================================

echo "=========================================="
echo "配置 SSL 证书"
echo "时间: $(date)"
echo "=========================================="

# 提示输入邮箱
echo ""
echo "请输入邮箱地址（用于证书过期提醒）："
read -p "Email: " EMAIL

if [ -z "$EMAIL" ]; then
    echo "错误: 邮箱地址不能为空"
    exit 1
fi

echo ""
echo "=========================================="
echo "步骤 1: 获取 SSL 证书"
echo "=========================================="

# 使用邮箱注册并获取证书
certbot --nginx -d zjsifan.com -d www.zjsifan.com \
    --email "$EMAIL" \
    --agree-tos \
    --non-interactive \
    --redirect \
    --hsts

echo ""
echo "=========================================="
echo "步骤 2: 验证 Nginx 配置"
echo "=========================================="

nginx -t

echo ""
echo "=========================================="
echo "步骤 3: 重启 Nginx"
echo "=========================================="

systemctl restart nginx

echo ""
echo "=========================================="
echo "步骤 4: 验证 HTTPS"
echo "=========================================="

# 测试 HTTPS
curl -I https://www.zjsifan.com

echo ""
echo "检查 443 端口是否监听..."
netstat -tuln | grep 443

echo ""
echo "=========================================="
echo "步骤 5: 配置证书自动续期"
echo "=========================================="

# 测试续期
certbot renew --dry-run

# 添加 cron 任务
echo "0 3 * * * root certbot renew --quiet --post-hook 'systemctl reload nginx'" >> /etc/crontab

echo "✓ 自动续期已配置（每天凌晨 3 点检查）"

echo ""
echo "=========================================="
echo "SSL 证书配置完成！"
echo "时间: $(date)"
echo "=========================================="
echo ""
echo "请访问以下网址验证："
echo "  - https://zjsifan.com"
echo "  - https://www.zjsifan.com"
echo ""
echo "浏览器地址栏应该显示锁形图标 🔒"
