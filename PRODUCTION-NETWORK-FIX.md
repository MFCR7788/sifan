# 生产环境 Coze API 连接问题诊断与修复

## 问题现象

生产环境 AI 文案创作、AI 图像生成等功能无法使用，错误日志显示：

```
Error: Connection error.
[cause]: AggregateError:
  code: 'ETIMEDOUT'
```

## 问题分析

根据日志分析，问题根源是**生产服务器无法连接到 Coze API（api.coze.cn）**，导致请求超时。

### 对比测试

- ✅ **沙箱开发环境**：可以正常连接 api.coze.cn
- ❌ **阿里云生产服务器**：连接超时

## 诊断步骤

### 1. 在生产服务器上运行网络诊断

SSH 登录生产服务器（42.121.218.14），执行以下命令：

```bash
cd /root/sifan
chmod +x scripts/diagnose-network.sh
./scripts/diagnose-network.sh
```

### 2. 手动测试网络连接

```bash
# 测试 DNS 解析
nslookup api.coze.cn

# 测试端口连接
nc -zv api.coze.cn 443

# 测试 HTTP 连接
curl -I --connect-timeout 10 https://api.coze.cn
```

### 3. 检查 PM2 环境变量

```bash
pm2 env enterprise-website | grep COZE_WORKLOAD_IDENTITY_API_KEY
```

## 解决方案

### 方案一：配置出站安全组规则（推荐）

如果是因为阿里云安全组限制了出站访问：

1. 登录阿里云控制台
2. 进入 **云服务器 ECS** → **实例与镜像** → **实例**
3. 找到实例 `iZbp1iylcenpqgx9u0t6mpZ`
4. 进入 **安全组** → **配置规则**
5. 添加**出方向**规则：
   - 协议类型：自定义 TCP
   - 端口范围：443/443
   - 授权对象：0.0.0.0/0
   - 描述：允许访问 Coze API

### 方案二：检查服务器防火墙

```bash
# 检查 iptables 规则
iptables -L OUTPUT -n -v

# 如果有限制，添加允许规则
iptables -A OUTPUT -p tcp --dport 443 -d api.coze.cn -j ACCEPT

# 保存规则
service iptables save
```

### 方案三：配置 HTTP 代理

如果服务器网络环境限制，可以通过代理访问：

1. 获取代理服务器地址
2. 设置环境变量：

```bash
# 临时设置（重启后失效）
export HTTP_PROXY="http://proxy-server:port"
export HTTPS_PROXY="http://proxy-server:port"

# 永久设置（添加到 ecosystem.config.js）
# 在 env 和 env_production 中添加：
# HTTP_PROXY: 'http://proxy-server:port',
# HTTPS_PROXY: 'http://proxy-server:port'
```

### 方案四：使用备用 API 端点

Coze 提供多个 API 端点，尝试切换：

1. **国内端点**（当前使用）：`https://api.coze.cn`
2. **备用国内端点**：`https://api.coze.cn/v3/`
3. **国际端点**（如果服务器可以访问）：`https://api.coze.com`

### 方案五：联系 Coze 技术支持

如果以上方案都无效，可能是：
- 服务器 IP 被 Coze 限流或封禁
- 特定网络环境限制
- Coze API 服务故障

联系 Coze 官方技术支持，提供：
- 服务器 IP 地址
- 错误日志
- 测试结果

## 临时解决方案

如果急需上线，可以考虑：

1. **降级使用第三方 AI 服务**
   - 百度文心一言
   - 阿里通义千问
   - 腾讯混元

2. **在开发环境测试**
   - 先在本地环境验证功能
   - 确认代码无误后，再解决网络问题

## 验证修复

修复后，在服务器上测试：

```bash
curl -X POST https://api.coze.cn/v3/chat/completions \
  -H "Authorization: Bearer sat_Gv51DAu3iNSC3eEI2oSswcflVvwpFzIbMdLKNSRrSdgktLsmgnDc6VbwmGkhuXtM" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "doubao-seed-1-6-251015",
    "messages": [{"role": "user", "content": "测试"}]
  }'
```

或者访问网站测试功能：

- AI文案创作：https://www.zjsifan.com/tool/ai-copywriting
- AI图像生成：https://www.zjsifan.com/tool/ai-image-generation
- 封面图制作：https://www.zjsifan.com/tool/cover-generator

## 相关文件

- `ecosystem.config.js` - PM2 配置文件
- `.env.production` - 生产环境变量
- `scripts/diagnose-network.sh` - 网络诊断脚本
- `src/app/api/tool/ai-copywriting/route.ts` - AI 文案 API

## 技术支持

如有问题，请提供以下信息：
1. `diagnose-network.sh` 的完整输出
2. PM2 错误日志：`pm2 logs enterprise-website --err`
3. 网络测试结果
4. 服务器 IP 和地区
