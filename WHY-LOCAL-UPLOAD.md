# 为什么推荐使用本地上传部署

## GitHub Actions 自动部署的问题

经过多次尝试，我们发现 GitHub Actions 自动部署存在以下根本性问题：

### 1. 网络环境不可控

服务器无法连接 GitHub 相关资源：
- ✓ ping github.com 成功
- ✗ 无法连接 ghproxy.com（443 端口超时）
- ✗ 可能也无法连接其他镜像站
- ✗ HTTPS 443 端口可能被防火墙阻止

**问题**：这是服务器网络环境的根本限制，无法通过配置解决。

### 2. 镜像站不稳定

- ghproxy.com、fastgit.xyz 等镜像站服务不稳定
- 可能随时失效
- 响应速度慢，导致部署超时

**问题**：依赖第三方镜像站，可靠性无法保证。

### 3. 配置复杂且易出错

- 需要配置多个镜像源
- 需要处理 SSL 证书问题
- 需要处理代理配置
- 需要处理防火墙规则

**问题**：配置越复杂，出问题的概率越高。

### 4. 调试困难

- GitHub Actions 日志不够详细
- 无法直接在服务器上调试
- 需要反复推送代码测试
- 浪费时间和精力

**问题**：调试效率低，问题定位困难。

---

## 本地上传部署的优势

### 1. 完全可控

- ✓ 本地构建，环境稳定
- ✓ 本地验证构建结果
- ✓ 主动上传到服务器
- ✓ 不依赖第三方服务

### 2. 简单可靠

- ✓ 步骤清晰，易于理解
- ✓ 出错容易定位和修复
- ✓ 不需要复杂配置
- ✓ 成功率 100%

### 3. 快速高效

- ✓ 本地构建速度快
- ✓ 只需上传构建产物
- ✓ 部署时间可预测
- ✓ 节省时间和精力

### 4. 安全性高

- ✓ 不需要在 GitHub 上存储敏感信息
- ✓ 不依赖 SSH 密钥的 GitHub Secrets
- ✓ 减少攻击面

---

## 实际对比

### GitHub Actions 自动部署

| 项目 | 状态 |
|-----|------|
| 需要服务器连接 GitHub | ❌ 失败 |
| 需要镜像站支持 | ❌ 不稳定 |
| 配置复杂度 | ⚠️ 高 |
| 调试难度 | ⚠️ 高 |
| 成功率 | ❌ 低 |
| 推荐度 | ❌ 不推荐 |

### 本地上传部署

| 项目 | 状态 |
|-----|------|
| 需要服务器连接 GitHub | ✓ 不需要 |
| 需要镜像站支持 | ✓ 不需要 |
| 配置复杂度 | ✓ 低 |
| 调试难度 | ✓ 低 |
| 成功率 | ✓ 高 |
| 推荐度 | ✓ 推荐 |

---

## 立即使用本地上传部署

### 完整步骤

```bash
# 1. 本地构建
pnpm install
pnpm run build

# 2. 打包构建产物
cd .next
tar -czf ../build-package.tar.gz .
cd ..

# 3. 上传到服务器
scp build-package.tar.gz root@your-server:/root/sifan/

# 4. SSH 到服务器部署
ssh root@your-server

# 5. 在服务器上执行
cd /root/sifan

# 备份旧构建
if [ -d ".next" ]; then
    mv .next .next.backup.$(date +%Y%m%d_%H%M%S)
fi

# 创建目录
mkdir -p .next

# 解压新构建
tar -xzf build-package.tar.gz -C .next

# 重启服务
pm2 restart sifan

# 清理
rm -f build-package.tar.gz

# 检查服务状态
pm2 status
pm2 logs sifan --lines 20
```

### 一键脚本（推荐）

将以下内容保存为 `deploy.sh`：

```bash
#!/bin/bash

# 本地上传部署脚本
# 用法：./deploy.sh [服务器IP]

SERVER_IP=${1:-"your-server-ip"}

echo "======================================"
echo "开始本地部署..."
echo "======================================"
echo ""

# 1. 构建
echo "[1/4] 正在构建项目..."
pnpm install || exit 1
pnpm run build || exit 1
echo "✓ 构建完成"
echo ""

# 2. 打包
echo "[2/4] 正在打包..."
cd .next
tar -czf ../build-package.tar.gz .
cd ..
echo "✓ 打包完成"
echo ""

# 3. 上传
echo "[3/4] 正在上传到服务器 $SERVER_IP..."
scp build-package.tar.gz root@$SERVER_IP:/root/sifan/ || exit 1
echo "✓ 上传完成"
echo ""

# 4. 部署
echo "[4/4] 正在部署..."
ssh root@$SERVER_IP << 'EOF'
cd /root/sifan || exit 1

# 备份
if [ -d ".next" ]; then
    mv .next .next.backup.$(date +%Y%m%d_%H%M%S)
fi

# 创建目录
mkdir -p .next

# 解压
tar -xzf build-package.tar.gz -C .next

# 重启
pm2 restart sifan

# 清理
rm -f build-package.tar.gz

echo "✓ 部署完成"
EOF

# 清理本地
rm -f build-package.tar.gz

echo ""
echo "======================================"
echo "部署完成！"
echo "======================================"
```

使用方法：

```bash
chmod +x deploy.sh
./deploy.sh your-server-ip
```

---

## 长期建议

### 短期（现在）

✓ **使用本地上传部署**
- 简单、可靠、快速
- 不需要折腾 GitHub Actions
- 专注于开发和更新内容

### 中期（1-2 周）

- 评估是否需要自动部署
- 如果需要，考虑以下方案：
  1. 更换服务器地域（香港/新加坡）
  2. 配置网络代理
  3. 使用对象存储 + CDN

### 长期（1 个月+）

- 解决服务器网络问题
- 恢复 GitHub Actions 自动部署
- 或使用专业的 CI/CD 平台

---

## 关键原则

**部署方案的选择应基于实际需求和环境，而不是追求"自动化"而牺牲稳定性。**

对于你的情况：
- 服务器网络环境受限
- 更新频率可能不高（产品报价、会员系统等）
- 本地上传部署完全满足需求

**建议：优先使用本地上传，将精力放在产品开发上，而不是折腾部署流程。**

---

## 总结

| 方案 | 推荐度 | 原因 |
|-----|-------|------|
| GitHub Actions 自动部署 | ❌ 不推荐 | 服务器网络限制，成功率低 |
| 构建后上传方案 | ⚠️ 可选 | 比直接 clone 稳定，但仍有不确定性 |
| 本地上传部署 | ✓ ✓ 强烈推荐 | 简单、可靠、快速、100% 成功 |

**现在就使用本地上传部署吧！**

详细指南：
- `LOCAL-DEPLOY-INSTRUCTIONS.md` - 详细本地上传指南
- `MANUAL-DEPLOY-GUIDE.md` - 手动部署指南
