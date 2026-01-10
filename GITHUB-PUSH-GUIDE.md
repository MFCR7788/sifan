# GitHub 推送指南

## 📋 当前状态

你的本地有 9 个提交需要推送到 GitHub：

```bash
9e58280 feat: 图片分析工具和HTTPS安全配置脚本
c39212e feat: 实现网站图片优化，提升加载速度
4d828d3 feat: 更新网站标题为魔法超人3.0系统
8eee106 feat: 添加完整的服务器部署脚本包，支持自动拉取代码和一键部署
f118e56 fix: 修复Nginx配置错误，解决域名无法访问问题
```

## 🚀 推送方法（选择其一）

---

### 方法一：使用 Personal Access Token（最推荐）

#### 步骤 1：生成 GitHub Token

1. 访问 https://github.com/settings/tokens
2. 点击 "Generate new token" → "Generate new token (classic)"
3. 配置 Token：
   - **Note**: sifan-project-token
   - **Expiration**: 选择过期时间（建议 90 days 或 No expiration）
   - **Select scopes**: 勾选 `repo` （完全控制仓库）
4. 点击 "Generate token"
5. **复制生成的 token**（只显示一次，务必保存）

#### 步骤 2：配置 Git 使用 Token

在项目目录执行：

```bash
# 方法 A：直接使用 token（推荐）
git remote set-url origin https://<YOUR_TOKEN>@github.com/MFCR7788/sifan.git

# 方法 B：使用 git credential helper（避免每次输入）
git config credential.helper store
git push origin main
# 输入用户名：你的 GitHub 用户名
# 输入密码：刚才生成的 token
```

#### 步骤 3：推送到 GitHub

```bash
git push origin main
```

#### 步骤 4：验证推送成功

访问：https://github.com/MFCR7788/sifan

---

### 方法二：使用 SSH Key（长期使用）

#### 步骤 1：生成 SSH Key

```bash
# 生成新的 SSH Key（使用 ed25519 算法）
ssh-keygen -t ed25519 -C "your_email@example.com"

# 或使用 RSA 算法（兼容性更好）
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

按提示操作：
- 回车使用默认路径
- 可以设置密码（可选）
- 完成后会生成密钥文件

#### 步骤 2：复制 SSH 公钥

```bash
# 查看并复制公钥内容
cat ~/.ssh/id_ed25519.pub
# 或
cat ~/.ssh/id_rsa.pub
```

#### 步骤 3：添加到 GitHub

1. 访问 https://github.com/settings/keys
2. 点击 "New SSH key"
3. 配置：
   - **Title**: sifan-server
   - **Key type**: Authentication Key
   - **Key**: 粘贴刚才复制的公钥内容
4. 点击 "Add SSH key"

#### 步骤 4：测试 SSH 连接

```bash
ssh -T git@github.com
```

如果成功，会看到：
```
Hi MFCR7788! You've successfully authenticated...
```

#### 步骤 5：修改 Git 远程仓库地址

```bash
# 切换为 SSH 地址
git remote set-url origin git@github.com:MFCR7788/sifan.git
```

#### 步骤 6：推送到 GitHub

```bash
git push origin main
```

---

### 方法三：使用 GitHub CLI（快速）

#### 步骤 1：安装 GitHub CLI

**Windows:**
```powershell
winget install --id GitHub.cli
```

**macOS:**
```bash
brew install gh
```

**Linux:**
```bash
sudo apt install gh
# 或
curl -fsSL https://cli.github.com/packages/githubcli-archive-keyring.gpg | sudo dd of=/usr/share/keyrings/githubcli-archive-keyring.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/usr/share/keyrings/githubcli-archive-keyring.gpg] https://cli.github.com/packages stable main" | sudo tee /etc/apt/sources.list.d/github-cli.list > /dev/null
sudo apt update
sudo apt install gh
```

#### 步骤 2：登录 GitHub

```bash
gh auth login
```

按提示操作：
- 选择 GitHub.com
- 选择 HTTPS 或 SSH
- 使用浏览器认证或输入 token

#### 步骤 3：推送代码

```bash
git push origin main
```

如果遇到认证问题，GitHub CLI 会自动处理。

---

## 🔍 推送后验证

### 1. 检查 GitHub 仓库

访问：https://github.com/MFCR7788/sifan

确认：
- ✅ 最新提交已显示
- ✅ 提交信息正确
- ✅ 文件已更新

### 2. 检查本地状态

```bash
# 查看当前分支状态
git status

