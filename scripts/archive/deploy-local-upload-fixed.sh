#!/bin/bash

# ==========================================
# 本地构建 + 上传部署脚本（无需服务器访问 GitHub）
# 在本地执行此脚本
# ==========================================

set -e

# 配置
SERVER_HOST="42.121.218.14"
SERVER_USER="root"
SERVER_PATH="/root/sifan"
LOCAL_BUILD_DIR="/tmp/sifan-build-$(date +%s)"

echo "=========================================="
echo "本地构建 + 上传部署（无需服务器访问 GitHub）"
echo "时间: $(date)"
echo "=========================================="

# 1. 本地构建
echo ""
echo "步骤 1: 本地构建项目"
echo "----------------------------------------"

# 确保代码是最新的
if [ -n "$(git status --porcelain)" ]; then
    echo "警告: 有未提交的更改，继续部署..."
fi

# 本地安装依赖并构建
echo "安装依赖..."
pnpm install --production=false

echo "构建项目..."
pnpm run build

if [ ! -d ".next" ]; then
    echo "错误: 构建失败，.next 目录不存在"
    exit 1
fi

echo "✓ 构建成功"

# 2. 打包需要的文件
echo ""
echo "步骤 2: 打包部署文件"
echo "----------------------------------------"

# 创建临时目录
rm -rf "$LOCAL_BUILD_DIR"
mkdir -p "$LOCAL_BUILD_DIR"

# 复制必要的文件和目录
echo "复制 .next 目录..."
cp -r .next "$LOCAL_BUILD_DIR/"

echo "复制 node_modules 目录..."
cp -r node_modules "$LOCAL_BUILD_DIR/"

echo "复制 public 目录..."
cp -r public "$LOCAL_BUILD_DIR/" 2>/dev/null || mkdir -p "$LOCAL_BUILD_DIR/public"

echo "复制其他必要文件..."
cp package.json "$LOCAL_BUILD_DIR/"
cp pnpm-lock.yaml "$LOCAL_BUILD_DIR/"
cp next.config.* "$LOCAL_BUILD_DIR/" 2>/dev/null || true
cp tailwind.config.* "$LOCAL_BUILD_DIR/" 2>/dev/null || true
cp tsconfig.json "$LOCAL_BUILD_DIR/" 2>/dev/null || true
cp .env.production "$LOCAL_BUILD_DIR/" 2>/dev/null || true

# 创建 ecosystem.config.js
echo "创建 PM2 配置..."
cat > "$LOCAL_BUILD_DIR/ecosystem.config.js" << EOF
module.exports = {
  apps: [{
    name: 'enterprise-website',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -p 5000',
    cwd: '/root/sifan',
    instances: 2,
    exec_mode: 'cluster',
    autorestart: true,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
      PGDATABASE_URL: 'postgresql://user_7591422450290704422:aef1a966-5890-4e13-a499-e5a8b0e8b0b4@cp-cute-mist-247e1363.pg2.aidap-global.cn-beijing.volces.com:5432/Database_1767516520571?sslmode=require&channel_binding=require',
      PGDATABASE: 'Database_1767516520571'
    },
    error_file: './logs/pm2-error.log',
    out_file: './logs/pm2-out.log'
  }]
};
EOF

# 打包
echo "打包文件..."
cd "$LOCAL_BUILD_DIR"
tar -czf sifan-deploy.tar.gz . && cd -

echo "✓ 打包完成: $LOCAL_BUILD_DIR/sifan-deploy.tar.gz"

# 显示打包大小
DEPLOY_SIZE=$(du -h "$LOCAL_BUILD_DIR/sifan-deploy.tar.gz" | cut -f1)
echo "压缩包大小: $DEPLOY_SIZE"

# 3. 上传到服务器
echo ""
echo "步骤 3: 上传到服务器"
echo "----------------------------------------"

echo "上传压缩包到服务器..."
if command -v scp &> /dev/null; then
    scp "$LOCAL_BUILD_DIR/sifan-deploy.tar.gz" ${SERVER_USER}@${SERVER_HOST}:/tmp/
else
    echo "使用 cat + ssh 方式上传（可能较慢）..."
    cat "$LOCAL_BUILD_DIR/sifan-deploy.tar.gz" | ssh ${SERVER_USER}@${SERVER_HOST} "cat > /tmp/sifan-deploy.tar.gz"
fi

if [ $? -eq 0 ]; then
    echo "✓ 上传成功"
else
    echo "✗ 上传失败"
    rm -rf "$LOCAL_BUILD_DIR"
    exit 1
fi

# 4. 在服务器上部署
echo ""
echo "步骤 4: 服务器端部署"
echo "----------------------------------------"

ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
set -e

echo "进入项目目录..."
cd /root/sifan

echo "备份当前版本..."
if [ -d ".next" ]; then
    mv .next .next.backup.$(date +%s)
fi
if [ -d "node_modules" ]; then
    mv node_modules node_modules.backup.$(date +%s)
fi

echo "解压新版本..."
# 清空当前目录（保留 .git）
find . -maxdepth 1 ! -name '.git' ! -name '.' ! -name '..' -exec rm -rf {} + 2>/dev/null || true

# 解压
tar -xzf /tmp/sifan-deploy.tar.gz -C /root/sifan

echo "清理临时文件..."
rm -f /tmp/sifan-deploy.tar.gz

echo "重启 PM2 服务..."
if pm2 list | grep -q "enterprise-website"; then
    pm2 delete enterprise-website
fi
pm2 start ecosystem.config.js

echo "保存 PM2 配置..."
pm2 save

echo "检查服务状态..."
pm2 list | grep enterprise-website

echo "等待服务启动..."
sleep 5

echo "检查端口监听..."
if ss -tuln | grep -q ":5000"; then
    echo "✓ 端口 5000 正在监听"
else
    echo "⚠ 端口 5000 未监听"
fi

echo "测试服务..."
curl -I http://localhost:5000 2>&1 | head -3

ENDSSH

# 5. 清理本地临时文件
echo ""
echo "步骤 5: 清理本地临时文件"
echo "----------------------------------------"
rm -rf "$LOCAL_BUILD_DIR"
echo "✓ 临时文件已清理"

# 6. 验证部署
echo ""
echo "步骤 6: 验证部署"
echo "----------------------------------------"

echo "测试首页..."
curl -I -m 5 http://www.zjsifan.com 2>&1 | head -3

echo ""
echo "=========================================="
echo "部署流程结束"
echo "=========================================="
