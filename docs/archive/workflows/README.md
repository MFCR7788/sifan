# 已停用的 GitHub Actions 工作流（2026-11-19 归档）

## 为什么停用

这三个工作流由 **GitHub 官方 runner** 触发，通过 scp 把构建包传到服务器后执行
旧版部署脚本。旧脚本的逻辑是：

```bash
BACKUP_NAME=".next.backup.$(date +%Y%m%d_%H%M%S)"   # 每次部署留一份完整副本
tar -xzf build-package.tar.gz -C .next                # 覆盖解包（不重启进程）
```

问题：

1. **磁盘持续膨胀** —— 每次推送在 `/root/sifan` 留约 340MB 的 `.next.backup.*`，
   2026-11-18 ~ 11-19 期间累计 8 份、约 2.7GB，占用服务器磁盘。
2. **操作的是废弃目录** —— 目标 `/root/sifan` 已于 2026-11-18 迁移到
   `/opt/sifan-prod`（生产目录）。旧工作流每次都在废弃目录里空转。
3. **不重启进程** —— 覆盖 `.next` 后不 reload，造成「进程 manifest 与磁盘产物
   不同批」，静态资源返回 500，页面 JS 全挂（2026-11-18 的客户端白屏故障链）。
4. **构建基于旧代码** —— 旧脚本用 `pnpm run build` 与 `enterprise-website`
   应用名，与现行的 `npm` / `sifan` 命名均不符。

## 现行唯一部署入口

```bash
cd ~/Downloads/MFCR && bash scripts/deploy-sifan.sh
```

该脚本包含：md5 校验重传（应对 scp 中断）、BUILD_ID 一致性校验、
静态资源 200 检查、失败自动回滚。目标目录 `/opt/sifan-prod`。

## 归档文件

- `deploy-build-and-upload.yml` —— push 到 main 即触发，是本轮磁盘膨胀的直接来源
- `deploy.yml` —— 仅 workflow_dispatch 手动触发，标题已标注 Disabled
- `deploy.yml.disabled` —— 扩展名非 .yml/.yaml，GitHub 本就不执行，留作历史参考
