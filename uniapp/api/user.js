import request from '@/utils/request'

export const userApi = {
  // 获取当前用户信息
  getCurrentUser() {
    return request.get('/user/profile')
  },
  
  // 获取用户主页信息
  getUserProfile(userId) {
    return request.get(`/user/${userId}`)
  },
  
  // 获取用户帖子列表
  getUserPosts(userId, params) {
    return request.get(`/user/${userId}/posts`, { params })
  },

  // 关注用户
  followUser(userId) {
    return request.post(`/user/follow/${userId}`)
  },

  // 取消关注
  unfollowUser(userId) {
    return request.delete(`/user/follow/${userId}`)
  },
}

