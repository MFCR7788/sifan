# GitHub 推送与认证配置指南

## 已完成的操作

✅ 代码已成功推送到 GitHub
✅ 远程仓库 URL 已更新为安全版本（不包含 API Key）

## 当前 Git 状态

- 远程仓库：`https://github.com/MFCR7788/sifan.git`
- 分支：`main`
- 最新提交：包含文生图和封面图生成功能的修复

## GitHub Personal Access Token 说明

GitHub PAT (Personal Access Token) 用于 GitHub 代码推送和操作认证。

**⚠️ 安全提示**：不要将 Token 提交到 Git 仓库，也不要在公开场合分享。

## 安全建议

### ⚠️ 重要：不要将 API Key 暴露在 Git URL 中

当前远程仓库 URL 已经更新为安全版本：
```bash
https://github.com/MFCR7788/sifan.git
```

**不安全的方式（已移除）：**
```bash
https://<your_token>@github.com/MFCR7788/sifan.git  # ❌ API Key 暴露
```

### 推荐的 Git 认证方式

#### 方式 1：使用 Git Credential Helper（推荐）

```bash
# 配置 credential helper
git config --global credential.helper store

# 第一次推送时输入用户名和 Token
# Username: your_github_username
# Password: your_github_token
```

#### 方式 2：使用环境变量（临时）

```bash
export GITHUB_TOKEN=your_github_token
git push
```

#### 方式 3：使用 SSH（最安全）

```bash
# 生成 SSH 密钥
ssh-keygen -t ed25519 -C "your_email@example.com"

# 将公钥添加到 GitHub
cat ~/.ssh/id_ed25519.pub
# 复制公钥内容，在 GitHub 设置中添加

# 更新远程仓库 URL
git remote set-url origin git@github.com:MFCR7788/sifan.git
```

## 日常 Git 操作流程

### 1. 推送新代码

```bash
# 1. 查看当前状态
git status

# 2. 添加修改的文件
git add .

# 3. 提交代码
git commit -m "描述你的修改"

# 4. 推送到 GitHub
git push origin main
```

### 2. 拉取远程更新

```bash
git pull origin main
```

### 3. 查看提交历史

```bash
git log --oneline -10
```

### 4. 查看远程仓库信息

```bash
git remote -v
```

## 本次推送的内容

### 提交 1: 修复文生图和封面图生成 API

**文件修改：**
- `src/app/api/tool/cover-generator/route.ts` - 添加 API Key 配置
- `src/app/api/tool/ai-image-generation/route.ts` - 添加 API Key 配置

**关键修改：**
```typescript
// 添加 API Key 检查和配置
const apiKey = process.env.COZE_WORKLOAD_IDENTITY_API_KEY;
if (!apiKey) {
  throw new Error('生图功能需要配置 API Key，请联系管理员');
}

const config = new Config({
  apiKey: apiKey,
});
```

### 提交 2: 新增配置和调试文档

**新增文件：**
- `PRODUCTION_ENV_SETUP.md` - 生产环境配置指南
- `PRODUCTION_IMAGE_GENERATION_DEBUG.md` - 调试文档（更新）
- `IMAGE_GENERATION_TROUBLESHOOTING.md` - 排查文档（更新）
- `FIX_SUMMARY_2025-01-16.md` - 修复总结

## GitHub Token 安全管理

### 不要做的事情

❌ 不要将 Token 提交到 Git 仓库
❌ 不要在公开的 Issue 或 PR 中分享 Token
❌ 不要在代码中硬编码 Token
❌ 不要在远程仓库 URL 中包含 Token

### 应该做的事情

✅ 将 Token 存储在环境变量中
✅ 使用 Git Credential Helper 管理 Token
✅ 定期更换 Token
✅ 为 Token 设置最小权限（只授予必要的权限）
✅ 在 GitHub 设置中为 Token 设置过期时间

### Token 权限建议

根据项目需求，设置以下权限：
- `repo` - 完整仓库访问权限（推送、拉取）
- `workflow` - 如果需要 GitHub Actions
- `contents` - 读写代码

## 后续部署到生产服务器

代码推送到 GitHub 后，如果使用了 GitHub Actions 自动部署，可以：

### 方式 1：使用 GitHub Actions

配置 GitHub Actions workflow，在代码推送后自动部署到生产服务器。

### 方式 2：手动部署

在生产服务器上手动拉取最新代码：

```bash
# 登录生产服务器
ssh root@42.121.218.14

# 进入项目目录
cd /root/sifan

# 拉取最新代码
git pull origin main

# 重新安装依赖（如果有变更）
pnpm install

# 重启应用
pm2 restart enterprise-website
```

## 查看推送结果

访问 GitHub 仓库查看：
https://github.com/MFCR7788/sifan

可以看到：
- 最新的提交记录
- 修改的文件
- 新增的文档

## 常见问题

### Q1: 如何修改 Git 用户名和邮箱？

```bash
# 修改当前仓库的配置
git config user.name "Your Name"
git config user.email "your.email@example.com"

# 修改全局配置
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Q2: 如何撤销最后一次提交？

```bash
# 撤销提交但保留修改
git reset --soft HEAD~1

# 撤销提交并丢弃修改
git reset --hard HEAD~1

# 如果已经推送，需要强制推送（谨慎使用）
git push origin main --force
```

### Q3: 如何查看 Git 配置？

```bash
# 查看当前仓库配置
git config --local --list

# 查看全局配置
git config --global --list

# 查看所有配置
git config --list
```

### Q4: Token 过期了怎么办？

1. 访问 GitHub Settings → Developer settings → Personal access tokens
2. 生成新的 Token
3. 更新本地配置
4. 删除旧的 Token

---

**配置完成时间**：2025-01-16
**当前 Git 状态**：与远程同步
**仓库地址**：https://github.com/MFCR7788/sifan
