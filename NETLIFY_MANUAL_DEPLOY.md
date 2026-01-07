# Netlify 直接部署指南

## ⚠️ 重要说明

您的项目是 **Next.js SSR 应用**（包含多个 API 路由），对于这类项目，Netlify **必须通过 GitHub 自动部署**才能正常工作。

**原因：**
- Next.js SSR 需要 Node.js 运行时
- API 路由需要服务器端处理
- Netlify CLI 手动部署只能处理静态站点

---

## ✅ 推荐方案：通过 GitHub 部署（5分钟）

### 为什么这是最佳方案？

1. **自动化**：每次推送代码自动部署
2. **免费**：完全免费，无需额外费用
3. **简单**：只需配置一次，以后自动部署
4. **完整功能**：支持所有 Next.js 特性（SSR、API 路由等）

### 部署步骤

#### 1. 您的代码已在 GitHub
✅ 仓库地址：https://github.com/MFCR7788/sifan

#### 2. 访问 Netlify 并导入项目
1. 打开：https://app.netlify.com/signup
2. 使用 **GitHub 账号**登录（推荐）
3. 点击 **"Add new site"** → **"Import an existing project"**
4. 选择 **GitHub**
5. 授权 Netlify 访问您的 GitHub（如果首次使用）
6. 选择 **`sifan`** 仓库

#### 3. 配置构建设置

```
Branch to deploy: main

Build command:
npm run build

Publish directory:
.next
```

#### 4. 添加环境变量

点击 **"Show advanced"** → **"Build environment variables"**：

| 变量名 | 值 |
|--------|-----|
| `NODE_VERSION` | `20` |
| `NPM_VERSION` | `10` |
| `NODE_ENV` | `production` |

#### 5. 部署

点击 **"Deploy site"** 按钮

等待 3-8 分钟，部署完成！

---

## ⚡ 超快速部署（复制这些设置）

直接使用以下配置：

```
仓库：https://github.com/MFCR7788/sifan
分支：main
构建命令：npm run build
发布目录：.next
```

环境变量：
```
NODE_VERSION = 20
NPM_VERSION = 10
NODE_ENV = production
```

---

## 🔄 后续自动部署

配置完成后，每次推送代码都会自动部署：

```bash
# 本地修改代码
git add .
git commit -m "Update website"
git push

# Netlify 自动检测并部署！
```

---

## 🌐 访问您的网站

部署成功后，Netlify 会提供一个免费域名：
```
https://random-name-12345.netlify.app
```

点击即可访问！

### 自定义域名（可选）

1. 在 Netlify 控制台点击 **"Change site name"**
2. 输入您想要的名称（如 `sifan-website`）
3. 获得：`https://sifan-website.netlify.app`

---

## ❓ 常见问题

### Q1: 我能不用 GitHub，直接部署吗？

**答：** 对于 Next.js SSR 应用，不能直接通过拖拽或命令行部署。必须使用 GitHub（或 GitLab、Bitbucket）。

### Q2: 为什么不能用 CLI 手动部署？

**答：** Next.js SSR 需要：
- Node.js 运行时
- API 路由处理
- 服务端渲染

Netlify CLI 手动部署只支持静态站点。

### Q3: 部署后 API 路由能用吗？

**答：** 可以！通过 GitHub 部署时，Netlify 会自动处理 API 路由，并使用 Netlify Functions 运行。

### Q4: 数据库连接怎么办？

**答：** 在 Netlify 环境变量中配置：
```
DATABASE_URL=your_database_connection_string
```

然后在项目中使用这个环境变量。

---

## 📊 部署时间参考

| 操作 | 时间 |
|------|------|
| 首次部署 | 3-8 分钟 |
| 代码更新部署 | 1-3 分钟 |
| 零代码更新 | < 1 分钟 |

---

## 🎯 快速检查清单

部署前确认：

- [ ] GitHub 仓库存在：https://github.com/MFCR7788/sifan
- [ ] 代码已推送
- [ ] 本地构建成功：`npm run build`
- [ ] 准备好 Netlify 账号

---

## 🚀 立即开始

1. 打开：https://app.netlify.com/signup
2. 使用 GitHub 登录
3. 导入 `sifan` 仓库
4. 使用上面的配置
5. 点击 Deploy

**5分钟后，您的网站就上线了！**

---

## 📚 参考资源

- Netlify Next.js 指南：https://docs.netlify.com/frameworks/next-js/
- 项目仓库：https://github.com/MFCR7788/sifan

---

## 🎉 完成！

部署成功后，您会得到一个在线网站，并且每次推送代码都会自动更新。

**祝您部署顺利！** 🚀
