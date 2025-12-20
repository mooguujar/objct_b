# 环境变量配置说明

## 配置文件

项目使用 `.env` 文件进行环境配置，请参考 `.env.example` 创建你的 `.env` 文件。

## 配置项说明

### 数据库配置

```env
DATABASE_URL=mysql://user:password@host:port/database?schema=public
```

- **格式**：MySQL连接字符串
- **说明**：Prisma使用的数据库连接地址
- **示例**：`mysql://root:123456@localhost:3306/island_social?schema=public`

### JWT配置

```env
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-key
JWT_REFRESH_EXPIRES_IN=30d
```

- **JWT_SECRET**：JWT Token签名密钥（生产环境请使用强随机字符串）
- **JWT_EXPIRES_IN**：Access Token过期时间（如：7d, 24h, 3600s）
- **JWT_REFRESH_SECRET**：Refresh Token签名密钥（生产环境请使用强随机字符串）
- **JWT_REFRESH_EXPIRES_IN**：Refresh Token过期时间

### 服务器配置

```env
PORT=3000
NODE_ENV=development
```

- **PORT**：服务器监听端口
- **NODE_ENV**：运行环境（development/production）

### 阿里云OSS配置

```env
OSS_BUCKET=your-bucket-name
OSS_ENDPOINT=oss-cn-hongkong.aliyuncs.com
OSS_REGION=oss-cn-hongkong
OSS_ACCESS_KEY=your-access-key-id
OSS_ACCESS_SECRET=your-access-key-secret
```

- **OSS_BUCKET**：OSS存储桶名称
- **OSS_ENDPOINT**：OSS访问域名
- **OSS_REGION**：OSS区域
- **OSS_ACCESS_KEY**：OSS访问密钥ID
- **OSS_ACCESS_SECRET**：OSS访问密钥Secret

### API基础URL

```env
API_BASE_URL=http://localhost:3000/api/v1
```

- **说明**：API基础地址（主要用于前端调用）

## 快速开始

1. 复制配置模板：
```bash
cp .env.example .env
```

2. 根据实际情况修改配置值

3. 确保数据库已创建：
```sql
CREATE DATABASE island_social CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

4. 运行数据库迁移：
```bash
npx prisma migrate dev
```

5. 生成Prisma Client：
```bash
npx prisma generate
```

## 安全提示

⚠️ **重要**：
- `.env` 文件已添加到 `.gitignore`，不会提交到版本控制
- 生产环境请使用强随机字符串作为JWT密钥
- OSS密钥请妥善保管，不要泄露
- 建议使用密钥管理服务（如AWS Secrets Manager）管理敏感信息

