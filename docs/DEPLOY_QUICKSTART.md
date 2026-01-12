# 快速部署到阿里云

## 1. 准备服务器 IP

将你的阿里云服务器 IP 地址替换到部署命令中。

## 2. 配置 SSH 免密登录（首次使用）

```bash
# 生成 SSH 密钥（如果还没有）
ssh-keygen -t rsa -b 4096

# 将公钥复制到服务器
ssh-copy-id root@your-server-ip

# 测试连接
ssh root@your-server-ip
```

## 3. 一键部署

```bash
# 执行部署命令（替换为你的服务器 IP）
./scripts/deploy.sh your-server-ip
```

部署脚本会自动完成：
1. ✅ 检查本地修改（可选提交和推送）
2. ✅ 检查 SSH 连接
3. ✅ 安装依赖并构建项目
4. ✅ 创建部署包
5. ✅ 上传到服务器
6. ✅ 备份旧版本
7. ✅ 解压并重启服务

## 4. 验证部署

```bash
# 查看服务状态
ssh root@your-server-ip 'pm2 status'

# 访问网站
open http://your-server-ip:5000
```

## 常见问题

### 问题：SSH 连接失败
**解决**：检查服务器 IP 是否正确，确认服务器防火墙已开放 22 端口

### 问题：构建失败
**解决**：检查本地是否有足够的磁盘空间，确保依赖安装成功

### 问题：服务无法启动
**解决**：查看服务日志
```bash
ssh root@your-server-ip 'pm2 logs enterprise-website --lines 50'
```

## 详细文档

- [阿里云部署完整指南](./ALIYUN_DEPLOYMENT.md)
- [支付功能故障排查](./PAYMENT_TROUBLESHOOTING.md)
- [支付功能测试](./TEST_PAYMENT_FLOW.md)
