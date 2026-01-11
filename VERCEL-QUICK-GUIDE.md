# 快速禁用 Vercel 部署

## 已完成 ✅

- ✅ 已删除 `vercel.json` 配置文件
- ✅ 已提交到 GitHub

---

## 还需要操作（3 步）⚡

### 步骤 1：登录 Vercel Dashboard

访问：**https://vercel.com/dashboard**

### 步骤 2：找到并删除项目

1. 找到 `sifan` 项目
2. 点击进入
3. 点击 **Settings** 标签
4. 滚动到底部
5. 点击 **Delete Project**
6. 确认删除

**或** 禁用 Git 集成：

1. 进入 **Settings** → **Git**
2. 点击 **Disconnect**
3. 确认禁用

### 步骤 3：验证

1. 访问 GitHub 仓库设置：https://github.com/MFCR7788/sifan/settings
2. 检查 **Integrations** 部分
3. 确认没有 Vercel 相关集成

---

## 完成后

- GitHub 代码推送不会再触发 Vercel 部署
- 部署将使用 GitHub Actions → 阿里云服务器
- 或使用本地上传部署脚本

---

## 当前部署方式

### 方式 1：GitHub Actions 自动部署（已配置）

代码推送到 GitHub → 自动部署到阿里云服务器

查看配置：`.github/workflows/deploy.yml`

### 方式 2：本地上传部署（推荐）

在本地沙箱执行：

```bash
chmod +x deploy-local-upload.sh
./deploy-local-upload.sh
```

### 方式 3：服务器手动部署

在服务器（42.121.218.14）执行：

```bash
cd /root/sifan
git pull origin main
pm2 restart enterprise-website
```

---

## 推荐操作

```bash
# 1. 删除本地 vercel.json（已完成）✅
rm vercel.json

# 2. 提交到 GitHub（已完成）✅
git add vercel.json
git commit -m "chore: 删除 Vercel 配置"
git push origin main

# 3. 在 Vercel Dashboard 删除项目 ⚠️
# 访问：https://vercel.com/dashboard
# 找到 sifan 项目 → Delete Project
```

---

## 预期结果

完成后：
- ✅ GitHub 代码托管
- ✅ 部署到阿里云服务器
- ✅ 不会再部署到 Vercel
- ✅ 节省 Vercel 资源
