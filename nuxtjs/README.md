# 岛屿社交平台 Nuxt.js Web端

基于 Nuxt.js 3 + Element Plus + Pinia 开发的 Web 应用。

## 技术栈

- **框架**: Nuxt.js 3
- **UI 组件库**: Element Plus
- **状态管理**: Pinia
- **网络请求**: axios
- **开发语言**: TypeScript

## 环境要求

- Node.js >= 18.0.0
- npm >= 9.0.0

## 安装依赖

```bash
npm install
```

## 运行项目

```bash
# 开发模式
npm run dev

# 生产构建
npm run build

# 预览生产构建
npm run preview
```

## 项目结构

```
nuxtjs/
├── pages/              # 页面
├── components/         # 组件
├── composables/        # 组合式函数
├── store/              # Pinia 状态管理
├── assets/             # 静态资源
├── server/             # 服务端逻辑
└── nuxt.config.ts      # Nuxt 配置
```

