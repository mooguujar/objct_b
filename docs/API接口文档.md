# API 接口文档

## 一、接口概述

本文档定义了岛屿社交平台的所有 RESTful API 接口规范，包括请求格式、响应格式、错误码定义和每个接口的详细说明。

**参考文档：**
- `产品构想和规划书.md` 第四章"核心功能模块"（第427-565行）
- `产品构想和规划书.md` 第三章"页面结构与功能说明"（第33-426行）
- `docs/数据库设计.md` - 数据库表结构设计

## 二、接口规范

### 2.1 基础信息

- **Base URL**: `https://api.example.com` (生产环境)
- **API 版本**: `v1`
- **接口前缀**: `/api/v1`
- **数据格式**: JSON
- **字符编码**: UTF-8

### 2.2 请求格式

#### 2.2.1 HTTP 方法

- `GET`: 获取资源
- `POST`: 创建资源
- `PUT`: 更新资源（完整更新）
- `PATCH`: 更新资源（部分更新）
- `DELETE`: 删除资源

#### 2.2.2 请求头

```
Content-Type: application/json
Authorization: Bearer {token}  // 需要认证的接口
X-Platform: app|web  // 平台标识
X-Device-Id: {device_id}  // 设备ID（用于统计）
```

#### 2.2.3 请求参数

- **Query 参数**: 用于 GET 请求的筛选、分页等
- **Path 参数**: URL 路径中的参数（如 `/api/user/:id`）
- **Body 参数**: POST/PUT/PATCH 请求的 JSON 数据

### 2.3 响应格式

#### 2.3.1 成功响应

```json
{
  "code": 200,
  "message": "success",
  "data": {
    // 响应数据
  },
  "timestamp": 1640995200000
}
```

#### 2.3.2 错误响应

```json
{
  "code": 400,
  "message": "错误描述",
  "error": {
    "type": "ValidationError",
    "details": [
      {
        "field": "username",
        "message": "用户名不能为空"
      }
    ]
  },
  "timestamp": 1640995200000
}
```

### 2.4 错误码定义

| 错误码 | HTTP 状态码 | 说明 |
|--------|------------|------|
| 200 | 200 | 成功 |
| 400 | 400 | 请求参数错误 |
| 401 | 401 | 未认证或 Token 过期 |
| 403 | 403 | 无权限访问 |
| 404 | 404 | 资源不存在 |
| 409 | 409 | 资源冲突（如用户名已存在） |
| 422 | 422 | 数据验证失败 |
| 429 | 429 | 请求过于频繁 |
| 500 | 500 | 服务器内部错误 |

### 2.5 分页参数

所有列表接口支持分页：

**请求参数：**
- `page`: 页码（从1开始，默认1）
- `pageSize`: 每页数量（默认20，最大100）

**响应格式：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

### 2.6 认证说明

- **需要认证的接口**：请求头必须包含 `Authorization: Bearer {token}`
- **不需要认证的接口**：注册、登录、公开内容浏览等
- **Token 获取**：通过登录接口获取
- **Token 刷新**：使用 `/api/auth/refresh` 接口刷新 Token

## 三、接口清单

### 3.1 认证模块（Auth）

#### 3.1.1 用户注册

**接口：** `POST /api/auth/register`

**认证：** 不需要

**请求参数：**
```json
{
  "username": "string",  // 必填，用户名，3-50字符
  "password": "string",  // 必填，密码，6-20字符
  "nickname": "string",  // 必填，昵称，1-50字符
  "phone": "string",     // 可选，手机号
  "email": "string",     // 可选，邮箱
  "code": "string"       // 可选，验证码（手机/邮箱注册时需要）
}
```

**响应示例：**
```json
{
  "code": 200,
  "message": "注册成功",
  "data": {
    "user": {
      "id": 1,
      "username": "testuser",
      "nickname": "测试用户",
      "avatar": null
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_string"
  }
}
```

#### 3.1.2 用户登录

**接口：** `POST /api/auth/login`

**认证：** 不需要

**请求参数：**
```json
{
  "username": "string",  // 必填，用户名或手机号或邮箱
  "password": "string"   // 必填，密码
}
```

