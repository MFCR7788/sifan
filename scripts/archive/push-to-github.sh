#!/bin/bash

# Git 快速上传到 GitHub 脚本
# 使用方法: bash push-to-github.sh

set -e

echo "========================================="
echo "    GitHub 快速上传脚本"
echo "========================================="

# 颜色定义
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 检查 Git 是否已安装
if ! command -v git &> /dev/null; then
    echo -e "${RED}未检测到 Git，请先安装 Git${NC}"
    exit 1
fi

echo -e "${GREEN}[1/5] 检查 Git 状态...${NC}"

# 检查是否是 Git 仓库
if [ ! -d ".git" ]; then
    echo -e "${YELLOW}未检测到 Git 仓库，正在初始化...${NC}"
    git init
    echo -e "${GREEN}Git 仓库初始化完成${NC}"
fi

# 检查状态
git_status=$(git status --porcelain)

if [ -z "$git_status" ]; then
    echo -e "${YELLOW}当前没有需要提交的更改${NC}"
    echo ""
    echo "如果需要推送到 GitHub，请运行："
    echo "  git push"
    exit 0
fi

echo -e "${GREEN}[2/5] 添加文件到暂存区...${NC}"

# 添加所有文件
git add .

echo -e "${GREEN}[3/5] 提交代码...${NC}"

# 读取提交信息
echo ""
echo -e "${YELLOW}请输入提交信息（留空使用默认信息）：${NC}"
read -p "> " commit_msg

if [ -z "$commit_msg" ]; then
    commit_msg="Update code $(date '+%Y-%m-%d %H:%M:%S')"
fi

git commit -m "$commit_msg"

echo -e "${GREEN}[4/5] 检查远程仓库...${NC}"

# 检查是否已配置远程仓库
remote_url=$(git remote get-url origin 2>/dev/null || echo "")

if [ -z "$remote_url" ]; then
    echo -e "${YELLOW}未检测到远程仓库配置${NC}"
    echo ""
    echo "请按照以下步骤操作："
    echo "  1. 在 GitHub 创建新仓库（不要初始化 README）"
    echo "  2. 复制仓库地址"
    echo ""

    read -p "请输入 GitHub 仓库地址: " repo_url

    if [ -z "$repo_url" ]; then
        echo -e "${RED}仓库地址不能为空${NC}"
        exit 1
    fi

    git remote add origin "$repo_url"
    echo -e "${GREEN}远程仓库配置完成${NC}"
else
    echo -e "${GREEN}检测到远程仓库: $remote_url${NC}"
fi

echo -e "${GREEN}[5/5] 推送到 GitHub...${NC}"

# 获取当前分支名
current_branch=$(git branch --show-current)

# 推送代码
if git push -u origin "$current_branch" 2>/dev/null; then
    echo ""
    echo -e "${GREEN}========================================="
    echo -e "    推送成功！"
    echo "========================================="
    echo ""
    echo "仓库地址: $remote_url"
    echo ""
    echo "后续更新代码只需运行："
    echo "  git add ."
    echo "  git commit -m 'your message'"
    echo "  git push"
    echo ""
else
    echo -e "${RED}推送失败，可能需要身份验证${NC}"
    echo ""
    echo "请手动运行以下命令："
    echo "  git push -u origin $current_branch"
    echo ""
    echo "如果使用 HTTPS，需要输入 GitHub 用户名和 Personal Access Token"
    echo "如果使用 SSH，请确保已配置 SSH 密钥"
    exit 1
fi
