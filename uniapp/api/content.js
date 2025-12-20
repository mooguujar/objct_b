import request from '@/utils/request'

export const contentApi = {
  // 获取内容列表
  getPostList(params) {
    return request.get('/posts/list', { params })
  },
  
  // 获取关注动态
  getFollowingPosts(params) {
    return request.get('/posts/following', { params })
  },
  
  // 获取内容详情
  getPostById(id) {
    return request.get(`/posts/${id}`)
  },

  // 发布内容
  createPost(data) {
    return request.post('/posts', data)
  },

  // 更新内容
  updatePost(id, data) {
    return request.put(`/posts/${id}`, data)
  },

  // 删除内容
  deletePost(id) {
    return request.delete(`/posts/${id}`)
  },

  // 点赞帖子
  likePost(id) {
    return request.post(`/posts/${id}/like`)
  },

  // 取消点赞
  unlikePost(id) {
    return request.delete(`/posts/${id}/like`)
  },

  // 收藏帖子
  collectPost(id) {
    return request.post(`/posts/${id}/collect`)
  },

  // 取消收藏
  uncollectPost(id) {
    return request.delete(`/posts/${id}/collect`)
  },
}

