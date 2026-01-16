# 快速使用指南

## 一键修复生产环境配置

```bash
# 进入项目目录
cd /path/to/your/project

# 给脚本执行权限（首次使用）
chmod +x scripts/fix-production-env.sh

# 执行脚本
./scripts/fix-production-env.sh
```

## 预期输出

脚本会自动完成以下操作：
- ✅ 备份配置文件
- ✅ 删除重复的 API Key
- ✅ 更新 JWT_SECRET
- ✅ 设置文件权限
- ✅ 重启应用（可选）

## 验证修复结果

```bash
# 检查 API Key 配置（应该只有 1 行）
grep -c "^COZE_WORKLOAD_IDENTITY_API_KEY=" .env.production

# 检查 JWT_SECRET（应该不再是占位符）
grep "^JWT_SECRET=" .env.production

# 检查应用日志
pm2 logs --lines 20
```

## 恢复备份（如果需要）

```bash
# 恢复最新的备份
cp .env.production.backup.$(ls -t .env.production.backup.* | head -1) .env.production
```

## 详细文档

查看完整使用说明：`scripts/README-fix-production-env.md`

## 注意事项

⚠️ 建议在低峰期执行
⚠️ 执行前会自动备份
⚠️ 重启应用是可选步骤
⚠️ 需要确认应用名称或手动重启
