# 🔥 紧急修复 - GitHub 连接失败问题

## 问题
服务器无法连接到 GitHub (443 端口超时)，导致部署失败。

## 解决方案
在服务器上执行以下命令（复制粘贴即可）：

```bash
cd /root/sifan && git remote set-url origin https://ghproxy.com/https://github.com/MFCR7788/sifan.git && git fetch origin main && git reset --hard origin/main && pnpm install && pnpm run build && pm2 restart enterprise-website
```

## 分步执行（如果上面命令失败）

### 1. 进入项目目录
```bash
cd /root/sifan
```

### 2. 修改远程仓库 URL 为镜像地址
```bash
git remote set-url origin https://ghproxy.com/https://github.com/MFCR7788/sifan.git
```

### 3. 验证远程仓库 URL
```bash
git remote -v
```

### 4. 拉取最新代码
```bash
git fetch origin main
```

### 5. 重置到最新代码
```bash
git reset --hard origin/main
```

### 6. 清理未跟踪的文件
```bash
git clean -fd
```

### 7. 安装依赖
```bash
pnpm install
```

### 8. 构建项目
```bash
pnpm run build
```

### 9. 重启服务
```bash
pm2 restart enterprise-website
```

## 验证

```bash
# 查看服务状态
pm2 list

# 查看日志
pm2 logs enterprise-website --lines 20
```

## 执行后访问

- http://zjsifan.com
- https://zjsifan.com（如果已配置 SSL）

## 原因说明

git config 的镜像配置在某些情况下不生效，直接修改远程仓库 URL 为镜像地址是最可靠的方法。
