# 自动部署指南

## 概述

本项目已配置自动部署流程：
1. 本地代码推送到 GitHub
2. 从 GitHub 拉取代码到阿里云服务器（42.121.218.14）
3. 在服务器上构建项目
4. 重启 PM2 服务

## 快速部署

### 方式 1：全自动部署（推荐）

```bash
bash deploy-github-to-aliyun.sh
```

这个脚本会自动：
1. 推送本地代码到 GitHub
2. 在阿里云服务器上拉取最新代码
3. 构建项目
4. 重启 PM2 服务

### 方式 2：分步部署

#### 步骤 1：推送到 GitHub

```bash
# 添加所有更改
git add -A

# 提交更改
git commit -m "描述你的更改"

# 推送到 GitHub
git push origin main
```

#### 步骤 2：在服务器上部署

```bash
# SSH 连接到阿里云服务器
ssh root@42.121.218.14

# 进入项目目录
cd /root/sifan

# 拉取最新代码
git pull origin main

# 重新安装依赖（如果有新增）
pnpm install --production=false

# 重新构建项目
pnpm run build

# 重启 PM2 服务
pm2 restart enterprise-website
```

## 部署脚本说明

### deploy-github-to-aliyun.sh
- **用途**：全自动部署脚本
- **执行环境**：本地环境
- **功能**：
  - 推送本地代码到 GitHub
  - 在阿里云服务器上拉取代码
  - 构建项目
  - 重启 PM2 服务
  - 验证部署状态

### deploy-config-fix.sh
- **用途**：快速部署配置文件更新
- **执行环境**：本地环境
- **功能**：
  - 上传配置文件到服务器
  - 在服务器上重新构建
  - 重启 PM2 服务

### deploy-formidable-fix.sh
- **用途**：专门修复 formidable 模块问题
- **执行环境**：本地环境
- **功能**：
  - 上传修复后的配置文件
  - 卸载 formidable
  - 重新安装依赖
  - 构建并重启服务

## 服务器信息

- **主机**：42.121.218.14
- **用户**：root
- **项目路径**：/root/sifan
- **PM2 应用名**：enterprise-website
- **服务端口**：5000
- **网站地址**：https://www.zjsifan.com

## 验证部署

### 1. 查看 PM2 日志

```bash
# 在服务器上执行
pm2 logs enterprise-website --lines 50
```

### 2. 运行诊断脚本

```bash
# 在服务器上执行
bash scripts/realtime-diagnose.sh
```

### 3. 浏览器测试

访问 https://www.zjsifan.com 并测试功能。

## 常见问题

### Q1: 推送到 GitHub 失败

**A**：检查 token 是否有效，或手动设置：
```bash
git remote set-url origin https://<YOUR_GITHUB_TOKEN>@github.com/MFCR7788/sifan.git
```

### Q2: 服务器拉取代码失败

**A**：检查服务器是否可以访问 GitHub：
```bash
ssh root@42.121.218.14
curl -I https://github.com
```

### Q3: 构建失败

**A**：查看详细错误信息：
```bash
pnpm run build
```

### Q4: PM2 启动失败

**A**：查看 PM2 错误日志：
```bash
pm2 logs enterprise-website --err
```

## 相关文档

- [支付功能故障排查指南](docs/PAYMENT_500_ERROR_TROUBLESHOOTING.md)
- [formidable 错误修复指南](docs/FORMIDABLE_ERROR_FIX.md)
- [快速修复指南](QUICK_FIX_PAYMENT.md)
