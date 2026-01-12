#!/bin/bash

echo "=== 测试支付接口 ==="
echo ""

# 获取用户 ID（需要先登录，从浏览器复制 cookie）
# 1. 登录后，打开浏览器开发者工具（F12）
# 2. 切换到 Application 或 Storage 标签
# 3. 找到 Cookies → http://localhost:5000
# 4. 复制 userId 的值，替换下面的 YOUR_USER_ID
USER_ID="YOUR_USER_ID"

if [ "$USER_ID" = "YOUR_USER_ID" ]; then
  echo "⚠️  请先修改脚本，将 YOUR_USER_ID 替换为你的实际 userId"
  echo "   userId 可以从浏览器 Cookie 中获取"
  exit 1
fi

echo "使用 userId: $USER_ID"
echo ""

# 测试支付接口
curl -X POST http://localhost:5000/api/payment/create \
  -H "Content-Type: application/json" \
  -H "Cookie: userId=$USER_ID" \
  -d '{
    "paymentMethod": "wechat",
    "amount": 0.01,
    "description": "测试支付",
    "type": "recharge",
    "metadata": {}
  }' \
  -v

echo ""
echo "=== 测试完成 ==="
