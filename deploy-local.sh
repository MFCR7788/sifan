#!/bin/bash

# ==========================================
# 本地构建 + 上传部署脚本
# 在本地环境执行此脚本
# ==========================================

set -e

# 配置
SERVER_HOST="42.121.218.14"
SERVER_USER="root"
SERVER_PATH="/root/sifan"
LOCAL_BUILD_DIR="/tmp/sifan-build-$(date +%s)"

echo "=========================================="
echo "本地构建 + 上传部署脚本"
echo "时间: $(date)"
echo "=========================================="

# 1. 本地构建
echo ""
echo "步骤 1: 本地构建项目"
echo "----------------------------------------"

# 安装依赖
echo "安装依赖..."
pnpm install --production=false

# 构建项目
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
cp -r public "$LOCAL_BUILD_DIR/"

echo "复制其他必要文件..."
cp package.json "$LOCAL_BUILD_DIR/"
cp pnpm-lock.yaml "$LOCAL_BUILD_DIR/"
cp next.config.ts "$LOCAL_BUILD_DIR/"
cp tsconfig.json "$LOCAL_BUILD_DIR/"

# 创建 PM2 配置
echo "创建 PM2 配置..."
cat > "$LOCAL_BUILD_DIR/ecosystem.config.js" << 'EOF'
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
cd /tmp && tar -czf sifan-deploy.tar.gz -C sifan-build-1768234277 . && cd -

DEPLOY_SIZE=$(du -h /tmp/sifan-deploy.tar.gz | cut -f1)
echo "✓ 打包完成: $DEPLOY_SIZE"

# 3. 上传到服务器
echo ""
echo "步骤 3: 上传到服务器"
echo "----------------------------------------"

echo "上传压缩包到服务器 $SERVER_HOST..."
scp /tmp/sifan-deploy.tar.gz ${SERVER_USER}@${SERVER_HOST}:/tmp/

if [ $? -eq 0 ]; then
    echo "✓ 上传成功"
else
    echo "✗ 上传失败"
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
BACKUP_TIME=$(date +%s)
if [ -d ".next" ]; then
    mv .next .next.backup.$BACKUP_TIME
fi
if [ -d "node_modules" ]; then
    mv node_modules node_modules.backup.$BACKUP_TIME
fi

echo "解压新版本..."
# 清空当前目录（保留 .git）
find /root/sifan -maxdepth 1 ! -name '.git' ! -name '.' ! -name '..' -exec rm -rf {} + 2>/dev/null || true

# 解压
tar -xzf /tmp/sifan-deploy.tar.gz -C /root/sifan

echo "清理临时文件..."
rm -f /tmp/sifan-deploy.tar.gz

echo "重启 PM2 服务..."
pm2 delete enterprise-website 2>/dev/null || true
pm2 start ecosystem.config.js

echo "保存 PM2 配置..."
pm2 save

echo "等待服务启动..."
sleep 10

echo "检查服务状态..."
pm2 status | grep enterprise-website

echo "测试服务..."
curl -I http://localhost:5000 2>&1 | head -5
ENDSSH

if [ $? -eq 0 ]; then
    echo "✓ 服务器部署成功"
else
    echo "⚠ 服务器部署可能有问题，请检查"
fi

# 5. 清理本地临时文件
echo ""
echo "步骤 5: 清理本地临时文件"
echo "----------------------------------------"
rm -rf "$LOCAL_BUILD_DIR"
rm -f /tmp/sifan-deploy.tar.gz
echo "✓ 临时文件已清理"

# 6. 验证部署
echo ""
echo "步骤 6: 验证部署"
echo "----------------------------------------"

echo "测试首页访问..."
curl -I -m 5 http://www.zjsifan.com 2>&1 | head -3

echo ""
echo "=========================================="
echo "部署完成！"
echo "=========================================="
echo "访问地址: http://www.zjsifan.com"
echo "管理后台: http://www.zjsifan.com/admin/members"
echo ""
