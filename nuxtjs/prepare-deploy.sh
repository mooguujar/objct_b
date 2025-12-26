#!/bin/bash

# 准备部署脚本 - 用于在本地构建并准备提交
# 使用方法: ./prepare-deploy.sh

set -e

echo "========================================="
echo "准备部署文件"
echo "========================================="

# 检查是否已构建
if [ ! -d ".output" ]; then
    echo "❌ 错误: .output 目录不存在，请先运行 npm run build"
    exit 1
fi

echo "✓ 找到 .output 目录"

# 备份原始 .gitignore
if [ ! -f ".gitignore.backup" ]; then
    cp .gitignore .gitignore.backup
    echo "✓ 已备份 .gitignore"
fi

# 检查 .gitignore 中是否已有 .output 的例外规则
if grep -q "^!\.output/" .gitignore; then
    echo "✓ .gitignore 已包含 .output 例外规则"
else
    # 添加例外规则
    echo "" >> .gitignore
    echo "# 允许 .output 用于部署（临时启用）" >> .gitignore
    echo "!.output/" >> .gitignore
    echo "!.output/**" >> .gitignore
    echo "✓ 已更新 .gitignore 以允许 .output"
fi

# 显示需要提交的文件
echo ""
echo "需要提交的文件："
echo "  - .output/ (构建产物)"
echo "  - package.json (依赖声明)"
echo "  - prisma/ (数据库 schema，如果需要)"
echo ""
echo "下一步："
echo "  1. git add .output package.json prisma"
echo "  2. git commit -m 'chore: 添加构建产物用于部署'"
echo "  3. git push"
echo ""
echo "⚠️  注意: 提交完成后，如果需要恢复 .gitignore，运行:"
echo "  mv .gitignore.backup .gitignore"