**响应示例：**
```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "user": {
      "id": 1,
      "username": "testuser",
      "nickname": "测试用户",
      "avatar": "https://example.com/avatar.jpg",
      "role": "user",
      "coinBalance": 100.00
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_string",
    "expiresIn": 7200
  }
}
```

#### 3.1.3 用户登出

**接口：** `POST /api/auth/logout`

**认证：** 需要

**请求参数：** 无

**响应示例：**
```json
{
  "code": 200,
  "message": "登出成功",
  "data": null
}
```

#### 3.1.4 刷新 Token

**接口：** `POST /api/auth/refresh`

**认证：** 需要（使用 refreshToken）

**请求参数：**
```json
{
  "refreshToken": "string"  // 必填，刷新令牌
}
```

**响应示例：**
```json
{
  "code": 200,
  "message": "刷新成功",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "new_refresh_token_string",
    "expiresIn": 7200
  }
}
```

#### 3.1.5 忘记密码

**接口：** `POST /api/auth/forgot-password`

**认证：** 不需要

**请求参数：**
```json
{
  "username": "string",  // 必填，用户名或手机号或邮箱
  "code": "string"       // 必填，验证码
}
```

**响应示例：**
```json
{
  "code": 200,
  "message": "验证码已发送",
  "data": {
    "resetToken": "reset_token_string"
  }
}
```

#### 3.1.6 重置密码

**接口：** `POST /api/auth/reset-password`

**认证：** 不需要（使用 resetToken）

**请求参数：**
```json
{
  "resetToken": "string",  // 必填，重置令牌
  "newPassword": "string"   // 必填，新密码，6-20字符
}
```

**响应示例：**
```json
{
  "code": 200,
  "message": "密码重置成功",
  "data": null
}
```

### 3.2 用户模块（User）

#### 3.2.1 获取当前用户信息

**接口：** `GET /api/user/profile`

**认证：** 需要

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "username": "testuser",
    "nickname": "测试用户",
    "avatar": "https://example.com/avatar.jpg",
    "bio": "个人简介",
    "backgroundImage": "https://example.com/bg.jpg",
    "gender": 1,
    "birthday": "1990-01-01",
    "role": "user",
    "isVerified": false,
    "coinBalance": 100.00,
    "followCount": 10,
    "followerCount": 20,
    "postCount": 5,
    "likeCount": 50,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

#### 3.2.2 更新用户信息

**接口：** `PUT /api/user/profile`

**认证：** 需要

**请求参数：**
```json
{
  "nickname": "string",      // 可选，昵称
  "bio": "string",           // 可选，个人简介
  "gender": 0,               // 可选，性别：0-未知，1-男，2-女
  "birthday": "1990-01-01"   // 可选，生日
}
```

**响应示例：**
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 1,
    "nickname": "新昵称",
    "bio": "新简介",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

#### 3.2.3 上传头像

**接口：** `POST /api/user/avatar`

**认证：** 需要

**请求参数：** FormData
- `file`: File (图片文件，支持 jpg/png/gif，最大 5MB)

**响应示例：**
```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "avatar": "https://oss.example.com/avatar/xxx.jpg"
  }
}
```

#### 3.2.4 获取用户主页信息

**接口：** `GET /api/user/:id`

**认证：** 可选（未登录可查看公开信息）

**路径参数：**
- `id`: 用户ID

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "username": "testuser",
    "nickname": "测试用户",
    "avatar": "https://example.com/avatar.jpg",
    "bio": "个人简介",
    "backgroundImage": "https://example.com/bg.jpg",
    "isVerified": false,
    "followCount": 10,
    "followerCount": 20,
    "postCount": 5,
    "likeCount": 50,
    "isFollowing": false,  // 当前用户是否关注了该用户
    "isFollower": false,   // 该用户是否关注了当前用户
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

#### 3.2.5 获取粉丝列表

**接口：** `GET /api/user/followers`

**认证：** 需要

**查询参数：**
- `page`: 页码（默认1）
- `pageSize`: 每页数量（默认20）
- `userId`: 用户ID（可选，默认当前用户）

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 2,
        "nickname": "粉丝1",
        "avatar": "https://example.com/avatar.jpg",
        "bio": "简介",
        "isFollowing": true,
        "isFollower": true,
        "createdAt": "2025-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

#### 3.2.6 获取关注列表

**接口：** `GET /api/user/followings`

