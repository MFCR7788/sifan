#!/bin/bash

echo "=== 检查 Nginx 配置文件 ==="
echo ""
echo "1. 查看 /etc/nginx/conf.d 目录下的所有配置文件："
ls -lh /etc/nginx/conf.d/

echo ""
echo "2. 查看 /etc/nginx/sites-enabled 目录（如果存在）："
ls -lh /etc/nginx/sites-enabled/ 2>/dev/null || echo "目录不存在"

echo ""
echo "3. 搜索所有包含 zjsifan.com 的配置文件："
grep -r "server_name.*zjsifan" /etc/nginx/ 2>/dev/null | grep -v "Binary file"

echo ""
echo "4. 检查主配置文件 include 的目录："
grep -E "^include" /etc/nginx/nginx.conf | grep -v "#"

echo ""
echo "=== 建议操作 ==="
echo "请手动检查上述输出，找出并删除旧的配置文件（非 sifan.conf）"
