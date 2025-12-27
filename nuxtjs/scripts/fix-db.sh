#!/bin/bash

# 数据库修复脚本
# 用于修复 Prisma 数据库迁移和客户端生成问题

echo "开始修复数据库问题..."

# 1. 检查环境变量
if [ -z "$DATABASE_URL" ]; then
    echo "错误: DATABASE_URL 环境变量未设置"
    echo "请设置 DATABASE_URL，格式: mysql://user:password@host:port/database"
    exit 1
fi

# 2. 重新生成 Prisma Client
echo "正在重新生成 Prisma Client..."
npx prisma generate

# 3. 执行数据库迁移
echo "正在执行数据库迁移..."
npx prisma migrate deploy

# 4. 验证数据库连接
echo "正在验证数据库连接..."
npx prisma db pull --force

echo "修复完成！"

