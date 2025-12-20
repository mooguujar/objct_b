import request from '@/utils/request'

export const notificationApi = {
  // 获取通知列表
  getNotifications(params) {
    return request.get('/notifications', { params })
  },
  
  // 获取未读数量
  getUnreadCount() {
    return request.get('/notifications/unread-count')
  },
  
  // 获取通知详情
  getNotificationById(id) {
    return request.get(`/notifications/${id}`)
  },
  
  // 标记已读
  markAsRead(id) {
    return request.put(`/notifications/${id}/read`)
  },
  
  // 全部标记已读
  markAllAsRead() {
    return request.put('/notifications/read-all')
  },
  
  // 清除通知
  clearNotifications(type) {
    return request.delete('/notifications', { params: { type } })
  },
}

