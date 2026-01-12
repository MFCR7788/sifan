#!/bin/bash

# GitHub Actions 自动部署配置脚本
# 使用方法：./scripts/setup-github-actions.sh

echo "=== GitHub Actions 自动部署配置 ==="
echo ""

# 检查是否已配置 SSH
echo "1. 检查 SSH 配置..."
if [ ! -f ~/.ssh/id_rsa ]; then
    echo "   ❌ SSH 私钥不存在"
    echo "   正在生成 SSH 密钥..."
    ssh-keygen -t rsa -b 4096 -f ~/.ssh/id_rsa -N ""
    echo "   ✅ SSH 密钥已生成"
else
    echo "   ✅ SSH 私钥已存在"
fi

echo ""
echo "2. 获取 SSH 私钥内容（复制以下内容到 GitHub Secret SSH_PRIVATE_KEY）："
echo "   =============================================================="
cat ~/.ssh/id_rsa
echo "   =============================================================="
echo ""

echo "3. 需要配置的 GitHub Secrets："
echo ""
echo "   请访问以下 URL 配置 GitHub Secrets："
echo "   https://github.com/MFCR7788/sifan/settings/secrets/actions"
echo ""
echo "   需要添加的 Secrets："
echo ""
echo "   [必填]"
echo "   - SSH_HOST          : 你的阿里云服务器 IP 地址（如：47.98.xxx.xxx）"
echo "   - SSH_USERNAME      : 服务器用户名（通常是：root）"
echo "   - SSH_PORT          : SSH 端口（默认：22）"
echo "   - SSH_PRIVATE_KEY   : 复制上方显示的私钥内容"
echo ""
echo "   [可选]"
echo "   - SSH_KEY_PASSPHRASE: 如果私钥有密码短语，填写此字段"
echo ""

read -p "是否已完成 GitHub Secrets 配置？(y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "   ⚠️  请完成配置后再次运行此脚本"
    exit 0
fi

echo ""
echo "4. 测试服务器连接..."
read -p "请输入服务器 IP 地址: " SSH_HOST
read -p "请输入 SSH 端口（默认 22）: " SSH_PORT
SSH_PORT=${SSH_PORT:-22}

if ssh -p $SSH_PORT -o ConnectTimeout=5 -o StrictHostKeyChecking=no root@$SSH_HOST "echo '✅ 连接成功'" 2>/dev/null; then
    echo "   ✅ 服务器连接测试通过"
else
    echo "   ❌ 服务器连接失败，请检查："
    echo "      - IP 地址和端口是否正确"
    echo "      - 服务器防火墙是否允许 SSH 连接"
    echo "      - SSH 服务是否正常运行"
    exit 1
fi

echo ""
echo "5. 启用 GitHub Actions 工作流..."
if [ -f ".github/workflows/deploy-build-and-upload.yml" ]; then
    echo "   ✅ 工作流文件已存在"
else
    echo "   ❌ 工作流文件不存在"
    exit 1
fi

echo ""
echo "=== 配置完成 ==="
echo ""
echo "下一步操作："
echo "1. 访问：https://github.com/MFCR7788/sifan/actions"
echo "2. 点击 'Build and Deploy to Aliyun' → 'Run workflow' 手动触发部署"
echo "3. 或者推送代码到 main 分支自动触发部署"
echo ""
echo "提示：首次部署可能需要较长时间，请耐心等待"