**认证：** 需要

**查询参数：**
- `page`: 页码（默认1）
- `pageSize`: 每页数量（默认20）
- `userId`: 用户ID（可选，默认当前用户）

**响应示例：** 同粉丝列表格式

#### 3.2.7 关注用户

**接口：** `POST /api/user/follow/:id`

**认证：** 需要

**路径参数：**
- `id`: 要关注的用户ID

**响应示例：**
```json
{
  "code": 200,
  "message": "关注成功",
  "data": {
    "isFollowing": true
  }
}
```

#### 3.2.8 取消关注

**接口：** `DELETE /api/user/follow/:id`

**认证：** 需要

**路径参数：**
- `id`: 要取消关注的用户ID

**响应示例：**
```json
{
  "code": 200,
  "message": "取消关注成功",
  "data": {
    "isFollowing": false
  }
}
```

### 3.3 内容模块（Content）

#### 3.3.1 获取内容列表（发现页）

**接口：** `GET /api/posts/list`

**认证：** 可选

**查询参数：**
- `page`: 页码（默认1）
- `pageSize`: 每页数量（默认20）
- `category`: 分类（可选）
- `mediaType`: 媒体类型（可选：text/image/video/mixed）
- `sort`: 排序方式（可选：latest-最新，hot-最热，默认latest）

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "user": {
          "id": 1,
          "nickname": "测试用户",
          "avatar": "https://example.com/avatar.jpg"
        },
        "island": null,
        "title": "帖子标题",
        "content": "帖子内容",
        "mediaType": "image",
        "mediaUrls": [
          "https://example.com/image1.jpg",
          "https://example.com/image2.jpg"
        ],
        "likeCount": 10,
        "commentCount": 5,
        "collectCount": 3,
        "viewCount": 100,
        "isLiked": false,
        "isCollected": false,
        "createdAt": "2025-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

#### 3.3.2 获取关注动态

**接口：** `GET /api/posts/following`

**认证：** 需要

**查询参数：**
- `page`: 页码（默认1）
- `pageSize`: 每页数量（默认20）

**响应示例：** 同内容列表格式

#### 3.3.3 获取内容详情

**接口：** `GET /api/posts/:id`

**认证：** 可选

**路径参数：**
- `id`: 帖子ID

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "user": {
      "id": 1,
      "nickname": "测试用户",
      "avatar": "https://example.com/avatar.jpg",
      "isFollowing": false
    },
    "island": {
      "id": 1,
      "name": "测试岛屿",
      "avatar": "https://example.com/island.jpg"
    },
    "title": "帖子标题",
    "content": "帖子内容",
    "mediaType": "image",
    "mediaUrls": [
      "https://example.com/image1.jpg"
    ],
    "likeCount": 10,
    "commentCount": 5,
    "collectCount": 3,
    "viewCount": 100,
    "shareCount": 2,
    "isLiked": false,
    "isCollected": false,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

#### 3.3.4 发布内容

**接口：** `POST /api/posts`

**认证：** 需要

**请求参数：**
```json
{
  "islandId": 1,           // 可选，所属岛屿ID（null表示个人动态）
  "title": "string",       // 可选，标题
  "content": "string",     // 可选，内容
  "mediaType": "image",    // 必填，媒体类型：text/image/video/mixed
  "mediaUrls": [           // 可选，媒体文件URL数组
    "https://example.com/image1.jpg"
  ]
}
```

