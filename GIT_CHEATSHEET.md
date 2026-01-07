# Git 常用命令速查表

## 🚀 首次上传代码到 GitHub

```bash
# 1. 初始化 Git 仓库（如果还没有）
git init

# 2. 添加所有文件
git add .

# 3. 提交代码
git commit -m "Initial commit"

# 4. 关联 GitHub 仓库
git remote add origin https://github.com/your-username/your-repo.git

# 5. 推送到 GitHub
git push -u origin main
```

## 📝 日常开发工作流

```bash
# 查看当前状态
git status

# 添加修改的文件
git add .

# 提交
git commit -m "feat: 添加新功能"

# 推送到 GitHub
git push
```

## 🔄 常用命令

```bash
# 查看提交历史
git log

# 查看远程仓库
git remote -v

# 拉取最新代码
git pull origin main

# 创建新分支
git checkout -b feature-branch

# 切换分支
git checkout main

# 合并分支
git merge feature-branch

# 删除分支
git branch -d feature-branch
```

## 💡 提交信息格式

```bash
# 新功能
git commit -m "feat: 添加用户登录功能"

# 修复问题
git commit -m "fix: 修复首页图片加载失败"

# 文档更新
git commit -m "docs: 更新部署文档"

# 重构
git commit -m "refactor: 优化组件结构"

# 样式调整
git commit -m "style: 调整按钮样式"
```

## 🚨 问题解决

```bash
# 推送被拒绝，先拉取
git pull origin main --rebase

# 修改最后一次提交信息
git commit --amend -m "新的提交信息"

# 撤销上一次提交（保留修改）
git reset --soft HEAD~1

# 撤销上一次提交（不保留修改）
git reset --hard HEAD~1

# 查看远程仓库地址
git remote -v

# 更改远程仓库地址
git remote set-url origin https://github.com/new-username/new-repo.git
```

## 📌 记住这些就够了

```bash
git add .          # 添加文件
git commit -m ""    # 提交
git push            # 推送
git pull            # 拉取
git status          # 查看状态
git log             # 查看历史
```

---

需要详细教程？查看 [GITHUB_UPLOAD_GUIDE.md](./GITHUB_UPLOAD_GUIDE.md)
