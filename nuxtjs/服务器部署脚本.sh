#!/bin/bash

# 服务器部署脚本 - 在服务器上运行
# 使用方法: ./服务器部署脚本.sh

set -e

PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_NAME="nuxtjs-app"

echo "========================================="
echo "服务器部署脚本"
echo "========================================="

cd $PROJECT_DIR

# 1. 检查 .output 目录
if [ ! -d ".output" ]; then
    echo "❌ 错误: .output 目录不存在"
    echo "请确保已从 git 拉取包含 .output 的代码"
    exit 1
fi

echo "✓ 找到 .output 目录"

# 2. 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误: 未安装 Node.js"
    exit 1
fi

NODE_VERSION=$(node -v)
NODE_MAJOR_VERSION=$(echo $NODE_VERSION | cut -d'v' -f2 | cut -d'.' -f1)

echo "✓ Node.js 版本: $NODE_VERSION"

# 检查 Node.js 版本并提示
if [ "$NODE_MAJOR_VERSION" -lt 16 ]; then
    echo "❌ 错误: Node.js 版本过低，需要 Node.js 16.11.0+ (推荐 18+)"
    echo "当前版本: $NODE_VERSION"
    exit 1
elif [ "$NODE_MAJOR_VERSION" -eq 16 ]; then
    echo "ℹ️  检测到 Node.js 16，将使用 --experimental-fetch 标志（因为使用了 fetch API）"
    USE_EXPERIMENTAL_FETCH=true
elif [ "$NODE_MAJOR_VERSION" -ge 18 ]; then
    echo "✓ Node.js 版本满足要求（18+ 原生支持 fetch）"
    USE_EXPERIMENTAL_FETCH=false
fi

# 3. 检查环境变量文件
if [ ! -f ".env" ]; then
    echo "⚠️  警告: .env 文件不存在"
    echo "请创建 .env 文件并配置必要的环境变量"
    echo ""
    echo "参考配置："
    echo "  DB_HOST=..."
    echo "  DB_PORT=3306"
    echo "  DATABASE_URL=mysql://..."
    echo "  OSS_BUCKET=..."
    echo "  OSS_ENDPOINT=..."
    echo "  OSS_ACCESS_KEY=..."
    echo "  OSS_ACCESS_SECRET=..."
    echo "  JWT_SECRET=..."
    echo "  NODE_ENV=production"
    echo "  PORT=3000"
    echo ""
    read -p "是否继续？(y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
else
    echo "✓ 找到 .env 文件"
fi

# 4. 数据库迁移（如果需要 Prisma）
if [ -d "prisma" ] && [ -f "prisma/schema.prisma" ]; then
    echo ""
    echo "检测到 Prisma schema，是否运行数据库迁移？"
    read -p "运行迁移？(y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        if command -v npx &> /dev/null; then
            echo "运行 Prisma 迁移..."
            npx prisma migrate deploy || echo "⚠️  迁移失败，请检查数据库配置"
            npx prisma generate || echo "⚠️  Prisma generate 失败"
        else
            echo "⚠️  未找到 npx，跳过数据库迁移"
        fi
    fi
fi

# 5. 启动服务
echo ""
echo "选择启动方式："
echo "  1) PM2 (推荐)"
echo "  2) 直接运行 node"
read -p "请选择 (1/2): " choice

case $choice in
    1)
        if ! command -v pm2 &> /dev/null; then
            echo "PM2 未安装，正在安装..."
            npm install -g pm2
        fi
        
        if [ -f "ecosystem.config.js" ]; then
            if pm2 list | grep -q "$APP_NAME"; then
                echo "重启 PM2 应用..."
                pm2 restart $APP_NAME
            else
                echo "启动 PM2 应用..."
                pm2 start ecosystem.config.js
            fi
            pm2 save
            echo ""
            echo "PM2 状态："
            pm2 status
            echo ""
            echo "查看日志: pm2 logs $APP_NAME"
        else
            echo "未找到 ecosystem.config.js，使用简单方式启动..."
            if [ "$USE_EXPERIMENTAL_FETCH" = true ]; then
                echo "⚠️  使用 Node.js 16，添加 --experimental-fetch 标志"
                pm2 start .output/server/index.mjs --name $APP_NAME --node-args="--experimental-fetch"
            else
                pm2 start .output/server/index.mjs --name $APP_NAME
            fi
        fi
        ;;
    2)
        echo "直接运行 Node.js..."
        if [ "$USE_EXPERIMENTAL_FETCH" = true ]; then
            echo "⚠️  使用 Node.js 16，添加 --experimental-fetch 标志"
            node --experimental-fetch .output/server/index.mjs
        else
            node .output/server/index.mjs
        fi
        ;;
    *)
        echo "无效选择"
        exit 1
        ;;
esac

echo ""
echo "========================================="
echo "部署完成！"
echo "========================================="

