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
# 生产运行目录：/opt/sifan-prod
# 与 /root/sifan 物理隔离 —— 后者是外部部署流程（.next.backup.* + build-package.tar.gz
# 风格）的操作目标，会覆盖 .next 但不一定重启进程，导致静态资源 500。
SERVER_DIR="/opt/sifan-prod"
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
  # 剔除 macOS 元数据（._* / .DS_Store）
  # 注意：必须用 -depth 后序处理，否则非空目录（._brand 等）会删除失败
  find /tmp/pub-pkg -depth -name '._*' -delete 2>/dev/null || true
  find /tmp/pub-pkg -depth -name '.DS_Store' -delete 2>/dev/null || true
  # COPYFILE_DISABLE=1 阻止 tar 打包 AppleDouble 文件；
  # --no-xattrs 阻止注入 LIBARCHIVE 扩展头（GNU tar 会告警且污染产物）
  COPYFILE_DISABLE=1 tar --no-xattrs -czf /tmp/sifan-public.tar.gz -C /tmp/pub-pkg public 2>/dev/null
  rm -rf /tmp/pub-pkg
  ls -lh /tmp/sifan-next.tar.gz /tmp/sifan-public.tar.gz
fi

# ---------- 2. 上传（带 md5 校验与自动重试） ----------
# 国内网络下 scp 偶发 Broken pipe / Operation timedown，中断会导致
# 服务器解包出残缺产物（图片 404）。故上传后必须校验 md5，不一致则重传。
upload_with_verify() {
  local local_file="$1" remote_file="$2" name
  name="$(basename "$local_file")"
  local local_md5 remote_md5
  local_md5="$(md5 -q "$local_file")"
  for attempt in 1 2 3 4 5; do
    log "上传 $name（第 $attempt 次）..."
    scp -o ConnectTimeout=20 -o ServerAliveInterval=15 -o ServerAliveCountMax=6 \
        "$local_file" "$SERVER:$remote_file" || true
    remote_md5="$(ssh -o ConnectTimeout=20 -o BatchMode=yes "$SERVER" \
        "md5sum '$remote_file' 2>/dev/null | cut -d' ' -f1" 2>/dev/null | tr -d '\r\n')"
    if [ "$remote_md5" = "$local_md5" ]; then
      log "  ✓ $name 上传完整（md5 一致）"
      return 0
    fi
    log "  ✗ $name 校验不一致（本地 $local_md5 / 服务器 ${remote_md5:-无}），重传"
  done
  log "  ✗ $name 连续 5 次上传失败，中止部署"
  return 1
}

upload_with_verify /tmp/sifan-next.tar.gz   /tmp/sifan-next.tar.gz   || exit 1
upload_with_verify /tmp/sifan-public.tar.gz /tmp/sifan-public.tar.gz || exit 1

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
# 解包前校验包完整性：tar 能完整列出条目数且 BUILD_ID 可读
if ! tar -xzOf /tmp/sifan-next.tar.gz .next/BUILD_ID >/dev/null 2>&1; then
  echo "[服务器] ✗ 构建包损坏（BUILD_ID 不可读），中止部署"
  [ -d .next.old.\$TS ] && mv .next.old.\$TS .next
  [ -d public.old.\$TS ] && mv public.old.\$TS public
  pm2 restart sifan --update-env >/dev/null 2>&1 || true
  exit 1
fi
tar -xzf /tmp/sifan-next.tar.gz
# public 包必须能完整解出（含 brand 目录），否则清空重来，避免新旧混合
rm -rf public
tar -xzf /tmp/sifan-public.tar.gz
if [ ! -d public ] || [ ! -d public/brand ]; then
  echo "[服务器] ✗ 静态资源包解包异常（缺 public/brand），中止部署"
  rm -rf .next public
  [ -d .next.old.\$TS ] && mv .next.old.\$TS .next
  [ -d public.old.\$TS ] && mv public.old.\$TS public
  pm2 restart sifan --update-env >/dev/null 2>&1 || true
  exit 1
fi
echo "[服务器] ✓ 产物解包完整（public 文件数 \$(find public -type f | wc -l | tr -d ' ')）"

# 同步静态资源到 nginx 直出目录（/var/www/sifan-public）
# nginx 直接读盘伺服这些路径，避免回源 Node 进程，并启用 1 年长缓存
echo "[服务器] 同步静态资源到 nginx 直出目录..."
rm -rf /var/www/sifan-public
mkdir -p /var/www/sifan-public
cp -a public/. /var/www/sifan-public/
chown -R nginx:nginx /var/www/sifan-public 2>/dev/null || true
chmod -R 755 /var/www/sifan-public
find /var/www/sifan-public -type f -exec chmod 644 {} \;
find /var/www/sifan-public -depth -name '._*' -delete 2>/dev/null || true
find /var/www/sifan-public -depth -name '.DS_Store' -delete 2>/dev/null || true
find $SERVER_DIR/public -depth -name '._*' -delete 2>/dev/null || true
find $SERVER_DIR/public -depth -name '.DS_Store' -delete 2>/dev/null || true

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

# 校验 2：进程加载的 manifest 与磁盘产物必须同批
# （服务器上存在并行的外部部署流程，可能覆盖 .next 而不重启进程，
#   导致 HTML 引用旧 hash、磁盘只有新文件 → 静态资源 500）
echo "[服务器] 进程与磁盘产物一致性检查..."
LIVE_ID=\$(curl -s --max-time 20 http://127.0.0.1:$PORT/ \\
  | grep -oE '/_next/static/chunks/main-app-[a-f0-9]+\\.js' | head -1)
if [ -n "\$LIVE_ID" ]; then
  # \$LIVE_ID 形如 /_next/static/chunks/main-app-xxx.js
  # 磁盘实际路径是 .next/static/chunks/main-app-xxx.js（去掉 /_next 前缀）
  DISK_CHUNK="\$SERVER_DIR/.next\${LIVE_ID#/_next}"
  if [ ! -f "\$DISK_CHUNK" ]; then
    echo "[服务器] ✗ 检测到产物不同批（缺 \$LIVE_ID），重新解包并重启..."
    pm2 stop sifan >/dev/null 2>&1 || true
    rm -rf "$SERVER_DIR/.next"
    tar -xzf /tmp/sifan-next.tar.gz
    pm2 restart sifan --update-env >/dev/null 2>&1 || pm2 start npm --name sifan -- start -- -p $PORT
    pm2 save >/dev/null 2>&1
    sleep 10
    echo "[服务器] 已重新同步"
  else
    echo "[服务器] ✓ 一致: \$LIVE_ID"
  fi
fi

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
