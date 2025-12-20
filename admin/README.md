# 岛屿社交平台后台管理系统

基于 Vue 3 + Element Plus + Pinia 开发的后台管理系统。

## 技术栈

- **框架**: Vue 3
- **UI 组件库**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router
- **构建工具**: Vite
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
admin/
├── src/
│   ├── views/          # 页面视图
│   ├── components/     # 组件
│   ├── store/          # Pinia 状态管理
│   ├── router/         # 路由配置
│   ├── api/            # API 接口
│   ├── styles/         # 样式文件
│   ├── App.vue         # 根组件
│   └── main.ts         # 入口文件
└── vite.config.ts      # Vite 配置
```

