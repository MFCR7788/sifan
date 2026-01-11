# GitHub Actions 自动部署测试指南

## 已完成的修改

✓ 已删除 `.github/workflows/deploy.yml` 中的 `if: false`
✓ 已更新部署脚本，添加完整的部署流程
✓ 已配置 Git 镜像加速（ghproxy.com）

---

## 立即测试步骤

### 步骤 1：测试服务器 Git 连接

在服务器上运行测试脚本：

```bash
# 上传 test-git-sync.sh 到服务器
chmod +x test-git-sync.sh
./test-git-sync.sh
```

**重要**：如果测试失败，GitHub Actions 自动部署也会失败！

---

### 步骤 2：触发 GitHub Actions

在本地推送代码触发部署：

```bash
# 添加修改
git add .github/workflows/deploy.yml

# 提交
git commit -m "feat: 启用 GitHub Actions 自动部署"

# 推送到 GitHub
git push origin main
```

---

### 步骤 3：查看 GitHub Actions 运行状态

1. 打开 GitHub 仓库页面
2. 点击 "Actions" 标签
3. 查看最新的工作流运行状态
4. 点击具体运行记录查看详细日志

---

## 常见问题排查

### 问题 1：工作流未触发

**检查清单**：
- ✓ 代码是否推送到 main 分支？
- ✓ `.github/workflows/deploy.yml` 文件是否存在？
- ✓ 文件格式是否正确（YAML 缩进）？

**解决**：
```bash
# 检查工作流文件
cat .github/workflows/deploy.yml

# 手动触发（在 GitHub 网页上）
Actions -> Auto Deploy to Aliyun -> Run workflow
```

---

### 问题 2：SSH 连接失败

**错误信息**：
```
Error: ssh: connect to host xxx port xxx: Connection refused
```

**解决**：
1. 检查 SSH 配置（GitHub Secrets）
   - SSH_HOST: 服务器 IP
   - SSH_USERNAME: 服务器用户名（通常是 root）
   - SSH_PRIVATE_KEY: 私钥内容
   - SSH_PORT: SSH 端口（通常是 22）

2. 确保服务器防火墙开放 22 端口

---

### 问题 3：Git 拉取失败

**错误信息**：
```
fatal: unable to access 'https://github.com/...': Connection timed out
```

**解决**：
1. 确保服务器上已配置镜像（脚本会自动配置）
2. 手动测试镜像是否可用：
   ```bash
   curl -I https://ghproxy.com
   ```

3. 如果镜像不可用，更换为其他镜像：
   ```bash
   # 修改部署脚本中的镜像地址
   # ghproxy.com -> github.com.cnpmjs.org 或 hub.fastgit.xyz
   ```

---

### 问题 4：npm/pnpm 安装失败

**错误信息**：
```
Error: Cannot find module 'xxx'
```

**解决**：
1. 确保 `package.json` 和 `pnpm-lock.yaml` 已提交到 Git
2. 确保服务器已安装 pnpm：
   ```bash
   pnpm --version
   ```

3. 如果镜像配置有问题，手动配置：
   ```bash
   pnpm config set registry https://registry.npmmirror.com
   ```

---

### 问题 5：构建失败

**错误信息**：
```
Error: Build failed with xxx errors
```

**解决**：
1. 本地先测试构建：
   ```bash
   npm run build
   ```

2. 检查 TypeScript 错误：
   ```bash
   npx tsc --noEmit
   ```

3. 查看完整日志定位具体错误

---

### 问题 6：PM2 重启失败

**错误信息**：
```
Error: PM2 process sifan not found
```

**解决**：
1. 检查 ecosystem.config.js 是否存在：
   ```bash
   ls /root/sifan/ecosystem.config.js
   ```

2. 手动启动服务：
   ```bash
   cd /root/sifan
   pm2 start ecosystem.config.js
   pm2 save
   ```

3. 查看 PM2 日志：
   ```bash
   pm2 logs sifan
   ```

---

## 部署成功验证

GitHub Actions 运行成功后，验证部署：

```bash
# 1. 检查 PM2 进程
pm2 status

# 2. 检查服务端口
curl -I http://localhost:5000

# 3. 查看日志
pm2 logs sifan --lines 50

# 4. 访问网站
curl http://your-domain.com
# 或在浏览器访问 https://zjsifan.com
```

---

## 如果自动部署失败

回退到本地上传方式：

参考文档：
- `LOCAL-DEPLOY-INSTRUCTIONS.md` - 本地上传部署指南
- `MANUAL-DEPLOY-GUIDE.md` - 手动部署指南

---

## 监控 GitHub Actions

设置 GitHub 通知（可选）：

1. 进入 GitHub 仓库 Settings
2. 点击 "Notifications"
3. 勾选 "Actions"
4. 选择通知方式（Email、Webhook 等）
