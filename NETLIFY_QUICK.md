# Netlify 部署快速指南

## 5分钟快速部署

### 1️⃣ 注册 Netlify
访问 https://app.netlify.com/signup
使用 GitHub 账号登录

### 2️⃣ 导入项目
1. 点击 "Add new site" → "Import an existing project"
2. 选择 GitHub
3. 授权 Netlify 访问您的 GitHub
4. 选择 `sifan` 仓库

### 3️⃣ 配置构建
```
Branch to deploy: main
Build command: npm run build
Publish directory: .next
```

### 4️⃣ 添加环境变量（高级设置）
```
NODE_VERSION = 20
NPM_VERSION = 10
NODE_ENV = production
```

### 5️⃣ 部署
点击 "Deploy site" 按钮

等待 3-8 分钟，部署完成！

---

## 访问网站

部署成功后，您会获得一个免费域名：
```
https://random-name-12345.netlify.app
```

点击即可访问！

---

## 自定义域名

### 使用 Netlify 子域名
1. 点击 "Change site name"
2. 输入名称（如 `my-website`）
3. 获得：`https://my-website.netlify.app`

### 使用自己的域名
1. 点击 "Add custom domain"
2. 输入域名（如 `www.yourdomain.com`）
3. 配置 DNS（Netlify 会给出具体指引）

---

## 后续更新代码

推送代码到 GitHub，Netlify 自动部署：

```bash
git add .
git commit -m "Update website"
git push
```

---

## 部署失败怎么办？

1. 查看部署日志
2. 检查构建命令是否正确
3. 检查环境变量是否配置
4. 确认本地 `npm run build` 成功

---

## 需要详细文档？

查看：[NETLIFY_DEPLOY_GUIDE.md](./NETLIFY_DEPLOY_GUIDE.md)

---

## 官方资源

- Netlify 文档：https://docs.netlify.com/
- 项目仓库：https://github.com/MFCR7788/sifan

---

**快速开始，5分钟搞定！** 🚀
