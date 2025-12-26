## 1.0.0（2025-08-31）
# 星云社区

## 项目介绍
星云社区是一个基于uni-app和uniCloud开发的移动端社区应用框架，提供用户交流、内容发布、信息浏览等功能，支持多平台部署（微信小程序、H5、APP）。

## 主要功能

### 核心功能
- **用户系统**：注册、登录、个人资料管理、设置
- **内容浏览**：首页信息流、文章详情、分类浏览
- **用户中心**：我的收藏、浏览历史、个人设置
- **内容发布**：支持发布文章
- **消息通知**：系统通知功能

### 用户中心模块
- **个人主页**：展示用户基本信息和统计数据
- **编辑资料**：修改用户头像、昵称、个性签名等信息
- **我的收藏**：管理用户收藏的文章
- **浏览历史**：查看用户浏览过的内容
- **设置**：应用相关设置

## 技术栈

### 前端技术
- **框架**：uni-app (Vue.js跨平台框架)
- **UI组件库**：vk-uview-ui
- **状态管理**：Vuex
- **样式预处理**：SCSS

### 后端技术
- **云开发**：uniCloud (阿里云)
- **数据库**：NoSQL数据库
- **用户系统**：uni-id
- **云函数框架**：vk-unicloud-router

## 项目结构

```
├── App.vue              # 应用入口文件
├── main.js              # 应用入口JS
├── pages.json           # 页面路由配置
├── manifest.json        # 应用配置文件
├── common/              # 公共资源
│   ├── css/             # 公共样式
│   └── function/        # 公共函数
├── pages/               # 页面文件
│   ├── index/           # 首页
│   ├── login/           # 登录页
│   ├── register/        # 注册页
│   ├── profile/         # 用户中心
│   ├── article/         # 文章相关
│   ├── category/        # 分类相关
│   ├── notification/    # 通知相关
│   └── publish/         # 发布相关
├── static/              # 静态资源
│   ├── logo.png         # 应用Logo
│   └── tabbar/          # 底部导航栏图标
├── store/               # Vuex状态管理
├── uni_modules/         # uni-app模块
│   ├── uni-id/          # 用户系统
│   ├── vk-unicloud/     # 云开发框架
│   └── vk-uview-ui/     # UI组件库
└── uniCloud-aliyun/     # uniCloud云开发资源
    ├── cloudfunctions/  # 云函数
    └── database/        # 数据库配置
```

## 安装指南

### 前置条件
- 安装HBuilderX编辑器
- 注册DCloud开发者账号
- 创建uniCloud云服务空间

### 项目导入
1. 克隆或下载项目代码
2. 在HBuilderX中导入项目
3. 关联uniCloud云服务空间

### 云开发环境配置
1. 右键点击`uniCloud`目录，选择`运行云服务空间初始化向导`
2. 根据提示完成初始化配置
3. 上传`common`模块和`router`云函数

### 前端开发配置
1. **main.js**已配置uView UI引入
```js
import uView from './uni_modules/vk-uview-ui';
Vue.use(uView);
```

2. **App.vue**已引入基础样式
```html
<style lang="scss">
    @import "./uni_modules/vk-uview-ui/index.scss";
</style>
```

3. **uni.scss**已引入全局变量
```css
@import "@/uni_modules/vk-uview-ui/theme.scss";
```

## 功能页面说明

### 首页 (pages/index/index.vue)
应用的首页，展示最新内容和推荐信息，包含底部导航栏。

### 登录页 (pages/login/index.vue)
用户登录界面，支持账号密码登录和短信验证码登录，集成第三方登录入口。

### 注册页 (pages/register/index.vue)
用户注册界面，支持手机号注册，包含验证码验证和密码设置功能。

### 用户中心 (pages/profile/index.vue)
用户个人中心，展示用户信息、统计数据和功能入口，包含收藏、历史、设置等子页面。

### 文章详情 (pages/article/detail.vue)
展示文章详细内容，支持评论和收藏功能。

### 分类列表 (pages/category/list.vue)
按分类浏览内容的页面。

### 消息通知 (pages/notification/index.vue)
展示系统通知和互动消息。

### 内容发布 (pages/publish/index.vue)
用户发布文章的页面。

## 开发说明

### 云函数调用方式
项目使用vk-unicloud-router框架，通过统一的云函数入口调用各业务逻辑：

```js
this.vk.callFunction({
    url: 'service路径',
    data: { /* 请求参数 */ },
    success: (res) => { /* 成功回调 */ }
});
```

### 数据库操作
使用vk.baseDao API简化数据库操作：
- 支持增删改查基本操作
- 提供连表查询、分页查询等高级功能
- 内置权限控制和数据过滤

## 发布部署

### 微信小程序
1. 在manifest.json中配置微信小程序信息
2. 选择发行 -> 小程序-微信
3. 按照提示完成发布流程

### H5
1. 选择发行 -> H5
2. 配置相关参数后生成H5包
3. 部署到Web服务器

### APP
1. 选择发行 -> App云端打包
2. 配置应用信息和证书
3. 等待打包完成并下载安装包

## 注意事项
1. 开发环境和生产环境需要分别配置
2. 敏感信息如AppID、密钥等应配置在安全的地方
3. 云函数修改后需要重新上传才能生效
4. 数据库 schema 修改后需要同步更新

## 更新日志
- 2023.XX.XX: 完成基础框架搭建
- 2023.XX.XX: 实现用户系统和核心功能
- 2023.XX.XX: 添加用户中心和相关子页面
- 2023.XX.XX: 完善注册功能和页面优化

## License
MIT
