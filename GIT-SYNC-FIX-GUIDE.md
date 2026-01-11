# Git 同步问题快速解决方案

## 问题诊断

根据你提供的信息：
- ✓ ping github.com 成功（网络连接正常）
- ✓ 已配置 ghproxy 镜像
- ✗ 无法从 GitHub 同步数据

## 可能的原因

1. **镜像站不稳定** - ghproxy 等镜像站可能暂时不可用
2. **镜像配置冲突** - 多个镜像配置可能导致冲突
3. **HTTPS 证书问题** - 证书验证失败
4. **Git 版本问题** - 旧版本 Git 可能兼容性问题

---

## 快速解决方案

### 方案 1：直接访问 GitHub（推荐优先尝试）

如果 GitHub 连接本身没问题，可以直接取消镜像：

```bash
# 取消镜像配置
git config --global --unset url.https://ghproxy.com/https://github.com/.insteadOf

# 测试克隆
cd /tmp
git clone https://github.com/octocat/Hello-World.git test
```

如果成功，说明问题出在镜像站，直接访问 GitHub 即可。

---

### 方案 2：更换镜像站

如果必须使用镜像，尝试更换为其他镜像：

```bash
# 取消当前镜像
git config --global --unset url.https://ghproxy.com/https://github.com/.insteadOf

# 使用 cnpmjs 镜像
git config --global url."https://github.com.cnpmjs.org/".insteadOf "https://github.com/"

# 或使用 fastgit 镜像
git config --global url."https://hub.fastgit.xyz/".insteadOf "https://github.com/"

# 测试
cd /tmp
git clone https://github.com/octocat/Hello-World.git test
```

---

### 方案 3：配置 Git 忽略 SSL 验证（临时方案）

如果遇到 SSL 证书错误，可以临时禁用验证：

```bash
# 忽略 SSL 验证（不推荐长期使用）
git config --global http.sslVerify false

# 测试
cd /tmp
git clone https://github.com/octocat/Hello-World.git test

# 测试成功后，恢复 SSL 验证
git config --global http.sslVerify true
```

---

### 方案 4：使用 SSH 协议

如果 HTTPS 有问题，可以尝试 SSH 协议：

```bash
# 生成 SSH 密钥（如果还没有）
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"

# 查看公钥
cat ~/.ssh/id_rsa.pub

# 将公钥添加到 GitHub（Settings > SSH and GPG keys）

# 测试 SSH 连接
ssh -T git@github.com

# 使用 SSH 克隆
cd /tmp
git clone git@github.com:octocat/Hello-World.git test
```

---

### 方案 5：检查项目仓库配置

如果是项目仓库同步失败，检查具体配置：

```bash
# 进入项目目录
cd /root/sifan

# 查看远程仓库地址
git remote -v

# 测试连接
git ls-remote origin

# 如果地址不对，更新为正确的地址
# git remote set-url origin https://github.com/your-username/your-repo.git

# 尝试获取最新信息
git fetch origin main

# 查看是否有更新
git log HEAD..origin/main --oneline

# 拉取更新
git pull origin main
```

---

## 诊断步骤建议

在服务器上按顺序执行：

```bash
# 1. 上传并运行诊断脚本
chmod +x test-git-sync.sh
./test-git-sync.sh

# 2. 根据诊断结果选择上述方案
```

---

## 针对你的项目（魔法超人系统）

如果是要同步 `zjsifan/sifan-website` 仓库，检查：

```bash
cd /root/sifan

# 查看远程配置
git remote -v

# 如果配置错误，更新为：
git remote set-url origin https://github.com/zjsifan/sifan-website.git

# 或使用镜像
git remote set-url origin https://ghproxy.com/https://github.com/zjsifan/sifan-website.git

# 测试连接
git ls-remote origin

# 拉取更新
git fetch origin
git pull origin main
```

---

## 常见错误及解决

### 错误 1: "Connection timed out"

**原因**: 防火墙阻止 443 端口
**解决**: 参考方案 4（SSH）或方案 5（更换镜像）

### 错误 2: "SSL certificate problem"

**原因**: 证书验证失败
**解决**: 方案 3（临时禁用 SSL 验证）

### 错误 3: "repository not found"

**原因**: 仓库地址错误或无访问权限
**解决**: 检查 git remote -v 配置

### 错误 4: "Failed to connect to github.com"

**原因**: 网络连接问题
**解决**: 先 ping 测试，再检查 DNS 配置

---

## 下一步

1. 在服务器上运行 `test-git-sync.sh` 诊断
2. 根据诊断结果选择对应方案
3. 如果所有方案都失败，继续使用本地上传方式部署