**响应示例：**
```json
{
  "code": 200,
  "message": "发布成功",
  "data": {
    "id": 1,
    "title": "帖子标题",
    "content": "帖子内容",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

#### 3.3.5 更新内容

**接口：** `PUT /api/posts/:id`

**认证：** 需要（仅作者可修改）

**路径参数：**
- `id`: 帖子ID

**请求参数：**
```json
{
  "title": "string",       // 可选，标题
  "content": "string",     // 可选，内容
  "mediaUrls": [           // 可选，媒体文件URL数组
    "https://example.com/image1.jpg"
  ]
}
```

**响应示例：**
```json
{
  "code": 200,
  "message": "更新成功",
  "data": {
    "id": 1,
    "updatedAt": "2025-01-01T00:00:00.000Z"
  }
}
```

#### 3.3.6 删除内容

**接口：** `DELETE /api/posts/:id`

**认证：** 需要（仅作者可删除）

**路径参数：**
- `id`: 帖子ID

**响应示例：**
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

#### 3.3.7 点赞帖子

**接口：** `POST /api/posts/:id/like`

**认证：** 需要

**路径参数：**
- `id`: 帖子ID

**响应示例：**
```json
{
  "code": 200,
  "message": "点赞成功",
  "data": {
    "isLiked": true,
    "likeCount": 11
  }
}
```

#### 3.3.8 取消点赞

**接口：** `DELETE /api/posts/:id/like`

**认证：** 需要

**路径参数：**
- `id`: 帖子ID

**响应示例：**
```json
{
  "code": 200,
  "message": "取消点赞成功",
  "data": {
    "isLiked": false,
    "likeCount": 10
  }
}
```

#### 3.3.9 收藏帖子

**接口：** `POST /api/posts/:id/collect`

**认证：** 需要

**路径参数：**
- `id`: 帖子ID

**响应示例：**
```json
{
  "code": 200,
  "message": "收藏成功",
  "data": {
    "isCollected": true,
    "collectCount": 4
  }
}
```

#### 3.3.10 取消收藏

**接口：** `DELETE /api/posts/:id/collect`

**认证：** 需要

**路径参数：**
- `id`: 帖子ID

**响应示例：**
```json
{
  "code": 200,
  "message": "取消收藏成功",
  "data": {
    "isCollected": false,
    "collectCount": 3
  }
}
```

### 3.4 岛屿模块（Island）

#### 3.4.1 获取岛屿列表

**接口：** `GET /api/islands/list`

**认证：** 可选

**查询参数：**
- `page`: 页码（默认1）
- `pageSize`: 每页数量（默认20）
- `category`: 分类（可选）
- `sort`: 排序方式（可选：latest-最新，hot-最热，member-成员数，默认latest）

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "name": "测试岛屿",
        "description": "岛屿简介",
        "cover": "https://example.com/cover.jpg",
        "avatar": "https://example.com/avatar.jpg",
        "category": "财经",
        "owner": {
          "id": 1,
          "nickname": "岛主",
          "avatar": "https://example.com/avatar.jpg"
        },
        "price": 10.00,
        "memberCount": 100,
        "postCount": 50,
        "isVerified": true,
        "isJoined": false,
        "createdAt": "2025-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

#### 3.4.2 获取热门岛屿

**接口：** `GET /api/islands/hot`

**认证：** 可选

**查询参数：**
- `limit`: 数量（默认10，最大50）
- `category`: 分类（可选）

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "name": "热门岛屿",
        "cover": "https://example.com/cover.jpg",
        "avatar": "https://example.com/avatar.jpg",
        "memberCount": 1000,
        "postCount": 500
      }
    ]
  }
}
```

#### 3.4.3 获取我的岛屿

**接口：** `GET /api/islands/my`

**认证：** 需要

**查询参数：**
- `page`: 页码（默认1）
- `pageSize`: 每页数量（默认20）
- `type`: 类型（可选：joined-已加入，owned-我创建的，默认joined）

**响应示例：** 同岛屿列表格式

#### 3.4.4 获取岛屿详情

**接口：** `GET /api/islands/:id`

**认证：** 可选

**路径参数：**
- `id`: 岛屿ID

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "name": "测试岛屿",
    "description": "岛屿简介",
    "cover": "https://example.com/cover.jpg",
    "avatar": "https://example.com/avatar.jpg",
    "category": "财经",
    "owner": {
      "id": 1,
      "nickname": "岛主",
      "avatar": "https://example.com/avatar.jpg",
      "isVerified": true
    },
    "price": 10.00,
    "memberCount": 100,
    "postCount": 50,
    "isVerified": true,
    "isJoined": false,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

#### 3.4.5 获取岛屿内容列表

**接口：** `GET /api/islands/:id/posts`

**认证：** 可选（付费岛屿需要已加入）

**路径参数：**
- `id`: 岛屿ID

**查询参数：**
- `page`: 页码（默认1）
- `pageSize`: 每页数量（默认20）
- `sort`: 排序方式（可选：latest-最新，hot-最热，默认latest）

**响应示例：** 同内容列表格式

#### 3.4.6 创建岛屿

