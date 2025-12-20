import { request } from './request'

export const creatorApi = {
  getApplications(params?: { page?: number; pageSize?: number; status?: string }) {
    return request.get('/admin/creator/applications', { params })
  },
  auditApplication(id: string | number, action: 'approve' | 'reject', reason?: string) {
    return request.post(`/admin/creator/applications/${id}/audit`, { action, reason })
  },
}

