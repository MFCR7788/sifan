# GitHub 上传代码完整指南

## 前提条件

1. 已安装 Git
2. 拥有 GitHub 账号
3. 项目已经在本地开发完成

---

## 方法一：通过命令行上传（推荐）

### 步骤 1：检查 Git 状态

```bash
# 检查当前 Git 状态
git status

# 如果显示 "not a git repository"，需要先初始化
git init
```

### 步骤 2：创建 GitHub 仓库

1. 登录 GitHub：https://github.com
2. 点击右上角 "+" 按钮 → "New repository"
3. 填写仓库信息：
   - **Repository name**：输入仓库名（如 `my-website`）
   - **Description**：仓库描述（可选）
   - **Public/Private**：选择公开或私有
   - **不要勾选** "Initialize this repository with a README"（因为我们有本地代码）
4. 点击 "Create repository"

### 步骤 3：关联远程仓库

创建仓库后，GitHub 会显示几个选项，选择 "Push an existing repository from the command line"

```bash
# 添加远程仓库（替换成你的仓库地址）
git remote add origin https://github.com/your-username/your-repo-name.git

# 或使用 SSH（如果你配置了 SSH 密钥）
# git remote add origin git@github.com:your-username/your-repo-name.git
```

### 步骤 4：检查文件状态

```bash
# 查看当前状态
git status
```

如果看到 `nothing to commit, working tree clean`，说明代码已经提交过了，直接进入步骤 6。

### 步骤 5：提交代码（如果有未提交的更改）

```bash
# 添加所有文件到暂存区
git add .

# 查看将要提交的文件
git status

# 提交代码
git commit -m "Initial commit" 或 "添加描述"

# 或查看修改后提交
git add -A
git commit -m "feat: 完成网站核心功能开发"
```

### 步骤 6：推送到 GitHub

```bash
# 首次推送，设置上游分支
git push -u origin main

# 或如果默认分支是 master
# git push -u origin master
```

完成！您的代码现在已经上传到 GitHub 了。

---

## 方法二：使用 GitHub Desktop（图形界面）

### 步骤 1：安装 GitHub Desktop

1. 下载：https://desktop.github.com/
2. 安装并登录 GitHub 账号

### 步骤 2：创建仓库

1. 在 GitHub Desktop 中点击 "File" → "New Repository"
2. 填写仓库名和描述
3. 选择本地项目路径
4. 点击 "Create Repository"

### 步骤 3：提交和推送

1. 在左侧查看更改的文件
2. 填写提交信息
3. 点击 "Commit to main"
4. 点击 "Publish repository" 推送到 GitHub

---

## 方法三：通过 GitHub 网页上传（仅适用于小型项目）

### 步骤 1：创建仓库

1. 在 GitHub 创建新仓库
2. 勾选 "Initialize this repository with a README"
3. 创建仓库

### 步骤 2：上传文件

1. 点击 "Add file" → "Upload files"
2. 拖拽文件或点击选择文件
3. 填写提交信息
4. 点击 "Commit changes"

**注意：** 此方法不推荐用于大型项目。

---

## 常用 Git 命令速查

```bash
# 查看状态
git status

# 添加所有文件
git add .

# 添加指定文件
git add filename

# 提交
git commit -m "提交信息"

# 查看远程仓库
git remote -v

# 添加远程仓库
git remote add origin https://github.com/username/repo.git

# 推送
git push origin main

# 拉取最新代码
git pull origin main

# 查看提交历史
git log

# 查看分支
git branch

# 创建并切换到新分支
git checkout -b feature-branch
```

---

## 推送后续开发代码

### 第一次之后的推送

```bash
# 1. 查看状态
git status

# 2. 添加修改的文件
git add .

# 3. 提交
git commit -m "feat: 添加新功能描述"

# 4. 推送
git push
```

### 推荐的提交信息格式

```bash
# 新功能
git commit -m "feat: 添加用户登录功能"

# 修复问题
git commit -m "fix: 修复首页图片加载失败的问题"

# 文档更新
git commit -m "docs: 更新部署文档"

# 重构代码
git commit -m "refactor: 优化组件结构"

# 样式调整
git commit -m "style: 调整按钮颜色和间距"
```

---

## 创建 .gitignore 文件

在项目根目录创建 `.gitignore` 文件，忽略不需要上传的文件：

```
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Next.js
.next/
out/
build/
dist/

# Production
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Local env files
.env
.env*.local

# Vercel
.vercel

# TypeScript
*.tsbuildinfo
next-env.d.ts

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Temporary files
*.tmp
temp/
```

---

## 常见问题解决

### 1. 推送时提示 "Updates were rejected"

```bash
# 先拉取远程最新代码
git pull origin main --rebase

# 再推送
git push origin main
```

### 2. 提示 "fatal: remote origin already exists"

```bash
# 删除原有的远程仓库
git remote remove origin

# 重新添加
git remote add origin https://github.com/your-username/your-repo.git
```

### 3. 推送时需要输入密码

建议配置 SSH 密钥，避免每次输入密码：

```bash
# 1. 生成 SSH 密钥
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# 2. 启动 SSH 代理
eval "$(ssh-agent -s)"

# 3. 添加密钥
ssh-add ~/.ssh/id_rsa

# 4. 复制公钥内容
cat ~/.ssh/id_rsa.pub

# 5. 在 GitHub 添加 SSH 密钥
#    Settings → SSH and GPG keys → New SSH key
#    粘贴公钥内容

# 6. 将远程仓库地址改为 SSH
git remote set-url origin git@github.com:your-username/your-repo.git

# 7. 测试连接
ssh -T git@github.com
```

### 4. 文件太大无法推送

```bash
# 查找大文件
find . -type f -size +50M -ls

# 移除大文件或添加到 .gitignore
git rm --cached large-file.zip
git commit -m "移除大文件"
git push
```

### 5. 提交信息写错了

```bash
# 修改最后一次提交信息
git commit --amend -m "新的提交信息"

# 如果已经推送，需要强制推送（谨慎使用）
git push --force
```

---

## 推荐的工作流程

```bash
# 1. 开始新功能开发
git checkout -b feature/new-feature

# 2. 开发并提交
git add .
git commit -m "feat: 添加新功能"

# 3. 切换到主分支，更新代码
git checkout main
git pull origin main

# 4. 合并功能分支
git merge feature/new-feature

# 5. 推送到远程
git push origin main

# 6. 删除功能分支（可选）
git branch -d feature/new-feature
```

---

## 完整示例

```bash
# 1. 检查 Git 状态
git status

# 2. 如果未初始化，初始化仓库
git init

# 3. 创建 .gitignore 文件
nano .gitignore
# 添加需要忽略的内容

# 4. 添加所有文件
git add .

# 5. 提交
git commit -m "Initial commit"

# 6. 创建 GitHub 仓库（在网页上操作）

# 7. 关联远程仓库
git remote add origin https://github.com/your-username/your-repo.git

# 8. 推送
git push -u origin main
```

---

## 下一步

代码上传到 GitHub 后，您可以：

1. **部署到 Vercel**：参考 DEPLOYMENT_GUIDE.md 中的 Vercel 部分
2. **配置 CI/CD**：使用 GitHub Actions 自动化部署
3. **团队协作**：邀请其他开发者共同开发
4. **版本管理**：使用 Git 管理代码版本

---

## 需要帮助？

- Git 官方文档：https://git-scm.com/doc
- GitHub 帮助：https://docs.github.com
- 在线学习：https://learngitbranching.js.org

祝您上传顺利！🚀