**接口：** `POST /api/islands`

**认证：** 需要（需要创作者权限）

**请求参数：**
```json
{
  "name": "string",         // 必填，岛屿名称
  "description": "string",  // 可选，岛屿简介
  "category": "string",     // 必填，分类
  "cover": "string",        // 可选，封面图URL
  "avatar": "string",       // 可选，头像URL
  "price": 0.00            // 可选，加入价格（默认0，表示免费）
}
```

**响应示例：**
```json
{
  "code": 200,
  "message": "创建成功",
  "data": {
    "id": 1,
    "name": "测试岛屿",
    "status": "pending",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

#### 3.4.7 加入岛屿

**接口：** `POST /api/islands/:id/join`

**认证：** 需要

**路径参数：**
- `id`: 岛屿ID

**请求参数：**
```json
{
  "paymentMethod": "coin"  // 可选，支付方式：coin-金币，wechat-微信，alipay-支付宝
}
```

**响应示例：**
```json
{
  "code": 200,
  "message": "加入成功",
  "data": {
    "isJoined": true,
    "paidAmount": 10.00
  }
}
```

#### 3.4.8 退出岛屿

**接口：** `DELETE /api/islands/:id/leave`

**认证：** 需要

**路径参数：**
- `id`: 岛屿ID

**响应示例：**
```json
{
  "code": 200,
  "message": "退出成功",
  "data": null
}
```

### 3.5 通知模块（Notification）

#### 3.5.1 获取通知列表

**接口：** `GET /api/notifications`

**认证：** 需要

**查询参数：**
- `page`: 页码（默认1）
- `pageSize`: 每页数量（默认20）
- `type`: 通知类型（可选：system-系统，interaction-互动，payment-付费）
- `isRead`: 是否已读（可选：true/false）

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "type": "interaction",
        "title": "有人点赞了你的帖子",
        "content": "用户A点赞了你的帖子《测试标题》",
        "relatedId": 1,
        "relatedType": "post",
        "isRead": false,
        "createdAt": "2025-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    },
    "unreadCount": 10
  }
}
```

#### 3.5.2 获取通知详情

**接口：** `GET /api/notifications/:id`

**认证：** 需要

**路径参数：**
- `id`: 通知ID

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "type": "interaction",
    "title": "有人点赞了你的帖子",
    "content": "用户A点赞了你的帖子《测试标题》",
    "relatedId": 1,
    "relatedType": "post",
    "isRead": true,
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

#### 3.5.3 标记已读

**接口：** `PUT /api/notifications/:id/read`

**认证：** 需要

**路径参数：**
- `id`: 通知ID（或使用 `all` 标记全部已读）

**响应示例：**
```json
{
  "code": 200,
  "message": "标记成功",
  "data": {
    "isRead": true
  }
}
```

#### 3.5.4 清除所有通知

**接口：** `DELETE /api/notifications`

**认证：** 需要

**响应示例：**
```json
{
  "code": 200,
  "message": "清除成功",
  "data": null
}
```

### 3.6 评论模块（Comment）

#### 3.6.1 获取评论列表

**接口：** `GET /api/comments/:postId`

**认证：** 可选

**路径参数：**
- `postId`: 帖子ID

**查询参数：**
- `page`: 页码（默认1）
- `pageSize`: 每页数量（默认20）
- `sort`: 排序方式（可选：latest-最新，hot-最热，默认latest）

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "user": {
          "id": 1,
          "nickname": "评论者",
          "avatar": "https://example.com/avatar.jpg"
        },
        "content": "评论内容",
        "parentId": null,
        "parent": null,
        "likeCount": 5,
        "isLiked": false,
        "replyCount": 2,
        "replies": [],
        "createdAt": "2025-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

#### 3.6.2 发表评论

**接口：** `POST /api/comments`

**认证：** 需要

**请求参数：**
```json
{
  "postId": 1,        // 必填，帖子ID
  "content": "string", // 必填，评论内容
  "parentId": null    // 可选，父评论ID（回复时使用）
}
```

