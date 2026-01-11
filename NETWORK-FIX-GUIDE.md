# 服务器网络问题修复指南

## 问题现象
服务器无法连接 GitHub（443 端口超时），导致 GitHub Actions 自动部署失败。

---

## 第一步：运行诊断脚本

在服务器上执行以下命令：

```bash
# 上传并运行诊断脚本
chmod +x diagnose-network.sh
./diagnose-network.sh
```

或者直接复制执行：

```bash
curl -fsSL https://your-server-ip/diagnose-network.sh | bash
```

---

## 根据诊断结果选择解决方案

### 场景 1：DNS 解析失败

**症状**：
- `nslookup github.com` 失败
- 但 IP 可以 ping 通

**解决方案**：

#### 方案 A：修改 DNS 服务器

```bash
# 备份原配置
sudo cp /etc/resolv.conf /etc/resolv.conf.backup

# 使用 Google DNS
sudo bash -c 'echo "nameserver 8.8.8.8" > /etc/resolv.conf'
sudo bash -c 'echo "nameserver 8.8.4.4" >> /etc/resolv.conf'

# 使用 Cloudflare DNS
sudo bash -c 'echo "nameserver 1.1.1.1" > /etc/resolv.conf'
sudo bash -c 'echo "nameserver 1.0.0.1" >> /etc/resolv.conf'

# 或使用国内 DNS
sudo bash -c 'echo "nameserver 223.5.5.5" > /etc/resolv.conf'
sudo bash -c 'echo "nameserver 114.114.114.114" >> /etc/resolv.conf'

# 使配置持久化（Ubuntu/Debian）
sudo sed -i 's/dns=dnsmasq/#dns=dnsmasq/g' /etc/NetworkManager/NetworkManager.conf
sudo systemctl restart NetworkManager
```

#### 方案 B：配置 hosts 文件

```bash
# 获取 GitHub IP
github_ip=$(dig +short github.com | head -1)

# 添加到 hosts
echo "$github_ip github.com" | sudo tee -a /etc/hosts
echo "$github_ip api.github.com" | sudo tee -a /etc/hosts
echo "$github_ip raw.githubusercontent.com" | sudo tee -a /etc/hosts
```

---

### 场景 2：443 端口被防火墙阻止

**症状**：
- `curl http://github.com` 成功
- `curl https://github.com` 超时
- `bash -c "echo > /dev/tcp/github.com/443"` 失败

**解决方案**：

#### 方案 A：开放 443 端口（如果有权限）

```bash
# 如果使用 ufw
sudo ufw allow 443/tcp
sudo ufw reload

# 如果使用 firewalld
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --reload

# 如果使用 iptables
sudo iptables -A OUTPUT -p tcp --dport 443 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
sudo service iptables save
```

#### 方案 B：使用代理（推荐）

```bash
# 安装 proxychains
sudo apt update
sudo apt install -y proxychains

# 配置代理
sudo nano /etc/proxychains.conf
# 在文件末尾添加：
# socks5 127.0.0.1 1080

# 使用代理访问
proxychains git clone https://github.com/xxx/xxx.git
```

---

### 场景 3：GitHub 被墙/网络限制

**症状**：
- 其他网站访问正常
- 只有 GitHub 相关域名无法访问
- traceroute 显示丢包或中断

**解决方案**：

#### 方案 A：使用 GitHub 镜像站（推荐）

##### 1. 配置 Git 使用镜像

```bash
# 克隆时使用镜像
git clone https://ghproxy.com/https://github.com/xxx/xxx.git
git clone https://hub.fastgit.xyz/xxx/xxx.git
git clone https://github.com.cnpmjs.org/xxx/xxx.git
```

##### 2. 全局配置 Git 镜像（永久）

```bash
# 使用 ghproxy
git config --global url."https://ghproxy.com/https://github.com/".insteadOf "https://github.com/"

# 使用 fastgit
git config --global url."https://hub.fastgit.xyz/".insteadOf "https://github.com/"

# 使用 cnpmjs
git config --global url."https://github.com.cnpmjs.org/".insteadOf "https://github.com/"

# 查看当前配置
git config --global --get-regexp url
```

##### 3. 取消镜像配置（如需恢复）

