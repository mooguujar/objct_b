# 岛屿社交平台 - 后端服务

## 技术栈

- NestJS
- Prisma ORM
- MySQL
- JWT认证
- 阿里云OSS
- Sharp图片处理

## 项目结构

```
backend/
├── src/
│   ├── modules/         # 功能模块
│   ├── common/          # 公共模块
│   │   ├── filters/     # 异常过滤器
│   │   ├── interceptors/# 拦截器
│   │   ├── guards/      # 守卫
│   │   ├── dto/         # 数据传输对象
│   │   └── utils/       # 工具函数
│   └── main.ts          # 入口文件
└── prisma/              # Prisma配置
```

## 开发命令

```bash
# 安装依赖
npm install

# 开发模式
npm run start:dev

# 生产构建
npm run build

# 生产运行
npm run start:prod
```
