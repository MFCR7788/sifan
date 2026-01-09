# 阿里云 SAE 部署指南（更新版）

## 准确的创建步骤

### 方法 1：通过应用列表创建（推荐）

1. **登录阿里云控制台**
   - 访问：https://sae.console.aliyun.com/
   - 确保已登录你的阿里云账户

2. **进入应用管理**
   - 在左侧菜单找到 "应用管理"（Application Management）
   - 点击 "应用列表"（Application List）

3. **创建应用**
   - 在页面右上角找到 "创建应用"（Create Application）按钮
   - 通常是一个蓝色按钮，可能有 "+" 号

4. **选择应用类型**
   在应用类型选择页面，可能看到以下选项：
   - **微服务应用**（Microservice Application）- 推荐
   - Web 应用（Web Application）
   - 函数计算应用

   **提示：** 选择 "微服务应用"，这是更通用的选项

5. **配置基本信息**
   - **应用名称**：`sifan-website`
   - **应用描述**：思梵企业官网
   - **应用类型**：Web 应用（如果能看到此选项）

6. **选择部署方式**
   - 选择 "代码包部署"（Code Package Deployment）
   - 然后选择 "从代码仓库"（From Code Repository）

---

### 方法 2：直接访问创建页面

尝试直接访问以下链接：
- https://sae.console.aliyun.com/#/app/list/create

或根据你的区域选择：
- 华东1（杭州）：https://sae.console.aliyun.com/cn-hangzhou/app/list/create
- 华北2（北京）：https://sae.console.aliyun.com/cn-beijing/app/list/create

---

### 方法 3：通过资源栈（推荐新手）

1. 访问：https://ram.console.aliyun.com/manage/permission
2. 确保有 SAE 相关权限

3. 返回 SAE 控制台首页
4. 寻找 "快速开始"（Quick Start）或 "创建应用" 入口

---

## 如果找不到创建入口

### 检查以下内容：

1. **检查当前区域**
   - 确保选择的是支持 SAE 的区域
   - 推荐区域：华东1（杭州）、华北2（北京）、华南1（深圳）

2. **检查账户权限**
   - 确保你的账户有创建 SAE 应用的权限
   - 可能需要开通 SAE 服务

3. **检查是否已开通 SAE**
   - 首次使用可能需要先开通服务
   - 查看是否有 "开通服务" 按钮

---

## 应用创建后的配置

### 步骤 1：配置代码仓库

在创建应用页面：

**1.1 选择代码源**
- 代码源：GitHub
- 点击授权 GitHub 账户

**1.2 选择仓库**
- 仓库：MFCR7788/sifan
- 分支：main

### 步骤 2：配置技术栈

```
运行环境：Node.js
运行版本：20.x（或最新 LTS 版本）
构建命令：npm install && npm run build
启动命令：npm start
端口：3000
```

### 步骤 3：配置环境变量

在环境变量配置部分添加：

```env
NODE_ENV=production
```

### 步骤 4：配置实例规格

- **vCPU**：0.5 Core
- **内存**：1GB
- **实例数**：1

### 步骤 5：健康检查配置

- **检查方式**：HTTP
- **检查路径**：/
- **健康检查间隔**：30 秒
- **超时时间**：5 秒

### 步骤 6：高级配置（可选）

**6.1 超时设置**
- 请求超时：60 秒

**6.2 日志配置**
- 开通 SLS 日志服务（可选）

---

## 创建流程总结

```
登录 → 应用管理 → 应用列表 → 创建应用 → 选择类型
→ 配置基本信息 → 选择代码仓库 → 配置构建参数
→ 配置环境变量 → 配置实例 → 创建应用 → 等待部署
```

---

## 界面截图指引（文字描述）

### 应用列表页
```
---------------------------------------------------
| 应用管理                              搜索... |
|  ↓                                               |
| 应用列表                          [+ 创建应用]    |
|                                                   |
| [已有应用列表...]                                  |
---------------------------------------------------
```

### 创建应用页
```
---------------------------------------------------
| 1. 基本信息                                       |
| - 应用名称: [sifan-website]                       |
| - 应用描述: [思梵企业官网]                         |
| - 应用类型: [微服务应用]                          |
|                                                   |
| 2. 部署方式                                       |
| - 代码包部署 > 从代码仓库                         |
|                                                   |
| 3. 代码仓库                                       |
| - 代码源: [GitHub ▼]                              |
| - 仓库: [MFCR7788/sifan]                          |
| - 分支: [main]                                    |
|                                                   |
| 4. 运行环境                                       |
| - 技术: [Node.js]                                 |
| - 版本: [20.x]                                    |
| - 构建命令: [npm install && npm run build]        |
| - 启动命令: [npm start]                           |
| - 端口: [3000]                                    |
|                                                   |
| 5. 环境变量                                       |
| + 添加环境变量                                    |
|   NAME: NODE_ENV                                 |
|   VALUE: production                              |
|                                                   |
| [取消]                    [创建应用]               |
---------------------------------------------------
```

---

## 常见问题

### Q1: 看不到 "创建应用" 按钮
**可能原因：**
- 没有创建应用的权限
- 没有开通 SAE 服务
- 区域选择不正确

**解决方法：**
1. 检查账户是否有 AliyunSAEFullAccess 权限
2. 访问 SAE 产品页开通服务：https://www.aliyun.com/product/sae
3. 切换到支持的区域（如华东1-杭州）

### Q2: GitHub 授权失败
**解决方法：**
1. 确保在 GitHub 上有该仓库的访问权限
2. 清除浏览器缓存后重试
3. 使用 HTTPS 方式配置仓库

### Q3: 找不到 Node.js 运行环境
**解决方法：**
- 选择 "自定义镜像" 或 "Docker" 方式部署
- 或者选择其他技术栈，如 "Nginx + Node.js"

---

## 备选方案：使用 Docker 部署

如果上述方法都不行，可以使用 Docker 方式：

### 1. 创建 Dockerfile

在项目根目录创建 `Dockerfile`：

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --production

COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./

EXPOSE 3000

CMD ["npm", "start"]
```

### 2. 推送到 Docker 镜像仓库
```bash
docker build -t registry.cn-hangzhou.aliyuncs.com/your-namespace/sifan:latest .
docker push registry.cn-hangzhou.aliyuncs.com/your-namespace/sifan:latest
```

### 3. 在 SAE 中选择镜像部署
- 选择 "镜像部署"
- 输入镜像地址：`registry.cn-hangzhou.aliyuncs.com/your-namespace/sifan:latest`

---

## 获取帮助

如果仍然找不到创建入口：

1. **查看官方文档**
   - https://help.aliyun.com/document_detail/64295.html

2. **联系阿里云客服**
   - 工单系统：https://workorder.console.aliyun.com/
   - 在线客服：在控制台右侧点击"联系我们"

3. **检查服务开通**
   - 访问：https://www.aliyun.com/product/sae
   - 点击"立即开通"

---

## 更新说明

- 更新了创建应用的准确步骤
- 提供了多种创建入口
- 增加了 Docker 部署方案作为备选
- 更详细的界面说明和故障排查

祝部署顺利！