**响应示例：**
```json
{
  "code": 200,
  "message": "评论成功",
  "data": {
    "id": 1,
    "content": "评论内容",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

#### 3.6.3 删除评论

**接口：** `DELETE /api/comments/:id`

**认证：** 需要（仅作者可删除）

**路径参数：**
- `id`: 评论ID

**响应示例：**
```json
{
  "code": 200,
  "message": "删除成功",
  "data": null
}
```

#### 3.6.4 点赞评论

**接口：** `POST /api/comments/:id/like`

**认证：** 需要

**路径参数：**
- `id`: 评论ID

**响应示例：**
```json
{
  "code": 200,
  "message": "点赞成功",
  "data": {
    "isLiked": true,
    "likeCount": 6
  }
}
```

### 3.7 搜索模块（Search）

#### 3.7.1 搜索内容

**接口：** `GET /api/search/posts`

**认证：** 可选

**查询参数：**
- `keyword`: 关键词（必填）
- `page`: 页码（默认1）
- `pageSize`: 每页数量（默认20）

**响应示例：** 同内容列表格式

#### 3.7.2 搜索用户

**接口：** `GET /api/search/users`

**认证：** 可选

**查询参数：**
- `keyword`: 关键词（必填）
- `page`: 页码（默认1）
- `pageSize`: 每页数量（默认20）

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "nickname": "测试用户",
        "avatar": "https://example.com/avatar.jpg",
        "bio": "简介",
        "isFollowing": false,
        "followerCount": 20
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

#### 3.7.3 搜索岛屿

**接口：** `GET /api/search/islands`

**认证：** 可选

**查询参数：**
- `keyword`: 关键词（必填）
- `page`: 页码（默认1）
- `pageSize`: 每页数量（默认20）

**响应示例：** 同岛屿列表格式

### 3.8 金币模块（Coin）

#### 3.8.1 获取金币余额

**接口：** `GET /api/coins/balance`

**认证：** 需要

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "balance": 100.00
  }
}
```

#### 3.8.2 获取交易记录

**接口：** `GET /api/coins/transactions`

**认证：** 需要