```bash
git config --global --unset url."https://ghproxy.com/https://github.com/".insteadOf
```

#### 方案 B：修改 npm/yarn 使用镜像

```bash
# npm 使用淘宝镜像
npm config set registry https://registry.npmmirror.com

# yarn 使用淘宝镜像
yarn config set registry https://registry.npmmirror.com

# pnpm 使用淘宝镜像
pnpm config set registry https://registry.npmmirror.com
```

#### 方案 C：使用 SSH 隧道（需要本地有代理）

```bash
# 在服务器上创建 SSH 隧道（需要本地运行代理）
# 本地命令（假设本地代理端口 7890）：
ssh -R 7890:127.0.0.1:7890 root@your-server-ip

# 在服务器上配置代理
export http_proxy=http://127.0.0.1:7890
export https_proxy=http://127.0.0.1:7890

# 测试
curl -I https://github.com
```

---

### 场景 4：IPv6 问题

**症状**：
- `curl -4 https://github.com` 成功
- `curl -6 https://github.com` 失败

**解决方案**：

```bash
# 禁用 IPv6（临时）
sudo sysctl -w net.ipv6.conf.all.disable_ipv6=1
sudo sysctl -w net.ipv6.conf.default.disable_ipv6=1

# 永久禁用
echo "net.ipv6.conf.all.disable_ipv6=1" | sudo tee -a /etc/sysctl.conf
echo "net.ipv6.conf.default.disable_ipv6=1" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p
```

---

### 场景 5：网络环境受限（最常见）

**症状**：
- 多种方法都无效
- 阿里云/腾讯云等云服务器的网络限制

**解决方案**：

#### 方案 A：更换云服务器地域

- 如果是阿里云，尝试从国内地域（北京、上海）切换到香港、新加坡等海外地域
- 海外地域通常无网络限制

#### 方案 B：使用混合部署方式（推荐）

GitHub Actions 不直接连接服务器，改用以下方式：

1. **GitHub Actions 构建并推送到对象存储**
2. **服务器从对象存储拉取**

这种方式不依赖服务器访问 GitHub。

---

## 针对你的项目的推荐方案

根据你当前的情况（服务器无法连接 GitHub），我推荐采用 **混合部署 + 镜像站** 的组合方案：

### 方案 1：继续使用本地上传（短期方案）

优点：
- 完全不依赖服务器网络
- 简单直接，快速上线

缺点：
- 需要手动上传
- 非自动化

### 方案 2：使用镜像站 + GitHub Actions（中期方案）

修改 GitHub Actions 配置，使用镜像站：

```yaml
- name: Checkout code
  uses: actions/checkout@v4
  with:
    repository: ${{ github.repository }}
    ref: ${{ github.ref_name }}
    # 使用镜像加速
    fetch-depth: 0

- name: Deploy to Aliyun via SSH
  uses: appleboy/ssh-action@v1.0.0
  with:
    host: ${{ secrets.SSH_HOST }}
    username: ${{ secrets.SSH_USERNAME }}
    key: ${{ secrets.SSH_PRIVATE_KEY }}
    port: ${{ secrets.SSH_PORT }}
    script_stop: true
    script: |
      # 配置 Git 镜像
      git config --global url."https://ghproxy.com/https://github.com/".insteadOf "https://github.com/"
      # 拉取代码
      cd /root/sifan
      git pull origin main
      # 部署...
```

### 方案 3：更换服务器地域（长期方案）

将服务器迁移到香港或新加坡，解决根本的网络问题。

---

## 验证修复效果

完成修复后，运行以下命令验证：

```bash
# 测试 HTTP 连接
curl -I https://github.com

# 测试 Git 克隆
git clone https://github.com/octocat/Hello-World.git /tmp/test-git

# 测试 API 访问
curl https://api.github.com

# 测试 GitHub Actions（需要先在 .github/workflows/deploy.yml 中移除 if: false）
```

---

## 临时工作流（在修复前）

在网络问题解决前，继续使用本地上传方案：

1. 本地运行 `npm run build`
2. 将构建产物上传到服务器
3. 运行部署脚本

参考文档：
- `LOCAL-DEPLOY-INSTRUCTIONS.md` - 本地上传部署指南
- `MANUAL-DEPLOY-GUIDE.md` - 手动部署指南
