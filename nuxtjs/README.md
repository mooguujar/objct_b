# 岛屿社交平台 - Nuxt.js Web端

基于 Nuxt.js 3 构建的岛屿社交平台Web端项目。

## 技术栈

- **框架**: Nuxt.js 3
- **UI组件库**: Element Plus
- **状态管理**: Pinia
- **ORM**: Prisma
- **数据库**: MySQL
- **认证**: JWT
- **文件存储**: 阿里云OSS

## 项目结构

```
nuxtjs/
├── server/              # 服务端代码
│   ├── api/            # API路由
│   │   ├── auth/       # 认证相关API
│   │   └── statistics/ # 统计相关API
│   └── utils/          # 服务端工具函数
├── pages/              # 页面
│   ├── login.vue       # 登录页
│   ├── register.vue    # 注册页
│   └── index.vue       # 首页
├── composables/        # 组合式函数
├── stores/             # Pinia状态管理
├── assets/             # 静态资源
└── prisma/             # Prisma配置和数据模型
```

## 环境配置

复制 `.env.example` 为 `.env` 并配置以下环境变量：

```env
# 数据库配置
DB_HOST=0.tcp.jp.ngrok.io
DB_PORT=17304
DB_USER=root
DB_PASSWORD=123456
DATABASE_URL=mysql://root:123456@0.tcp.jp.ngrok.io:17304/island_social?connection_limit=1

# JWT配置
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# 阿里云OSS配置
OSS_BUCKET=qqqsss
OSS_ENDPOINT=oss-cn-hongkong.aliyuncs.com
OSS_REGION=oss-cn-hongkong
OSS_ACCESS_KEY=your-access-key
OSS_ACCESS_SECRET=your-access-secret
```

## 安装依赖

```bash
npm install
```

## 数据库配置

项目使用 Prisma ORM 管理数据库。数据库结构已通过 `prisma db pull` 从现有数据库同步。

生成 Prisma Client：

```bash
npx prisma generate
```

## 开发

启动开发服务器：

```bash
npm run dev
```

访问 http://localhost:3000

## 构建

构建生产版本：

```bash
npm run build
```

预览生产版本：

```bash
npm run preview
```

## 功能特性

### 已实现功能

- ✅ 用户注册
- ✅ 用户登录
- ✅ JWT认证
- ✅ 页面访问统计
- ✅ 点击事件统计

### API接口

#### 认证相关

- `POST /api/auth/register` - 用户注册
- `POST /api/auth/login` - 用户登录
- `GET /api/auth/me` - 获取当前用户信息

#### 统计相关

- `POST /api/statistics/pageview` - 页面访问统计
- `POST /api/statistics/click` - 点击事件统计

## 注意事项

- 数据库使用 BigInt 类型的ID，API返回时会转换为Number类型
- 用户密码使用 bcrypt 加密存储
- JWT token存储在localStorage中
