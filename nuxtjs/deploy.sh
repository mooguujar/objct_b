#!/bin/bash

# Nuxt.js 项目部署脚本
# 使用方法: ./deploy.sh

set -e  # 遇到错误立即退出

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_NAME="nuxtjs-app"

echo "========================================="
echo "开始部署 Nuxt.js 应用"
echo "项目目录: $PROJECT_DIR"
echo "========================================="

cd $PROJECT_DIR

# 1. 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "错误: 未安装 Node.js"
    exit 1
fi

echo "✓ Node.js 版本: $(node --version)"
echo "✓ npm 版本: $(npm --version)"

# 2. 安装依赖
echo ""
echo "正在安装依赖..."
npm ci --production

# 3. 运行数据库迁移
echo ""
echo "正在运行数据库迁移..."
if [ -f "prisma/schema.prisma" ]; then
    npx prisma migrate deploy
    npx prisma generate
    echo "✓ 数据库迁移完成"
else
    echo "⚠ 未找到 Prisma schema，跳过数据库迁移"
fi

# 4. 构建项目
echo ""
echo "正在构建项目..."
npm run build

if [ ! -d ".output" ]; then
    echo "错误: 构建失败，未找到 .output 目录"
    exit 1
fi

echo "✓ 构建完成"

# 5. 创建日志目录
mkdir -p logs

# 6. 重启 PM2（如果已安装）
if command -v pm2 &> /dev/null; then
    echo ""
    echo "正在重启 PM2 应用..."
    
    if pm2 list | grep -q "$APP_NAME"; then
        pm2 restart $APP_NAME
        echo "✓ 应用已重启"
    else
        pm2 start ecosystem.config.js
        echo "✓ 应用已启动"
    fi
    
    echo ""
    echo "PM2 状态:"
    pm2 status
    
    echo ""
    echo "查看日志: pm2 logs $APP_NAME"
else
    echo ""
    echo "⚠ PM2 未安装，请手动启动应用:"
    echo "   node .output/server/index.mjs"
fi

echo ""
echo "========================================="
echo "部署完成！"
echo "========================================="
echo ""
echo "应用信息:"
echo "  - 应用名称: $APP_NAME"
echo "  - 运行端口: 3000"
echo "  - 日志目录: $PROJECT_DIR/logs"
echo ""
echo "常用命令:"
echo "  - 查看状态: pm2 status"
echo "  - 查看日志: pm2 logs $APP_NAME"
echo "  - 重启应用: pm2 restart $APP_NAME"
echo "  - 停止应用: pm2 stop $APP_NAME"
echo ""

