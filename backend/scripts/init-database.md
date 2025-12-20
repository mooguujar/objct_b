# 数据库初始化指南

## 前置条件

1. **确保 MySQL 数据库服务器正在运行**
2. **确保 ngrok 隧道已启动**（如果使用 ngrok）
3. **确保数据库连接配置正确**

## 初始化步骤

### 1. 创建数据库（如果不存在）

使用 MySQL 客户端连接到数据库服务器，执行：

```sql
CREATE DATABASE IF NOT EXISTS island_social CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

或者使用命令行：

```bash
mysql -h 0.tcp.in.ngrok.io -P 12153 -u root -p123456 -e "CREATE DATABASE IF NOT EXISTS island_social CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

### 2. 运行 Prisma 迁移

```bash
npm run prisma:migrate
```

### 3. 生成 Prisma Client

```bash
npm run prisma:generate
```

### 4. （可选）创建初始数据

运行种子脚本（如果存在）：

```bash
npm run prisma:seed
```

## 验证

运行 Prisma Studio 查看数据库：

```bash
npm run prisma:studio
```

