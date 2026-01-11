#!/bin/bash

# GitHub 连接测试脚本
# 用于验证网络问题是否已解决

echo "======================================"
echo "GitHub 连接测试"
echo "======================================"
echo ""

success_count=0
fail_count=0

# 测试函数
test_connection() {
    local name=$1
    local command=$2

    echo -n "测试 $name... "
    if eval "$command" > /dev/null 2>&1; then
        echo "✓ 成功"
        ((success_count++))
        return 0
    else
        echo "✗ 失败"
        ((fail_count++))
        return 1
    fi
}

# 1. DNS 解析
echo "--- DNS 解析测试 ---"
nslookup github.com > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✓ DNS 解析正常"
    nslookup github.com | grep "Address:" | tail -1
else
    echo "✗ DNS 解析失败"
    ((fail_count++))
fi
echo ""

# 2. 基础网络连接
echo "--- 基础网络测试 ---"
ping -c 2 8.8.8.8 > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✓ 基础网络连接正常"
    ((success_count++))
else
    echo "✗ 基础网络连接失败"
    ((fail_count++))
fi
echo ""

# 3. GitHub HTTP 连接
echo "--- GitHub 连接测试 ---"
test_connection "GitHub HTTP (80端口)" "curl -I --connect-timeout 5 http://github.com"
test_connection "GitHub HTTPS (443端口)" "curl -I --connect-timeout 5 https://github.com"
test_connection "GitHub API" "curl -I --connect-timeout 5 https://api.github.com"
test_connection "GitHub Raw" "curl -I --connect-timeout 5 https://raw.githubusercontent.com"
echo ""

# 4. Git 操作测试
echo "--- Git 操作测试 ---"
cd /tmp
if [ -d "github-test" ]; then
    rm -rf github-test
fi

echo -n "测试 Git 克隆... "
timeout 30 git clone https://github.com/octocat/Hello-World.git github-test > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✓ 成功"
    ((success_count++))
    rm -rf github-test
else
    echo "✗ 失败"
    ((fail_count++))
fi
echo ""

# 5. 镜像站测试
echo "--- GitHub 镜像站测试 ---"
test_connection "ghproxy.com" "curl -I --connect-timeout 3 https://ghproxy.com"
test_connection "gitee.com" "curl -I --connect-timeout 3 https://gitee.com"
test_connection "fastgit.xyz" "curl -I --connect-timeout 3 https://hub.fastgit.xyz"
echo ""

# 6. Git 配置检查
echo "--- Git 配置检查 ---"
git config --global --get-regexp url | while read -r line; do
    echo "  $line"
done
echo ""

# 总结
echo "======================================"
echo "测试总结"
echo "======================================"
echo "成功: $success_count"
echo "失败: $fail_count"
echo ""

if [ $fail_count -eq 0 ]; then
    echo "✓ 所有测试通过！GitHub 连接正常"
    echo ""
    echo "下一步："
    echo "1. 在 .github/workflows/deploy.yml 中删除 'if: false' 行"
    echo "2. 推送代码到 GitHub"
    echo "3. 检查 GitHub Actions 是否正常运行"
    exit 0
else
    echo "✗ 部分测试失败，GitHub 连接仍有问题"
    echo ""
    echo "建议："
    echo "1. 查看具体失败的测试项"
    echo "2. 参考 NETWORK-FIX-GUIDE.md 中的详细解决方案"
    echo "3. 或继续使用本地上传方式部署"
    exit 1
fi