**查询参数：**
- `page`: 页码（默认1）
- `pageSize`: 每页数量（默认20）
- `type`: 交易类型（可选：recharge-充值，consume-消费，reward-奖励，refund-退款）

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [
      {
        "id": 1,
        "type": "recharge",
        "amount": 100.00,
        "balance": 200.00,
        "description": "充值100金币",
        "createdAt": "2025-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 100,
      "totalPages": 5
    }
  }
}
```

#### 3.8.3 金币充值

**接口：** `POST /api/coins/recharge`

**认证：** 需要

**请求参数：**
```json
{
  "amount": 100.00,           // 必填，充值金额
  "paymentMethod": "wechat"  // 必填，支付方式：wechat-微信，alipay-支付宝
}
```

**响应示例：**
```json
{
  "code": 200,
  "message": "充值成功",
  "data": {
    "orderId": "order_123456",
    "paymentUrl": "https://pay.example.com/xxx",
    "balance": 200.00
  }
}
```

### 3.9 创作者模块（Creator）

#### 3.9.1 申请入驻

**接口：** `POST /api/creator/apply`

**认证：** 需要

**请求参数：**
```json
{
  "realName": "string",           // 可选，真实姓名
  "phone": "string",              // 可选，联系电话
  "email": "string",              // 可选，邮箱
  "bio": "string",                // 可选，个人简介
  "qualificationUrls": [          // 可选，资质证明文件URL数组
    "https://example.com/file1.jpg"
  ]
}
```

**响应示例：**
```json
{
  "code": 200,
  "message": "申请已提交",
  "data": {
    "id": 1,
    "status": "pending",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
}
```

#### 3.9.2 查询申请状态

**接口：** `GET /api/creator/status`

**认证：** 需要

**响应示例：**
```json
{
  "code": 200,
  "message": "success",
  "data": {
    "id": 1,
    "status": "pending",
    "rejectReason": null,
    "createdAt": "2025-01-01T00:00:00.000Z",
    "reviewedAt": null
  }
}
```

### 3.10 统计模块（Statistics）

#### 3.10.1 上报页面访问

**接口：** `POST /api/statistics/page-view`

**认证：** 可选

**请求参数：**
```json
{
  "pagePath": "/pages/index/index",  // 必填，页面路径
  "pageTitle": "首页",                // 可选，页面标题
  "deviceType": "mobile",            // 可选，设备类型
  "platform": "app",                  // 可选，平台：app/web
  "referrer": "/pages/login/login",  // 可选，来源页面
  "stayDuration": 30                  // 可选，停留时长（秒）
}
```

**响应示例：**
```json
{
  "code": 200,
  "message": "上报成功",
  "data": null
}
```

#### 3.10.2 上报点击事件

**接口：** `POST /api/statistics/click-event`

**认证：** 可选

**请求参数：**
```json
{
  "eventType": "button_click",       // 必填，事件类型
  "elementId": "btn_submit",          // 可选，元素ID
  "elementType": "button",            // 可选，元素类型
  "pagePath": "/pages/index/index",  // 必填，页面路径
  "clickPositionX": 100,             // 可选，点击位置X
  "clickPositionY": 200,            // 可选，点击位置Y
  "relatedId": 1,                    // 可选，关联ID
  "relatedType": "post"               // 可选，关联类型
}
```

**响应示例：**
```json
{
  "code": 200,
  "message": "上报成功",
  "data": null
}
```

#### 3.10.3 批量上报统计

**接口：** `POST /api/statistics/batch`

**认证：** 可选

**请求参数：**
```json
{
  "pageViews": [                     // 可选，页面访问数组
    {
      "pagePath": "/pages/index/index",
      "pageTitle": "首页",
      "stayDuration": 30
    }
  ],
  "clickEvents": [                   // 可选，点击事件数组
    {
      "eventType": "button_click",
      "elementId": "btn_submit",
      "pagePath": "/pages/index/index"
    }
  ],
  "behaviors": [                     // 可选，用户行为数组
    {
      "behaviorType": "like",
      "targetType": "post",
      "targetId": 1,
      "pagePath": "/pages/index/index"
    }
  ]
}
```

**响应示例：**
```json
{
  "code": 200,
  "message": "批量上报成功",
  "data": {
    "successCount": 10,
    "failCount": 0
  }
}
```

## 四、文件上传接口

### 4.1 上传图片

**接口：** `POST /api/upload/image`

**认证：** 需要

**请求参数：** FormData
- `file`: File (图片文件，支持 jpg/png/gif/webp，最大 10MB)
- `type`: string (可选，上传类型：avatar-头像，cover-封面，post-帖子图片)

**响应示例：**
```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "url": "https://oss.example.com/images/xxx.jpg",
    "width": 1920,
    "height": 1080,
    "size": 1024000
  }
}
```

### 4.2 上传视频

**接口：** `POST /api/upload/video`

**认证：** 需要

**请求参数：** FormData
- `file`: File (视频文件，支持 mp4/mov，最大 100MB)

**响应示例：**
```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "url": "https://oss.example.com/videos/xxx.mp4",
    "duration": 60,
    "size": 10485760
  }
}
```

## 五、接口调用示例

### 5.1 JavaScript (axios)

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://api.example.com/api/v1',
  headers: {
    'Content-Type': 'application/json'
  }
});

// 添加请求拦截器
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 登录
async function login(username, password) {
  const response = await api.post('/auth/login', {
    username,
    password
  });
  return response.data;
}

// 获取内容列表
async function getPosts(page = 1, pageSize = 20) {
  const response = await api.get('/posts/list', {
    params: { page, pageSize }
  });
  return response.data;
}
```

### 5.2 UniApp

```javascript
// utils/request.js
const baseURL = 'https://api.example.com/api/v1';

function request(options) {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token');
    
    uni.request({
      url: baseURL + options.url,
      method: options.method || 'GET',
      data: options.data,
      header: {
        'Content-Type': 'application/json',
        'Authorization': token ? `Bearer ${token}` : '',
        'X-Platform': 'app'
      },
      success: (res) => {
        if (res.data.code === 200) {
          resolve(res.data);
        } else {
          reject(res.data);
        }
      },
      fail: reject
    });
  });
}

// 使用
request({
  url: '/posts/list',
  method: 'GET',
  data: { page: 1, pageSize: 20 }
}).then(res => {
  console.log(res.data);
});
```

## 六、接口版本历史

- **v1.0** (2025-01-XX): 初始接口设计
  - 定义所有核心接口
  - 完善请求响应格式
  - 添加错误码定义

---

**文档版本：** v1.0  
**创建日期：** 2025年1月  
**最后更新：** 2025年1月

