# Nginx 600端口配置指南

## 📌 当前状态

将Nginx端口从 **80** 改为 **600**

### 访问地址变化

#### 修改前（80端口）
- http://42.121.218.14
- http://www.zjsifan.com
- http://zjsifan.com

#### 修改后（600端口）
- http://42.121.218.14:600
- http://www.zjsifan.com:600
- http://zjsifan.com:600

---

## 🚀 快速切换到600端口

### 方法1：使用脚本（推荐）

```bash
cd /root/sifan

# 拉取最新代码
git pull origin main

# 切换到600端口
chmod +x switch-port-to-600.sh
./switch-port-to-600.sh
```

### 方法2：手动配置

```bash
cd /root/sifan

# 备份配置
sudo cp /etc/nginx/conf.d/zjsifan.conf /etc/nginx/conf.d/zjsifan.conf.backup

# 使用600端口配置
sudo cp nginx-600.conf /etc/nginx/conf.d/zjsifan.conf

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl reload nginx

# 验证
curl -I http://127.0.0.1:600
```

---

## 🔧 切换回80端口

如果需要改回80端口：

```bash
cd /root/sifan

# 使用脚本
chmod +x switch-port-to-80.sh
./switch-port-to-80.sh
```

---

## ⚠️ 重要：阿里云安全组配置

### 开放600端口

**必须**在阿里云安全组开放600端口：

1. 登录阿里云控制台：https://ecs.console.aliyun.com
2. 找到实例：`iZbp1iylcenpqgx9u0t6mpZ`
3. 点击"安全组" → "配置规则"
4. 在**入方向**添加：
   - **协议类型**：自定义TCP
   - **端口范围**：600/600
   - **授权对象**：0.0.0.0/0
   - **授权策略**：允许
5. 点击"确定"

### 可以选择关闭80端口

如果确认不再使用80端口，可以：
- 在安全组中删除80端口规则
- 或保留80端口作为备用

---

## 📊 端口对比

| 端口 | 访问方式 | 优点 | 缺点 |
|-----|---------|------|------|
| 80 | http://domain.com | 标准HTTP端口，无需指定端口 | 端口冲突可能 |
| 600 | http://domain.com:600 | 避免常见端口冲突 | 需要显式指定端口号 |

---

## 🧪 验证配置

### 服务器端验证

```bash
# 检查端口监听
ss -tlnp | grep :600

# 本地访问测试
curl -I http://127.0.0.1:600

# 查看Nginx状态
sudo systemctl status nginx
```

### 外部验证

#### 安全组配置后，从本地测试

```bash
# 端口连通性测试
telnet 42.121.218.14 600
# 或
nc -zv 42.121.218.14 600

# HTTP访问测试
curl -I http://42.121.218.14:600
curl -I http://www.zjsifan.com:600
```

#### 浏览器访问

打开浏览器访问：
- http://42.121.218.14:600
- http://www.zjsifan.com:600
- http://zjsifan.com:600

---

## 🔍 故障排查

### 问题1：访问显示 ERR_CONNECTION_CLOSED

**原因**：阿里云安全组未开放600端口

**解决**：
1. 检查安全组规则
2. 确认600端口入方向规则存在
3. 授权对象是 0.0.0.0/0

### 问题2：Nginx启动失败

**检查配置**：
```bash
sudo nginx -t
```

**查看错误日志**：
```bash
sudo tail -f /var/log/nginx/error.log
```

### 问题3：端口被占用

**检查端口占用**：
```bash
ss -tlnp | grep :600
```

**如果有占用，查看进程**：
```bash
sudo lsof -i :600
# 或
sudo netstat -tlnp | grep :600
```

---

## 📝 文件说明

### nginx-600.conf
- 使用600端口的Nginx配置
- 完整的反向代理配置
- 包含域名支持

### switch-port-to-600.sh
- 自动切换到600端口的脚本
- 自动备份配置
- 自动测试和重启Nginx

### switch-port-to-80.sh
- 切换回80端口的脚本

---

## 💡 端口选择建议

### 什么时候使用600端口？
- ✅ 80端口被其他服务占用
- ✅ 需要避免常见端口冲突
- ✅ 测试环境

### 什么时候使用80端口？
- ✅ 生产环境推荐
- ✅ 用户无需指定端口号
- ✅ 标准HTTP协议

---

## 🎯 推荐操作流程

### 切换到600端口

```bash
# 1. 在服务器执行
cd /root/sifan
./switch-port-to-600.sh

# 2. 配置阿里云安全组600端口

# 3. 从本地测试
curl -I http://www.zjsifan.com:600

# 4. 浏览器访问
# http://www.zjsifan.com:600
```

### 切换回80端口

```bash
# 1. 在服务器执行
cd /root/sifan
./switch-port-to-80.sh

# 2. 浏览器访问
# http://www.zjsifan.com
```

---

## ⚙️ 配置说明

### 修改后的配置结构

```
外部请求 (600端口)
    ↓
Nginx (监听 600端口)
    ↓
Next.js (3000端口)
```

### 关键配置

```nginx
server {
    listen 600;              # 监听600端口
    listen [::]:600;
    server_name 42.121.218.14 www.zjsifan.com zjsifan.com;

    location / {
        proxy_pass http://nextjs_backend;  # 转发到3000端口
        ...
    }
}

upstream nextjs_backend {
    server 127.0.0.1:3000;
    keepalive 64;
}
```

---

## 🆘 常见问题

### Q: 能同时使用80和600端口吗？

A: 可以！添加多个server块，监听不同端口：

```nginx
# 端口80
server {
    listen 80;
    server_name example.com;
    ...
}

# 端口600
server {
    listen 600;
    server_name example.com;
    ...
}
```

### Q: 使用600端口对SEO有影响吗？

A: 建议80端口作为主域名，600端口用于测试或备用。

### Q: 能配置HTTPS吗？

A: 可以！使用443端口（HTTPS），600端口仍然可以用于HTTP。

---

## 📚 相关文档

- `PORT-80-GUIDE.md` - 80端口配置指南
- `nginx-600.conf` - 600端口配置文件
- `switch-port-to-600.sh` - 切换脚本

---

## 🎉 完成

配置完成后：
1. ✅ 开放阿里云安全组600端口
2. ✅ 访问 http://www.zjsifan.com:600
3. ✅ 确认网站正常显示

如果需要改回80端口，执行 `./switch-port-to-80.sh`
