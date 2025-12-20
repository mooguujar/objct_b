# 岛屿社交平台 UniApp APP端

基于 UniApp + Vue 3 + TypeScript 开发的跨平台 APP。

## 技术栈

- **框架**: UniApp
- **UI 组件库**: uView UI
- **状态管理**: Pinia
- **网络请求**: axios
- **开发语言**: TypeScript

## 环境要求

- Node.js >= 16.0.0
- npm >= 8.0.0
- HBuilderX 或 uni-app CLI

## 安装依赖

```bash
npm install
```

## 运行项目

```bash
# H5
npm run dev:h5

# 微信小程序
npm run dev:mp-weixin
```

## 项目结构

```
uniaoo/
├── pages/              # 页面
├── components/         # 组件
├── store/              # Pinia 状态管理
├── utils/              # 工具函数
├── api/                # API 接口
├── static/             # 静态资源
├── pages.json          # 页面配置
└── manifest.json       # 应用配置
```

