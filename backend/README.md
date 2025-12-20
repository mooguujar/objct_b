# 岛屿社交平台后端服务

基于 NestJS 框架开发的后端 API 服务。

## 技术栈

- **框架**: NestJS
- **ORM**: Prisma
- **数据库**: MySQL
- **认证**: JWT
- **文件存储**: 阿里云 OSS
- **图片处理**: Sharp

## 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0
- MySQL >= 8.0

## 安装依赖

```bash
npm install
```

## 配置环境变量

项目根目录已包含 `.env` 文件，包含以下配置：

### 数据库配置
```env
DATABASE_URL="mysql://root:123456@0.tcp.jp.ngrok.io:12153/island_social?schema=public"
```

### 服务配置
```env
PORT=3000
```

### JWT 配置
```env
JWT_SECRET=island-social-secret-key-2024-change-in-production
JWT_EXPIRES_IN=7200s
```

### 阿里云 OSS 配置
```env
OSS_REGION=oss-cn-hangzhou
OSS_ACCESS_KEY_ID=your-access-key-id
OSS_ACCESS_KEY_SECRET=your-access-key-secret
OSS_BUCKET=your-bucket-name
```

**注意**：
- 生产环境请修改 `JWT_SECRET` 为强密码
- 确保 OSS Bucket 已创建并配置正确的权限
- OSS_REGION 需要根据实际区域修改（如：oss-cn-beijing, oss-cn-shanghai 等）

## 数据库初始化

### 前置条件

1. **确保 MySQL 数据库服务器正在运行**
2. **确保 ngrok 隧道已启动**（如果使用 ngrok 连接远程数据库）
3. **确保数据库连接配置正确**

### 初始化步骤

#### 1. 创建数据库（如果不存在）

使用 MySQL 客户端连接到数据库服务器，执行：

```sql
CREATE DATABASE IF NOT EXISTS island_social CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

或者使用命令行：

```bash
mysql -h 0.tcp.in.ngrok.io -P 12153 -u root -p123456 -e "CREATE DATABASE IF NOT EXISTS island_social CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

#### 2. 生成 Prisma Client

```bash
npm run prisma:generate
```

#### 3. 创建数据库迁移

```bash
npm run prisma:migrate
```

这将创建所有数据库表结构。

#### 4. 打开 Prisma Studio（可选）

```bash
npm run prisma:studio
```

### 使用初始化脚本

也可以使用 PowerShell 脚本自动初始化：

```powershell
.\scripts\setup-database.ps1
```

### 故障排查

如果遇到连接错误：
- 检查 MySQL 服务器是否运行
- 检查 ngrok 隧道是否启动
- 检查 `.env` 文件中的 `DATABASE_URL` 配置是否正确
- 检查防火墙设置

## 运行项目

```bash
# 开发模式
npm run start:dev

# 生产模式
npm run start:prod
```

## 项目结构

```
backend/
├── src/
│   ├── modules/          # 功能模块
│   ├── common/           # 公共模块
│   ├── config/           # 配置文件
│   ├── app.module.ts     # 根模块
│   └── main.ts           # 入口文件
├── prisma/
│   └── schema.prisma     # 数据库模型
└── package.json
```

