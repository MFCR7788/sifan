# 归档脚本说明（历史存档，勿直接执行）

> 归档日期：2026-11-18　归档原因：旧部署体系多次覆盖生产产物，导致线上白屏故障

---

## 一、为什么归档

2026-11-18 23:09，官网出现 `Application error: a client-side exception has occurred`（客户端异常白屏）。

### 故障链

```
旧部署脚本（本地运行）→ tar 打包 → scp 上传 → ssh 执行：
    cd /root/sifan
    mv .next .next.backup.$(date +%s)     ← 备份
    tar -xzf ...                           ← 覆盖 .next
    （未重启 PM2 进程）                    ← 致命遗漏
```

结果：**运行中进程持有的 manifest 与磁盘产物不同批**。
HTML 渲染时引用旧 hash 的 chunk（`main-app-19f4e865…`），磁盘上只有新 hash（`main-app-a1874e4c…`），
4 个核心 chunk 返回 **500** → 浏览器 JS 加载失败 → Next.js 客户端异常页 → 白屏。

服务器上残留 11 个 `.next.backup.*` 目录（单个 22–340MB）、`build-package.tar.gz`（47MB），
且 `/root/sifan` 的 git HEAD 停在 `c89ea3c`（不含路耐官网首页）——若该流程成功部署反而会退回旧版。

### 特征签名（用于识别同类脚本）

| 特征 | 说明 |
|---|---|
| `mv .next .next.backup.*` | 备份时不清理，且不配套重启 |
| `tar -xzf` 直接覆盖 `.next` | 旧文件与新文件混合 |
| 硬编码 `/root/sifan` | 与生产运行目录脱节 |
| 使用 `pnpm` / `enterprise-website` | 项目已改用 `npm` / `sifan` |
| 指向 `42.121.218.14` | 已废弃的旧服务器 |

---

## 二、当前有效流程（唯一入口）

**唯一部署入口：`scripts/deploy-sifan.sh`**

```bash
cd ~/Downloads/MFCR
bash scripts/deploy-sifan.sh            # 完整流程
bash scripts/deploy-sifan.sh --skip-build   # 仅上传已有产物
bash scripts/deploy-sifan.sh --build-only   # 仅本地构建
```

流程：`git pull` → 本地构建 → 打包 → scp 上传 → 服务器解包到 `/opt/sifan-prod` → PM2 重启 → 双重复核 → 失败自动回滚

### 三道防线

1. **目录隔离**：生产运行在 `/opt/sifan-prod`，与 `/root/sifan`（旧体系目标目录）物理隔离
2. **产物校验**：部署后比对 `BUILD_ID` 与包内一致，且首页引用的 `main-app-*.js` 必须存在于磁盘
3. **自愈守护**：`/root/sifan-selfheal.sh`（cron 每 3 分钟）检测到不一致自动重启 sifan

---

## 三、归档内容

| 位置 | 内容 |
|---|---|
| `scripts/archive/` | 66 个历史脚本（**仅供查阅，禁止执行**） |
| `/root/wb-backup-20261118/old-deploy-system/` | 服务器端同一批脚本备份 |
| `/root/wb-backup-20261118/old-deploy-system/credentials/` | `.env.local` / `.env.production` / `certs` 冗余备份 |

---

## 四、归档脚本分类

| 类别 | 代表脚本 | 处置建议 |
|---|---|---|
| 部署执行 | `deploy-local-upload*.sh`、`deploy-local.sh`、`deploy.sh` | **已归档，禁止使用** |
| 服务器初始化 | `server-init.sh`、`setup-https*.sh`、`install-ssl*.sh` | 已归档（当前环境已初始化完成） |
| 故障修复 | `fix-*.sh`、`URGENT-FIX.sh`、`quick-fix-*.sh` | 已归档（均为一次性补丁） |
| 诊断检查 | `diagnose-*.sh`、`check-*.sh`、`verify-*.sh`、`test-*.sh` | 可参考，但路径已过时 |
| 镜像/网络 | `deploy-alternative-mirrors.sh`、`fix-github-mirror.sh` | 已归档（现用 ghfast.top 方案） |

---

## 五、恢复方式

如需找回某个脚本：

```bash
# 本地
ls scripts/archive/ | grep <关键词>

# 服务器
ls /root/wb-backup-20261118/old-deploy-system/ | grep <关键词>
```

**恢复后必须先修正**：目标目录改为 `/opt/sifan-prod`、应用名改为 `sifan`、包管理改为 `npm`，
并补上「覆盖后必须重启进程 + 校验产物一致性」这两步，否则会重现本次故障。
