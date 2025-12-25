export type NotificationType = 'system' | 'interaction' | 'payment'

export interface Notification {
  id: number
  userId: number
  type: NotificationType
  title: string
  content: string | null
  relatedId: number | null
  relatedType: string | null
  isRead: boolean
  createdAt: string
}

export interface NotificationListResponse {
  list: Notification[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface NotificationStats {
  system: {
    total: number
    unread: number
  }
  interaction: {
    total: number
    unread: number
  }
  payment: {
    total: number
    unread: number
  }
}

export const useNotifications = () => {
  const { request } = useApi()

  // 获取通知列表（按类型）
  const getNotifications = async (
    type: NotificationType,
    page = 1,
    pageSize = 20
  ): Promise<NotificationListResponse> => {
    const response = await request<NotificationListResponse>(`/notifications/${type}`, {
      method: 'GET',
      query: { page, pageSize }
    })
    return response.data
  }

  // 获取所有通知统计
  const getNotificationStats = async (): Promise<NotificationStats> => {
    const response = await request<NotificationStats>('/notifications/stats', {
      method: 'GET'
    })
    return response.data
  }

  // 标记为已读
  const markAsRead = async (notificationId: number): Promise<void> => {
    await request(`/notifications/${notificationId}/read`, {
      method: 'POST'
    })
  }

  // 标记所有为已读
  const markAllAsRead = async (type?: NotificationType): Promise<void> => {
    await request('/notifications/read-all', {
      method: 'POST',
      body: type ? { type } : {}
    })
  }

  // 清除所有通知
  const clearAll = async (type?: NotificationType): Promise<void> => {
    await request('/notifications/clear', {
      method: 'POST',
      body: type ? { type } : {}
    })
  }

  return {
    getNotifications,
    getNotificationStats,
    markAsRead,
    markAllAsRead,
    clearAll
  }
}

