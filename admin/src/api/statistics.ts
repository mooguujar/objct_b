import { request } from './request'

export const statisticsApi = {
  getDashboardStats() {
    return request.get('/admin/statistics/dashboard')
  },
  getPageViewStats(params?: { startDate?: string; endDate?: string }) {
    return request.get('/admin/statistics/page-view', { params })
  },
  getClickEventStats(params?: { startDate?: string; endDate?: string }) {
    return request.get('/admin/statistics/click-event', { params })
  },
}

