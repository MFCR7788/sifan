# GitHub Actions 部署失败解决方案

## 当前问题

GitHub Actions 自动部署失败，错误信息：
```
fatal: unable to access 'https://ghproxy.com/https://github.com/MFCR7788/sifan.git/':
Failed to connect to ghproxy.com port 443: Connection timed out
```

**原因**：服务器无法连接 ghproxy.com 镜像站的 443 端口。

---

## 已实施的修复

### 方案 1：智能镜像选择（已更新）

更新了 `.github/workflows/deploy.yml`，增加了智能检测机制：

1. 清理旧的镜像配置
2. 先测试 GitHub 直连
3. 如果直连失败，尝试多个镜像站：
   - github.com.cnpmjs.org
   - ghproxy.com
   - hub.fastgit.xyz
4. 如果所有镜像都失败，提示手动部署

### 方案 2：构建后上传（新方案）

创建了新的工作流 `.github/workflows/deploy-build-and-upload.yml`：

**优点**：
- ✓ 不依赖服务器的 Git 连接能力
- ✓ 在 GitHub Actions 中构建（环境稳定）
- ✓ 只上传构建产物（体积小）
- ✓ 部署速度快

**缺点**：
- 需要手动切换工作流
- 需要测试验证

---

## 立即测试方案

### 方案 A：测试改进后的部署脚本

```bash
# 推送修改到 GitHub
git add .github/workflows/deploy.yml
git commit -m "fix: 智能镜像选择，解决部署失败问题"
git push origin main
```

查看 GitHub Actions 运行状态。

---

### 方案 B：切换到构建后上传方案

如果方案 A 仍然失败，禁用当前工作流，使用新工作流：

```bash
# 1. 禁用当前工作流
mv .github/workflows/deploy.yml .github/workflows/deploy.yml.disabled

# 2. 启用新工作流
mv .github/workflows/deploy-build-and-upload.yml .github/workflows/deploy.yml

# 3. 推送
git add .github/workflows/
git commit -m "feat: 切换到构建后上传部署方案"
git push origin main
```

---

## 方案 C：继续使用本地上传（推荐）

如果自动部署无法稳定运行，继续使用本地上传方式：

```bash
# 1. 本地构建
pnpm install
pnpm run build

# 2. 打包
cd .next
tar -czf ../build-package.tar.gz .
cd ..

# 3. 上传到服务器
scp build-package.tar.gz root@your-server:/root/sifan/

# 4. 在服务器上部署
ssh root@your-server
cd /root/sifan
tar -xzf build-package.tar.gz -C .next
pm2 restart sifan
```

详细指南：
- `LOCAL-DEPLOY-INSTRUCTIONS.md` - 本地上传部署指南
- `MANUAL-DEPLOY-GUIDE.md` - 手动部署指南

---

## 推荐策略

### 短期（立即执行）

1. **测试方案 A** - 推送改进后的部署脚本，观察运行结果
2. **如果失败** - 切换到方案 C（本地上传），确保网站可更新

### 中期（1-2 天）

1. **测试方案 B** - 切换到构建后上传方案
2. **验证稳定性** - 多次推送测试，确保部署流程稳定

### 长期（1 周内）

1. **解决根本问题** - 服务器网络环境优化（更换地域或配置代理）
2. **恢复自动部署** - 网络问题解决后，切换回 Git clone 方式

---

## 监控和调试

### 查看 GitHub Actions 日志

1. 访问 https://github.com/MFCR7788/sifan/actions
2. 点击具体运行记录
3. 查看详细日志，定位具体失败点

### 常见错误解读

| 错误信息 | 原因 | 解决方案 |
|---------|------|---------|
| `Connection timed out` | 网络连接超时 | 使用本地上传或切换方案 B |
| `Failed to connect to xxx port 443` | HTTPS 端口被阻止 | 检查防火墙或使用 HTTP 镜像 |
| `repository not found` | 仓库地址错误 | 检查 git remote -v 配置 |
| `pm2 process not found` | PM2 未启动服务 | pm2 start ecosystem.config.js |
| `build failed` | 构建错误 | 本地测试 pnpm run build |

---

## 当前状态

- ✓ 服务器 ping github.com 成功
- ✓ 已配置 Git 镜像（ghproxy.com）
- ✗ 镜像站 443 端口连接超时
- ✗ GitHub Actions 自动部署失败

---

## 下一步行动

1. 推送改进后的部署脚本（方案 A）
2. 观察 GitHub Actions 运行结果
3. 如果失败，立即切换到本地上传（方案 C）
4. 网络问题解决前，优先保证网站可更新

**重要原则**：部署方案的选择应基于实际测试结果，不要盲目依赖自动部署。
