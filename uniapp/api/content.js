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
}

