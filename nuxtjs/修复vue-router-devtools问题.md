# 修复 vue-router devtools 问题

## 🔍 问题原因

`vue-router` 的 devtools 代码被包含在构建产物中，它引用了 `@vue/devtools-api`，但这个依赖没有被正确打包到 `.output` 中。

即使禁用了 Nuxt 的 devtools，`vue-router` 本身仍然包含了 devtools 支持代码，所以需要这个依赖。

## ✅ 解决方案

### 已完成的修改

1. ✅ 已将 `@vue/devtools-api` 添加到 `package.json` 的 `dependencies` 中
2. ✅ devtools 已完全禁用（`devtools: { enabled: false }`）

### 需要执行的操作

#### 本地操作：

```bash
cd nuxtjs

# 1. 安装新添加的依赖
npm install

# 2. 清理旧的构建产物
rm -rf .output .nuxt

# 3. 使用生产环境构建命令重新构建
npm run build:prod

# 4. 提交更新的文件
git add .output package.json package-lock.json nuxt.config.ts
git commit -m "fix: 添加 @vue/devtools-api 依赖以支持 vue-router"
git push
```

#### 服务器操作：

```bash
cd /home/objct_b/nuxtjs

# 1. 拉取最新代码（包含新的 .output 和 package.json）
git pull

# 2. 如果服务器上有 node_modules，也需要安装依赖（可选）
npm install --production

# 3. 重启应用
pm2 restart nuxtjs-app

# 或删除后重新启动
pm2 delete nuxtjs-app
pm2 start ecosystem.config.cjs

# 4. 查看日志
pm2 logs nuxtjs-app
```

## 📝 说明

- `@vue/devtools-api` 已添加到 `dependencies`，会被打包到 `.output/server/node_modules` 中
- 虽然 devtools 被禁用，但 `vue-router` 的 devtools 代码仍然存在，所以需要这个依赖
- 这不会影响性能，因为 devtools 代码只有在 devtools 启用时才会执行

