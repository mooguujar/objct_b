import { request } from './request'

export const islandApi = {
  getIslands(params?: { page?: number; pageSize?: number; keyword?: string; status?: string }) {
    return request.get('/admin/islands', { params })
  },
  getIslandDetail(id: string | number) {
    return request.get(`/admin/islands/${id}`)
  },
  auditIsland(id: string | number, action: 'approve' | 'reject', reason?: string) {
    return request.post(`/admin/islands/${id}/audit`, { action, reason })
  },
}

