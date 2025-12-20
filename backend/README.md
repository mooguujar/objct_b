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

复制 `.env.example` 为 `.env` 并填写相应配置：

```env
DATABASE_URL="mysql://root:123456@0.tcp.in.ngrok.io:12153/island_social?schema=public"
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7200s
```

## 数据库初始化

```bash
# 生成 Prisma Client
npm run prisma:generate

# 创建数据库迁移
npm run prisma:migrate

# 打开 Prisma Studio（可选）
npm run prisma:studio
```

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

