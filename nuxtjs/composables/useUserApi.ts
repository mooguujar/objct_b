export const useUserApi = () => {
  const api = useApi()

  return {
    // 获取当前用户信息
    getCurrentUser: () => api.get('/user/profile'),
    
    // 获取用户主页信息
    getUserProfile: (userId: string | number) => api.get(`/user/${userId}`),
    
    // 获取用户帖子列表
    getUserPosts: (userId: string | number, params?: any) => 
      api.get(`/user/${userId}/posts`, {
        params,
      }),

    // 关注用户
    followUser: (id: string | number | bigint) => api.post(`/user/follow/${id}`),

    // 取消关注
    unfollowUser: (id: string | number | bigint) => api.delete(`/user/follow/${id}`),
  }
}

