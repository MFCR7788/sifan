#!/bin/bash

# 生产环境 API Key 配置脚本

API_KEY="pat_3rd0Mjj7Wqo0ThZIu2NEbiiL9p2cMLuqaoJw1Sld47Qa9tYOzyDZ90nitaS7VvEv"

echo "开始配置生产环境 API Key..."

# 检查 .env.production 文件是否存在
if [ -f .env.production ]; then
    echo ".env.production 文件存在，检查是否已配置 COZE_WORKLOAD_IDENTITY_API_KEY..."

    # 检查是否已配置
    if grep -q "COZE_WORKLOAD_IDENTITY_API_KEY=" .env.production; then
        echo "⚠️  发现已存在 COZE_WORKLOAD_IDENTITY_API_KEY 配置"
        read -p "是否覆盖现有配置？(y/n): " overwrite
        if [ "$overwrite" != "y" ]; then
            echo "取消配置"
            exit 0
        fi
        # 删除旧行
        sed -i '/^COZE_WORKLOAD_IDENTITY_API_KEY=/d' .env.production
    fi
else
    echo ".env.production 文件不存在，将创建新文件"
fi

# 添加新的 API Key 配置
echo "COZE_WORKLOAD_IDENTITY_API_KEY=$API_KEY" >> .env.production

echo "✅ API Key 已配置到 .env.production 文件"
echo ""
echo "配置内容："
echo "COZE_WORKLOAD_IDENTITY_API_KEY=pat_3rd0...（已隐藏完整值）"
echo ""
echo "下一步：重启应用"
echo "pm2 restart enterprise-website"
