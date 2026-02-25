# 自动化部署指南

本指南将帮助您设置从 GitHub 到阿里云服务器的自动化部署流程。

## 1. 本地开发服务器问题排查

### 问题现象
- 本地开发服务器启动时显示成功，但无法通过浏览器访问
- `curl http://localhost:3000/` 显示 "Connection refused"

### 可能原因
1. **端口占用**：端口 3000 被其他进程占用
2. **防火墙限制**：本地防火墙阻止了对端口 3000 的访问
3. **网络配置**：网络设置问题
4. **Next.js 配置**：项目配置问题

### 排查步骤
1. **检查端口占用**：
   ```bash
   lsof -i :3000
   ```

2. **检查防火墙设置**：
   - macOS: 系统偏好设置 → 安全性与隐私 → 防火墙
   - Windows: 控制面板 → 系统和安全 → Windows 防火墙

3. **尝试不同端口**：
   修改 `package.json` 中的端口配置，使用其他端口如 3001、8080 等

4. **检查项目配置**：
   - 确保 `next.config.ts` 配置正确
   - 检查 `package.json` 中的脚本配置

5. **重新安装依赖**：
   ```bash
   rm -rf node_modules
   npm install
   ```

## 2. 自动化部署设置

### 步骤 1: 准备阿里云服务器

1. **登录服务器**：
   ```bash
   ssh root@39.101.77.111
   ```

2. **安装必要软件**：
   ```bash
   # 安装 Node.js 和 npm
   dnf install -y nodejs npm
   
   # 安装 PM2
   npm install -g pm2
   
   # 安装 Git
   dnf install -y git
   ```

3. **克隆项目**：
   ```bash
   git clone https://github.com/MFCR7788/sifan.git /root/sifan
   cd /root/sifan
   npm install
   ```

4. **配置环境变量**：
   ```bash
   # 复制环境变量文件
   cp .env.local.example .env.local
   # 编辑环境变量文件
   nano .env.local
   ```

### 步骤 2: 设置 GitHub 仓库

1. **创建 GitHub Actions 工作流**：
   - 已创建 `.github/workflows/deploy.yml` 文件

2. **设置 GitHub Secrets**：
   - 进入 GitHub 仓库 → Settings → Secrets and variables → Actions
   - 添加以下 Secrets：
     - `ALIYUN_HOST`: 39.101.77.111
     - `ALIYUN_USERNAME`: root
     - `ALIYUN_PASSWORD`: admin>>>0307

### 步骤 3: 配置 PM2

1. **启动应用**：
   ```bash
   cd /root/sifan
   pm2 start npm --name sifan -- start
   ```

2. **设置 PM2 开机自启**：
   ```bash
   pm2 save
   pm2 startup
   ```

### 步骤 4: 测试自动化部署

1. **推送代码到 GitHub**：
   ```bash
   git add .
   git commit -m "test: trigger deployment"
   git push origin main
   ```

2. **查看部署状态**：
   - 进入 GitHub 仓库 → Actions → 查看部署工作流运行状态

3. **验证部署结果**：
   - 访问 http://39.101.77.111:3000
   - 检查应用是否正常运行

### 步骤 5: 配置 Nginx（可选）

如果需要使用端口 80 访问应用，可以配置 Nginx 反向代理：

1. **安装 Nginx**：
   ```bash
   dnf install -y nginx
   ```

2. **配置 Nginx**：
   ```bash
   nano /etc/nginx/conf.d/sifan.conf
   ```

   添加以下内容：
   ```nginx
   server {
     listen 80;
     server_name 39.101.77.111;

     location / {
       proxy_pass http://localhost:3000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
     }
   }
   ```

3. **启动 Nginx**：
   ```bash
   systemctl start nginx
   systemctl enable nginx
   ```

## 3. 常见问题排查

### 部署失败
- **检查 GitHub Actions 日志**：查看具体错误信息
- **检查服务器状态**：确保服务器可以正常访问
- **检查 SSH 连接**：确保 GitHub Actions 可以通过 SSH 连接到服务器

### 应用无法访问
- **检查 PM2 状态**：
  ```bash
  pm2 status
  pm2 logs sifan
  ```
- **检查端口占用**：
  ```bash
  netstat -tulpn | grep 3000
  ```
- **检查防火墙**：
  ```bash
  firewall-cmd --list-all
  firewall-cmd --add-port=3000/tcp --permanent
  firewall-cmd --reload
  ```

### 环境变量问题
- **检查 .env.local 文件**：确保所有必要的环境变量已配置
- **重启应用**：
  ```bash
  pm2 restart sifan
  ```

## 4. 监控与维护

- **查看应用日志**：
  ```bash
  pm2 logs sifan
  ```

- **更新应用**：
  只需将代码推送到 GitHub main 分支，自动化部署会自动运行

- **停止应用**：
  ```bash
  pm2 stop sifan
  ```

- **重启应用**：
  ```bash
  pm2 restart sifan
  ```

## 5. 安全注意事项

- **不要在代码中硬编码敏感信息**：使用环境变量
- **定期更新依赖**：
  ```bash
  npm update
  ```
- **监控服务器状态**：定期检查服务器资源使用情况
- **设置防火墙规则**：只开放必要的端口

## 总结

通过以上步骤，您应该已经成功设置了从 GitHub 到阿里云服务器的自动化部署流程。当您推送代码到 GitHub main 分支时，GitHub Actions 会自动构建项目并部署到阿里云服务器。

如果遇到问题，请参考常见问题排查部分，或查看 GitHub Actions 日志获取详细错误信息。