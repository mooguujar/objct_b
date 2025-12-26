# Vercel 部署指南

## ✅ Vercel CLI 已安装

## 部署步骤

### 第一步：登录 Vercel

```bash
vercel login
```

这会打开浏览器，使用以下方式之一登录：
- GitHub 账号（推荐）
- GitLab 账号
- Bitbucket 账号
- 邮箱注册

### 第二步：进入项目目录

```bash
cd nuxtjs
```

### 第三步：首次部署

```bash
vercel
```

部署过程中会询问：
1. **Set up and deploy?** → 输入 `Y`
2. **Which scope?** → 选择你的账号
3. **Link to existing project?** → 输入 `N`（首次部署）
4. **What's your project's name?** → 输入项目名称（或直接回车使用默认）
5. **In which directory is your code located?** → 输入 `./`（当前目录）
6. **Want to override the settings?** → 输入 `N`（使用默认设置）

### 第四步：配置环境变量

部署完成后，需要配置环境变量：

```bash
# 数据库配置
vercel env add DB_HOST
vercel env add DB_PORT
vercel env add DB_USER
vercel env add DB_PASSWORD
vercel env add DATABASE_URL

# OSS 配置
vercel env add OSS_BUCKET
vercel env add OSS_ENDPOINT
vercel env add OSS_REGION
vercel env add OSS_ACCESS_KEY
vercel env add OSS_ACCESS_SECRET

# JWT 配置
vercel env add JWT_SECRET
vercel env add JWT_EXPIRES_IN
```

**注意：** 每次添加环境变量时，会询问：
- **What's the value of ...?** → 输入对应的值
- **Add ... to which Environments?** → 选择 `Production`, `Preview`, `Development`（建议全选）

### 第五步：生产环境部署

```bash
vercel --prod
```

或者

```bash
vercel -p
```

## 快速部署命令（一键执行）

```bash
cd nuxtjs
vercel login
vercel
# 然后按照提示配置环境变量
vercel --prod
```

## 环境变量配置（批量方式）

你也可以在 Vercel 网站配置环境变量：

1. 访问 https://vercel.com
2. 登录后选择你的项目
3. 进入 **Settings** → **Environment Variables**
4. 添加所有需要的环境变量

## 查看部署状态

```bash
# 查看部署列表
vercel ls

# 查看项目信息
vercel inspect

# 查看日志
vercel logs
```

## 常用命令

```bash
# 部署到预览环境
vercel

# 部署到生产环境
vercel --prod

# 移除部署
vercel remove

# 查看项目域名
vercel domains ls
```

## 注意事项

1. **数据库连接**
   - 确保数据库可以从公网访问
   - 在数据库服务器配置白名单，允许 Vercel 的 IP 访问
   - Vercel 的 IP 是动态的，建议使用 `0.0.0.0/0`（如果安全允许）

2. **环境变量**
   - 生产环境和预览环境的环境变量是分开的
   - 建议同时配置 Production、Preview、Development 三个环境

3. **构建配置**
   - Vercel 会自动检测 Nuxt.js 项目
   - 构建命令：`npm run build`
   - 输出目录：`.output`

4. **自定义域名**
   - 在 Vercel 项目设置中可以添加自定义域名
   - 免费版支持自定义域名

## 故障排查

1. **构建失败**
   ```bash
   # 查看详细日志
   vercel logs
   ```

2. **环境变量未生效**
   - 检查环境变量是否正确添加到对应环境
   - 重新部署：`vercel --prod`

3. **数据库连接失败**
   - 检查数据库是否可以从公网访问
   - 检查数据库白名单配置
   - 检查环境变量是否正确

## 下一步

部署完成后，你会获得一个类似 `https://your-project.vercel.app` 的 URL。

现在可以开始部署了！

