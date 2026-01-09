# 将应用切换到80端口访问

## 📌 当前情况

你之前通过 `http://42.121.218.14:3000/` 直接访问Next.js应用。

**现在应该使用80端口访问：**
- ✅ `http://42.121.218.14`（默认80端口）
- ✅ `http://42.121.218.14:80`
- ✅ `http://www.zjsifan.com`
- ✅ `http://zjsifan.com`

## 🔄 工作原理

### 之前的访问方式（直接访问3000端口）
```
用户 → 3000端口 → Next.js应用
```
**问题：**
- 需要开放3000端口
- 没有Nginx的保护
- 无法配置SSL
- 没有缓存优化

### 现在的访问方式（Nginx反向代理）
```
用户 → 80端口(Nginx) → 3000端口(Next.js应用)
```
**优势：**
- ✅ 只需开放80端口
- ✅ Nginx提供安全防护
- ✅ 支持SSL/HTTPS
- ✅ 静态资源缓存
- ✅ 访问日志和分析
- ✅ Gzip压缩

## 🚀 快速切换

### 方法1：使用脚本（推荐）

在服务器上执行：

```bash
cd /root/sifan
chmod +x switch-to-port80.sh
./switch-to-port80.sh
```

脚本会：
1. ✅ 检查当前访问方式
2. ✅ 修改Next.js只监听localhost（可选，提升安全性）
3. ✅ 重启PM2应用
4. ✅ 验证配置

### 方法2：手动配置

#### 如果只想确保80端口可用
```bash
# 测试80端口访问
curl -I http://42.121.218.14

# 测试域名访问
curl -I http://www.zjsifan.com
```

#### 如果想禁用3000端口直接访问（提升安全性）
```bash
cd /root/sifan

# 修改PM2配置
vim ecosystem.config.js
# 找到 args: 'start -p 3000'
# 改为 args: 'start -p 3000 -H 127.0.0.1'
# 保存退出

# 重启应用
pm2 restart enterprise-website
```

## 📊 配置对比

### 方案A：同时支持80和3000端口（默认）
```javascript
// ecosystem.config.js
args: 'start -p 3000'  // 默认监听0.0.0.0:3000
```

**访问方式：**
- ✅ `http://42.121.218.14:80`（通过Nginx）
- ✅ `http://42.121.218.14:3000`（直接访问）

**适用场景：**
- 开发测试
- 需要直接访问应用排查问题

### 方案B：只支持80端口（推荐生产环境）
```javascript
// ecosystem.config.js
args: 'start -p 3000 -H 127.0.0.1'  // 只监听127.0.0.1:3000
```

**访问方式：**
- ✅ `http://42.121.218.14:80`（通过Nginx）
- ❌ `http://42.121.218.14:3000`（无法访问）

**适用场景：**
- 生产环境
- 需要更高安全性

## 🔍 验证配置

### 检查Nginx配置
```bash
# 查看Nginx配置
cat /etc/nginx/conf.d/zjsifan.conf

# 应该看到反向代理配置
# proxy_pass http://nextjs_backend;
# upstream nextjs_backend { server 127.0.0.1:3000; }
```

### 检查PM2配置
```bash
# 查看PM2配置
pm2 show enterprise-website

# 查看启动参数
grep "args:" ecosystem.config.js
```

### 测试访问
```bash
# 测试80端口
curl -I http://127.0.0.1:80

# 测试3000端口
curl -I http://127.0.0.1:3000
```

### 检查端口监听
```bash
# 查看端口监听
ss -tlnp | grep -E ':(80|3000)\s'

# 应该看到：
# nginx  监听 0.0.0.0:80  (对外)
# node   监听 127.0.0.1:3000 (本地)
```

## 🛡️ 安全性对比

| 方面 | 直接访问3000 | 通过Nginx 80 |
|-----|------------|------------|
| 端口暴露 | 3000端口对外暴露 | 只需80端口 |
| 攻击面 | 大 | 小 |
| 访问控制 | 无 | 有 |
| SSL/TLS | 需要自己配置 | Nginx配置 |
| 静态缓存 | 无 | 有 |
| 日志记录 | 应用日志 | Nginx+应用日志 |

## 📝 推荐配置

### 生产环境（推荐）

**配置：**
- Next.js只监听127.0.0.1:3000
- Nginx监听0.0.0.0:80
- 对外只提供80端口访问

**优势：**
- ✅ 最大安全性
- ✅ 只需开放一个端口
- ✅ 符合最佳实践

### 开发环境

**配置：**
- Next.js监听0.0.0.0:3000
- Nginx监听0.0.0.0:80
- 两个端口都可访问

**优势：**
- ✅ 便于调试
- ✅ 可以直接访问应用

## ⚠️ 常见问题

### Q1: 修改后3000端口无法访问了？
**A:** 这是正常的，如果你选择了方案B（只监听localhost），外部无法访问3000端口。

### Q2: 如何恢复3000端口访问？
```bash
# 修改配置
vim ecosystem.config.js
# 改回：args: 'start -p 3000'

# 重启应用
pm2 restart enterprise-website
```

### Q3: 80端口访问速度慢？
**A:** 检查Nginx配置中的缓存和压缩设置是否正确。

### Q4: 能否同时启用HTTPS？
**A:** 可以！使用Let's Encrypt配置SSL证书，访问 `https://www.zjsifan.com`

## 🎯 下一步

1. **执行脚本配置：**
   ```bash
   cd /root/sifan
   ./switch-to-port80.sh
   ```

2. **测试访问：**
   - http://42.121.218.14
   - http://www.zjsifan.com

3. **配置HTTPS（可选）：**
   ```bash
   # 安装Certbot
   sudo yum install certbot python2-certbot-nginx

   # 获取证书
   sudo certbot --nginx -d www.zjsifan.com -d zjsifan.com
   ```

## 📚 相关文档

- `AUTO-DEPLOY.md` - 自动部署系统
- `nginx.conf` - Nginx配置文件
- `ecosystem.config.js` - PM2配置文件