# 应该显示：
# Your branch is up to date with 'origin/main'.
```

### 3. 查看提交历史

```bash
# 查看最近 10 次提交
git log --oneline -10

# 或查看远程提交
git log --oneline origin/main -10
```

---

## 🛠️ 常见问题

### 问题 1：推送失败，提示认证错误

**错误信息：**
```
fatal: Authentication failed for 'https://github.com/...'
```

**解决方案：**
1. 检查 token 是否正确
2. 检查 token 是否有 `repo` 权限
3. 检查 token 是否已过期
4. 重新生成 token 并更新

### 问题 2：推送时提示 permission denied

**错误信息：**
```
fatal: Permission denied (publickey)
```

**解决方案：**
1. 检查 SSH key 是否正确添加到 GitHub
2. 检查是否使用正确的 SSH key
3. 测试 SSH 连接：`ssh -T git@github.com`
4. 使用 HTTPS 方式替代

### 问题 3：推送缓慢或超时

**解决方案：**
1. 检查网络连接
2. 使用代理（如果需要）
3. 增加超时时间：
   ```bash
   git config --global http.postBuffer 524288000
   ```

### 问题 4：冲突警告

**警告信息：**
```
! [rejected] main -> main (fetch first)
```

**解决方案：**
```bash
# 先拉取远程代码
git pull origin main --rebase

# 再推送
git push origin main
```

---

## 📝 推送成功后的操作

### 1. 在服务器上拉取最新代码

```bash
# SSH 登录服务器
ssh root@42.121.218.14

# 进入项目目录
cd /workspace/projects

# 拉取最新代码
git pull origin main

# 或使用更新脚本
sudo ./update-server.sh
```

### 2. 验证部署

```bash
# 检查 PM2 状态
pm2 status

# 检查 Nginx 状态
sudo service nginx status

# 测试网站访问
curl -I http://localhost:5000/
```

---

## 🎯 快速开始（推荐流程）

### 第一次推送（使用 Token）

```bash
# 1. 生成 token（访问 GitHub 网站）
# https://github.com/settings/tokens

# 2. 配置 Git
git remote set-url origin https://<YOUR_TOKEN>@github.com/MFCR7788/sifan.git

# 3. 推送代码
git push origin main
```

### 后续推送（如果配置了 credential helper）

```bash
# 直接推送
git push origin main
```

### 或使用 SSH（长期使用）

```bash
# 1. 生成 SSH key
ssh-keygen -t ed25519 -C "your_email@example.com"

# 2. 添加到 GitHub（访问设置页面）

# 3. 修改远程地址
git remote set-url origin git@github.com:MFCR7788/sifan.git

# 4. 推送
git push origin main
```

---

## ✅ 检查清单

推送前确认：
- [ ] 已保存所有工作
- [ ] 已生成 GitHub Token 或 SSH Key
- [ ] 测试了认证方式

推送后确认：
- [ ] GitHub 仓库已更新
- [ ] 提交信息正确
- [ ] 本地状态同步
- [ ] 服务器已拉取最新代码

---

## 📞 获取帮助

### 查看远程仓库配置

```bash
git remote -v
```

### 查看 Git 配置

```bash
git config --list | grep -E 'user|remote|credential'
```

### 测试连接

```bash
# HTTPS 方式
curl -I https://github.com/MFCR7788/sifan

# SSH 方式
ssh -T git@github.com
```

---

**选择适合你的推送方式，然后执行！** 🚀
