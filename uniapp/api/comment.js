import request from '@/utils/request'

export const commentApi = {
  // 获取评论列表
  getCommentList(postId, params) {
    return request.get(`/comments/${postId}`, { params })
  },

  // 发表评论
  createComment(data) {
    return request.post('/comments', data)
  },

  // 删除评论
  deleteComment(id) {
    return request.delete(`/comments/${id}`)
  },

  // 点赞评论
  likeComment(id) {
    return request.post(`/comments/${id}/like`)
  },

  // 取消点赞评论
  unlikeComment(id) {
    return request.delete(`/comments/${id}/like`)
  },
}

