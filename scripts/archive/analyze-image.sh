#!/bin/bash
# 图片内容分析脚本

echo "=========================================="
echo " 图片内容分析"
echo "=========================================="
echo ""

IMAGE="$1"

if [ -z "$IMAGE" ]; then
    IMAGE="public/assets/image.png"
fi

echo "分析图片: $IMAGE"
echo ""

if [ ! -f "$IMAGE" ]; then
    echo "❌ 文件不存在: $IMAGE"
    exit 1
fi

echo "📊 文件信息："
echo "  文件大小: $(du -h "$IMAGE" | cut -f1)"
echo "  文件类型: $(file "$IMAGE" 2>/dev/null || echo "PNG Image")"
echo "  修改时间: $(stat -c %y "$IMAGE" 2>/dev/null || stat -f "%Sm" "$IMAGE")"
echo ""

echo "🎨 图片详情："

if command -v identify &> /dev/null; then
    echo ""
    identify -verbose "$IMAGE" 2>/dev/null | head -20
elif command -v python3 &> /dev/null; then
    python3 - << EOF
from PIL import Image
import os

try:
    img = Image.open('$IMAGE')
    print(f"  尺寸: {img.size[0]} x {img.size[1]} 像素")
    print(f"  格式: {img.format}")
    print(f"  模式: {img.mode}")
    print(f"  宽高比: {img.size[0]/img.size[1]:.2f}")
    if hasattr(img, 'info'):
        if 'dpi' in img.info:
            print(f"  DPI: {img.info['dpi']}")
except Exception as e:
    print(f"  无法读取图片详情: {e}")
EOF
else
    echo "  需要 ImageMagick 或 Python PIL 才能查看详细信息"
    echo "  安装: sudo apt-get install imagemagick"
    echo "  或: sudo pip3 install Pillow"
fi

echo ""
echo "💾 优化建议："

SIZE=$(du -b "$IMAGE" | cut -f1)
if [ $SIZE -gt 1000000 ]; then
    echo "  ⚠️  文件较大（>1MB），建议压缩"
    echo ""
    echo "  推荐操作："
    echo "  1. 访问 https://tinypng.com/ 压缩图片"
    echo "  2. 使用 ./compress-images.sh 命令压缩"
    echo "  3. 转换为 WebP 格式以获得更好压缩率"
else
    echo "  ✅ 文件大小合理"
fi

echo ""
echo "📝 文件位置: $IMAGE"
echo ""
