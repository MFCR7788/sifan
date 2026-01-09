# 直接部署到阿里云服务器（不经过GitHub）

## 两种部署方式

### 方式1：完整部署（推荐）
上传配置文件并应用到服务器

```bash
# 给脚本执行权限
chmod +x deploy-direct.sh

# 执行部署
./deploy-direct.sh
```

这个脚本会：
1. ✅ 检查本地文件
2. ✅ 备份服务器配置
3. ✅ 上传nginx.conf到服务器
4. ✅ 更新Nginx配置
5. ✅ 重启Nginx服务
6. ✅ 验证服务器访问
7. ✅ 显示当前配置

### 方式2：简化部署（仅配置）
只更新Nginx配置文件

```bash
# 给脚本执行权限
chmod +x deploy-simple.sh

# 执行部署
./deploy-simple.sh
```

这个脚本会：
1. ✅ 上传nginx.conf
2. ✅ 备份并更新Nginx配置
3. ✅ 测试并重启Nginx
4. ✅ 验证访问

## 使用前准备

### 1. 检查SSH连接
确保能SSH连接到服务器：

```bash
ssh root@42.121.218.14
```

如果需要密码，配置SSH密钥或每次输入密码。

### 2. 生成SSH密钥（可选，避免每次输入密码）

```bash
# 生成密钥对
ssh-keygen -t rsa -b 4096 -C "deploy"

# 复制公钥到服务器
ssh-copy-id root@42.121.218.14

# 测试免密登录
ssh root@42.121.218.14
```

### 3. 确认本地nginx.conf存在

```bash
ls -la /workspace/projects/nginx.conf
```

## 执行部署

### 在沙箱环境中执行

```bash
cd /workspace/projects
chmod +x deploy-direct.sh deploy-simple.sh
./deploy-direct.sh
```

## 验证部署

### 1. 服务器端验证
脚本会自动执行以下验证：
```bash
curl -I http://127.0.0.1:80
curl -I http://www.zjsifan.com
```

### 2. 本地验证
在你的本地电脑（macOS）执行：

```bash
curl -I http://www.zjsifan.com
```

### 3. 浏览器验证
打开浏览器访问：
- http://www.zjsifan.com
- http://zjsifan.com
- http://42.121.218.14

## 常见问题

### Q1: 执行时提示"Permission denied"
```bash
chmod +x deploy-direct.sh
```

### Q2: 提示"No such file or directory"
检查文件路径是否正确：
```bash
ls -la /workspace/projects/nginx.conf
```

### Q3: SSH连接需要密码
配置SSH密钥或每次输入密码：
```bash
# 方式1：每次输入密码
./deploy-direct.sh
# 输入密码后继续

# 方式2：配置免密登录（推荐）
ssh-copy-id root@42.121.218.14
```

### Q4: 部署成功但域名无法访问
这是阿里云安全组问题，参考 `check-security-group.md`

## 对比：三种部署方式

| 方式 | 速度 | 复杂度 | 场景 |
|-----|-----|-------|------|
| 直接部署 | ⭐⭐⭐⭐ | 简单 | 快速更新配置 |
| GitHub | ⭐⭐ | 中等 | 代码版本管理 |
| 手动部署 | ⭐ | 复杂 | 临时修复 |

## 推荐工作流

### 日常开发
```bash
# 1. 修改代码
vim nginx.conf

# 2. 直接部署
./deploy-direct.sh

# 3. 验证
curl -I http://www.zjsifan.com
```

### 重要更新（同时推送到GitHub）
```bash
# 1. 直接部署
./deploy-direct.sh

# 2. 提交到GitHub
git add nginx.conf
git commit -m "update nginx config"
git push origin main
```

### 紧急修复
```bash
# 1. 快速部署
./deploy-simple.sh

# 2. 后续补提交
git add . && git commit && git push
```

## 脚本对比

| 脚本 | 功能 | 适合场景 |
|-----|------|---------|
| `deploy-direct.sh` | 完整部署流程 | 首次部署或大更新 |
| `deploy-simple.sh` | 仅更新配置 | 快速修改配置 |

## 注意事项

1. ⚠️ 确保本地nginx.conf是最新的
2. ⚠️ 部署前脚本会自动备份服务器配置
3. ⚠️ 需要SSH访问权限（root用户）
4. ⚠️ 确保服务器网络正常

## 下一步

部署成功后：
- ✅ 检查浏览器访问
- ✅ 如果失败，检查阿里云安全组
- ✅ 启用HTTPS（可选）
