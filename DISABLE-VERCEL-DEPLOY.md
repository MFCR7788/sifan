# 禁用 GitHub 自动部署到 Vercel

## 目标

代码托管在 GitHub，但部署到自己的阿里云服务器（42.121.218.14），不自动部署到 Vercel。

---

## 方案一：删除 Vercel 项目（最彻底）⚡

### 步骤 1：登录 Vercel Dashboard

访问：https://vercel.com/dashboard

### 步骤 2：找到并删除项目

1. 找到 `sifan` 项目
2. 点击进入项目设置
3. 滚动到底部
4. 点击 **Delete Project**
5. 确认删除

**优点**：
- 完全移除 Vercel 集成
- GitHub 不会再触发 Vercel 部署
- 避免混淆和资源浪费

---

## 方案二：禁用 Git 集成（保留项目）

### 步骤 1：进入项目设置

1. 访问 https://vercel.com/dashboard
2. 选择 `sifan` 项目
3. 点击 **Settings** 标签

### 步骤 2：禁用 Git 集成

1. 找到 **Git** 部分
2. 点击 **Disconnect** 或 **Disable**
3. 确认禁用

**优点**：
- 保留 Vercel 项目（可能用于测试）
- 但不会自动部署
- 需要手动推送才能部署

---

## 方案三：从 GitHub 移除 Vercel 应用

### 步骤 1：进入 GitHub 仓库设置

访问：https://github.com/MFCR7788/sifan/settings

### 步骤 2：移除 Vercel 应用集成

1. 找到 **Integrations & services** 或 **Webhooks**
2. 找到 **Vercel** 或 **Deployments**
3. 点击 **Remove** 或 **Disable**

---

## 方案四：删除本地 vercel.json 文件

在沙箱和服务器上执行：

```bash
# 删除 vercel.json
rm vercel.json

# 提交到 GitHub
git add vercel.json
git commit -m "chore: 删除 Vercel 配置文件，禁用自动部署"
git push origin main
```

---

## 推荐操作流程（综合方案）⭐

### 1. 删除本地 vercel.json

```bash
rm vercel.json
git add vercel.json
git commit -m "chore: 删除 Vercel 配置"
git push origin main
```

### 2. 在 Vercel 中删除或禁用项目

访问：https://vercel.com/dashboard

选择操作：
- **删除项目**（推荐）- 完全移除
- **禁用 Git 集成** - 保留项目但不再自动部署

### 3. 验证 GitHub 集成

访问：https://github.com/MFCR7788/sifan/settings

检查 **Integrations** 部分，确保没有 Vercel 相关的集成。

---

## 验证禁用成功

### 方法 1：检查 Vercel

- 访问 Vercel Dashboard
- 确认 `sifan` 项目已删除或显示 **No deployments**

### 方法 2：推送代码测试

```bash
# 做一个测试提交
echo "test" >> test.txt
git add test.txt
git commit -m "test: 测试 Vercel 部署是否已禁用"
git push origin main

# 等待几分钟后，检查 Vercel Dashboard
# 应该没有新的部署记录
```

---

## 确认当前的部署方式

项目当前的部署方式：

### 部署到阿里云服务器（当前使用）

```bash
# 方式一：本地上传部署（推荐）
chmod +x deploy-local-upload.sh
./deploy-local-upload.sh

# 方式二：服务器拉取部署（如果网络正常）
cd /root/sifan
git pull origin main
pm2 restart enterprise-website
```

### GitHub Actions 自动部署（已配置）

查看：`.github/workflows/deploy.yml`

这个配置会在代码推送后自动部署到阿里云服务器，**不需要 Vercel**。

---

## 查看当前 Vercel 配置

```bash
# 查看 vercel.json
cat vercel.json

# 如果存在，可以查看 .vercel 目录（如果有的话）
ls -la .vercel 2>/dev/null || echo "没有 .vercel 目录"
```

---

## 常见问题

### Q: 删除 Vercel 项目会影响什么？
A: 不会影响：
- GitHub 代码仓库
- 阿里云服务器的运行
- 现有的生产环境部署

只影响：
- Vercel 上的预览环境（如果有）
- 自动部署到 Vercel

### Q: 我还能使用 Vercel 进行测试吗？
A: 可以，有两种方式：
1. **不删除项目，只禁用 Git 集成** - 需要手动触发部署
2. **删除项目，需要时重新导入** - 重新导入 GitHub 仓库即可

### Q: 如何确保 GitHub Actions 正常工作？
A: 检查 `.github/workflows/deploy.yml` 配置是否正确：
- SSH_HOST: `42.121.218.14`
- SSH_USERNAME: `root`
- SSH_PORT: 正确的端口

---

## 快速操作（推荐）⚡

```bash
# 1. 删除本地 vercel.json
rm vercel.json

# 2. 提交到 GitHub
git add vercel.json
git commit -m "chore: 删除 Vercel 配置，禁用自动部署"
git push origin main

# 3. 访问 Vercel Dashboard 删除项目
# https://vercel.com/dashboard
# 找到 sifan 项目 → Delete Project
```

完成这三步后，GitHub 不会再自动部署到 Vercel。
