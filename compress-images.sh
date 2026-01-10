#!/bin/bash
# 使用 ImageMagick 压缩图片

set -e

echo "=========================================="
echo " 使用 ImageMagick 压缩图片"
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

# 检查 ImageMagick
if ! command -v magick &> /dev/null && ! command -v convert &> /dev/null; then
    print_error "未检测到 ImageMagick"
    echo ""
    echo "正在安装 ImageMagick..."
    apt-get update -qq
    apt-get install -y imagemagick
    print_success "ImageMagick 安装完成"
fi

# 创建备份目录
BACKUP_DIR="public/images_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

echo "开始压缩图片..."
echo ""

# 压缩关键图片
COMPRESSED=0
FAILED=0

compress_image() {
    local src="$1"
    local filename=$(basename "$src")
    local ext="${filename##*.}"

    # 备份
    cp "$src" "$BACKUP_DIR/"

    # 压缩
    if [ "$ext" = "png" ]; then
        # PNG 压缩
        if command -v magick &> /dev/null; then
            magick "$src" -quality 80 -strip "$src" 2>/dev/null
        else
            convert "$src" -quality 80 -strip "$src" 2>/dev/null
        fi
    elif [ "$ext" = "jpg" ] || [ "$ext" = "jpeg" ]; then
        # JPG 压缩
        if command -v magick &> /dev/null; then
            magick "$src" -quality 75 -strip -interlace Plane "$src" 2>/dev/null
        else
            convert "$src" -quality 75 -strip -interlace Plane "$src" 2>/dev/null
        fi
    fi

    if [ $? -eq 0 ]; then
        COMPRESSED=$((COMPRESSED + 1))
        print_success "已压缩: $filename"
    else
        FAILED=$((FAILED + 1))
        print_error "压缩失败: $filename"
    fi
}

# 压缩关键图片
compress_image "public/assets/image-4.png"
compress_image "public/assets/小超人.png"
compress_image "public/assets/1.png"
compress_image "public/assets/2.png"
compress_image "public/assets/3.png"
compress_image "public/assets/5.png"
compress_image "public/assets/6.png"
compress_image "public/assets/洞察瞬间-创立场景.png"
compress_image "public/assets/全域作战室-团队协作.png"
compress_image "public/assets/知识共享-企业文化.png"

# 压缩门店照片
if [ -d "public/images/stores" ]; then
    echo ""
    echo "压缩门店照片..."
    for img in public/images/stores/*.jpg; do
        compress_image "$img"
    done
fi

echo ""
echo "=========================================="
echo " 压缩完成！"
echo "=========================================="
echo ""
echo "已压缩: $COMPRESSED 张"
echo "失败: $FAILED 张"
echo "备份位置: $BACKUP_DIR"
echo ""
echo "如需恢复原始图片，运行："
echo "  cp $BACKUP_DIR/* public/assets/"
echo ""
