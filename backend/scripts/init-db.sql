-- 岛屿社交平台数据库初始化脚本

-- 创建数据库
CREATE DATABASE IF NOT EXISTS island_social CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 使用数据库
USE island_social;

-- 注意：表结构将通过 Prisma Migrate 自动创建
-- 运行: npm run prisma:migrate
