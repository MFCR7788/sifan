#!/bin/bash
# ============================================================
# sifan 官网一键部署脚本（本地 Mac → 阿里云 39.101.77.111）
#
# 背景：服务器到 github.com:443 不通，无法在服务器上 git pull + build；
#       且服务器仅 1.8G 内存，Next 16 生产构建会被 OOM Killer 杀掉（exit 137）。
#       因此改为：本地构建 → 打包 → scp 上传 → 服务器解包 → PM2 重启。
#
# 用法：
#   bash scripts/deploy-sifan.sh          # 完整流程（构建+上传+部署）
#   bash scripts/deploy-sifan.sh --skip-build   # 仅上传已构建产物
#   bash scripts/deploy-sifan.sh --build-only   # 仅本地构建，不上传
# ============================================================
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SERVER="${SIFAN_SERVER:-zjsifan}"
SERVER_DIR="/root/sifan"
PORT="${SIFAN_PORT:-5000}"
SKIP_BUILD=0
BUILD_ONLY=0

for arg in "$@"; do
  case "$arg" in
    --skip-build) SKIP_BUILD=1 ;;
    --build-only) BUILD_ONLY=1 ;;
    *) echo "未知参数: $arg"; exit 1 ;;
  esac
done

log() { echo "[$(date '+%H:%M:%S')] $*"; }

cd "$REPO_DIR"

# ---------- 1. 拉取最新代码 ----------
if [ "$SKIP_BUILD" -eq 0 ]; then
  log "拉取 GitHub 最新代码..."
  git pull --ff-only origin main

  log "本地构建（Next.js production）..."
  rm -rf .next
  export NODE_ENV=production NEXT_TELEMETRY_DISABLED=1 CI=1
  npm run build

  if [ "$BUILD_ONLY" -eq 1 ]; then
    log "仅构建模式，产物在 .next/ ，结束。"
    exit 0
  fi

  log "打包构建产物..."
  tar -czf /tmp/sifan-next.tar.gz --exclude='.next/cache' --exclude='.next/trace' \
      --exclude='.next/types' --exclude='.next/typescript' .next

  # public 打包：剔除已被 WebP 替代的大原图（源码已改用 .webp 直链）
  # 判定：图片 >100KB 且存在同名 .webp，或 assets/ 下与 images/ 重复的副本
  # 注意：tar 的 --exclude 对已存在路径匹配不可靠，改用「暂存目录先剔除再压缩」
  log "打包静态资源（剔除已 WebP 化的大原图）..."
  rm -rf /tmp/pub-pkg && mkdir -p /tmp/pub-pkg
  cp -a public /tmp/pub-pkg/
  python3 - <<'PYEOF'
import os
base = '/tmp/pub-pkg/public'
removed = 0
for root, dirs, files in os.walk(base):
    for fn in files:
        p = os.path.join(root, fn)
        low = fn.lower()
        if not low.endswith(('.png', '.jpg', '.jpeg')):
            continue
        try:
            size = os.path.getsize(p)
        except OSError:
            continue
        has_webp = os.path.exists(p.rsplit('.', 1)[0] + '.webp')
        dup = False
        if '/assets/' in p and os.path.exists(os.path.join(base, 'images', fn)):
            dup = True
        if (has_webp or dup) and size > 100 * 1024:
            os.remove(p)
            removed += 1
print(f'  已剔除 {removed} 个冗余大原图')
PYEOF
  find /tmp/pub-pkg -name '._*' -delete 2>/dev/null || true
  find /tmp/pub-pkg -name '.DS_Store' -delete 2>/dev/null || true
  tar -czf /tmp/sifan-public.tar.gz -C /tmp/pub-pkg public
  rm -rf /tmp/pub-pkg
  ls -lh /tmp/sifan-next.tar.gz /tmp/sifan-public.tar.gz
fi

# ---------- 2. 上传 ----------
log "上传产物到服务器 $SERVER ..."
scp -o ConnectTimeout=15 /tmp/sifan-next.tar.gz "$SERVER:/tmp/sifan-next.tar.gz"
scp -o ConnectTimeout=15 /tmp/sifan-public.tar.gz "$SERVER:/tmp/sifan-public.tar.gz"

