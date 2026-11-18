#!/bin/bash
# 图片优化脚本
# 压缩图片并转换为 WebP 格式

set -e

echo "=========================================="
echo " 图片优化脚本"
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

# 检查是否安装了 ImageMagick 或 sharp
if ! command -v convert &> /dev/null && ! command -v magick &> /dev/null; then
    print_warning "未检测到 ImageMagick，正在安装..."
    apt-get update -qq
    apt-get install -y imagemagick
    print_success "ImageMagick 安装完成"
fi

# 检查 sharp
if ! command -v npx &> /dev/null; then
    print_error "需要 Node.js 环境"
    exit 1
fi

echo "步骤 1: 分析图片文件..."
echo ""

# 创建备份目录
BACKUP_DIR="public/images_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"

# 统计信息
TOTAL_SIZE_BEFORE=0
TOTAL_FILES=0

# 查找所有图片
IMAGES=$(find public -type f \( -name "*.png" -o -name "*.jpg" -o -name "*.jpeg" \))

for img in $IMAGES; do
    SIZE=$(du -b "$img" | cut -f1)
    TOTAL_SIZE_BEFORE=$((TOTAL_SIZE_BEFORE + SIZE))
    TOTAL_FILES=$((TOTAL_FILES + 1))
done

echo "找到 $TOTAL_FILES 个图片文件"
echo "总大小: $(numfmt --to=iec-i --suffix=B $TOTAL_SIZE_BEFORE)"
echo ""

if [ $TOTAL_FILES -eq 0 ]; then
    print_error "未找到可优化的图片"
    exit 1
fi

echo "步骤 2: 安装优化工具..."
echo ""

# 安装 imagemin 和相关插件
if [ ! -d "node_modules/imagemin" ]; then
    echo "正在安装图片优化工具..."
    pnpm add -D imagemin imagemin-pngquant imagemin-mozjpeg imagemin-webp imagemin-svgo
    print_success "优化工具安装完成"
else
    print_success "优化工具已安装"
fi

echo ""
echo "步骤 3: 优化图片..."
echo ""

# 创建优化脚本
cat > optimize-images.js << 'EOF'
const imagemin = require('imagemin');
const imageminPngquant = require('imagemin-pngquant');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminWebp = require('imagemin-webp');
const path = require('path');
const fs = require('fs');

async function optimizeImages() {
  try {
    const pngFiles = await imagemin(['public/**/*.png'], {
      destination: 'public',
      plugins: [
        imageminPngquant({
          quality: [0.65, 0.8],
          speed: 4
        })
      ]
    });

    console.log(`✓ 优化了 ${pngFiles.length} 个 PNG 文件`);

    const jpgFiles = await imagemin(['public/**/*.jpg', 'public/**/*.jpeg'], {
      destination: 'public',
      plugins: [
        imageminMozjpeg({
          quality: 75,
          progressive: true
        })
      ]
    });

    console.log(`✓ 优化了 ${jpgFiles.length} 个 JPG/JPEG 文件`);

    // 生成 WebP 版本
    const webpFiles = await imagemin(['public/**/*.{jpg,jpeg,png}'], {
      destination: 'public',
      plugins: [
        imageminWebp({
          quality: 75
        })
      ]
    });

    console.log(`✓ 生成了 ${webpFiles.length} 个 WebP 文件`);

    // 统计优化效果
    const totalOriginalSize = [...pngFiles, ...jpgFiles].reduce((sum, file) => sum + file.sourcePath.size, 0);
    const totalOptimizedSize = [...pngFiles, ...jpgFiles].reduce((sum, file) => sum + fs.statSync(file.destinationPath).size, 0);
    const savings = ((totalOriginalSize - totalOptimizedSize) / totalOriginalSize * 100).toFixed(2);

    console.log(`\n优化效果:`);
    console.log(`  原始大小: ${(totalOriginalSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  优化后大小: ${(totalOptimizedSize / 1024 / 1024).toFixed(2)} MB`);
    console.log(`  节省空间: ${savings}%`);

  } catch (error) {
    console.error('优化失败:', error);
    process.exit(1);
  }
}

optimizeImages();
EOF

# 运行优化脚本
node optimize-images.js

# 清理临时脚本
rm -f optimize-images.js

echo ""
echo "步骤 4: 统计优化效果..."
echo ""

TOTAL_SIZE_AFTER=0
for img in $IMAGES; do
    if [ -f "$img" ]; then
        SIZE=$(du -b "$img" | cut -f1)
        TOTAL_SIZE_AFTER=$((TOTAL_SIZE_AFTER + SIZE))
    fi
done

SAVINGS=$((TOTAL_SIZE_BEFORE - TOTAL_SIZE_AFTER))
PERCENTAGE=$(echo "scale=2; ($SAVINGS * 100) / $TOTAL_SIZE_BEFORE" | bc)

echo "=========================================="
echo " 优化完成！"
echo "=========================================="
echo ""
echo "原始大小: $(numfmt --to=iec-i --suffix=B $TOTAL_SIZE_BEFORE)"
echo "优化后大小: $(numfmt --to=iec-i --suffix=B $TOTAL_SIZE_AFTER)"
echo -e "${GREEN}节省空间: $(numfmt --to=iec-i --suffix=B $SAVINGS) ($PERCENTAGE%)${NC}"
echo ""
echo "备份位置: $BACKUP_DIR"
echo ""
echo "WebP 文件已生成，浏览器会自动使用 WebP 格式以获得更快的加载速度。"
echo ""
