import { request } from './request'

export const contentApi = {
  getPosts(params?: { page?: number; pageSize?: number; keyword?: string; status?: string }) {
    return request.get('/admin/posts', { params })
  },
  getPostDetail(id: string | number) {
    return request.get(`/admin/posts/${id}`)
  },
  auditPost(id: string | number, action: 'approve' | 'reject' | 'delete', reason?: string) {
    return request.post(`/admin/posts/${id}/audit`, { action, reason })
  },
}

