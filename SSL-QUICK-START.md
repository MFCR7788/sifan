# SSL 证书快速配置

## 问题

运行 `certbot` 时提示需要邮箱地址，你输入了 `c` 导致失败。

## 解决方案（3 种方式）

---

### 方式一：使用脚本自动配置（推荐）⚡

```bash
# 上传并执行脚本
chmod +x quick-ssl-fix.sh
./quick-ssl-fix.sh

# 然后按提示输入邮箱地址
```

---

### 方式二：直接命令行指定邮箱

**在服务器（42.121.218.14）上直接执行**：

```bash
certbot --nginx -d zjsifan.com -d www.zjsifan.com \
    --email "your-email@example.com" \
    --agree-tos \
    --non-interactive \
    --redirect
```

**注意**：将 `your-email@example.com` 替换为你的真实邮箱地址。

---

### 方式三：手动交互式配置

```bash
certbot --nginx -d zjsifan.com -d www.zjsifan.com
```

然后按提示操作：
1. **输入邮箱地址**（不要输入 c）
2. **输入 A** 同意服务条款
3. **输入 N** 不共享邮箱
4. **输入 2** 强制 HTTPS 重定向

---

## 执行后的验证命令

```bash
# 测试 HTTPS
curl -I https://www.zjsifan.com

# 检查 443 端口
netstat -tuln | grep 443

# 重启 Nginx
systemctl restart nginx
```

---

## 推荐命令（最简单）

```bash
certbot --nginx -d zjsifan.com -d www.zjsifan.com --email "your-email@example.com" --agree-tos --non-interactive --redirect
```

直接复制粘贴，把邮箱地址改成你的，然后执行即可！
