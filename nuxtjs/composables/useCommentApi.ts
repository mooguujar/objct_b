import { useApi } from './useApi'

export const useCommentApi = () => {
  const api = useApi()

  return {
    // 获取评论列表
    getCommentList: (postId: string | number | bigint, params?: { page?: number; pageSize?: number; sort?: string }) =>
      api.get(`/comments/${postId}`, { params }),

    // 发表评论
    createComment: (data: { postId: string | number | bigint; content: string; parentId?: string | number | bigint }) =>
      api.post('/comments', data),

    // 删除评论
    deleteComment: (id: string | number | bigint) => api.delete(`/comments/${id}`),

    // 点赞评论
    likeComment: (id: string | number | bigint) => api.post(`/comments/${id}/like`),

    // 取消点赞评论
    unlikeComment: (id: string | number | bigint) => api.delete(`/comments/${id}/like`),
  }
}

