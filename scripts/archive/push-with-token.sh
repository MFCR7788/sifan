#!/bin/bash
# 使用token推送代码到GitHub

cd /workspace/projects

# 从环境变量或参数获取token
if [ -z "$GITHUB_TOKEN" ]; then
    echo "错误: 请设置 GITHUB_TOKEN 环境变量"
    echo "示例: GITHUB_TOKEN=your_token_here bash push-with-token.sh"
    exit 1
fi

REPO="MFCR7788/sifan"
BRANCH="main"

# 创建临时的GIT_ASKPASS脚本
cat > /tmp/git-askpass.sh << 'EOF'
#!/bin/bash
echo "$GITHUB_TOKEN"
EOF
chmod +x /tmp/git-askpass.sh

export GIT_ASKPASS=/tmp/git-askpass.sh
export GIT_TERMINAL_PROMPT=0
export USERNAME=""

# 使用token推送
echo "正在推送代码到GitHub..."
# token作为用户名，密码留空或使用x
git push "https://${GITHUB_TOKEN}@github.com/${REPO}.git" $BRANCH

if [ $? -eq 0 ]; then
    echo "✓ 推送成功！"
    rm /tmp/git-askpass.sh
else
    echo "✗ 推送失败"
    rm /tmp/git-askpass.sh
    exit 1
fi
