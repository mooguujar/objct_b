import { request } from './request'

export const userApi = {
  getUsers(params?: { page?: number; pageSize?: number; keyword?: string; status?: string }) {
    return request.get('/admin/users', { params })
  },
  getUserDetail(id: string | number) {
    return request.get(`/admin/users/${id}`)
  },
  updateUserStatus(id: string | number, status: string) {
    return request.put(`/admin/users/${id}/status`, { status })
  },
}

