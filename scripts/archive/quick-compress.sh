#!/bin/bash
# 快速压缩关键图片
# 只压缩影响首屏加载的关键图片

set -e

echo "=========================================="
echo " 快速压缩关键图片"
echo "=========================================="
echo ""

# 颜色输出
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# 关键图片列表（影响首屏加载）
KEY_IMAGES=(
    "public/assets/image-4.png"
    "public/assets/小超人.png"
    "public/assets/1.png"
    "public/assets/2.png"
    "public/assets/3.png"
    "public/assets/5.png"
    "public/assets/6.png"
    "public/assets/洞察瞬间-创立场景.png"
    "public/assets/全域作战室-团队协作.png"
    "public/assets/知识共享-企业文化.png"
)

echo "准备优化的关键图片："
echo ""

for img in "${KEY_IMAGES[@]}"; do
    if [ -f "$img" ]; then
        SIZE=$(du -h "$img" | cut -f1)
        echo "  - $img ($SIZE)"
    else
        echo "  - $img (文件不存在)"
    fi
done

echo ""
echo "=========================================="
echo " 使用方法"
echo "=========================================="
echo ""
echo "请选择以下方式之一来压缩图片："
echo ""
echo "方式一：使用在线工具（最简单）"
echo "  1. 访问: https://tinypng.com/"
echo "  2. 上传上述图片文件"
echo "  3. 下载压缩后的图片"
echo "  4. 替换原文件"
echo ""
echo "方式二：使用 ImageMagick（需要安装）"
echo "  运行: sudo ./compress-images.sh"
echo ""
echo "方式三：手动调整图片尺寸（推荐）"
echo "  使用 Photoshop 或在线工具："
echo "  - 调整图片宽度到 1920px 或更小"
echo "  - 保存为 PNG-8 或 JPG 格式"
echo "  - 质量 75-80"
echo ""
echo "=========================================="
echo " 预期效果"
echo "=========================================="
echo ""
echo "image-4.png: 3.4MB → 600KB (减少 82%)"
echo "小超人.png:   400KB → 80KB (减少 80%)"
echo "其他图片:    5-6MB → 800KB-1.2MB (减少 75-85%)"
echo ""
echo "优化后首屏加载时间：10-30秒 → 2-5秒"
echo ""
