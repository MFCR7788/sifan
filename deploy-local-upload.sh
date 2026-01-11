#!/bin/bash

# ==========================================
# 本地构建 + 上传部署脚本
# 当服务器无法连接 GitHub 时使用此脚本
# ==========================================

set -e

# 配置
SERVER_HOST="42.121.218.14"
SERVER_USER="root"
SERVER_PATH="/root/sifan"
LOCAL_BUILD_DIR="/tmp/sifan-build"

echo "=========================================="
echo "本地构建 + 上传部署"
echo "时间: $(date)"
echo "=========================================="

# 1. 本地构建
echo ""
echo "步骤 1: 本地构建项目"
echo "----------------------------------------"

# 确保代码是最新的
if [ -n "$(git status --porcelain)" ]; then
    echo "错误: 有未提交的更改，请先提交"
    exit 1
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

# 2. 打包需要的文件
echo ""
echo "步骤 2: 打包部署文件"
echo "----------------------------------------"

# 创建临时目录
rm -rf "$LOCAL_BUILD_DIR"
mkdir -p "$LOCAL_BUILD_DIR"

# 复制必要的文件和目录
cp -r .next "$LOCAL_BUILD_DIR/"
cp -r node_modules "$LOCAL_BUILD_DIR/"
cp -r public "$LOCAL_BUILD_DIR/"
cp -r src "$LOCAL_BUILD_DIR/"
cp package.json "$LOCAL_BUILD_DIR/"
cp pnpm-lock.yaml "$LOCAL_BUILD_DIR/"
cp next.config.* "$LOCAL_BUILD_DIR/"
cp tailwind.config.* "$LOCAL_BUILD_DIR/"
cp tsconfig.json "$LOCAL_BUILD_DIR/"
cp .env.production "$LOCAL_BUILD_DIR/"
cp ecosystem.config.js "$LOCAL_BUILD_DIR/" 2>/dev/null || true

# 创建 ecosystem.config.js（如果不存在）
if [ ! -f "$LOCAL_BUILD_DIR/ecosystem.config.js" ]; then
    cat > "$LOCAL_BUILD_DIR/ecosystem.config.js" << 'EOF'
module.exports = {
  apps: [{
    name: 'enterprise-website',
    script: 'npm',
    args: 'start',
    cwd: '/root/sifan',
    env: {
      NODE_ENV: 'production',
      PGDATABASE_URL: 'postgresql://user_7591422450290704422:aef1a966-5890-4e13-a499-e5a8b0e8b0b4@cp-cute-mist-247e1363.pg2.aidap-global.cn-beijing.volces.com:5432/Database_1767516520571?sslmode=require&channel_binding=require',
      PGDATABASE: 'Database_1767516520571',
      DATABASE_URL: 'postgresql://user_7591422450290704422:aef1a966-5890-4e13-a499-e5a8b0e8b4@cp-cute-mist-247e1363.pg2.aidap-global.cn-beijing.volces.com:5432/Database_1767516520571?sslmode=require&channel_binding=require'
    },
    instances: 1,
    autorestart: true,
    error_file: '/root/sifan/logs/err.log',
    out_file: '/root/sifan/logs/out.log'
  }]
};
EOF
fi

# 打包
echo "打包文件..."
cd "$LOCAL_BUILD_DIR"
tar -czf sifan-deploy.tar.gz . && cd -

echo "打包完成: $LOCAL_BUILD_DIR/sifan-deploy.tar.gz"

# 3. 上传到服务器
echo ""
echo "步骤 3: 上传到服务器"
echo "----------------------------------------"

# 上传压缩包
scp "$LOCAL_BUILD_DIR/sifan-deploy.tar.gz" ${SERVER_USER}@${SERVER_HOST}:/tmp/

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

echo "解压新版本..."
tar -xzf /tmp/sifan-deploy.tar.gz -C /root/sifan --strip-components=0

echo "清理临时文件..."
rm -f /tmp/sifan-deploy.tar.gz

echo "检查环境变量配置..."
if [ -f ".env.production" ]; then
    echo "✓ .env.production 存在"
    grep -E "PGDATABASE_URL|DATABASE_URL" .env.production | head -2
else
    echo "✗ .env.production 不存在"
fi

echo "重启 PM2 服务..."
if pm2 list | grep -q "enterprise-website"; then
    echo "使用 ecosystem.config.js 重启..."
    if [ -f "ecosystem.config.js" ]; then
        pm2 delete enterprise-website
        pm2 start ecosystem.config.js
    else
        pm2 restart enterprise-website --update-env
    fi
else
    echo "启动新服务..."
    pm2 start ecosystem.config.js
fi

echo "保存 PM2 配置..."
pm2 save

echo "检查服务状态..."
pm2 list | grep enterprise-website

echo "检查端口监听..."
if netstat -tuln | grep -q ":5000"; then
    echo "✓ 端口 5000 正在监听"
else
    echo "✗ 端口 5000 未监听"
fi

echo "=========================================="
echo "部署完成！"
echo "时间: $(date)"
echo "=========================================="
ENDSSH

# 5. 清理本地临时文件
echo ""
echo "步骤 5: 清理本地临时文件"
echo "----------------------------------------"
rm -rf "$LOCAL_BUILD_DIR"

# 6. 验证部署
echo ""
echo "步骤 6: 验证部署"
echo "----------------------------------------"

echo "测试首页..."
curl -I -m 5 http://www.zjsifan.com 2>&1 | head -1

echo ""
echo "测试用户 API..."
curl -s http://www.zjsifan.com/api/user/me 2>&1 | head -50

echo ""
echo "=========================================="
echo "部署流程结束"
echo "=========================================="
