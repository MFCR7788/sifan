# GitHub 工作流重复执行问题

## 问题原因

之前有**两个工作流文件**，每次推送代码时都会同时触发：

### 工作流 1：`.github/workflows/deploy.yml`
- **名称**: Auto Deploy to Aliyun
- **方式**: 在服务器上执行 `git clone` + `build` + `deploy`
- **依赖**: 服务器的 Git 连接能力
- **问题**: 服务器无法连接 GitHub，部署失败

### 工作流 2：`.github/workflows/deploy-build-and-upload.yml`
- **名称**: Build and Deploy to Aliyun
- **方式**: 在 GitHub Actions 上构建，然后上传到服务器
- **依赖**: 不依赖服务器的 Git 连接
- **优势**: 更稳定、更可靠

### 重复触发原因

两个工作流都有相同的触发条件：
```yaml
on:
  push:
    branches: [ main ]
  workflow_dispatch:
```

所以每次推送代码到 main 分支时，**两个工作流都会同时运行**！

---

## 已解决的方案

### 操作内容

✓ 已禁用 `deploy.yml`
✓ 重命名为 `deploy.yml.disabled`
✓ 只保留 `deploy-build-and-upload.yml`

### 效果

现在推送代码时，**只会触发一个工作流**：
- ✓ 避免重复执行
- ✓ 节省 GitHub Actions 配额
- ✓ 避免两个部署流程冲突

---

## 当前工作流配置

### 唯一激活的工作流：`deploy-build-and-upload.yml`

**工作流程**：
1. GitHub Actions 检出代码
2. 安装 Node.js 和 pnpm
3. 安装依赖
4. 构建项目
5. 打包构建产物
6. 上传到服务器
7. 服务器解压并重启服务

**优势**：
- ✓ 不依赖服务器的 Git 连接
- ✓ 在 GitHub Actions 上构建（环境稳定）
- ✓ 只上传构建产物（传输更快）
- ✓ 部署失败率低

---

## 如何切换工作流

### 如果需要切换回 deploy.yml

```bash
# 1. 启用 deploy.yml
mv .github/workflows/deploy.yml.disabled .github/workflows/deploy.yml

# 2. 禁用 deploy-build-and-upload.yml
mv .github/workflows/deploy-build-and-upload.yml .github/workflows/deploy-build-and-upload.yml.disabled

# 3. 推送
git add .github/workflows/
git commit -m "chore: 切换回 deploy.yml 工作流"
git push origin main
```

### 如果需要重新启用 deploy-build-and-upload.yml

```bash
# 1. 启用 deploy-build-and-upload.yml
mv .github/workflows/deploy-build-and-upload.yml.disabled .github/workflows/deploy-build-and-upload.yml

# 2. 禁用 deploy.yml
mv .github/workflows/deploy.yml .github/workflows/deploy.yml.disabled

# 3. 推送
git add .github/workflows/
git commit -m "chore: 切换到 deploy-build-and-upload.yml 工作流"
git push origin main
```

---

## 推荐配置

### 短期（现在）

**使用 `deploy-build-and-upload.yml`**：
- ✓ 更稳定
- ✓ 不依赖服务器网络
- ✓ 适合当前环境

### 长期（服务器网络问题解决后）

可以考虑切换回 `deploy.yml`：
- ✓ 直接在服务器上构建
- ✓ 不需要上传构建产物
- ✓ 部署速度更快

但前提是：
- ✓ 服务器可以连接 GitHub
- ✓ 或有可靠的镜像站

---

## 最佳实践

### 1. 工作流文件命名规范

建议：
- `deploy.yml` - 主要部署工作流
- `deploy-*.yml.disabled` - 备用部署工作流（禁用状态）

### 2. 避免重复触发

确保只有一个工作流文件有以下触发条件：
```yaml
on:
  push:
    branches: [ main ]
```

### 3. 工作流职责清晰

- `deploy.yml` - 服务器端构建（依赖服务器环境）
- `deploy-build-and-upload.yml` - 客户端构建（不依赖服务器环境）
- 不要同时启用两个工作流

---

## 当前状态

✓ 只有一个激活的工作流：`deploy-build-and-upload.yml`
✓ 推送代码时只触发一个工作流
✓ 避免了重复执行

---

## 下一步

观察 `deploy-build-and-upload.yml` 的运行结果：

访问：https://github.com/MFCR7788/sifan/actions

如果运行成功，继续使用这个工作流。
如果运行失败，请参考 `DEPLOY-FAILED-SOLUTION.md` 或使用本地上传部署。