# ---------- 3. 服务器部署 ----------
log "服务器部署..."
ssh -o ConnectTimeout=15 "$SERVER" "bash -s" <<REMOTE
set -e
cd $SERVER_DIR
TS=\$(date +%Y%m%d_%H%M%S)

# 记录包内的 BUILD_ID，作为一致性校验基准
PKG_BUILD_ID=\$(tar -xzOf /tmp/sifan-next.tar.gz .next/BUILD_ID 2>/dev/null || echo "")
echo "[服务器] 包内 BUILD_ID: \$PKG_BUILD_ID"

echo "[服务器] 停止 sifan 并移走旧产物（彻底替换，避免新旧混合）..."
pm2 stop sifan >/dev/null 2>&1 || true
[ -d .next ] && mv .next .next.old.\$TS || true
[ -d public ] && mv public public.old.\$TS || true

echo "[服务器] 解包..."
tar -xzf /tmp/sifan-next.tar.gz
tar -xzf /tmp/sifan-public.tar.gz

# 校验 1：BUILD_ID 必须与包内一致
NEW_BUILD_ID=\$(cat .next/BUILD_ID 2>/dev/null || echo "")
if [ -z "\$NEW_BUILD_ID" ] || [ "\$NEW_BUILD_ID" != "\$PKG_BUILD_ID" ]; then
  echo "[服务器] ✗ BUILD_ID 不一致（包=\$PKG_BUILD_ID 服务器=\$NEW_BUILD_ID），回滚"
  rm -rf .next public
  [ -d .next.old.\$TS ] && mv .next.old.\$TS .next
  [ -d public.old.\$TS ] && mv public.old.\$TS public
  pm2 restart sifan --update-env >/dev/null 2>&1 || true
  exit 1
fi
echo "[服务器] ✓ BUILD_ID 一致: \$NEW_BUILD_ID"

echo "[服务器] 启动 sifan..."
pm2 restart sifan --update-env 2>/dev/null || pm2 start npm --name sifan -- start -- -p $PORT
pm2 save
sleep 10

echo "[服务器] 健康检查..."
CODE=\$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 http://127.0.0.1:$PORT/)
echo "[服务器] 本地 HTTP 状态: \$CODE"

# 校验 2：抽取首页引用的静态资源，逐个确认不是 500（防止产物混合导致页面卡死）
echo "[服务器] 静态资源完整性检查..."
BAD=\$(curl -s --max-time 20 http://127.0.0.1:$PORT/ \
  | grep -oE '(src|href)="/_next/static/[^"]+"' \
  | sed -E 's/.*="([^"]+)"/\1/' | sort -u \
  | while read -r u; do
      c=\$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 "http://127.0.0.1:$PORT\$u")
      [ "\$c" != "200" ] && echo "\$u=\$c"
    done)
if [ -n "\$BAD" ]; then
  echo "[服务器] ✗ 发现异常静态资源："
  echo "\$BAD"
  echo "[服务器] 回滚..."
  pm2 stop sifan >/dev/null 2>&1 || true
  rm -rf .next public
  [ -d .next.old.\$TS ] && mv .next.old.\$TS .next
  [ -d public.old.\$TS ] && mv public.old.\$TS public
  pm2 restart sifan --update-env >/dev/null 2>&1 || true
  exit 1
fi
echo "[服务器] ✓ 静态资源全部正常"

if [ "\$CODE" != "200" ]; then
  echo "[服务器] ✗ 健康检查失败，回滚..."
  pm2 stop sifan >/dev/null 2>&1 || true
  rm -rf .next public
  [ -d .next.old.\$TS ] && mv .next.old.\$TS .next
  [ -d public.old.\$TS ] && mv public.old.\$TS public
  pm2 restart sifan --update-env >/dev/null 2>&1 || true
  exit 1
fi

echo "[服务器] 清理 3 天前的旧备份..."
find $SERVER_DIR -maxdepth 1 -name '.next.old.*' -mtime +3 -exec rm -rf {} + 2>/dev/null || true
find $SERVER_DIR -maxdepth 1 -name 'public.old.*' -mtime +3 -exec rm -rf {} + 2>/dev/null || true
echo "[服务器] 部署完成"
pm2 list --no-color | grep -E 'sifan|lingji' || true
REMOTE

log "公网验证..."
curl -sI --max-time 20 https://www.zjsifan.com/ | head -3
log "部署完成 ✓"
