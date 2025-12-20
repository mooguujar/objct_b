import { useApi } from './useApi'

export const useContentApi = () => {
  const api = useApi()

  return {
    // 获取内容列表
    getPostList: (params?: { page?: number; pageSize?: number; category?: string; mediaType?: string; sort?: string }) =>
      api.get('/posts/list', { params }),

    // 获取关注动态
    getFollowingPosts: (params?: { page?: number; pageSize?: number }) =>
      api.get('/posts/following', { params }),

    // 获取内容详情
    getPostById: (id: string | number | bigint) => api.get(`/posts/${id}`),

    // 发布内容
    createPost: (data: { islandId?: string | number | bigint; title?: string; content?: string; mediaType: string; mediaUrls?: string[] }) =>
      api.post('/posts', data),

    // 更新内容
    updatePost: (id: string | number | bigint, data: { title?: string; content?: string; mediaUrls?: string[] }) =>
      api.put(`/posts/${id}`, data),

    // 删除内容
    deletePost: (id: string | number | bigint) => api.delete(`/posts/${id}`),

    // 点赞帖子
    likePost: (id: string | number | bigint) => api.post(`/posts/${id}/like`),

    // 取消点赞
    unlikePost: (id: string | number | bigint) => api.delete(`/posts/${id}/like`),

    // 收藏帖子
    collectPost: (id: string | number | bigint) => api.post(`/posts/${id}/collect`),

    // 取消收藏
    uncollectPost: (id: string | number | bigint) => api.delete(`/posts/${id}/collect`),
  }
}

